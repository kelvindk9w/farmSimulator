# Rodada 3 — as seis direções

Geradas pelo Codex a partir de `arte/estilo/rodada-02/captura-do-jogo.png`, com o pedido de `pedido.md`. Todas têm 1672 × 941 px. `seis-direcoes.jpg` mostra as seis lado a lado.

## O que o Codex entregou

| Imagem | 8 cores principais | Regras do estilo | O que não ficou como pedido |
|---|---|---|---|
| `var-1-low-poly.png` | `#F8A97F` `#93A627` `#EF983B` `#54761C` `#9C501E` `#4C2A11` `#DD5C20` `#2876A4` | Formas facetadas; sem contorno; sem textura; luz dourada com sombras longas. | O personagem ficou menos facetado que o cenário. |
| `var-2-contorno.png` | `#99DCFD` `#8BC817` `#89400F` `#52830D` `#E08922` `#FEC566` `#788055` `#2C1D07` | Formas expressivas; contorno escuro grosso; cores chapadas; luz simples. | Parece desenho 2D; o milho ficou baixo. |
| `var-3-pintado.png` | `#379C9C` `#9EBA1B` `#F1AA5E` `#41651E` `#C36622` `#5C2A19` `#267AA0` `#E6D6AB` | Formas cheias; sem contorno marcado; superfícies pintadas a pincel; luz quente e sombras coloridas. | A folhagem tem mais detalhe do que o pedido. |
| `var-4-massinha.png` | `#CE9AFA` `#E99646` `#447311` `#8AC234` `#5E330C` `#B2651A` `#EAD0A1` `#B8AB8C` | Formas arredondadas; bordas grossas; massinha irregular; luz macia de estúdio. | O personagem parece mais jovem. |
| `var-5-aquarela.png` | `#FEF7E8` `#D6C39F` `#9EB32C` `#AB662A` `#EBA048` `#C9DA58` `#597941` `#4D86A1` | Formas suaves; linhas finas irregulares; manchas de tinta e papel aparente; luz difusa. | Parece ilustração, não captura de jogo 3D. |
| `var-6-blocos.png` | `#5DC4FD` `#FDDA8F` `#84D72B` `#5B2F12` `#559E1D` `#EC9D4E` `#9E5821` `#636662` | Formas cúbicas; sem contorno; tudo em blocos; luz nítida. | Os X das portas são diagonais lisas; o milho ficou baixo. |

O tamanho e a posição de cada coisa variam um pouco de uma imagem para a outra.

## Quanto cada uma chega no jogo (avaliação da sessão, ainda sem teste)

A lição do conjunto `brinquedo` foi: estilo que depende de acabamento macio perde muito quando as formas são feitas por código e sem textura. Com isso em conta:

| Direção | O jogo chega perto da imagem? | Peso em aparelho fraco |
|---|---|---|
| 1. Low poly | Sim, quase igual: o estilo é a própria forma, sem textura. | O mais leve. |
| 6. Blocos | Sim, quase igual. | Leve, se as faces escondidas forem fundidas. |
| 3. Pintado à mão | Só com textura pintada sobre os modelos. É o caminho a testar: a textura custa memória, não triângulos. | Médio. |
| 2. Contorno | Em parte: cor chapada é fácil, o contorno pede uma passada a mais de desenho. | Médio. |
| 4. Massinha | Difícil: as marcas de dedo e a luz macia são o que o `brinquedo` não conseguiu. | Médio a pesado. |
| 5. Aquarela | Não em 3D: viraria imagem 2D, o que foi descartado antes. | — |

## O teste no jogo (feito depois da avaliação acima)

As direções 1, 2 e 3 foram montadas no sítio mínimo (`prototypes/sitio-minimo`, conjuntos `lowpoly`, `contorno` e `pintado`) e passaram na verificação completa. O resultado está em `teste-no-jogo.jpg` (cada estilo ao lado do alvo) e em `teste-no-jogo-celular.jpg` (os três numa tela de celular em pé).

| Direção | O que chegou perto | O que ficou longe |
|---|---|---|
| 1. Low poly | Facetas, luz dourada, sombra nítida, celeiro, poço, cerca, caminho. É o mais leve: cerca de 26 mil triângulos. | Uma cor só por face (o alvo tem dégradé), rosto do personagem pouco legível de longe, laranjas num galho baixo e não na copa. |
| 2. Contorno | Traço escuro em volta de tudo, cor chapada e viva, telhado em grade, personagem com rosto legível. Sem mapa de sombra. | Traço de espessura única (o alvo é de mão), poucas linhas de dentro, sem sombra projetada, laranjas no galho baixo. |
| 3. Pintado à mão | Cenário: telhado, tábuas, pedra, terra, grama e copa com pintura. Uma textura de 340 KB. | Personagem, vaca e galinhas continuam bonecos de brinquedo sem rosto pintado; falta a luz pintada peça por peça; o ladrilho da grama aparece de longe. |

A avaliação anterior acertou no low poly e errou para menos no contorno, que chegou mais perto do que o previsto. No pintado, a textura resolveu o cenário e não resolveu personagem e bichos, que pedem modelo e pintura próprios.

Nenhum dos três foi medido em aparelho de verdade. As notas completas estão em `prototypes/sitio-minimo/src/arte/<conjunto>/NOTAS.md`.
