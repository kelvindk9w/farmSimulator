# Rodada 4: a figura do Codex direto no jogo

Pergunta do dono do projeto: em vez de refazer a arte do Codex em 3D (e perder o desenho no caminho), dá para pedir ao Codex só a personagem e colocar essa figura no jogo, animada?

## O que foi feito

1. Pedido ao Codex, com a cena `../rodada-03/var-2-contorno.png` anexada, só da personagem: parada de frente e de costas (`codex/pedido-parada.md`) e uma folha com seis quadros dela andando (`codex/pedido-andando.md`). Três imagens geradas, nenhuma refeita.
2. As três vieram com fundo transparente de verdade. Na folha de caminhada a personagem é a mesma nos seis quadros, e a altura dela varia 3 pontos em 579.
3. Os quadros foram separados e alinhados pelos pés e pela cabeça (`ferramentas/quadros.mjs`).
4. O jogo foi fotografado no conjunto `contorno` com e sem a personagem 3D (`ferramentas/montagem.mjs`), e a figura do Codex foi colada na foto, no mesmo lugar e na mesma escala (`ferramentas/compor.mjs`).

## O que há aqui

| Arquivo | O que é |
|---|---|
| `personagem-do-codex.jpg` | O que o Codex entregou: parada de frente, de costas e os seis quadros andando. |
| `personagem-no-jogo.jpg` | À esquerda o jogo hoje (personagem 3D do conjunto `contorno`); à direita a montagem com a figura do Codex. Em cima a cena inteira, embaixo de perto. |
| `personagem-andando.gif` | Montagem animada: a figura andando da porta do celeiro pelo caminho (os quadros foram espelhados para ela andar para a direita). |
| `codex/` | As imagens originais do Codex e os dois pedidos. |
| `ferramentas/` | Os três scripts usados. Os caminhos dentro deles apontam para pastas de trabalho da sessão. |

## O que isto prova e o que não prova

São montagens sobre fotos do jogo, não o jogo rodando. Provam que o Codex devolve a personagem sozinha no estilo da referência, com fundo transparente, e que uma folha de caminhada sai coerente o bastante para animar.

Não foi testado: as outras direções de caminhada, as ações (semear, regar, ordenhar, colher, carregar), os bichos, as peças de cenário, a coerência entre dezenas de folhas, quem fica na frente de quem quando a figura passa atrás de um objeto, nem o desempenho em aparelho de verdade.

Também se nota que a personagem da folha de caminhada saiu mais alta e esguia do que a da cena de referência, que é mais cabeçuda. Antes de produzir em série é preciso fixar uma folha de modelo da personagem.
