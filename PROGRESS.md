# Progress

Personal, open-sourceable dashboard for research trackers. First section: Citrini
Research Tracker (public-source-only alternative to the paid Citrindex).

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

## Next

- **Phase 1 — Research.** Build the Citrini entry list from public sources only
  (@Citrini7 on X, free Substack tier, podcasts/interviews). Every entry needs a
  checkable source URL; no source means the entry is dropped, not hedged.
  Deliver as a markdown table for review BEFORE writing any UI for it.
- **Phase 2 — Build** (only after the research table is approved): render the
  approved entries in `src/sections/citrini/data.ts` + the tracker component.

## Working agreements

- Checkpoint with Matthias after each phase; commit after each phase.
- Never fabricate quotes, dates, or tickers — "unknown" beats a plausible guess.
