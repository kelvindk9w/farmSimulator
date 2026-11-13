# Conjunto "low poly": notas

Alvo: `arte/estilo/rodada-03/var-1-low-poly.png`. Para ver lado a lado: `capturas/comparacao-lowpoly.jpg`
(as oito interações estão em `capturas/acoes-lowpoly.png` e a tela de celular em `capturas/celular-retrato-lowpoly.png`).

## Como foi feito

- Os esqueletos, as poses e a animação são os do conjunto "codigo". Aqui só se troca o desenho de cada osso
  (`objetos.js`, `bichos.js`, `boneco.js`) e se fazem do zero o chão e a cerca (`cenario.js`).
- Toda face é chapada: o construtor de formas do kit (`BuilderLowpoly`) nunca alisa as normais e dá a cada triângulo
  um tom um pouco diferente do vizinho. É isso que faz as facetas aparecerem.
- Formas de poucos lados: troncos de pirâmide, prismas de 5 a 8 lados, copas e pedras em blocos. O tronco da vaca e o
  corpo da galinha são uma casca esticada entre anéis de 6 ou 8 pontos (`casca` no kit).
- Material simples com cor por ponto, sem textura. A luz é um sol baixo e dourado com um mapa de sombra de 2048, e é
  ele que desenha as sombras compridas e nítidas no chão. Não há mancha de contato falsa embaixo das coisas.
- O fundo é o pêssego do alvo.

## O que ficou perto do alvo

- O jeito geral: facetas à vista, fundo pêssego, luz dourada com sombras compridas e de borda nítida.
- O celeiro: telhado de placas de telha em fiadas, paredes de tábua em dois tons, porta verde com moldura clara em X.
- A copa facetada da laranjeira, a cerca de mourões grossos, o poço de blocos de pedra com telhadinho.
- O caminho de placas poligonais com marcas claras e o terreiro de oito lados.
- Os canteiros: montinhos com semente, broto, pé crescendo e pé pronto com espigas grandes e amarelas (as quatro fases
  aparecem).
- A vaca malhada de preto e branco e as galinhas facetadas. As oito interações continuam legíveis.

## O que ficou longe, e por quê

- **As laranjas.** No alvo elas ficam espalhadas na copa. No jogo elas pendem de um galho baixo, porque a mão do
  personagem precisa alcançá-las e esse ponto vem do esqueleto do "codigo". Não pus laranjas de enfeite na copa: elas
  ficariam lá depois da colheita e o estado "tem fruta" deixaria de ser lido.
- **O personagem.** O rosto do jogo é bem mais simples que o do alvo (pecinhas escuras, que de longe quase não se
  leem), a touca é maior e o corpo é mais reto e duro. Rosto de poucos polígonos, sem textura, não chega na expressão
  do desenho.
- **O milho.** O pé do jogo tem menos espigas e folhas mais finas que o do alvo.
- **A vaca.** As malhas são facetas inteiras pintadas de preto, de borda angulosa, e o pescoço é todo preto. No alvo as
  malhas têm contorno mais orgânico.
- **A riqueza de cor.** O alvo tem dégradé suave dentro de cada face, sombra de canto e cor rebatida. Aqui cada face
  tem uma cor só.
- **A grama.** As facetas da grama no jogo são maiores e aparecem mais que as do alvo.
- **O telhado.** A água da direita ficou um pouco mais clara e mais laranja que a do alvo.
- **O celeiro é mais alto e estreito** que o do alvo: a largura e a altura da porta vêm do contrato do jogo.

## O que só sairia por outro caminho

- Dégradé e sombra de canto dentro das faces: pedem textura pintada ou luz pré-calculada por ponto, que este conjunto
  não tem.
- Rosto expressivo: pede textura no rosto ou muito mais polígonos na cabeça.
- Laranjas na copa: pede mudar no esqueleto do "codigo" o lugar das frutas e o gesto de colher (lógica de animação,
  fora do combinado para este teste).
- Celeiro mais baixo e largo: pede mudar o contrato do jogo (o tamanho da porta).

## Números (medidos com `npm run medir`)

- No começo: 27 chamadas de desenho e 25.642 triângulos por quadro (13.366 da cena e 12.276 da passada de sombra).
- No pico da demonstração: 34 chamadas e 26.290 triângulos.
- Um mapa de sombra de 2048. Nenhum efeito de tela inteira.
