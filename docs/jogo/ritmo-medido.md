# Ritmo medido pelo jogador automático

O `economia.md` diz o ritmo que a conta (o modelo de `tools/economia/ritmo.mjs`) espera. Este arquivo diz o ritmo que
**o jogo de verdade** dá: um jogador automático (`jogo/tools/bot.mjs`) joga sem tela, com os mesmos comandos do toque,
a mesma lógica e os mesmos dados de `dados/`, do nível 1 até onde o conteúdo vai.

Medido de novo em 13/11/2026, depois do **começo humilde, parte 2**: a chegada (a cena dela entrando com a trouxa), a
fazenda que nasce com a casa velha, o poço velho, o baú, o caixote de venda na porteira e a cerca de arame caída; o
celeiro e o quadro de pedidos que se constroem por missão do Seu Tonho (níveis 2 e 3); e as quatro reformas (poço,
caixote → banca, casa, cerca). A medida de antes (o código anterior a esta parte, do mesmo dia, com celeiro, banca e
quadro prontos desde o começo) aparece como "antes" nas tabelas. O bot é determinístico: a mesma linha de comando dá
sempre o mesmo resultado (até alguém mudar o jogo).

## Como rodar

```
cd jogo
npm run bot -- --horas 2 --perfil direto          # 2 horas sem parar
npm run bot -- --horas 168 --perfil regular       # uma semana, nas sessões do perfil
npm run bot -- --horas 720 --perfil engajado --resumo          # só a tabela dia, nível, ouro, missões
npm run bot -- --horas 720 --perfil casual --json saida.json   # tudo em JSON
node tools/bot/repro-cercada.mjs                  # reproduz o defeito 1 da lista de defeitos
```

Perfis (os mesmos do `economia.md`): **casual** 2 sessões de 10 min (8h e 20h), **regular** 3 de 15 min (7h30, 12h30
e 20h), **engajado** 6 de 20 min (das 7h às 22h), **direto** sem fechar o jogo. Entre as sessões o jogo fica fechado e
o relógio anda (a lavoura cresce, os bichos produzem, o presente do dia vira à meia-noite de Brasília).

O bot **não compra cash e não gasta cash** ("terminar agora", vaga de fila de cash): o cash grátis fica guardado.

Tempo de máquina: 720 h do casual em cerca de 10 s; do regular, cerca de 25 s; do engajado, cerca de 85 s.

## 1. Nível no fim do dia: antes, agora e a meta

Antes → **agora** / meta do `economia.md` (a conta). Entre parênteses, a experiência de agora quando ela fica perto
da linha do nível (nível 12 = 24.000, 15 = 57.520).

| Dia | Casual | Regular | Engajado |
|---|---|---|---|
| 1ª sessão (15 min) | - | 4 → **4** / 5 | - |
| D1 | 5 → **5** / 5 | 6 → **6** / 6 | 8 → **8** / 8 |
| D3 | 7 → **7** / 6 | 8 → **8** / 8 | 11 → **11** / 11 |
| D7 | 9 → **9** / 8 | 12 → **11** / 11 (22.711) | 14 → **15** / 16 (59.506) |
| D14 | 11 → **11** / 11 | 15 → **14** / 14 (55.815) | 19 → **19** / 20 |
| D30 | 15 → **14** / 13 (55.684) | 19 → **19** / 19 | 23 → **23** / 26 |

(A conta também foi refeita com o começo humilde: as metas do regular não mudaram; o casual da conta fecha o D1 no 5
em vez do 4, e a primeira sessão do regular da conta termina no nível 5 com 4 pontos de folga, 424 de 420; o jogo
medido termina no 4, como antes. O que mudou na conta está no `economia.md`.)

Leitura:

- **O regular, que é o perfil da curva, bate a meta nos cinco dias** (6, 8, 11, 14, 19). Antes ficava um nível à
  frente no D7 e no D14 (a folga do boi): o começo humilde come uns 4 minutos da primeira sessão (conversar, guardar no
  baú, vender no caixote, construir o celeiro e o quadro) e segura o D7.
- O **casual** é o de antes até o D14; no D30 fica um nível atrás (14 contra 15), 1.800 pontos abaixo da linha do 15 e
  ainda um acima da conta. O **engajado** é o de antes, menos o D7, que passa da linha do 15 por 2.000 pontos (antes
  ficava 1.900 abaixo dela).
- **O que mais pesa é a cerca.** A cerca nova (nível 9) encurta a espera dos pedidos (×0,8). Com a reforma a 800 de
  ouro, o regular passava da linha do 15 no D14 por 400 pontos; a 1.500 (o preço que ficou), bate 14. O bot é sensível
  a mudanças pequenas perto da linha de um nível: com a reforma a 1.200 o regular cai para 18 no D30; mudando só o
  nível da cerca de 9 para 12, o engajado vai a 16 no D7. Por isso não vale afinar mais pelo bot; vale o teste com gente.
- Recomendação: **não mexer na curva.** O regular bate; casual e engajado ficam a um nível do que eram, cada um num
  dia só, e do lado da conta.

Missões do Seu Tonho cumpridas (46 no total, agora com "falar-com-tonho", "guardar-no-bau", "vender-no-caixote",
"celeiro", "quadro" e as quatro reformas; "vender-na-banca" fica só para a gravação de antes): casual 42 no D30
(faltam ovelhas, barril, cavalo e irrigação); regular **as 46 no D25**; engajado **as 46 no D12**.

### O tempo até o boi

| Perfil | A baia pronta e o boi no estábulo | A primeira fileira arada com o boi (missão "boi-de-arado") |
|---|---|---|
| Casual | D2, 1ª sessão (8h), 25 min de jogo (antes: D1, 20h, 17 min) | 27 min de jogo (antes: 20 min) |
| **Regular** | **D1, 2ª sessão (12h30), 26 min de jogo** (antes: 21 min) | **30 min de jogo** (antes: 22 min) |
| Engajado | D1, 2ª sessão (9h30), 22 min de jogo (antes: 25 min) | 22 min de jogo (antes: 29 min) |

O regular continua com o boi na segunda sessão do primeiro dia (a do almoço), uns 4 minutos mais tarde. O casual, com
sessões de 10 minutos, passa da segunda sessão do D1 para a primeira do D2. Em 30 dias o regular arou 5.402 casas com o
boi (2.071 passadas) e 2.929 com a enxada; o arado de ferro (10 casas por passada) entra no D8, com a missão dele.

A primeira sessão do regular termina no **nível 4**, como antes, com 15 missões (até "quadro"): o nível 4 vem aos
9:43 de jogo, e o 5 na sessão seguinte.

### O começo humilde, no regular

| O quê | Quando (tempo de jogo) |
|---|---|
| A conversa com o Seu Tonho | 0:10 |
| A primeira colheita, guardada no baú | 3:42 e 4:43 |
| A primeira venda no caixote (6 coisas) | 6:26 |
| O celeiro pronto (missão, nível 2; 80 de ouro e 45 s de obra) | 8:33 |
| O poço consertado (nível 2; 40 de ouro) | 11:17 |
| O quadro de pedidos pronto (missão, nível 3; 40 de ouro) | 12:49 |
| O primeiro pedido entregue | 15:44 (D1, 2ª sessão) |
| O caixote vira banca (nível 5; 200 de ouro, 6 tábuas, 10 pregos) | 48:39 (D2) |
| A casa reformada (nível 7; 600 de ouro, 12 tábuas, 8 pedras, 20 pregos) | 1 h 45 (D3) |
| A cerca nova (nível 9; 1.500 de ouro, 24 madeiras, 30 pregos) | 4 h 00 (D6) |

No casual o celeiro fica pronto aos 8:44 e o quadro aos 12:15 (D1, 2ª sessão); a cerca nova, no D10. No engajado, as
quatro reformas saem até o D2.

## 2. Quando cada missão saiu (regular)

"Dia" é o dia do jogo (D1 começa às 7h30) e a sessão do dia. "Jogado" é o tempo de jogo aberto até ali. "Espera" é
quanto tempo de jogo aberto a missão levou desde a anterior.

| Missão | Dia | Jogado | Espera |
|---|---|---|---|
| falar-com-tonho (tocar no Seu Tonho) | D1 (1ª) | 0:10 | - |
| preparar-a-terra | D1 (1ª) | 0:45 | 1 min |
| plantar-alface | D1 (1ª) | 2:14 | 1 min |
| agua-do-poco (pegar o regador ao lado do poço e encher) | D1 (1ª) | 2:35 | - |
| regar | D1 (1ª) | 3:03 | - |
| primeira-colheita | D1 (1ª) | 3:42 | 1 min |
| guardar-no-bau | D1 (1ª) | 4:43 | 1 min |
| vender-no-caixote, comprar-sementes | D1 (1ª) | 6:26 a 6:27 | 2 min |
| plantar-milho | D1 (1ª) | 7:26 | 1 min |
| **celeiro** (construir) | D1 (1ª) | 8:33 | 1 min |
| rocar-o-mato | D1 (1ª) | 10:09 | 2 min |
| reformar-o-poco, regador-novo | D1 (1ª) | 11:17 | 1 min |
| **quadro** (construir) | D1 (1ª) | 12:49 | 2 min |
| primeiro-pedido | D1 (2ª) | 15:44 | 3 min |
| guardar-no-celeiro | D1 (2ª) | 20:42 | 5 min |
| lenha, bancada-de-carpintaria, tabuas, pedras | D1 (2ª) | 21 a 24 min | 0 a 1 min |
| **baia-do-boi** (o estábulo simples; o boi chega com o arado) | D1 (2ª) | 25:45 | 2 min |
| **boi-de-arado** (12 casas com o boi) | D1 (2ª) | 29:55 | 4 min |
| galinheiro, galinhas, trato | D1 (3ª) | 31 a 32 min | 1 min |
| ovos | D2 (1ª) | 45:48 | 13 min |
| reformar-a-banca, prateleira | D2 (1ª) | 48:39 a 49:43 | 3 min |
| terra-nova | D2 (2ª) | 1 h 00 | 11 min |
| embalar, bananal | D2 (2ª) | 1 h 02 a 1 h 03 | 2 min |
| moinho | D3 (1ª) | 1 h 30 | 27 min |
| reformar-a-casa | D3 (2ª) | 1 h 45 | 15 min |
| cozinha, companheiro | D4 (2ª) | 2 h 30 | 45 min (espera o nível 8) |
| curral | D5 (2ª) | 3 h 15 | 45 min |
| leite | D6 (1ª) | 3 h 48 | 33 min |
| reformar-a-cerca | D6 (2ª) | 4 h 00 | 12 min |
| queijo, arado-de-ferro | D8 (1ª) | 5 h 15 a 5 h 22 | 1 h 15 (espera o nível 11) |
| jumento | D13 (2ª) | 9 h 19 | 4 h (espera o nível 14) |
| ovelhas, barril | D16 (2ª) | 11 h 34 | 2 h 15 (espera o nível 15; aprisco de 15 mil) |
| cavalo | D21 (1ª) | 15 h 03 | 3 h 29 (espera o nível 16; cavalo 15 mil e sela 4 mil) |
| irrigacao | D25 (3ª) | 18 h 36 | 3 h 33 (espera o nível 18) |

A ordem "pedras" antes de "baia-do-boi" é de propósito: com a baia antes, a obra do estábulo (e a limpeza em volta dela)
gastava as 5 pedras do começo, e a missão das pedras esperava o primeiro lote comprado (no regular, 42 min de jogo
parada, até o D2). As pedras ainda rendem 4 tábuas, que ajudam a pagar as 6 tábuas da baia.

## 3. Onde faltou o que fazer, e onde faltou ouro

Quase nunca. Tempo com o jogo aberto em que a personagem ficou sem tarefa e sem nada a tocar (agora):

| Perfil | Parada sem ter o que fazer | Com a meta da vez travada por ouro | Os motivos |
|---|---|---|---|
| Casual (10 h jogadas) | 4 min 13 s (0,7%) | 2 min 22 s | ouro para a cozinha (1 min); lavoura crescendo (1 min); ouro para o lote "Pasto do Fundo" (42 s); o laticínio espera o nível 11 (40 s) |
| Regular (22 h 30) | 8 min 58 s (0,7%) | 3 min 45 s | ouro para a cozinha (2 min 42 s); lavoura crescendo (2 min 35 s); ouro para o lote (43 s); a obra da cozinha |
| Engajado (60 h) | 39 min 46 s (1,1%) | 5 min 24 s | lavoura crescendo 20 min; o aspersor espera o nível 18 (9 min 38 s); ouro para o lote (3 min 18 s); esperando ovo (3 min) |

Os trechos "sem ouro" são todos curtos (segundos a 1 minuto cada) e no começo. Nenhum perfil ficou travado por ouro ou
por falta do que fazer. O caixote cheio (12 coisas) recusou o cesto 13 vezes no regular, todas antes da banca: o bot
guarda no baú ou no celeiro e volta depois; nada se perde.

## 4. Ouro, cash e tempo (30 dias, agora)

| | Casual | Regular | Engajado |
|---|---|---|---|
| Ouro ganho | 163 mil | 555 mil | 1,91 milhão |
| da banca (e do caixote) | 76% | 83% | 89% |
| de pedido | 14% | 12% | 9% |
| de conquista, missão, nível, diária | 10% | 5% | 2% |
| Ouro gasto: loja (sementes, mudas, ferramentas, material) | 79 mil | 237 mil | 562 mil |
| obra / ampliação / lote / bicho | 15 / 16 / 18 / 11 mil | 38 / 125 / 116 / 37 mil | 43 / 564 / 316 / 49 mil |
| reformas (as quatro) | 2.340 | 2.340 | 2.340 |
| Cash ganho (guardado) | 122 | 159 | 192 |
| Lavoura: casas aradas com o boi / com a enxada | 2.307 / 1.375 | 5.402 / 2.929 | 18.262 / 7.117 |
| Idas ao poço por sessão | 6,0 | 7,0 | 8,0 |
| Pedidos entregues / trocados | 66 / 4 | 124 / 11 | 210 / 25 |
| Toques por minuto jogado | 37 | 34 | 35 |
| Tempo dela: andando, correndo, trabalhando, parada | 27, 33, 38, 2% | 34, 28, 36, 1% | 49, 12, 37, 2% |

Antes desta parte: ouro ganho 176 mil, 562 mil e 1,92 milhão; pedidos 69, 128 e 190. O regular ganha quase o mesmo
(99%); o casual, 7% menos (o caixote vende devagar e a cerca de 1.500 sai do bolso dele no D10). A experiência do
regular vem dos pedidos (79 mil) e da colheita (71 mil), como antes.

Bichos (regular): 12 galinhas, 4 vacas, 3 ovelhas, gato, boi, jumento e cavalo; nenhum chegou ao fim da vida em 30 dias.

## 5. Defeitos e travas achados (do mais grave ao mais leve)

Nada travou o jogo para qualquer jogador: nenhum perfil quebrou com exceção, e todas as 46 missões foram cumpridas pelo
regular e pelo engajado (o começo humilde não trouxe trava nova; o gato que às vezes fica parado sem caminho, item 3,
já aparecia antes). O que achei (a lista é da medida de antes; o item 0 é do começo humilde, já corrigido):

0. **(Corrigido.) A missão das pedras esperava um lote.** Com "baia-do-boi" logo depois de "tabuas", a obra do estábulo
   e a limpeza em volta gastavam as 5 pedras da terra do começo; a missão "pedras", que vinha depois, só andava com o
   primeiro lote comprado (42 min de jogo no regular, até o D2). Agora "pedras" vem antes de "baia-do-boi".

1. **Plantar muda não confere se fecha o caminho; dá para a personagem se trancar.** A obra confere ("fecha-caminho"),
   a árvore não (`podePlantarArvore`, em `nucleo/sistemas/arvores.js`), e árvore não se arranca. No perfil casual, no
   lote novo cheio de mato, ela plantou as 4 bananeiras da missão "bananal" em volta de onde estava e ficou numa casa
   só, entre duas árvores e dois matos (em 27,31, no dia 3). Dali, todo toque longe dá "sem-caminho". Ela só sai roçando
   o mato do lado; o jogo não diz isso. (O bot ficou 25 dias preso ali antes de eu ensiná-lo a sair; agora ele também
   evita a casa que faria beco.) Passo a passo: `node tools/bot/repro-cercada.mjs` (mato a leste e a oeste, muda ao
   norte, muda ao sul, mandar andar: "sem-caminho"). Com borda do terreno ou obra no lugar do mato, a saída fica ainda
   mais escondida. **Média.**
2. **Não dá para vender só um item.** O toque no celeiro com o cesto vazio pega **tudo** o que a banca compra, na ordem
   em que os itens entraram, até encher o cesto; a banca vende o cesto inteiro; o celeiro guarda o cesto inteiro. Quem
   quer guardar 12 ovos para a dúzia e vender o milho que colheu junto tem de esvaziar o cesto antes de recolher os ovos.
   Isso pesa na missão "embalar" (15 min de jogo do regular; uma hora do engajado antes de eu ensinar o bot a separar) e
   faz o celeiro "entupir" com o que vem por último na ordem. Não é defeito de código: é uma regra que vale conferir no
   teste com gente. **Média (desenho).**
3. **Bicho de estimação dentro de obra.** O jogo deixa construir (e plantar árvore) em cima do bicho de estimação; até o
   commit de 13/11 ("bichos de trabalho e de estimação prontos") ele ficava preso lá para sempre, e o afago dava
   "sem-caminho". Depois desse commit ele sai andando, mas ainda passa por cima de casa e pedra às vezes (visto no casual:
   gato no meio da casa em 28.49,47.50). **Leve.**
4. **O bebedouro só confere a água do regador na hora do toque.** Com regas na fila antes dele, o regador seca no meio
   e o bebedouro falha com "regador-vazio" (o jogo ainda manda ao poço quando já está vazio no toque). Passo a passo:
   com o regador quase vazio, tocar 3 plantas com sede e depois "encher bebedouro". **Leve.**
5. **O cocho na fila fica sem comida se o cesto é vendido antes.** O "encher cocho" aceita o milho do cesto no toque,
   mas a tarefa só come quando chega a vez; se ela vende o cesto antes, a tarefa falha com "sem-comida". **Leve**
   (aviso aparece; o jogador entende).
6. **A missão que espera nível segura as seguintes.** `missaoAtual` devolve a primeira não cumprida, mesmo esperando
   nível; as que já dariam para fazer ficam escondidas (as "valeJaTer" se cumprem de uma vez quando a fila anda). Parece
   ser de propósito; anoto porque explica as esperas longas da tabela 2.
7. **"primeiro-pedido" pede que o quadro tenha sido aberto** (`viuDica('quadro')`, marcado pela tela do quadro). Não é
   defeito; o bot imita a tela. Quem automatizar testes sem tela precisa saber.

## 6. Ajustes de número recomendados (nenhum aplicado)

O regular, que é o perfil da curva, bate com a meta nos cinco dias depois do começo humilde (antes ficava 1 nível à
frente no D7 e no D14); o casual fica um pouco à frente da conta; o engajado atrás por limite do bot. Por isso **não
recomendo mexer na curva de níveis nem nos preços agora.**
Só três ajustes pequenos (um de número, um de código, um da conta), para conferir no teste com gente:

| Arquivo | Campo | De → para | Por quê |
|---|---|---|---|
| `dados/missoes.json` | `galinhas`: `objetivo.n` | 2 → 4 | Com 4 galinhas os ninhos (3 ovos cada) dão os 12 ovos da dúzia numa volta só; com 2, são duas voltas, e os ovos do meio vão para a banca junto com a colheita (defeito 2). O bot enche o galinheiro por conta própria e mesmo assim a missão "embalar" levou 15 a 20 min de jogo (regular, casual). Confiança baixa: conferir no teste. |
| `src/nucleo/sistemas/arvores.js` (código, não número) | `podePlantarArvore` | não confere o caminho → confere "fecha-caminho" como a obra | Defeito 1: é o ajuste que mais evita susto. |
| `docs/jogo/economia.md` | tabela "O que a conta mostra" (campo, idas ao poço) | campo 371 e 0,3 ida ao poço no D15-30 → conferir | O jogo jogado de verdade chega a 165 casas e 7 idas por sessão; o ouro fica em 79% da conta.  A experiência fecha por causa dos pedidos. Vale rever a conta antes de mexer em preço. |

## 7. O que o bot joga e o que não joga

Joga: as 46 missões; o começo humilde (conversar com o Seu Tonho, guardar no baú enquanto não há celeiro, vender no
caixote e esperar os fregueses quando ele enche, construir o celeiro e o quadro no lugar de sempre, as quatro reformas
quando o nível e o ouro deixam, `tools/bot/metas.mjs`, `projetoReforma`); lavoura (arar no campo antes da grama, `podeArar` com reserva, semear a cultura que mais rende por
trabalho quando sobra terra, regar, colher, crescer o campo no fim da sessão para o tempo fora); o boi no arado no
trabalho de todo dia (`tools/bot/lavoura.mjs`, `passadaDoBoi`: com o boi pronto, a casa a arar vira um toque no modo
Arado quando a fileira dali tem 3 casas ou mais e cabe toda na lavoura; uma passada por vez na fila); as ferramentas no
mundo (o regador começa no chão ao lado do poço: o toque no poço ou no Regar faz ela buscar sozinha); ferramentas em escada e
conserto; lotes; limpar mato, toco, pedra e mata; pomar (bananeira, laranjeira, goiabeira); celeiro (guardar, pegar,
prateleiras montadas por dentro); todas as construções da lista; bichos de produção (comprar, tratar, recolher, fim da
vida ao fazendeiro, ampliar abrigo); indústrias (fila, retirar, receita encadeada, vaga de fila com ouro); pedidos
(entregar, trocar o impossível); presente do dia, conquistas, correio; boi no arado, jumento, cavalo, barril, gato
(afago e mimo).

Não joga (e por quê): aspersores além do da missão e ampliações do celeiro e da casa (o bot investe em prateleira e em
lote antes); o comando `fileira` com a enxada, a semente e o regador (toca casa a casa; o resultado em tempo de jogo é
o mesmo, só conta mais toques; com o boi, o toque simples já faz a fileira inteira);
cosméticos, convite e compartilhar (não mudam o ritmo); nada que gaste cash.

Não verificado: o que acontece depois do nível 23 e do D30; ovelha, vaca e cavalo chegando ao fim da vida; mais de um
aspersor; o celeiro ampliado; a casa ampliada (varanda e além). A cena da chegada não entra no bot (é só da interface:
no jogo novo ela dura uns 5 s ou um toque); quem confere a cena é `tools/verificar-chegada.mjs`.
