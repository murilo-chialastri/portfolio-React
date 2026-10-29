# Linha do tempo

Seção `/#trajetoria`, entre Sobre mim e Projetos, criada na branch `feature/linha-do-tempo` a partir da `main`. O menu e os números das seções acompanham a nova ordem.

## Design e movimento

- Preserva os tokens de tema claro/escuro, Josefin Sans, Lexend e o componente `Reveal` existentes.
- Em desktop, o eixo central conecta os anos em círculos. Texto e fotografia ficam em lados opostos, alternando a cada registro. A imagem enviada pelo autor orienta essa disposição, sem reproduzir suas cores.
- A referência de movimento é o [portfólio de Yudi Ganeko](https://www.yudiganeko.com). O HTML público consultado em 29/10/2026 mostra datas com `position: sticky` e zoom suave nas fotografias. A adaptação mantém os anos visíveis durante cada capítulo, acrescenta preenchimento da linha conforme a rolagem e reutiliza a entrada suave do portfólio. Não é uma reprodução quadro a quadro da referência.
- `useScroll` controla `scaleY` sem atualizar estado React a cada quadro. A rolagem permanece livre, sem travamento ou avanço automático.
- Abaixo de 768 px, o eixo passa para a esquerda e cada registro apresenta texto seguido de fotografia. A ordem cronológica também existe no HTML, em uma lista ordenada, com anos em elementos `time`.
- Com movimento reduzido, os anos deixam de ser sticky, a linha fica preenchida e as entradas e o zoom são desativados pelas regras de acessibilidade existentes.
- O encerramento “A jornada está apenas começando” permanece aberto, sem inventar datas futuras.

## Conteúdo pendente

Os únicos anos definidos são **2025 e 2026**. Não há conquistas, cursos, datas específicas ou fotografias biográficas inventadas. Os textos atuais e as molduras são espaços explicitamente provisórios.

Para adicionar o material fornecido pelo autor, editar `src/lib/timeline.js`. Cada entrada contém:

- `id`: identificador estável do marco;
- `year`: ano exibido e valor de `dateTime`;
- `title` e `description`: conteúdo real do marco;
- `image`: `null` até existir fotografia; depois, um objeto com `src`, `alt`, `width`, `height` e `caption` opcional.

Usar imagens locais otimizadas em `public/images`, descrição alternativa contextual e dimensões reais. As fotografias usam carregamento tardio e espaço reservado por proporção. Novos marcos podem repetir o ano com IDs diferentes; os lados são alternados automaticamente. Os registros devem permanecer em ordem cronológica. Não há integração remota ou persistência para esta seção.

## Verificação e limites

`npm run check` aprovado em 29/10/2026: formatação, lint, **27 testes frontend e 19 testes HTTP** e build de produção. A suíte existente verifica regressões do projeto; não valida a geometria nem o movimento desta seção.

A inspeção visual não foi concluída: o host de acesso ao navegador estava indisponível, a captura no Opera expirou e a ferramenta interrompeu o acesso ao Firefox por falta de suporte à verificação de URL nesse navegador no Windows. Responsividade, sticky e animações ainda precisam de conferência visual em navegador e aparelho móvel. Não houve nova medição Lighthouse, deploy, push ou teste de serviços externos nesta alteração.

Documentação oficial consultada: [React: useRef](https://react.dev/reference/react/useRef), [Motion: useScroll](https://motion.dev/docs/react-use-scroll) e [Motion: useTransform](https://motion.dev/docs/react-use-transform).
