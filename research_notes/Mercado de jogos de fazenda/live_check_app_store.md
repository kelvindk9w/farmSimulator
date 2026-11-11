# Live check: Apple App Store rankings and listings for farm games, Brazil and US storefronts (primary-source snapshot, 2026-11-11)

> **Conditions and method (read first).** Everything under "Cited Findings" was read directly from Apple's own hosts (`apps.apple.com`, `itunes.apple.com`) with plain `curl` on **2026-11-11 between 13:33 and 13:46 UTC**. 119 requests in total (117 x HTTP 200, 2 x HTTP 429 on listing pages, both retried successfully). No third-party tracker, no search engine. Nothing here is a revenue or download figure: Apple publishes ranks, ratings and prices only.
>
> **Source keys used in the tables** (each is an exact URL that was fetched; all 2026-11-11):
> - **Web chart pages** (each page embeds two segments, "Top Free Games" and "Top Paid Games", 200 positions each: 25 full entries plus 175 app IDs in page order):
>   - W-BR-6014 <https://apps.apple.com/br/iphone/charts/6014> (the suggested URL `https://apps.apple.com/br/charts/iphone/top-free-games/6014` redirects here), W-BR-7015 <https://apps.apple.com/br/iphone/charts/7015>, W-BR-7003 <https://apps.apple.com/br/iphone/charts/7003>, W-BR-7009 <https://apps.apple.com/br/iphone/charts/7009>
>   - W-US-6014 <https://apps.apple.com/us/iphone/charts/6014>, W-US-7015 <https://apps.apple.com/us/iphone/charts/7015>, W-US-7003 <https://apps.apple.com/us/iphone/charts/7003>, W-US-7009 <https://apps.apple.com/us/iphone/charts/7009>
> - **Legacy RSS JSON feeds** (max 100 entries; `limit=200` still returns 100): pattern `https://itunes.apple.com/{br|us}/rss/{topgrossingapplications|topfreeapplications|toppaidapplications}/limit=100/genre={6014|7015|7003|7009}/json` (all 24 combinations fetched), plus top grossing for Adventure: <https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=7002/json> and <https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=7002/json>. Keys: G-BR-6014 = <https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=6014/json>, G-US-6014 = <https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=6014/json>, and so on for 7015, 7003, 7009, 7002.
> - **Lookup API** (batched, 70 app IDs per call): LOOKUP-BR = `https://itunes.apple.com/lookup?id=638689075,506627515,6746151928,...&country=br&entity=software`, LOOKUP-US = same with `country=us`. The single-ID form reproduces any row, for example <https://itunes.apple.com/lookup?id=638689075&country=br>. Eight further batched lookups (4 BR, 4 US) were used only to put names on chart positions 101-200.
> - **Search API**: for example <https://itunes.apple.com/search?term=fazenda&country=br&entity=software&limit=50> and <https://itunes.apple.com/search?term=farm&country=us&entity=software&limit=50>.
> - **Listing pages**: `https://apps.apple.com/br/app/id<ID>` and `https://apps.apple.com/us/app/id<ID>` (linked per row below). Data were taken from the JSON embedded in the page (`serialized-server-data` and the `software-application` JSON-LD block).
> - **Arcade pages**: <https://apps.apple.com/us/iphone/arcade>, <https://apps.apple.com/br/iphone/arcade>, <https://apps.apple.com/br/iphone/story/id1620272916> (Arcade "Simulação" category).
>
> **Reading rules.** "–" in a rank table means "not in the list inspected": top 100 for top grossing (RSS), top 200 for top free and top paid (web page). "Farm-themed" was identified by a keyword scan of titles and store descriptions (farm, fazenda, ranch, garden, jardim, harvest, colheita, hay, crop, tractor and similar) plus a manual read of every title in the lists. Garden-themed match-3, farm-themed match-3 and farm-themed solitaire are listed but labelled, because they are not farm simulations.
>
> **Raw data** (session scratchpad, not in the repository): `/tmp/claude-0/-home-user-farmSimulator/75f055d1-b764-53b5-8075-88db93a673a3/scratchpad/appstore_raw/` (downloads), `/tmp/claude-0/-home-user-farmSimulator/75f055d1-b764-53b5-8075-88db93a673a3/scratchpad/appstore_scripts/requests.log` (every URL with UTC timestamp and HTTP status), `/tmp/claude-0/-home-user-farmSimulator/75f055d1-b764-53b5-8075-88db93a673a3/scratchpad/appstore_out/` (per-listing extracts).

## 1. What are the current chart positions of farm-themed games on the Brazil and US storefronts?

### Takeaway
The legacy top-grossing RSS feed still works and shows Township at #14 (BR) and #13 (US) among all iPhone games, with Hay Day at #29 in Brazil but only #87 in the US. Brazil has five farm-themed titles in the top 100 grossing games (Township, Hay Day, Family Farm Merge, Farm Heroes Saga, Family Island) against two in the US, not counting the garden-themed match-3 Gardenscapes (#10 BR, #14 US); the paid chart in both countries is led for the genre by Stardew Valley (#5 BR, #7 US) and Farming Simulator 26 Mobile (#8 BR, #29 US).

### Cited Findings

#### What Apple returns (list lengths and reliability)
- The legacy top-grossing feed is alive: all 10 top-grossing feeds requested returned HTTP 200 with exactly 100 entries each; `limit=200` also returns 100 — [G-BR-6014](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=6014/json); [limit=200 test](https://itunes.apple.com/br/rss/topgrossingapplications/limit=200/genre=6014/json)
- The feed's `updated` field equals the request time (for example `2026-11-11T05:33:00-07:00` for a request at 13:33 UTC), so it is not a data timestamp. The lists contain 2026 releases (Family Farm Merge, released 2026-05-09, is BR #52), which shows the data are current — [G-BR-6014](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=6014/json); release date from [Lookup](https://itunes.apple.com/lookup?id=6760998152&country=br)
- The web chart pages expose only two segments, top free and top paid; there is no top-grossing segment on the page — [W-BR-6014](https://apps.apple.com/br/iphone/charts/6014); [W-US-6014](https://apps.apple.com/us/iphone/charts/6014)
- Each web chart page lists 200 positions per segment. In 15 of the 16 free/paid lists the RSS top 100 has the same order as the web list (the RSS paid feeds simply omit up to 5 apps, returning 95-100 entries), which confirms that the 175 trailing app IDs on the web page are in rank order — web and RSS sources listed in the preamble
- The Brazil Games (6014) charts were refreshed by Apple during the fetch window. The page was read twice, at 13:33 and 13:36 UTC: only 36 of 200 top-free positions and 28 of 200 top-paid positions were identical between the two reads. Farm titles moved as follows: Hay Day top free 101 → 96, Family Farm Merge 53 → 46, Township 39 → 40; Farming Simulator 23 top paid 25 → 26, Farming Simulator 20 30 → 29, Slime Rancher 159 → 153; Stardew Valley (5) and Farming Simulator 26 (8) did not move. The tables below use the later read — [W-BR-6014](https://apps.apple.com/br/iphone/charts/6014) (two fetches); [RSS BR free 6014](https://itunes.apple.com/br/rss/topfreeapplications/limit=100/genre=6014/json); [RSS BR paid 6014](https://itunes.apple.com/br/rss/toppaidapplications/limit=100/genre=6014/json)
- Sub-genre charts depend on the two game sub-genres a title declares. Township is filed under Puzzle and Casual, so it appears in Casual but not in Simulation or Family; Hay Day is filed under Simulation and Family — [Township BR listing](https://apps.apple.com/br/app/id638689075); [Hay Day BR listing](https://apps.apple.com/br/app/id506627515)

#### Brazil, top grossing (iPhone, top 100 per list)
Columns: Games 6014 | Simulation 7015 | Casual 7003 | Family 7009 | Adventure 7002.

| Title (developer) | Games | Sim | Casual | Family | Adventure |
|---|---|---|---|---|---|
| Township (Playrix) | 14 | – | 7 | – | – |
| Hay Day (Supercell) | 29 | 5 | – | 1 | – |
| Family Farm Merge (Century Games Innovation) | 52 | – | 22 | – | – |
| Family Island (Melsoft) | 99 | 19 | – | – | 14 |
| Heartopia (XD Entertainment) | – | 30 | – | 6 | – |
| Klondike Adventures (VIZOR APPS) | – | 34 | – | – | 24 |
| Farming Simulator 26 Mobile (GIANTS, paid) | – | 37 | – | – | – |
| Little Farm Story (SayGames) | – | 39 | 68 | – | – |
| The Cozy Florist (RiftSky Games) | – | 42 | 75 | – | – |
| Stardew Valley (ConcernedApe, paid) | – | 44 | – | – | – |
| Goodville (Goodville AG) | – | 58 | – | – | 34 |
| Fazenda Feliz Pocket = Family Farm Seaside (DianDian) | – | 70 | – | 15 | – |
| Gardenship: Flora's Secret (FunRealm) | – | 98 | – | – | – |
| FarmVille 2: Country Escape (Zynga) | – | – | – | 22 | – |
| Family Bay: Mescle e Cultive (Moon Active) | – | – | – | 27 | – |
| FarmVille 3 (Zynga) | – | – | – | 28 | – |
| Farming Simulator 20 (GIANTS, paid) | – | – | – | 36 | – |
| Big Farm Homestead (Goodgame Studio) | – | – | – | 45 | – |
| Big Farm: Mobile Harvest (Goodgame Studio) | – | – | – | 60 | – |
| Sunshine Island (Goodgame Studio) | – | – | – | 64 | – |
| Wild West (Social Quantum) | – | – | – | 74 | – |
| Farming Simulator 16 (GIANTS) | – | – | – | 75 | – |
| FarmVille 2: Paraíso Tropical (Zynga) | – | – | – | 79 | – |
| Golden Farm (Playgenes) | – | – | – | 92 | – |
| Family Farm Adventure (Century Games) | – | – | – | – | 69 |
| *Garden or farm theme, not a farm sim:* Gardenscapes (Playrix, match-3) | 10 | – | 6 | – | – |
| *same:* Farm Heroes Saga (King, match-3) | 75 | – | 32 | – | – |
| *same:* Solitaire Grand Harvest (Supertreat) | – | – | 73 | – | – |
| *same:* Lily's Garden (Tactile Games, match-3) | – | – | – | 46 | – |

Sources: [G-BR-6014](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=6014/json); [G-BR-7015](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=7015/json); [G-BR-7003](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=7003/json); [G-BR-7009](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=7009/json); [G-BR-7002](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=7002/json). Fetched 2026-11-11.

- Context, BR top 15 grossing games: 1 Roblox, 2 Gossip Harbor, 3 Candy Crush Saga, 4 Free Fire, 5 Royal Match, 6 Coin Master, 7 Pokémon GO, 8 Clash of Clans, 9 Tasty Travels, 10 Gardenscapes, 11 eFootball, 12 Kingshot, 13 Honkai: Star Rail, 14 Township, 15 Brawl Stars — [G-BR-6014](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=6014/json)

#### United States, top grossing (iPhone, top 100 per list)

| Title (developer) | Games | Sim | Casual | Family | Adventure |
|---|---|---|---|---|---|
| Township (Playrix) | 13 | – | 5 | – | – |
| Hay Day (Supercell) | 87 | 7 | – | 2 | – |
| The Cozy Florist (RiftSky Games) | – | 28 | 69 | – | – |
| Goodville (Goodville AG) | – | 42 | – | – | 21 |
| Family Island (Melsoft) | – | 49 | – | – | 25 |
| Klondike Adventures (VIZOR APPS) | – | 58 | – | – | 29 |
| Little Farm Story (SayGames) | – | 72 | – | – | – |
| Egg, Inc. (Auxbrain, idle egg farm) | – | 83 | – | – | – |
| Heartopia (XD Entertainment) | – | 86 | – | 18 | – |
| FarmVille 3 (Zynga) | – | 100 | – | 20 | – |
| FarmVille 2: Country Escape (Zynga) | – | – | – | 24 | – |
| Sunshine Island (Goodgame Studio) | – | – | – | 33 | – |
| Big Farm Homestead (Goodgame Studio) | – | – | – | 34 | – |
| Family Farm Merge (Century Games Innovation) | – | – | 46 | – | – |
| Animal Crossing: Pocket Camp Complete (Nintendo, paid) | – | – | – | 63 | – |
| Family Bay: Merge & Farm (Moon Active) | – | – | – | 65 | – |
| Family Farm Seaside (DianDian) | – | – | – | 69 | – |
| Smurfs' Village (Garden City Games) | – | – | – | 88 | – |
| Harvest Land (MTAG Publishing) | – | – | – | 92 | – |
| Magic Garden: Grow & Collect (Magic Circle Studio) | – | – | – | 93 | – |
| FarmVille 2: Tropic Escape (Zynga) | – | – | – | 97 | – |
| Family Farm Adventure (Century Games) | – | – | – | – | 50 |
| *Garden or farm theme, not a farm sim:* Gardenscapes (match-3) | 14 | – | 6 | – | – |
| *same:* Solitaire Grand Harvest | – | – | 39 | – | – |
| *same:* Farm Heroes Saga (match-3) | – | – | 62 | – | – |
| *same:* Lily's Garden (match-3) | – | – | – | 14 | – |

Sources: [G-US-6014](https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=6014/json); [G-US-7015](https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=7015/json); [G-US-7003](https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=7003/json); [G-US-7009](https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=7009/json); [G-US-7002](https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=7002/json). Fetched 2026-11-11.

- Context, US top 15 grossing games: 1 MONOPOLY GO!, 2 Roblox, 3 Pokémon GO, 4 Gossip Harbor, 5 Royal Match, 6 Honkai: Star Rail, 7 Candy Crush Saga, 8 Royal Kingdom, 9 Kingshot, 10 Whiteout Survival, 11 Free Fire, 12 Last War, 13 Township, 14 Gardenscapes, 15 Last Z — [G-US-6014](https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=6014/json)

#### Brazil, top free (iPhone, top 200 per list)
Columns: Games 6014 | Simulation 7015 | Casual 7003 | Family 7009.

| Title | Games | Sim | Casual | Family |
|---|---|---|---|---|
| Township | 40 (39 before the refresh) | – | 20 | – |
| Family Farm Merge | 46 (53 before the refresh) | – | 24 | – |
| Hay Day | 96 (101 before the refresh) | 21 | – | 3 |
| Klondike Adventures | – | 69 | – | – |
| Little Farm Story | – | 115 | 173 | – |
| FarmVille 2: Country Escape | – | 126 | – | 30 |
| Farming Simulator 23 NETFLIX (Netflix) | – | 129 | – | – |
| Gardenship: Flora's Secret | – | 135 | 191 | – |
| Heartopia | – | 144 | – | 34 |
| Big Farm Homestead | – | 186 | – | 43 |
| Farming Simulator 18 (GIANTS, free) | – | – | – | 54 |
| Bloom City (MEGA COMBAT GLOBAL; online farm/life game) | – | – | – | 73 |
| Farming Simulator 16 (GIANTS, free) | – | – | – | 77 |
| Fazenda Feliz Pocket (Family Farm Seaside) | – | – | – | 80 |
| My Dear Farm (HyperBeard) | – | – | – | 156 |
| Golden Farm | – | – | – | 159 |
| FarmVille 3 | – | – | – | 170 |
| Farming Simulator 14 (GIANTS, free) | – | – | – | 180 |
| Florisium (Byway Games) | – | – | – | 190 |
| *Not a farm sim:* Gardenscapes (match-3) | 11 | – | 6 | – |
| *same:* Lily's Garden (match-3) | – | – | – | 65 |
| *same:* Farm Heroes Saga (match-3) | – | – | 118 | – |

Sources: [W-BR-6014](https://apps.apple.com/br/iphone/charts/6014); [W-BR-7015](https://apps.apple.com/br/iphone/charts/7015); [W-BR-7003](https://apps.apple.com/br/iphone/charts/7003); [W-BR-7009](https://apps.apple.com/br/iphone/charts/7009); ranks 1-100 cross-checked against the `topfreeapplications` feeds, for example [RSS BR free 6014](https://itunes.apple.com/br/rss/topfreeapplications/limit=100/genre=6014/json). Fetched 2026-11-11.

#### United States, top free (iPhone, top 200 per list)

| Title | Games | Sim | Casual | Family |
|---|---|---|---|---|
| Township | 11 | – | 8 | – |
| Family Farm Merge | 80 | – | 41 | – |
| Little Farm Story: Idle Tycoon | – | 36 | 106 | – |
| Hay Day | – | 48 | – | 9 |
| Klondike Adventures | – | 79 | – | – |
| Gardenship: Flora's Secret | – | 117 | – | – |
| Goodville | – | 118 | – | – |
| Fruit Juice Farm (M8 Games) | – | 140 | – | – |
| FarmVille 3 | – | 164 | – | 33 |
| Egg, Inc. | – | 169 | – | – |
| The Farmer Was Replaced (Timon Herzog, released 2026-11-02) | – | 175 | – | – |
| The Cozy Florist | – | 176 | – | – |
| Big Farm Homestead | – | 196 | – | 41 |
| Hello Kitty Island Intro (Sunblink, free intro of the Arcade game) | – | – | – | 46 |
| FarmVille 2: Country Escape | – | – | – | 53 |
| Heartopia | – | – | – | 67 |
| Adorable Garden (Skyborne Games) | – | – | – | 88 |
| Harvest Land | – | – | – | 101 |
| Sunshine Island | – | – | – | 113 |
| Farming Simulator 18 | – | – | – | 122 |
| Family Bay: Merge & Farm | – | – | – | 138 |
| Big Farm: Mobile Harvest | – | – | – | 181 |
| Farming Simulator 16 | – | – | – | 182 |
| Florisium | – | – | – | 183 |
| *Not a farm sim:* Gardenscapes (match-3) | 53 | – | 27 | – |

Sources: [W-US-6014](https://apps.apple.com/us/iphone/charts/6014); [W-US-7015](https://apps.apple.com/us/iphone/charts/7015); [W-US-7003](https://apps.apple.com/us/iphone/charts/7003); [W-US-7009](https://apps.apple.com/us/iphone/charts/7009); ranks 1-100 identical in the `topfreeapplications` feeds, for example [RSS US free 6014](https://itunes.apple.com/us/rss/topfreeapplications/limit=100/genre=6014/json). Fetched 2026-11-11.

#### Brazil, top paid (iPhone, top 200 per list)

| Title (BR price) | Games | Sim | Casual | Family |
|---|---|---|---|---|
| Stardew Valley (R$ 29,90) | 5 | 3 | – | – |
| Farming Simulator 26 Mobile (R$ 39,90) | 8 | 6 | – | – |
| Farming Simulator 23 (R$ 24,90) | 26 (25 before the refresh) | 11 | – | – |
| Farming Simulator 20 (R$ 22,99) | 29 (30 before the refresh) | 14 | – | 3 |
| Slime Rancher (Playdigious, R$ 19,90) | 153 | 57 | – | – |
| Animal Crossing: Pocket Camp Complete (R$ 58,90) | 189 | 73 | – | 14 |
| Spirit of the Island (Plug In Digital, R$ 24,90) | – | 109 | – | – |
| Farming USA 2 (Bowen Games, R$ 24,90) | – | 110 | – | 18 |
| Farm Frenzy 3 Madagascar (Alawar, R$ 19,90) | – | 133 | 56 | – |
| Minha Vida em Portia / My Time at Portia (Pathea, R$ 49,90) | – | 135 | – | – |
| CotBot Farm (kids, R$ 19,90) | – | – | – | 27 |
| My Town : Farm (kids, R$ 24,90) | – | – | – | 106 |
| Os Animais da Quinta (kids, R$ 24,90) | – | – | – | 151 |
| Super Farming Boy (Renxo, R$ 0,90) | – | – | 170 | – |
| Flower Garden (Snappy Touch, R$ 19,90) | – | – | – | 177 |

Sources: [W-BR-6014](https://apps.apple.com/br/iphone/charts/6014); [W-BR-7015](https://apps.apple.com/br/iphone/charts/7015); [W-BR-7003](https://apps.apple.com/br/iphone/charts/7003); [W-BR-7009](https://apps.apple.com/br/iphone/charts/7009); [RSS BR paid 6014](https://itunes.apple.com/br/rss/toppaidapplications/limit=100/genre=6014/json); [RSS BR paid 7015](https://itunes.apple.com/br/rss/toppaidapplications/limit=100/genre=7015/json). Fetched 2026-11-11.

- BR top 5 paid Simulation: 1 Minecraft (R$ 10,90), 2 Pou (R$ 12,90), 3 Stardew Valley (R$ 29,90), 4 Plague Inc. (R$ 6,90), 5 RFS - Real Flight Simulator (R$ 6,90) — [RSS BR paid 7015](https://itunes.apple.com/br/rss/toppaidapplications/limit=100/genre=7015/json)

#### United States, top paid (iPhone, top 200 per list)

| Title (US price) | Games | Sim | Casual | Family |
|---|---|---|---|---|
| Stardew Valley ($4.99) | 7 | 3 | – | – |
| Farming Simulator 26 Mobile ($7.99) | 29 | 11 | – | – |
| Animal Crossing: Pocket Camp Complete ($19.99) | 45 | 17 | – | 5 |
| Tiny Terraces (Jaxon Gallegos Garcia, idle farming, $1.99) | 129 | 49 | 13 | – |
| Slime Rancher ($7.99) | – | 65 | – | – |
| Farming Simulator 23 Mobile ($5.99) | – | 126 | – | – |
| American Farming (SquadBuilt, $7.99) | – | 137 | – | – |
| Farming Simulator 20 ($4.99) | – | 142 | – | 35 |
| My Time at Portia ($7.99) | – | 144 | – | – |
| Farm Frenzy 3 Madagascar ($2.99) | – | 150 | 82 | – |
| Farming USA 2 ($3.99) | – | 152 | – | 38 |
| The Farming Game 3D (Ryan Tensmeyer, $1.99) | – | 184 | – | – |
| Harvest Moon: Home Sweet Home (Natsume, $17.99) | – | 193 | – | – |
| Vineyard Director (Sports Stats, $1.99) | – | 199 | 101 | – |
| The Orchard by HABA (kids board game, $3.99) | – | – | – | 72 |
| CozyBarn (David Catuhe, released 2026-10-31, $4.99) | – | – | 198 | – |

Sources: [W-US-6014](https://apps.apple.com/us/iphone/charts/6014); [W-US-7015](https://apps.apple.com/us/iphone/charts/7015); [W-US-7003](https://apps.apple.com/us/iphone/charts/7003); [W-US-7009](https://apps.apple.com/us/iphone/charts/7009); [RSS US paid 7015](https://itunes.apple.com/us/rss/toppaidapplications/limit=100/genre=7015/json). Fetched 2026-11-11.

- US top 5 paid Simulation: 1 Minecraft ($6.99), 2 Plague Inc. ($0.99), 3 Stardew Valley ($4.99), 4 Bills Must Be Paid ($5.99), 5 Papa's Freezeria To Go! ($0.99) — [RSS US paid 7015](https://itunes.apple.com/us/rss/toppaidapplications/limit=100/genre=7015/json)

#### Candidates that appear in none of the lists
- My Garden Tale (app 6751532378; BR title "Meu Mundo do Jardim") is in none of the 26 top-grossing/free/paid RSS lists (top 100) and none of the 16 web free/paid lists (top 200) in either country — all chart sources above; identity from [BR listing](https://apps.apple.com/br/app/id6751532378) and [US listing](https://apps.apple.com/us/app/id6751532378)
- Family Farm Adventure is absent from the Games, Simulation, Casual and Family lists in both countries; it shows only in Adventure top grossing (BR #69, US #50) — [G-BR-7002](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=7002/json); [G-US-7002](https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=7002/json)
- Big Farm: Mobile Harvest is in no US top-grossing list (top 100) and only at #181 in US top free Family; in Brazil it is #60 in Family top grossing — [G-US-7009](https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=7009/json); [W-US-7009](https://apps.apple.com/us/iphone/charts/7009); [G-BR-7009](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=7009/json)
- "Farm Merge Valley": the Search API returns no app with that name in either storefront (US results: Hay Day, Merge Farm!, Farm Merge, Merge County and others; BR results: Merge Valley: Farm Tycoon by Pixelation Labs with 0 ratings, and others) — [US search](https://itunes.apple.com/search?term=farm+merge+valley&country=us&entity=software&limit=8); [BR search](https://itunes.apple.com/search?term=farm+merge+valley&country=br&entity=software&limit=8)
- No Apple Arcade title appears in any top-free or top-paid list read (see section 4) — all web chart sources above

#### Chart-position badge shown on each listing (independent cross-check)
- Township: BR "Nº18 Quebra-cabeça" (Puzzle), US "#8 Casual" (matches the US Casual free rank read above) — [BR](https://apps.apple.com/br/app/id638689075); [US](https://apps.apple.com/us/app/id638689075)
- Hay Day: BR "Nº3 Família", US "#9 Family" (both match the tables above) — [BR](https://apps.apple.com/br/app/id506627515); [US](https://apps.apple.com/us/app/id506627515)
- Stardew Valley: BR "Nº1 RPG", US "#1 Roleplaying" — [BR](https://apps.apple.com/br/app/id1406710800); [US](https://apps.apple.com/us/app/id1406710800)
- Klondike Adventures: BR "Nº20 Aventura", US "#22 Adventure" — [BR](https://apps.apple.com/br/app/id1127240206); [US](https://apps.apple.com/us/app/id1127240206)
- Family Island: US "#73 Adventure" (no badge on the BR page); Family Farm Adventure: BR "Nº126 Aventura", US "#112 Adventure"; Goodville: BR "Nº117 Aventura", US "#34 Adventure" — [Family Island US](https://apps.apple.com/us/app/id1464689103); [FFA BR](https://apps.apple.com/br/app/id1543158709); [FFA US](https://apps.apple.com/us/app/id1543158709); [Goodville BR](https://apps.apple.com/br/app/id1459249040); [Goodville US](https://apps.apple.com/us/app/id1459249040)
- Family Farm Merge: BR "Nº22 Quebra-cabeça", US "#41 Casual" — [BR](https://apps.apple.com/br/app/id6760998152); [US](https://apps.apple.com/us/app/id6760998152)

### Inferences
- On these two storefronts the revenue order of farm-themed games on iPhone, read from Apple's own top-grossing ranks, is Township, then Hay Day, then a gap. In Brazil the next farm-themed titles in the overall games list are Family Farm Merge (#52) and Family Island (#99); in the US nothing else farm-themed is in the top 100. Ranks are ordinal, so the size of the gaps is not known from this source.
- Hay Day over-indexes in Brazil relative to the US (#29 against #87 overall; #1 against #2 in Family), and Brazil has more farm titles in its top 100 grossing games (5 against 2). Brazil looks like a comparatively receptive storefront for the genre, though a rank in a smaller market means less money than the same rank in the US.
- Heartopia is not a top-3 farm earner on iPhone in either storefront at this snapshot: Family Island outranks it in Simulation top grossing in both countries (BR 19 against 30; US 49 against 86). Its strength is the Family list (BR #6, US #18).
- Family Farm Merge (released May 2026, a merge game in a farm setting) is the strongest 2026 farm-themed entrant in Brazil by grossing rank (#52 overall) and the only 2026 farm-themed release inside the top 100 free games in both countries. The Cozy Florist (garden and flower-shop sim, released December 2025) is the other new name that matters: US Simulation grossing #28, behind Hay Day (#7) but ahead of every farm-adventure title there.
- The GIANTS back catalogue sells unusually well in Brazil: three paid Farming Simulator titles sit in the BR top 30 paid games (#8, #26, #29) while only FS26 is in the US top 200 paid games (#29). Premium machinery sims have a real paid audience in Brazil.
- Two online/multiplayer life-and-farm games are visible in the Brazilian Family charts: Heartopia (grossing #6, free #34) and the newly released Bloom City (free #73, only 13 BR ratings). These are the closest live comparables to a 3D multiplayer farm game.

### Gaps
- Top grossing is limited to the top 100 per list; positions beyond 100 are not available from Apple. Apple gives no revenue, download or active-user figures.
- 26 chart entries at positions 101-200 (11 BR, 15 US app IDs) returned nothing from the Lookup API and remain unnamed; a farm title could be among them.
- Only the four requested genres plus Adventure top grossing were read. Township's and Family Farm Merge's own sub-genre (Puzzle, 7012) was not read, and iPad charts were not read.
- The time at which Apple computed each chart is not exposed; only the fetch time is known. Ranks move within the day (the BR Games chart refreshed mid-session and Hay Day shifted five places in top free), so this is a single-moment snapshot, not a daily average. Mid-table positions, especially in the low-volume BR paid lists, should be read as approximate.

## 2. Listing data for each candidate (developer, price, ratings, age rating, release, last update, genre, in-app purchases)

### Takeaway
All candidate listings were read on both storefronts. The most consequential finding for a Brazilian studio is the age rating: every farm game whose listing declares loot boxes ("Caixas de recompensas") carries **A18** on the Brazil storefront (Township, Hay Day, Family Island, Klondike, Family Farm Adventure, both FarmVilles and others), while the same apps are 9+ to 16+ in the US; farm games that do not declare loot boxes sit at A12-A16 in Brazil.

### Cited Findings

#### Identity, price, ratings (ratings: average / count)
Average is the Lookup API value rounded to two decimals; the listing page shows the same count and a one-decimal average. All rows: LOOKUP-BR / LOOKUP-US plus the linked listings, fetched 2026-11-11.

| Game (app ID) | Developer / seller | Price BR / US | Rating BR | Rating US | Listings |
|---|---|---|---|---|---|
| Township (638689075) | Playrix / PLR Worldwide Sales Limited | Free / Free | 4.82 / 238,870 | 4.75 / 2,234,188 | [BR](https://apps.apple.com/br/app/id638689075) [US](https://apps.apple.com/us/app/id638689075) |
| Hay Day (506627515) | Supercell / Supercell Oy | Free / Free | 4.77 / 139,744 | 4.70 / 655,177 | [BR](https://apps.apple.com/br/app/id506627515) [US](https://apps.apple.com/us/app/id506627515) |
| Heartopia (6746151928) | XD Entertainment Co., Ltd. | Free / Free | 4.61 / 4,952 | 4.56 / 36,029 | [BR](https://apps.apple.com/br/app/id6746151928) [US](https://apps.apple.com/us/app/id6746151928) |
| My Garden Tale; BR title "Meu Mundo do Jardim" (6751532378) | Modo Game / MODO PTE. LTD. | Free / Free | 4.50 / 22 | 4.72 / 1,975 | [BR](https://apps.apple.com/br/app/id6751532378) [US](https://apps.apple.com/us/app/id6751532378) |
| The Cozy Florist (6754878717) | RiftSky Games / RiftSky Games Co.,Limited | Free / Free | 4.82 / 2,444 | 4.77 / 33,069 | [BR](https://apps.apple.com/br/app/id6754878717) [US](https://apps.apple.com/us/app/id6754878717) |
| Family Island (1464689103) | Melsoft | Free / Free | 4.74 / 35,462 | 4.76 / 422,235 | [BR](https://apps.apple.com/br/app/id1464689103) [US](https://apps.apple.com/us/app/id1464689103) |
| Klondike Adventures (1127240206) | VIZOR APPS LTD | Free / Free | 4.73 / 17,060 | 4.67 / 131,524 | [BR](https://apps.apple.com/br/app/id1127240206) [US](https://apps.apple.com/us/app/id1127240206) |
| Family Farm Adventure (1543158709) | Century Games Pte. Ltd. | Free / Free | 4.66 / 8,340 | 4.64 / 56,035 | [BR](https://apps.apple.com/br/app/id1543158709) [US](https://apps.apple.com/us/app/id1543158709) |
| FarmVille 3 – Farm Animals (843506607) | Zynga Inc. | Free / Free | 4.80 / 3,926 | 4.66 / 84,640 | [BR](https://apps.apple.com/br/app/id843506607) [US](https://apps.apple.com/us/app/id843506607) |
| FarmVille 2: Country Escape (824318267) | Zynga Inc. | Free / Free | 4.71 / 29,766 | 4.63 / 237,263 | [BR](https://apps.apple.com/br/app/id824318267) [US](https://apps.apple.com/us/app/id824318267) |
| Stardew Valley (1406710800) | ConcernedApe / ConcernedApe LLC | R$ 29,90 / $4.99 | 4.71 / 4,100 | 4.81 / 63,712 | [BR](https://apps.apple.com/br/app/id1406710800) [US](https://apps.apple.com/us/app/id1406710800) |
| Stardew Valley+ (6449264810) | ConcernedApe | Apple Arcade | 4.00 / 274 | 4.23 / 2,271 | [BR](https://apps.apple.com/br/app/id6449264810) [US](https://apps.apple.com/us/app/id6449264810) |
| Farming Simulator 26 Mobile (6748056918) | GIANTS Software GmbH | R$ 39,90 / $7.99 | 3.31 / 285 | 3.97 / 473 | [BR](https://apps.apple.com/br/app/id6748056918) [US](https://apps.apple.com/us/app/id6748056918) |
| Farming Simulator 23 Mobile (6444400410) | GIANTS Software GmbH | R$ 24,90 / $5.99 | 4.11 / 783 | 4.34 / 2,213 | [BR](https://apps.apple.com/br/app/id6444400410) [US](https://apps.apple.com/us/app/id6444400410) |
| Farming Simulator 20 (1478611992) | GIANTS Software GmbH | R$ 22,99 / $4.99 | 4.30 / 1,381 | 4.40 / 8,858 | [BR](https://apps.apple.com/br/app/id1478611992) [US](https://apps.apple.com/us/app/id1478611992) |
| Big Farm: Mobile Harvest (1215668882) | Goodgame Studio / Stillfront Germany GmbH | Free / Free | 4.70 / 3,752 | 4.59 / 31,841 | [BR](https://apps.apple.com/br/app/id1215668882) [US](https://apps.apple.com/us/app/id1215668882) |
| *Found in charts, not on the original list:* Family Farm Merge (6760998152) | Century Games Innovation Pte. Ltd. | Free / Free | 4.32 / 1,143 | 4.54 / 4,001 | [BR](https://apps.apple.com/br/app/id6760998152) [US](https://apps.apple.com/us/app/id6760998152) |
| Big Farm Homestead (6742455668) | Goodgame Studio / Stillfront Germany GmbH | Free / Free | 4.89 / 483 | 4.72 / 3,359 | [BR](https://apps.apple.com/br/app/id6742455668) [US](https://apps.apple.com/us/app/id6742455668) |
| Sunshine Island (6443624260) | Goodgame Studio / Stillfront Germany GmbH | Free / Free | 4.75 / 557 | 4.67 / 12,643 | [BR](https://apps.apple.com/br/app/id6443624260) [US](https://apps.apple.com/us/app/id6443624260) |
| Family Farm Seaside; BR "Fazenda Feliz Pocket" (539920547) | DianDian Interactive Holding | Free / Free | 4.69 / 9,990 | 4.64 / 36,540 | [BR](https://apps.apple.com/br/app/id539920547) [US](https://apps.apple.com/us/app/id539920547) |
| Goodville (1459249040) | Goodville AG | Free / Free | 4.74 / 1,620 | 4.61 / 52,867 | [BR](https://apps.apple.com/br/app/id1459249040) [US](https://apps.apple.com/us/app/id1459249040) |
| Little Farm Story (6733244789) | SayGames LTD | Free / Free | 4.73 / 5,404 | 4.54 / 40,829 | [BR](https://apps.apple.com/br/app/id6733244789) [US](https://apps.apple.com/us/app/id6733244789) |
| Family Bay: Merge & Farm (6753110925) | Moon Active / Moon Active LTD | Free / Free | 4.69 / 35 | 4.62 / 425 | [BR](https://apps.apple.com/br/app/id6753110925) [US](https://apps.apple.com/us/app/id6753110925) |
| Bloom City (6766778393) | MEGA COMBAT GLOBAL LIMITED | Free / Free | 4.77 / 13 | 4.00 / 2 | [BR](https://apps.apple.com/br/app/id6766778393) [US](https://apps.apple.com/us/app/id6766778393) |

- Lookup-only context rows (LOOKUP-BR / LOOKUP-US): Gardenscapes BR 4.74 / 238,423, US 4.69 / 1,698,178; Farm Heroes Saga BR 4.64 / 27,972, US 4.58 / 94,989; Egg, Inc. BR 4.87 / 10,477, US 4.80 / 563,118; Animal Crossing: Pocket Camp Complete R$ 58,90 and 4.64 / 165 in BR, $19.99 and 4.80 / 9,830 in the US — reproducible with <https://itunes.apple.com/lookup?id=1105855019,608206510,993492744,6547834967&country=br> (and `country=us`)
- "Editors' Choice" badge present on the US listings of Stardew Valley and FarmVille 2: Country Escape; on no other candidate page read — [Stardew US](https://apps.apple.com/us/app/id1406710800); [FV2 US](https://apps.apple.com/us/app/id824318267)

#### Age rating, declared content, dates, genre
Age rating and "contains" declarations are from the listing page (BR shows the Brazilian classification label, US shows Apple's label). Release and update dates are from the Lookup API. "Ads / Loot / Chat" = whether the age-rating panel lists Advertising, Loot Boxes ("Caixas de recompensas"), Messaging and Chat. Primary genre is "Games" for every row; the table gives the listing's Category plus the two sub-genres.

| Game | Age BR / US | Ads / Loot / Chat declared | Release (App Store) | Last update (version) | Category; sub-genres |
|---|---|---|---|---|---|
| Township | A18 / 13+ | no / yes / yes | 2013-10-23 (BR), 2013-10-24 (US) | 2026-10-28 (40.0.0) | Casual; Puzzle, Casual |
| Hay Day | A18 / 9+ | yes / yes / yes | 2012-06-21 | 2026-10-20 (1.73.89) | Simulation; Simulation, Family |
| Heartopia | A16 / 13+ | no / no / yes (also user-generated content, social media) | 2026-01-07 | 2026-08-25 (0.5.5) | Simulation; Simulation, Family |
| My Garden Tale | A18 / 9+ | yes / yes / yes | 2026-02-01 (US), 2026-06-28 (BR) | 2026-09-02 (1.2.6) | Simulation; Casual, Simulation |
| The Cozy Florist | 18 / 9+ | yes (US panel) / yes / yes | 2025-12-04 | 2026-11-05 (1.0.77) | Simulation; Simulation, Casual |
| Family Island | A18 / 16+ | yes / yes / yes | 2019-11-18 | 2026-10-26 (2026370.0.94474) | Adventure; Adventure, Simulation |
| Klondike Adventures | A18 / 13+ | yes / yes / no | 2018-04-04 | 2026-11-05 (2.153.1) | Simulation; Simulation, Adventure |
| Family Farm Adventure | A18 / 13+ | yes / yes / yes (also simulated gambling, UGC, social media) | 2021-04-14 | 2026-10-27 (6.11.1) | Adventure; Adventure, Simulation |
| FarmVille 3 | A18 / 9+ | yes / yes / yes | 2021-11-02 | 2026-11-11 (1.81.55531) | Family; Simulation, Family |
| FarmVille 2: Country Escape | A18 / 13+ | yes / yes / yes | 2014-04-17 | 2026-10-26 (31.1.200) | Family; Family, Simulation |
| Stardew Valley | A14 / 13+ | no / no / no | 2018-10-24 | 2026-03-19 (1.6.15.1) | Role Playing; RPG, Simulation |
| Stardew Valley+ | A14 / 13+ | no / no / no | 2023-07-21 | 2025-06-05 (1.6.15.1) | (Arcade); RPG, Simulation |
| Farming Simulator 26 Mobile | A12 / 4+ | yes / no / no | 2026-05-19 | 2026-09-10 (1.5.0) | Simulation |
| Farming Simulator 23 Mobile | AL / 4+ | no / no / no | 2023-05-23 | 2024-12-10 (1.7) | Simulation |
| Farming Simulator 20 | AL / 4+ | no / no / no | 2019-12-03 | 2022-12-15 (1.1.13) | Simulation; Simulation, Family |
| Big Farm: Mobile Harvest | A12 / 4+ | yes / no / yes | 2017-10-25 | 2026-10-27 (10.98.40354) | Family; Simulation, Family |
| Family Farm Merge | A18 / 13+ | yes / yes / no (also simulated gambling) | 2026-05-09 | 2026-11-09 (15.0) | Casual; Casual, Puzzle |
| Big Farm Homestead | A12 / 13+ | yes / no / yes | 2025-11-07 (US), 2025-12-01 (BR) | 2026-11-02 (1.0.9051) | Simulation; Simulation, Family |
| Sunshine Island | A12 / 13+ | yes / no / yes | 2023-08-16 | 2026-11-10 (1.3.40309) | Simulation; Simulation, Family |
| Family Farm Seaside | A18 / 9+ | yes / yes / yes | 2013-02-02 | 2026-09-23 (10.1.200) | Simulation; Family, Simulation |
| Goodville | A14 / 13+ | yes / no / no | 2020-11-11 (US), 2021-04-27 (BR) | 2026-11-11 (11.5.0) | Adventure; Simulation, Adventure |
| Little Farm Story | A12 / 9+ | yes / no / no | 2024-10-08 | 2026-10-05 (1.21.0) | Simulation; Simulation, Casual |
| Family Bay: Merge & Farm | A18 / 16+ | yes / yes / yes | 2026-03-03 | 2026-11-11 (2026891.0.60551) | Puzzle; Family, Puzzle |
| Bloom City | A18 / 9+ | no / yes / yes | 2026-09-26 | 2026-11-03 (1.0.7) | Casual; Family, Casual |

Sources: the BR and US listing of each app (links in the previous table) and LOOKUP-BR / LOOKUP-US. Fetched 2026-11-11.

- Wording of the Brazilian rating on Township's page: "Este app recebeu a seguinte classificação indicativa: A18" with "Contém: Caixas de recompensas; Mensagens e bate-papo" and "Frequente: Competições" — [Township BR](https://apps.apple.com/br/app/id638689075). The US page for the same app: "rated 13+ ... Contains: Loot Boxes; Messaging and Chat" — [Township US](https://apps.apple.com/us/app/id638689075)
- The Cozy Florist's BR page states the reason explicitly: "classificação indicativa do Ministério da Justiça do Brasil: 18. Isso se deve aos seguintes conteúdos ou recursos: Interação entre usuários; Compras on-line (inclui itens aleatórios ou apostas)" — [The Cozy Florist BR](https://apps.apple.com/br/app/id6754878717)
- Of the 24 listings in the table, the 13 that declare loot boxes or random paid items are all A18 (or "18") in Brazil; the 11 that do not are AL, A12, A14 or A16 — BR listings linked above
- The Lookup API still returns the older age labels (Township "12+", Hay Day "4+", Family Island "17+") in `contentAdvisoryRating`, which differ from what the listing pages now show — [Lookup Township BR](https://itunes.apple.com/lookup?id=638689075&country=br); [Township BR listing](https://apps.apple.com/br/app/id638689075)
- Farming Simulator 26 Mobile: "Requires iOS 18.0 or later and a device with the A12 Bionic chip or later"; 2.65 GB — [FS26 US](https://apps.apple.com/us/app/id6748056918); size from LOOKUP-US
- Heartopia download size 3.87 GB, minimum iOS 12.0; Township 296 MB; Hay Day 862 MB — LOOKUP-US, for example <https://itunes.apple.com/lookup?id=6746151928&country=us>
- Update cadence, versions published since 2026-08-13 (about 90 days) according to each listing's version history: Family Bay 18, The Cozy Florist 17, Sunshine Island 12, FarmVille 3 8, Bloom City 8 (all since its September launch), Family Farm Adventure 7, Family Farm Merge 7, Township 6, Family Island 6, Klondike 6, FarmVille 2 6, Big Farm Homestead 6, Goodville 5, Big Farm: Mobile Harvest 5, Hay Day 3, Little Farm Story 2, FS26 2, Heartopia 1, My Garden Tale 1, Family Farm Seaside 1, Stardew Valley 0, FS23 0, FS20 0 — US listings linked above
- Live in-app events shown on the listings on 2026-11-11: Township 2 (Zombie Invasion 2026-10-23 to 11-12; Hudson Regatta 11-02 to 11-29), Hay Day 2 (November Farm Pass 11-01 to 12-01; Safari season 11-11 to 11-17), Heartopia 4, FarmVille 3 6, Big Farm Homestead 3, Klondike 2, FarmVille 2 2, Goodville 2, Family Island 1, Family Farm Adventure 1, My Garden Tale 1, The Cozy Florist 1, Big Farm: Mobile Harvest 1 — US and BR listings linked above

#### In-app purchase lists exactly as shown on the listings
Each listing shows at most 10 in-app purchases. BR list first, then US list. Fetched 2026-11-11 from the linked listings.

- **Township** — BR: Pacote de dinheiro minúsculo R$ 12,90; Cofrinho R$ 19,90; Cupom dourado R$ 29,90; Pacote de principiante R$ 12,90; Pacote de dinheiro pequeno R$ 29,90; Oferta R$ 24,90; Pacote de dinheiro médio R$ 59,90; Pacote vantajoso R$ 39,90; Pacote padrão R$ 49,90; Pacote padrão R$ 59,90. US: Tiny Cash Pack $1.99; Piggy bank $2.99; Golden Ticket $4.99; Small Cash Pack $4.99; Standard Bundle $6.99; Medium Cash Pack $9.99; Offer $3.99; Large Cash Pack $19.99; Begginner's Bundle $1.99; Boost Bundle $5.99 — [BR](https://apps.apple.com/br/app/id638689075); [US](https://apps.apple.com/us/app/id638689075)
- **Hay Day** — BR: Pilha de diamantes R$ 12,50; Bolsa de diamantes R$ 29,90; Oferta especial R$ 2,90; Farm Pass R$ 29,90; Saco de diamantes R$ 59,90; Oferta especial R$ 15,50; Oferta especial R$ 5,90; Pilha de diamantes R$ 5,90; Oferta especial R$ 5,90; Oferta especial R$ 1,90. US: Pile of Diamonds $1.99; Bag of Diamonds $4.99; Sack of Diamonds $9.99; Farm Pass $4.99; Box of Diamonds $19.99; Farm Pass Bundle $11.99; Special Offer $4.99; Chest of Diamonds $39.99; Special Offer $1.99; Special Offer $4.99 — [BR](https://apps.apple.com/br/app/id506627515); [US](https://apps.apple.com/us/app/id506627515)
- **Heartopia** — BR: 300+20 Amoritas R$ 27,90; 60 Amoritas R$ 5,50; Membro VIP inicial da GBA R$ 3,00; Pacote de Mimos Especiais R$ 5,50; Membro Oficial da GBA R$ 16,90; 20 Amoritas R$ 2,50; 680+50 Amoritas R$ 62,90; Pacote de Mimos Especiais R$ 16,90; Pacote de Mimos Especiais R$ 62,90; 1280+90 Amoritas R$ 114,90. US: 300+20 Heart Diamond $4.99; 680+50 Heart Diamond $10.99; GAMG Formal Membership $2.99; 60 Heart Diamond $0.99; 1280+90 Heart Diamond $19.99; GAMG Junior Membership $0.49; Heartfelt Deals Pack $0.99; Heartfelt Deals Pack $2.99; 20 Heart Diamond $0.39; 1980+150 Heart Diamond $30.99 — [BR](https://apps.apple.com/br/app/id6746151928); [US](https://apps.apple.com/us/app/id6746151928)
- **My Garden Tale** — BR: Garden Pack 36 R$ 49,90; Garden Pack 31 R$ 9,90; VIP Privileges auto-renewal R$ 49,90; Garden Pack 35 R$ 29,90; Garden Pack 1 R$ 6,90; Garden Pack 33 R$ 49,90; Privilege card 1 R$ 49,90; Privilege card 2 R$ 9,90; Garden Pack 2 R$ 29,90; Ad-Free Privileges auto-renewal R$ 19,90. US: Garden Pack 33 $7.49; Garden Pack 31 $1.49; Garden Pack 36 $6.99; Garden Pack 4 $14.99; Garden Pack 39 $16.99; Garden Pack 35 $4.49; Garden Pack 1 $0.99; VIP Privileges auto-renewal $7.49; Garden Pack 21 $11.99; Ad-Free Privileges auto-renewal $2.99 — [BR](https://apps.apple.com/br/app/id6751532378); [US](https://apps.apple.com/us/app/id6751532378)
- **The Cozy Florist** — BR: 1 USD Pack R$ 6,90; 2 USD Pack R$ 12,90; 3 USD Pack R$ 19,90; 5 USD Pack R$ 29,90; 7 USD Pack R$ 49,90; 9 USD Pack R$ 59,90; 10 USD Pack R$ 59,90; 15 USD Pack R$ 99,90; 20 USD Pack R$ 129,90; 30 USD Pack R$ 199,90. US: the same ten packs at $0.99; $1.99; $2.99; $4.99; $6.99; $8.99; $9.99; $14.99; $19.99; $29.99 — [BR](https://apps.apple.com/br/app/id6754878717); [US](https://apps.apple.com/us/app/id6754878717)
- **Family Island** — BR: Unique offer - 24 R$ 24,90; Limited offer - 41 R$ 49,90; Limited offer - 59 R$ 19,90; Limited offer - 599 R$ 29,90; Small Starter Pack (1) R$ 29,90; Small Special Offer (3) R$ 24,90; Limited offer - 73 R$ 6,90; Limited offer - 75 R$ 19,90; Limited offer - 582 R$ 12,90; Limited offer - 186 R$ 19,90. US: Limited offer - 41 $7.99; Few rubies $3.99; Small Starter Pack (1) $4.99; Limited offer - 75 $2.99; Limited offer - 59 $2.99; Limited offer - 186 $2.99; Small Special Offer (3) $3.99; Limited offer - 77 $14.99; Big Starter Pack (16) $19.99; Unique offer - 24 $3.99 — [BR](https://apps.apple.com/br/app/id1464689103); [US](https://apps.apple.com/us/app/id1464689103)
- **Klondike Adventures** — BR: Oferta especial! R$ 8,90; Oferta especial! R$ 17,50; Pacote Pequeno R$ 42,99; Oferta especial! R$ 34,50; Premium semanal R$ 22,90; Punhado de Esmeraldas R$ 34,50; Oferta especial! R$ 25,90; Oferta especial! R$ 86,90; Carteira de Esmeraldas R$ 86,90; Pacote Básico R$ 112,90. US: Handful of Emeralds $3.99; Small Pack $4.99; Special offer! $0.99; Special offer! $1.99; Special offer! $3.99; Special offer! $9.99; Basic Pack $12.99; Wallet of Emeralds $9.99; One-week premium $5.99; Box of Emeralds $19.99 — [BR](https://apps.apple.com/br/app/id1127240206); [US](https://apps.apple.com/us/app/id1127240206)
- **Family Farm Adventure** — BR: On Sale 62 R$ 24,90; On Sale 103 R$ 18,50; Endless Pack 13 R$ 12,50; On Sale 64 R$ 37,00; Welcome Pack R$ 18,50; On Sale 63 R$ 30,90; Golden Pass R$ 61,90; basic pack R$ 37,00; On Sale 66 R$ 49,50; Small Pack B R$ 18,50. US: basic pack $5.99; Welcome Pack $2.99; standard pack $12.99; On Sale 62 $3.99; On Sale 64 $5.99; Golden Pass $9.99; Tiny Gem Pack $1.99; On Sale 103 $2.99; super pack $24.99; On Sale 66 $7.99 — [BR](https://apps.apple.com/br/app/id1543158709); [US](https://apps.apple.com/us/app/id1543158709)
- **FarmVille 3** — BR: Saco de joias R$ 26,00; Passe da temporada R$ 26,00; Caixa de joias R$ 52,90; Barrica de joias R$ 113,90; Oferta de iniciante! R$ 17,50; Of. fazendástica fim de semana R$ 52,90; Of. fazendástica meio da sem. R$ 43,90; Baú de joias R$ 174,90; Cacifo de joias R$ 264,90; Oferta animal ex. meio da sem. R$ 52,90. US: Sack of Gems $4.99; Box of Gems $9.99; Cask of Gems $19.99; Season Pass $4.99; Chest of Gems $29.99; Starter Offer! $2.99; Farmtastic Weekend Offer $9.99; Farmtastic Midweek Offer $7.99; Safe of Gems $49.99; Exotic Animal Midweek Offer $9.99 — [BR](https://apps.apple.com/br/app/id843506607); [US](https://apps.apple.com/us/app/id843506607)
- **FarmVille 2: Country Escape** — BR: Pilha de chaves R$ 12,90; Pacote com 140 chaves R$ 29,90; Pacote grande de assinatura R$ 82,90; Minipacote de assinatura R$ 8,50; Pacote pequeno de assinatura R$ 20,90; Pacote com 75 chaves R$ 19,90; Passe da Fazenda! R$ 59,90; Pacote com 285 chaves R$ 59,90; Pacote com 25 chaves R$ 6,90; Pacote econômico de assinatura R$ 20,90. US: Pile of Keys $1.99; Subscription Large Pack $19.99; Farm Pass! $9.99; Pack of 285 keys $9.99; Pack of 140 keys $4.99; Pack of 600 keys $19.99; Premium_Farm Pass!!!!!!! $19.99; Subscription Mini pack $1.99; Event Pass!! $6.99; Value Pack with Bonus Gloves $4.99 — [BR](https://apps.apple.com/br/app/id824318267); [US](https://apps.apple.com/us/app/id824318267)
- **Stardew Valley** and **Stardew Valley+** — no in-app purchase list on either storefront — [Stardew BR](https://apps.apple.com/br/app/id1406710800); [Stardew US](https://apps.apple.com/us/app/id1406710800); [Stardew+ BR](https://apps.apple.com/br/app/id6449264810)
- **Farming Simulator 26 Mobile** — BR: 200'000 Coins R$ 5,90; 500'000 Coins R$ 11,90; 1'000'000 Coins R$ 14,90. US: $1.19; $2.49; $3.49 — [BR](https://apps.apple.com/br/app/id6748056918); [US](https://apps.apple.com/us/app/id6748056918)
- **Farming Simulator 23 Mobile** — BR: 200'000 Coins R$ 6,90; 500'000 Coins R$ 12,90; 1'000'000 Coins R$ 19,90; John Deere 8R 410 R$ 12,90; Amazone CITAN 15001-C R$ 6,90; KINZE 3665 Blue Drive R$ 6,90; Versatile 4WD 620 R$ 12,90; Case IH Speed-Tiller R$ 6,90; ClaasLexion8900+ConvioFlex1380 R$ 19,90; Mack Trucks Black Anthem 6x4 R$ 12,90. US: the same ten items at $0.99; $1.99; $2.99; $1.99; $0.99; $0.99; $1.99; $0.99; $2.99; $1.99 — [BR](https://apps.apple.com/br/app/id6444400410); [US](https://apps.apple.com/us/app/id6444400410)
- **Farming Simulator 20** — BR: 200'000 Coins R$ 6,90; 500'000 Coins R$ 12,90; 1'000'000 Coins R$ 19,90. US: $0.99; $1.99; $2.99 — [BR](https://apps.apple.com/br/app/id1478611992); [US](https://apps.apple.com/us/app/id1478611992)
- **Big Farm: Mobile Harvest** — BR: Mini Superoferta R$ 12,90; Superoferta Pequena R$ 34,90; Pacote de Ouro Pequeno R$ 34,90; monte de ouro diário R$ 39,90; Assinatura do clube Big Farm R$ 49,90; Superoferta Média R$ 69,90; balde de ouro diário R$ 89,90; Superoferta Normal R$ 129,90; Superoferta Grande R$ 199,90; Superoferta Enorme R$ 349,90. US: Small Super-Sale Pack $5.29; Small Gold Pack $5.29; Daily pile of gold $5.99; Big Farm club subscription $9.99; Medium Super-Sale Pack $10.99; Regular Super-Sale Pack $20.99; Regular Gold Pack $20.99; Big Super-Sale Pack $31.99; Large Super-Sale Pack $52.99; Massive Super-Sale Pack $104.99 — [BR](https://apps.apple.com/br/app/id1215668882); [US](https://apps.apple.com/us/app/id1215668882)
- **Family Farm Merge** — BR: Offer 2 R$ 12,50; Offer 3 R$ 18,50; Offer 4 R$ 24,90; Offer 5 R$ 30,90; Offer 6 R$ 37,00; Offer 8 R$ 49,50; Offer 10 R$ 61,90; Offer 11 R$ 67,90; Offer 13 R$ 80,00; Offer 20 R$ 123,90. US: the same ten offers at $1.99; $2.99; $3.99; $4.99; $5.99; $7.99; $9.99; $10.99; $12.99; $19.99 — [BR](https://apps.apple.com/br/app/id6760998152); [US](https://apps.apple.com/us/app/id6760998152)
- **Big Farm Homestead** — BR: Mini Sale Pack R$ 6,90; Tiny R$ 12,90; Little R$ 19,90; Small R$ 29,90; Modest R$ 49,90; Medium R$ 59,90; Standard R$ 99,90; Regular R$ 129,90; Common R$ 149,90; Big R$ 159,90. US: Mini $0.99; Tiny $1.99; Little $2.99; Small $4.99; Modest $7.99; Medium $9.99; Standard $14.99; Regular $19.99; Big $29.99; Large $49.99 — [BR](https://apps.apple.com/br/app/id6742455668); [US](https://apps.apple.com/us/app/id6742455668)
- **Sunshine Island** — BR: Pacote de Oferta Mini R$ 6,90; Mini Oferta R$ 12,90; Pacote Pequena Oferta R$ 19,90; Oferta Pequena R$ 29,90; Pacote Oferta Modesta R$ 49,90; Oferta Média R$ 59,90; Pacote Oferta Padrão R$ 99,90; Oferta Normal R$ 129,90; Oferta Grande R$ 159,90; Pack Oferta Épico R$ 249,90. US: Mini Sale Pack $0.99; Tiny $1.99; Little $2.99; Small $4.99; Modest $7.99; Medium $9.99; Standard $14.99; Regular $19.99; Big $29.99; Large $49.99 — [BR](https://apps.apple.com/br/app/id6443624260); [US](https://apps.apple.com/us/app/id6443624260)
- **Family Farm Seaside** — BR: Promoção Especial R$ 6,00; Desconto Exclusivo R$ 12,50; Monte de DR R$ 18,50; Oferta Limitada R$ 18,50; Desconto da Fazenda R$ 24,90; Desconto Limitado R$ 30,90; Oferta da Fazenda R$ 43,50; Pilha de DR R$ 49,50; Oferta Exclusiva R$ 61,90; Malote de DR R$ 92,90. US: Bunch of RC $2.99; Limited Offer $2.99; Farm Discount $3.99; Limited Discount $4.99; Farm Sale $6.99; Stack of RC $7.99; Exclusive Offer $9.99; Exclusive Sale $14.99; Exclusive Sales $14.99; Exclusive Sale $28.99 — [BR](https://apps.apple.com/br/app/id539920547); [US](https://apps.apple.com/us/app/id539920547)
- **Goodville** — BR: Marathon Offer 5: XSS R$ 19,90; Marathon Offer 1: XS R$ 24,90; Handful of Rubies R$ 29,90; Assinatura Semanal R$ 38,90; Premium Weekly Subscription R$ 59,90; Stack of Rubies R$ 59,90; Event Pass Offer Type 3 R$ 59,90; Deluxe Weekly Subscription R$ 79,90; Pile of Rubies R$ 99,90; Pile of Rubies R$ 199,90. US: Handful of Rubies $4.99; Weekly Subscription $6.99; Stack of Rubies $9.99 (twice); Premium Weekly Subscription $11.99; Pile of Rubies $14.99 (twice); Deluxe Weekly Subscription $14.99; Pile of Rubies $29.99 (twice) — [BR](https://apps.apple.com/br/app/id1459249040); [US](https://apps.apple.com/us/app/id1459249040)
- **Little Farm Story** — BR: 300 Coins R$ 12,90; 400 coins R$ 12,90; Pumpkin Worker R$ 24,90; Pumpkin Pack R$ 24,90; 800 Coins R$ 29,90; Farm Pack 1 R$ 29,90; No Ads Pack R$ 49,90; 1700 Coins R$ 59,90; Boosters Pack 2 R$ 79,90; 5000 Coins R$ 149,90. US: 400 coins $1.99; Wheat worker $2.99; Pumpkin Pack $3.99; Pumpkin Worker $3.99; Car Trader Pack $3.99; Farm Pack 1 $4.99; Heli Trader Pack $5.99; 1200 coins $6.99; No Ads Pack $7.99; 2400 coin $10.99 — [BR](https://apps.apple.com/br/app/id6733244789); [US](https://apps.apple.com/us/app/id6733244789)
- **Family Bay: Merge & Farm** — BR: Special Offer (0.99) R$ 6,90; (1.99) R$ 12,90; (2.99) R$ 19,90; (3.99) R$ 24,90; (4.99) R$ 29,90; (5.99) R$ 39,90; (6.99) R$ 49,90; (7.99) R$ 49,90; (8.99) R$ 59,90; (9.99) R$ 59,90. US: Special Offer (0.99) $0.99 through (9.99) $9.99 at face value, plus (12.99) $12.99 — [BR](https://apps.apple.com/br/app/id6753110925); [US](https://apps.apple.com/us/app/id6753110925)
- **Bloom City** — BR: TH 1 R$ 6,90; Skin Box 1 R$ 6,90; Skin Box 2 R$ 12,90; Skip Ad 1 R$ 12,90; Skip Ad 2 R$ 24,90; TH 2 R$ 29,90; Skin Box 3 R$ 29,90; Skip Ad 3 R$ 39,90; TH 3 R$ 129,90; TH 4 R$ 599,90. US: TH 1 $0.99; Skin Box 1 $0.99; Skin Box 2 $1.99; Skip Ad 1 $1.99; Skip Ad 2 $3.99; TH 2 $4.99; Skin Box 3 $4.99; Skip Ad 3 $5.99; TH 3 $19.99; TH 4 $99.99 — [BR](https://apps.apple.com/br/app/id6766778393); [US](https://apps.apple.com/us/app/id6766778393)

### Inferences
- In Brazil, declaring loot boxes (random paid rewards) appears to be what pushes a farm game to the 18 rating: the correlation is 13 of 13 among the listings read, and one page says so in words. A new Brazilian game that sells randomised items should expect A18 on the BR storefront; one monetised with direct purchases, a pass and ads (like Big Farm Homestead, Sunshine Island or Little Farm Story, all A12) can sit much lower. This is an inference from listings, not a reading of the regulation.
- Multiplayer chat and user-generated content alone do not produce A18: Heartopia declares chat, UGC and social media but no loot boxes and is A16 in Brazil.
- My Garden Tale and The Cozy Florist carry the identical US subtitle ("Play and win real bouquets") and near-identical positioning (grow flowers, flower shop, real-bouquet rewards), under two different seller entities (MODO PTE. LTD. and RiftSky Games Co.,Limited). They look like the same product family under two listings, with The Cozy Florist being the one that actually charts and has 17 times the US ratings. The relationship is not stated on either page.
- Ratings volume in Brazil is roughly 10-20% of the US volume for the leaders (Township 239K against 2.23M; Hay Day 140K against 655K), which gives a rough sense of relative iOS audience size per title; it is not a revenue ratio.
- The leaders ship a client update about every two weeks (Township 6 and Family Island 6 in 90 days) and keep one to six in-app events live on the listing at any time; Hay Day updates less often (3 in 90 days) but still runs listed events. Newer titles in soft-launch-style iteration (Family Bay, The Cozy Florist) ship more than once a week.
- Farming Simulator 26 Mobile is poorly received relative to its predecessors (BR 3.31 on 285 ratings; US 3.97 on 473) yet still charts at #8 BR / #29 US paid, so brand pull in this niche outweighs reviews at launch.

### Gaps
- The listing shows at most 10 in-app purchases per storefront (apparently the most popular ones, and the BR and US sets differ), so these are not full catalogues; true minimum and maximum price points may lie outside what is shown.
- Release dates are Apple's `releaseDate` field per storefront; where a title soft-launched elsewhere first, the global launch date is not available here.
- "Farm Merge Valley" has no App Store listing that the Search API could find in BR or US; no data.
- Ad formats (rewarded, interstitial) are not disclosed on listings; only the yes/no "Advertising" declaration is available.
- Review text was not collected (the customer-reviews RSS feed was not requested).

## 3. From the IAP lists: cheapest and most expensive price points, season-pass prices in BRL vs USD, and the BRL price ladder

### Takeaway
On the Brazil storefront the entry price point among listed IAPs is typically R$ 6,90 (US $0.99) or R$ 12,90 (US $1.99), and monthly season passes sit at R$ 26,00-29,90 where the US price is $4.99 (Township, Hay Day, FarmVille 3) and about R$ 60 where it is $9.99 (FarmVille 2, Family Farm Adventure). The BRL ladder that most publishers use is $0.99 = R$ 6,90, $1.99 = R$ 12,90, $2.99 = R$ 19,90, $4.99 = R$ 29,90, $9.99 = R$ 59,90, $19.99 = R$ 129,90, $99.99 = R$ 599,90, which works out to roughly R$ 6,0-7,0 per US dollar, while premium paid games are priced far lower in Brazil (R$ 4,2-6,0 per dollar for Stardew Valley and Farming Simulator, and as low as R$ 1,6-3,0 for some big brands).

### Cited Findings

#### Cheapest and most expensive listed IAP per game (among the up-to-10 items shown)

| Game | BR cheapest | BR most expensive | US cheapest | US most expensive |
|---|---|---|---|---|
| Township | R$ 12,90 | R$ 59,90 | $1.99 | $19.99 |
| Hay Day | R$ 1,90 | R$ 59,90 | $1.99 | $39.99 |
| Heartopia | R$ 2,50 | R$ 114,90 | $0.39 | $30.99 |
| My Garden Tale | R$ 6,90 | R$ 49,90 | $0.99 | $16.99 |
| The Cozy Florist | R$ 6,90 | R$ 199,90 | $0.99 | $29.99 |
| Family Island | R$ 6,90 | R$ 49,90 | $2.99 | $19.99 |
| Klondike Adventures | R$ 8,90 | R$ 112,90 | $0.99 | $19.99 |
| Family Farm Adventure | R$ 12,50 | R$ 61,90 | $1.99 | $24.99 |
| FarmVille 3 | R$ 17,50 | R$ 264,90 | $2.99 | $49.99 |
| FarmVille 2: Country Escape | R$ 6,90 | R$ 82,90 | $1.99 | $19.99 |
| Stardew Valley | no IAP (R$ 29,90 upfront) | – | no IAP ($4.99 upfront) | – |
| Farming Simulator 26 Mobile | R$ 5,90 | R$ 14,90 | $1.19 | $3.49 |
| Farming Simulator 23 Mobile | R$ 6,90 | R$ 19,90 | $0.99 | $2.99 |
| Farming Simulator 20 | R$ 6,90 | R$ 19,90 | $0.99 | $2.99 |
| Big Farm: Mobile Harvest | R$ 12,90 | R$ 349,90 | $5.29 | $104.99 |
| Family Farm Merge | R$ 12,50 | R$ 123,90 | $1.99 | $19.99 |
| Big Farm Homestead | R$ 6,90 | R$ 159,90 | $0.99 | $49.99 |
| Sunshine Island | R$ 6,90 | R$ 249,90 | $0.99 | $49.99 |
| Family Farm Seaside | R$ 6,00 | R$ 92,90 | $2.99 | $28.99 |
| Goodville | R$ 19,90 | R$ 199,90 | $4.99 | $29.99 |
| Little Farm Story | R$ 12,90 | R$ 149,90 | $1.99 | $10.99 |
| Family Bay | R$ 6,90 | R$ 59,90 | $0.99 | $12.99 |
| Bloom City | R$ 6,90 | R$ 599,90 | $0.99 | $99.99 |

Sources: the BR and US listing of each app (URLs in section 2). Fetched 2026-11-11.

#### Passes, subscriptions and ad-removal products (BRL vs USD)

| Game | Product (BR name / US name) | BR | US |
|---|---|---|---|
| Township | Cupom dourado / Golden Ticket | R$ 29,90 | $4.99 |
| Hay Day | Farm Pass | R$ 29,90 | $4.99 |
| Hay Day | Farm Pass Bundle (US list only) | not listed | $11.99 |
| FarmVille 3 | Passe da temporada / Season Pass | R$ 26,00 | $4.99 |
| FarmVille 2: Country Escape | Passe da Fazenda! / Farm Pass! | R$ 59,90 | $9.99 |
| FarmVille 2: Country Escape | Premium Farm Pass; Event Pass (US list only) | not listed | $19.99; $6.99 |
| Family Farm Adventure | Golden Pass | R$ 61,90 | $9.99 |
| Klondike Adventures | Premium semanal / One-week premium | R$ 22,90 | $5.99 |
| Goodville | Assinatura Semanal / Weekly Subscription | R$ 38,90 | $6.99 |
| Goodville | Premium Weekly Subscription | R$ 59,90 | $11.99 |
| Goodville | Deluxe Weekly Subscription | R$ 79,90 | $14.99 |
| Goodville | Event Pass Offer Type 3 (BR list only) | R$ 59,90 | not listed |
| Big Farm: Mobile Harvest | Assinatura do clube Big Farm / Big Farm club subscription | R$ 49,90 | $9.99 |
| My Garden Tale | VIP Privileges auto-renewal | R$ 49,90 | $7.49 |
| My Garden Tale | Ad-Free Privileges auto-renewal | R$ 19,90 | $2.99 |
| Little Farm Story | No Ads Pack | R$ 49,90 | $7.99 |
| Bloom City | Skip Ad 1 / 2 / 3 | R$ 12,90 / 24,90 / 39,90 | $1.99 / $3.99 / $5.99 |
| Heartopia | Membro VIP inicial da GBA / GAMG Junior Membership | R$ 3,00 | $0.49 |
| Heartopia | Membro Oficial da GBA / GAMG Formal Membership | R$ 16,90 | $2.99 |

Sources: the BR and US listing of each app (URLs in section 2). Fetched 2026-11-11. Name pairing across languages is mine where the names are translated (see Inferences).

#### The BRL price ladder as observed (same product on both storefronts)

| US price | BR price most often paired with it | BRL per USD | Seen on |
|---|---|---|---|
| $0.99 | R$ 6,90 | 6.97 | The Cozy Florist, Family Bay, Bloom City, Big Farm Homestead, My Garden Tale, FS23/FS20 coins |
| $1.99 | R$ 12,90 | 6.48 | Township, The Cozy Florist, Family Bay, Bloom City, Big Farm Homestead, FarmVille 2, FS23/FS20 |
| $2.99 | R$ 19,90 | 6.66 | Township, The Cozy Florist, Family Bay, Big Farm Homestead, My Garden Tale, FS23/FS20 |
| $3.99 | R$ 24,90 | 6.24 | Township, Family Bay, Family Island, Bloom City, Family Farm Merge, Little Farm Story |
| $4.99 | R$ 29,90 | 5.99 | Township, Hay Day, The Cozy Florist, Family Bay, Family Island, Bloom City, Goodville, FarmVille 2, Little Farm Story |
| $5.99 | R$ 39,90 | 6.66 | Family Bay, Bloom City, Big Farm: Mobile Harvest |
| $6.99 | R$ 49,90 | 7.14 | The Cozy Florist, Family Bay, My Garden Tale |
| $7.99 | R$ 49,90 | 6.25 | Family Bay, Family Island, Big Farm Homestead, Little Farm Story |
| $8.99 | R$ 59,90 | 6.66 | The Cozy Florist, Family Bay |
| $9.99 | R$ 59,90 | 6.00 | Township, Hay Day, The Cozy Florist, Family Bay, Big Farm Homestead, Goodville, FarmVille 2 |
| $14.99 | R$ 99,90 | 6.66 | The Cozy Florist, Big Farm Homestead, Goodville |
| $19.99 | R$ 129,90 | 6.50 | The Cozy Florist, Big Farm Homestead, Bloom City |
| $29.99 | R$ 199,90 | 6.67 | The Cozy Florist, Goodville |
| $99.99 | R$ 599,90 | 6.00 | Bloom City |

Sources: [The Cozy Florist BR](https://apps.apple.com/br/app/id6754878717) and [US](https://apps.apple.com/us/app/id6754878717) (packs are named "N USD Pack" on both storefronts); [Family Bay BR](https://apps.apple.com/br/app/id6753110925) and [US](https://apps.apple.com/us/app/id6753110925) (offers are named with their USD value); [Bloom City BR](https://apps.apple.com/br/app/id6766778393) and [US](https://apps.apple.com/us/app/id6766778393); other listings as in section 2. Fetched 2026-11-11.

- Publishers that deviate from that ladder, same-named products:
  - Century Games (Family Farm Merge, Family Farm Adventure) uses unrounded prices at a near-constant R$ 6,2 per dollar: $1.99 = R$ 12,50; $2.99 = R$ 18,50; $4.99 = R$ 30,90; $5.99 = R$ 37,00; $7.99 = R$ 49,50; $9.99 = R$ 61,90; $10.99 = R$ 67,90; $12.99 = R$ 80,00; $19.99 = R$ 123,90 — [Family Farm Merge BR](https://apps.apple.com/br/app/id6760998152); [US](https://apps.apple.com/us/app/id6760998152)
  - Heartopia prices lower in Brazil, about R$ 5,6-5,75 per dollar: $0.99 = R$ 5,50; $4.99 = R$ 27,90; $10.99 = R$ 62,90; $19.99 = R$ 114,90 — [Heartopia BR](https://apps.apple.com/br/app/id6746151928); [US](https://apps.apple.com/us/app/id6746151928)
  - Zynga's FarmVille 3 prices lower, about R$ 5,2-5,85 per dollar: $2.99 = R$ 17,50; $4.99 = R$ 26,00; $9.99 = R$ 52,90; $19.99 = R$ 113,90; $29.99 = R$ 174,90; $49.99 = R$ 264,90 — [FarmVille 3 BR](https://apps.apple.com/br/app/id843506607); [US](https://apps.apple.com/us/app/id843506607)
  - Hay Day: $1.99 = R$ 12,50 (Pile of Diamonds); $4.99 = R$ 29,90; $9.99 = R$ 59,90; and it lists BR-only special offers at R$ 1,90, R$ 2,90 and R$ 5,90, below anything on its US list — [Hay Day BR](https://apps.apple.com/br/app/id506627515); [US](https://apps.apple.com/us/app/id506627515)
  - Klondike Adventures prices higher, about R$ 8,6-9,0 per dollar: Handful of Emeralds $3.99 = R$ 34,50; Small Pack $4.99 = R$ 42,99; Wallet of Emeralds $9.99 = R$ 86,90; Basic Pack $12.99 = R$ 112,90 — [Klondike BR](https://apps.apple.com/br/app/id1127240206); [US](https://apps.apple.com/us/app/id1127240206)
  - Big Farm Homestead and Sunshine Island follow the ladder up to $19.99 but price the $29.99 pack at R$ 159,90 (R$ 5,33 per dollar) — [Big Farm Homestead BR](https://apps.apple.com/br/app/id6742455668); [US](https://apps.apple.com/us/app/id6742455668)
  - Farming Simulator 26 coins: $1.19 = R$ 5,90; $2.49 = R$ 11,90; $3.49 = R$ 14,90 (R$ 4,3-5,0 per dollar) — [FS26 BR](https://apps.apple.com/br/app/id6748056918); [US](https://apps.apple.com/us/app/id6748056918)
- Upfront prices of paid games, BR vs US (BRL per USD in brackets): Stardew Valley R$ 29,90 vs $4.99 (5.99); Farming Simulator 26 R$ 39,90 vs $7.99 (4.99); Farming Simulator 20 R$ 22,99 vs $4.99 (4.61); Farming Simulator 23 R$ 24,90 vs $5.99 (4.16); Animal Crossing: Pocket Camp Complete R$ 58,90 vs $19.99 (2.95); Slime Rancher R$ 19,90 vs $7.99 (2.49); Minecraft R$ 10,90 vs $6.99 (1.56); Plague Inc. R$ 6,90 vs $0.99 (6.97); Harvest Moon: Home Sweet Home R$ 119,90 vs $17.99 (6.66); My Time at Portia R$ 49,90 vs $7.99 (6.25) — [RSS BR paid 7015](https://itunes.apple.com/br/rss/toppaidapplications/limit=100/genre=7015/json); [RSS US paid 7015](https://itunes.apple.com/us/rss/toppaidapplications/limit=100/genre=7015/json); [W-BR-7015](https://apps.apple.com/br/iphone/charts/7015); [W-US-7015](https://apps.apple.com/us/iphone/charts/7015); LOOKUP-BR / LOOKUP-US
- Subscriptions and passes are often priced below the ladder in Brazil: FarmVille 3 Season Pass $4.99 = R$ 26,00 (5.21); Goodville weekly subscriptions $6.99 / $11.99 / $14.99 = R$ 38,90 / 59,90 / 79,90 (5.57 / 5.00 / 5.33); Big Farm club $9.99 = R$ 49,90 (4.99); Klondike weekly premium $5.99 = R$ 22,90 (3.82) — listings in section 2

### Inferences
- The recurring pairs ($0.99 = R$ 6,90 ... $99.99 = R$ 599,90) across unrelated publishers are most likely Apple's default Brazilian equivalents for those US price points, with individual publishers overriding them. That they are Apple defaults is my inference; the pairs themselves are observed.
- The default ladder is not a smooth conversion: the charm prices R$ 29,90 and R$ 59,90 for $4.99 and $9.99 work out to about R$ 6,0 per dollar, while $0.99, $2.99, $5.99, $8.99, $14.99 and $29.99 work out to R$ 6,66-6,97, and $6.99 and $7.99 share R$ 49,90, as do $8.99 and $9.99 at R$ 59,90. A Brazilian developer setting prices in BRL first can treat R$ 6,90 / 12,90 / 19,90 / 29,90 / 59,90 / 129,90 as the price points players already see everywhere.
- Against a straight conversion: Century Games' unrounded prices sit at a constant R$ 6,2 per dollar, which looks like an automatic conversion (possibly tax-inclusive) and gives a rough reference. On that reference, the common ladder is about 3% cheaper at $4.99 and $9.99 and about 7-12% dearer at $0.99, $2.99 and $14.99. Whether R$ 6,2 matches the market exchange rate on 2026-11-11 could not be checked here.
- A $4.99-equivalent monthly pass at R$ 26-29,90 is the standard in the genre's top two titles and FarmVille 3; the "farm adventure" sub-genre uses a dearer pass (about R$ 60 / $9.99). For a Brazil-first game, R$ 29,90 is the anchored pass price, and several publishers discount passes and subscriptions in Brazil more than they discount currency packs.
- Ad removal is sold as a product in at least three titles (My Garden Tale R$ 19,90 per renewal period, Little Farm Story R$ 49,90 one-off pack, Bloom City "Skip Ad" at R$ 12,90-39,90), which is a direct precedent for an ads-plus-premium-currency design with a paid no-ads option.
- Premium (pay-once) games are priced much more aggressively in Brazil than IAP: Stardew Valley and the Farming Simulator series sit at R$ 4,2-6,0 per dollar, and big brands go as low as R$ 1,6-3,0. Regional discounting of upfront price is normal on this storefront; regional discounting of IAP is less common but done by Heartopia and Zynga.
- Cross-language name matching (for example "Punhado de Esmeraldas" = "Handful of Emeralds", "Membro Oficial da GBA" = "GAMG Formal Membership") is my pairing. It is exact where product names are identical on both storefronts (The Cozy Florist, Family Bay, Family Farm Merge, Bloom City, GIANTS titles, My Garden Tale packs); treat the translated pairs as likely rather than certain.

### Gaps
- No exchange-rate source was reachable (only Apple hosts were allowed), so the comparison with "a straight USD conversion" is expressed as implied BRL per USD; the market USD/BRL rate for 2026-11-11 must be supplied by the report writer.
- Whether Brazilian prices include taxes that US prices do not is not stated on the pages read.
- Full IAP catalogues, the top price tier of each game (for example whether Township sells a $99.99 pack) and pass contents are not visible on listings.
- Billing period of the auto-renewing products (My Garden Tale VIP, Ad-Free) is not shown in the listing extract.

## 4. Which farm games are in Apple Arcade today?

### Takeaway
Seven farm or farm-adjacent titles carry the Apple Arcade flag on their listings today: Stardew Valley+, Farmside, Wylde Flowers, Farm It!, My Dear Farm+, Hello Kitty Island Adventure and Disney Dreamlight Valley (Arcade Edition). None of them is in the "Top Arcade Games" shelf in either country, and none of the free-to-play or paid candidates from section 2 is an Arcade app.

### Cited Findings
- Listing pages whose embedded purchase data say `isArcadeApp: true`, with Arcade-style buttons and no price or IAP list (BR rating / count; last update):
  - Stardew Valley+ (ConcernedApe): BR 4.00 / 274, US 4.23 / 2,271; released 2023-07-21; last update 2025-06-05 — [BR](https://apps.apple.com/br/app/id6449264810); [US](https://apps.apple.com/us/app/id6449264810)
  - Farmside (Team17 USA): BR 4.71 / 21, US 3.96 / 334; released 2023-02-17; last update 2025-12-17 — [BR](https://apps.apple.com/br/app/id1600555574); [US](https://apps.apple.com/us/app/id1600555574)
  - Wylde Flowers (Studio Drydock): BR 4.89 / 498, US 4.84 / 7,228; released 2022-02-18; last update 2026-11-06 — [BR](https://apps.apple.com/br/app/id1458605549); [US](https://apps.apple.com/us/app/id1458605549)
  - Farm It! (Tummy Games): BR 4.71 / 110, US 4.65 / 5,041; released 2021-03-26; last update 2022-02-14 — [BR](https://apps.apple.com/br/app/id1538476446); [US](https://apps.apple.com/us/app/id1538476446)
  - My Dear Farm+ (HyperBeard): BR 4.71 / 182, US 4.67 / 4,498; released 2025-02-06; last update 2026-11-10; five live events on the BR listing — [BR](https://apps.apple.com/br/app/id6668861713); [US](https://apps.apple.com/us/app/id6668861713)
  - Hello Kitty Island Adventure (Sunblink): BR 4.90 / 8,958, US 4.85 / 163,238 (US count from Lookup); released 2023-07-28; last update 2026-11-04 — [BR](https://apps.apple.com/br/app/id1553505132); [Lookup US](https://itunes.apple.com/lookup?id=1553505132&country=us)
  - Disney Dreamlight Valley, subtitle "Arcade Edition" (Gameloft): BR 4.42 / 670, US 4.68 / 22,653 (US count from Lookup); released 2023-12-05; last update 2026-10-09 — [BR](https://apps.apple.com/br/app/id6456945575); [Lookup US](https://itunes.apple.com/lookup?id=6456945575&country=us)
- All section 2 candidates (Township, Hay Day, Heartopia, My Garden Tale, The Cozy Florist, Family Island, Klondike, Family Farm Adventure, FarmVille 2 and 3, Stardew Valley, the three Farming Simulators, Big Farm: Mobile Harvest and the extra titles) have `isArcadeApp: false` on both storefronts — listings linked in section 2
- "Top Arcade Games" shelf, US (15 shown): Block Blast!+, NBA 2K27 Arcade Edition, NFL Retro Bowl '27, Solitaire by MobilityWare+, Water Sort Puzzle+, Flow Free+, Madden NFL 27 Arcade Edition, Sneaky Sasquatch, Everyday Puzzles+, Bloons TD 6+, Balatro+, Crossy Road Rush, KAMI 2+, Food Stylist+, PowerWash Simulator. No farm title — [US Arcade tab](https://apps.apple.com/us/iphone/arcade)
- "Top jogos do Arcade" shelf, BR (15 shown): Block Blast!+, NBA 2K27 Arcade Edition, Solitaire by MobilityWare+, Water Sort Puzzle+, Subway Surfers+, Flow Free+, NFL Retro Bowl '27, Sneaky Sasquatch, Snake.io+, Crossy Road Rush, Everyday Puzzles+, Balatro+, PowerWash Simulator, KAMI 2+, Food Stylist+. No farm title — [BR Arcade tab](https://apps.apple.com/br/iphone/arcade)
- Editorial placement on the Arcade tab: the "Cozy Vibes Only" shelf (BR: "Clima de aconchego") lists Hello Kitty Island Adventure at position 2, Stardew Valley+ at 8 and Disney Dreamlight Valley at 9 in both countries; Stardew Valley+ is also position 6 in the indie shelf; Hello Kitty Island Adventure is first in "Recently Updated" — [US Arcade tab](https://apps.apple.com/us/iphone/arcade); [BR Arcade tab](https://apps.apple.com/br/iphone/arcade)
- The BR Arcade "Simulação" category page (20 titles shown) includes Hello Kitty Island Adventure (1st), Disney Dreamlight Valley (3rd), Japanese Rural Life Adventure (9th), Wylde Flowers (10th), My Dear Farm+ (13th) and Farmside (19th) — [Arcade Simulação, BR](https://apps.apple.com/br/iphone/story/id1620272916)
- A free, non-Arcade "Hello Kitty Island Intro" exists on the US store and ranks #46 in US top free Family; it was not returned by the BR Lookup — [W-US-7009](https://apps.apple.com/us/iphone/charts/7009); LOOKUP-BR
- A non-Arcade free "My Dear Farm" (HyperBeard, with IAP) also exists: BR 4.72 / 1,993, US 4.63 / 11,559; BR top free Family #156 — LOOKUP-BR / LOOKUP-US; [W-BR-7009](https://apps.apple.com/br/iphone/charts/7009)
- "Farming Simulator 23 NETFLIX" (Netflix, Inc.) is a separate free listing tied to a Netflix membership, BR top free Simulation #129 — [W-BR-7015](https://apps.apple.com/br/iphone/charts/7015); LOOKUP-BR

### Inferences
- The Arcade farm tier is small and not chart-leading: the most-rated Arcade title of this kind is Hello Kitty Island Adventure (163K US ratings), followed by Disney Dreamlight Valley (22.7K) and Wylde Flowers (7.2K); Stardew Valley+ has 2.3K US ratings against 63.7K for the paid Stardew Valley.
- Farm It! (last updated February 2022) and Farmside (December 2025) are still listed as Arcade apps but are not being actively updated; My Dear Farm+, Wylde Flowers, Hello Kitty Island Adventure and Disney Dreamlight Valley are.
- Publishers pair an Arcade edition with a free store edition to feed both funnels (My Dear Farm and My Dear Farm+; Hello Kitty Island Intro and Hello Kitty Island Adventure; Stardew Valley and Stardew Valley+).

### Gaps
- Apple does not publish a full ranked Arcade chart on these pages; only the 15-item "Top Arcade Games" shelf was available, so the Arcade rank of the farm titles is unknown beyond "not in the top 15".
- The Arcade Simulation category page showed 20 titles; the complete Arcade catalogue was not enumerated, so another farm-adjacent Arcade title could exist (Japanese Rural Life Adventure was found this way and was not on the earlier list).
- US listing pages for Hello Kitty Island Adventure and Disney Dreamlight Valley were not fetched individually; their US Arcade status rests on their presence on the US Arcade tab.

## 5. Does the live data contradict the earlier notes (ranks, ratings, prices, launch dates)?

### Takeaway
Most of the earlier best-effort list holds up at the top (Township and Hay Day lead; Stardew Valley and Farming Simulator 26 lead the paid tier), but several specifics are wrong or stale: two GIANTS prices, the FarmVille 3 rating, Hay Day's current US grossing rank, the Stardew paid-chart position, and the middle of the proposed top 10, where Heartopia and My Garden Tale rank lower on these storefronts than assumed and Family Farm Merge and The Cozy Florist were missing.

### Cited Findings
Each item: earlier note, then what Apple shows on 2026-11-11.

1. **Hay Day US top-grossing rank.** Earlier: "#66 among top-grossing games" (third-party snapshot dated 2026-11-06). Live: #87 in US top-grossing iPhone games — [G-US-6014](https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=6014/json)
2. **Township US top-grossing rank.** Earlier: "about #14" (2026-11-05), with a second tracker saying #47. Live: #13; the #47 figure is not supported — [G-US-6014](https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=6014/json)
3. **Brazil chart positions.** Earlier: "No farm game appears in the retrieved portion" and "the Brazil ordering is unknown". Live: Township #14, Hay Day #29, Family Farm Merge #52, Farm Heroes Saga #75, Family Island #99 in BR top-grossing games; Township #40, Family Farm Merge #46, Hay Day #96 in BR top free games; Stardew Valley #5 and Farming Simulator 26 #8 in BR top paid games — [G-BR-6014](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=6014/json); [W-BR-6014](https://apps.apple.com/br/iphone/charts/6014)
4. **Stardew Valley paid-chart position.** Earlier: "#2 in the paid Games/Simulation chart (behind Plague Inc.) and #2 in paid Games/Role Playing". Live: #3 in paid Simulation in both countries (US behind Minecraft and Plague Inc.; BR behind Minecraft and Pou) and the listing badge shows #1 in Role Playing in both — [RSS US paid 7015](https://itunes.apple.com/us/rss/toppaidapplications/limit=100/genre=7015/json); [RSS BR paid 7015](https://itunes.apple.com/br/rss/toppaidapplications/limit=100/genre=7015/json); [Stardew US](https://apps.apple.com/us/app/id1406710800); [Stardew BR](https://apps.apple.com/br/app/id1406710800)
5. **Farming Simulator 23 Mobile paid rank.** Earlier: "#32 in top-paid Games/Simulation in March 2026". Live: #126 in US paid Simulation, #11 in BR paid Simulation — [W-US-7015](https://apps.apple.com/us/iphone/charts/7015); [W-BR-7015](https://apps.apple.com/br/iphone/charts/7015)
6. **Farming Simulator 23 Mobile price.** Earlier: "Paid $7.99 + IAP". Live: $5.99 in the US, R$ 24,90 in Brazil (IAP confirmed) — [FS23 US](https://apps.apple.com/us/app/id6444400410); [FS23 BR](https://apps.apple.com/br/app/id6444400410)
7. **Farming Simulator 20 price.** Earlier: "Paid $1.99". Live: $4.99 in the US, R$ 22,99 in Brazil; rating 4.40 on 8,858 matches the earlier "4.4, 8.8K" — [FS20 US](https://apps.apple.com/us/app/id1478611992); [FS20 BR](https://apps.apple.com/br/app/id1478611992)
8. **Farming Simulator 26 Mobile system requirement.** Earlier: "iOS 18.6 requirement". Live: "Requires iOS 18.0 or later and a device with the A12 Bionic chip or later". Price $7.99 and release date 2026-05-19 are confirmed — [FS26 US](https://apps.apple.com/us/app/id6748056918); [Lookup](https://itunes.apple.com/lookup?id=6748056918&country=us)
9. **FarmVille 3 rating.** Earlier: "4.4, about 261K ratings (third-party audit, may combine stores)". Live App Store: US 4.66 (shown as 4.7) on 84,640 ratings; BR 4.80 on 3,926 — [FV3 US](https://apps.apple.com/us/app/id843506607); [FV3 BR](https://apps.apple.com/br/app/id843506607)
10. **Heartopia developer name and standing.** Earlier: developer "XD Games"; ranked 3rd in the proposed top 10. Live: the store developer is "XD Entertainment Co., Ltd."; Heartopia is not in the top 100 grossing games in either country and ranks below Family Island in Simulation top grossing in both (BR 30 vs 19; US 86 vs 49). Rating now 4.56 on 36,029 in the US (earlier: 4.57 on 28.4K in March 2026, consistent growth) — [Heartopia US](https://apps.apple.com/us/app/id6746151928); [G-BR-7015](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=7015/json); [G-US-7015](https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=7015/json)
11. **My Garden Tale standing.** Earlier: ranked 4th in the proposed top 10 as "third farming grosser". Live: absent from every BR and US list read (top 100 grossing in five genre lists per country; top 200 free in four); US rating 4.72 on 1,975 (earlier "4.7, 1.1K"); BR listing is titled "Meu Mundo do Jardim" with 22 ratings and a BR release date of 2026-06-28 (US 2026-02-01, matching the earlier "1 February 2026") — [US listing](https://apps.apple.com/us/app/id6751532378); [BR listing](https://apps.apple.com/br/app/id6751532378); LOOKUP-BR / LOOKUP-US
12. **My Garden Tale IAP range.** Earlier: "10 IAPs from $0.99 to $49.49". Live US listing: 10 IAPs from $0.99 to $16.99 — [US listing](https://apps.apple.com/us/app/id6751532378)
13. **Hay Day IAP data.** Earlier: trackers reported "8 or 9 IAPs" with a "$1.99 to $1.99" range flagged as unreliable. Live: 10 listed IAPs, $1.99 to $39.99 in the US and R$ 1,90 to R$ 59,90 in Brazil; Farm Pass $4.99 / R$ 29,90 — [Hay Day US](https://apps.apple.com/us/app/id506627515); [Hay Day BR](https://apps.apple.com/br/app/id506627515)
14. **Titles missing from the earlier list.** Earlier Gaps said a search for Farm Merge Valley "returned only Family Farm Merge (Century Games), a different app", which was then dropped. Live: Family Farm Merge is the third-highest farm-themed title in BR top-grossing games (#52) and is in the top free games in both countries (BR #46, US #80). The Cozy Florist (US Simulation grossing #28, BR #42) was also absent — [G-BR-6014](https://itunes.apple.com/br/rss/topgrossingapplications/limit=100/genre=6014/json); [W-US-6014](https://apps.apple.com/us/iphone/charts/6014); [G-US-7015](https://itunes.apple.com/us/rss/topgrossingapplications/limit=100/genre=7015/json)
15. **Hay Day launch year.** Earlier: sources conflicted between 2012 and 2013. Live: App Store release date 2012-06-21 — [Lookup](https://itunes.apple.com/lookup?id=506627515&country=us)
16. **Klondike Adventures launch year.** Earlier (unverified): "Vizor Apps, 2017". Live: App Store release date 2018-04-04 — [Lookup](https://itunes.apple.com/lookup?id=1127240206&country=us)
17. **Township ads.** Earlier (unverified): "Hay Day and Township use only optional rewarded video". Live: Hay Day's age-rating panel declares "Advertising"; Township's panel does not list advertising at all (it lists loot boxes, messaging and chat, contests) — [Hay Day US](https://apps.apple.com/us/app/id506627515); [Township US](https://apps.apple.com/us/app/id638689075)
18. **Farming Simulator ads.** Earlier (unverified): "Stardew Valley, Farming Simulator and all Arcade titles have no ads". Live: Farming Simulator 26 Mobile's panel declares "Contains: Advertising" (BR: "Publicidade"); FS23, FS20 and Stardew Valley declare none — [FS26 US](https://apps.apple.com/us/app/id6748056918); [FS26 BR](https://apps.apple.com/br/app/id6748056918)
19. **Heartopia monetisation.** Earlier: "reported elsewhere as gacha-style cosmetics" (not confirmed). Live: Heartopia's panel does not declare loot boxes on either storefront; it declares messaging and chat, user-generated content and social media, and sells currency ("Heart Diamond" / "Amoritas") and two membership tiers — [Heartopia US](https://apps.apple.com/us/app/id6746151928); [Heartopia BR](https://apps.apple.com/br/app/id6746151928)

Confirmed without change (earlier note, live value): Township 4.8 with about 2.1-2.2M US ratings (4.75 / 2,234,188), Golden Ticket $4.99, 10 listed IAPs, Large Cash Pack $19.99; Hay Day 4.7 (655,177 US ratings, up from about 636K in May); Stardew Valley $4.99, no IAP, 4.8 on about 63K (4.81 / 63,712); FS26 $7.99; Stardew Valley+ on Arcade since 2023-07-21; Farmside on Arcade since February 2023 (2023-02-17); Wylde Flowers and My Dear Farm+ on Arcade; FarmVille 3 released November 2021 (2021-11-02) and declaring both ads and IAP; Hay Day #2-3 grossing in the Family sub-genre (US #2 today, earlier #3 in March); only two farm sims in the US top 100 grossing games — sources as in sections 1, 2 and 4.

### Inferences
- The earlier top-10 should be re-ordered for these storefronts. A rank-based order for free-to-play farm sims on iPhone today would be: Township, Hay Day, then Family Island / Family Farm Merge (which leads depends on country and list), then Klondike Adventures, Goodville, Heartopia, The Cozy Florist, FarmVille 2 and 3, Family Farm Adventure. Heartopia's and My Garden Tale's high placement in the earlier notes came from cross-platform, all-country revenue estimates, so the difference is as much about scope (iOS in BR and US only) as about error.
- Third-party "current rank" snapshots drifted by 20 places within five days for Hay Day; they should not be quoted as current without a date, and Apple's own feed is the better reference.
- The earlier unverified launch years were right except Klondike (2018, not 2017, on the App Store).

### Gaps
- The earlier notes' revenue and download estimates (AppMagic, Sensor Tower) cannot be confirmed or contradicted from Apple pages; only ranks, ratings and prices can.
- Items in the earlier notes about mechanics, social features, Apple policy (commission, external links, CADE, ECA Digital) and review sentiment were out of scope for this check and remain unverified, apart from the age-rating observations in section 2.
- Historical positions (for example March 2026) cannot be re-read from Apple; "then versus now" comparisons rely on the earlier third-party figures being right for their dates.
