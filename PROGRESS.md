# Progress

Personal, open-sourceable dashboard for research trackers. Three sections so
far: Citrini Research Tracker (native React), plus Digital Biology and Robotics
(pre-built standalone dashboards, embedded).

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
