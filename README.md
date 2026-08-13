# Investment Intelligence Dashboard

Personal dashboard of research trackers built exclusively from public sources.
Live at **https://snobistisch.github.io/investment-dashboard/**

The dashboard opens on a chooser: **Equities** or **Crypto**. They are split
because the hypotheses differ — equities here bet on a named industrial
bottleneck, crypto on float and fee capture against a bitcoin benchmark — and
because averaging a $228bn settlement layer with a photonics small cap in one
factor bucket answers neither question. Each side carries its own **Exposure**
and **Allocator**; the sizing model still solves the whole book in one pass, so
what splits is the view, not the arithmetic. Routing is `#<class>/<tab>`, and the
old flat links (`#crypto`, `#defense`, …) still resolve.

Sections:

- **Exposure** and **Allocator**, once per asset class — factor concentration
  over that half of the book, and a risk-scaled allocation built on it. Both show
  live prices and USD returns per name, and state for every figure whether it
  came from a live quote or from the transcription in
  [src/data/positions.ts](src/data/positions.ts).
- Equities: **Digital Biology**, **Robotics**, **Quantum**, **Agentic**,
  **Photonics** and **Defence**. Crypto: **Assets**. Self-contained research
  dashboards, embedded from [public/dashboards/](public/dashboards/). Sourced
  notes live in
  [research/photonics-tracker-research.md](research/photonics-tracker-research.md),
  [research/defense-tracker-research.md](research/defense-tracker-research.md)
  and
  [research/crypto-tracker-research.md](research/crypto-tracker-research.md).

Three further crypto research notes sit alongside those and are **deliberately
not wired into any tab** — they are screening and mapping work, not a ranked
section:
[crypto-screen-candidates.md](research/crypto-screen-candidates.md) (a
fees-and-holders-revenue screen over 177 protocols),
[crypto-universe-map.md](research/crypto-universe-map.md) (107 tokens plus 22
pre-token projects, 40 of them on Base) and
[crypto-hooks-mev-research.md](research/crypto-hooks-mev-research.md) (51 tokens
across programmable AMMs and MEV infrastructure). A Base deep dive is the
outstanding second half of that last one.

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

The Citrini Research tracker was removed on 11 August 2026. Its 70 idea-flow
tickers came out of positions.ts with it, so the book is now the six thematic
sections only. The section and its sourcing notes remain in git history.

Nothing here is investment advice.

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

- **Native tracker** (like Citrini): a self-contained folder under
  `src/sections/<name>/` with a component and a `data.ts` typed as
  `TrackerEntry[]` ([src/types.ts](src/types.ts)). Copy `src/sections/citrini/`,
  point it at its own data. Shared layout lives in
  [src/components/Section.tsx](src/components/Section.tsx).
- **Embedded dashboard** (like Digital Biology / Robotics): drop a
  self-contained `.html` file into `public/dashboards/` and render it with
  `<EmbeddedDashboard src="dashboards/your-file.html" />`.

Either way, register it by adding one entry to the `sections` array and
`navLabels` map in [src/App.tsx](src/App.tsx).
