import type { Factor, Position } from '../../data/positions'
import { activeBook } from '../exposure/analysis'

// Sizing rules, not a vibe. Every constant here is named so it can be
// retuned without touching the logic that uses it.
//
// ---------------------------------------------------------------------------
// What this allocator is built around
// ---------------------------------------------------------------------------
// The dashboard has one central hypothesis, and it is stated in the repo
// rather than inferred here: AI infrastructure bought at the optical
// interconnect bottleneck. research/photonics-tracker-research.md §5 ("The
// macro thesis, and what breaks it") argues copper runs out of reach above
// 200G per lane as clusters grow; §4 ranks the chain, calling compound
// semiconductor substrates "one level deeper, and currently the hardest
// constraint" and the laser/EML layer "the genuine bottleneck". The Exposure
// tab states the investment rule that follows: substrate and component are
// the bottleneck the thesis says to buy, system and demand-setter are beta.
//
// An earlier version of this file weighted every factor bucket equally and
// then capped each at ~30% of capital. That inverted the book: the thesis
// factor holds 15 of the 29 sizeable names, so it hit its cap and got scaled
// down, while a three-name diversifier bucket had room to spare and its top
// name was sized above every bottleneck position. A cap meant as a risk
// control had become a penalty on the only thing this dashboard researched in
// depth.
//
// So the structure is thesis-first: a core sized on the hypothesis and
// weighted by where each name sits in the chain, plus a diversifier sleeve
// that is genuinely secondary. The concentration this produces is disclosed
// rather than capped away — per JULY_2026_DRAWDOWN, the fund that held this
// exact thesis was right and was killed by ~4x leverage, not by being
// concentrated. Leverage is what stays capped here.

export type RiskBand = 'Conservative' | 'Balanced' | 'Aggressive'

export function riskBand(risk: number): RiskBand {
  if (risk < 34) return 'Conservative'
  if (risk < 67) return 'Balanced'
  return 'Aggressive'
}

// Share of capital going to the thesis core. Rises with risk: expressing more
// conviction means leaning further into the hypothesis, not holding more
// unrelated names.
const THESIS_SHARE_CONSERVATIVE = 0.55
const THESIS_SHARE_AGGRESSIVE = 0.75

// Name counts, split across the two sleeves.
const THESIS_NAMES_CONSERVATIVE = 10
const THESIS_NAMES_AGGRESSIVE = 7
const DIVERSIFIER_NAMES_CONSERVATIVE = 8
const DIVERSIFIER_NAMES_AGGRESSIVE = 4

// Per-name cap, as a share of total capital. Read against equal weight:
// 1/18 = 5.6% conservative, 1/11 = 9.1% aggressive.
const PER_NAME_CAP_CONSERVATIVE = 0.07
const PER_NAME_CAP_AGGRESSIVE = 0.16

// Per-factor cap, applied to the DIVERSIFIER sleeve only. Inside the thesis
// core every name shares one factor by construction, so capping by factor
// there would just be a second per-name cap wearing a different hat. This
// keeps any one non-thesis driver from quietly becoming a second thesis.
const DIVERSIFIER_FACTOR_CAP_CONSERVATIVE = 0.2
const DIVERSIFIER_FACTOR_CAP_AGGRESSIVE = 0.16

// A diversifier's own ceiling, as a fraction of the per-name cap. Without it
// the arithmetic bites back: the diversifier sleeve holds fewer names than the
// thesis core, so an equal budget per name makes each diversifier LARGER, and
// a conviction-4 name in a two-name bucket ends up the single biggest position
// in the book. That is how Robinhood — no chain position, and an `edge` field
// that records a cross-reference rather than a mispricing — came to outweigh
// the substrate name the research calls the hardest constraint. Ballast is
// allowed to be ballast; it is not allowed to outrank the thesis.
const DIVERSIFIER_NAME_CAP_MULTIPLE = 0.6

// How hard weighting tilts toward high conviction: weight is proportional to
// conviction^tilt. Conviction is a 1-5 integer, so anything steeper than a
// square would read precision into the data that is not there.
const CONVICTION_TILT_CONSERVATIVE = 1.0
const CONVICTION_TILT_AGGRESSIVE = 2.0

// Where in the value chain the economics sit, as a weight multiplier. This is
// what makes the allocation an expression of the thesis rather than a
// conviction ranking: the research says buy the constraint, and the constraint
// is upstream. It also corrects a perverse effect of the conviction column —
// conviction is derived mechanically from each dashboard's risk tier, so the
// volatile bottleneck names score LOWER than the steadier module makers, and
// weighting on conviction alone would systematically underweight exactly what
// the thesis says to own.
export const CHAIN_LAYER_WEIGHT: Record<string, number> = {
  substrate: 1.6, // "the hardest constraint in the chain" — InP shortage
  component: 1.4, // "the genuine bottleneck" — EMLs, DSPs, silicon photonics
  module: 0.9, // volume layer; real revenue, but ASP compression is the risk
  system: 0.5, // the section's own word for it: beta
  'demand-setter': 0.3, // beta, and already the market's consensus trade
}
const DEFAULT_CHAIN_WEIGHT = 1.0

/** The layers the research calls the bottleneck — what the thesis says to buy,
 *  and the only names the leverage sleeve may express. */
export const BOTTLENECK_LAYERS = ['substrate', 'component'] as const

// Leverage sleeve: near-zero at the conservative end, hard ceiling at the
// aggressive end, so the toggle alone never introduces meaningful leverage.
export const SLEEVE_CAP_AGGRESSIVE = 0.175
export const SLEEVE_MAX_NAMES = 2

function interpolate(risk: number, atZero: number, atHundred: number) {
  const t = Math.max(0, Math.min(100, risk)) / 100
  return atZero + (atHundred - atZero) * t
}

export function thesisShare(risk: number) {
  return interpolate(risk, THESIS_SHARE_CONSERVATIVE, THESIS_SHARE_AGGRESSIVE)
}
export function thesisNameCount(risk: number) {
  return Math.round(interpolate(risk, THESIS_NAMES_CONSERVATIVE, THESIS_NAMES_AGGRESSIVE))
}
export function diversifierNameCount(risk: number) {
  return Math.round(
    interpolate(risk, DIVERSIFIER_NAMES_CONSERVATIVE, DIVERSIFIER_NAMES_AGGRESSIVE),
  )
}
export function perNameCap(risk: number) {
  return interpolate(risk, PER_NAME_CAP_CONSERVATIVE, PER_NAME_CAP_AGGRESSIVE)
}
export function diversifierFactorCap(risk: number) {
  return interpolate(risk, DIVERSIFIER_FACTOR_CAP_CONSERVATIVE, DIVERSIFIER_FACTOR_CAP_AGGRESSIVE)
}
export function convictionTilt(risk: number) {
  return interpolate(risk, CONVICTION_TILT_CONSERVATIVE, CONVICTION_TILT_AGGRESSIVE)
}
export function sleevePct(risk: number) {
  return interpolate(risk, 0, SLEEVE_CAP_AGGRESSIVE)
}

// The long universe: activeBook already excludes context-flagged names;
// stance === 'long' is applied explicitly here rather than assumed.
export const investableUniverse: Position[] = activeBook.filter((p) => p.stance === 'long')

// Only a documented `edge` qualifies a name for sizing. `note` is explicitly
// defined in positions.ts as a transcription caveat — what the source did NOT
// say — and in practice most notes are bear cases ("option value, not a
// business", "the conglomerate discount is deserved") or bookkeeping ("market
// cap not stated in the source"). Printing one of those in a Rationale column
// next to a dollar amount would state a reason not to own the name as the
// reason to own it.
export const sizeableUniverse: Position[] = investableUniverse.filter((p) => p.edge !== undefined)

/** The hypothesis the book is built on, derived rather than hardcoded: the
 *  primary driver behind the most researched names. On the current data this
 *  resolves to 'ai-capex' — 15 of the 29 sizeable names — which is the same
 *  driver the Exposure tab reports as 88% of market cap on file. Deriving it
 *  means the allocator follows positions.ts if the book's centre of gravity
 *  ever moves. */
export const THESIS_FACTOR: Factor = (() => {
  const counts = new Map<Factor, number>()
  for (const p of sizeableUniverse) {
    counts.set(p.factors[0], (counts.get(p.factors[0]) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]
})()

export const thesisUniverse = sizeableUniverse.filter((p) => p.factors[0] === THESIS_FACTOR)
export const diversifierUniverse = sizeableUniverse.filter((p) => p.factors[0] !== THESIS_FACTOR)

export function chainWeight(p: Position) {
  return p.chainLayer ? (CHAIN_LAYER_WEIGHT[p.chainLayer] ?? DEFAULT_CHAIN_WEIGHT) : DEFAULT_CHAIN_WEIGHT
}

/** "The bottleneck" is a claim about the thesis chain specifically, not about
 *  the word `component` wherever it appears. Harmonic Drive is a component in
 *  the robotics chain and Hesai in the lidar one; neither is the optical
 *  constraint the research argues for, so neither belongs in a bottleneck
 *  figure or in the leverage sleeve. */
export function isBottleneck(p: Position) {
  return (
    p.factors[0] === THESIS_FACTOR &&
    (BOTTLENECK_LAYERS as readonly string[]).includes(p.chainLayer ?? '')
  )
}

export interface AllocatedPosition {
  position: Position
  weight: number
  dollars: number
  rationale: string
  sleeveName: 'thesis' | 'diversifier'
  bottleneck: boolean
  nameCapped: boolean
}

export interface FactorTotal {
  factor: Factor
  dollars: number
  share: number
  isThesis: boolean
}

export interface ChainTotal {
  layer: string
  dollars: number
  share: number
  bottleneck: boolean
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
  thesisFactor: Factor
  /** Floor share of capital for the thesis core at this risk setting. The
   *  diversifier ceiling normally leaves the core above this. */
  thesisFloorShare: number
  /** What the thesis core actually got, after per-name caps. */
  thesisActualShare: number
  /** Share sitting in the layers the research calls the bottleneck. */
  bottleneckShare: number
  perNameCapPct: number
  diversifierFactorCapPct: number
  convictionTilt: number
  positions: AllocatedPosition[]
  unallocatedUsd: number
  unallocatedShare: number
  factorTotals: FactorTotal[]
  chainTotals: ChainTotal[]
  thesisUniverseCount: number
  diversifierUniverseCount: number
  longUniverseCount: number
  sleeve: SleeveResult | null
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
 *  refused capital idle even while other items sat well under their caps —
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
      const give = Math.min((remaining * item.weight) / weightSum, item.cap - filled[i])
      filled[i] += give
      moved += give
    }
    if (moved <= EPSILON) break
  }
  return filled
}

interface Row {
  position: Position
  weight: number
  dollars: number
  sleeveName: 'thesis' | 'diversifier'
}

export function buildAllocation(
  capitalUsd: number,
  risk: number,
  leverageSleeveOn: boolean,
): AllocationResult {
  const tilt = convictionTilt(risk)
  const nameCap = perNameCap(risk)
  const nameCapUsd = nameCap * capitalUsd
  const factorCap = diversifierFactorCap(risk)
  const targetThesisShare = thesisShare(risk)

  // --- Thesis core -------------------------------------------------------
  // Ranked on conviction AND chain position, so the bottleneck outranks the
  // volume layer even where the derived conviction column disagrees.
  const thesisScore = (p: Position) => Math.pow(p.conviction, tilt) * chainWeight(p)
  const thesisPicked = [...thesisUniverse]
    .sort((a, b) => thesisScore(b) - thesisScore(a) || a.ticker.localeCompare(b.ticker))
    .slice(0, Math.min(thesisNameCount(risk), thesisUniverse.length))

  // --- Diversifier sleeve ------------------------------------------------
  // Plain conviction order, but no single driver may take more than a third of
  // the diversifier slots — otherwise one three-name bucket becomes a second
  // thesis nobody chose.
  const diversifierTarget = Math.min(diversifierNameCount(risk), diversifierUniverse.length)
  const diversifierSlotLimit = Math.max(2, Math.ceil(diversifierTarget / 3))
  const takenPerFactor = new Map<Factor, number>()
  const diversifierPicked: Position[] = []
  for (const p of [...diversifierUniverse].sort(
    (a, b) => b.conviction - a.conviction || a.ticker.localeCompare(b.ticker),
  )) {
    if (diversifierPicked.length >= diversifierTarget) break
    const taken = takenPerFactor.get(p.factors[0]) ?? 0
    if (taken >= diversifierSlotLimit) continue
    takenPerFactor.set(p.factors[0], taken + 1)
    diversifierPicked.push(p)
  }

  const rows: Row[] = [
    ...thesisPicked.map((position) => ({
      position,
      weight: thesisScore(position),
      dollars: 0,
      sleeveName: 'thesis' as const,
    })),
    ...diversifierPicked.map((position) => ({
      position,
      weight: Math.pow(position.conviction, tilt),
      dollars: 0,
      sleeveName: 'diversifier' as const,
    })),
  ]

  const thesisRows = rows.filter((r) => r.sleeveName === 'thesis')
  const diversifierRows = rows.filter((r) => r.sleeveName === 'diversifier')

  // Fill the thesis core: one factor throughout, so the per-name cap is the
  // only constraint that applies.
  const thesisFill = waterFill(
    thesisRows.map((r) => ({ weight: r.weight, cap: nameCapUsd })),
    targetThesisShare * capitalUsd,
  )
  thesisRows.forEach((r, i) => {
    r.dollars = thesisFill[i]
  })

  // Fill the diversifier sleeve two-level: factor budgets first, then names
  // inside each factor. Filling all diversifiers in one pass would let the
  // highest-conviction member of a crowded bucket absorb that bucket's cap and
  // leave its neighbours at zero.
  const divNameCapUsd = DIVERSIFIER_NAME_CAP_MULTIPLE * nameCapUsd
  const divBudget = (1 - targetThesisShare) * capitalUsd
  const divFactors = [...new Set(diversifierRows.map((r) => r.position.factors[0]))]
  const divByFactor = new Map<Factor, Row[]>(
    divFactors.map((f) => [f, diversifierRows.filter((r) => r.position.factors[0] === f)]),
  )
  const divFactorFill = waterFill(
    divFactors.map((f) => {
      const members = divByFactor.get(f) ?? []
      return {
        weight: members.reduce((t, r) => t + r.weight, 0),
        cap: Math.min(factorCap * capitalUsd, members.length * divNameCapUsd),
      }
    }),
    divBudget,
  )
  divFactors.forEach((f, i) => {
    const members = divByFactor.get(f) ?? []
    const inner = waterFill(
      members.map((r) => ({ weight: r.weight, cap: divNameCapUsd })),
      divFactorFill[i],
    )
    members.forEach((r, j) => {
      r.dollars = inner[j]
    })
  })

  // Anything neither sleeve could absorb is offered back across every name
  // with headroom, thesis first. This is why the thesis share is a floor
  // rather than a target: the diversifier ceiling usually stops that sleeve
  // spending its whole budget, and the remainder belongs to the hypothesis
  // before it belongs to ballast.
  const leftover = capitalUsd - rows.reduce((t, r) => t + r.dollars, 0)
  if (leftover > EPSILON) {
    const order = [...thesisRows, ...diversifierRows]
    const topUp = waterFill(
      order.map((r) => ({
        weight: r.weight,
        cap: Math.max((r.sleeveName === 'thesis' ? nameCapUsd : divNameCapUsd) - r.dollars, 0),
      })),
      leftover,
    )
    order.forEach((r, i) => {
      r.dollars += topUp[i]
    })
  }

  const totalAllocated = rows.reduce((t, r) => t + r.dollars, 0)
  const shareOf = (d: number) => (capitalUsd ? d / capitalUsd : 0)

  const positions: AllocatedPosition[] = rows
    .map((r) => ({
      position: r.position,
      dollars: r.dollars,
      weight: shareOf(r.dollars),
      // Guaranteed present: sizeableUniverse filters on edge !== undefined.
      rationale: r.position.edge ?? '',
      sleeveName: r.sleeveName,
      bottleneck: isBottleneck(r.position),
      nameCapped:
        r.dollars >=
          (r.sleeveName === 'thesis' ? nameCapUsd : divNameCapUsd) - EPSILON && r.dollars > 0,
    }))
    .sort(
      (a, b) =>
        // Thesis first, then by size — the table should read as a thesis with
        // diversifiers attached, not as a flat ranking.
        Number(b.sleeveName === 'thesis') - Number(a.sleeveName === 'thesis') ||
        b.dollars - a.dollars ||
        a.position.ticker.localeCompare(b.position.ticker),
    )

  const factorDollars = new Map<Factor, number>()
  for (const r of rows) {
    const f = r.position.factors[0]
    factorDollars.set(f, (factorDollars.get(f) ?? 0) + r.dollars)
  }
  const factorTotals: FactorTotal[] = [...factorDollars.entries()]
    .map(([factor, dollars]) => ({
      factor,
      dollars,
      share: shareOf(dollars),
      isThesis: factor === THESIS_FACTOR,
    }))
    .sort((a, b) => b.dollars - a.dollars || a.factor.localeCompare(b.factor))

  // Chain layers are reported for the THESIS core only. Layer names are not
  // globally meaningful: Harmonic Drive is a `component` in the robotics chain
  // and Hesai in the lidar one, so a single "component" row spanning both
  // sleeves would credit the optical bottleneck with capital sitting in an
  // unrelated supply chain. Diversifiers get one row of their own instead.
  const chainDollars = new Map<string, number>()
  for (const r of thesisRows) {
    const layer = r.position.chainLayer ?? 'unclassified'
    chainDollars.set(layer, (chainDollars.get(layer) ?? 0) + r.dollars)
  }
  const chainTotals: ChainTotal[] = [...chainDollars.entries()]
    .map(([layer, dollars]) => ({
      layer,
      dollars,
      share: shareOf(dollars),
      bottleneck: (BOTTLENECK_LAYERS as readonly string[]).includes(layer),
    }))
    .sort((a, b) => b.dollars - a.dollars || a.layer.localeCompare(b.layer))

  const diversifierUsd = diversifierRows.reduce((t, r) => t + r.dollars, 0)
  if (diversifierUsd > 0) {
    chainTotals.push({
      layer: 'outside the thesis chain',
      dollars: diversifierUsd,
      share: shareOf(diversifierUsd),
      bottleneck: false,
    })
  }

  const bottleneckUsd = rows
    .filter((r) => isBottleneck(r.position))
    .reduce((t, r) => t + r.dollars, 0)

  // --- Leverage sleeve ---------------------------------------------------
  // Drawn only from the bottleneck names already held in the core. A
  // leveraged expression belongs on the sharpest version of the thesis, not
  // on whichever name the derived conviction column happens to rank highest —
  // that used to surface two names with no chain position at all.
  let sleeve: SleeveResult | null = null
  const sleeveCandidates = positions.filter((p) => p.bottleneck && p.dollars > 0)
  if (leverageSleeveOn && sleeveCandidates.length > 0) {
    const targetShare = sleevePct(risk)
    const premiumUsd = targetShare * capitalUsd
    const legNames = [...sleeveCandidates]
      .sort(
        (a, b) =>
          chainWeight(b.position) * b.position.conviction -
            chainWeight(a.position) * a.position.conviction ||
          a.position.ticker.localeCompare(b.position.ticker),
      )
      .slice(0, Math.min(SLEEVE_MAX_NAMES, sleeveCandidates.length))
    const legWeightTotal = legNames.reduce(
      (t, p) => t + chainWeight(p.position) * p.position.conviction,
      0,
    )
    const legs: SleeveLeg[] = legNames.map((p) => {
      const premiumShare = legWeightTotal
        ? (chainWeight(p.position) * p.position.conviction) / legWeightTotal
        : 0
      return { position: p.position, premiumUsd: premiumShare * premiumUsd, premiumShare }
    })
    sleeve = { targetShare, premiumUsd, legs }
  }

  return {
    riskBand: riskBand(risk),
    thesisFactor: THESIS_FACTOR,
    thesisFloorShare: targetThesisShare,
    thesisActualShare: shareOf(thesisRows.reduce((t, r) => t + r.dollars, 0)),
    bottleneckShare: shareOf(bottleneckUsd),
    perNameCapPct: nameCap,
    diversifierFactorCapPct: factorCap,
    convictionTilt: tilt,
    positions,
    unallocatedUsd: Math.max(capitalUsd - totalAllocated, 0),
    unallocatedShare: shareOf(Math.max(capitalUsd - totalAllocated, 0)),
    factorTotals,
    chainTotals,
    thesisUniverseCount: thesisUniverse.length,
    diversifierUniverseCount: diversifierUniverse.length,
    longUniverseCount: investableUniverse.length,
    sleeve,
  }
}
