// Allocation invariants. Run with `npm run verify`; the deploy workflow runs
// it before `build`, so a broken invariant blocks the deploy.
//
// These are the guarantees the Allocator's own on-screen copy makes. They were
// previously described in PROGRESS.md as a sweep that had been run, but the
// script was never committed — which meant the claim could not be re-checked,
// and at least one of the invariants (per-name cap, once the option sleeve was
// stacked on the same tickers) had quietly stopped holding.

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { positions as ALL } from '../src/data/positions'
import type { MarketSnapshot } from '../src/data/market-data'
import {
  buildAllocation,
  isBottleneck,
  sizeableUniverse,
  thesisUniverse,
  diversifierUniverse,
  THESIS_FACTOR,
  SLEEVE_CAP_AGGRESSIVE,
} from '../src/sections/allocator/allocation'

const TOL = 1e-9
const known = new Set(ALL.map((p) => p.ticker))
const failures: string[] = []
let checks = 0

// The snapshot is committed to the repo, so it is checked here rather than
// trusted at runtime. It is optional: a fresh clone that has never run the
// fetch still deploys, and the site falls back to transcribed values.
const SNAPSHOT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../public/data/market-data.json',
)
function readSnapshot(): MarketSnapshot | null {
  if (!existsSync(SNAPSHOT_PATH)) return null
  try {
    return JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as MarketSnapshot
  } catch (err) {
    // A truncated write or a bad merge leaves a file that is present and
    // unparseable. Blocking with the reason beats a stack trace.
    console.error(`FAILED: public/data/market-data.json does not parse — ${String(err)}`)
    process.exit(1)
  }
}
const snapshot = readSnapshot()

/** How stale the committed snapshot may be before the deploy is blocked.
 *  The refresh runs on weekdays; this allows a long weekend plus a public
 *  holiday before a silently failing refresh starts shipping old numbers as
 *  if they were current. */
const MAX_SNAPSHOT_AGE_DAYS = 10

function check(ok: boolean, msg: string) {
  checks++
  if (!ok) failures.push(msg)
}

const CAPITALS = [1, 500, 10_000, 100_000, 25_000_000]

let maxExposure = 0
let minReserveAtZero = Infinity
let maxThesis = 0
let minThesis = Infinity
let narrowestThesisMargin = Infinity

for (const capital of CAPITALS) {
  for (let risk = 0; risk <= 100; risk++) {
    for (const sleeveOn of [false, true]) {
      const r = buildAllocation(capital, risk, sleeveOn)
      const tag = `cap=${capital} risk=${risk} sleeve=${sleeveOn}`

      // --- provenance ----------------------------------------------------
      for (const p of r.positions) {
        check(known.has(p.position.ticker), `${tag}: ${p.position.ticker} not in positions.ts`)
        check(p.position.stance === 'long', `${tag}: ${p.position.ticker} is not long`)
        check(p.rationale.trim().length > 0, `${tag}: ${p.position.ticker} has no rationale`)
        check(p.dollars > 0, `${tag}: ${p.position.ticker} sized at zero dollars`)
      }
      const tickers = r.positions.map((p) => p.position.ticker)
      check(new Set(tickers).size === tickers.length, `${tag}: duplicate ticker`)

      // --- F-01: the per-name cap is enforced on TOTAL exposure ----------
      // Equity plus any option premium written on the same ticker. Sizing the
      // sleeve alongside the equity previously pushed AXTI to 21.1% of capital
      // against a stated 16% cap.
      for (const p of r.positions) {
        const exposure = (p.dollars + p.premiumUsd) / capital
        maxExposure = Math.max(maxExposure, exposure - r.perNameCapPct)
        check(
          exposure <= r.perNameCapPct + TOL,
          `${tag}: ${p.position.ticker} exposure ${(exposure * 100).toFixed(2)}% > cap ${(r.perNameCapPct * 100).toFixed(2)}%`,
        )
        check(
          Math.abs(p.exposureWeight - exposure) < 1e-9,
          `${tag}: ${p.position.ticker} exposureWeight disagrees with equity+premium`,
        )
      }

      // --- F-03: the conservative end actually holds something back ------
      if (risk === 0) {
        minReserveAtZero = Math.min(minReserveAtZero, r.reserveShare)
        check(r.reserveShare > 0, `${tag}: risk 0 leaves nothing in reserve`)
      }
      check(r.reserveShare >= -TOL, `${tag}: negative reserve`)
      check(
        r.investedShare + r.reserveShare <= 1 + 1e-6,
        `${tag}: invested + reserve exceeds capital`,
      )

      // --- sleeve --------------------------------------------------------
      if (r.sleeve) {
        check(
          r.sleeve.premiumUsd <= SLEEVE_CAP_AGGRESSIVE * capital + 1e-6,
          `${tag}: sleeve premium above its ceiling`,
        )
        const core = new Set(tickers)
        for (const leg of r.sleeve.legs) {
          check(core.has(leg.position.ticker), `${tag}: sleeve leg not held in the core`)
          check(
            isBottleneck(leg.position),
            `${tag}: sleeve leg ${leg.position.ticker} is not a thesis bottleneck name`,
          )
        }
        check(
          Math.abs(r.sleeve.legs.reduce((t, l) => t + l.premiumUsd, 0) - r.sleeve.premiumUsd) <
            1e-6,
          `${tag}: sleeve legs do not sum to the premium budget`,
        )
      }
      check(sleeveOn || r.sleeve === null, `${tag}: sleeve present while toggled off`)

      // --- thesis structure ----------------------------------------------
      const thesis = r.positions.filter((p) => p.sleeveName === 'thesis')
      const divs = r.positions.filter((p) => p.sleeveName === 'diversifier')
      for (const p of thesis) {
        check(
          p.position.factors[0] === THESIS_FACTOR,
          `${tag}: ${p.position.ticker} in thesis sleeve but not a thesis factor`,
        )
      }
      for (const p of divs) {
        check(
          p.position.factors[0] !== THESIS_FACTOR,
          `${tag}: ${p.position.ticker} in diversifier sleeve but is a thesis name`,
        )
      }
      minThesis = Math.min(minThesis, r.thesisActualShare)
      maxThesis = Math.max(maxThesis, r.thesisActualShare)

      // No off-thesis name may ever be the largest position in the book.
      if (thesis.length && divs.length) {
        const topThesis = Math.max(...thesis.map((p) => p.exposureWeight))
        const topDiv = Math.max(...divs.map((p) => p.exposureWeight))
        check(topDiv < topThesis - TOL, `${tag}: a diversifier is the largest position`)
        narrowestThesisMargin = Math.min(narrowestThesisMargin, topThesis - topDiv)
      }

      // --- F-04: never both sides of the same architectural fork ---------
      // Unless a source frames one leg as a deliberate hedge. Holding Marvell
      // (owns the optical DSP market) beside Semtech (LPO removes the DSP)
      // at equal weight cancels the idiosyncratic half of both theses and
      // leaves sector beta bought twice.
      const bySide = new Map<string, { side: string; ticker: string; w: number }[]>()
      for (const p of r.positions) {
        const bet = p.position.architecturalBet
        if (!bet || p.position.hedge) continue
        const list = bySide.get(bet.fork) ?? []
        list.push({ side: bet.side, ticker: p.position.ticker, w: p.exposureWeight })
        bySide.set(bet.fork, list)
      }
      for (const [fork, legs] of bySide) {
        const material = legs.filter((l) => l.w > 0.03)
        const sides = new Set(material.map((l) => l.side))
        check(
          sides.size <= 1,
          `${tag}: both sides of fork '${fork}' held above 3% — ${material
            .map((l) => `${l.ticker}(${l.side} ${(l.w * 100).toFixed(1)}%)`)
            .join(' vs ')}`,
        )
      }

      // --- totals ---------------------------------------------------------
      const deployed = r.positions.reduce((t, p) => t + p.dollars + p.premiumUsd, 0)
      check(deployed <= capital + 1e-6, `${tag}: deployed more than capital`)
    }
  }
}

// --- F-07: the derived thesis must match the declared one -----------------
const counts = new Map<string, number>()
for (const p of sizeableUniverse) counts.set(p.factors[0], (counts.get(p.factors[0]) ?? 0) + 1)
const derived = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]
check(
  derived === THESIS_FACTOR,
  `declared THESIS_FACTOR '${THESIS_FACTOR}' no longer matches the majority factor '${derived}' — ` +
    `re-read the research before changing the constant, this is a review trigger, not a bug to silence`,
)

// --- Market data snapshot -------------------------------------------------
// External data that has already been committed. The fetch script validates it
// at the boundary where it enters; this re-checks the file the deploy is about
// to ship, because between those two moments it is just a file in git that
// anything could have edited.
if (snapshot) {
  const unmappedTickers = new Set(snapshot.unmapped.map((u) => u.ticker))

  check(snapshot.schemaVersion === 1, `snapshot schemaVersion ${snapshot.schemaVersion}, expected 1`)

  // Age. A refresh that has been failing quietly for a fortnight would
  // otherwise ship two-week-old prices behind copy that calls them live.
  const ageMs = Date.now() - Date.parse(snapshot.fetchedAt)
  const ageDays = ageMs / 86_400_000
  check(!Number.isNaN(ageMs), `snapshot fetchedAt '${snapshot.fetchedAt}' does not parse`)
  check(
    ageDays <= MAX_SNAPSHOT_AGE_DAYS,
    `snapshot is ${ageDays.toFixed(1)} days old, above the ${MAX_SNAPSHOT_AGE_DAYS}-day bound — ` +
      `the refresh workflow has probably been failing. Re-run it rather than raising this bound.`,
  )

  // FX. Every rate a cap was divided by has to be a positive finite number, or
  // a converted cap is silently wrong rather than obviously missing.
  for (const [ccy, rate] of Object.entries(snapshot.fx.usdPer)) {
    check(
      Number.isFinite(rate) && rate > 0,
      `snapshot fx rate for ${ccy} is ${rate}, must be finite and positive`,
    )
  }
  check(snapshot.fx.usdPer.USD === 1, `snapshot fx USD rate is ${snapshot.fx.usdPer.USD}, must be 1`)

  for (const [ticker, q] of Object.entries(snapshot.quotes)) {
    // Provenance: a quote for a ticker the book does not contain means the map
    // and positions.ts have drifted apart.
    check(known.has(ticker), `snapshot quotes '${ticker}', which is not in positions.ts`)

    // Every live row traces to a named provider symbol. This is the check that
    // makes "traceable to a mapped symbol" enforceable rather than aspirational.
    check(
      typeof q.symbol === 'string' && q.symbol.length > 0,
      `snapshot ${ticker} carries no provider symbol`,
    )
    check(
      typeof q.providerName === 'string' && q.providerName.length > 0,
      `snapshot ${ticker} carries no provider name — a wrong mapping would be invisible`,
    )
    check(
      q.provider === 'yahoo' || q.provider === 'coingecko',
      `snapshot ${ticker} has unknown provider '${q.provider}'`,
    )
    check(
      !unmappedTickers.has(ticker),
      `snapshot ${ticker} is priced AND listed as unmapped — it cannot be both`,
    )

    // No NaN, no negatives. An absent cap is fine and expected (ETFs report net
    // assets, not market cap); a cap of NaN or -3 is not.
    check(
      Number.isFinite(q.priceLocal) && q.priceLocal > 0,
      `snapshot ${ticker} price is ${q.priceLocal}, must be finite and positive`,
    )
    if (q.marketCapUsd !== undefined) {
      check(
        Number.isFinite(q.marketCapUsd) && q.marketCapUsd > 0,
        `snapshot ${ticker} marketCapUsd is ${q.marketCapUsd}, must be finite and positive`,
      )
    }
    check(
      snapshot.fx.usdPer[q.currency] !== undefined,
      `snapshot ${ticker} is priced in ${q.currency}, which has no FX rate`,
    )
    check(
      /^\d{4}-\d{2}-\d{2}$/.test(q.asOf),
      `snapshot ${ticker} asOf '${q.asOf}' is not an ISO date`,
    )
    if (q.stats) {
      check(
        Number.isFinite(q.stats.realisedVolPct) && q.stats.realisedVolPct >= 0,
        `snapshot ${ticker} realisedVolPct is ${q.stats.realisedVolPct}`,
      )
      check(
        Number.isFinite(q.stats.maxDrawdownPct) && q.stats.maxDrawdownPct <= 0,
        `snapshot ${ticker} maxDrawdownPct is ${q.stats.maxDrawdownPct}, a drawdown cannot be positive`,
      )
    }
  }

  // Unmapped rows keep their transcribed values, so they must be real tickers.
  for (const u of snapshot.unmapped) {
    check(known.has(u.ticker), `snapshot lists unmapped '${u.ticker}', not in positions.ts`)
    check(u.reason.trim().length > 0, `snapshot unmapped '${u.ticker}' carries no reason`)
  }

  // The allocation must be identical with and without the snapshot: sizing is
  // driven by conviction and chain position, never by market cap. If this ever
  // fails, live data has started moving position sizes, which is a different
  // product from the one the copy describes.
  for (const capital of CAPITALS) {
    for (const risk of [0, 35, 100]) {
      for (const sleeveOn of [false, true]) {
        const plain = buildAllocation(capital, risk, sleeveOn)
        const live = buildAllocation(capital, risk, sleeveOn, snapshot)
        const tag = `cap=${capital} risk=${risk} sleeve=${sleeveOn}`
        check(
          plain.positions.length === live.positions.length,
          `${tag}: snapshot changed the number of sized positions`,
        )
        for (let i = 0; i < plain.positions.length; i++) {
          check(
            plain.positions[i].position.ticker === live.positions[i].position.ticker &&
              Math.abs(plain.positions[i].dollars - live.positions[i].dollars) < 1e-6,
            `${tag}: snapshot changed sizing for ${plain.positions[i].position.ticker}`,
          )
        }

        // Realised stress rows must be finite losses, not NaN dressed as a number.
        for (const s of live.stress) {
          check(
            Number.isFinite(s.totalLossUsd) && Number.isFinite(s.totalLossShare),
            `${tag}: stress '${s.label}' produced a non-finite loss`,
          )
          check(s.totalLossUsd <= 0, `${tag}: stress '${s.label}' is a gain, not a loss`)
          if (s.basis === 'realised') {
            check(
              (s.namesCovered ?? 0) > 0 && (s.namesCovered ?? 0) <= (s.namesTotal ?? 0),
              `${tag}: stress '${s.label}' reports ${s.namesCovered}/${s.namesTotal} names`,
            )
            // A long book cannot lose more than it holds.
            check(
              s.equityLossUsd >= -capital,
              `${tag}: stress '${s.label}' loses more than the capital`,
            )
          }
        }
      }
    }
  }
}

console.log(`universe: ${sizeableUniverse.length} sizeable = ${thesisUniverse.length} thesis + ${diversifierUniverse.length} diversifiers`)
console.log(`thesis factor: ${THESIS_FACTOR} (derived: ${derived})`)
console.log(`thesis exposure range: ${(minThesis * 100).toFixed(1)}% .. ${(maxThesis * 100).toFixed(1)}%`)
console.log(`reserve at risk 0: ${(minReserveAtZero * 100).toFixed(1)}%`)
console.log(`worst per-name cap overshoot: ${(maxExposure * 100).toFixed(6)}pp (must be <= 0)`)
console.log(`narrowest thesis-vs-diversifier margin: ${(narrowestThesisMargin * 100).toFixed(2)}pp`)
if (snapshot) {
  const priced = Object.keys(snapshot.quotes).length
  const withCap = Object.values(snapshot.quotes).filter((q) => q.marketCapUsd !== undefined).length
  const ageDays = (Date.now() - Date.parse(snapshot.fetchedAt)) / 86_400_000
  console.log(
    `snapshot: ${priced} priced, ${withCap} with cap, ${snapshot.unmapped.length} unmapped, ` +
      `${ageDays.toFixed(1)}d old (bound ${MAX_SNAPSHOT_AGE_DAYS}d)`,
  )
} else {
  console.log('snapshot: none committed — the site will render transcribed values only')
}

console.log(`\n${checks.toLocaleString()} assertions over ${CAPITALS.length} capitals x 101 risk values x 2 sleeve states`)

if (failures.length > 0) {
  console.error(`\nFAILED: ${failures.length}`)
  for (const f of failures.slice(0, 25)) console.error('  ' + f)
  if (failures.length > 25) console.error(`  ... and ${failures.length - 25} more`)
  process.exit(1)
}
console.log('ALL INVARIANTS HOLD')
