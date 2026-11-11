# Pedidos de arte para o gerador de imagens (teste de estilo)

Objetivo: descobrir se a arte gerada por IA deixa o jogo mais bonito do que as maquetes desta pasta e por qual caminho ela entra no jogo. São cinco pedidos, em ordem. Os textos em inglês são para colar no gerador; o inglês costuma dar resultado mais previsível.

Três cuidados valem para todos os pedidos, porque são eles que tornam a imagem aproveitável no jogo:

- **Mesma conversa do começo ao fim.** Faça todos os pedidos na mesma conversa e anexe a tela escolhida no pedido 1 como referência de estilo nos seguintes. É o que mantém o traço igual entre as imagens.
- **Mesma câmera.** Vista isométrica: câmera girada 45° e olhando para baixo a cerca de 35°, sem perspectiva (linhas paralelas não se encontram). É a câmera das imagens A1 e C2.
- **Mesma luz.** Sol vindo de cima e da esquerda, sombras suaves.

## Pedido 1 — Tela-alvo (define o estilo)

Peça três variações e escolha uma. É a imagem que diz "o jogo deveria ter esta cara".

```text
Create 3 style variations of a gameplay screenshot mockup for an original cozy farm game set in rural Brazil. Isometric orthographic view (camera rotated 45 degrees, looking down at about 35 degrees, no perspective). 16:9, high resolution.

Scene: a small family farm. A farmhouse with white walls, blue window frames and clay roof tiles, with a porch and colorful festa junina bunting. A wooden barn, a chicken coop with chickens, a fenced pasture with two cows, a small pond with a wooden dock. Crop plots with corn, cassava, coffee bushes and tomatoes at different growth stages. Orange trees and a mango tree. A dirt path connecting everything. One corner of the land still wild: rocks, tree stumps and tall brush waiting to be cleared. Three small farmer characters working (watering, harvesting, carrying a crate).

Style: stylized, chunky, friendly shapes, vibrant tropical colors, warm sunlight from the top left, soft shadows. Characters with big heads and short limbs.

Variation A: stylized 3D render, soft toy-like materials.
Variation B: hand-painted 2D casual mobile game art.
Variation C: clean low-poly 3D with flat colors.

No text, no logos, no user interface, no watermark. Do not imitate any existing game.
```

## Pedido 2 — Folha do personagem (depois de escolher o estilo)

Esta folha vira a planta do personagem 3D. O que importa: corpo sem chapéu e sem cabelo comprido cobrindo o pescoço, braços afastados do corpo e a mesma altura em todas as vistas.

```text
Using the attached image as the style reference, create a character model sheet (turnaround) for one adult farmer character of this game.

Five views of the same character in a row: front, three-quarter front, side, three-quarter back, back. Same scale and same height in every view, feet on the same baseline. Orthographic, no perspective. A-pose: standing straight, arms straight and angled about 45 degrees away from the body, legs slightly apart, hands open. Neutral friendly expression.

The character is bald and has no hat, no beard and no accessories. Simple clothes: plain t-shirt, plain trousers, boots. Proportions: big head (about one third of the total height), short limbs, simple mitten-like hands.

Flat even lighting, plain light gray background, no ground shadow, no text.
```

## Pedido 3 — Peças de personalização

```text
Using the same character and style, create a customization sheet showing only the head, at the same size in every cell, on a plain light gray background, flat even lighting, no text.

Row 1 to 5: five different hairstyles (short, curly, afro, long tied back, braids). For each hairstyle show three views: front, side, back.
Row 6: the bald head with three facial hair options seen from the front: mustache, short beard, full beard. Then the same three from the side.
Row 7: the face from the front five times with five eye colors: dark brown, light brown, green, blue, gray.
```

## Pedido 4 — Tipos de corpo

A regra que permite reaproveitar as animações: todos com a mesma altura e com ombros, quadril e joelhos na mesma altura. Muda a largura, não o esqueleto.

```text
Using the same style, create a body type lineup: five male and five female adult farmer characters standing side by side, front view, A-pose (arms straight, about 45 degrees away from the body), bald, same plain clothes.

Body types for each group: slim, average, chubby, heavy, athletic. All ten characters must have exactly the same total height, and shoulders, hips and knees at the same height, so they can share one skeleton. Only widths and volumes change.

Orthographic, flat even lighting, plain light gray background, feet on the same baseline, no text.
```

## Pedido 5 — Objetos soltos do cenário

Serve para testar o cenário em 2D. Um objeto por imagem, com fundo transparente. Se o gerador não fizer transparência, peça fundo liso magenta, que eu removo.

```text
Using the attached image as the style reference, create game asset sprites, one object per image, transparent background, PNG. Isometric orthographic view (camera rotated 45 degrees, looking down at about 35 degrees). Sunlight from the top left. No shadow cast on the ground, no ground tile under the object, no text. The whole object visible with some empty margin around it.

Objects:
1. Farmhouse with white walls, blue window frames, clay roof tiles and a porch.
2. Wooden barn with a red clay tile roof.
3. Chicken coop.
4. Orange tree with fruit.
5. Corn plant in four growth stages, four separate images: sprout, young, tall, ready to harvest.
6. Large gray rock.
7. Tree stump.
8. Patch of tall wild brush.
9. One straight section of wooden fence.
10. Dairy cow standing, three-quarter front view.
11. Chicken standing, three-quarter front view.
```

## Como me mandar

Anexe as imagens no chat ou coloque-as em `docs/referencias-visuais/codex/` nesta branch. Não precisa renomear; basta eu saber de qual pedido cada uma veio.

## O que eu faço com elas

1. **Cenário 2D:** coloco os objetos do pedido 5 na mesma fazenda da imagem A1 e gero a comparação lado a lado com a versão 3D.
2. **Personagem:** refaço o boneco 3D seguindo a folha do pedido 2, com cabelo, barba, cor de olho e tipos de corpo como peças trocáveis, e mostro andando e sentando.
3. **Opcional:** se você passar a folha do personagem por uma ferramenta de imagem para 3D (Meshy e Tripo são as mais citadas) e me mandar o arquivo `.glb`, eu comparo o modelo dela com o meu no mesmo esqueleto.
