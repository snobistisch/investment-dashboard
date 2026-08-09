import type { Factor, Position } from '../../data/positions'
import { activeBook, factorBreakdown } from '../exposure/analysis'

// Sizing rules, not a vibe. Every constant here is named so it can be
// retuned without touching the logic that uses it.

export type RiskBand = 'Conservative' | 'Balanced' | 'Aggressive'

export function riskBand(risk: number): RiskBand {
  if (risk < 34) return 'Conservative'
  if (risk < 67) return 'Balanced'
  return 'Aggressive'
}

// Position count. The aggressive end is deliberately not a handful of names:
// the sizeable universe is 29, and collapsing that to 4-6 concentrates the
// book far past what the caps below are trying to control. Risk tolerance
// shows up as *tilt* (see CONVICTION_TILT_*), not as a near-empty book.
const MIN_POSITIONS_CONSERVATIVE = 18
const MIN_POSITIONS_AGGRESSIVE = 11

// Per-name cap, as a share of total capital. Read these against equal weight:
// 1/18 = 5.6% conservative, 1/11 = 9.1% aggressive. So the conservative cap
// sits just above equal weight (near-forced equal weighting) and the
// aggressive cap allows roughly 1.8x equal weight in the best ideas. A cap far
// above that would never bind and would be decoration rather than a control.
const PER_NAME_CAP_CONSERVATIVE = 0.07
const PER_NAME_CAP_AGGRESSIVE = 0.16

// Per-factor cap: held tight across the whole slider — 88% of this book's
// market cap sits behind one factor (see the Exposure tab), and the allocator
// must not be able to recreate that by accident at any setting.
const PER_FACTOR_CAP_CONSERVATIVE = 0.28
const PER_FACTOR_CAP_AGGRESSIVE = 0.32

// How hard weighting tilts toward high conviction: weight is proportional to
// conviction^tilt. At 1.0 a conviction-4 name gets 1.33x a conviction-3 name;
// at 2.0 it gets 1.78x. This is what "aggressive" actually means here —
// leaning harder into the best-documented ideas — rather than simply holding
// fewer names. Conviction is a 1-5 integer, so anything steeper than a square
// would read precision into the data that is not there.
const CONVICTION_TILT_CONSERVATIVE = 1.0
const CONVICTION_TILT_AGGRESSIVE = 2.0

// No single factor may occupy more than this share of the name slots. The
// dollar cap alone is not enough: 15 of the 29 sizeable names are AI-capex, so
// a pure conviction ranking hands that one bucket most of the list and then
// splits one capped budget across all of them. That reproduces the Exposure
// tab's finding inside the allocation — the same driver everywhere, just at
// smaller dollar amounts each — and starves every other bucket of slots.
const MAX_FACTOR_SHARE_OF_SLOTS = 1 / 3
const MIN_NAMES_PER_FACTOR = 3

// Leverage sleeve: near-zero at the conservative end, hard ceiling at the
// aggressive end, so the toggle alone never introduces meaningful leverage.
export const SLEEVE_CAP_AGGRESSIVE = 0.175
export const SLEEVE_MAX_NAMES = 2

function interpolate(risk: number, atZero: number, atHundred: number) {
  const t = Math.max(0, Math.min(100, risk)) / 100
  return atZero + (atHundred - atZero) * t
}

export function positionCountTarget(risk: number) {
  return Math.round(interpolate(risk, MIN_POSITIONS_CONSERVATIVE, MIN_POSITIONS_AGGRESSIVE))
}

export function perNameCap(risk: number) {
  return interpolate(risk, PER_NAME_CAP_CONSERVATIVE, PER_NAME_CAP_AGGRESSIVE)
}

export function perFactorCap(risk: number) {
  return interpolate(risk, PER_FACTOR_CAP_CONSERVATIVE, PER_FACTOR_CAP_AGGRESSIVE)
}

export function convictionTilt(risk: number) {
  return interpolate(risk, CONVICTION_TILT_CONSERVATIVE, CONVICTION_TILT_AGGRESSIVE)
}

export function maxNamesPerFactor(risk: number) {
  return Math.max(
    MIN_NAMES_PER_FACTOR,
    Math.ceil(positionCountTarget(risk) * MAX_FACTOR_SHARE_OF_SLOTS),
  )
}

export function sleevePct(risk: number) {
  return interpolate(risk, 0, SLEEVE_CAP_AGGRESSIVE)
}

// The long universe: activeBook already excludes context-flagged names;
// stance === 'long' is applied explicitly here rather than assumed.
export const investableUniverse: Position[] = activeBook.filter((p) => p.stance === 'long')

// Only a documented `edge` qualifies a name for sizing. `note` is explicitly
// defined in positions.ts as a transcription caveat — what the source did NOT
// say — and in practice most notes are bear cases ("the conglomerate discount
// is deserved", "option value, not a business") or bookkeeping ("market cap
// not stated in the source"). Printing one of those in a Rationale column
// next to a dollar amount would state a reason not to own the name as the
// reason to own it. Names without an edge stay in the exposure universe and
// out of the allocation.
export const sizeableUniverse: Position[] = investableUniverse.filter((p) => p.edge !== undefined)

export interface AllocatedPosition {
  position: Position
  weight: number
  dollars: number
  rationale: string
  nameCapped: boolean
  factorCapped: boolean
}

export interface FactorTotal {
  factor: Factor
  dollars: number
  share: number
  cap: number
  atCap: boolean
}

export interface SleeveLeg {
  position: Position
  premiumUsd: number
  premiumShare: number
}

export interface SleeveResult {
  targetShare: number
  premiumUsd: number
  legs: SleeveLeg[]
}

export interface AllocationResult {
  riskBand: RiskBand
  targetPositionCount: number
  perNameCapPct: number
  perFactorCapPct: number
  convictionTilt: number
  /** Slot limit per factor bucket, so one driver cannot take over the list. */
  maxNamesPerFactor: number
  positions: AllocatedPosition[]
  unallocatedUsd: number
  unallocatedShare: number
  factorTotals: FactorTotal[]
  /** Names carrying a documented edge — what the allocator may draw from. */
  sizeableUniverseCount: number
  /** Long names in the active book, edge or not — the wider research universe. */
  longUniverseCount: number
  sleeve: SleeveResult | null
}

/** Rank candidates by conviction, then alphabetically for stability. Every
 *  candidate already carries an edge, so the previous edge-vs-note tiebreak
 *  no longer discriminates between them. */
function rankCandidates(universe: Position[]): Position[] {
  return [...universe].sort((a, b) => {
    if (b.conviction !== a.conviction) return b.conviction - a.conviction
    return a.ticker.localeCompare(b.ticker)
  })
}

const EPSILON = 1e-6
const MAX_FILL_PASSES = 64

interface FillItem {
  weight: number
  cap: number
}

/** Distribute `budget` proportional to weight, respecting each item's own cap
 *  and re-offering whatever a cap refused to the items that still have room.
 *  Returns dollars per item, index-aligned with the input.
 *
 *  Plain proportional sizing followed by a single clamp would leave the
 *  refused capital in cash even while other items sat well under their caps —
 *  that is not a risk control, just under-investment. */
function waterFill(items: FillItem[], budget: number): number[] {
  const filled = items.map(() => 0)
  if (budget <= EPSILON) return filled

  for (let pass = 0; pass < MAX_FILL_PASSES; pass++) {
    const placed = filled.reduce((total, d) => total + d, 0)
    const remaining = budget - placed
    if (remaining <= EPSILON) break

    const open = items
      .map((item, i) => ({ item, i }))
      .filter(({ item, i }) => item.cap - filled[i] > EPSILON && item.weight > 0)
    if (open.length === 0) break

    const weightSum = open.reduce((total, { item }) => total + item.weight, 0)
    let moved = 0
    for (const { item, i } of open) {
      const want = (remaining * item.weight) / weightSum
      const give = Math.min(want, item.cap - filled[i])
      filled[i] += give
      moved += give
    }
    if (moved <= EPSILON) break
  }
  return filled
}

/** Take names in conviction order, but never let one factor occupy more than
 *  its share of the slots — see MAX_FACTOR_SHARE_OF_SLOTS. */
function selectNames(ranked: Position[], target: number, perFactorLimit: number): Position[] {
  const takenPerFactor = new Map<Factor, number>()
  const chosen: Position[] = []
  for (const position of ranked) {
    if (chosen.length >= target) break
    const primary = position.factors[0]
    const taken = takenPerFactor.get(primary) ?? 0
    if (taken >= perFactorLimit) continue
    takenPerFactor.set(primary, taken + 1)
    chosen.push(position)
  }
  return chosen
}

export function buildAllocation(
  capitalUsd: number,
  risk: number,
  leverageSleeveOn: boolean,
): AllocationResult {
  const ranked = rankCandidates(sizeableUniverse)
  const targetPositionCount = positionCountTarget(risk)
  const nameCap = perNameCap(risk)
  const factorCap = perFactorCap(risk)
  const tilt = convictionTilt(risk)

  const selected = selectNames(ranked, targetPositionCount, maxNamesPerFactor(risk))
  const nameCapUsd = nameCap * capitalUsd
  const factorCapUsd = factorCap * capitalUsd

  const rows = selected.map((position) => ({
    position,
    weight: Math.pow(position.conviction, tilt),
    dollars: 0,
    nameCapped: false,
    factorCapped: false,
  }))

  // Sizing is two-level, and the order matters. Level 1 hands each factor
  // bucket a budget; level 2 splits that budget across the names inside it.
  // Doing it in one pass across all names instead lets the highest-conviction
  // members of a crowded bucket absorb the entire bucket cap and leaves the
  // rest of that bucket at literally zero dollars — a listed position with no
  // money in it is not an allocation.
  const buckets = [...new Set(rows.map((r) => r.position.factors[0]))]
  const bucketRows = new Map<Factor, typeof rows>(
    buckets.map((f) => [f, rows.filter((r) => r.position.factors[0] === f)]),
  )

  const bucketFill = waterFill(
    buckets.map((factor) => {
      const members = bucketRows.get(factor) ?? []
      return {
        weight: members.reduce((total, r) => total + r.weight, 0),
        // A bucket can never absorb more than its members can hold.
        cap: Math.min(factorCapUsd, members.length * nameCapUsd),
      }
    }),
    capitalUsd,
  )

  const factorDollars = new Map<Factor, number>()
  buckets.forEach((factor, bucketIndex) => {
    const members = bucketRows.get(factor) ?? []
    const budget = bucketFill[bucketIndex]
    factorDollars.set(factor, budget)

    const inner = waterFill(
      members.map((r) => ({ weight: r.weight, cap: nameCapUsd })),
      budget,
    )
    members.forEach((row, i) => {
      row.dollars = inner[i]
      if (row.dollars >= nameCapUsd - EPSILON) row.nameCapped = true
    })
    // A bucket held at its dollar cap constrained every name inside it,
    // whether or not that name also hit its own ceiling.
    if (budget >= factorCapUsd - EPSILON && budget > 0) {
      for (const row of members) row.factorCapped = true
    }
  })

  const totalAllocated = rows.reduce((total, r) => total + r.dollars, 0)

  const positions: AllocatedPosition[] = rows
    .map((row) => ({
      position: row.position,
      dollars: row.dollars,
      weight: capitalUsd ? row.dollars / capitalUsd : 0,
      // Guaranteed present: sizeableUniverse filters on edge !== undefined.
      rationale: row.position.edge ?? '',
      nameCapped: row.nameCapped,
      factorCapped: row.factorCapped,
    }))
    .sort((a, b) => b.dollars - a.dollars || a.position.ticker.localeCompare(b.position.ticker))

  // factorBreakdown enumerates the buckets the same way the Exposure tab does;
  // the dollars come from the fill above. Ordered by allocated dollars rather
  // than by the Exposure tab's market-cap ordering — on an allocation table the
  // question is how much sits behind each driver, not how large those companies
  // happen to be.
  const factorTotals: FactorTotal[] = factorBreakdown(selected)
    .map((row) => {
      const dollars = factorDollars.get(row.factor) ?? 0
      return {
        factor: row.factor,
        dollars,
        share: capitalUsd ? dollars / capitalUsd : 0,
        cap: factorCap,
        atCap: dollars >= factorCapUsd - EPSILON && dollars > 0,
      }
    })
    .sort((a, b) => b.dollars - a.dollars || a.factor.localeCompare(b.factor))

  // Leverage sleeve: an overlay on the highest-conviction names already
  // selected above, sized as its own slice of total capital so it can never
  // crowd out the core allocation.
  let sleeve: SleeveResult | null = null
  if (leverageSleeveOn && positions.length > 0) {
    const targetShare = sleevePct(risk)
    const premiumUsd = targetShare * capitalUsd
    const legNames = [...positions]
      .sort(
        (a, b) =>
          b.position.conviction - a.position.conviction ||
          a.position.ticker.localeCompare(b.position.ticker),
      )
      .slice(0, Math.min(SLEEVE_MAX_NAMES, positions.length))
    const legWeightTotal = legNames.reduce((t, p) => t + p.position.conviction, 0)
    const legs: SleeveLeg[] = legNames.map((p) => {
      const premiumShare = legWeightTotal ? p.position.conviction / legWeightTotal : 0
      return {
        position: p.position,
        premiumUsd: premiumShare * premiumUsd,
        premiumShare,
      }
    })
    sleeve = { targetShare, premiumUsd, legs }
  }

  return {
    riskBand: riskBand(risk),
    targetPositionCount,
    perNameCapPct: nameCap,
    perFactorCapPct: factorCap,
    convictionTilt: tilt,
    maxNamesPerFactor: maxNamesPerFactor(risk),
    positions,
    unallocatedUsd: Math.max(capitalUsd - totalAllocated, 0),
    unallocatedShare: capitalUsd ? Math.max(capitalUsd - totalAllocated, 0) / capitalUsd : 0,
    factorTotals,
    sizeableUniverseCount: ranked.length,
    longUniverseCount: investableUniverse.length,
    sleeve,
  }
}
