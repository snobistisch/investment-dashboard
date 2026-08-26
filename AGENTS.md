# AGENTS.md

Operating contract for every AI agent working in this repository.

**Run `npm run summary` before opening anything else.** It reports the current
repository state, data vintage, coverage and large-file warnings from the files.

## 1. Session contract

1. Run `git status -sb`. Preserve user changes and keep unrelated work out of the diff.
2. Match the action to the request: inspect-only requests do not authorize edits;
   change requests should be implemented and verified completely.
3. Read narrowly. Use `rg`, `jq` or a small Node expression before opening generated data.
4. Before publishing, run:

   ```bash
   npm run verify && npm run lint && npm run build
   git diff --check
   ```

5. Work directly on `main`. Make one logical commit explaining the reason and push
   `main` immediately. A push deploys GitHub Pages. Do not create a branch unless the
   owner explicitly requests one.

If the work cannot safely be published, stop before the commit and name the blocker.

## 2. Product boundary

This is a personal public-equity decision-support dashboard. The shell is Vite,
React, TypeScript and Tailwind. It contains three computed views—Exposure,
Opportunities and Plan—plus six self-contained research pages embedded as iframes.

- Research pages discover and compare ideas; they are not evidence that an asset is ready to buy.
- Opportunities reprices versioned authored scenarios against the current quote. Missing
  canonical models fail closed and never inherit conviction or analyst targets as terminal values.
- Plan starts from the owner's actual inputs and a broad-market baseline. An active
  candidate must pass the evidence and execution gates shown in the UI.
- Defence remains a separate research-only universe and does not silently enter Plan.

## 3. Data and decision invariants

- `src/data/positions.ts` is transcription. Copy only stated figures; never estimate or refresh it.
- Never invent market data. Missing is valid and renders as `Unknown`.
- Publish inputs and formulas, not unexplained stored scores.
- Never tune a threshold to force an outcome. A changed conclusion is a finding.
- Opportunity probabilities and terminal assumptions change only in a visible,
  versioned research revision. Market refreshes change rankings, not authored theses.
- Equity charts and the simple 200-session average use fetched daily closes only.
  Fewer than 200 closes stays missing and fails the default technical gate.
- Put missing sources, stale data, unverified claims and model limits beside the decision affected.
- Do not bypass freshness, minimum-ticket, existing-holdings or evidence gates.
- Do not restore the legacy sizing model without an explicit request.

Read `research/equity-opportunity-methodology.md` before changing any opportunity
formula, policy, model or status. An `edge` in `positions.ts` is thesis prose, never
a substitute for a canonical opportunity model. The 200MA entry zone is a timing
label and ordering rule only.

## 4. Source map

| Path | Role and constraint |
| --- | --- |
| `src/data/positions.ts` | Source transcription; never infer missing fields. |
| `src/data/market-data.ts` | Merges the committed market snapshot at read time. |
| `src/data/equity-opportunities.ts` | Versioned authored equity scenarios. |
| `src/sections/exposure/` | Factor concentration and cross-theme exposure. |
| `src/sections/opportunities/model.ts` | Canonical schema and default policy. |
| `src/sections/opportunities/opportunity.ts` | Price-aware valuation and robustness. |
| `src/sections/opportunities/universe-screen.ts` | Mechanical eligibility filters. |
| `src/sections/allocator/planning.ts` | Current Plan policy and baseline sizing. |
| `src/sections/allocator/benchmark.ts` | Broad-market benchmark validation. |
| `src/sections/allocator/active-selection.ts` | Evidence gates for active candidates. |
| `src/sections/allocator/execution.ts` | Concept-order construction and execution gates. |
| `src/sections/allocator/allocation.ts` | Verified legacy sizing model, not the current route. |
| `scripts/verify-*.ts` | Executable policy and quantitative invariants. |
| `scripts/fetch-market-data.ts` | Network-backed equity and FX snapshot builder. |
| `scripts/build-opportunity-history.ts` | Records price-driven opportunity changes. |
| `public/data/` | Generated and committed artifacts; never hand-edit. |
| `public/dashboards/` | Static research pages with independent stylesheets. |
| `research/` | Claims, sources, caveats and audit record. |
| `PROGRESS.md` | Reverse-chronological current project history. |

## 5. Efficient inspection

- One quote: `jq '.quotes["SYMBOL"]' public/data/market-data.json`
- One chart: `jq '.equityCharts["SYMBOL"]' public/data/market-data.json`
- One model: `rg -n "ticker: 'SYMBOL'" src/data/equity-opportunities.ts`
- Dashboard copy: `rg -n "phrase|functionName" public/dashboards/<name>.html`

Read relevant `src/` files whole; they are small. Do not read generated data whole.

## 6. Commands

```bash
npm run summary
npm run verify
npm run lint
npm run build
npm run dev
npm run fetch-market-data
npm run build-opportunity-history
```

Generated output is committed. Do not run network refreshes as routine cleanup.

## 7. Generated content

Never hand-edit `public/data/*.json`. Rerun the owning script when generated data
must change. Do not casually change decision engines, thresholds or verification
suites; update the relevant invariant and explain the policy change in the commit.

Keep prose direct. State what is known, assumed and absent. Avoid conclusions
stronger than the sources.
