# Investment Intelligence Dashboard

Personal public-equity research and decision-support dashboard built from public sources.

Live at **https://snobistisch.github.io/investment-dashboard/**.

## Product

The application opens directly on the equity research workflow:

- **Opportunities** rescans every researched long against declared market, volatility,
  drawdown, momentum, quote-freshness and 200-session-average gates. It then reprices
  versioned bear/base/bull models against the current quote. Passing the screen is a
  diligence priority, not an order signal.
- **Exposure** shows factor concentration, value-chain overlap, market data provenance,
  cross-name correlation and the dated stress anchor across the transcribed research book.
- **Plan** starts from the investor, a broad-market baseline and explicit evidence and
  execution gates. Individual stocks begin at 0%; unused active room returns to the baseline.
- **Digital Biology**, **Robotics**, **Quantum**, **Agentic**, **Photonics** and
  **Defence** are static research-only dashboards. Appearing in one does not make a
  security eligible for Plan.

Nothing here is investment advice. The application never submits an order.

## Research and methodology

- [Equity opportunity methodology](research/equity-opportunity-methodology.md)
- [Equity decision readiness](research/equity-decision-readiness.md)
- [Investment thesis](research/investment-thesis.md)
- [Photonics research](research/photonics-tracker-research.md)
- [Defence research](research/defense-tracker-research.md)
- [Robotics research](research/robotics-tracker-research.md)

`src/data/positions.ts` is transcription. Live market values are merged from the
committed snapshot at read time and never written back into that source file.

## Market data

`scripts/fetch-market-data.ts` fetches equity quotes, market caps, FX and daily price
history from Yahoo Finance and the ECB. It writes `public/data/market-data.json`.
The weekday workflow refreshes that snapshot and records one Opportunities repricing
row per date, ticker and model version in `public/data/equity-opportunity-history.json`.

```sh
npm run fetch-market-data
npm run build-opportunity-history
```

## Development

```sh
npm install
npm run summary
npm run verify
npm run lint
npm run build
npm run dev
```

The stack is Vite, React, TypeScript and Tailwind CSS v4. Pushes to `main` deploy
GitHub Pages after verification, lint and build succeed.

## Adding a section

Use a native component under `src/sections/` for computed product views. For a static
research page, add a self-contained HTML file under `public/dashboards/` and register
it in `src/App.tsx` through `EmbeddedDashboard`.
