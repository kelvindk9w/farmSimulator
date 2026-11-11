# Pedidos de arte para o gerador de imagens — cenário (para depois)

O teste do personagem e das animações vem primeiro e usa os prompts em `codex/prompt-3d.md` e `codex/prompt-2d.md`. Este arquivo guarda os dois pedidos de cenário, para a etapa seguinte. Os textos em inglês são para colar no gerador; o inglês costuma dar resultado mais previsível.

Três cuidados valem para todos os pedidos, porque são eles que tornam a imagem aproveitável no jogo:

- **Mesma conversa do começo ao fim.** Faça todos os pedidos na mesma conversa e anexe a tela escolhida no pedido 1 como referência de estilo no pedido 2. É o que mantém o traço igual entre as imagens.
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

## Pedido 2 — Objetos soltos do cenário

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

Anexe as imagens no chat ou coloque-as em `docs/referencias-visuais/codex/` nesta branch. Com os objetos do pedido 2, monto a mesma fazenda da imagem A1 em 2D e gero a comparação lado a lado com a versão 3D.
