# Economia e ritmo de progressão

Documento de desenho, anterior ao código. Define como o jogador avança, quanto tempo cada etapa leva e que números sustentam isso. Todos os valores são desenho próprio do projeto e estão em `tools/economy-sim/dados/`; as tabelas deste documento foram geradas por `tools/economy-sim/exportar_tabelas.py` e os resultados por `tools/economy-sim/simular.py`. Data: 11 de novembro de 2026.

> **Atualização de direção (11 de novembro de 2026).** O multijogador será assíncrono: cada jogador na própria fazenda, com lista de amigos; presentes, ajuda e invasão ficam para depois. A seção "Mutirão" passa a valer como desenho futuro da ajuda entre amigos por visita, sem presença simultânea. Os números dos perfis que jogam sozinhos, que são os da tabela abaixo, não dependem dela. Sem o mutirão no lançamento, o alerta de ocupação do jogador engajado pesa mais: o tempo que sobra precisa vir da feira, dos minijogos, da decoração e da limpeza de obstáculos, que é a forma visível das 30 expansões de terra.

## Resposta curta

O jogo fica nem fácil nem difícil demais se três coisas valerem ao mesmo tempo: o avanço é limitado pela **capacidade do sítio** (canteiros, animais, horas de construção), e não por quantos toques o jogador dá; o conteúdo destravado por nível é uma **rampa de cerca de três meses** para o jogador mais dedicado; e, depois dela, o que segura o jogador são **sistemas que se renovam sozinhos** (maestria, vila, liga de cooperativas, temporada, coleções) mais um pacote mensal pequeno de conteúdo.

Com as tabelas propostas, a simulação de 180 dias dá:

| Perfil | 1ª sessão | D1 | D7 | D30 | D90 | D180 | Chega ao nível 60 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Casual (2 sessões de 5 min) | nível 5 | 6 | 11 | 20 | 35 | 45 | depois de um ano (estimativa) |
| Regular (5 sessões, 40 min/dia) | nível 5 | 8 | 17 | 31 | 48 | 61 | dia 164 |
| Engajado (10 sessões, 150 min/dia) | nível 5 | 11 | 22 | 39 | 58 | 65 | dia 99 |

- **Ninguém "zera" em dois dias**: no fim do segundo dia o engajado está no nível 14 de 60.
- **O engajado não fica sem jogo em um ou dois meses**: chega ao último nível com conteúdo de lançamento no dia 99. Daí em diante cada nível ("nível de mestre") custa 3,25 vezes o nível 60, o que dá a ele um nível a cada 16 ou 17 dias, perto dos 2 níveis por mês do conteúdo mensal proposto. Aos 180 dias ele tem 315 de 465 estrelas de maestria.
- **Pagar comprime pouco**: de 1,07 a 1,12 vez no tempo até o nível 60 nos três perfis pagantes simulados, inclusive um teste de estresse gastando cerca de R$ 670 por mês. O limite de desenho proposto é 1,25 vez.
- **Jogar com amigos ajuda, mas não atropela**: um regular com três amigos ajudando todo dia chega ao nível 60 no dia 136 em vez do 164 (1,21 vez).
- **Só com o conteúdo do MVP (níveis 1 a 30) o engajado zera no dia 15** e o regular no dia 27. O MVP serve para o alfa fechado; o lançamento público precisa do conteúdo até o nível 60 e dos sistemas renováveis.

O alerta principal da simulação não é de ritmo, é de **ocupação**: o próprio sítio só oferece de 40 a 60 minutos de ação útil por dia a quem joga 150. O restante do tempo do jogador engajado precisa vir do mutirão no sítio dos amigos, da feira, dos minijogos e da decoração.

## Como os líderes do gênero dosam a progressão

**Limite da evidência.** Os números desta seção vêm dos resumos que o buscador devolveu para cada página em 11 de novembro de 2026. As páginas em si (wikis de fãs, suporte das editoras) não puderam ser abertas neste ambiente; a lista de endereços bloqueados está no fim do documento. As wikis são mantidas por fãs e podem estar defasadas. O que vem só da memória do autor está marcado como *não verificado*. Nada daqui foi copiado para as tabelas do projeto: as referências servem para entender formato de curva e ordem de grandeza de tempo.

| Jogo | O que se observa | Fonte |
|---|---|---|
| Hay Day | XP para subir de nível: 27 (nível 1), 50 (nível 5), 960 (nível 10), 2.880 (nível 15), 6.320 (nível 20), 14.000 (nível 25), 26.100 (nível 30), 157.000 (nível 50). Do 50 em diante, cada nível pede 11.000 XP a mais que o anterior. | [wiki, níveis 1–25](https://hayday.fandom.com/wiki/Experience_Levels/Levels_1-25); [wiki, níveis 26–50](https://hayday.fandom.com/wiki/Experience_Levels/Levels_26-50) |
| Hay Day | Itens novos param depois do nível 126; a tabela segue até o nível 300 só com diamantes e campos. Diamantes por nível: 12 do nível 101 ao 149. | [wiki, níveis](https://hayday.fandom.com/wiki/Experience_Levels); [wiki, experiência](https://hayday.fandom.com/wiki/Experience) |
| Hay Day | Culturas de campo: trigo 2 min, milho 5 min, cenoura 10 min, soja 20 min, cana 30 min, abóbora 3 h; a mais longa é o morango, 8 h. Cerca de 40 culturas de campo e 17 árvores e arbustos (contagem aproximada feita sobre a tabela). | [wiki, culturas](https://hayday.fandom.com/wiki/Crops_List) |
| Hay Day | Celeiro começa com 50 espaços e cresce 25 por ampliação até 1.000, depois 50; cada ampliação pede uma peça a mais de cada um de três materiais. Silo nível 1: 50. | [wiki, celeiro](https://hayday.fandom.com/wiki/Barn); [wiki, silo](https://hayday.fandom.com/wiki/Silo) |
| Hay Day | Quadro de pedidos do caminhão: 1 pedido no começo, até 9 no nível 32; descartar um pedido impõe espera de 6 a 30 min conforme o nível. | [wiki, caminhão](https://hayday.fandom.com/wiki/Truck) |
| Hay Day | Derby: competição semanal entre vizinhanças, de terça a segunda, a partir do nível 18, em cinco ligas; ligas mais altas permitem mais tarefas por jogador. | [suporte Supercell, derby](https://support.supercell.com/hay-day/en/articles/about-the-derby.html); [ligas](https://support.supercell.com/hay-day/en/articles/leagues.html) |
| Hay Day | Maestria por construção medida em horas de produção: terceira estrela da padaria com 560 h, do laticínio com 360 h; a terceira estrela deixa a produção 15% mais rápida. | [wiki, padaria](https://hayday.fandom.com/wiki/Bakery); [wiki, laticínio](https://hayday.fandom.com/wiki/Dairy) |
| Hay Day | Anúncios opcionais em pontos fixos: acelerar construção de produção, ofertas do dia, bilhetes de cinema. | [suporte Supercell](https://support.supercell.com/hay-day/en/articles/in-game-advertisements.html) |
| Hay Day | Relatos de jogadores: "quatro anos para chegar ao nível 34" jogando de forma intermitente; queixa de lentidão depois de cinco meses. São casos, não medida. | [Saratoga Falcon](https://saratogafalcon.org/?p=16447); [Şikayetvar](https://www.sikayetvar.com/en/hay-day-us/hay-day-takes-too-long-to-level-up-and-makes-the-game-boring) |
| Township | XP exigido: 130.727 no nível 50; 605.000 no 90; 802.000 no 110; 939.000 no 125; 982.000 no 130. No 130 ainda há desbloqueios (casa e edifício comunitário); a tabela é "1 a 130+". | [wiki, níveis](https://township.fandom.com/wiki/Level_up) |
| Township | Regata: semanal, 7 dias, temporadas de 4 semanas; limite de tarefas por jogador por liga de 9, 11, 13, 15 e 17; times a partir do nível 12; 12 tarefas no quadro. | [wiki, regata](https://township.fandom.com/wiki/Regatta); [ajuda Playrix](https://playrix.helpshift.com/hc/en/3-township/faq/16614-what-changed-in-teams-and-the-regatta-1765959232/); [ajuda Playrix, regata](https://playrix.helpshift.com/hc/en/3-township/faq/15638-about-the-regatta) |
| Stardew Valley | História principal em cerca de 52 h; completar tudo, de 150 a 200 h. Cada habilidade tem 10 níveis e pede 15.000 XP no total. | [TheGamer](https://www.thegamer.com/how-long-beat-stardew-valley/); [Looper](https://www.looper.com/602086/how-long-does-it-take-to-beat-stardew-valley/); [wiki, habilidades](https://stardewvalleywiki.com/Skills) |
| Stardew Valley | No multijogador, o anfitrião escolhe carteira compartilhada ou separada; habilidades, energia e amizades são de cada jogador. | [wiki, multijogador](https://stardewvalleywiki.com/Multiplayer) |
| FarmVille 2: Country Escape | Cooperativas a partir do nível 11; ajudantes nos níveis 8 e 9; análises reclamam de esperas que passam de minutos a horas (atribuição incerta entre os guias). | [iMore](https://www.imore.com/farmville-2-country-escape-top-10-tips-tricks-and-cheats-you-need-know); [Gamezebo](https://www.gamezebo.com/walkthroughs/farmville-2-country-escape-walkthrough/) |
| Family Island | Energia regenera até um teto definido pelo nível da casa e para quando enche. | [suporte do jogo](https://support.awem.com/hc/en-gb/articles/4410617606162-My-full-energy-didn-t-restore-overnight-Why-How-can-I-restore-energy-faster) |
| Animal Crossing: Pocket Camp | Amizade com teto que começa em 7 e sobe com amenidades; o teto geral foi de 20 para 25 em julho de 2018. Um guia antigo dá teto 60 para o nível do jogador. | [wiki, amenidades](https://animalcrossingpocketcamp.wiki.gg/wiki/Amenity); [Animal Crossing World](https://animalcrossingworld.com/2018/07/higher-friendship-levels-item-sorting-options-and-faster-conversations-in-animal-crossing-pocket-camp-v1-6-0/); [Twinfinite](https://twinfinite.net/guides/animal-crossing-pocket-camp-max-level-cap/) |
| Animal Crossing: New Horizons | Não se achou dado oficial de horas jogadas. | — |
| Grow a Garden (Roblox) | Loja de sementes reabastece a cada 5 minutos pelo relógio real; críticas de inflação que dificulta a entrada de novatos (atribuição incerta entre os guias). | [gag.gg](https://gag.gg/guides/seed-restock-and-values); [Gamezebo](https://www.gamezebo.com/walkthroughs/grow-a-garden-pet-eggs/) |
| Farm Together 2 | O tempo avança com o jogador ausente; o dono define o que visitantes podem fazer. | [PlayStation Store](https://store.playstation.com/en-us/concept/10012795); [Co-Optimus](https://www.co-optimus.com/game/15226/pc/farm-together-2.html) |
| Clash of Clans (preço do tempo) | Pular 1 hora custa 20 gemas e pular 1 dia custa 260; a função é feita de segmentos de reta, com preço por hora que cai conforme a espera cresce. | [Game Developer](https://gamedeveloper.com/business/clash-of-clans-time-monetization-formulas-demistifyed) |
| Desenho de sessão | Crítica a temporizadores de 4, 8 e 12 h que prendem o jogador; defesa de ciclos diários, semanais e mensais. Recompensas de retorno com teto por sessão como mecânica de compromisso. | [Mobile Free to Play](https://mobilefreetoplay.com/?p=205); [GameAnalytics](https://www.gameanalytics.com/blog/appointment-mechanics-how-to-keep-your-players-in-game) |

O que isso ensina sobre formato e escala:

1. **A curva tem três fases.** Rampa inicial de minutos por nível; miolo íngreme, em que o XP por nível cresce mais ou menos com o cubo do nível (em Hay Day, de 960 no nível 10 a 157.000 no nível 50, o expoente é perto de 3,2); e cauda quase linear quando o conteúdo acaba (Hay Day soma 11.000 por nível depois do 50; em Township a subida entre os níveis 110 e 130 é de 8 a 10 mil por nível). Os expoentes são cálculo deste documento sobre os números das wikis.
2. **Conteúdo por nível dura anos nos líderes porque foi acumulado em mais de dez anos.** Hay Day destrava itens até o nível 126; Township, além do 130. Um jogo novo não tem como lançar com isso. O que os veteranos fazem depois do último desbloqueio, segundo as fontes já reunidas no relatório de mercado, é competição cooperativa semanal, maestria, decoração, eventos e passe.
3. **A escada de temporizadores vai de 1–2 minutos a 8 horas nas culturas** e os armazéns começam pequenos (50) e crescem aos poucos com peças. É a origem das queixas de armazém e relógio registradas no relatório.
4. **O preço de pular tempo é côncavo**: a hora fica mais barata quanto mais longa a espera.
5. **No cooperativo, a regra mais comum é que habilidade e progresso sejam individuais**, mesmo quando o espaço é compartilhado.

Lacunas: não se achou em fonte aberta quanto tempo um jogador casual ou engajado leva para níveis-marco em nenhum dos jogos, nem a taxa diária de moeda premium gratuita. A lembrança do autor é de que em Hay Day um jogador diário leva de dois a quatro meses até o nível 50 e recebe poucos diamantes gratuitos por dia; isso é *não verificado* e não foi usado nos números.

## Princípios de desenho

1. **A capacidade manda, não o toque.** O que o sítio produz por dia é limitado por canteiros, animais e horas de construção. Quem joga mais ocupa melhor essa capacidade, mas não a multiplica. É isso que mantém sob controle, de uma vez só, o jogador que joga muito, o que paga, o que gira culturas curtas sem parar e o que tem amigos ajudando.
2. **Pedidos são o motor do XP.** Colher e produzir dão retorno imediato e pequeno; entregar pedidos dá o grosso. Como o pedido exige produto pronto, o XP fica amarrado à capacidade.
3. **Dois relógios com papéis distintos.** O longo (culturas, animais, filas) traz o jogador de volta; o curto (feira a cada 5 minutos, culturas de 1 a 8 minutos) dá o que fazer dentro da sessão.
4. **Toda válvula tem caminho gratuito visível e sem sorteio.** Peças de reforma chegam por um medidor ("mais 2 pedidos para a próxima peça"), nunca por sorte, e ficam fora do armazém.
5. **Os sumidouros de moedas acompanham a renda.** Todo custo é múltiplo da renda esperada de um nível inteiro de jogo naquele nível. Assim o saldo do jogador fica perto de um dia de renda do começo ao fim.
6. **Recompensas fixas são proporcionais ao nível de quem recebe.** Missões, baú de anúncio, minijogos e a diária de ajudante pagam múltiplos do valor de um pedido no nível do próprio jogador. Amigos de níveis diferentes recebem algo que vale para cada um.
7. **Conteúdo por nível é a rampa; depois dela, sistemas.** Do nível 1 ao 60 há sempre algo novo a cada nível. Do 60 em diante, o que se renova não depende de arte nova toda semana.
8. **Cash compra tempo com preço côncavo e teto diário**, mais conveniência e cosméticos. Não compra moedas, rendimento exclusivo nem pontuação.
9. **Nada entra sem passar pela simulação.** Conteúdo e regras são dados; a simulação roda em um minuto e acusa nível sem desbloqueio, receita impossível e desvio de ritmo.

## Personas e metas de ritmo

| Persona | Rotina simulada | Papel |
|---|---|---|
| Casual | 2 sessões de 5 min (7h30 e 20h30); não gira culturas curtas; 2 anúncios por dia | Piso: o jogo precisa funcionar para ela |
| Regular | 5 sessões de 8 min (7h30, 12h15, 16h30, 19h30, 22h); 4 anúncios | Referência das metas |
| Engajado | 10 sessões de 15 min entre 7h e 22h30; 6 anúncios | Teto sem pagar |
| Regular pagante | Regular + pacote inicial no dia 2 + passe todo mês + R$ 12,90 por mês | Pagante típico (cerca de R$ 34 por mês) |
| Engajado pagante | Engajado + pacote inicial + passe + R$ 129,90 por mês | Pagante forte (cerca de R$ 150 por mês) |
| Teste de estresse: baleia | Engajado + passe + 8.000 cash por mês, acelerando tudo o que o teto diário deixa | Limite do que o dinheiro compra |
| Teste de estresse: milho sem parar | Engajado girando a cultura de 1 minuto em todos os canteiros durante toda a sessão | Limite do que o grind compra |
| Regular com 3 amigos | Regular + 4 visitas de 6 min de amigos por dia + diária cheia ajudando os outros | Efeito do mutirão |
| Casual carregado | Casual + 7 visitas de 10 min de amigos engajados por dia | Pior caso de "carregar" alguém |

Metas recebidas e como ficaram:

| Meta | Simulado | Proposta |
|---|---|---|
| 1ª sessão: 3 a 5 níveis em cerca de 10 min | 4 níveis em 7,9 min (nível 5) | Manter |
| Fim do dia 1: nível 7 a 9 (regular) | 8 | Manter |
| Dia 7: nível 15 a 18 (regular) | 17 | Manter |
| Dia 30: nível 28 a 32 (regular) | 31 | Manter |
| Dia 30: engajado no máximo 40 a 45 | 39 | Apertar para 37 a 41: o engajado ganha de 1,6 a 2,9 vezes o XP diário do regular, não 4 vezes como no tempo de jogo |
| Último nível com conteúdo de lançamento não antes do dia 90 (engajado sem pagar) | Dia 99 | Manter "não antes do dia 90"; regular por volta do dia 160 |
| Pagar comprime por fator limitado | 1,07 a 1,12 vez | Limite de desenho de 1,25 vez no tempo até o nível 60 |
| (nova) Casual | Nível 20 no dia 30, 35 no dia 90 | Aceitar: o conteúdo de lançamento dura mais de um ano para ela |
| (nova) Depois do teto | Um nível de mestre a cada 16 ou 17 dias para o engajado | Ficar perto dos 2 níveis por mês do conteúdo mensal |

A semente do gerador de pedidos muda pouco o resultado: em cinco sementes, o dia do teto do engajado ficou entre 99 e 100 e o do regular entre 162 e 164.

## A economia proposta

### Curva de níveis

XP para sair do nível L:

- níveis 1 a 4: `5 × L^1,8`
- níveis 4 a 16: continua do valor do nível 4 com expoente 3,35
- níveis 16 a 30: expoente 2,3
- níveis 30 a 60: expoente 2,8
- níveis de mestre (61 em diante): `3,25 × XP do nível 60 × (1 + 0,02 × (L − 61))`

Tudo arredondado para dois algarismos significativos. São 224.329 XP acumulados até o nível 30 e 2.877.329 até o 60. O miolo íngreme (4 a 16) existe porque a renda de XP por dia cresce muito rápido na primeira semana, quando cada nível traz capacidade nova; o trecho 16 a 30 é mais suave para que a terceira e a quarta semanas não pareçam uma parede; o trecho 30 a 60 volta a apertar porque a capacidade já está quase toda comprada. O salto para os níveis de mestre é deliberado: depois do 60 cada nível novo de conteúdo deve durar cerca de duas semanas para o engajado.

Ao chegar a um nível o jogador recebe moedas (1,5 vez o valor-alvo de um pedido naquele nível), 2 peças de reforma e cash: 1 por nível até o 20, 2 do 21 ao 40, 3 do 41 ao 60 e 10 por nível de mestre.

| Nível | XP para o próximo | XP acumulado | Moedas ao chegar | Cash ao chegar | Desbloqueia |
|---:|---:|---:|---:|---:|---|
| 1 | 5 | 0 | 0 | 0 | Cultura: Milho; Recurso: Quadro de pedidos (2 vagas) e banca de venda direta; Recurso: Entrar como ajudante no sítio de um amigo (por link) |
| 2 | 17 | 5 | 36 | 1 | Cultura: Feijão |
| 3 | 36 | 22 | 59 | 1 | Construção: Moinho; Receita: Fubá; Terra 1 (+2 canteiros); Quadro de pedidos: 3 vagas; Recurso: Feira (relógio curto, reabastece a cada 5 min) |
| 4 | 61 | 58 | 85 | 1 | Cultura: Mandioca; Galinheiro (3 galinhas); Receita: Ração de galinha; Terra 2 (+1 canteiro) |
| 5 | 130 | 119 | 110 | 1 | Construção: Casa de farinha; Receita: Farinha de mandioca; Recurso: Missões diárias e calendário de retorno; Recurso: Mutirão: abrir o próprio sítio para até 3 amigos |
| 6 | 240 | 249 | 140 | 1 | Cultura: Tomate; Terra 3 (+1 canteiro); Quadro de pedidos: 4 vagas |
| 7 | 400 | 489 | 170 | 1 | Cultura: Abóbora; Construção: Fogão a lenha; Receita: Polvilho; Receita: Bolo de fubá |
| 8 | 620 | 889 | 200 | 1 | Cultura: Cana-de-açúcar; Receita: Feijão tropeiro; Terra 4 (+2 canteiros); Vila: estágio 1; Recurso: Pesca (minijogo) e restauração do sítio e da vila |
| 9 | 920 | 1.509 | 230 | 1 | Árvore: Laranjeira; Curral (2 vacas); Receita: Ração de vaca; Receita: Molho de tomate |
| 10 | 1.300 | 2.429 | 270 | 1 | Receita: Tapioca; Receita: Pamonha; Terra 5 (+1 canteiro); Vila: estágio 2; Quadro de pedidos: 5 vagas; Recurso: Álbum de coleções |
| 11 | 1.800 | 3.729 | 300 | 1 | Cultura: Arroz; Construção: Engenho; Receita: Açúcar mascavo |
| 12 | 2.400 | 5.529 | 340 | 1 | Galinheiro +3; Receita: Arroz com feijão; Receita: Garapa; Terra 6 (+2 canteiros); Vila: estágio 3; Recurso: Barraca na feira (minijogo) |
| 13 | 3.100 | 7.929 | 370 | 1 | Cultura: Melancia; Receita: Melado; Vila: estágio 4 |
| 14 | 4.000 | 11.029 | 410 | 1 | Construção: Queijaria; Receita: Queijo minas; Terra 7 (+1 canteiro) |
| 15 | 5.100 | 15.029 | 440 | 1 | Árvore: Bananeira; Receita: Pão de queijo; Vila: estágio 5; Quadro de pedidos: 6 vagas; Recurso: Maestria (estrelas por cultura, animal e receita) |
| 16 | 6.300 | 20.129 | 480 | 1 | Receita: Doce de abóbora; Receita: Manteiga; Terra 8 (+1 canteiro) |
| 17 | 7.200 | 26.429 | 520 | 1 | Cultura: Café; Curral +2; Vila: estágio 6 |
| 18 | 8.300 | 33.629 | 560 | 1 | Construção: Torrefação; Receita: Rapadura; Receita: Café torrado; Terra 9 (+2 canteiros); Recurso: Cooperativas e liga semanal |
| 19 | 9.400 | 41.929 | 600 | 1 | Receita: Bolo de laranja; Vila: estágio 7 |
| 20 | 11.000 | 51.329 | 630 | 1 | Cultura: Amendoim; Receita: Cafezinho; Terra 10 (+1 canteiro); Vila: estágio 8; Recurso: Passe de temporada e eventos sazonais |
| 21 | 12.000 | 62.329 | 670 | 2 | Receita: Bolo de banana; Receita: Requeijão |
| 22 | 13.000 | 74.329 | 710 | 2 | Árvore: Cajueiro; Receita: Amendoim torrado; Terra 11 (+2 canteiros); Vila: estágio 9; Quadro de pedidos: 7 vagas |
| 23 | 15.000 | 87.329 | 760 | 2 | Cultura: Batata-doce |
| 24 | 16.000 | 102.329 | 800 | 2 | Galinheiro +3; Receita: Doce de batata-doce; Terra 12 (+1 canteiro); Vila: estágio 10 |
| 25 | 18.000 | 118.329 | 840 | 2 | Receita: Doce de leite; Recurso: Nota da fazenda (vitrine de decoração) |
| 26 | 19.000 | 136.329 | 880 | 2 | Cultura: Abacaxi; Terra 13 (+1 canteiro); Vila: estágio 11 |
| 27 | 21.000 | 155.329 | 920 | 2 | Receita: Paçoca; Vila: estágio 12 |
| 28 | 23.000 | 176.329 | 970 | 2 | Curral +2; Receita: Café com leite; Terra 14 (+2 canteiros) |
| 29 | 25.000 | 199.329 | 1.000 | 2 | Receita: Doce de abacaxi; Vila: estágio 13 |
| 30 | 27.000 | 224.329 | 1.100 | 2 | Receita: Cuscuz; Terra 15 (+1 canteiro); Quadro de pedidos: 8 vagas |
| 31 | 29.000 | 251.329 | 1.100 | 2 | Cultura: Soja; Vila: estágio 14 |
| 32 | 32.000 | 280.329 | 1.100 | 2 | Construção: Casa de sucos; Receita: Suco de laranja; Terra 16 (+2 canteiros) |
| 33 | 35.000 | 312.329 | 1.200 | 2 | Cultura: Quiabo; Receita: Quiabo refogado; Vila: estágio 15 |
| 34 | 38.000 | 347.329 | 1.200 | 2 | Aprisco (2 cabras); Receita: Ração de cabra; Receita: Vitamina de banana; Terra 17 (+1 canteiro); Vila: estágio 16 |
| 35 | 41.000 | 385.329 | 1.300 | 2 | Árvore: Mangueira; Receita: Queijo de cabra |
| 36 | 45.000 | 426.329 | 1.300 | 2 | Cultura: Pimenta; Receita: Suco de caju; Terra 18 (+1 canteiro); Vila: estágio 17 |
| 37 | 48.000 | 471.329 | 1.400 | 2 | Receita: Tucupi; Receita: Suco de abacaxi |
| 38 | 52.000 | 519.329 | 1.400 | 2 | Construção: Doceria; Receita: Suco de manga; Receita: Bananada; Terra 19 (+2 canteiros); Vila: estágio 18 |
| 39 | 56.000 | 571.329 | 1.500 | 2 | Cultura: Girassol |
| 40 | 60.000 | 627.329 | 1.500 | 2 | Apiário (2 colmeias); Receita: Óleo de girassol; Receita: Doce de caju; Terra 20 (+1 canteiro); Vila: estágio 19; Quadro de pedidos: 9 vagas |
| 41 | 64.000 | 687.329 | 1.600 | 3 | Aprisco +2; Receita: Pão de mel; Vila: estágio 20 |
| 42 | 69.000 | 751.329 | 1.600 | 3 | Cultura: Maracujá; Receita: Suco de maracujá; Terra 21 (+2 canteiros) |
| 43 | 73.000 | 820.329 | 1.700 | 3 | Árvore: Cacaueiro; Receita: Pé de moleque; Vila: estágio 21 |
| 44 | 78.000 | 893.329 | 1.700 | 3 | Construção: Chocolateria; Receita: Cacau torrado; Terra 22 (+1 canteiro) |
| 45 | 83.000 | 971.329 | 1.700 | 3 | Cultura: Erva-mate; Receita: Mate; Vila: estágio 22 |
| 46 | 89.000 | 1.054.329 | 1.800 | 3 | Receita: Geleia de pimenta; Receita: Chocolate; Terra 23 (+1 canteiro) |
| 47 | 94.000 | 1.143.329 | 1.800 | 3 | Árvore: Açaizeiro; Apiário +2; Vila: estágio 23 |
| 48 | 100.000 | 1.237.329 | 1.900 | 3 | Receita: Açaí na tigela; Receita: Chocolate quente; Terra 24 (+2 canteiros); Vila: estágio 24 |
| 49 | 110.000 | 1.337.329 | 1.900 | 3 | Cultura: Algodão; Receita: Brigadeiro |
| 50 | 110.000 | 1.447.329 | 2.000 | 3 | Construção: Tecelagem; Receita: Fio de algodão; Terra 25 (+1 canteiro); Vila: estágio 25 |
| 51 | 120.000 | 1.557.329 | 2.000 | 3 | Receita: Bombom de caju |
| 52 | 120.000 | 1.677.329 | 2.100 | 3 | Aprisco +2; Receita: Balas de mel; Receita: Tecido de chita; Terra 26 (+2 canteiros); Vila: estágio 26 |
| 53 | 130.000 | 1.797.329 | 2.100 | 3 | Cultura: Guaraná; Receita: Guaraná em pó |
| 54 | 140.000 | 1.927.329 | 2.200 | 3 | Receita: Refresco de guaraná; Receita: Bandeirinhas; Terra 27 (+1 canteiro); Vila: estágio 27 |
| 55 | 150.000 | 2.067.329 | 2.200 | 3 | Receita: Trufa de maracujá |
| 56 | 150.000 | 2.217.329 | 2.300 | 3 | Apiário +2; Receita: Chapéu de palha; Terra 28 (+1 canteiro); Vila: estágio 28 |
| 57 | 160.000 | 2.367.329 | 2.300 | 3 | Receita: Rede de dormir; Vila: estágio 29 |
| 58 | 170.000 | 2.527.329 | 2.400 | 3 | Receita: Colcha de retalhos; Terra 29 (+2 canteiros) |
| 59 | 180.000 | 2.697.329 | 2.500 | 3 | Receita: Queijo curado; Vila: estágio 30 |
| 60 | 190.000 | 2.877.329 | 2.500 | 3 | Receita: Cesta da roça; Terra 30 (+1 canteiro) |
| 61 (mestre 1) | 610.000 | 3.067.329 | 2.600 | 10 | conteúdo mensal |
| 62 (mestre 2) | 620.000 | 3.677.329 | 2.600 | 10 | conteúdo mensal |
| 63 (mestre 3) | 630.000 | 4.297.329 | 2.700 | 10 | conteúdo mensal |
| 64 (mestre 4) | 640.000 | 4.927.329 | 2.700 | 10 | conteúdo mensal |
| 65 (mestre 5) | 650.000 | 5.567.329 | 2.800 | 10 | conteúdo mensal |

### De onde vem o XP

| Fonte | Regra | Parte do XP do regular em 180 dias |
|---|---|---:|
| Pedidos | 0,7 × valor do pedido | 38% |
| Colheita (culturas, frutas, animais) | Culturas e frutas: `2 × T^0,42` por canteiro ou árvore; animais: `2,4 × ciclo^0,42` por coleta (T em minutos) | 27% |
| Maestria | 24 × nível do item × número da estrela, uma vez por estrela | 12% |
| Missões diárias | 0,3 × TV por missão e 0,6 × TV no baú | 9% |
| Produção | `3 × T^0,5` por fornada coletada | 9% |
| Feira, minijogos, vila | Freguês: 0,4 × valor vendido; minijogo: 0,1 × TV por tentativa; estágio da vila: 5% do XP do nível exigido | 5% |

TV é o valor-alvo de um pedido no nível do jogador (definido adiante). O ajudante de mutirão não gera XP de colheita nem de produção para o dono.

### Moedas: de onde vêm e para onde vão

Todo custo em moedas é múltiplo de uma mesma referência, `ref(L) = 2,4 × L^2,85`, que aproxima a renda de um nível inteiro de jogo no nível L:

| Compra | Múltiplo de ref(L) | Nível usado |
|---|---:|---|
| Construção | 1,2 | o do desbloqueio |
| Lote de animais | 0,5 | o do lote |
| Expansão de terra | 0,45 | o da expansão |
| Muda de árvore | 0,15, 0,225 e 0,3 (1º, 2º e 3º lotes) | o do lote |
| Terceira vaga de produção | 0,4 | cinco níveis depois da construção |
| Estágio da vila | 1,0 | o do estágio |
| Cota da festa da vila | 0,2 | o do jogador, até o 60 |

A ampliação j do armazém custa `40 × j^2,2` moedas.

Fontes de moedas em 180 dias de simulação:

| Fonte | Casual | Regular | Engajado |
|---|---:|---:|---:|
| Pedidos | 40% | 45% | 49% |
| Banca (excedente pelo preço base) | 24% | 25% | 24% |
| Anúncios (baú e dobro de pedido) | 15% | 11% | 8% |
| Missões | 10% | 10% | 7% |
| Feira (fregueses) | 2% | 4% | 6% |
| Calendário, subida de nível e minijogos | 8% | 6% | 5% |

Os sumidouros estão na tabela "Para onde vão as moedas" dos resultados: no regular, terra, vila, árvores, construções e animais levam cerca de três quartos do que ele ganha, e sementes, armazém, terceira vaga e decoração o restante.

Quatro regras seguram a inflação:

1. **Custos indexados à renda por nível.** O saldo do jogador fica perto de um dia de renda do nível 1 ao 60 (indicador "saldo em dias de renda" nos resultados).
2. **Quase toda moeda tem lastro em produção.** Pedidos, banca e feira pagam por itens produzidos. As recompensas sem lastro (missões, calendário, baú, minijogos) são múltiplos pequenos do valor de um pedido.
3. **Há sumidouro renovável depois do último desbloqueio**: festa da vila semanal e decoração.
4. **Cash não vira moeda**, e moedas não passam de um jogador para outro.

### Culturas

Valor bruto de um canteiro colhido: `G = 4 × T^0,5` moedas (T em minutos). Cada canteiro rende 3 unidades; o preço base da unidade é G ÷ 3; a semente custa 25% de G; o XP é `2 × T^0,42`. O expoente 0,5 faz a cultura curta render mais por hora e a longa render mais por toque: girar milho dá trabalho e pouco retorno, plantar abacaxi antes de dormir dá muito retorno com dois toques. O milho nunca trava o jogador: sem moedas, a semente de milho sai de graça.

| Cultura | Nível | Tempo | Semente (moedas/canteiro) | Rende (un./canteiro) | Preço base (moedas/un.) | XP por canteiro | Lucro por canteiro | Fase |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Milho | 1 | 1 min | 1 | 3 | 1 | 2 | 2 | MVP |
| Feijão | 2 | 3 min | 2 | 3 | 2 | 3 | 4 | MVP |
| Mandioca | 4 | 8 min | 3 | 3 | 4 | 5 | 9 | MVP |
| Tomate | 6 | 20 min | 4 | 3 | 6 | 7 | 14 | MVP |
| Abóbora | 7 | 4 h | 15 | 3 | 21 | 20 | 48 | MVP |
| Cana-de-açúcar | 8 | 45 min | 7 | 3 | 9 | 10 | 20 | MVP |
| Arroz | 11 | 1 h 30 | 9 | 3 | 13 | 13 | 30 | MVP |
| Melancia | 13 | 8 h | 22 | 3 | 29 | 27 | 65 | MVP |
| Café | 17 | 2 h 30 | 12 | 3 | 16 | 16 | 36 | MVP |
| Amendoim | 20 | 3 h | 13 | 3 | 18 | 18 | 41 | MVP |
| Batata-doce | 23 | 6 h | 19 | 3 | 25 | 24 | 56 | MVP |
| Abacaxi | 26 | 12 h | 27 | 3 | 36 | 32 | 81 | MVP |
| Soja | 31 | 30 min | 5 | 3 | 7 | 8 | 16 | Lançamento |
| Quiabo | 33 | 2 h | 11 | 3 | 15 | 15 | 34 | Lançamento |
| Pimenta | 36 | 5 h | 17 | 3 | 23 | 22 | 52 | Lançamento |
| Girassol | 39 | 1 h 15 | 9 | 3 | 12 | 12 | 27 | Lançamento |
| Maracujá | 42 | 10 h | 24 | 3 | 33 | 29 | 75 | Lançamento |
| Erva-mate | 45 | 16 h | 31 | 3 | 41 | 36 | 92 | Lançamento |
| Algodão | 49 | 3 h 30 | 14 | 3 | 19 | 19 | 43 | Lançamento |
| Guaraná | 53 | 24 h | 38 | 3 | 51 | 42 | 115 | Lançamento |

A ordem não é crescente de propósito. A abóbora de 4 h chega no nível 7 para que o jogador termine o primeiro dia com algo plantado para a volta, e a melancia de 8 h no nível 13 dá a cultura "de dormir" na primeira semana. O café foi tratado como cultura de canteiro, e não como arbusto perene, por simplicidade de jogo.

### Árvores frutíferas

Ativo lento: a muda demora a amadurecer e depois dá 3 frutas por ciclo, para sempre. Valor bruto por colheita igual a 80% do de um canteiro com a mesma duração. Seis mudas por tipo, liberadas em três lotes.

| Árvore | Fruta | Nível | Amadurece em | Colheita a cada | Rende (un.) | Preço base (moedas/un.) | XP por colheita | Mudas liberadas (nível: qtd × custo) | Fase |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| Laranjeira | Laranja | 9 | 4 h | 2 h | 3 | 12 | 15 | nv 9: 2 × 190; nv 13: 2 × 810; nv 19: 2 × 3.200 | MVP |
| Bananeira | Banana | 15 | 8 h | 4 h | 3 | 17 | 20 | nv 15: 2 × 810; nv 19: 2 × 2.400; nv 25: 2 × 6.900 | MVP |
| Cajueiro | Caju | 22 | 12 h | 6 h | 3 | 20 | 24 | nv 22: 2 × 2.400; nv 26: 2 × 5.800; nv 32: 2 × 14.000 | MVP |
| Mangueira | Manga | 35 | 24 h | 8 h | 3 | 23 | 27 | nv 35: 2 × 9.100; nv 39: 2 × 18.000; nv 45: 2 × 37.000 | Lançamento |
| Cacaueiro | Cacau | 43 | 36 h | 10 h | 3 | 26 | 29 | nv 43: 2 × 16.000; nv 47: 2 × 31.000; nv 53: 2 × 59.000 | Lançamento |
| Açaizeiro | Açaí | 47 | 48 h | 12 h | 3 | 29 | 32 | nv 47: 2 × 21.000; nv 51: 2 × 40.000; nv 57: 2 × 73.000 | Lançamento |

### Animais

Cada animal come 1 ração por ciclo e dá 1 produto. O preço base do produto é o custo da ração mais `3 × ciclo^0,5`. As abelhas "comem" girassol, que é a florada delas.

| Animal | Abrigo | Nível | Produto | Ciclo | Come (1 por ciclo) | Preço base do produto | XP por coleta | Lotes (nível: qtd, custo) | Fase |
|---|---|---:|---|---:|---|---:|---:|---|---|
| Galinha | Galinheiro | 4 | Ovo | 20 min | Ração de galinha | 17 | 8 | nv 4: +3, 62; nv 12: +3, 1.400; nv 24: +3, 10.000 | MVP |
| Vaca | Curral | 9 | Leite | 1 h | Ração de vaca | 31 | 13 | nv 9: +2, 630; nv 17: +2, 3.900; nv 28: +2, 16.000 | MVP |
| Cabra | Aprisco | 34 | Leite de cabra | 3 h | Ração de cabra | 50 | 21 | nv 34: +2, 28.000; nv 41: +2, 47.000; nv 52: +2, 93.000 | Lançamento |
| Colmeia de abelhas | Apiário | 40 | Mel | 6 h | Girassol | 69 | 28 | nv 40: +2, 44.000; nv 47: +2, 70.000; nv 56: +2, 120.000 | Lançamento |

### Construções e receitas

Cada construção nasce com 2 vagas na fila, processadas uma de cada vez; produto pronto ocupa a vaga até ser coletado. A terceira vaga se compra com moedas e ferramentas cinco níveis depois da construção. A quarta e a quinta saem por cash ou de graça por maestria da construção (400 e 2.000 itens feitos nela).

| Construção | Nível | Custo (moedas) | Obra | Receitas | 3ª vaga (nível, moedas, ferramentas) | 4ª e 5ª vagas | Fase |
|---|---:|---:|---:|---:|---|---|---|
| Moinho | 3 | 66 | 12 s | 5 | nv 8, 360, 8 | 25 e 50 cash, ou 400 e 2.000 itens feitos | MVP |
| Casa de farinha | 5 | 280 | 1 min | 4 | nv 10, 680, 8 | 25 e 50 cash, ou 400 e 2.000 itens feitos | MVP |
| Fogão a lenha | 7 | 740 | 5 min | 14 | nv 12, 1.100, 8 | 25 e 50 cash, ou 400 e 2.000 itens feitos | MVP |
| Engenho | 11 | 2.700 | 30 min | 4 | nv 16, 2.600, 8 | 25 e 50 cash, ou 400 e 2.000 itens feitos | MVP |
| Queijaria | 14 | 5.300 | 2 h | 6 | nv 19, 4.200, 8 | 25 e 50 cash, ou 400 e 2.000 itens feitos | MVP |
| Torrefação | 18 | 11.000 | 4 h | 7 | nv 23, 7.300, 8 | 25 e 50 cash, ou 400 e 2.000 itens feitos | MVP |
| Casa de sucos | 32 | 56.000 | 8 h | 8 | nv 37, 28.000, 8 | 25 e 50 cash, ou 400 e 2.000 itens feitos | Lançamento |
| Doceria | 38 | 92.000 | 12 h | 7 | nv 43, 43.000, 8 | 25 e 50 cash, ou 400 e 2.000 itens feitos | Lançamento |
| Chocolateria | 44 | 140.000 | 18 h | 5 | nv 49, 63.000, 8 | 25 e 50 cash, ou 400 e 2.000 itens feitos | Lançamento |
| Tecelagem | 50 | 200.000 | 24 h | 6 | nv 55, 88.000, 8 | 25 e 50 cash, ou 400 e 2.000 itens feitos | Lançamento |

Preço base de uma receita: `(1,25 × soma dos insumos + 4 × T^0,6) ÷ unidades que saem`. O fator 1,25 garante que processar sempre vale mais que vender o insumo cru.

| Construção | Receita | Nível | Tempo | Insumos | Sai | Custo dos insumos | Preço base (moedas/un.) | XP por fornada | Fase |
|---|---|---:|---:|---|---:|---:|---:|---:|---|
| Moinho | Fubá | 3 | 1 min | 2 milho | 1 | 2 | 6 | 3 | MVP |
| Moinho | Ração de galinha (ração, não entra em pedidos) | 4 | 2 min | 2 milho, 1 feijão | 3 | 4 | 4 | 4 | MVP |
| Moinho | Ração de vaca (ração, não entra em pedidos) | 9 | 4 min | 2 milho, 1 cana-de-açúcar | 3 | 11 | 8 | 6 | MVP |
| Moinho | Ração de cabra (ração, não entra em pedidos) | 34 | 6 min | 2 soja, 1 milho | 3 | 15 | 10 | 7 | Lançamento |
| Moinho | Óleo de girassol | 40 | 30 min | 3 girassol | 1 | 36 | 76 | 16 | Lançamento |
| Casa de farinha | Farinha de mandioca | 5 | 5 min | 2 mandioca | 1 | 8 | 21 | 7 | MVP |
| Casa de farinha | Polvilho | 7 | 15 min | 3 mandioca | 1 | 12 | 35 | 12 | MVP |
| Casa de farinha | Tapioca | 10 | 20 min | 2 polvilho | 1 | 70 | 112 | 13 | MVP |
| Casa de farinha | Tucupi | 37 | 2 h | 4 mandioca | 1 | 16 | 91 | 33 | Lançamento |
| Fogão a lenha | Bolo de fubá | 7 | 10 min | 2 fubá, 1 ovo | 1 | 29 | 52 | 9 | MVP |
| Fogão a lenha | Feijão tropeiro | 8 | 20 min | 3 feijão, 1 farinha de mandioca, 1 ovo | 1 | 44 | 79 | 13 | MVP |
| Fogão a lenha | Molho de tomate | 9 | 15 min | 3 tomate | 1 | 18 | 43 | 12 | MVP |
| Fogão a lenha | Pamonha | 10 | 30 min | 3 milho, 1 leite | 1 | 34 | 73 | 16 | MVP |
| Fogão a lenha | Arroz com feijão | 12 | 25 min | 2 arroz, 2 feijão | 1 | 30 | 65 | 15 | MVP |
| Fogão a lenha | Pão de queijo | 15 | 40 min | 1 polvilho, 1 queijo minas, 1 ovo | 1 | 160 | 237 | 19 | MVP |
| Fogão a lenha | Doce de abóbora | 16 | 1 h | 2 abóbora, 1 açúcar mascavo | 1 | 92 | 162 | 23 | MVP |
| Fogão a lenha | Bolo de laranja | 19 | 50 min | 2 laranja, 1 ovo, 1 açúcar mascavo, 1 fubá | 1 | 97 | 163 | 21 | MVP |
| Fogão a lenha | Bolo de banana | 21 | 45 min | 2 banana, 1 ovo, 1 fubá | 1 | 57 | 111 | 20 | MVP |
| Fogão a lenha | Doce de batata-doce | 24 | 1 h 15 | 2 batata-doce, 1 açúcar mascavo | 1 | 100 | 178 | 26 | MVP |
| Fogão a lenha | Doce de abacaxi | 29 | 1 h 30 | 2 abacaxi, 1 açúcar mascavo | 1 | 122 | 212 | 28 | MVP |
| Fogão a lenha | Cuscuz | 30 | 20 min | 2 fubá, 1 manteiga | 1 | 114 | 167 | 13 | MVP |
| Fogão a lenha | Quiabo refogado | 33 | 35 min | 3 quiabo, 1 molho de tomate | 1 | 88 | 144 | 18 | Lançamento |
| Fogão a lenha | Pão de mel | 41 | 1 h | 1 mel, 2 fubá, 1 ovo | 1 | 98 | 169 | 23 | Lançamento |
| Engenho | Açúcar mascavo | 11 | 10 min | 3 cana-de-açúcar | 1 | 27 | 50 | 9 | MVP |
| Engenho | Garapa | 12 | 3 min | 2 cana-de-açúcar | 1 | 18 | 30 | 5 | MVP |
| Engenho | Melado | 13 | 30 min | 4 cana-de-açúcar | 1 | 36 | 76 | 16 | MVP |
| Engenho | Rapadura | 18 | 1 h | 2 açúcar mascavo | 1 | 100 | 172 | 23 | MVP |
| Queijaria | Queijo minas | 14 | 30 min | 2 leite | 1 | 62 | 108 | 16 | MVP |
| Queijaria | Manteiga | 16 | 20 min | 2 leite | 1 | 62 | 102 | 13 | MVP |
| Queijaria | Requeijão | 21 | 1 h | 3 leite | 1 | 93 | 163 | 23 | MVP |
| Queijaria | Doce de leite | 25 | 2 h | 2 leite, 1 açúcar mascavo | 1 | 112 | 211 | 33 | MVP |
| Queijaria | Queijo de cabra | 35 | 1 h 30 | 2 leite de cabra | 1 | 100 | 185 | 28 | Lançamento |
| Queijaria | Queijo curado | 59 | 6 h | 3 leite, 1 leite de cabra | 1 | 143 | 315 | 57 | Lançamento |
| Torrefação | Café torrado | 18 | 30 min | 3 café | 1 | 48 | 91 | 16 | MVP |
| Torrefação | Cafezinho | 20 | 5 min | 1 café torrado, 1 açúcar mascavo | 1 | 141 | 187 | 7 | MVP |
| Torrefação | Amendoim torrado | 22 | 45 min | 3 amendoim | 1 | 54 | 107 | 20 | MVP |
| Torrefação | Paçoca | 27 | 1 h 30 | 2 amendoim torrado, 1 açúcar mascavo, 1 farinha de mandioca | 1 | 285 | 416 | 28 | MVP |
| Torrefação | Café com leite | 28 | 8 min | 1 café torrado, 1 leite | 1 | 122 | 166 | 8 | MVP |
| Torrefação | Mate | 45 | 1 h | 3 erva-mate | 1 | 123 | 200 | 23 | Lançamento |
| Torrefação | Guaraná em pó | 53 | 2 h | 3 guaraná | 1 | 153 | 262 | 33 | Lançamento |
| Casa de sucos | Suco de laranja | 32 | 15 min | 3 laranja | 1 | 36 | 65 | 12 | Lançamento |
| Casa de sucos | Vitamina de banana | 34 | 20 min | 2 banana, 1 leite | 1 | 65 | 105 | 13 | Lançamento |
| Casa de sucos | Suco de caju | 36 | 30 min | 3 caju | 1 | 60 | 106 | 16 | Lançamento |
| Casa de sucos | Suco de abacaxi | 37 | 30 min | 2 abacaxi, 1 açúcar mascavo | 1 | 122 | 183 | 16 | Lançamento |
| Casa de sucos | Suco de manga | 38 | 30 min | 3 manga | 1 | 69 | 117 | 16 | Lançamento |
| Casa de sucos | Suco de maracujá | 42 | 25 min | 2 maracujá, 1 açúcar mascavo | 1 | 116 | 173 | 15 | Lançamento |
| Casa de sucos | Açaí na tigela | 48 | 1 h | 3 açaí, 1 banana, 1 mel | 1 | 173 | 263 | 23 | Lançamento |
| Casa de sucos | Refresco de guaraná | 54 | 40 min | 1 guaraná em pó, 1 açúcar mascavo | 1 | 312 | 427 | 19 | Lançamento |
| Doceria | Bananada | 38 | 1 h 30 | 3 banana, 1 açúcar mascavo | 1 | 101 | 186 | 28 | Lançamento |
| Doceria | Doce de caju | 40 | 2 h | 3 caju, 1 açúcar mascavo | 1 | 110 | 208 | 33 | Lançamento |
| Doceria | Pé de moleque | 43 | 2 h | 2 amendoim torrado, 1 rapadura | 1 | 386 | 553 | 33 | Lançamento |
| Doceria | Geleia de pimenta | 46 | 3 h | 3 pimenta, 1 açúcar mascavo | 1 | 119 | 239 | 40 | Lançamento |
| Doceria | Brigadeiro | 49 | 1 h | 1 chocolate, 1 doce de leite, 1 manteiga | 1 | 625 | 828 | 23 | Lançamento |
| Doceria | Balas de mel | 52 | 2 h 30 | 2 mel, 1 açúcar mascavo | 1 | 188 | 316 | 37 | Lançamento |
| Doceria | Cesta da roça | 60 | 4 h | 1 pão de mel, 1 brigadeiro, 1 queijo de cabra, 1 bandeirinhas | 1 | 2024 | 2637 | 46 | Lançamento |
| Chocolateria | Cacau torrado | 44 | 1 h | 2 cacau | 1 | 52 | 112 | 23 | Lançamento |
| Chocolateria | Chocolate | 46 | 2 h | 1 cacau torrado, 1 açúcar mascavo, 1 leite | 1 | 193 | 312 | 33 | Lançamento |
| Chocolateria | Chocolate quente | 48 | 10 min | 1 chocolate, 1 leite | 1 | 343 | 445 | 9 | Lançamento |
| Chocolateria | Bombom de caju | 51 | 1 h 30 | 1 chocolate, 2 caju | 1 | 352 | 500 | 28 | Lançamento |
| Chocolateria | Trufa de maracujá | 55 | 2 h | 1 chocolate, 1 maracujá, 1 manteiga | 1 | 447 | 629 | 33 | Lançamento |
| Tecelagem | Fio de algodão | 50 | 45 min | 3 algodão | 1 | 57 | 111 | 20 | Lançamento |
| Tecelagem | Tecido de chita | 52 | 3 h | 3 fio de algodão | 1 | 333 | 506 | 40 | Lançamento |
| Tecelagem | Bandeirinhas | 54 | 2 h | 1 tecido de chita, 1 fio de algodão | 1 | 617 | 842 | 33 | Lançamento |
| Tecelagem | Chapéu de palha | 56 | 2 h | 6 milho, 1 fio de algodão | 1 | 117 | 217 | 33 | Lançamento |
| Tecelagem | Rede de dormir | 57 | 6 h | 2 tecido de chita, 2 fio de algodão | 1 | 1234 | 1679 | 57 | Lançamento |
| Tecelagem | Colcha de retalhos | 58 | 8 h | 3 tecido de chita | 1 | 1518 | 2060 | 66 | Lançamento |

As duas cadeias longas do MVP são mandioca → polvilho → pão de queijo (com queijo minas e ovo) e amendoim → amendoim torrado → paçoca (com açúcar e farinha). No lançamento entram cacau → cacau torrado → chocolate → brigadeiro e algodão → fio → chita → rede.

### Quadro de pedidos

- **Valor-alvo**: `TV(L) = 10 × L^1,25` moedas de preço base, com variação de 75% a 125%.
- **Recompensa**: moedas = 1,25 × valor dos itens (25% acima da banca); XP = 0,7 × valor.
- **Linhas**: 1 até o nível 4; 1 ou 2 do 5 ao 14; do 15 em diante, 1, 2 ou 3 (25%, 45%, 30%).
- **Categorias**: culturas 30%, frutas 10%, produtos de animais 20%, processados 40%, entre o que o jogador consegue produzir.
- **O quadro nunca pede o que o jogador não produz**: só entram itens cuja cadeia inteira ele já tem (construção comprada, animal comprado, árvore plantada).
- **Sem item repetido**: um item aparece em no máximo um pedido aberto.
- **Lote máximo por linha** conforme a demora do item: culturas 12 (até 1 h), 9 (até 4 h), 6 (mais longas); frutas 6; produtos de animais 8 (ciclo até 1 h) ou 5; processados 5 (até 30 min), 3 (até 2 h), 2 (mais longos).
- **Itens baratos saem de cena**: só entra na linha o item cujo lote máximo vale pelo menos 40% do valor da linha. Milho deixa de ser pedido cru nos níveis altos e segue como insumo.
- **Viés de estoque**: em metade das linhas, o sorteio prefere itens que o jogador já tem.
- **Novidade**: itens destravados nos últimos 5 níveis têm peso triplo.
- **Espera da vaga** depois de entregar: `2 + 0,3 × L` minutos, no máximo 15. Descartar um pedido custa o dobro dessa espera e nada mais. A espera não pode ser pulada com cash.
- **Pedido velho**: depois de 24 h sem entrega, o jogo oferece trocar sem espera.
- **Peças de reforma**: a cada 3 pedidos entregues, 1 peça garantida, com o medidor à vista.

| Nível | Vagas no quadro | Valor-alvo do pedido (TV) | Moedas do pedido (≈) | XP do pedido (≈) | Espera da vaga após entrega | Pedidos para um nível (≈) |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 2 | 10 | 12 | 7 | 2,3 min | 1 |
| 3 | 3 | 39 | 49 | 28 | 2,9 min | 1 |
| 5 | 3 | 75 | 93 | 52 | 3,5 min | 2 |
| 8 | 4 | 135 | 168 | 94 | 4,4 min | 7 |
| 10 | 5 | 178 | 222 | 124 | 5 min | 10 |
| 15 | 6 | 295 | 369 | 207 | 6,5 min | 25 |
| 20 | 6 | 423 | 529 | 296 | 8 min | 37 |
| 25 | 7 | 559 | 699 | 391 | 9,5 min | 46 |
| 30 | 8 | 702 | 878 | 491 | 11 min | 55 |
| 35 | 8 | 851 | 1.064 | 596 | 12,5 min | 69 |
| 40 | 9 | 1.006 | 1.257 | 704 | 14 min | 85 |
| 45 | 9 | 1.166 | 1.457 | 816 | 15 min | 102 |
| 50 | 9 | 1.330 | 1.662 | 931 | 15 min | 118 |
| 55 | 9 | 1.498 | 1.872 | 1.048 | 15 min | 143 |
| 60 | 9 | 1.670 | 2.087 | 1.169 | 15 min | 163 |

### Feira (relógio curto) e banca

A feira reabastece a cada 5 minutos, com estoque pessoal definido no servidor. A cada reabastecimento há um freguês, que compra até 3 unidades de um item que sobra no armazém por 1,15 vez o preço base e dá XP de 0,4 vez o valor; e uma oferta de insumo bruto, até 4 unidades a 1,6 vez o preço base, que serve para fechar um pedido quando falta pouco. Barracas de decoração e de peças (1 peça por moedas a cada 4 h) completam a feira. A banca é a venda direta pelo preço base, sempre disponível e sem XP: é o piso que impede o armazém de travar.

### Armazém e terra, com seus caminhos gratuitos

Dois armazéns, para que colheita não dispute espaço com produto: o **silo** (culturas e frutas) e o **celeiro** (produtos de animais, processados e rações). Cada um começa com 75 e ganha 40 por ampliação. As peças de reforma ficam numa caixa de ferramentas à parte, sem limite, e nunca ocupam o armazém.

**Ampliações do silo e do celeiro** (a mesma tabela vale para os dois).

| Ampliação | Capacidade depois | Moedas | Tábuas | Tábuas acumuladas |
|---:|---:|---:|---:|---:|
| 1 | 115 | 40 | 5 | 5 |
| 2 | 155 | 180 | 7 | 12 |
| 3 | 195 | 450 | 9 | 21 |
| 4 | 235 | 840 | 11 | 32 |
| 5 | 275 | 1.400 | 13 | 45 |
| 6 | 315 | 2.100 | 15 | 60 |
| 7 | 355 | 2.900 | 17 | 77 |
| 8 | 395 | 3.900 | 19 | 96 |
| 9 | 435 | 5.000 | 21 | 117 |
| 10 | 475 | 6.300 | 23 | 140 |
| 11 | 515 | 7.800 | 25 | 165 |
| 12 | 555 | 9.500 | 27 | 192 |
| 13 | 595 | 11.000 | 29 | 221 |
| 14 | 635 | 13.000 | 31 | 252 |
| 15 | 675 | 15.000 | 33 | 285 |
| 16 | 715 | 18.000 | 35 | 320 |
| 17 | 755 | 20.000 | 37 | 357 |
| 18 | 795 | 23.000 | 39 | 396 |
| 19 | 835 | 26.000 | 41 | 437 |
| 20 | 875 | 29.000 | 43 | 480 |
| 21 | 915 | 32.000 | 45 | 525 |
| 22 | 955 | 36.000 | 47 | 572 |
| 23 | 995 | 40.000 | 49 | 621 |
| 24 | 1035 | 44.000 | 51 | 672 |

**Expansões de terra.** Começa-se com 6 canteiros.

| Expansão | Nível | Moedas | Escrituras | Canteiros novos | Canteiros no total |
|---:|---:|---:|---:|---:|---:|
| 1 | 3 | 25 | 3 | 2 | 8 |
| 2 | 4 | 56 | 4 | 1 | 9 |
| 3 | 6 | 180 | 5 | 1 | 10 |
| 4 | 8 | 400 | 6 | 2 | 12 |
| 5 | 10 | 760 | 7 | 1 | 13 |
| 6 | 12 | 1.300 | 8 | 2 | 15 |
| 7 | 14 | 2.000 | 9 | 1 | 16 |
| 8 | 16 | 2.900 | 10 | 1 | 17 |
| 9 | 18 | 4.100 | 11 | 2 | 19 |
| 10 | 20 | 5.500 | 12 | 1 | 20 |
| 11 | 22 | 7.200 | 13 | 2 | 22 |
| 12 | 24 | 9.300 | 14 | 1 | 23 |
| 13 | 26 | 12.000 | 15 | 1 | 24 |
| 14 | 28 | 14.000 | 16 | 2 | 26 |
| 15 | 30 | 18.000 | 17 | 1 | 27 |
| 16 | 32 | 21.000 | 18 | 2 | 29 |
| 17 | 34 | 25.000 | 19 | 1 | 30 |
| 18 | 36 | 29.000 | 20 | 1 | 31 |
| 19 | 38 | 34.000 | 21 | 2 | 33 |
| 20 | 40 | 40.000 | 22 | 1 | 34 |
| 21 | 42 | 46.000 | 23 | 2 | 36 |
| 22 | 44 | 52.000 | 24 | 1 | 37 |
| 23 | 46 | 59.000 | 25 | 1 | 38 |
| 24 | 48 | 67.000 | 26 | 2 | 40 |
| 25 | 50 | 75.000 | 27 | 1 | 41 |
| 26 | 52 | 84.000 | 28 | 2 | 43 |
| 27 | 54 | 93.000 | 29 | 1 | 44 |
| 28 | 56 | 100.000 | 30 | 1 | 45 |
| 29 | 58 | 110.000 | 31 | 2 | 47 |
| 30 | 60 | 130.000 | 32 | 1 | 48 |

Peças (tábuas para armazém, escrituras para terra, ferramentas para vagas) vêm de cinco caminhos gratuitos, todos com contador visível: 1 a cada 3 pedidos; 2 por nível; 2 no baú das missões; 2 ou 3 em duas casas do calendário; 1 no baú diário de anúncio. O jogador fixa uma meta ("ampliar o celeiro") e as peças seguintes vão para ela, o que acaba com o problema de sobrar um tipo e faltar outro. Peça também se compra por 3 cash. Na simulação o regular junta cerca de 8 peças por dia e a casual entre 4 e 5.

O armazém funciona como válvula assim: quando enche, o excedente vai para a banca pelo preço base, sem XP, com um toque em "vender o que sobra" ou sozinho, se o dono ligar a venda automática de excedente (é ela que vale quando ajudantes enchem o armazém). O jogador perde valor, não perde a colheita nem fica travado. Nas simulações o armazém quase nunca bloqueia de fato (o pior caso é 1 bloqueio por dia, no teste do milho, na primeira semana). O que acontece é a venda de excedente: cerca de 1 vez por dia para a casual, 6 para o regular e 10 para o engajado, na média de 180 dias.

**O armazém não é válvula de ritmo neste desenho, e por isso pode ser generoso.** O teste abaixo foi feito antes da calibração final, com a mesma curva nas três linhas. Dobrar o armazém corta as vendas forçadas em mais da metade e mexe em 1 ou 2 níveis no dia 30. Como armazém é a queixa mais repetida dos jogadores brasileiros no relatório de mercado, o padrão adotado foi 75 com passo de 40, e a curva foi reapertada para compensar.

| Armazém (inicial, passo) | Regular: nível no D30 / D90 | Regular: vendas forçadas por dia | Engajado: nível no D30 / D90 | Engajado: vendas forçadas por dia |
|---|---:|---:|---:|---:|
| 50, +25 | 31 / 48 | 15,3 | 39 / 59 | 42,0 |
| 75, +40 (adotado) | 32 / 50 | 8,3 | 41 / 60 | 19,5 |
| 100, +50 | 33 / 50 | 6,1 | 40 / 60 | 13,1 |

"Venda forçada" é cada vez que o jogador simulado encontrou o armazém cheio ao colher e vendeu excedente. O jogador simulado planta todos os canteiros sempre, então o número é um teto do que um jogador real verá.

### Restauração do sítio e da vila

Meta longa e principal sumidouro de moedas. No lançamento, 30 estágios em seis obras (casa da família, capela, coreto, escola, venda, estação). Cada estágio pede moedas, alguns produtos e tempo de obra, e devolve XP, 2 cash e pontos para a nota da fazenda. O estágio 12 traz o caseiro, que recolhe o que está pronto na primeira visita do dia. Depois do último estágio, a **festa da vila** é semanal e renovável: até 5 cotas por semana, cada uma custando 20% da renda de referência do nível, com XP de meio pedido por cota e 3 cash na quinta.

| Estágio | Nível | Moedas | Obra | XP | Cash |
|---:|---:|---:|---:|---:|---:|
| 1 | 8 | 900 | 1 h | 31 | 2 |
| 2 | 10 | 1.700 | 2 h 10 | 65 | 2 |
| 3 | 12 | 2.900 | 3 h 25 | 120 | 2 |
| 4 | 13 | 3.600 | 4 h 43 | 160 | 2 |
| 5 | 15 | 5.400 | 6 h 04 | 260 | 2 |
| 6 | 17 | 7.700 | 7 h 26 | 360 | 2 |
| 7 | 19 | 11.000 | 8 h 50 | 470 | 2 |
| 8 | 20 | 12.000 | 10 h 16 | 550 | 2 |
| 9 | 22 | 16.000 | 11 h 43 | 650 | 2 |
| 10 | 24 | 21.000 | 13 h 11 | 800 | 2 |
| 11 | 26 | 26.000 | 14 h 40 | 950 | 2 |
| 12 | 27 | 29.000 | 16 h 10 | 1.000 | 2 |
| 13 | 29 | 35.000 | 17 h 41 | 1.200 | 2 |
| 14 | 31 | 43.000 | 19 h 13 | 1.400 | 2 |
| 15 | 33 | 51.000 | 20 h 46 | 1.800 | 2 |
| 16 | 34 | 56.000 | 22 h 19 | 1.900 | 2 |
| 17 | 36 | 65.000 | 23 h 53 | 2.200 | 2 |
| 18 | 38 | 76.000 | 25,5 h | 2.600 | 2 |
| 19 | 40 | 88.000 | 27,1 h | 3.000 | 2 |
| 20 | 41 | 95.000 | 28,6 h | 3.200 | 2 |
| 21 | 43 | 110.000 | 30,3 h | 3.600 | 2 |
| 22 | 45 | 120.000 | 31,9 h | 4.200 | 2 |
| 23 | 47 | 140.000 | 33,5 h | 4.700 | 2 |
| 24 | 48 | 150.000 | 35,1 h | 5.000 | 2 |
| 25 | 50 | 170.000 | 36,8 h | 5.500 | 2 |
| 26 | 52 | 190.000 | 38,4 h | 6.000 | 2 |
| 27 | 54 | 210.000 | 40,1 h | 7.000 | 2 |
| 28 | 56 | 230.000 | 41,8 h | 7.500 | 2 |
| 29 | 57 | 240.000 | 43,4 h | 8.000 | 2 |
| 30 | 59 | 270.000 | 45,1 h | 9.000 | 2 |

### Missões diárias e calendário de retorno

Três missões por dia a partir do nível 5, com metas que crescem com o nível: entregar pedidos (3 + 0,1 × L, até 8), colher (20 + 2 × L, até 120) e produzir ou coletar de animais (4 + 0,2 × L, até 14). Cada uma paga 0,3 × TV de XP e 0,5 × TV em moedas. Completar as três abre o baú do dia: 0,6 × TV de XP, 1 × TV em moedas, 1 cash e 2 peças. As metas foram postas para o regular fechar as três quase todo dia e o casual fechar uma ou duas.

Calendário de sete casas. Dia perdido não zera nada: a casa só não avança.

| Casa | Primeira volta (boas-vindas) | Voltas seguintes |
|---:|---|---|
| 1 | 1 × TV em moedas | 1 × TV em moedas |
| 2 | 2 peças | 2 peças |
| 3 | 1,5 × TV em moedas | 1,5 × TV em moedas |
| 4 | 3 cash | 2 cash |
| 5 | 3 peças | 2 peças |
| 6 | 3 × TV em moedas | 2 × TV em moedas |
| 7 | 5 cash e o espantalho de boas-vindas | 3 cash |

### Cash gratuito por dia

| Fonte | Regra | Casual, 1º mês | Regular, 1º mês | Engajado, 1º mês |
|---|---|---:|---:|---:|
| Subir de nível | 1, 2 ou 3 por nível; 10 por nível de mestre | 21 | 41 | 57 |
| Baú das missões | 1 por dia com as três missões | 12 | 30 | 30 |
| Calendário | 8 na primeira volta, 5 nas seguintes | 23 | 23 | 23 |
| Conquistas e coleções | cerca de 1 por dia no primeiro mês, 0,5 até o dia 90, 0,25 depois | 30 | 30 | 30 |
| Vila | 2 por estágio | 12 | 24 | 26 |
| Maestria | 1 na terceira estrela, 3 na quinta | 0 | 0 | 4 |
| Baú diário de anúncio | 1 por dia | 29 | 30 | 30 |
| **Total no mês** | | **127** | **178** | **200** |
| **Por dia** | | **4,2** | **5,9** | **6,7** |

O jogador começa com 10 cash. Do segundo ao sexto mês a média cai para cerca de 3,0 (casual), 4,3 (regular) e 5,1 (engajado) por dia. Em reais, pelo preço de referência de 10 cash por R$ 1, o regular ganha perto de R$ 18 no primeiro mês e R$ 13 nos seguintes: o bastante para comprar a quarta vaga de cada construção à medida que elas chegam, ou um cosmético médio por mês, e pouco para acelerar com frequência.

### Preço de concluir um temporizador

`cash = teto(0,28 × minutos^0,7)`, grátis se faltar até 30 segundos. Vale para filas de produção e obras; não vale para a espera do quadro de pedidos. Limite de 24 conclusões pagas por dia por sítio. Ao lado do preço em cash aparece o valor em reais.

| Tempo restante | Cash | Equivalente em R$ (10 cash = R$ 1) | Cash por hora |
|---:|---:|---:|---:|
| 1 min | 1 | 0,10 | 60,0 |
| 5 min | 1 | 0,10 | 12,0 |
| 10 min | 2 | 0,20 | 12,0 |
| 20 min | 3 | 0,30 | 9,0 |
| 30 min | 4 | 0,40 | 8,0 |
| 1 h | 5 | 0,50 | 5,0 |
| 2 h | 8 | 0,80 | 4,0 |
| 4 h | 13 | 1,30 | 3,2 |
| 8 h | 22 | 2,20 | 2,8 |
| 12 h | 29 | 2,90 | 2,4 |
| 24 h | 46 | 4,60 | 1,9 |
| 48 h | 74 | 7,40 | 1,5 |

### Anúncios recompensados

Só vídeo recompensado, sempre por iniciativa do jogador, a partir do nível 6. Teto de 8 por dia somando os pontos; as personas simuladas veem 2, 4 e 6.

| Ponto | Recompensa | Teto por dia | Equivalente em cash |
|---|---|---:|---:|
| Baú do dia | 1 × TV em moedas, 1 peça e 1 cash | 1 | cerca de 4 |
| Adiantar 20 min de uma fila | 20 min a menos na construção escolhida | 3 | 3 cada |
| Dobrar as moedas de um pedido | Mais 1,25 × valor do pedido em moedas (não dobra XP) | 2 | não se compra |
| Tentativa extra de minijogo | 1 tentativa | 1 | não se compra |
| Reabastecer a feira agora | Novo freguês e nova oferta | 1 | não se compra |

Nenhuma recompensa de anúncio é sorteada. O que o anúncio dá em tempo (até 60 minutos por dia) é uma fração do que o cash compra, e não se acumula. Quem tem o passe recebe as mesmas recompensas sem assistir.

### Loja, pacote inicial e passe

Sem conversão de cash em moedas. Preço de referência: 10 cash por R$ 1.

| Produto | Preço | Conteúdo |
|---|---:|---|
| Pacote de cash | R$ 6,90 | 70 cash |
| Pacote de cash | R$ 12,90 | 135 cash |
| Pacote de cash | R$ 19,90 | 215 cash |
| Pacote de cash | R$ 29,90 | 335 cash |
| Pacote de cash | R$ 59,90 | 700 cash |
| Pacote de cash | R$ 129,90 | 1.600 cash |
| Pacote inicial (uma vez, da 3ª à 5ª sessão) | R$ 4,90 | 100 cash, 10 peças, chapéu de palha do avatar e cerca de bambu |
| Passe mensal | R$ 19,90 | Trilha premium descrita abaixo |

Preços de itens em cash: quarta vaga de construção 25; quinta vaga 50; peça de reforma 3; cosméticos de 50 a 600.

Esboço da trilha do passe, com 30 degraus e cerca de um degrau por dia para quem faz as missões:

| Trilha | Recompensas no mês |
|---|---|
| Gratuita | Moedas (0,5 × TV por degrau), 15 peças, 30 cash, 1 decoração da temporada |
| Premium | 300 cash espalhados pelos degraus, 30 peças, conjunto de decoração da temporada (6 a 8 peças), roupa de avatar, pele de trator ou de celeiro, emote; durante o mês: 1 vaga extra na fila de todas as construções, caseiro em todas as visitas e recompensas de anúncio sem assistir |

O conteúdo é fixo e divulgado no início do mês. Os pontos de temporada vêm de missões e pedidos, nunca de cash, e degrau não se compra. A trilha gratuita não está na simulação.

## Sessões e temporizadores

### A escada de tempos

| Degrau | Duração | O que fica nele | Para que serve |
|---|---|---|---|
| Dentro da sessão | 1 a 8 min | Milho, feijão, mandioca; fubá, rações, farinha, garapa, cafezinho, café com leite; reabastecimento da feira | Dar o que fazer enquanto o jogador está presente |
| Mesma sessão ou pausa curta | 10 a 30 min | Tomate, soja; polvilho, tapioca, bolo de fubá, açúcar, queijo minas; ciclo da galinha | Fechar um pedido antes de sair |
| Próxima sessão | 45 min a 3 h 30 | Cana, girassol, arroz, quiabo, café, amendoim, algodão; a maior parte das receitas; ciclo da vaca e da cabra; laranja | Motivo para voltar no mesmo dia |
| Meio dia | 4 a 8 h | Abóbora, pimenta, batata-doce, melancia; rede, queijo curado, colcha; banana, caju, manga; mel | Casar com o intervalo entre manhã, almoço e noite |
| Virada do dia | 10 a 24 h | Maracujá, abacaxi, erva-mate, guaraná; cacau e açaí; obras de construção do nível 38 em diante | O que se planta antes de dormir |
| Vários dias | 1 a 2 dias | Maturação de mangueira, cacaueiro e açaizeiro; estágios finais da vila | Metas de médio prazo, nunca o ciclo básico |

Regra de montagem: do nível 8 em diante o jogador tem pelo menos uma opção em cada um dos três primeiros degraus, mais a abóbora de 4 h; do nível 13 em diante, também uma cultura de 8 h. Nenhum temporizador do ciclo básico passa de 24 h.

### Como os tempos viram sessões

Um sítio de nível 30 tem 27 canteiros, 15 animais, 16 árvores e 6 construções. Dar uma volta completa (colher, coletar, entregar, pôr na fila, alimentar, replantar) leva de 3 a 5 minutos. É esse o tamanho natural da sessão; o que passa disso é feira, culturas de minutos, minijogo, decoração ou visita a um amigo.

| Perfil | Minutos de jogo por dia | Minutos com ação útil no próprio sítio (dias 1–7 / 8–30 / 31–90 / 91–180) | Pedidos por dia |
|---|---:|---|---:|
| Casual | 10 | 4 / 6 / 8 / 8 | 4 a 6 |
| Regular | 40 | 17 / 25 / 28 / 29 | 12 a 14 |
| Engajado | 150 | 40 / 50 / 59 / 56 | 16 a 27 |

A casual espera pouco depois do primeiro mês e, do nível 40 em diante, cinco minutos mal dão para a volta completa. O regular fica sem ação útil em metade da sessão na primeira semana, em um terço no resto do primeiro mês e em cerca de um quarto depois. O engajado passa mais da metade do tempo sem ação útil no próprio sítio, em qualquer fase. Não é defeito da tabela: é a natureza de um jogo de temporizadores, e é a razão pela qual a meta de "2 a 3 horas por dia" só se sustenta com o que está fora do ciclo básico. No desenho, esse tempo vai para:

- **Mutirão**: cada amigo é outro sítio com sua própria volta de 3 a 5 minutos, e a diária dá motivo para ir.
- **Feira**: um freguês e uma oferta a cada 5 minutos; a barraca do jogador como minijogo.
- **Minijogos**: 5 tentativas grátis por dia, mais uma por anúncio.
- **Giro de culturas curtas**: existe, rende pouco e não precisa ser contido (ver o teste de estresse).
- **Decoração e nota da fazenda**: tempo sem limite, sem efeito no ritmo.

O indicador "canteiro parado" é alto para quem joga pouco (de 75 a 87% para a casual, de 54 a 75% para o regular) porque conta o tempo em que a colheita está pronta esperando. Ele mede o quanto as culturas disponíveis são curtas para o intervalo do jogador, e cai conforme chegam as culturas longas.

### Válvulas que não parecem pedágio

| Válvula | O que limita | Por que não vira pedágio |
|---|---|---|
| Fila de produção (2 a 5 vagas) | Quanto a construção produz enquanto o jogador está fora | Terceira vaga por moedas; quarta e quinta por uso da construção ou por cash |
| Espera da vaga do quadro (até 15 min) | Pedidos por sessão | Curta, igual para todos, e não se vende |
| Tamanho e lote máximo dos pedidos | Quanto um pedido exige de itens demorados | O quadro nunca pede o que o jogador não produz nem repete item |
| Silo e celeiro | Quanto se pode estocar (não o ritmo: ver o teste na seção do armazém) | Começam com 75; excedente sai pela banca em um toque, sem travar; peças fora do armazém; medidor de peças à vista |
| Escrituras para terra | Ritmo de novos canteiros | Mesma fonte de peças, com meta fixada |
| Custo em moedas dos desbloqueios | Quando o conteúdo novo entra em uso | Uma a quatro compras sempre "quase lá": dá objetivo de curto prazo |
| Teto diário de acelerações pagas | Quanto o dinheiro comprime | Transparente e alto o bastante para não incomodar quem paga pouco |

## Mutirão: o modelo de ritmo no cooperativo

**Recomendação: "sítio do dono, diária do ajudante".**

1. **O sítio e todo o progresso dele são do dono.** Nível, desbloqueios, moedas, armazém e temporizadores pertencem à conta do dono e vivem no servidor. Não há fazenda coletiva nem carteira compartilhada.
2. **O ajudante trabalha, o dono entrega.** Com a permissão padrão, o ajudante planta, colhe, coleta, alimenta e põe receitas na fila. Só o dono entrega pedidos, compra, constrói e gasta cash; a única venda que acontece sem ele é a de excedente, se ele tiver deixado a venda automática ligada. Ninguém acelera com cash o temporizador de outro jogador.
3. **O que o ajudante colhe vai para o armazém do dono; o XP da ação não vai para ninguém.** O XP do dono continua vindo do que ele mesmo faz e, sobretudo, dos pedidos que ele entrega.
4. **O ajudante ganha a diária, proporcional ao próprio nível.** A cada 30 ações úteis no sítio de um amigo, um baú com 0,35 × TV de XP e 0,5 × TV em moedas, calculados no nível do ajudante. Até 4 baús por dia, somando todos os sítios visitados.
5. **O ajudante pode usar tudo o que existe no sítio visitado**, inclusive construções que ainda não tem. Isso não destrava nada na conta dele.
6. **Nada passa de uma conta para outra** além da diária. Doações de itens entram depois, com limite diário e só de itens que quem recebe já destravou.
7. **Sem bônus de produção por presença.** Jogar junto rende trabalho dividido, a diária e as metas de mutirão; não rende temporizador mais rápido.

Por que este modelo resolve os quatro problemas:

| Problema | Como o modelo responde | O que a simulação mostra |
|---|---|---|
| Amigos de níveis diferentes | A diária é calculada no nível de quem ajuda; o visitante usa o que o sítio tem | Um ajudante de nível 50 recebe 465 XP por baú; um de nível 10, 62. Para os dois, 4 baús valem perto de dois pedidos |
| Power-levelling | O sítio é limitado pela capacidade, e só o dono converte produto em XP | Regular com três amigos: nível 60 no dia 136 em vez do 164 (1,21 vez). Casual carregada por três engajados que fazem 70 min de trabalho por dia: nível 50 no dia 180 em vez do 45, ainda abaixo do regular sozinho (61) |
| Contas alternativas | Uma conta alternativa só pode fazer o que um amigo faria: trabalhar no sítio principal (limitado pela capacidade) ou servir de sítio para a diária (limitada a 4 baús) | A diária cheia vale 8% do XP do regular |
| Progresso do dono trivializado | Pedidos, compras e decisões continuam com o dono; ajudante não gera XP de ação para ele | A casual carregada entrega de 7 a 10 pedidos por dia, contra 4 a 6 sozinha: limitada pelas próprias duas sessões |

Efeitos colaterais vistos na simulação e o que fazer com eles:

- A casual carregada acumula moedas (saldo de 5 a 17 dias de renda) porque a produção sobe e os desbloqueios continuam presos ao nível dela. A vila e a decoração absorvem parte; aceitar.
- Com o armazém inicial de 50 da primeira versão, a primeira semana dela tinha quase 9 bloqueios de armazém por dia: os ajudantes colhiam mais do que cabia e o que estava guardado era para pedidos. Com 75 o bloqueio sumiu da simulação. Ainda assim, o ajudante precisa ver o aviso "armazém do dono cheio"; nada se perde, a colheita espera no canteiro.

Regras de alicerce que já valem pelo relatório: sala de até 4 no MVP com protocolo para 8, inventário autoritativo no servidor, sem roubo, chat de frases prontas.

Metas de mutirão (objetivos compartilhados de quem está na sala, como "colham 200 itens juntos em 10 minutos") pagam a cada participante um baú igual ao da diária e contam no mesmo teto de 4 por dia.

A liga semanal de cooperativas, que entra depois do MVP, usa a mesma lógica: cada membro escolhe um número limitado de tarefas por semana, a tarefa é dimensionada pelo nível de quem a pega, o placar mede esforço, e item concluído com cash não pontua.

## Primeira experiência

### Primeiros 10 minutos

Tempos da simulação, sem contar diálogos do tutorial:

| Minuto | Acontece | Nível |
|---:|---|---:|
| 0 | Seis canteiros, 60 moedas, 10 cash. Planta milho (1 min) | 1 |
| 1,5 | Colhe e entrega o primeiro pedido. Destrava feijão (3 min) | 2 |
| 2,4 | Destrava o moinho (obra de 12 s), o fubá, a feira, a terceira vaga do quadro e a primeira terra | 3 |
| 4,7 | Destrava o galinheiro com 3 galinhas, a ração, a mandioca (8 min) e a segunda terra | 4 |
| 7,9 | Destrava a casa de farinha, as missões diárias e o mutirão (abrir o sítio para amigos) | 5 |
| 8 a 10 | Planta mandioca e tomate para a volta; o jogo mostra o que estará pronto e quando | 5 |

São quatro subidas de nível, uma construção, um animal e quatro culturas em menos de 10 minutos. Quem chega pelo link de um amigo entra primeiro como ajudante no sítio dele e faz este tutorial depois.

### Primeiro dia

| Sessão do regular | Nível ao sair | Novidade principal |
|---|---:|---|
| 1 (10 min) | 5 | Moinho, galinheiro, casa de farinha |
| 2 | 6 | Tomate, quarta vaga do quadro |
| 3 | 7 | Fogão a lenha, bolo de fubá, polvilho, abóbora de 4 h |
| 4 | 8 | Cana, feijão tropeiro, pesca, primeiro estágio da vila |
| 5 | 8 | Planta abóbora para a noite |

O dia termina com uma cultura de 4 h no chão, um pedido quase pronto e a vila apresentada. A casual termina no nível 6 e o engajado no 11.

### Primeiros 7 dias

| Dia | Casual | Regular | Engajado | O que chega para o regular |
|---:|---:|---:|---:|---|
| 1 | 6 | 8 | 11 | Três construções, galinhas, pesca, vila |
| 2 | 7 | 11 | 14 | Curral e vacas, laranjeira, engenho, álbum de coleções |
| 3 | 9 | 12 | 16 | Arroz com feijão, garapa, segunda leva de galinhas, barraca na feira |
| 4 | 9 | 14 | 18 | Melancia de 8 h, queijaria |
| 5 | 10 | 15 | 19 | Bananeira, pão de queijo, maestria |
| 6 | 11 | 16 | 20 | Doce de abóbora, manteiga |
| 7 | 11 | 17 | 22 | Café, mais duas vacas; casa 7 do calendário: 5 cash e o espantalho |

Na primeira semana o regular sobe de nível todo dia ou quase, recebe três construções no primeiro dia e mais duas até o quarto, e termina com cinco construções, 17 canteiros, 8 animais e 6 árvores. O pacote inicial aparece entre a terceira e a quinta sessão; os anúncios, a partir do nível 6.

## Plano contra o esgotamento de conteúdo

### O que existe no lançamento

| Conteúdo | MVP (níveis 1–30) | Lançamento web (níveis 1–60) | Custo de produção dominante |
|---|---:|---:|---|
| Culturas | 12 | 20 | Modelo 3D com 3 ou 4 estágios |
| Árvores frutíferas | 3 tipos (18 mudas) | 6 tipos (36 mudas) | Modelo 3D com 3 estágios |
| Animais | 2 (galinha, vaca) | 4 (mais cabra e abelha) | Modelo, animação e abrigo: o item mais caro |
| Construções de processamento | 6 | 10 | Modelo 3D e animação de trabalho |
| Receitas | 31 | 66 | Ícone e linha de dados: o item mais barato |
| Expansões de terra | 15 | 30 | Só dados |
| Estágios da vila | 13 | 30 | Seis obras em cinco etapas |
| Estrelas de maestria | 230 | 465 | Só dados |
| Vagas do quadro | 2 a 8 | 2 a 9 | Só dados |

Todo nível de 1 a 60 destrava pelo menos uma coisa; o programa de exportação acusa nível vazio.

**Só o conteúdo do MVP não cumpre o requisito.** Com teto no nível 30, o engajado zera no dia 15, o regular no dia 27 e a casual no dia 62 (os níveis acima de 30 na tabela são níveis de mestre, sem conteúdo):

| Persona | D1 | D3 | D7 | D14 | D30 | D60 | D90 | Dia do teto (nv 30) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Casual (2 sessões de 5 min) | 6 | 9 | 11 | 15 | 20 | 29 | 32 | 62 |
| Regular (5 sessões, 40 min) | 8 | 12 | 17 | 22 | 31 | 35 | 39 | 27 |
| Engajado (10 sessões, 150 min) | 11 | 16 | 22 | 29 | 34 | 41 | 47 | 15 |

Isso basta para um alfa fechado de três a quatro semanas, que é o que o MVP precisa provar, desde que o alfa já tenha maestria e vila (são dados e pouca arte). O lançamento web suave precisa dos níveis 31 a 60: 8 culturas, 3 árvores, 2 animais, 4 construções e 35 receitas a mais.

### O que se renova sem arte nova

| Sistema | Horizonte | Quanto dura |
|---|---|---|
| Quadro de pedidos | Sessão | Sempre: gerado por regra |
| Feira | 5 min | Sempre: gerada por regra |
| Missões diárias | Dia | Sempre: três modelos com metas por nível |
| Maestria | Meses | Aos 180 dias o engajado tem 315 de 465 estrelas e o regular 251 |
| Vila e festa da vila | Meses, depois semanal | O engajado termina os 30 estágios por volta do dia 180; a festa semanal absorve as moedas daí em diante |
| Liga de cooperativas | Semana | Sempre: tarefas por regra, placar por esforço |
| Temporada e passe | Mês | Um tema por mês; conteúdo fixo e divulgado |
| Álbum de coleções | Meses | 12 páginas no lançamento; páginas sazonais são dados e ícones. Itens vêm de medidores (por exemplo, uma "safra especial" garantida a cada 25 colheitas de uma cultura com 3 estrelas), nunca de sorteio pago |
| Nota da fazenda | Semana | Vitrine temática de decoração |
| Níveis de mestre | 16 ou 17 dias cada (engajado) | Sem fim: 10 cash por nível |

### Cadência mensal para uma equipe muito pequena

Premissa de planejamento, sem base nas notas e a recalibrar depois do MVP:

| Frequência | Entrega | Efeito |
|---|---|---|
| Todo mês | 2 níveis de mestre com conteúdo: 1 cultura ou 1 árvore (alternando), 3 ou 4 receitas, 1 expansão de terra, 2 estágios de uma obra nova da vila | Sobe o teto de conteúdo em 2 níveis |
| Todo mês | 1 temporada: conjunto de decoração (6 a 8 peças, duas delas modelos novos), 1 roupa, 1 pele, página sazonal do álbum; 1 evento montado sobre um modelo que já existe | Passe e metas do mês |
| A cada 2 meses | 1 construção de processamento com 4 receitas | Cadeia nova |
| A cada 3 ou 4 meses | 1 animal ou 1 minijogo | Novidade de sistema |
| A cada 6 meses | 1 bioma como área de expansão | Marco |

Com os níveis de mestre custando 3,25 vezes o nível 60, o engajado sobe um a cada 16 ou 17 dias (pouco menos de 2 por mês) e o regular um a cada 27 dias. Se a cadência de 2 níveis por mês for mantida desde o lançamento, nenhum perfil simulado alcança o teto dentro de 180 dias. Se a cadência parar, cada nível de mestre já publicado dura pouco mais de duas semanas para o engajado, e depois dele restam os sistemas renováveis.

## Resultados da simulação

Rodada final: `python3 -I simular.py`, semente 20261111, 180 dias. Arquivo completo em `tools/economy-sim/saida/resultados.md`; série diária em `serie_diaria.csv`.

**Nível por dia.**

| Persona | D1 | D3 | D7 | D14 | D30 | D60 | D90 | D120 | D180 | Dia do teto (nv 60) | Dia em que alcança o teto com conteúdo mensal |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Casual (2 sessões de 5 min) | 6 | 9 | 11 | 15 | 20 | 29 | 35 | 39 | 45 | não chega | não alcança |
| Regular (5 sessões, 40 min) | 8 | 12 | 17 | 22 | 31 | 41 | 48 | 53 | 61 | 164 | não alcança |
| Engajado (10 sessões, 150 min) | 11 | 16 | 22 | 29 | 39 | 50 | 58 | 61 | 65 | 99 | não alcança |
| Regular pagante (passe + R$ 12,90/mês) | 8 | 13 | 17 | 23 | 33 | 43 | 50 | 55 | 62 | 146 | não alcança |
| Engajado pagante (passe + R$ 129,90/mês) | 11 | 16 | 23 | 30 | 40 | 51 | 59 | 62 | 66 | 93 | não alcança |
| Teste de estresse: engajado gastando ~R$ 670/mês | 12 | 17 | 23 | 30 | 40 | 52 | 59 | 62 | 66 | 91 | não alcança |
| Teste de estresse: engajado girando milho sem parar | 11 | 16 | 22 | 29 | 39 | 51 | 59 | 62 | 66 | 93 | não alcança |
| Regular com 3 amigos (mutirão diário) | 8 | 13 | 18 | 24 | 33 | 44 | 51 | 57 | 62 | 136 | não alcança |
| Casual carregado por 3 amigos engajados | 6 | 9 | 13 | 17 | 23 | 32 | 37 | 42 | 50 | não chega | não alcança |

A última coluna supõe que o teto sobe 2 níveis a cada 30 dias a partir do lançamento.

**Saldo de moedas por dia.** A última coluna divide o saldo pela renda média dos 7 dias anteriores.

| Persona | D1 | D3 | D7 | D14 | D30 | D60 | D90 | D120 | D180 | Dias de renda D30 / D90 / D180 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Casual (2 sessões de 5 min) | 572 | 742 | 2.045 | 1.366 | 5.742 | 16.020 | 7.928 | 34.848 | 41.295 | 1,0 / 0,7 / 3,2 |
| Regular (5 sessões, 40 min) | 873 | 3.972 | 4.638 | 16.179 | 9.738 | 40.435 | 21.695 | 40.894 | 30.952 | 0,5 / 0,8 / 0,8 |
| Engajado (10 sessões, 150 min) | 3.222 | 5.546 | 12.321 | 7.526 | 90.622 | 69.460 | 93.830 | 73.470 | 55.532 | 2,5 / 1,7 / 0,9 |
| Regular pagante (passe + R$ 12,90/mês) | 873 | 1.915 | 1.712 | 4.067 | 6.853 | 30.530 | 41.521 | 64.030 | 20.871 | 0,3 / 1,2 / 0,5 |
| Engajado pagante (passe + R$ 129,90/mês) | 3.027 | 3.213 | 4.469 | 6.064 | 41.499 | 37.481 | 64.804 | 9.035 | 11.381 | 1,1 / 1,1 / 0,2 |
| Teste de estresse: engajado gastando ~R$ 670/mês | 3.539 | 4.350 | 1.851 | 13.088 | 27.324 | 33.207 | 50.376 | 136.046 | 77.725 | 0,7 / 0,9 / 1,1 |
| Teste de estresse: engajado girando milho sem parar | 1.614 | 9.109 | 15.290 | 7.171 | 7.908 | 28.954 | 61.288 | 133.254 | 139.877 | 0,2 / 1,1 / 2,1 |
| Regular com 3 amigos (mutirão diário) | 873 | 1.877 | 5.325 | 2.652 | 3.541 | 67.985 | 21.636 | 56.338 | 46.777 | 0,1 / 0,5 / 0,9 |
| Casual carregado por 3 amigos engajados | 572 | 2.253 | 10.868 | 39.420 | 133.790 | 251.927 | 536.335 | 629.810 | 506.913 | 8,2 / 19,1 / 13,0 |

O saldo fica perto de um dia de renda em quase todos os perfis e fases: as moedas têm sempre destino. As exceções: a casual, com 3,2 dias de renda no dia 180, e sobretudo a casual carregada por amigos, com 8 a 19 dias, porque os sumidouros dela estão presos ao nível.

**Saldo de cash por dia.** Quem não paga gasta só em quartas vagas; o restante se acumula para cosméticos.

| Persona | D1 | D3 | D7 | D14 | D30 | D60 | D90 | D120 | D180 | Gasto em R$ no período |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Casual (2 sessões de 5 min) | 17 | 24 | 20 | 22 | 12 | 102 | 196 | 256 | 384 | 0,00 |
| Regular (5 sessões, 40 min) | 20 | 5 | 13 | 25 | 38 | 142 | 242 | 343 | 586 | 0,00 |
| Engajado (10 sessões, 150 min) | 23 | 13 | 24 | 20 | 35 | 131 | 259 | 427 | 719 | 0,00 |
| Regular pagante (passe + R$ 12,90/mês) | 18 | 16 | 33 | 32 | 59 | 389 | 616 | 951 | 1.819 | 201,70 |
| Engajado pagante (passe + R$ 129,90/mês) | 3 | 1.301 | 1.063 | 744 | 106 | 540 | 1.020 | 1.637 | 2.804 | 903,70 |
| Teste de estresse: engajado gastando ~R$ 670/mês | 13 | 7.625 | 7.220 | 6.632 | 5.188 | 10.212 | 14.885 | 19.500 | 28.487 | 4021,30 |
| Teste de estresse: engajado girando milho sem parar | 24 | 11 | 22 | 20 | 34 | 132 | 269 | 441 | 729 | 0,00 |
| Regular com 3 amigos (mutirão diário) | 20 | 10 | 16 | 10 | 51 | 140 | 256 | 373 | 661 | 0,00 |
| Casual carregado por 3 amigos engajados | 17 | 3 | 9 | 18 | 17 | 151 | 241 | 363 | 547 | 0,00 |

**Metas de longo prazo.**

| Persona | Vila D30 | Vila D90 | Vila D180 | Estrelas D30 | Estrelas D90 | Estrelas D180 |
|---|---:|---:|---:|---:|---:|---:|
| Casual (2 sessões de 5 min) | 6/30 | 13/30 | 17/30 | 7/465 | 55/465 | 118/465 |
| Regular (5 sessões, 40 min) | 12/30 | 15/30 | 24/30 | 42/465 | 135/465 | 251/465 |
| Engajado (10 sessões, 150 min) | 13/30 | 15/30 | 30/30 | 77/465 | 219/465 | 315/465 |
| Regular pagante (passe + R$ 12,90/mês) | 12/30 | 14/30 | 26/30 | 52/465 | 159/465 | 268/465 |
| Engajado pagante (passe + R$ 129,90/mês) | 12/30 | 16/30 | 30/30 | 88/465 | 234/465 | 325/465 |
| Teste de estresse: engajado gastando ~R$ 670/mês | 12/30 | 17/30 | 30/30 | 89/465 | 236/465 | 329/465 |
| Teste de estresse: engajado girando milho sem parar | 13/30 | 17/30 | 30/30 | 78/465 | 224/465 | 313/465 |
| Regular com 3 amigos (mutirão diário) | 14/30 | 20/30 | 30/30 | 59/465 | 175/465 | 291/465 |
| Casual carregado por 3 amigos engajados | 9/30 | 17/30 | 25/30 | 25/465 | 91/465 | 183/465 |

**Indicadores de ociosidade e de válvulas, por janela de dias.**

| Persona | Dias | Sessão sem nada útil | Giro de cultura curta | Minijogos | Canteiro parado | Uso das construções | Pedidos/dia | XP/dia | Moedas/dia | Bloqueios de armazém/dia | Compras à espera de moedas | Saldo em dias de renda | Anúncios/dia |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Casual (2 sessões de 5 min) | 1–7 | 53% | 0% | 5% | 87% | 2% | 4,0 | 791 | 1.682 | 0,0 | 1,3 | 1,1 | 2,0 |
| Casual (2 sessões de 5 min) | 8–30 | 30% | 0% | 7% | 85% | 4% | 5,0 | 2.480 | 4.232 | 0,0 | 1,2 | 1,1 | 2,0 |
| Casual (2 sessões de 5 min) | 31–90 | 15% | 0% | 4% | 75% | 9% | 6,1 | 5.500 | 9.217 | 0,0 | 1,5 | 1,8 | 2,0 |
| Casual (2 sessões de 5 min) | 91–180 | 14% | 0% | 7% | 77% | 11% | 5,5 | 7.187 | 12.501 | 0,0 | 1,9 | 3,1 | 2,0 |
| Regular (5 sessões, 40 min) | 1–7 | 52% | 8% | 6% | 75% | 8% | 12,6 | 3.957 | 6.294 | 0,0 | 1,4 | 0,6 | 4,0 |
| Regular (5 sessões, 40 min) | 8–30 | 31% | 12% | 6% | 65% | 20% | 13,5 | 10.272 | 15.379 | 0,0 | 0,9 | 0,6 | 4,0 |
| Regular (5 sessões, 40 min) | 31–90 | 25% | 13% | 6% | 55% | 26% | 12,6 | 16.263 | 25.571 | 0,0 | 2,4 | 1,3 | 4,0 |
| Regular (5 sessões, 40 min) | 91–180 | 22% | 10% | 6% | 54% | 35% | 11,7 | 22.887 | 35.744 | 0,0 | 1,9 | 1,6 | 4,0 |
| Engajado (10 sessões, 150 min) | 1–7 | 71% | 5% | 2% | 50% | 24% | 27,1 | 11.521 | 16.140 | 0,0 | 0,6 | 0,5 | 6,0 |
| Engajado (10 sessões, 150 min) | 8–30 | 64% | 7% | 3% | 35% | 41% | 23,6 | 21.625 | 30.569 | 0,0 | 1,3 | 0,8 | 6,0 |
| Engajado (10 sessões, 150 min) | 31–90 | 58% | 10% | 3% | 29% | 54% | 20,9 | 33.177 | 48.293 | 0,0 | 2,7 | 0,8 | 6,0 |
| Engajado (10 sessões, 150 min) | 91–180 | 60% | 9% | 3% | 25% | 60% | 16,3 | 36.584 | 57.386 | 0,0 | 0,7 | 1,4 | 6,0 |
| Regular pagante (passe + R$ 12,90/mês) | 1–7 | 56% | 9% | 7% | 73% | 11% | 15,6 | 4.820 | 7.137 | 0,0 | 1,6 | 0,4 | 1,1 |
| Regular pagante (passe + R$ 12,90/mês) | 8–30 | 47% | 13% | 8% | 48% | 24% | 16,3 | 12.584 | 18.329 | 0,0 | 1,6 | 0,6 | 0,0 |
| Regular pagante (passe + R$ 12,90/mês) | 31–90 | 39% | 14% | 8% | 41% | 33% | 14,9 | 19.649 | 30.294 | 0,0 | 2,5 | 0,9 | 0,0 |
| Regular pagante (passe + R$ 12,90/mês) | 91–180 | 40% | 13% | 8% | 42% | 40% | 12,1 | 25.449 | 40.700 | 0,0 | 1,5 | 1,4 | 0,0 |
| Engajado pagante (passe + R$ 129,90/mês) | 1–7 | 75% | 5% | 3% | 44% | 28% | 30,7 | 12.624 | 17.000 | 0,3 | 1,9 | 0,3 | 1,7 |
| Engajado pagante (passe + R$ 129,90/mês) | 8–30 | 73% | 6% | 3% | 29% | 47% | 26,7 | 24.226 | 33.554 | 0,0 | 2,2 | 0,5 | 0,0 |
| Engajado pagante (passe + R$ 129,90/mês) | 31–90 | 66% | 11% | 3% | 23% | 58% | 21,5 | 35.591 | 51.978 | 0,0 | 2,6 | 0,9 | 0,0 |
| Engajado pagante (passe + R$ 129,90/mês) | 91–180 | 65% | 12% | 3% | 22% | 66% | 17,2 | 39.000 | 61.652 | 0,0 | 1,0 | 1,1 | 0,0 |
| Teste de estresse: engajado gastando ~R$ 670/mês | 1–7 | 76% | 5% | 3% | 44% | 30% | 33,3 | 13.325 | 17.515 | 0,0 | 2,4 | 0,2 | 0,0 |
| Teste de estresse: engajado gastando ~R$ 670/mês | 8–30 | 72% | 7% | 3% | 29% | 49% | 27,7 | 25.212 | 34.808 | 0,0 | 2,2 | 0,6 | 0,0 |
| Teste de estresse: engajado gastando ~R$ 670/mês | 31–90 | 66% | 10% | 3% | 23% | 61% | 22,1 | 36.332 | 52.305 | 0,0 | 2,8 | 0,8 | 0,0 |
| Teste de estresse: engajado gastando ~R$ 670/mês | 91–180 | 64% | 12% | 3% | 22% | 72% | 18,0 | 40.683 | 63.809 | 0,0 | 0,8 | 1,1 | 0,0 |
| Teste de estresse: engajado girando milho sem parar | 1–7 | 42% | 31% | 2% | 55% | 17% | 21,9 | 11.084 | 16.506 | 1,0 | 1,0 | 0,4 | 6,0 |
| Teste de estresse: engajado girando milho sem parar | 8–30 | 28% | 41% | 2% | 43% | 39% | 21,6 | 23.182 | 32.706 | 0,3 | 1,4 | 0,7 | 6,0 |
| Teste de estresse: engajado girando milho sem parar | 31–90 | 18% | 48% | 2% | 33% | 55% | 20,6 | 36.208 | 51.742 | 0,0 | 2,9 | 0,9 | 6,0 |
| Teste de estresse: engajado girando milho sem parar | 91–180 | 21% | 48% | 2% | 25% | 60% | 16,2 | 39.281 | 61.263 | 0,0 | 0,7 | 1,3 | 6,0 |
| Regular com 3 amigos (mutirão diário) | 1–7 | 53% | 8% | 6% | 55% | 13% | 17,4 | 5.467 | 9.974 | 0,0 | 0,9 | 0,6 | 4,0 |
| Regular com 3 amigos (mutirão diário) | 8–30 | 40% | 10% | 6% | 38% | 26% | 18,3 | 13.161 | 23.492 | 0,0 | 0,6 | 0,8 | 4,0 |
| Regular com 3 amigos (mutirão diário) | 31–90 | 32% | 12% | 6% | 32% | 38% | 17,1 | 21.075 | 38.772 | 0,0 | 1,5 | 1,2 | 4,0 |
| Regular com 3 amigos (mutirão diário) | 91–180 | 28% | 11% | 6% | 27% | 51% | 14,5 | 28.599 | 53.287 | 0,0 | 1,0 | 1,5 | 4,0 |
| Casual carregado por 3 amigos engajados | 1–7 | 54% | 0% | 6% | 51% | 6% | 6,6 | 1.591 | 5.684 | 0,0 | 0,0 | 0,8 | 2,0 |
| Casual carregado por 3 amigos engajados | 8–30 | 40% | 0% | 8% | 27% | 8% | 8,0 | 3.784 | 13.531 | 0,0 | 0,0 | 4,5 | 2,0 |
| Casual carregado por 3 amigos engajados | 31–90 | 34% | 0% | 8% | 23% | 16% | 9,4 | 6.964 | 23.205 | 0,0 | 0,0 | 12,7 | 2,0 |
| Casual carregado por 3 amigos engajados | 91–180 | 27% | 0% | 7% | 17% | 23% | 10,2 | 10.737 | 33.578 | 0,0 | 0,0 | 17,4 | 2,0 |

**De onde vem o XP** (parte do total em 180 dias).

| Persona | Pedidos | Produção | Colheita | Feira | Missões | Vila | Maestria | Minijogos | Diária |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Casual (2 sessões de 5 min) | 38% | 9% | 28% | 1% | 11% | 1% | 10% | 1% | 0% |
| Regular (5 sessões, 40 min) | 38% | 9% | 27% | 2% | 9% | 1% | 12% | 2% | 0% |
| Engajado (10 sessões, 150 min) | 40% | 10% | 27% | 3% | 7% | 2% | 10% | 2% | 0% |
| Regular pagante (passe + R$ 12,90/mês) | 38% | 10% | 26% | 2% | 9% | 1% | 11% | 2% | 0% |
| Engajado pagante (passe + R$ 129,90/mês) | 40% | 10% | 27% | 3% | 6% | 2% | 10% | 2% | 0% |
| Teste de estresse: engajado gastando ~R$ 670/mês | 42% | 10% | 26% | 3% | 6% | 2% | 9% | 2% | 0% |
| Teste de estresse: engajado girando milho sem parar | 37% | 9% | 32% | 3% | 6% | 2% | 9% | 2% | 0% |
| Regular com 3 amigos (mutirão diário) | 43% | 6% | 21% | 2% | 8% | 2% | 8% | 2% | 8% |
| Casual carregado por 3 amigos engajados | 53% | 2% | 20% | 1% | 16% | 3% | 4% | 1% | 0% |

**Para onde vão as moedas** (parte das moedas ganhas em 180 dias).

| Persona | Moedas ganhas | Construções | Terra | Animais | Árvores | 3ª vaga | Armazém | Vila | Festa da vila | Sementes | Feira | Decoração | Total gasto |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Casual (2 sessões de 5 min) | 1.787.339 | 17% | 15% | 8% | 13% | 5% | 7% | 22% | 0% | 5% | 0% | 5% | 98% |
| Regular (5 sessões, 40 min) | 5.149.097 | 10% | 20% | 8% | 13% | 5% | 9% | 23% | 0% | 6% | 0% | 5% | 99% |
| Engajado (10 sessões, 150 min) | 8.878.462 | 6% | 12% | 5% | 8% | 3% | 10% | 28% | 16% | 7% | 0% | 5% | 99% |
| Regular pagante (passe + R$ 12,90/mês) | 5.952.287 | 9% | 18% | 7% | 11% | 4% | 13% | 26% | 0% | 7% | 0% | 5% | 100% |
| Engajado pagante (passe + R$ 129,90/mês) | 9.558.217 | 5% | 11% | 5% | 7% | 2% | 13% | 26% | 18% | 8% | 0% | 5% | 100% |
| Teste de estresse: engajado gastando ~R$ 670/mês | 9.804.385 | 5% | 11% | 4% | 7% | 2% | 14% | 25% | 18% | 7% | 0% | 5% | 99% |
| Teste de estresse: engajado girando milho sem parar | 9.486.100 | 5% | 11% | 5% | 7% | 3% | 9% | 26% | 18% | 9% | 0% | 5% | 99% |
| Regular com 3 amigos (mutirão diário) | 7.732.437 | 7% | 13% | 6% | 9% | 3% | 8% | 32% | 9% | 7% | 0% | 5% | 99% |
| Casual carregado por 3 amigos engajados | 4.765.388 | 11% | 11% | 5% | 7% | 3% | 9% | 28% | 0% | 10% | 0% | 5% | 89% |

**Cash: fontes e usos em 180 dias.**

| Persona | + nível | + missões | + calendário | + conquistas | + vila | + maestria | + anúncios | + passe | + compra | − vagas | − acelerar | − peças |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Casual (2 sessões de 5 min) | 74 | 58 | 130 | 82 | 34 | 17 | 179 | 0 | 0 | 200 | 0 | 0 |
| Regular (5 sessões, 40 min) | 129 | 175 | 130 | 82 | 48 | 82 | 180 | 0 | 0 | 250 | 0 | 0 |
| Engajado (10 sessões, 150 min) | 169 | 180 | 130 | 82 | 75 | 143 | 180 | 0 | 0 | 250 | 0 | 0 |
| Regular pagante (passe + R$ 12,90/mês) | 139 | 178 | 130 | 82 | 52 | 96 | 180 | 1.780 | 910 | 750 | 913 | 75 |
| Engajado pagante (passe + R$ 129,90/mês) | 179 | 180 | 130 | 82 | 78 | 149 | 180 | 1.780 | 9.700 | 750 | 8.764 | 150 |
| Teste de estresse: engajado gastando ~R$ 670/mês | 179 | 180 | 130 | 82 | 78 | 158 | 180 | 1.800 | 48.100 | 750 | 21.480 | 180 |
| Teste de estresse: engajado girando milho sem parar | 179 | 180 | 130 | 82 | 78 | 140 | 180 | 0 | 0 | 250 | 0 | 0 |
| Regular com 3 amigos (mutirão diário) | 139 | 180 | 130 | 82 | 63 | 127 | 180 | 0 | 0 | 250 | 0 | 0 |
| Casual carregado por 3 amigos engajados | 89 | 180 | 130 | 82 | 50 | 52 | 179 | 0 | 0 | 225 | 0 | 0 |

Como ler a compressão por pagamento: o regular pagante chega ao nível 60 no dia 146 em vez do 164 (1,12 vez); o engajado pagante, no 93 em vez do 99 (1,07 vez); a baleia, no 91 (1,09 vez), com 28 mil cash sobrando porque o teto de 24 acelerações por dia não a deixa gastar mais. O ganho do pagante vem mais do passe (vaga extra na fila, caseiro, recompensas de anúncio sem assistir) do que de acelerar: um sítio de nível 40 tem mais de cem temporizadores por dia, e concluir 24 deles muda pouco.

Como ler o grind: girar milho em todos os canteiros durante as dez sessões, todos os dias, leva ao nível 60 no dia 93, seis dias antes do engajado comum (1,07 vez), gastando de 31 a 48% de cada sessão nisso. O ganho é pequeno para o esforço; não é preciso barra de energia nem "cansaço" para conter esse comportamento.

### O que mudou durante o ajuste

1. **Curva de XP.** A primeira versão (`8 × L^2,2` com quebra no nível 30) deixava a primeira sessão no nível 3 e o dia 30 no nível 33. A final tem quatro trechos e foi achada por ponto fixo (`calibrar.py`): mede-se quanto XP cada persona junta nos dias-meta e resolve-se o expoente de cada trecho.
2. **Rendimento por canteiro de 2 para 3.** Com 2, o sítio vivia sem insumo e as construções ficavam de 13 a 28% do tempo ocupadas.
3. **Culturas longas mais cedo.** A abóbora de 4 h foi para o nível 7 e a melancia de 8 h para o 13; antes a primeira cultura de 8 h só vinha no nível 29 e os canteiros do regular passavam quase todo o tempo parados na primeira semana.
4. **Pedidos.** O expoente do valor-alvo caiu de 1,35 para 1,25, porque os pedidos por dia do engajado caíam de 23 para 11 com o nível. Entraram a regra de não repetir item e o lote máximo por duração: numa rodada, quatro pedidos de 12 a 14 unidades de erva-mate (16 h) prenderam 22 dos 37 canteiros.
5. **Poupança.** Comprando sempre o mais barato, o jogador simulado chegou ao nível 49 com 6 de 9 construções. A política final reserva moedas para construções e animais. Para o jogo, a lição é de interface: mostrar a próxima construção como meta e avisar quando uma compra menor a atrasa.
6. **Peças de reforma.** Com os custos iniciais sobravam centenas de peças. Subiram: escrituras de `1 + k/2` para `2 + k`, tábuas de `2 + j` para `3 + 2j`, ferramentas da terceira vaga de 4 para 8.
7. **Missões.** Pagando 6% de um nível por dia, as missões viravam de 22 a 28% de todo o XP e achatavam a diferença entre perfis. Passaram a pagar múltiplos do valor de um pedido e ficaram em cerca de 10%.
8. **Mutirão.** Com diária de 1% de um nível por baú e XP de colheita indo para o dono, o regular com três amigos comprimia 1,41 vez. A diária passou a 0,35 × TV e as ações do ajudante deixaram de dar XP ao dono: 1,21 vez.
9. **Cadeia do chocolate.** O sítio pedia 100 unidades de cacau e produzia 12 a cada 10 h. As receitas ficaram mais leves (2 cacau por cacau torrado, 1 cacau torrado por chocolate) e as mudas por tipo foram de 4 para 6.
10. **Moedas depois do teto.** Com a festa da vila a 12% da renda de referência por semana, o engajado chegava ao dia 180 com 21 dias de renda parados. Com 5 cotas de 20%, o saldo fica abaixo de 1,5 dia.
11. **Níveis de mestre.** Com crescimento de 3% por nível depois do 60, o engajado subia 5 níveis por mês e nenhuma cadência de conteúdo acompanhava. O fator de 3,25 aproxima o ritmo dele dos 2 níveis por mês.
12. **Escala do XP.** Todos os valores de XP foram dobrados, sem efeito no ritmo, para que o primeiro nível não custasse 3 XP.
13. **Armazém maior.** De 50 com passo de 25 para 75 com passo de 40, depois de ver que o tamanho do armazém quase não muda o ritmo e muda muito o número de vezes em que ele enche. A curva foi reapertada em seguida (expoentes 3,3 para 3,35 e 2,2 para 2,3).

## Riscos

1. **O jogador simulado é disciplinado.** Joga todo dia, nos mesmos horários, sem errar. O ritmo real será mais lento para o mesmo tempo de jogo e mais disperso. As metas devem ser reconferidas com a telemetria do alfa antes de qualquer conteúdo novo ser encaixado.
2. **O jogador simulado não é o mais esperto possível.** Um jogador que otimize melhor que a política da simulação pode andar mais rápido que o "engajado". O teste do milho cobre o grind, não cobre estratégias de pedido e estoque. Margem atual: 9 dias sobre a meta de 90.
3. **Ocupação do engajado.** Mais da metade da sessão dele não tem ação útil no próprio sítio. Se mutirão, feira e minijogos não segurarem esse tempo, o jogador de 2 a 3 horas vira jogador de 1 hora, o que não quebra o ritmo mas reduz anúncios vistos e presença social.
4. **Produção de conteúdo para o lançamento.** Os níveis 31 a 60 pedem 2 animais, 4 construções, 8 culturas e 3 árvores em 3D. Se não ficarem prontos, o lançamento público sai com teto que o engajado alcança em duas a quatro semanas.
5. **Pagamento comprime pouco.** Bom para justiça, arriscado para receita: quem paga por tempo recebe relativamente pouco. A receita depende mais de passe e cosméticos do que de aceleração. Há decisão com teste na tabela abaixo.
6. **Fogão a lenha concentra 14 receitas.** É a construção mais disputada; pode virar gargalo percebido.
7. **Salto dos níveis de mestre.** Passar de 190 mil para 610 mil XP por nível pode parecer parede. A apresentação precisa mudar junto: outro nome, outra barra, recompensa maior.
8. **Recompensas diárias e legislação.** Missões, calendário e baú diário são mecânicas de retorno. O calendário não zera e nada pune a ausência, mas o enquadramento no ECA Digital para menores precisa de parecer.
9. **Sistemas fora da simulação.** Eventos, liga, álbum e trilha gratuita do passe dão recompensas extras. Cada um deve entrar na simulação antes de entrar no jogo.
10. **Referências externas lidas por resumo.** Os números dos outros jogos não foram conferidos nas páginas. Não entram em nenhuma tabela, mas sustentam as comparações de formato.

## Decisões

Cada linha traz o padrão recomendado e o teste que o mudaria.

| Decisão | Padrão recomendado | O que mudaria a decisão |
|---|---|---|
| Teto de conteúdo no lançamento web | Nível 60 | Se, no lançamento suave, os 5% mais ativos passarem do nível 42 no dia 30, endurecer o trecho 30–60 com `calibrar.py` antes de abrir mais países |
| Conteúdo do MVP | Níveis 1 a 30, com maestria e vila já ligadas | Se testadores do alfa chegarem ao nível 30 antes do dia 12, antecipar os níveis 31 a 36 |
| Curva de XP | `5 × L^1,8` até o 4; expoentes 3,35, 2,3 e 2,8 nos trechos seguintes | Mediana real fora da meta em mais de 2 níveis no dia 7 ou no dia 30: recalibrar |
| Níveis de mestre | 3,25 vezes o XP do nível 60, mais 2% por nível | Engajados reais ganhando mais de 2,5 ou menos de 1,5 nível por mês: ajustar o fator |
| Cadência de conteúdo | 2 níveis de mestre por mês | Se a equipe não sustentar, cair para 1 por mês e subir o fator para cerca de 6,5 |
| Canteiros e rendimento | 48 canteiros, 3 unidades por canteiro | Sala de 4 jogadores com 48 canteiros pesada em celular intermediário: 36 canteiros com 4 unidades |
| Giro de culturas curtas | Sem contenção | Mais de 5% dos engajados tirando mais de 25% do XP de culturas de até 3 min: baixar o XP delas para 1 |
| Quem entrega pedidos no mutirão | Só o dono | Teste de permissão "sócio" para casais e famílias: liberar se o dono ausente não andar mais de 1,3 vez mais rápido |
| XP das ações do ajudante | Não vai para o dono | Se testadores acharem confuso ou injusto, dar 50% e medir a compressão de novo |
| Diária do ajudante | 4 baús por dia de 0,35 × TV de XP | Poucas sessões cooperativas: subir para 0,5; jogadores em grupo chegando ao teto em menos de 0,75 do tempo dos solo: baixar |
| Bônus de produção por presença | Nenhum | Só como efeito cosmético de festa, se a taxa de sessões cooperativas ficar abaixo da meta |
| Peças de reforma | 1 a cada 3 pedidos, medidor visível, meta fixada, três tipos | Mais de 20% dos ativos do dia 30 parados por peça há mais de 3 dias: 1 a cada 2 pedidos; menos de 3% alguma vez parados: encarecer |
| Armazém | 75 em cada, mais 40 por ampliação; venda de excedente em um toque | Mais de 2 avisos de armazém cheio por sessão para o regular no alfa: ir para 100 e mais 50 e recalibrar a curva (custa cerca de 1 nível no dia 30) |
| Preço de acelerar | `teto(0,28 × min^0,7)` cash, teto de 24 por dia | Mais de 1% dos pagantes batendo o teto em mais de 20% dos dias, com ritmo abaixo de 1,25 vez: subir para 40 |
| Limite de compressão por pagamento | 1,25 vez no tempo até o nível 60 | Rever só se a receita por pagante ficar abaixo da meta com conversão normal |
| Renovar pedido com cash ou anúncio | Não no lançamento | Se a queixa de "pedido travado" aparecer, liberar 2 trocas por dia por anúncio, sem cash |
| Cash gratuito | Cerca de 6 por dia no primeiro mês e 4 depois (regular) | Saldo mediano dos não pagantes acima de 150 no dia 30 e conversão abaixo da meta: cortar conquistas pela metade |
| Conversão de cash em moedas | Não existe | Manter; é o que impede comprar progresso direto |
| Passe | R$ 19,90; devolve 300 cash; vaga extra na fila, caseiro e anúncio sem assistir durante o mês | Assinantes chegando ao teto em menos de 0,85 do tempo dos demais: tirar a vaga extra e deixar só conveniência e cosméticos |
| Passe comprado com cash | Não; só dinheiro real | Testar depois de seis meses, se houver muito cash gratuito parado |
| Anúncios | 5 pontos, teto de 8 por dia, a partir do nível 6; só o baú dá cash (1) | Menos de 4 vistos por usuário ativo: acrescentar "dobrar a colheita de um canteiro"; mais de 30% batendo o teto: testar pacote sem anúncios |
| Valor dos pedidos | `TV = 10 × L^1,25`; moedas 1,25; XP 0,7 | Regular real com menos de 8 ou mais de 16 pedidos por dia: mexer no expoente |
| Espera do quadro | `2 + 0,3 × L` min, até 15; não se pula | Sessão mediana abaixo de 4 min no primeiro mês: reduzir à metade |
| Feira | A cada 5 min, 1 freguês e 1 oferta | Sessão mediana do regular abaixo de 6 min: 2 fregueses por reabastecimento |
| Missões | 3 por dia, cerca de 10% do XP | Fora de 8 a 12% do XP do regular: ajustar os múltiplos |
| Calendário | 7 casas, não zera | Manter; rever só por exigência legal |
| Maestria | 5 estrelas por horas de produção; mais 2% de preço por estrela | Os 10% mais ativos com mais de 80% das estrelas antes do dia 150: criar o selo de 6ª estrela |
| Vila | 30 estágios e festa semanal de 5 cotas | Saldo pós-teto acima de 5 dias de renda: encarecer as cotas |
| Fogão a lenha | Um só, 14 receitas | Fila do fogão sempre cheia e as outras abaixo de 40% de uso: liberar um segundo fogão no nível 26 |
| Café | Cultura de canteiro | Se a direção de arte preferir arbusto perene, tratar como árvore de ciclo de 2 h 30 |
| Sorteio em qualquer recompensa | Nenhum pago; medidores determinísticos | Sem teste: decorre da regra já aprovada |
| Faltas do jogador real | Simulação supõe jogo diário | Medir no alfa a fração de dias jogados por perfil e reescalar os dias das metas |

## Fontes, lacunas e endereços bloqueados

As fontes externas estão ligadas na tabela de referências. Todas foram lidas pelo resumo do buscador em 11 de novembro de 2026.

Endereços que o ambiente recusou (uma tentativa cada, sem contorno): `hayday.fandom.com`, `township.fandom.com`, `stardewvalleywiki.com`, `www.gamedeveloper.com`, `support.supercell.com`, `mobilefreetoplay.com`. Com acesso a eles daria para conferir as tabelas de XP completas, os tempos de produção e as regras de liga.

O que continua sem fonte:

- Tempo real até níveis-marco para jogador casual e engajado em qualquer jogo de referência.
- Moeda premium gratuita por dia nos líderes.
- Distribuição de duração e frequência de sessão em jogos de fazenda.
- Regras de progressão no cooperativo de Farm Together 2 (se o visitante ganha e leva recompensas).
- Estrutura de degraus e recompensas dos passes dos líderes.

Nada disso muda as tabelas, que são próprias; muda a confiança nas comparações.
