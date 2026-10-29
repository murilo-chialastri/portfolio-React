# Instruções do projeto

Este é o portfólio de Murilo Castro Chialastri, desenvolvido para o CP3 da FIAP.

- Use JavaScript e JSX, React funcional e a documentação oficial atual. Não migre para TypeScript.
- Preserve a identidade visual monocromática, Josefin Sans e Lexend, com melhorias de acessibilidade e responsividade.
- Separe apresentação (`components`, `pages`), integração (`services`), estado remoto (`hooks`) e regras puras (`lib`). Componentes PascalCase; hooks `useNome`; funções camelCase.
- Consulte GitHub pela API; não transforme os projetos em uma lista manual. Trate loading, erro, vazio, paginação e rate limit. Reutilize o cache ao navegar.
- Nunca simule envio de e-mail, autenticação ou persistência bem-sucedidos quando os serviços estiverem indisponíveis.
- Login e autorização são diferentes: o dashboard requer sessão e presença em `admin_users`; dados privados também são protegidos por RLS.
- Nenhum segredo em `VITE_*`, código, logs ou commits. Use `.env.local` ignorado e `.env.example` versionado.
- Cada funcionalidade deve começar em uma branch `feature/<nome-em-kebab-case>` a partir da `main`. Integre localmente depois das verificações. Correções podem usar `fix/<nome>`.
- Use Conventional Commits: `feat(escopo): descrição`, `fix(escopo): descrição`, `docs`, `test`, `chore`, `refactor`. Não altere datas ou invente histórico de trabalho.
- Antes de integrar: `npm run check` (formatação, lint, testes e build). Hooks validam arquivos staged e a mensagem do commit.
- Não faça push, publique serviços, crie contas ou envie mensagens reais sem o pedido correspondente do usuário.
- Respeite movimento reduzido, teclado, foco visível, labels e contraste. Reutilize os componentes em `components/ui` e os primitives do Base UI.
- Registre decisões e limitações reais em `docs`. Não declare Lighthouse, deploy ou integrações externas verificados sem evidência.
