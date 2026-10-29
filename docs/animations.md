# Animações do protótipo

Referência: [portfólio original publicado](https://portfolio-pessoal-delta-five.vercel.app/). A implementação React reproduz os valores disponíveis no HTML, CSS e scripts públicos consultados em 29/10/2026.

| Efeito            | Comportamento reproduzido                                                                                                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Título inicial    | Linhas saem de `translateY(110%)` em 1,3 s; atraso inicial de 0,35 s e intervalo de 0,12 s.                                                                                                                     |
| Introdução e foto | Entrada em 1,5 s, deslocamento de 18 px e blur de 8 px; atrasos de 0,1 s e 1,1 s.                                                                                                                               |
| Paralaxe          | Nome, título e foto acompanham a rolagem com fatores 0,15, 0,35 e −0,1. Título desaparece após rolar 75% da altura da janela.                                                                                   |
| Revelações        | Deslocamento de 48 px e blur de 6 px; opacidade e blur em 1,2 s, movimento em 1,4 s. Observer com limiar de 15% e margem inferior de −5%.                                                                       |
| Sobre mim         | Trecho de 280 alturas de tela com conteúdo sticky, troca na metade, foto reduzindo de 1,08 para 1 e progresso entre abas. Filhos dos painéis usam 36 px/8 px de blur, duração de até 0,9 s e cascata de 0,08 s. |
| Carrossel         | Card central e laterais a ±112%, inclinação de ±14°, escala 0,84 e escurecimento. Movimento de 1,15 s; card que muda de lado sai e reaparece pela outra borda após 380 ms.                                      |
| Interação do card | Perspectiva de 1200 px e inclinação de até ±5° por eixo com mouse. Arraste acompanha 60% do gesto; troca após 60 px.                                                                                            |
| Menu e controles  | Menu abre com escala de 0,9 e deslocamento de −10 px em 0,55 s; links entram em cascata. Botões, chips e setas preservam os movimentos de hover.                                                                |
| Rolagem suave     | Lenis, como na referência: duração de 1,25 s e curva exponencial; navegação por âncoras em 1,6 s. Ciclo de vida gerenciado pelo provider React.                                                                 |

Curvas originais: `cubic-bezier(0.16, 1, 0.3, 1)` e `cubic-bezier(0.34, 1.36, 0.64, 1)`.

## Adaptações e acessibilidade

- Sticky exige largura mínima de 900 px e altura mínima de 700 px, para acomodar o conteúdo atual. Em telas menores e com `prefers-reduced-motion`, os dois painéis ficam empilhados, como o modo mobile do protótipo. A foto usa uma moldura para que o zoom não altere o layout.
- Movimento reduzido desliga paralaxe, zoom, blur, entradas, inclinação pelo mouse, movimentos de hover e rolagem animada. O carrossel mantém botões e teclado com troca imediata, sem cards laterais.
- O scroll não troca um painel com foco dentro da seção. As abas continuam usando Base UI, incluindo navegação pelo teclado. O menu mantém foco, Escape e semântica do Dialog.
- Só o card central é exposto como slide ativo; os demais têm conteúdo `inert`. Controles e setas locais ao carrossel permitem navegar; não há captura global de teclado nem avanço automático. Gestos verticais e cancelados não trocam o projeto, e arrastar não abre links.
- A seleção usa o ID do repositório, preservando o projeto ativo após reordenação dos dados e recuperando a primeira opção se ele desaparecer. Lista, cache, loading, erro, vazio, rate limit, contato e autorização continuam nos serviços existentes.
- As imagens e informações atuais foram preservadas. O tamanho do card tem limite mínimo condicionado à largura disponível para manter o texto legível em janelas baixas. A listagem completa continua usando os cards comuns.

## Evidência e limites

Testes automatizados cobrem navegação circular, teclado e foco, seleção lateral, conteúdo inerte, atualização dos dados, gestos horizontais/verticais/cancelados e os painéis do Sobre. As âncoras passam pelo React Router/RouteScroll, inclusive quando o mesmo hash é acionado novamente, com navegação imediata em movimento reduzido. `npm run check` executa formatação, lint, testes e build.

A ferramenta de inspeção visual encerrou a sessão por não conseguir determinar com segurança a URL atual do navegador no Windows. A comparação foi feita pelo código público da referência; não foi possível confirmar equivalência visual quadro a quadro, em navegador real ou aparelho móvel nesta alteração. Não foi executada nova medição Lighthouse nem feito deploy.

Documentação consultada: [Motion: scroll](https://motion.dev/docs/react-scroll-animations), [Base UI: animação](https://base-ui.com/react/handbook/animation), [Base UI: Tabs](https://base-ui.com/react/components/tabs) e [Lenis](https://github.com/darkroomengineering/lenis).

O nome do projeto entre as setas do carrossel é um link para a página interna de detalhes do repositório ativo. Usa a mesma rota dos cards e permite ativação pelo teclado, preservando a aparência da cápsula e o anúncio da seleção.
