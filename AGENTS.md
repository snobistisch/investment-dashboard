# AGENTS.md

Operating contract for every AI agent working in this repository.

**Run `npm run summary` before opening anything else.** It reports the current
repository state, data vintages, coverage, clusters and large-file warnings from
the files themselves. Do not copy those volatile facts into this document.

---

## 1. Session contract

1. Run `git status -sb`. Preserve user changes and keep unrelated work out of
   the diff.
2. Match the action to the request:
   - review, explain or diagnose: inspect and report; do not change files;
   - change, fix or build: implement the requested scope and finish it.
3. Read narrowly. Use `rg`, `jq` or a small Node expression before opening a
   generated data file or an embedded dashboard.
4. Before publishing a repository change, run:

   ```bash
   npm run verify && npm run lint && npm run build
   git diff --check
   ```

5. Work directly on `main`. Make one logical commit whose message explains the
   reason, then push `main` immediately. A push deploys GitHub Pages. Do not
   create a branch unless the owner explicitly changes this instruction.

If the work cannot safely be published, stop before the commit and state the
specific blocker.

---

## 2. What this repository is

A personal decision-support dashboard for public-market and crypto research.
The shell is Vite + React + TypeScript + Tailwind. It contains three computed
React views, **Exposure**, **Opportunities** and **Plan**, plus eight
self-contained research pages embedded as iframes.

The owner uses it for real allocation decisions and as a learning project. A
wrong number can become a wrong decision. Hidden assumptions prevent learning.

The product boundary matters:

- Research pages help discover and compare ideas. They are not evidence that an
  asset is ready to buy.
- Opportunities reprices versioned, authored equity scenarios against the
  current quote. It is a research-prioritisation layer, not an order signal.
  Missing canonical models fail closed and never inherit conviction or analyst
  targets as terminal values.
- Plan starts from the owner's actual holdings and a broad-market baseline. An
  active candidate must pass the evidence and execution gates shown in the UI.
- Crypto sizing stays in the separate Crypto Pilot and starts from zero
  holdings. Never route crypto through the equities Plan.
- Defense is a separate research-only universe. It does not silently enter the
  equities plan or risk budget.

---

## 3. Data and decision invariants

These are not style preferences.

- `src/data/positions.ts` is transcription. Copy only stated figures. Never
  derive, estimate, refresh or fill gaps there; live values merge elsewhere.
- Never invent market data. Missing is valid and must render as `Unknown`.
- Keep conclusions recomputable: publish inputs and formulas, not unexplained
  stored scores.
- Never tune a threshold to force an outcome. A changed conclusion is a finding.
- Equity opportunity probabilities and terminal assumptions change only in a
  visible, versioned research revision. A market refresh changes the ranking,
  not the authored thesis.
- Equity charts and the simple 200-session average are generated only from
  fetched daily closes. Fewer than 200 closes remains missing and fails the
  default technical gate; never backfill or approximate it.
- Put missing sources, stale data, unverified claims and model limits beside the
  decision they affect.
- Do not bypass freshness, minimum-ticket, existing-holdings or evidence gates.
- Crypto terminal USD targets stay frozen until an explicit thesis revision.
  Current prices may refresh without rewriting the thesis.
- Do not restore Poker EV or `f*`. They overstated the rigor of their inputs.
  Crypto shows scenario-implied EV versus BTC and keeps R separate.

---

## 4. Source map

| Path | Role and constraint |
| --- | --- |
| `src/data/positions.ts` | Source transcription. Never infer missing fields. |
| `src/data/market-data.ts` | Merges the committed market snapshot at read time. |
| `src/data/equity-opportunities.ts` | Versioned authored equity scenarios. Never refresh terminal assumptions with market prices. |
| `src/sections/exposure/` | Factor concentration and cross-theme exposure. |
| `src/sections/opportunities/model.ts` | Canonical opportunity schema and declared default hurdle/cost/freshness policy. |
| `src/sections/opportunities/opportunity.ts` | Price-aware valuation, max-entry and separate robustness calculations. |
| `src/sections/opportunities/universe-screen.ts` | Whole-universe mechanical eligibility filters. Passing is not valuation. |
| `src/sections/allocator/planning.ts` | Current Plan policy and baseline sizing. |
| `src/sections/allocator/benchmark.ts` | Broad-market benchmark inputs and validation. |
| `src/sections/allocator/active-selection.ts` | Evidence gates for active candidates. |
| `src/sections/allocator/execution.ts` | Concept-order construction and execution gates. |
| `src/sections/allocator/allocation.ts` | Legacy sizing model. It is still verified, but is not the current Plan route. Do not revive it without an explicit request. |
| `src/types.ts` | Shared taxonomy, including source status. |
| `scripts/verify-*.ts` | Executable policy and quantitative invariants. Read the relevant suite before changing a rule. |
| `scripts/fetch-*.ts` | Network-backed snapshot builders. Run only when current data is part of the task. |
| `scripts/build-opportunity-history.ts` | Records price-driven opportunity changes by date, ticker and model version. It does not revise research. |
| `scripts/build-portfolio.ts` | Builds portfolio statistics and patches its owned dashboard block. |
| `public/dashboards/` | Eight static research pages, each with its own stylesheet. |
| `public/data/` | Generated and committed artefacts. Never hand-edit. |
| `research/` | Claims, sources, caveats and audit record. Prose, not runtime data. |
| `PROGRESS.md` | Reverse-chronological history. Add at the top; never rewrite old entries. |

`isDirectlyTradable` is currently shared from the legacy allocation module. That
small dependency does not make the legacy sizing model the active UI path.

Read `research/equity-opportunity-methodology.md` before changing an opportunity
formula, policy, model or status. An `edge` in `positions.ts` is thesis prose;
it is never a substitute for a canonical opportunity model.

---

## 5. Efficient inspection

Do not read large generated files whole. `npm run summary` reports which files
are currently expensive to open.

| Need | Use |
| --- | --- |
| One crypto history series | `jq` or a Node expression against `public/data/crypto-history.json` |
| One equity quote | `jq '.quotes["SYMBOL"]' public/data/market-data.json` |
| One equity chart + 200MA | `jq '.equityCharts["SYMBOL"]' public/data/market-data.json` |
| One authored equity model | `rg -n "ticker: 'SYMBOL'" src/data/equity-opportunities.ts` |
| One crypto market row | `jq '.rows[] | select(.ticker=="ETH")' public/data/crypto-market.json` |
| One frozen crypto scenario | `jq '.rows[] | select(.ticker=="ETH")' public/data/crypto-scenarios.json` |
| One risk row | `jq '.rows[] | select(.ticker=="NOCK")' public/data/risk-rating.json` |
| Portfolio clusters | `jq -r '.clusters[] | "\(.id) \(.label) \(.members|join(","))"' public/data/portfolio.json` |
| Dashboard logic or copy | `rg -n "exact phrase|functionName" public/dashboards/<name>.html` |
| Generated dashboard blocks | `rg -n "(CRYPTO-MARKET|RISK-MEASURED|PORTFOLIO-DATA)-(START|END)" public/dashboards` |

Read `src/` files whole when relevant; they are small. Read research notes when
the task concerns what the repository claims. Do not read them merely to learn
how a function works.

---

## 6. Commands

Core checks:

```bash
npm install                 # only when dependencies are absent or changed
npm run summary             # current repository and data state
npm run verify              # planning, opportunity, selection, execution, legacy allocation and quant invariants
npm run lint                # oxlint
npm run build               # tsc -b && vite build
npm run dev                 # local server
```

Generated-data commands:

```bash
npm run fetch-market-data   # Yahoo + CoinGecko + ECB equity/FX snapshot
npm run fetch-crypto-market # one CoinGecko call for the pinned crypto universe
npm run fetch-risk-rating   # slow network refresh of risk data and history
npm run rebuild-risk-rating # recompute R from committed closes; no network
npm run build-portfolio     # recompute portfolio statistics; no market fetch
npm run freeze-crypto-scenarios -- --as-of YYYY-MM-DD
                            # thesis migration; refuses overwrite unless --force
```

Generated output is committed. Do not run network refreshes as routine cleanup:
they can create large, unrelated market-data diffs.

---

## 7. Generated and protected content

Never hand-edit `public/data/*.json` or content between generated markers.
Ownership is:

- `CRYPTO-MARKET-START/END` → `scripts/fetch-crypto-market.ts`
- `RISK-MEASURED-START/END` → `scripts/fetch-risk-rating.ts`
- `PORTFOLIO-DATA-START/END` → `scripts/build-portfolio.ts`

Rerun the owning script when a generated block must change.

Do not casually change the decision engines, thresholds or verification suites.
When a requested product change requires one, update the relevant invariant in
the same commit and explain the policy change in the commit message.

Keep the prose direct. State what is known, what is assumed and what is absent.
Avoid filler, puffery and conclusions stronger than the sources.

---

## 8. Known and deliberate

- The stylesheet is duplicated across the eight embedded dashboards. Extracting
  it is separate design-system work, not incidental cleanup.
- Embedded dashboards are static snapshots. They do not fetch in the reader's
  browser. The Crypto Pilot blocks indicative orders when its committed market
  snapshot is older than 48 hours.
- Section counts in `positions.ts` can differ from transcribed-row counts because
  one ticker may carry several section tags. Verification checks both.
- Historical `Citrini` references remain in `PROGRESS.md` after that section's
  removal. They are history, not live product content.
