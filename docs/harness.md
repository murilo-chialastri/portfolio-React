# Harness de IA e apresentação

Desenvolvimento com Codex desktop, modelo GPT-6.1 (`gpt-6.1-sol`), usando terminal, patches, consulta à documentação oficial e navegador para ler o Notion e conferir a interface.

O autor invocou `grill-me` para esclarecer o escopo. Confirmou JavaScript, escolha dos serviços pela IA, perfil GitHub, destinatário e liberdade para melhorar o layout mantendo a identidade. O `prompt.md` antigo foi referência histórica, não novas instruções.

A skill `baseline-ui` orientou primitives acessíveis, foco, feedback por campo, skeletons e movimento reduzido. Um agente auxiliar cuidou apenas de `supabase/` e do setup, com contrato definido; não fez operações Git. O agente principal implementou o frontend e revisou a integração. Não foram instalados MCPs de terceiros.

O harness portátil está em `AGENTS.md`, scripts do `package.json`, configurações Oxlint/Prettier, hooks Husky, Commitlint, CI, testes e documentação de arquitetura. As skills globais são do ambiente do autor e não foram copiadas nem apresentadas como dependências da aplicação. As ferramentas do desktop pertencem à sessão, não ao runtime do site.

Pedido-modelo para próximas alterações: “Leia AGENTS.md e docs/architecture.md. Crie feature/filtro-linguagem a partir de main. Implemente um filtro reutilizando o cache, preserve erro/loading/vazio e execute npm run check.”

Fluxo: branch → implementação → verificação → commit convencional → revisão/integração → push autorizado → CI e deploy Vercel após conectar as contas.

## Vídeo de até 8 minutos

1. **0:00–1:00:** home, identidade original, tema, detalhe com URL própria e formulário.
2. **1:00–3:00:** pastas e diagrama; explique componentes versus services/hooks.
3. **3:00–4:30:** compare escolhas da stack e suas concessões.
4. **4:30–6:00:** login real, mensagens/respondida e destaques depois de configurar os serviços.
5. **6:00–7:15:** mostre AGENTS, testes, hooks, CI e branches/commits; explique como conduziu e verificou a IA.
6. **7:15–8:00:** Lighthouse e URL publicada; um aprendizado e uma limitação real.

Grave com rosto e tela visíveis, publique como não listado no YouTube e entregue os três links no Teams. Não demonstre mocks como serviços em produção.
