# Investment Intelligence Dashboard

Personal dashboard of research trackers built exclusively from public sources.
Live at **https://snobistisch.github.io/investment-dashboard/**

The dashboard opens on a chooser: **Equities** or **Crypto**. They are split
because the hypotheses differ — equities here bet on a named industrial
bottleneck, crypto on float and fee capture against a bitcoin benchmark — and
because averaging a settlement layer with a photonics small cap in one factor
bucket answers neither question. Equities carries **Exposure** and its existing
**Allocator**. Crypto carries **Assets** and a separate **Pilot**
that starts from zero holdings and treats bitcoin as its benchmark. Routing is
`#<class>/<tab>`, and old flat links (`#crypto`, `#defense`, …) still resolve.

Sections:

- Equities **Exposure** and **Allocator** — factor
  concentration and the existing equities sizing model. They show live prices
  and USD returns per name, and state for every figure whether it came from a
  live quote or from the transcription in
  [src/data/positions.ts](src/data/positions.ts).
- Crypto **Pilot** — a zero-holdings decision tool that selects only assets whose
  subjective terminal scenario EV remains above BTC after a user-supplied
  round-trip cost buffer and a bull-to-bear probability stress. It produces
  indicative targets only after risk capital, venue/legal entity and freshness
  checks pass, and can freeze every input and target into a JSON snapshot.
- Equities: **Digital Biology**, **Robotics**, **Quantum**, **Agentic**,
  **Photonics** and **Defence**. Crypto: **Assets** and **VC Research**.
  Self-contained research dashboards, embedded from
  [public/dashboards/](public/dashboards/). Sourced notes live in
  [research/photonics-tracker-research.md](research/photonics-tracker-research.md),
  [research/defense-tracker-research.md](research/defense-tracker-research.md)
  and
  [research/crypto-tracker-research.md](research/crypto-tracker-research.md).

The Assets ranking is organised into seven themes, derived from the category
tags already on its 40 assets rather than chosen in advance: **Settlement**,
**Exchanges**, **DeFi & stablecoins**, **Middleware & oracles**,
**New layer ones**, **Privacy & Verifiable Compute** and **GPU & DePIN**. Four
further research files go deeper into specific themes than the ranked 40
does, and are **deliberately not wired into the ranking** — they are
screening and mapping work, not a ranked section, and a tab asserts a ranking
these do not yet carry:
[crypto-screen-candidates.md](research/crypto-screen-candidates.md) (a
fees-and-holders-revenue screen over 177 protocols, deepening DeFi),
[crypto-universe-map.md](research/crypto-universe-map.md) (107 tokens plus 22
pre-token projects, 40 of them on Base),
[crypto-hooks-mev-research.md](research/crypto-hooks-mev-research.md) (51
tokens across programmable AMMs and MEV infrastructure, deepening Exchanges)
and
[crypto-vc-research.md](research/crypto-vc-research.md) with its two full
fund profiles,
[crypto-vc-haun-ventures.md](research/crypto-vc-haun-ventures.md) and
[crypto-vc-paradigm.md](research/crypto-vc-paradigm.md) — the one file in
this group that now has a page:
**VC Research** (`crypto-vc.html`) presents both funds' complete round
histories, sourced from a self-scraped database of 5,868 funding rounds.
[crypto-research-index.md](research/crypto-research-index.md) maps every
crypto research file onto its theme and states which are ranked versus
notes-only.

**Defence** and **Crypto** rank their universes by an explicit three-scenario
expected value rather than by a composite score: the probabilities and returns
are published in the table and the ranking is computed from them in the page, so
a reader who disagrees with a number can recompute it. Both research notes carry
a corrections log against the brief they were built from. The Crypto section
additionally puts bitcoin in the ranking as the benchmark — in an asset class
that is one factor with forty tickers, the question is not whether an asset
has positive expected value but whether it beats simply holding BTC. Its note
also logs the corrections made to an earlier version of the tab itself, and
which protocol facts have been verified against a source rather than carried.

The idea-flow tracker that ran alongside the thematic sections was removed on
11 August 2026. Its 70 tickers came out of positions.ts with it, so the book is
now the six thematic sections only. The section and its sourcing notes remain in
git history; PROGRESS.md keeps the log of what it was and why it went.

Nothing here is investment advice.

## Working on this with an AI agent

[AGENTS.md](AGENTS.md) is the brief: what not to open, which rules are
load-bearing, and what looks like a bug but is not. Start any session with

```sh
npm run summary
```

which prints the state of the whole repository — counts, data vintages, cluster
statistics — in about fifty lines, generated from the files themselves. Five
files are half the tracked bytes here and reading one of them costs a large part
of a context window; the summary answers most opening questions without touching
them.

## Live market data

[scripts/fetch-market-data.ts](scripts/fetch-market-data.ts) fetches quotes,
market caps, FX and a year of price history, and writes
`public/data/market-data.json`, which
[.github/workflows/refresh-market-data.yml](.github/workflows/refresh-market-data.yml)
commits on a weekday schedule. No API key is involved: Yahoo Finance for
equities, CoinGecko's keyless tier for the tokens, the ECB for FX.

`positions.ts` is never written to by any of this. It stays a transcription
with per-section sourcing; live values are merged at read time and every row on
screen says which of the two it is showing. Run it locally with:

```sh
npm run fetch-market-data
```

Crypto Pilot has a separate reproducible pipeline. Scenario assumptions are
frozen once as terminal USD targets; current market prices then reprice the
implied returns without silently changing the thesis. Market, risk or price-
history data older than 48 hours blocks the order preview.

```sh
npm run fetch-crypto-market  # refresh 40 pinned CoinGecko assets
npm run fetch-risk-rating    # refresh one year of closes and measured risk
npm run build-portfolio      # rebuild screen, clusters and embedded pilot data
npm run verify               # includes freshness and provenance gates
```

The scheduled workflow in
[.github/workflows/refresh-crypto-data.yml](.github/workflows/refresh-crypto-data.yml)
runs that pipeline daily and deploys only after verify, lint and build pass.

## Stack

Vite + React + TypeScript + Tailwind CSS v4, deployed to GitHub Pages via
GitHub Actions on every push to `main`.

```sh
npm install
npm run dev     # local dev server
npm run build   # typecheck + production build
```

## Adding a section

Two patterns, depending on the content:

- **Native tracker**: a self-contained folder under `src/sections/<name>/`
  holding a component and a `data.ts` typed as `TrackerEntry[]`
  ([src/types.ts](src/types.ts)). No entry-list tracker currently ships — the
  live examples of the folder pattern are
  [src/sections/exposure/](src/sections/exposure/) and
  [src/sections/allocator/](src/sections/allocator/), which compute rather than
  list, so copy the folder shape from either and swap the body. Shared layout
  lives in [src/components/Section.tsx](src/components/Section.tsx).
- **Embedded dashboard** (like Digital Biology / Robotics): drop a
  self-contained `.html` file into `public/dashboards/` and render it with
  `<EmbeddedDashboard src="dashboards/your-file.html" />`.

Either way, register it by adding one entry to the `sections` array and
`navLabels` map in [src/App.tsx](src/App.tsx).
