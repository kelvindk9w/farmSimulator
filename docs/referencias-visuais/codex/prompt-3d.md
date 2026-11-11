# Prompt para o gerador — conversa do 3D

Abra uma conversa nova e cole o texto abaixo. Esta conversa vem primeiro: a imagem `personagem-aprovado.png` que sai dela é anexada na conversa do 2D, para o personagem ser o mesmo nos dois testes.

```text
Comece do zero. Não use memória, preferências salvas, cache nem nada de outras conversas ou projetos, e não reaproveite imagens já geradas. Use apenas o que está nesta mensagem. Responda em português.

CONTEXTO
Estou testando a arte do personagem de um jogo de fazenda original, com câmera isométrica fixa (vista de cima, com cerca de 35° de inclinação). O personagem vai ser um modelo 3D de poucos polígonos, animado em tempo real em Three.js e em Godot 4. Nesta conversa quero tudo de que um modelador precisa para construir esse personagem em 3D. Não quero cenário.

PERSONAGEM
Agricultor adulto, simpático, de desenho próprio. Não imite nenhum jogo existente.
- Proporções de desenho animado: cerca de 3 cabeças de altura, cabeça grande e redonda, braços e pernas curtos e grossos, mãos simples (polegar e os outros dedos unidos), botas simples.
- Pele morena, cabelo castanho-escuro curto e cacheado, sem barba, olhos grandes e simples.
- Roupa: camiseta amarelo-mostarda, jardineira jeans azul, botas marrons.
- Sem chapéu, sem bolsa, sem ferramenta, sem estampa e sem texto.
- Lado esquerdo e lado direito idênticos (desenho simétrico).
- Formas simples: silhueta clara, poucas áreas grandes de cor, nada fino ou solto (sem fios de cabelo soltos, sem tecido esvoaçante).

ETAPA 1 — três opções de estilo (pare aqui e espere a minha escolha)
Gere 3 imagens do mesmo personagem, de corpo inteiro, em pé, visto de três quartos de frente, em fundo liso cinza-claro. Cada imagem em um estilo de arte diferente, à sua escolha, desde que o estilo funcione como modelo 3D de poucos polígonos. Diga em uma linha o que muda em cada opção. Depois pare e me pergunte qual eu escolho.

ETAPA 2 — folhas para o modelador (depois da minha escolha)
No estilo escolhido e sempre com o mesmo personagem. Em todas as imagens: fundo liso cinza-claro, luz uniforme, sem sombra no chão, sem perspectiva (vista ortográfica) e sem texto dentro da imagem.
1. personagem-aprovado.png: a opção escolhida, limpa, de corpo inteiro, três quartos de frente.
2. Cinco vistas em pose A (em pé, braços retos afastados uns 45° do corpo, pernas levemente afastadas, mãos abertas, expressão neutra), todas na mesma escala, com a mesma altura e com os pés na mesma linha: vista-frente.png, vista-34-frente.png, vista-lado.png, vista-34-costas.png, vista-costas.png. Uma imagem por vista, com pelo menos 1024 px de altura. Junte as cinco também em folha-modelo.png.
3. cabeca.png: só a cabeça, grande, de frente e de lado, para os detalhes do rosto.
4. personalizacao.png: só a cabeça, sempre no mesmo tamanho. Careca; dois outros cabelos (black power e comprido preso atrás); uma barba cheia. Cada item de frente, de lado e de costas.
5. poses-chave.png: o personagem de corpo inteiro, visto de lado, nas poses que definem cada animação: andar (2 poses), correr (2 poses), pular (preparar, no ar, aterrissar), agachar, sentar no chão, deitar de costas. Serve para o animador entender o jeito de ele se mexer.
6. paleta.json: as cores em hexadecimal de pele, cabelo, camiseta, jardineira, botas e olhos.

Antes de entregar, confira você mesmo: é o mesmo personagem em todas as imagens (proporções, cores, roupa)? As cinco vistas têm a mesma altura? Refaça o que estiver diferente.

ETAPA 3 — opcional: o modelo 3D
Só se o seu ambiente permitir construir e exportar 3D (por exemplo, Blender por script). Se não permitir, diga isso em uma linha e pule esta etapa. Não simule.
Construa o personagem seguindo as vistas e exporte personagem.glb:
- glTF 2.0 binário, com tudo dentro do arquivo. Eixo Y para cima, frente do personagem em +Z, pés na origem, 1,6 unidade de altura.
- Até 6.000 triângulos. Cores por vértice ou uma textura de até 1024 px.
- Um esqueleto humanoide de até 24 ossos. Corpo como malha com pesos. Cabelo e barba como malhas separadas, presas ao osso da cabeça, para poderem ser trocadas.
- Animações dentro do arquivo, com exatamente estes nomes: idle, walk, run, jump, crouch, sit, lie. walk e run em ciclo perfeito e sem sair do lugar. crouch, sit e lie começam em pé e terminam na pose final.
- Os dois cabelos e a barba da folha de personalização em arquivos separados: cabelo-b.glb, cabelo-c.glb, barba.glb.

ENTREGA
Coloque tudo em uma pasta teste-3d/ e me entregue em um arquivo zip. Inclua um RELATORIO.md curto: o que foi entregue, o que não ficou bom, quantas imagens você gerou e quantas precisou refazer.
```
