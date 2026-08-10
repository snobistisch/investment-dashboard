import type { Factor, Position } from '../../data/positions'
import { JULY_2026_DRAWDOWN } from '../../data/positions'
import type { MarketSnapshot, MarketStats } from '../../data/market-data'
import { activeBook, vintageSpread } from '../exposure/analysis'

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

// Reserve — capital deliberately NOT put at risk, falling to zero as risk
// rises. Without it the slider had no low end: every other control moved the
// same way (more thesis, fewer names, higher caps, steeper tilt, bigger
// sleeve), so "Conservative" meant nothing more than a slightly smaller
// version of the same bet, 100% invested with two thirds in one driver. This
// is the only genuinely monotonic risk control in the model, and it is the one
// that decides what a drawdown does to the whole number rather than to the
// invested part of it.
//
// It is a reserve, not a forecast: there is no cash-yield assumption here and
// no view that holding it beats being invested.
const RESERVE_CONSERVATIVE = 0.4
const RESERVE_AGGRESSIVE = 0

// Share of INVESTED capital going to the thesis core. Rises with risk:
// expressing more conviction means leaning further into the hypothesis, not
// holding more unrelated names.
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

// ...and the same ceiling expressed against the thesis itself, which is the
// version that actually holds. A fixed fraction of the per-name cap is only
// correct for one particular combination of budgets and name counts: adding
// the reserve shrank the invested pool and immediately let the largest
// diversifier overtake the largest thesis position again at low risk. Binding
// the ceiling to the biggest position the thesis actually took makes the rule
// survive any retune of the constants above.
const DIVERSIFIER_MAX_VS_TOP_THESIS = 0.85

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
// POLICY, NOT A PROPERTY OF THE WORLD. Set 2026-08-09. These numbers are a
// ranking made numeric; nothing calibrated them, and the ordering carries the
// argument rather than the exact values. Two things should trigger a review:
//
//  1. The multipliers assume the bottleneck HOLDS over the horizon of the
//     positions. The evidence in the edge fields points the other way —
//     Coherent is quadrupling six-inch InP capacity by end-2027 with Nvidia
//     money, AXT is doubling by end-2027, Zhongji is stockpiling InP. A
//     constraint that earns rent attracts capacity, and the same texts that
//     justify the position document the scarcity being solved. If that
//     capacity lands before the cluster build-out peaks, substrate and
//     component stop deserving a premium and this table should flatten.
//  2. If the copper reach limit above 200G per lane is pushed out, the whole
//     ordering is wrong rather than mistuned.
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
//
// The premium is NOT a separate slice sitting alongside the equity. It is
// carved out of the same capital and counts toward the same per-name cap,
// because economically it is exposure to the same ticker. Sizing it beside the
// equity let AXTI reach 11.8% equity plus 9.3% premium — 21.1% of capital
// against a stated 16% cap, on the smallest and most volatile name in the
// book.
export const SLEEVE_CAP_AGGRESSIVE = 0.175
export const SLEEVE_MAX_NAMES = 2

function interpolate(risk: number, atZero: number, atHundred: number) {
  const t = Math.max(0, Math.min(100, risk)) / 100
  return atZero + (atHundred - atZero) * t
}

export function reserveShare(risk: number) {
  return interpolate(risk, RESERVE_CONSERVATIVE, RESERVE_AGGRESSIVE)
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

/** The hypothesis the book is built on. DECLARED, not derived.
 *
 *  This used to be computed as "the primary driver behind the most sizeable
 *  names", which sounded principled and was not: that count is a function of
 *  how deeply one section happened to be researched. Photonics carries 33
 *  transcribed tickers because that is where the work went; robotics carries
 *  15 and contributes none. The chain ran research effort -> ticker count ->
 *  designation as the central hypothesis -> two thirds of the capital, with no
 *  step in it that says anything about expected return. An afternoon spent on
 *  a new section could have moved the book's centre of gravity.
 *
 *  Chosen 2026-08-09 on the argument in research/photonics-tracker-research.md
 *  §5 (copper runs out of reach above 200G per lane as clusters grow) and §4
 *  (compound-semiconductor substrates are "the hardest constraint"), not on
 *  the ticker count. Review when either the copper reach limit or the InP
 *  shortage is resolved — see CHAIN_LAYER_WEIGHT for the same review trigger.
 *
 *  The derived majority is still computed, as a check rather than a source:
 *  scripts/verify-allocation.ts fails when it drifts away from this constant,
 *  which is the useful version of that mechanism. */
export const THESIS_FACTOR: Factor = 'ai-capex'

export const thesisUniverse = sizeableUniverse.filter((p) => p.factors[0] === THESIS_FACTOR)
export const diversifierUniverse = sizeableUniverse.filter((p) => p.factors[0] !== THESIS_FACTOR)

/** Whether a Dutch retail account can actually buy the listing.
 *
 *  Derived from `exchange`, not transcribed, because it is a property of the
 *  venue rather than of the company. Mainland China A-shares (Shenzhen,
 *  Shanghai STAR) and Taipei Exchange listings are not directly tradable
 *  through the brokers available here; every other venue in this file is. The
 *  allocator does not filter on this — it is a research book and the position
 *  may still be the right one to hold via another route — but a tool that
 *  proposes 11.8% of capital in a Shenzhen A-share without saying so is
 *  proposing something that cannot be executed.
 *
 *  Deliberately absent: transaction costs, bid-ask spread, and the Dutch box 3
 *  treatment. All three are real and none is derivable from anything in this
 *  repo, so they are stated on the tab as gaps rather than modelled. */
const RESTRICTED_EXCHANGES = ['Shenzhen', 'Shanghai STAR', 'Taipei Exchange']

export function isDirectlyTradable(p: Position) {
  return !RESTRICTED_EXCHANGES.some((venue) => p.exchange.includes(venue))
}

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
  /** Equity weight as a share of total capital. */
  weight: number
  /** Equity dollars. */
  dollars: number
  /** Option premium on this same ticker, 0 when the sleeve is off. */
  premiumUsd: number
  /** (equity + premium) / capital — what the per-name cap is enforced on. */
  exposureWeight: number
  rationale: string
  sleeveName: 'thesis' | 'diversifier'
  bottleneck: boolean
  nameCapped: boolean
  /** False for venues a Dutch retail account cannot reach directly. */
  tradable: boolean
  /** Source-stated hedge against the book's own thesis. */
  hedge: boolean
}

export interface FactorTotal {
  factor: Factor
  dollars: number
  share: number
  isThesis: boolean
  /** Which names make up the row, largest first. An aggregate that does not
   *  name its constituents cannot be checked against the book. */
  holdings: { ticker: string; dollars: number; share: number }[]
}

export interface ChainTotal {
  layer: string
  dollars: number
  share: number
  bottleneck: boolean
  holdings: { ticker: string; dollars: number; share: number }[]
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

export interface StressScenario {
  label: string
  /** How the move was derived.
   *
   *  'realised'     each held name moves by its OWN measured drawdown or
   *                 volatility, from the price history in the live snapshot.
   *  'index-anchor' one index figure applied to the whole thesis block. This
   *                 is what every scenario used to be: a multiplication that
   *                 assumed the book moves one-for-one with a named index. It
   *                 is kept, and labelled, because JULY_2026_DRAWDOWN is a
   *                 stated historical fact worth showing beside the measured
   *                 numbers — not because it is the better estimate. */
  basis: 'realised' | 'index-anchor'
  /** Only meaningful for index anchors. */
  indexMovePct?: number
  /** Equity loss in dollars. */
  equityLossUsd: number
  /** Premium written off entirely — an OTM call below its strike is worth 0. */
  premiumLossUsd: number
  totalLossUsd: number
  totalLossShare: number
  /** Realised scenarios only: how many sized names had usable price history,
   *  so a scenario resting on a third of the book cannot read as if it rested
   *  on all of it. */
  namesCovered?: number
  namesTotal?: number
  /** One line on what the scenario assumes, shown next to the number. */
  note?: string
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
  /** Capital deliberately held back, as a share of total capital. */
  reserveShare: number
  reserveUsd: number
  /** Share of total capital actually put at risk (1 - reserve, less any
   *  rounding a cap prevented from being deployed). */
  investedShare: number
  unallocatedUsd: number
  unallocatedShare: number
  factorTotals: FactorTotal[]
  chainTotals: ChainTotal[]
  /** Names excluded for sitting on the losing side of a fork already taken. */
  forkExclusions: { ticker: string; name: string; fork: string; side: string; beatenBy: string }[]
  /** Positions the source itself calls a hedge against the book's own thesis. */
  hedgeTickers: string[]
  stress: StressScenario[]
  /** Spread between the oldest and newest market-data vintage in the book. */
  vintageSpreadDays: number
  vintageOldest?: string
  vintageNewest?: string
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
  /** Live snapshot, when one loaded. Sizing does not read it — position sizes
   *  come from conviction and chain position, not market cap — so every
   *  allocation invariant holds identically with or without it. It supplies
   *  the realised stress scenarios and the effective vintage dates. */
  market?: MarketSnapshot | null,
): AllocationResult {
  const tilt = convictionTilt(risk)
  const nameCap = perNameCap(risk)
  // Caps are measured against TOTAL capital, not against the invested part:
  // the question a cap answers is what one name can do to your wealth, and the
  // reserve is part of that wealth.
  const nameCapUsd = nameCap * capitalUsd
  const factorCap = diversifierFactorCap(risk)
  const targetThesisShare = thesisShare(risk)
  const reserve = reserveShare(risk)
  const investedUsd = capitalUsd * (1 - reserve)

  // --- Thesis core -------------------------------------------------------
  // Ranked on conviction AND chain position, so the bottleneck outranks the
  // volume layer even where the derived conviction column disagrees.
  const thesisScore = (p: Position) => Math.pow(p.conviction, tilt) * chainWeight(p)

  // Within one named fork the allocator takes ONE side. Marvell's edge is that
  // it owns ~70% of the optical DSP market; Semtech's is that LPO removes the
  // DSP from the module — the file calls it "the direct short leg against
  // Marvell's DSP TAM". Sizing both at 7.1% cancelled the idiosyncratic half
  // of each thesis and left sector beta bought twice, with two sets of costs.
  // The higher-scoring side wins; the loser is recorded so the UI can say what
  // was dropped and why, rather than silently omitting it.
  //
  // Names their own source frames as a hedge (CRDO's edge says "partial HEDGE
  // against the optical thesis"; the photonics note puts Astera on the same
  // side) are exempt: a deliberate offset is a position, not an accident.
  const forkSideTaken = new Map<string, string>()
  const thesisDropped: { position: Position; beatenBy: string }[] = []
  const thesisPicked: Position[] = []
  for (const p of [...thesisUniverse].sort(
    (a, b) => thesisScore(b) - thesisScore(a) || a.ticker.localeCompare(b.ticker),
  )) {
    if (thesisPicked.length >= Math.min(thesisNameCount(risk), thesisUniverse.length)) break
    const bet = p.architecturalBet
    if (bet && !p.hedge) {
      const taken = forkSideTaken.get(bet.fork)
      if (taken && taken !== bet.side) {
        const winner = thesisPicked.find(
          (q) => q.architecturalBet?.fork === bet.fork && !q.hedge,
        )
        thesisDropped.push({ position: p, beatenBy: winner?.ticker ?? taken })
        continue
      }
      forkSideTaken.set(bet.fork, bet.side)
    }
    thesisPicked.push(p)
  }

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

  // --- Leverage sleeve, sized BEFORE the equity fill ---------------------
  // Order matters. The premium has to be known before equity is placed,
  // because it competes for the same per-name cap and comes out of the same
  // invested capital. Legs are the bottleneck names already selected into the
  // core — substrate and component in the thesis chain, never a diversifier.
  const sleeveCandidates = thesisRows.filter((r) => isBottleneck(r.position))
  const sleeveTargetShare = leverageSleeveOn ? sleevePct(risk) : 0
  const premiumByTicker = new Map<string, number>()
  let sleeve: SleeveResult | null = null

  if (sleeveTargetShare > 0 && sleeveCandidates.length > 0) {
    const legRows = [...sleeveCandidates]
      .sort(
        (a, b) =>
          chainWeight(b.position) * b.position.conviction -
            chainWeight(a.position) * a.position.conviction ||
          a.position.ticker.localeCompare(b.position.ticker),
      )
      .slice(0, Math.min(SLEEVE_MAX_NAMES, sleeveCandidates.length))
    const legWeightTotal = legRows.reduce(
      (t, r) => t + chainWeight(r.position) * r.position.conviction,
      0,
    )
    // A leg is capped at the per-name cap on its own: premium alone must never
    // exceed what the name is allowed to be worth, which would leave a
    // negative equity budget.
    const legs: SleeveLeg[] = legRows.map((r) => {
      const rawShare = legWeightTotal
        ? (chainWeight(r.position) * r.position.conviction) / legWeightTotal
        : 0
      const premiumUsd = Math.min(rawShare * sleeveTargetShare * capitalUsd, nameCapUsd)
      premiumByTicker.set(r.position.ticker, premiumUsd)
      return {
        position: r.position,
        premiumUsd,
        premiumShare: capitalUsd ? premiumUsd / capitalUsd : 0,
      }
    })
    const premiumUsd = legs.reduce((t, l) => t + l.premiumUsd, 0)
    sleeve = {
      targetShare: capitalUsd ? premiumUsd / capitalUsd : 0,
      premiumUsd,
      legs,
    }
  }

  const premiumOf = (r: Row) => premiumByTicker.get(r.position.ticker) ?? 0
  const totalPremiumUsd = sleeve?.premiumUsd ?? 0

  // Fill the thesis core: one factor throughout, so the per-name cap is the
  // only constraint that applies — less whatever premium already sits on that
  // same ticker. Every sleeve leg is a thesis name, so the whole premium comes
  // out of the thesis budget and the core's share stays honest.
  const thesisBudget = Math.max(targetThesisShare * investedUsd - totalPremiumUsd, 0)
  const thesisFill = waterFill(
    thesisRows.map((r) => ({
      weight: r.weight,
      cap: Math.max(nameCapUsd - premiumOf(r), 0),
    })),
    thesisBudget,
  )
  thesisRows.forEach((r, i) => {
    r.dollars = thesisFill[i]
  })

  // Fill the diversifier sleeve two-level: factor budgets first, then names
  // inside each factor. Filling all diversifiers in one pass would let the
  // highest-conviction member of a crowded bucket absorb that bucket's cap and
  // leave its neighbours at zero.
  // The thesis is already filled, so its largest position is known and the
  // diversifier ceiling can be tied to it rather than guessed at.
  const topThesisUsd = thesisRows.reduce((m, r) => Math.max(m, r.dollars + premiumOf(r)), 0)
  const divNameCapUsd = Math.min(
    DIVERSIFIER_NAME_CAP_MULTIPLE * nameCapUsd,
    topThesisUsd > 0 ? DIVERSIFIER_MAX_VS_TOP_THESIS * topThesisUsd : Infinity,
  )
  const divBudget = (1 - targetThesisShare) * investedUsd
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
  const equityBudget = investedUsd - totalPremiumUsd
  const leftover = equityBudget - rows.reduce((t, r) => t + r.dollars, 0)
  if (leftover > EPSILON) {
    const order = [...thesisRows, ...diversifierRows]
    const topUp = waterFill(
      order.map((r) => ({
        weight: r.weight,
        cap: Math.max(
          (r.sleeveName === 'thesis' ? nameCapUsd - premiumOf(r) : divNameCapUsd) - r.dollars,
          0,
        ),
      })),
      leftover,
    )
    order.forEach((r, i) => {
      r.dollars += topUp[i]
    })
  }

  const totalEquity = rows.reduce((t, r) => t + r.dollars, 0)
  const totalAllocated = totalEquity + totalPremiumUsd
  const shareOf = (d: number) => (capitalUsd ? d / capitalUsd : 0)

  // Exposure, not equity, is what every downstream figure is built on: a
  // premium on AXTI is exposure to AXTI whichever budget line it came from.
  const exposureOf = (r: Row) => r.dollars + premiumOf(r)

  const positions: AllocatedPosition[] = rows
    .map((r) => ({
      position: r.position,
      dollars: r.dollars,
      premiumUsd: premiumOf(r),
      weight: shareOf(r.dollars),
      exposureWeight: shareOf(exposureOf(r)),
      // Guaranteed present: sizeableUniverse filters on edge !== undefined.
      rationale: r.position.edge ?? '',
      sleeveName: r.sleeveName,
      bottleneck: isBottleneck(r.position),
      tradable: isDirectlyTradable(r.position),
      hedge: r.position.hedge === true,
      nameCapped:
        exposureOf(r) >=
          (r.sleeveName === 'thesis' ? nameCapUsd : divNameCapUsd) - EPSILON && r.dollars > 0,
    }))
    .sort(
      (a, b) =>
        // Thesis first, then by size — the table should read as a thesis with
        // diversifiers attached, not as a flat ranking.
        Number(b.sleeveName === 'thesis') - Number(a.sleeveName === 'thesis') ||
        b.exposureWeight - a.exposureWeight ||
        a.position.ticker.localeCompare(b.position.ticker),
    )

  /** Constituents of an aggregate row, largest first. */
  const holdingsOf = (set: typeof rows) =>
    set
      .map((r) => ({
        ticker: r.position.ticker,
        dollars: exposureOf(r),
        share: shareOf(exposureOf(r)),
      }))
      .sort((a, b) => b.dollars - a.dollars || a.ticker.localeCompare(b.ticker))

  const factorDollars = new Map<Factor, number>()
  for (const r of rows) {
    const f = r.position.factors[0]
    factorDollars.set(f, (factorDollars.get(f) ?? 0) + exposureOf(r))
  }
  const factorTotals: FactorTotal[] = [...factorDollars.entries()]
    .map(([factor, dollars]) => ({
      factor,
      dollars,
      share: shareOf(dollars),
      isThesis: factor === THESIS_FACTOR,
      holdings: holdingsOf(rows.filter((r) => r.position.factors[0] === factor)),
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
    chainDollars.set(layer, (chainDollars.get(layer) ?? 0) + exposureOf(r))
  }
  const chainTotals: ChainTotal[] = [...chainDollars.entries()]
    .map(([layer, dollars]) => ({
      layer,
      dollars,
      share: shareOf(dollars),
      bottleneck: (BOTTLENECK_LAYERS as readonly string[]).includes(layer),
      holdings: holdingsOf(
        thesisRows.filter((r) => (r.position.chainLayer ?? 'unclassified') === layer),
      ),
    }))
    .sort((a, b) => b.dollars - a.dollars || a.layer.localeCompare(b.layer))

  const diversifierUsd = diversifierRows.reduce((t, r) => t + exposureOf(r), 0)
  if (diversifierUsd > 0) {
    chainTotals.push({
      layer: 'outside the thesis chain',
      dollars: diversifierUsd,
      share: shareOf(diversifierUsd),
      bottleneck: false,
      holdings: holdingsOf(diversifierRows),
    })
  }

  const bottleneckUsd = rows
    .filter((r) => isBottleneck(r.position))
    .reduce((t, r) => t + exposureOf(r), 0)

  const reserveUsd = Math.max(capitalUsd - totalAllocated, 0)

  // --- Stress ------------------------------------------------------------
  // Run on the ACTUAL allocation weights, which is the whole point: the
  // Exposure tab ran this same multiplication on the universe's market-cap
  // shares, on a tab whose own copy says "there are no position sizes here".
  // These are sizes. The sleeve is treated as a total write-off rather than
  // moved with the index, because an out-of-the-money call below its strike
  // is worth zero regardless of how far below it lands.
  //
  // Still a multiplication and not a model: it assumes the thesis block moves
  // one-for-one with the named index and that nothing else moves at all.
  const thesisExposureUsd = thesisRows.reduce((t, r) => t + exposureOf(r), 0)

  const anchorScenarios: StressScenario[] = JULY_2026_DRAWDOWN.facts
    .filter((f) => f.index === true && f.value < 0)
    .map((f) => {
      const equityLossUsd = ((thesisExposureUsd - totalPremiumUsd) * f.value) / 100
      const premiumLossUsd = -totalPremiumUsd
      const totalLossUsd = equityLossUsd + premiumLossUsd
      return {
        label: f.label,
        basis: 'index-anchor' as const,
        indexMovePct: f.value,
        equityLossUsd,
        premiumLossUsd,
        totalLossUsd,
        totalLossShare: shareOf(totalLossUsd),
        note: 'Assumes the thesis block moves one-for-one with this index and nothing else moves.',
      }
    })

  // Each held name moved by its own measured amount. Equity is summed per
  // position rather than applying one figure to the block, so a book of
  // 90%-vol Chinese optics and a book of megacaps no longer stress alike.
  // Names without price history are excluded from the loss AND counted in
  // namesCovered, so a scenario cannot quietly rest on half the book.
  function realised(
    label: string,
    movePct: (s: MarketStats) => number | undefined,
    note: string,
  ): StressScenario | null {
    let equityLossUsd = 0
    let covered = 0
    for (const r of rows) {
      const stats = market?.quotes[r.position.ticker]?.stats
      const move = stats ? movePct(stats) : undefined
      if (move === undefined) continue
      covered++
      // Equity only: premium is written off separately below.
      equityLossUsd += (r.dollars * move) / 100
    }
    if (covered === 0) return null
    const premiumLossUsd = -totalPremiumUsd
    const totalLossUsd = equityLossUsd + premiumLossUsd
    return {
      label,
      basis: 'realised',
      equityLossUsd,
      premiumLossUsd,
      totalLossUsd,
      totalLossShare: shareOf(totalLossUsd),
      namesCovered: covered,
      namesTotal: rows.length,
      note,
    }
  }

  const realisedScenarios = [
    realised(
      'July 2026, each name at its own realised drawdown',
      (s) => s.julyDrawdownPct,
      'Peak-to-trough actually recorded per name between 22 Jun and 29 Jul 2026.',
    ),
    realised(
      'Worst 12-month drawdown, per name',
      (s) => s.maxDrawdownPct,
      'Each name at its own worst peak-to-trough of the last year. Assumes those troughs coincide, which they did not.',
    ),
    realised(
      'Two-sigma annual move, per name',
      // Vol is measured from log returns, so the 2-sigma move is taken in log
      // space: exp(-2s) - 1. A normal approximation would hand back losses
      // beyond -100% on the 90%-vol names, which cannot happen to a long.
      (s) => (Math.exp((-2 * s.realisedVolPct) / 100) - 1) * 100,
      'Each name two standard deviations down on its own realised volatility, assuming the moves coincide.',
    ),
  ].filter((s): s is StressScenario => s !== null)

  const stress: StressScenario[] = [...realisedScenarios, ...anchorScenarios].sort(
    (a, b) => a.totalLossUsd - b.totalLossUsd,
  )

  // Effective dates: a row the snapshot priced carries the snapshot's date,
  // one it did not keeps its transcribed date and goes on widening the spread.
  const vintage = vintageSpread(
    rows.map((r) => {
      const q = market?.quotes[r.position.ticker]
      return q ? { ...r.position, asOf: q.asOf } : r.position
    }),
  )

  return {
    riskBand: riskBand(risk),
    thesisFactor: THESIS_FACTOR,
    thesisFloorShare: targetThesisShare,
    thesisActualShare: shareOf(thesisRows.reduce((t, r) => t + exposureOf(r), 0)),
    bottleneckShare: shareOf(bottleneckUsd),
    perNameCapPct: nameCap,
    diversifierFactorCapPct: factorCap,
    convictionTilt: tilt,
    positions,
    reserveShare: shareOf(reserveUsd),
    reserveUsd,
    investedShare: shareOf(totalAllocated),
    // Kept for compatibility with the coverage copy: on the current universe
    // the caps never bind hard enough to leave anything beyond the reserve.
    unallocatedUsd: reserveUsd,
    unallocatedShare: shareOf(reserveUsd),
    factorTotals,
    chainTotals,
    forkExclusions: thesisDropped.map((d) => ({
      ticker: d.position.ticker,
      name: d.position.name,
      fork: d.position.architecturalBet?.fork ?? '',
      side: d.position.architecturalBet?.side ?? '',
      beatenBy: d.beatenBy,
    })),
    hedgeTickers: rows.filter((r) => r.position.hedge).map((r) => r.position.ticker),
    stress,
    vintageSpreadDays: vintage.days,
    vintageOldest: vintage.oldest,
    vintageNewest: vintage.newest,
    thesisUniverseCount: thesisUniverse.length,
    diversifierUniverseCount: diversifierUniverse.length,
    longUniverseCount: investableUniverse.length,
    sleeve,
  }
}
