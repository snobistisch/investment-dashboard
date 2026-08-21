# AGENTS.md

Instructions for any AI agent working in this repository. Read this before
opening anything else.

**Run `npm run summary` first.** It prints the state of the whole repository —
counts, data vintages, cluster statistics, which files are dangerous to open —
in about fifty lines, generated from the files themselves so it cannot drift.
Most questions asked at the start of a session are answered there without
opening a single data file.

---

## 1. What this is

A personal research dashboard for public-market and crypto research, deployed
to GitHub Pages on every push to `main`. Vite + React + TypeScript + Tailwind
for the shell, with eight self-contained HTML dashboards embedded in iframes.

Two computed React tabs (the equities-only Exposure and Allocator) and eight static
research pages. Crypto sizing lives in the embedded Pilot and starts from zero
holdings.
The owner uses it for real allocation decisions **and** as a learning project,
so a wrong number is a wrong decision and a hidden assumption is a lesson that
did not happen.

---

## 2. Do not read these files whole

The repository is about 2 MB of tracked text across 63 files. Five files are
half of it, and reading one of them costs a large part of a context window for
numbers no agent can verify by eye.

| File | Size | Instead |
| --- | ---: | --- |
| `public/data/crypto-history.json` | 375 KB | `node -e` or `jq`. It is one year of daily closes for 40 assets. |
| `public/dashboards/crypto.html` | 173 KB | `grep -n` for the block you need. Formula 1 is near line 1290, formula 2 near 1340. |
| `public/dashboards/defense.html` | 114 KB | `grep -n`. |
| `public/data/portfolio.json` | 40 KB | `npm run summary`, or `jq` for a specific row. Contains a 39×39 matrix. |
| `public/data/market-data.json` | ~275 KB | `npm run summary`, or `jq '.quotes.ETH'`. Includes a compact pair-correlation matrix; do not read whole. |
| `public/data/crypto-market.json` | generated | `npm run summary`, or `jq '.rows[] | select(.ticker=="ETH")'`. Current prices and market fields for all 40 assets. |
| `public/data/crypto-scenarios.json` | generated | `jq '.rows[] | select(.ticker=="ETH")'`. Immutable scenario probabilities and terminal USD targets. |

Every dashboard in `public/dashboards/` carries the same ~19 KB stylesheet,
copied. That duplication is known and deliberate for now — see §7 — so do not
read a second dashboard to learn the design system. Read one.

Useful one-liners:

```bash
npm run summary                                    # start here, always
jq '.rows[] | select(.ticker=="NOCK")' public/data/risk-rating.json
jq -r '.clusters[] | "\(.id) \(.label) \(.members|join(","))"' public/data/portfolio.json
grep -n "formula 1: the risk rating" public/dashboards/crypto.html
```

---

## 3. Commands

```bash
npm install
npm run summary            # repo state in ~50 lines — cheap, run it first
npm run verify             # allocation + quantitative invariants. BLOCKS THE DEPLOY.
npm run lint               # oxlint
npm run build              # tsc -b && vite build
npm run dev                # local server
```

Build-time data scripts. Their output is committed, so **you do not need to
run them to review or to make most changes**:

```bash
npm run fetch-market-data  # Yahoo + CoinGecko + ECB, rewrites market-data.json
npm run fetch-crypto-market # One CoinGecko market call for all 40 pinned assets.
npm run freeze-crypto-scenarios -- --as-of YYYY-MM-DD
                           # One-time migration only: fixes terminal USD targets.
                           # Refuses to overwrite; --force means thesis revision.
npm run fetch-risk-rating  # CoinGecko, ~10 minutes (keyless rate limits).
                           # Rewrites risk-rating.json and crypto-history.json,
                           # and patches a generated block into crypto.html.
npm run rebuild-risk-rating # Recomputes R from committed closes, no network.
npm run build-portfolio    # seconds. Reads the history, writes portfolio.json,
                           # patches a generated block into portfolio.html.
```

`npm run verify && npm run lint && npm run build` must be green before every
commit. If a change breaks an invariant, change the invariant too and say why
in the commit message.

---

## 4. Where things are

```
src/
  data/positions.ts          the book. TRANSCRIPTION, NOT RESEARCH — see §5.
  data/market-data.ts        merges the live snapshot at read time
  sections/exposure/         factor concentration, cross-theme map
  sections/allocator/        position sizing. allocation.ts is load-bearing.
  types.ts                   the status taxonomy (confirmed/hypothesis/watchlist/stale)
scripts/
  verify-allocation.ts       the invariant suite. Read this to learn the rules.
  fetch-market-data.ts       pinned ticker map, FX, returns, drawdowns
  crypto-config.ts           the single pinned CoinGecko-id map
  fetch-crypto-market.ts     current crypto price, cap, FDV, float and volume
  freeze-crypto-scenarios.ts one-time conversion to fixed terminal USD targets
  fetch-risk-rating.ts       realised vol + drawdown from daily closes
  build-portfolio.ts         active statistics, correlation, clustering
  summary.ts                 the cheap status report
public/dashboards/           eight self-contained pages, each with its own <style>
public/data/                 generated artefacts — do not hand-edit
research/                    the written record. Prose, not data.
PROGRESS.md                  a log in reverse date order. History, not instructions.
```

Generated blocks inside HTML are marked, for example
`/* RISK-MEASURED-START ... */`. **Never hand-edit between those markers** —
rerun the script that owns them.

---

## 5. House rules, and they are not style preferences

**`positions.ts` is transcription, not research.** Every figure in it was copied
out of a source and nothing was re-derived, re-estimated or refreshed. Where a
source does not state a number, the field is absent — never guessed. Live values
are merged at read time and never written back. If you find yourself wanting to
fill a gap in that file, you are about to break the rule the whole dataset rests
on.

**Never invent market data.** No plausible-looking figure, ever. Missing is a
valid state and every table in this repo already renders it. "Unknown" beats a
number that looks right.

**Every figure must be recomputable by a reader.** The dashboards compute their
own rankings in the page from published inputs rather than shipping a
precomputed score, on purpose: a reader who disagrees with a probability can
recompute the ranking. Do not replace a shown calculation with a stored result.

**Do not tune a threshold to reach a desired outcome.** If a correction changes
a conclusion, that is the finding. Report it.

**Say what is not known.** Sourcing caveats, unverified claims and absent data
are stated on the page, not filed in a footnote. This repository is more useful
for being honest about its limits than it would be for looking finished.

---

## 6. Do not touch without being asked

- **`src/sections/allocator/allocation.ts`.** It remains the load-bearing
  equities sizing engine and `verify` exhaustively checks it. Crypto
  no longer routes to this allocator; do not mix the pilot back into it.
- **`public/data/*.json`** by hand. They are generated; rerun the script.
- **`PROGRESS.md` history entries.** It is a log. Add at the top, do not rewrite
  what an older entry said was true at the time.
- **The prose voice.** Direct, short sentences, no filler, states what it does
  not know. Do not smooth it into consultant English. The owner's full style
  agreement lives outside this repo, but the rule that matters here is: no
  puffery, no rule-of-three, no "it's not just X, it's Y", no summary paragraph
  that restates what was just said.

---

## 7. Known and deliberate

Things that look like bugs and are not. Do not "fix" these without asking.

- **~19 KB of CSS is duplicated across eight dashboards.** Extracting it changes
  every page at once, which is a bad thing to do in the same pass as content
  work. Recorded in `PROGRESS.md` under "Next" as a real debt, not an oversight.
- **The embedded dashboards are static snapshots.** They do not fetch data in a
  reader's browser. Generated inputs are refreshed before deployment. The Crypto
  Pilot blocks indicative orders when its committed market snapshot exceeds 48
  hours; its scenario targets remain frozen until an explicit thesis revision.
- **Poker EV and `f*` are retired.** They were removed after quantitative review:
  the first was an uncalibrated downside penalty presented as expected value,
  and the second was not Kelly. The Assets tab shows scenario-implied EV versus
  BTC and keeps R as a separate warning. Do not restore either retired formula.
- **Section header counts in `positions.ts` state two numbers** ("14 tagged
  'biology', 13 transcribed here") because a ticker can carry several section
  tags while being transcribed once. `verify` checks both.
- **`grep -i citrini` returns hits in `PROGRESS.md`.** Historical log entries
  for a section removed on 11 Aug 2026. Deliberate.

---

## 8. Commits

One logical change per commit. The message explains *why*, not what — the diff
already says what. Existing messages are prose, several paragraphs, and name
what was caught before shipping and what was deliberately left undone. Match
that.

Verify before committing:

```bash
npm run verify && npm run lint && npm run build
```

Pushing to `main` deploys to GitHub Pages. **Owner instruction, 21 Aug 2026:**
work directly on `main`. After each logical change, run the full verification,
commit it and push `main` immediately. Do not create or leave feature branches
unless the owner explicitly changes this instruction. If publication is
uncertain, stop and ask rather than creating a branch.

---

## 9. Efficient session shape

1. `npm run summary` — the state, cheap.
2. `grep -n` to find the block you need. Do not open a 173 KB page to read one
   function.
3. Read the specific file or line range. `src/` files are small and worth
   reading whole; `public/dashboards/` files are not.
4. Change, then `npm run verify && npm run lint && npm run build`.
5. Commit with the reasoning in the message.

The research notes in `research/` are prose and are worth reading when the task
is about *what the repository claims*. They are not worth reading when the task
is about *how the code works*.
