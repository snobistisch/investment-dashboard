# Progress

Personal, open-sourceable dashboard for research trackers. Three sections so
far: Citrini Research Tracker (native React), plus Digital Biology and Robotics
(pre-built standalone dashboards, embedded).

Repo: https://github.com/snobistisch/investment-dashboard — live at
https://snobistisch.github.io/investment-dashboard/ (Pages via Actions,
deploys on every push to main).

## Done

- **Crypto: a live bug, a corrected headline, and positions.ts re-transcribed
  (12 Aug 2026).**

  **The bug, and how it hid.** Culling thirteen assets left two of them — HNT
  and ARB — in the hero spectrum's hard-coded pick list. `TOKENS.find()`
  returned undefined, `c.y1` threw, and every script below it died with it: the
  scatter plot, the bar fills and the scroll-spy. The table still rendered
  because it runs earlier, so the page looked fine. **My verification asserted
  "no label collisions" and got an empty array — which meant no labels at all,
  not no collisions, and I read it as a pass.** The pick list now filters
  against TOKENS and warns if too few names survive; the check now asserts that
  the graphics contain elements, not merely that they contain nothing wrong.

  **The headline overclaimed.** "Only one of the additions earns anything" was
  false — Maple earns $108M, NEAR $42M, Virtuals $20M. Corrected to the claim
  the data supports: five of the eight earn almost nothing.

  **positions.ts is now current.** Left alone through two rebuilds on provenance
  grounds, updated on instruction. The NOCK note had implied a proof market with
  no listed competitors, which stopped being true when Succinct, Lagrange and
  Boundless started trading — that is the kind of staleness that misleads rather
  than merely ages. Lighter's cliff now carries its date (27 Dec 2026) instead
  of "the turn of the year". ETH staking corrected to 34.5%. ZEC's note records
  that its evidence grade and its price now point opposite ways. Conviction
  levels unchanged on all four: the grades held, the descriptions did not.

- **Crypto tab: thirteen out, eight in (12 Aug 2026).** Matthias culled the
  assets he judged dead, unused or fully extracted by their venture backers, and
  named eight additions. Both halves were checked rather than accepted.

  **The cull holds on twelve of thirteen.** Added trailing-year protocol fees as
  a column, which is the metric that separates "cheap after a 90% fall" from "a
  claim on nothing": Celestia earned **$42,000** of fees in a year against a
  $293m capitalisation, The Graph $503K, Arweave $392K, Helium zero in the last
  thirty days, Secret and Boundless not tracked at all. Arbitrum has $1.2bn of
  chain TVL and unlocks ~1.5% of supply every month, indefinitely. **The
  exception is Centrifuge** — $1.63bn of TVL and $59.1m of fees against a $59m
  cap, the highest fee-to-cap ratio in the universe. Removed on instruction, but
  the note records that "no users" is not what its data says; the defensible
  objection is the Ondo one, that the yield belongs to depositors.

  **The additions split in two, and the tab now says so.** Maple, NEAR and
  Virtuals are float-settled or near it and earn real fees — Maple is the best
  addition by a distance at $108m of fees against a $176m cap on 94% float, and
  ranks 5th. The new layer ones are the worst assets in the report on the float
  rule: MegaETH 11% float at 8.85x FDV, Monad 12% at 8.51x, CAP 16% at 6.41x.

  **New §4 carries the collision instead of hiding it.** The rotation argument —
  capital goes where it has not already been extracted — is stated in its own
  terms alongside the float rule that contradicts it, with Monad as the live
  test: $876m of TVL against $1.4m of annual fees, roughly $7,000 a day, and the
  first unlock in November 2026. The dashboard applies the float rule, which
  puts the new L1s 18th, 32nd and 34th of forty, and publishes the probabilities
  so a reader who backs rotation can re-rank. The GCR attribution is flagged as
  unverified — only secondary paraphrases were found.

- **Crypto tab peer-reviewed and corrected (12 Aug 2026).** Matthias flagged
  that the data was wrong and that assets described as unavailable were live. He
  was right, and the cause is worth naming because it is the same failure the
  tab accused its source of: the previous pass checked the source's *market
  data* carefully and carried its *characterisation of what exists* without
  checking it at all. Verifying one column and trusting the rest produces
  something that looks rigorous and is not.

  **The big one.** The tab claimed the verifiable-compute reference
  implementations were private — "RISC Zero has no token", "Zama pre-TGE". All
  live: RISC Zero's proving marketplace as Boundless, plus Succinct, Zama,
  Aztec, Arcium, Lagrange, Nillion, Irys, Gensyn, Aleo and Octra. Thirteen
  listed verifiable-compute assets, median 21% float, ten under 30%, median 83%
  below their highs. The corrected finding is stronger than the wrong one: it is
  the float rule landing on exactly the cohort that was supposed to be exempt.

  **Four more substantive fixes.** Aave's fee switch is not "discussed for years
  and never delivered" — Aavenomics 3.0 has been buying ~292 AAVE a day since 27
  June 2026 on ~$400M of annualised revenue, which is why it ranks first.
  Hyperliquid's "$900M revenue / 61% share" is ~$765M trailing and ~44% of
  on-chain perp volume. Lighter's insider cliff is 27 December 2026, not "Q1
  2027" — four months out, on a position the book holds. Jupiter's float was
  computed off a stale 10bn maximum; 3bn JUP were burned in January 2025, so it
  is 48%, not 33%. Aster, the second-largest perp DEX at $1.6bn, was missing
  entirely and ranks 44th of 45.

  Universe 30 → 45 assets, all data refreshed to 12 August. Every protocol fact
  in the deep dives is now either verified against public reporting or removed,
  and the research note carries a table saying which is which.

  **Deliberately not done.** `positions.ts` still transcribes the July version
  of this page. Two items in it are worth Matthias's attention rather than a
  silent edit: Lighter's cliff is four months out, and Nockchain now has four
  listed proving competitors where the July note implied it had none.

- **Crypto tab rebuilt (11 Aug 2026).** Replaces the five-position deep dive
  with a 30-asset ranking on the same expected-value method as Defence, and one
  addition that changes the conclusion: **bitcoin is in the ranking as the
  benchmark.** In an asset class that is one factor with thirty tickers, "does
  this have positive expected value in dollars" is close to meaningless — in a
  liquidity upcycle nearly everything does. On the published probabilities BTC
  carries +18.5% a year with the tightest dispersion in the report; nine of the
  other twenty-nine beat it on raw EV and **one beats it after dividing by
  dispersion**, Ethereum, by 0.03.

  **Live supply data, and it reversed the source's own rule.** The strongest
  idea in the research package this replaced is a float rule: avoid tokens where
  most of the eventual supply has not been issued. It is correct, and it was
  applied to remembered supply figures. Checked live, ENA is 66% circulating and
  not 12%, StarkNet 68% and not 10%, Celestia 81% and not 25% — the overhang the
  avoid list warned about had already cleared. Meanwhile the only two assets
  still failing the rule are Hyperliquid (22% float, FDV 4.5x) and Lighter (25%,
  4.0x), which the package ranks #3 and #8. That contradiction is stated on the
  tab rather than quietly resolved, with both readings costed.

  **The twelve researched tokens were accurate; the twenty padded ones were
  not.** EigenLayer was carried at "$2B+" against $129m actual, Helium at
  "$500M+" against $33m, The Graph at "$800M+" against $149m — one-directional,
  3–15x, and traceable to a single cause: they were pre-drawdown figures in a
  market whose median asset has fallen 69% in twelve months. Also fixed: MKR no
  longer exists as the instrument described (migrated to SKY), and Zcash's
  "−85% from all-time high" refers to its October 2016 listing print, which is
  why the tab uses one-year returns as the headline drawdown metric and prints
  the all-time-high month next to the percentage.

  **Deliberately not done.** `positions.ts` still transcribes the July version
  of this page and has not been rewritten to match — it is a dated transcription
  with per-section sourcing, and re-transcribing it from a new source would
  destroy the property that makes it trustworthy. Whether the book's four crypto
  convictions should move in light of this is Matthias's call, not a side-effect
  of rebuilding a research tab. Per-protocol fee revenue is also absent: for a
  category whose central question is whether value reaches the token, that is
  the series that matters most and no free price API carries it.

- **Defence tab (11 Aug 2026).** Ninth section, embedded from
  [public/dashboards/defense.html](public/dashboards/defense.html), built on the
  photonics skeleton. Two things make it different from the other embedded
  tabs.

  **Live market data instead of transcribed.** All 53 market caps, forward
  multiples and 52-week ranges were pulled from a provider at build time rather
  than remembered. That single change reversed the note's conclusion: the source
  brief described a theme with opening procurement doors, and the data describes
  one in a 24%-median drawdown, with the high-beta half 40–68% off its highs
  while the cash-return primes sit at records. The brief's market-cap column was
  wrong on nearly every row — Palantir by 5.3x, Rocket Lab by 8.3x, Unusual
  Machines by 13x — because it had been carried over from a period before the
  2025–26 de-rating.

  **An explicit EV model instead of a 0–100 score.** Each name carries three
  scenarios with published probabilities and three-year returns; the ranking is
  computed in the page from those inputs, and the page warns in the console if a
  probability set does not sum to 1. A composite score cannot be argued with,
  which is the problem: this one can be recomputed by anyone who disagrees with
  a number. Two lenses are shown, because they disagree — raw EV favours the
  deep drawdowns (Rheinmetall, Kratos, RENK, AeroVironment), EV/σ favours the
  cheap unglamorous names (Leidos, QinetiQ, L3Harris). The correlation problem
  is stated rather than solved: the top ten share one driver, so the ranking
  ranks names and does not size a book.

  Corrections against the source brief are logged in
  [research/defense-tracker-research.md](research/defense-tracker-research.md)
  §6 rather than quietly fixed — including an unverifiable $74bn FY27 drone
  budget that was carrying the brief's central claim and has been removed as
  evidence, a NATO framing one summit out of date, and two references to
  companies that no longer exist as listed vehicles.

  **Deliberately not done.** Order intake and book-to-bill are absent, because
  no free quote endpoint carries them. That is the single largest upgrade
  available to this tab and it is also what resolves the claim the whole ranking
  rests on — whether the 2026 drawdown is a de-rating or a demand signal. Stated
  on the tab as an open question instead of being implied.

- **Phase 0 — Scaffold.** Vite + React + TypeScript + Tailwind v4
  (`@tailwindcss/vite` plugin, no config file). `base: './'` in
  [vite.config.ts](vite.config.ts) so builds work on GitHub Pages without
  hardcoding a repo name; deploy workflow in
  [.github/workflows/deploy.yml](.github/workflows/deploy.yml) (enable Pages
  with source "GitHub Actions" once a remote exists).

  Section architecture: one folder per tracker under `src/sections/<name>/`
  containing a component + `data.ts`. Shared pieces: `TrackerEntry` type in
  [src/types.ts](src/types.ts) and the `Section` shell in
  [src/components/Section.tsx](src/components/Section.tsx). To add tracker two:
  copy `src/sections/citrini/`, swap in its own data, render it from
  [src/App.tsx](src/App.tsx). No registry, no plugin system — on purpose.

- **Phase 2 — Build.** Research table approved and rendered as the Citrini
  section: 18 entries in [src/sections/citrini/data.ts](src/sections/citrini/data.ts)
  (typed `TrackerEntry[]`), table UI with status badges in
  [CitriniTracker.tsx](src/sections/citrini/CitriniTracker.tsx). Verified in
  the browser (no console errors) and `npm run build` passes.
- **Phase 1 — Research (approved).** Full table in
  [research/citrini-tracker-research.md](research/citrini-tracker-research.md):
  17 verified entries, 1 flagged unverified/ambiguous (25 Trades for 2025 —
  contents in a PDF not publicly enumerable), 4 excluded for lack of free
  source (bird flu, India infra, defense/drones, humanoid robots). Method:
  enumerated the Substack archive via its public API (free/paid flag per post),
  fetched every substantive free post, cross-checked podcast pages. Awaiting
  Matthias's review before Phase 2.

- **Digital Biology + Robotics sections.** Two pre-built, self-contained HTML
  dashboards Matthias made earlier, added as embedded sections. Files live in
  [public/dashboards/](public/dashboards/) (`digital-biology.html`,
  `robotics.html`) and render in a full-height iframe via
  [EmbeddedDashboard.tsx](src/components/EmbeddedDashboard.tsx). App now has a
  top nav switching three views with hash routing (`#citrini`, `#biology`,
  `#robotics`) in [src/App.tsx](src/App.tsx). Not ported to the TrackerEntry
  pattern on purpose — they're rich bespoke dashboards; embedding keeps 100%
  fidelity. Source files were in ~/Downloads; two earlier biology drafts
  (`_investment_report`, `_landscape`) were left out as superseded. Robotics
  pulls Google Fonts from a CDN (loads fine on Pages).

- **Agentic section added.** Fifth tab (`#agentic`), built on the shared
  template from a supplied thesis note (`agent_economy_hidden_gems.html`, 7
  positions across agentic payments/banking/neocloud). Applied senior-analyst
  fixes before implementing: corrected Circle's reserve-income annualization
  (source said $3.5B, doesn't reconcile with its own $653M quarterly print —
  corrected to ~$2.6B), reframed bull/base/bear ranges as scenario anchors not
  price targets, and added my own confidence ratings to the 5 "assumptions"
  (now the hypotheses section). Footer flags that figures are as-supplied and
  not independently re-verified this session. File:
  [public/dashboards/agentic.html](public/dashboards/agentic.html).

- **Quantum section added.** Fourth tab (`#quantum`), built on the
  digital-biology template (same 9-section skeleton, components and design
  tokens) from Matthias's supplied `quantum_deep_dive.md` — federal QIS spend
  as a leading indicator for public equities. Content faithfully transformed
  from the (already-sourced) md, not re-researched. Section 8's "vs" is
  repurposed as "sector beta vs the gov-capital signal"; the comparison
  table's numeric columns are relabelled Mkt cap / Fed $ (M). File:
  [public/dashboards/quantum.html](public/dashboards/quantum.html); registered
  in [src/App.tsx](src/App.tsx).

- **Robotics page rebuilt from scratch.** Old robotics dashboard content was
  discarded and replaced with fresh, sourced research (equities + tokenised
  DePIN names), rebuilt on the digital-biology page as the exact template —
  same 9-section skeleton, same components (risk-profile cards, timeline,
  7-segment landscape, 6 deep dives, sortable JS table, hypotheses, risk grid,
  the 2-col "vs" repurposed as equities-vs-tokens, synthesis) and identical
  design tokens/classes. Only the content differs. Research notes:
  [research/robotics-tracker-research.md](research/robotics-tracker-research.md).
  Digital-biology page left untouched (it is the quality/design benchmark).

- **Crypto section added.** Sixth tab (`#crypto`), built on the shared terminal
  template as a five-asset digital-assets tracker: ZEC, NOCK, PRL, ETH, LIT —
  one deep-dive card per asset (refined thesis, evidence, catalysts,
  risks/counter-evidence, per-card source links), an evidence spectrum in the
  hero, and a comparison table with HYPE as the benchmark row for the LIT
  thesis. Fresh web research July 9, 2026; each supplied working thesis was
  stress-tested and downgraded where evidence was thin (ZEC rotation leg →
  tailwind; NOCK proof market → internal-only today; LIT "stronger than
  Hyperliquid" → contested). Research notes with conflict log:
  [research/crypto-tab-research.md](research/crypto-tab-research.md). This tab
  supersedes the earlier quantum-resistance screen
  ([research/crypto_deep_dive.md](research/crypto_deep_dive.md), retained);
  ZEC and ETH carry over, ALGO/STRK/QRL rotate out. File:
  [public/dashboards/crypto.html](public/dashboards/crypto.html); registered
  in [src/App.tsx](src/App.tsx).

- **Photonics section added.** Seventh tab (`#photonics`), built on the
  digital-biology template (same 9-section skeleton, components and design
  tokens) from fresh web research on 8 August 2026 — market data is the 7 Aug
  close. Covers the full public photonics / optical-interconnect universe:
  **33 tickers across five exchanges** (US, Shenzhen, Shanghai STAR, Tokyo,
  Taipei Exchange, plus HK dual listings), seven deep dives (ALAB, LITE, COHR,
  Zhongji Innolight, CRDO, AAOI, FN), a supply-chain/competition map, and a
  sortable comparison table with a value-chain filter.
  Research notes with the conflict log:
  [research/photonics-tracker-research.md](research/photonics-tracker-research.md).
  Editorial calls made during the build: LYTE's holdings are used as a *seed*
  only and the section says so explicitly (its ≥50%-photonics-revenue screen
  excludes AVGO/MRVL/NVDA/GLW/ALAB/CRDO); a widely-shared "full LYTE holdings"
  list on X was discarded as not credible (it mixed in a private company and a
  lidar ticker); one aggregator's ZTE weight conflicted with Roundhill's own
  top-five and was dropped. Asian market caps are shown in local currency with
  an approximate USD equivalent at a **stated FX assumption** (USD/CNY 6.7372,
  USD/JPY 157.65, USD/TWD ≈32.25), and the USD figure is what the table sorts
  on. Adjacent photonics names (IPGP, LASR, LPTH, 6965) are included but
  flagged in-page as *not* AI-interconnect exposure. Everything time-sensitive
  is labelled: the FCC draft ban is unpublished and unconfirmed, and LITE,
  COHR, POET and FN all report within nine days of the snapshot.
  File: [public/dashboards/photonics.html](public/dashboards/photonics.html);
  registered in [src/App.tsx](src/App.tsx).

- **Terminal restyle.** Whole dashboard now uses one Bloomberg-terminal look:
  black background, amber (#fb8b1e) accents, system-mono type, square corners,
  bracketed status tags, dark scrollbars. Shared tokens live in
  [src/index.css](src/index.css) (`--color-term-*`); both embedded dashboards
  were rethemed in place to mirror those exact values (their `:root` variables,
  a handful of hardcoded literals, JS chart colors, and fonts — robotics no
  longer loads Google Fonts, so both files are fully self-contained). Density
  fix in robotics: mono glyphs are wider, so the universe table got smaller
  type + a `min-width` on the thesis column.

- **Exposure layer (rebuild Phase 1).** New first tab (`#exposure`, now the
  default) answering "what am I actually long, and how correlated is it?".
  Backed by [src/data/positions.ts](src/data/positions.ts): 161 rows, one per
  ticker mentioned anywhere in the dashboard — 91 across the six thematic
  sections plus 70 named only inside Citrini entries. Pure transcription from
  the embedded dashboards' `COMPANIES` arrays and the research notes; no figure
  was re-derived, re-estimated or refreshed, and every row carries the `asOf`
  date its market data was true. Computation lives in
  [analysis.ts](src/sections/exposure/analysis.ts) so every figure on screen is
  derived from the data, not hardcoded.

  Headline: **26 of 69 researched names share one primary driver (hyperscaler
  AI capex) — 88% of the $3.94tn of market cap on file.** Including the 22
  names their own sections flag as context-not-exposure: 28 of 91 at 94%.

  Findings worth keeping: (1) ticker overlap is nearly empty — only NVDA (4
  sections) and ALAB (2) repeat, so the sections share a *driver*, not names,
  which is why the factor view carries the argument; (2) the cap-weighted
  figure rests on three tickers (AVGO 59% of the AI-capex bucket, ANET 7%,
  MRVL 6%); (3) market-cap coverage is 47 of 69 — robotics has no market-cap
  column at all and biology states only two, so every weighted figure states
  its own coverage. Conviction is derived mechanically from each dashboard's
  A/B/C risk tier (Matthias's call, 2026-08-08) and labelled as a placeholder
  on screen, not as his judgement. Footer now states leverage explicitly:
  research only, no positions held, unlevered by construction.

- **Allocator section.** New second tab (`#allocator`), sitting right after
  Exposure: "what do I already have" answered, "what should I size next"
  asked. Takes a capital amount and a 0-100 risk slider (labelled
  Conservative/Balanced/Aggressive — deliberately not the A/B/C letters
  positions.ts uses for a position's own risk tier, a different axis) and
  sizes a concrete dollar allocation from
  [src/sections/allocator/allocation.ts](src/sections/allocator/allocation.ts).
  Universe is `activeBook` filtered to `stance === 'long'` and to positions
  carrying a documented `edge` — 29 of the 69 long names. Sizing rules, named
  as constants: 18 names down to 11 across the slider, 7% up to 16% per-name
  cap, weight proportional to `conviction` raised to a tilt that rises 1.0 to
  2.0. The per-factor cap (28-32%, reusing `factorBreakdown` from the Exposure
  tab) is held tight across the whole range on purpose, so the allocator can
  never recreate the 88% hyperscaler-AI-capex concentration the Exposure tab
  exists to surface, even at max risk.

  Leverage sleeve (off by default): an options overlay on the 1-2
  highest-conviction names already in the core allocation, sized as its own
  slice of capital from 0% to a hard 17.5% ceiling as the slider rises to
  100 — confirmed it never exceeds that ceiling and reads $0 at risk 0.
  Describes structure only ("moderately OTM call, ~2-4 months out, premium
  loss capped at N% of capital") with no invented strikes, premiums or
  greeks, and an explicit "check a live chain" disclosure, per the site's
  no-live-data convention. Rendered in a term-red-bordered panel, referencing
  the Exposure tab's July 2026 drawdown / `JULY_2026_DRAWDOWN` fund-failure
  story as the reason the sleeve has a ceiling at all.

  `Panel`/`Bar`, previously local to ExposurePanel.tsx, moved to
  [src/components/Panel.tsx](src/components/Panel.tsx) now that a second
  section uses them; the Exposure tab was re-verified in-browser after the
  move. `npm run build` and `npm run lint` both pass.

- **Allocator, second pass — three real defects fixed.** The first version was
  verified against its own brief and still had three things wrong. Found by
  running the sizing functions headless over the full slider (`jiti` against
  allocation.ts) instead of eyeballing two slider positions.

  1. **`note` was accepted as a buy rationale.** 40 of the 69 long names carry
     no `edge`, only a `note` — which positions.ts defines as a transcription
     caveat, *what the source did not say*. In practice most are bear cases
     ("option value, not a business", "the conglomerate discount is deserved",
     "GAAP-unprofitable, sub-scale") or bookkeeping ("market cap not stated").
     Printing one of those in a Rationale column beside a dollar amount states
     the reason *not* to own a name as the reason to own it. The sizeable
     universe is now `edge`-only: 29 names, and the tab says so. This is a
     deliberate departure from the original brief's "edge/note" wording, in
     favour of what that instruction was actually protecting against. It
     changes no current output — every note-only name is conviction ≤2 and was
     already ranked out — it removes a latent trap.
  2. **39% of capital sat in cash and the code called it discipline.** When a
     factor bucket hit its cap the excess was dropped, with a comment claiming
     redistribution "would just rebuild the concentration". That is wrong:
     redistributing into buckets that are *under* their cap lowers
     concentration. With four buckets at a 28% cap there is 112% of capacity,
     so full deployment was always feasible. Sizing is now a capped
     water-fill — a bucket that refuses capital passes it to buckets with
     headroom, never back into itself. Cash is 0.00% at every slider position
     and is now a genuine diagnostic (caps binding everywhere at once).
  3. **Positions sized at literally $0.** Ranking purely by conviction handed
     AI-capex 10 of 18 slots — 15 of the 29 sizeable names share that driver —
     and then split one capped budget across them, so the tail (ANET, AVGO,
     AXTI, COHR) appeared in the table at 0.0% with a rationale next to it.
     Two fixes: no factor may take more than a third of the name slots, and
     sizing is two-level (bucket budget first, then names within the bucket)
     so a crowded bucket splits evenly instead of the top names absorbing it.
     Side effect worth having: conservative now spans six factor buckets
     rather than four, and `ai-adoption` appears at all.

  Position count is the headline change Matthias asked for: **5 names at max
  risk was too concentrated to be useful**, now 11, with conservative at 18.
  Because count alone no longer distinguishes the ends of the slider, risk
  tolerance also drives a conviction tilt (1.0 to 2.0) and the per-name cap
  came down from 22.5% to 16% — at 11 names, 22.5% is 2.5x equal weight and
  would never bind, making it decoration rather than a control.

  Verification is now an invariant script rather than two screenshots: 5
  capital values x 101 slider positions x sleeve on/off = 1,010 allocations,
  asserting every ticker resolves to a real positions.ts row, every position
  is `long` with a non-empty rationale and non-zero dollars, no per-name or
  per-factor cap is ever breached, the slot limit holds, no duplicates, total
  never exceeds capital, and the sleeve stays inside its 17.5% ceiling and
  only ever draws from core names. All hold. Re-verified in-browser at risk 0
  and 100, Exposure tab re-checked after the shared-`Bar` change, `npm run
  build` and `npm run lint` pass.

- **Allocator rebuilt around the book's actual hypothesis.** Matthias asked why
  Robinhood kept sizing so large when it is not part of the thesis. It was, and
  the answer was structural rather than a tuning problem.

  **What the hypothesis is.** Stated in the repo, not inferred: AI
  infrastructure bought at the optical interconnect bottleneck.
  [research/photonics-tracker-research.md](research/photonics-tracker-research.md)
  §5 ("The macro thesis, and what breaks it") argues copper runs out of reach
  above 200G per lane as clusters grow past single racks; §4 ranks the chain,
  calling compound-semiconductor substrates "one level deeper, and currently
  the hardest constraint" (InP in structural shortage) and the laser/EML layer
  "the genuine bottleneck". The Exposure tab already states the rule that
  follows: substrate and component are what the thesis says to buy, system and
  demand-setter are beta. 15 of the 29 sizeable names sit in that one driver.

  **Why HOOD dominated — three compounding causes.** (1) Its `edge` field is
  not a mispricing claim. positions.ts defines `edge` as "filled only where a
  source makes an explicit 'the market is wrong' claim", but HOOD's records a
  cross-reference between two sections; its actual bear case (−27.3%, PFOF
  regulatory risk, Coinbase competition) sits in `note`. (2) Conviction 4,
  derived from risk tier A, which means *lower variance* — close to the
  opposite of conviction. (3) The decisive one: the per-factor cap punished
  the thesis. ai-capex held 15 names and hit its ~30% ceiling; risk-appetite
  held 3 and had room to spare, so an off-thesis name was sized above every
  bottleneck position. A cap meant as a risk control had become a penalty on
  the only theme researched in depth.

  **The rebuild.** Two sleeves instead of seven equal factor buckets. A thesis
  core (floor 55% rising to 75% with risk; lands at 60-75% after caps) weighted
  on conviction^tilt × a chain-layer multiplier — substrate 1.6, component 1.4,
  module 0.9, system 0.5. That multiplier is the point: conviction is derived
  from risk tier, so the volatile bottleneck names score *lower* than the
  steadier module makers, and weighting on conviction alone systematically
  underweights exactly what the research says to own. Plus a diversifier sleeve
  carrying a ceiling of 0.6x the core's per-name cap, so ballast can never
  outrank the thesis. `isBottleneck` is thesis-scoped: Harmonic Drive is a
  `component` in the robotics chain and Hesai in the lidar one, and counting
  either would credit the optical bottleneck with unrelated capital.

  **Leverage sleeve now draws only from thesis bottleneck names** (AXTI, ALAB
  and similar) rather than from the top of the derived conviction column, which
  used to surface two names with no chain position at all. Hard 17.5% ceiling
  unchanged.

  **The deliberate departure.** The original brief demanded a per-factor cap of
  25-35% at every slider position so the allocator could never recreate the
  Exposure tab's 88% concentration. This rebuild removes that cap on the thesis
  and keeps it only on diversifiers — Matthias's call, taken explicitly. The
  justification is the repo's own calibration case: `JULY_2026_DRAWDOWN` records
  a fund with this exact thesis that was *right* and was still force-liquidated
  by roughly 4x leverage. Concentration is what a research book is for; leverage
  is what kills it. So the tab expresses the concentration, states it in the
  headline rather than burying it, and caps the leverage instead.

  Invariant sweep extended to assert the complaint directly: across 5 capitals
  x 101 slider positions x sleeve on/off, no diversifier is ever the largest
  position (narrowest margin 1.22pp), the thesis core is never below 50% of
  capital, every sleeve leg is a thesis bottleneck name, and no per-name or
  diversifier-factor cap is breached. HOOD now runs 4.2% (conservative) to 8.0%
  (aggressive) against a top thesis position of 7.0% to 11.8%. `npm run build`
  and `npm run lint` pass; verified in-browser at both slider ends.

- **Red-team review worked through (2026-08-09).** External review of `ade41aa`
  produced 17 findings. Worked in the review's own blocks; three commits.

  **Block 1 — output safety.** (a) The per-name cap was not the real cap: the
  option sleeve was a separate slice of capital on the same tickers, so AXTI
  reached 11.8% equity + 9.3% premium = 21.1% against a stated 16%. The sleeve
  is now sized before the equity fill, its premium counts toward the same cap,
  and every downstream figure is computed on exposure rather than equity. (b)
  The footer claimed "unlevered by construction" while tab 2 allocated up to
  17.5% into OTM calls; it now follows the sleeve, and the sleeve panel states
  the modal outcome (total premium loss below the strike) beside the "capped
  at N%" framing. (c) "Conservative" was 100% invested with two thirds behind
  one driver — every control moved the same way as risk, so the slider had no
  low end. Added a reserve falling 40% → 0%, the only monotonic risk control
  in the model.

  **Block 2 — misleading numbers.** The stress illustration ran on the
  Exposure tab's market-cap shares, on a tab that says it has no position
  sizes, while the Allocator's real weights were never stressed; it now runs
  on those weights with the premium written off in full. It also stressed
  against `facts[0]`, which happened to be the SOX at −28.6%; the Morgan
  Stanley Momentum TMT index fell 53.5% over the same window and is the right
  regime for a concentrated momentum book, so the figure was understated by
  nearly half. At risk 100 with the sleeve on, a Momentum TMT repeat is −48.3%
  of capital. The 88% headline now leads with the count (26 of 69) and treats
  the cap-weighted version as secondary with coverage inline — the 22 names
  without a market cap are not missing at random, they sit in exactly the
  buckets that would lower the concentration. Vintage spread (29 days, with
  the July drawdown sitting between the two dates) is surfaced.

  **Block 3 — data model.** `architecturalBet` and `hedge` on `Position`,
  populated only where a source in this repo states the relationship. The book
  had been holding Marvell (owns the optical DSP market) and Semtech ("the
  direct short leg against Marvell's DSP TAM") at 7.1% each — the allocator now
  takes one side per fork and shows what it dropped. `THESIS_FACTOR` is a
  declared constant instead of a ticker count, since counting made research
  effort the thing that assigned two thirds of the capital; the derived
  majority is kept as a failing check. Tradability is derived from `exchange`
  and badged, because the largest position at risk 100 is a Shenzhen A-share.

  **Infrastructure.** PROGRESS.md had described a 1,010-allocation invariant
  sweep that was never committed. It now exists as
  [scripts/verify-allocation.ts](scripts/verify-allocation.ts), runs via
  `npm run verify`, and the deploy workflow runs verify and lint before build
  so a broken invariant blocks the deploy. 113,471 assertions. It earned itself
  immediately: adding the reserve shrank the invested pool and let the largest
  diversifier overtake the largest thesis position again, because the
  diversifier ceiling was a fixed fraction of the per-name cap and only correct
  for one combination of budgets and name counts. It is now bound to the
  largest position the thesis actually took.

  **Deliberately not done, and why.** Theme-weighted market cap
  (`themeRevenueShare`), valuation fields, and `edgeType`/`edgeFalsifier` all
  need sourced numbers or judgement calls per row — that is a data task and
  filling it from inference would break the rule the dataset is built on. A
  daily price series, realised correlations and a benchmark comparison need a
  data source this static, key-less site does not have; the review is right
  that it is the single largest upgrade available, and it is a prerequisite
  for measuring rather than asserting "how correlated is it". Those gaps are
  now stated on the tab instead of being implied.

## Two kinds of section

- **Native tracker** (Citrini): folder under `src/sections/<name>/` with a
  component + `data.ts` typed `TrackerEntry[]`. Copy the citrini folder to add
  another.
- **Embedded dashboard** (biology, robotics): drop a self-contained `.html`
  into `public/dashboards/`, render `<EmbeddedDashboard src="dashboards/x.html">`,
  and add one entry to the `sections` array + `navLabels` in App.tsx.

## Next

- Possible follow-ups: periodic re-check of Citrini's free output for new
  entries/status changes; a third tracker when Matthias picks one.

## Working agreements

- Checkpoint with Matthias after each phase; commit after each phase.
- Never fabricate quotes, dates, or tickers — "unknown" beats a plausible guess.
