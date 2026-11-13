# Materiais de construção: de onde vêm, quanto se pede e onde trava

Fibra, madeira, pedra, tábua e prego são o que as obras pedem; ração e as embalagens (cartela, garrafa, saco) entram
nas receitas. Este arquivo junta, para cada um, de onde ele vem e em que nível cada fonte abre, quanto o jogo pede até o
nível 16, onde o jogador fica preso e quanto tempo o jogador automático (`tools/bot.mjs`) espera entre "quer construir"
e "tem o material". Medido em 13/11/2026.

As fontes ficam nos dados, no próprio item (`itens.json` → `fontes` e `comoConseguir`). O `node tools/validar.mjs`
confere se cada material pedido tem fonte aberta até o nível do pedido e lista "Materiais com fontes". A lógica está em
`src/nucleo/fontes.js`, e o que o jogador vê está em `src/ui/fontes.js`. Os detalhes estão em `ARQUITETURA.md`, na seção
"Materiais: onde conseguir".

## 1. A tabela

Quantidades até o nível 16, somando cada obra uma vez: construção nova, ampliação e reforma.

| Material | De onde vem (nível em que abre) | Pedido nas obras até o nível 16 | Prêmios que dão |
|---|---|---|---|
| **Fibra** | roçar mato com a foice (nv 2; metade das moitas dá 1) · loja, Materiais, 6 de ouro (nv 2) · mimo do cachorro (nv 8) | 28: galinheiro 8 (nv 5), espantalho 10 (nv 6), galinheiro para 8 10 (nv 10) | missão "Arar com o boi" +8 (nv 4) **(novo)** |
| **Madeira** | cortar toco com o machado (nv 3; cada um dá 2) · loja, 14 de ouro (nv 3) · mimo do cachorro (nv 8) · árvore do mato com o machado de ferro (nv 10; dá 6) | 79: bancada 6 (nv 4), cerca e porteira 3 (nv 4), espantalho 2, curral 10 (nv 9), **reforma da cerca 24 (nv 9)**, lampião 2, curral para 4 16 (nv 14), aprisco 16 (nv 15). Mais 2 por tábua feita na bancada | presente do dia 5 +4 |
| **Pedra** | quebrar pedra com a picareta (nv 4; cada uma dá 2) · loja, 16 de ouro (nv 4) · mimo do cachorro (nv 8) | 81: caminho 1 (nv 4), reforma da casa 8 (nv 7), moinho 12 (nv 7), cozinha 16 (nv 8), laticínio 24 (nv 11), celeiro grande 20 (nv 13) | níveis 6 +5, 9 +6, 12 +8, 15 +9 · presente do dia 5 +4 · missão "Irrigação" +12 (nv 18) |
| **Tábua** | bancada de carpintaria: 2 madeiras = 1 tábua em 20 s, fila de 2 (nv 4) · loja, 36 de ouro (nv 4) | **319**: estábulo 6 (nv 4); banca 6, prateleira 4, baú 4, galinheiro 6 (nv 5); bancada de embalar 6 (nv 6); reforma da casa 12, moinho 10, banco 3 (nv 7); cozinha 12 (nv 8); celeiro de tábua 20, suporte 4, curral 20 (nv 9); varanda 30, galinheiro para 8 12 (nv 10); laticínio 20; celeiro grande 40, prateleira reforçada 10 (nv 13); curral para 4 24, segunda baia 16 (nv 14); aprisco 30 (nv 15); terceira baia 24 (nv 16) | missões "Pedras" +4 (nv 4), "Os ovos" +6 **(novo)**, "Prateleiras" +4 (nv 5), "Um companheiro" +8 **(novo)** (nv 8) · níveis 4 +4, 7 +5, 10 +7, 13 +8, 16 +10 · presente do dia 3 +3 |
| **Prego** | só a loja, 4 de ouro (nv 4) | **576**: estábulo 12 (nv 4); banca 10, prateleira 6, baú 4, galinheiro 10 (nv 5); bancada de embalar 8; reforma da casa 20, moinho 12, banco 6 (nv 7); cozinha 16; celeiro de tábua 40, suporte 8, curral 30, reforma da cerca 30 (nv 9); varanda 60, galinheiro para 8 20 (nv 10); laticínio 30; lampião 4; celeiro grande 80, prateleira reforçada 20 (nv 13); curral para 4 40, segunda baia 30 (nv 14); aprisco 40; terceira baia 40 (nv 16) | missões "A bancada de carpintaria" +30 (nv 4), "Prateleiras" +8 (nv 5), "Irrigação" +20 (nv 18) · níveis 4 +8, 7 +10, 10 +14, 13 +16, 16 +20 · presente do dia 1 +10 |
| **Adubo** (frente da área de plantio; números provisórios) | loja, Materiais (nv 3) · mimo do gato (nv 6, se entrar no sorteio dele) · prêmios | uma fileira de campo nova (6 casas) pede adubo, a partir do nível em que o campo pode crescer (`regras.json` → `campo`) | missões "Regador novo" e "Ampliar o campo" (nv 3) |
| **Ração** | moinho, com milho (nv 7) · loja, 18 de ouro (nv 4) | nas obras: nada; os bichos comem | missões "A baia do boi" +4, "Curral" +6, "Barril" +8 |
| **Cartela vazia** | loja, 6 de ouro (nv 6) | 1 por dúzia de ovos (nv 6) | missão "Embalar" +5 |
| **Garrafa vazia** | loja, 3 de ouro (nv 9) | 2 por garrafa de leite (nv 9) | nenhum |
| **Saco vazio** | loja, 8 de ouro (nv 12) | 1 por saca de feijão ou arroz (nv 12) | nenhum |

## 2. Onde trava

1. **Nível 5, tábua.** Do nível 4 ao 5 as missões pedem 22 tábuas: estábulo 6, banca 6, galinheiro 6 e prateleira 4.
   Antes, os prêmios davam 8 delas: "Pedras" +4 e nível 4 +4. As outras 14 eram 28 madeiras e quase 5 minutos de
   bancada (uma tábua a cada 20 s, fila de 2), ou 504 de ouro na loja, numa hora em que o ouro é curto. O jogador ainda
   não sabe que a bancada faz tábua sem ele estar perto: precisa deixar a fila cheia.
2. **Nível 5, fibra.** O galinheiro pede 8 fibras. A fibra vem do mato, mas só uma moita em duas dá fibra, e o jogador
   não sabe disso. Na loja ela custa pouco, mas ninguém dizia que estava lá.
3. **Pregos, sempre.** Prego só vem da loja, a partir do nível 4. Nada no jogo dizia isso. Quem procura no mato não
   acha. No bot, a espera por prego quase sempre era falta de ouro: ele já sabe onde comprar. Para a pessoa, o
   problema é saber onde comprar.
4. **Níveis 7 a 9: tábua e madeira em volume.** A reforma da casa, o moinho, a cozinha, o curral e a reforma da cerca
   pedem, juntos, 54 tábuas e 34 madeiras. Cada tábua leva 2 madeiras, então isso dá cerca de 140 madeiras, quase 70
   tocos. Os tocos da terra inicial acabam: os próximos estão no lote "Pasto do Fundo" (nv 5) e, com o machado de ferro,
   nas árvores do mato (nv 10).
5. **Bancada lenta fora do jogo.** A fila tem 2 vagas, e com o jogo fechado ela faz no máximo 2 tábuas. Quem joga 2
   sessões curtas por dia (casual) volta e tem só 2 tábuas.

## 3. O que mudou

Nada ficou mais difícil. Nenhum preço subiu, nenhuma fonte saiu e nenhum pedido aumentou.

**Prêmios de material na hora de usar** (`missoes.json`, só `recompensa`):

| Missão | Antes | Agora | Para quê, logo depois |
|---|---|---|---|
| "Arar com o boi" (nv 4) | 20 xp, 40 de ouro | + **8 fibras** | o galinheiro (8 fibras), a missão seguinte |
| "Os ovos" (nv 5) | 25 xp, 60 de ouro | + **6 tábuas** | reformar a banca (6 tábuas), a missão seguinte |
| "Um companheiro" (nv 8) | 40 xp, 2 cash | + **8 tábuas** | o curral (20 tábuas, nv 9) e a reforma da casa |

O prêmio grande de pregos já existia: "A bancada de carpintaria" dá +30. Ficou como estava.

**"Onde conseguir?"** em todo custo: catálogo de construir, reformas, ampliações (construção e abrigo), receitas da
indústria e cartão da missão da vez.
- A ficha do material que falta fica vermelha e diz "falta N". Tocar nela abre o cartão.
- Quando o que trava é material, o botão apagado (Construir, Reformar, Ampliar) vira "Onde conseguir?".
- O cartão mostra cada fonte numa frase de jogador, com um botão que leva até ela:
  - "Comprar" abre a loja na aba Materiais, e a oferta pisca;
  - "Mostrar" põe a seta no toco, na pedra, no mato ou no cachorro mais perto, e a câmera vai até lá;
  - "Abrir" abre a bancada;
  - "Terras" abre o lote à venda que ainda tem tocos;
  - "Missões" abre as missões;
  - "Abrir" no presente do dia abre o presente.
- A fonte que ainda não abriu aparece esmaecida, com o nível e um cadeado.

**Seu Tonho explica, uma vez por material** (`comoConseguir` em `itens.json`). Ele fala quando o jogador tenta e falta
material, ou quando a missão da vez pede um material que falta. Na missão, a fala vem uns segundos depois de o
jogador ler a missão. Exemplo: "Prego não sai do mato: compra-se na loja, em Materiais, e custa pouco. Missão e
presente do dia também dão uns punhados." A marca de "já explicou" fica gravada.

**Prêmio mostra para que serve.** Na tela de subir de nível, no presente do dia e no aviso da missão cumprida:
"+10 pregos: servem para o estábulo e montar a banca". Nenhuma missão nova foi criada: a que ensinaria era opcional,
e o Seu Tonho e o cartão já cobrem isso.

## 4. Medida do jogador automático (720 horas = 30 dias)

`npm run bot -- --horas 720 --perfil <perfil> --resumo`, em três versões:
- **antes**: o código de antes desta frente e da frente "ações por toque" (commit 2ecd24f);
- **base**: o código atual (5430dcc) sem os três prêmios novos;
- **agora**: o código atual com os três prêmios.

### Nível no fim do dia 1, 3, 7, 14 e 30

| Perfil | antes | base | agora |
|---|---|---|---|
| casual | 5 · 7 · 9 · 11 · 14 | 5 · 7 · 9 · 11 · 15 | 5 · 7 · 9 · 11 · 15 |
| regular (meta 6 · 8 · 11 · 14 · 19) | 6 · 8 · 11 · 14 · 19 | 6 · 8 · 11 · 14 · **18** | 6 · 8 · 11 · 14 · **18** |
| engajado | 8 · 11 · 15 · 19 · 23 | 8 · 12 · 15 · 19 · 23 | 8 · 11 · 15 · 19 · 23 |

O regular cai para 18 no dia 30 já na **base**, sem os prêmios. Isso veio da outra mudança no código: no dia 30 ele
tem 153.491 de xp, contra 172.417 antes, e o nível 19 pede 158.220. Os prêmios devolvem um pouco (156.869 de xp), mas
não chegam à linha. No código de antes, os mesmos prêmios deram exatamente 6 · 8 · 11 · 14 · 19.

### Espera de material (tempo jogado do "quer construir" ao "tem o material", soma dos 30 dias)

| Perfil | antes | base | agora | Maior espera, agora |
|---|---|---|---|---|
| casual | 32 min 00 s (36 h de relógio) | 1 h 24 min (96 h de relógio) | **10 min 54 s** (o mesmo de relógio) | curral, nv 9: 3 min 42 s |
| regular | 23 min 40 s (5,1 h de relógio) | 15 min 56 s (5,0 h de relógio) | **11 min 53 s** (o mesmo de relógio) | cozinha, nv 8: 4 min 36 s |
| engajado | 19 min 53 s | 27 min 47 s (3,1 h de relógio) | **17 min 46 s** | terceira baia, nv 16: 4 min 48 s |

"De relógio" conta também as horas com o jogo fechado. Antes, o casual ficou 24 horas sem montar uma prateleira por
falta de prego e 12 horas sem fazer o curral por falta de tábua. Agora nenhuma espera passa de 5 minutos, e nenhuma
atravessa uma noite.

O bot já sabe onde fica cada material. Por isso a parte que mais ajuda uma pessoa não aparece nestes números: o cartão
"Onde conseguir?" e a fala do Seu Tonho.
