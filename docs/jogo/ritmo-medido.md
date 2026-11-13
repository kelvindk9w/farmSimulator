# Ritmo medido pelo jogador automático

O `economia.md` diz o ritmo que a conta (o modelo de `tools/economia/ritmo.mjs`) espera. Este arquivo diz o ritmo que
**o jogo de verdade** dá: um jogador automático (`jogo/tools/bot.mjs`) joga sem tela, com os mesmos comandos do toque,
a mesma lógica e os mesmos dados de `dados/`, do nível 1 até onde o conteúdo vai.

Medido em 13/11/2026, com o código e os dados daquele dia. O bot é determinístico: a mesma linha de comando dá sempre
o mesmo resultado (até alguém mudar o jogo).

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

Tempo de máquina: 720 h do regular em cerca de 15 s; do engajado, cerca de 90 s.

## 1. Nível no fim do dia: medido e meta

Medido (bot) / meta do `economia.md` (conta).

| Dia | Casual | Regular | Engajado |
|---|---|---|---|
| 1ª sessão (15 min) | - | **4** / 4 | - |
| D1 | **5** / 5 | **6** / 6 | **8** / 7 |
| D3 | **7** / 6 | **8** / 8 | **11** / 11 |
| D7 | **9** / 8 | **11** / 11 | **15** / 16 |
| D14 | **11** / 11 | **14** / 14 | **19** / 20 |
| D30 | **15** / 13 | **18** / 19 | **23** / 26 |

Leitura:

- **O regular bate com a meta até o D14** e fica um nível abaixo no D30 (chega ao 18 no dia 30, na sessão das 20h).
- O **casual** anda um pouco **à frente** da conta (1 a 2 níveis): os pedidos rendem para ele mais do que a conta
  supõe (29,5 mil de experiência de pedido contra 20 mil de colheita em 30 dias).
- O **engajado** fica 1 a 3 níveis **atrás** do D7 em diante. Parte é do bot (ele não compra mais aspersores além do
  da missão e o campo dele cresce devagar: 193 casas no D30, a conta fala em cerca de 1.000); não dá para pôr isso na
  conta dos dados.

Missões do Seu Tonho cumpridas (36 no total): casual 32 no D30 (faltam ovelhas, barril, cavalo e irrigação);
regular **as 36 no D30** (a conta diz D25); engajado **as 36 no D12** (a conta diz D10).

## 2. Quando cada missão saiu (regular)

"Dia" é o dia do jogo (D1 começa às 7h30). "Jogado" é o tempo de jogo aberto até ali. "Espera" é quanto tempo de jogo
aberto a missão levou desde a anterior.

| Missão | Dia | Jogado | Espera |
|---|---|---|---|
| preparar-a-terra | D1 | 0:18 | - |
| plantar-alface | D1 | 1:32 | 1 min |
| agua-do-poco | D1 | 1:42 | - |
| regar | D1 | 2:30 | 1 min |
| primeira-colheita | D1 | 3:21 | 1 min |
| vender-na-banca | D1 | 3:45 | - |
| comprar-sementes | D1 | 3:46 | - |
| plantar-milho | D1 | 7:07 | 3 min |
| rocar-o-mato | D1 | 8:37 | 1 min |
| regador-novo | D1 | 8:52 | - |
| primeiro-pedido | D1 | 10:56 | 2 min |
| guardar-no-celeiro | D1 (2ª sessão) | 19:30 | 9 min |
| lenha, bancada-de-carpintaria, tabuas, pedras | D1 | 20 a 22 min | 0 a 2 min |
| galinheiro, galinhas, trato | D1 | 22 a 23 min | - |
| ovos, prateleira, terra-nova | D1 (3ª sessão) | 30 a 32 min | 7 min |
| embalar | D2 | 47 min | 15 min |
| bananal | D2 | 53 min | 6 min |
| moinho | D2 | 1 h 11 | 18 min |
| cozinha, companheiro | D3 | 1 h 55 | 44 min (espera o nível 8) |
| curral | D4 | 2 h 45 | 50 min |
| leite | D5 | 3 h 17 | 32 min |
| queijo | D8 | 5 h 15 | 2 h (espera o nível 11) |
| boi-de-arado | D12 | 8 h 45 | 3 h 30 (espera o nível 12; arar 30 casas com o boi) |
| jumento | D14 | 10 h 18 | 1 h 33 (espera o nível 14) |
| ovelhas, barril | D19 | 13 h 34 | 3 h 16 (espera o nível 15; aprisco de 15 mil) |
| cavalo | D24 | 17 h 20 | 3 h 45 (espera o nível 16; cavalo 15 mil e sela 4 mil) |
| irrigacao | D30 | 22 h 20 | 5 h (espera o nível 18) |

A primeira sessão do regular termina no **nível 4**, com 11 missões, como a conta prevê. A partir do D5 cada missão
espera um nível novo; entre uma e outra a fazenda segue trabalhando (lavoura, pedidos, bichos), não fica parada.

## 3. Onde faltou o que fazer, e onde faltou ouro

Quase nunca. Tempo com o jogo aberto em que a personagem ficou sem tarefa e sem nada a tocar:

| Perfil | Parada sem ter o que fazer | Com a meta da vez travada por ouro | Os motivos |
|---|---|---|---|
| Casual (10 h jogadas) | 3 min 50 s (0,6%) | 2 min 15 s | lavoura crescendo; ouro para o lote 1 (800) e o moinho (900); a cozinha espera o nível 8 |
| Regular (22 h 30) | 5 min 35 s (0,4%) | 1 min 44 s | lavoura crescendo 2 min 51 s; a cozinha espera o nível 8 (2 min); ouro para o laticínio |
| Engajado (60 h) | 14 min (0,4%) | 5 min 42 s | lavoura crescendo 4 min 36 s; aspersor espera o nível 18; ouro para curral e cozinha |

Os trechos "sem ouro" são todos curtos (segundos a 1 minuto cada) e no começo (dias 1 a 6). Nenhum perfil ficou
travado por ouro ou por falta do que fazer. O ouro no fim do dia fica baixo o mês todo no casual e no regular (o bot
gasta o que sobra da reserva da missão): ver a coluna "ouro" de `--resumo`.

## 4. Ouro, cash e tempo (30 dias)

| | Casual | Regular | Engajado |
|---|---|---|---|
| Ouro ganho | 151 mil | 402 mil | 1,60 milhão |
| da banca | 73% | 83% | 87% |
| de pedido | 16% | 11% | 10% |
| de conquista, missão, nível, diária | 11% | 7% | 3% |
| Ouro gasto: loja (sementes, mudas, ferramentas, material) | 69 mil | 192 mil | 471 mil |
| obra / ampliação / lote / bicho | 35 / 13 / 18 / 15 mil | 44 / 55 / 66 / 41 mil | 44 / 564 / 316 / 53 mil |
| Cash ganho (guardado) | 119 | 149 | 182 |
| Lotes comprados | 4 | 6 | 9 |
| Lavoura no fim (casas plantadas) | 71 | 148 | 192 |
| Idas ao poço por sessão | 6,1 | 7,1 | 7,9 |
| Pedidos entregues / trocados | 71 / 3 | 95 / 16 | 209 / 24 |
| Toques por minuto jogado | 42 | 39 | 38 |
| Tempo dela: andando, correndo, trabalhando, parada | 30, 30, 38, 2% | 34, 30, 35, 1% | 51, 15, 34, 1% |

Comparando com a conta do regular no `economia.md`: o ouro ganho em 30 dias é cerca de **60% do da conta** (402 mil
contra uns 654 mil) e o campo no D30 é **metade** (148 casas contra 326). A experiência fecha porque o pedido dá muita
experiência (51 mil, quase o mesmo que a colheita). As idas ao poço não caem como a conta espera (a conta diz 0,3 por
sessão do dia 15 em diante; o bot faz cerca de 7): o bot comprou o barril (missão), mas só um aspersor. Metade do tempo
dela é andando ou correndo.

Bichos (regular): 8 galinhas, 4 vacas, 3 ovelhas, gato, boi, jumento e cavalo; nenhum chegou ao fim da vida em 30 dias
(o engajado vendeu 12 galinhas ao fazendeiro). Receitas que mais saíram: tábua, fubá, manteiga, salada, garrafa de leite.

## 5. Defeitos e travas achados (do mais grave ao mais leve)

Nada travou o jogo para qualquer jogador: nenhum perfil quebrou com exceção, e todas as 36 missões foram cumpridas pelo
regular e pelo engajado. O que achei:

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

O regular, que é o perfil da curva, bate com a meta até o D14 e fica 1 nível abaixo no D30; o casual fica um pouco à
frente; o engajado atrás por limite do bot. Por isso **não recomendo mexer na curva de níveis nem nos preços agora.**
Só três ajustes pequenos (um de número, um de código, um da conta), para conferir no teste com gente:

| Arquivo | Campo | De → para | Por quê |
|---|---|---|---|
| `dados/missoes.json` | `galinhas`: `objetivo.n` | 2 → 4 | Com 4 galinhas os ninhos (3 ovos cada) dão os 12 ovos da dúzia numa volta só; com 2, são duas voltas, e os ovos do meio vão para a banca junto com a colheita (defeito 2). O bot enche o galinheiro por conta própria e mesmo assim a missão "embalar" levou 15 a 20 min de jogo (regular, casual). Confiança baixa: conferir no teste. |
| `src/nucleo/sistemas/arvores.js` (código, não número) | `podePlantarArvore` | não confere o caminho → confere "fecha-caminho" como a obra | Defeito 1: é o ajuste que mais evita susto. |
| `docs/jogo/economia.md` | tabela "O que a conta mostra" (campo, idas ao poço) | campo 326 e 0,3 ida ao poço no D15-30 → conferir | O jogo jogado de verdade chega a 148 casas e 7 idas por sessão; o ouro fica em 60% da conta. A experiência fecha por causa dos pedidos. Vale rever a conta antes de mexer em preço. |

## 7. O que o bot joga e o que não joga

Joga: as 36 missões; lavoura (arar no campo antes da grama, `podeArar` com reserva, semear a cultura que mais rende por
trabalho quando sobra terra, regar, colher, crescer o campo no fim da sessão para o tempo fora); ferramentas em escada e
conserto; lotes; limpar mato, toco, pedra e mata; pomar (bananeira, laranjeira, goiabeira); celeiro (guardar, pegar,
prateleiras montadas por dentro); todas as construções da lista; bichos de produção (comprar, tratar, recolher, fim da
vida ao fazendeiro, ampliar abrigo); indústrias (fila, retirar, receita encadeada, vaga de fila com ouro); pedidos
(entregar, trocar o impossível); presente do dia, conquistas, correio; boi no arado, jumento, cavalo, barril, gato
(afago e mimo).

Não joga (e por quê): aspersores além do da missão e ampliações do celeiro e da casa (o bot investe em prateleira e em
lote antes); o comando `fileira` (toca casa a casa; o resultado em tempo de jogo é o mesmo, só conta mais toques);
cosméticos, convite e compartilhar (não mudam o ritmo); nada que gaste cash.

Não verificado: o que acontece depois do nível 23 e do D30; ovelha, vaca e cavalo chegando ao fim da vida; mais de um
aspersor; o celeiro ampliado; a casa reformada.
