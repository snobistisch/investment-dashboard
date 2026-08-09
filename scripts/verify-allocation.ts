// Allocation invariants. Run with `npm run verify`; the deploy workflow runs
// it before `build`, so a broken invariant blocks the deploy.
//
// These are the guarantees the Allocator's own on-screen copy makes. They were
// previously described in PROGRESS.md as a sweep that had been run, but the
// script was never committed — which meant the claim could not be re-checked,
// and at least one of the invariants (per-name cap, once the option sleeve was
// stacked on the same tickers) had quietly stopped holding.

import { positions as ALL } from '../src/data/positions'
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

console.log(`universe: ${sizeableUniverse.length} sizeable = ${thesisUniverse.length} thesis + ${diversifierUniverse.length} diversifiers`)
console.log(`thesis factor: ${THESIS_FACTOR} (derived: ${derived})`)
console.log(`thesis exposure range: ${(minThesis * 100).toFixed(1)}% .. ${(maxThesis * 100).toFixed(1)}%`)
console.log(`reserve at risk 0: ${(minReserveAtZero * 100).toFixed(1)}%`)
console.log(`worst per-name cap overshoot: ${(maxExposure * 100).toFixed(6)}pp (must be <= 0)`)
console.log(`narrowest thesis-vs-diversifier margin: ${(narrowestThesisMargin * 100).toFixed(2)}pp`)
console.log(`\n${checks.toLocaleString()} assertions over ${CAPITALS.length} capitals x 101 risk values x 2 sleeve states`)

if (failures.length > 0) {
  console.error(`\nFAILED: ${failures.length}`)
  for (const f of failures.slice(0, 25)) console.error('  ' + f)
  if (failures.length > 25) console.error(`  ... and ${failures.length - 25} more`)
  process.exit(1)
}
console.log('ALL INVARIANTS HOLD')
