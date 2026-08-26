# Progress

Reverse-chronological record of the current public-equity product.

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
