# Live check of farm games on CrazyGames and Poki (primary-source snapshot, 2026-11-11)

> Research conditions (read first). Every data point below was read directly from pages on `www.crazygames.com` and `poki.com` on 2026-11-11 (13:33 to 13:48 UTC), with plain `curl` and by parsing the data the pages embed (`__NEXT_DATA__` and JSON-LD on CrazyGames, `window.INITIAL_STATE` on Poki). 135 requests in total, about one per second. Limits that bound every statement: (a) both portals served the session as a logged-out desktop visitor located in the US (CrazyGames `countryCode: "US"`, Poki `geo: "US"`), including on the Brazilian Portuguese URLs, so a visitor in Brazil may see a different order; (b) CrazyGames loads the full tag list with JavaScript from `builds.crazygames.com`, which the session network refused (HTTP 403 on CONNECT, one attempt, not retried), so only the 15 games the server embeds per tag page were readable; (c) image, video and game-file hosts were not reachable, so no game was seen or played: "3D", "multiplayer" and similar labels are the portal's or developer's own tags and descriptions, and nothing here judges visual quality; (d) `developer.crazygames.com`, `docs.crazygames.com`, `developers.poki.com` and `sdk.poki.com` are other hosts and were not read; (e) both `robots.txt` files disallow search/query URLs, so internal search was not used; the sitemaps were used instead. Counts (likes, votes, plays) moved by a few units between fetches minutes apart. Raw downloads and parsing scripts are in the session scratchpad (`/tmp/claude-0/-home-user-farmSimulator/75f055d1-b764-53b5-8075-88db93a673a3/scratchpad/portals_raw` and `.../portals_scripts`).

## 1. Which games appear, in order, on the farm pages of CrazyGames and Poki (English and Brazilian Portuguese)?

### Takeaway
CrazyGames' "Farming" tag holds 97 games and its server-rendered top 15 is led by merge and expedition-farm games (Mergest Kingdom, Farm Merge Valley, Country Life Meadows); Poki's "Farm Games" category declares 46 games and lists 32, led by Harvest Simulator, Grow My Farm and Little Farm World. On both portals the Brazilian Portuguese page showed the same games in the same order as the English page.

### Cited Findings

#### Page URLs and list lengths
- CrazyGames English farm page: tag "Farming", page title "Farming Games"; breadcrumb Games > Management > Farming — [CrazyGames /t/farming](https://www.crazygames.com/t/farming)
- CrazyGames Brazilian Portuguese farm page: tag "Fazenda", page title "Jogos de Fazenda", canonical URL `/br/t/farming` — [CrazyGames /br/t/farming](https://www.crazygames.com/br/t/farming)
- The tag chip on game pages shows "Farming 97", i.e. 97 games carry the tag — [Farm Merge Valley page](https://www.crazygames.com/game/farm-merge-valley). The sitemap lists two pages for the tag (`/t/farming` and `/t/farming/2`) — [CrazyGames sitemap](https://www.crazygames.com/en/sitemap)
- The tag page embeds only `topGames` (15 items), `topMobileGames` (10 items) and one `linkBoostedGames` item (Growden.io), with the flag `shouldFetchGamesOnClient: true`; page 2 embeds no games — [CrazyGames /t/farming](https://www.crazygames.com/t/farming); [CrazyGames /t/farming/2](https://www.crazygames.com/t/farming/2)
- CrazyGames has no separate "farm", "garden", "harvest" or "tractor" tag: the sitemap lists 199 tag slugs and 16 categories; the farm-relevant ones are `farming`, `grow`, `animal`, `management`, `tycoon`, `idle`, `mmo1`, `co-op`, `multiplayer`, `with-friends`, `3d` — [CrazyGames sitemap](https://www.crazygames.com/en/sitemap)
- Poki English farm page: category "Farm Games" (id 118, type "theme"), `game_count: 46`, but 32 games in the list served to a US desktop visitor — [Poki /en/farm](https://poki.com/en/farm)
- Poki Brazilian Portuguese farm page: "Jogos de Fazenda", slug `fazenda`, same `game_count: 46` and the same 32 games in the same order — [Poki /br/fazenda](https://poki.com/br/fazenda)
- The Poki Brazilian home page does not mention "fazenda" at all: the farm category is not among the home shelves (Populares, Novos, Multiplayer, Habilidade, Educativo, Carros, Ação, .io, Luta, Puzzle, Aventura, Plataforma, Beleza) and no farm-themed title is in the 145-game home grid — [Poki /br](https://poki.com/br)
- Poki's related categories for the farm page, with declared sizes: Simulation 498, Food 122, Horse 9, Tycoon 132, Animal 281, Mouse 432, 3D 598, Idle 223, Cozy 129, Games for Girls 237. Poki also has "Tractor Games" (12), "Co-op Games" (42), "Multiplayer Games" (198), ".io Games" (63) and "Merge Games"; it has no garden or harvest category — [Poki /en/farm](https://poki.com/en/farm); [Poki categories sitemap](https://poki.com/en/sitemaps/categories.xml)

#### CrazyGames "Farming" tag, top 15 in page order (English and Brazilian Portuguese pages identical)
Order, category, likes and plays are from the tag page payload — [CrazyGames /t/farming](https://www.crazygames.com/t/farming); [CrazyGames /br/t/farming](https://www.crazygames.com/br/t/farming). The page's own FAQ block ("What are the most popular Farming Games?") lists the first ten in the same order.

| Pos | Game | Portal category | Release year | Likes | Plays | IAP flag | Mobile |
|---|---|---|---|---|---|---|---|
| 1 | Mergest Kingdom | Puzzle | 2021 | 135,515 | 23,746,084 | yes | yes |
| 2 | Farm Merge Valley | Puzzle | 2023 | 126,561 | 27,944,127 | yes | yes |
| 3 | Country Life Meadows | Simulation | 2024 | 14,893 | 2,877,467 | yes | no |
| 4 | Tropical Merge | Puzzle | 2021 | 56,361 | 11,058,698 | yes | yes |
| 5 | Stone Grass: Mowing Simulator | Arcade | 2025 | 418,942 | 17,032,689 | yes | yes |
| 6 | Castle Craft | Puzzle | 2024 | 31,911 | 5,651,836 | yes | yes |
| 7 | The MachinEGG | Clicker | 2026 | 29,536 | 1,589,023 | yes | yes |
| 8 | Farland | Simulation | 2026 | 1,356 | 215,248 | yes | no |
| 9 | Hedgies | Simulation | 2025 | 13,065 | 3,760,955 | yes | yes |
| 10 | Lumber Harvest: Tree Cutting Game | Arcade | 2025 | 94,659 | 5,829,744 | no | yes |
| 11 | Growden.io | Simulation | 2025 | 340,304 | 21,482,019 | no | yes |
| 12 | Farm Ring Idle | Clicker | 2025 | 54,522 | 5,269,654 | yes | yes |
| 13 | Driftwood Isles | Adventure | 2026 | 1,086 | 52,085 | no | no |
| 14 | The MOO Factory | Clicker | 2026 | 1,762 | 152,871 | no | yes |
| 15 | Project Restoration | Simulation | 2025 | 6,211 | 1,572,697 | yes | yes |

- Mobile top 10 on the same page: Mergest Kingdom, Farm Merge Valley, The MachinEGG, Tropical Merge, Hedgies, Growden.io, Stone Grass: Mowing Simulator, Magic School, Lumber Harvest, Rob a Garden — [CrazyGames /t/farming](https://www.crazygames.com/t/farming)
- The page's FAQ block names Growden.io as the answer to "What are some underrated Farming Games?" — [CrazyGames /t/farming](https://www.crazygames.com/t/farming)
- Stone Grass, Lumber Harvest and Farm Ring Idle carry the portal's "originals" label (`isOriginal: true`) — [CrazyGames /t/farming](https://www.crazygames.com/t/farming)

#### Poki "Farm Games", all 32 listed games in page order (English and Brazilian Portuguese pages identical)
Order and developer are from the category payload — [Poki /en/farm](https://poki.com/en/farm); [Poki /br/fazenda](https://poki.com/br/fazenda).

1 Harvest Simulator (Camu); 2 Grow My Farm (emolingo games); 3 Little Farm World (Tapfire); 4 Olly the Paw (7Spot Games); 5 Grass Cutter (Kodachi Games); 6 Vortella's Dress Up (Devortel); 7 Mine and Dig (Sablo Studio); 8 Apple Knight: Farmers Market (Limitless); 9 Tiny Farm (TokTok); 10 Bunny Farm (Angelo Studio); 11 Monkey Mart (TinyDobbins); 12 CombiMon (Entrevero Games); 13 Cow Bay (7Spot Games); 14 Game of Farmers (AppyApp); 15 Village Builder (Project GD); 16 Harvest Loop (Kreativitas); 17 Quack Quest (GigaMegaGames); 18 Crazy Pig Simulator (CyberGoldFinch); 19 Chicky Farm (PT New Games Plus); 20 Farm and Mine (Airapport); 21 Pixel Realms (Yury Grigoryev); 22 Farm Clash 3D (OOO Frivei Interaktiv); 23 Misland (Seal Unicorn Games); 24 Astro Rancher (monoinyo); 25 Chef Bacon (SnoutUp Games); 26 Idle Cowshed (Beedo Games); 27 Village Craft (AlexSo); 28 Horse Shoeing (NoPowerup); 29 Veggie Merge (AJ Ordaz); 30 Idle Farming Business (MarketJS); 31 Jungle Friends (OnRush Studio); 32 Harvest Hollow (HZ Games).

#### Farm-themed titles in related tags and categories
- CrazyGames, position of farm titles inside the server-rendered top 15 of other pages: Management tag: Farm Merge Valley 1, Country Life Meadows 2, Hedgies 6, Project Restoration 13, The Farmers 15 — [/t/management](https://www.crazygames.com/t/management). Simulation category: Country Life Meadows 2, Farland 5, Hedgies 6, Growden.io 10 — [/c/sim](https://www.crazygames.com/c/sim). Clicker category: The MachinEGG 3, Farm Ring Idle 6, The MOO Factory 11, Hay Factory Tycoon 15 — [/c/clicker](https://www.crazygames.com/c/clicker). Idle tag: The MachinEGG 6 — [/t/idle](https://www.crazygames.com/t/idle). MMO tag: Country Life Meadows 1 — [/t/mmo1](https://www.crazygames.com/t/mmo1). Grow tag: Farland 1, Growden.io 3, The Farmers 7 — [/t/grow](https://www.crazygames.com/t/grow). Tycoon tag: Hay Factory Tycoon 3 — [/t/tycoon](https://www.crazygames.com/t/tycoon)
- CrazyGames, no farm title in the top 15 of: the "With friends"/Multiplayer page, the 3D tag, the Co-op tag, the .io category. Growden.io appears only in secondary lists embedded in those pages (`linkBoostedGames` position 6 of 8 on the multiplayer page and 5 of 9 on the 3D page; `fillerGames` position 12 of 12 on the co-op page) — [/multiplayer](https://www.crazygames.com/multiplayer); [/t/3d](https://www.crazygames.com/t/3d); [/t/co-op](https://www.crazygames.com/t/co-op); [/c/io](https://www.crazygames.com/c/io)
- Poki, position of farm titles in other category lists: Tycoon (93 listed): Monkey Mart 7, Tiny Farm 17, Village Builder 27, Apple Knight: Farmers Market 38, Idle Farming Business 43, Grow My Farm 44, Bunny Farm 50, Game of Farmers 58, Farm and Mine 64, Cow Bay 75, Harvest Hollow 92 — [Poki /en/tycoon](https://poki.com/en/tycoon). Simulation (first 300 of 498): Harvest Simulator 3, Tiny Farm 29, Little Farm World 77, Monkey Mart 103, Grow My Farm 292 — [Poki /en/simulation](https://poki.com/en/simulation). Multiplayer (178 listed): Grow My Farm 97, Farm Clash 3D 148, Cow Castle 171 — [Poki /en/multiplayer](https://poki.com/en/multiplayer). 3D (first 300 of 598): Harvest Simulator 177, Village Craft 220, Harvest Loop 229 — [Poki /en/3d](https://poki.com/en/3d). Idle (176 listed): Monkey Mart 47, Idle Farming Business 64, Cow Bay 77, Grow My Farm 138 — [Poki /en/idle](https://poki.com/en/idle). Tractor (11 listed): Harvest Simulator 1 — [Poki /en/tractor](https://poki.com/en/tractor). .io (46 listed) and Co-op (41 listed): no farm title — [Poki /en/io](https://poki.com/en/io); [Poki /en/co-op](https://poki.com/en/co-op)
- Poki "Popular Games" (99 listed): Monkey Mart 53, Little Farm World 70; no other farm title — [Poki /en/popular](https://poki.com/en/popular)

#### Farm-named games found through the sitemaps (not all tagged as farming)
- CrazyGames' English sitemap lists 4,703 game URLs. Farm-named slugs include `farm-merge-valley`, `the-farmer`, `the-farmers`, `farm-family`, `farm-life`, `farming-life`, `farm-clash-3d`, `harvest-io---3d-farming-arcade`, `farming-tycoon-3d-diu`, `my-perfect-farm`, `harvest-land-tycoon`, `royal-farm-mnl`, `homesteads-dream-farm-fkk`, `yellowstone-ranch`, `ranch-adventures`, `farm-squad`, `farm-drones`, `idle-farming-business`, `farm-merge`, `farm-merge-market`, `farm-mayhem-merge`, `happyville-merge-farm-gtu`, `happy-farm`, `my-chicken-farm`, `shepherd-farm`, `sophie-s-farm`, `western-farm`, `loop-farmer-idle`, `loop-farm`, `circle-farm`, `patchwork-farm`, `farm-idle-cut-crop`, `revolution-farm-idle`, `garden-idle`, `hay-factory-tycoon`, `harvesting-season`, `plants-vs-brainrots`, `rob-a-garden`, `grow-a-garden---growden-io` — [CrazyGames sitemap](https://www.crazygames.com/en/sitemap)
- Poki's English games sitemap lists 1,506 game URLs. Farm-named slugs: `little-farm-world`, `harvest-loop`, `veggie-merge`, `grow-my-farm`, `cozy-garden-design`, `cow-castle`, `ranch-ufo`, `harvest-simulator`, `bunny-farm`, `apple-knight-farmers-market`, `farm-and-mine`, `idle-cowshed`, `chicky-farm`, `village-craft`, `cow-bay`, `monkey-mart`, `village-builder`, `game-of-farmers`, `crazy-pig-simulator`, `chicken-merge`, `chicken-merge-2` — [Poki games sitemap](https://poki.com/en/sitemaps/games.xml)
- Neither sitemap contains a slug for Big Farm, Farmerama, Taonga, Klondike (the farm game), Sunflower Land, FarmVille, Township or Hay Day; Farm Merge Valley, Mergest Kingdom, Growden.io, Country Life Meadows, Tropical Merge and Hedgies are on CrazyGames but not in Poki's sitemap; Monkey Mart, Harvest Simulator, Grow My Farm, Cow Bay and Game of Farmers are on Poki but not in CrazyGames' sitemap — [CrazyGames sitemap](https://www.crazygames.com/en/sitemap); [Poki games sitemap](https://poki.com/en/sitemaps/games.xml)

### Inferences
- The order on a CrazyGames tag page is the portal's default ranking, not a likes or plays ranking: Farland (215,248 plays) sits above Growden.io (21.5M plays). The same relative order appears in the portal-wide "All Games" list (see question 4), so the tag order is the global order filtered by tag. The ranking rule is not stated on the pages.
- CrazyGames' "Farming" tag is applied loosely. Of the top 15, at least six are not farms in the usual sense: three kingdom/island/castle merge games, a lawn-mowing game, a tree-cutting game and an island survival game.
- Poki's farm list is also loose: Vortella's Dress Up (a dress-up game), Mine and Dig, Grass Cutter, Crazy Pig Simulator, Horse Shoeing and Village Builder are in it.
- The 14 Poki farm games that are counted (46) but not listed (32) are probably filtered by device or country; the page does not say.

### Gaps
- Positions 16 to 97 of the CrazyGames farming tag could not be read (list is loaded by JavaScript from a blocked host). Farming-tagged games found by other routes are listed in question 2, but without a position.
- The lists as served to a visitor located in Brazil, to a mobile device, or to a logged-in user were not observed. Only the URL locale was changed.
- Which 14 games complete Poki's count of 46 is unknown.

## 2. What does each game page state for the top 20 farm games on each portal?

### Takeaway
CrazyGames game pages state developer, a 0-10 rating "based on last 6 months", like and dislike counts, release and update month, game engine, platforms, tags, an in-app-purchase flag and a cloud-save flag; Poki game pages state developer, up and down votes with a 1-5 rating, release and version dates, device availability and categories, but no play count, no engine and no purchase information. The leading CrazyGames farm titles are long-running free-to-play games with purchases and cloud saves that were updated in the last three months; most Poki farm titles are small ad-funded idle or tycoon games.

### Cited Findings

#### CrazyGames: fields available
- A game page shows a summary table with Developer, Rating "(based on last 6 months)", Votes ("127K likes and 23K dislikes"), Released, Last Updated, Game engine, Platform(s), Orientation and Wiki pages; the embedded data adds exact `upvotes`/`downvotes`, `hasIap`, `userProgressionSaveMessage` ("cloud" or "local"), `multiplayerOptions` (min/max lobby size, `isMultiplayer`, `supportsInstantJoin`), `hasLeaderboard`, store links and tags. The JSON-LD `ratingCount` equals likes plus dislikes (Farm Merge Valley: 149,762) — [Farm Merge Valley page](https://www.crazygames.com/game/farm-merge-valley)
- Play counts (`totalPlays`) appear only in list payloads (tag and category pages), not on the game page — [CrazyGames /t/farming](https://www.crazygames.com/t/farming)

#### CrazyGames: top 15 of the Farming tag (each row sourced from the linked game page; plays from the tag page)
"Rank" is the position in the portal's All Games list (first 200 read; see question 4). "—" in the multiplayer column means the page's multiplayer fields are empty.

| Pos | Game | Developer | Rating | Likes / dislikes | Plays | Released | Last updated | Game engine | Platforms | IAP | Save | Multiplayer flag | Rank | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | [Mergest Kingdom](https://www.crazygames.com/game/mergest-kingdom) | Vanuplay Innovations Inc | 8.6 | 135,515 / 22,727 | 23,746,084 | May 2021 | August 2026 | Externally hosted (iframe) | Browser (desktop, mobile, tablet), App Store (iOS, Android) | yes | cloud | — | 11 | Mobile, Premium Perks, Farming, Building, Match 3, Can't stop playing, Mouse, Mission, Merge |
| 2 | [Farm Merge Valley](https://www.crazygames.com/game/farm-merge-valley) | not shown (support link points to coolgames.com) | 8.1 | 126,561 / 23,201 | 27,944,127 | August 2023 | November 2026 | HTML5 | Browser (desktop, mobile, tablet) | yes | cloud | — | 15 | Mobile, Premium Perks, Farming, Business, Can't stop playing, Mouse, Management, Collect, Casual, Merge |
| 3 | [Country Life Meadows](https://www.crazygames.com/game/country-life-meadows) | BeeTree Games | 8.5 | 14,893 / 2,619 | 2,877,467 | December 2024 | January 2026 | Externally hosted (iframe) | Browser (desktop-only) | yes | cloud | — | 38 | Premium Perks, Farming, Business, MMO, 2D, Can't stop playing, Animal, Mouse, Management, Casual |
| 4 | [Tropical Merge](https://www.crazygames.com/game/tropical-merge) | Vanuplay Innovations Inc | 8.3 | 56,361 / 10,507 | 11,058,698 | November 2021 | August 2026 | Externally hosted (iframe) | Browser (desktop, mobile, tablet), App Store (iOS, Android) | yes | cloud | — | 50 | Mobile, Premium Perks, Farming, Match 3, Can't stop playing, Mouse, Mission, Merge |
| 5 | [Stone Grass: Mowing Simulator](https://www.crazygames.com/game/stone-grass-mowing-simulator) | FreePlay LLC | 9.1 | 418,945 / 46,687 | 17,032,689 | April 2025 | August 2025 | Unity 2021 | Browser (desktop, mobile, tablet), App Store (iOS, Android) | yes | cloud | — | 54 | Mobile, 5-minute fun, Top-Down, Relaxing, Farming, Incremental, Collect, Casual |
| 6 | [Castle Craft](https://www.crazygames.com/game/castle-craft) | Vanuplay Innovations Inc | 8.4 | 31,913 / 5,477 | 5,651,836 | October 2024 | August 2026 | Externally hosted (iframe) | Browser (desktop, mobile, tablet), App Store (Android) | yes | cloud | — | 55 | Mobile, Premium Perks, Farming, Building, Match 3, Can't stop playing, Mission, Merge |
| 7 | [The MachinEGG](https://www.crazygames.com/game/the-machinegg) | JC | 9.3 | 29,546 / 2,269 | 1,589,023 | June 2026 | November 2026 | HTML5 | Browser (desktop, mobile, tablet), CrazyGames App (iOS, Android), App Store (Android), Steam | yes | cloud | — | 70 | Mobile, Pixel, Farming, Leaderboards, Incremental, Mouse, Casual, Idle |
| 8 | [Farland](https://www.crazygames.com/game/farland-farm-village) | QS Games | 8.9 | 1,356 / 174 | 215,248 | September 2026 | not shown | Externally hosted (iframe) | Browser (desktop-only), App Store (iOS, Android) | yes | cloud | no (flag false) | 86 | Grow, Premium Perks, Farming, 2D, Mouse, Mission |
| 9 | [Hedgies](https://www.crazygames.com/game/hedgies) | Games Extras | 8.3 | 13,065 / 2,139 | 3,760,955 | April 2025 | April 2025 | Externally hosted (iframe) | Browser (desktop, mobile, tablet) | yes | cloud | — | 109 | Mobile, Point and Click, Premium Perks, Farming, Building, Can't stop playing, Mouse, Management |
| 10 | [Lumber Harvest: Tree Cutting Game](https://www.crazygames.com/game/lumber-harvest-tree-cutting-game) | FreePlay LLC | 9.2 | 94,639 / 8,023 | 5,829,744 | June 2025 | June 2025 | Unity 2022 | Browser (desktop, mobile, tablet), CrazyGames App (iOS, Android), App Store (iOS, Android) | no | cloud | — | 129 | Mobile, Relaxing, Farming, Incremental, Collect, Casual |
| 11 | [Growden.io](https://www.crazygames.com/game/grow-a-garden---growden-io) | LXV | 9.0 | 340,283 / 33,313 | 21,482,019 | September 2025 | November 2025 | Externally hosted (iframe) | Browser (desktop, mobile, tablet), CrazyGames App (iOS, Android) | no | cloud | yes (lobby 2-6) | 143 | Grow, Meme & bloxy, Mobile, 3D, Farming, Building, With friends, Multiplayer, Collect, Casual |
| 12 | [Farm Ring Idle](https://www.crazygames.com/game/farm-ring-idle) | Neko | 9.0 | 54,522 / 5,514 | 5,269,654 | November 2025 | November 2026 | Unity 6 | Browser (desktop, mobile, tablet) | yes | cloud | — | 153 | Mobile, Deep progress, Farming, Leaderboards, 2D, Incremental, Mouse, Idle |
| 13 | [Driftwood Isles](https://www.crazygames.com/game/driftwood-isles) | davidelvar | 9.5 | 1,078 / 58 | 52,085 | October 2026 | November 2026 | HTML5 | Browser (desktop-only) | no | cloud | — | 185 | 3D, Farming, Building, Fishing, Survival, Can't stop playing, Collect, Crafting |
| 14 | [The MOO Factory](https://www.crazygames.com/game/the-moo-factory-dzw) | SramyDEV | 9.2 | 1,757 / 145 | 152,871 | September 2026 | November 2026 | HTML5 | Browser (desktop, mobile, tablet), CrazyGames App (iOS, Android) | no | cloud | — | 197 | Mobile, Pixel, Farming, Incremental, Mouse, Idle |
| 15 | [Project Restoration](https://www.crazygames.com/game/project-restoration-axt) | not shown | 8.6 | 6,211 / 1,028 | 1,572,697 | July 2025 | September 2026 | Externally hosted (iframe) | Browser (desktop, mobile, tablet) | yes | cloud | — | >200 | Mobile, Top-Down, Premium Perks, Farming, Building, Can't stop playing, Mouse, Management, Multiplayer, Casual, Mission, Robot |

#### CrazyGames: other farm titles inspected (position in the tag list unknown; sorted by likes)
"n/s" = play count not shown on any page read.

| List | Game | Developer | Rating | Likes / dislikes | Plays | Released | Last updated | Game engine | IAP | Save | Farming tag | Other tags of note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| mobile top 10, pos 8 | [Magic School](https://www.crazygames.com/game/magic-school) | WEBBUSTERS | 8.4 | 6,093 / 1,147 | 715,832 | March 2026 | April 2026 | Cocos | yes | cloud | yes | Premium Perks, Merge, Match 3 |
| mobile top 10, pos 10 | [Rob a Garden](https://www.crazygames.com/game/rob-a-garden) | Thomas Tschinkel | 9.2 | 3,001 / 266 | 164,821 | October 2026 | November 2026 | HTML5 | no | cloud | yes | 3D, Obby, Leaderboards, Idle |
| not in top 15 | [The Farmer](https://www.crazygames.com/game/the-farmer) | not shown in table (text: "developed by w_w") | 8.4 | 48,614 / 9,446 | n/s | August 2020 | not shown | Ruffle (Flash) | no | local | yes | Management, Flash |
| not in top 15 | [Yellowstone Ranch](https://www.crazygames.com/game/yellowstone-ranch) | Izyplay Game Studio | 9.5 | 18,960 / 1,202 | n/s | May 2023 | June 2023 | Unity 2021 | no | local | yes | 3D, Top-Down, Animal (desktop-only) |
| not in top 15 | [Farm Family](https://www.crazygames.com/game/farm-family) | FreePDA | 8.6 | 18,866 / 3,190 | n/s | March 2023 | not shown | Unity 2021 | no | cloud | yes | Business, Management, Idle |
| not in top 15 | [Harvest.io – 3D Farming Arcade](https://www.crazygames.com/game/harvest-io---3d-farming-arcade) | Azur Games | 8.7 | 8,012 / 1,190 | n/s | August 2026 | not shown | HTML5 | no | cloud | yes | 3D, Top-Down, Snake (.io category) |
| not in top 15 | [Juice Factory - Fruit Farm](https://www.crazygames.com/game/juice-factory---fruit-farm-3d-sel) | Sablo Studio | 8.7 | 6,138 / 929 | n/s | July 2025 | October 2025 | Unity 2022 | no | cloud | yes | 3D, Tycoon, Idle |
| not in top 15 | [Homesteads: Dream Farm](https://www.crazygames.com/game/homesteads-dream-farm-fkk) | not shown | 8.5 | 5,815 / 977 | n/s | June 2025 | October 2026 | Externally hosted (iframe) | yes | cloud | yes | Business, Management |
| not in top 15 | [The Farmers](https://www.crazygames.com/game/the-farmers) | QS Games | 8.7 | 5,280 / 680 | 662,695 | September 2025 | December 2025 | Externally hosted (iframe) | yes | cloud | yes | Premium Perks, Grow (desktop-only) |
| not in top 15 | [Farming Tycoon 3D](https://www.crazygames.com/game/farming-tycoon-3d-diu) | Mango Gamez | 9.1 | 5,042 / 577 | n/s | October 2025 | not shown | Unity 2022 | no | cloud | yes | 3D, Top-Down, Idle |
| not in top 15 | [Farming Life](https://www.crazygames.com/game/farming-life) | not shown | 8.9 | 3,692 / 741 | n/s | May 2024 | not shown | HTML5 | no | cloud | yes | Relaxing, Casual |
| not in top 15 | [My Perfect Farm](https://www.crazygames.com/game/my-perfect-farm) | Tapfire | 8.9 | 2,873 / 356 | n/s | May 2026 | October 2026 | Unity 6 | no | cloud | yes | 3D, Relaxing, Management |
| not in top 15 | [Royal Farm](https://www.crazygames.com/game/royal-farm-mnl) | not shown | 8.6 | 2,359 / 376 | n/s | December 2025 | January 2026 | Unity 6 | no | cloud | yes | 2D, Relaxing |
| not in top 15 | [Farm Drones](https://www.crazygames.com/game/farm-drones) | LeimurGames | 9.2 | 884 / 74 | n/s | May 2026 | not shown | HTML5 | no | cloud | yes | 2D, Incremental, Idle |
| not in top 15 | [Harvest Land Tycoon](https://www.crazygames.com/game/harvest-land-tycoon) | Ahad Javed | 8.9 | 823 / 101 | n/s | May 2026 | July 2026 | Unity 6 | no | cloud | yes | 3D, Top-Down, Business |
| not in top 15 | [Farm Life](https://www.crazygames.com/game/farm-life) | not shown | 9.0 | 735 / 101 | n/s | April 2026 | April 2026 | Unity 6 | no | cloud | yes | Top-Down, Business |
| not in top 15 | [Farm Squad](https://www.crazygames.com/game/farm-squad) | Hamada | 8.8 | 157 / 21 | n/s | October 2026 | not shown | Unity 6 | no | cloud | yes | 3D, Tycoon |
| farm-named, no Farming tag | [Farm Clash 3D](https://www.crazygames.com/game/farm-clash-3d) | Freeway Interactive | 9.0 | 4,637 / 494 | n/s | January 2019 | not shown | HTML5 | no | cloud | no | 3D, Third Person Shooter, Multiplayer |
| farm-named, no Farming tag | [cowz.io](https://www.crazygames.com/game/cowz-io) | justin | 9.0 | 6,239 / 641 | n/s | June 2025 | September 2026 | Externally hosted (iframe) | no | cloud | no | 2D, With friends, Multiplayer (lobby 2-40, instant join) |
| farm-named, no Farming tag | [Farmer Challenge Party](https://www.crazygames.com/game/farmer-challenge-party) | RHM Interactive | 8.8 | 6,672 / 1,075 | n/s | August 2022 | April 2023 | HTML5 | no | local | no | 2 Player, 2D |
| farm-named, no Farming tag | [Plants vs Brainrots](https://www.crazygames.com/game/plants-vs-brainrots) | not shown | 9.2 | 11,642 / 1,200 | n/s | November 2025 | December 2025 | HTML5 | no | cloud | no | Defense, 2D, Idle |
| farm-named, no Farming tag | [Idle Dino Farm Tycoon Simulator 3D](https://www.crazygames.com/game/idle-dino-farm-tycoon-3d) | 4U Games | 9.2 | 29,608 / 2,646 | n/s | November 2023 | November 2023 | Unity 2021 | no | cloud | no | Tycoon, Top-Down |
| farm-named, no Farming tag | [Ranch Adventures](https://www.crazygames.com/game/ranch-adventures) | HG POINT LTD | 8.2 | 4,603 / 891 | n/s | December 2024 | October 2026 | Externally hosted (iframe) | yes | cloud | no | Match 3 |

#### CrazyGames: what the player does (quotes from each game page linked above)
- Mergest Kingdom: "a merge puzzle and match-3 game where you create your kingdom by combining items in threes. Match resources to unlock new items, complete quests, and grow your land."
- Farm Merge Valley: "a puzzle business farming game where you merge various animals and objects to upgrade them. Grow crops and add animals to your farm while expanding to exciting new lands." Also: "When your animals or vegetables produce output, you can use the product to manufacture goods to sell for money."
- Country Life Meadows: "Cultivate crops, expand your business, and manage a skilled team." Also: "Team up with other players in the farming co-op, trade at the Market, and send Wedding Doves to special events." Feature list: "Farming co-op with shared goals and player trading." and "Neighbor system with valuable gifts and faster progression."
- Tropical Merge: "match and combine resources in three groups to craft exciting new items."
- Stone Grass: "you take control of a powerful mower and transform wild fields into perfectly trimmed landscapes."
- Castle Craft: "a mystical adventure puzzle game where you merge resources while looking for Fiona's missing husband, Michael."
- The MachinEGG: "a relaxing idle clicker game where eggs are your greatest treasure. Grow your farm, automate production, and see if you can earn enough to retire."
- Farland: "a free online Viking farming game where you build your own settlement in a fantasy world"; it "blends crop growing, town construction, and story-driven adventure."
- Hedgies: "a hardworking hedgehog transforms an abandoned plot into a thriving homestead. Grow crops, craft goods, and master skills like cooking and fishing."
- Lumber Harvest: "you drive a powerful tractor to clear forests and collect timber. You'll upgrade your saw, expand your truck's capacity, and unlock new areas."
- Growden.io: "an .io farming game where you manage a small plot of land, starting off with some carrot seeds." Steps given: "Buy seeds... Click on the brown plots in your farm to place them... Wait as your plant begins to grow. (Meet other farmers or shop as you wait!)... harvest by clicking E... Sell your plants at the shop when ready." (full detail in question 3)
- Farm Ring Idle: "expand outward from a tiny central plot into a thriving, automated ring of crops. Grow vegetables, unlock smart upgrades, and deploy robotic helpers to streamline your harvest."
- Driftwood Isles: "you gather, craft, and build your way from a few sticks on the sand to a stilt house by the lagoon"; "Fish the lagoon, grow taro, sweet potatoes and pineapples, and cook dishes that give you buffs."
- The MOO Factory: "Start with one honest black-and-white cow and a dream. Milk her. Sell the milk. Buy another cow."
- Project Restoration: "Grow crops, gather resources, construct workshops, and bring warmth back to a forgotten world." Feature list: "Play with friends by trading gifts, visiting neighbors, and joining cooperative events."
- Magic School: "master the art of strategic merging to create a beautiful and enchanting school."
- Rob a Garden: "a 3D stealing and farming game. Run into guarded gardens, grab a seed sack and race back to your base before the guard catches you!"
- The Farmer: "take care of a farm by planting different fruits and vegetables, as well as taking care of chickens for their eggs."
- Yellowstone Ranch: "you manage your cow farm, milk your cows, and sell fresh milk."
- Farm Family: "You can cultivate crops, raise animals, and sell your products at the market to make money."

#### Poki: fields available
- A Poki game page embeds developer, `rating` (`up_count`, `down_count`, `rating`), `release_date`, `version_last_updated`, `last_modified`, `desktop_available`, `mobile_available`, `orientation`, categories, `store_urls`, intro, description and controls. It has no play count, no engine field and no purchase field — [Harvest Simulator page](https://poki.com/en/g/harvest-simulator)

#### Poki: all 32 farm-list games (each row sourced from the linked game page)
| Pos | Game | Developer | Rating (1-5) | Up / down votes | Release date | Version last updated | Desktop / mobile | Store links | Poki categories |
|---|---|---|---|---|---|---|---|---|---|
| 1 | [Harvest Simulator](https://poki.com/en/g/harvest-simulator) | Camu | 4.41 | 342,305 / 59,400 | 2025-05-06 | 2025-07-23 | yes / yes | none | Simulation, 3D, Farm, Tractor, Driving, Games for Boys |
| 2 | [Grow My Farm](https://poki.com/en/g/grow-my-farm) | emolingo games | 4.32 | 57,564 / 11,709 | 2025-08-22 | 2025-12-04 | yes / yes | none | Multiplayer, Simulation, Farm, Idle, Tycoon |
| 3 | [Little Farm World](https://poki.com/en/g/little-farm-world) | Tapfire | 4.27 | 14,674 / 3,271 | 2026-09-15 | 2026-10-22 | yes / yes | none | Simulation, Farm, Food, Popular, New, Mobile |
| 4 | [Olly the Paw](https://poki.com/en/g/olly-the-paw) | 7Spot Games | 4.41 | 54,809 / 9,392 | 2023-12-18 | 2025-01-03 | yes / yes | none | Games for Girls, Animal, Simulation, Farm, Food, Idle, Cozy, Easy, Tycoon |
| 5 | [Grass Cutter](https://poki.com/en/g/grass-cutter) | Kodachi Games | 4.33 | 26,693 / 5,365 | 2025-11-03 | 2026-07-23 | yes / yes | none | Simulation, 3D, Farm |
| 6 | [Vortella's Dress Up](https://poki.com/en/g/vortellas-dress-up) | Devortel | 4.32 | 1,078,068 / 222,413 | 2024-12-13 | 2026-10-29 | yes / yes | apple, googleplay | Games for Girls, Dress Up, Multiplayer, Fashion, 3D, Beauty, Farm, .io, Popular, Cozy, Mobile (and others) |
| 7 | [Mine and Dig](https://poki.com/en/g/mine-and-dig) | Sablo Studio | 4.24 | 11,801 / 2,747 | 2026-02-13 | 2026-10-30 | yes / yes | none | Simulation, 3D, Farm |
| 8 | [Apple Knight: Farmers Market](https://poki.com/en/g/apple-knight-farmers-market) | Limitless | 4.01 | 13,453 / 4,454 | 2024-07-11 | 2024-07-22 | yes / yes | none | Block, Simulation, 3D, Farm, Food, Idle, Tycoon |
| 9 | [Tiny Farm](https://poki.com/en/g/tiny-farm) | TokTok | 4.12 | 74 / 21 | not shown | 2026-11-03 | yes / yes | none | Simulation, Farm, Tycoon, New |
| 10 | [Bunny Farm](https://poki.com/en/g/bunny-farm) | Angelo Studio | 4.46 | 16,193 / 2,533 | 2025-02-05 | 2025-02-04 | yes / yes | none | Animal, Simulation, Farm, Idle, Tycoon |
| 11 | [Monkey Mart](https://poki.com/en/g/monkey-mart) | TinyDobbins | 4.57 | 3,414,033 / 407,220 | 2022-11-10 | 2026-03-16 | yes / yes | apple, googleplay | Shopping, Animal, Simulation, Arcade, Farm, Food, Idle, Popular, Cozy, Tycoon (and others) |
| 12 | [CombiMon](https://poki.com/en/g/combimon) | Entrevero Games | 4.47 | 31,130 / 4,754 | 2024-12-24 | 2025-03-12 | yes / yes | none | Animal, Simulation, Farm, Monster, Merge (and others) |
| 13 | [Cow Bay](https://poki.com/en/g/cow-bay) | 7Spot Games | 4.49 | 208,044 / 30,135 | 2023-02-13 | 2025-05-27 | yes / yes | none | Games for Girls, Mouse, Animal, Simulation, Farm, Idle, Cozy, Tycoon |
| 14 | [Game of Farmers](https://poki.com/en/g/game-of-farmers) | AppyApp | 4.24 | 297,476 / 69,855 | 2021-02-11 | 2023-06-29 | yes / yes | none | Games for Girls, Animal, Simulation, Farm, Idle, Cozy, Easy, Tycoon |
| 15 | [Village Builder](https://poki.com/en/g/village-builder) | Project GD | 4.24 | 48,139 / 11,220 | 2023-08-01 | 2026-08-09 | yes / yes | none | Brain, Mouse, Strategy, Simulation, 3D, Farm, Idle, Cozy, Tycoon |
| 16 | [Harvest Loop](https://poki.com/en/g/harvest-loop) | Kreativitas | 4.31 | 12,339 / 2,552 | 2026-09-03 | 2026-10-16 | yes / yes | none | Simulation, 3D, Farm, New |
| 17 | [Quack Quest](https://poki.com/en/g/quack-quest) | GigaMegaGames | 4.35 | 7,444 / 1,448 | 2024-12-09 | 2024-10-23 | yes / yes | none | Mouse, Animal, Simulation, Farm, Tycoon |
| 18 | [Crazy Pig Simulator](https://poki.com/en/g/crazy-pig-simulator) | CyberGoldFinch | 4.49 | 84,519 / 12,249 | 2019-03-11 | 2022-06-02 | yes / no | apple | Animal, Simulation, Farm, Crazy |
| 19 | [Chicky Farm](https://poki.com/en/g/chicky-farm) | PT New Games Plus | 4.57 | 38,919 / 4,643 | 2024-02-07 | 2024-03-29 | yes / yes | none | Games for Girls, Animal, Simulation, Farm, Idle, Clicker, Cozy |
| 20 | [Farm and Mine](https://poki.com/en/g/farm-and-mine) | Airapport | 4.24 | 16,661 / 3,889 | 2024-04-24 | 2025-12-23 | yes / yes | none | Mouse, Simulation, Farm, Idle, Clicker, Tycoon |
| 21 | [Pixel Realms](https://poki.com/en/g/pixel-realms) | Yury Grigoryev | 4.51 | 32,652 / 4,513 | 2024-01-22 | 2024-03-05 | yes / yes | none | Adventure, Mouse, Simulation, Farm, Idle, Retro |
| 22 | [Farm Clash 3D](https://poki.com/en/g/farm-clash-3d) | OOO Frivei Interaktiv | 4.54 | 85,620 / 11,211 | 2019-07-26 | 2022-04-28 | yes / yes | none | Action, Multiplayer, Shooting, Farm, Gun |
| 23 | [Misland](https://poki.com/en/g/misland) | Seal Unicorn Games | 4.44 | 69,990 / 11,360 | 2023-11-27 | 2024-10-14 | yes / yes | googleplay | Adventure, Mouse, Simulation, 3D, Farm, Idle, Tycoon |
| 24 | [Astro Rancher](https://poki.com/en/g/astro-rancher) | monoinyo | 4.51 | 4,613 / 638 | 2026-05-01 | 2026-05-08 | yes / yes | none | Adventure, Simulation, Farm, Idle, Space, Retro, Cozy |
| 25 | [Chef Bacon](https://poki.com/en/g/chef-bacon) | SnoutUp Games | 4.34 | 1,294 / 254 | 2026-02-19 | 2026-03-06 | yes / yes | googleplay | Cooking, Animal, Simulation, Farm, Restaurant, Food, Tycoon |
| 26 | [Idle Cowshed](https://poki.com/en/g/idle-cowshed) | Beedo Games | 4.31 | 5,370 / 1,119 | 2024-04-22 | 2025-01-03 | yes / yes | none | Mouse, Animal, Simulation, Farm, Idle, Easy |
| 27 | [Village Craft](https://poki.com/en/g/village-craft) | AlexSo | 4.21 | 67,583 / 16,681 | 2023-10-06 | 2023-10-09 | yes / yes | none | Adventure, Simulation, 3D, Farm, Idle, Tycoon |
| 28 | [Horse Shoeing](https://poki.com/en/g/horse-shoeing) | NoPowerup | 4.35 | 169,507 / 33,050 | 2021-03-24 | 2021-04-07 | yes / no | none | Animal, Simulation, 3D, Farm, Horse, Cozy, Easy |
| 29 | [Veggie Merge](https://poki.com/en/g/veggie-merge) | AJ Ordaz | 3.77 | 1,169 / 522 | 2026-06-05 | 2026-06-12 | yes / yes | none | Mouse, Animal, Puzzle, Farm, Food, Matching, Idle, Merge |
| 30 | [Idle Farming Business](https://poki.com/en/g/idle-farming-business) | MarketJS | 4.43 | 45,562 / 7,648 | 2023-06-30 | 2023-06-13 | yes / yes | none | Mouse, Simulation, Farm, Idle, Cozy, Easy, Tycoon |
| 31 | [Jungle Friends](https://poki.com/en/g/jungle-friends) | OnRush Studio | 4.51 | 62,872 / 8,743 | 2023-12-05 | 2026-02-26 | yes / yes | none | Animal, Simulation, 3D, Farm, Food, Idle, Cozy |
| 32 | [Harvest Hollow](https://poki.com/en/g/harvest-hollow) | HZ Games | 5.0 | 1 / 0 | not shown | not shown | yes / yes | none | Simulation, Farm, New, Tycoon |

- Outside the farm list but farm-animal themed: Cow Castle (7Spot Games), 11,815 up / 2,443 down, released 2025-05-26, categories Animal, Multiplayer, Simulation, 2 Player, Idle, Easy — [Cow Castle page](https://poki.com/en/g/cow-castle)

#### Poki: what the player does, top 20 (quotes from each game page linked above)
- Harvest Simulator: "puts you behind the wheel of a combine. Harvest crops, like sunflowers and wheat, to earn cash to upgrade your machinery."
- Grow My Farm: "Plant seeds, water them, watch your crops grow, then harvest your fresh produce to sell in the store. Use your earnings to buy more seeds and expand your farm."
- Little Farm World: "Plant crops, harvest fresh produce, raise adorable animals, and keep expanding your land." (The intro field on this page calls the game "My Perfect Farm".)
- Olly the Paw: "Gather wild apples, trade delicious fruits with forest citizens, collect aircraft parts."
- Grass Cutter: "Control a mower to trim tall grass and clear messy yards. Upgrade your machine."
- Vortella's Dress Up: "a multiplayer dress up game. Style your character... and compete in fashion shows with other players." (not a farm game)
- Mine and Dig: "Excavate deep beneath the earth to collect valuable treasures. Hire workers and upgrade tools." (not a farm game)
- Apple Knight: Farmers Market: "Pick fresh apples, set up stalls, and sell produce to customers. Hire helpful workers and ride a horse."
- Tiny Farm: no description yet ("Tiny Farm is one of our selected New Games.").
- Bunny Farm: "Plant crops like carrots and wheat, water them carefully, and harvest your bounty to satisfy your hungry forest friends."
- Monkey Mart: "Grow crops, take care of animals, stock shelves, upgrade your store and hire other monkeys to help out."
- CombiMon: "Play as a rancher matching the right monsters to trainer preferences."
- Cow Bay: "an idle simulation game where you take the role of a farmer cow who harvests various crops and crafts tools"; "Each task costs an energy."
- Game of Farmers: "Unlock various types of plants, vegetables, fruits, and animals and make money with their help even when you're offline."
- Village Builder: "Construct cozy houses, harvest abundant crops, manage local resources." (authored by a Poki engineer, per Poki's blog)
- Harvest Loop: "Roll through the fields, harvest everything in sight, sell your resources for coins, and pour them back into upgrades."
- Quack Quest: "Escape to an idyllic tropical island to gather resources and craft advanced items."
- Crazy Pig Simulator: "Escape the farm, wreck cars, scare pedestrians." (not a farm game)
- Chicky Farm: "Feed hungry baby chicks, collect fresh eggs, and sell your farm goods to buy helpful upgrades."
- Farm and Mine: "Grow crops, manage resources, and dig deep to extract valuable materials."

#### Brazilian Portuguese versions of game pages
- CrazyGames' `/br/` page for Growden.io carries the same numbers with translated labels and a translated description (Desenvolvedor LXV; "340 mil curtidas e 33 mil descurtidas"; tags Fazenda, 3D, Com os Amigos, Multijogador) — [Growden.io /br/](https://www.crazygames.com/br/game/grow-a-garden---growden-io)
- Poki's `/br/` page for Grow My Farm carries the same votes (57,564 up / 11,709 down) and a translated description; categories include "Jogos Multiplayer" and "Jogos de Fazenda" — [Grow My Farm /br/](https://poki.com/br/g/grow-my-farm)

### Inferences
- Poki's rating is a rescaled like ratio: 1 + 4 × up / (up + down) reproduces every value checked (Harvest Simulator: 342,305 / 401,705 = 0.852, giving 4.41).
- On CrazyGames, likes and dislikes look like lifetime totals while the 0-10 rating is a six-month figure; the page states only the second part.
- The "Premium Perks" tag marks games with in-game purchases: all 10 inspected games with that tag have the purchase flag set. Purchase-enabled games dominate the top of the farming list (11 of 15).
- Of the 15 top CrazyGames farm titles, 8 are "Externally hosted (iframe)", i.e. served from the developer's own servers, 4 are HTML5 uploads and 3 are Unity builds. Across the 32 inspected Farming-tagged pages: 10 externally hosted, 8 HTML5, 12 Unity (2021, 2022 or 6), 1 Cocos, 1 Ruffle.
- Live operation matters at the top: Farm Merge Valley's files were updated on the fetch day (`lastFileUpdatedOn: 2026-11-11`), and Mergest Kingdom, Tropical Merge and Castle Craft were all updated in August 2026 although released in 2021 to 2024.
- Tapfire's farm game is on both portals under two names (My Perfect Farm on CrazyGames, Little Farm World on Poki, whose intro still says "My Perfect Farm"), and Sablo Studio publishes on both, so farm games are not always exclusive to one portal.

### Gaps
- Poki does not show play counts, engine or monetization per game. Farm Clash 3D's description says it "is an HTML5 game"; nothing else is stated.
- CrazyGames play counts were available only for games that appear in a list payload (the top 15, the two mobile extras and The Farmers).
- Farm Merge Valley's developer is not named on its CrazyGames page; the only hint is a support link to coolgames.com.
- Accounts: neither portal states per game whether an in-game account exists. CrazyGames' "cloud" flag says progress is saved to the portal account; Poki has a portal-level cloud save (question 5).
- No screenshot or video was viewed, so the notes cannot say which games look good.

## 3. Which farm games are 3D, and which are real-time multiplayer or co-op with friends?

### Takeaway
A farm game that is both 3D and real-time multiplayer already exists at scale on CrazyGames: Growden.io, a browser copy of Roblox's Grow a Garden with rooms of 2 to 6 players, 340,283 likes and 21.5 million plays, no purchases. Poki has a similar title, Grow My Farm (multiplayer, described as "blocky, low-poly", 57,564 up-votes). The claim "there is no real-time multiplayer 3D farm game with scale in the browser" is therefore false as worded; what the inspected pages do not show is an original, purchase-monetized, co-operative 3D farm game.

### Cited Findings

#### Growden.io on CrazyGames (3D and multiplayer by the portal's own tags)
- Tags: Grow, Meme & bloxy, Mobile, 3D, Farming, Building, With friends, Multiplayer, Collect, Casual. Embedded multiplayer data: `isMultiplayer: true`, `minLobbySize: 2`, `maxLobbySize: 6` — [Growden.io page](https://www.crazygames.com/game/grow-a-garden---growden-io)
- Developer LXV; rating 9.0 (last 6 months); 340,283 likes and 33,313 dislikes; released September 2025; last updated November 2025 on the portal; "Externally hosted (iframe)" with the game loaded from `https://growden.io/?cg=true&auto_play=true`; platforms "Browser (desktop, mobile, tablet), CrazyGames App (iOS, Android)"; `hasIap: false`; save "cloud"; wiki links point to the Wikipedia and Fandom pages of Roblox's Grow a Garden — [Growden.io page](https://www.crazygames.com/game/grow-a-garden---growden-io)
- 21,482,019 plays; position 11 in the Farming tag; position 143 in the All Games list of 4,691 — [CrazyGames /t/farming](https://www.crazygames.com/t/farming); [All Games page 2](https://www.crazygames.com/sitemap/games/2)
- What the multiplayer is, in the page's words: "Its rotating community rooms filled with players from all around the world, constant reward system, and continuous growth cycle make this game very hard to put down."; "Wait as your plant begins to grow. (Meet other farmers or shop as you wait!)"; "Depending on what room you are in, you can find some very generous players who gift you expensive flowers or fruits."; "On the downside, there is also stealing... There is a chat, and if a farmer steals, you will get a notification and can call them out."; "If you ever feel uncomfortable in a room, refresh your page, and it will get you to a new room." — [Growden.io page](https://www.crazygames.com/game/grow-a-garden---growden-io)
- Loop and economy, in the page's words: "You start with basic $10 carrot seeds... the ultimate seed... the moon blossom, which costs tens of millions."; "Each garden is allowed five pets. Pets help you harvest... while idle or away"; "Only 100 items fit into your backpack"; "Mutations on your plants happen during weather events... Silver, Golden, Rainbow, and BIG mutations"; "There are currently 5 weather events"; "Stay logged in so you can keep your progress. If you log out and refresh your browser, you're likely going to lose your garden." A quoted review adds: "your crops keep growing even while you aren't playing." — [Growden.io page](https://www.crazygames.com/game/grow-a-garden---growden-io)
- Controls: "WASD and arrow keys = move; Space = jump; E = pick up plants or talk to the seed shop/sell area; Hold the right mouse button = move the camera" — [Growden.io page](https://www.crazygames.com/game/grow-a-garden---growden-io)
- The page's structured data contains an invite URL pattern, `...?czy_invite=true&utm_source=invite&roomId` — [Growden.io page](https://www.crazygames.com/game/grow-a-garden---growden-io)
- The portal says of its look: "go for similar graphics in Bloxd.io" — [Growden.io page](https://www.crazygames.com/game/grow-a-garden---growden-io)

#### Grow My Farm on Poki (multiplayer by Poki's category; 3D only by description)
- Developer emolingo games; 57,564 up / 11,709 down (4.32); released 2025-08-22; version updated 2025-12-04; desktop and mobile; categories Multiplayer, Simulation, Farm, Idle, Tycoon (not in the 3D category) — [Grow My Farm page](https://poki.com/en/g/grow-my-farm)
- "Can I play Grow my Farm with my friend? Yes! Grow my Farm is a multiplayer game so you can play it with your friends online!"; meta description: "The game features a blocky, low-poly look."; controls: "Use WASD, the arrow keys, or the joystick to move. Press the number keys to get the right items" — [Grow My Farm page](https://poki.com/en/g/grow-my-farm)
- Poki's blog on the same studio: each game "typically takes only about three months to develop"; they "integrate custom 3D assets and add cosmetics and powerups to support ad-based monetization. Multiplayer functionality is typically implemented once the gameplay is stable"; "Each of the studio's eight games released on Poki has surpassed 10 million plays"; "Poki is now their exclusive platform of choice"; the studio's first Poki game was called Wheat Farming — [Poki blog, 17 Jul 2025](https://poki.com/blog/how-emolingo-games-built-business-html5-web-games-poki)

#### Other farm titles with a multiplayer or social claim
- Farm Clash 3D (both portals): tags 3D, Third Person Shooter, Multiplayer on CrazyGames (4,637 likes); on Poki "a multiplayer sniper shooting game where you play against other aggressive farmers in real time" (85,620 up-votes). A shooter with a farm setting, not a farming game — [CrazyGames Farm Clash 3D](https://www.crazygames.com/game/farm-clash-3d); [Poki Farm Clash 3D](https://poki.com/en/g/farm-clash-3d)
- Country Life Meadows (CrazyGames): tags MMO and 2D; "Farming co-op with shared goals and player trading"; "Neighbor system with valuable gifts"; desktop-only; multiplayer fields empty — [Country Life Meadows page](https://www.crazygames.com/game/country-life-meadows)
- Project Restoration (CrazyGames): tag Multiplayer, Top-Down; "Play with friends by trading gifts, visiting neighbors, and joining cooperative events"; multiplayer fields empty — [Project Restoration page](https://www.crazygames.com/game/project-restoration-axt)
- cowz.io (CrazyGames): tags 2D, With friends, Multiplayer; lobby 2-40 with instant join; "battle corrupted farm animals" (an action game) — [cowz.io page](https://www.crazygames.com/game/cowz-io)
- Farmer Challenge Party (CrazyGames): tags 2 Player, 2D; local score duel — [Farmer Challenge Party page](https://www.crazygames.com/game/farmer-challenge-party)
- Harvest.io (CrazyGames): tags 3D, Top-Down, Snake; "don't bump into yourself or others"; "Circle the enemy and steal resources"; multiplayer fields empty and no multiplayer tag — [Harvest.io page](https://www.crazygames.com/game/harvest-io---3d-farming-arcade)
- Cow Bay (Poki): the farm category text says "Cow Bay delivers that multiplayer buzz, where trading and teamwork turn farm life into a community adventure", but the game page has no Multiplayer category and describes a solo idle game ("share it with your friends and find out who can build the best settlement") — [Poki /en/farm](https://poki.com/en/farm); [Cow Bay page](https://poki.com/en/g/cow-bay)
- Cow Castle (Poki): categories Multiplayer and 2 Player; a cow gathers resources to build a castle; not in the farm list — [Cow Castle page](https://poki.com/en/g/cow-castle)

#### 3D farm titles (by portal tag or category)
- CrazyGames, Farming tag plus 3D tag among the 38 pages inspected: Growden.io, Driftwood Isles, Rob a Garden, Harvest.io, Yellowstone Ranch, Juice Factory - Fruit Farm, Farming Tycoon 3D, My Perfect Farm, Harvest Land Tycoon, Farm Squad. Only Growden.io also has a multiplayer tag or flag — game pages linked in question 2
- CrazyGames, explicitly tagged 2D: Country Life Meadows, Farland, Farm Ring Idle, Royal Farm, Farm Drones. The two merge leaders (Mergest Kingdom, Farm Merge Valley) carry neither tag — game pages linked in question 2
- Poki, Farm category plus 3D category (11 of 32): Harvest Simulator, Grass Cutter, Vortella's Dress Up, Mine and Dig, Apple Knight: Farmers Market, Village Builder, Harvest Loop, Misland, Village Craft, Horse Shoeing, Jungle Friends. Farm plus Multiplayer category (3 of 32): Grow My Farm, Vortella's Dress Up, Farm Clash 3D. Both: only Vortella's Dress Up, which is not a farm game — game pages linked in question 2

#### Pages inspected (the bound of the claim)
- CrazyGames game pages opened (38): the 15 top Farming-tag games, Magic School, Rob a Garden, The Farmer, The Farmers, Farm Family, Farm Life, Farming Life, Farm Squad, Farm Drones, Farming Tycoon 3D, Harvest.io, Harvest Land Tycoon, Homesteads: Dream Farm, Juice Factory - Fruit Farm, My Perfect Farm, Royal Farm, Yellowstone Ranch, Farm Clash 3D, cowz.io, Farmer Challenge Party, Plants vs Brainrots, Idle Dino Farm Tycoon Simulator 3D, Ranch Adventures. 32 of them carry the Farming tag — pages linked in question 2
- CrazyGames list pages opened: `/t/farming`, `/br/t/farming`, `/t/farming/2`, `/t/co-op`, `/t/mmo1`, `/multiplayer`, `/t/3d`, `/t/grow`, `/t/tycoon`, `/t/idle`, `/t/management`, `/c/sim`, `/c/io`, `/c/clicker` (top 15 of each), the home page, All Games pages 1 and 2, and the XML sitemap
- Poki game pages opened (33): all 32 games of the farm list plus Cow Castle. Poki list pages opened: `/en/farm`, `/br/fazenda`, `/br`, `/en/multiplayer`, `/en/3d`, `/en/io`, `/en/tycoon`, `/en/idle`, `/en/tractor`, `/en/simulation`, `/en/popular`, `/en/co-op`, and the games and categories sitemaps

### Inferences
- Growden.io's shape, inferred from tags, lobby size, controls and description: a third-person 3D world split into small public rooms (up to 6), each player tending an own plot next to strangers, with free-text chat, gifting and stealing between players. That is shared-space parallel play, not co-operative work on one farm. The invite parameter with `roomId` suggests friends can join a room by link, which is how CrazyGames' "With friends" label works (question 5); the page does not say so in words.
- Growden.io monetizes without purchases on CrazyGames (flag false), so presumably by ads; the page does not state the model. Grow My Farm is described by Poki's blog as part of an ad-funded catalogue.
- "Meme & bloxy", "similar graphics in Bloxd.io" and "blocky, low-poly look" indicate that both multiplayer 3D farm games use Roblox-style blocky art. The quality bar they set is low-fidelity; this is an inference from wording, since no image was viewed.
- A fair restatement of the open position, within the pages inspected: no farm game on either portal combines (1) original intellectual property, (2) 3D, (3) co-operative play on a shared farm with friends, and (4) purchases plus persistent accounts. Each of the four exists separately: 3D with multiplayer in Growden.io, purchases with cloud save in the 2D merge and expedition farms, co-op guild features in the 2D Country Life Meadows.
- Demand for multiplayer 3D farming on portals is proven rather than hypothetical: an unlicensed copy with no purchases reached 21.5 million plays in 14 months on one portal.

### Gaps
- 65 of the 97 Farming-tagged CrazyGames games were not identified or opened, and about 30 farm-named slugs in the sitemap were not opened (for example `farm-merge`, `farm-land`, `happy-farm`, `my-chicken-farm`, `shepherd-farm`, `western-farm`, `loop-farm`, `garden-idle`, `harvesting-season`). A second 3D multiplayer farm game could be among them. Because the top 15 is the portal's own ranking, any such game ranks below position 15 of the tag.
- 14 of Poki's 46 farm games are not listed to this visitor and were not inspected.
- Whether Growden.io supports private rooms, friend invites or shared plots in practice was not tested (game not loaded), nor were its ads or any purchases on its own site, growden.io (other host).
- Whether Growden.io is licensed by the owners of Grow a Garden is not stated on the page.
- The portal-side update date for Growden.io (November 2025) says nothing about updates made on the developer's own server.

## 4. What does the portal audience play in this theme, and how niche is it against the portals' top games?

### Takeaway
On CrazyGames the farm theme is led by merge games and long-session free-to-play farm sims with purchases, followed by idle and incremental games; on Poki it is led by short ad-funded simulator, idle and tycoon games. The best farm titles reach about 5% of the likes or plays of CrazyGames' biggest game and under 2% of the votes of Poki's biggest, but on CrazyGames two farming-tagged merge games sit at positions 11 and 15 of the portal-wide list of 4,691 games.

### Cited Findings
- Mix of the CrazyGames top 15 by portal category: Simulation 5, Puzzle 4 (all merge), Clicker 3, Arcade 2, Adventure 1 — [CrazyGames /t/farming](https://www.crazygames.com/t/farming)
- By tag in the same 15: Merge 4 (Mergest Kingdom, Farm Merge Valley, Tropical Merge, Castle Craft); Idle or Incremental 5 (The MachinEGG, Farm Ring Idle, The MOO Factory, Stone Grass, Lumber Harvest); Management or Mission-driven farm sims with purchases 4 (Country Life Meadows, Farland, Hedgies, Project Restoration); 3D multiplayer 1 (Growden.io); 3D survival 1 (Driftwood Isles) — game pages linked in question 2
- CrazyGames describes the theme itself as: "Farming games are often merge, simulation, or management games in which you play as a farmer." — [CrazyGames /t/farming](https://www.crazygames.com/t/farming)
- Mix of the Poki top 20 by Poki category: Simulation 20 of 20 (genre or category), Tycoon 11, Idle 10, 3D 7, Multiplayer 2 (one of them the dress-up game), Merge 1, Clicker 2 — game pages linked in question 2
- Poki describes its own collection as "simulators, planting, building, merging, and multiplayer fun" and says "Farm simulators are the backbone of Poki's farm collection" — [Poki /en/farm](https://poki.com/en/farm)
- CrazyGames All Games list (4,691 games, 100 per page): farming-tagged games at positions 11 (Mergest Kingdom), 15 (Farm Merge Valley), 38 (Country Life Meadows), 50 (Tropical Merge), 54 (Stone Grass), 55 (Castle Craft), 70 (The MachinEGG), 86 (Farland), 109 (Hedgies), 129 (Lumber Harvest), 143 (Growden.io), 153 (Farm Ring Idle), 185 (Driftwood Isles), 197 (The MOO Factory). The list opens with Bloxd.io, Openfront, Mahjongg Solitaire, Piece of Cake: Merge and Bake, Boxity.io — [All Games page 1](https://www.crazygames.com/sitemap/games); [All Games page 2](https://www.crazygames.com/sitemap/games/2)
- CrazyGames' biggest games, from list payloads: Bloxd.io 6,816,960 likes and 497,274,536 plays; Space Waves 5,146,478 and 244,275,119; Racing Limits 2,955,373 and 119,765,987; Ragdoll Archers 2,529,882 and 173,688,942; EvoWars.io 2,436,038 and 109,665,689; Hazmob FPS 2,186,295 and 53,263,598; BuildNow GG 2,163,908 and 88,777,521; Smash Karts 1,731,915 and 104,698,602; Shell Shockers 1,580,947 and 111,706,955 — [/multiplayer](https://www.crazygames.com/multiplayer); [/t/co-op](https://www.crazygames.com/t/co-op); [/t/grow](https://www.crazygames.com/t/grow)
- CrazyGames' leading farm-tag games: Farm Merge Valley 27,944,127 plays; Mergest Kingdom 23,746,084; Growden.io 21,482,019; Stone Grass 17,032,689 (418,945 likes, the most liked); Tropical Merge 11,058,698. The top 15 together total 128,235,197 plays — [CrazyGames /t/farming](https://www.crazygames.com/t/farming)
- For scale inside the portal's top 30: Openfront (position 2) has 15,590,377 plays, 8 Ball Pool Billiards Multiplayer (position 8) 27,178,734, Mahjongg Solitaire (position 3) 44,651,885 — [/multiplayer](https://www.crazygames.com/multiplayer); [/t/3d](https://www.crazygames.com/t/3d)
- Poki's biggest games read: Subway Surfers 18,352,483 up-votes; Level Devil 3,654,485; Monkey Mart 3,414,033; Vortella's Dress Up 1,078,068; Retro Bowl 1,044,763; MineFun.io 1,031,557 — [Subway Surfers](https://poki.com/en/g/subway-surfers); [Level Devil](https://poki.com/en/g/level-devil); [Monkey Mart](https://poki.com/en/g/monkey-mart); [Retro Bowl](https://poki.com/en/g/retro-bowl); [MineFun.io](https://poki.com/en/g/minefun-io)
- Poki's leading farm games by up-votes, leaving out Monkey Mart and the dress-up game: Harvest Simulator 342,305; Game of Farmers 297,476; Cow Bay 208,044; Horse Shoeing 169,507; Farm Clash 3D 85,620; Crazy Pig Simulator 84,519; Misland 69,990; Village Craft 67,583; Jungle Friends 62,872; Grow My Farm 57,564. The 32 farm-list games total 6,320,571 up-votes, of which Monkey Mart and Vortella's Dress Up account for 4,492,101 — game pages linked in question 2
- No farm-themed game is in the 145-game grid of Poki's home page (English or Brazilian Portuguese), and none is in the 12 popular searches shown (Subway Surfers, MineFun.io, Master Chess, Tag and others) — [Poki /en/farm](https://poki.com/en/farm); [Poki /br](https://poki.com/br)
- CrazyGames' home page names its "most popular games" as Shell Shockers, Agar io, Uno Online, Geometry Dash, Moto X3M, Smash Karts, GeoGuessr and Hangman, with no farm title; its home categories include "Simulation" but no farming shelf — [CrazyGames home](https://www.crazygames.com/)

### Inferences
- Ratios on CrazyGames: Farm Merge Valley has 5.6% of Bloxd.io's plays; Growden.io has 5.0% of Bloxd.io's likes; the 15 leading farm-tag games together have about a quarter of Bloxd.io's plays. Against ordinary top-30 games, the farm leaders are of the same order (20 to 28 million plays).
- Ratios on Poki: Harvest Simulator has 1.9% of Subway Surfers' up-votes and 9.4% of Level Devil's. Monkey Mart, a shop game with a crop and animal loop that Poki files under Farm, has 93% of Level Devil's votes, so a farm-adjacent tycoon can be a top-tier Poki game.
- The All Games order is not sorted by likes or plays (Farland, with 215,248 plays, is at 86), and the games placed high are disproportionately purchase-enabled, long-session titles. A reasonable reading is that the order reflects recent engagement or revenue, which would mean farm merge and expedition games are among CrazyGames' best earners. The page does not state the rule, so this is a hypothesis.
- The farm theme is mid-sized, not marginal, on CrazyGames, and it is carried by merge and free-to-play simulation mechanics that keep players for months. On Poki it is a small category of quick games, with one outlier.
- The audience signal for a 3D multiplayer farm is the Growden.io result: it has more likes than any true farm game on either portal (340,283), although its rank in the default order (143) is below the purchase-driven 2D games.
- Likes are a weak cross-portal measure: Poki's vote counts and CrazyGames' like counts are not the same unit, and neither is plays or revenue.

### Gaps
- Neither portal publishes daily or monthly players per game, session length or revenue on the pages read.
- The meaning and time window of CrazyGames' `totalPlays` is not stated (it reads as a lifetime counter).
- The ranking rule of CrazyGames' default order and of Poki's category order is not stated.
- Brazil-specific popularity could not be observed from a US location.

## 5. What do the portals state for developers on their own domains?

### Takeaway
Neither portal publishes its developer terms on its main domain: CrazyGames redirects `/developers` to `developer.crazygames.com` and Poki's FAQ sends developers to `developers.poki.com`, so revenue share, exclusivity and size limits could not be read first-hand. What the main domains do state: CrazyGames runs in-game purchases through Xsolla tied to a portal account and has friends, invite links, lobbies and cloud saves; Poki is free and ad-funded with no paid version, has optional accounts with automatic cloud saves, requires portrait support, and warns that every extra megabyte loses players.

### Cited Findings

#### CrazyGames (www.crazygames.com)
- `https://www.crazygames.com/developers` answers HTTP 301 to `https://developer.crazygames.com/` (not followed); the footer link "Developers" points to the same host — [CrazyGames home](https://www.crazygames.com/)
- Home page: "CrazyGames has over 4,500 fun games in every genre you can imagine."; "CrazyGames is a free browser gaming platform founded in 2014 by Raf Mertens. Since then, the platform has grown to over 60 million monthly users."; "Our mission is simple: to create a browser-gaming platform that works seamlessly for users around the world and rewards developers both big and small."; "take a look at our game developer platform if you're interested in submitting a game." — [CrazyGames home](https://www.crazygames.com/)
- Terms of Service, "Last updated: April 2026", section 5: "CrazyGames does not sell in-game items or offer in-game services to our users. We do, however, facilitate such purchases and services through a third party."; "The Games are free to play, which means that you are not obliged to pay to be able to play and enjoy the Games. In some Games, it is possible to buy Virtual Currency and/or Virtual Items."; "CrazyGames facilitates the purchase of in-game purchases between you and the developer of the web game through the third-party provider Xsolla."; "Your in-game purchases will be linked to your Account as well as to your account with the third-party provider." — [CrazyGames Terms of Service](https://www.crazygames.com/terms-and-conditions)
- Terms of Service, section 4.1: "To use the Platform, you are able to register for an Account. To register for an Account, you will need to submit certain information such as a username and a password." The terms bar users under 13 and point them to a kids site without personalized ads — [CrazyGames Terms of Service](https://www.crazygames.com/terms-and-conditions)
- Interface strings shipped with every game page describe the friends and invite system: "An Invite friends button will appear under the game once you are in a lobby that your friends can join."; "Share this link with anyone to play {gameName} together!"; "Your friends will get notified about the game invitation within seconds!"; "If your friend is in a game that you can join, you'll see a Join button next to their name in your friends list."; "Create a free CrazyGames account to add friends, compare scores, and invite others to play with you." — [Growden.io page](https://www.crazygames.com/game/grow-a-garden---growden-io)
- The multiplayer hub has three tabs: "With friends" (type INSTANT), "Multiplayer" and "2 Player"; it says games can be played "by simply sharing a link" — [CrazyGames /multiplayer](https://www.crazygames.com/multiplayer)
- Save strings: "Don't lose your progress... All that effort, gone. Unless you log in."; "Your progress is synced to the game's server."; game pages carry a save flag, "cloud" on 35 and "local" on 3 of the 38 pages inspected — [Growden.io page](https://www.crazygames.com/game/grow-a-garden---growden-io)
- Other strings: "In-app purchases are unavailable in the app" (the CrazyGames mobile app); a game notification type "Energy refilled"; leaderboards with friend challenges; an "ad-free" ticket offer whose confirmation text reads "'Ad-free' isn't live yet — we're testing the idea" — [Growden.io page](https://www.crazygames.com/game/grow-a-garden---growden-io)
- Game pages distinguish builds hosted by the portal ("HTML5", "Unity 2021", "Unity 2022", "Unity 6", "Cocos", "Ruffle") from "Externally hosted (iframe)"; Growden.io is loaded from the developer's own domain — [Growden.io page](https://www.crazygames.com/game/grow-a-garden---growden-io); [Farm Ring Idle page](https://www.crazygames.com/game/farm-ring-idle)
- Platform lines show that listing on the portal coexists with store versions and Steam: The MachinEGG is "Browser (desktop, mobile, tablet), CrazyGames App (iOS, Android), App Store (Android), Steam" — [The MachinEGG page](https://www.crazygames.com/game/the-machinegg)
- `robots.txt` disallows `/search?q` and names the sitemap index — [CrazyGames robots.txt](https://www.crazygames.com/robots.txt)

#### Poki (poki.com)
- FAQ, "I'm a game developer": "Want to publish your web game on Poki? Check out developers.poki.com for everything you need to know." — [Poki FAQ](https://poki.com/en/c/faq)
- FAQ on scale and model: "Poki is an online playground of over 1,700 web games... Every month, we have over 100 million players"; "all the games on Poki are 100% free to play"; "We don't offer a paid or ad-free version of Poki.com."; "Ads are what allows Poki to offer a free gaming experience. They also support the game developers and allow them to make a living from their games." — [Poki FAQ](https://poki.com/en/c/faq)
- FAQ on exclusivity and licensing: "We've got games like Level Devil, Vortella's Dress Up, Drive Mad and many more that you can only play on Poki. You can also find popular games like Subway Surfers and Retro Bowl... only on Poki.com."; "Poki works directly with the studios and developers who create the games. This means every game on Poki is official, licensed, and published with permission." — [Poki FAQ](https://poki.com/en/c/faq)
- FAQ on accounts and saves: "All games on our website are available without registration or an account."; "If you don't have a Poki account, your game progress is saved in your browser cookies... If you do have a Poki account, your progress is safely stored online."; "You can sign in with Apple, Google, Microsoft, or passkey."; "You can save your progress and jump back in anytime, even when switching between your computer, mobile, or tablet." — [Poki FAQ](https://poki.com/en/c/faq)
- FAQ on chat: "Most Poki games don't have chat features. Games that do, like Vortella's Dress Up and Steal and Run, use our linked Poki Safe Chat functionality. This lets players talk using a set of predefined messages." — [Poki FAQ](https://poki.com/en/c/faq)
- FAQ on apps and offline: Poki has an Android app; "Poki games can only be played online." — [Poki FAQ](https://poki.com/en/c/faq)
- Blog, cloud saves: "Cloud saves work automatically. Games store data in local storage as usual. We periodically sync that data to our servers... Players who create a Poki account get persistent saves across devices with zero API integration required from the developer." — [Poki blog, 5 Jun 2026](https://poki.com/blog/building-web-browser-games-2026)
- Blog, download size: "For every extra megabyte a person has to download to play your game, you're going to lose a couple percent of players."; "Unity is the most widely used engine among developers on our platform... The trade-off is size. Unity compiles to one large WebAssembly blob that must download in full before the game is playable... That makes conversion to play lower for Unity games than for web-native alternatives."; "PlayCanvas is a web-native engine comparable to Unity in capability... it sidesteps the blob problem entirely" — [Poki blog, 5 Jun 2026](https://poki.com/blog/building-web-browser-games-2026)
- Blog, mobile requirement: "Every game submitted to Poki needs to work in portrait, and our QA team tests for it."; "Asking them to rotate their phone is a conversion killer" — [Poki blog, 5 Jun 2026](https://poki.com/blog/building-web-browser-games-2026)
- Blog, graphics support: "As of June 2026, devices with WebGPU support account for around 68% of players on Poki... developers should treat WebGPU as an enhancement" — [Poki blog, 5 Jun 2026](https://poki.com/blog/building-web-browser-games-2026)
- Blog, onboarding and distribution: "Web players behave more like TikTok viewers than Steam users."; "Text-based tutorials fail."; "Developers on Poki don't need to spend time or money on marketing. We match games to interested players through our categorization and recommendation systems."; Poki Play Testing returns "10 to 20 recordings" of real players "within minutes of uploading a build" — [Poki blog, 5 Jun 2026](https://poki.com/blog/building-web-browser-games-2026)
- Blog, load-time example: "When Stickman Hook was first added to Poki, it had a WebGL port that was 40MB and had a median loading time of 29.5 seconds. This resulted in a 50% conversion to play... they managed to bring the file size to 6MB... median loading time down to 3.7 seconds... conversion to play going up to 72%" — [Poki blog, 16 May 2026](https://poki.com/blog/what-makes-high-quality-browser-game)
- Blog, ads and art: "Poki uses mostly non-intrusive adverts in the form of Rewarded Videos... rewards often take the form of extra lives, customisation options and in-game currency"; "games with bright and colorful 2D or 3D object assets tend to garner more average plays and longer term success. Games with muted color palettes, pixel art or dark colours have a harder time standing out."; "our recommendation is that your core gameplay loops should be optimised for short player sessions." — [Poki blog, 16 May 2026](https://poki.com/blog/what-makes-high-quality-browser-game)
- Blog, guest post by a studio: "Generally, a conversion rate above 70% is solid, and anything above 80% is exceptional."; Draco compression cut their model files "from 3.88 MB... to just 387 KB"; only essential files loaded first, the rest "fetched in the background"; hosting on Poki applies gzip or Brotli automatically — [Poki blog, 11 Nov 2024](https://poki.com/blog/how-we-made-cannon-clash-load-fast-and-boosted-conversion)
- Blog, publishing relationship: Poki's partnership with Emolingo "provided not just funding but also tooling and creative input"; "proprietary SDK support"; "Poki currently has a team of 65 people" — [Poki blog, 17 Jul 2025](https://poki.com/blog/how-emolingo-games-built-business-html5-web-games-poki)
- Blog, market study: "Poki itself sees more than 100 million monthly active players in 2026, up from 10 million in 2020."; "37% of gamers play web games 'multiple times per day'"; "27% of web gamers spend more than $50 on gaming purchases each month"; "62% of players have downloaded or purchased a game after discovering a game on web"; "53% plan to port mobile games to browser in the next 12 months"; "36% cite insufficient revenue as the biggest barrier"; the most common web gamer "spends 11-to-20 minutes per session, and engages with two-to-three individual titles in a single session" — [Poki blog, 25 Jun 2026](https://poki.com/blog/state-of-web-gaming-report-2026)
- `robots.txt` disallows all URLs with a query string (`/*?`) — [Poki robots.txt](https://poki.com/robots.txt)

### Inferences
- For a free-to-play game that needs purchases, CrazyGames is the portal with visible infrastructure (Xsolla checkout linked to the portal account, purchase flag on game pages, purchase-enabled games at the top of the farming list). Nothing on poki.com mentions in-game purchases, and its FAQ frames Poki as free and ad-funded only.
- CrazyGames accepts games served from the developer's own domain inside an iframe, which fits a plan built around the client's own site: the same build can be the site and the portal version. Eight of the top 15 farm games are delivered that way.
- CrazyGames' friends list, lobby invites and instant join give a co-op game a ready-made way to bring friends in; on Poki, multiplayer exists but chat is restricted to preset messages, so co-op design there must work without free text.
- Poki's portrait rule, short-session advice and megabyte warnings are in tension with a 3D co-op farm built in Unity; Poki's own engineer points to web-native engines and delayed asset loading as the answer.
- Poki presents exclusivity as a selling point to players, and one farm developer is described as exclusive, yet at least four farm titles are on both portals (Farm Clash 3D, Crazy Pig Simulator, Idle Farming Business under the same slugs, and Tapfire's game under two names). Exclusivity is therefore negotiated per game, not universal.

### Gaps
- Not readable in this session (other hosts): `developer.crazygames.com`, `docs.crazygames.com`, `developers.poki.com`, `sdk.poki.com`, `about.crazygames.com`, `about.poki.com`. The submission process, revenue-share percentages, exclusivity terms, initial-download and total-size limits, and SDK reference for ads, purchases, accounts and invite links are therefore not verified first-hand.
- No statement about revenue share or minimum payout was found on either main domain.
- Poki's Terms of Use page was fetched but its text is loaded separately and was not extracted.
- Whether Xsolla on CrazyGames supports Brazilian payment methods such as Pix is not stated on the pages read.

## 6. Does anything in the live data contradict the earlier notes?

### Takeaway
Yes. The central earlier claim, that no scaled 3D farm game runs natively in the browser and that portal farm games are small casual titles, is contradicted by CrazyGames' own pages (Growden.io; merge farms with 20 to 28 million plays). Several ratings and one survey figure in the earlier notes are also wrong or outdated, and three cited game pages no longer exist.

### Cited Findings
Earlier notes: `/home/user/farmSimulator/research_notes/Mercado de jogos de fazenda/web_browser_top_farming_games.md`.

1. Earlier (section 7): "No scaled 3D farm game native to the browser surfaced" and "portal farm games are small casual titles". Live: Growden.io is tagged 3D, Multiplayer and With friends, has rooms of 2 to 6 players, 340,283 likes and 21,482,019 plays, on desktop and mobile — [Growden.io page](https://www.crazygames.com/game/grow-a-garden---growden-io); [CrazyGames /t/farming](https://www.crazygames.com/t/farming)
2. Earlier (section 1): Growden.io was noted only as "listed on a browser-games directory". Live: it is on CrazyGames itself, position 11 of the Farming tag, the tag page's "underrated" pick, and present in the secondary lists of the multiplayer, 3D, simulation and grow pages — [CrazyGames /t/farming](https://www.crazygames.com/t/farming); [CrazyGames /multiplayer](https://www.crazygames.com/multiplayer)
3. Earlier (section 7): CrazyGames farm titles are "small casual games (for example Farming Life, Blocky Farm, Farmerz); no audience figures were shown". Live: every game page shows likes and dislikes and list pages carry play counts; the leading farm-tag games have 5 to 28 million plays; Farming Life has 3,692 likes; the Blocky Farm and Farmerz URLs now redirect to the farming tag page — [CrazyGames /t/farming](https://www.crazygames.com/t/farming); [Farming Life page](https://www.crazygames.com/game/farming-life); [former Blocky Farm URL](https://www.crazygames.com/game/blocky-farm); [former Farmerz URL](https://www.crazygames.com/game/farmerz)
4. Earlier (section 1): "The Farmer 8.8 (9,440 votes)". Live: rating 8.4, 48,614 likes and 9,446 dislikes (58,060 votes); the earlier "votes" figure matches the dislike count — [The Farmer page](https://www.crazygames.com/game/the-farmer)
5. Earlier (section 1): "Country Life Meadows 8.7 (3,044)". Live: rating 8.5, 14,893 likes and 2,619 dislikes, 2,877,467 plays — [Country Life Meadows page](https://www.crazygames.com/game/country-life-meadows)
6. Earlier (section 1): "Farm Life 8.6 (572)". Live: rating 9.0, 735 likes and 101 dislikes, released April 2026 — [Farm Life page](https://www.crazygames.com/game/farm-life)
7. Earlier (section 1): "Harvest Kings 8.5 (1,917)". Live: the URL redirects to the farming tag page and the slug is absent from the sitemap, so the game is no longer listed — [former Harvest Kings URL](https://www.crazygames.com/game/harvest-kings); [CrazyGames sitemap](https://www.crazygames.com/en/sitemap)
8. Earlier (section 2, inference): "simulation/farm play is inside the 0.5% 'other' slice of playtime. Farm games on portals are a niche". Live: CrazyGames files its leading farming-tag games under Puzzle (the four merge games), Arcade and Clicker as well as Simulation, and two of them are at positions 11 and 15 of its All Games list of 4,691. Farm-themed play is not confined to the "other" slice. The 0.5% figure itself could not be checked — [CrazyGames /t/farming](https://www.crazygames.com/t/farming); [All Games page 1](https://www.crazygames.com/sitemap/games)
9. Earlier (sections 3 and 5): the statement that Farm Merge Valley players "can invite friends to their farms to complete tasks" was attributed to the CrazyGames farming page. Live: neither that page nor the game page mentions inviting friends; the game has no multiplayer tag and its multiplayer fields are empty on CrazyGames — [CrazyGames /t/farming](https://www.crazygames.com/t/farming); [Farm Merge Valley page](https://www.crazygames.com/game/farm-merge-valley)
10. Earlier (section 2): Poki's study says "37% of web gamers spend more than $50 a month on gaming". Live, on Poki's own page: "27% of web gamers spend more than $50 on gaming purchases each month"; 37% is the share who "play web games 'multiple times per day'" — [Poki blog, 25 Jun 2026](https://poki.com/blog/state-of-web-gaming-report-2026)
11. Earlier (section 2): "62% of web gamers became fans of a franchise after finding it in a browser game". Live wording: "62% of players have downloaded or purchased a game after discovering a game on web" — [Poki blog, 25 Jun 2026](https://poki.com/blog/state-of-web-gaming-report-2026)
12. Earlier (section 1 table): Farm Merge Valley "Launch Nov 2022 (Facebook)". Live: the CrazyGames summary says "Released August 2023" (portal release) while the description on the same page says "Release Date November 2022". Not a conflict, but two dates are in circulation — [Farm Merge Valley page](https://www.crazygames.com/game/farm-merge-valley)
13. Earlier (section 4): Poki's "default deal is a 5-year web exclusive" (third-party source). Live: poki.com confirms that exclusives exist but states no term, and at least four farm titles are on both portals, so exclusivity is not universal — [Poki FAQ](https://poki.com/en/c/faq); [CrazyGames Farm Clash 3D](https://www.crazygames.com/game/farm-clash-3d); [Poki Farm Clash 3D](https://poki.com/en/g/farm-clash-3d)

Confirmed by the live pages (no contradiction):
- Farm Merge Valley is 2nd in the CrazyGames farming list, is HTML5 and runs on desktop, mobile and tablet — [Farm Merge Valley page](https://www.crazygames.com/game/farm-merge-valley)
- CrazyGames reports "over 60 million monthly users" — [CrazyGames home](https://www.crazygames.com/)
- Poki reports "more than 100 million monthly active players in 2026, up from 10 million in 2020", and "53% plan to port mobile games to browser in the next 12 months" — [Poki blog, 25 Jun 2026](https://poki.com/blog/state-of-web-gaming-report-2026)
- Farm Merge Valley is not on Poki (no matching slug in Poki's games sitemap), which answers an open question in the earlier notes — [Poki games sitemap](https://poki.com/en/sitemaps/games.xml)
- None of the classic browser farm MMOs (Big Farm, Farmerama, Taonga, Klondike) is distributed on either portal — [CrazyGames sitemap](https://www.crazygames.com/en/sitemap); [Poki games sitemap](https://poki.com/en/sitemaps/games.xml)

### Inferences
- The earlier "open position" should be reworded from "no 3D multiplayer farm game with scale exists in the browser" to "the only 3D multiplayer farm games on the big portals are blocky, ad-funded copies of a Roblox hit; no original, co-operative, purchase-monetized 3D farm game is visible among the pages inspected".
- The earlier reading of portals as a low-traffic niche for farm games understated CrazyGames: merge and expedition farms are among its highest-placed games. It holds better for Poki, where the theme is a small category.
- The earlier figures taken from search-result extracts were unreliable for counts (a dislike count read as votes, stale ratings); list positions and qualitative descriptions held up.

### Gaps
- Third-party figures in the earlier notes about revenue share (Poki 50/50 and 100% on direct traffic; CrazyGames 60% of ads and 70% of purchases in a jam) could be neither confirmed nor contradicted, because the developer sites are on other hosts.
- The earlier notes' claims about Roblox, Facebook, Discord, YouTube Playables and web3 farms are outside what the two portals' pages can test.
