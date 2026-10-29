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

## Pendências verificadas

- Nenhum usuário do dono encontrado em `auth.users`; cadastro administrativo e login ainda pendentes. Não foi criada senha.
- Configuração hospedada do Auth (signup fechado, login anônimo desabilitado, Site URL e redirects) não foi alterada. O plugin disponível não oferece essas operações.
- Lista de schemas expostos na Data API ainda precisa ser conferida no painel; `contact_private` não pode estar exposto.
- Resend e os secrets `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` e `ALLOWED_ORIGINS` não foram configurados. A função publicada ainda não está pronta para enviar e-mail.
- Vercel ainda sem acesso conectado, URL de produção ou variáveis configuradas.
- Nenhum e-mail real enviado; testes de produção, Lighthouse publicado, vídeo e entrega no Teams continuam pendentes.

## Validação local

`npm run check` passou antes da configuração externa: formatação, lint, 46 testes e build. Esses testes usam simulações do provedor e não comprovam envio real.
