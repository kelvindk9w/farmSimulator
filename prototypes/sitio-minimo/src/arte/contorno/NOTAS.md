# Conjunto "contorno": notas

Alvo: `arte/estilo/rodada-03/var-2-contorno.png`. Para ver lado a lado: `capturas/comparacao-contorno.jpg`
(as oito interações estão em `capturas/acoes-contorno.png` e a tela de celular em `capturas/celular-retrato-contorno.png`).

## Como foi feito

- Os esqueletos, as poses e a animação são os do conjunto "codigo". Aqui só se troca o desenho de cada osso
  (`objetos.js`, `bichos.js`, `boneco.js`) e se fazem do zero o chão e a cerca (`cenario.js`).
- **Formas**: as arredondadas do conjunto "brinquedo" (o construtor de lá, com cerca de 30% menos gomos), redesenhadas
  onde o alvo pedia: telhado de placas em grade, paredes lisas com juntas riscadas, cerca de mourão quadrado, pés de
  milho gordos, cabeça da vaca grande, lenço de touca no personagem.
- **Cor chapada em degraus**: um material próprio (`MaterialContorno` no kit) que não usa as luzes da cena. Cada ponto
  fica com a cor cheia, um tom do meio ou um tom de sombra, conforme o lado para onde a face está virada em relação a
  um sol fixo. São três tons por cor, sem dégradé.
- **Traço**: uma "casca virada". Cada malha é desenhada outra vez, inchada, só com as faces de trás e toda escura; o
  que sobra em volta da peça é o traço. Funciona nas malhas com esqueleto e não usa nenhum efeito de tela inteira.
  Em cada ponto a casca é empurrada pelo vetor que afasta todas as faces vizinhas da mesma distância, para o traço
  não abrir nas quinas.
- **Espessura do traço**: é dada em pontos de tela, não em medida do mundo. Acompanha o tamanho da tela e cresce só um
  pouco com o zoom (regra em `espessuraDoTraco`, no kit). Pela regra, com a escala que o jogo usa em cada vista: na
  tela deitada de 1280 x 720, 3,0 pontos na vista "tudo" e 3,3 na vista "perto" (o desenho cresce 34% de uma para a
  outra); no celular em pé de 390 x 844, 3,3 pixels do aparelho na vista "tudo" e 4,0 na vista "perto" (o desenho
  dobra de tamanho).
- **Linhas de dentro**: a casca só risca onde há um degrau de profundidade. As outras linhas são peças escuras: ripas
  finas nas juntas das tábuas, o fundo escuro do telhado que aparece entre as telhas, uma cama escura embaixo das
  travessas da porta, a junta escura entre as pedras do poço, uma chapa mais escura embaixo do caminho e do terreiro.
- **Pé das coisas**: onde a peça encosta no chão do lado da câmera, a casca fica enterrada. Ali o risco é uma
  "pegada": uma chapa escura um pouco maior que a peça (celeiro, poço, canteiros, mourões, tronco).
- **Olhos, bocas, manchas da vaca, brilhos**: chapas finas deitadas na superfície, marcadas para ficar fora da casca.
- **Sombra**: não há mapa de sombra. Embaixo de cada coisa vai uma mancha chapada, de borda nítida.

## O que ficou perto do alvo

- O jeito geral: traço escuro e firme em volta de tudo, cor chapada e viva, céu azul claro, formas gordinhas.
- O celeiro: telhado em grade de telhas com as linhas escuras, cumeeira em gomos, tábuas com junta, porta verde de
  moldura clara em X.
- A cerca (mourão quadrado de cabeça clara, duas réguas), o poço (pedras com junta, telhadinho, manivela, balde, água
  azul), o bloco de chão com a faixa de grama escura e a de terra, o caminho e o terreiro com a beirada riscada.
- A vaca (malhas pretas, focinho rosa grande, olho grande), as galinhas, o ninho.
- O personagem: lenço vermelho, coque, olhos grandes com branco, sorriso, camisa amarela de manga, jardineira azul.
- As quatro fases do milho aparecem, e as oito interações continuam legíveis.

## O que ficou longe, e por quê

- **O traço tem uma espessura só.** No alvo a linha é de mão: mais grossa por fora, mais fina por dentro, com pontas.
  A casca dá a mesma largura em toda a silhueta. As linhas de dentro são peças do mundo, então engrossam junto com o
  zoom, ao contrário do traço de fora.
- **Faltam linhas de dentro que o alvo tem**: a asa riscada da galinha, as dobras da roupa, a separação das pernas da
  vaca, os gomos da espiga. Cada uma teria de virar uma peça escura a mais.
- **A fronteira entre os tons é angulosa nas formas redondas** (corpo da vaca, braços, copa). Ela acompanha os
  polígonos. No alvo é uma curva limpa, posta à mão, com brilho no alto e escuro embaixo.
- **As laranjas.** No alvo ficam espalhadas na copa. No jogo pendem de um galho baixo, na frente da parede do celeiro,
  porque a mão do personagem precisa alcançá-las e esse ponto vem do esqueleto do "codigo".
- **O celeiro é mais alto e estreito** que o do alvo: a largura e a altura da porta vêm do contrato do jogo.
- **O milho.** O jogo tem quatro pés por canteiro (o alvo desenha dois): fica mais carregado.
- **O personagem** é mais cabeçudo que o do alvo, e o lenço é uma touca lisa com um nó de lado, não um lenço amarrado
  com dobras. Quando ele se abaixa, a touca esconde o rosto.
- **Não há sombra projetada.** O alvo tem manchas suaves de sombra ao lado do celeiro e da cerca; aqui só há a mancha
  embaixo de cada coisa.
- **Bichos e personagem não têm pegada**: o risco do pé deles, do lado da câmera, some quando encostam no chão.

## O que só sairia por outro caminho

- Traço de espessura variável e linhas de dentro desenhadas: pedem desenho à mão (figuras ou texturas pintadas) ou um
  efeito de tela inteira que detecta bordas, que ficou fora do combinado.
- Fronteira de tom limpa e brilhos postos à mão: pedem textura pintada, ou muito mais polígonos (e cada triângulo
  conta duas vezes aqui, por causa da casca).
- Laranjas na copa: pede mudar no esqueleto do "codigo" o lugar das frutas e o gesto de colher.
- Celeiro mais baixo e largo, dois pés de milho por canteiro: pedem mudar o contrato e a planta do jogo.

## Números (medidos com `npm run medir`)

- No começo: 36 chamadas de desenho e 66.881 triângulos por quadro. A casca do traço já está nessa conta (é ela que
  dobra o número de triângulos); não há passada de mapa de sombra.
- No pico da demonstração: 43 chamadas e 69.009 triângulos.
- Nenhum mapa de sombra. Nenhum efeito de tela inteira.
