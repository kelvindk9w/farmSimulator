# Economia da simulação: do gramado vazio à fazenda cheia

Documento de planejamento, anterior ao código, escrito para o dono do projeto. Data: 12 de novembro de 2026.

Ele responde à direção nova (começo vazio, pré-requisitos, ferramentas e recipientes como itens, ovos e leite do manual ao automático, ciclo de vida dos animais, compra de animais de vizinhos, armazém grande, esterco, avisos visuais) e diz como ela se encaixa no desenho de economia que já existe em `docs/economia/economia-e-progressao.md`.

**Como ler os números**

- Todo preço, capacidade e tempo daqui é **proposta inicial, a calibrar no simulador** (`tools/economy-sim`). Nada foi posto no simulador; a seção 10 lista o que teria de entrar nele.
- As moedas estão na escala do desenho atual (milho 1, ovo 17, leite 31), para as tabelas conversarem.
- A tabela da primeira hora vem de uma **conta de rascunho** feita à parte (não está no repositório): um jogador automático simples, com os tempos de ação do protótipo (`prototypes/sitio-minimo/src/jogo/contrato.js`) mais o tempo de andar. Ela mostra ordem de grandeza. Não substitui o simulador nem o teste com gente.
- **[vida real]** marca o número que deve ser ajustado com o documento de vida real (`docs/planejamento/vida-real-e-mecanicas.md`, que ainda não existe).
- O que vem de outros jogos é aprendizado, com a fonte ao lado. As páginas não abrem neste ambiente; o que se leu foi o resumo do buscador. Nenhuma mecânica, nome ou número foi copiado.
- O relatório de mercado usado aqui está em `reports/Mercado de jogos de fazenda.md` (não em `docs/`).

## 1. Resumo de uma página

O desenho atual é de toque e relógio: os canteiros já existem, o item colhido aparece no estoque, a vaca vem junto com o curral. A direção nova põe um personagem que anda, busca, carrega e embala. Isso cria dezenas de compras pequenas e visíveis, que é a vazão que se procura. O risco é virar trabalho repetitivo. As recomendações:

1. **Começo.** Gramado, um poço velho, uma banca na porteira e um caixote deixado pelo vizinho, com enxada velha, regador velho e milho. Zero moedas. O milho é de graça para sempre, então ninguém fica travado. Todo o resto se compra.
2. **Três travas, nesta ordem: pré-requisito, moedas e, mais tarde, nível.** "Falta o curral" é mais fácil de entender do que "falta o nível 9". Para validar o começo bastam as duas primeiras. XP e níveis voltam quando a economia for para o simulador (etapa 5).
3. **Primeira hora.** Galinha por volta do minuto 11 (fim da primeira sessão), paiol e bancada na segunda sessão, curral com porteira na terceira, vaca e primeira cartela vendida na quarta (minuto 38). Na conta de rascunho o jogador ganha cerca de 2.750 moedas e gasta 2.160 nessa hora.
4. **Um toque faz a cadeia inteira.** O jogador toca no ninho; o personagem vai buscar a caixa onde ela estiver, volta e recolhe. Buscar custa tempo que se vê, e não toques a mais. É isso que mantém a simulação sem virar burocracia.
5. **Desgaste leve.** A ferramenta gasta não quebra no meio da tarefa nem some. Ela fica "gasta", leva um terço a menos e se conserta com um toque por 30% do preço. As do caixote do vizinho nunca gastam. Com esses números o conserto fica abaixo de 1% da renda: é sensação de simulação, não pedágio.
6. **A progressão compra menos viagens.** Regra das duas viagens: nenhuma tarefa de rotina pede mais de duas idas e voltas com o equipamento da fase. Quando a fazenda cresce e passa disso, o recipiente maior, o suporte, o cinto, o carrinho, o caseiro ou a máquina já estão à venda.
7. **Embalar vale mais, sem exagero.** Ovo avulso 14; cartela de 12 por 204; cartela de 30 por 560. Leite a granel 26 por balde; duas garrafas, 32. Descontada a embalagem, embalar rende cerca de 15% a mais (dúzia e leite) e 29% a mais (cartela de 30). Cozinhar continua rendendo mais que embalar.
8. **Animal: a vaga é da construção, o bicho é do mercado.** O custo do "lote de animais" do desenho atual se divide em abrigo (caro, uma vez) e animal (preço de mercado, com vida produtiva contada em ovos e ordenhas, não em dias). Descuido reduz a produção à metade. Nenhum animal morre, foge ou é tomado.
9. **Vizinhos agora, jogadores depois.** Duas ofertas de fazendeiros por dia, mais o telefone, que sempre resolve por 20% a mais. O mercado entre jogadores fica para quando houver gente e economia para isso, e nasce com faixa de preço, taxa e teto diário.
10. **Cash e anúncio não vendem alívio de incômodo criado pelo jogo.** Nada de conserto por cash, animal melhor por cash ou anúncio para curar vaca. Cash continua comprando tempo e cosmético.
11. **Próxima etapa pequena: "do gramado à primeira venda".** Só canteiro, milho, regador como objeto, aviso de sede, banca, moedas e as primeiras compras (canteiros, cesto, regador de lata). São cerca de dez minutos de jogo, para testar com gente antes de pôr a galinha.

O que não muda: sem barra de energia, pedidos como motor, cash não vira moeda, nenhum sorteio pago, nada pune a ausência, e tudo passa pelo simulador antes de entrar no jogo.

## 2. A primeira hora de jogo, passo a passo

Uma hora de jogo não é uma hora seguida. A conta supõe cinco sessões (15, 10, 12, 11 e 12 minutos) com pausas de 2 h, 4 h, 4 h e uma noite. É o primeiro dia e o começo do segundo de quem joga cerca de 40 minutos por dia. Antes de sair, o jogador planta a cultura mais longa que fica pronta até a volta.

| Sessão | Minuto | O que acontece | Compra (moedas) | Saldo antes → depois | O que o passo ensina |
|---:|---:|---|---|---|---|
| 1 | 0 | Gramado. Há o poço velho, a banca na porteira e o caixote do vizinho. Faz 2 canteiros, planta milho, busca água e rega | nada (tudo do caixote) | 0 | Tocar faz o personagem ir e fazer. Planta só cresce regada. O aviso de sede |
| 1 | 1,5 | Colhe 3 espigas por canteiro, leva 3 por viagem na mão, vende na banca. Tarefa do vizinho: +5 | Canteiro 3 (4) | 8 → 4 | Vender dá moeda. A mão tem limite |
| 1 | 2 | Tarefa "4 canteiros": +10. Aparecem o feijão e o primeiro pedido do vizinho | Canteiro 4 (6) | 7 → 1, +10 | A fazenda cresce pela mão do jogador |
| 1 | 3,5 | Passa a levar 9 por viagem. Aparece a mandioca | Cesto de palha (15) | 18 → 3 | Recipiente é um item que se compra e se busca |
| 1 | 5,5 e 7,5 | Tarefa "6 canteiros": +15 | Canteiros 5 e 6 (10 e 15) | 20 → 10; 30 → 15, +15 | Juntar para a próxima compra |
| 1 | 11 | O vizinho aparece na porteira: "tenho duas galinhas sobrando" | Ninho e comedouro (10), caixa de ovos (20), 2 galinhas (30) | 70 → 10 | Pré-requisito: sem ninho e sem caixa não há galinha. Oferta de vizinho |
| 1 | 13,5 | Busca a caixa, pega o primeiro ovo, vende avulso (14). Tarefa: +20. Aparece o tomate | Regador de lata (30) | 68 → 38 | Dar milho às galinhas. Ferramenta melhor: 6 regas em vez de 3 |
| 1 | 15 | Planta tomate (20 min) em tudo e sai | Sementes (24) | sai com cerca de 18 | O jogo mostra o que estará pronto na volta |
| 2 | 16 | Colhe o tomate (cerca de 120) e recolhe 6 ovos. Tarefa: +30. Aparece a abóbora (4 h) | Paiol (140) | 151 → 11, +30 | Guardar em vez de vender tudo na hora |
| 2 | 17 a 19 | Os ovos seguintes ficam na caixa, esperando fechar a dúzia | Bancada de embalar (80), canteiro 7 (30) | 101 → 21; 41 → 11 | A bancada é onde o ovo vira cartela |
| 2 | 25 | Planta abóbora em 7 canteiros e sai | Sementes (105) | sai com cerca de 7 | Cultura longa para a pausa longa |
| 3 | 26 a 30 | Colhe a abóbora (cerca de 490). Tarefa "curral": +50 | Canteiro 8 (30), curral com porteira (300), balde (60) | 92 → 62; 311 → 11, +50; 71 → 11 | A construção vem antes do animal. A porteira. O balde é comprado |
| 4 | 38 | Fecha e vende a primeira cartela de 12 (204; tarefa +30). O vizinho oferece uma vaca | Vaca (320) | 439 → 119 | Embalado vale mais que avulso. O animal vem de outro fazendeiro |
| 4 | 39 a 41 | Colhe o resto da abóbora | Moinho (150), canteiros 9 e 10 (60 cada), suporte de ferramentas (60) | 331 → 181 → 61; 97 → 37 | As coisas têm lugar para ficar |
| 4 | 43 | Primeira ordenha: balde cheio, bancada, 2 garrafas, venda (32) | Garrafas (2) | 37 → 74 no fim da volta | A cadeia do leite. Comida e água da vaca |
| 5 | 50 | Colhe 10 canteiros de abóbora (cerca de 700) | Casa de farinha (280) | 445 → 165 | Daqui em diante entram as construções do desenho atual |
| 5 | 60 | Poupa para o fogão a lenha (740) | nada | cerca de 590 | Meta à vista para o segundo dia |

**Totais da hora (conta de rascunho).** Ganha cerca de 2.750 moedas: culturas 81%, ovos 11%, tarefas do vizinho 6%, leite 2%. Gasta cerca de 2.160: compras 1.710, sementes 370, milho dos animais e embalagens 80.

**O que a conta supõe.** Pedidos pagam 25% a mais em metade das vendas de cultura. O ninho guarda até 3 ovos por galinha enquanto o jogador está fora. As tarefas do vizinho somam 160 moedas. Sem as tarefas, a galinha passa para o começo da segunda sessão (minuto 16) e a vaca para a quinta (minuto 49); elas são pequenas, mas põem a galinha dentro da primeira sessão, que é o gancho para voltar.

**Comparação com o desenho atual.** Lá o galinheiro chega no nível 4, perto do minuto 5, e o curral no nível 9, no segundo dia do jogador regular. Aqui a galinha chega no minuto 11 e a vaca no minuto 38. O começo fica mais lento de propósito, porque há mais o que fazer com as mãos antes de cada novidade. A primeira hora não tem barra de XP, feira, minijogo nem oferta de cash: uma coisa nova de cada vez.

**Peso do andar.** Na conta, o personagem passa de 42% a 48% do tempo andando: de 17% a 20% em passos curtos entre canteiros vizinhos e de 25% a 28% em viagens de buscar e levar (poço, banca, ninho, bancada). Esse segundo número é o que a seção 4 manda vigiar.

## 3. Cadeia de pré-requisitos

Cada linha diz o que é preciso ter antes. Entre parênteses, o preço em moedas. O que está em maiúsculas é construção.

```
Gramado + poço velho + banca na porteira + caixote do vizinho (enxada velha, regador velho, milho grátis)
│
└─ Canteiros 1 e 2 (grátis) ─ canteiros 3 a 6 (4, 6, 10, 15)
     ├─ 4 canteiros ........ feijão; pedidos do vizinho
     ├─ cesto de palha (15)  mandioca
     └─ 6 canteiros ........ regador de lata (30); ninho com comedouro (10) + caixa de ovos (20)
          └─ GALINHAS, até 3 soltas (as 2 primeiras por 30) ... tomate
               └─ PAIOL (140) ... abóbora; canteiros 7 a 10 (30, 30, 60, 60)
                    ├─ bancada de embalar (80) ........ cartela de 12; garrafas
                    ├─ suporte de ferramentas (60) ─ cinto (250)
                    ├─ caixote de feira (150); regador grande (320); telefone (100)
                    ├─ MOINHO (150) ─ casa de farinha ─ fogão a lenha ─ demais construções do desenho atual
                    ├─ CURRAL COM PORTEIRA (300; 2 vagas, cocho e bebedouro)
                    │    └─ balde (60) ─ VACA (a 1ª por 320) ─ 2ª vaca ─ latão de leite (450)
                    │         └─ curral ampliado (4 e 6 vagas) ─ ordenhadeira (6.000) ─ envasadora (4.000)
                    ├─ GALINHEIRO (1.200; 6 vagas; pede o moinho) ─ pintinhos; caixa grande (180); cartela de 30
                    │    └─ calha coletora (900) ─ galinheiro ampliado (9 vagas) ─ embaladora de ovos (2.400)
                    └─ CELEIRO (900; 150 unidades) ─ carrinho de mão (600)
                         ├─ caixa-d'água com bomba (1.200) ─ aspersores (350 para cada 4 canteiros)
                         ├─ quartinho do caseiro (3.000) ─ caseiro (diária)
                         ├─ ARMAZÉM GRANDE (5.000) ─ prateleiras e móveis
                         └─ composteira (projeto futuro)
```

Regras da cadeia:

- **A galinha exige menos.** Ninho, comedouro e caixa somam 30 moedas e não pedem construção. A vaca pede paiol, curral com porteira e balde: 500 moedas antes do animal.
- **A loja mostra só o próximo degrau de cada linha**, com o motivo quando está fechado ("falta o curral"). O jogador nunca vê uma lista de trinta cadeados.
- **A porteira é parte do curral.** O personagem abre para entrar e ela fecha atrás dele. A vaca comprada chega por ela. No protótipo atual o pasto tem só uma abertura; a porteira que abre entra na etapa 4.
- **Nível continua existindo, mas depois.** Do moinho em diante valem os níveis do desenho atual, somados ao pré-requisito físico. Árvores, vila e as demais culturas seguem as tabelas atuais.
- **Preço das máquinas e dos últimos degraus** segue a régua do desenho atual: cerca de 0,8 vez a renda de referência do nível em que aparecem (lá, uma construção custa 1,2 vez).

## 4. Ferramentas e recipientes

Cada um é um objeto no mundo: tem lugar, capacidade e desgaste. "Uso" é uma rega para o regador, uma viagem (encher e esvaziar) para cesto, caixa e carrinho, e uma ordenha para balde e latão.

| Item | Serve para | Preço | Capacidade | Vida útil | Dura cerca de (40 min por dia) | Conserto | Pede antes |
|---|---|---:|---|---:|---|---:|---|
| Enxada velha | fazer canteiro | caixote | — | não gasta | — | — | — |
| Regador velho | regar | caixote | 3 regas | não gasta | — | — | — |
| Regador de lata | regar | 30 | 6 regas | 1.000 regas | 1 semana | 9 | 6 canteiros |
| Regador grande | regar | 320 | 12 regas | 4.000 regas | 1 mês | 96 | paiol |
| Mãos | carregar | — | 3 unidades | — | — | — | — |
| Cesto de palha | carregar colheita | 15 | 9 unidades | 400 viagens | 1 semana | 5 | 4 canteiros |
| Caixote de feira | carregar colheita | 150 | 24 unidades | 500 viagens | 1 mês | 45 | paiol |
| Carrinho de mão | carregar tudo | 600 | 60 unidades ou 4 recipientes | 600 viagens | 3 meses | 180 | celeiro |
| Caixa de ovos | recolher ovos | 20 | 12 ovos | 100 viagens | 2 a 3 semanas | 6 | ninho |
| Caixa grande | recolher ovos | 180 | 30 ovos | 300 viagens | 2 meses | 54 | galinheiro |
| Balde de lata | ordenhar; levar água | 60 | 1 ordenha (2 garrafas) | 150 ordenhas | 2 a 4 semanas | 18 | curral |
| Latão de leite | ordenhar | 450 | 3 ordenhas (6 garrafas) | 1.000 ordenhas | 1 a 2 meses | 135 | 2 vacas |

No fim de cada linha há uma versão reforçada que não gasta, cara e paga em moedas (de 10 a 40 mil, na faixa dos níveis 25 a 30). As capacidades por recipiente são **[vida real]**.

**Onde ficam.** No começo, onde o jogador largar: o regador mora ao lado do poço, a caixa ao lado do ninho. Tocar no chão com algo na mão oferece "largar aqui". Depois vem o suporte de ferramentas (4 ganchos, posto onde o jogador quiser), o cinto (leva duas coisas de uma vez) e o carrinho (leva recipientes e tem ganchos). Embalagens vazias ficam na estante da bancada. Nada disso ocupa o armazém.

**Onde está o limite entre graça e trabalho repetitivo**

Tem graça: ver o personagem pegar o balde, encher o regador, encaixar os ovos; decidir onde deixar cada coisa; a primeira vez de cada tarefa; trocar o cesto e sentir a diferença de 3 para 9. Vira trabalho: mandar buscar com toques separados toda vez; a ferramenta quebrar no meio; procurar onde ficou; voltar ao poço a cada 3 regas quando já são 20 canteiros; consertar toda hora. É o que os jogadores reclamam nos jogos em que tudo quebra: a queixa não é o desgaste em si, é quebrar depressa, no meio da tarefa, sem medidor, com conserto que só dá trabalho ([Looper](https://www.looper.com/205372/big-problems-animal-crossing-new-horizons-needs-to-fix); [Nintendo Everything](https://nintendoeverything.com/animal-crossing-new-horizons-major-flaw/); [Charlie Intel](https://charlieintel.com/fortnite/lego-fortnite-devs-buff-item-durability-but-players-still-arent-happy-291811); [Game Informer](https://www.gameinformer.com/opinion/2019/08/01/we-deserve-better-from-games-with-breakable-weapons)).

As regras propostas:

1. **Um toque faz a cadeia.** Tocar no canteiro seco sem regador na mão faz o personagem buscar o regador, encher se preciso e regar. Passo a passo com toques separados só no tutorial.
2. **Duas viagens.** Com o equipamento da fase, regar todos os canteiros, recolher todos os ovos ou ordenhar todas as vacas pede no máximo duas idas e voltas. Exemplos: o regador de lata dá conta de 12 canteiros; o cesto, de 6 canteiros colhidos; a caixa de 12 ovos, de 6 galinhas; o balde, de 2 vacas. Passou disso, o degrau seguinte já está na loja: com 8 canteiros, o caixote de feira é a compra certa.
3. **Viagens até um terço do tempo de jogo.** Na conta da primeira hora elas ficam entre 25% e 28%, já no limite. É por isso que o cesto chega no minuto 3 e o regador de lata no 14. Esse número deve ser medido no protótipo e, depois, com os jogadores de verdade.
4. **Desgaste que não irrita.** Medidor sempre à vista e aviso quando faltam 10%. Nunca quebra no meio: no fim da vida útil o item fica "gasto" e leva um terço a menos (o regador de lata leva 4, o cesto leva 6, o balde rende 4 garrafas a cada 3 ordenhas em vez de 6). Conserto de um toque, de qualquer lugar, só com moedas, por 30% do preço. Quem preferir compra o degrau de cima e guarda o velho de reserva. As ferramentas do caixote não gastam, então sempre dá para jogar.
5. **Nada se perde.** O que ficou largado volta para o suporte (ou para o canto de origem) quando o jogador sai. Um botão "onde está?" aponta o objeto.

**Como a progressão alivia sem tirar a simulação**

| Alívio | Preço | O que ele tira | Quando chega |
|---|---:|---|---|
| Recipiente maior (cesto → caixote, caixa → caixa grande, balde → latão, regador → grande) | 150 a 450 | viagens | quando a tarefa passa de duas viagens |
| Suporte de ferramentas | 60 | a procura: tudo volta para ele; o personagem pega no suporte mais perto | fim do primeiro dia |
| Cinto | 250 | a troca: regador e um recipiente ao mesmo tempo | segundo dia |
| Carrinho de mão | 600 | a soma das viagens: 60 unidades ou 4 recipientes de uma vez | segundo ou terceiro dia |
| Caseiro (ajudante) | 3.000 e diária | a rotina na ausência: recolhe, trata e embala | segunda semana |
| Máquinas | 900 a 6.000 | o passo inteiro: regar, recolher, embalar, ordenhar, engarrafar | do nível 12 em diante |

O personagem continua pegando, enchendo e carregando em todas as fases. O que muda é quantas vezes. É o caminho que os jogadores já conhecem: o regador é um peso no começo e perde importância quando chegam os aspersores ([TheGamer](https://www.thegamer.com/stardew-valley-how-to-upgrade-and-use-every-tool/); [wiki de Stardew Valley](https://stardewvalleywiki.com/Sprinkler)).

## 5. Cadeias de produção, do manual ao automático

### Ovos

| Passo | Manual | Tempo | O que a automação compra |
|---|---|---|---|
| Recolher | busca a caixa e passa pelos ninhos | 4 s + 1,4 s por ovo | calha coletora (900): os ovos rolam para uma bandeja, uma parada só |
| Tratar | enche o comedouro com milho do paiol | 6 s | comedouro grande (300): comida para 3 dias |
| Embalar | leva a caixa à bancada, pega a cartela, encaixa os ovos | 8 s (12 ovos), 15 s (30 ovos) | embaladora (2.400): entra a caixa, saem as cartelas |
| Vender | leva à banca ou guarda no paiol | 4 a 8 s | caseiro leva |

| Produto | Preço | Embalagem | Fica por ovo | A mais que o avulso |
|---|---:|---:|---:|---:|
| Ovo avulso | 14 | — | 14,0 | — |
| Cartela de 12 | 204 | 10 | 16,2 | +15% |
| Cartela de 30 (pede caixa grande e galinheiro) | 560 | 20 | 18,0 | +29% |

O ovo vale 17 no desenho atual; esse passa a ser o valor do ovo na dúzia, e o avulso vale 85% dele. Pedidos e receitas continuam contando o ovo a 17. Assim, quem faz a cadeia inteira ganha o que a simulação atual já previa, e quem pula a bancada ganha menos. Para o jogador, a leitura é sempre "embalado vale mais". Tamanhos de cartela: **[vida real]**.

### Leite

| Passo | Manual | Tempo | O que a automação compra |
|---|---|---|---|
| Ordenhar | busca o balde, abre a porteira, ordenha | 10 s de caminho + 2,7 s **[vida real]** | ordenhadeira (6.000): a vaca entra na baia e o leite vai para o latão |
| Tratar | cocho (milho ou ração) e bebedouro (água do poço, no balde) | 6 a 10 s | cocho grande (400); bebedouro ligado à caixa-d'água |
| Engarrafar | leva o balde à bancada e enche 2 garrafas | 6 s por balde | envasadora (4.000): do latão para as garrafas |
| Vender | leva à banca ou guarda | 4 a 8 s | caseiro leva |

| Produto | Preço | Embalagem | Fica por ordenha | A mais que a granel |
|---|---:|---:|---:|---:|
| Balde a granel | 26 | — | 26 | — |
| 2 garrafas (1 balde = 2 garrafas **[vida real]**) | 32 | 2 | 30 | +15% |

Uma ordenha engarrafada vale 32, que é o "leite" de 31 do desenho atual. As receitas da queijaria usam o balde direto: 1 balde conta como 1 leite. A produção depende do bem-estar da vaca (seção 6).

### Milho e as demais culturas

As 20 culturas do desenho atual ficam com os mesmos tempos e preços. O que muda é o manuseio: fazer o canteiro (uma vez), plantar, regar, colher, carregar e vender ou guardar.

- **Rega.** Uma vez por plantio, mesmo nas culturas de horas. A planta nunca morre de sede: ela espera, sem crescer, até ser regada.
- **Milho.** Semente grátis, 1 minuto, 3 espigas. É o cultivo gratuito de entrada e o alimento dos primeiros animais.
- **Tempo do jogador por canteiro, a cada ciclo:** 21 s com as mãos e o regador velho; 13 s com cesto e regador de lata; 11 s com caixote e regador grande; 6 s com aspersor e carrinho (sobra plantar e colher).
- **Automação.** Aspersor rega 4 canteiros (350; pede a caixa-d'água de 1.200). O caseiro colhe e guarda, mas não planta: o que plantar é decisão do jogador.
- **Construções** (moinho, casa de farinha, fogão a lenha e as outras) já funcionam com fila e relógio. O manual delas é levar o insumo e buscar o produto.
- **Mais tarde:** ensacar grãos (saca de 20) e encaixotar legumes e frutas (caixote de 24), com 10% a mais, para pedidos grandes.

### Por que o manual continua valendo a pena no começo

- **Sobra tempo na sessão.** A simulação atual mostra o jogador regular sem nada útil a fazer em 52% da sessão na primeira semana, e o engajado em 71%. O trabalho manual ocupa esse tempo com algo que se vê.
- **A volta manual cabe na sessão até perto do nível 15** (tabela abaixo). Antes disso a máquina não devolve nada que faça falta.
- **Máquina e caseiro entregam o produto, mas não o XP da ação.** É a mesma regra do ajudante no desenho atual. Quem faz à mão sobe um pouco mais rápido.
- **Máquina compra tempo, não lucro.** O produto sai pelo mesmo preço, e a máquina custa horas de renda. Jogadores de um simulador de rancho pedem ordenhadeira quando passam de umas dez vacas, não antes ([discussão no Steam](https://steamcommunity.com/app/1119730/discussions/2/5503948370880383170)).

Tamanho da volta completa (colher, regar, replantar, recolher, tratar, embalar, vender), estimado com os tempos da conta de rascunho:

| Fase | Fazenda | Volta manual completa | Sessão do jogador regular | O que resolve |
|---|---|---:|---:|---|
| Fim da primeira hora | 10 canteiros, 2 galinhas, 1 vaca | 3,5 min | 8 min | nada: sobra tempo |
| Nível 15 | 16 canteiros, 6 galinhas, 2 vacas, 4 construções | 7,5 min | 8 min | recipientes maiores (cai para 6 min) |
| Nível 30 | 27 canteiros, 9 galinhas, 6 vacas, 16 árvores, 6 construções | 11 min | 8 min | aspersores, calha, embaladora, ordenhadeira (cai para 7 min) |

### Avisos visuais

| Estado | Aviso no mundo |
|---|---|
| Planta com sede | terra clara e uma gota sobre o canteiro; some ao regar |
| Pronta para colher | a planta balança e brilha de leve |
| Ninho com ovo; ninho cheio | ovo à vista; com 3 ovos a galinha fica parada ao lado |
| Comedouro, cocho ou bebedouro vazio | recipiente vazio à vista e um balão sobre o animal |
| Leite pronto | a vaca vai ao ponto de ordenha (já existe no protótipo) |
| Animal abatido | anda devagar, de cabeça baixa |
| Ferramenta gasta | remendo no objeto e no ícone; aviso antes, com 10% de vida |
| Recipiente ou armazém cheio | o personagem para e mostra |
| Oferta de vizinho; pedido | fazendeiro na porteira; telefone tocando |

O aviso é sempre uma coisa do mundo, com um ícone pequeno por cima. No enquadramento "ver tudo", e na TV, os mesmos avisos viram uma lista curta de "o que precisa de você". Cada estado sem aviso é produção parada: na simulação atual, o canteiro do jogador casual passa de 75% a 87% do tempo vazio ou esperando colheita.

## 6. Animais

| | Galinha | Vaca |
|---|---|---|
| Abrigo | ninho com comedouro (até 3, soltas); galinheiro de 6 e 9 vagas | curral com porteira de 2, 4 e 6 vagas |
| Preço de referência do adulto | 60 | 450 |
| Filhote | pintinho, 20; vira galinha em 6 h de trato **[vida real]** | bezerra, 150; vira vaca em 24 h de trato **[vida real]** |
| Primeira compra (vizinho) | 2 por 30 | 320 |
| Come | 2 milhos por ovo, ou 1 ração do moinho | capim do curral e 3 milhos por ordenha, ou 1 ração; 1 balde de água a cada 3 ordenhas **[vida real]** |
| Produz | 1 ovo a cada 20 min; o ninho guarda 3 | 1 balde (2 garrafas) a cada 60 min; espera 1 ordenha |
| Custo de manter | 2 a 4 moedas por ovo de 17 | 3 a 8 moedas por ordenha de 32 |
| Vida produtiva | 300 ovos **[vida real]** | 400 ordenhas **[vida real]** |
| Depois dela | bota na metade do ritmo; a granja busca e paga 20 | seca; um vizinho paga 150, ou ela fica de mascote |
| Reposição, líquida | 40 a cada 300 ovos (0,8% do que ela rendeu) | 300 a cada 400 ordenhas (2,3%) |

- **A vaga e o animal são compras separadas.** O custo do lote no desenho atual (por exemplo, 3.900 moedas por mais 2 vacas no nível 17) vira ampliação do curral (a maior parte) mais os animais a preço de mercado.
- **Vida contada em produtos, não em dias.** Quem joga pouco não vê o animal envelhecer parado. Com 3 a 5 visitas por dia, a galinha dura cerca de um mês e a vaca cerca de três.
- **Fim de vida sem cena triste.** A galinha "vai para a granja" de caminhão; a vaca vai para o pasto de um vizinho. Vender nunca é obrigatório.
- **Qualidades (mais tarde).** Comum, boa e premiada: o produto vale 0%, 25% e 50% a mais; o animal custa 1, 3 e 8 vezes. É o que faz a reposição crescer junto com a renda e dá variedade às ofertas.

**Fome e saúde**

| Estado | Como chega | Produção | Como sai |
|---|---|---:|---|
| Bem tratado | comeu e bebeu no ciclo | 100% | — |
| Com fome ou sede | comedouro, cocho ou bebedouro vazio; o animal cisca ou pasta sozinho | 50% (o ciclo dobra) | encher |
| Abatido | saúde abaixo de 50, o que pede mais de 3 dias seguidos sem trato | 50%, mesmo comendo | 1 dia de trato normal, ou remédio do vizinho (40 para a vaca, 5 para a galinha) |

A saúde vai de 0 a 100. Cai 15 a cada dia inteiro sem trato (ninguém encheu o comedouro ou o cocho naquele dia) e sobe 30 por dia bem tratado. Uma visita por dia já conta como trato. Depois de 3 dias sem o jogador entrar, o vizinho "passa a dar uma olhada" e a saúde para de cair em 40.

**Consequência proposta para descuido: produz menos, e só.** O animal não morre, não foge e não é tomado. Justificativa:

1. O dono do projeto não quer um simulador hardcore, e o desenho atual já tem a regra "nada pune a ausência".
2. Perder metade da produção já dói o bastante para o jogador cuidar, e se desfaz em um dia.
3. No jogo de fazenda mais querido do PC, animal sem comida para de produzir e fica triste, mas não morre ([Gamer Empire](https://gamerempire.net/?p=50951); [Destructoid](https://destructoid.com/?p=265668)). Na série em que os animais morriam de doença e de velhice, a lembrança dos jogadores é de tristeza, e uma versão recente foi atualizada para os animais viverem mais ([AV Club](https://www.avclub.com/harvest-moon-was-my-introduction-to-the-concept-of); [Siliconera](https://www.siliconera.com/harvest-moon-one-world-update-makes-animals-live-longer/)).
4. O jogo quer famílias e crianças jogando, e quem volta de férias e encontra a fazenda morta não volta de novo.

## 7. NPCs e mercado

**O que entra agora**

| Mecânica | Como funciona | Números |
|---|---|---|
| O vizinho | Deixa o caixote, dá as tarefas do começo e faz a primeira oferta de galinhas e de vaca | 2 galinhas por 30; vaca por 320; tarefas somam 160 moedas na primeira hora |
| Ofertas de fazendeiros | Um fazendeiro aparece na porteira com uma proposta: "tenho uma vaca, quer comprar?". O jogador aceita ou deixa passar | 2 por dia (manhã e tarde); cada uma vale 8 h; preço de 75% a 125% da referência; 1 em cada 4 é pechincha (85% ou menos) |
| Variedade das ofertas | Adulto, filhote, trio de pintinhos, animal de qualidade melhor, ferramenta usada | ferramenta usada: metade da vida pela metade do preço |
| Telefone, para comprar | O jogador escolhe o animal e liga para outra fazenda. Chega depois, pela porteira | referência mais 20% de frete; entrega em 30 min (galinha) e 2 h (vaca) **[vida real]**; 2 pedidos ao mesmo tempo |
| Pedidos de venda | É o quadro de pedidos do desenho atual com cara de gente: "preciso de 2 dúzias de ovos até amanhã". Começam como recados do vizinho na porteira; com o telefone, vêm de mais fazendas | mesmas regras, vagas e valores do quadro atual (25% acima da banca) |
| Granja | Um caminhão busca a galinha no fim da vida produtiva | 20 por galinha |

Como isso vira motivo para voltar: as ofertas mudam duas vezes por dia, a entrega do telefone chega mais tarde, e a pechincha só aparece para quem passa por lá. Mas a oferta perdida não custa nada, porque outra vem e o telefone sempre resolve, mais caro. Relógio que prende o jogador é queixa conhecida ([Mobile Free to Play](https://mobilefreetoplay.com/?p=205)).

No início, com poucos jogadores, todos os fazendeiros são NPCs. O servidor gera as ofertas por jogador, sem depender de mais ninguém.

**O que fica para depois: mercado entre jogadores**

Um mural de anúncios assíncrono: um jogador põe uma vaca à venda, com idade e qualidade à mostra, e outro compra quando entrar. Só em moedas. Os riscos e os limites:

| Risco | Como limitar |
|---|---|
| Passar riqueza de uma conta para outra (conta alternativa, venda por dinheiro de verdade) | Preço só dentro de uma faixa, de 100% a 140% do preço base. Taxa de 10% sobre a venda. Teto diário de valor negociado, proporcional ao nível (por exemplo, o valor de 10 pedidos). O anúncio vai para o mural geral; reserva para amigo, no máximo 3 por dia. Nunca cash nem cosmético premium |
| Pular a progressão | Só se compra o que já se liberou, por pré-requisito e nível. O animal vai com a vida que resta, e o preço acompanha |
| Preços fora de controle | Os NPCs são o piso e o teto. Para o que eles vendem (animais, insumos), a banca paga 100% e o telefone vende a 120%: os jogadores negociam nesse corredor. Para o resto vale o teto de 140% |
| Duplicação e golpe | O servidor decide tudo. Não há troca direta nem "confia em mim": a compra é uma operação só. Registro de todas as transações |
| Contas novas e robôs | Negociar só a partir do nível 10 e com 3 dias de conta. 4 vagas de anúncio |
| Mural vazio | Só ligar quando houver jogadores ativos bastantes; até lá, o mural mostra as ofertas de NPC |

O aprendizado de fora: um jogo de horta que virou fenômeno em 2025 só lançou a troca entre jogadores meses depois. Segundo sites de fãs, o lançamento atrasou por causa de uma falha de duplicação e as trocas ganharam uma taxa para tirar moeda de circulação; mesmo assim, o jogo convive com golpes e com revenda por dinheiro real ([roonby](https://roonby.com/2025/07/31/grow-a-garden-trading-update-leaks-all-things-coming-when/); [gggamer](https://gggamer.net/?p=16129); relatório de mercado do projeto). O relatório de mercado já punha o mercado como a quarta e última camada do multijogador, "só quando houver economia que valha a pena negociar", em moeda comum e com preço máximo por item. A ordem recomendada é: vizinhos NPC agora; presentes limitados entre amigos; mural entre amigos; mural geral.

## 8. Armazém

| Estágio | Capacidade | Custo | Como é |
|---|---:|---:|---|
| Sem armazém (primeiros 15 minutos) | o que cabe na mão ou no cesto | — | vende na hora, na banca |
| Paiol | 40 unidades | 140 | o personagem entra pela porta e some, como no celeiro do protótipo |
| Celeiro | 150 unidades | 900 | igual, maior; é a soma do silo (75) e do celeiro (75) com que o desenho atual começa |
| Armazém grande | 6 vagas de chão; com 6 prateleiras simples, 240 unidades | 5.000 | o personagem entra e a câmera vai junto; o jogador põe e arruma os móveis |
| Ampliar o armazém | mais 2 vagas de chão por ampliação | moedas e tábuas, pela tabela atual | a mesma curva de custo e capacidade que já foi simulada |

| Móvel | Guarda | Preço |
|---|---:|---:|
| Prateleira simples | 40 unidades | 300 |
| Prateleira reforçada | 80 unidades | 2.000 |
| Estante de embalagens (cartelas, garrafas) | 48 embalagens | 200 |
| Baú de ferramentas | 6 ferramentas ou recipientes | 250 |

- **A capacidade vem dos móveis.** Cada ampliação da tabela atual (mais 40 unidades por moedas e tábuas) passa a ser "mais chão e mais uma prateleira". O jogador gasta o mesmo e vê o resultado. A prateleira reforçada é um jeito de trocar moedas por capacidade sem depender de tábuas.
- **Organizar é do jogador e é opcional.** Ele põe uma etiqueta na prateleira ("ovos aqui") e o personagem passa a guardar ali sozinho. Sem etiqueta, vai para a primeira prateleira com espaço. Arrumar bem encurta o caminho lá dentro em alguns segundos. Bagunça nunca é castigada.
- **Entrar também é opcional.** Guardar e pegar funcionam com um toque do lado de fora. Quem não quer arrumar nunca precisa entrar.
- **O interior é uma cena pequena e separada**, o que ajuda no celular fraco. Na TV, a arrumação anda por foco, de vaga em vaga.
- **Na economia, o armazém continua não sendo válvula de ritmo.** Vale o que o desenho atual concluiu: armazém cheio é a queixa mais repetida dos jogadores brasileiros, então ele é generoso e o excedente sai pela banca com um toque ([Şikayetvar](https://www.sikayetvar.com/en/hay-day-us/hay-day-storage-problem-makes-progress-impossible); relatório de mercado). Ferramentas, recipientes e embalagens não ocupam espaço de produto.
- **Nenhum móvel ou espaço é exclusivo de cash.** Um jogo do gênero pôs um baú de armazenamento na loja paga e, segundo uma manchete, ouviu protesto (relatório de mercado, citando MassivelyOP).

## 9. Esterco e adubo (projeto futuro)

O ciclo: a vaca deixa 1 esterco a cada 3 ordenhas **[vida real]**. O personagem recolhe com a pá e o carrinho de mão e leva à composteira (600; pede curral e carrinho). Lá, 4 estercos e 2 palhas de milho viram 2 sacos de adubo em 2 h **[vida real]**. Um saco aplicado no canteiro vale para um plantio e dá 1 unidade a mais na colheita (4 em vez de 3).

O efeito na economia é pequeno e de propósito. Com 3 a 5 ordenhas por dia, uma vaca rende de meio a 1 saco por dia; seis vacas, de 3 a 5. Usado em cultura longa do nível 26, isso dá perto de 1% a mais de renda. O valor está em fechar o ciclo entre animais e lavoura, e em dar ao jogador uma decisão: em que canteiro pôr o adubo. Curral sujo não castiga; curral limpo dá um pouco de saúde.

Fica para depois porque pede pá, estado de sujeira, composteira e mais uma coisa para explicar. Entra quando o carrinho de mão e o celeiro já forem rotina (etapa 10).

## 10. Mapa de entradas e saídas de dinheiro

**De onde vêm as moedas**

| Fonte | Regra | Situação |
|---|---|---|
| Banca na porteira | preço base; solto vale menos (ovo avulso 14, leite a granel 26) | mudou |
| Produto embalado | cartela de 12 por 204; de 30 por 560; 2 garrafas por 32 | novo |
| Pedidos (telefone dos vizinhos) | 25% acima da banca, como hoje | igual, com outra cara |
| Tarefas do vizinho, missões, subida de nível | pequenas e proporcionais ao nível | igual |
| Animal no fim da vida | galinha 20; vaca 150 | novo |
| Anúncio opcional (baú, dobrar pedido) | como hoje | igual |
| Outros jogadores | faixa de 100% a 140%, menos 10% de taxa | futuro |

**Para onde vão**

| Destino | Tipo | Tamanho esperado (estimativa, a medir no simulador) |
|---|---|---|
| Canteiros, terra, construções, vagas de animais, árvores, vila | uma vez | o grosso, como hoje (cerca de três quartos do que o regular ganha) |
| Ferramentas e recipientes, 3 a 4 degraus por linha | uma vez por degrau | novo; de 2% a 4% |
| Bancadas e máquinas | uma vez | novo; de 3% a 5% |
| Móveis do armazém | uma vez | toma parte do custo atual de ampliação |
| Sementes | toda hora | 6% hoje; 14% na primeira hora |
| Embalagens (cartelas, garrafas) | toda hora | de 4% a 6% do valor embalado; perto de 1% da renda |
| Conserto de ferramentas | toda semana | abaixo de 1% da renda; nunca acima de 3% |
| Compra e reposição de animais | todo mês | de 1% a 2%; cresce com as qualidades |
| Frete do telefone | às vezes | abaixo de 1% |
| Diária do caseiro | todo dia, opcional | cerca de 5% da renda do dia |
| Festa da vila, decoração | longo prazo | como hoje |
| Taxa do mercado | futuro | 10% do que for negociado |

As saídas novas que se repetem somam algo entre 4% e 10% da renda. O grosso da vazão continua nas compras únicas. A diferença é que agora há muito mais delas, elas aparecem no chão da fazenda e cada uma muda o que o personagem faz. Onde mais ajudam: na rodada "só MVP" do simulador, depois que o conteúdo acaba, o regular gasta 70% do que ganha e o engajado 55%, e o saldo passa de 10 dias de renda. Degraus altos de ferramenta, máquina e móvel, com preço na régua da renda por nível, são destino para essas moedas.

**Onde entram o cash e os anúncios**

| | Entra | Não entra |
|---|---|---|
| Cash | Concluir relógio pela fórmula atual, agora também filhote crescendo e entrega do telefone. Cosméticos novos: pintura do regador e do carrinho, pelagem dos animais, estilo das prateleiras, roupa do caseiro. Vagas de fila, como hoje | Conserto. Ferramenta que não gasta. Animal que produz mais. Móvel ou espaço exclusivo. Remédio |
| Anúncio opcional | Dois pontos novos dentro do teto atual de 8 por dia: chamar outra oferta de vizinho (1 por dia) e conserto grátis de uma ferramenta (1 por dia). "Adiantar 20 minutos" passa a valer para filhote e entrega | Anúncio para desfazer castigo (curar animal, salvar planta). Oferta de anúncio ou de cash no momento em que algo deu errado |

O princípio: o jogo não cria um incômodo para vender o alívio. Desgaste e bem-estar se resolvem jogando, com moedas e barato. Cash não compra moedas nem produção, então não há "pague para ganhar"; e nada se perde por não ver anúncio, então não há punição.

**O que muda no desenho atual**

| Tema | Desenho atual | Proposta |
|---|---|---|
| Começo | 6 canteiros, 60 moedas, silo e celeiro de 75 | gramado, 2 canteiros grátis, 0 moedas, sem armazém |
| Trava | nível e moedas | pré-requisito, moedas e nível |
| Ação | toque: plantar 1,2 s, colher 1 s; não há rega | personagem: cerca de 3 s por ação com o passo, mais as viagens; rega obrigatória |
| Primeira sessão | 4 níveis, moinho, galinheiro e 4 culturas em 8 min | 6 canteiros, 2 ferramentas e 2 galinhas em 15 min |
| Animais | lote de 2 ou 3 junto com o abrigo; vivem para sempre | vaga e animal separados; vida produtiva; fome e saúde |
| Ovo e leite | um item, um preço | solto ou embalado; o embalado é o preço atual |
| Armazém | dois, de 75, mais 40 por ampliação | um só: paiol, celeiro, armazém com móveis; mesma curva |
| Pedidos | quadro | o mesmo quadro, como telefone dos vizinhos; mais ofertas de compra |
| Caseiro | estágio 12 da vila e passe | também contratado por diária em moedas |
| Mercado entre jogadores | quarta camada, futura | igual, com os limites da seção 7 |

**Parâmetros do simulador que teriam de mudar ou entrar** (lista; nada foi alterado em `tools/economy-sim/dados/`)

- `parametros.json` → `inicio`: moedas 60 → 0; canteiros 6 → 2; silo e celeiro 75 → 0. Acrescentar o preço dos canteiros 3 a 10.
- `parametros.json` → `acoes_seg`: tempos com deslocamento (plantar e colher perto de 2,9 s) e ações novas: fazer canteiro, regar, encher o regador, viagem de venda, recolher ovo com a caixa, ordenhar, embalar, engarrafar, tratar, consertar.
- `parametros.json` → `cultura`: semente de milho grátis; rega como passo obrigatório.
- Novo bloco `ferramentas`: por item, preço, capacidade, vida útil em usos, fração do conserto (0,3), perda de capacidade quando gasta (um terço), pré-requisito.
- Novo bloco `carga`: quanto o personagem leva por recipiente (3, 9, 24, 60) e o efeito do suporte, do cinto e do carrinho no tempo das viagens.
- Novo bloco `embalagem`: fator do produto solto (0,85), cartela de 12 (fator 1,0; custo 10), cartela de 30 (fator 1,10; custo 20), garrafa (2 por balde; custo 1), leite a granel (26).
- `parametros.json` → `animal`: produtos guardados na ausência (ninho 3; vaca 1), vida produtiva (300 ovos; 400 ordenhas), preço de mercado, valor no fim da vida, filhote (preço e tempo), multiplicador de produção com fome (0,5), saúde (queda e recuperação por dia), qualidades.
- `parametros.json` → `custos.mult_lote_animal`: separar em vaga do abrigo e animal.
- `conteudo.json`: campo `exige` em cada item (pré-requisito além do nível). Itens novos: ninho, galinheiro, curral com porteira, paiol, celeiro, armazém grande, bancada, suporte, cinto, carrinho, telefone, máquinas (calha, embaladora, ordenhadeira, envasadora, aspersor, caixa-d'água), quartinho do caseiro, composteira. Moinho passa a pedir paiol.
- `conteudo.json` → `animais`: a vaca produz "balde de leite"; as receitas que usam leite continuam com a mesma quantidade, agora em baldes.
- `parametros.json` → `armazem`: começo sem armazém; paiol 40; celeiro 150; capacidade por móvel (40 e 80); vagas de chão por ampliação; divisão do custo entre obra e móvel.
- Novo bloco `vizinhos`: ofertas por dia (2), validade (8 h), faixa de preço (0,75 a 1,25), fração de pechinchas (1 em 4), frete do telefone (1,2), prazos de entrega, recompensas das tarefas.
- Novo bloco `caseiro`: custo do quartinho, diária (múltiplo da renda de referência do nível), o que ele faz, sem XP de ação.
- `parametros.json` → `anuncios.pontos`: acrescentar "oferta de vizinho" e "conserto grátis"; `acelerar` passa a valer para filhote e entrega.
- Novo bloco `mercado_jogadores` (futuro): faixa (1,0 a 1,4), taxa (0,10), teto diário, nível mínimo.
- `personas.json` e política do jogador simulado: quando conserta, quando troca de ferramenta, se embala ou vende solto, se aceita oferta. Indicadores novos na saída: parte do tempo em viagens, viagens por tarefa, moedas gastas em conserto, embalagem e reposição, tamanho da volta completa.
- `curva_xp` e metas de ritmo: recalibrar com `calibrar.py`, porque o jogador faz menos ações por minuto. A meta "3 a 5 níveis nos primeiros 10 minutos" precisa ser revista.

## 11. Etapas

Cada etapa é pequena e termina com uma pergunta a responder com gente jogando, em celular fraco também. Só se passa para a seguinte depois da resposta.

| Etapa | O que entra | O que validar antes de seguir |
|---|---|---|
| 0. Sítio mínimo (já existe) | Um objeto de cada tipo, com animação: canteiros, poço, celeiro, vaca, galinhas, laranjeira. Sem economia | Já validado: as ações funcionam e a arte se troca |
| 1. Do gramado à primeira venda | Gramado, poço e banca. Fazer canteiro, milho grátis, regador como objeto (pegar, encher, largar), aviso de sede, colher com a mão, vender, moedas, comprar canteiros 3 a 6, cesto e regador de lata. Cerca de 10 minutos | A pessoa entende o que fazer sem texto? Quer continuar depois da terceira venda? Buscar o regador incomoda? As viagens passam de um terço do tempo? |
| 2. A primeira galinha | Ninho, comedouro, caixa de ovos como objeto, oferta do vizinho, ovo avulso, fome leve, avisos de ovo e de comedouro vazio | "Preciso da caixa" é entendido sem explicação? Tratar a galinha é rotina boa ou obrigação? |
| 3. Paiol, bancada e cartela | Guardar, embalar a dúzia, vender embalado. Desgaste ligado em dois itens (regador de lata e cesto), com conserto | Embalar dá gosto ou é atrito? O desgaste parece justo? Quantos consertam antes do aviso? |
| 4. Curral com porteira, balde e vaca | Porteira que abre, cocho e bebedouro, ordenha, garrafas, fome e saúde | A hora inteira da seção 2, jogada de verdade: os tempos e os saldos batem com a conta de rascunho? |
| 5. Economia no simulador | Parâmetros da seção 10 em `tools/economy-sim`. Voltam XP, níveis, pedidos e as construções atuais. Progresso gravado | As metas de ritmo (dias 1, 7 e 30) continuam de pé? O saldo fica perto de um dia de renda? |
| 6. Vizinhos | Duas ofertas por dia, telefone, pintinho e bezerra, vida produtiva, granja | As ofertas trazem o jogador de volta? Alguém fica travado sem animal? A venda da galinha velha incomoda? |
| 7. Alívios | Suporte, cinto, carrinho de mão, caixote, regador grande, latão, caixa grande, cartela de 30. Primeiras máquinas: aspersor e calha | A volta completa cabe na sessão? A regra das duas viagens se mantém com a fazenda maior? |
| 8. Armazém grande | Entrar, prateleiras, etiquetas, ampliar | Roda bem no celular fraco e na TV? Quantos jogadores arrumam por vontade própria? |
| 9. Caseiro e máquinas | Diária, embaladora, ordenhadeira, envasadora | Quem automatiza continua jogando ou some? As moedas têm destino depois do nível 30? |
| 10. Esterco e adubo | Pá, composteira, adubo no canteiro | O ciclo é entendido? O ganho pequeno vale o trabalho? |
| 11. Mercado entre jogadores | Presentes limitados, mural entre amigos, depois mural geral | Há jogadores bastantes? As contas alternativas ficam dentro dos tetos? |

As etapas 1 a 4 são protótipo, sem servidor e sem progresso gravado. Elas respondem à pergunta que o dono do projeto pôs na frente das outras: validar esse início antes de avançar.

## 12. Perguntas em aberto

| Pergunta | Recomendação |
|---|---|
| "Só gramado" admite um poço velho e uma banca na porteira? | Sim. Sem água e sem onde vender não existe primeiro minuto. O resto começa vazio |
| O jogador começa com alguma moeda? | Zero moedas e milho grátis para sempre. Os 10 cash de boas-vindas ficam |
| XP e níveis continuam? | Sim, mas só voltam na etapa 5. No começo, a trava é o pré-requisito e o preço |
| Buscar é um toque ou vários? | Um toque faz a cadeia toda. Passo a passo só no tutorial |
| Ferramenta gasta quebra ou só piora? | Só piora, um terço. As do caixote nunca gastam |
| A planta morre sem água? O animal morre sem trato? | Não e não. A planta espera; o animal produz a metade |
| O que acontece com a vaca no fim da vida produtiva? | Seca. Pode ir para o pasto de um vizinho por 150 moedas ou ficar de mascote. Nada de abate em cena. A galinha vai para a granja de caminhão |
| O valor atual do ovo (17) é o do avulso ou o da dúzia? | O da dúzia. O avulso vale 85%. Assim a simulação atual continua valendo para quem faz a cadeia inteira |
| Existe cartela de meia dúzia? | Não agora. Com 2 galinhas a primeira dúzia fecha na terceira ou quarta sessão, e isso é um bom motivo para voltar |
| Quantas galinhas antes do galinheiro? | Até 3 soltas. A galinha exige menos, mas o galinheiro precisa ter razão de ser |
| Um armazém ou dois (silo e celeiro)? | Um só, dividido por prateleiras, com a mesma capacidade somada |
| Entrar no armazém é obrigatório? | Não. Entra quem quer arrumar |
| O mercado entre jogadores tem preço livre? | Não. Faixa de 100% a 140%, taxa de 10% e teto diário. E só depois das etapas 1 a 10 |
| Cash pode consertar ferramenta ou comprar animal melhor? | Não. Cash compra tempo e cosmético |
| O vizinho tem nome e rosto? | Sim, um personagem fixo e simpático, porque ele é o tutorial, a loja de animais e o telefone. Nome e visual ficam para a direção de arte |
| Os tempos de animal seguem a vida real? | Seguem a proporção, não o relógio. Rever com o documento de vida real: ovos por galinha, litros por ordenha, 1 balde = 2 garrafas, crescimento de filhote, vida produtiva |

## Fontes e limites

Documentos do projeto: `docs/economia/economia-e-progressao.md`; `tools/economy-sim/README.md`, `dados/*.json` e `saida/resultados_mvp.md`; `prototypes/sitio-minimo/README.md` e `src/jogo/contrato.js`; `reports/Mercado de jogos de fazenda.md`.

Fontes externas, lidas pelo resumo do buscador em 12 de novembro de 2026 (as páginas não abrem neste ambiente):

- Desgaste de ferramentas: [Looper](https://www.looper.com/205372/big-problems-animal-crossing-new-horizons-needs-to-fix), [Nintendo Everything](https://nintendoeverything.com/animal-crossing-new-horizons-major-flaw/), [Charlie Intel](https://charlieintel.com/fortnite/lego-fortnite-devs-buff-item-durability-but-players-still-arent-happy-291811), [Game Informer](https://www.gameinformer.com/opinion/2019/08/01/we-deserve-better-from-games-with-breakable-weapons).
- Regador e aspersores: [TheGamer](https://www.thegamer.com/stardew-valley-how-to-upgrade-and-use-every-tool/), [wiki de Stardew Valley](https://stardewvalleywiki.com/Sprinkler).
- Pedido de automação da ordenha: [discussão no Steam](https://steamcommunity.com/app/1119730/discussions/2/5503948370880383170).
- Animais e descuido: [Gamer Empire](https://gamerempire.net/?p=50951), [Destructoid](https://destructoid.com/?p=265668), [AV Club](https://www.avclub.com/harvest-moon-was-my-introduction-to-the-concept-of), [Siliconera](https://www.siliconera.com/harvest-moon-one-world-update-makes-animals-live-longer/).
- Armazém: [Şikayetvar](https://www.sikayetvar.com/en/hay-day-us/hay-day-storage-problem-makes-progress-impossible).
- Troca entre jogadores: [roonby](https://roonby.com/2025/07/31/grow-a-garden-trading-update-leaks-all-things-coming-when/), [gggamer](https://gggamer.net/?p=16129).
- Relógios que prendem o jogador: [Mobile Free to Play](https://mobilefreetoplay.com/?p=205), já citado no desenho atual.

Limites deste documento:

- A conta da primeira hora é um rascunho com um jogador automático disciplinado. Gente de verdade anda mais devagar, erra e se distrai. Os minutos da seção 2 são o melhor caso.
- Os tamanhos das saídas de moedas na seção 10 são estimativas. Só o simulador, com os parâmetros novos, diz o número.
- Os preços dos degraus altos (máquinas, versões reforçadas, móveis) seguem a régua do desenho atual, mas não foram testados contra a renda por nível.
- Nenhum número da vida real foi pesquisado aqui. Tudo o que está marcado com **[vida real]** espera o outro documento.
