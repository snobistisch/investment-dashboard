# Investment Intelligence Dashboard

Personal dashboard of research trackers built exclusively from public sources.
Live at **https://snobistisch.github.io/investment-dashboard/**

Sections:

- **Citrini Research Tracker** — a free, public-source-only tracker of
  investment themes and calls disclosed by Citrini Research (@Citrini7): the
  free Substack tier, public podcast pages, and public posts. The paid
  Citrindex product is not accessed or reconstructed. Research notes with
  per-entry sourcing live in
  [research/citrini-tracker-research.md](research/citrini-tracker-research.md).
- **Digital Biology** and **Robotics** — self-contained research dashboards,
  embedded from [public/dashboards/](public/dashboards/).

Not affiliated with Citrini Research. Nothing here is investment advice.

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
