# Investment Intelligence Dashboard

Personal dashboard of research trackers built exclusively from public sources.
Live at **https://snobistisch.github.io/investment-dashboard/**

Sections:

- **Exposure** and **Allocator** — the two views that read across the research
  sections: factor concentration over the whole book, and a risk-scaled
  allocation built on it. Both show live prices and USD returns per name, and
  state for every figure whether it came from a live quote or from the
  transcription in [src/data/positions.ts](src/data/positions.ts).
- **Digital Biology**, **Robotics**, **Quantum**, **Agentic**, **Crypto**,
  **Photonics** and **Defence** — self-contained research dashboards, embedded
  from [public/dashboards/](public/dashboards/). Sourced notes live in
  [research/photonics-tracker-research.md](research/photonics-tracker-research.md)
  and
  [research/defense-tracker-research.md](research/defense-tracker-research.md).

The Defence section ranks its 53 names by an explicit three-scenario expected
value rather than by a composite score: the probabilities and returns are
published in the table and the ranking is computed from them in the page, so a
reader who disagrees with a number can recompute it. Its research note carries a
corrections log against the brief it was built from.

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
