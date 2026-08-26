# Investment Research Dashboard

A personal public-equity dashboard for research, comparison and allocation decisions.

Live at **https://snobistisch.github.io/investment-dashboard/**.

## Product

The application follows the order in which the decisions should be made:

- **Opportunities** first tests each researched long for market size, volatility, drawdown,
  momentum, quote freshness and position versus its 200-session average. It then reprices
  the versioned bear, base and bull scenarios at the current quote. A passing result earns
  further diligence; it is not an order signal.
- **Exposure** shows which theme labels depend on the same economic drivers. It also keeps
  market-data coverage, value-chain overlap, correlation and the dated stress reference
  beside the concentration figures they qualify.
- **Plan** begins with the investor's goal, horizon and loss limit, then specifies a
  broad-market baseline. Individual stocks start at 0%; any unused active budget returns
  to that baseline.
- **Digital Biology**, **Robotics**, **Quantum**, **Agentic**, **Photonics** and
  **Defence** are static research-only dashboards. Appearing in one does not make a
  security eligible for Plan.

Nothing here is investment advice, and the application cannot submit an order.

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

`scripts/fetch-market-data.ts` retrieves equity quotes, market caps, FX and daily closes
from Yahoo Finance and the ECB, then writes `public/data/market-data.json`. The weekday
workflow refreshes the snapshot and records one Opportunities valuation per date, ticker
and model version in `public/data/equity-opportunity-history.json`.

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

The stack is Vite, React, TypeScript and Tailwind CSS v4. A push to `main` deploys
GitHub Pages only after verification, lint and build pass.

## Adding a section

Use a native component under `src/sections/` for computed product views. For a static
research page, add a self-contained HTML file under `public/dashboards/` and register
it in `src/App.tsx` through `EmbeddedDashboard`.
