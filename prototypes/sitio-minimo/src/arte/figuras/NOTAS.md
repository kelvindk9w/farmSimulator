# Conjunto "figuras": a personagem 2D do Codex dentro do jogo

Primeiro teste de pôr no jogo o desenho do Codex como ele veio, em vez de refazê-lo em 3D. O cenário e os bichos são
os do conjunto `contorno` (3D). Só a personagem mudou: ela é uma figura 2D.

## Como é feito

- O Codex desenhou a personagem da cena `arte/estilo/rodada-03/var-2-contorno.png` em cinco imagens, com fundo
  transparente: parada de frente, parada de costas, seis quadros andando de frente, seis andando de costas e quatro
  trabalhando abaixada. As imagens e os pedidos estão em `arte/estilo/rodada-04/codex/`.
- Uma foi refeita: a primeira "parada de costas" (`personagem-costas.png`) veio no meio de um passo, e no jogo
  parecia que ela congelava andando. A que está em uso é `parada-costas.png`, pedida de novo com os dois pés juntos
  (`pedido-parada-costas.md`).
- `texturas/montar-atlas.mjs` separa os quadros, apaga ciscos soltos, põe todas as folhas na mesma escala, alinha os
  pés e o corpo e junta os 18 quadros numa textura só: `publico/figuras-personagem-<resumo>.png` (o nome muda quando o desenho muda), de 2048 por 1023 pontos e
  278 KB, baixada só quando o conjunto é usado. `atlas.json` diz onde está cada quadro.
- `personagem.js` põe a figura num cartão em pé dentro da cena 3D, sempre de frente para a câmera (que é fixa).
  Por estar em pé no mundo, o cartão se esconde atrás das coisas como um objeto de verdade: ela passa atrás do poço,
  some dentro do celeiro e cobre a galinha que está atrás dela.
- Para onde ela olha decide o desenho: de frente quando vem na direção da câmera, de costas quando se afasta, e
  espelhado quando vai para o outro lado. São quatro direções com dois desenhos.
- A caminhada segue a `fase` da lógica (um ciclo de seis quadros por passada), como pede o contrato.

## O que já dá para ver

| Estado do jogo | O que aparece |
|---|---|
| `parado` | A figura parada, de frente ou de costas, com um respiro leve. |
| `andar`, `correr` | Os seis quadros da caminhada, de frente ou de costas, espelhados conforme o lado. Com a velocidade quase zero (freando para parar, virando, esperando a porta do celeiro) mostra a figura parada, para não congelar de perna aberta. |
| `plantar`, `regar`, `colher`, `pegarOvo`, `ordenhar` | Os quatro quadros dela abaixada mexendo no chão. É a mesma animação para as cinco ações. |
| `girarManivela`, `colherFruta` | A figura parada com um balanço. Ainda não há desenho próprio. |
| `dentro` | Invisível, como nos outros conjuntos. |

## O que falta (dito sem rodeio)

- **Ela não segura nada.** Regador, caixote, balde, banquinho, espiga, ovo e laranja não aparecem na mão dela.
- **Não há água, sementes nem folhas caindo.** As partículas eram do personagem 3D.
- **Cada ação precisa do próprio desenho.** Hoje regar, ordenhar e colher são a mesma figura abaixada; girar a manivela
  e colher laranja são a figura parada.
- **Abaixada só de frente.** Quando o alvo está para o fundo da cena, ela se abaixa de frente para a câmera.
- **Correr é a caminhada mais depressa.** Não há desenho de corrida.
- **Andando de lado ela usa o desenho de frente ou o de costas**, o que estiver valendo. Com o teclado dá para andar
  reto para a esquerda ou para a direita da tela, e aí faz falta um desenho de perfil.
- **A sombra é uma mancha redonda**, igual à dos bichos do `contorno`.
- **Bichos e cenário continuam 3D.** A vaca, as galinhas e as construções são os do `contorno`.
- **Proporção.** As folhas saíram um pouco diferentes entre si (a figura andando é mais esguia que a parada). Antes de
  produzir em série é preciso uma folha de modelo aprovada.

## Peso

- Uma chamada de desenho e dois triângulos para a personagem, no lugar de uma malha com esqueleto.
- Memória de vídeo, por conta e não por medida: 2048 x 1023 pontos de 4 bytes são cerca de 8 MB, e perto de 11 MB
  com os níveis reduzidos (mipmaps). É bem mais que o peso do arquivo, e cresce com cada folha nova: quando houver
  bichos e mais ações, as folhas terão de ser repartidas ou encolhidas.
- Nada disto foi medido em aparelho de verdade.

## Como refazer

```
node src/arte/figuras/texturas/montar-atlas.mjs   # refaz o atlas a partir das imagens do Codex
npm run build
```
