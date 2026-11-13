# Ritmo medido pelo jogador automático

O `economia.md` diz o ritmo que a conta (o modelo de `tools/economia/ritmo.mjs`) espera. Este arquivo diz o ritmo que
**o jogo de verdade** dá: um jogador automático (`jogo/tools/bot.mjs`) joga sem tela, com os mesmos comandos do toque,
a mesma lógica e os mesmos dados de `dados/`, do nível 1 até onde o conteúdo vai.

Medido de novo em 13/11/2026, depois do **começo humilde** (campo de 12 casas ao lado do poço, mais espaço livre em
volta da casa, o boi velho do Seu Tonho no nível 4, a fileira do boi para o lado com mais casas, as ferramentas no
mundo). A medida de antes, do mesmo dia, aparece como "antes" nas tabelas. O bot é determinístico: a mesma linha de
comando dá sempre o mesmo resultado (até alguém mudar o jogo).

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

Antes → **agora** / meta do `economia.md` (a conta).

| Dia | Casual | Regular | Engajado |
|---|---|---|---|
| 1ª sessão (15 min) | - | 4 → **4** / 4 | - |
| D1 | 5 → **5** / 4 | 6 → **6** / 6 | 8 → **8** / 8 |
| D3 | 7 → **7** / 6 | 8 → **8** / 8 | 11 → **11** / 12 |
| D7 | 9 → **9** / 8 | 11 → **12** / 11 | 15 → **14** / 16 |
| D14 | 11 → **11** / 11 | 14 → **15** / 14 | 19 → **19** / 20 |
| D30 | 15 → **15** / 13 | 18 → **19** / 19 | 23 → **23** / 26 |

(A conta também foi refeita com o começo humilde: as metas do regular não mudaram; o casual da conta caiu de 5 para 4
no D1, a 3 pontos de experiência do 5, e o engajado subiu de 7 para 8. O que mudou na conta está no `economia.md`.)

Leitura:

- **O começo humilde, sozinho, não mudou o ritmo.** Com o bot de antes (que só usava o boi na missão), o jogo novo dá
  exatamente a tabela de antes no regular (6, 8, 11, 14, 18).
- **O que mudou foi usar o boi.** Agora o bot ara com ele sempre que a fileira tem 3 casas ou mais (como um jogador de
  verdade faria: um toque ara a fileira inteira). O regular ganha um nível no D7 e no D14 (12 e 15 contra a meta de 11 e
  14) e chega à meta no D30 (19; antes ficava em 18). O ganho vem dos toques que o boi poupa (um toque por fileira em vez
  de um por casa), não da velocidade da passada: com a passada 60% mais lenta (4 s em vez de 2,5 s), a tabela fica igual.
- O **casual** não mudou (continua 1 a 2 níveis à frente da conta: os pedidos rendem para ele mais do que a conta
  supõe). O **engajado** fica um nível atrás no D7 e segue atrás da conta do D7 em diante, pelo limite do bot (ele não
  compra aspersores além do da missão; o campo dele no D30 tem 240 casas plantadas, a conta fala em cerca de 1.000).
- Recomendação: **não mexer na curva agora.** Um nível à frente no D7 e no D14 é a folga que o boi dá, e o D30 bate.
  Se o teste com gente mostrar a semana rápida demais, o boi chegar com o cocho vazio (só 3 casas até o primeiro trato) é
  a alavanca mais suave.

Missões do Seu Tonho cumpridas (38 no total, com "baia-do-boi" e "arado-de-ferro"): casual 34 no D30 (faltam ovelhas,
barril, cavalo e irrigação); regular **as 38 no D26** (antes: as 36 no D30); engajado **as 38 no D12**.

### O tempo até o boi

| Perfil | A baia pronta e o boi no estábulo | A primeira fileira arada com o boi (missão "boi-de-arado") |
|---|---|---|
| Casual | D1, 2ª sessão (20h), 17 min de jogo | 20 min de jogo |
| **Regular** | **D1, 2ª sessão (12h30), 21 min de jogo** (6 min depois de abrir a sessão) | **22 min de jogo** |
| Engajado | D1, 2ª sessão (9h30), 25 min de jogo | 29 min de jogo |

Antes, o boi era do nível 12: no regular, a missão "boi-de-arado" saía no D12, com 8 h 45 de jogo. Agora o regular tem o
boi na segunda sessão do primeiro dia (a do almoço). Em 30 dias ele arou 5.377 casas com o boi (2.054 passadas)
e 2.905 com a enxada; o arado de ferro (10 casas por passada) entra no D7, com a missão dele.

A primeira sessão do regular segue igual: termina no **nível 4**, com 11 missões (até "primeiro-pedido"), como a conta
prevê.

## 2. Quando cada missão saiu (regular)

"Dia" é o dia do jogo (D1 começa às 7h30) e a sessão do dia. "Jogado" é o tempo de jogo aberto até ali. "Espera" é
quanto tempo de jogo aberto a missão levou desde a anterior.

| Missão | Dia | Jogado | Espera |
|---|---|---|---|
| preparar-a-terra | D1 (1ª) | 0:20 | - |
| plantar-alface | D1 (1ª) | 1:34 | 1 min |
| agua-do-poco (pegar o regador ao lado do poço e encher) | D1 (1ª) | 1:43 | - |
| regar | D1 (1ª) | 2:23 | 1 min |
| primeira-colheita | D1 (1ª) | 3:15 | 1 min |
| vender-na-banca, comprar-sementes | D1 (1ª) | 3:37 a 3:46 | - |
| plantar-milho | D1 (1ª) | 7:02 | 3 min |
| rocar-o-mato, regador-novo | D1 (1ª) | 8:32 a 8:53 | 1 min |
| primeiro-pedido | D1 (1ª) | 11:19 | 2 min |
| guardar-no-celeiro | D1 (2ª) | 15:42 | 4 min |
| lenha, bancada-de-carpintaria, tabuas, pedras | D1 (2ª) | 16 a 19 min | 0 a 1 min |
| **baia-do-boi** (o estábulo simples; o boi chega com o arado) | D1 (2ª) | 21:01 | 2 min |
| **boi-de-arado** (12 casas com o boi) | D1 (2ª) | 22:21 | 1 min |
| galinheiro, galinhas, trato | D1 (2ª) | 22 a 23 min | - |
| ovos, prateleira | D1 (3ª) | 30 a 31 min | 7 min |
| terra-nova | D2 (1ª) | 45 min | 14 min |
| embalar, bananal | D2 (2ª) | 1 h 02 a 1 h 03 | 17 min |
| moinho | D2 (2ª) | 1 h 14 | 11 min |
| cozinha, companheiro | D3 (3ª) | 2 h 00 | 45 min (espera o nível 8) |
| curral | D4 (2ª) | 2 h 30 | 30 min |
| leite | D5 (1ª) | 3 h 01 | 32 min |
| queijo | D7 (1ª) | 4 h 30 | 1 h 28 (espera o nível 11) |
| arado-de-ferro | D7 (3ª) | 5 h 02 | 32 min (espera o nível 12) |
| jumento | D13 (1ª) | 9 h 03 | 4 h 01 (espera o nível 14) |
| ovelhas, barril | D15 e D16 | 11 h 04 a 11 h 17 | 2 h (espera o nível 15; aprisco de 15 mil) |
| cavalo | D20 (1ª) | 14 h 18 | 3 h 01 (espera o nível 16; cavalo 15 mil e sela 4 mil) |
| irrigacao | D26 (1ª) | 18 h 50 | 4 h 32 (espera o nível 18) |

A ordem "pedras" antes de "baia-do-boi" é de propósito: com a baia antes, a obra do estábulo (e a limpeza em volta dela)
gastava as 5 pedras do começo, e a missão das pedras esperava o primeiro lote comprado (no regular, 42 min de jogo
parada, até o D2). As pedras ainda rendem 4 tábuas, que ajudam a pagar as 6 tábuas da baia.

## 3. Onde faltou o que fazer, e onde faltou ouro

Quase nunca. Tempo com o jogo aberto em que a personagem ficou sem tarefa e sem nada a tocar (agora):

| Perfil | Parada sem ter o que fazer | Com a meta da vez travada por ouro | Os motivos |
|---|---|---|---|
| Casual (10 h jogadas) | 6 min 24 s (1,1%) | 2 min 17 s | lavoura crescendo 2 min 39 s; o laticínio espera o nível 11 (2 min 21 s); ouro para o lote "Pasto do Fundo" (1 min) |
| Regular (22 h 30) | 9 min 06 s (0,7%) | 5 min 04 s | lavoura crescendo 3 min 34 s; cozinha, laticínio e curral esperam o nível (4 min 16 s no total); ouro para o lote (47 s) |
| Engajado (60 h) | 44 min 30 s (1,2%) | 12 min 09 s | o aspersor espera o nível 18 (18 min); lavoura crescendo 9 min 37 s; laticínio e curral esperam o nível; ouro para o lote |

Os trechos "sem ouro" são todos curtos (segundos a 1 minuto cada) e no começo. Nenhum perfil ficou travado por ouro ou
por falta do que fazer. O ouro no fim do dia fica baixo o mês todo no casual e no regular (o bot gasta o que sobra da
reserva da missão): ver a coluna "ouro" de `--resumo`.

## 4. Ouro, cash e tempo (30 dias, agora)

| | Casual | Regular | Engajado |
|---|---|---|---|
| Ouro ganho | 176 mil | 562 mil | 1,92 milhão |
| da banca | 77% | 83% | 90% |
| de pedido | 14% | 12% | 8% |
| de conquista, missão, nível, diária | 10% | 5% | 2% |
| Ouro gasto: loja (sementes, mudas, ferramentas, material) | 94 mil | 240 mil | 552 mil |
| obra / ampliação / lote / bicho | 31 / 19 / 18 / 11 mil | 36 / 126 / 116 / 37 mil | 43 / 514 / 316 / 49 mil |
| Cash ganho (guardado) | 127 | 162 | 192 |
| Lotes comprados | 4 | 7 | 9 |
| Lavoura no fim (casas plantadas) | 86 | 165 | 240 |
| Casas aradas com o boi / com a enxada | 2.412 / 1.279 | 5.377 / 2.905 | 17.037 / 7.207 |
| Idas ao poço por sessão | 6,1 | 6,9 | 8,0 |
| Pedidos entregues / trocados | 69 / 2 | 128 / 11 | 190 / 27 |
| Toques por minuto jogado | 37 | 34 | 34 |
| Tempo dela: andando, correndo, trabalhando, parada | 26, 33, 39, 2% | 35, 27, 36, 1% | 47, 15, 36, 2% |

Comparando com a conta do regular no `economia.md`: o ouro ganho em 30 dias é cerca de **79% do da conta** (562 mil
contra uns 713 mil; antes do boi no nível 4, o bot ganhava 402 mil) e o campo no D30 é **menos da metade** (165 casas
contra 371). A experiência fecha porque o
pedido dá muita experiência (81 mil, mais que a colheita, 74 mil). Com o boi, os toques por minuto caíram de 39 para
34 no regular. As idas ao poço não caem como a conta espera (a conta diz 0,3 por sessão do dia 15 em diante; o bot faz
cerca de 7): o bot comprou o barril (missão), mas só um aspersor. Metade do tempo dela é andando ou correndo.

Bichos (regular): 12 galinhas, 4 vacas, 3 ovelhas, gato, boi, jumento e cavalo; nenhum chegou ao fim da vida em 30 dias
(o engajado vendeu 12 galinhas ao fazendeiro). Receitas que mais saíram: tábua, garrafa de leite, fubá, manteiga, pamonha.

## 5. Defeitos e travas achados (do mais grave ao mais leve)

Nada travou o jogo para qualquer jogador: nenhum perfil quebrou com exceção, e todas as 38 missões foram cumpridas pelo
regular e pelo engajado. O que achei (a lista é da medida de antes; o item 0 é do começo humilde, já corrigido):

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

O regular, que é o perfil da curva, bate com a meta até o D3, fica 1 nível à frente no D7 e no D14 (a folga do boi) e
bate de novo no D30; o casual fica um pouco à frente; o engajado atrás por limite do bot. Por isso **não recomendo mexer
na curva de níveis nem nos preços agora.**
Só três ajustes pequenos (um de número, um de código, um da conta), para conferir no teste com gente:

| Arquivo | Campo | De → para | Por quê |
|---|---|---|---|
| `dados/missoes.json` | `galinhas`: `objetivo.n` | 2 → 4 | Com 4 galinhas os ninhos (3 ovos cada) dão os 12 ovos da dúzia numa volta só; com 2, são duas voltas, e os ovos do meio vão para a banca junto com a colheita (defeito 2). O bot enche o galinheiro por conta própria e mesmo assim a missão "embalar" levou 15 a 20 min de jogo (regular, casual). Confiança baixa: conferir no teste. |
| `src/nucleo/sistemas/arvores.js` (código, não número) | `podePlantarArvore` | não confere o caminho → confere "fecha-caminho" como a obra | Defeito 1: é o ajuste que mais evita susto. |
| `docs/jogo/economia.md` | tabela "O que a conta mostra" (campo, idas ao poço) | campo 371 e 0,3 ida ao poço no D15-30 → conferir | O jogo jogado de verdade chega a 165 casas e 7 idas por sessão; o ouro fica em 79% da conta.  A experiência fecha por causa dos pedidos. Vale rever a conta antes de mexer em preço. |

## 7. O que o bot joga e o que não joga

Joga: as 38 missões; lavoura (arar no campo antes da grama, `podeArar` com reserva, semear a cultura que mais rende por
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
aspersor; o celeiro ampliado; a casa reformada.
