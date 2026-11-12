# Pedido das texturas — construções

**Rascunho.** Só vale depois que o mockup da tela principal estiver aprovado (`arte/mockups/fazenda-principal/aprovado.png`), porque é ele que define o estilo. Quando chegar a hora, abra uma conversa nova no Codex, **anexe o mockup aprovado** e cole o texto abaixo. Ele pede as sete imagens que vestem os moldes 3D das construções (`prototypes/molde-textura`).

```text
Comece do zero. Não use memória, preferências salvas, cache nem nada de outras conversas ou projetos, e não reaproveite imagens já geradas. Use apenas o que está nesta mensagem e a imagem anexada. Responda em português.

O QUE EU QUERO
Sete texturas para um jogo de fazenda original. No jogo, as construções são modelos 3D simples e sem cor; estas imagens são coladas sobre eles: uma para as paredes, uma para o telhado, uma para a madeira, uma porta, uma janela, uma para a grama e uma para a terra dos canteiros. Use a sua ferramenta de geração de imagens. Ainda é um teste do caminho de produção, não a arte final.

REFERÊNCIA DE ESTILO
A imagem anexada é o mockup aprovado da tela principal do jogo. Ela define o estilo: as cores, o jeito de pintar, o nível de detalhe e o contorno (se houver). As texturas têm que parecer tiradas dessa imagem: a parede é a da casa do mockup, o telhado é o da casa, a madeira é a do celeiro, e assim por diante. Não copie pedaços da imagem; pinte cada textura de novo, de frente, no mesmo estilo.

REGRAS QUE VALEM PARA AS SETE
- Vista de frente e chapada, como uma foto tirada bem em frente à superfície (grama e terra: vista exatamente de cima). Sem perspectiva: nada inclinado, nada diminuindo com a distância.
- Luz por igual na imagem inteira. Sem sombra projetada, sem um lado mais claro que o outro, sem brilho de sol, sem degradê de iluminação. A luz e as sombras são feitas pelo jogo.
- Só o material. Sem objetos (vaso, ferramenta, planta encostada, bicho, pessoa), sem chão, sem céu, sem moldura, sem margem e sem vinheta.
- Sem texto, sem números, sem logotipo, sem marca d'água.
- Formato PNG, no tamanho exato indicado. Pode gerar maior e reduzir, desde que o tamanho e a proporção finais sejam os pedidos.

AS CINCO QUE REPETEM
Estas imagens são repetidas lado a lado, como azulejos, para cobrir superfícies grandes. A borda direita tem que continuar na borda esquerda e a de cima na de baixo, sem linha, sem salto de cor e sem desenho cortado. O desenho ocupa a imagem inteira, até as quatro bordas. Evite manchas ou detalhes únicos e chamativos, porque eles denunciam a repetição.

1. parede.png — 512 x 512 px, repete. A parede da casa: reboco branco caiado, liso, com variação leve. A imagem cobre um pedaço de 2 m x 2 m de parede. Sem rodapé, sem janela, sem rachadura grande.
2. telhado.png — 512 x 512 px, repete. Telha de barro vista de frente para a água do telhado. As telhas correm de cima para baixo na imagem; o lado de baixo da imagem é o lado do beiral. A imagem cobre 2 m x 2 m: cerca de 8 colunas de telhas e 4 fiadas.
3. madeira.png — 512 x 512 px, repete. Tábuas de madeira em pé, lado a lado, como a parede do celeiro. As tábuas vão de cima a baixo da imagem sem emenda no meio. A imagem cobre 2 m x 2 m: cerca de 8 tábuas. A mesma imagem também será usada em postes, vigas, cercas e bordas de canteiro.
4. grama.png — 512 x 512 px, repete. Grama vista exatamente de cima, sem direção preferida, sem flores grandes, sem pedras, sem caminho. A imagem cobre 4 m x 4 m de chão.
5. terra-arada.png — 512 x 512 px, repete. Terra de canteiro arada, vista exatamente de cima, com os sulcos retos correndo de cima para baixo na imagem. Sem plantas. A imagem cobre 2 m x 2 m: cerca de 8 sulcos.

AS DUAS DE IMAGEM ÚNICA
Estas não repetem. Cada uma aparece uma vez, sobre a parede. Onde não houver porta ou janela, o fundo é transparente de verdade (canal alfa do PNG): nada de fundo branco e nada de quadriculado desenhado. Não desenhe a parede em volta.

6. porta.png — 512 x 1024 px (1 de largura por 2 de altura), imagem única. Uma folha de porta fechada, com o batente, vista de frente, ocupando a imagem de borda a borda; a base da porta encosta na borda de baixo. A porta é a da casa do mockup (azul). O puxador fica do lado direito. No celeiro, a porta dupla é esta mesma imagem duas vezes, com a segunda espelhada: por isso nada na porta pode depender do lado, fora o puxador.
7. janela.png — 512 x 512 px (quadrada), imagem única. Uma janela fechada, com a moldura e o peitoril, vista de frente e centralizada. A janela é a da casa do mockup (azul). O vidro tem uma cor lisa: sem reflexo de paisagem e sem nada visível do lado de dentro.

ANTES DE ENTREGAR
Confira você mesmo cada imagem e refaça a que falhar:
- Nas cinco que repetem, monte um ladrilho 2 x 2 (quatro cópias encostadas) e olhe as emendas no meio. Aparece linha, salto de cor ou desenho cortado?
- Há sombra, luz vindo de um lado, perspectiva, objeto ou texto em alguma delas?
- As telhas, as tábuas e os sulcos correm de cima para baixo na imagem?
- A porta e a janela têm fundo transparente de verdade? O puxador está do lado direito?
- Os tamanhos em pixels são exatamente os pedidos?
- Lado a lado com o mockup anexado, as sete parecem do mesmo jogo?

ENTREGA
1. Os sete arquivos PNG, com exatamente estes nomes: parede.png, telhado.png, madeira.png, porta.png, janela.png, grama.png, terra-arada.png.
2. Uma imagem com os ladrilhos 2 x 2 das cinco texturas que repetem, para eu conferir as emendas.
3. Para cada arquivo: o texto exato que você usou para gerar, o tamanho em pixels, quantas tentativas foram necessárias e qualquer retoque feito depois (corte, redução, correção de emenda, remoção de fundo).
4. O que não ficou como pedido em cada imagem.
```

## O que mandar de volta

- Os sete PNG, anexados na conversa ou colocados numa pasta nova em `prototypes/molde-textura/texturas/`, por exemplo `texturas/estilo-aprovado/`.
- A imagem dos ladrilhos 2 × 2 e a resposta em texto do Codex.

Para ver o resultado nos moldes, a pasta nova também precisa de um `texturas.json` (copie o de `texturas/provisorio-a/` e troque `nome` e `descricao`). Depois, `npm run capturas` dentro de `prototypes/molde-textura` refaz a comparação com o conjunto novo ao lado dos provisórios. O passo a passo está no README de lá.

## Para ajustar

Os pedidos de mudança rendem mais quando dizem o que está errado e como deveria ser, na mesma conversa do Codex e apontando o arquivo: "em telhado.png as telhas estão na diagonal; quero colunas retas de cima para baixo" ou "em grama.png a emenda aparece como uma linha mais escura no meio do ladrilho 2 × 2".

O que mais costuma falhar neste tipo de pedido é a emenda das imagens que repetem e a transparência da porta e da janela. Se o Codex não acertar depois de duas ou três tentativas, vale pedir a correção por ferramenta (ele mesmo pode rodar um script para ajustar as bordas ou recortar o fundo) em vez de gerar a imagem de novo.

## De onde vêm os números

Os tamanhos, as proporções e as direções deste pedido são os que os moldes esperam (`prototypes/molde-textura/config/molde.json`): uma repetição cobre 2 × 2 unidades de mundo, a porta tem proporção 1:2 e a janela 1:1. Uma unidade de mundo foi tratada aqui como um metro. A grama é a exceção: nos conjuntos provisórios ela cobre 4 × 4 unidades, valor que fica no `texturas.json` de cada conjunto. Se algum desses números mudar lá, este pedido precisa mudar junto.
