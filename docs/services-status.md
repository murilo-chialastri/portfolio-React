# Estado real dos serviços

Verificação em 29/10/2026. Este registro complementa [o guia de configuração](services-setup.md).

## Supabase

- Projeto `portfolio-react`, referência `lmvdwyueykmeurwqvrbb`, região São Paulo (`sa-east-1`), criado na organização do dono. Status retornado: `ACTIVE_HEALTHY`.
- API: `https://lmvdwyueykmeurwqvrbb.supabase.co`.
- O SQL integral de `supabase/migrations/202610290001_initial.sql` foi aplicado pelo plugin Supabase. O serviço registrou a migração como `20261029165808_initial`.
- **Antes de usar `supabase db push`, reconciliar o histórico da CLI:** o nome de versão remoto difere do arquivo local. Não reaplicar o SQL; a estrutura já existe.
- Cinco tabelas com RLS ativo e sete políticas no schema `public`, verificados por consulta ao catálogo.
- Execução de `contact_reserve` negada a `anon` e `authenticated`, permitida a `service_role`, verificada por consulta de privilégios.
- Verificador de segurança retornou apenas dois avisos informativos de RLS sem políticas nas tabelas privadas `attempts` e `deliveries`. Essa ausência é intencional para impedir acesso direto dos clientes. [Explicação do verificador](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Edge Function `contact` publicada, versão 1, status `ACTIVE`, com `verify_jwt=false`, conforme o endpoint público definido no projeto.
- `.env.local` local contém somente URL e chave publishable públicas; arquivo ignorado pelo Git.
- Usuário do dono criado manualmente no Auth, com e-mail confirmado e sem bloqueio. Sua associação foi cadastrada em `admin_users` usando o UUID real do Auth, sem criar ou acessar sua senha.
- Consulta transacional com papel `authenticated` e o UUID do dono reconheceu a associação administrativa e leu a tabela de mensagens (vazia). Isso verifica a autorização no banco; o login pelo navegador ainda não foi testado.

## Vercel

- Projeto `portfolio-react` criado na equipe `murilocastro233-9936` (Hobby) e vinculado ao repositório GitHub. Não foi feito push.
- URL de produção: <https://portfolio-react-three-black-60.vercel.app>.
- Primeiro deploy de produção: `dpl_9Vh6R7cEhwEbMQtbueaDYcyDy9B9`, confirmado como `Ready` pela CLI.
- Variáveis `VITE_GITHUB_USERNAME`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` cadastradas em Production, Preview e Development. Nenhuma chave privada foi enviada ao frontend.
- Rotas `/`, `/projetos`, `/projetos/murilo-chialastri/portfolio-React`, `/login`, `/dashboard` e `/rota-inexistente` retornaram o HTML da SPA com HTTP 200. Isso verifica os rewrites, não comprova login ou autorização no navegador.
- Home e detalhe renderizaram dados reais do GitHub no navegador; o detalhe carregou novamente após refresh. A rota `/dashboard` sem sessão redirecionou para `/login`. O restante dos testes autenticados e de persistência permanece pendente.
- Lighthouse mobile em produção: performance **92**, acessibilidade **100**, boas práticas **100**, SEO **100**. LCP **2,2 s**, Speed Index **4,5 s**, TBT **150 ms**. Relatórios locais `.reports/lighthouse-production.report.html` e `.reports/lighthouse-production.report.json`, ignorados no Git. A medição publicada difere da medição local anterior.

## Valores para concluir nos painéis

No Auth hospedado, usar `https://portfolio-react-three-black-60.vercel.app` como Site URL e restringir redirects aos endereços reais usados pelo aplicativo. Fechar signup e login anônimo conforme o guia.

Nos secrets da Edge Function, usar:

| Nome                 | Valor                                                                 |
| -------------------- | --------------------------------------------------------------------- |
| `RESEND_API_KEY`     | Chave privada real criada no Resend; nunca registrar neste documento. |
| `CONTACT_FROM_EMAIL` | `Portfolio <onboarding@resend.dev>` para o teste restrito do Resend.  |
| `CONTACT_TO_EMAIL`   | `murilocastro233@gmail.com`                                           |
| `ALLOWED_ORIGINS`    | `https://portfolio-react-three-black-60.vercel.app`                   |

O remetente de teste depende das restrições da conta Resend. Para outros destinatários, verificar domínio próprio e usar remetente autorizado desse domínio.

## Teste real após configuração dos secrets

- Após o dono informar que cadastrou os secrets, uma mensagem de teste foi enviada pela Edge Function para `murilocastro233@gmail.com`, com a origem de produção e a chave publishable pública. Resposta HTTP 200 com `{ "ok": true }`.
- Banco confirmou `email_status=sent`, identificador do provedor presente e uma tentativa de envio. Isso comprova aceite pelo Resend, não chegada à caixa de entrada.
- Repetição do mesmo UUID e conteúdo retornou sucesso novamente; o banco manteve uma mensagem e uma tentativa, sem novo envio ao provedor.
- Preflight da origem publicada retornou 204 com CORS correto; origem `https://example.org` retornou 403.
- API pública do Auth confirmou `disable_signup=true` e `external.anonymous_users=false`. Login por e-mail continua habilitado.
- A ferramenta de navegador ficou indisponível nesta sessão. O teste real foi por HTTP; envio pelo formulário visual, login e alterações do dashboard ainda precisam de teste no navegador.

## Pendências verificadas

- Login real no frontend ainda pendente; usuário e associação administrativa já cadastrados.
- Signup fechado e login anônimo desabilitado foram confirmados após a configuração pelo dono. Site URL e redirects ainda não foram conferidos; o plugin não oferece essas operações.
- Lista de schemas expostos na Data API ainda precisa ser conferida no painel; `contact_private` não pode estar exposto.
- Secrets cadastrados pelo dono; configuração funcional comprovada pelo envio real, sem ler ou registrar a chave privada.
- Confirmar recebimento do e-mail, testar formulário e dashboard no navegador, gravar vídeo e entregar os links no Teams.

## Validação local

`npm run check` passou antes da configuração externa: formatação, lint, 46 testes e build. Esses testes usam simulações do provedor e não comprovam envio real.
