# Live check of Steam farming / farm-life games — primary-source snapshot of 11 November 2026

> **Read this first — what this file is and how far to trust it.**
> - Everything below was read directly from `store.steampowered.com` (store pages, search-listing JSON, `api/appdetails`, the Steam Charts page) and `steamspy.com/api.php` on **2026-11-11 between 13:33 and 13:56 UTC**. 222 requests were made (169 to the Steam store, 53 to SteamSpy). No other host was contacted. Fetch date for every figure in this file is 2026-11-11 unless a different date is written next to it.
> - **Tag id correction.** The brief gave "Farming Sim = tag id 87". Steam's own tag list says 87 is "Utilities"; **Farming Sim is 87918, Agriculture is 22602** (and a separate "Farming" tag is 4520) — [Steam tag list](https://store.steampowered.com/tagdata/populartags/english). All tag work below uses 87918 and 22602.
> - **`sort_by=Reviews_DESC` sorts by review score, not review count.** To rank by count, all 1,251 Farming Sim results and all 777 Agriculture results that have a review score were paged and re-sorted locally — [Farming Sim listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&sort_by=Reviews_DESC) (start=0…1200), [Agriculture listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=22602&sort_by=Reviews_DESC) (start=0…700).
> - **Three different review counts exist and must not be mixed.** (a) "All languages, all purchase types" = positive + negative totals embedded in each store page's review block (this is the figure comparable to SteamDB-style totals). (b) The count shown in search listings and at the top of a store page opened with `l=english` is **English-only** for games Steam flags as having "language outliers" (most large games), for example Stardew Valley shows 397,094 instead of 1,050,832. (c) "Last 30 days" is the store page's recent-reviews summary; it was identical on the English and the Brazilian-Portuguese page for Stardew Valley, so it is not language-filtered. Steam's per-language counts cover reviews from Steam purchasers only: Stardew Valley's 27 listed languages sum to 904,274 against a Steam-purchaser total of 904,507 — [English page](https://store.steampowered.com/app/413150/?l=english&cc=us), [pt-BR page](https://store.steampowered.com/app/413150/?l=brazilian&cc=br).
> - **Review text could not be retrieved.** Every request to `https://store.steampowered.com/appreviews/<appid>?json=1…` was answered with HTTP 302 to the store home page. This was the same with plain curl, curl carrying the store's own session cookies, a headless-Chromium page navigation, and a same-origin fetch from inside a loaded store page. 36 of the 222 requests went to this dead end (30 of them in one batch that was sent before a single test request, which was a researcher mistake and cost about 12% of the request budget). No alternative paths or forged headers were tried. Section 4 therefore contains review **statistics** by language and period, and no quotes.
> - **SteamSpy limits.** Owner figures are SteamSpy estimates given as wide ranges. Its `ccu` field is "peak CCU yesterday" and data refresh once a day — [SteamSpy API notes](https://steamspy.com/api.php). Its tag endpoint returned 1 game for "Farming Sim", 1 for "Agriculture" and 8 for "Farming", so tag-level SteamSpy rankings were impossible; 49 apps were queried one by one instead. Nine recent apps (Heartopia, Graveyard Keeper 2, Loftia, Starsand Island, Infinity Nikki and others) return placeholder zeros.
> - **All-time peak concurrent players is not available from these two hosts** and is not given anywhere below. The only first-party concurrency figures are Steam's own top-100 chart (current and peak-today).
> - Prices come from `api/appdetails?filters=price_overview` with `cc=us` and `cc=br`: [USD batch 1](https://store.steampowered.com/api/appdetails?appids=413150,2300320,1248130,787860,2707930,4025700,2142790,1158160,1062520,1432860,1084600,666140,1119730,433340,1657630,1401590,1621690,673950,2418520,599140,4358690,1868140,1129580,1044720,1419170,3164330,2966320,2016460,2408820,1677110,2320980,3198850,1139980,972660,1062090,751780,1210320,1468260,447020,313160,2666510,3370870,2060160,1594940,3167550,382310,544550,894940,1488490&cc=us&filters=price_overview), [BRL batch 1](https://store.steampowered.com/api/appdetails?appids=413150,2300320,1248130,787860,2707930,4025700,2142790,1158160,1062520,1432860,1084600,666140,1119730,433340,1657630,1401590,1621690,673950,2418520,599140,4358690,1868140,1129580,1044720,1419170,3164330,2966320,2016460,2408820,1677110,2320980,3198850,1139980,972660,1062090,751780,1210320,1468260,447020,313160,2666510,3370870,2060160,1594940,3167550,382310,544550,894940,1488490&cc=br&filters=price_overview), [USD batch 2](https://store.steampowered.com/api/appdetails?appids=1501310,2495100,2711030,3591180,2209900,2508780,2864560,2272900,1805110,2340520,1465550,1746930,2569670,1121640,3602570&cc=us&filters=price_overview), [BRL batch 2](https://store.steampowered.com/api/appdetails?appids=1501310,2495100,2711030,3591180,2209900,2508780,2864560,2272900,1805110,2340520,1465550,1746930,2569670,1121640,3602570&cc=br&filters=price_overview), [BRL DLC batch](https://store.steampowered.com/api/appdetails?appids=3720190,3708940,2901220,4465220,4465230,4794220,3550700,3786480,3540860,3303190,3550680,3550690,3731480,3453350,3724330,3985700,4094000,4232610,4580980,4968150,5169680,2305660,2375000,2375130,2375140,2401500,2401501,1889780,1894500,5366160,5373000,4404070,4664870,4348800,4651570,3453810,4348790,5090170,4376930,3979520,3979530,3311900,3259120,2632050,4127920,4127930,919770,924150,1482631,2125730,1873910,4391920,4395490,4424260,4460980&cc=br&filters=price_overview).
> - The "Farming central?" column is the researcher's classification, not a Steam field.
> - Raw downloads are in `/tmp/claude-0/-home-user-farmSimulator/75f055d1-b764-53b5-8075-88db93a673a3/scratchpad/steam_raw/` and the request log is `/tmp/claude-0/-home-user-farmSimulator/75f055d1-b764-53b5-8075-88db93a673a3/scratchpad/steam_scripts/requests.log`.

## 1. Top 30 by tag (review count, top-sellers order, SteamSpy owners and CCU) and facts for the top 15 farming-central games

### Takeaway
Stardew Valley stands alone at 1,050,832 reviews (98.5% positive) and a peak of 71,940 concurrent players today, which is rank 19 on all of Steam; Farming Simulator 25 is the only other farming game in Steam's top 100 by concurrent players (rank 49, peak today 46,384). Below them, farming-central games sit in a 22k–94k review band, and today's top-seller list is led by brand-new releases (Loftia, Lightyear Frontier 1.0), while in Brazil Farming Simulator 25 and Stardew Valley are numbers 1 and 2.

### Cited Findings

**(a) Farming Sim tag (87918): top 30 by total review count.** Counts and percentages are from each game's store page (linked in the table); the listing column is from the [Farming Sim listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&sort_by=Reviews_DESC). The listing holds 1,251 products with a review score.

| # | App id (store page) | Game | Steam release date | Reviews, all languages + all purchase types | % positive | Count shown in tag listing (l=english) | Farming central? |
|---|---|---|---|---|---|---|---|
| 1 | [413150](https://store.steampowered.com/app/413150/?l=english&cc=us) | Stardew Valley | Feb 26, 2016 | 1,050,832 | 98.5% | 397,093 (98%) | yes |
| 2 | [1868140](https://store.steampowered.com/app/1868140/?l=english&cc=us) | DAVE THE DIVER | Jun 28, 2023 | 165,120 | 96.4% | 51,600 (96%) | no |
| 3 | [1248130](https://store.steampowered.com/app/1248130/?l=english&cc=us) | Farming Simulator 22 | Nov 21, 2021 | 93,552 | 92.8% | 25,834 (92%) | yes |
| 4 | [787860](https://store.steampowered.com/app/787860/?l=english&cc=us) | Farming Simulator 19 | Nov 19, 2018 | 76,548 | 94.5% | 24,067 (93%) | yes |
| 5 | [2300320](https://store.steampowered.com/app/2300320/?l=english&cc=us) | Farming Simulator 25 | Nov 12, 2024 | 61,313 | 87.6% | 16,438 (86%) | yes |
| 6 | [972660](https://store.steampowered.com/app/972660/?l=english&cc=us) | Spiritfarer: Farewell Edition | Aug 18, 2020 | 53,966 | 94.9% | 18,997 (94%) | no |
| 7 | [1419170](https://store.steampowered.com/app/1419170/?l=english&cc=us) | My Singing Monsters | Mar 24, 2021 | 50,582 | 93.5% | 32,498 (94%) | no |
| 8 | [1119730](https://store.steampowered.com/app/1119730/?l=english&cc=us) | Ranch Simulator: Build, Hunt, Farm | Nov 3, 2023 | 49,246 | 79.1% | 12,170 (77%) | yes |
| 9 | [1210320](https://store.steampowered.com/app/1210320/?l=english&cc=us) | Potion Craft: Alchemist Simulator | Dec 13, 2022 | 45,260 | 93.0% | 16,795 (93%) | no |
| 10 | [2707930](https://store.steampowered.com/app/2707930/?l=english&cc=us) | Palia | Mar 25, 2024 | 45,135 | 86.0% | 27,733 (88%) | yes |
| 11 | [666140](https://store.steampowered.com/app/666140/?l=english&cc=us) | My Time at Portia | Jan 15, 2019 | 44,390 | 91.5% | 12,130 (91%) | yes |
| 12 | [751780](https://store.steampowered.com/app/751780/?l=english&cc=us) | Forager | Apr 18, 2019 | 44,332 | 89.4% | 13,567 (87%) | no |
| 13 | [1062090](https://store.steampowered.com/app/1062090/?l=english&cc=us) | Timberborn | Mar 12, 2026 | 42,814 | 95.8% | 24,599 (96%) | no |
| 14 | [2142790](https://store.steampowered.com/app/2142790/?l=english&cc=us) | Fields of Mistria | Aug 5, 2026 | 37,015 | 97.0% | 26,319 (97%) | yes |
| 15 | [1084600](https://store.steampowered.com/app/1084600/?l=english&cc=us) | My Time at Sandrock | Nov 2, 2023 | 29,292 | 88.1% | 9,371 (94%) | yes |
| 16 | [1062520](https://store.steampowered.com/app/1062520/?l=english&cc=us) | Dinkum | Apr 22, 2025 | 29,279 | 91.8% | 15,876 (93%) | yes |
| 17 | [1158160](https://store.steampowered.com/app/1158160/?l=english&cc=us) | Coral Island | Nov 14, 2023 | 27,959 | 89.0% | 14,340 (89%) | yes |
| 18 | [1468260](https://store.steampowered.com/app/1468260/?l=english&cc=us) | Leaf Blower Revolution - Idle Game | Dec 4, 2020 | 26,556 | 94.1% | 22,645 (94%) | no |
| 19 | [447020](https://store.steampowered.com/app/447020/?l=english&cc=us) | Farming Simulator 17 | Oct 24, 2016 | 26,044 | 93.5% | 6,972 (92%) | yes |
| 20 | [1432860](https://store.steampowered.com/app/1432860/?l=english&cc=us) | Sun Haven | Mar 10, 2023 | 25,820 | 80.4% | 13,413 (83%) | yes |
| 21 | [1401590](https://store.steampowered.com/app/1401590/?l=english&cc=us) | Disney Dreamlight Valley | Dec 5, 2023 | 25,299 | 92.2% | 15,982 (91%) | no |
| 22 | [673950](https://store.steampowered.com/app/673950/?l=english&cc=us) | Farm Together | Oct 11, 2018 | 22,136 | 94.1% | 4,691 (92%) | yes |
| 23 | [1139980](https://store.steampowered.com/app/1139980/?l=english&cc=us) | Travellers Rest | Jul 28, 2020 | 18,511 | 87.8% | 8,466 (88%) | no |
| 24 | [313160](https://store.steampowered.com/app/313160/?l=english&cc=us) | Farming Simulator 15 | Oct 30, 2014 | 15,923 | 92.5% | 4,193 (90%) | yes |
| 25 | [2666510](https://store.steampowered.com/app/2666510/?l=english&cc=us) | Rusty's Retirement | Apr 26, 2024 | 14,960 | 96.7% | 6,628 (97%) | yes |
| 26 | [1594940](https://store.steampowered.com/app/1594940/?l=english&cc=us) | Little Witch in the Woods | Sep 14, 2025 | 13,418 | 89.1% | 4,851 (90%) | no |
| 27 | [2408820](https://store.steampowered.com/app/2408820/?l=english&cc=us) | Luma Island | Nov 20, 2024 | 12,887 | 84.2% | 3,776 (90%) | yes |
| 28 | [4358690](https://store.steampowered.com/app/4358690/?l=english&cc=us) | Graveyard Keeper 2 | Sep 22, 2026 | 11,561 | 75.8% | 4,396 (77%) | no |
| 29 | [3164330](https://store.steampowered.com/app/3164330/?l=english&cc=us) | Infinity Nikki | Apr 28, 2025 | 10,718 | 57.9% | 5,557 (57%) | no |
| 30 | [2060160](https://store.steampowered.com/app/2060160/?l=english&cc=us) | The Farmer Was Replaced | Oct 10, 2025 | 10,234 | 95.6% | 4,553 (95%) | yes |

- Ranks 31–41 from the pages fetched: Ravenous Devils 10,026; Berry Bury Berry 9,413; Tiny Pasture 8,722; The Wandering Village 8,591; Ostriv 7,759; Call of the Wild: The Angler 7,663; Starsand Island 6,959; Littlewood 6,841; Atomicrops 6,395; STORY OF SEASONS: Friends of Mineral Town 5,821; **Farm Together 2 5,547 (41st)** — store pages [1615290](https://store.steampowered.com/app/1615290/?l=english&cc=us), [3370870](https://store.steampowered.com/app/3370870/?l=english&cc=us), [3167550](https://store.steampowered.com/app/3167550/?l=english&cc=us), [1121640](https://store.steampowered.com/app/1121640/?l=english&cc=us), [773790](https://store.steampowered.com/app/773790/?l=english&cc=us), [1408610](https://store.steampowered.com/app/1408610/?l=english&cc=us), [2966320](https://store.steampowered.com/app/2966320/?l=english&cc=us), [894940](https://store.steampowered.com/app/894940/?l=english&cc=us), [757320](https://store.steampowered.com/app/757320/?l=english&cc=us), [978780](https://store.steampowered.com/app/978780/?l=english&cc=us), [2418520](https://store.steampowered.com/app/2418520/?l=english&cc=us)
- Several games the brief names are **not returned by the store search under either tag**: Slime Rancher (159,024 reviews, 98.0%), Core Keeper (68,564, 92.9%), Slime Rancher 2 (50,956, 94.5%), Heartopia (16,461, 66.2%) and Hello Kitty Island Adventure (12,933, 94.0%). By review count Slime Rancher would be 3rd and Core Keeper 6th in the Farming Sim table — store pages [433340](https://store.steampowered.com/app/433340/?l=english&cc=us), [1621690](https://store.steampowered.com/app/1621690/?l=english&cc=us), [1657630](https://store.steampowered.com/app/1657630/?l=english&cc=us), [4025700](https://store.steampowered.com/app/4025700/?l=english&cc=us), [2495100](https://store.steampowered.com/app/2495100/?l=english&cc=us)
- Farming Simulator 25 carries Farming Sim but is not returned under Agriculture — [Agriculture listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=22602&sort_by=Reviews_DESC)

**(b) Agriculture tag (22602): top 30 by total review count.** The listing holds 777 products with a review score — [Agriculture listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=22602&sort_by=Reviews_DESC).

| # | App id (store page) | Game | Steam release date | Reviews, all languages + all purchase types | % positive | Count shown in tag listing (l=english) | Farming central? |
|---|---|---|---|---|---|---|---|
| 1 | [413150](https://store.steampowered.com/app/413150/?l=english&cc=us) | Stardew Valley | Feb 26, 2016 | 1,050,832 | 98.5% | 397,094 (98%) | yes |
| 2 | [1868140](https://store.steampowered.com/app/1868140/?l=english&cc=us) | DAVE THE DIVER | Jun 28, 2023 | 165,120 | 96.4% | 51,600 (96%) | no |
| 3 | [1248130](https://store.steampowered.com/app/1248130/?l=english&cc=us) | Farming Simulator 22 | Nov 21, 2021 | 93,552 | 92.8% | 25,834 (92%) | yes |
| 4 | [787860](https://store.steampowered.com/app/787860/?l=english&cc=us) | Farming Simulator 19 | Nov 19, 2018 | 76,548 | 94.5% | 24,067 (93%) | yes |
| 5 | [599140](https://store.steampowered.com/app/599140/?l=english&cc=us) | Graveyard Keeper | Aug 15, 2018 | 57,201 | 85.2% | 17,952 (84%) | no |
| 6 | [1129580](https://store.steampowered.com/app/1129580/?l=english&cc=us) | Medieval Dynasty | Sep 23, 2021 | 52,986 | 90.3% | 19,629 (88%) | no |
| 7 | [666140](https://store.steampowered.com/app/666140/?l=english&cc=us) | My Time at Portia | Jan 15, 2019 | 44,390 | 91.5% | 12,130 (91%) | yes |
| 8 | [751780](https://store.steampowered.com/app/751780/?l=english&cc=us) | Forager | Apr 18, 2019 | 44,332 | 89.4% | 13,567 (87%) | no |
| 9 | [2142790](https://store.steampowered.com/app/2142790/?l=english&cc=us) | Fields of Mistria | Aug 5, 2026 | 37,015 | 97.0% | 26,319 (97%) | yes |
| 10 | [1062520](https://store.steampowered.com/app/1062520/?l=english&cc=us) | Dinkum | Apr 22, 2025 | 29,279 | 91.8% | 15,876 (93%) | yes |
| 11 | [1158160](https://store.steampowered.com/app/1158160/?l=english&cc=us) | Coral Island | Nov 14, 2023 | 27,959 | 89.0% | 14,340 (89%) | yes |
| 12 | [447020](https://store.steampowered.com/app/447020/?l=english&cc=us) | Farming Simulator 17 | Oct 24, 2016 | 26,044 | 93.5% | 6,972 (92%) | yes |
| 13 | [1044720](https://store.steampowered.com/app/1044720/?l=english&cc=us) | Farthest Frontier | Oct 23, 2025 | 25,845 | 86.0% | 11,174 (86%) | no |
| 14 | [1432860](https://store.steampowered.com/app/1432860/?l=english&cc=us) | Sun Haven | Mar 10, 2023 | 25,820 | 80.4% | 13,413 (83%) | yes |
| 15 | [673950](https://store.steampowered.com/app/673950/?l=english&cc=us) | Farm Together | Oct 11, 2018 | 22,136 | 94.1% | 4,691 (92%) | yes |
| 16 | [313160](https://store.steampowered.com/app/313160/?l=english&cc=us) | Farming Simulator 15 | Oct 30, 2014 | 15,923 | 92.5% | 4,193 (90%) | yes |
| 17 | [382310](https://store.steampowered.com/app/382310/?l=english&cc=us) | Eco | Feb 6, 2018 | 14,137 | 80.6% | 6,678 (78%) | no |
| 18 | [2294660](https://store.steampowered.com/app/2294660/?l=english&cc=us) | The Quinfall | Feb 6, 2026 | 13,098 | 50.7% | 3,424 (51%) | no |
| 19 | [1594320](https://store.steampowered.com/app/1594320/?l=english&cc=us) | Captain of Industry | May 31, 2022 | 11,869 | 90.4% | 5,923 (87%) | no |
| 20 | [846770](https://store.steampowered.com/app/846770/?l=english&cc=us) | DYSMANTLE | Nov 16, 2021 | 11,707 | 90.6% | 4,942 (90%) | no |
| 21 | [4358690](https://store.steampowered.com/app/4358690/?l=english&cc=us) | Graveyard Keeper 2 | Sep 22, 2026 | 11,561 | 75.8% | 4,396 (77%) | no |
| 22 | [3164330](https://store.steampowered.com/app/3164330/?l=english&cc=us) | Infinity Nikki | Apr 28, 2025 | 10,718 | 57.9% | 5,556 (57%) | no |
| 23 | [375950](https://store.steampowered.com/app/375950/?l=english&cc=us) | Viridi | Aug 19, 2015 | 9,672 | 92.0% | 5,950 (91%) | no |
| 24 | [544550](https://store.steampowered.com/app/544550/?l=english&cc=us) | Stationeers | Dec 12, 2017 | 9,375 | 87.9% | 5,992 (88%) | no |
| 25 | [3167550](https://store.steampowered.com/app/3167550/?l=english&cc=us) | Tiny Pasture | Feb 17, 2025 | 8,722 | 92.4% | 7,128 (92%) | yes |
| 26 | [1535560](https://store.steampowered.com/app/1535560/?l=english&cc=us) | Farmer Against Potatoes Idle | Sep 5, 2024 | 8,261 | 94.6% | 4,701 (94%) | no |
| 27 | [1509510](https://store.steampowered.com/app/1509510/?l=english&cc=us) | Settlement Survival | Oct 24, 2022 | 8,177 | 84.8% | 3,088 (84%) | no |
| 28 | [1651560](https://store.steampowered.com/app/1651560/?l=english&cc=us) | Fabledom | May 13, 2024 | 7,993 | 85.1% | 3,517 (87%) | no |
| 29 | [773790](https://store.steampowered.com/app/773790/?l=english&cc=us) | Ostriv | Mar 19, 2020 | 7,759 | 95.0% | 2,843 (92%) | no |
| 30 | [894940](https://store.steampowered.com/app/894940/?l=english&cc=us) | Littlewood | Aug 4, 2020 | 6,841 | 93.2% | 5,128 (93%) | yes |

**(c) Current top-sellers order (Steam's own `filter=topsellers`), top 30.** The listing does not say how the order is computed or over what period. Review figures in these lists are the listing's (English-only for large games).

Farming Sim tag, United States store, 197 products in the list — [listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&filter=topsellers):

1. Loftia (2320980) — $24.89 (was $29.99); 85% of 922; released Nov 3, 2026
2. Lightyear Frontier (1677110) — $23.99 (was $29.99); 81% of 2,675; released Nov 4, 2026
3. Disney Dreamlight Valley (1401590) — $39.99; 91% of 15,982; released Dec 5, 2023
4. Find The Needle (5160800) — $12.74 (was $14.99); 77% of 489; released Nov 6, 2026
5. Horses of Hoofprint Bay (3727090) — $22.94 (was $26.99); 98% of 1,386; released Nov 4, 2026
6. Stardew Valley (413150) — $14.99; 98% of 397,093; released Feb 26, 2016
7. Farming Simulator 25 (2300320) — $29.99; 86% of 16,438; released Nov 12, 2024
8. The Farmer Was Replaced (2060160) — $6.99 (was $9.99); 95% of 4,553; released Oct 10, 2025
9. Palia (2707930) — Free; 88% of 27,733; released Mar 25, 2024
10. Potion Craft: Alchemist Simulator (1210320) — $7.99 (was $19.99); 93% of 16,795; released Dec 13, 2022
11. Nivalis Nights (1488490) — $24.99; 79% of 3,167; released Sep 29, 2026
12. Infinity Nikki (3164330) — Free; 57% of 5,556; released Apr 28, 2025
13. Graveyard Keeper 2 (4358690) — $24.99; 77% of 4,396; released Sep 22, 2026
14. Fields of Mistria (2142790) — $13.99; 97% of 26,319; released Aug 5, 2026
15. The Miner Was Replaced (4521700) — $6.29 (was $8.99); 93% of 29; released Nov 2, 2026
16. Timberborn (1062090) — $34.99; 96% of 24,599; released Mar 12, 2026
17. Agromatic (4179990) — $7.99 (was $9.99); no score yet; released Nov 10, 2026
18. DAVE THE DIVER (1868140) — $19.99; 96% of 51,600; released Jun 28, 2023
19. My Singing Monsters (1419170) — Free; 94% of 32,498; released Mar 24, 2021
20. Loftia - Supporter Pack (5366160) — $19.99; 100% of 13; released Nov 3, 2026
21. PAO PAO (3024130) — $14.13 (was $17.98); 89% of 727; released Oct 26, 2026
22. Welcome to Elderfield (3195440) — $17.99; 90% of 1,849; released Sep 10, 2026
23. Berry Bury Berry (3370870) — $7.99; 97% of 6,612; released Jan 29, 2026
24. Out of Ore (2009350) — $24.99; 83% of 2,593; released Oct 31, 2022
25. Village in the Shade (3934250) — $49.99; 92% of 719; released Jul 29, 2026
26. Coral Island (1158160) — $29.99; 89% of 14,340; released Nov 14, 2023
27. Moonlight Peaks (2209900) — $34.99; 88% of 1,944; released Jul 6, 2026
28. ONE PIECE: Grand Gourmet (3905010) — $19.99; 76% of 683; released Oct 22, 2026
29. Doloc Town (2285550) — $15.99 (was $19.99); 96% of 731; released Aug 5, 2026
30. Sun Haven (1432860) — $24.99; 83% of 13,413; released Mar 10, 2023

- Positions of other named games in that US list: Farming Simulator 22 #52; My Time at Sandrock #56; Farm Together 2 #58; Ranch Simulator #68; Tales of the Shire #69; Play Together #46; Infinity Nikki #12; Graveyard Keeper 2 #13; Dinkum #77; Farm Together not in the first 100; My Time at Portia not in the first 100; Farming Simulator 19 not in the first 100; Starsand Island not in the first 100 — [same listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&filter=topsellers)

Agriculture tag, United States store, 106 products — [listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=22602&filter=topsellers):

1. Find The Needle (5160800) — $12.74 (was $14.99); 77% of 489; released Nov 6, 2026
2. Horses of Hoofprint Bay (3727090) — $22.94 (was $26.99); 98% of 1,388; released Nov 4, 2026
3. Stardew Valley (413150) — $14.99; 98% of 397,093; released Feb 26, 2016
4. Infinity Nikki (3164330) — Free; 57% of 5,557; released Apr 28, 2025
5. Graveyard Keeper 2 (4358690) — $24.99; 77% of 4,396; released Sep 22, 2026
6. Fields of Mistria (2142790) — $13.99; 97% of 26,319; released Aug 5, 2026
7. Medieval Dynasty (1129580) — $34.99; 88% of 19,629; released Sep 23, 2021
8. DAVE THE DIVER (1868140) — $19.99; 96% of 51,600; released Jun 28, 2023
9. Graveyard Keeper (599140) — $4.99 (was $19.99); 84% of 17,952; released Aug 15, 2018
10. Welcome to Elderfield (3195440) — $17.99; 90% of 1,849; released Sep 10, 2026
11. Coral Island (1158160) — $29.99; 89% of 14,340; released Nov 14, 2023
12. Sun Haven (1432860) — $24.99; 83% of 13,413; released Mar 10, 2023
13. Farthest Frontier (1044720) — $34.99; 86% of 11,174; released Oct 23, 2025
14. Horsey Game (3602570) — $9.99; 96% of 2,760; released Feb 18, 2026
15. Wildmender (1599330) — $8.49 (was $24.99); 85% of 1,812; released Sep 28, 2023
16. Stationeers (544550) — $34.99; 88% of 5,992; released Dec 12, 2017
17. DAVE THE DIVER - In the Jungle Content Pack (4394810) — $9.99; 85% of 663; released Jun 18, 2026
18. The Ranch of Rivershine (1559600) — $19.49 (was $29.99); 93% of 1,663; released May 23, 2025
19. Songs of Glimmerwick (1706510) — $24.99; 92% of 448; released Sep 30, 2026
20. Cartel Tycoon (1220140) — $7.49 (was $29.99); 71% of 1,294; released Jul 26, 2022
21. Calmaria: Wild Growth (4683860) — $9.59 (was $11.99); no score yet; released Nov 10, 2026
22. I Am Future: Cozy Apocalypse Survival (1658040) — $7.99 (was $19.99); 83% of 2,094; released Nov 13, 2024
23. Farm to Table (3582250) — $14.99; 91% of 900; released May 9, 2026
24. Sheepherds! (3006280) — $8.99 (was $14.99); 98% of 318; released Nov 17, 2025
25. Lawn Mowing Simulator 2 (3831210) — $29.99; 46% of 200; released Sep 23, 2026
26. Tidy Farm (5226940) — $5.99; 98% of 252; released Oct 26, 2026
27. Blossom: The Seed of Life (3576870) — $12.93 (was $31.98); 87% of 1,066; released Mar 9, 2026
28. Captain of Industry (1594320) — $34.99; 87% of 5,923; released May 31, 2022
29. STORY OF SEASONS: Grand Bazaar (2508780) — $49.99; 95% of 1,363; released Aug 27, 2025
30. Farming Simulator 22 (1248130) — $19.99; 92% of 25,834; released Nov 21, 2021

Farming Sim tag, **Brazil store (cc=br)**, 161 products — [listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=br&l=english&start=0&count=50&tags=87918&filter=topsellers):

1. Farming Simulator 25 (2300320) — R$143,95; 86% of 16,438; released 12 Nov, 2024
2. Stardew Valley (413150) — R$24,99; 98% of 397,093; released 26 Feb, 2016
3. The Farmer Was Replaced (2060160) — R$21,69 (was R$30,99); 95% of 4,553; released 10 Oct, 2025
4. Lightyear Frontier (1677110) — R$71,99 (was R$89,99); 81% of 2,675; released 4 Nov, 2026
5. Find The Needle (5160800) — R$41,21 (was R$48,49); 77% of 489; released 6 Nov, 2026
6. Potion Craft: Alchemist Simulator (1210320) — R$23,99 (was R$59,99); 93% of 16,795; released 13 Dec, 2022
7. Graveyard Keeper 2 (4358690) — R$74,99; 77% of 4,396; released 22 Sep, 2026
8. Loftia (2320980) — R$73,86 (was R$88,99); 85% of 922; released 3 Nov, 2026
9. Farming Simulator 22 (1248130) — R$94,95; 92% of 25,834; released 21 Nov, 2021
10. Timberborn (1062090) — R$101,99; 96% of 24,599; released 12 Mar, 2026
11. Farming Simulator 19 (787860) — R$76,99; 93% of 24,067; released 19 Nov, 2018
12. Farm to Fortune (5025010) — R$5,94 (was R$9,90); 95% of 297; released 30 Oct, 2026
13. The Miner Was Replaced (4521700) — R$18,89 (was R$26,99); 93% of 29; released 2 Nov, 2026
14. Palia (2707930) — Free; 88% of 27,733; released 25 Mar, 2024
15. Infinity Nikki (3164330) — Free; 57% of 5,556; released 28 Apr, 2025
16. Coral Island (1158160) — R$89,99; 89% of 14,340; released 14 Nov, 2023
17. Agromatic (4179990) — R$29,99 (was R$37,49); no score yet; released 10 Nov, 2026
18. DAVE THE DIVER (1868140) — R$59,99; 96% of 51,600; released 28 Jun, 2023
19. Ranch Simulator: Build, Hunt, Farm (1119730) — R$47,49; 77% of 12,170; released 3 Nov, 2023
20. Fields of Mistria (2142790) — R$44,49; 97% of 26,319; released 5 Aug, 2026
21. Disney Dreamlight Valley (1401590) — R$214,90; 91% of 15,982; released 5 Dec, 2023
22. Horses of Hoofprint Bay (3727090) — R$74,19 (was R$87,29); 98% of 1,386; released 4 Nov, 2026
23. The Sims 4 Cottage Living Expansion Pack (1458150) — R$179,00; 71% of 295; released 22 Jul, 2021
24. How to Train Your Cock (3673060) — R$6,99 (was R$9,99); 90% of 716; released 27 Oct, 2025
25. ONE PIECE: Grand Gourmet (3905010) — R$82,90; 76% of 683; released 22 Oct, 2026
26. Kynseed (758870) — R$73,99; 82% of 2,690; released 6 Dec, 2022
27. I Am Future: Cozy Apocalypse Survival (1658040) — R$23,99 (was R$59,99); 83% of 2,094; released 13 Nov, 2024
28. Palia – Royal Highlands Supporter Pack (4465230) — R$162,00; 58% of 12; released 12 May, 2026
29. Nivalis Nights (1488490) — R$86,99; 79% of 3,167; released 29 Sep, 2026
30. Gaucho and the Grassland (1670830) — R$38,99 (was R$59,99); 96% of 421; released 16 Jul, 2025

**(d) Concurrent players.**
- Steam's own top-100 chart, data stamped 2026-11-11 13:46:24 UTC: **Stardew Valley rank 19, 70,956 in game, 71,940 peak today; Farming Simulator 25 rank 49, 31,848 in game, 46,384 peak today.** Rank 100 had 14,980 in game. No other farming or farm-life game (Palia, Heartopia, Farming Simulator 22, Fields of Mistria, Disney Dreamlight Valley, Core Keeper) is in the top 100 — [Steam Charts page](https://store.steampowered.com/stats/Steam-Game-and-Player-Statistics?l=english)
- None of Stardew Valley, Farming Simulator 25, Farming Simulator 22, Palia, Heartopia or Fields of Mistria is in the US weekly top-20 sellers embedded in the same page — [Steam Charts page](https://store.steampowered.com/stats/Steam-Game-and-Player-Statistics?l=english)
- SteamSpy's peak-yesterday figures agree with Steam's chart for the two games that can be cross-checked (Stardew Valley 71,622 vs 71,940; Farming Simulator 25 46,290 vs 46,384) — [SteamSpy 413150](https://steamspy.com/api.php?request=appdetails&appid=413150), [SteamSpy 2300320](https://steamspy.com/api.php?request=appdetails&appid=2300320)

**(e) SteamSpy owners estimate and CCU for the 49 apps queried, sorted by CCU.** Owners are estimates. CCU is SteamSpy's "peak CCU yesterday" (10 November 2026).

| App id | Game | Owners (SteamSpy estimate) | CCU (SteamSpy: peak concurrent yesterday) | Avg / median playtime, all time (hours) | Source |
|---|---|---|---|---|---|
| 413150 | Stardew Valley | 20,000,000 .. 50,000,000 | 71,622 | 87 / 26 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=413150) |
| 2300320 | Farming Simulator 25 | 1,000,000 .. 2,000,000 | 46,290 | 71 / 50 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2300320) |
| 1248130 | Farming Simulator 22 | 2,000,000 .. 5,000,000 | 8,069 | 206 / 47 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1248130) |
| 1868140 | DAVE THE DIVER | 5,000,000 .. 10,000,000 | 6,086 | 25 / 17 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1868140) |
| 1401590 | Disney Dreamlight Valley | 500,000 .. 1,000,000 | 5,204 | 23 / 11 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1401590) |
| 2707930 | Palia | 0 .. 20,000 (implausible for a free game with 45k reviews; treat as not tracked) | 5,140 | 12 / 2 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2707930) |
| 1621690 | Core Keeper | 1,000,000 .. 2,000,000 | 4,734 | 39 / 21 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1621690) |
| 2142790 | Fields of Mistria | 500,000 .. 1,000,000 | 4,078 | 30 / 30 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2142790) |
| 1062090 | Timberborn | 1,000,000 .. 2,000,000 | 3,908 | 51 / 21 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1062090) |
| 1129580 | Medieval Dynasty | 1,000,000 .. 2,000,000 | 2,957 | 53 / 20 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1129580) |
| 3167550 | Tiny Pasture | 200,000 .. 500,000 | 2,256 | 37 / 22 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=3167550) |
| 599140 | Graveyard Keeper | 1,000,000 .. 2,000,000 | 1,840 | 24 / 10 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=599140) |
| 787860 | Farming Simulator 19 | 2,000,000 .. 5,000,000 | 1,775 | 179 / 34 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=787860) |
| 1158160 | Coral Island | 500,000 .. 1,000,000 | 1,699 | 49 / 5 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1158160) |
| 1419170 | My Singing Monsters | 1,000,000 .. 2,000,000 | 1,573 | 11 / 1 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1419170) |
| 972660 | Spiritfarer: Farewell Edition | 1,000,000 .. 2,000,000 | 1,257 | 14 / 10 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=972660) |
| 1044720 | Farthest Frontier | 1,000,000 .. 2,000,000 | 1,229 | 28 / 12 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1044720) |
| 2666510 | Rusty's Retirement | 200,000 .. 500,000 | 1,185 | 71 / 23 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2666510) |
| 2418520 | Farm Together 2 | 50,000 .. 100,000 | 1,080 | 32 / 29 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2418520) |
| 1084600 | My Time at Sandrock | 500,000 .. 1,000,000 | 995 | 56 / 45 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1084600) |
| 1139980 | Travellers Rest | 500,000 .. 1,000,000 | 990 | 12 / 9 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1139980) |
| 1468260 | Leaf Blower Revolution - Idle Game | 1,000,000 .. 2,000,000 | 943 | 71 / 7 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1468260) |
| 1062520 | Dinkum | 1,000,000 .. 2,000,000 | 897 | 48 / 13 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1062520) |
| 1657630 | Slime Rancher 2 | 1,000,000 .. 2,000,000 | 873 | 13 / 8 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1657630) |
| 433340 | Slime Rancher | 2,000,000 .. 5,000,000 | 856 | 19 / 8 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=433340) |
| 1210320 | Potion Craft: Alchemist Simulator | 1,000,000 .. 2,000,000 | 844 | 10 / 8 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1210320) |
| 1119730 | Ranch Simulator: Build, Hunt, Farm | 1,000,000 .. 2,000,000 | 744 | 20 / 7 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1119730) |
| 1677110 | Lightyear Frontier | 200,000 .. 500,000 | 732 | 13 / 13 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1677110) |
| 1432860 | Sun Haven | 500,000 .. 1,000,000 | 644 | 38 / 26 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1432860) |
| 382310 | Eco | 500,000 .. 1,000,000 | 510 | 45 / 6 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=382310) |
| 447020 | Farming Simulator 17 | 1,000,000 .. 2,000,000 | 506 | 39 / 15 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=447020) |
| 2408820 | Luma Island | 500,000 .. 1,000,000 | 487 | 17 / 9 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2408820) |
| 666140 | My Time at Portia | 1,000,000 .. 2,000,000 | 346 | 25 / 6 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=666140) |
| 751780 | Forager | 1,000,000 .. 2,000,000 | 245 | 30 / 9 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=751780) |
| 673950 | Farm Together | 1,000,000 .. 2,000,000 | 238 | 42 / 36 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=673950) |
| 544550 | Stationeers | 200,000 .. 500,000 | 232 | 79 / 12 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=544550) |
| 313160 | Farming Simulator 15 | 1,000,000 .. 2,000,000 | 71 | 40 / 21 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=313160) |
| 1594940 | Little Witch in the Woods | 500,000 .. 1,000,000 | 56 | 17 / 12 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1594940) |
| 894940 | Littlewood | 200,000 .. 500,000 | 31 | 20 / 9 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=894940) |
| 2060160 | The Farmer Was Replaced | 200,000 .. 500,000 | 31 | 13 / 3 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2060160) |
| 1488490 | Nivalis Nights | 0 .. 20,000 (placeholder; app not tracked) | not tracked (0) | 17 / 14 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1488490) |
| 2016460 | Tales of the Shire: A The Lord of The Rings Game | 0 .. 20,000 (placeholder; app not tracked) | not tracked (0) | 0 / 0 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2016460) |
| 2966320 | Starsand Island | 0 .. 20,000 (placeholder; app not tracked) | not tracked (0) | 3 / 3 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2966320) |
| 3370870 | Berry Bury Berry | 0 .. 20,000 (placeholder; app not tracked) | not tracked (0) | 1 / 1 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=3370870) |
| 3164330 | Infinity Nikki | 0 .. 20,000 (placeholder; app not tracked) | not tracked (0) | 24 / 6 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=3164330) |
| 2320980 | Loftia | 0 .. 20,000 (placeholder; app not tracked) | not tracked (0) | 0 / 0 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2320980) |
| 4358690 | Graveyard Keeper 2 | 0 .. 20,000 (placeholder; app not tracked) | not tracked (0) | 33 / 19 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=4358690) |
| 4025700 | Heartopia | 0 .. 20,000 (placeholder; app not tracked) | not tracked (0) | 2 / 1 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=4025700) |
| 3198850 | Play Together | 0 .. 20,000 (placeholder; app not tracked) | not tracked (0) | 0 / 0 | [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=3198850) |

**(f) The 15 largest farming-central games by review count: developer, publisher, dates, prices, reviews, flags.** Prices from the appdetails batches listed at the top; everything else from the linked store page. "Last 30 days" is all languages. Flags are Steam's category list; "SP" = Single-player, "IAP" = In-App Purchases. None of the 15 carries the MMO flag; only Stardew Valley carries LAN Co-op.

| Game (app id) | Developer / Publisher | Steam release date (Early Access start) | USD / BRL | Reviews all-lang (% pos) | Last 30 days (% pos) | Steam category flags | Free to Play |
|---|---|---|---|---|---|---|---|
| Stardew Valley ([413150](https://store.steampowered.com/app/413150/?l=english&cc=us)) | ConcernedApe / ConcernedApe | Feb 26, 2016 | $14.99 / R$24,99 | 1,050,832 (98.5%) | 5,969 (98.4%) | SP, Online Co-op, LAN Co-op, Split Screen | no |
| Farming Simulator 22 ([1248130](https://store.steampowered.com/app/1248130/?l=english&cc=us)) | GIANTS Software / GIANTS Software | Nov 21, 2021 | $19.99 / R$94,95 | 93,552 (92.8%) | 298 (96.0%) | SP, Online Co-op, Cross-Platform MP | no |
| Farming Simulator 19 ([787860](https://store.steampowered.com/app/787860/?l=english&cc=us)) | GIANTS Software / GIANTS Software | Nov 19, 2018 | $17.99 / R$76,99 | 76,548 (94.5%) | 113 (97.3%) | SP, Online Co-op | no |
| Farming Simulator 25 ([2300320](https://store.steampowered.com/app/2300320/?l=english&cc=us)) | GIANTS Software / GIANTS Software | Nov 12, 2024 | $29.99 / R$143,95 | 61,313 (87.6%) | 1,169 (91.7%) | SP, Online Co-op | no |
| Ranch Simulator: Build, Hunt, Farm ([1119730](https://store.steampowered.com/app/1119730/?l=english&cc=us)) | Toxic Dog / Excalibur Games | Nov 3, 2023 (EA Mar 4, 2021) | $24.99 / R$47,49 | 49,246 (79.1%) | 323 (79.6%) | SP, Online Co-op, Online PvP | no |
| Palia ([2707930](https://store.steampowered.com/app/2707930/?l=english&cc=us)) | Singularity 6 Corporation / Singularity 6 Corporation | Mar 25, 2024 | Free / Free | 45,135 (86.0%) | 360 (76.4%) | SP, Online Co-op, Cross-Platform MP, IAP | yes |
| My Time at Portia ([666140](https://store.steampowered.com/app/666140/?l=english&cc=us)) | Pathea Games / Focus Entertainment, Pathea Games | Jan 15, 2019 | $29.99 / R$99,90 | 44,390 (91.5%) | 49 (87.8%) | SP | no |
| Fields of Mistria ([2142790](https://store.steampowered.com/app/2142790/?l=english&cc=us)) | NPC Studio / NPC Studio | Aug 5, 2026 (EA Aug 5, 2024) | $13.99 / R$44,49 | 37,015 (97.0%) | 787 (95.0%) | SP | no |
| My Time at Sandrock ([1084600](https://store.steampowered.com/app/1084600/?l=english&cc=us)) | Pathea Games / Pathea Games, Focus Entertainment, PM Studios, Inc., DMM Games | Nov 2, 2023 (EA May 25, 2022) | $39.99 / R$139,90 | 29,292 (88.1%) | 90 (80.0%) | SP, Online Co-op | no |
| Dinkum ([1062520](https://store.steampowered.com/app/1062520/?l=english&cc=us)) | James Bendon / KRAFTON, Inc. | Apr 22, 2025 (EA Jul 14, 2022) | $19.99 / R$59,99 | 29,279 (91.8%) | 71 (90.1%) | SP, Online Co-op | no |
| Coral Island ([1158160](https://store.steampowered.com/app/1158160/?l=english&cc=us)) | Stairway Games / Balor Games | Nov 14, 2023 (EA Oct 11, 2022) | $29.99 / R$89,99 | 27,959 (89.0%) | 135 (87.4%) | SP, Online Co-op, Cross-Platform MP | no |
| Farming Simulator 17 ([447020](https://store.steampowered.com/app/447020/?l=english&cc=us)) | GIANTS Software / GIANTS Software | Oct 24, 2016 | $14.99 / R$37,99 | 26,044 (93.5%) | 56 (87.5%) | SP, Cross-Platform MP, Co-op | no |
| Sun Haven ([1432860](https://store.steampowered.com/app/1432860/?l=english&cc=us)) | Pixel Sprout Studios / Pixel Sprout Studios | Mar 10, 2023 (EA Jun 25, 2021) | $24.99 / R$69,99 | 25,820 (80.4%) | 108 (78.7%) | SP, Online Co-op, IAP | no |
| Farm Together ([673950](https://store.steampowered.com/app/673950/?l=english&cc=us)) | Milkstone Studios / Milkstone Studios | Oct 11, 2018 | $19.99 / R$59,99 | 22,136 (94.1%) | 18 (88.9%) | SP, Online Co-op, Split Screen | no |
| Farming Simulator 15 ([313160](https://store.steampowered.com/app/313160/?l=english&cc=us)) | GIANTS Software / GIANTS Software | Oct 30, 2014 | $12.99 / R$26,89 | 15,923 (92.5%) | 33 (97.0%) | SP, Cross-Platform MP, Co-op | no |

**(g) Same facts for adjacent and special-interest games** (hybrids outside the tags, free-to-play life sims, 2025–2026 co-op entrants).

| Game (app id) | Developer / Publisher | Steam release date (Early Access start) | USD / BRL | Reviews all-lang (% pos) | Last 30 days (% pos) | Steam category flags | Free to Play |
|---|---|---|---|---|---|---|---|
| Slime Rancher ([433340](https://store.steampowered.com/app/433340/?l=english&cc=us)) | Monomi Park / Monomi Park | Aug 1, 2017 | $19.99 / R$59,99 | 159,024 (98.0%) | 907 (97.4%) | SP | no |
| Core Keeper ([1621690](https://store.steampowered.com/app/1621690/?l=english&cc=us)) | Pugstorm / Fireshine Games, bilibili | Aug 27, 2024 (EA Mar 8, 2022) | $19.99 / R$59,99 | 68,564 (92.9%) | 722 (93.8%) | SP, Online Co-op | no |
| Graveyard Keeper ([599140](https://store.steampowered.com/app/599140/?l=english&cc=us)) | Lazy Bear Games / tinyBuild | Aug 15, 2018 | $4.99 (-75%; base $19.99) / R$14,99 (-75%; base R$59,99) | 57,201 (85.2%) | 252 (81.7%) | SP | no |
| Slime Rancher 2 ([1657630](https://store.steampowered.com/app/1657630/?l=english&cc=us)) | Monomi Park / Monomi Park | Sep 23, 2025 (EA Sep 22, 2022) | $29.99 / R$89,99 | 50,956 (94.5%) | 393 (94.7%) | SP | no |
| Disney Dreamlight Valley ([1401590](https://store.steampowered.com/app/1401590/?l=english&cc=us)) | Gameloft / Gameloft | Dec 5, 2023 (EA Sep 6, 2022) | $39.99 / R$214,90 | 25,299 (92.2%) | 203 (92.1%) | SP, IAP, Multi-player | no |
| Heartopia ([4025700](https://store.steampowered.com/app/4025700/?l=english&cc=us)) | XD / XD | Jan 16, 2026 | Free / Free | 16,461 (66.2%) | 319 (69.0%) | SP, Cross-Platform MP, IAP, Multi-player | yes |
| Graveyard Keeper 2 ([4358690](https://store.steampowered.com/app/4358690/?l=english&cc=us)) | Lazy Bear Games / tinyBuild | Sep 22, 2026 | $24.99 / R$74,99 | 11,561 (75.8%) | 1,770 (76.9%) | SP | no |
| Farm Together 2 ([2418520](https://store.steampowered.com/app/2418520/?l=english&cc=us)) | Milkstone Studios / Milkstone Studios | May 30, 2025 (EA May 7, 2024) | $25.99 / R$77,13 | 5,547 (93.8%) | 34 (88.2%) | SP, Online Co-op, Split Screen, Cross-Platform MP | no |
| Loftia ([2320980](https://store.steampowered.com/app/2320980/?l=english&cc=us)) | Qloud Games / Qloud Games | Nov 3, 2026 (EA Nov 3, 2026) | $24.89 (-17%; base $29.99) / R$73,86 (-17%; base R$88,99) | 1,266 (88.5%) | not shown | Online Co-op, MMO, IAP | no |
| Starsand Island ([2966320](https://store.steampowered.com/app/2966320/?l=english&cc=us)) | Seed Sparkle Lab / Seed Sparkle Lab | Aug 18, 2026 (EA Feb 11, 2026) | $39.99 / R$107,99 | 6,959 (75.1%) | 41 (51.2%) | SP, Multi-player | no |
| Lightyear Frontier ([1677110](https://store.steampowered.com/app/1677110/?l=english&cc=us)) | FRAME BREAK / FRAME BREAK, Coffee Stain Publishing | Nov 4, 2026 (EA Mar 19, 2024) | $23.99 (-20%; base $29.99) / R$71,99 (-20%; base R$89,99) | 5,061 (83.1%) | 250 (76.0%) | SP, Online Co-op, Cross-Platform MP | no |
| Luma Island ([2408820](https://store.steampowered.com/app/2408820/?l=english&cc=us)) | Feel Free Games / Feel Free Games | Nov 20, 2024 | $19.99 / R$35,99 | 12,887 (84.2%) | 63 (88.9%) | SP, Online Co-op | no |
| Play Together ([3198850](https://store.steampowered.com/app/3198850/?l=english&cc=us)) | HAEGIN Co.,Ltd. / HAEGIN Co.,Ltd. | Jan 13, 2025 | Free / Free | 1,795 (74.3%) | 38 (63.2%) | Online Co-op, MMO, Cross-Platform MP, IAP, Online PvP | yes |
| The Ranchers ([1501310](https://store.steampowered.com/app/1501310/?l=english&cc=us)) | The Ranchers / Trophy Games Publishing ApS | Jul 30, 2026 (EA Jul 30, 2026) | $24.99 / R$79,99 | 683 (58.0%) | 10 (60.0%) | SP, Online Co-op, Cross-Platform MP | no |

- Hello Kitty Island Adventure: Sunblink (developer and publisher), released Jan 30, 2025, $39.99 / R$147,45, 12,933 reviews at 94.0%, last 30 days 197 at 94.4%, flags Single-player and Online Co-op — [store page](https://store.steampowered.com/app/2495100/?l=english&cc=us), [USD batch 2](https://store.steampowered.com/api/appdetails?appids=1501310,2495100,2711030,3591180,2209900,2508780,2864560,2272900,1805110,2340520,1465550,1746930,2569670,1121640,3602570&cc=us&filters=price_overview), [BRL batch 2](https://store.steampowered.com/api/appdetails?appids=1501310,2495100,2711030,3591180,2209900,2508780,2864560,2272900,1805110,2340520,1465550,1746930,2569670,1121640,3602570&cc=br&filters=price_overview)
- The Ranchers' prices in the table come from [USD batch 2](https://store.steampowered.com/api/appdetails?appids=1501310,2495100,2711030,3591180,2209900,2508780,2864560,2272900,1805110,2340520,1465550,1746930,2569670,1121640,3602570&cc=us&filters=price_overview) and [BRL batch 2](https://store.steampowered.com/api/appdetails?appids=1501310,2495100,2711030,3591180,2209900,2508780,2864560,2272900,1805110,2340520,1465550,1746930,2569670,1121640,3602570&cc=br&filters=price_overview)

### Inferences
- Three size tiers hold on live data. Tier 1: Stardew Valley (1.05M reviews). Tier 2: Slime Rancher (159k) and the Farming Simulator series (61k–94k per entry). Tier 3: about ten games between 22k and 50k (Ranch Simulator, Palia, My Time at Portia, Fields of Mistria, Sandrock, Dinkum, Coral Island, Sun Haven, Disney Dreamlight Valley, Farm Together).
- Review count and current activity diverge sharply. Ranch Simulator and My Time at Portia have 44k–49k reviews but under 750 peak players yesterday, while Fields of Mistria (37k reviews) had 4,078 and Palia 5,140. For judging what is alive today, CCU and the top-seller order are better guides than lifetime reviews.
- Farming Simulator 25's price is much higher in Brazil relative to the US than other games': R$143,95 against $29.99 is about R$4.80 per dollar, while Stardew Valley (R$24,99 / $14.99) is about R$1.67 and Ranch Simulator (R$47,49 / $24.99) about R$1.90. It still tops the Brazilian tag chart, which suggests strong Brazilian demand for the tractor-and-machinery fantasy.
- Brazil's top-seller order differs from the US order: older Farming Simulator entries (22 at #9, 19 at #11) rank far higher in Brazil than in the US (22 at #52), consistent with price-sensitive buyers picking cheaper back-catalogue entries.

### Gaps
- All-time peak concurrent players: not available from these hosts for any game.
- Current CCU for Heartopia, Graveyard Keeper 2, Loftia, Starsand Island, Infinity Nikki, Play Together, Nivalis Nights, Tales of the Shire and Berry Bury Berry: SteamSpy returns placeholder zeros and none is in Steam's top 100, so the only statement possible is "below 14,980 in game at 13:46 UTC".
- SteamSpy owners for Palia ("0 .. 20,000") is plainly wrong for a free game with 45k reviews; no owners estimate exists for Palia or Heartopia.
- The top 30 by review count could miss a game whose listing count is below about 2,500 but whose non-English reviews are more than four times that. Every Farming Sim product with a listing count of 2,600 or more, and every Agriculture product with 2,300 or more, was checked on its store page; positions 28–30 of the Agriculture table are the least certain.
- Top-seller lists are a ranking only; Steam gives no revenue or unit numbers.

## 2. Presentation (2D or 3D, camera) and multiplayer structure, from each game's own store text

### Takeaway
Store pages confirm most of the earlier background-knowledge claims on co-op size (Stardew Valley 8, Sun Haven 8, Core Keeper 8, Coral Island 4, Sandrock 4, Ranch Simulator 4, Disney Dreamlight Valley 4) and confirm Farm Together's always-growing, permission-based open farm. They do **not** state a player cap for Farming Simulator 25 or 22, Farm Together 1 or 2, Palia, Heartopia or Dinkum, and several pages carry no 2D/3D or camera tag at all.

### Cited Findings
"Tags" are the 20 user tags shown on the store page; "flags" are Steam's category list. Quotes are verbatim from the store page's description.

- **Stardew Valley** — 2D pixel art: tags include "Pixel Graphics" and "2D"; no camera tag. Co-op for 8: "8 Player Farming! Invite 1-7 players to join you in the valley online! Players can work together to build a thriving farm, share resources, and improve the local community." Flags: Single-player, Online Co-op, LAN Co-op, Shared/Split Screen Co-op, Remote Play Together — [store page](https://store.steampowered.com/app/413150/?l=english&cc=us)
- **Farming Simulator 25** — 3D, realistic, both cameras: tags "Realistic", "3D", "First-Person", "Third Person". Multiplayer is described only as "single-handedly or cooperatively in multiplayer"; no player number, no mention of servers. Flags: Single-player, Online Co-op (no Cross-Platform Multiplayer flag). Mods: "download developer-tested user creations from the in-game ModHub" — [store page](https://store.steampowered.com/app/2300320/?l=english&cc=us)
- **Farming Simulator 22** — tags "3D", "First-Person", "Third Person". "Even run your farm together with friends and enjoy crossplatform multiplayer together." Flags: Single-player, Online Co-op, Cross-Platform Multiplayer. No player number stated — [store page](https://store.steampowered.com/app/1248130/?l=english&cc=us)
- **Farm Together (2018)** — tags "Third Person", "Cartoony" (no 2D/3D tag). Real-time persistent farm with access levels: "In Farm Together time advances even if you're not online, so you can be sure you'll have something to do when you come back later." and "Manage your farm all by yourself, allow entrance only to your friends, or open it to the public and start cultivating together!" Flags: Single-player, Online Co-op, Shared/Split Screen Co-op, Remote Play Together. No player number stated — [store page](https://store.steampowered.com/app/673950/?l=english&cc=us)
- **Farm Together 2** — tags "3D", "Cartoony", "Idler". Same structure plus permissions: "In Farm Together 2 time advances even if you're not online" and "With its simple permission system, you can invite strangers to your farm without risk." Also: "Customize your avatar and your tractor to your liking, and go visit your friends' farms!" Flags: Single-player, Online Co-op, Shared/Split Screen Co-op, Cross-Platform Multiplayer, Remote Play Together. No player number stated — [store page](https://store.steampowered.com/app/2418520/?l=english&cc=us)
- **Palia** — no 2D/3D or camera tag; tags include "Free to Play", "Multiplayer", "Online Co-Op", "MMORPG". Described as "a free-to-play fantasy life sim adventure" and "The Fantasy Life Sim Adventure For You and Your Friends"; "Whether solo or with friends, Palia is a place where you're always welcome." Flags: Single-player, Online Co-op, Cross-Platform Multiplayer, In-App Purchases (no MMO flag). Requires a Palia account. No server size or party size stated — [store page](https://store.steampowered.com/app/2707930/?l=english&cc=us)
- **Heartopia** — tags "Third Person", "Cartoony", "3D Platformer". "Welcome to Heartopia, a multiplayer life simulation game crafted for creativity, freedom, and peace." "Chat with the charming residents of Heartopia Town, hang out with old friends, and meet new friends every time you log in!" "You can also invite your friends over and build your dream home together." Gardening is one of "six major hobbies, including fishing, cooking, gardening, birdwatching, and more." Flags: Single-player, Multi-player, Cross-Platform Multiplayer, In-App Purchases. The page discloses AI use: "AI is used in the puzzle gameplay to reinterpret and redraw in-game snapshot images. AI is used in in-game chat to help players understand different languages." No player numbers stated — [store page](https://store.steampowered.com/app/4025700/?l=english&cc=us)
- **Coral Island** — no 2D/3D or camera tag. "Coral Island is a vibrant, laid-back farm sim reimagined with multiplayer!" and "Team up with up to 3 friends (4 farmers total) to build the farm of your dreams! Grow crops, share resources, and uncover local mysteries together." Flags: Single-player, Online Co-op, Cross-Platform Multiplayer — [store page](https://store.steampowered.com/app/1158160/?l=english&cc=us)
- **Fields of Mistria** — 2D pixel art: tags "Pixel Graphics", "2D", "Anime". Single-player only: the only player-mode flag is Single-player — [store page](https://store.steampowered.com/app/2142790/?l=english&cc=us)
- **Dinkum** — no 2D/3D or camera tag. "Farm, hunt, mine, fish, and forage to gather resources, expand your town, and discover what makes Dinkum so special—either solo or with friends." "Invite friends over to show off your one-of-a-kind creation!" Flags: Single-player, Online Co-op. No player number stated — [store page](https://store.steampowered.com/app/1062520/?l=english&cc=us)
- **Sun Haven** — 2D pixel art: tag "Pixel Graphics". "Level up through a skill tree in 8 person multiplayer, or adventure solo!" and "Share a farm and play with up to 8 friends online, or keep to yourself and play solo." (the page gives both "8 person" and "up to 8 friends"). "Your characters keep their inventories and experience levels, even if you use the same character for both singleplayer and multiplayer!" Flags: Single-player, Online Co-op, In-App Purchases — [store page](https://store.steampowered.com/app/1432860/?l=english&cc=us)
- **My Time at Sandrock** — tag "Cartoony"; description mentions "third-person shooting mechanics". "Explore, build, and battle with up to 4 players." Flags: Single-player, Online Co-op — [store page](https://store.steampowered.com/app/1084600/?l=english&cc=us)
- **Ranch Simulator** — tags "Realistic", "First-Person". "either alone or in up to four player co-op multiplayer"; "captivating single and multiplayer open-world simulator"; marketing claim "Join over 3 million players who have already purchased Ranch Simulator on Steam!" Flags: Single-player, Online PvP, Online Co-op — [store page](https://store.steampowered.com/app/1119730/?l=english&cc=us)
- **Slime Rancher** — "Slime Rancher is a charming, first-person, sandbox experience." Only player-mode flag: Single-player — [store page](https://store.steampowered.com/app/433340/?l=english&cc=us)
- **Slime Rancher 2** — tags "First-Person", "3D". Only player-mode flag: Single-player — [store page](https://store.steampowered.com/app/1657630/?l=english&cc=us)
- **Disney Dreamlight Valley** — tag "3D". "Connect with up to three other players through the Valley Visit Station, which lets you join your friends' Valley, exchange resources, and more!" Flags: Single-player, Multi-player, In-App Purchases. Requires a third-party account (Microsoft Playfab) — [store page](https://store.steampowered.com/app/1401590/?l=english&cc=us)
- **Core Keeper** — 2D pixel art: tags "Pixel Graphics", "2D". "a mining sandbox adventure for 1-8 players"; "Enjoy the adventure solo or team up in 2-8 player drop-in/drop-out online co-op."; "host your own dedicated server". Flags: Single-player, Online Co-op — [store page](https://store.steampowered.com/app/1621690/?l=english&cc=us)
- **My Time at Portia** — only player-mode flag: Single-player — [store page](https://store.steampowered.com/app/666140/?l=english&cc=us)
- Newer 3D co-op entrants, for comparison:
  - **Loftia** (Early Access since Nov 3, 2026): "a cozy multiplayer game about building a life in the sky… you'll farm, craft, decorate, and explore alongside friends in a shared world that grows over time"; "Create your own floating island and link up with others to form neighborhoods"; "Work together on community projects that help the world grow." Flags: MMO, Online Co-op, In-App Purchases — [store page](https://store.steampowered.com/app/2320980/?l=english&cc=us)
  - **The Ranchers** (Early Access since Jul 30, 2026): "an open world country-life sim for 1-4 players"; "When you join a friend, you are visiting the host's world, so ranch and quest progression remain tied to the host's save." Tags "Top-Down", "3D" — [store page](https://store.steampowered.com/app/1501310/?l=english&cc=us)
  - **Luma Island**: "Play solo, or team up with friends in 1-4 player online co-op"; "drop-in/drop-out multiplayer" — [store page](https://store.steampowered.com/app/2408820/?l=english&cc=us)
  - **Lightyear Frontier**: "an open-world mech farming game for 1-4 players. Up to three friends can join you on your farm." Tags "First-Person". Flags include Cross-Platform Multiplayer — [store page](https://store.steampowered.com/app/1677110/?l=english&cc=us)
  - **Play Together** (free): flags MMO, Online PvP, Online Co-op, Cross-Platform Multiplayer, In-App Purchases; "Game Party, where the last one standing from 30 players wins" — [store page](https://store.steampowered.com/app/3198850/?l=english&cc=us)
  - **Starsand Island**: flags Single-player, Multi-player; tags "3D", "Anime"; the description does not describe its multiplayer — [store page](https://store.steampowered.com/app/2966320/?l=english&cc=us)
- Brazilian-Portuguese interface support is listed for 18 of 20 pages checked; **Fields of Mistria and Starsand Island do not list Portuguese - Brazil** — [Fields of Mistria](https://store.steampowered.com/app/2142790/?l=english&cc=us), [Starsand Island](https://store.steampowered.com/app/2966320/?l=english&cc=us)

### Inferences
- Among the co-op games whose page states a size, the pattern is 4 players (Coral Island, Sandrock, Ranch Simulator, Disney Dreamlight Valley visits, Luma Island, Lightyear Frontier, The Ranchers) or 8 (Stardew Valley, Core Keeper, Sun Haven). Nothing farming-first in this set advertises a larger shared farm on its store page (the Farming Simulator pages give no number); the larger-world offers (Palia, Heartopia, Loftia, Play Together) are life sims where farming is one activity.
- The Ranchers' own page spells out the weakness of host-based co-op ("progression remain tied to the host's save"). Farm Together's pages promise a farm that keeps growing while the owner is offline and graded access for friends or the public; they do not say whether visitors can enter while the owner is offline, so it is not established that Farm Together avoids the same dependency.
- Few pages describe anything other than joining a friend's world: Core Keeper mentions dedicated servers, Loftia a "shared world", and Loftia, Play Together and Farm RPG carry the MMO flag; Palia and Heartopia present themselves as online worlds without that flag. No farming-first game in this set describes a persistent online farm that exists independently of one player's session.
- A paid game can carry the In-App Purchases flag (Sun Haven, Disney Dreamlight Valley, Loftia). Loftia is the notable new case: a paid Early Access cozy MMO that also declares in-app purchases.

### Gaps
- Player caps for Farming Simulator 25 and 22 (the earlier notes' "16 on PC"), Farm Together 1 and 2, Palia (server and party size), Heartopia and Dinkum are not stated on their store pages and remain unverified.
- Dedicated-server support for Farming Simulator and how Palia's and Heartopia's shared spaces are instanced are not described on the store pages.
- Camera perspective for Stardew Valley, Coral Island, Dinkum, Palia and Fields of Mistria is not stated in tags or description; 2D/3D is not stated for Palia, Coral Island, Dinkum, Farm Together (2018) or Sandrock.
- Farming Simulator 25 has no Cross-Platform Multiplayer flag on Steam while Farming Simulator 22 has one; whether FS25 lacks cross-play or the flag is simply missing could not be determined.

## 3. Free-to-play farming and life-sim games on Steam

### Takeaway
Only 12 free products carrying the Farming Sim tag register in Steam's top-sellers list, and only five of them have more than 1,500 reviews: My Singing Monsters (50,582, 93.5%), Palia (45,135, 86.0%), Leaf Blower Revolution (26,556, 94.1%), Infinity Nikki (10,718, 57.9%) and Play Together (1,795, 74.3%); Heartopia (16,461, 66.2%) sits outside the tag. Browser-style free farm ports are rated Mixed (49%–61%). Packs listed on Steam for these games run from $3.99 to $59.99; Palia's run from $4.99 to $59.99 (R$20,00 to R$162,00).

### Cited Findings
- Free products that register as top sellers under the Farming Sim tag (12 in total), in Steam's order: 1 Palia, 2 Infinity Nikki, 3 My Singing Monsters, 4 Play Together, 5 My Little Farmies, 6 Leaf Blower Revolution, 7 My Free Farm 2, 8 Star Chef 2, 9 Global City, 10 Farm Manager, 11 Dinosaur Park – Primeval Zoo, 12 California Escapades — [free top sellers, Farming Sim](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=50&tags=87918&filter=topsellers&maxprice=free)
- Free top sellers under the Life Sim tag (10235), 16 in total: 1 The Sims 4 (listing: 107,964 reviews, 86%), **2 Heartopia, 3 Palia, 4 Infinity Nikki**, 5 Life Makeover, 6 Play Together, 7 Mabinogi, 8 A Date with Death, 9 Supermarket Together, 10 Avakin Life (63%), 11 Habbo Hotel: Origins (55%) — [free top sellers, Life Sim](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=50&tags=10235&filter=topsellers&maxprice=free)
- The Farming Sim listing filtered to free holds 291 entries, most of them demos, prologues and free DLC — [free Farming Sim listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&sort_by=Reviews_DESC&maxprice=free)

| Game | Reviews all-lang (% pos) | Last 30 days | Activity | What the Steam store sells (USD / BRL) | Flags |
|---|---|---|---|---|---|
| Palia ([2707930](https://store.steampowered.com/app/2707930/?l=english&cc=us)) | 45,135 (86.0%) | 360 (76.4%) | SteamSpy peak yesterday 5,140; #9 in US Farming Sim top sellers, #14 in Brazil | Starter Pack $4.99 / R$20,00; Founders Pack $29.99 / R$115,00; Highlands Supporter Pack $29.99 / R$99,99; Royal Highlands Supporter Pack $59.99 / R$162,00; Soundtrack $9.99 / R$45,00 | Single-player, Online Co-op, Cross-Platform Multiplayer, In-App Purchases |
| Heartopia ([4025700](https://store.steampowered.com/app/4025700/?l=english&cc=us)) | 16,461 (66.2%, Mixed) | 319 (69.0%) | #2 free Life Sim top seller; not tracked by SteamSpy; not in Steam top 100 | No DLC listed on Steam; purchases are in-game only | Single-player, Multi-player, Cross-Platform Multiplayer, In-App Purchases |
| Infinity Nikki ([3164330](https://store.steampowered.com/app/3164330/?l=english&cc=us)) | 10,718 (57.9%, Mixed) | 141 (83.0%) | #12 in US Farming Sim top sellers, #15 in Brazil | No DLC listed on Steam; purchases are in-game only | Single-player, Co-op, Cross-Platform Multiplayer, In-App Purchases |
| My Singing Monsters ([1419170](https://store.steampowered.com/app/1419170/?l=english&cc=us)) | 50,582 (93.5%) | 667 (93.1%) | SteamSpy peak yesterday 1,573 | 19 skin packs: island packs $9.99 (R$20,69), seasonal packs $4.99 | Single-player, Online Co-op, In-App Purchases |
| Leaf Blower Revolution ([1468260](https://store.steampowered.com/app/1468260/?l=english&cc=us)) | 26,556 (94.1%) | 72 (87.5%) | SteamSpy peak yesterday 943 | Premium Pack $24.99 / R$83,99; Cards Pack $13.99 / R$50,99; Materials Pack $8.99 / R$33,99; Supporter Pack $5.99; Skins Pack $3.99 | Single-player, In-App Purchases |
| Farmer Against Potatoes Idle ([1535560](https://store.steampowered.com/app/1535560/?l=english&cc=us)) | 8,261 (94.6%) | 50 (88.0%) | not queried | No DLC listed | Single-player, In-App Purchases |
| Play Together ([3198850](https://store.steampowered.com/app/3198850/?l=english&cc=us)) | 1,795 (74.3%) | 38 (63.2%) | #46 in US Farming Sim top sellers | Starter Packs $8.99 / R$29,99; Hunter Cash's Hidden Safe $24.99 / R$73,99; Cybermobile $24.99 / R$73,99; Private Yacht $34.99 / R$101,99; Hunter Cash's Golden Vault $44.99 / R$299,90 | MMO, Online PvP, Online Co-op, Cross-Platform Multiplayer, In-App Purchases |
| My Free Farm 2 ([799240](https://store.steampowered.com/app/799240/?l=english&cc=us)) | 788 (61.0%, Mixed) | not shown | #7 free Farming Sim top seller | No DLC listed | Single-player, Online Co-op, In-App Purchases |
| My Little Farmies ([789100](https://store.steampowered.com/app/789100/?l=english&cc=us)) | 683 (54.9%, Mixed) | not shown | #5 free Farming Sim top seller | No DLC listed | Single-player, Online Co-op, In-App Purchases |
| Farm RPG ([2287550](https://store.steampowered.com/app/2287550/?l=english&cc=us)), released Jun 3, 2026 | 510 (88.6%) | 37 (91.9%) | – | No DLC listed | Single-player, MMO, Online Co-op, In-App Purchases |
| Farm Manager ([3759820](https://store.steampowered.com/app/3759820/?l=english&cc=us)), released Nov 3, 2025 | 237 (49.4%, Mixed) | 11 (54.5%) | #10 free Farming Sim top seller | No DLC listed | Single-player, In-App Purchases |

- BRL prices in the table come from the [BRL DLC batch](https://store.steampowered.com/api/appdetails?appids=3720190,3708940,2901220,4465220,4465230,4794220,3550700,3786480,3540860,3303190,3550680,3550690,3731480,3453350,3724330,3985700,4094000,4232610,4580980,4968150,5169680,2305660,2375000,2375130,2375140,2401500,2401501,1889780,1894500,5366160,5373000,4404070,4664870,4348800,4651570,3453810,4348790,5090170,4376930,3979520,3979530,3311900,3259120,2632050,4127920,4127930,919770,924150,1482631,2125730,1873910,4391920,4395490,4424260,4460980&cc=br&filters=price_overview); USD prices from each store page; top-seller positions from the [US](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&filter=topsellers) and [Brazil](https://store.steampowered.com/search/results/?query&infinite=1&cc=br&l=english&start=0&count=50&tags=87918&filter=topsellers) lists; CCU from SteamSpy ([Palia](https://steamspy.com/api.php?request=appdetails&appid=2707930), [My Singing Monsters](https://steamspy.com/api.php?request=appdetails&appid=1419170), [Leaf Blower Revolution](https://steamspy.com/api.php?request=appdetails&appid=1468260))
- Other free farm titles seen only in the listings (listing counts): Global City 1,472 (68%, Mixed); Horse Farm 343 (55%); Farlands: Tiny Harvest 343 (78%); Farm Empire 197 (56%); Spellfarers, released Apr 29, 2026, 159 (40%) — [Farming Sim listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&sort_by=Reviews_DESC)
- Infinity Nikki's store page itself quotes a press line calling it gacha: "A true step forward for open-world gacha games" (attributed to Eurogamer) — [store page](https://store.steampowered.com/app/3164330/?l=english&cc=us)
- Palia's own paid packs carry review scores: Starter Pack 82% of 50 reviews; Royal Highlands Supporter Pack (R$162,00) "Mixed", 58% of 12 reviews. The Royal Highlands pack is #28 among Farming Sim top sellers in Brazil — [Farming Sim listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&sort_by=Reviews_DESC), [Brazil top sellers](https://store.steampowered.com/search/results/?query&infinite=1&cc=br&l=english&start=0&count=50&tags=87918&filter=topsellers)
- Play Together discloses generative AI ("AI provides conversational responses during NPC interactions") and a connection to the OpenAI API; Farm Manager discloses "AI image creation is used for vehicles/machines and Livestock on the store front and in the game"; Heartopia's user tags include "Artificial Intelligence" — store pages [3198850](https://store.steampowered.com/app/3198850/?l=english&cc=us), [3759820](https://store.steampowered.com/app/3759820/?l=english&cc=us), [4025700](https://store.steampowered.com/app/4025700/?l=english&cc=us)
- Paid games that also declare in-app purchases:
  - Disney Dreamlight Valley: base $39.99 / R$214,90; expansions A Rift in Time, The Storybook Vale and Wishblossom Ranch $29.99 / R$159,50 each; Honeyglow Woods $16.99 / R$82,95; editions bundle premium currency ("18,000 Moonstones", "13,000 Moonstones") — [store page](https://store.steampowered.com/app/1401590/?l=english&cc=us), [BRL DLC batch](https://store.steampowered.com/api/appdetails?appids=3720190,3708940,2901220,4465220,4465230,4794220,3550700,3786480,3540860,3303190,3550680,3550690,3731480,3453350,3724330,3985700,4094000,4232610,4580980,4968150,5169680,2305660,2375000,2375130,2375140,2401500,2401501,1889780,1894500,5366160,5373000,4404070,4664870,4348800,4651570,3453810,4348790,5090170,4376930,3979520,3979530,3311900,3259120,2632050,4127920,4127930,919770,924150,1482631,2125730,1873910,4391920,4395490,4424260,4460980&cc=br&filters=price_overview)
  - Sun Haven: $24.99 base plus 27 DLC, named as pet, mount and themed packs at $3.99–$12.99 (the $3.99 and $4.99 packs cost R$13,79 and R$16,99), plus two soundtracks — [store page](https://store.steampowered.com/app/1432860/?l=english&cc=us), [BRL DLC batch](https://store.steampowered.com/api/appdetails?appids=3720190,3708940,2901220,4465220,4465230,4794220,3550700,3786480,3540860,3303190,3550680,3550690,3731480,3453350,3724330,3985700,4094000,4232610,4580980,4968150,5169680,2305660,2375000,2375130,2375140,2401500,2401501,1889780,1894500,5366160,5373000,4404070,4664870,4348800,4651570,3453810,4348790,5090170,4376930,3979520,3979530,3311900,3259120,2632050,4127920,4127930,919770,924150,1482631,2125730,1873910,4391920,4395490,4424260,4460980&cc=br&filters=price_overview)
  - Loftia: $29.99 list (launch offer $24.89 / R$73,86), Supporter Pack $19.99 / R$59,99, and the In-App Purchases flag; its Early Access notes say "We may consider increasing the price as we get closer to our 1.0 Release" — [store page](https://store.steampowered.com/app/2320980/?l=english&cc=us), [BRL DLC batch](https://store.steampowered.com/api/appdetails?appids=3720190,3708940,2901220,4465220,4465230,4794220,3550700,3786480,3540860,3303190,3550680,3550690,3731480,3453350,3724330,3985700,4094000,4232610,4580980,4968150,5169680,2305660,2375000,2375130,2375140,2401500,2401501,1889780,1894500,5366160,5373000,4404070,4664870,4348800,4651570,3453810,4348790,5090170,4376930,3979520,3979530,3311900,3259120,2632050,4127920,4127930,919770,924150,1482631,2125730,1873910,4391920,4395490,4424260,4460980&cc=br&filters=price_overview)
- Premium comparison points without in-app purchases: Farm Together 2 sells eight packs at $2.99–$4.99 (R$10,49–R$19,49) on a $25.99 / R$77,13 game; Farm Together sells 16 packs at $3.99 (R$13,79); Farming Simulator 25 sells 15 add-ons from free to $39.99 (Year 2 Season Pass $34.99 / R$163,95; Beans & Alpacas Expansion $29.99 / R$131,95) — store pages [2418520](https://store.steampowered.com/app/2418520/?l=english&cc=us), [673950](https://store.steampowered.com/app/673950/?l=english&cc=us), [2300320](https://store.steampowered.com/app/2300320/?l=english&cc=us), [BRL DLC batch](https://store.steampowered.com/api/appdetails?appids=3720190,3708940,2901220,4465220,4465230,4794220,3550700,3786480,3540860,3303190,3550680,3550690,3731480,3453350,3724330,3985700,4094000,4232610,4580980,4968150,5169680,2305660,2375000,2375130,2375140,2401500,2401501,1889780,1894500,5366160,5373000,4404070,4664870,4348800,4651570,3453810,4348790,5090170,4376930,3979520,3979530,3311900,3259120,2632050,4127920,4127930,919770,924150,1482631,2125730,1873910,4391920,4395490,4424260,4460980&cc=br&filters=price_overview)

### Inferences
- There is no free-to-play, farming-first, 3D co-op game of any size on Steam today. The free games that sell are life sims or dress-up games with farming as a side activity (Palia, Heartopia, Infinity Nikki, Play Together), a creature collector (My Singing Monsters) and idle games.
- The two large free games that list nothing for sale on Steam and sell only in-game (Heartopia 66.2%, Infinity Nikki 57.9%) are the worst-rated large titles in this set, against 86.0% for Palia, which lists fixed-price packs. This is consistent with the earlier notes' reading that gacha-style monetization is punished in reviews, but these numbers alone do not establish the cause.
- Palia's regional pricing for Brazil is uneven: the $4.99 Starter Pack is R$20,00 (about R$4.0 per dollar) while the $59.99 Royal Highlands pack is R$162,00 (about R$2.7 per dollar). A R$20 entry pack and a R$100–R$160 supporter tier are the live reference points for a Brazilian audience.
- Palia's last-30-days score (76.4%) is ten points below its lifetime score, the largest negative gap among the eight focus games; the cause cannot be read from statistics alone.

### Gaps
- Prices of in-game purchases (premium currency, gacha pulls, battle passes) for Palia, Heartopia, Infinity Nikki and Play Together are not on Steam store pages; only the Steam-listed packs above are visible.
- Whether any of these games runs a battle pass cannot be confirmed from the store pages.
- No CCU for Heartopia or Infinity Nikki (SteamSpy placeholder zeros).
- The Life Sim tag was only checked through its free top-sellers list (16 products), not paged in full.

## 4. Review sentiment for the eight focus games

### Takeaway
Review text was unreachable in this session, so no quotes and no themes from player wording can be reported. The statistics that could be read show one clear pattern relevant to a Brazilian studio: Brazilian-Portuguese reviewers rate almost every farming game higher than the global average (Heartopia 74.8% against 66.2%, Coral Island 95.2% against 89.0%), and Brazil supplies 9.3% of Stardew Valley's Steam-purchaser reviews and 12.1% of Heartopia's.

### Cited Findings
- The reviews endpoint named in the brief did not serve data: all 36 requests to `https://store.steampowered.com/appreviews/<appid>?json=1…` returned HTTP 302 to the store home page, with curl, with the store's cookies, and from headless Chromium (page navigation and same-origin fetch). Example URL: [appreviews 413150](https://store.steampowered.com/appreviews/413150?json=1&language=all&purchase_type=all&num_per_page=0)
- Review statistics by language and period, from the review block embedded in each store page. "Last 30 days" is all languages. Per-language rows count Steam-purchaser reviews, so they add up to less than the all-purchase total in the second column.

| Game | All languages, all purchase types | Last 30 days | English | Brazilian Portuguese | Simplified Chinese | Other large languages |
|---|---|---|---|---|---|---|
| Stardew Valley ([413150](https://store.steampowered.com/app/413150/?l=english&cc=us)) | 1,050,832 (98.5%) | 5,969 (98.4%) | 397,094 (98.9%) | 84,348 (98.9%); 9.3% of Steam-purchaser reviews | 201,778 (97.8%) | russian 44,124 (97.7%); spanish 42,352 (99.2%); koreana 32,493 (98.1%) |
| Farming Simulator 25 ([2300320](https://store.steampowered.com/app/2300320/?l=english&cc=us)) | 61,313 (87.6%) | 1,169 (91.7%) | 16,439 (86.1%) | 1,697 (91.4%); 4.1% of Steam-purchaser reviews | 377 (74.8%) | german 6,478 (86.4%); polish 4,156 (91.6%); russian 2,498 (86.0%) |
| Farm Together 2 ([2418520](https://store.steampowered.com/app/2418520/?l=english&cc=us)) | 5,547 (93.8%) | 34 (88.2%) | 2,038 (94.0%) | 224 (99.1%); 4.9% of Steam-purchaser reviews | 521 (83.5%) | german 411 (95.1%); russian 281 (94.7%); french 230 (93.5%) |
| Palia ([2707930](https://store.steampowered.com/app/2707930/?l=english&cc=us)) | 45,135 (86.0%) | 360 (76.4%) | 27,734 (88.2%) | 2,693 (88.9%); 6.0% of Steam-purchaser reviews | 2,558 (66.9%) | german 2,513 (89.6%); french 1,996 (88.5%); russian 1,846 (71.0%) |
| Heartopia ([4025700](https://store.steampowered.com/app/4025700/?l=english&cc=us)) | 16,461 (66.2%) | 319 (69.0%) | 8,234 (59.9%) | 1,998 (74.8%); 12.1% of Steam-purchaser reviews | not broken out | spanish 1,122 (77.5%); koreana 980 (75.9%); french 927 (75.4%) |
| Coral Island ([1158160](https://store.steampowered.com/app/1158160/?l=english&cc=us)) | 27,959 (89.0%) | 135 (87.4%) | 14,340 (89.9%) | 1,356 (95.2%); 6.1% of Steam-purchaser reviews | 1,139 (65.5%) | thai 1,450 (95.2%); german 1,009 (93.6%); koreana 647 (82.2%) |
| Fields of Mistria ([2142790](https://store.steampowered.com/app/2142790/?l=english&cc=us)) | 37,015 (97.0%) | 787 (95.0%) | 26,319 (97.3%) | 1,485 (96.4%); 4.4% of Steam-purchaser reviews | 1,198 (89.1%) | spanish 1,088 (97.8%); german 724 (96.8%); koreana 598 (94.8%) |
| Dinkum ([1062520](https://store.steampowered.com/app/1062520/?l=english&cc=us)) | 29,279 (91.8%) | 71 (90.1%) | 15,876 (93.6%) | 486 (94.0%); 2.0% of Steam-purchaser reviews | 3,278 (86.0%) | german 1,146 (94.1%); koreana 881 (91.8%); french 595 (96.5%) |

- Brazilian-Portuguese reviews compared with all languages (both among Steam purchasers), wider set of games:

| Game | BR-PT reviews | BR-PT % positive | All languages, Steam purchasers: reviews (% positive) | BR-PT share of Steam-purchaser reviews |
|---|---|---|---|---|
| Stardew Valley ([413150](https://store.steampowered.com/app/413150/?l=english&cc=us)) | 84,348 | 98.9% | 904,507 (98.5%) | 9.3% |
| Slime Rancher ([433340](https://store.steampowered.com/app/433340/?l=english&cc=us)) | 7,067 | 98.6% | 140,923 (98.0%) | 5.0% |
| Farming Simulator 19 ([787860](https://store.steampowered.com/app/787860/?l=english&cc=us)) | 3,887 | 97.2% | 64,781 (94.5%) | 6.0% |
| Graveyard Keeper ([599140](https://store.steampowered.com/app/599140/?l=english&cc=us)) | 3,780 | 95.0% | 40,341 (86.2%) | 9.4% |
| Farming Simulator 22 ([1248130](https://store.steampowered.com/app/1248130/?l=english&cc=us)) | 3,072 | 96.3% | 69,985 (93.1%) | 4.4% |
| Ranch Simulator: Build, Hunt, Farm ([1119730](https://store.steampowered.com/app/1119730/?l=english&cc=us)) | 2,697 | 81.6% | 41,416 (79.1%) | 6.5% |
| Palia ([2707930](https://store.steampowered.com/app/2707930/?l=english&cc=us)) | 2,693 | 88.9% | 45,135 (86.0%) | 6.0% |
| Heartopia ([4025700](https://store.steampowered.com/app/4025700/?l=english&cc=us)) | 1,998 | 74.8% | 16,461 (66.2%) | 12.1% |
| Core Keeper ([1621690](https://store.steampowered.com/app/1621690/?l=english&cc=us)) | 1,862 | 97.9% | 51,229 (92.9%) | 3.6% |
| Farming Simulator 25 ([2300320](https://store.steampowered.com/app/2300320/?l=english&cc=us)) | 1,697 | 91.4% | 41,825 (87.9%) | 4.1% |
| Slime Rancher 2 ([1657630](https://store.steampowered.com/app/1657630/?l=english&cc=us)) | 1,501 | 97.3% | 44,313 (94.5%) | 3.4% |
| Fields of Mistria ([2142790](https://store.steampowered.com/app/2142790/?l=english&cc=us)) | 1,485 | 96.4% | 33,730 (96.9%) | 4.4% |
| Coral Island ([1158160](https://store.steampowered.com/app/1158160/?l=english&cc=us)) | 1,356 | 95.2% | 22,079 (89.2%) | 6.1% |
| Sun Haven ([1432860](https://store.steampowered.com/app/1432860/?l=english&cc=us)) | 1,066 | 90.6% | 22,268 (79.9%) | 4.8% |
| Farm Together ([673950](https://store.steampowered.com/app/673950/?l=english&cc=us)) | 961 | 96.6% | 17,658 (94.0%) | 5.4% |
| My Time at Portia ([666140](https://store.steampowered.com/app/666140/?l=english&cc=us)) | 849 | 94.1% | 34,905 (91.5%) | 2.4% |
| Infinity Nikki ([3164330](https://store.steampowered.com/app/3164330/?l=english&cc=us)) | 524 | 76.9% | 10,718 (57.9%) | 4.9% |
| My Time at Sandrock ([1084600](https://store.steampowered.com/app/1084600/?l=english&cc=us)) | 507 | 96.8% | 24,278 (88.1%) | 2.1% |
| Dinkum ([1062520](https://store.steampowered.com/app/1062520/?l=english&cc=us)) | 486 | 94.0% | 24,753 (92.4%) | 2.0% |
| Graveyard Keeper 2 ([4358690](https://store.steampowered.com/app/4358690/?l=english&cc=us)) | 447 | 91.9% | 10,547 (75.6%) | 4.2% |
| Disney Dreamlight Valley ([1401590](https://store.steampowered.com/app/1401590/?l=english&cc=us)) | 299 | 95.3% | 22,421 (92.0%) | 1.3% |
| Farm Together 2 ([2418520](https://store.steampowered.com/app/2418520/?l=english&cc=us)) | 224 | 99.1% | 4,535 (93.4%) | 4.9% |

- For free games the store's "Steam purchasers / other" split is not meaningful: Palia reports 45,135 under one and 45,074 under the other, Heartopia 16,461 under both — store pages [2707930](https://store.steampowered.com/app/2707930/?l=english&cc=us), [4025700](https://store.steampowered.com/app/4025700/?l=english&cc=us)
- Simplified-Chinese reviewers are markedly harsher than the average on Palia (66.9% against 86.0%), Coral Island (65.5% against 89.0%), Farming Simulator 25 (74.8% against 87.6%) and Farm Together 2 (83.5% against 93.8%); Russian reviewers are harsher on Palia (71.0%) — same store pages as the table
- Paid add-ons are rated far below their base games (listing counts): Farming Simulator 25 Year 1 Season Pass 57% of 88; Highlands Fishing Expansion 57% of 319; NEXAT Pack 53% of 167; Plains & Prairies Pack 59% of 86; Farming Simulator 22 Year 1 Season Pass 33% of 301 ("Mostly Negative"); Ranch Simulator: Southwest Ranch & Farm Expansion Pack 47% of 327; Disney Dreamlight Valley: The Storybook Vale 72% of 190; Palia Royal Highlands Supporter Pack 58% of 12 — [Farming Sim listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&sort_by=Reviews_DESC), [Brazil top sellers](https://store.steampowered.com/search/results/?query&infinite=1&cc=br&l=english&start=0&count=50&tags=87918&filter=topsellers)
- Recent-period movement against lifetime score: Farming Simulator 25 is improving (91.7% last 30 days against 87.6% lifetime); Palia is declining (76.4% against 86.0%); Farm Together 2 (88.2% of 34) and Dinkum (90.1% of 71) rest on very small recent samples; Starsand Island is at 51.2% of 41 recent reviews against 75.1% lifetime — store pages [2300320](https://store.steampowered.com/app/2300320/?l=english&cc=us), [2707930](https://store.steampowered.com/app/2707930/?l=english&cc=us), [2418520](https://store.steampowered.com/app/2418520/?l=english&cc=us), [1062520](https://store.steampowered.com/app/1062520/?l=english&cc=us), [2966320](https://store.steampowered.com/app/2966320/?l=english&cc=us)

### Inferences
- Brazilian players are a disproportionately large and generous reviewing audience for this genre. Among the eight focus games their share of reviews is highest on the free game (Heartopia, 12.1%) and on the cheapest game (Stardew Valley, R$24,99, 9.3%), which fits a price-sensitive market and supports a free-to-play entry point.
- Heartopia's English score (59.9%) is fifteen points below its Brazilian score (74.8%). Whatever drives the "Mixed" label bothers English-language reviewers more; the earlier notes attribute it to gacha monetization and undisclosed AI, and the page's AI disclosure and "Artificial Intelligence" user tag are consistent with that, but the reviews themselves could not be read.
- Low scores on season passes and map or vehicle packs suggest that players in this genre resent paid content sold on top of a paid game more than they resent the base price. This is a statistical reading; the stated reasons are unknown.
- The questions about multiplayer quality, grind, timers, content depth, performance and unmet wishes cannot be answered from numbers. The earlier notes' themes on these points remain background knowledge.

### Gaps
- No review excerpts in English or Brazilian Portuguese for any of the eight games; the endpoint did not respond with data.
- Recurring praise and complaints about co-op quality, monetization, grind and timers, content depth and performance: not obtained.
- "What players say they want that the genre does not give them": not obtained from primary text.
- A later attempt from a session where `/appreviews/` responds, or with access to `steamcommunity.com`, is needed to close this; the URL pattern is `https://store.steampowered.com/appreviews/<appid>?json=1&language=brazilian&filter=all&day_range=365&review_type=negative&num_per_page=20`.

## 5. Releases 2024–2026 under the Farming Sim tag

### Takeaway
Of Farming Sim-tagged base games with a review score and a 2024–2026 Steam release date, 64 show at least 1,000 reviews in the listing (16 of 162 from 2024, 30 of 227 from 2025, 18 of 232 from 2026 so far). The well-publicised disappointments are The Ranchers (58.0% of 683), Harvest Moon: Echoes of Teradea (66.7% of 84), Starsand Island (75.1%, with 51.2% in the last 30 days), Graveyard Keeper 2 (75.8% against 85.2% for the original) and the free Heartopia and Infinity Nikki at Mixed.

### Cited Findings
- Counts by Steam-displayed release year (base games only; demos, DLC and soundtracks removed by name; "listing reviews" are English-only for large games):
  - 2024: 162 Farming Sim-tagged base games with a review score; 16 (9.9%) at >=1,000 listing reviews; 30 (18.5%) at >=500; 63 (38.9%) below 70% positive
  - 2025: 227 Farming Sim-tagged base games with a review score; 30 (13.2%) at >=1,000 listing reviews; 46 (20.3%) at >=500; 58 (25.6%) below 70% positive
  - 2026: 232 Farming Sim-tagged base games with a review score; 18 (7.8%) at >=1,000 listing reviews; 33 (14.2%) at >=500; 45 (19.4%) below 70% positive
  — [Farming Sim listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&sort_by=Reviews_DESC)
- Across all years, 142 of 1,054 Farming Sim-tagged base games with a review score show 1,000 or more listing reviews — [Farming Sim listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&sort_by=Reviews_DESC)
- Sorted by release date, the tag holds 2,593 products in all. The newest 100 were all released between Oct 28 and Nov 11, 2026; 77 of them have no review score yet and 6 have 100 or more reviews — [newest-first listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&sort_by=Released_DESC)
- **Steam shows the 1.0 date as "release date" for Early Access graduates**, so this list includes games that first appeared earlier: Fields of Mistria (Early Access Aug 5, 2024), Dinkum (Jul 14, 2022), Lightyear Frontier (Mar 19, 2024), Farm Together 2 (May 7, 2024), Starsand Island (Feb 11, 2026) — store pages linked in the table

Titles with a 2024–2026 release date and at least 1,000 listing reviews (the listing price can be a discounted or bundle price, as for Starsand Island and Tiny Pasture; base prices are in the appdetails batches):

| Game (app id) | Steam release date | Listing count (% pos) | All-language total (% pos) where the store page was fetched | Price in listing |
|---|---|---|---|---|
| Palia ([2707930](https://store.steampowered.com/app/2707930/?l=english&cc=us)) | Mar 25, 2024 | 27,733 (88%) | 45,135 (86.0%) | Free |
| Fields of Mistria ([2142790](https://store.steampowered.com/app/2142790/?l=english&cc=us)) | Aug 5, 2026 | 26,319 (97%) | 37,015 (97.0%) | $13.99 |
| Timberborn ([1062090](https://store.steampowered.com/app/1062090/?l=english&cc=us)) | Mar 12, 2026 | 24,599 (96%) | 42,814 (95.8%) | $34.99 |
| Farming Simulator 25 ([2300320](https://store.steampowered.com/app/2300320/?l=english&cc=us)) | Nov 12, 2024 | 16,438 (86%) | 61,313 (87.6%) | $29.99 |
| Dinkum ([1062520](https://store.steampowered.com/app/1062520/?l=english&cc=us)) | Apr 22, 2025 | 15,876 (93%) | 29,279 (91.8%) | $19.99 |
| Tiny Pasture ([3167550](https://store.steampowered.com/app/3167550/?l=english&cc=us)) | Feb 17, 2025 | 7,128 (92%) | 8,722 (92.4%) | $4.05 |
| Rusty's Retirement ([2666510](https://store.steampowered.com/app/2666510/?l=english&cc=us)) | Apr 26, 2024 | 6,628 (97%) | 14,960 (96.7%) | $6.99 |
| Berry Bury Berry ([3370870](https://store.steampowered.com/app/3370870/?l=english&cc=us)) | Jan 29, 2026 | 6,612 (97%) | 9,413 (97.9%) | $7.99 |
| Infinity Nikki ([3164330](https://store.steampowered.com/app/3164330/?l=english&cc=us)) | Apr 28, 2025 | 5,557 (57%) | 10,718 (57.9%) | Free |
| Little Witch in the Woods ([1594940](https://store.steampowered.com/app/1594940/?l=english&cc=us)) | Sep 14, 2025 | 4,851 (90%) | 13,418 (89.1%) | $19.99 |
| The Farmer Was Replaced ([2060160](https://store.steampowered.com/app/2060160/?l=english&cc=us)) | Oct 10, 2025 | 4,553 (95%) | 10,234 (95.6%) | $6.99 |
| Graveyard Keeper 2 ([4358690](https://store.steampowered.com/app/4358690/?l=english&cc=us)) | Sep 22, 2026 | 4,396 (77%) | 11,561 (75.8%) | $24.99 |
| The Wandering Village ([1121640](https://store.steampowered.com/app/1121640/?l=english&cc=us)) | Jul 17, 2025 | 4,078 (92%) | 8,591 (92.0%) | $29.99 |
| Luma Island ([2408820](https://store.steampowered.com/app/2408820/?l=english&cc=us)) | Nov 20, 2024 | 3,776 (90%) | 12,887 (84.2%) | $19.99 |
| MineMogul ([3846120](https://store.steampowered.com/app/3846120/?l=english&cc=us)) | Dec 4, 2025 | 3,344 (96%) | 4,633 (96.3%) | $14.99 |
| Nivalis Nights ([1488490](https://store.steampowered.com/app/1488490/?l=english&cc=us)) | Sep 29, 2026 | 3,167 (79%) | 4,988 (76.6%) | $24.99 |
| Starsand Island ([2966320](https://store.steampowered.com/app/2966320/?l=english&cc=us)) | Aug 18, 2026 | 2,816 (81%) | 6,959 (75.1%) | $32.78 |
| Grimshire ([2238470](https://store.steampowered.com/app/2238470/?l=english&cc=us)) | Jul 22, 2025 | 2,804 (97%) | 3,577 (97.6%) | $14.99 |
| Teddy's Haven ([3615160](https://store.steampowered.com/app/3615160/?l=english&cc=us)) | May 6, 2025 | 2,757 (95%) | 3,152 (96.0%) | $14.99 |
| Lightyear Frontier ([1677110](https://store.steampowered.com/app/1677110/?l=english&cc=us)) | Nov 4, 2026 | 2,675 (81%) | 5,061 (83.1%) | $23.99 |
| Tiny Aquarium: Social Fishkeeping (2581950) | Jun 23, 2025 | 2,537 (96%) | not fetched | $7.49 |
| Tales of the Shire: A The Lord of The Rings Game ([2016460](https://store.steampowered.com/app/2016460/?l=english&cc=us)) | Jul 29, 2025 | 2,528 (81%) | 3,854 (81.5%) | $34.99 |
| Cozy Island (2918500) | Sep 21, 2025 | 2,501 (92%) | not fetched | $8.99 |
| Ropuka's Idle Island (3416070) | Jan 29, 2025 | 2,408 (95%) | not fetched | $3.99 |
| Wanderstop (1299460) | Mar 11, 2025 | 2,406 (92%) | not fetched | $24.99 |
| I Am Future: Cozy Apocalypse Survival (1658040) | Nov 13, 2024 | 2,094 (83%) | not fetched | $7.99 |
| Flotsam (821250) | Dec 4, 2025 | 2,060 (84%) | not fetched | $24.99 |
| Farm Together 2 ([2418520](https://store.steampowered.com/app/2418520/?l=english&cc=us)) | May 30, 2025 | 2,038 (94%) | 5,547 (93.8%) | $25.99 |
| Solarpunk ([1805110](https://store.steampowered.com/app/1805110/?l=english&cc=us)) | Jun 8, 2026 | 2,019 (81%) | 4,908 (80.9%) | $22.99 |
| Echoes of the Plum Grove (1536090) | Apr 29, 2024 | 1,958 (89%) | not fetched | $19.99 |
| Moonlight Peaks ([2209900](https://store.steampowered.com/app/2209900/?l=english&cc=us)) | Jul 6, 2026 | 1,944 (88%) | 2,349 (88.8%) | $34.99 |
| Welcome to Elderfield (3195440) | Sep 10, 2026 | 1,849 (90%) | not fetched | $17.99 |
| Cat God Ranch (2797340) | Sep 12, 2024 | 1,839 (92%) | not fetched | $9.99 |
| Gnomes (3133060) | Apr 4, 2025 | 1,800 (94%) | not fetched | $2.99 |
| Play Together ([3198850](https://store.steampowered.com/app/3198850/?l=english&cc=us)) | Jan 13, 2025 | 1,795 (74%) | 1,795 (74.3%) | Free |
| Critter Cove (1631470) | Sep 10, 2024 | 1,751 (94%) | not fetched | $24.99 |
| PUMPKIN PANIC (3177920) | Oct 30, 2024 | 1,737 (95%) | not fetched | Free |
| Drug Lord Tycoon (2450700) | Jul 31, 2024 | 1,675 (83%) | not fetched | $9.99 |
| Forage Wizard (3868320) | May 5, 2026 | 1,672 (86%) | not fetched | $6.99 |
| The Ranch of Rivershine (1559600) | May 23, 2025 | 1,663 (93%) | not fetched | $19.49 |
| Farlands (2252680) | Jul 16, 2026 | 1,646 (89%) | not fetched | $17.99 |
| Return from Core (2171630) | Jul 17, 2025 | 1,634 (74%) | not fetched | $16.99 |
| Dog Brew (2883280) | Apr 30, 2024 | 1,533 (96%) | not fetched | $0.73 |
| Tales of Seikyu ([2340520](https://store.steampowered.com/app/2340520/?l=english&cc=us)) | Jun 11, 2026 | 1,513 (84%) | 2,710 (84.1%) | $24.99 |
| Havendock (2020710) | Apr 22, 2025 | 1,513 (81%) | not fetched | $10.73 |
| Rune Factory: Guardians of Azuma ([2864560](https://store.steampowered.com/app/2864560/?l=english&cc=us)) | Jun 4, 2025 | 1,464 (91%) | 3,765 (88.4%) | $59.99 |
| Horses of Hoofprint Bay (3727090) | Nov 4, 2026 | 1,386 (98%) | not fetched | $22.94 |
| Grunn (2720950) | Oct 4, 2024 | 1,385 (95%) | not fetched | $12.99 |
| STORY OF SEASONS: Grand Bazaar ([2508780](https://store.steampowered.com/app/2508780/?l=english&cc=us)) | Aug 27, 2025 | 1,363 (95%) | 4,169 (93.6%) | $49.99 |
| Mirthwood ([2272900](https://store.steampowered.com/app/2272900/?l=english&cc=us)) | Nov 6, 2024 | 1,322 (73%) | 2,395 (70.3%) | $17.49 |
| Song Of The Prairie (1350840) | Jul 31, 2024 | 1,299 (76%) | not fetched | $9.99 |
| Finn Dorset's Institute For Livestock Replication (3135530) | Oct 2, 2024 | 1,296 (84%) | not fetched | Free |
| Boba Cafe Simulator (3683770) | Jul 24, 2026 | 1,275 (91%) | not fetched | $15.99 |
| Farmer's Dynasty 2 ([2569670](https://store.steampowered.com/app/2569670/?l=english&cc=us)) | Apr 2, 2026 | 1,274 (72%) | 1,382 (72.9%) | $19.48 |
| Bandle Tale: A League of Legends Story (1759380) | Feb 21, 2024 | 1,253 (77%) | not fetched | $24.99 |
| Your Big, Cute Monster Farm (3659410) | Nov 10, 2025 | 1,220 (77%) | not fetched | $6.32 |
| Virtual City Playground: Build Your Metropolis (3760180) | Jan 12, 2026 | 1,213 (86%) | not fetched | Free |
| To Pixelia (1954160) | May 1, 2025 | 1,211 (74%) | not fetched | $14.99 |
| Cowboy Life Simulator (1151380) | Nov 26, 2025 | 1,158 (88%) | not fetched | $12.34 |
| Card Survival: Fantasy Forest (2868860) | Feb 28, 2025 | 1,158 (76%) | not fetched | $21.99 |
| Halcyon Days at Taoyuan (2678830) | Jan 19, 2026 | 1,135 (89%) | not fetched | $10.79 |
| My Little Life (2834600) | Jan 31, 2025 | 1,058 (89%) | not fetched | $3.89 |
| Mudborne: Frog Management Sim (2355150) | Mar 20, 2025 | 1,018 (96%) | not fetched | $7.99 |
| Tiny Terraces (3136330) | Jul 31, 2025 | 1,005 (92%) | not fetched | $6.99 |

- Outside the tag but relevant: Core Keeper 1.0 (Aug 27, 2024) 68,564 at 92.9%; Slime Rancher 2 1.0 (Sep 23, 2025) 50,956 at 94.5%; Heartopia (Jan 16, 2026) 16,461 at 66.2%; Hello Kitty Island Adventure (Jan 30, 2025) 12,933 at 94.0%; Farmer Against Potatoes Idle (Sep 5, 2024, Agriculture tag) 8,261 at 94.6%; Horsey Game (Feb 18, 2026, Agriculture tag) 3,213 at 97.2% — store pages [1621690](https://store.steampowered.com/app/1621690/?l=english&cc=us), [1657630](https://store.steampowered.com/app/1657630/?l=english&cc=us), [4025700](https://store.steampowered.com/app/4025700/?l=english&cc=us), [2495100](https://store.steampowered.com/app/2495100/?l=english&cc=us), [1535560](https://store.steampowered.com/app/1535560/?l=english&cc=us), [3602570](https://store.steampowered.com/app/3602570/?l=english&cc=us)

Well-publicised or well-resourced titles that stayed small or sit at Mixed or below (all-language totals from store pages unless marked "listing"):
- **The Ranchers** — Early Access Jul 30, 2026, $24.99 / R$79,99, 1–4 player open-world country-life sim: 683 reviews, 58.0% (Mixed) — [store page](https://store.steampowered.com/app/1501310/?l=english&cc=us)
- **Harvest Moon: Echoes of Teradea** — Oct 14, 2026, $49.99 / R$154,99: 84 reviews, 66.7% (Mixed) — [store page](https://store.steampowered.com/app/3591180/?l=english&cc=us)
- **Starsand Island** — 1.0 Aug 18, 2026, $39.99 / R$107,99: 6,959 reviews, 75.1%; last 30 days 51.2% of 41; English-only 81.2% of 2,816 — [store page](https://store.steampowered.com/app/2966320/?l=english&cc=us)
- **Graveyard Keeper 2** — Sep 22, 2026, $24.99 / R$74,99: 11,561 reviews in seven weeks but 75.8% (Mostly Positive); last 30 days 76.9% of 1,770; #13 in US Farming Sim top sellers and #7 in Brazil — [store page](https://store.steampowered.com/app/4358690/?l=english&cc=us)
- **Tales of the Shire** — Jul 29, 2025, $34.99 / R$99,99: 3,854 reviews, 81.5%; last 30 days 53.3% of 15 — [store page](https://store.steampowered.com/app/2016460/?l=english&cc=us)
- **Mirthwood** — Nov 6, 2024, list $24.99: 2,395 reviews, 70.3%; last 30 days 50.0% of 10 — [store page](https://store.steampowered.com/app/2272900/?l=english&cc=us)
- **Farmer's Dynasty 2** — Apr 2, 2026, $24.99 / R$119,00: 1,382 reviews, 72.9% — [store page](https://store.steampowered.com/app/2569670/?l=english&cc=us)
- **SunnySide** — Jun 14, 2024, $19.99: 1,173 reviews, 66.7% (Mixed) — [store page](https://store.steampowered.com/app/1746930/?l=english&cc=us)
- **One Lonely Outpost** — Mar 6, 2025, $19.99: 666 reviews, 57.4% (Mixed) — [store page](https://store.steampowered.com/app/1465550/?l=english&cc=us)
- **Sugardew Island** — Mar 7, 2025, $16.99 / R$52,49: 381 reviews, 73.0% — [store page](https://store.steampowered.com/app/2711030/?l=english&cc=us)
- **Infinity Nikki** (free, Apr 28, 2025): 10,718 reviews, 57.9% (Mixed) — [store page](https://store.steampowered.com/app/3164330/?l=english&cc=us)
- **Play Together** (free, Jan 13, 2025): 1,795 reviews, 74.3%; last 30 days 63.2% of 38 — [store page](https://store.steampowered.com/app/3198850/?l=english&cc=us)
- Listing-only figures: Lawn Mowing Simulator 2 (Sep 23, 2026, $29.99) 46% of 200; Farm Manager World (Apr 21, 2025) 68% of 612; The Witch of Fern Island (Feb 27, 2024) 69% of 704; Wild Indigo Ranch (Sep 18, 2024) 68% of 424; Orange Season (Oct 24, 2024) 59% of 364; Global Farmer (Aug 14, 2025) 45% of 134; Everdream Village (Dec 12, 2025) 69% of 107 — [Farming Sim listing](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&sort_by=Reviews_DESC)
- Well rated but small: **Farm Together 2** (1.0 May 30, 2025) 5,547 reviews at 93.8%, SteamSpy owners estimate 50,000–100,000, peak yesterday 1,080, #58 in US Farming Sim top sellers — [store page](https://store.steampowered.com/app/2418520/?l=english&cc=us), [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2418520), [US top sellers](https://store.steampowered.com/search/results/?query&infinite=1&cc=us&l=english&start=0&count=100&tags=87918&filter=topsellers)
- Just launched, too early to judge: **Loftia** (Early Access Nov 3, 2026) is #1 in US Farming Sim top sellers with 1,266 reviews at 88.5%; **Lightyear Frontier** 1.0 (Nov 4, 2026) is #2 with 5,061 lifetime reviews at 83.1% and 76.0% of 250 in the last 30 days — store pages [2320980](https://store.steampowered.com/app/2320980/?l=english&cc=us), [1677110](https://store.steampowered.com/app/1677110/?l=english&cc=us)
- Premium-priced Japanese series entries are well rated but modest in volume: STORY OF SEASONS: Grand Bazaar ($49.99 / R$199,99) 4,169 at 93.6%; Rune Factory: Guardians of Azuma ($59.99 / R$239,99) 3,765 at 88.4% — store pages [2508780](https://store.steampowered.com/app/2508780/?l=english&cc=us), [2864560](https://store.steampowered.com/app/2864560/?l=english&cc=us)
- Prices in the list above are from [USD batch 1](https://store.steampowered.com/api/appdetails?appids=413150,2300320,1248130,787860,2707930,4025700,2142790,1158160,1062520,1432860,1084600,666140,1119730,433340,1657630,1401590,1621690,673950,2418520,599140,4358690,1868140,1129580,1044720,1419170,3164330,2966320,2016460,2408820,1677110,2320980,3198850,1139980,972660,1062090,751780,1210320,1468260,447020,313160,2666510,3370870,2060160,1594940,3167550,382310,544550,894940,1488490&cc=us&filters=price_overview), [BRL batch 1](https://store.steampowered.com/api/appdetails?appids=413150,2300320,1248130,787860,2707930,4025700,2142790,1158160,1062520,1432860,1084600,666140,1119730,433340,1657630,1401590,1621690,673950,2418520,599140,4358690,1868140,1129580,1044720,1419170,3164330,2966320,2016460,2408820,1677110,2320980,3198850,1139980,972660,1062090,751780,1210320,1468260,447020,313160,2666510,3370870,2060160,1594940,3167550,382310,544550,894940,1488490&cc=br&filters=price_overview), [USD batch 2](https://store.steampowered.com/api/appdetails?appids=1501310,2495100,2711030,3591180,2209900,2508780,2864560,2272900,1805110,2340520,1465550,1746930,2569670,1121640,3602570&cc=us&filters=price_overview) and [BRL batch 2](https://store.steampowered.com/api/appdetails?appids=1501310,2495100,2711030,3591180,2209900,2508780,2864560,2272900,1805110,2340520,1465550,1746930,2569670,1121640,3602570&cc=br&filters=price_overview)
- A store search for "Pixelshire" returned zero results — [search](https://store.steampowered.com/search/results/?term=Pixelshire&infinite=1&cc=us&l=english&start=0&count=10)

### Inferences
- Roughly one in ten Farming Sim games that gather enough reviews to get a score reaches 1,000 reviews (9.9% for 2024, 13.2% for 2025, 7.8% for 2026 so far). Because games with fewer than about ten reviews are missing from the denominator, the true share of all releases is lower, which is in line with the 8% third-party figure in the earlier notes.
- A cluster of very cheap, small-scope titles did well in 2024–2026: Rusty's Retirement ($6.99, 14,960 reviews), The Farmer Was Replaced ($9.99 list, 10,234), Berry Bury Berry ($7.99, 9,413), Tiny Pasture ($5.99 list, 8,722). None is a 3D co-op farm.
- The two newest 3D co-op farm-life launches closest to the client's concept point in opposite directions: The Ranchers (host-based 1–4 co-op, Mixed) and Loftia (shared-world cozy MMO, top seller in its first week). Loftia is the title to watch over the coming months.
- A big licence or brand does not protect a farm-life game on Steam: Tales of the Shire, Harvest Moon and Graveyard Keeper 2 all sit below the genre's usual 85%–95% band.

### Gaps
- Release-year counts rely on Steam's displayed date and on listing review counts; products with too few reviews for a score are not counted, and "well-publicised" is the researcher's judgment, since press coverage could not be consulted.
- Pixelshire could not be found; Rune Factory and Story of Seasons were checked only on Steam.
- Why each low-rated title is rated low cannot be established without review text.

## 6. Contradictions with the earlier notes, and a corrected top 10

### Takeaway
The earlier top-10 set survives, but its order changes when ranked on live review totals, three of its background-knowledge attributes are wrong on Steam (Farming Simulator 25's price, Coral Island's and My Time at Portia's publishers), and two review figures were English-only or stale (Fields of Mistria, Graveyard Keeper). The earlier claim that only Palia and Heartopia are sizeable free-to-play entries needs widening.

### Cited Findings
Each line gives the earlier note first, then the live value.
- **Ranking order.** Earlier: Stardew Valley, Farming Simulator 25, Farming Simulator 22, Slime Rancher, Palia, Fields of Mistria, Ranch Simulator, My Time at Portia, Dinkum, Coral Island. Live review totals order the same ten as: Stardew Valley 1,050,832; Slime Rancher 159,024; Farming Simulator 22 93,552; Farming Simulator 25 61,313; Ranch Simulator 49,246; Palia 45,135; My Time at Portia 44,390; Fields of Mistria 37,015; Dinkum 29,279; Coral Island 27,959 — store pages in the table below
- **Titles the earlier top 10 left out that outrank some of its members on reviews:** Farming Simulator 19 (76,548), Slime Rancher 2 (50,956) and My Time at Sandrock (29,292, thirteen reviews ahead of Dinkum). Larger but not farming-central: DAVE THE DIVER 165,120; Core Keeper 68,564; Graveyard Keeper 57,201; Medieval Dynasty 52,986 — store pages [787860](https://store.steampowered.com/app/787860/?l=english&cc=us), [1657630](https://store.steampowered.com/app/1657630/?l=english&cc=us), [1084600](https://store.steampowered.com/app/1084600/?l=english&cc=us), [1868140](https://store.steampowered.com/app/1868140/?l=english&cc=us), [1621690](https://store.steampowered.com/app/1621690/?l=english&cc=us), [599140](https://store.steampowered.com/app/599140/?l=english&cc=us), [1129580](https://store.steampowered.com/app/1129580/?l=english&cc=us)
- **Stardew Valley reviews.** Earlier: 1,018,545 at 98% (Jul 4, 2026). Live: 1,050,832 at 98.5% (904,507 from Steam purchasers; 397,094 English) — [store page](https://store.steampowered.com/app/413150/?l=english&cc=us)
- **Stardew Valley players.** Earlier: daily peak 123,002 (Jul 5, 2026) and 159,194 (Mar 2026). Live: peak today 71,940, in game 70,956 at 13:46 UTC — [Steam Charts page](https://store.steampowered.com/stats/Steam-Game-and-Player-Statistics?l=english)
- **Farming Simulator 25 reviews.** Earlier: count not retrieved, 84.1%–86%. Live: 61,313 at 87.6%; English 16,439 at 86.1%; last 30 days 91.7% of 1,169 — [store page](https://store.steampowered.com/app/2300320/?l=english&cc=us)
- **Farming Simulator 25 price.** Earlier (background knowledge): about $49.99. Live: **$29.99** with no discount flag, R$143,95 in Brazil; SteamSpy also lists 2999 cents as the original US price — [USD batch 1](https://store.steampowered.com/api/appdetails?appids=413150,2300320,1248130,787860,2707930,4025700,2142790,1158160,1062520,1432860,1084600,666140,1119730,433340,1657630,1401590,1621690,673950,2418520,599140,4358690,1868140,1129580,1044720,1419170,3164330,2966320,2016460,2408820,1677110,2320980,3198850,1139980,972660,1062090,751780,1210320,1468260,447020,313160,2666510,3370870,2060160,1594940,3167550,382310,544550,894940,1488490&cc=us&filters=price_overview), [BRL batch 1](https://store.steampowered.com/api/appdetails?appids=413150,2300320,1248130,787860,2707930,4025700,2142790,1158160,1062520,1432860,1084600,666140,1119730,433340,1657630,1401590,1621690,673950,2418520,599140,4358690,1868140,1129580,1044720,1419170,3164330,2966320,2016460,2408820,1677110,2320980,3198850,1139980,972660,1062090,751780,1210320,1468260,447020,313160,2666510,3370870,2060160,1594940,3167550,382310,544550,894940,1488490&cc=br&filters=price_overview), [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2300320)
- **Farming Simulator 22.** Earlier: 92,035 at 93%, released Nov 22, 2021, recent CCU 1,998–6,835. Live: 93,552 at 92.8%; Steam shows Nov 21, 2021; SteamSpy peak yesterday 8,069; price $19.99 / R$94,95 — [store page](https://store.steampowered.com/app/1248130/?l=english&cc=us), [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1248130)
- **Farming Simulator 19.** Earlier: 74,320 reviews, score 93. Live: 76,548 at 94.5% — [store page](https://store.steampowered.com/app/787860/?l=english&cc=us)
- **Farming Simulator cross-play.** Earlier (background knowledge): cross-play for 22 and 25, up to 16 players, rentable dedicated servers. Live: Farming Simulator 22 has the Cross-Platform Multiplayer flag, Farming Simulator 25 does not; neither page states a player cap or mentions servers — store pages [1248130](https://store.steampowered.com/app/1248130/?l=english&cc=us), [2300320](https://store.steampowered.com/app/2300320/?l=english&cc=us)
- **Slime Rancher.** Earlier: 156,861 at 98%, 1,330 in game (Sep 2026). Live: 159,024 at 98.0%; SteamSpy peak yesterday 856. Confirmed: Aug 1, 2017, $19.99, first-person, single-player only — [store page](https://store.steampowered.com/app/433340/?l=english&cc=us), [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=433340)
- **Palia.** Earlier: 44,137 at 86%, 7,343 concurrent (mid-2026). Live: 45,135 at 86.0%, last 30 days 76.4% of 360, SteamSpy peak yesterday 5,140. Developer and publisher are both listed as "Singularity 6 Corporation"; Steam release Mar 25, 2024 — [store page](https://store.steampowered.com/app/2707930/?l=english&cc=us), [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2707930)
- **Fields of Mistria.** Earlier: 26,111 reviews at 98%. Live: 37,015 at 97.0% in all languages; the earlier figure is close to today's English-only count (26,319 at 97.3%). Price $13.99 is unchanged at 1.0; single-player only confirmed — [store page](https://store.steampowered.com/app/2142790/?l=english&cc=us)
- **Ranch Simulator.** Earlier: 47,418 at 79%. Live: 49,246 at 79.1%. Confirmed: Toxic Dog / Excalibur Games, Early Access Mar 4, 2021, full release Nov 3, 2023, $24.99, co-op for up to four — [store page](https://store.steampowered.com/app/1119730/?l=english&cc=us)
- **My Time at Portia publisher.** Earlier (background knowledge): Pathea Games / Team17. Live: publishers listed are "Focus Entertainment, Pathea Games". Reviews 44,390 at 91.5% (earlier 44,222 at 92%) — [store page](https://store.steampowered.com/app/666140/?l=english&cc=us)
- **Coral Island publisher.** Earlier (background knowledge): Stairway Games / Humble Games. Live: publisher listed is "Balor Games" (also now the listed publisher of Forager). Reviews 27,959 at 89.0% (earlier 25,548 at 89%) — store pages [1158160](https://store.steampowered.com/app/1158160/?l=english&cc=us), [751780](https://store.steampowered.com/app/751780/?l=english&cc=us)
- **Dinkum.** Earlier: 28,973 at 92%, 1,097 in game. Live: 29,279 at 91.8%; SteamSpy peak yesterday 897. Confirmed: James Bendon / KRAFTON, Early Access Jul 14, 2022, 1.0 Apr 22, 2025, $19.99 — [store page](https://store.steampowered.com/app/1062520/?l=english&cc=us), [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=1062520)
- **Graveyard Keeper.** Earlier: 46,499 reviews at 86%. Live: 57,201 at 85.2% — [store page](https://store.steampowered.com/app/599140/?l=english&cc=us)
- **Graveyard Keeper 2.** Earlier: launch data not retrieved. Live: released Sep 22, 2026, $24.99, 11,561 reviews at 75.8% — [store page](https://store.steampowered.com/app/4358690/?l=english&cc=us)
- **Heartopia.** Earlier: Steam launch Jan 17, 2026; 14,663 reviews at 66%. Live: Steam shows Jan 16, 2026; 16,461 at 66.2% — [store page](https://store.steampowered.com/app/4025700/?l=english&cc=us)
- **Starsand Island.** Earlier: 84.5% across 5,379 reviews (Mar 2026, fan wiki). Live: 6,959 at 75.1% in all languages (81.2% in English), last 30 days 51.2% — [store page](https://store.steampowered.com/app/2966320/?l=english&cc=us)
- **Tales of the Shire and Sugardew Island.** Earlier (background knowledge): launched to mixed or negative reception. Live: Tales of the Shire is at 81.5% of 3,854 (labelled Very Positive, though 53.3% of its last 15 reviews); Sugardew Island is at 73.0% of 381 (Mostly Positive). Both are small, neither is rated Mixed overall — store pages [2016460](https://store.steampowered.com/app/2016460/?l=english&cc=us), [2711030](https://store.steampowered.com/app/2711030/?l=english&cc=us)
- **Farm Together and Farm Together 2.** Earlier: 20,584 at 94.2%; 5,338 at 94%, 868 in game. Live: 22,136 at 94.1%; 5,547 at 93.8%, SteamSpy peak yesterday 1,080 — store pages [673950](https://store.steampowered.com/app/673950/?l=english&cc=us), [2418520](https://store.steampowered.com/app/2418520/?l=english&cc=us), [SteamSpy](https://steamspy.com/api.php?request=appdetails&appid=2418520)
- **Sun Haven, Sandrock, Disney Dreamlight Valley, Core Keeper** are consistent with the earlier notes within normal growth: 25,820 at 80.4% (earlier 24,726 at 80.9%); 29,292 at 88.1% (28,819 at 88%); 25,299 at 92.2% (24,450 at 92%); 68,564 at 92.9% (about 65,500 at 93%) — store pages [1432860](https://store.steampowered.com/app/1432860/?l=english&cc=us), [1084600](https://store.steampowered.com/app/1084600/?l=english&cc=us), [1401590](https://store.steampowered.com/app/1401590/?l=english&cc=us), [1621690](https://store.steampowered.com/app/1621690/?l=english&cc=us)
- **Free-to-play field.** Earlier: "Only two free-to-play farm-life games of significant size were found" (Palia, Heartopia). Live: Infinity Nikki (10,718 reviews, Mixed) and My Singing Monsters (50,582) also carry the Farming Sim tag and sell, and Play Together (1,795) is a third free life-sim MMO — see section 3
- **Tag reference.** Earlier notes point to `steamdb.info/tag/87918`; 87918 is correct. The brief's "tag id 87" is Utilities — [Steam tag list](https://store.steampowered.com/tagdata/populartags/english)

**Corrected top 10.** Rule kept from the earlier notes: farming or ranching is the central loop, one entry per franchise except the two newest Farming Simulator games. Ordered by live all-language review count. CCU is SteamSpy's peak-yesterday figure except where Steam's chart gives peak today.

| # | Game (store page) | Reviews (% pos) | Players | USD / BRL | Place in earlier notes |
|---|---|---|---|---|---|
| 1 | Stardew Valley ([413150](https://store.steampowered.com/app/413150/?l=english&cc=us)) | 1,050,832 (98.5%) | 71,940 peak today (Steam chart) | $14.99 / R$24,99 | 1 |
| 2 | Slime Rancher ([433340](https://store.steampowered.com/app/433340/?l=english&cc=us)), ranching hybrid, not returned under the tag | 159,024 (98.0%) | 856 | $19.99 / R$59,99 | 4 |
| 3 | Farming Simulator 22 ([1248130](https://store.steampowered.com/app/1248130/?l=english&cc=us)) | 93,552 (92.8%) | 8,069 | $19.99 / R$94,95 | 3 |
| 4 | Farming Simulator 25 ([2300320](https://store.steampowered.com/app/2300320/?l=english&cc=us)) | 61,313 (87.6%) | 46,384 peak today (Steam chart) | $29.99 / R$143,95 | 2 |
| 5 | Ranch Simulator ([1119730](https://store.steampowered.com/app/1119730/?l=english&cc=us)) | 49,246 (79.1%) | 744 | $24.99 / R$47,49 | 7 |
| 6 | Palia ([2707930](https://store.steampowered.com/app/2707930/?l=english&cc=us)) | 45,135 (86.0%) | 5,140 | Free | 5 |
| 7 | My Time at Portia ([666140](https://store.steampowered.com/app/666140/?l=english&cc=us)) | 44,390 (91.5%) | 346 | $29.99 / R$99,90 | 8 |
| 8 | Fields of Mistria ([2142790](https://store.steampowered.com/app/2142790/?l=english&cc=us)) | 37,015 (97.0%) | 4,078 | $13.99 / R$44,49 | 6 |
| 9 | Dinkum ([1062520](https://store.steampowered.com/app/1062520/?l=english&cc=us)) | 29,279 (91.8%) | 897 | $19.99 / R$59,99 | 9 |
| 10 | Coral Island ([1158160](https://store.steampowered.com/app/1158160/?l=english&cc=us)) | 27,959 (89.0%) | 1,699 | $29.99 / R$89,99 | 10 |

- Sources for the table: store pages linked in each row; prices from [USD batch 1](https://store.steampowered.com/api/appdetails?appids=413150,2300320,1248130,787860,2707930,4025700,2142790,1158160,1062520,1432860,1084600,666140,1119730,433340,1657630,1401590,1621690,673950,2418520,599140,4358690,1868140,1129580,1044720,1419170,3164330,2966320,2016460,2408820,1677110,2320980,3198850,1139980,972660,1062090,751780,1210320,1468260,447020,313160,2666510,3370870,2060160,1594940,3167550,382310,544550,894940,1488490&cc=us&filters=price_overview) and [BRL batch 1](https://store.steampowered.com/api/appdetails?appids=413150,2300320,1248130,787860,2707930,4025700,2142790,1158160,1062520,1432860,1084600,666140,1119730,433340,1657630,1401590,1621690,673950,2418520,599140,4358690,1868140,1129580,1044720,1419170,3164330,2966320,2016460,2408820,1677110,2320980,3198850,1139980,972660,1062090,751780,1210320,1468260,447020,313160,2666510,3370870,2060160,1594940,3167550,382310,544550,894940,1488490&cc=br&filters=price_overview); players from SteamSpy `appdetails` for each app id (pattern `https://steamspy.com/api.php?request=appdetails&appid=<id>`, see the table in section 1) and the [Steam Charts page](https://store.steampowered.com/stats/Steam-Game-and-Player-Statistics?l=english)
- Without the one-per-franchise rule the review-count top 10 would be: Stardew Valley, Slime Rancher, Farming Simulator 22, Farming Simulator 19, Farming Simulator 25, Slime Rancher 2, Ranch Simulator, Palia, My Time at Portia, Fields of Mistria — store pages as linked above

### Inferences
- If the report wants "who matters today" instead of "who accumulated most reviews", the same ten ordered by players are: Stardew Valley, Farming Simulator 25, Farming Simulator 22, Palia, Fields of Mistria, Coral Island, Dinkum, Slime Rancher, Ranch Simulator, My Time at Portia. Farming Simulator 25 at number 2 and Palia and Fields of Mistria in the top five match the earlier notes' judgment-based order better than raw review counts do.
- The earlier notes' statement that Farming Simulator 25 costs about $49.99 should be replaced by "$29.99 on 11 November 2026"; whether that is a permanent cut from a higher launch price cannot be checked on these hosts.
- The earlier notes' percentages are within about one point of live values for all ten games except Farming Simulator 25 (earlier 84.1%–86%, live 87.6%). The count discrepancies come from English-only figures (Fields of Mistria) and stale third-party trackers (Graveyard Keeper, Starsand Island).
- The earlier notes' peak figures (Stardew Valley 236,614; Farming Simulator 25 135,970; Heartopia 65,956 and others) are neither confirmed nor contradicted here, because all-time peaks are not published on the two hosts available.

### Gaps
- All-time peak CCU and official sales figures in the earlier notes could not be re-checked.
- Early Access start dates for Slime Rancher and My Time at Portia are not shown on their store pages.
- The background-knowledge claims about Disney Dreamlight Valley's battle-pass-style track, Palia's ownership by Daybreak and Farming Simulator's 16-player cap have no support or contradiction on the store pages.
