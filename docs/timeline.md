# Linha do tempo

Seção `/#trajetoria`, entre Sobre mim e Projetos. Atualizada na branch `feature/atualizar-linha-do-tempo`, criada a partir da `main`.

## Conteúdo

Os registros foram fornecidos pelo Murilo e estão em `src/lib/timeline.js`, em cinco grupos mensais:

- Agosto de 2025: início dos estudos de programação de forma autodidata.
- Janeiro de 2026: conclusão do ensino médio e aprovação no vestibular da FIAP.
- Fevereiro de 2026: início da graduação em Engenharia de Software.
- Agosto de 2026: segundo semestre e aprofundamento dos conteúdos.
- Outubro de 2026: Hackathon OpenAI e FIAP NEXT, com texto e fotografia próprios para cada evento.

As datas seguem o relato do autor. O nome do arquivo original `formatura 2025.JPEG` não foi usado para alterar a data de janeiro de 2026. Não foram acrescentados dias, resultados do hackathon ou outras conquistas.

Cada grupo tem `id` no formato `AAAA-MM`, `month`, `year` e `events`. Cada evento tem `id` estável, `title`, `description` e `image` opcional (`src`, `alt`, dimensões reais e legenda). O mês usa `time` com precisão mensal, sem inventar um dia. Novos registros devem manter a ordem cronológica; eventos do mesmo mês ficam no mesmo grupo.

## Layout e acessibilidade

- Preserva Josefin Sans, Lexend, tokens dos temas claro/escuro, `Reveal`, `Icon` e o progresso de rolagem com `useScroll`.
- O eixo fica à esquerda para acomodar meses completos e vários eventos por mês. Em desktop, texto e imagem dividem o espaço à direita; registros sem foto usam somente texto, sem molduras provisórias.
- As datas ficam sticky em desktop. Abaixo de 768 px, cada evento mostra texto seguido de foto e as datas ficam estáticas. Abaixo de 480 px, mês e ano aparecem em linha sobre o conteúdo, com um marcador pequeno, liberando espaço para leitura.
- As quatro fotos têm versões WebP locais, proporção original, dimensões declaradas, descrição alternativa, legenda e carregamento tardio. As versões usadas pela seção somam aproximadamente 253 KiB. O filtro monocromático preserva a identidade visual. Fotos verticais têm altura máxima de 560 px, sem corte fixo para caber em uma moldura horizontal.
- A ordem de leitura existe no HTML: lista ordenada de meses e artigos identificados pelos títulos dos eventos. O layout não depende de arrastar, passar o mouse ou rolagem travada.
- Com movimento reduzido, as datas deixam de ser sticky, a linha fica preenchida, as entradas são exibidas sem transição e o zoom das imagens é desativado.
- O encerramento permanece aberto, sem datas futuras inventadas.

## Fotografias

| Arquivo fornecido em `public/images` | Versão usada na seção            | Dimensões  |
| ------------------------------------ | -------------------------------- | ---------- |
| `formatura 2025.JPEG`                | `timeline-formatura.webp`        | 960 × 540  |
| `comeco da fiap.JPEG`                | `timeline-inicio-fiap.webp`      | 720 × 1280 |
| `hackathon openIA.jpg`               | `timeline-hackathon-openai.webp` | 960 × 640  |
| `next 2026.JPEG`                     | `timeline-fiap-next.webp`        | 720 × 960  |

As versões foram geradas com o Sharp já instalado, aplicando orientação automática, redimensionamento sem ampliação e WebP com qualidade 80. Os originais foram preservados.

## Verificação e limites

`npm run check` aprovado em 29/10/2026: formatação, lint, 27 testes frontend, 19 testes HTTP e build de produção. As dimensões dos quatro WebP foram conferidas durante a conversão. Não foram adicionados testes que apenas repetem o conteúdo estático.

A conferência visual em navegador não foi concluída: o host de acesso ao navegador está indisponível e a tentativa de captura do Opera expirou. Responsividade, sticky e animações precisam de conferência visual; as regras CSS não substituem essa validação. Não houve medição Lighthouse, deploy, push ou verificação de serviços externos nesta alteração.

Documentação oficial consultada para a organização das listas e suas chaves estáveis: [React: Rendering Lists](https://react.dev/learn/rendering-lists).
