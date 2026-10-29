# Murilo Chialastri — Portfólio

Portfólio pessoal migrado de HTML/CSS para React + Vite, em JavaScript, para o CP3 da FIAP. Identidade monocromática, fontes locais, projetos pela API GitHub, páginas individuais, tema persistente e área administrativa.

## Executar

Requer Node.js 24+ e npm. Execute `npm ci` e `npm run dev`. Abra o endereço mostrado pelo Vite.

Sem configuração adicional, a home consulta os repositórios públicos de `murilo-chialastri`. O dashboard e o envio efetivo de contato precisam dos serviços abaixo; não há simulação de login/envio quando indisponíveis.

Copie `.env.example` para `.env.local` e preencha a URL e a **publishable key pública** do Supabase. Nunca use `service_role` ou chave Resend em variáveis `VITE_*`.

## Serviços e deploy

Siga [o setup](docs/services-setup.md) para criar Supabase, aplicar a migração, criar seu usuário administrador e configurar o Resend. Não existe senha padrão nem cadastro público.

Para o teste inicial, `onboarding@resend.dev` só envia para o endereço da própria conta Resend. Use sua conta com `murilocastro233@gmail.com` para esse teste ou verifique um domínio próprio. [Restrição oficial](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).

Na Vercel, importe o repositório, selecione `main`, preset Vite, build `npm run build` e saída `dist`. Cadastre as variáveis públicas. `vercel.json` permite atualizar links internos sem erro 404. Inclua a URL publicada em `ALLOWED_ORIGINS` da função. A integração Git publica cada push em `main`; a conexão das contas e o primeiro deploy ainda precisam ser feitos.

## Comandos

| Comando                             | Finalidade                       |
| ----------------------------------- | -------------------------------- |
| `npm run dev`                       | Desenvolvimento                  |
| `npm run build` / `npm run preview` | Build e prévia de produção       |
| `npm test`                          | Testes React e HTTP do backend   |
| `npm run lint`                      | Oxlint e regras React            |
| `npm run format`                    | Prettier                         |
| `npm run check`                     | Formatação, lint, testes e build |
| `npm run images -- "caminho/img"`   | Otimizar fotos originais em WebP |

As fotos otimizadas já estão em `public/images`. O caminho padrão do script de imagens aponta para o portfólio original deste ambiente; em outro computador passe a pasta como argumento.

## Stack e arquitetura

React 19, Vite 8 e React Compiler; React Router 8 declarativo; TanStack Query 5; Supabase JS 2; Tailwind 4 com plugin Vite; Base UI; Motion; Vitest/Testing Library; Node Test Runner. Versões reproduzíveis no `package-lock.json`.

```text
src/
  components/ui/    # Button, ícones, loading, erro, vazio e boundary
  components/       # Seções e componentes compartilhados
  pages/            # Home, projetos, detalhe, login, dashboard e 404
  services/         # GitHub REST, Supabase e contato
  hooks/            # Queries e cache
  context/          # Tema e autorização
  lib/              # Configuração pública, formatação e validação
supabase/           # Migração/RLS, função de contato e testes de segurança
tests/              # Testes React e regras puras
docs/               # Decisões, serviços, harness e verificação
```

Componentes/páginas em PascalCase; hooks `useNome`; funções/variáveis camelCase. Rede em `services`, estado remoto em queries e regras puras em `lib`. CSS organizado com tokens do tema e classes para preservar o estilo original; Tailwind disponível para utilitários.

Rotas de projeto: `/projetos/:owner/:name`. Os dados vêm do GitHub, sem cadastro manual. A seleção no dashboard salva IDs e ordem. Sem seleção, a home mostra os seis repositórios mais recentes, sem forks/arquivados. O OptiCode de outra conta não entra automaticamente, pois a fonte confirmada foi seu perfil público.

## Versionamento

GitHub Flow: cada funcionalidade parte da `main` em `feature/<nome>`, como `feature/dashboard`. Valide `npm run check`, faça commits pequenos e integre após revisão. Use PRs para colaboração. `main` é produção.

Conventional Commits: `feat(contato): adiciona envio validado`, `fix(auth): bloqueia conta sem privilégio`, `docs(setup): explica configuração`. Husky executa lint-staged (Prettier/Oxlint) e Commitlint. CI executa `npm run check`. Use `npm run prepare` se os hooks não forem ativados por `npm ci`.

Os mesmos padrões estão em [AGENTS.md](AGENTS.md), para orientar a IA. O commit inicial preexistente foi preservado. Nenhum push ou deploy é feito ao executar o projeto.

## Documentação

- [Arquitetura e alternativas](docs/architecture.md)
- [Configurar Supabase e Resend](docs/services-setup.md)
- [Harness e roteiro do vídeo](docs/harness.md)
- [Critérios CP3](docs/cp3-checklist.md)
- [Verificação e performance](docs/verification.md)

Enunciado: [CP3 — Portfolio, Stack e Harness Engineering](https://cherry-client-b8f.notion.site/CP3-Portfolio-Stack-e-Harness-Engineering-3fe911d84e0d80f7bb6dec712e6d904a).
