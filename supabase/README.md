# Backend CP3

O procedimento completo para criar o projeto, aplicar a migração, cadastrar o UUID
do dono, desabilitar signup, configurar secrets e publicar a função está em
[docs/services-setup.md](../docs/services-setup.md).

Nada aqui cria contas ou configura serviços externos automaticamente.

- `migrations/202610290001_initial.sql`: tabelas, grants, RLS e RPCs de contato.
- `functions/contact/index.js`: Edge Function pública em JavaScript.
- `config.toml`: entrypoint, JWT público e signup local desabilitado.
- `.env.example`: nomes e exemplos de configuração, sem credenciais reais.
- `tests/contact.test.mjs`: testes HTTP isolados, sem chamadas externas.
- `tests/security.sql`: regressão de permissões/RLS e do estado das RPCs.

Testes JavaScript: `node --test supabase/tests/contact.test.mjs` (Node 22+).
Execute o SQL de regressão somente em banco de teste após aplicar a migração:
`psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f supabase/tests/security.sql`.
