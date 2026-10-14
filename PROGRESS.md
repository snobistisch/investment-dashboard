# Progress

Reverse-chronological record of the current public-equity product.

## 2026-10-14 — Added a json signal feed for monitoring agents

- `npm run -s signals` emits the dashboard's own Opportunities result per modelled long
  (state, screen blockers, max entry, hurdle edge, 200MA zone, thesis and falsifier), so
  an external agent alerts on the engine's output instead of a reimplementation.
- `--live` adds a labelled what-if at the provider's current price. Only price and 200MA
  distance move; risk statistics stay at the snapshot's completed sessions.

## 2026-10-14 — Repaired the market-data pipeline

- Every refresh deploy since 2026-09-17 failed in `verify-opportunity.ts`: it required
  more than five qualified names and at least one 200MA entry setup on the live
  snapshot. The market moved to three qualified names with none in the entry zone.
  Those were assertions about the market, not the engine. The decision-logic suites
  (opportunity, active selection, execution) now run on a frozen 2026-09-16 snapshot
  in `scripts/fixtures/`; live data keeps its shape, provenance, chart and freshness
  checks.
- The live site reads the committed snapshot from raw.githubusercontent, so the
  refresh workflow now runs `npm run verify` before committing instead of after.
- Scheduled runs start 00:15–06:15 UTC, after Tokyo and Hong Kong open, so snapshots
  mixed US closes with Asian intraday prices. The fetch script now drops any session
  still trading (from Yahoo's own trading period) and reports each venue's last
  completed close, with the market cap restated at that close.
- The fetch script refuses to write when fewer than 90% of mapped symbols return a
  price and history.
- GitHub Actions moved to Node 24 releases; `npm audit fix` cleared three
  build-tool advisories; an identity-only route map was removed.
- Not changed: all six research pages are past their staleness bound and the
  opportunity models are due for review on 2026-10-28. Both need new research,
  not code.

## 2026-08-26 — Narrowed the repository to public equities

- The application now opens directly on Opportunities and exposes only the equity
  research, Exposure and Plan routes.
- The discontinued asset-class product, its generated inputs, refresh workflow and
  research implementation were removed after a lossless external archive was verified.
- Three public-company rows left the transcribed universe because their recorded cases
  were primarily tied to the discontinued product. MQ remains on its independently
  stated card-infrastructure thesis.
- Shared market fetching, provenance, allocation, opportunity and exposure code is now
  equity-only.

## Current operating state

- Opportunities reprices versioned authored scenarios without changing terminal assumptions.
- Plan starts from a broad-market baseline and requires explicit evidence and execution gates.
- Exposure uses the committed equity/FX snapshot and keeps missing values visible.
- Defence remains research-only and separate from Plan.

## Working agreements

- Run `npm run summary` first.
- Preserve transcription and generated-data ownership boundaries.
- Before publishing run `npm run verify && npm run lint && npm run build` and
  `git diff --check`.
- Work directly on `main`, make one logical commit and push after all checks pass.
