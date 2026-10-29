# Verificação

`npm run check` valida formatação, lint, testes React/HTTP e build. A suíte cobre validação por campo, envio duplicado, falha sem falso sucesso, visitante sem login, conta sem privilégio e administrador autorizado.

Resultado após a atualização das animações em 29/10/2026: **46 testes aprovados**, sendo 27 no frontend e 19 no handler HTTP do contato. Formatação, lint e build aprovados por `npm run check`.

Os novos testes cobrem carrossel (botões, teclado/foco, seleção lateral, identidade após atualização, conteúdo inerte, arraste e cancelamento) e painéis do Sobre (progresso, foco, teclado e layout sem sticky). A comparação das animações usa os valores do código público do protótipo. A inspeção visual nesta alteração foi bloqueada pela ferramenta de navegador; não houve nova medição Lighthouse. Detalhes em [animações](animations.md).

Os testes HTTP simulam Supabase/Resend sem rede ou credenciais. `supabase/tests/security.sql` exige banco descartável. Esses testes não substituem o primeiro teste real após ativar os serviços.

## Lighthouse mobile

Meça com Chrome instalado e servidor de produção:

```sh
npm run build
npm run preview -- --host 127.0.0.1
npx lighthouse http://127.0.0.1:4173 --only-categories=performance,accessibility,best-practices,seo --output=html --output=json --output-path=.reports/lighthouse --chrome-flags=--headless
```

O perfil padrão simula mobile. Relatórios ficam em `.reports/`, ignorado no Git. Em 29/10/2026, Lighthouse 13.6.0 no build local: performance **100**, acessibilidade **100**, boas práticas **100** e SEO **100**. LCP **0,8 s**, CLS **0**. Arquivos `.reports/lighthouse.report.html` e `.reports/lighthouse.report.json`. Uma medição local não garante o mesmo resultado publicado.

Navegador verificado em desktop e viewport 390×844: home nos dois temas, persistência após reload, listagem/detalhe reais via GitHub, atualização da rota direta, 404, redirecionamento de `/dashboard` sem sessão e validação/foco dos campos de contato. O cenário de destaque removido tem teste de regressão, e os campos ficam bloqueados durante o envio para evitar apagar edições não enviadas.

## Conferência antes da entrega

- Desktop/celular: overflow, menu com teclado/Escape, foco e abas.
- Tema: trocar e atualizar; conferir os dois contrastes.
- Projetos: detalhe e retorno sem nova consulta à lista durante o cache; rota inexistente e API offline/rate limit/vazia.
- Contato: inválido, sucesso real, falha do provedor e retry sem duplicar.
- Dashboard: visitante, conta não admin e dono; persistência de mensagens/respondida e destaques.
- Vercel: abrir e atualizar detalhe; push em main dispara deploy.

Login real, banco externo, e-mail e deploy ficam pendentes até configurar as contas. Nenhum resultado de produção é presumido.
