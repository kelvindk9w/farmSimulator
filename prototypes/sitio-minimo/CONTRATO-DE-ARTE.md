# Contrato de arte do sítio mínimo

Este documento diz o que a arte de cada tipo de objeto tem de entregar para funcionar no protótipo, e o que ela recebe do jogo. Quem cumprir o contrato pode trocar a arte de **um** tipo de objeto (só a vaca, por exemplo) sem tocar em nenhuma regra do jogo.

Os números do contrato moram em `src/jogo/contrato.js`. Este texto explica esses números; se os dois discordarem, vale o arquivo.

## As três partes do protótipo

| Parte | Pasta | O que faz | O que não faz |
|---|---|---|---|
| Lógica | `src/jogo/` | Regras do jogo. Anda em passos fixos de 1/60 de segundo, sempre com o mesmo resultado. Cada coisa do sítio é uma máquina de estados. | Não desenha nada e não importa nada de `three`. |
| Arte | `src/arte/` | Um **visual** por objeto: os modelos, as cores e a animação. | Não decide nada do jogo e não guarda estado do jogo. |
| Ponte | `src/cena/vista.js` | A cada passo lê o estado de cada objeto na lógica, põe o visual no lugar e entrega o estado a ele. | |

A arte é organizada em **conjuntos**. O registro (`src/arte/registro.js`) guarda `conjunto de arte → tipo de objeto → fábrica`. Hoje há dois conjuntos: `codigo` (o de verdade, modelado e animado por código) e `molde` (formas cinza, lisas, só para mostrar a etapa de molde e provar a troca).

## O que é um visual

A fábrica de um tipo é uma função `fabrica({ id, tipo, def, sitio })` que devolve um objeto com:

| Membro | O que é |
|---|---|
| `raiz` | Um `THREE.Object3D`. A ponte põe a raiz na posição do objeto no chão e gira a raiz para o rumo dele. O visual nunca mexe na posição nem no giro da raiz; ele anima o que está dentro dela. |
| `pontos` | `{ nome: THREE.Vector3 }`, no espaço local da raiz. São os pontos de jogo e os pontos de mão do tipo (ver abaixo). |
| `definirEstado(nome, dados)` | Chamado a cada passo com o nome do estado atual e os dados daquele instante. |
| `atualizar(dt)` | Avança a animação. `dt` é 1/60 de segundo num passo normal e 0 logo depois de uma troca de arte. |
| `descartar()` | Tira a raiz da cena e libera as geometrias e os materiais que o visual criou. |
| `fimDoQuadro()` | Opcional. Chamado depois de `atualizar`. |

A classe `Visual` de `src/arte/registro.js` já faz o trabalho repetido (cria os pontos com os valores do contrato, guarda `estado`, `dados`, `tempo`, e marca `trocou` e `primeira`). Usar a classe não é obrigatório.

Regras que valem para todos os tipos:

1. **O visual não guarda estado de jogo.** Tudo o que importa chega em `dados`. Ele pode guardar o que é só aparência (uma mola, o tempo de uma piscada).
2. **O visual tem de aparecer certo já no primeiro `atualizar`**, sem transição. A arte pode ser trocada no meio de uma ação, e o visual novo nasce nesse instante. Na classe `Visual`, `primeira` vale `true` até o fim do primeiro quadro.
3. **Quem anda segue a `fase`.** A lógica entrega `fase` = distância andada ÷ passada do bicho (`PASSADA` no contrato). Um ciclo completo da animação de andar (dois passos do personagem e da galinha, quatro batidas da vaca) tem de cobrir exatamente uma unidade de `fase`. Se a animação tiver outro comprimento de passada, o pé escorrega.
4. **Quem age segue o relógio da ação.** A lógica entrega o tempo `t` da ação em segundos, a duração `dur` e `feito` (verdadeiro depois do instante em que o efeito acontece no jogo: a semente cai, o ovo sai do ninho, a fruta solta). As durações e os instantes de efeito estão em `ACOES`.
5. **Pontos de jogo são fixos; pontos de mão são livres.** A lógica usa os pontos de jogo (onde o personagem para, para onde olha, onde é a porta). O visual tem de declarar os mesmos nomes com os mesmos valores, com tolerância de 5 cm. Os pontos de mão só servem à arte: é para onde a mão do personagem vai. Cada conjunto põe esses pontos onde quiser e pode movê-los durante a animação (a manivela gira, o galho verga).
6. **Nada de conta inválida.** Uma posição, um giro ou uma escala com `NaN` faz a peça sumir. A verificação automática procura por isso a cada meio segundo de demonstração.

## Espaço, medidas e câmera

- Uma unidade de mundo vale cerca de um metro. O chão é o plano `y = 0`. A origem de cada objeto fica no chão, no centro dele.
- A frente do personagem e dos bichos é `+Z` no espaço local. O rumo é um ângulo em radianos em torno de `Y`; rumo 0 olha para `+Z` e rumo π/2 olha para `+X`.
- A câmera é fixa, ortográfica, com giro de 45° e inclinação de 35,264°, e olha a partir do lado `(+X, +Z)`. Na tela, `+X` vai para baixo e para a direita e `+Z` vai para baixo e para a esquerda.
- O personagem tem 2,0 unidades de altura (`ESCALA_PERSONAGEM` = 1,25 sobre o avatar de `tools/visual-refs`).

## O que cada tipo recebe e tem de mostrar

`acao` aparece nos dados do objeto em que o personagem está mexendo. É `{ nome, t, dur, p, feito }` ou `null`. `p` é `t ÷ dur`.

### personagem

Estados: `parado`, `andar`, `correr`, `plantar`, `regar`, `colher`, `girarManivela`, `ordenhar`, `pegarOvo`, `colherFruta`, `dentro`.

Dados: `rumo`, `vel` (unidades por segundo), `fase`, `carregando` (leva o caixote para o celeiro), `item` (o que há no caixote: `milho`, `leite`, `ovo` ou `laranja`), `visivel`, `agua`, `alvo` (id do objeto), `t`, `dur`, `p`, `efeito`, `feito`. Durante `girarManivela` vêm também `angulo`, `balde`, `despejo` e `maos`, os mesmos do poço. Em qualquer ação vem `alvoPontos`: os pontos do visual do objeto-alvo, já em coordenadas de mundo.

Pontos de jogo: nenhum. Pontos de mão: `maoD` e `maoE` (onde estão as mãos; a ponte entrega ao objeto-alvo).

| Estado | O que tem de dar para ver |
|---|---|
| `parado` | Respira. Se `carregando`, segura o caixote. |
| `andar`, `correr` | Ciclo de passada guiado por `fase`. Com `carregando`, anda com o caixote do `item` nas mãos. |
| `plantar` (1,6 s, efeito aos 0,95 s) | Tira as sementes e lança sobre o canteiro. |
| `regar` (1,9 s, efeito aos 1,1 s) | Inclina o regador; a água cai no canteiro. |
| `colher` (1,7 s, efeito aos 0,95 s) | Puxa a espiga do pé (ponto de mão `espiga`) e fica com ela na mão depois de `feito`. |
| `girarManivela` (2,8 s, efeito aos 2,05 s) | Mãos na manivela (ponto `manivela`) enquanto `maos` vale 1; o regador espera no ponto `borda` para receber a água. |
| `ordenhar` (2,7 s, efeito aos 2,25 s) | Senta ao lado da vaca, mãos no ponto `ubere`, balde no ponto `balde`. O banquinho e o balde são do personagem. |
| `pegarOvo` (1,4 s, efeito aos 0,75 s) | Abaixa até o ponto `ovo` e levanta com o ovo depois de `feito`. |
| `colherFruta` (2,2 s, efeito aos 1,3 s) | Estica o braço até o ponto `fruta`, puxa e fica com a laranja depois de `feito`. |
| `dentro` | Invisível (está dentro do celeiro). Também tem de sumir sempre que `visivel` for falso. |

### canteiro

Estados: `vazio`, `semeado`, `broto`, `crescendo`, `pronto`. Dados: `molhado`, `t`, `p` (quanto da fase atual já passou, de 0 a 1), `acao` (`plantar`, `regar` ou `colher`).

Pontos de jogo: `ficar` (0,55; 0; −1,25) e `olhar` (0,45; 0; 0). Pontos de mão: `centro`, `espiga`.

Tem de dar para ver: a diferença entre as cinco fases; a terra mais escura quando `molhado`; o milho crescendo dentro de cada fase conforme `p`; a planta sumindo quando a colheita termina (`acao.feito`).

### poco

Estados: `ocioso`, `tirando`. Dados: `t`, `acao`, `angulo` (da manivela, em radianos), `balde` (0 no fundo, 1 no alto), `despejo` (0 a 1: balde virado, água caindo), `maos` (0 a 1), e `maos` no sentido da ponte: `dados.maos = { D, E }` com a posição das mãos do personagem no mundo.

Pontos de jogo: `ficar` (−0,5; 0; 1,15) e `olhar` (0,6; 0; 1,15). Pontos de mão: `manivela` (o pegador, que gira), `borda` (onde o regador pousa), `balde`.

Tem de dar para ver: a manivela girando com `angulo`, o balde subindo com `balde` e virando com `despejo`.

### celeiro

Estados: `fechado`, `abrindo`, `aberto`, `fechando`. Dados: `abertura` (0 fechada, 1 aberta), `t`, `estoque` (`{ milho, leite, ovo, laranja }`).

Pontos de jogo: `porta` (0; 0; 2,7), onde ele espera a porta abrir; `soleira` (0; 0; 1,5); `dentro` (0; 0; 0,5). O vão da porta tem 1,7 de largura e 2,45 de altura e fica na face `+Z`.

Tem de dar para ver: a porta abrindo e fechando com `abertura`; por dentro tem de ser escuro ou fechado, para o personagem sumir de vista ao passar da soleira.

### vaca

Estados: `parada`, `pastando`, `andando`, `esperandoOrdenha`, `ordenhada`. Dados: `rumo`, `vel`, `fase`, `t`, `leitePronto`, `leite` (0 a 1, quanto o úbere já encheu), `acao`.

Pontos de jogo: `ficar` (−0,85; 0; −0,3) e `olhar` (0; 0; −0,25): o personagem senta do lado direito dela, perto das patas de trás. Pontos de mão: `ubere`, `balde`. A escala do modelo é 1,1.

Tem de dar para ver: parada com vida (respiração, rabo, orelhas); cabeça no chão e mastigação em `pastando`; passo guiado por `fase` em `andando`; um sinal claro quando `leitePronto` for verdadeiro e ela ainda não estiver sendo ordenhada.

### galinha

Estados: `parada`, `andando`, `bicando`, `batendoAsas`, `botando`, `fugindo`. Dados: `rumo`, `vel`, `fase`, `t`, `dur`, `p`, `noNinho` (0 a 1: quanto ela já subiu no ninho), `variante` (`branca`, `caramelo` ou `marrom`).

Pontos: nenhum.

Tem de dar para ver: o passo, as bicadas, o bater de asas, a corrida de susto e a postura (sentada no ninho durante `botando`).

### ninho

Estados: `vazio`, `comOvo`. Dados: `ovos`, `ocupado` (a galinha está em cima), `acao`.

Pontos de jogo: `ficar` (0,3; 0; −0,78) e `olhar` (0; 0; 0). Ponto de mão: `ovo`.

Tem de dar para ver: o ovo quando `ovos` é maior que zero, e o ovo sumindo do ninho quando `acao.feito`.

### arvore

Estados: `ociosa`, `colhendo`. Dados: `frutas` (lista de 0 e 1, uma posição por laranja; são três), `crescendo` (índice da laranja que está amadurecendo, ou −1), `matura` (0 a 1), `alvo` (índice da laranja que está sendo colhida), `acao`.

Pontos de jogo: `ficar` (−0,25; 0; 1,15) e `olhar` (0,65; 0; 1,75): ele fica embaixo da copa, meio de frente para a câmera. Ponto de mão: `fruta` (o miolo da laranja que vai ser colhida; fica à direita dele, perto de 2,05 de altura, que é até onde a mão alcança).

Tem de dar para ver: um balanço leve sempre; cada laranja madura; a que está crescendo, menor; o tranco da árvore quando a fruta solta (`acao.feito`) e a fruta sumindo do galho.

### chao e cerca

Um estado só, `normal`. Recebem `sitio` (a planta de `src/jogo/sitio.js`) na fábrica: o tamanho do terreno, os caminhos, o retângulo do pasto com o vão da porteira e a área das galinhas. Não têm pontos.

## Como trocar a arte de um tipo

1. Escreva a fábrica do tipo num arquivo novo, por exemplo `src/arte/pintado/vaca.js`. Ela pode carregar o que quiser (uma malha pintada à mão, um modelo com esqueleto), desde que devolva um visual como descrito acima. Lembre que a publicação só aceita arquivos `.html`, `.js`, `.json` e `.png`.
2. Registre o conjunto, mesmo que ele só tenha esse tipo: `registrarConjunto('pintado', 'pintado', { vaca })`, e importe o arquivo em `src/main.js`, ao lado dos outros dois conjuntos.
3. Aponte o tipo para o conjunto em `config/arte.json`: `{ "padrao": "codigo", "porTipo": { "vaca": "pintado" } }`. Os outros tipos continuam no conjunto padrão.
4. Rode `npm run build` e depois `npm run verificar`.

Todo conjunto registrado entra sozinho na roda do botão "Arte" e pode ser pedido no endereço com `#arte-nome`. Os dez tipos são `personagem`, `canteiro`, `poco`, `celeiro`, `vaca`, `galinha`, `ninho`, `arvore`, `chao` e `cerca`. Se o conjunto pedido não tiver algum tipo, esse tipo continua com a arte que estava, e o botão mostra "Arte: misto".

Para a verificação automática também rodar a demonstração inteira com o conjunto novo, acrescente o nome dele à lista `CONJUNTOS` no começo de `tools/verificar.mjs`.

## Como a conformidade é conferida

- `conferirVisual(tipo, visual)` em `src/arte/registro.js` devolve a lista de problemas de um visual: função que falta, ponto de jogo fora do lugar, ponto de mão que falta, valor inválido.
- `npm run verificar` roda a demonstração inteira com cada conjunto, em passos contados, e exige: nenhum problema de contrato do começo ao fim, cada ação concluída com a mudança certa nos contadores, e o mesmo estado de jogo nos mesmos passos com os dois conjuntos. Também troca a arte no meio da demonstração e confere que o jogo não muda.

A verificação automática garante que a arte nova não quebra o jogo. Ela não diz se a animação está boa: isso se vê com as folhas de contato de `npm run capturas` e jogando.

## Limites para rodar bem no celular

- De preferência uma chamada de desenho por objeto. No conjunto `codigo` cada objeto animado é uma malha só com esqueleto, e todos dividem um material.
- Sombra é uma mancha escura no chão. Não há mapa de sombra.
- O visual libera em `descartar()` o que criou; geometria ou material compartilhado entre visuais não deve ser liberado por um deles.
