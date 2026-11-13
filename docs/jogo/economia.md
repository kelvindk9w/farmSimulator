# Economia e conteúdo do jogo

Este documento explica os números que estão em `jogo/dados/*.json`: o ritmo que se espera, de onde vem e para onde vai o ouro, o que o cash compra, como o trabalho braçal vai ficando mais leve e o que ainda é palpite. Onde este texto e o `PLANO.md` discordarem, vale o PLANO.

## 1. Como ler os números

Há quatro tipos de número aqui. Cada tabela diz de que tipo é.

| Tipo | O que é | Quanto confiar |
|---|---|---|
| **Dado** | Está nos JSON e o jogo lê | Conferido por máquina: `validar.mjs` (0 erros, 0 avisos), o validador do próprio jogo (`npm run validar`: "Dados em ordem") e os testes do jogo (`npm run testar`) |
| **Conta** | Sai de `jogo/tools/economia/ritmo.mjs`: um "jogador de planilha" que segue regras simples sobre os mesmos JSON | É estimativa. Serve para comparar um ajuste com outro, não para prometer um dia exato |
| **Medido** | O jogo de verdade jogado por um jogador automático ou por gente | O jogador automático (`npm run bot`, em `jogo/tools/bot/`) joga o jogo de verdade nos três perfis; os números estão em `ritmo-medido.md`. Gente jogando ainda não foi medida |
| **Chute** | Hipótese sem conta nem fonte | Lista na seção 11 |

Como rodar:

```
node jogo/tools/economia/validar.mjs              confere os dados (coerência, ciclos, preços, missões)
node jogo/tools/economia/ritmo.mjs --dias=120     imprime as tabelas de ritmo dos três perfis
node jogo/tools/economia/ritmo.mjs --perfil=regular --sem-rearar
node jogo/tools/economia/ritmo.mjs --calibrar           mostra a curva de níveis ajustada às metas
node jogo/tools/economia/ritmo.mjs --calibrar --gravar  grava a linha "xp" de niveis.json
```

Sempre que um preço, um tempo ou uma recompensa mudar, rode os dois. Se o ritmo sair das metas, rode a calibração: ela só mexe na curva de experiência, nunca nos preços.

### O que o modelo faz e o que não faz

O jogador de planilha entra nas sessões do perfil, e em cada uma: colhe o que está pronto, trata os bichos, colhe o pomar, tira e põe produtos nas filas, entrega pedidos, vende, compra o que o nível liberou (primeiro o que a missão pede) e planta a cultura que rende mais por segundo de trabalho dentro do tempo que falta. Cada ação gasta o tempo de `regras.acoes`; andar gasta a distância dividida pela velocidade. Só uma parte da sessão vira ação (o "aproveitamento"): o resto é olhar, ler e errar o toque.

O modelo **não** sabe: errar caminho, esquecer de regar, enfeitar a fazenda, parar para olhar. Também trata o mapa de forma simplificada (distâncias médias, não o desenho exato de cada fazenda). Por isso ele tende a ser **otimista**: gente de verdade deve andar um pouco mais devagar do que a conta.

## 2. Metas de ritmo

### Os três perfis (hipóteses)

| Perfil | Minutos por dia | Sessões | Aproveitamento |
|---|---|---|---|
| Casual | 20 | 2 de 10 min (8h e 20h) | 65% |
| Regular | 45 | 3 de 15 min (7h30, 12h30 e 20h) | 70% |
| Engajado | 120 | 6 de 20 min (das 7h às 22h) | 75% |

A curva de níveis foi ajustada para o **regular**. Os outros dois são consequência.

### Nível no fim do dia (conta)

| Dia | Meta do regular | Casual | Regular | Engajado |
|---|---|---|---|---|
| 1ª sessão (15 min) | 4 | - | 4 | - |
| D1 | 6 | 4 | 6 | 8 |
| D3 | 8 | 6 | 8 | 12 |
| D7 | 11 | 8 | 11 | 16 |
| D14 | 14 | 11 | 14 | 20 |
| D30 | 19 | 13 | 19 | 26 |
| D60 | 23 | 18 | 23 | 34 |
| D90 | 26 | 20 | 26 | 43 |
| D120 | - | 21 | 29 | 50 |

Com o começo humilde (campo de 12 casas, miolo limpo maior, boi no nível 4) a conta continua nas metas do regular. Para isso ela aprendeu três coisas: a beirada com mato, pedra e toco é contada casa por casa, como o jogo faz (a conta velha tirava 32 casas fixas e, com o miolo limpo maior, achava só 7 obstáculos em vez de uns 25); o bicho dado de presente por missão entra na fazenda (sem isso o boi velho nunca chegava e a missão de arar com o boi travava até o nível 12); e a madeira da tábua é comprada quando a terra não dá mais. O casual fecha o D1 no nível 4, a 3 pontos de experiência do 5 (417 de 420); o jogo medido dá 5 (`ritmo-medido.md`).

O que cada marco quer dizer para o regular:

- **Fim da 1ª sessão (nível 4):** plantou alface e milho, vendeu, entregou um pedido, comprou o regador de lata e o cesto grande, limpou mato e tocos (a madeira da bancada de carpintaria). Falta pouco para o nível 5 (362 de 420 de experiência), que abre o galinheiro: é o motivo para voltar.
- **D1 (nível 6):** o boi velho do Seu Tonho (nível 4, na segunda sessão: bancada de carpintaria, tábuas, pedras, a baia barata do estábulo e a primeira fileira arada com ele, uns 12 minutos depois de entrar), galinheiro com galinhas, tomate, bancada de embalar, regador grande. O primeiro lote fica para o dia 2.
- **D7 (nível 11):** moinho, cozinha, curral com vacas, bananal, três lotes, regador de crivo. O laticínio e o arroz acabaram de abrir.
- **D30 (nível 19):** arado de ferro, jumento com carroça e barril, cavalo, ovelhas, os primeiros aspersores, seis lotes. Faltam as quatro últimas receitas.
- **D90 (nível 26):** todo o conteúdo desta versão foi visto (ele vai até o nível 25). Sobram as compras mais caras: os dois últimos lotes e a casa-grande.

Dia em que cada perfil chega ao nível (conta; "~" é projeção):

| Nível | Casual | Regular | Engajado |
|---|---|---|---|
| 5 | 2 | 1 | 1 |
| 10 | 11 | 6 | 2 |
| 15 | 39 | 16 | 6 |
| 20 | 82 | 33 | 13 |
| 25 | ~219 | 72 | 26 |
| 30 | ~408 | ~124 | 44 |
| 50 | ~1.208 | ~350 | 118 |

### A primeira sessão, minuto a minuto (conta, regular)

| Minuto | O que acontece |
|---|---|
| 0:00 a 1:27 | Ara a primeira fileira do campo pequeno (6 casas, com a enxada que trouxe), planta a alface que ganhou, pega o regador velho no chão ao lado do poço, enche e rega (quatro missões curtas do Seu Tonho) |
| 3:16 | Primeira colheita; **nível 2** |
| 4:39 a 5:06 | Vende na banca e compra sementes (milho liberado no nível 2) |
| ~8:26 | Colhe o milho; **níveis 3 e 4** quase juntos (o modelo carimba os dois no fim da colheita; no jogo o 3 vem no meio dela) |
| 8:33 | **Primeira melhoria:** regador de lata (45 de ouro, o dobro de água). Em seguida o cesto grande (90) |
| 8:59 | Roça o mato com a foice que ganhou |
| 10:45 | Entrega o primeiro pedido do quadro |
| 12:09 a 13:02 | Guarda no celeiro, corta tocos (a madeira da bancada de carpintaria, que ela monta no começo da sessão seguinte) |
| 15:00 | Termina no nível 4, com 393 de ouro e 362 de 420 de experiência |

Os níveis 2, 3 e 4 têm experiência fixada à mão (20, 60 e 130) para que isso aconteça seja qual for o resto da curva. Sempre há algo para fazer agora (alface de 1 minuto, mato para roçar) e algo para esperar (milho de 3 minutos, depois feijão de 8, pedido que renova em 20 minutos, galinha que bota a cada 20).

## 3. De onde vem e para onde vai o ouro

### Ouro por dia do perfil regular (conta, média de cada faixa)

| Dias | Ganha por dia | Gasta por dia | Saldo no fim | Nível |
|---|---|---|---|---|
| 1 | 3.358 | 3.154 | 224 | 6 |
| 2 a 3 | 5.651 | 5.321 | 884 | 8 |
| 4 a 7 | 11.960 | 12.125 | 225 | 11 |
| 8 a 14 | 17.820 | 17.447 | 2.836 | 14 |
| 15 a 30 | 32.859 | 32.248 | 12.612 | 19 |
| 31 a 60 | 43.794 | 36.712 | 225.083 | 23 |
| 61 a 90 | 45.009 | 33.305 | 576.188 | 26 |
| 91 a 120 | 42.215 | 31.033 | 911.643 | 29 |

Leitura: até o dia 30 o jogador gasta quase tudo o que ganha e nunca fica parado sem ter o que comprar nem com ouro sobrando. Do dia 31 em diante o saldo cresce, porque as compras que restam são caras e espaçadas. **Depois do dia 90 o conteúdo acaba e o ouro passa a sobrar**: é a primeira coisa a resolver com conteúdo novo (seção 12).

Casual: ganha de 854 por dia (D1) a cerca de 8.500 (do dia 61 em diante); o saldo fica sempre curto (55 mil no D120) e ele ainda não comprou os lotes do fim. Engajado: 13.231 no D1 e cerca de 155 mil por dia do dia 15 em diante; termina o conteúdo perto do dia 26 a 30 e chega ao D120 com 10,5 milhões parados.

### Fontes (regular, 120 dias, conta)

| Fonte | Parte |
|---|---|
| Banca (venda a preço fixo) | 91% |
| Pedidos (valor de banca do que foi entregue) | 5% |
| Conquistas | 2% |
| Pedidos (bônus de 25%) | 1% |
| Diária, níveis, missões e compartilhar | menos de 1% cada |

Para o casual a banca pesa 76% e os pedidos 17%: quem joga pouco depende mais do pedido.

A banca compra tudo, sempre, pelo preço base. Não há oferta e procura, de propósito: o jogador nunca fica com produto encalhado nem precisa adivinhar preço.

### Destinos (regular, 120 dias, conta)

| Destino | Parte |
|---|---|
| Sementes | 24% |
| Terras (lotes) | 20% |
| Vagas de fila das indústrias | 17% |
| Ampliações (celeiro e abrigos) | 15% |
| Reforma da casa (até a casa-grande, no dia 118) | 13% |
| Ferramentas | 2% |
| Irrigação (aspersores) | 2% |
| Ração comprada | 2% |
| Animais | 2% |
| Construções, materiais, troca de animais | 1% cada |
| Mudas, enfeites, consertos, móveis, embalagens | menos de 1% cada |

Quanto custa ter tudo (dado): lotes 1.136.300; vagas de fila 640.000; ampliações do celeiro e dos abrigos 555.500; casa 488.000; 30 aspersores 150.000; ferramentas cerca de 85 mil; animais e construções cerca de 95 mil. Soma perto de **3,15 milhões de ouro**, fora sementes e ração.

### Regras de formação de preço

| Coisa | Regra |
|---|---|
| Colheita | Valor bruto de uma casa ≈ 4 × (minutos)^0,58. Cultura demorada rende mais por casa e menos por hora |
| Semente | 25% do valor bruto da casa |
| Arroz, cana, mandioca | Ficam abaixo da regra de propósito (51, 80 e 116 por casa em vez de 54, 96 e 144): valem pelas receitas, não pela banca |
| Receita | Venda = (1,25 × insumos a preço de banca + 6 × minutos^0,6) ÷ unidades. Toda receita vale mais que vender os insumos soltos |
| Experiência da receita | 3 × raiz dos minutos |
| Pedido | Valor-alvo = 8 × nível^1,6 (de 75% a 125% disso). Paga o valor de banca mais 25% e dá 1,2 de experiência por ouro pago |
| Espera do pedido | 15 min + 2,5 min por nível, por vaga, depois de entregar. Não se pula com cash |
| Recompensa de nível | Ouro = 60% do valor de um pedido daquele nível; um pouco de cash; material de obra a cada três níveis |
| Conserto | 30% do preço da ferramenta. A ferramenta gasta não quebra: rende um terço a menos até o conserto |
| Lote | De 800 (nível 5) a 380.000 (nível 30); cada um custa perto de 1,5 a 3 vezes o anterior |
| Concluir relógio | cash = teto(0,28 × minutos^0,7): 5 min = 1; 1 h = 5; 6 h = 18; 24 h = 46. Até 30 s é de graça |

### Experiência

De onde vem a experiência em 120 dias (conta):

| Fonte | Casual | Regular | Engajado |
|---|---|---|---|
| Colheita | 17% | 46% | 65% |
| Pedidos | 56% | 34% | 24% |
| Animais | 10% | 7% | 4% |
| Receitas | 6% | 4% | 3% |
| Pomar | 7% | 3% | 2% |
| Terras compradas | 2% | 4% | 2% |
| Construções e missões | 1% a 2% | 2% | 1% |

Arar, semear, regar, tratar e construir não dão experiência: ela vem do resultado (colher, recolher, produzir, entregar). O pedido é o que segura o casual no jogo: cada vaga rende um pedido por visita, então **voltar vale mais do que ficar muito tempo**.

## 4. Política do cash

Regras (dado, em `loja.json` e `regras.json`):

- **Compra:** concluir relógio (obra, fila de indústria e muda crescendo), roupas e enfeites, três animais de estimação especiais e vagas de fila.
- **Não compra, nunca:** ouro, produção, semente, ferramenta melhor, conserto, espaço, fôlego, espera de pedido, tempo de cultura ou de animal.
- **Nada útil é só de cash.** A vaga de fila tem dois preços, ouro e cash, na mesma tela. O cão boiadeiro e o gato siamês fazem o mesmo que o cachorro e o gato de ouro. O cavalo mangalarga anda igual ao cavalo comum e pede o mesmo nível, estábulo e sela.
- **Nenhuma missão manda gastar cash** (o validador recusa a missão que pedir algo que só se vende por cash).
- Sem sorteio pago, sem anúncio forçado. Na versão de teste a compra é simulada e avisada na tela.
- 10 cash = R$ 1. Pacotes de 70 cash (R$ 6,90) a 1.700 cash (R$ 129,90).

### Cash grátis (conta, 120 dias, sem convite; todos começam com 10)

| Fonte | Casual | Regular | Engajado |
|---|---|---|---|
| Conquistas | 124 | 195 | 230 |
| Diária | 119 | 119 | 119 |
| Níveis | 32 | 50 | 106 |
| Missões | 12 | 12 | 12 |
| **Total** | **287** | **376** | **467** |
| Por dia | 2,4 | 3,1 | 3,9 |
| Nos 30 primeiros dias | 119 | 172 | 247 |

Para ter ideia do que os 376 cash do regular compram: as terceiras e quartas vagas de fila das cinco indústrias (225) e mais um chapéu de couro (80); ou o vestido de chita (150) e a roupa de festa junina (200); ou 74 obras de 1 hora concluídas na hora (5 cada). Todas as 15 vagas de fila custam 525 cash ou 640.000 de ouro. Todos os cosméticos de cash somam 1.610; os três animais especiais, 950. Quem não paga nada leva, em quatro meses, dois cosméticos ou um bom tanto de pressa: aparece, mas não resolve o jogo.

Convite (ligado nos dados): quando o amigo chega ao nível 5, quem convidou ganha 10 cash e 50 de ouro por nível; o amigo ganha 5 cash, 6 tábuas e 12 pregos. Limite de 10 amigos (100 cash no total). Compartilhar: 10 de ouro por nível, uma vez por dia, só ouro, com a chave `ligado` para desligar onde a loja proibir.

## 5. Como a automação entra

A ideia: o campo cresce, o trabalho por casa cai. **Dobrar o campo não pode dobrar os toques nem as idas ao poço.** Cada degrau libera antes de o campo cansar.

### A escada da rega (dado)

| Degrau | Nível | Preço | O que faz | Regular compra no dia |
|---|---|---|---|---|
| Regador velho | 1 | presente | 4 regas por enchida | - |
| Regador de lata | 3 | 45 | 8 regas | 1 (aos 8 min) |
| Regador grande | 6 | 350 | 16 regas | 1 |
| Regador de crivo | 9 | 1.500 | 16 regas, cada uma molha 3 casas em linha | 4 |
| Regador de cobre | 14 | 9.000 | 20 regas, cada uma molha 5 casas | 14 |
| Barril na carroça do jumento | 15 | 5.000 (mais jumento 8.000 e carroça 6.000) | 400 regas ao lado do campo: enche o regador sem voltar ao poço | 16 |
| Aspersor | 18 | 5.000 cada, até 30 | Rega sozinho as 24 casas em volta | 25 em diante |

### O que a conta mostra (regular, por sessão de 15 min)

| Dias | Campo (casas) | Casas colhidas | Toques | Toques por casa colhida | Idas ao poço |
|---|---|---|---|---|---|
| 1 | 80 | 70 | 432 | 6,2 | 18,3 |
| 2 a 3 | 129 | 68 | 404 | 5,9 | 11,8 |
| 4 a 7 | 193 | 94 | 370 | 3,9 | 5,0 |
| 8 a 14 | 190 | 97 | 357 | 3,7 | 3,3 |
| 15 a 30 | 371 | 116 | 382 | 3,3 | 0,3 |
| 31 em diante | ~330 | ~128 | ~395 | 3,1 | 0 |

O campo cresce mais de quatro vezes, os toques por sessão caem um pouco e as idas ao poço vão de 18 para zero. "Toque" aqui é cada ação; arrastar o dedo para pintar várias casas conta como vários toques, então na mão o número sentido é menor. O engajado chega a cerca de 1.060 casas com 2,7 toques por casa.

O ponto mais pesado é o **primeiro dia**: 18 idas ao poço por sessão com o regador velho e o de lata. O regador grande (nível 6, ainda no dia 1) corta isso; vale olhar com cuidado no teste com gente.

### Os outros alívios (dado)

| O quê | Nível | O que alivia |
|---|---|---|
| Cesto grande, balaio, carrinho de mão | 4, 9, 13 | Leva 24, 40 e 70 em vez de 12: menos idas à banca e ao celeiro |
| Enxada de ferro e de aço | 7, 13 | Ara em 75% e 55% do tempo |
| Foice de ferro e de aço | 8, 16 | Roça 3 e 5 casas por toque |
| Cinto de couro e de ofício | 7, 15 | 3 e 4 ferramentas à mão: menos idas ao celeiro para trocar |
| Boi com arado | 4 (o do Seu Tonho, presente); outro, 12 | Ara a fileira inteira de uma passada, para o lado com mais casas: até 6 com o arado simples, 10 com o de ferro (nível 12). A passada leva 2,5 s, com 6 casas ou com 10 (0,4 s por casa ou menos, contra 1,1 s da enxada velha), e é um toque só |
| Matraca | 14 | Semeia na metade do tempo |
| Caixa de ovos grande, latão de leite | 14, 15 | 36 ovos e 6 leites por viagem |
| Jumento com carroça | 14 | Leva 150 coisas e acompanha a personagem |
| Cavalo com sela | 16 | Anda a 7 casas por segundo sem gastar fôlego |
| Vagas de fila (3ª, 4ª e 5ª) | 10 a 24 | A indústria trabalha mais tempo sem visita |

Fôlego (dado): 10 s de corrida; enche em 5 s andando ou 3 s parada; sem fôlego ela só volta ao andar normal; nenhuma tarefa da fazenda gasta fôlego e ele nunca é vendido. O validador avisa se alguém deixar a recuperação andando acima de 8 s.

Para onde vai o tempo de ação (conta, 120 dias): lavoura 54%, animais 24%, pomar 11%, indústrias 9% no regular. No casual a lavoura cai para 36% e animais e pomar sobem (30% e 20%): quem joga pouco vive mais do que produz sozinho.

## 6. Tabelas resumidas (dado)

### Culturas

| Cultura | Nível | Tempo | Regas | Rende | Venda (un.) | Semente | Lucro por casa | Experiência |
|---|---|---|---|---|---|---|---|---|
| Alface | 1 | 1 min | 1 | 1 | 4 | 1 | 3 | 1 |
| Milho | 2 | 3 min | 1 | 2 | 4 | 2 | 6 | 2 |
| Feijão | 4 | 8 min | 2 | 2 | 7 | 4 | 10 | 3 |
| Tomate | 6 | 20 min | 3 | 3 | 8 | 6 | 18 | 4 |
| Abóbora | 8 | 45 min | 2 | 1 | 40 | 10 | 30 | 6 |
| Arroz | 11 | 1 h 30 | 2 | 3 | 17 | 13 | 38 | 8 |
| Cana-de-açúcar | 13 | 4 h | 2 | 2 | 40 | 20 | 60 | 12 |
| Mandioca | 17 | 8 h | 1 | 2 | 58 | 29 | 87 | 16 |

A planta sem água não morre: espera. Depois de colher, a casa volta a pedir enxada (ou boi).

### Árvores

| Árvore | Nível | Muda | Cresce em | Safra a cada | Rende | Venda (un.) | Experiência |
|---|---|---|---|---|---|---|---|
| Bananeira | 7 | 150 | 4 h | 2 h | 3 | 6 | 4 |
| Laranjeira | 10 | 600 | 12 h | 4 h | 3 | 14 | 7 |
| Goiabeira | 16 | 1.500 | 24 h | 6 h | 3 | 20 | 10 |

A árvore não pede rega nem replantio. A safra pronta espera no pé (guarda uma).

### Animais

| Animal | Nível | Preço | Abrigo (vagas) | Come por ciclo | Dá | Ciclo | Venda |
|---|---|---|---|---|---|---|---|
| Galinha | 5 | 80 | Galinheiro (4, 8, 12) | 1 milho | 1 ovo | 20 min | 18 |
| Vaca | 9 | 900 | Curral (2, 4, 6) | 1 ração | 1 leite | 1 h | 60 |
| Ovelha | 15 | 3.000 | Aprisco (3, 6, 9) | 1 ração | 1 lã | 4 h | 110 |
| Boi de arado | 4 (presente da missão "baia-do-boi"); 12 na loja | 4.000 | Estábulo (1, 2, 3) | 1 ração a cada 6 h | Ara a fileira: até 6 casas (arado simples) ou 10 (de ferro); sem trato, 3 | - | - |
| Jumento | 14 | 8.000 | Estábulo | 1 ração a cada 8 h | Puxa a carroça (150 coisas) e o barril | - | - |
| Cavalo | 16 | 15.000 | Estábulo | 1 ração a cada 6 h | Montaria sem fôlego | - | - |
| Gato | 6 | 600 | - | - | Um mimo por dia (sementes) | - | - |
| Cachorro caramelo | 8 | 900 | - | - | Um mimo por dia (fibra, madeira ou pedra) | - | - |
| Gato siamês, cão boiadeiro | - | 200 e 250 cash | - | - | O mesmo mimo dos comuns | - | - |
| Cavalo mangalarga | 16 | 500 cash | Estábulo | 1 ração a cada 6 h | O mesmo do cavalo comum | - | - |

Sem comida ou sem água o animal rende a metade; nenhum morre. A ração se compra (18) ou se faz no moinho (3 milhos dão 2). Galinha, vaca e ovelha têm vida produtiva (300 ovos, 400 ordenhas, 200 tosquias); no fim o jogador vende o animal (por 30% a 45% do preço) e compra outro.

### Indústrias e abrigos

| Construção | Nível | Ouro | Material | Obra | Vagas de fila (nível: ouro ou cash) |
|---|---|---|---|---|---|
| Bancada de carpintaria | 4 | 120 | 6 madeiras | 20 s | 10: 1.000 ou 15; 15: 8.000 ou 30; 20: 40.000 ou 60 |
| Bancada de embalar | 6 | 300 | 6 tábuas, 8 pregos | 1 min | 11: 1.500 ou 15; 16: 10.000 ou 30; 21: 50.000 ou 60 |
| Moinho | 7 | 900 | 10 tábuas, 12 pedras, 12 pregos | 5 min | 12: 3.000 ou 15; 17: 20.000 ou 30; 22: 80.000 ou 60 |
| Cozinha | 8 | 1.500 | 12 tábuas, 16 pedras, 16 pregos | 10 min | 13: 4.500 ou 15; 18: 30.000 ou 30; 23: 120.000 ou 60 |
| Laticínio | 11 | 8.000 | 20 tábuas, 24 pedras, 30 pregos | 1 h | 16: 12.000 ou 15; 20: 60.000 ou 30; 24: 200.000 ou 60 |

| Construção | Nível | Ouro | Obra | Ampliações (nível: ouro) |
|---|---|---|---|---|
| Galinheiro | 5 | 250 | 1 min | 10: 2.500; 17: 20.000 |
| Curral | 9 | 2.200 | 20 min | 14: 10.000; 21: 60.000 |
| Estábulo | 4 (uma baia: 150, 6 tábuas e 12 pregos) | 150 | 1 min 30 s | 14: 6.000; 16: 15.000 |
| Aprisco | 15 | 15.000 | 2 h | 20: 50.000; 24: 120.000 |
| Celeiro | já vem | - | - | 9: 2.000; 13: 10.000; 19: 60.000; 25: 200.000 |
| Casa (só por gosto) | já vem | - | - | 10: 8.000; 18: 80.000; 26: 400.000 |
| Aspersor | 18 | 5.000 | 5 min | até 30 |

Toda indústria começa com 2 vagas de fila e chega a 5. O jogador cancela e reordena a fila; receita que não começou devolve os ingredientes.

Armazém (não é trava): a prateleira simples guarda 60 produtos e custa 60 de ouro, 4 tábuas e 6 pregos (nível 5); a reforçada guarda 150 (nível 13); o baú guarda 300 materiais de obra; o suporte guarda ferramentas. Produto, material e ferramenta não disputam o mesmo lugar. Não há limite por dia para montar móvel nem para ampliar. Mudar construção de lugar é grátis. Cerca (15) e caminho de pedra (10) têm preço fixo: a centésima custa o mesmo que a primeira.

### Receitas

| Produto | Onde | Nível | Entra | Tempo | Sai | Venda (un.) | Ganho sobre os insumos |
|---|---|---|---|---|---|---|---|
| Tábua | Carpintaria | 4 | 2 madeiras | 20 s | 1 | 10 | +2 |
| Dúzia de ovos | Embalar | 6 | 12 ovos, 1 cartela | 20 s | 1 | 255 | +33 |
| Garrafa de leite | Embalar | 9 | 1 leite, 2 garrafas vazias | 20 s | 2 | 38 | +10 |
| Saca de feijão | Embalar | 12 | 10 feijões, 1 saco | 30 s | 1 | 90 | +12 |
| Saca de arroz | Embalar | 12 | 10 arrozes, 1 saco | 30 s | 1 | 225 | +47 |
| Fardo de lã | Embalar | 15 | 4 lãs, 2 fibras | 1 min | 1 | 520 | +76 |
| Fubá | Moinho | 7 | 3 milhos | 2 min | 1 | 24 | +12 |
| Ração | Moinho | 7 | 3 milhos | 2 min | 2 | (compra: 18) | poupa 24 de ouro |
| Farinha de mandioca | Moinho | 17 | 2 mandiocas | 20 min | 1 | 180 | +64 |
| Polvilho | Moinho | 18 | 3 mandiocas | 30 min | 1 | 265 | +91 |
| Manteiga | Laticínio | 11 | 2 leites | 20 min | 1 | 185 | +65 |
| Queijo minas | Laticínio | 11 | 2 leites | 30 min | 1 | 195 | +75 |
| Doce de leite | Laticínio | 18 | 2 leites, 1 açúcar mascavo | 1 h | 1 | 445 | +145 |
| Salada | Cozinha | 8 | 2 alfaces, 1 tomate | 1 min | 1 | 26 | +10 |
| Bolo de fubá | Cozinha | 8 | 2 fubás, 2 ovos | 10 min | 1 | 130 | +46 |
| Molho de tomate | Cozinha | 9 | 4 tomates | 8 min | 1 | 60 | +28 |
| Arroz com feijão | Cozinha | 12 | 2 arrozes, 2 feijões | 12 min | 1 | 85 | +37 |
| Pamonha | Cozinha | 12 | 4 milhos, 1 leite | 15 min | 2 | 62 | +48 |
| Açúcar mascavo | Cozinha | 14 | 3 canas | 15 min | 1 | 180 | +60 |
| Doce de abóbora | Cozinha | 14 | 2 abóboras, 1 açúcar mascavo | 40 min | 2 | 190 | +120 |
| Suco de laranja | Cozinha | 16 | 4 laranjas | 5 min | 1 | 85 | +29 |
| Bolo de banana | Cozinha | 19 | 3 bananas, 1 ovo, 1 fubá | 20 min | 1 | 110 | +50 |
| Goiabada | Cozinha | 20 | 4 goiabas, 1 açúcar mascavo | 45 min | 1 | 385 | +125 |
| Pão de queijo | Cozinha | 20 | 1 polvilho, 1 queijo, 2 ovos | 30 min | 3 | 220 | +164 |
| Feijão tropeiro | Cozinha | 21 | 3 feijões, 1 farinha, 2 ovos | 20 min | 2 | 165 | +93 |
| Romeu e Julieta | Cozinha | 23 | 1 goiabada, 1 queijo | 10 min | 2 | 375 | +170 |

"Ganho sobre os insumos" é quanto a fornada vale a mais do que vender os ingredientes soltos na banca. Material comprado: fibra 6, madeira 14, pedra 16, tábua 36, prego 4, cartela 6, garrafa vazia 3, saco 8. Quem limpa a terra ganha fibra, madeira e pedra de graça.

### Lotes

| Lote | Nível | Preço | Casas | Experiência |
|---|---|---|---|---|
| Sítio do começo | 1 | - | 256 | - |
| Pasto do Fundo | 5 | 800 | 224 | 40 |
| Capoeira | 8 | 2.500 | 160 | 125 |
| Pedregal | 10 | 5.000 | 160 | 250 |
| Baixada | 12 | 10.000 | 140 | 500 |
| Roça Velha | 14 | 18.000 | 140 | 900 |
| Beira da Estrada | 16 | 30.000 | 160 | 1.500 |
| Várzea | 18 | 50.000 | 160 | 2.500 |
| Morro do Ipê | 20 | 80.000 | 224 | 4.000 |
| Grota | 22 | 120.000 | 140 | 6.000 |
| Capão | 24 | 180.000 | 140 | 9.000 |
| Chapada | 27 | 260.000 | 280 | 13.000 |
| Mata do Ribeirão | 30 | 380.000 | 280 | 19.000 |

Cada lote pede o anterior. Cada um vem com a sua mistura de mato (foice), toco (machado), pedra (picareta) e, em quase todos do segundo em diante, um pouco de árvore do mato, que só sai com machado de ferro (nível 10) e dá 6 madeiras.

### Ferramentas de limpar e de carregar

| Função | Degraus (nível: preço) |
|---|---|
| Enxada | velha (presente); ferro (7: 300); aço (13: 4.000) |
| Foice | velha (presente, nível 2); ferro (8: 500); aço (16: 8.000) |
| Machado | velho (presente, nível 3); ferro (10: 900); aço (17: 10.000) |
| Picareta | velha (presente, nível 4); ferro (11: 1.100); aço (18: 12.000) |
| Cesto | palha, 12 (presente); grande, 24 (4: 90); balaio, 40 (9: 900); carrinho de mão, 70 (13: 5.000) |
| Cinto | 2 ferramentas (começo); couro, 3 (7: 400); ofício, 4 (15: 6.000) |
| Ovos e leite | caixa de ovos, 12 (presente da missão; 40); caixa grande, 36 (14: 1.500); balde, 2 (presente da missão; 150); latão, 6 (15: 4.000) |
| Outros | arado simples (vem com o boi, nível 4; na loja, 1.500); arado de ferro (12: 3.000); matraca (14: 3.000); carroça (14: 6.000); barril (15: 5.000); tesoura de tosquia (15: 400); sela (16: 4.000) |

Ferramenta que a missão pede vem de presente na missão anterior: ninguém é mandado comprar a primeira foice. Os degraus de ferro gastam com o uso e pedem conserto (30% do preço); os de aço e os presentes não gastam nunca.

### Níveis

| Nível | Experiência total | Do degrau | Ouro | Cash | O que libera de principal |
|---|---|---|---|---|---|
| 2 | 20 | 20 | 15 | 1 | Milho, foice |
| 3 | 60 | 40 | 28 | - | Regador de lata, pedidos, machado |
| 4 | 130 | 70 | 44 | 1 | Feijão, cesto grande, carpintaria, picareta, estábulo de uma baia e o boi do Seu Tonho |
| 5 | 420 | 290 | 63 | 5 | Galinheiro, 1º lote, prateleira |
| 6 | 1.320 | 900 | 84 | 1 | Tomate, regador grande, embalar, gato |
| 7 | 2.530 | 1.210 | 110 | - | Bananeira, moinho, enxada de ferro, cinto |
| 8 | 4.840 | 2.310 | 130 | 1 | Abóbora, cozinha, 2º lote, cachorro |
| 9 | 7.440 | 2.600 | 160 | - | Curral e vaca, regador de crivo, balaio |
| 10 | 11.440 | 4.000 | 190 | 5 | Laranjeira, 3º lote, machado de ferro |
| 11 | 17.610 | 6.170 | 220 | - | Arroz, laticínio |
| 12 | 24.000 | 6.390 | 260 | 2 | Outro boi, arado de ferro, 4º lote |
| 13 | 32.720 | 8.720 | 290 | - | Cana, enxada de aço, carrinho de mão |
| 14 | 44.620 | 11.900 | 330 | 2 | Jumento, carroça, regador de cobre, matraca, 5º lote |
| 15 | 57.520 | 12.900 | 370 | 5 | Ovelha, aprisco, barril |
| 16 | 74.120 | 16.600 | 410 | 2 | Cavalo, goiabeira, 6º lote |
| 17 | 95.420 | 21.300 | 450 | - | Mandioca |
| 18 | 122.820 | 27.400 | 490 | 2 | Aspersor, doce de leite, 7º lote |
| 20 | 203.720 | 45.500 | 580 | 5 | Pão de queijo, goiabada, 8º lote, 6ª vaga de pedidos |
| 23 | 423.420 | 85.700 | 720 | - | Romeu e Julieta (última receita) |
| 25 | 596.320 | 87.200 | 830 | 10 | Galpão (fim do conteúdo desta versão) |
| 30 | 1.112.320 | 104.000 | 1.100 | 5 | Último lote |
| 50 | 3.294.320 | 114.000 | - | - | - |

A lista completa de "o que cada nível libera" sai do `validar.mjs`. O nível também dá material de obra (tábua e prego, ou pedra) a cada três níveis e um lenço de chita no nível 10. A curva vai até o nível 60; do 26 em diante cada nível custa de 102 mil a 119 mil de experiência (para o regular, cerca de um nível a cada 10 a 12 dias).

### Missões, conquistas e diária

- **Missões do Seu Tonho:** 38, do nível 1 ao 18, uma mecânica por vez. As sete primeiras cabem nos primeiros cinco minutos. Somam 4.645 de ouro e 12 cash. Missão de "comprar" ou "construir" tem `valeJaTer`: se o jogador já tem a coisa, a missão se cumpre na hora. A conta mostra as 38 cumpridas no dia 60 (casual), 25 (regular) e 10 (engajado).
- **Conquistas:** 22, com 88 marcos. Cada marco dá ouro (50, 250, 1.000, 4.000, 15.000) e cash (1, 2, 3, 5, 10). Em 120 dias: 59, 74 e 79 marcos (casual, regular, engajado).
- **Diária:** 7 presentes que avançam a cada **dia jogado**; quem falta continua de onde parou. Pregos, ouro (20 por nível), tábuas, 2 cash, madeira e pedra, ouro (40 por nível), 5 cash. Na primeira volta, o sétimo dia dá também o chapéu de palha. Nada que sai da lavoura.

## 7. O que a pesquisa de jogadores mudou

A pesquisa (`docs/pesquisa/jogadores-e-referencias.md`) terminou no meio deste trabalho e o PLANO mudou. O que foi ajustado nos dados:

1. **Escada da rega** com sete degraus (seção 5): entraram o regador de crivo e o de cobre (molham 3 e 5 casas por toque), o barril na carroça do jumento e o aspersor como construção. O `ritmo.mjs` passou a mostrar toques e idas ao poço por sessão.
2. **Fôlego leve:** enche em 5 s andando ou 3 s parada; nunca vendido.
3. **Vaga de fila** com preço em ouro e em cash na mesma ampliação. Nada útil é só de cash; nenhuma missão manda gastar cash.
4. **Diária** avança por dia jogado (`avancaPor: "dia-jogado"`, `zeraAoFaltar: false`).
5. **Convite** premia os dois quando o amigo chega ao nível 5. **Compartilhar** dá só ouro, uma vez por dia, com a chave `ligado`.
6. **Prêmios de nível, conquista e diária** são ouro, um pouco de cash, material de obra e cosmético. Saíram as sementes e os produtos.
7. **Armazém não trava:** prateleira de tábua e prego; produto, material e ferramenta em lugares separados; sem limite por dia.
8. **Enfeite repetido não encarece.** Destino para o ouro no fim: lotes de 260 e 380 mil, casa-grande de 400 mil, galpão de 200 mil, quintas vagas de fila. Mesmo assim o ouro sobra depois do dia 90 (seção 12).
9. **Mudar construção de lugar é grátis** (`regras.construir.mudarDeLugar: "gratis"`).

## 8. O que o código do jogo ainda não lê

O código (outra frente) está no primeiro marco. Ele já lê culturas, itens, loja de ouro, missões com filtro, a natureza de cada lote, o fôlego e `lavoura.reararAposColher`. Ainda não lê, e a intenção está só nos dados:

- `valeJaTer` nas missões. **Sem isso há risco de trava:** hoje a missão só conta evento que acontece depois de ela ficar ativa. Na conta, antes dessa chave, o jogador parou na missão 9 de 36 porque comprou o regador de lata antes de o Seu Tonho pedir.
- `area` do regador (várias casas por rega) e `forcaMinima` dos obstáculos.
- `ouroPorNivel` nas recompensas (diária, convite, compartilhar).
- Ampliações, vagas de fila com `cash`, pedidos, animais, árvores, receitas, conquistas, diária, convite, loja de cash: são dos marcos seguintes.
- Eventos que as missões esperam e o jogo ainda não emite: `limpou`, `entregou`, `construiu`, `montou`, `ampliou`, `produziu`, `tratou`, `recolheu`, `cavalgou`, `afagou`, `resgatou`, `compartilhou`. A lista com os campos de cada um está em `missoes.json`, em `eventos.lista`.

## 9. Base de vida real

A régua de tempo (minutos de jogo a partir de semanas de vida real) e a maior parte das fontes estão em `docs/planejamento/vida-real-e-mecanicas.md`. O jogo guarda a **ordem** e a **proporção** da vida real, não os números.

| Assunto | Vida real | No jogo |
|---|---|---|
| Alface | 35 dias no canteiro | 1 min: a mais rápida |
| Milho-verde | cerca de 75 dias | 3 min |
| Feijão | 85 a 95 dias | 8 min |
| Tomate | 75 a 80 dias até a primeira colheita, e segue dando | 20 min, rende 3, pede 3 regas |
| Arroz | ciclo precoce de 106 a 120 dias; médio de 121 a 135 | 1 h 30 |
| Cana-de-açúcar | 12 a 18 meses (de memória, não conferido) | 4 h |
| Mandioca | 8 a 14 meses; aguenta seca | 8 h: a mais demorada, pede só 1 rega |
| Bananeira | primeira colheita entre 8,5 e 14 meses | cresce em 4 h: a árvore mais rápida |
| Laranjeira | começa a dar no 2º ano; paga no 4º | 12 h |
| Goiabeira | começa a dar 2 anos depois do plantio | 24 h |
| Galinha | perto de um ovo por dia no auge; cerca de 345 ovos na vida | ovo a cada 20 min; vida de 300 ovos |
| Vaca | média do Brasil perto de 6,8 litros por dia; ordenha uma ou duas vezes ao dia | 1 leite por hora; bebe o dobro da galinha |
| Ovelha | tosquia uma vez por ano; cerca de 2 kg de lã por animal (raça Crioula) | a lã mais demorada: 4 h |
| Boi de arado | arar 1 hectare com um animal leva em média 4 dias de 6 horas; a tração animal corta a mão de obra umas 5 vezes | o boi ara pouco mais de 2 vezes mais rápido que a enxada velha e a fileira inteira por passada (até 6 casas; 10 com o arado de ferro) |

Onde o jogo foge da vida real de propósito: a abóbora (uns 3 a 4 meses na roça, de memória) fica mais demorada que o feijão para a escada de tempos não ter buraco; a goiabeira ficou depois da laranjeira só para espalhar as novidades; o boi é bem menos de 5 vezes mais rápido porque um ganho desse tamanho quebraria o ritmo.

Fontes desta rodada (lidas pelo resumo da busca; **não abri cada PDF para conferir a página**):

- Tração animal, Embrapa Rondônia e Embrapa Amazônia Oriental: https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1184001/1/cpafro-19513.pdf ; https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/984088/1/Foldertracaoanimal.pdf ; https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/350720/1/AP2007usotracaoanimalsafsagricultura.pdf ; UFPel (0,032 hectare por hora com animal e arado): https://cti.ufpel.edu.br/siiepe/arquivos/2023/CA_04686.pdf
- Arroz, ciclos das cultivares (Embrapa, catálogo 2022-2023): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1144282/1/carroz-2022.pdf
- Lã da ovelha Crioula (Embrapa Pecuária Sul): https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1186484/1/Vaz5.pdf
- Bananeira irrigada (Embrapa): https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/662460/1/SistemadeProducaodaBananeiraIrrigada.pdf
- Laranjeira e goiabeira: publicações antigas e regionais da Embrapa que a busca trouxe sem deixar claro qual número é de qual documento; trate como ordem de grandeza. Um dos documentos: https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/687546/1/006-AGO89.pdf
- Alface, milho, feijão, tomate, mandioca, galinha e vaca: fontes [C1] a [C6], [G1] e [V4] de `docs/planejamento/vida-real-e-mecanicas.md`.

Não achei fonte nesta rodada para: ciclo da abóbora e da cana, minutos de uma ordenha manual, quantas regas cada cultura pede.

## 10. Desvios que o dono precisa conhecer

- **Rearar a cada colheita pesa no ritmo.** Com a regra (como está nos dados e no código), o regular chega ao nível 23 no D60. Sem ela, chega ao 25, ganha 67 mil de ouro por dia em vez de 42,5 mil e o boi perde a função. Até o D14 as duas contas são iguais.
- **A distância entre os perfis é grande.** O engajado vê todo o conteúdo em cerca de 4 semanas; o regular em 10 a 11; o casual em uns 8 meses.
- **O casual não compra tudo.** No D120 ele está no nível 21, com 7 lotes dos 12, o celeiro no segundo degrau de quatro e a casa só com a primeira reforma. Não trava (sempre tem o que fazer e o que comprar), mas as compras caras ficam longe: o quinto lote, liberado no dia 32, só foi comprado no dia 66.

## 11. O que é chute

- Os três perfis: minutos por dia, número de sessões e aproveitamento. Não há dado de jogador de verdade.
- Os tempos de cada ação em `regras.acoes` (o jogo ainda vai ser sentido na mão) e as distâncias médias que o modelo usa para andar.
- Os expoentes das fórmulas de preço (0,58 da colheita; 1,6 do pedido; 0,7 de concluir relógio). Foram escolhidos para a escada "ficar bonita", não medidos.
- O preço do cash em reais e os pacotes; o preço em cash das vagas de fila e dos cosméticos.
- A vida útil das ferramentas e dos animais.
- A composição dos pedidos (quanto de cultura, de fruta, de animal e de receita) e a espera de cada vaga.
- A curva depois do nível 26 (reta, pensada para o regular chegar ao 50 em cerca de um ano).
- A mistura de mato, toco e pedra de cada lote.
- Os prêmios do convite: não há conta de quantos amigos um jogador traz.

## 12. Dúvidas para o dono, com recomendação

1. **Rearar depois de cada colheita?** Recomendo **manter**. É o que dá serviço ao boi e à enxada melhor, e segura o ouro no meio do jogo. Se no teste com gente cansar, o remédio é dar mais serviço ao boi (desde o começo humilde, o primeiro chega de presente no nível 4, com o arado simples), não tirar a regra.
2. **O ouro sobra depois do dia 90 (regular) e do dia 30 (engajado).** Recomendo **não inflar preços agora** e tratar isso como a lista do próximo conteúdo: mais lotes, enfeites grandes de preço alto, casa por dentro. Subir preço hoje só puniria o casual.
3. **O engajado termina tudo em 4 semanas.** Recomendo **aceitar nesta versão**. Frear quem joga 2 horas por dia com espera forçada é justamente o que a pesquisa de jogadores condena. O remédio é conteúdo.
4. **A banca dá 91% do ouro; os pedidos, 6%.** O pedido hoje vale pela experiência (um terço dela). Recomendo **manter** e, se o dono quiser o quadro de pedidos mais importante, subir o bônus de 25% para 50%: a conta muda pouco e o pedido passa a ser claramente o melhor comprador.
5. **Vaga de fila: 15, 30 e 60 cash ou de 1.000 a 200.000 de ouro.** No fim, 60 cash (R$ 6) valem 200.000 de ouro. É barato em cash de propósito, e o cash grátis de quatro meses (371) paga doze das quinze. Recomendo **manter**; o dono decide se acha o atalho grande demais.
6. **Cavalo mangalarga por 500 cash com o mesmo efeito do cavalo de ouro.** Recomendo **manter igual**: é cosmético caro, não vantagem.
7. **Arroz, cana e mandioca rendem pouco na banca.** Valem pelas receitas (saca de arroz, açúcar, farinha, polvilho). Recomendo **manter**: é o que faz a indústria valer a pena. O risco é o jogador achar que "não compensa" antes de ter a cozinha; o Seu Tonho pode avisar.
8. **A árvore do mato só sai com machado de ferro (nível 10).** O segundo lote (nível 8) já traz umas três delas, que ficam de pé por dois níveis. Recomendo **manter**: são poucas (2% das casas do lote), não travam nada e dão um motivo claro para querer o machado. Se incomodar no teste, é só tirar a `mata` do lote 2.
9. **Convite e compartilhar estão ligados nos dados.** Recomendo conferir as regras da loja de aplicativos antes de publicar; desligar é uma chave (`ligado: false`).
10. **Preço do cash (10 por real, pacotes de R$ 6,90 a R$ 129,90).** É chute meu. O dono decide.
