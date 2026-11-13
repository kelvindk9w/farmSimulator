# Conjunto de arte "pintado": notas

Teste de estilo: o sítio mínimo com cara de 3D pintado à mão, para comparar com a imagem-alvo
`arte/estilo/rodada-03/var-3-pintado.png`. A pergunta era: textura pintada sobre modelos simples chega nesse
acabamento, rodando em celular e TV fracos?

Resposta curta: **chega perto no cenário e fica longe nos personagens**. O que falta não é força do aparelho; é
modelo e pintura feitos peça por peça, que este caminho não dá.

Para ver: `npm run build`, abrir o jogo e tocar em "Arte" até "pintado" (ou abrir com `#arte-pintado`).
O conjunto padrão continua sendo o "brinquedo".

## Como foi feito

- **Formas**: as roliças do conjunto "brinquedo", sem contorno. Os esqueletos e a animação são os do conjunto
  "codigo". Só o desenho mudou.
- **Uma textura só** (`publico/pintado-atlas.png`, 1024 x 1024): 16 casas de 256 pontos, 14 usadas. Cada peça
  ganha as coordenadas de textura na hora em que é construída (`BuilderPintado` em `kit.js`): por caixa, por
  cilindro, pelo plano da tela ou as da própria peça. Um material só para tudo (Lambert com textura e cor por
  vértice), sem shader próprio e sem efeito em tela cheia.
- **Uma peça, um pedaço de pintura**: cada telha é uma chapa em arco com uma telha pintada inteira; cada bloco de
  pedra do poço e do baldrame pega um bloco pintado; cada tábua da parede pega uma tábua. Por isso não aparece
  textura repetida nas construções.
- **Cor por vértice por cima da textura**: dá o tom de cada peça (porta verde e moldura creme usam a mesma tábua
  sem cor) e o claro-escuro pintado: mais escuro e frio por baixo e perto do chão, mais claro por cima
  (`banhar` em `kit.js`). A copa da laranjeira é sombreada como uma massa só.
- **Luz**: sol amarelo de cima e da esquerda, céu azul-esverdeado enchendo a sombra, um mapa de sombra de 1024.
  As contas estão em `AMBIENTE`, em `kit.js`: numa face virada para cima a textura aparece como foi pintada.
- **Truques que só valem porque a câmera nunca gira**: as pontas de folha em volta da copa, as pontas de capim
  nas beiras do fundo e a folhagem da copa são deitadas no plano da tela.
- **Chão**: grama em ladrilhos de 2,2 unidades com manchas largas por vértice, tufos de grama avançando sobre a
  beira do caminho e do terreiro, barranco com a franja de grama pintada.
- **A textura só é baixada quando o conjunto é usado.** Até chegar (ou se não chegar), cada peça fica com a cor
  média da sua textura e o jogo começa do mesmo jeito. Os outros conjuntos não pedem o arquivo.

## De onde veio cada textura

Três imagens geradas no Codex (o limite era dez). Cada uma é uma folha de 1024 x 1024 com quatro texturas de
512 pontos. Os pedidos e o texto usado na geração estão em `texturas/fontes/`.

| Folha | Texturas |
| --- | --- |
| `folha-1.png` | tábuas de madeira, telhas de barro, blocos de pedra, palha |
| `folha-2.png` | grama, terra batida (caminho e terreiro), terra arada, folhagem |
| `folha-3.png` | barranco com franja de grama, casca de árvore, tinta lisa (pele, roupa, metal), penugem (pelo e pena) |

Feitas por código a partir delas: "tabua" (a madeira sem cor, para tingir) e "branco".

`texturas/montar-atlas.mjs` monta o atlas (`node src/arte/pintado/texturas/montar-atlas.mjs`). Ele faz três
coisas que mudaram o resultado:

1. **Acerta a cor de cada textura.** As folhas vieram pintadas já com a luz quente da imagem-alvo; com a luz do
   jogo por cima, a madeira e a terra ficavam vermelhas e escuras. Cada textura é levada para a cor "sem luz"
   medida na imagem-alvo.
2. **Emenda** as que repetem (grama, areia, terra, palha), fundindo uma faixa da borda com a do outro lado.
3. **Grava um PNG de paleta** (a hospedagem só aceita `.png`), com cada textura reduzida sozinha ao seu punhado
   de cores. Com uma paleta tirada da imagem inteira, o pelo e a areia ficavam com meia dúzia de tons e manchas.

## Números

Medidos com `CONJUNTOS_EXTRA=pintado npm run medir`: a cena inteira numa tela de 1280 x 720, somando a passada do
mapa de sombra. "Pico" é o maior valor durante a demonstração.

| Conjunto | Chamadas de desenho (começo / pico) | Triângulos (começo / pico) |
| --- | --- | --- |
| pintado | 32 / 39 | 73.820 / 76.616 |
| brinquedo | 31 / 38 | 75.968 / 78.780 |
| codigo | 22 / 26 | 18.596 / 19.192 |

No começo, dos 73.820 triângulos do "pintado", 57.944 são da cena e 15.876 da passada de sombra. Os limites
combinados eram 60 chamadas e 80 mil triângulos por quadro.

O que o navegador baixa (`dist/`):

| Arquivo | Tamanho | Com gzip |
| --- | --- | --- |
| `index.html` | 3,5 KB | 1,4 KB |
| `main.js` (os quatro conjuntos; o "pintado" ocupa 41,1 KB dele) | 948,5 KB | 266,4 KB |
| `pintado-atlas.png` (só quando o conjunto é usado) | 339,9 KB | 337,0 KB |
| **Total** | **1.291,9 KB** | **604,9 KB** |

O limite para texturas era de 4 MB; a única textura tem 339,9 KB. Em cores cheias o mesmo atlas teria 1.433 KB.
As três folhas de origem (1,4 MB, 1,3 MB e 1,1 MB) ficam no repositório e não vão para `dist/`.

Memória de vídeo, **por conta feita e não por medida**: o atlas de 1024 x 1024 com os níveis menores (mipmaps)
ocupa perto de 5,6 MB. O mapa de sombra é igual ao do "brinquedo" (1024 x 1024, perto de 8 MB com a imagem de cor
que o three cria junto). A mancha de sombra embaixo dos objetos tem 64 x 64 pontos (16 KB).

O material é mais barato que o do "brinquedo": Lambert no lugar do material físico (Standard), com uma leitura de
textura a mais por ponto da tela. Não há passada extra nem efeito em tela cheia.

## O que ficou perto do alvo

- **Cor e clima geral**: fundo, grama, terreiro, telhado, parede do celeiro, pedra e terra batem com o alvo na
  medição de cor (diferença pequena, vista só lado a lado). Sombra fria sobre a grama, como no alvo.
- **Celeiro**: tábuas com veio e fresta, porta verde com moldura e travessas creme, baldrame de blocos de pedra,
  telhas de barro gordas com o seu tom cada uma.
- **Poço**: anel de blocos de pedra pintados, telhadinho de telha, balde de madeira com aros.
- **Chão**: grama com variação, tufos na beira do caminho, barranco com a franja de grama.
- **Canteiro**: torrões de terra arada; as sementes ficam à vista em cima dos montinhos; todas as fases do milho
  aparecem (ver `capturas/estagios-pintado.jpg`).
- **Laranjeira**: copa de cachos de folha pintada, com contorno de folhas.
- **Cerca**: mourões e réguas de tábua com parafusos.

## O que ficou longe, e por quê

- **Personagem, vaca e galinhas.** No alvo eles têm corpo de desenho feito à mão: proporção mais esguia, rosto
  pintado, cabelo, penas, dobras de roupa. Aqui são os bonecos do "brinquedo" (cabeça grande, braço em cápsula)
  com uma pincelada leve por cima. É a diferença que mais aparece, e textura não resolve: é modelo.
- **Luz pintada em cada objeto.** No alvo o pintor põe brilho nas quinas, escuro nos vincos e cor rebatida, peça
  por peça. Aqui há um sol, um céu e um escurecimento por vértice. Nenhuma quina ganha brilho.
- **Detalhe miúdo**: grão de milho, nervura de folha, fio de corda, prego, aduela do balde. Aqui são poucas peças
  lisas.
- **Irregularidade de mão**: as telhas, as tábuas e os cachos da copa estão alinhados demais. O alvo é torto de
  propósito.
- **Sombra**: a do alvo é macia e escurece o encontro dos objetos com o chão. Aqui é um mapa de sombra de borda
  quase dura, mais uma mancha embaixo de cada objeto.
- **Grama repetida**: o ladrilho de 2,2 unidades repete. As manchas largas disfarçam, mas na vista do sítio
  inteiro dá para notar o padrão.
- **Laranjas**: o alvo tem laranjas espalhadas pela copa; aqui são só as três pencas que o jogo colhe.
- **Poço**: no alvo o telhado é visto de lado e a manivela fica à direita. Aqui o eixo do sarilho é o do
  esqueleto do "codigo" (não mexi no contrato), e o telhado cobre mais o eixo.

## O que só se alcança por outro caminho

- **Personagens e bichos modelados e pintados um a um** numa ferramenta de modelagem, com textura própria de cada
  um. É o que falta para o rosto e o corpo do alvo. A hospedagem recusa `.glb`: o modelo teria de ir dentro de
  `.json` ou `.js`, e a textura em `.png`.
- **Textura própria por objeto**, com a luz pintada dentro (brilho de quina, escuro de vinco). Precisa abrir cada
  modelo em coordenadas de textura e pintar por cima; a geração de imagem não pinta sobre esse recorte de forma
  confiável.
- **Pintar sobre a foto do jogo.** Como a câmera nunca gira, dá para fotografar cada objeto na câmera do jogo,
  pedir a pintura por cima da foto e projetar a pintura de volta no modelo. Não testei. O risco é a luz ficar
  presa na pintura e a animação mostrar o lado que não foi pintado.
- **Figuras 2D pintadas** no lugar dos modelos. Ficaria igual ao alvo, mas perde o esqueleto e a animação 3D.

## O que não foi verificado

- **Celular e TV de verdade.** Tudo foi medido num navegador sem placa de vídeo (desenho por programa). Quadros
  por segundo não foram medidos. Chamadas de desenho e triângulos são iguais em qualquer aparelho; a velocidade
  não.
- **Memória de vídeo**: é conta, não medida.
- **Textura vista de longe.** Os níveis menores misturam um pouco as casas vizinhas do atlas. Cada casa tem uma
  margem de 16 pontos para isso; conferi só pelo olho, nas capturas.
- **Textura que não chega.** Testei bloqueando o arquivo no navegador de teste: o jogo começa com as cores médias
  e avisa no console. Não testei rede lenta de verdade num aparelho.
- **Parecença com o alvo**: julgada pelo olho e pela média de cor de algumas regiões. Não há medida automática.
- **Composição.** O alvo tem outro enquadramento e outros tamanhos de objeto. Comparei o acabamento, não a
  composição, que é da planta do sítio (lógica do jogo, não mexida).

Conferido: `CONJUNTOS_EXTRA=pintado npm run verificar` termina em "Tudo certo."; as oito ações
(`capturas/acoes-pintado.jpg`), as fases do canteiro (`capturas/estagios-pintado.jpg`), cada objeto de perto
(`capturas/perto-pintado.jpg`, mais perto do que o jogo chega) e a tela de celular em pé
(`capturas/celular-retrato-pintado.jpg`) foram olhadas uma a uma.

## Arquivos

- `index.js` registra o conjunto. `kit.js`: atlas, cores, construtor com textura, material, claro-escuro, luz.
- `cenario.js`: chão e cerca. `objetos.js`: celeiro, poço, ninho, laranjeira, canteiro, milho, objetos de mão.
- `bichos.js`: vaca e galinha. `boneco.js`: a personagem.
- `publico/pintado-atlas.png`: a textura que o jogo baixa. `texturas/`: fontes, pedidos e o montador do atlas.
- `ferramentas/fotos.mjs`: tira as fotos deste conjunto com as peças de `tools/comum.mjs`
  (`acoes`, `perto`, `estagios`, `retrato`).
- Fora desta pasta só mudou o `build.mjs`: copia `src/arte/<conjunto>/publico/*.png` para `dist/`.
- Capturas: `capturas/comparacao-pintado.jpg` (alvo e jogo lado a lado), `comparacao-pintado-jogo.jpg`,
  `acoes-pintado.jpg`, `perto-pintado.jpg`, `estagios-pintado.jpg`, `celular-retrato-pintado.jpg`.
