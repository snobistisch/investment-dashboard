# Progress

Personal, open-sourceable dashboard for research trackers. First section: Citrini
Research Tracker (public-source-only alternative to the paid Citrindex).

Repo: https://github.com/snobistisch/investment-dashboard — live at
https://snobistisch.github.io/investment-dashboard/ (Pages via Actions,
deploys on every push to main).

## Done

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

## Next

- Possible follow-ups: periodic re-check of Citrini's free output for new
  entries/status changes; second tracker section when Matthias picks one.

## Working agreements

- Checkpoint with Matthias after each phase; commit after each phase.
- Never fabricate quotes, dates, or tickers — "unknown" beats a plausible guess.
