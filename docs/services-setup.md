# Configuração dos serviços do portfólio CP3

Este backend usa Supabase Auth para o login do dono, Postgres para as mensagens
privadas e projetos destacados e Resend para avisar o dono sobre um contato.
Nenhuma conta, credencial real, domínio ou serviço externo é configurado por estes
arquivos. O frontend utiliza o contrato em `src/services/portfolio.js`.

## 1. Criar o projeto Supabase e aplicar o SQL

Crie um projeto no painel do Supabase e guarde a senha do banco em local seguro.
Instale a CLI Supabase seguindo a documentação oficial; o entrypoint JavaScript
requer CLI 1.215.0 ou superior. Na raiz do projeto:

```powershell
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

Revise a lista de migrações antes de confirmar. A migração esperada é
`supabase/migrations/202610290001_initial.sql`; ela cria objetos novos e deve ser
aplicada uma vez. Não a reaplique sobre objetos existentes. Como alternativa,
execute esse arquivo inteiro no SQL Editor de um projeto novo, com o usuário
administrativo. Se usar o SQL Editor, reconcilie o histórico de migrações da CLI
antes de posteriormente usar `db push`.

Mantenha apenas os schemas necessários expostos à Data API; `public` precisa estar
exposto e **`contact_private` não pode estar exposto**. A função acessa o banco por
RPC, com a credencial de serviço disponível somente no ambiente do servidor.

## 2. Criar manualmente o dono e fechar o cadastro

No painel de Authentication, crie manualmente o usuário do dono com e-mail e senha
forte. Confirme o e-mail pelo mecanismo administrativo do painel, quando necessário.
Copie o UUID desse usuário de `auth.users`; não use um UUID inventado nem o e-mail
como chave de autorização. No SQL Editor, substitua o placeholder:

```sql
insert into public.admin_users (user_id)
values ('UUID_REAL_DO_USUARIO_CRIADO_MANUALMENTE'::uuid);
```

Não existe usuário ou senha inicial. A aplicação cliente não pode inserir, alterar
ou excluir membros de `admin_users`, mesmo quando o dono está autenticado. Para
revogar o acesso administrativo:

```sql
delete from public.admin_users
where user_id = 'UUID_REAL_DO_DONO'::uuid;
```

Em Authentication / configuração de usuários e provedores, desabilite novos
cadastros (**Allow new users to sign up**) e login anônimo. Use o provedor de
e-mail/senha para o dono. Desabilite provedores OAuth que não forem utilizados.
Configure Site URL e URLs de redirecionamento apenas para os endereços reais do
portfólio. Os nomes das opções podem variar conforme a interface do painel.

`config.toml` também desabilita signup e login anônimo na configuração local.
**`supabase db push` e o deploy da função não alteram a configuração do Auth
hospedado**: confira essas opções no painel do projeto. Não use `signUp()` no
frontend. Login futuro: `supabase.auth.signInWithPassword({ email, password })`.
Um usuário autenticado que não tenha seu UUID em `admin_users` continua sem acesso
administrativo. `user_metadata` não participa de nenhuma autorização.

## 3. Preparar o remetente no Resend

Crie sua conta no Resend, valide um domínio de envio e gere uma chave com permissão
de envio, preferencialmente restrita ao domínio necessário. Use um endereço desse
domínio em `CONTACT_FROM_EMAIL`, por exemplo `CP3 <contato@seudominio.com>`.
Contas/domínios de teste podem ter restrições de destinatário.

O visitante informa seu e-mail apenas como **Reply-To**. Ele nunca controla From,
To, CC ou BCC. O destinatário é sempre `murilocastro233@gmail.com`, fixado também
no SQL. O endereço do visitante recebe validação sintática; o formulário público
não verifica que ele realmente controla essa caixa postal. O corpo enviado é texto
simples, sem interpretar o conteúdo da mensagem como HTML.

## 4. Configurar secrets da Edge Function

Configure no painel de secrets das Edge Functions:

| Secret               | Valor                                                                                |
| -------------------- | ------------------------------------------------------------------------------------ |
| `RESEND_API_KEY`     | Chave real de envio do Resend                                                        |
| `CONTACT_FROM_EMAIL` | Remetente do domínio verificado, como `CP3 <contato@seudominio.com>`                 |
| `CONTACT_TO_EMAIL`   | Exatamente `murilocastro233@gmail.com`                                               |
| `ALLOWED_ORIGINS`    | Origins separadas por vírgula, como `https://seuportfolio.com,http://localhost:5173` |

Origins devem incluir protocolo, host e porta quando aplicável, sem caminho,
wildcard nem barra final. Liste `www` e o domínio sem `www` separadamente se usar
ambos. `Origin: null`, ausência de Origin e origins não listadas são rejeitadas.

O ambiente hospedado fornece `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Essa
implementação usa a credencial `service_role` fornecida pelo runtime para chamar
as duas RPCs. Não substitua por uma chave pública. Nenhum secret de envio ou de
serviço pode ter prefixo `VITE_`, entrar no bundle React, aparecer em logs ou ser
versionado. Apenas a URL e a chave pública/publishable (ou anon) do Supabase podem
ser usadas no cliente, com RLS habilitada.

Se preferir a CLI, use um arquivo real de secrets **fora do repositório**, protegido
localmente. `supabase/.env.example` documenta apenas nomes e exemplos:

```powershell
supabase secrets set --env-file "CAMINHO_FORA_DO_REPOSITORIO\contact.env" --project-ref SEU_PROJECT_REF
```

Não copie os placeholders para produção. Não coloque a chave de serviço nesse
arquivo de exemplo. As credenciais do runtime hospedado não precisam ser criadas
manualmente.

## 5. Publicar a função

```powershell
supabase functions deploy contact --project-ref SEU_PROJECT_REF
```

`supabase/config.toml` define explicitamente:

```toml
[functions.contact]
enabled = true
verify_jwt = false
entrypoint = "./functions/contact/index.js"
```

A função é pública para permitir contato sem login. Todas as mutações de banco
passam pelas RPCs reservadas a `service_role`; visitantes não recebem acesso de
escrita às tabelas. A configuração inválida de origins, remetente, destinatário ou
secrets fecha o endpoint com erro 503.

Para desenvolvimento, com Docker e CLI disponíveis, use `supabase start`,
`supabase db reset` apenas em banco local descartável, e
`supabase functions serve contact --env-file "CAMINHO_EXTERNO\contact.env"`.
Inclua `http://localhost:5173` nas origins locais. O runtime local fornece suas
próprias chaves Supabase. Não use credenciais de produção nos testes.

## 6. Contrato utilizado pelo frontend

```js
// Gere uma vez por envio lógico. Preserve UUID e conteúdo após erro/timeout.
const submissionId = crypto.randomUUID()
const body = {
  name: 'Pessoa Teste',
  email: 'pessoa@example.com',
  subject: 'Contato pelo portfólio',
  message: 'Tenho interesse em conversar sobre um projeto.',
  website: '', // honeypot: deve permanecer uma string vazia
  submissionId,
}

const { data, error } = await supabase.functions.invoke('contact', { body })
if (error) {
  // Erros HTTP do SDK têm o JSON no Response em error.context.
  // Erros de rede podem não ter context. Não conclua que nada foi salvo/enviado.
  const response = error.context
  const result =
    response instanceof Response
      ? await response.json().catch(() => null)
      : null
  const retryAfter =
    response instanceof Response ? response.headers.get('Retry-After') : null
  console.error(
    result?.error ?? 'Não foi possível confirmar o envio.',
    retryAfter,
  )
  // Mantenha o mesmo body para retry explícito; respeite Retry-After.
} else if (data?.ok === true) {
  // Limpar o formulário e gerar novo UUID apenas para um novo contato.
}
```

Não recrie `submissionId` a cada clique ou retry. Bloqueie cliques simultâneos na
interface. Se alterar os campos, trate como outro envio lógico, respeitando os
limites e sem gerar automaticamente outro UUID para contornar uma falha incerta.
Uma nova tentativa usa exatamente o mesmo conteúdo normalizado e UUID anterior.

| Campo          | Regra                                                                |
| -------------- | -------------------------------------------------------------------- |
| `name`         | String, 2–100 caracteres após trim; sem controles/quebras de linha   |
| `email`        | Endereço sintaticamente válido, até 254 caracteres; trim e lowercase |
| `subject`      | String, 3–160 caracteres após trim; uma linha                        |
| `message`      | String, 20–5000 caracteres após normalizar quebras de linha e trim   |
| `website`      | String exatamente vazia; preenchido é rejeitado                      |
| `submissionId` | UUID v4 aleatório, gerado com `crypto.randomUUID()`                  |

Campos adicionais são rejeitados. Payload máximo: 16 KiB de bytes UTF-8, incluindo
JSON e escapes, verificado também durante streaming. Leitura limitada a 5 segundos;
chamadas ao banco têm timeout de 8 segundos e ao Resend de 10 segundos.

Sucesso: HTTP 200 com `{ "ok": true }`. Erros: `{ "error": "..." }`, com HTTP
400 (entrada/honeypot), 403 (origin/preflight), 405 (método), 408 (leitura lenta),
413 (payload), 415 (content type), 409 (UUID conflitante/em processamento/expirado),
429 (cota), 502 (envio não confirmado) ou 503 (configuração/banco/estado incerto).
Preflight válido retorna 204 sem corpo. O frontend deve ler o corpo de erro do
SDK e respeitar `Retry-After`; nunca exibir sucesso apenas por ausência de exceção.

## 7. Dados, permissões e idempotência

| Objeto                                                                      | Acesso pelo cliente                                            |
| --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `admin_users(user_id)`                                                      | Autenticado lê somente sua própria associação; nenhuma escrita |
| `messages(id,name,email,subject,message,responded,email_status,created_at)` | Apenas admin lê; admin pode atualizar somente `responded`      |
| `featured_projects(repo_id bigint,full_name text,position integer)`         | Público lê; admin insere, atualiza e exclui                    |
| `contact_reserve`, `contact_finish`                                         | Apenas a credencial de serviço executa                         |
| `contact_private`                                                           | Tabelas sem grants ao cliente e com RLS sem policies públicas  |

Todas as tabelas têm RLS habilitada, além de grants explícitos mínimos.
Não há exclusão de mensagens pelo cliente. O ID da mensagem é o próprio
`submissionId`. Para projetos, ordene por `position` e use `repo_id` como desempate;
posições repetidas são permitidas. Não são consultados dados do GitHub aqui.

A RPC de reserva usa lock transacional e janelas móveis: até **3 tentativas por
e-mail em 15 minutos**, **10 globais por minuto** e **100 globais por hora**. Inclui
novos contatos e retries autorizados; rejeições, repetições em andamento e sucessos
já confirmados não consomem nova tentativa. Essas cotas são verificadas no banco
antes de inserir uma nova mensagem e antes de chamar o Resend. Falha no banco
impede o envio. O contador guarda hash do e-mail, nunca IP vindo de headers.

A primeira reserva salva `messages` e o payload imutável de envio na mesma
transação, com `email_status='pending'`. Cada tentativa possui um token interno e
lease de 90 segundos; só esse token pode finalizar o status. Falhas liberam a lease
e exigem ao menos 30 segundos desde a reserva anterior. Um processo interrompido
pode ser retomado quando a lease vencer. Tokens antigos não finalizam uma nova
tentativa. São permitidas no máximo cinco tentativas por contato, dentro de
23 horas desde a primeira reserva, também sujeitas às cotas por e-mail e globais.

O Resend recebe `Idempotency-Key: cp3-contact/<submissionId>` e o mesmo payload
persistido, mesmo após mudança de remetente na configuração. UUID reutilizado com
outro conteúdo retorna conflito. Sucesso confirmado no banco retorna `{ok:true}`
nas repetições sem enviar novamente. Um UUID v4 tem entropia adequada para esse
identificador; ele não deve ser publicado como credencial ou reutilizado entre
contatos. As RPCs internas nunca são liberadas ao navegador.

`email_status='sent'` significa **aceito pela API do Resend**, não entregue na caixa
postal. Rejeição, timeout ou resposta inválida grava `failed` e retorna erro honesto;
um timeout ainda pode ter sido aceito pelo provedor. Falha ao finalizar no banco
retorna 503 e pode deixar `pending`, mesmo com envio aceito. Repita com a mesma
chave e conteúdo. O prazo de 23 horas fica dentro das 24 horas de retenção da chave
no Resend. Depois disso a função bloqueia reenvio e o dono deve reconciliar banco
e painel do provedor, em vez de tentar de novo com outra chave automaticamente.

## 8. Testes e operação

```powershell
node --test supabase/tests/contact.test.mjs
# PostgreSQL/Supabase descartável, após a migração; nunca produção:
psql "$env:TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f supabase/tests/security.sql
```

O teste HTTP requer Node 22+ e simula Supabase/Resend sem rede. O SQL cria usuários
fictícios, verifica grants, RLS, metadata sem privilégios, reserva, payload estável,
tokens, cotas e expiração; ao final desfaz os dados com rollback. Execute com o
usuário administrativo de um banco de teste; em falha, encerre a conexão para
garantir rollback. O schema `auth` real é fornecido pelo Supabase.

Antes de produção, execute também um teste ponta a ponta no projeto de homologação
com domínio e secrets reais: sucesso, erro do Resend, repetição do mesmo UUID,
origem proibida e acesso anon/autenticado sem admin. O runtime Deno, o gateway e a
configuração do provedor precisam dessa verificação após o deploy.

Limitações: CORS e honeypot não autenticam um remetente nem impedem scripts de
forjar Origin. As cotas globais limitam o volume mesmo com e-mails variados, mas um
atacante pode esgotar a cota e prejudicar contatos legítimos. Não há CAPTCHA/WAF,
worker de retry, webhook de bounce/delivery ou resposta automática ao visitante.
O visitante precisa repetir a tentativa; o dono pode ler a mensagem salva mesmo
quando o e-mail falha. Postgres e Resend não compartilham uma transação, portanto
não existe garantia absoluta de envio exatamente uma vez em qualquer falha externa.

Os contadores antigos são limpos durante reservas; registros de idempotência e
mensagens não têm limpeza automática. Preserve os registros de idempotência para
evitar recriar um envio antigo. Planeje retenção/anonimização das mensagens e do
payload privado com o dono, preservando um tombstone por UUID caso elimine dados
pessoais. Não habilite logs que capturem corpos, endereços ou secrets. A migração
não adiciona as mensagens a uma publicação Realtime.

## Referências oficiais consultadas

- [Supabase: configuração, JWT e entrypoint JavaScript](https://supabase.com/docs/guides/functions/function-configuration)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: variáveis e secrets das Edge Functions](https://supabase.com/docs/guides/functions/secrets)
- [Supabase: CORS e cabeçalhos do SDK](https://supabase.com/docs/guides/functions/cors)
- [Resend: envio de e-mail pela API](https://resend.com/docs/api-reference/emails/send-email)
- [Resend: chaves de idempotência e validade de 24 horas](https://resend.com/docs/dashboard/emails/idempotency-keys)
