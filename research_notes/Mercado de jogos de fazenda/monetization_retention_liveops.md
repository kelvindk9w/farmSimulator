# Monetization, retention and live-ops best practices for free-to-play farming / casual simulation games (ads + premium currency) — state as of November 2026

> **Evidence base and limits (read first).** Notes compiled 2026-11-11. In this session page fetching was blocked by the environment's network allowlist (all 8 fetch attempts failed at DNS level) and the shared web-search budget ran out after 35 successful searches (13 further queries were refused). Consequently **every "Cited Finding" below rests on the search engine's summary/snippet of the linked page, not on a full read of the page.** Where a summary did not make clear which of several returned pages carried a figure, the bullet says *attribution uncertain*. Tags used: **[primary]** = platform/regulator/original publisher; **[vendor]** = number published by a company selling a related product; **[secondary]** = blog/press summarizing someone else's data; **[est.]** = third-party estimate. Anything I know from background but could not source in this session is placed under **Gaps** as an *unverified lead*, never under Cited Findings. All figures should be re-checked at the URL before publication.

---

## 1. Genre benchmarks 2025–2026 (retention, sessions, ARPDAU, conversion, ARPPU, LTV, ads-vs-IAP share, CPI by region; top quartile vs median)

### Takeaway
No public 2025–2026 source surfaced with farm/simulation-specific retention, session or ARPDAU rows; the best usable anchors are all-genre GameAnalytics percentiles (2025 data: median D1 ≈ 22%, median D7 < 4%, top-10% D7 ≈ 11–12%, top-1% D7 > 25%) and vendor ranges for hybrid-casual ARPDAU ($0.15–0.50). LATAM install costs are very low (≈ $0.14 CPI in 2025 per Adjust) but so are Brazilian ad prices and ARPU, so unit economics in Brazil depend on long retention and many rewarded views per user.

### Cited Findings
**Retention (all genres, mobile)**
- GameAnalytics "2026 Mobile & PC Gaming Benchmarks" (covers calendar 2025): median (P50) mobile games recorded D1 retention of around 22% at the start of 2025; median D7 was "just under 4%" throughout the year. [primary] — [GameAnalytics 2026 report](https://www.gameanalytics.com/reports/2026-mobile-pc-gaming-benchmarks)
- Same report: top 10% (P90) of games held D7 ≈ 11–12% for most of 2025; top 1% (P99) regularly exceeded 25% D7. [primary] — [GameAnalytics 2026 report](https://www.gameanalytics.com/reports/2026-mobile-pc-gaming-benchmarks)
- Same report, PC: median PC games retained only ≈ 7% of players on Day 1 (relevant for browser/Microsoft Store expectations). [primary] — [GameAnalytics 2026 report](https://www.gameanalytics.com/reports/2026-mobile-pc-gaming-benchmarks)
- Top-quartile D1 reported by a secondary blog summarizing GameAnalytics: 25–27% on Android and 31–33% on iOS (2025–26). [secondary; attribution uncertain between two blogs] — [Innovecs Games](https://www.innovecsgames.com/blog/mobile-game-retention-benchmarks/); [Game Growth Advisor](https://gamegrowthadvisor.com/blog/2026-03-17-mobile-game-retention-strategies-2026/)
- GameAnalytics "2025 Mobile Gaming Benchmarks" (covers 2024 data): 11,600 games, 9 regions, iOS + Android, 16 genres, classic (not rolling) retention, and it reports D28 rather than D30. Pooled median D7 estimated at ≈ 3.4–3.9% by a secondary article. [primary + secondary] — [GameAnalytics 2025 report PDF mirror](https://investgame.net/wp-content/uploads/2025/02/2025-GameAnalytics-Mobile-Gaming-Benchmarks.pdf); [AppAgent](https://appagent.com/blog/mobile-game-retention-benchmarks/)
- Appodeal "Mobile Casual Benchmarks Report 2025" (Android only): "pure hypercasual and simulation games" show poor long-term sustainability — D30 retention ≈ 3% and ARPU ≈ $0.79. Note this "simulation" bucket is ad-driven hyper-sim, not Hay Day/Township-style farm sims. [vendor] — [Appodeal report summary](https://gameindustrylibrary.com/documents/mobile-casual-benchmarks-report-2025)

**Monetization KPIs**
- Hybrid-casual titles (ads + IAP): ARPDAU range $0.15–0.50 with 40–60% of revenue from IAP (2025–26 vendor blog, methodology unclear). [vendor] — [Playio ARPDAU benchmarks](https://blog.playio.co/arpdau-benchmarks-mobile-games)
- Payer conversion: "most games" 1–2% of users pay; "healthy" games 3–6% (older rule of thumb). [secondary] — [Game Developer](https://gamedeveloper.com/business/how-do-i-know-i-have-a-healthy-game-)
- Payer conversion depends heavily on window: ≈ 1% daily up to "the 40s%" annually; D90 IAP ARPPU roughly $7–10 (2026 vendor article). [vendor] — [Playio ARPPU](https://blog.playio.co/arppu-mobile-games)
- June 2026 report recap lists casino $11.40, midcore $9.80, casual $7.26 (appears to be ARPPU per period; metric definition not visible in snippet; simulation not broken out). [secondary, ambiguous] — [Gamedev Reports weekly recap](https://gamedevreports.substack.com/p/weekly-gaming-reports-recap-june-e95)
- AppMagic Monetization Report 2025 places Simulation among genres where "simple and hybrid formats are expanding". [secondary] — [Mobidictum summary of AppMagic](https://mobidictum.com/appmagic-monetization-report-2025/)
- Casual games IAP revenue fell 1% in 2025 to $20.7 billion (AppMagic). [est.] — [Mobidictum / AppMagic LiveOps Report 2025](https://mobidictum.com/appmagic-liveops-report-2025/)
- 135 mobile games surpassed $100M IAP revenue in 2025, combined $50.8B. [est.] — [Mobile Marketing Reads](https://mobilemarketingreads.com/?p=50460)

**CPI / UA**
- Liftoff & Singular "2025 Casual Gaming Apps Report" (Feb 2024–Feb 2025; 318B impressions, 27B clicks, 55M installs): average casual-game CPI $1.41 on iOS and $0.14 on Android (the Android figure is surprisingly low and identical to Adjust's LATAM number below — verify in the report); iOS still delivers > 2x the D30 ROAS of Android on most genres. [vendor] — [Liftoff 2025 Casual Gaming Apps Report](https://info.liftoff.ai/2025-casual-gaming-apps-report); [Liftoff highlights](https://liftoff.ai/?p=35032)
- Same report: of casual-game installs coming from non-gaming publisher apps, 28% come from utility/productivity apps and 25% from entertainment apps. [vendor] — [Liftoff press release](https://finanzen.net/nachricht/aktien/28-of-casual-game-installs-from-non-gaming-publishers-come-from-utility-apps-liftoff-s-casual-gaming-apps-report-reveals-14433137)
- Adjust "Gaming App Insights Report 2026": LATAM gaming CPI rose 40% during 2025 to $0.14. [vendor] — [Adjust report PDF](https://a.storyblok.com/f/47007/x/20551740ee/gaming-app-insights-report-2026.pdf); [Gamedev Reports summary](https://gamedevreports.substack.com/p/adjust-gaming-app-insights-report)
- Historical: Liftoff 2022 casual report said APAC and LATAM CPIs were under $1 and that ROAS was "practically the same in all regions, except LATAM". [vendor, old] — [Liftoff 2022 report (PT)](https://content.liftoff.io/hubfs/2022/Reports/Casual%20Gaming%20Apps%20Report/2022%20Casual%20Gaming%20Report%20-%20PT%20v3.pdf)

**Brazil / LATAM context**
- Android ≈ 83% vs iOS ≈ 17% of mobile in Brazil (Statista via Tenjin, 2025). [secondary] — [Tenjin: State of Mobile Gaming in Brazil 2025](https://tenjin.com/zh/blog/the-state-of-mobile-gaming-in-brazil-2025-data-trends-and-market-analysis/)
- Tenjin 2024 dataset: Brazil ranked 4th worldwide for Android ad revenue and 11th for iOS; 3rd globally for Android ad spend, 12th on iOS. [vendor] — [Tenjin Brazil 2025](https://tenjin.com/zh/blog/the-state-of-mobile-gaming-in-brazil-2025-data-trends-and-market-analysis/)
- Tenjin ad-monetization benchmark, Q1 2026: US = 29% of Android game ad revenue (31% in Q4 2025), Russia 13%, Japan 5%, Brazil 5%. [vendor] — [Tenjin Ad Mon Gaming 2026](https://tenjin.com/tr/blog/ad-mon-gaming-2026/)
- Brazil mobile-games ARPU cited as US$8.15 for 2025 (attributed to Statista); 2025 mobile game revenue "over US$639 million" in another source; > 103 million players; largest games market in LATAM. [secondary; attribution uncertain between pages] — [Allcorrect Brazil 2025](https://allcorrectgames.com/insights/brazil/); [Alconost Brazil 2026 update](https://alconost.com/en/blog/brazilian-market); [Statista](https://www.statista.com/statistics/1186394/mobile-gaming-revenue-brazil/)
- Brazilian games market ≈ R$12.7 billion in 2025, +8% vs 2024 (press report, July 2026). [secondary] — [Band](https://www.band.com.br/band-vale/noticias/como-o-pix-mudou-a-forma-como-o-brasileiro-paga-por-games-e-streaming-202607202039)

### Inferences
- A farm sim must be planned against top-decile, not median, retention: the genre monetizes through long-lived players, so D7 ≥ ~11–12% (GameAnalytics P90, 2025) is the realistic "viable" bar; a median-quality title (D7 < 4%) would not sustain an ads + IAP economy.
- The Appodeal "simulation" figures (D30 ≈ 3%, ARPU $0.79) describe ad-only hyper-simulation; they are a warning about launching a farm game without deep meta/social systems rather than a target.
- Illustrative Brazil payback arithmetic (inference from cited numbers): at LATAM CPI ≈ $0.14 and a Brazilian rewarded/interstitial eCPM of ~$2–4 (see Q2), one impression earns $0.002–0.004, so an acquired Brazilian player must generate roughly 35–70 ad impressions (or equivalent IAP) just to repay CPI. That is feasible only with multi-week retention and several rewarded views per day.
- US/tier-1 players are worth roughly 4x or more per ad impression (US rewarded eCPM $16–20 and interstitial ~$14 vs Brazil interstitial $3.67 and LATAM rewarded ~$2–4, Q2), so revenue will be tier-1-skewed even if most installs are Brazilian; UA and regional pricing should be planned per tier.
- Web/PC surfaces likely retain worse than mobile on D1 (PC median ≈ 7%), so browser/Playables builds should be treated as top-of-funnel with account linking to mobile.

### Gaps
- No simulation/farming-specific D1/D7/D28, session length, sessions/day, ARPDAU, conversion, ARPPU or LTV benchmark was retrievable. The GameAnalytics genre tables (GameIntel / report PDFs), Adjust 2026 report (session length by genre/region) and AppMagic Monetization Report 2025 contain them but could not be opened. Hosts to allow: gameanalytics.com, investgame.net, gameindustrylibrary.com, gamedevreports.substack.com, a.storyblok.com.
- No Brazil-specific CPI for casual/simulation (only LATAM aggregate), no tier-1 vs tier-3 CPI table, no US simulation CPI.
- No verified ads-vs-IAP revenue split for farm sims specifically (Hay Day/Township are understood to be IAP-dominant, but no sourced figure was found this session).
- No top-quartile vs median comparison specific to the genre.

---

## 2. Hybrid monetization (ads + IAP): prevalence, best mix, rewarded placements, eCPMs US vs Brazil, interstitial risk, remove-ads / ad-free subscriptions

### Takeaway
Hybrid is the norm and its IAP side is the growing part (top-10 hybrid-casual IAP +67% YoY in Q1 2025); rewarded video is the anchor format (≈ 39% of casual ad revenue, ~36% of casual DAU engage, best when tied to "ran out of resource" moments), while interstitials measurably raise churn relative to rewarded. US rewarded eCPMs ($16–20) are several times Brazilian ones (low single digits), so ad design must be opt-in, high-frequency and reward-driven to matter in LATAM.

### Cited Findings
**Prevalence and mix**
- AppMagic: the top 10 hybrid-casual games generated $87M net IAP revenue in Q1 2025, +67% YoY. [est.] — [Gamedev Reports / AppMagic](https://gamedevreports.substack.com/p/appmagic-top-10-hybridcasual-games)
- Revenue split by hybrid sub-genre (2026 blogs, methodology unclear): lifestyle/puzzle ≈ 59% IAP / 41% ads (another source says closer to 50/50); action/strategy ≈ 82% IAP / 18% ads. [vendor/secondary; attribution uncertain] — [Airflux](https://airflux.ai/blog/beyond-ads-hybrid-meta-systems-iap-growth-2026); [Game Growth Advisor](https://gamegrowthadvisor.com/blog/2026-04-16-hybrid-casual-game-design-strategy-2026/)
- TopOn H1 2025 report: rewarded video ≈ 39% of ad revenue in casual games and > 50% in midcore/hardcore; interstitials are "catching up". [vendor] — [Prado summary of TopOn](https://prado.co/post/rewarded-video-holds-the-crown-but-interstitial-ads-are-catching-up)
- AppsFlyer monetization report: ads can cannibalize IAP earnings, "especially for games with rewarded ads"; over the 3 months measured there was no automatic paying-user/DAU correlation. [vendor] — [AppsFlyer](https://www.appsflyer.com/resources/reports/app-marketing-monetization-report-2/)

**Rewarded-video engagement**
- Unity "Mobile Growth and Monetization Report 2024" (2023 data from Unity Ads, Tapjoy, ironSource): rewarded-video engagement rose 3.2% YoY; share of DAU engaging with rewarded ads — word 38.4%, RPG 37.6%, casual 36%. [vendor] — [PocketGamer.biz](https://www.pocketgamer.biz/unity-global-rewarded-ad-engagement-rose-by-32-in-2023)
- Same report: placements tied to a specific moment such as running out of resources reached 38.1% engagement vs 23.8% for between-level placements. [vendor] — [PocketGamer.biz](https://www.pocketgamer.biz/unity-global-rewarded-ad-engagement-rose-by-32-in-2023); [Unity blog](https://unity.com/blog/rewarded-ads-how-value-exchange-shapes-mobile-monetization)
- AppLovin rule of thumb: rewarded ad-viewer rate (share of DAU who watch) < 15% is poor, > 30% is strong. [vendor] — [AppLovin glossary](https://applovin.com/?p=7802)
- Agency guide: opt-in rate (share who tap "watch" when offered) consistently < 30% means the reward is not landing. [vendor] — [AppSamurai](https://appsamurai.com/blog/rewarded-ads-in-mobile-games-strategy-data-and-best-practices/)
- Rewarded-video completion rates ≈ 80–90% (eMarketer, April 2025, quoted by a vendor blog). [secondary] — [AppLixir](https://www.applixir.com/?p=3343)
- Outlier case: Next Games reported 75–80% of its player base opted in to video ads and ≈ $0.06 ad revenue per player per day (old case study). [primary case, dated] — [PocketGamer.biz](https://www.pocketgamer.biz/next-games-ads-drive-revenue/)
- Vendor benchmark table for rewarded impressions per DAU: < 2 weak, 4–7 typical, 8+ strong (unvalidated heuristic; attribution uncertain). [vendor] — [Playio hybrid-casual monetization](https://blog.playio.co/hybrid-casual-games-monetization)
- Hay Day is cited by a fan analysis as using only rewarded video (the players' preferred format) and approaching ads "carefully". [secondary/fan] — [JustHayDay forum](https://justhayday.boards.net/thread/1435/hay-day-monetization-farming-game)

**eCPMs**
- Appodeal Q4 2024: US rewarded video eCPM $19.63 iOS / $16.49 Android; US interstitial $14.08 iOS / $14.32 Android; US banner $0.68 Android / $0.45 iOS. Rewarded has the highest eCPM globally on both platforms; iOS earns more, especially in North America and Europe. [vendor] — [Appodeal Q4 2024 PDF](https://appodeal.com/wp-content/uploads/2025/03/Quarterly_Mobile_eCPM_Report_-_Q4_2024.pdf); [MAF summary](https://maf.ad/en/blog/mobile-ads-ecpm/)
- Brazil interstitial eCPM rose from ≈ $2 in early 2024 to $3.67 by December 2024 (platform not stated; attribution uncertain, most likely Appodeal's Q4 2024 view). [vendor] — [Appodeal Q4 2024 view](https://appodeal.com/the-mobile-ecpm-report-updated-q4-2024-view)
- Brazil Android eCPM "$1–3" (unsourced glossary estimate); LATAM rewarded eCPMs ≈ $2–4 in Q1 2024 (secondary blog). [secondary, low confidence] — [MWM glossary](https://mwm.ai/glossary/ecpm); [Business of Apps](https://businessofapps.com/?p=85258)
- A Statista chart (Appodeal data, March 2024) breaks out Brazil eCPM by ad type and OS, values not visible without access. [lead] — [Statista](https://statista.com/statistics/1400843/ecpm-ad-type-ios-android-brazil)

**Interstitial risk**
- Unity AdQuality data (analysis by Ivona Pinjak): interstitials consistently drive higher churn than rewarded video across platforms; churn differs by ad network by as much as 15x; iOS users are more sensitive to interstitials than Android users. [vendor] — [PocketGamer.biz](https://www.pocketgamer.biz/what-our-data-reveals-about-ad-quality-and-player-churn-in-mobile-games/)
- Airflux/Airbridge: players shown interstitials early in their lifetime churn faster; yet one experiment raising interstitial frequency 1.6x produced +23% interstitial revenue, +2% rewarded revenue and +9% IAP revenue; in another game higher interstitial exposure was associated with 11% lower 14-day LTV from IAP + rewarded. [vendor, conflicting] — [Airflux](https://airflux.ai/blog/interstitial-ads-monetization)
- Appodeal case study: +20% ARPU from heavier ad load with "zero impact on retention" in three games. [vendor] — [Appodeal](https://appodeal.com/20-arpu-retention-strategies-3-successful-games)
- Blog claim: past the 5th–6th interstitial per session incremental revenue shrinks while churn risk does not. [vendor, unmeasured] — [Playio](https://blog.playio.co/interstitial-ads-mobile-games)

**Web / Playables surface**
- YouTube Playables (official docs): ads monetization is in an initial phase; revenue sharing is being piloted with selected developers; ad slots appear for a subset of users in eligible regions. [primary] — [Google Developers](https://developers.google.com/youtube/gaming/playables/reference/monetization)
- As of 29 Sept 2026 Playables had no in-app purchases; developers were still asking for IAP in Oct 2026. Publishers only see total daily portfolio revenue with a 48-hour delay. Self-reported earnings: Playgama ≈ $3,100/month from its Playables in March 2026 ad tests; Mediacube says portfolio revenue grew ~10x May→June 2026. [vendor/secondary] — [Mediacube](https://mediacube.io/en/blog/youtube-playables-monetization); [36Kr](https://eu.36kr.com/en/p/4027861725614465); [Tech Insider](https://tech-insider.org/youtube-playables-50-markets-eu-nordics-2026/)

### Inferences
- For a farm sim the best-evidenced placements are "need-state" rewarded ads (38.1% vs 23.8% engagement): speed up a nearly-finished timer, refill/out-of-resource moments, double an order or harvest reward, a free daily chest/spin, reviving a withered crop, and an offline-earnings multiplier at session start. These are need-state or session-start moments, matching Unity's finding; no farm-specific opt-in table was found, so targets should be the generic ones (≥ 30% of DAU watching; 4–7 rewarded impressions per DAU).
- Illustrative ad ARPDAU (inference): 4 rewarded impressions/DAU × US Android eCPM $16.49 ≈ $0.066 per DAU; the same behavior at a Brazilian eCPM of ~$3 ≈ $0.012 per DAU. Ads alone will not fund a Brazil-heavy audience; IAP and tier-1 reach are required.
- Forced interstitials are the riskiest lever for a long-retention genre: the churn evidence is consistent (even if revenue experiments conflict) and farm sims earn from D30+ players. If used at all (e.g., web portals that expect them), delay them past the first sessions, cap per session, and remove them for any payer.
- Because ads can cannibalize IAP (AppsFlyer), rewarded rewards should be capped daily and priced below the premium-currency equivalent, and payers/ad-watchers should be segmented.
- On YouTube Playables the game must work as an ads-only (or even unmonetized) surface as of late 2026; treat it as acquisition/brand reach, with progress carried to IAP-capable platforms if policy allows.

### Gaps
- No sourced figure for the share of top casual/simulation games that combine ads + IAP (Sensor Tower's "Gaming deep dive: ad monetization" report and AppsFlyer State of Gaming 2025 likely have it; not retrievable).
- No 2025–2026 Brazil rewarded-video eCPM by platform; no web (HTML5) eCPM vs mobile; no Poki/CrazyGames/Facebook Instant Games revenue-share or eCPM data (queries refused).
- No data on "remove ads" purchase conversion or ad-free subscription uptake. A secondhand Unity figure ("ad removal 11% iOS / 7% Android", "currency 18% / 17%") appeared but its denominator is unclear — see Q3.
- No farm-game-specific opt-in rates per placement (timer skip vs double reward, etc.).

---

## 3. Dual-currency economy design (soft + premium), fair premium-currency uses in multiplayer, price ladders, Brazil regional pricing, starter packs, offers, piggy banks, personalization

### Takeaway
Hard evidence retrievable this session is thin and mostly regulatory or anecdotal: starter packs shown in sessions 3–5 at low price points convert best (Google Play guidance), regional price tiers are now standard even for Hay Day (Supercell, Sept 2025), Pix is the dominant Brazilian payment rail, and regulators (EU CPC, FTC) are pushing against opaque currency bundles and multi-layer currencies. Personalized/different prices for the same item have caused player backlash in farm games.

### Cited Findings
- Google Play guidance (2016, still the most concrete public case): show the starter pack within 3–5 sessions after install; in BattleHand the starter pack was shown around session 4 for 36 hours and over 50% of buyers chose it instead of regular gem packs. [primary, dated] — [Android Developers Blog](https://android-developers.googleblog.com/2016/08/5-tips-to-help-you-improve-game-as-a-service-monetization.html?hl=en)
- Vendor guidance: low-friction starter bundles at $0.99–$2.99 convert never-purchasers best; another summary gives $1.01–$5.00 as the effective first-purchase range (no controlled tests cited). [vendor; attribution uncertain] — [Fungies](https://fungies.io/how-to-effectively-monetize-your-player-base-in-mobile-games/); [AppStorys](https://appstorys.com/blog-Mobile-Game-Conversion-Rate-Strategies)
- Secondhand Unity market-report figure: currency packs "convert" at 18% (iOS) / 17% (Android) and ad removal at 11% (iOS) / 7% (Android) — the denominator (share of purchases vs share of users) is not clear from the snippet. [secondary, ambiguous] — [Fungies](https://fungies.io/how-to-effectively-monetize-your-player-base-in-mobile-games/)
- Supercell published "Upgrading global pricing for Hay Day" (dated Sept 2025 per summary): regional price levels were expanded, and players in lower-priced regions are restricted from gifting Farm Passes to players in higher-priced regions (anti-arbitrage). [primary] — [Supercell](https://supercell.com/en/games/hayday/blog/news/upgrading-global-pricing-for-hay-day)
- Hay Day App Store IAP list shows the same SKU at several prices (e.g., Farm Pass $1.99–$6.99; "Special Offer" $1.99–$4.99), i.e., offer price varies by segment/region/date. [primary listing] — [App Store: Hay Day](https://apps.apple.com/app/id506627515); [AppPricingLab](https://apppricinglab.com/app/apple/506627515)
- FarmVille 3: "different prices for certain upgrades" between players "sparks drama" (headline only). [secondary] — [Touch Tap Play](https://www.touchtapplay.com/?p=112989)
- Pix accounted for 54.7% of payment transactions in Brazil in H2 2025 and > 170 million individuals (~80% of the population) used it by early 2026 (Central Bank data quoted by a payment provider). A "64% share" figure also circulates with vague sourcing. [vendor quoting primary] — [PagBrasil](https://www.pagbrasil.com/blog/markets/gaming/digital-payments-in-online-gaming-tailored-solutions-for-brazilian-players/); [Antom](https://knowledge.antom.com/brazils-gaming-boom-unlocking-the-new-frontier-of-opportunities)
- 2025 Serasa + Gamers Club study: 36% of surveyed Brazilian gamers buy expansions, add-ons, items or extra features inside games. [secondary] — [PagBrasil](https://www.pagbrasil.com/insights/the-importance-of-local-payments-for-the-gaming-industry-in-brazil/)
- Publishers add Pix on direct channels: Epic Games Store offers Pix in Brazil; Xsolla reported high checkout abandonment with boleto; NetEase Games Club added Pix via EBANX. [primary/vendor] — [Epic Games help](https://www.epicgames.com/help/billing-and-payment-c-41804731/a19616449); [GamesBeat](https://gamesbeat.com/netease-games-club-and-ebanx-work-together-to-expand-latin-american-payments/); [PagBrasil](https://www.pagbrasil.com/blog/markets/gaming/digital-payments-in-online-gaming-tailored-solutions-for-brazilian-players/)
- EU CPC key principles (21 Mar 2025): show the real-money price of items alongside the virtual-currency price; avoid practices that hide costs or force consumers to buy unwanted currency (bundle mismatches); currencies earnable only through gameplay are out of scope. [primary via law-firm summaries] — [Bird & Bird](https://www.twobirds.com/en/insights/2025/european-move-towards-protecting-users-from-harmful-practices-in-video-games-eu-consumer-protection); [ZwillGen](https://www.zwillgen.com/gaming/cpcn-announces-virtual-currency-consumer-protection-guidelines/)
- FTC v. Cognosphere (Genshin Impact, Jan 2025): the FTC objected to a "complex and confusing multi-tier virtual currency exchange system"; the order bars selling loot boxes with virtual currency unless a direct real-money purchase option exists. [primary via press] — [PC Gamer](https://www.pcgamer.com/games/rpg/ftc-says-genshin-impact-deceived-children-and-orders-its-publisher-to-pay-a-usd20-million-fine-and-stop-selling-loot-boxes-to-kids); [FTC](https://www.ftc.gov/node/87268)
- Palia (cozy MMO): after beta backlash about premium-store bundles and "Palia Coins", the developer promised a clearer store and to align coin packages with outfit prices (Aug 2023). [primary] — [Palia: Monetization response](https://palia.com/news/monetization-update-08-2023)
- AppMagic Casual LiveOps H1 2025: about 70% of live-ops events in casual games have a monetization focus (offers attached to events are the norm). [est.] — [AppMagic report](https://appmagic.rocks/files/img-blog/Casual_LiveOps_Report_H1_2025.pdf); [Mobidictum](https://mobidictum.com/?p=202462)

### Inferences
- Keep to exactly two currencies (soft earned by play; one premium "cash") and avoid intermediate tokens bought with cash: both the FTC complaint and the CPC principles single out layered/obscured exchange systems.
- Size premium-currency packs so that common store items can be bought without leftover balance, and show a real-money equivalent next to cash prices (at least in EU builds) — this pre-empts CPC principles 1–3 and mirrors what Palia had to retrofit.
- In a shared-world multiplayer farm, premium currency is safest on: time (finish timers, extra production/queue slots), convenience (auto-collect, extra order refresh, storage/land that can also be earned by play), and cosmetics. It should not buy exclusive yield advantages, leaderboard/event score, or tradeable goods that can be flipped for soft currency at scale — those create pay-to-win perception and real-money-trading incentives (see Q7).
- Regional pricing for Brazil should be an explicit BRL ladder (not FX-converted USD) with anti-arbitrage rules on gifting/trading between price regions, as Supercell did; Pix should be offered wherever the platform allows (web shop, browser build, Microsoft Store/third-party checkout).
- Per-user price discrimination on the *same* permanent item is reputationally risky (FarmVille 3 "different prices" backlash); prefer segmenting by *offer content/bonus size* and by country tier, with the base catalog price consistent within a country.
- First-purchase design: one-time starter pack at the lowest price tier, surfaced around sessions 3–5, time-limited (≈ 24–48h), mixing cash + a visible cosmetic; follow with a first-purchase bonus (e.g., double cash on first buy of each pack).

### Gaps
- No sourced benchmarks for starter-pack conversion in 2025–26, piggy-bank performance, limited-time-offer uplift, or personalization/segmentation uplift (query refused or results were vendor marketing).
- No sourced sinks/sources teardown of Hay Day/Township economies this session. *Unverified leads (background knowledge, not confirmed this session):* Hay Day's premium currency (diamonds) is spent mainly on skipping timers, extra production slots and missing items; barn/silo capacity is gated by rare expansion materials that are tradeable in the roadside shop; Township's T-cash plays the same role with barn upgrades as the main sink. Verify against Deconstructor of Fun's Township teardown — [lead](https://www.deconstructoroffun.com/blog/2020/10/13/how-playrix-township-became-a-billion-dollar-game).
- *Unverified lead:* the conventional mobile price ladder is $0.99 / $1.99 / $4.99 / $9.99 / $19.99 / $49.99 / $99.99 with rising bonus currency per tier; no source captured this session.
- No actual BRL price points for Hay Day/Township packs in Brazil; no confirmation whether Google Play Billing itself accepts Pix in Brazil (search found nothing).
- The Supercell pricing post's exact tiers/countries could not be read.

---

## 4. Season / battle passes in farm games (Hay Day Farm Pass, Township Golden Ticket) and subscriptions/VIP

### Takeaway
A ~US$4.99 monthly pass is the genre standard (Hay Day Farm Pass and Township Golden Ticket both list at $4.99 in the US) and its introduction has produced visible revenue step-ups (Township +22% MoM to $29.8M when its first pass launched in Nov 2019). Passes now coexist with event-specific mini-passes; share-of-revenue and retention effects are not publicly quantified.

### Cited Findings
- Township's first season pass ("Professor's Experiments", Nov 2019) lifted player spending > 22% month over month to $29.8M — its best month to that date; Hay Day's Farm Pass is named as another successful season-pass introduction. [est.] — [Sensor Tower](https://sensortower.com/blog/battle-pass-success-stories-2021)
- Hay Day App Store IAP list: Farm Pass $4.99; Farm Pass Bundle $11.99; other storefront snapshots show Farm Pass at $1.99–$6.99 and a separate "Festival Pass" at $4.99 (regional/offer variation). [primary listing] — [App Store: Hay Day](https://apps.apple.com/app/id506627515); [AppPricingLab](https://apppricinglab.com/app/apple/506627515)
- Hay Day store text/update notes reference three pass products — "Farm Pass, Party Pass decos, and … Festival Pass rewards" — and season-themed pass rewards such as "Halloween themed Farm Pass decorations", i.e., pass rewards are heavily cosmetic/decorative and rotate monthly/seasonally. [primary listing] — [App Store: Hay Day](https://apps.apple.com/app/id506627515)
- Township Golden Ticket listed at $4.99 (US). [secondary tracker] — [AppPricingLab: Township](https://apppricinglab.com/iap/apple/638689075)
- Player sentiment sample: an Aug 2023 r/TownshipGame thread asks whether the Golden Ticket is "worth it", with one player saying it has not been for years (value erosion complaint). [anecdotal] — [Reddit mirror](https://redlib.astrial.org/r/TownshipGame/comments/15zyb0j/golden_ticket_worth_it)
- Hay Day gifting of Farm Passes exists and is region-locked by price tier since the Sept 2025 pricing update. [primary] — [Supercell](https://supercell.com/en/games/hayday/blog/news/upgrading-global-pricing-for-hay-day)
- Prevalence: battle passes feature in ~60% of the top 20% grossing mobile games (GameRefinery snapshot, 2022 data); Appfigures (2024 data) found them in about half of top games. [vendor/est., not casual-specific] — [GameRefinery snapshot](https://gameindustrylibrary.com/documents/innovative-monetization-features-snapshot-report-2022); [Appfigures](https://appfigures.com/resources/this-week-in-apps/20250516)
- Headline claim: Township described as a "$45M/month engine" in a 2025–26 GameRefinery podcast summary (period not stated in snippet). [secondary] — [Pulse summary](https://www.pulse.bot/gaming/news/how-playrix-turned-township-into-a-45mmonth-engine-a-two-a-half-gamers-episode-with-gamerefinery-7916d6ea-6698-47c3-8660-de41964ca510/)
- Subscription precedent in a cozy game: Animal Crossing: Pocket Camp added paid monthly plans in Nov 2019, including the "Cookie & Depot Plan" at $7.99/month (five fortune cookies + storage). [secondary] — [Engadget](https://www.engadget.com/2019/11/21/nintendo-pocket-camp-paid-subscriptions/); [TweakTown](https://www.tweaktown.com/news/68809/nintendo-adds-monthly-sub-free-play-animal-crossing-mobile-game/index.html)

### Inferences
- Plan a ~30-day pass at the $4.99 tier (with a BRL regional price) plus an optional bundle tier (~$9.99–11.99) that adds level skips/extra cosmetics, mirroring Hay Day's Farm Pass + Bundle structure.
- Pass rewards should be the main delivery vehicle for seasonal cosmetics (decorations, skins) plus modest conveniences; this aligns the pass with "no pay-to-win" and with loot-box restrictions, since pass contents are fully disclosed and deterministic.
- The Township thread suggests pass value must be maintained over time; visible value erosion converts a retention tool into a review liability.
- Shorter event passes (Hay Day "Festival Pass") are a second, cheaper layer once the base pass is established; do not launch both at once.
- An ad-free/VIP subscription is plausible for a hybrid game (remove interstitials, auto-collect, extra daily rewards), but no casual-genre uptake data was found, so treat as an experiment rather than a pillar.

### Gaps
- Structure details (number of tiers, free vs paid track contents, duration) of Hay Day Farm Pass and Township Golden Ticket were not retrievable. *Unverified lead (background knowledge):* both are ~monthly, two-track (free + paid) passes progressed by completing tasks/orders.
- No share-of-revenue or retention-lift figures for passes in farm/casual games in 2025–26; no pass conversion rate.
- No 2025–26 data on subscription/VIP prevalence or revenue share in casual games (query refused).

---

## 5. Cosmetics monetization in cozy/farm games and the role of social visibility (Grow a Garden, Palia, Pocket Camp, Fortnite-style lessons)

### Takeaway
Cosmetics-first monetization is accepted by cozy audiences but is not automatically safe: Palia's cosmetics-only store drew "predatory" pricing complaints and the studio eventually added a first non-cosmetic item, while the two biggest earners in this space (Grow a Garden, Pocket Camp) made their money largely from progression items, rare pets and gacha — models that now carry legal risk in Brazil. Social display ("flex") is the cited driver of spending in Grow a Garden.

### Cited Findings
- Grow a Garden (Roblox): ≈ $12M revenue in May 2025 from virtual items (seeds, upgrades, rare animals) bought with Robux; ≈ 1.2B hours played that month; top-earning Roblox game in June 2025; the developer declines to share revenue. [est./press] — [Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden); [games.gg](https://games.gg/news/roblox-top-earning-games-in-june-2025/)
- A third-party tracker estimates only ≈ $1.75M/month — estimates conflict widely. [est., low confidence] — [RoWatcher](https://rowatcher.com/games/7436755782)
- Grow a Garden "leans into cosmetics and flex culture to monetize player identity" and its monetization is "deeply integrated into the progression system" (marketing analysis). [secondary] — [Metaverse Marcom](https://www.metaversemarcom.io/post/inside-the-monetization-playbook-of-roblox-s-biggest-hit)
- The studio has been criticized for excessive monetization, and an unregulated real-money resale market emerged for rare pets/fruits. [secondary] — [Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden)
- Roblox revenue grew 36% YoY with Grow a Garden cited as a driver; FY2025 revenue ≈ $4.9B. [press] — [PocketGamer.biz](https://www.pocketgamer.biz/roblox-revenue-up-36-yy-as-grow-a-garden-and-steal-a-brainrot-drive-multiple-milestones)
- Palia's stated model: monetize only cosmetics (starting with character outfits), never core gameplay. [primary] — [Palia business model](https://palia.com/palia-business-model/)
- Palia reception: players called the store pricing/currency "predatory"; Steam rating "Mixed"; the studio responded by clarifying the store and realigning coin packs (Aug 2023). [secondary + primary] — [Sportskeeda](https://www.sportskeeda.com/mmo/i-hope-predatory-monetization-will-eventually-fixed-palia-player-unhappy-in-game-microtransactions); [Palia response](https://palia.com/news/monetization-update-08-2023)
- Palia later added its first non-cosmetic (light, optional functionality) premium item with the Elderwood expansion, saying "we still want to be cautious". [primary/secondary] — [Palia: Broadening store with care](https://palia.com/news/broadening-store-with-care); [OpenCritic](https://opencritic.com/news/16438/-we-still-want-to-be-cautious-palia-introduces-first-non-cosmetic-item-to-its-store)
- Animal Crossing: Pocket Camp earned ≈ $49M in 2018 (Sensor Tower est.) and > $150M lifetime by April 2020; it added gacha "fortune cookies" (themed furniture/clothing loot boxes, new ones monthly, premium ones for Leaf Tickets) in spring 2018 and subscriptions in Nov 2019; service ended 28 Nov 2024 and it was replaced by a paid offline "Complete" edition with no microtransactions. [est./secondary] — [Animal Crossing World](https://animalcrossingworld.com/2019/01/animal-crossing-pocket-camp-generated-49-million-in-revenue-in-2018-falls-far-short-of-fire-emblem-heroes/); [Kotaku](https://kotaku.com/nintendo-has-added-loot-boxes-to-animal-crossing-pocke-1825324973); [PocketGamer.biz](https://www.pocketgamer.biz/how-does-animal-crossing-pocket-camp-monetise/); [Wikipedia mirror](https://wikwiand-revamp.pages.dev/en/Animal_Crossing:_Pocket_Camp)
- Hay Day pass rewards are decoration-led and seasonally themed (e.g., Halloween Farm Pass decorations). [primary listing] — [App Store: Hay Day](https://apps.apple.com/app/id506627515)

### Inferences
- In a 3D shared-world farm, the cosmetic categories with the most "audience" are those other players see: farmhouse/barn skins, fences/paths/decor sets, animal and tractor skins, avatar outfits and emotes. Visit/shared-plot features are therefore a monetization prerequisite, not just a retention feature (Grow a Garden's "flex" dynamic).
- Cosmetics-only is unlikely to carry revenue alone in a hybrid casual game (Palia's trajectory); pair cosmetics with time-savers and a pass, but keep cosmetics as the prestige layer.
- Themed monthly sets (Pocket Camp's cookie themes; Hay Day's seasonal pass decor) are the proven cadence — but sell them via direct purchase/pass/earnable event tracks, not paid gacha, because of Brazil's loot-box ban (Q10).
- Price transparency matters more for cosmetics than for boosts: the Palia backlash was about bundle and coin-pack mismatch, not about cosmetics existing.
- Rare, tradeable prestige items invite real-money grey markets (Grow a Garden); make premium cosmetics account-bound or giftable only from the store.

### Gaps
- No quantitative data on which cosmetic categories sell best in farm/cozy games, cosmetic share of revenue, or measured uplift from farm-visiting features.
- No sourced design teardown of Grow a Garden (offline growth, shop restock cadence, mutations, trading) — query refused.
- No Fortnite-style item-shop rotation data applied to cozy games was found; any such recommendation is inference.
- Pocket Camp Complete price and plan details were not verified (summary gave $19.99).

---

## 6. Retention systems used by the best farm games and which have the strongest measured impact

### Takeaway
Publicly measured impact exists for live-ops cadence (games with continuous updates/seasonal events generate 84% of mobile game revenue; ~70% of casual events are monetization-focused; season-pass launches produce step changes), but I found no public, controlled measurement of individual retention mechanics (crop timers, daily login, push, collections) for farm games — those remain design conventions rather than benchmarked effects.

### Cited Findings
- Sensor Tower: 84% of mobile game IAP revenue is generated by games using continuous updates and seasonal events (live ops). [est.; attribution to this article uncertain] — [App Developer Magazine on Sensor Tower's "Cracking the Live Ops Code"](https://appdevelopermagazine.com/cracking-the-live-ops-code/)
- Same Sensor Tower study: 78% of the top 1,000 live-ops games by 2024 IAP revenue saw revenue decline in H1 2025 — live ops is necessary but not sufficient. [est.] — [App Developer Magazine](https://appdevelopermagazine.com/cracking-the-live-ops-code/)
- AppMagic Casual LiveOps Report H1 2025: ≈ 70% of casual live-ops events have a monetization focus; on average 0.7 *new* event types are added per month per casual game; most events are designed to raise session length and short-term retention; older titles dominate casual revenue charts. [est.] — [AppMagic PDF](https://appmagic.rocks/files/img-blog/Casual_LiveOps_Report_H1_2025.pdf); [Mobidictum](https://mobidictum.com/?p=202462)
- Township: season-pass launch (Nov 2019) = +22% MoM spend; the game "frequently integrates match-3 events" and its success is tied by AppMagic analysts to aggressive live ops. [est./secondary] — [Sensor Tower](https://sensortower.com/blog/battle-pass-success-stories-2021); [Mobidictum: AppMagic casual report 2025](https://mobidictum.com/appmagic-casual-games-report-2025-summary/)
- Township structure per GameRefinery: a tycoon/city-building front end with a match-3 core, giving two interdependent loops; the match-3 layer supplies frequent, bite-sized gratification that fuels purchases. [secondary] — [Pulse summary of GameRefinery episode](https://www.pulse.bot/gaming/news/how-playrix-turned-township-into-a-45mmonth-engine-a-two-a-half-gamers-episode-with-gamerefinery-7916d6ea-6698-47c3-8660-de41964ca510/)
- Hay Day (launched 2012) peaked above $25M/month in mid-2014 and rebounded in 2023, most revenue from the US — evidence that the appointment-farming loop plus live ops can retain for a decade. [secondary] — [Udonis](https://www.blog.udonis.co/mobile-marketing/mobile-games/hay-day-monetization)
- Grow a Garden logged ≈ 1.2B hours in May 2025, showing the pull of a plant-wait-harvest loop with offline growth and rare drops in a shared server. [press] — [Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden)
- Rewarded engagement is highest at resource-depletion moments (38.1%) — appointment/energy friction is where players accept an ad or spend. [vendor] — [PocketGamer.biz / Unity](https://www.pocketgamer.biz/unity-global-rewarded-ad-engagement-rose-by-32-in-2023)
- Regulatory constraint on retention tricks for minors in Brazil: ECA Digital decrees (18 Mar 2026) target engagement-maximizing design such as infinite scroll and autoplay for minors. [secondary] — [Congresso em Foco](https://www.congressoemfoco.com.br/noticia/117235/eca-digital-entra-em-vigor-o-que-muda-com-a-nova-lei)

### Inferences
- Ranking by strength of public evidence (not by proven causal size): (1) recurring live-ops calendar with passes/seasonal events; (2) layered appointment timers (short crops for session density, long crops/production for return visits) — evidenced only by genre longevity; (3) social obligation systems (co-op tasks, helping) — widely asserted, weakly measured (Q7); (4) daily login/streaks, quests, collections, push — standard, no public measurement found.
- A sensible launch scope is: mixed-length crop/production timers with offline progress; daily quests + a 7-day login calendar; NPC order board (truck/boat equivalents) as the soft-currency source; land expansion and farm level as the long-term goal; one monthly pass; one rotating weekly event; and co-op tasks. New event *types* can then be added at roughly the AppMagic-observed pace (< 1 per month).
- Because most events are monetization-focused industry-wide, a new studio can differentiate (and help reviews) by making at least the weekly co-op event generous and non-paywalled.
- For under-18 users in Brazil, avoid compulsion-style loops (endless auto-advance, punitive streak loss, late-night push) — these sit close to what the ECA Digital decrees restrict; crop "withering" penalties that pressure return visits should be mild or absent for minors.

### Gaps
- No measured uplift for daily login rewards/streaks, push notifications, collections/achievements, story/NPC orders or offline progress in farm games (query refused). Recommend GDC Vault talks on Hay Day/Township and vendor A/B case studies as follow-up.
- No data on optimal timer length distribution or session/day targets for the genre.
- The 84% Sensor Tower figure's exact definition (which revenue base) was not verified.
- *Unverified leads (background knowledge):* Hay Day's retention stack = truck/boat/town orders, neighborhood Derby (weekly co-op competition), Valley seasons, wheel of fortune, calendar events; Township = Regatta (co-op races), zoo, mine, event mini-games.

---

## 7. Social and multiplayer as a retention and monetization driver (co-ops, invites, gifting, trading/marketplaces and their risks, events, leaderboards)

### Takeaway
The claim that guild/co-op members retain and spend more is near-universal in industry commentary but I found no public controlled figures; the best academic evidence says social behavior does affect retention and revenue yet "social" and "paying" players are partly different segments. Open trading reliably creates real-money grey markets (Grow a Garden), and regional pricing creates gifting arbitrage (Supercell had to restrict Farm Pass gifting).

### Cited Findings
- Academic study on a casual F2P mobile game ("social" defined via friend/social-network requests): social features significantly affect retention and revenue, but cohort analysis indicates social players and premium players may be distinctly different segments. [academic] — [White Rose ePrints](https://eprints.whiterose.ac.uk/134038/1/social_social_ltv.pdf)
- Mistplay survey (> 2,000 North American mobile gamers, 2024): 21% of spenders consider a game's community before installing; 27% actively participate in game communities. [vendor survey] — [Mistplay](https://business.mistplay.com/resources/mobile-game-community-growth-report)
- Industry commentary asserts guild systems improve D7/D30 retention but cites no data. [vendor, unquantified] — [AVOW](https://avow.tech/glossary/what-are-guilds-and-why-are-they-crucial)
- Grow a Garden: an unregulated resale market exists where players buy/sell rare pets and fruits for real money. [secondary] — [Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden)
- Peer-to-peer marketplaces for game goods are mainstream and local-payment-enabled in Brazil: Eldorado.gg integrated Pix in Aug 2025. [press release] — [GlobeNewswire](https://www.globenewswire.com/news-release/2025/08/13/3132613/0/en/Eldorado-Gaming-integrates-PIX-to-enhance-payment-experience-for-Brazilian-users.html)
- Supercell restricts gifting of Farm Passes from lower-priced to higher-priced regions (Sept 2025). [primary] — [Supercell](https://supercell.com/en/games/hayday/blog/news/upgrading-global-pricing-for-hay-day)
- D2C/web-shop fraud signal relevant to gifting/trading: 72% of companies with a web shop report higher fraud/chargeback rates there than in app stores (Omdia/FastSpring survey of 110 executives). [vendor survey] — [Gamedev Reports](https://gamedevreports.substack.com/p/omdia-and-fastspring-d2c-game-monetization)
- ECA Digital (Brazil, in force 17 Mar 2026) restricts minors' access to player-to-player chat/interaction features in games alongside the loot-box ban. [secondary] — [Forbes Brasil](https://forbes.com.br/forbes-mkt/2026/04/eca-digital-como-as-novas-regras-afetam-negocios-no-mundos-dos-games-e-da-tecnologia/); [Agência Gov](https://agenciagov.ebc.com.br/noticias/202608/eca-digital-conheca-as-regras-de-protecao-de-criancas-e-adolescentes-no-ambiente-online)
- Parent reviews of Township flag "concerns over chat feature" among top complaints. [anecdotal] — [Common Sense Media](https://www.commonsensemedia.org/app-reviews/township-farm-city-building/user-reviews/adult)

### Inferences
- Build co-ops ("neighborhoods") early because they are the genre's proven long-term structure, but instrument them properly: compare co-op joiners with matched solo players before attributing LTV to the feature (self-selection is the known confound).
- Since social and paying segments only partly overlap, social features should be valued for retention and virality (and for giving cosmetics an audience), with monetization through shared goals (co-op event passes, gifting from the store) rather than expecting social players to convert individually.
- Trading design for a new studio: asynchronous, price-capped marketplace listings in soft currency only; no direct player-to-player transfer of premium currency or premium cosmetics; store-mediated gifting only; region/price-tier and account-age checks on gifting; rate limits and server-authoritative inventory to contain duplication and chargeback laundering.
- For Brazil, chat must be age-gated/parent-controllable by default for minors; quick-chat/emotes and pre-set phrases are the low-risk default, which also creates an emote cosmetic line.
- Leaderboards and competitive events should be co-op-bracketed and effort-based; if premium currency can buy event score the game becomes pay-to-win in the most visible place.

### Gaps
- No quantified lift (retention, LTV) for guild/co-op membership, friend invites/referrals or gifting in farm games; no referral-reward benchmarks.
- No sourced description of how Hay Day/Township constrain trading. *Unverified lead (background knowledge):* Hay Day's roadside shop is asynchronous, coin-only, with per-item maximum prices and no direct trade, which limits (but has not eliminated) third-party item selling.
- No data on fraud/chargeback rates from in-game gifting specifically.

---

## 8. Mini-games and sub-games inside sim games (fishing, mining, match-3/merge side modes, races, fairs)

### Takeaway
Mini-games/special modes are a documented and growing feature trend in top-grossing casual games, and Township is the flagship case of a farm/city sim fused with match-3 content; however, public sources give no quantified retention, monetization or UA lift for mini-games.

### Cited Findings
- GameRefinery-based trend reporting: mini-games and special playing modes are appearing more frequently in top-grossing casual games, positioned as retention boosters and new monetization surfaces. [vendor; attribution uncertain] — [Casual Gaming Trends report](https://investgame.net/news/pdf/casual-gaming-trends/); [FoxData](https://foxdata.com/en/blogs/beyond-gameplay-what-casual-games-are-competing-on-in-2025/)
- Township combines a city/farm tycoon layer with a match-3 core and frequently runs match-3 events; Township's UA shifted from hyper-casual-style ads to tailored creative. [secondary] — [Pulse summary of GameRefinery episode](https://www.pulse.bot/gaming/news/how-playrix-turned-township-into-a-45mmonth-engine-a-two-a-half-gamers-episode-with-gamerefinery-7916d6ea-6698-47c3-8660-de41964ca510/); [Mobidictum: AppMagic casual report 2025](https://mobidictum.com/appmagic-casual-games-report-2025-summary/)
- AppMagic: casino-style mechanics (dice, slots, Plinko) are increasingly used inside live-ops events of non-casino genres. [est.] — [AppMagic: mechanics for 2026](https://appmagic.rocks/blog/mechanicsfor2026)
- Standalone match-3 is saturated: only 3 of 213 new match-3 launches in H1 2025 passed $100k monthly revenue (success rate 1.4%). [est.] — [Gamedev Reports / AppMagic H1'25](https://gamedevreports.substack.com/p/appmagic-mobile-casual-games-in-h125)
- Player-side caution: parent reviews of Township list "repetitive mini games" and "money-focused gameplay" among complaints. [anecdotal] — [Common Sense Media](https://www.commonsensemedia.org/app-reviews/township-farm-city-building/user-reviews/adult)

### Inferences
- For a 3D multiplayer farm, diegetic mini-games (fishing, mining, tractor races, seasonal fair stalls) fit better than bolted-on match-3: they add session variety, give events new formats, provide rewarded-ad moments (extra attempt, double catch), and supply fresh UA creative angles.
- Avoid chance-based casino-style mini-games (wheels/slots/Plinko) that take premium currency: they are trending in the industry but collide with the Brazilian loot-box ban and with a child-appealing art style. Free daily spins with disclosed, non-purchasable outcomes are the conservative variant.
- Keep each mini-game shallow and rotating; "repetitive mini games" is an explicit complaint when a side mode becomes mandatory progression.

### Gaps
- No measured retention/monetization lift from mini-games; no evidence on fishing/mining specifically in farm sims; no data on mini-game UA creative performance (CPI/IPM). GameRefinery's feature-prevalence data would answer part of this but was not retrievable.

---

## 9. Web shops / direct-to-consumer stores in 2025–2026 (Epic v. Apple, EU DMA, Brazil) — margin recovered and casual-game usage

### Takeaway
Web shops are now standard — about three-quarters of top-grossing mobile games run one, mobile D2C sales reached ≈ $17B in 2025 (~15% of mobile IAP), and each sale moved to direct recovers roughly 15–30 points of margin — but most publishers still get only 10–19% of revenue that way, fraud is higher, and US/Brazil fee rules were still shifting in late 2026. In Brazil, Apple opened alternative payments and stores in 2026 under a CADE settlement, with reduced but non-zero commissions and extra protections for minors.

### Cited Findings
**Adoption and economics**
- Bain "Gaming Report 2026": ~three-quarters of top-grossing mobile games worldwide operate their own web stores, up from 12% in 2019; mobile games earned ≈ $17B from direct sales in 2025, ≈ 15% of all mobile in-game purchase revenue; publishers leave a 15–30% margin improvement on the table for each third-party-store sale they could convert to direct. [consultancy est.] — [Bain](https://www.bain.com/insights/game-distribution-half-your-players-already-buy-direct-gaming-report-2026/)
- Web shops are available for 74% of top mobile games (analytics report, 2026). [secondary] — [WN Hub](https://wnhub.io/news/analytics/item-51815)
- Omdia + FastSpring survey (110 executives): no surveyed company gets half or more of revenue via web shop; the largest group (38%) gets 10–19%; 72% of those with a web shop report higher fraud/chargebacks there than in app stores. [vendor survey] — [Gamedev Reports](https://gamedevreports.substack.com/p/omdia-and-fastspring-d2c-game-monetization)
- Leaders: Playtika's D2C share was 39.3% in the latest reported quarter (39.2% the quarter before; 25.3% in Q2 2025); Huuuge reached a record 41.2%; Playtika's CFO says D2C materially improved margins. [company reports via press] — [PocketGamer.biz](https://www.pocketgamer.biz/publishers-bank-record-direct-to-consumer-revenue); [PocketGamer.biz](https://www.pocketgamer.biz/revealed-mobile-publishers-share-their-record-d2c-sales/)
- Sensor Tower: among major top-100 casino titles ≈ 30% of revenue now comes from outside app stores, with RPG close behind (casual/simulation not highlighted). [est.] — [PocketGamer.biz](https://www.pocketgamer.biz/sensor-tower-reveals-the-hidden-impact-of-d2c-revenue-in-mobile-games/)
- Xsolla (web-shop vendor, Sept 2026): repeat buyers account for 97.8% of all web-shop revenue. [vendor] — [Business Wire](https://secure.businesswire.com/news/home/20260928312597/en/Xsolla-Releases-The-Xsolla-Report-Mobile-D2C-Edition)

**US rules (state as of ~Sept–Oct 2026)**
- Epic v. Apple: the 30 Apr 2025 contempt ruling barred Apple from charging commission on, or interfering with, external purchase links in the US; the Ninth Circuit (Dec 2025) largely upheld it but allowed consideration of a reasonable cost-based fee; in Apr 2026 the case returned to the district court to determine what fee, if any, Apple may charge; settlement overtures were rejected by Epic. [legal press/vendor blogs] — [iClarified](https://www.iclarified.com/97179/court-bans-apple-from-taking-commission-on-web-purchases-in-major-win-for-developers); [MacRumors](https://www.macrumors.com/2025/12/12/epic-games-ceo-junk-fees/); [2Checkout](https://blog.2checkout.com/?p=35370)
- Epic v. Google: a Nov 2025 settlement proposal (which would have let Google charge link-out fees) was withdrawn on 15 Jul 2026; Google's US documentation says it intends to apply a service fee to external links in future but is not assessing one now; a separate legal update says that from 1 Oct 2026 US developers using alternative billing must report transactions and pay Google's applicable service fees — the two statements should be reconciled against Google's current policy page. [vendor blogs/legal press, partly conflicting] — [Appcharge](https://appcharge.com/blog/epic-v-google-the-settlement-is-off-the-table); [Stash](https://www.stash.gg/blog/why-epic-and-google-just-walked-away-from-their-own-settlement); [Mondaq](https://www.mondaq.com/unitedstates/it-and-internet/1825852/update-your-app-external-purchase-developments-for-apple-google); [MacRumors](https://www.macrumors.com/2025/11/05/google-epic-games-antitrust-settlement)
- Outside the US there is no equivalent injunction, so platform service fees on external links can still apply to UK/EU in-app web-shop flows. [vendor blog] — [Stash](https://www.stash.gg/blog/epic-v-google-january-hearing-injunction-android-developers)

**Brazil**
- Apple–CADE settlement (approved Dec 2025, three-year term, fines for non-compliance): Apple now allows alternative in-app payment methods, links to external purchase sites and third-party app stores on iOS in Brazil; press dates the change to 18 June 2026 (confirm exact go-live date). [press] — [TecMundo](https://www.tecmundo.com.br/mercado/413975-apple-oficializa-lojas-externas-no-brasil-e-outros-meios-de-pagamento-na-app-store.htm); [TNH1](https://www.tnh1.com.br/noticia/nid/apple-libera-sistema-de-pagamentos-em-aplicativos-no-brasil-apos-acordo-com-o-cade/); [PocketGamer.biz](https://www.pocketgamer.biz/brazils-apple-app-store-set-to-open-up-to-alternative-payments-in-2026)
- Commission levels reported for Brazil (sources disagree): App Store standard commission falling to 21% or 25% with 10% for small developers/special programs; 15% on purchases completed on external websites via links; 5% on digital sales by apps distributed outside the App Store. [press, conflicting] — [Times Brasil](https://timesbrasil.com.br/empresas-e-negocios/apple-anuncia-mudancas-no-ios-no-brasil-apos-acordo-com-o-cade/); [Baguete](https://www.baguete.com.br/noticias/apple-libera-lojas-alem-da-app-store-para-desenvolvedores); [TecMundo](https://www.tecmundo.com.br/mercado/413975-apple-oficializa-lojas-externas-no-brasil-e-outros-meios-de-pagamento-na-app-store.htm)
- Minor protections in the Brazilian iOS changes: users under 18 need parental authorization for purchases via alternative methods, and Kids-category apps may not link out to transaction websites. [press] — [TNH1](https://www.tnh1.com.br/noticia/nid/apple-libera-sistema-de-pagamentos-em-aplicativos-no-brasil-apos-acordo-com-o-cade/)

### Inferences
- A studio shipping on browser + Microsoft Store + mobile already has a natural D2C channel: the browser build with its own checkout (Pix + cards) is effectively the web shop; mobile clients can then link to it where rules allow (US iOS, Brazil iOS, and per-policy on Android).
- Realistic planning assumption: 10–20% of IAP revenue via direct in the first years (the modal Omdia band), with 15–30 points better margin on that slice, minus payment-processing, tax handling and higher fraud. Leaders at ~40% are social-casino companies with years of VIP programs — not a casual-farm baseline.
- Standard casual web-shop tactics (bonus currency/exclusive bundles on web, loyalty points, daily free gift to build the visit habit) are consistent with Xsolla's "repeat buyers = ~98% of revenue" — the web shop mainly serves existing payers.
- In Brazil the saving on iOS is modest once Apple's residual commissions (reported 5–15%) and PSP costs are counted; the stronger argument is Pix access and BRL price control. Steering minors to web checkout is restricted, which matters for a child-appealing game.
- Fee regimes are in flux (US litigation; Google's Oct 2026 change): build the store integration so the commission assumption is a config value, and re-check policies before launch.

### Gaps
- No casual/farm-specific D2C share figures (e.g., Hay Day via Supercell Store, Township web store) — query refused. *Unverified lead (background knowledge):* Supercell Store sells Hay Day offers with bonus rewards/loyalty points.
- EU DMA specifics (Apple's EU fee structure for link-outs after 2025 changes) were not retrieved.
- No result on a Brazilian digital-markets law. *Unverified lead (background knowledge):* the federal government sent a digital-markets bill (PL 4.675/2025) to Congress in Sept 2025 to give CADE ex-ante powers over large platforms; status as of Nov 2026 not confirmed.
- Microsoft Store, Facebook and Poki/CrazyGames commission/IAP rules not retrieved. *Unverified leads:* Microsoft Store has charged 12% on PC games since 2021; Facebook Instant Games historically allowed IAP on web/Android but not iOS.
- Web-shop vendor fee levels (Xsolla, Stash, Appcharge, Neon) not retrieved.

---

## 10. Legal / ethical constraints in 2026 for ads + premium currency (loot boxes, minors, privacy, pricing transparency) and what a farm game should do

### Takeaway
For a Brazil-based, child-appealing farm game the binding constraint is Brazil's ECA Digital (Lei 15.211/2025), in force since 17 March 2026 and actively enforced: paid loot boxes are prohibited in games aimed at or likely to be accessed by minors, profiling-based advertising to minors is banned, and age assurance, parental tools and chat restrictions are required. EU CPC currency-transparency principles (2025), the FTC's Genshin order (2025), the amended US COPPA rule (full compliance since 22 April 2026) and Google Play Families ad rules point the same way: no paid randomness, real-money price clarity, certified/contextual ads for children, and parental consent before targeted ads.

### Cited Findings
**Brazil — ECA Digital (Lei 15.211/2025) and related**
- The law was sanctioned in Sept 2025; the one-year vacatio was vetoed and MP 1.319/2025 set six months, so it entered into force on 17 March 2026. [official/legal] — [Agência Senado](https://www12.senado.leg.br/noticias/materias/2026/03/17/eca-digital-para-protecao-on-line-de-criancas-e-adolescentes-entra-em-vigor); [Demarest](https://www.demarest.com.br/eca-digital-entrada-em-vigor-em-17-de-marco-de-2026/)
- Art. 20 prohibits "caixas de recompensa" (loot boxes) in electronic games directed at children and adolescents or likely to be accessed by them; the mechanism is described as acquiring, for payment, items or advantages without prior knowledge of the content or guarantee of usefulness. [legal analysis] — [Mattos Filho](https://www.mattosfilho.com.br/unico/eca-digital-sancionada-lei/); [Confidata](https://confidata.com.br/blog/eca-digital-o-que-muda-empresas)
- Regulating Decree 12.880/2026 (decrees signed 18 Mar 2026) lists products/services prohibited to minors — gambling, betting, lotteries and loot boxes in games — and ANPD published guidance on age assurance ("aferição de idade"). Games may offer a version without loot boxes or block the feature by default, in which case age verification for that purpose is waived. [legal analysis] — [Mattos Filho: decree](https://www.mattosfilho.com.br/unico/decreto-regulamentar-eca-digital/); [Mattos Filho: ECA Digital in practice](https://www.mattosfilho.com.br/unico/eca-digital-na-pratica/)
- The law bans profiling techniques to target commercial advertising at children and adolescents; it does not ban games but restricts minors' access to player chat and bans loot boxes; decrees also address infinite scroll and autoplay for minors. [legal/press] — [Confidata](https://confidata.com.br/blog/eca-digital-o-que-muda-empresas); [Forbes Brasil](https://forbes.com.br/forbes-mkt/2026/04/eca-digital-como-as-novas-regras-afetam-negocios-no-mundos-dos-games-e-da-tecnologia/); [Congresso em Foco](https://www.congressoemfoco.com.br/noticia/117235/eca-digital-entra-em-vigor-o-que-muda-com-a-nova-lei)
- ANPD is the supervising authority; Art. 35 sanctions range from warning to fines and suspension of activities. [legal analysis] — [Confidata](https://confidata.com.br/blog/eca-digital-o-que-muda-empresas)
- Enforcement is live: in Oct 2026 the Ministry of Justice asked ANPD to monitor/investigate six games that kept loot boxes by re-rating to 18+ (including Counter-Strike 2, Call of Duty, Genshin Impact) and games that had not implemented age verification. [press/official] — [Correio da Manhã](https://www.correiodamanha.com.br/economia/justica/2026/10/327183-governo-pede-investigacao-de-seis-jogos-por-risco-de-apostas-a-menores.html); [MJSP technical note](https://www.gov.br/mj/pt-br/assuntos/noticias-1/mjsp-pede-a-anpd-que-monitore-jogos-eletronicos-com-caixas-de-recompensa-que-nao-implementaram-verificacao-de-idade/NotaTcnican55.pdf)
- Sector analysis of the law's impact on games (Oct 2025). [legal commentary] — [ConJur](https://www.conjur.com.br/2025-out-22/impactos-do-eca-digital-no-segmento-de-jogos-eletronicos//?print=1)

**EU — CPC key principles on in-game virtual currencies (21 Mar 2025)**
- The CPC Network (with the European Commission) published seven key principles and simultaneously opened a coordinated action against Star Stable Entertainment, whose practices were found "particularly harmful to children"; Star Stable was asked to ensure players always know real-world prices and given one month to respond. [primary/regulator] — [European Commission coordinated actions](https://commission.europa.eu/topics/consumers/consumer-rights-and-complaints/enforcement-consumer-protection/coordinated-actions/social-media-online-games-and-search-engines_pt); [Norwegian Consumer Authority](https://www.forbrukertilsynet.no/eng-articles/national-consumer-authorities-and-commission-take-action-on-harmful-practices-in-the-gaming-industry)
- Content: clear price indication including real-money price; no practices that obscure cost or force purchase of unwanted currency; respect for the right of withdrawal (cannot be waived for currency purchases; lapses once the currency is used); respect for consumer vulnerabilities, especially children. Currencies earned only through gameplay are out of scope. The principles are non-binding interpretations of existing law but can ground enforcement; industry bodies VGE and EGDF criticized them. [legal analysis] — [Reed Smith Q&A](https://www.reedsmith.com/articles/qas-on-the-eu-consumer-protection-authorities-joint-guidance-paper/); [Bird & Bird](https://www.twobirds.com/en/insights/2025/european-move-towards-protecting-users-from-harmful-practices-in-video-games-eu-consumer-protection); [Principles PDF mirror](https://esportslegal.news/wp-content/uploads/2025/03/Key-principles-on-in-game-virtual-currencies.pdf); [GamesMarkt](https://www.gamesmarket.global/en/business/case-of-star-stable-online-conflict-ahead-eu-commission-and-cpc-set-sights-on-games-industry-1870db4b2004d7d284e1c833a28c1f38)
- Digital Fairness Act: one legal source expected the Commission's draft in Q3 2026, and a Dec 2025 consultation showed majority support for stricter microtransaction rules. [legal commentary; status not confirmed] — [Entropy Law](https://www.entropy.law/en/articles-en/video-games-will-the-european-commission-ban-virtual-currencies-analysis)

**US — FTC and COPPA**
- FTC v. Cognosphere/HoYoverse (announced 17 Jan 2025): $20M penalty; no in-game purchases by under-16s without parental consent; loot boxes may not be sold via virtual currency without a direct real-money option; loot-box odds and exchange rates must be disclosed; COPPA violations for collecting children's data. [regulator/press] — [FTC](https://www.ftc.gov/node/87268); [PocketGamer.biz](https://www.pocketgamer.biz/hoyoverse-agrees-to-20-million-settlement-with-ftc-over-loot-boxes); [Game Developer](https://gamedeveloper.com/business/genshin-impact-developer-fined-20-million-over-loot-box-practices)
- Amended COPPA Rule: published 22 Apr 2025, effective 23 Jun 2025, full compliance required by 22 Apr 2026. Operators need separate verifiable parental consent before disclosing a child's data to third parties for targeted advertising (not "integral" to the service); a "mixed audience" category is formally defined (age screen before collecting data); FTC policy statement of 25 Feb 2026 limits enforcement where data is collected solely for age verification. FTC focus areas include ad-tracking SDKs in children's apps and undisclosed third-party SDK data flows. [legal analysis] — [Bass Berry](https://www.bassberry.com/news/amendments-to-the-coppa-rule-now-in-effect/); [Finnegan](https://www.finnegan.com/en/insights/articles/coppas-amended-rule-is-now-in-full-effect-what-operators-need-to-know.html); [Loeb](https://www.loeb.com/en/insights/publications/2025/05/childrens-online-privacy-in-2025-the-amended-coppa-rule); [ComplianceHub](https://compliancehub.wiki/coppa-april-22-deadline-ftc-updated-rule-compliance/)

**Platforms and ad tech**
- Google Play Families policy: if an app's audience includes children, ads shown to children must come only from Families Self-Certified Ads SDK versions and follow the Families ad-format requirements; mixed-audience apps must apply this to child users. [primary] — [Google Play: Families Self-Certified Ads SDK policy](https://support.google.com/googleplay/android-developer/answer/12918983); [Google Play: Families Ads Program](https://support.google.com/googleplay/android-developer/answer/9283445)
- Both Google and Apple require loot-box odds disclosure (per a kids-tech vendor's policy analysis). [secondary] — [SuperAwesome](https://www.superawesome.com/blog/analysing-googles-evolving-policies-for-kids-app-developers)
- Google announced on 17 Oct 2025 that it is retiring most Privacy Sandbox technologies on Chrome and Android (Attribution Reporting, Topics, Protected Audience, etc.); sources disagree on the Android advertising ID's future (one says it is preserved for at least two years). [primary + secondary] — [Google Privacy Sandbox blog](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies); [Android Authority](https://www.androidauthority.com/google-kills-privacy-sandbox-3608497); [Playio](https://blog.playio.co/privacy-sandbox-shutdown-android-game-marketing)
- Brazil iOS (CADE settlement): under-18s need parental authorization for alternative-payment purchases; Kids-category apps cannot link to external transaction sites. [press] — [TNH1](https://www.tnh1.com.br/noticia/nid/apple-libera-sistema-de-pagamentos-em-aplicativos-no-brasil-apos-acordo-com-o-cade/)

### Inferences
- A cute 3D farm game is very likely "of probable access" by minors under ECA Digital regardless of its stated target, so design as if the loot-box ban applies: **no paid random rewards at all** (no paid mystery boxes, gacha seeds/pets, or premium-currency spins). Use direct purchase, fully disclosed bundles and deterministic pass tracks. Re-rating to 18+ to keep loot boxes is exactly the route now under government scrutiny.
- Random rewards that are purely earned (free daily chest, harvest drops) are outside the "for payment" description, but chests unlocked by premium currency — and arguably by watching ads — are a grey area; the conservative choice is fixed or pre-disclosed contents for anything obtained with cash or ads.
- Compliance checklist implied by the cited rules: (1) neutral age gate at first launch on every surface and age signals from stores where available; (2) under-18 mode: contextual (non-profiled) ads only, via child-certified SDKs on Google Play; no behavioral ads without verified parental consent (COPPA under 13; ECA Digital under 18); (3) parental controls: spending limits/purchase approval, chat off or restricted by default; (4) premium-currency UX: real-money equivalent shown for items, packs sized to item prices, no stacked currencies, clear pre-purchase information and refund/withdrawal handling for unused currency in the EU; (5) no dark-pattern urgency aimed at minors; (6) documented data-protection impact assessment and minimal data collection (LGPD/GDPR).
- Revenue impact to model: ads served to declared minors (and to users without tracking consent) are contextual and therefore lower-eCPM; Brazil's already low eCPMs make IAP/pass revenue from adult players and tier-1 markets more important.
- If the Android advertising ID is indeed preserved after the Privacy Sandbox retirement (sources disagree — confirm on Google's developer pages), Android UA and ad monetization stay comparatively stable in 2026, which matters for an ~83%-Android Brazilian audience; iOS remains consent-gated (ATT).

### Gaps
- Exact ECA Digital sanction amounts and article text were not retrieved. *Unverified lead (background knowledge):* fines of up to 10% of the economic group's Brazilian revenue, or R$10–R$1,000 per registered user, capped at R$50 million per infraction — confirm in the Diário Oficial text.
- LGPD specifics (Art. 14 children's data, "best interest", ANPD guidance on legal bases for minors) were not retrieved this session (query refused).
- The exact seven CPC principles were not read in full. *Unverified lead:* (1) clear, transparent price indication; (2) no practices obscuring cost; (3) no forcing purchase of unwanted currency; (4) clear pre-contractual information; (5) respect right of withdrawal; (6) fair, plain contract terms; (7) game design respectful of consumer vulnerabilities. Outcome of the Star Stable action and whether the Digital Fairness Act proposal was published by Nov 2026 are unknown.
- Platform texts not retrieved. *Unverified leads:* Apple App Store Review Guideline 3.1.1 requires disclosing odds for randomized paid items before purchase (https://developer.apple.com/app-store/review/guidelines/); Google Play's Payments policy has an equivalent odds-disclosure rule.
- No 2025–26 ATT opt-in rate or quantified ATT/Privacy Sandbox effect on game ad revenue (query refused).
- GDPR-K/UK Age Appropriate Design Code, Meta/Poki/CrazyGames ad policies and YouTube Playables content policies were not covered.
- Whether rewarded-ad-gated random chests count as "paid" loot boxes under ECA Digital is not addressed in the sources found — needs Brazilian counsel.

---

## 11. Common monetization mistakes players punish in farm-game reviews, and examples praised for fair monetization

### Takeaway
The evidence retrievable this session is anecdotal but consistent: players punish "money-focused" pacing, opaque or unequal pricing, premium-currency economies perceived as predatory, value erosion of passes, and chat/safety problems; they tolerate opt-in rewarded video. Clean, cosmetics-led models earn goodwill only if store pricing is also transparent (Palia), and Nintendo's Pocket Camp ultimately replaced its gacha/subscription model with a one-time-purchase edition.

### Cited Findings
- Township parent/user reviews list: money-focused gameplay, repetitive mini-games, poor customer service, concerns over chat, declining satisfaction. [anecdotal] — [Common Sense Media](https://www.commonsensemedia.org/app-reviews/township-farm-city-building/user-reviews/adult)
- FarmVille 3: commentary says players compiled a "laundry list of complaints" and that the main reason for deleting FarmVille games is how financially demanding they became. [secondary] — [Study Breaks](https://studybreaks.com/tvfilm/did-we-really-need-a-farmville-3)
- FarmVille 3: different prices shown to different players for certain upgrades "sparks drama". [secondary, headline only] — [Touch Tap Play](https://www.touchtapplay.com/?p=112989)
- Township Golden Ticket: players question whether the pass is still worth buying (2023). [anecdotal] — [Reddit mirror](https://redlib.astrial.org/r/TownshipGame/comments/15zyb0j/golden_ticket_worth_it)
- Hay Day Google Play review mining (third-party text-analytics reports): "players disappointed by recent update"; "mixed reviews: enjoyment versus frustration". [secondary, details not visible] — [Kimola report 1](https://kimola.com/reports/uncover-hay-day-update-insights-player-feedback-report-google-play-en-us-142112); [Kimola report 2](https://kimola.com/reports/discover-hay-days-player-insights-a-comprehensive-feedback-report-google-play-en-155415)
- Hay Day is described as monetizing ads only through opt-in rewarded video, the format players prefer. [fan analysis] — [JustHayDay forum](https://justhayday.boards.net/thread/1435/hay-day-monetization-farming-game)
- Palia: cosmetics-only promise was well received in principle, but store prices, bundles and currency packs were attacked as "predatory" and Steam reviews are "Mixed"; the developer had to restructure the store. [secondary + primary] — [Sportskeeda](https://www.sportskeeda.com/mmo/i-hope-predatory-monetization-will-eventually-fixed-palia-player-unhappy-in-game-microtransactions); [Palia response](https://palia.com/news/monetization-update-08-2023)
- Grow a Garden's studio was criticized for excessive monetization after the game's breakout. [secondary] — [Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden)
- Pocket Camp: the addition of loot-box "fortune cookies" (2018) was widely criticized at the time; the live service ended in Nov 2024 in favor of a paid, microtransaction-free edition. [press] — [Kotaku](https://kotaku.com/nintendo-has-added-loot-boxes-to-animal-crossing-pocke-1825324973); [Pocket Gamer](https://www.pocketgamer.com/articles/077258/animal-crossing-pocket-camps-new-loot-box-system-is-a-risky-move/); [Wikipedia mirror](https://wikwiand-revamp.pages.dev/en/Animal_Crossing:_Pocket_Camp)
- Interstitials drive more churn than rewarded ads (Unity AdQuality data) — the measurable version of the "forced ads" complaint. [vendor] — [PocketGamer.biz](https://www.pocketgamer.biz/what-our-data-reveals-about-ad-quality-and-player-churn-in-mobile-games/)

### Inferences
- Mistakes to avoid, in order of evidence: (1) forced/unskippable ads in a long-session cozy game; (2) personalized prices for identical permanent items; (3) currency packs and bundles that never match item prices; (4) paid gacha for decor/pets (now also illegal for minors in Brazil); (5) pass/offer value erosion over time; (6) making side mini-games mandatory; (7) unsafe or unmoderated chat; (8) slow or absent purchase support (missing-purchase complaints surface in reviews).
- Storage caps and long timers are the genre's classic friction points; they are tolerated when there is a visible free path (earnable upgrade materials, rewarded-ad skips, co-op help) and resented when premium currency is the only practical route. No review-mining data was retrieved to quantify this, so treat it as genre convention.
- A defensible "fair" positioning for a new farm game: opt-in ads only, no paid randomness, one consistent price list per country, everything gameplay-affecting earnable by play, premium cosmetics clearly priced in real money. This aligns marketing, reviews and the 2026 regulatory direction at once.

### Gaps
- No systematic review-mining data (share of 1-star reviews by complaint type) for Hay Day, Township, FarmVille 3 or newer farm sims; the specific complaints named in the brief (barn/silo storage paywalls, aggressive timers) were not confirmed in retrieved sources.
- No sourced example of a farm game explicitly praised in press for fair monetization beyond the fan view of Hay Day's rewarded-only ads; Stardew Valley-style premium pricing and Pocket Camp Complete are adjacent but not F2P.
- FarmVille 3 pricing controversy details and current service status were not verified.
