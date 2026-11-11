# Live check of Google Play: farm-game listings, search results and top charts in Brazil and the United States (read on 2026-11-11)

> **Research conditions (read first).**
> - **Source and date.** Everything under "Cited Findings" was read directly from `play.google.com` on **2026-11-11 between 13:32 and 13:48 UTC**. No other host was reachable and no web search was used. 126 requests were made to play.google.com (78 listing pages, 17 search pages, 3 category/home pages, 6 developer pages, 21 chart-data requests, 1 headless page load); one of them was a guessed package id that returned 404.
> - **How listing data was read.** Listing, search and developer pages were fetched as plain HTML and the JSON that Google embeds in the page (`AF_initDataCallback` blocks) was parsed. The visible labels "Contém anúncios" / "Contains ads" and "Compras no app" / "In-app purchases" were cross-checked between the embedded data and the rendered HTML for all 77 parsed listings with zero mismatches.
> - **How chart data was read.** The category pages show a "Top charts" box with three tabs (top free, top grossing, top paid), but the static HTML only contains empty placeholders. Rendering the page in a headless browser failed because the page's script host (`www.gstatic.com`) is refused by this session's network policy (HTTP 403 on connect; tried once, not retried). The chart lists were therefore requested from the data endpoint on play.google.com that those tabs call (`/_/PlayStoreUi/data/batchexecute`, request `vyAe2`, naming the collection and category). This is **not the rendered page**; it is the page's own data feed. It was validated two ways: 13 of 13 chart badges that could be checked on listing pages (for example "#5 mais rentáveis casuais" on Township) match the position in the corresponding list, and two separate requests for the same chart returned an identical first 100 rows.
> - **Two storefronts.** Brazil = `hl=pt_BR&gl=BR`; United States = `hl=en_US&gl=US`.
> - **Terms used below.** "Installs band" is the public download label (for example "500 mi+"). "Embedded install counter" is a more precise number that sits next to the band inside the page data but is not shown on the rendered page; it is Google's own figure but undocumented, so treat it as indicative. "Ratings count" is the number of star ratings; it is identical on both storefronts, so it is a worldwide total. The star average, by contrast, differs by storefront.
> - Items marked **[UNVERIFIED-BK]** are background knowledge with no source retrievable in this session; they appear only under "Inferences".

---

## 1. For each candidate game, what does its Play Store listing show today in Brazil and in the United States?

### Takeaway
Every named candidate except Farm Merge Valley was found and read: Township shows the "500 mi+" band with 12,983,836 ratings (4.83★ in Brazil, 4.69★ in the US) and Hay Day shows "100 mi+" with 13,075,075 ratings (4.57★ BR, 4.41★ US), while Heartopia is far smaller on listing metrics ("10 mi+", 137,809 ratings, 4.49★ BR). On the Brazilian storefront 12 of the 24 core candidates, including Township, carry an 18-years content rating while their US listings say "Everyone".

### Cited Findings

**Table 1a — Core candidates, Brazil storefront (each game name links to the exact page read; fetched 2026-11-11).**

| Game (BR listing title, linked to source) | Package | Developer | ★ BR | Ratings count | Installs band | Embedded install counter | "Contém anúncios" | "Compras no app" range (BRL, per item) | Price | Content rating (BR) | Play category | Released (BR listing) | Last updated | Chart badge shown on listing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| [Township](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR) | `com.playrix.township` | Playrix | 4.83 | 12,983,836 | 500 mi+ | 529,551,663 | No | R$ 0,99 – R$ 849,90 | free | Classificação 18 anos | Casuais | 8 de nov. de 2013 | 28 de out. de 2026 | #5 mais rentáveis casuais |
| [Hay Day](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=pt_BR&gl=BR) | `com.supercell.hayday` | Supercell | 4.57 | 13,075,075 | 100 mi+ | 374,111,421 | Yes | R$ 1,90 – R$ 1.499,90 | free | Classificação Livre | Casuais | 13 de nov. de 2013 | 16 de out. de 2026 | #6 mais rentáveis casuais |
| [Heartopia](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=pt_BR&gl=BR) | `com.xd.xdtglobal.gp` | XD Entertainment Co., Ltd. | 4.49 | 137,809 | 10 mi+ | 11,277,530 | No | R$ 2,50 – R$ 62,90 | free | Classificação 12 anos | Simulador | 23 de dez. de 2025 | 21 de ago. de 2026 | #5 mais rentáveis simulador |
| [The Cozy Florist](https://play.google.com/store/apps/details?id=com.riftsky.mhg.gb.gp&hl=pt_BR&gl=BR) | `com.riftsky.mhg.gb.gp` | Riftsky Games | 4.88 | 166,818 | 1 mi+ | 3,493,290 | Yes | R$ 2,39 – R$ 529,99 | free | Classificação 18 anos | Simulador | 4 de dez. de 2025 | 5 de nov. de 2026 | — |
| [Meu Mundo do Jardim](https://play.google.com/store/apps/details?id=com.jxhy.official&hl=pt_BR&gl=BR) | `com.jxhy.official` | Modo Global | 4.47 | 12,161 | 1 mi+ | 2,415,526 | Yes | R$ 1,59 – R$ 2.499,90 | free | Classificação Livre | Simulador | 26 de jun. de 2026 | 30 de out. de 2026 | — |
| [Klondike Adventures: Fazenda](https://play.google.com/store/apps/details?id=com.vizorapps.klondike&hl=pt_BR&gl=BR) | `com.vizorapps.klondike` | VIZOR APPS LTD. | 4.57 | 1,379,707 | 100 mi+ | 112,882,464 | Yes | R$ 2,50 – R$ 789,99 | free | Classificação 18 anos | Simulador | 3 de abr. de 2018 | 9 de nov. de 2026 | #9 mais rentáveis simulador |
| [Family Island: Jogo de fazenda](https://play.google.com/store/apps/details?id=com.MelsoftGames.FamilyIslandFarm&hl=pt_BR&gl=BR) | `com.MelsoftGames.FamilyIslandFarm` | Melsoft Games Ltd | 4.45 | 1,665,263 | 50 mi+ | 75,864,077 | Yes | R$ 4,99 – R$ 999,99 | free | 18 anos | Casuais | 18 de nov. de 2019 | 6 de nov. de 2026 | — |
| [Family Farm Adventure®](https://play.google.com/store/apps/details?id=com.farmadventure.global&hl=pt_BR&gl=BR) | `com.farmadventure.global` | Century Games PTE. LTD. | 4.67 | 554,970 | 10 mi+ | 33,050,348 | Yes | R$ 4,99 – R$ 619,90 | free | Classificação Livre | Simulador | 14 de abr. de 2021 | 27 de out. de 2026 | — |
| [FarmVille 2 Aventuras no Campo](https://play.google.com/store/apps/details?id=com.zynga.FarmVille2CountryEscape&hl=pt_BR&gl=BR) | `com.zynga.FarmVille2CountryEscape` | Zynga | 4.74 | 3,232,400 | 50 mi+ | 78,789,697 | Yes | R$ 1,09 – R$ 2.049,99 | free | Classificação 18 anos | Casuais | 16 de abr. de 2014 | 23 de out. de 2026 | — |
| [FarmVille 3 - Animais Rurais](https://play.google.com/store/apps/details?id=com.zynga.farmville3&hl=pt_BR&gl=BR) | `com.zynga.farmville3` | Zynga | 4.52 | 188,374 | 10 mi+ | 14,845,299 | Yes | R$ 2,90 – R$ 1.299,90 | free | Classificação 18 anos | Simulador | 2 de nov. de 2021 | 4 de nov. de 2026 | — |
| [Stardew Valley](https://play.google.com/store/apps/details?id=com.chucklefish.stardewvalley&hl=pt_BR&gl=BR) | `com.chucklefish.stardewvalley` | ConcernedApe | 4.76 | 203,699 | 5 mi+ | 7,265,589 | No | no IAP label | R$ 24,99 | Classificação Livre | RPG | 13 de mar. de 2019 | 26 de jun. de 2026 | #2 principais apps pagos rpg |
| [Farming Simulator 23](https://play.google.com/store/apps/details?id=com.giantssoftware.fs23.google&hl=pt_BR&gl=BR) | `com.giantssoftware.fs23.google` | GIANTS Software | 4.53 | 27,581 | 500 mil+ | 504,875 | Yes | R$ 5,49 – R$ 16,99 | R$ 24,90 | Classificação Livre | Simulador | 22 de mai. de 2023 | 17 de mar. de 2025 | #3 principais apps pagos simulador |
| [Farming Simulator 26 Mobile](https://play.google.com/store/apps/details?id=com.giantssoftware.fs26.google&hl=pt_BR&gl=BR) | `com.giantssoftware.fs26.google` | GIANTS Software | 3.60 | 4,431 | 50 mil+ | 97,452 | Yes | R$ 5,90 – R$ 14,90 | R$ 39,90 | Classificação Livre | Simulador | 18 de mai. de 2026 | 11 de nov. de 2026 | #6 principais apps pagos simulador |
| [Big Farm: Mobile Harvest](https://play.google.com/store/apps/details?id=com.goodgamestudios.bigfarmmobileharvest&hl=pt_BR&gl=BR) | `com.goodgamestudios.bigfarmmobileharvest` | Goodgame Studios | 4.14 | 437,725 | 50 mi+ | 57,878,711 | Yes | R$ 6,90 – R$ 2.249,99 | free | Classificação 18 anos | Casuais | 25 de out. de 2017 | 23 de out. de 2026 | — |
| [Big Farm: Homestead](https://play.google.com/store/apps/details?id=com.newmoonproduction.bigfarmhomestead&hl=pt_BR&gl=BR) | `com.newmoonproduction.bigfarmhomestead` | Goodgame Studios | 4.80 | 68,319 | 1 mi+ | 4,251,607 | Yes | R$ 4,90 – R$ 869,90 | free | Classificação 18 anos | Simulador | 1 de dez. de 2025 | 29 de out. de 2026 | — |
| [Farm Land](https://play.google.com/store/apps/details?id=com.loltap.farmland&hl=pt_BR&gl=BR) | `com.loltap.farmland` | Homa | 4.64 | 852,077 | 100 mi+ | 137,963,950 | No | R$ 3,19 – R$ 559,99 | free | Classificação Livre | Aventura | 26 de abr. de 2021 | 1 de out. de 2026 | — |
| [Farm City: Farming & Building](https://play.google.com/store/apps/details?id=com.citybay.farming.citybuilding&hl=pt_BR&gl=BR) | `com.citybay.farming.citybuilding` | iKame Games - Zego Studio | 4.46 | 602,061 | 50 mi+ | 67,839,432 | Yes | R$ 2,49 – R$ 249,99 | free | Classificação Livre | Casuais | 11 de fev. de 2020 | 9 de nov. de 2026 | — |
| [Harvest Town](https://play.google.com/store/apps/details?id=com.harvest.android.gr&hl=pt_BR&gl=BR) | `com.harvest.android.gr` | AVIDGamers | 4.63 | 119,987 | 10 mi+ | 11,417,829 | Yes | R$ 3,39 – R$ 489,99 | free | Classificação 12 anos | RPG | 9 de dez. de 2020 | 20 de mar. de 2026 | — |
| [Golden Farm](https://play.google.com/store/apps/details?id=ru.playme8.dachniki&hl=pt_BR&gl=BR) | `ru.playme8.dachniki` | P.D. PLAYGENES INTERNATIONAL LIMITED | 4.58 | 159,347 | 10 mi+ | 12,467,797 | Yes | R$ 0,39 – R$ 1.349,99 | free | Classificação 18 anos | Casuais | 4 de dez. de 2017 | 17 de set. de 2026 | — |
| [Coco Valley: Farm Adventure](https://play.google.com/store/apps/details?id=com.onicore.torch&hl=pt_BR&gl=BR) | `com.onicore.torch` | BitStrong Games | 4.42 | 11,865 | 1 mi+ | 3,565,802 | Yes | R$ 4,89 – R$ 394,99 | free | Classificação 18 anos | Simulador | 30 de abr. de 2023 | 13 de mai. de 2026 | — |
| [Sunrise Village](https://play.google.com/store/apps/details?id=com.innogames.sunrisevillage&hl=pt_BR&gl=BR) | `com.innogames.sunrisevillage` | InnoGames GmbH | 4.70 | 178,855 | 5 mi+ | 5,364,974 | Yes | R$ 4,90 – R$ 999,90 | free | Classificação 18 anos | Simulador | 7 de dez. de 2021 | 13 de out. de 2026 | — |
| [Aventura Dragon Cape](https://play.google.com/store/apps/details?id=com.dragonscapes.global&hl=pt_BR&gl=BR) | `com.dragonscapes.global` | Century Games PTE. LTD. | 4.85 | 693,085 | 10 mi+ | 22,086,420 | Yes | R$ 4,99 – R$ 619,90 | free | Classificação Livre | Simulador | 27 de out. de 2020 | 30 de out. de 2026 | — |
| [Taonga Island Adventure: Farm](https://play.google.com/store/apps/details?id=com.volka.taonga&hl=pt_BR&gl=BR) | `com.volka.taonga` | Volka | 4.24 | 49,407 | 1 mi+ | 4,978,434 | No | R$ 5,99 – R$ 1.299,99 | free | Classificação Livre | Simulador | 24 de ago. de 2021 | 22 de out. de 2026 | — |
| [Gossip Harbor: Merge & Story](https://play.google.com/store/apps/details?id=com.mergegames.gossipharbor&hl=pt_BR&gl=BR) | `com.mergegames.gossipharbor` | Microfun Limited | 4.17 | 738,265 | 100 mi+ | 103,761,386 | Yes | R$ 4,99 – R$ 539,99 | free | Classificação 18 anos | Quebra-cabeças | 9 de set. de 2022 | 10 de nov. de 2026 | #1 mais rentáveis quebra-cabeças |

**Table 1b — Most prominent idle / arcade farm titles, Brazil storefront (fetched 2026-11-11).**

| Game (BR listing title, linked to source) | Package | Developer | ★ BR | Ratings count | Installs band | Embedded install counter | "Contém anúncios" | "Compras no app" range (BRL, per item) | Price | Content rating (BR) | Play category | Released (BR listing) | Last updated | Chart badge shown on listing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| [Idle Farming Empire](https://play.google.com/store/apps/details?id=com.futureplay.boots&hl=pt_BR&gl=BR) | `com.futureplay.boots` | Futureplay | 4.60 | 353,534 | 10 mi+ | 23,559,833 | Yes | R$ 4,99 – R$ 609,99 | free | Classificação Livre | Simulador | 26 de jan. de 2016 | 11 de nov. de 2026 | — |
| [Little Farm Story](https://play.google.com/store/apps/details?id=com.h8games.littlefarmstory&hl=pt_BR&gl=BR) | `com.h8games.littlefarmstory` | SayGames Ltd | 4.58 | 245,612 | 10 mi+ | 18,667,009 | Yes | R$ 4,99 – R$ 1.099,99 | free | Classificação Livre | RPG | 22 de mar. de 2024 | 1 de out. de 2026 | — |
| [Egg, Inc.](https://play.google.com/store/apps/details?id=com.auxbrain.egginc&hl=pt_BR&gl=BR) | `com.auxbrain.egginc` | Auxbrain Inc | 4.80 | 1,410,843 | 10 mi+ | 31,204,136 | Yes | R$ 19,99 – R$ 104,99 | free | Classificação Livre | Simulador | 13 de jul. de 2016 | 19 de ago. de 2026 | — |
| [Harvest.io - Arcade de fazenda](https://play.google.com/store/apps/details?id=com.harvest.io&hl=pt_BR&gl=BR) | `com.harvest.io` | CASUAL AZUR GAMES | 4.20 | 216,128 | 100 mi+ | 178,468,616 | Yes | R$ 2,89 – R$ 149,99 | free | Classificação Livre | Simulador | 27 de nov. de 2019 | 3 de nov. de 2026 | — |

**Table 1c — Other prominent farm titles surfaced by Brazilian searches and charts, Brazil storefront (fetched 2026-11-11).**

| Game (BR listing title, linked to source) | Package | Developer | ★ BR | Ratings count | Installs band | Embedded install counter | "Contém anúncios" | "Compras no app" range (BRL, per item) | Price | Content rating (BR) | Play category | Released (BR listing) | Last updated | Chart badge shown on listing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| [Fazenda Feliz Pocket](https://play.google.com/store/apps/details?id=com.funplus.familyfarm&hl=pt_BR&gl=BR) | `com.funplus.familyfarm` | Century Games PTE. LTD. | 4.14 | 1,626,535 | 50 mi+ | 97,811,806 | No | R$ 4,99 – R$ 619,90 | free | Classificação Livre | Casuais | 25 de fev. de 2013 | 22 de set. de 2026 | — |
| [Farmington - Jogo de fazenda](https://play.google.com/store/apps/details?id=ugo.com.play.free.farmington&hl=pt_BR&gl=BR) | `ugo.com.play.free.farmington` | UGO Games | 4.77 | 334,054 | 10 mi+ | 29,674,895 | Yes | R$ 2,00 – R$ 484,99 | free | Classificação 18 anos | Aventura | 18 de nov. de 2021 | 10 de nov. de 2026 | — |
| [Royal Farm – Fazenda e cidade](https://play.google.com/store/apps/details?id=com.ugo.play.free.farm.valley&hl=pt_BR&gl=BR) | `com.ugo.play.free.farm.valley` | UGO Games | 4.70 | 169,581 | 10 mi+ | 10,549,510 | Yes | R$ 4,00 – R$ 249,99 | free | Classificação 18 anos | Aventura | 25 de out. de 2019 | 11 de nov. de 2026 | — |
| [Goodville: Fazenda de aventura](https://play.google.com/store/apps/details?id=com.goodville.goodgame&hl=pt_BR&gl=BR) | `com.goodville.goodgame` | Goodville AG | 4.57 | 170,463 | 5 mi+ | 9,355,630 | Yes | R$ 4,99 – R$ 769,99 | free | Classificação Livre | Aventura | 23 de mar. de 2020 | 7 de nov. de 2026 | — |
| [Farm Manager - 2027](https://play.google.com/store/apps/details?id=com.trophygames.farmmanager&hl=pt_BR&gl=BR) | `com.trophygames.farmmanager` | Xombat Development - Airline manager games | 4.64 | 65,651 | 10 mi+ | 12,084,134 | Yes | R$ 2,49 – R$ 519,99 | free | Classificação Livre | Simulador | 13 de jul. de 2025 | 28 de out. de 2026 | — |
| [Farming Simulator 14](https://play.google.com/store/apps/details?id=com.giantssoftware.fs14&hl=pt_BR&gl=BR) | `com.giantssoftware.fs14` | GIANTS Software | 4.11 | 1,011,640 | 100 mi+ | 141,709,817 | No | R$ 5,49 – R$ 16,99 | free | Classificação Livre | Simulador | 17 de nov. de 2013 | 24 de nov. de 2023 | — |
| [Farming Simulator 16](https://play.google.com/store/apps/details?id=com.giantssoftware.fs16&hl=pt_BR&gl=BR) | `com.giantssoftware.fs16` | GIANTS Software | 4.35 | 448,088 | 50 mi+ | 91,351,895 | Yes | R$ 5,49 – R$ 16,99 | free | Classificação Livre | Simulador | 5 de ago. de 2015 | 6 de mar. de 2026 | — |
| [Farming Simulator 18](https://play.google.com/store/apps/details?id=com.giantssoftware.fs18.google&hl=pt_BR&gl=BR) | `com.giantssoftware.fs18.google` | GIANTS Software | 4.26 | 117,206 | 10 mi+ | 34,752,409 | Yes | R$ 5,49 – R$ 16,99 | free | Classificação Livre | Simulador | 5 de jun. de 2017 | 16 de mar. de 2026 | — |
| [Farming Simulator 20](https://play.google.com/store/apps/details?id=com.giantssoftware.fs20.google&hl=pt_BR&gl=BR) | `com.giantssoftware.fs20.google` | GIANTS Software | 4.24 | 48,857 | 1 mi+ | 1,161,684 | No | R$ 5,49 – R$ 16,99 | R$ 22,95 | Classificação Livre | Simulador | 3 de dez. de 2019 | 24 de mar. de 2026 | #7 principais apps pagos simulador |
| [Farming Sim Brasil](https://play.google.com/store/apps/details?id=com.stargamesapps.farmingsimbrasil&hl=pt_BR&gl=BR) | `com.stargamesapps.farmingsimbrasil` | Star Games Apps | 4.10 | 22,827 | 1 mi+ | 3,946,723 | Yes | no IAP label | free | Classificação Livre | Simulador | 26 de mar. de 2024 | 29 de nov. de 2025 | — |
| [Family Farm Merge](https://play.google.com/store/apps/details?id=com.roomperfect.global&hl=pt_BR&gl=BR) | `com.roomperfect.global` | Century Games Innovation Pte. Ltd. | 4.80 | 21,781 | 1 mi+ | 3,771,513 | Yes | R$ 6,00 – R$ 619,90 | free | Classificação Livre | Quebra-cabeças | 9 de mai. de 2026 | 4 de nov. de 2026 | #10 mais rentáveis quebra-cabeças |
| [Sunshine Island Grande Fazenda](https://play.google.com/store/apps/details?id=com.newmoonproduction.sunshineisland&hl=pt_BR&gl=BR) | `com.newmoonproduction.sunshineisland` | Goodgame Studios | 4.82 | 171,049 | 10 mi+ | 11,500,833 | Yes | R$ 4,90 – R$ 869,90 | free | Classificação Livre | Simulador | 8 de jun. de 2023 | 6 de nov. de 2026 | — |
| [Farm Heroes Saga](https://play.google.com/store/apps/details?id=com.king.farmheroessaga&hl=pt_BR&gl=BR) | `com.king.farmheroessaga` | King | 4.70 | 9,789,030 | 100 mi+ | 435,285,194 | Yes | R$ 0,99 – R$ 559,99 | free | Classificação Livre | Casuais | 10 de dez. de 2013 | 10 de nov. de 2026 | #9 mais rentáveis casuais |
| [Spring Valley: Jogo de Fazenda](https://play.google.com/store/apps/details?id=com.playkot.adventure&hl=pt_BR&gl=BR) | `com.playkot.adventure` | CASUAL AZUR GAMES | 4.53 | 192,124 | 10 mi+ | 16,817,344 | Yes | R$ 2,99 – R$ 699,99 | free | Classificação 18 anos | Aventura | 26 de abr. de 2022 | 6 de nov. de 2026 | — |
| [Bermuda Adventures: Fazenda](https://play.google.com/store/apps/details?id=com.samfinaco.paradise&hl=pt_BR&gl=BR) | `com.samfinaco.paradise` | BELKA GAMES | 4.51 | 324,665 | 10 mi+ | 24,081,111 | Yes | R$ 5,49 – R$ 1.199,99 | free | Classificação 18 anos | Aventura | 8 de jun. de 2021 | 2 de jan. de 2026 | — |
| [Farm Town: Merge Cozy Village](https://play.google.com/store/apps/details?id=com.foranj.farmtown&hl=pt_BR&gl=BR) | `com.foranj.farmtown` | foranj.games | 4.35 | 553,261 | 50 mi+ | 52,998,506 | Yes | R$ 0,49 – R$ 49,99 | free | Classificação Livre | Casuais | 4 de ago. de 2013 | 27 de out. de 2026 | — |
| [FarmVille 2: Paraíso Tropical](https://play.google.com/store/apps/details?id=com.zynga.FarmVilleTropicEscape&hl=pt_BR&gl=BR) | `com.zynga.FarmVilleTropicEscape` | Zynga | 4.07 | 408,497 | 10 mi+ | 14,910,483 | Yes | R$ 3,69 – R$ 959,99 | free | Classificação 18 anos | Simulador | 24 de ago. de 2016 | 6 de nov. de 2026 | — |
| [Hempire - Cultivo de Cannabis](https://play.google.com/store/apps/details?id=ca.lbcstudios.hempire&hl=pt_BR&gl=BR) | `ca.lbcstudios.hempire` | LBC Studios Inc. | 4.79 | 396,158 | 10 mi+ | 20,074,623 | Yes | R$ 4,99 – R$ 1.099,99 | free | Classificação 18 anos | Simulador | 5 de abr. de 2017 | 30 de out. de 2026 | — |
| [My Dear Farm](https://play.google.com/store/apps/details?id=com.HyperBeardGames.MyDearFarm&hl=pt_BR&gl=BR) | `com.HyperBeardGames.MyDearFarm` | HyperBeard | 4.73 | 117,624 | 10 mi+ | 14,459,714 | Yes | R$ 2,90 – R$ 17,90 | free | Classificação Livre | Simulador | 2 de ago. de 2022 | 17 de out. de 2026 | — |
| [Wild West: atualizar a fazenda](https://play.google.com/store/apps/details?id=com.socialquantum.west3dint&hl=pt_BR&gl=BR) | `com.socialquantum.west3dint` | Social Quantum Ltd | 4.11 | 132,414 | 10 mi+ | 18,186,755 | Yes | R$ 2,39 – R$ 539,99 | free | Classificação Livre | Simulador | 7 de nov. de 2017 | 2 de nov. de 2026 | — |

**Table 1d — Core candidates, United States storefront (fetched 2026-11-11).** Ratings count, installs band and embedded install counter are the same as in Table 1a (see the note under the table), so only the fields that differ are repeated.

| Game (US listing title, linked to source) | ★ US | Written-review count (US) | Installs band | "Contains ads" | In-app purchases range (USD, per item) | Price | Content rating (US) | Play category | Released (US listing) | Chart badge shown on listing |
|---|---|---|---|---|---|---|---|---|---|---|
| [Township](https://play.google.com/store/apps/details?id=com.playrix.township&hl=en_US&gl=US) | 4.69 | 375,609 | 500,000,000+ | No | $0.99 - $149.99 | free | Everyone | Casual | Nov 8, 2013 | #3 top grossing casual |
| [Hay Day](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=en_US&gl=US) | 4.41 | 414,798 | 100,000,000+ | Yes | $0.29 - $239.99 | free | Everyone | Casual | Nov 13, 2013 | — |
| [Heartopia](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=en_US&gl=US) | 4.40 | 3,817 | 10,000,000+ | No | $0.39 - $99.99 | free | Teen | Simulation | Dec 23, 2025 | — |
| [The Cozy Florist](https://play.google.com/store/apps/details?id=com.riftsky.mhg.gb.gp&hl=en_US&gl=US) | 4.71 | 1,747 | 1,000,000+ | Yes | $0.49 - $99.99 | free | Everyone | Simulation | Nov 28, 2025 | — |
| [My Garden Tale](https://play.google.com/store/apps/details?id=com.jxhy.official&hl=en_US&gl=US) | 4.40 | 1,331 | 1,000,000+ | Yes | $0.29 - $399.99 | free | Everyone | Simulation | Jan 26, 2026 | — |
| [Klondike Adventures: Farm Game](https://play.google.com/store/apps/details?id=com.vizorapps.klondike&hl=en_US&gl=US) | 4.58 | 56,895 | 100,000,000+ | Yes | $0.29 - $199.99 | free | Everyone | Simulation | Apr 3, 2018 | #10 top grossing simulation |
| [Family Island™ — Farming game](https://play.google.com/store/apps/details?id=com.MelsoftGames.FamilyIslandFarm&hl=en_US&gl=US) | 4.48 | 75,115 | 50,000,000+ | Yes | $0.99 - $149.99 | free | Everyone | Casual | Nov 18, 2019 | — |
| [Family Farm Adventure®](https://play.google.com/store/apps/details?id=com.farmadventure.global&hl=en_US&gl=US) | 4.58 | 14,447 | 10,000,000+ | Yes | $0.99 - $99.99 | free | Everyone | Simulation | Apr 14, 2021 | — |
| [FarmVille 2: Country Escape](https://play.google.com/store/apps/details?id=com.zynga.FarmVille2CountryEscape&hl=en_US&gl=US) | 4.58 | 169,751 | 50,000,000+ | Yes | $0.49 - $374.99 | free | Everyone | Casual | Apr 16, 2014 | — |
| [FarmVille 3 – Farm Animals](https://play.google.com/store/apps/details?id=com.zynga.farmville3&hl=en_US&gl=US) | 4.41 | 15,189 | 10,000,000+ | Yes | $0.59 - $199.99 | free | Everyone | Simulation | Nov 2, 2021 | — |
| [Stardew Valley](https://play.google.com/store/apps/details?id=com.chucklefish.stardewvalley&hl=en_US&gl=US) | 4.60 | 14,597 | 5,000,000+ | No | no IAP label | $4.99 | Everyone 10+ | Role Playing | Mar 13, 2019 | #1 top paid role playing |
| [Farming Simulator 23 Mobile](https://play.google.com/store/apps/details?id=com.giantssoftware.fs23.google&hl=en_US&gl=US) | 4.33 | 1,259 | 500,000+ | Yes | $0.99 - $3.49 | $5.99 | Everyone | Simulation | May 22, 2023 | — |
| [Farming Simulator 26 Mobile](https://play.google.com/store/apps/details?id=com.giantssoftware.fs26.google&hl=en_US&gl=US) | 3.65 | 222 | 50,000+ | Yes | $1.19 - $3.49 | $7.99 | Everyone | Simulation | May 18, 2026 | #5 top paid simulation |
| [Big Farm: Mobile Harvest](https://play.google.com/store/apps/details?id=com.goodgamestudios.bigfarmmobileharvest&hl=en_US&gl=US) | 4.01 | 20,375 | 50,000,000+ | Yes | $1.09 - $384.99 | free | Everyone | Casual | Oct 25, 2017 | — |
| [Big Farm Homestead](https://play.google.com/store/apps/details?id=com.newmoonproduction.bigfarmhomestead&hl=en_US&gl=US) | 4.66 | 3,400 | 1,000,000+ | Yes | $0.99 - $149.99 | free | Everyone | Simulation | Jun 16, 2025 | — |
| [Farm Land - Farming life game](https://play.google.com/store/apps/details?id=com.loltap.farmland&hl=en_US&gl=US) | 4.52 | 4,065 | 100,000,000+ | No | $1.49 - $119.99 | free | Everyone | Adventure | Mar 11, 2021 | — |
| [Farm City: Farming & Building](https://play.google.com/store/apps/details?id=com.citybay.farming.citybuilding&hl=en_US&gl=US) | 4.40 | 4,587 | 50,000,000+ | Yes | $0.99 - $99.99 | free | Everyone | Casual | Feb 11, 2020 | — |
| [Harvest Town](https://play.google.com/store/apps/details?id=com.harvest.android.gr&hl=en_US&gl=US) | 4.47 | 3,700 | 10,000,000+ | Yes | $0.99 - $99.99 | free | Teen | Role Playing | Dec 9, 2020 | — |
| [Golden Farm](https://play.google.com/store/apps/details?id=ru.playme8.dachniki&hl=en_US&gl=US) | 4.53 | 3,319 | 10,000,000+ | Yes | $0.49 - $399.99 | free | Everyone | Casual | Dec 4, 2017 | — |
| [Coco Valley: Farm Adventure](https://play.google.com/store/apps/details?id=com.onicore.torch&hl=en_US&gl=US) | 4.64 | 417 | 1,000,000+ | Yes | $0.99 - $79.99 | free | Everyone | Simulation | Apr 19, 2023 | — |
| [Sunrise Village: Farm Game](https://play.google.com/store/apps/details?id=com.innogames.sunrisevillage&hl=en_US&gl=US) | 4.57 | 4,124 | 5,000,000+ | Yes | $0.99 - $199.99 | free | Everyone | Simulation | Jun 30, 2021 | — |
| [Dragonscapes Adventure](https://play.google.com/store/apps/details?id=com.dragonscapes.global&hl=en_US&gl=US) | 4.82 | 11,589 | 10,000,000+ | Yes | $0.99 - $99.99 | free | Everyone | Simulation | Oct 27, 2020 | — |
| [Taonga Island Adventure: Farm](https://play.google.com/store/apps/details?id=com.volka.taonga&hl=en_US&gl=US) | 4.43 | 1,807 | 1,000,000+ | No | $0.99 - $199.99 | free | Everyone | Simulation | Aug 24, 2021 | — |
| [Gossip Harbor: Merge & Story](https://play.google.com/store/apps/details?id=com.mergegames.gossipharbor&hl=en_US&gl=US) | 4.40 | 24,164 | 100,000,000+ | Yes | $0.99 - $99.99 | free | Everyone | Puzzle | Sep 9, 2022 | #1 top grossing puzzle |
| [Family Farm Seaside®](https://play.google.com/store/apps/details?id=com.funplus.familyfarm&hl=en_US&gl=US) | 4.21 | 33,763 | 50,000,000+ | No | $0.99 - $99.99 | free | Everyone | Casual | Feb 25, 2013 | — |
| [Farmington – Farm game](https://play.google.com/store/apps/details?id=ugo.com.play.free.farmington&hl=en_US&gl=US) | 4.77 | 2,514 | 10,000,000+ | Yes | $0.49 - $119.99 | free | Everyone | Adventure | Nov 18, 2021 | — |

**How to read the tables**
- The ratings count and the embedded install counter are identical on both storefronts while the star average is not: Hay Day shows 13,075,075 ratings and counter 374,111,421 on both, with 4.57★ in Brazil and 4.41★ in the US. — [Hay Day BR](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=pt_BR&gl=BR); [Hay Day US](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=en_US&gl=US)
- Township shows 12,983,836 ratings (BR page) and 12,983,833 (US page, fetched about ten minutes later), counter 529,551,663 on both, 4.83★ in Brazil and 4.69★ in the US. — [Township BR](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR); [Township US](https://play.google.com/store/apps/details?id=com.playrix.township&hl=en_US&gl=US)
- The star-histogram numbers embedded in each page add up to the worldwide ratings total on both storefronts but have different shapes (Township BR: 12,031,887 five-star and 321,104 one-star; Township US: 11,413,898 five-star and 670,854 one-star). They are therefore shares scaled to the total, not per-country counts. — [Township BR](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR); [Township US](https://play.google.com/store/apps/details?id=com.playrix.township&hl=en_US&gl=US)
- Of the 26 games read on both storefronts, 19 have a higher star average in Brazil than in the US and 7 have a lower one (largest Brazilian premiums: Farming Simulator 23 +0.21, Stardew Valley +0.17, The Cozy Florist +0.17, Harvest Town +0.16, Hay Day +0.15, FarmVille 2: Country Escape +0.15, Township +0.14; largest Brazilian discounts: Coco Valley −0.22, Gossip Harbor −0.22, Taonga −0.19). — Tables 1a and 1d (same URLs)
- The "Released" date is storefront-specific for some titles: My Garden Tale shows 26 Jun 2026 in Brazil and 26 Jan 2026 in the US; Big Farm Homestead 1 Dec 2025 (BR) and 16 Jun 2025 (US); Sunrise Village 7 Dec 2021 (BR) and 30 Jun 2021 (US); Farm Land 26 Apr 2021 (BR) and 11 Mar 2021 (US); The Cozy Florist 4 Dec 2025 (BR) and 28 Nov 2025 (US). — [My Garden Tale BR](https://play.google.com/store/apps/details?id=com.jxhy.official&hl=pt_BR&gl=BR); [My Garden Tale US](https://play.google.com/store/apps/details?id=com.jxhy.official&hl=en_US&gl=US); [Big Farm Homestead BR](https://play.google.com/store/apps/details?id=com.newmoonproduction.bigfarmhomestead&hl=pt_BR&gl=BR); [Big Farm Homestead US](https://play.google.com/store/apps/details?id=com.newmoonproduction.bigfarmhomestead&hl=en_US&gl=US)
- The embedded install counter is at or above the floor of the public band on all 51 Brazilian listings parsed with both values (for example Farming Simulator 26 Mobile: band "50 mil+", counter 97,452). — [Farming Simulator 26 Mobile BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs26.google&hl=pt_BR&gl=BR)

**Identity and package ids resolved in this session**
- Heartopia is `com.xd.xdtglobal.gp`, developer name "XD Entertainment Co., Ltd." — [Heartopia BR](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=pt_BR&gl=BR)
- The Cozy Florist is `com.riftsky.mhg.gb.gp` (Riftsky Games). My Garden Tale is `com.jxhy.official` (Modo Global) and is titled "Meu Mundo do Jardim" on the Brazilian storefront. — [The Cozy Florist BR](https://play.google.com/store/apps/details?id=com.riftsky.mhg.gb.gp&hl=pt_BR&gl=BR); [Meu Mundo do Jardim BR](https://play.google.com/store/apps/details?id=com.jxhy.official&hl=pt_BR&gl=BR)
- Farming Simulator 23 is `com.giantssoftware.fs23.google` and Farming Simulator 26 Mobile is `com.giantssoftware.fs26.google`; the GIANTS Software developer page lists seven titles (FS14, FS16, FS18, FS20, FS23, FS26 Mobile, Farming Simulator Kids). — [GIANTS Software developer page](https://play.google.com/store/apps/dev?id=8025483553662244421&hl=pt_BR&gl=BR)
- Other ids: Big Farm: Mobile Harvest `com.goodgamestudios.bigfarmmobileharvest`; Big Farm Homestead `com.newmoonproduction.bigfarmhomestead`; Farm Land `com.loltap.farmland` (Homa); Farm City `com.citybay.farming.citybuilding` (iKame Games - Zego Studio); Harvest Town `com.harvest.android.gr` (AVIDGamers); Golden Farm `ru.playme8.dachniki`; Coco Valley `com.onicore.torch` (BitStrong Games); Sunrise Village `com.innogames.sunrisevillage`; Dragonscapes Adventure `com.dragonscapes.global` (titled "Aventura Dragon Cape" in Brazil); Taonga `com.volka.taonga`; Gossip Harbor `com.mergegames.gossipharbor` (Microfun Limited). — Table 1a (links)
- Family Farm Seaside is titled "Fazenda Feliz Pocket" in Brazil and "Family Farm Seaside®" in the US (`com.funplus.familyfarm`). — [Fazenda Feliz Pocket BR](https://play.google.com/store/apps/details?id=com.funplus.familyfarm&hl=pt_BR&gl=BR); [Family Farm Seaside US](https://play.google.com/store/apps/details?id=com.funplus.familyfarm&hl=en_US&gl=US)
- "Farm Manager" is now listed as "Farm Manager - 2027" (`com.trophygames.farmmanager`; developer shown as "Xombat Development - Airline manager games"). — [Farm Manager - 2027 BR](https://play.google.com/store/apps/details?id=com.trophygames.farmmanager&hl=pt_BR&gl=BR)
- Farm Merge Valley was not found: searches for "farm merge valley" returned 30 results on each storefront, none with that title (closest: "Merge Valley: Farm Tycoon", 10,000+ installs; "Family Farm Merge", 1,000,000+). — [BR search](https://play.google.com/store/search?q=farm%20merge%20valley&c=apps&hl=pt_BR&gl=BR); [US search](https://play.google.com/store/search?q=farm%20merge%20valley&c=apps&hl=en_US&gl=US)

**Content ratings**
- On the Brazilian storefront 12 of the 24 core candidates display an 18-years rating ("Classificação 18 anos" or "18 anos"): Township, The Cozy Florist, Klondike Adventures, Family Island, FarmVille 2: Country Escape, FarmVille 3, Big Farm: Mobile Harvest, Big Farm Homestead, Golden Farm, Coco Valley, Sunrise Village and Gossip Harbor. All twelve show "Everyone" on the US storefront. — Tables 1a and 1d (links)
- Hay Day shows "Classificação Livre" in Brazil with the descriptor "Usuários Interagem, Compras on-line (Inclui itens aleatórios)"; Township shows "Classificação 18 anos" with the descriptor "Compras on-line (Inclui itens aleatórios)". — [Hay Day BR](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=pt_BR&gl=BR); [Township BR](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR)
- Heartopia shows "Classificação 12 anos" in Brazil and "Teen" in the US; Harvest Town shows the same pair. — [Heartopia BR](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=pt_BR&gl=BR); [Heartopia US](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=en_US&gl=US)
- Farmington, the top Brazilian result for several farm searches, is also rated "Classificação 18 anos" in Brazil and "Everyone" in the US. — [Farmington BR](https://play.google.com/store/apps/details?id=ugo.com.play.free.farmington&hl=pt_BR&gl=BR); [Farmington US](https://play.google.com/store/apps/details?id=ugo.com.play.free.farmington&hl=en_US&gl=US)

**Category and tags**
- Play category (the listing's main genre): Township, Hay Day, Family Island, FarmVille 2: Country Escape, Big Farm: Mobile Harvest, Farm City and Golden Farm are in Casual ("Casuais"); Heartopia, Klondike Adventures, Family Farm Adventure, FarmVille 3, the Farming Simulator titles, Big Farm Homestead, The Cozy Florist and My Garden Tale are in Simulation ("Simulador"); Farm Land and Farmington are in Adventure ("Aventura"); Stardew Valley and Harvest Town are in Role Playing ("RPG"). — Table 1a (links)
- Google's own descriptive tags on the Township listing are "Simulação, Gerenciamento, Agricultura, Casuais, Um jogador, Estilizado, Diversos, Quebra-cabeças, Off-line"; on Hay Day "Simulação, Gerenciamento, Agricultura, Casuais, Um jogador, Estilizado, Fazenda". The "Agricultura" tag links to the store search "Jogos de fazenda". — [Township BR](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR); [Hay Day BR](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=pt_BR&gl=BR)
- Heartopia's tags are "Simulação, Vida, Social, Um jogador, Estilizado, Imersivo" — it carries no "Agricultura" tag. — [Heartopia BR](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=pt_BR&gl=BR)

**Listing freshness**
- 18 of the 24 core candidates were updated between 1 October and 11 November 2026. The exceptions are Golden Farm (17 Sep 2026), Heartopia (21 Aug 2026), Stardew Valley (26 Jun 2026), Coco Valley (13 May 2026), Harvest Town (20 Mar 2026) and Farming Simulator 23 (17 Mar 2025). — Table 1a (links)

### Inferences
- Because the ratings count is a worldwide total and only the star average is local, the "★ BR" column is the best available read of Brazilian sentiment; Brazilian raters score most of these farm games slightly higher than US raters (19 of 26).
- The Brazilian 18-years ratings look connected to paid random items ("Inclui itens aleatórios" appears in the descriptor of most of the twelve), but the link is not strict: Hay Day has the same descriptor and is rated "Livre", and Family Farm Adventure is rated "Livre" with "Compras no Jogo". **[UNVERIFIED-BK]** Brazil tightened rules on loot boxes for minors in 2025–2026; no source could be retrieved here. A game whose store uses random-reward purchases should expect the risk of an 18-years label on the Brazilian storefront, which matters for a family-friendly farm game.
- The storefront-specific release dates suggest staged regional launches (My Garden Tale reached the Brazilian storefront five months after the US one).
- Heartopia's Play listing date of 23 Dec 2025 is earlier than the January 2026 global launch reported in the earlier notes; the listing date probably reflects when the store page (pre-registration) went live rather than the launch day.

### Gaps
- Farm Merge Valley has no Google Play listing that the store search surfaces; it may not be a Play Store app at all.
- US listings were read for 26 games only; the idle/arcade titles, the older Farming Simulator entries and Farm Heroes Saga were read on the Brazilian storefront only.
- Screenshots and their captions could not be viewed (images are served from `play-lh.googleusercontent.com`, which is not reachable in this session), so nothing in these notes relies on screenshots.
- The listing does not expose revenue, daily installs, or per-country install or rating counts.
- The embedded install counter is undocumented; it is consistent with every public band but cannot be independently confirmed.

---

## 2. What does Google Play surface for farm games in Brazil (store searches, top charts, category pages)?

### Takeaway
Brazilian store searches for farm terms are led by Hay Day, Township, Farmington, Family Island and FarmVille 2, with the Brazilian-made Farming Sim Brasil first for "jogo de fazenda"; Heartopia does not appear in any farm search. In Brazil's charts farm games are a monetization story rather than a download story: Township (#18) and Hay Day (#34) sit in the all-games top-grossing list, but no farm simulator appears among the 198 top free games.

### Cited Findings

**Search results (ordered; "N" is the number of results the page returned).** Brazilian search pages returned 50 results, US pages 30.

- "fazenda" (BR, N=50), top 15: 1 Hay Day; 2 Township; 3 Farm Bay: Fazenda e Aventuras; 4 Fazenda Feliz Pocket (Family Farm Seaside); 5 FarmVille 2 Aventuras no Campo; 6 Animal Farm Life: Town Farming; 7 Farm Town: Merge Village Story; 8 Fazenda Feliz Tango; 9 Farmington; 10 Bermuda Adventures; 11 Spring Valley; 12 Farm City; 13 Family Island; 14 FarmVille 3; 15 Stardew Valley. Klondike Adventures is 30th and Farm Land 38th. — [search "fazenda" BR](https://play.google.com/store/search?q=fazenda&c=apps&hl=pt_BR&gl=BR)
- "jogo de fazenda" (BR, N=50), top 15: 1 Farming Sim Brasil; 2 Farmington; 3 Hay Day; 4 Township; 5 Farming Simulator 18; 6 Family Island; 7 Adventure Bay; 8 Triple Farm!; 9 FarmVille 2; 10 Animal Farm: My Idle Cat Town; 11 Farm Bay; 12 My Free Farm 2; 13 Spring Valley; 14 Farm City; 15 Stardew Valley. — [search "jogo de fazenda" BR](https://play.google.com/store/search?q=jogo%20de%20fazenda&c=apps&hl=pt_BR&gl=BR)
- "Jogos de fazenda" (BR, N=50) — the query that Google's own "Agricultura" tag links to — top 15: 1 Township; 2 Farmington; 3 Hay Day; 4 Family Island; 5 FarmVille 2; 6 Adventure Bay; 7 Farm Bay; 8 Daily Farm: Crop Tycoon; 9 My Free Farm 2; 10 Blossom Mart - Idle Garden; 11 Dreamy Harvest; 12 Fazenda Feliz Pocket; 13 Farm Dream; 14 Jogos de fazenda para crianças; 15 Spring Valley. — [search "Jogos de fazenda" BR](https://play.google.com/store/search?q=Jogos+de+fazenda&c=apps&hl=pt_BR&gl=BR)
- "farm" (BR, N=50), top 15: 1 FARM (a fashion-retail shopping app by Grupo SOMA, category "Compras"); 2 Farm Heroes Super Saga; 3 The Farm : Sassy Princess; 4 Farm Heroes Saga; 5 Farm City; 6 Little Farm Story; 7 Fazenda Feliz Pocket; 8 Royal Farm; 9 Farm Bay; 10 Farm Day!; 11 My Dear Farm; 12 Farm Fest; 13 Township; 14 Bud Farm: Grass Roots; 15 FarmVille 2. Hay Day is 23rd. — [search "farm" BR](https://play.google.com/store/search?q=farm&c=apps&hl=pt_BR&gl=BR)
- "farming simulator" (BR, N=50), top 15: 1 Farming Simulator 26 Mobile; 2 Farming Simulator 18; 3 Farming Simulator 20; 4 Farming Simulator 23; 5 Farming Sim Brasil; 6 Farming Simulator 16; 7 Farming Simulator Kids; 8 Township; 9 Hay Day; 10 FarmVille 2; 11 Farm Manager - 2027; 12 Big Farm: Homestead; 13 Klondike Adventures; 14 Stardew Valley; 15 Farmington. — [search "farming simulator" BR](https://play.google.com/store/search?q=farming%20simulator&c=apps&hl=pt_BR&gl=BR)
- "fazenda multiplayer" (BR, N=50), top 15: 1 Farmington; 2 Farming Simulator 20; 3 Hay Day; 4 My Free Farm 2; 5 Township; 6 Family Island; 7 Fazenda Feliz Pocket; 8 Royal Farm; 9 Family Farm Adventure; 10 Farm Dream; 11 Farm Island: Build & Adventure; 12 FarmVille 3; 13 Farmdale; 14 Farming Simulator 23; 15 Sunshine Island. — [search "fazenda multiplayer" BR](https://play.google.com/store/search?q=fazenda%20multiplayer&c=apps&hl=pt_BR&gl=BR)
- "farm game" (US, N=30), top 15: 1 Township; 2 Farmington; 3 Klondike Adventures; 4 Hay Day; 5 Stardew Valley; 6 Farm Bay; 7 My Free Farm 2; 8 FarmVille 2: Country Escape; 9 Farm Heroes Saga; 10 Idle Farmer; 11 Royal Farm; 12 Family Island; 13 Spring Valley; 14 Rilakkuma Farm Games; 15 Farmland Empire: Idle Tycoon. — [search "farm game" US](https://play.google.com/store/search?q=farm%20game&c=apps&hl=en_US&gl=US)
- Additional searches run to look for 3D or multiplayer farm games: "fazenda 3d" (BR, N=50; 1 My Free Farm 2, 2 FarmVille 3, 3 My Farm Empire: Farm Tycoon 3D), "fazenda online com amigos" (BR, N=50; 1 Fazenda Feliz Pocket, 2 Fazenda Feliz Tango, 3 Farm Day!), "fazenda mundo aberto online" (BR, N=50; 1 Farming Simulator 20, 2 Farm Island: Build & Adventure, 3 Yasa Pets Farm), "idle farm" (BR, N=30; 1 Idle Farming Empire, 2 Idle Farm: Harvest Empire, 3 Idle Farmer), "Farming games" (US, N=30; 1 Farming Simulator 20, 2 Township, 3 Hay Day, 4 Farm Land) and "multiplayer farming" (US, N=30; 1 Hay Day, 2 Stardew Valley, 3 Farming Simulator 20). — [fazenda 3d](https://play.google.com/store/search?q=fazenda%203d&c=apps&hl=pt_BR&gl=BR); [fazenda online com amigos](https://play.google.com/store/search?q=fazenda%20online%20com%20amigos&c=apps&hl=pt_BR&gl=BR); [fazenda mundo aberto online](https://play.google.com/store/search?q=fazenda%20mundo%20aberto%20online&c=apps&hl=pt_BR&gl=BR); [idle farm](https://play.google.com/store/search?q=idle%20farm&c=apps&hl=pt_BR&gl=BR); [Farming games US](https://play.google.com/store/search?q=Farming+games&c=apps&hl=en_US&gl=US); [multiplayer farming US](https://play.google.com/store/search?q=multiplayer%20farming&c=apps&hl=en_US&gl=US)

**Table 2a — Position of key titles in each search (— = not in the returned list; fetched 2026-11-11; sources are the search URLs above).**

| Game | BR "fazenda" (N=50) | BR "jogo de fazenda" (N=50) | BR "Jogos de fazenda" (tag query) (N=50) | BR "farm" (N=50) | BR "farming simulator" (N=50) | BR "fazenda multiplayer" (N=50) | BR "fazenda 3d" (N=50) | BR "fazenda online com amigos" (N=50) | BR "fazenda mundo aberto online" (N=50) | US "farm game" (N=30) | US "Farming games" (tag query) (N=30) | US "multiplayer farming" (N=30) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Township | 2 | 4 | 1 | 13 | 8 | 5 | — | — | — | 1 | 2 | 13 |
| Hay Day | 1 | 3 | 3 | 23 | 9 | 3 | — | 15 | — | 4 | 3 | 1 |
| Heartopia | — | — | — | — | — | — | — | — | — | — | — | — |
| Klondike Adventures: Fazenda | 30 | 22 | 24 | — | 13 | — | — | — | — | 3 | 16 | 24 |
| Family Island: Jogo de fazenda | 13 | 6 | 4 | 38 | — | 6 | — | 23 | 18 | 12 | 11 | 25 |
| Family Farm Adventure® | 26 | — | — | 48 | 42 | 9 | — | 18 | 9 | — | — | 10 |
| FarmVille 2 Aventuras no Campo | 5 | 9 | 5 | 15 | 10 | 19 | 47 | 20 | — | 8 | 8 | 8 |
| FarmVille 3 - Animais Rurais | 14 | 18 | 18 | 41 | 20 | 12 | 2 | 6 | 17 | 16 | 21 | 7 |
| Stardew Valley | 15 | 15 | 22 | — | 14 | 39 | — | — | — | 5 | 10 | 2 |
| Farming Simulator 23 | — | — | — | — | 4 | 14 | 30 | — | 5 | — | — | 5 |
| Farming Simulator 26 Mobile | — | — | — | — | 1 | — | — | — | — | — | — | — |
| Farming Simulator 20 | 25 | 38 | 19 | 34 | 3 | 2 | 24 | 4 | 1 | — | 1 | 3 |
| Farming Simulator 18 | — | 5 | 35 | — | 2 | 42 | — | 17 | 10 | — | 17 | 9 |
| Farming Sim Brasil | — | 1 | — | — | 5 | — | — | — | 7 | — | — | — |
| Big Farm: Mobile Harvest | — | 31 | 48 | — | 29 | — | — | — | — | — | 29 | 12 |
| Big Farm: Homestead | — | 26 | 25 | — | 12 | 36 | — | 44 | 20 | 17 | 12 | 6 |
| Farm Land | 38 | 23 | 27 | — | 18 | — | — | — | — | 26 | 4 | — |
| Farm City: Farming & Building | 12 | 14 | 23 | 5 | — | 24 | 43 | — | 33 | 18 | 24 | — |
| Harvest Town | 31 | 36 | 43 | — | 47 | 29 | — | — | — | — | — | 28 |
| Golden Farm | 33 | 34 | — | 36 | 35 | 18 | — | — | 13 | — | 13 | 23 |
| Farmington - Jogo de fazenda | 9 | 2 | 2 | — | 15 | 1 | — | 5 | 35 | 2 | 20 | 14 |
| Fazenda Feliz Pocket | 4 | 17 | 12 | 7 | 17 | 7 | 27 | 1 | 29 | 19 | — | 19 |
| Farm Heroes Saga | 16 | 16 | 17 | 4 | — | — | — | 25 | — | 9 | 15 | — |
| Farm Manager - 2027 | 37 | 24 | 37 | 18 | 11 | 26 | 37 | — | 28 | — | 28 | — |
| The Cozy Florist | — | — | — | — | 34 | — | — | — | — | — | — | — |
| Meu Mundo do Jardim | — | — | 50 | — | 24 | — | — | — | — | — | — | — |
| My Free Farm 2 | — | 12 | 9 | — | — | 4 | 1 | — | 45 | 7 | 5 | 4 |
| Taonga Island Adventure: Farm | — | — | — | — | 46 | 28 | — | 46 | 25 | — | — | — |
| Coco Valley: Farm Adventure | — | — | — | — | — | — | 42 | — | — | — | — | — |
| Aventura Dragon Cape | — | — | — | — | — | — | — | — | — | — | — | — |
| Sunrise Village | — | — | — | — | — | — | — | — | — | — | — | — |

- Heartopia appears in none of the 17 search pages fetched, on either storefront. — same search URLs as above and the four listed in the next bullet
- Across all 17 search pages fetched, 235 distinct apps were returned. — same search URLs as above, plus [coco valley](https://play.google.com/store/search?q=coco%20valley&c=apps&hl=pt_BR&gl=BR), [gossip harbor](https://play.google.com/store/search?q=gossip%20harbor&c=apps&hl=pt_BR&gl=BR), [farm merge valley BR](https://play.google.com/store/search?q=farm%20merge%20valley&c=apps&hl=pt_BR&gl=BR), [farm merge valley US](https://play.google.com/store/search?q=farm%20merge%20valley&c=apps&hl=en_US&gl=US)

**What the web store's category pages expose**
- The Simulation and Casual category pages and the games home page each contain a "Top charts" box with three tabs — "Principais apps gratuitos" (top free), "Mais rentáveis" (top grossing) and "Principais apps pagos" (top paid) — but the static HTML holds only numbered placeholders, not the entries. — [Simulation BR](https://play.google.com/store/apps/category/GAME_SIMULATION?hl=pt_BR&gl=BR); [Casual BR](https://play.google.com/store/apps/category/GAME_CASUAL?hl=pt_BR&gl=BR); [Games home BR](https://play.google.com/store/games?hl=pt_BR&gl=BR)
- Editorial clusters embedded in the Casual page (fetched 2026-11-11): "Jogos off-line" (20 apps; Township 17th, Farm Heroes Saga 18th), "Lançamentos de jogos" (10; Honey Grove — Cozy Garden Game 9th), "Jogos em mundos fantásticos" (11; Hay Day 6th), "Jogos de desenho animado" (12; Farm Heroes Saga 6th), "Escolha dos editores: jogos" (7; Gardenscapes 1st, Hay Day 2nd) and "Quebra-cabeças" (18; Farm Heroes Saga 3rd). — [Casual BR](https://play.google.com/store/apps/category/GAME_CASUAL?hl=pt_BR&gl=BR)
- Editorial clusters embedded in the Simulation page: "Jogos off-line" (20), "Lançamentos de jogos" (16), "Jogos de simulação" (20), "Jogos multiplayer" (6), "Jogos de desenho animado" (5), "Jogos de simulação de veículos" (5). No farm game appears in any of the 72 slots; the six "Jogos multiplayer" entries are Oxide: Survival Island, Estacionamento Multijogador, WildCraft, Carro da Cidade Corridas Sim, Sunday City and Car Simulator 2. — [Simulation BR](https://play.google.com/store/apps/category/GAME_SIMULATION?hl=pt_BR&gl=BR)
- The games home page embeds seven clusters (127 slots) besides the top-charts box: "Nas mãos de todos", "Jogos da sua terra — Da América Latina", "Espaço indie", a live-events strip, "Jogue antes de todo mundo", "Pague agora e jogue para sempre", "Jogos em promoção". No farm game appears; PK XD is 1st in "Jogos da sua terra" and 12th in "Nas mãos de todos". — [Games home BR](https://play.google.com/store/games?hl=pt_BR&gl=BR)

**Table 2b — Brazil top charts: position of each sampled title (— = not in the list; list length in the header; fetched 2026-11-11).** Source for every column: the chart data feed [BR chart endpoint](https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=vyAe2&source-path=%2Fstore%2Fapps&hl=pt_BR&gl=BR&soc-app=121&soc-platform=1&soc-device=1&rt=c), with the request body naming the collection (`topgrossing`, `topselling_free`, `topselling_paid`) and the category (`GAME`, `GAME_CASUAL`, `GAME_SIMULATION`, `GAME_ADVENTURE`); 200 rows were requested each time and the server returned the list lengths shown.

| Game | Grossing: all games (list length 199) | Grossing: Casual (list length 138) | Grossing: Simulation (list length 183) | Grossing: Adventure (list length 86) | Free: all games (list length 198) | Free: Casual (list length 200) | Free: Simulation (list length 200) | Free: Adventure (list length 200) | Paid: all games (list length 189) | Paid: Simulation (list length 33) |
|---|---|---|---|---|---|---|---|---|---|---|
| Township | 18 | 5 | — | — | — | 67 | — | — | — | — |
| Hay Day | 34 | 6 | — | — | — | 139 | — | — | — | — |
| Heartopia | 89 | — | 5 | — | — | — | — | — | — | — |
| The Cozy Florist | — | — | 44 | — | — | — | — | — | — | — |
| Meu Mundo do Jardim | — | — | 105 | — | — | — | — | — | — | — |
| Klondike Adventures: Fazenda | 135 | — | 9 | — | — | — | — | — | — | — |
| Family Island: Jogo de fazenda | 75 | 12 | — | — | — | — | — | — | — | — |
| Family Farm Adventure® | — | — | 38 | — | — | — | — | — | — | — |
| FarmVille 2 Aventuras no Campo | — | 47 | — | — | — | — | — | — | — | — |
| FarmVille 3 - Animais Rurais | — | — | 48 | — | — | — | — | — | — | — |
| Stardew Valley | 182 | — | — | — | — | — | — | — | 7 | — |
| Farming Simulator 23 | — | — | 24 | — | — | — | — | — | 24 | 3 |
| Farming Simulator 26 Mobile | — | — | 26 | — | — | — | — | — | — | 6 |
| Big Farm: Homestead | — | — | 55 | — | — | — | — | — | — | — |
| Farm Land | — | — | — | — | — | — | — | 69 | — | — |
| Farm City: Farming & Building | — | 128 | — | — | — | — | — | — | — | — |
| Golden Farm | — | 125 | — | — | — | — | — | — | — | — |
| Aventura Dragon Cape | — | — | 80 | — | — | — | — | — | — | — |
| Gossip Harbor: Merge & Story | 4 | — | — | — | — | — | — | — | — | — |
| Egg, Inc. | — | — | 102 | — | — | — | — | — | — | — |
| Fazenda Feliz Pocket | — | 38 | — | — | — | — | — | — | — | — |
| Farmington - Jogo de fazenda | — | — | — | 11 | — | — | — | 43 | — | — |
| Royal Farm – Fazenda e cidade | — | — | — | 42 | — | — | — | — | — | — |
| Goodville: Fazenda de aventura | — | — | — | 15 | — | — | — | — | — | — |
| Farm Manager - 2027 | — | — | 33 | — | — | — | — | — | — | — |
| Farming Simulator 18 | — | — | 85 | — | — | — | 106 | — | — | — |
| Farming Simulator 20 | — | — | 46 | — | — | — | — | — | 47 | 7 |
| Farming Sim Brasil | — | — | — | — | — | — | 149 | — | — | — |
| Family Farm Merge | 58 | — | — | — | — | — | — | — | — | — |
| Sunshine Island Grande Fazenda | — | — | 88 | — | — | — | — | — | — | — |
| Farm Heroes Saga | 39 | 9 | — | — | — | 105 | — | — | — | — |
| Spring Valley: Jogo de Fazenda | — | — | — | 61 | — | — | — | — | — | — |
| Wild West: atualizar a fazenda | — | — | 116 | — | — | — | — | — | — | — |
| Play Together:Parquinho Social | — | 66 | — | — | — | — | — | — | — | — |
| PKXD: Diversão, amigos e jogos | 101 | — | — | 6 | 30 | — | — | 2 | — | — |
| Livetopia: Party! | — | 81 | — | — | — | 89 | — | — | — | — |

**Every farm-themed title found in each Brazilian chart, with position** (matched by title keyword or known package; same source as Table 2b)
- All games, top grossing (199 entries): Township 18; Hay Day 34; Farm Heroes Saga 39 (match-3 puzzle with a farm theme); Family Farm Merge 58 (merge puzzle); Family Island 75; Heartopia 89; Klondike Adventures 135; Solitaire Grand Harvest 144 (solitaire with a harvest theme); Stardew Valley 182. For context: Roblox 1, Free Fire 2, Coin Master 3, Gossip Harbor 4, Gardenscapes 13, PK XD 101.
- Casual, top grossing (138 entries): Township 5; Hay Day 6; Farm Heroes Saga 9; Family Island 12; Fazenda Feliz Pocket (Family Farm Seaside) 38; FarmVille 2 47; Farm Heroes Super Saga 78; Harvest Land 84; Fazenda Feliz Tango 86; Golden Farm 125; Farm City 128; Farm Town: Merge Village Story 129. For context: Coin Master 1, Candy Crush Saga 2, Gardenscapes 3, Play Together 66, Livetopia 81.
- Simulation, top grossing (183 entries): Heartopia 5; Klondike Adventures 9; Farming Simulator 23 24; Farming Simulator 26 Mobile 26; Farm Manager - 2027 33; Family Farm Adventure 38; The Cozy Florist 44; Farming Simulator 20 46; FarmVille 3 48; Big Farm: Homestead 55; Farm Feud 78; Aventura Dragon Cape (Dragonscapes) 80; Farming Simulator 18 85; Sunshine Island 88; Egg, Inc. 102; Meu Mundo do Jardim (My Garden Tale) 105; Wild West 116; Jardim Toscana 134; Bud Farm: Grass Roots 179. The #1 entry is Oxide: Survival Island.
- Adventure, top grossing (86 entries): Farmington 11; Goodville 15; Royal Farm 42; Adventure Bay 45; Spring Valley 61. Farm Land is not in the list. For context: Roblox 1, PK XD 6.
- All games, top free (198 entries): no farm simulator. The only farm-named entry is Farm Block Dash at 131 (a block puzzle). For context: Roblox 2, PK XD 30.
- Casual, top free (200 entries): Township 67; Farm Heroes Saga 105; Hay Day 139; plus two farm-named block puzzles (Farm Block Dash 29, Harvest Block Crush 176).
- Simulation, top free (200 entries): Farming Simulator 18 106; Farming Sim Brasil 149. No other farm title.
- Adventure, top free (200 entries): Farmington 43; Farm Land 69; Mini Mini Farm 129; Star Equestrian - Horse Ranch 176.
- All games, top paid (189 entries): Stardew Valley 7; Farming Simulator 23 24; Farming Simulator 20 47; The Farmer Was Replaced 130.
- Simulation, top paid (33 entries): Farming Simulator 23 3; Farming Simulator 26 Mobile 6; Farming Simulator 20 7; The Farmer Was Replaced 20.
- Role Playing, top paid (7 entries): Stardew Valley 2.

**Table 2c — United States top charts: position of each sampled title (fetched 2026-11-11).** Source: [US chart endpoint](https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=vyAe2&source-path=%2Fstore%2Fapps&hl=en_US&gl=US&soc-app=121&soc-platform=1&soc-device=1&rt=c), same request form.

| Game | Grossing: all games (list length 200) | Grossing: Casual (list length 200) | Grossing: Simulation (list length 200) | Grossing: Adventure (list length 200) | Free: all games (list length 199) | Free: Casual (list length 200) | Free: Simulation (list length 200) | Paid: all games (list length 199) | Paid: Simulation (list length 57) |
|---|---|---|---|---|---|---|---|---|---|
| Township | 9 | 3 | — | — | 19 | 4 | — | — | — |
| Hay Day | 79 | 15 | — | — | — | 159 | — | — | — |
| Heartopia | — | — | 32 | — | — | — | — | — | — |
| The Cozy Florist | — | — | 57 | — | — | — | 178 | — | — |
| My Garden Tale | — | — | 26 | — | — | — | — | — | — |
| Klondike Adventures: Farm Game | — | — | 10 | — | — | — | 128 | — | — |
| Family Island™ — Farming game | 118 | 21 | — | — | — | — | — | — | — |
| Family Farm Adventure® | — | — | 48 | — | — | — | — | — | — |
| FarmVille 2: Country Escape | — | 37 | — | — | — | 193 | — | — | — |
| FarmVille 3 – Farm Animals | — | — | 25 | — | — | — | — | — | — |
| Stardew Valley | — | — | — | — | — | — | — | 6 | — |
| Farming Simulator 23 Mobile | — | — | — | — | — | — | — | 158 | 20 |
| Farming Simulator 26 Mobile | — | — | — | — | — | — | — | — | 5 |
| Big Farm: Mobile Harvest | — | 94 | — | — | — | — | — | — | — |
| Big Farm Homestead | — | — | 16 | — | — | — | 73 | — | — |
| Sunrise Village: Farm Game | — | — | 150 | — | — | — | — | — | — |
| Dragonscapes Adventure | — | — | 83 | — | — | — | — | — | — |
| Taonga Island Adventure: Farm | — | — | 119 | — | — | — | — | — | — |
| Gossip Harbor: Merge & Story | 4 | — | — | — | 7 | — | — | — | — |
| Egg, Inc. | — | — | 41 | — | — | — | — | — | — |
| Family Farm Seaside® | — | 86 | — | — | — | — | — | — | — |
| Farmington – Farm game | — | — | — | 38 | — | — | — | — | — |
| Royal Farm – Fazenda e cidade | — | — | — | 48 | — | — | — | — | — |
| Goodville: Fazenda de aventura | 179 | — | — | 7 | — | — | — | — | — |
| Farm Manager - 2027 | — | — | 85 | — | — | — | — | — | — |
| Farming Simulator 20 | — | — | — | — | — | — | — | — | 34 |
| Sunshine Island Grande Fazenda | — | — | 33 | — | — | — | — | — | — |
| Farm Heroes Saga | 175 | 25 | — | — | — | 166 | — | — | — |
| Spring Valley: Jogo de Fazenda | — | — | — | 108 | — | — | — | — | — |
| Bermuda Adventures: Fazenda | — | — | — | 84 | — | — | — | — | — |
| FarmVille 2: Paraíso Tropical | — | — | 125 | — | — | — | — | — | — |
| Hempire - Cultivo de Cannabis | — | — | 137 | — | — | — | — | — | — |
| Wild West: atualizar a fazenda | — | — | 141 | — | — | — | — | — | — |
| Play Together:Parquinho Social | — | 140 | — | — | — | — | — | — | — |
| PKXD: Diversão, amigos e jogos | — | — | — | 45 | — | — | — | — | — |
| Livetopia: Party! | — | — | — | — | — | 191 | — | — | — |

- Additional farm-themed entries in the US Simulation top-grossing list (200 entries) that are not in the table: Farm Feud 76; Bud Farm: Idle Tycoon 90; Cheech and Chong Bud Farm 104; FarmVille 2: Tropic Escape 125; Hempire 137; Wild West 141; American Farming 2 151; Gold Rush: Frozen Farm 158; Animal Crossing: Pocket Camp Complete 193 (paid, $19.99); Ranch Legacy 200. In the US Adventure top-grossing list (200 entries): Goodville 7; Farmington 38; Adventure Bay 46; Royal Farm 48; Island Hoppers 61; Bermuda Adventures 84; Spring Valley 108. — [US chart endpoint](https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=vyAe2&source-path=%2Fstore%2Fapps&hl=en_US&gl=US&soc-app=121&soc-platform=1&soc-device=1&rt=c)

**Validation of the chart feed against the listing pages (all fetched 2026-11-11)**
- Township's Brazilian listing prints the badge "#5 mais rentáveis casuais" and Township is 5th in the Casual top-grossing list; Hay Day prints "#6 mais rentáveis casuais" and is 6th; Farm Heroes Saga prints "#9" and is 9th. — [Township BR](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR); [Hay Day BR](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=pt_BR&gl=BR); [Farm Heroes Saga BR](https://play.google.com/store/apps/details?id=com.king.farmheroessaga&hl=pt_BR&gl=BR)
- Heartopia prints "#5 mais rentáveis simulador" and Klondike Adventures "#9 mais rentáveis simulador"; both match the Simulation top-grossing list. — [Heartopia BR](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=pt_BR&gl=BR); [Klondike BR](https://play.google.com/store/apps/details?id=com.vizorapps.klondike&hl=pt_BR&gl=BR)
- Farming Simulator 23, 26 Mobile and 20 print "#3", "#6" and "#7 principais apps pagos simulador"; Stardew Valley prints "#2 principais apps pagos rpg"; PK XD prints "#2 principais apps gratuitos aventura". All match. On the US storefront Township prints "#3 top grossing casual", Klondike "#10 top grossing simulation" and Farming Simulator 26 Mobile "#5 top paid simulation"; all match. — Tables 1a, 1c and 1d (links)
- Badges that could not be cross-checked because the matching chart was not fetched: Gossip Harbor "#1 mais rentáveis quebra-cabeças" (BR) and "#1 top grossing puzzle" (US); Family Farm Merge "#10 mais rentáveis quebra-cabeças" (BR); Stardew Valley "#1 top paid role playing" (US). — [Gossip Harbor BR](https://play.google.com/store/apps/details?id=com.mergegames.gossipharbor&hl=pt_BR&gl=BR); [Family Farm Merge BR](https://play.google.com/store/apps/details?id=com.roomperfect.global&hl=pt_BR&gl=BR); [Stardew Valley US](https://play.google.com/store/apps/details?id=com.chucklefish.stardewvalley&hl=en_US&gl=US)

**Other farm titles by the same publishers (developer pages, BR, fetched 2026-11-11)**
- Century Games (10 titles shown): Fazenda Feliz Pocket / Family Farm Seaside (50 mi+), Family Farm Adventure (10 mi+), Aventura Dragon Cape / Dragonscapes (10 mi+), Fazenda Feliz Tango (5 mi+), alongside Whiteout Survival (100 mi+), Kingshot, Livetopia: Party! and Tasty Travels. — [Century Games developer page](https://play.google.com/store/apps/dev?id=6832375891198423999&hl=pt_BR&gl=BR)
- Zynga (10 shown): FarmVille 2 Aventuras no Campo (50 mi+) and FarmVille 3 (10 mi+); FarmVille 2: Paraíso Tropical (Tropic Escape, 10 mi+) appears in searches. — [Zynga developer page](https://play.google.com/store/apps/dev?id=6690081412016968981&hl=pt_BR&gl=BR)
- Goodgame Studios (5 shown; legal entity on the listing: Stillfront Germany GmbH): Big Farm: Homestead (1 mi+), Big Farm: Mobile Harvest (50 mi+), Sunshine Island (10 mi+), Big Farm (100 mil+). — [Goodgame Studios developer page](https://play.google.com/store/apps/dev?id=6247118862873290254&hl=pt_BR&gl=BR)
- UGO Games (3 shown): Farmington (10 mi+), Royal Farm (10 mi+), Secrets of Paradise Merge Game (1 mi+). — [UGO Games developer page](https://play.google.com/store/apps/dev?id=7712724056634878128&hl=pt_BR&gl=BR)
- Star Games Apps (4 shown; legal entity "STAR GAMES APPS ENTRETENIMENTO LTDA."): Farming Sim Brasil (1 mi+), Global Truck Online (10 mi+), Truck Sim Brasil (1 mi+), Bus Sim Brasil (1 mi+). — [Star Games Apps developer page](https://play.google.com/store/apps/dev?id=9127649072545565027&hl=pt_BR&gl=BR)

### Inferences
- In Brazil the farm genre monetizes far better than it currently acquires users: several farm titles hold top-grossing positions (Casual 5, 6, 12; Simulation 5, 9) while the top-free lists contain almost none. A new free-to-play farm game should not count on organic chart visibility; it will need paid acquisition or search optimisation for "fazenda" terms.
- "fazenda" queries are a crowded but shallow field: behind the first five or six big names, results include many titles in the 100 thousand to 10 million band, so a well-rated Portuguese-titled game can plausibly reach the first page. Farmington's consistent top-2 position for "jogo de fazenda", "Jogos de fazenda" and "fazenda multiplayer" with only a 10 mi+ band (its Brazilian summary ends with "Jogo em português") suggests that Portuguese keywords in the title and summary are rewarded.
- Farming Sim Brasil ranking first for "jogo de fazenda" with a 1 mi+ band, an ads-only listing and a 4.10★ average shows room for a locally themed 3D farm title in Brazilian search.
- Heartopia's absence from every farm query, together with its "Vida / Social" tags, means Google does not classify it as a farm game; players searching for farm games in Brazil will not meet it.
- Play category choice changes the chart a game competes in: in Brazil the Adventure top-grossing list returned only 86 entries and Farmington reaches 11th there, whereas Casual and Simulation are deeper lists.

### Gaps
- The rendered "Top charts" tabs could not be read (script host refused); the chart lists come from the store's data feed and were validated only indirectly (badge matches and repeatability).
- Chart lists are capped by the server (86 to 200 entries); positions beyond the returned length are unknown.
- No historical chart positions: this is a single snapshot taken on 2026-11-11 around 13:35–13:40 UTC. Charts move daily.
- The Puzzle and Role Playing top-grossing charts were not fetched, so merge-farm hybrids were only seen through the all-games list.
- Search results may be personalised by device or history in the real app; these are logged-out web results.

---

## 3. Which farm games are 3D and/or real-time multiplayer according to their own listings, and did the earlier candidate list miss a large 3D multiplayer farm game?

### Takeaway
No large free-to-play farm game on Google Play describes itself as real-time 3D multiplayer: the leaders describe asynchronous social play (neighbourhoods of up to 30, co-ops, clubs, guilds), Heartopia calls itself "a multiplayer life simulation game" with gardening as one of six hobbies, and the only farm titles that state both 3D graphics and multiplayer are the older Farming Simulator 14, 16 and 18, which offer local Wi-Fi/Bluetooth play. Nothing in 17 searches (235 distinct apps) and 20 chart lists shows a missed 3D multiplayer farm game with large installs.

### Cited Findings

**Leaders: what the descriptions say about social play (Brazilian listings unless noted; fetched 2026-11-11)**
- Hay Day: "Jogue no simulador com amigos. Entre em uma vizinhança ou crie a sua para jogar com até 30 pessoas. Troque dicas com os amigos, ajude os vizinhos e faça com que todos construam fazendas prósperas." The description contains no "3D" wording. — [Hay Day BR](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=pt_BR&gl=BR)
- Township: "Conexões sociais: Jogue com seus amigos do Facebook ou faça novas amizades na comunidade Township!" Short description: "Cultive, construa e vença níveis de agrupar 3. Jogo de simulação para a família!" — [Township BR](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR)
- FarmVille 2: Country Escape: "Junte-se a uma cooperativa para comprar, vender e compartilhar produtos ou jogue individualmente no modo anônimo." and "NEGOCIE e converse com os amigos ou jogue anonimamente com pessoas de todo o mundo". — [FarmVille 2 BR](https://play.google.com/store/apps/details?id=com.zynga.FarmVille2CountryEscape&hl=pt_BR&gl=BR)
- FarmVille 3: "Participe de uma cooperativa e complete eventos para desbloquear novos animais e itens especiais" and "Visite, ajude e converse com outros fazendeiros." — [FarmVille 3 BR](https://play.google.com/store/apps/details?id=com.zynga.farmville3&hl=pt_BR&gl=BR)
- Klondike Adventures: "DESAFIE fazendeiros vizinhos e aceite o maior número de pedidos que puder durante os eventos por tempo limitado que incluem todos os jogadores!" — [Klondike BR](https://play.google.com/store/apps/details?id=com.vizorapps.klondike&hl=pt_BR&gl=BR)
- Family Island and Family Farm Adventure: no multiplayer or friends wording was found in the description lines scanned. — [Family Island BR](https://play.google.com/store/apps/details?id=com.MelsoftGames.FamilyIslandFarm&hl=pt_BR&gl=BR); [Family Farm Adventure BR](https://play.google.com/store/apps/details?id=com.farmadventure.global&hl=pt_BR&gl=BR)
- Stardew Valley: "função multijogador não suportada". — [Stardew Valley BR](https://play.google.com/store/apps/details?id=com.chucklefish.stardewvalley&hl=pt_BR&gl=BR)
- Big Farm: Mobile Harvest: "um jogo de simulação de fazenda que você pode jogar on-line com amigos, familiares e fazendeiros do mundo todo." — [Big Farm: Mobile Harvest BR](https://play.google.com/store/apps/details?id=com.goodgamestudios.bigfarmmobileharvest&hl=pt_BR&gl=BR)
- Farmington: "Amigos e clubes. Jogue com seus amigos do Facebook e do Game Center, faça novos amigos, ajudem uns aos outros nas tarefas domésticas e ganhe recompensas e bônus. Junte-se às comunidades, os clubes. Com eles, você participa de eventos semanais especiais e disputa contra outros clubes." — [Farmington BR](https://play.google.com/store/apps/details?id=ugo.com.play.free.farmington&hl=pt_BR&gl=BR)
- Sunshine Island: "Junte-se a uma guilda e cresça junto! Faça parcerias e compita contra outros jogadores e guildas." — [Sunshine Island BR](https://play.google.com/store/apps/details?id=com.newmoonproduction.sunshineisland&hl=pt_BR&gl=BR)
- My Garden Tale ("Meu Mundo do Jardim"): "Você também pode se tornar amigo de outros jogadores, formar uma Guilda e iniciar interações sociais divertidas. Depois de se tornarem amigos, você pode visitar o jardim do amigo, colher flores plantadas por ele, e ter uma divertida \"batalha de roubo de flores\"." — [Meu Mundo do Jardim BR](https://play.google.com/store/apps/details?id=com.jxhy.official&hl=pt_BR&gl=BR)
- Harvest Town (pixel-art style per its own text): "[Funções Interativas] Corrida online multiplayer, comércio, criação de uma plataforma interativa real online." — [Harvest Town BR](https://play.google.com/store/apps/details?id=com.harvest.android.gr&hl=pt_BR&gl=BR)

**Heartopia**
- US description: "Welcome to Heartopia, a multiplayer life simulation game crafted for creativity, freedom, and peace." and "feel free to develop six major hobbies, including fishing, cooking, gardening, birdwatching, and more." and "You can also invite your friends over and build your dream home together." — [Heartopia US](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=en_US&gl=US)
- Brazilian description: "Interaja com os moradores cativantes de Heartopia, conecte-se com jogadores do mundo todo e descubra amizades duradouras." System requirements stated: "RAM: 6GB ou mais; Armazenamento: 14 GB de espaço disponível ou mais; Android 8.0 ou superior". The text never uses the word "3D" and never mentions farming, only gardening ("jardinagem"). — [Heartopia BR](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=pt_BR&gl=BR)

**Farm titles that state 3D graphics**
- Farming Simulator 14 (100 mi+, last updated 24 Nov 2023): "Novo grafismo em 3D altamente detalhado" and "Joga com um amigo num mundo aberto à exploração no novo modo Multijogador para WiFi e Bluetooth". Google tags include "Multiplayer" and "Multiplayer competitivo". — [Farming Simulator 14 BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs14&hl=pt_BR&gl=BR)
- Farming Simulator 16 (50 mi+): "Novos gráficos 3D mostram ainda mais detalhe da tua maquinaria!" and "Joga com um amigo em modo multi-jogador local em WiFi e Bluetooth (não disponível para Android TV)". Google tags include "Multiplayer cooperativo". — [Farming Simulator 16 BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs16&hl=pt_BR&gl=BR)
- Farming Simulator 18 (10 mi+): "Joga com amigos no modo multijogador local (Wi-Fi/Bluetooth)" and "Novos gráficos 3D". — [Farming Simulator 18 BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs18.google&hl=pt_BR&gl=BR)
- Farming Simulator 20 (paid, 1 mi+): "Os novos gráficos 3D reproduzem ainda mais os detalhes de seu maquinário"; no multiplayer wording. Farming Simulator 23 and 26 Mobile: neither "3D" nor multiplayer wording in the description; both carry Google's "Um jogador" (single player) tag. — [Farming Simulator 20 BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs20.google&hl=pt_BR&gl=BR); [Farming Simulator 23 BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs23.google&hl=pt_BR&gl=BR); [Farming Simulator 26 Mobile BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs26.google&hl=pt_BR&gl=BR)
- Harvest.io (100 mi+; tags "Ação, Jogo de io, Casuais, Um jogador, Estilizado, Off-line"): "Gráficos 3D coloridos e diferentes plantações para colher". — [Harvest.io BR](https://play.google.com/store/apps/details?id=com.harvest.io&hl=pt_BR&gl=BR)
- Farming Sim Brasil (1 mi+): "Imersão em Primeira Pessoa: A câmera em primeira pessoa oferece uma perspectiva única" and "os jogadores podem explorar o mapa a cavalo"; no multiplayer wording. — [Farming Sim Brasil BR](https://play.google.com/store/apps/details?id=com.stargamesapps.farmingsimbrasil&hl=pt_BR&gl=BR)
- Smaller titles from the searches whose descriptions state 3D: My Free Farm 2 (5 mi+; "A configuração 3D colorida"), Blocky Farm (5 mi+; "LINDOS GRÁFICOS 3D"), Farm Story 2 (5 mi+; "um lindo mundo 3D"), Fazenda 3D Jogo Simulador (1 mi+), Seed Farm 3D: Plant & Trade (1 mi+), Egg, Inc. (10 mi+; "crisp and colorful 3D graphics"). None states multiplayer. — [search "fazenda 3d" BR](https://play.google.com/store/search?q=fazenda%203d&c=apps&hl=pt_BR&gl=BR); [search "fazenda online com amigos" BR](https://play.google.com/store/search?q=fazenda%20online%20com%20amigos&c=apps&hl=pt_BR&gl=BR); [search "farm game" US](https://play.google.com/store/search?q=farm%20game&c=apps&hl=en_US&gl=US)

**Google's own player-mode tags**
- 47 of the 51 Brazilian listings read carry the tag "Um jogador" (single player), including Township, Hay Day, Klondike Adventures, FarmVille 2 and 3 and Heartopia. A "Multiplayer" tag appears only on Farming Simulator 14, Farming Simulator 16, PK XD and Play Together; a "Social" tag appears on Heartopia and Livetopia. — Tables 1a–1c (links); [PK XD BR](https://play.google.com/store/apps/details?id=com.movile.playkids.pkxd&hl=pt_BR&gl=BR); [Play Together BR](https://play.google.com/store/apps/details?id=com.haegin.playtogether&hl=pt_BR&gl=BR); [Livetopia BR](https://play.google.com/store/apps/details?id=com.metroville.global&hl=pt_BR&gl=BR)

**Multiplayer avatar life-sims that chart in Brazil but are not farm games (reference points)**

| Game (BR listing title, linked to source) | Package | Developer | ★ BR | Ratings count | Installs band | Embedded install counter | "Contém anúncios" | "Compras no app" range (BRL, per item) | Price | Content rating (BR) | Play category | Released (BR listing) | Last updated | Chart badge shown on listing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| [Play Together:Parquinho Social](https://play.google.com/store/apps/details?id=com.haegin.playtogether&hl=pt_BR&gl=BR) | `com.haegin.playtogether` | HAEGIN Co., Ltd. | 4.20 | 2,164,337 | 10 mi+ | 48,295,250 | Yes | R$ 5,49 – R$ 539,99 | free | Classificação 18 anos | Casuais | 12 de abr. de 2021 | 26 de out. de 2026 | — |
| [PKXD: Diversão, amigos e jogos](https://play.google.com/store/apps/details?id=com.movile.playkids.pkxd&hl=pt_BR&gl=BR) | `com.movile.playkids.pkxd` | Wildlife Studios | 4.70 | 6,475,414 | 100 mi+ | 365,504,689 | Yes | R$ 0,90 – R$ 1.359,90 | free | Classificação 16 anos | Aventura | 12 de jul. de 2019 | 10 de nov. de 2026 | #2 principais apps gratuitos aventura |
| [Livetopia: Party!](https://play.google.com/store/apps/details?id=com.metroville.global&hl=pt_BR&gl=BR) | `com.metroville.global` | Century Games PTE. LTD. | 4.35 | 147,766 | 50 mi+ | 54,000,119 | No | R$ 0,39 – R$ 619,90 | free | Classificação 18 anos | Casuais | 26 de jun. de 2023 | 29 de out. de 2026 | — |

- PK XD: "juntar-se a milhões de jogadores em uma aventura e jogo multiplayer online!" and "Em um jogo mundo aberto, você terá a liberdade de enfrentar desafios multiplayer". It is 2nd in Brazil's Adventure top free, 30th in all-games top free, 6th in Adventure top grossing and 101st in all-games top grossing, and is first in the games home cluster "Jogos da sua terra — Da América Latina". — [PK XD BR](https://play.google.com/store/apps/details?id=com.movile.playkids.pkxd&hl=pt_BR&gl=BR); [Games home BR](https://play.google.com/store/games?hl=pt_BR&gl=BR); [BR chart endpoint](https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=vyAe2&source-path=%2Fstore%2Fapps&hl=pt_BR&gl=BR&soc-app=121&soc-platform=1&soc-device=1&rt=c)
- Play Together: "Desde a “Festa de Jogos”, o modo de até 30 pessoas que elimina até o último sobrevivente" and "Experimente pescar mais de 600 tipos de peixes" and "Colete insetos e lagartos com seus amigos". It is 66th in Brazil's Casual top grossing. — [Play Together BR](https://play.google.com/store/apps/details?id=com.haegin.playtogether&hl=pt_BR&gl=BR)
- Livetopia: Party! (Century Games): "converse e saia com eles em tempo real!" It is 81st in Casual top grossing and 89th in Casual top free in Brazil. — [Livetopia BR](https://play.google.com/store/apps/details?id=com.metroville.global&hl=pt_BR&gl=BR)

**Was anything missed?**
- A keyword scan of the full description text of all 235 apps returned by the 17 searches found no app with at least 1 million installs that states both 3D and online multiplayer, other than Farming Simulator 14, 16 and 18 (local multiplayer). — search URLs listed in section 2
- No additional farm-themed title appears in the Brazilian or US Simulation, Casual or Adventure top-grossing lists beyond those enumerated in section 2. — [BR chart endpoint](https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=vyAe2&source-path=%2Fstore%2Fapps&hl=pt_BR&gl=BR&soc-app=121&soc-platform=1&soc-device=1&rt=c); [US chart endpoint](https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=vyAe2&source-path=%2Fstore%2Fapps&hl=en_US&gl=US&soc-app=121&soc-platform=1&soc-device=1&rt=c)
- Large-install farm titles that the earlier candidate list did not name (none is 3D multiplayer): Family Farm Seaside / Fazenda Feliz Pocket (50 mi+), Farming Simulator 14 (100 mi+) and 16 (50 mi+), Harvest.io (100 mi+), Farm Town: Merge Cozy Village (50 mi+), Farmington (10 mi+), Egg, Inc. (10 mi+), Farm Heroes Saga (100 mi+, match-3). — Tables 1b and 1c (links)

### Inferences
- The combination the client plans — free-to-play, 3D, real-time multiplayer, farm-first — has no large incumbent on Google Play by the listings' own words. The nearest neighbours are (a) Heartopia, a multiplayer life-sim that is not positioned as a farm game, (b) premium or legacy Farming Simulator titles with machine-driving and local multiplayer, and (c) avatar social sims such as PK XD and Play Together that prove Brazilian demand for real-time multiplayer worlds (PK XD is 30th among all free games) but contain no farming.
- Whether Heartopia, PK XD, Play Together or the casual leaders are rendered in 3D cannot be confirmed from text; the descriptions do not say so. **[UNVERIFIED-BK]** Heartopia, PK XD, Play Together and Livetopia are 3D avatar games; Hay Day, Township and Klondike use a fixed isometric view.
- Heartopia's stated requirement of 6 GB RAM and 14 GB storage is a real barrier in Brazil's device mix; Brazilian reviewers complain about overheating and crashes (section 6). A lighter 3D client would be a differentiator.
- Google's "Um jogador" tag on Hay Day and Township despite their neighbourhood and co-op systems shows that the store's tagging treats asynchronous social play as single-player; a real-time game could earn the "Multiplayer" tag and appear in clusters such as "Jogos multiplayer", where no farm game is present today.

### Gaps
- "3D" was assessed only from description text. Screenshots and video could not be viewed.
- "Real-time" is rarely stated outright in any listing; the classification of Hay Day, Township, FarmVille and Big Farm as asynchronous is an inference from the features they describe (neighbourhoods, co-ops, trading), not a quoted claim.
- Roblox experiences (for example farming or gardening experiences inside Roblox) are invisible to the Play Store; Roblox itself is 1st in Brazil's all-games top grossing and 2nd in top free.
- Only apps returned by the 17 queries and 20 chart lists were examined; a 3D multiplayer farm game with an unrelated title and no chart presence could still exist.

---

## 4. Which leading games declare "Contains ads" versus in-app purchases only, and what in-app price range do they expose in Brazilian reais compared with US dollars?

### Takeaway
The hybrid model is the norm: 19 of the 24 core candidates, including Hay Day, declare "Contém anúncios" as well as in-app purchases, while Township, Heartopia, Farm Land, Taonga and the paid Stardew Valley carry no ads label. Brazilian price ladders mostly start at R$ 4.99 where the US ladder starts at $0.99 and top out at about 5 to 6.7 reais per US dollar, so the Brazilian ladder is close to a straight conversion rather than a discounted one, with a few publishers offering sub-R$ 1 entry items.

### Cited Findings

**Ads label (identical on the Brazilian and US listing for all 26 games read on both; fetched 2026-11-11)**
- Declares ads and in-app purchases: Hay Day, The Cozy Florist, My Garden Tale, Klondike Adventures, Family Island, Family Farm Adventure, FarmVille 2: Country Escape, FarmVille 3, Big Farm: Mobile Harvest, Big Farm Homestead, Farm City, Harvest Town, Golden Farm, Coco Valley, Sunrise Village, Dragonscapes Adventure, Gossip Harbor, plus the paid Farming Simulator 23 and Farming Simulator 26 Mobile (19 of 24 core candidates). — Table 1a (links)
- No ads label, in-app purchases only: Township, Heartopia, Farm Land, Taonga Island Adventure. No ads label and no in-app purchase label: Stardew Valley (paid, R$ 24.99 / $4.99). — [Township BR](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR); [Heartopia BR](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=pt_BR&gl=BR); [Farm Land BR](https://play.google.com/store/apps/details?id=com.loltap.farmland&hl=pt_BR&gl=BR); [Taonga BR](https://play.google.com/store/apps/details?id=com.volka.taonga&hl=pt_BR&gl=BR); [Stardew Valley BR](https://play.google.com/store/apps/details?id=com.chucklefish.stardewvalley&hl=pt_BR&gl=BR)
- Among the other titles sampled: Family Farm Seaside (Fazenda Feliz Pocket), Farming Simulator 14, Farming Simulator 20 and Livetopia carry no ads label; Farmington, Royal Farm, Goodville, Farm Manager - 2027, Sunshine Island, Farm Heroes Saga, Spring Valley, Bermuda Adventures, Egg, Inc., Idle Farming Empire, Little Farm Story, Harvest.io, PK XD and Play Together declare ads. — Tables 1b, 1c and the social table in section 3 (links)
- Farming Sim Brasil declares ads and has no in-app purchase label at all (ads-only). — [Farming Sim Brasil BR](https://play.google.com/store/apps/details?id=com.stargamesapps.farmingsimbrasil&hl=pt_BR&gl=BR)

**In-app price ranges exposed on the listings**
- Brazilian ranges for the leaders (per item): Township R$ 0,99 – R$ 849,90; Hay Day R$ 1,90 – R$ 1.499,90; Heartopia R$ 2,50 – R$ 62,90; Klondike Adventures R$ 2,50 – R$ 789,99; Family Island R$ 4,99 – R$ 999,99; Family Farm Adventure R$ 4,99 – R$ 619,90; FarmVille 2 R$ 1,09 – R$ 2.049,99; FarmVille 3 R$ 2,90 – R$ 1.299,90; Big Farm: Mobile Harvest R$ 6,90 – R$ 2.249,99; My Garden Tale R$ 1,59 – R$ 2.499,90. — Table 1a (links)
- US ranges for the same games: Township $0.99 – $149.99; Hay Day $0.29 – $239.99; Heartopia $0.39 – $99.99; Klondike Adventures $0.29 – $199.99; Family Island $0.99 – $149.99; Family Farm Adventure $0.99 – $99.99; FarmVille 2 $0.49 – $374.99; FarmVille 3 $0.59 – $199.99; Big Farm: Mobile Harvest $1.09 – $384.99; My Garden Tale $0.29 – $399.99. — Table 1d (links)
- Lowest Brazilian entry points seen: Golden Farm and Livetopia R$ 0,39; the foranj.games farm titles (for example Farm Town: Merge Cozy Village) R$ 0,49; PK XD R$ 0,90; Township and Farm Bay R$ 0,99; FarmVille 2 R$ 1,09; My Garden Tale R$ 1,59; Hay Day R$ 1,90; Farmington R$ 2,00. — [Golden Farm BR](https://play.google.com/store/apps/details?id=ru.playme8.dachniki&hl=pt_BR&gl=BR); [Livetopia BR](https://play.google.com/store/apps/details?id=com.metroville.global&hl=pt_BR&gl=BR); [Farm Town BR](https://play.google.com/store/apps/details?id=com.foranj.farmtown&hl=pt_BR&gl=BR); [PK XD BR](https://play.google.com/store/apps/details?id=com.movile.playkids.pkxd&hl=pt_BR&gl=BR); [search "fazenda" BR (result cards)](https://play.google.com/store/search?q=fazenda&c=apps&hl=pt_BR&gl=BR)
- The paid Farming Simulator games sell small add-ons only: Farming Simulator 23 R$ 5,49 – R$ 16,99 ($0.99 – $3.49); Farming Simulator 26 Mobile R$ 5,90 – R$ 14,90 ($1.19 – $3.49). — [Farming Simulator 23 BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs23.google&hl=pt_BR&gl=BR); [Farming Simulator 26 Mobile BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs26.google&hl=pt_BR&gl=BR)

**Table 4a — Brazilian versus US ends of each ladder and the implied reais-per-dollar ratio (computed from Tables 1a and 1d; same source URLs; fetched 2026-11-11).** The lowest and highest items on each storefront are not guaranteed to be the same product, so the ratios are indicative.

| Game | Lowest item BR | Lowest item US | Implied BRL per USD (lowest) | Highest item BR | Highest item US | Implied BRL per USD (highest) |
|---|---|---|---|---|---|---|
| Township | R$ 0.99 | $ 0.99 | 1.00 | R$ 849.90 | $ 149.99 | 5.67 |
| Hay Day | R$ 1.90 | $ 0.29 | 6.55 | R$ 1,499.90 | $ 239.99 | 6.25 |
| Heartopia | R$ 2.50 | $ 0.39 | 6.41 | R$ 62.90 | $ 99.99 | 0.63 |
| The Cozy Florist | R$ 2.39 | $ 0.49 | 4.88 | R$ 529.99 | $ 99.99 | 5.30 |
| My Garden Tale | R$ 1.59 | $ 0.29 | 5.48 | R$ 2,499.90 | $ 399.99 | 6.25 |
| Klondike Adventures: Farm Game | R$ 2.50 | $ 0.29 | 8.62 | R$ 789.99 | $ 199.99 | 3.95 |
| Family Island™ — Farming game | R$ 4.99 | $ 0.99 | 5.04 | R$ 999.99 | $ 149.99 | 6.67 |
| Family Farm Adventure® | R$ 4.99 | $ 0.99 | 5.04 | R$ 619.90 | $ 99.99 | 6.20 |
| FarmVille 2: Country Escape | R$ 1.09 | $ 0.49 | 2.22 | R$ 2,049.99 | $ 374.99 | 5.47 |
| FarmVille 3 – Farm Animals | R$ 2.90 | $ 0.59 | 4.92 | R$ 1,299.90 | $ 199.99 | 6.50 |
| Farming Simulator 23 Mobile | R$ 5.49 | $ 0.99 | 5.55 | R$ 16.99 | $ 3.49 | 4.87 |
| Farming Simulator 26 Mobile | R$ 5.90 | $ 1.19 | 4.96 | R$ 14.90 | $ 3.49 | 4.27 |
| Big Farm: Mobile Harvest | R$ 6.90 | $ 1.09 | 6.33 | R$ 2,249.99 | $ 384.99 | 5.84 |
| Big Farm Homestead | R$ 4.90 | $ 0.99 | 4.95 | R$ 869.90 | $ 149.99 | 5.80 |
| Farm Land - Farming life game | R$ 3.19 | $ 1.49 | 2.14 | R$ 559.99 | $ 119.99 | 4.67 |
| Farm City: Farming & Building | R$ 2.49 | $ 0.99 | 2.52 | R$ 249.99 | $ 99.99 | 2.50 |
| Harvest Town | R$ 3.39 | $ 0.99 | 3.42 | R$ 489.99 | $ 99.99 | 4.90 |
| Golden Farm | R$ 0.39 | $ 0.49 | 0.80 | R$ 1,349.99 | $ 399.99 | 3.38 |
| Coco Valley: Farm Adventure | R$ 4.89 | $ 0.99 | 4.94 | R$ 394.99 | $ 79.99 | 4.94 |
| Sunrise Village: Farm Game | R$ 4.90 | $ 0.99 | 4.95 | R$ 999.90 | $ 199.99 | 5.00 |
| Dragonscapes Adventure | R$ 4.99 | $ 0.99 | 5.04 | R$ 619.90 | $ 99.99 | 6.20 |
| Taonga Island Adventure: Farm | R$ 5.99 | $ 0.99 | 6.05 | R$ 1,299.99 | $ 199.99 | 6.50 |
| Gossip Harbor: Merge & Story | R$ 4.99 | $ 0.99 | 5.04 | R$ 539.99 | $ 99.99 | 5.40 |
| Family Farm Seaside® | R$ 4.99 | $ 0.99 | 5.04 | R$ 619.90 | $ 99.99 | 6.20 |
| Farmington – Farm game | R$ 2.00 | $ 0.49 | 4.08 | R$ 484.99 | $ 119.99 | 4.04 |
| **Median of 25 titles** | | | **4.96** | | | **5.40** |

- Paid-app price points: Stardew Valley R$ 24,99 versus $4.99 (5.01 reais per dollar); Farming Simulator 23 R$ 24,90 versus $5.99 (4.16); Farming Simulator 26 Mobile R$ 39,90 versus $7.99 (4.99); Farming Simulator 20 R$ 22,95 (Brazil) and $4.99 (US, from the search card) (4.60). — [Stardew Valley BR](https://play.google.com/store/apps/details?id=com.chucklefish.stardewvalley&hl=pt_BR&gl=BR); [Stardew Valley US](https://play.google.com/store/apps/details?id=com.chucklefish.stardewvalley&hl=en_US&gl=US); [Farming Simulator 26 Mobile US](https://play.google.com/store/apps/details?id=com.giantssoftware.fs26.google&hl=en_US&gl=US); [Farming Simulator 20 BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs20.google&hl=pt_BR&gl=BR); [search "Farming games" US (result card)](https://play.google.com/store/search?q=Farming+games&c=apps&hl=en_US&gl=US)
- The most common pairing is R$ 4,99 in Brazil against $0.99 in the US at the bottom (Family Island, Family Farm Adventure, Family Farm Seaside, Dragonscapes, Gossip Harbor: ratio 5.04) and R$ 619,90 against $99.99 at the top for Century Games titles (ratio 6.20). — Table 4a
- Outliers: Township's cheapest item is R$ 0,99 against $0.99 (ratio 1.00); Golden Farm R$ 0,39 against $0.49 (0.80); Farm City sits at about 2.5 at both ends (R$ 2,49 – R$ 249,99 against $0.99 – $99.99); Klondike's top item is R$ 789,99 against $199.99 (3.95); Heartopia's Brazilian range stops at R$ 62,90 while the US range reaches $99.99 (0.63). — Table 4a
- Price points mentioned by Brazilian reviewers on the listings: Heartopia — "o passe é muito caro, quase 30 reais" (4★, 2026-11-01) and "Pago o pacote de R$ 16,90 para ter os tickets de sorteio diários" (3★, 2026-05-04); Township — "Agora custa R$ 10,90 comprar 1.000 notas" (1★, 2026-08-03). — [Heartopia BR](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=pt_BR&gl=BR); [Township BR](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR)

### Inferences
- Median implied ratio is 4.96 reais per dollar at the bottom of the ladder and 5.40 at the top across 25 titles, and the three paid apps sit between 4.16 and 5.01. **[UNVERIFIED-BK]** The commercial exchange rate was in the region of 5 to 6 reais per dollar during 2025 and the first half of 2026; the rate on 2026-11-11 could not be retrieved in this session. On that basis the typical Brazilian ladder is roughly a straight currency conversion (plus tax where the top tiers reach 6.2–6.7), not a purchasing-power discount.
- The publishers that do localise downwards do it at the entry point rather than across the ladder: Township (R$ 0,99), Golden Farm (R$ 0,39), foranj.games (R$ 0,49), PK XD (R$ 0,90), FarmVille 2 (R$ 1,09). An original Brazilian game can copy this cheaply: a first purchase under R$ 2 next to a standard ladder.
- Heartopia's Brazilian ceiling of R$ 62,90 suggests it sells no large bundles in Brazil (or prices them regionally); combined with its 5th place in Simulation top grossing, its Brazilian revenue appears to come from many small purchases such as the pass of "quase 30 reais" and the R$ 16,90 pack that reviewers cite.
- The ads label does not distinguish rewarded-only from forced advertising. Hay Day's label is consistent with the earlier notes' description of optional rewarded video; a Township reviewer writes "Não precisa se preocupar com anúncios ou coisa do tipo" (4★, 2023-10-24), consistent with its missing label.
- The client's plan (ads plus premium currency) matches what most of the genre declares on the store. The two exceptions with the highest grossing positions that declare no ads are Township and Heartopia.

### Gaps
- The listing exposes only the lowest and highest item price, not the ladder in between, the pass price or the currency-pack contents.
- No exchange rate source was reachable; the comparison with "a straight USD conversion" rests on ratios between the two storefronts and on unverified background knowledge of the rate.
- Whether Brazilian prices on Google Play include tax, and how much, could not be checked.
- The ads label does not reveal ad formats (rewarded, interstitial, banner) or ad revenue share.
- Heartopia's low Brazilian ceiling may be a data quirk of the listing rather than a real difference in catalogue; it could not be tested.

---

## 5. Using only review counts, ratings and download bands read from the listings, how should the top 10 farm games be re-ranked, and where does that contradict the earlier best-effort ranking?

### Takeaway
On listing metrics alone the top two are confirmed (Hay Day 13.08 million ratings and Township 12.98 million, with Township two download bands higher at 500 mi+), but positions 3 to 10 change substantially: FarmVille 2: Country Escape, Family Island, Family Farm Seaside, Klondike Adventures, Farming Simulator 14 and Farm Land rank in the top 10, while Heartopia, Family Farm Adventure, FarmVille 3, Stardew Valley and the current Farming Simulator 23/26 do not. Heartopia's case for the top tier rests on grossing rank (5th in Brazil's Simulation top grossing), not on installs or ratings.

### Cited Findings

**Table 5a — Farm-themed listings sampled, ordered by worldwide ratings count (47 listings ranked; top 24 shown; fetched 2026-11-11; each name links to the page read).**

| # by ratings count | Game | Ratings count | Installs band | Embedded install counter | ★ BR | ★ US | Last updated |
|---|---|---|---|---|---|---|---|
| 1 | [Hay Day](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=pt_BR&gl=BR) | 13,075,075 | 100 mi+ | 374,111,421 | 4.57 | 4.41 | 16 de out. de 2026 |
| 2 | [Township](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR) | 12,983,836 | 500 mi+ | 529,551,663 | 4.83 | 4.69 | 28 de out. de 2026 |
| 3 | [Farm Heroes Saga](https://play.google.com/store/apps/details?id=com.king.farmheroessaga&hl=pt_BR&gl=BR) | 9,789,030 | 100 mi+ | 435,285,194 | 4.70 | not read | 10 de nov. de 2026 |
| 4 | [FarmVille 2 Aventuras no Campo](https://play.google.com/store/apps/details?id=com.zynga.FarmVille2CountryEscape&hl=pt_BR&gl=BR) | 3,232,400 | 50 mi+ | 78,789,697 | 4.74 | 4.58 | 23 de out. de 2026 |
| 5 | [Family Island: Jogo de fazenda](https://play.google.com/store/apps/details?id=com.MelsoftGames.FamilyIslandFarm&hl=pt_BR&gl=BR) | 1,665,263 | 50 mi+ | 75,864,077 | 4.45 | 4.48 | 6 de nov. de 2026 |
| 6 | [Fazenda Feliz Pocket](https://play.google.com/store/apps/details?id=com.funplus.familyfarm&hl=pt_BR&gl=BR) | 1,626,535 | 50 mi+ | 97,811,806 | 4.14 | 4.21 | 22 de set. de 2026 |
| 7 | [Egg, Inc.](https://play.google.com/store/apps/details?id=com.auxbrain.egginc&hl=pt_BR&gl=BR) | 1,410,843 | 10 mi+ | 31,204,136 | 4.80 | not read | 19 de ago. de 2026 |
| 8 | [Klondike Adventures: Fazenda](https://play.google.com/store/apps/details?id=com.vizorapps.klondike&hl=pt_BR&gl=BR) | 1,379,707 | 100 mi+ | 112,882,464 | 4.57 | 4.58 | 9 de nov. de 2026 |
| 9 | [Farming Simulator 14](https://play.google.com/store/apps/details?id=com.giantssoftware.fs14&hl=pt_BR&gl=BR) | 1,011,640 | 100 mi+ | 141,709,817 | 4.11 | not read | 24 de nov. de 2023 |
| 10 | [Farm Land](https://play.google.com/store/apps/details?id=com.loltap.farmland&hl=pt_BR&gl=BR) | 852,077 | 100 mi+ | 137,963,950 | 4.64 | 4.52 | 1 de out. de 2026 |
| 11 | [Aventura Dragon Cape](https://play.google.com/store/apps/details?id=com.dragonscapes.global&hl=pt_BR&gl=BR) | 693,085 | 10 mi+ | 22,086,420 | 4.85 | 4.82 | 30 de out. de 2026 |
| 12 | [Farm City: Farming & Building](https://play.google.com/store/apps/details?id=com.citybay.farming.citybuilding&hl=pt_BR&gl=BR) | 602,061 | 50 mi+ | 67,839,432 | 4.46 | 4.40 | 9 de nov. de 2026 |
| 13 | [Family Farm Adventure®](https://play.google.com/store/apps/details?id=com.farmadventure.global&hl=pt_BR&gl=BR) | 554,970 | 10 mi+ | 33,050,348 | 4.67 | 4.58 | 27 de out. de 2026 |
| 14 | [Farm Town: Merge Cozy Village](https://play.google.com/store/apps/details?id=com.foranj.farmtown&hl=pt_BR&gl=BR) | 553,261 | 50 mi+ | 52,998,506 | 4.35 | not read | 27 de out. de 2026 |
| 15 | [Farming Simulator 16](https://play.google.com/store/apps/details?id=com.giantssoftware.fs16&hl=pt_BR&gl=BR) | 448,088 | 50 mi+ | 91,351,895 | 4.35 | not read | 6 de mar. de 2026 |
| 16 | [Big Farm: Mobile Harvest](https://play.google.com/store/apps/details?id=com.goodgamestudios.bigfarmmobileharvest&hl=pt_BR&gl=BR) | 437,725 | 50 mi+ | 57,878,711 | 4.14 | 4.01 | 23 de out. de 2026 |
| 17 | [FarmVille 2: Paraíso Tropical](https://play.google.com/store/apps/details?id=com.zynga.FarmVilleTropicEscape&hl=pt_BR&gl=BR) | 408,497 | 10 mi+ | 14,910,483 | 4.07 | not read | 6 de nov. de 2026 |
| 18 | [Hempire - Cultivo de Cannabis](https://play.google.com/store/apps/details?id=ca.lbcstudios.hempire&hl=pt_BR&gl=BR) | 396,158 | 10 mi+ | 20,074,623 | 4.79 | not read | 30 de out. de 2026 |
| 19 | [Idle Farming Empire](https://play.google.com/store/apps/details?id=com.futureplay.boots&hl=pt_BR&gl=BR) | 353,534 | 10 mi+ | 23,559,833 | 4.60 | not read | 11 de nov. de 2026 |
| 20 | [Farmington - Jogo de fazenda](https://play.google.com/store/apps/details?id=ugo.com.play.free.farmington&hl=pt_BR&gl=BR) | 334,054 | 10 mi+ | 29,674,895 | 4.77 | 4.77 | 10 de nov. de 2026 |
| 21 | [Bermuda Adventures: Fazenda](https://play.google.com/store/apps/details?id=com.samfinaco.paradise&hl=pt_BR&gl=BR) | 324,665 | 10 mi+ | 24,081,111 | 4.51 | not read | 2 de jan. de 2026 |
| 22 | [Little Farm Story](https://play.google.com/store/apps/details?id=com.h8games.littlefarmstory&hl=pt_BR&gl=BR) | 245,612 | 10 mi+ | 18,667,009 | 4.58 | not read | 1 de out. de 2026 |
| 23 | [Harvest.io - Arcade de fazenda](https://play.google.com/store/apps/details?id=com.harvest.io&hl=pt_BR&gl=BR) | 216,128 | 100 mi+ | 178,468,616 | 4.20 | not read | 3 de nov. de 2026 |
| 24 | [Stardew Valley](https://play.google.com/store/apps/details?id=com.chucklefish.stardewvalley&hl=pt_BR&gl=BR) | 203,699 | 5 mi+ | 7,265,589 | 4.76 | 4.60 | 26 de jun. de 2026 |

- Ordering the same listings by installs band, breaking ties with the embedded install counter, gives: 1 Township (500 mi+; 529,551,663); 2 Farm Heroes Saga (100 mi+; 435,285,194); 3 Hay Day (100 mi+; 374,111,421); 4 Harvest.io (100 mi+; 178,468,616); 5 Farming Simulator 14 (100 mi+; 141,709,817); 6 Farm Land (100 mi+; 137,963,950); 7 Klondike Adventures (100 mi+; 112,882,464); 8 Fazenda Feliz Pocket / Family Farm Seaside (50 mi+; 97,811,806); 9 Farming Simulator 16 (50 mi+; 91,351,895); 10 FarmVille 2: Country Escape (50 mi+; 78,789,697); 11 Family Island (50 mi+; 75,864,077); 12 Farm City (50 mi+; 67,839,432); 13 Big Farm: Mobile Harvest (50 mi+; 57,878,711); 14 Farm Town: Merge Cozy Village (50 mi+; 52,998,506). — Tables 1a–1c (links)
- Seven farm-themed listings show the 100 mi+ band or higher: Township (500 mi+), Hay Day, Farm Heroes Saga, Klondike Adventures, Farm Land, Farming Simulator 14 and Harvest.io. — Tables 1a–1c (links)
- Heartopia: 10 mi+ band, counter 11,277,530, 137,809 ratings, 4.49★ BR / 4.40★ US — 33rd of the 47 farm-themed listings by ratings count. — [Heartopia BR](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=pt_BR&gl=BR)
- Family Farm Adventure: 10 mi+ band, counter 33,050,348, 554,970 ratings, 4.67★ BR / 4.58★ US. FarmVille 3: 10 mi+, counter 14,845,299, 188,374 ratings, 4.52★ BR / 4.41★ US. Stardew Valley: 5 mi+, counter 7,265,589, 203,699 ratings, 4.76★ BR / 4.60★ US. Farming Simulator 23: 500 mil+, counter 504,875, 27,581 ratings, 4.53★ BR. Farming Simulator 26 Mobile: 50 mil+, counter 97,452, 4,431 ratings, 3.60★ BR / 3.65★ US. — Table 1a (links)

**Re-ranked top 10 (farm and farm-simulation games, primary key = ratings count; match-3 Farm Heroes Saga set aside)**

| New # | Game | Ratings count | Installs band | ★ BR / ★ US | Position if sorted by band then counter | Earlier best-effort # |
|---|---|---|---|---|---|---|
| 1 | Hay Day | 13,075,075 | 100 mi+ | 4.57 / 4.41 | 2 | 2 |
| 2 | Township | 12,983,836 | 500 mi+ | 4.83 / 4.69 | 1 | 1 |
| 3 | FarmVille 2: Country Escape | 3,232,400 | 50 mi+ | 4.74 / 4.58 | 9 | 5 |
| 4 | Family Island | 1,665,263 | 50 mi+ | 4.45 / 4.48 | 10 | 6 |
| 5 | Family Farm Seaside (Fazenda Feliz Pocket) | 1,626,535 | 50 mi+ | 4.14 / 4.21 | 7 | not listed |
| 6 | Egg, Inc. (idle) | 1,410,843 | 10 mi+ | 4.80 / not read | 16 | not listed |
| 7 | Klondike Adventures | 1,379,707 | 100 mi+ | 4.57 / 4.58 | 6 | 4 |
| 8 | Farming Simulator 14 (not updated since 24 Nov 2023) | 1,011,640 | 100 mi+ | 4.11 / not read | 4 | not listed (series was #10) |
| 9 | Farm Land | 852,077 | 100 mi+ | 4.64 / 4.52 | 5 | not listed (named as unverified) |
| 10 | Dragonscapes Adventure (Aventura Dragon Cape) | 693,085 | 10 mi+ | 4.85 / 4.82 | 20 | not listed (named as unverified) |

Sources: Tables 1a–1c (links). "Position if sorted by band then counter" excludes Farm Heroes Saga, as the table does. Next in line by ratings count: Farm City (602,061; 50 mi+), Family Farm Adventure (554,970), Farm Town: Merge Cozy Village (553,261), Farming Simulator 16 (448,088), Big Farm: Mobile Harvest (437,725).

**Explicit contradictions and corrections against the earlier notes** (earlier file: `google_play_top_farming_games.md`; every "now" value is from the linked listing, fetched 2026-11-11)
1. **Order of the top two.** Earlier: Township #1, Hay Day #2. Now: Hay Day has marginally more ratings (13,075,075 against 12,983,836); Township has the higher band (500 mi+ against 100 mi+), the higher counter and the higher star average. The pair is confirmed; the order depends on the metric. — [Hay Day BR](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=pt_BR&gl=BR); [Township BR](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR)
2. **Township figures.** Earlier (tracker estimates): ≈460–500M installs, 12.6M ratings, 4.77★. Now: band 500 mi+, counter 529,551,663, 12,983,836 ratings, 4.83★ in Brazil and 4.69★ in the US. The single "4.77★" figure hides a storefront difference. — [Township BR](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR); [Township US](https://play.google.com/store/apps/details?id=com.playrix.township&hl=en_US&gl=US)
3. **Hay Day figures.** Earlier: ≈364–369M installs, 13.1M ratings, 4.3–4.38★. Now: band 100 mi+, counter 374,111,421, 13,075,075 ratings, 4.57★ in Brazil and 4.41★ in the US. — [Hay Day BR](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=pt_BR&gl=BR); [Hay Day US](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=en_US&gl=US)
4. **Heartopia at #3.** Earlier: #3 on revenue, Google Play installs and rating "not found". Now: 10 mi+ band, 137,809 ratings, 4.49★ BR — 33rd of 47 by ratings count, far outside the top 10 on listing metrics. It is, however, 5th in Brazil's Simulation top grossing and 89th in all-games top grossing (32nd in US Simulation top grossing; not in the US all-games top 200). — [Heartopia BR](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=pt_BR&gl=BR); [BR chart endpoint](https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=vyAe2&source-path=%2Fstore%2Fapps&hl=pt_BR&gl=BR&soc-app=121&soc-platform=1&soc-device=1&rt=c); [US chart endpoint](https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=vyAe2&source-path=%2Fstore%2Fapps&hl=en_US&gl=US&soc-app=121&soc-platform=1&soc-device=1&rt=c)
5. **Heartopia release date.** Earlier: global release January 2026. Now: the Play listing shows "23 de dez. de 2025" / "Dec 23, 2025" on both storefronts, and the last update is 21 Aug 2026. — [Heartopia BR](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=pt_BR&gl=BR); [Heartopia US](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=en_US&gl=US)
6. **Klondike Adventures.** Earlier: #4, installs 98–109M (conflicting), rating not found, launch "2016–2017". Now: band 100 mi+, counter 112,882,464, 1,379,707 ratings, 4.57★ BR / 4.58★ US, listing release date 3 Apr 2018; 7th by ratings count. — [Klondike BR](https://play.google.com/store/apps/details?id=com.vizorapps.klondike&hl=pt_BR&gl=BR)
7. **FarmVille 2: Country Escape.** Earlier: #5, installs "74–127M (conflicting)". Now: band 50 mi+, counter 78,789,697 (the 127M tracker figure is not supported), 3,232,400 ratings, 4.74★ BR / 4.58★ US; it moves up to 3rd by ratings count. — [FarmVille 2 BR](https://play.google.com/store/apps/details?id=com.zynga.FarmVille2CountryEscape&hl=pt_BR&gl=BR)
8. **Family Island.** Earlier: #6, ≈69.6M installs. Now: band 50 mi+, counter 75,864,077, 1,665,263 ratings, 4.45★ BR / 4.48★ US; 4th by ratings count. — [Family Island BR](https://play.google.com/store/apps/details?id=com.MelsoftGames.FamilyIslandFarm&hl=pt_BR&gl=BR)
9. **Family Farm Adventure.** Earlier: #7, "10M+ band per AndroidRank (likely stale)". Now: the band is still 10 mi+ (counter 33,050,348) with 554,970 ratings; it drops out of the top 10 on listing metrics (13th in Table 5a). It is 38th in Brazil's Simulation top grossing. — [Family Farm Adventure BR](https://play.google.com/store/apps/details?id=com.farmadventure.global&hl=pt_BR&gl=BR)
10. **FarmVille 3.** Earlier: #8, ≈12.7M installs, 178.1K ratings, launched 4 Nov 2021. Now: band 10 mi+, counter 14,845,299, 188,374 ratings, listing release date 2 Nov 2021; well outside the top 10 (26th of 47 by ratings count). — [FarmVille 3 BR](https://play.google.com/store/apps/details?id=com.zynga.farmville3&hl=pt_BR&gl=BR)
11. **Stardew Valley.** Earlier: #9, ≈5–6.7M installs, 198.5K ratings, 4.57★, "launched at $7.99". Now: band 5 mi+, counter 7,265,589, 203,699 ratings, 4.76★ BR / 4.60★ US, price R$ 24,99 / $4.99; outside the top 10 by ratings count (24th in Table 5a) but 7th in Brazil's all-games top paid and 6th in the US. — [Stardew Valley BR](https://play.google.com/store/apps/details?id=com.chucklefish.stardewvalley&hl=pt_BR&gl=BR); [Stardew Valley US](https://play.google.com/store/apps/details?id=com.chucklefish.stardewvalley&hl=en_US&gl=US)
12. **Farming Simulator series.** Earlier: #10 "FS23, FS26", installs not found, FS26 launched 19 May 2026. Now: FS23 is in the 500 mil+ band (27,581 ratings) and FS26 Mobile in the 50 mil+ band (4,431 ratings, 3.60★ BR), listing release date 18 May 2026 — neither is top-10 by scale. The series' large-install entries are the free-to-download FS14 (100 mi+, 1,011,640 ratings) and FS16 (50 mi+, 448,088 ratings). — [FS23 BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs23.google&hl=pt_BR&gl=BR); [FS26 BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs26.google&hl=pt_BR&gl=BR); [FS14 BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs14&hl=pt_BR&gl=BR); [FS16 BR](https://play.google.com/store/apps/details?id=com.giantssoftware.fs16&hl=pt_BR&gl=BR)
13. **Missing from the earlier top 10.** Family Farm Seaside (50 mi+; 1,626,535 ratings), Farm Land (100 mi+; 852,077), Farming Simulator 14 (100 mi+; 1,011,640), Egg, Inc. (10 mi+; 1,410,843) and Dragonscapes Adventure (10 mi+; 693,085) all outrank the earlier #7–#10 on listing metrics. — Tables 1a–1c (links)
14. **My Garden Tale.** Earlier: global Android build "≈265.8K installs, 2.3K ratings". Now: band 1 mi+, counter 2,415,526, 12,161 ratings, 4.47★ BR / 4.40★ US; 26th in US Simulation top grossing and 105th in Brazil's. — [Meu Mundo do Jardim BR](https://play.google.com/store/apps/details?id=com.jxhy.official&hl=pt_BR&gl=BR); [My Garden Tale US](https://play.google.com/store/apps/details?id=com.jxhy.official&hl=en_US&gl=US)
15. **The Cozy Florist.** Earlier: "about $6M revenue on 7M installs" (all platforms). Now on Google Play: band 1 mi+, counter 3,493,290, 166,818 ratings, 4.88★ BR / 4.71★ US; 44th in Brazil's Simulation top grossing and 57th in the US. — [The Cozy Florist BR](https://play.google.com/store/apps/details?id=com.riftsky.mhg.gb.gp&hl=pt_BR&gl=BR)
16. **Farm Manager.** Earlier: "Farm Manager – 2026 (Trophy Games): ≈8.2M installs". Now: titled "Farm Manager - 2027", band 10 mi+, counter 12,084,134, 65,651 ratings; 33rd in Brazil's Simulation top grossing. — [Farm Manager - 2027 BR](https://play.google.com/store/apps/details?id=com.trophygames.farmmanager&hl=pt_BR&gl=BR)
17. **"Klondike is the top simulation game in Brazil" (undated 42matters snapshot).** Not confirmed for today: Klondike is 9th in Brazil's Simulation top grossing and absent from the 200-entry Simulation top-free list; the top-grossing #1 is Oxide: Survival Island and the highest farm-adjacent title is Heartopia at 5th. — [BR chart endpoint](https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=vyAe2&source-path=%2Fstore%2Fapps&hl=pt_BR&gl=BR&soc-app=121&soc-platform=1&soc-device=1&rt=c)
18. **Casual category page "editors' highlight" with Township and Hay Day.** Today the "Escolha dos editores: jogos" cluster holds Gardenscapes (1st) and Hay Day (2nd) but not Township, which appears in "Jogos off-line" (17th of 20). — [Casual BR](https://play.google.com/store/apps/category/GAME_CASUAL?hl=pt_BR&gl=BR)
19. **Monetization classification.** Confirmed where the earlier notes inferred it: Township has no ads label; Hay Day, Klondike, Family Island and FarmVille 2 declare ads. New: Heartopia declares no ads, and Family Farm Seaside and Farm Land declare no ads. — Table 1a (links)
20. **Launch years flagged as unverified in the earlier table.** Listing release dates: Township 8 Nov 2013; Hay Day 13 Nov 2013 (Android); FarmVille 2: Country Escape 16 Apr 2014; Family Island 18 Nov 2019; Family Farm Adventure 14 Apr 2021; Stardew Valley 13 Mar 2019. — Table 1a (links)

### Inferences
- Ratings count is the most discriminating of the three permitted metrics (the band is a coarse step and the star average clusters between 4.1 and 4.9), so it is used as the primary key; the band-first order is given alongside because it is the public download measure. Eight names are in the top 10 under either order: Township, Hay Day, Klondike Adventures, Farming Simulator 14, Farm Land, FarmVille 2: Country Escape, Family Island and Family Farm Seaside.
- Ratings count rewards age (most leaders launched 2013–2019), so it understates recent titles. Read together with grossing rank, the active commercial leaders in Brazil on 2026-11-11 are Township, Hay Day, Family Island, Heartopia and Klondike Adventures (the five farm or farm-adjacent simulations in the all-games top-grossing list), followed by Farmington, Family Farm Adventure and FarmVille 2 in their category lists.
- Farming Simulator 14, Farm Land and Harvest.io have very large install numbers relative to ratings (for example Harvest.io: 178 million counter, 216,128 ratings), which is typical of low-engagement arcade or legacy downloads; they are scale references, not design references.
- The earlier ranking was built largely on revenue estimates; the listing metrics confirm its top two and its mid-tier names (Klondike, FarmVille 2, Family Island) but not its lower half.

### Gaps
- Listing metrics cannot measure revenue or current activity; a composite "success" ranking still needs a revenue source.
- 47 farm-themed listings were read, chosen from search results and charts; a farm title outside those lists with more than about 700,000 ratings would alter positions 9–10. All farm-named apps seen with a 50 mi+ band or higher were read except Farm Heroes Super Saga (match-3).
- Whether Farm Heroes Saga (match-3), Egg, Inc. (idle clicker) or Dragonscapes (dragon-breeding adventure) count as "farm games" is a scope judgement; the table states where each was included or set aside.
- US star averages were not read for Egg, Inc., Farming Simulator 14 and several mid-table titles.

---

## 6. From the listing pages' visible user reviews on the Brazilian storefront, what are the recurring praises and complaints for the top five farm games?

### Takeaway
In the reviews Google surfaces on the Brazilian listings, the dominant complaint for the two expedition games is energy (18 of 20 Klondike reviews and 17 of 20 Family Island reviews mention it), for Township it is rising prices and the shift toward match-3, for Hay Day it is long production times and scarce expansion materials, and for Heartopia it is performance and expensive gacha; praise centres on graphics, constant events, the absence of an energy system (Hay Day) and playing with friends. The sample is small and skewed negative, so it shows what annoys players, not how many are annoyed.

### Cited Findings

**About the sample.** Each Brazilian listing page embeds 20 reviews (the page displays the first few). They are Google's selection, not a random sample: their mean star value is far below the listing average (Township 2.45 against 4.83; Family Island 2.35 against 4.45; Klondike 2.70 against 4.57; FarmVille 2 3.25 against 4.74; Heartopia 3.15 against 4.49; Hay Day 4.15 against 4.57) and many are old (Klondike: 15 from 2020 and 5 from 2022; Family Island: 19 of 20 from 2020–2022; Township: 5 of 20 from 2026; Hay Day: 4 of 20 from 2026; Heartopia: all 20 from 2026). The five games covered are the farm or farm-adjacent simulations present in Brazil's all-games top-grossing list (Township, Hay Day, Family Island, Heartopia, Klondike Adventures); FarmVille 2: Country Escape is added because it is third by ratings count. Theme counts below are keyword counts over the 20 reviews. Reviewer names are omitted. All fetched 2026-11-11.

**Township** — [Township BR](https://play.google.com/store/apps/details?id=com.playrix.township&hl=pt_BR&gl=BR)
- Theme counts (of 20): price or paying to progress 9; barn/storage and expansion materials 7; events 6; slow production 5; match-3 mini-game 5; crashes or bugs 5; social features (regattas, co-op, friends) 5.
- Complaint, prices raised: "Antes eu comprova 50 notas a R$ 10,90 e assim eu podia comprar 5 vezes as jogadas do jogo de agrupar 3. Agora custa R$ 10,90 comprar 1.000 notas e eu consigo comprar apenas mais uma vez as jogadas" (1★, 2026-08-03).
- Complaint, match-3 taking over: "o foco está em um subjogo de agrupar. Tudo gira em torno de jogo agora." (1★, 2026-04-28); "O jogo de agrupar está cada dia mais difícil e já houve vezes em que mesmo comprando mais movimentos ainda assim não consegui passar de nível" (2★, 2026-05-13).
- Complaint, offer pop-ups: "Outra coisa que incomoda bastante no jogo é a quantidade de anuncios de eventos e itens para comprar, além da obrigatoriedade de entrar no mapa quando tem evento novo." (3★, 2026-07-15).
- Complaint, slow timers: "O jogo é muito bom. Adoro as regatas. Porém é tudo muito demorado, as fábricas, o helicóptero, as plantações" (3★, 2020-08-04).
- Complaint, season pass grind: "Evento do bilhete dourado, mesmo comprando o bilhete temos que ser escravos do jogo para alcançar os benefícios." (2★, 2021-04-21).
- Praise: "O jogo em si é muito bom. Não precisa se preocupar com anúncios ou coisa do tipo." (4★, 2023-10-24); "Achei muito legal, sempre está tendo eventos." (5★, 2021-11-04).

**Hay Day** — [Hay Day BR](https://play.google.com/store/apps/details?id=com.supercell.hayday&hl=pt_BR&gl=BR)
- Theme counts (of 20): slow production 8; crashes or bugs 6; barn/silo and expansion materials 6; price 5; graphics praised 5.
- Praise, no energy: "Os níveis são infinitos, não tem energia, o que facilita e relaxa bastante." (5★, 2021-06-29).
- Praise, fair monetization: "ele não é, pelo menos ao meu ver Pay to Win, pois você não compete com ninguém e os recursos que você pode comprar são apenas reforços" (5★, 2026-04-10).
- Praise, events and guild play: "As guildas e a corrida são muito bem organizadas." (5★, 2022-12-06; 2,294 helpful votes).
- Complaint, timers and premium currency: "o tempo de produçao das coisas demora MUITO, MUITO MESMO, os diamantes sao bem dificeis de conseguir" (4★, 2026-09-15).
- Complaint, expansion materials: "as expansões, cujos itens para esta são super difíceis de conseguir, impedindo o jogador de expandir sua área." (3★, 2019-11-08).
- Complaint, player market: "nunca esteve tão difícil comprar um item. Não dá tempo nunca, simplesmente entro quando o jornal acabou de atualizar e o item já foi comprado." (5★, 2024-05-06; 2,939 helpful votes).
- Complaint, stability: "Os travamentos constantes fazem com que materiais comprados e itens do celeiro sejam perdidos" (3★, 2026-05-01).

**Family Island** — [Family Island BR](https://play.google.com/store/apps/details?id=com.MelsoftGames.FamilyIslandFarm&hl=pt_BR&gl=BR)
- Theme counts (of 20): energy 17; price or pay-to-win 8; slow production 6; graphics praised 4.
- Complaint, energy maths: "Uma pedreira média exige 54 de energia, argila 79, árvores 104, sendo que o máximo vai até 75." (1★, 2020-05-08; 507 helpful votes); "Você joga 5 min e já tem que ficar 12h esperando pra jogar dnv." (3★, 2021-03-30).
- Complaint, events need money: "a maioria dos eventos vai exigir verdadeiras fortunas para que você conclua eles." (1★, 2022-07-20); "A historinha é legal, mas é um clássico pay to win." (3★, 2020-10-11).
- Complaint, a disruptive update: "minha ilha natal mudou sem aviso prévio, muitas coisas produzidas foram simplesmente apagadas" (1★, 2025-02-13).
- Praise: "O jogo é maravilhoso, o design das ilhas e dos personagens é muito bonito que parece até vindo de um filme de animação." (4★, 2020-08-07).

**Heartopia** — [Heartopia BR](https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&hl=pt_BR&gl=BR)
- Theme counts (of 20): crashes, overheating or poor optimisation 10; price 7; graphics praised 6; events 5; gacha or random draws 5.
- Praise: "é ótimo para fazer amizades principalmente pelo fato de não precisar conversar diretamente com os outros jogadores." (4★, 2026-02-19); "me divirto muito com minhas amigas, pois tem um gráfico bonito e é um mundo cheio de pequenas surpresas." (4★, 2026-10-04); "não tem propagandas" (5★, 2026-11-01).
- Complaint, performance: "trava muito, além de fazer o celular esquentar horrores, as coisas são caras demais, principalmente das colaborações" (2★, 2026-04-27); "o jogo é muito mal otimizado para dispositivos móveis" (3★, 2026-09-15).
- Complaint, price and gacha: "Não existem itens bonitos de se adquirir sem gastar dinheiro. - Os preços são ridiculamente caros" (1★, 2026-11-02; 158 helpful votes); "o passe é muito caro, quase 30 reais" (4★, 2026-11-01); "os prêmios do passe poderiam ser bem melhores considerando o valor que brasileiros tem que pagar em jogos." (2★, 2026-10-28).
- Complaint, content running thin: "O jogo tá repetitivo e muita gente que jogava desde o primeiro beta, estão parando." (3★, 2026-10-21).

**Klondike Adventures** — [Klondike BR](https://play.google.com/store/apps/details?id=com.vizorapps.klondike&hl=pt_BR&gl=BR)
- Theme counts (of 20): energy 18; slow production 10; price 6; graphics praised 4.
- Complaint, energy: "O jogo é bom. Mas o GRANDE PROBLEMA é a energia." (1★, 2022-05-06; 754 helpful votes); "não consigo jogar mais que dez minutos. Pois, as energias acabam rapidamente, mesmo utilizando todas as maneiras de obter mais." (3★, 2020-04-20); "coletar uma árvore requer 55 de energia, sendo a energia total 60." (5★, 2020-10-14).
- Complaint, misleading advertising: "O jogo é interessante, mas muito diferente da propaganda." (4★, 2020-03-18).
- Request for more ways to earn energy, including video: "acho que deveria ter mais formas de conseguir energia rápido, com vídeos, joguinhos" (3★, 2020-06-16).
- Praise: "O jogo é legal, muito criativo e o gráfico é ótimo." (3★, 2022-10-13).

**FarmVille 2: Country Escape** — [FarmVille 2 BR](https://play.google.com/store/apps/details?id=com.zynga.FarmVille2CountryEscape&hl=pt_BR&gl=BR)
- Theme counts (of 20): crashes, bugs or connection problems 11; barn/storage limits 10; events 7; slow production 6; social features (co-op, friends) 5.
- Praise: "É um jogo offline e online, com diversos tipos diferentes de tarefas para executar" and "Tem também a opção de interagir com outros jogadores através da cooperativa e pedir ajuda" (5★, 2020-12-23; 828 helpful votes).
- Complaint, storage: "O jogo fica parado por conta de que não tem espaço no galpão." (1★, 2022-07-28; 667 helpful votes); "esses espaço que sempre falta, silos, celeiro e armazém marinho!" (2★, 2026-07-24).
- Complaint, forced premium currency: "o jogo te obriga a comprar chaves." (3★, 2020-01-25).

### Inferences
- The same four friction points recur across the genre in Brazil: (1) energy that runs out in minutes (expedition games), (2) storage that fills with the very materials needed to expand it (Hay Day, FarmVille 2, Township), (3) production timers that lengthen with level, and (4) prices or event goals that feel out of reach without spending. A new game can differentiate on all four with design choices that cost little: no energy on the core farm, a separate inventory for upgrade materials, and event goals reachable without payment.
- Brazilian reviewers explicitly praise the absence of energy (Hay Day) and of advertising (Township, Heartopia), and one Klondike reviewer asks for videos as a way to earn energy. This supports opt-in rewarded ads tied to things players already want (energy, speed-ups) rather than interruptive formats.
- Price sensitivity is expressed in reais and compared with local income ("o valor que brasileiros tem que pagar em jogos"); a pass near R$ 30 is called expensive. Together with section 4 this argues for a locally priced pass and sub-R$ 5 entry offers.
- Heartopia's performance complaints (overheating, crashes; one reviewer says phones need 12 GB of RAM or more) indicate that technical optimisation for mid-range Android devices is a competitive opening for a 3D multiplayer game in Brazil.
- Township's 2026 reviews show long-time players resenting the pivot toward match-3 and tighter currency; a farm-first game can position itself for that audience.

### Gaps
- Only the 20 reviews embedded per listing were read; newest-first or rating-filtered views need the page's scripts, which could not run. The sample over-represents long, critical, highly up-voted reviews and, for Klondike and Family Island, reviews from 2020–2022.
- No US reviews were analysed.
- Developer replies were not analysed.
- Family Farm Seaside, Farm Land and Farmington reviews were fetched with their pages but not analysed.
- Keyword counts are approximate (a review can mention a theme in passing or praise it).
