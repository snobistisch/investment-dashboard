import type { Factor, Position } from '../../data/positions'
import { positions, THEMATIC_SECTIONS } from '../../data/positions'
import type { EffectivePosition } from '../../data/market-data'

// Every number on the exposure tab is computed here from positions.ts.
// Nothing is hardcoded — if a position changes, the headline changes with it.

const thematic = new Set<string>(THEMATIC_SECTIONS)

/** A position is part of the research book if any of its sections is thematic.
 *  Every row now is: the one non-thematic section this book ever carried, an
 *  idea-flow tracker, was removed on 11 Aug 2026. The predicate stays because
 *  THEMATIC_SECTIONS is still what defines the book, and a future non-thematic
 *  section would otherwise land in the concentration figures unnoticed. */
export function isThematic(p: Position) {
  return p.sections.some((s) => thematic.has(s))
}

/** Names their own section explicitly flags as not-real-exposure to its theme
 *  (NVDA in four sections, the adjacent photonics names, ZTE, the quantum
 *  large caps, the HYPE benchmark row). Counting them as exposure overstates
 *  the book; hiding them understates it. Both figures are shown. */
export function isContext(p: Position) {
  return p.stance === 'context'
}

export const thematicPositions = positions.filter(isThematic)
export const activeBook = thematicPositions.filter((p) => !isContext(p))

export interface FactorRow {
  factor: Factor
  count: number
  countShare: number
  capUsd: number
  capShare: number
  /** Positions in this bucket that carry no market cap at all. */
  missingCap: number
  /** How many of this bucket's caps are live rather than transcribed, so a
   *  row can state its own provenance instead of deferring to the banner. */
  liveCap: number
  /** The names in this bucket, largest cap first. An aggregate that does not
   *  name its constituents cannot be checked against the book. */
  members: EffectivePosition[]
}

/** Buckets by PRIMARY factor — factors[0]. A name's secondary factors are
 *  real but do not decide what its P&L keys off first. */
export function factorBreakdown(set: EffectivePosition[]): FactorRow[] {
  const byFactor = new Map<Factor, EffectivePosition[]>()
  for (const p of set) {
    const primary = p.factors[0]
    const bucket = byFactor.get(primary)
    if (bucket) bucket.push(p)
    else byFactor.set(primary, [p])
  }

  const totalCount = set.length
  const totalCap = sumCap(set)

  return [...byFactor.entries()]
    .map(([factor, ps]) => ({
      factor,
      count: ps.length,
      countShare: totalCount ? ps.length / totalCount : 0,
      capUsd: sumCap(ps),
      capShare: totalCap ? sumCap(ps) / totalCap : 0,
      missingCap: ps.filter((p) => p.marketCapUsd === undefined).length,
      liveCap: ps.filter((p) => p.capSource === 'live').length,
      members: [...ps].sort(
        (a, b) => (b.marketCapUsd ?? 0) - (a.marketCapUsd ?? 0) || a.ticker.localeCompare(b.ticker),
      ),
    }))
    .sort((a, b) => b.capShare - a.capShare || b.count - a.count)
}

export function sumCap(set: Position[]) {
  return set.reduce((total, p) => total + (p.marketCapUsd ?? 0), 0)
}

export function capCoverage(set: Position[]) {
  const withCap = set.filter((p) => p.marketCapUsd !== undefined)
  return {
    withCap: withCap.length,
    total: set.length,
    missing: set.length - withCap.length,
    capUsd: sumCap(set),
  }
}

/** The same coverage split by where each number came from. Takes the merged
 *  book; on the transcribed-only fallback every covered row reads as
 *  'transcribed' and the figure equals capCoverage above. */
export function capCoverageByProvenance(set: EffectivePosition[]) {
  const live = set.filter((p) => p.capSource === 'live')
  const transcribed = set.filter((p) => p.capSource === 'transcribed')
  return {
    total: set.length,
    live: live.length,
    transcribed: transcribed.length,
    absent: set.filter((p) => p.capSource === 'absent').length,
    liveCapUsd: sumCap(live),
    transcribedCapUsd: sumCap(transcribed),
    capUsd: sumCap(set),
  }
}

/** The single largest contributors to the cap-weighted figure. A weight that
 *  rests on two names is a different fact from one spread across thirty. */
export function topByCap(set: Position[], n: number) {
  const total = sumCap(set)
  return set
    .filter((p) => p.marketCapUsd !== undefined)
    .sort((a, b) => (b.marketCapUsd ?? 0) - (a.marketCapUsd ?? 0))
    .slice(0, n)
    .map((p) => ({ position: p, share: total ? (p.marketCapUsd ?? 0) / total : 0 }))
}

export interface OverlapRow {
  ticker: string
  name: string
  sections: string[]
  factors: Factor[]
  marketCapUsd?: number
}

/** Every ticker appearing in two or more sections. Takes the set so it can run
 *  over merged positions; defaults to the transcribed book. */
export function crossSectionOverlap(set: Position[] = positions): OverlapRow[] {
  return set
    .filter((p) => p.sections.length > 1)
    .sort((a, b) => b.sections.length - a.sections.length || a.ticker.localeCompare(b.ticker))
    .map((p) => ({
      ticker: p.ticker,
      name: p.name,
      sections: p.sections,
      factors: p.factors,
      marketCapUsd: p.marketCapUsd,
    }))
}

/** Tickers that appear in exactly one section but share a primary factor with
 *  names in other sections. This is the overlap that ticker-matching misses —
 *  and on this book it is the larger number by a wide margin. */
export function hiddenFactorOverlap(set: Position[]) {
  const byFactor = new Map<Factor, Set<string>>()
  for (const p of set) {
    const primary = p.factors[0]
    const sections = byFactor.get(primary) ?? new Set<string>()
    for (const s of p.sections) if (thematic.has(s)) sections.add(s)
    byFactor.set(primary, sections)
  }
  return [...byFactor.entries()]
    .map(([factor, sections]) => ({ factor, sections: [...sections].sort() }))
    .filter((row) => row.sections.length > 1)
    .sort((a, b) => b.sections.length - a.sections.length)
}

export type ChainLayer = NonNullable<Position['chainLayer']>

export const CHAIN_ORDER: ChainLayer[] = [
  'substrate',
  'component',
  'module',
  'system',
  'demand-setter',
]

export function chainBreakdown(set: EffectivePosition[]) {
  const rows = CHAIN_ORDER.map((layer) => {
    const ps = set.filter((p) => p.chainLayer === layer)
    return {
      layer,
      count: ps.length,
      capUsd: sumCap(ps),
      members: [...ps].sort(
        (a, b) => (b.marketCapUsd ?? 0) - (a.marketCapUsd ?? 0) || a.ticker.localeCompare(b.ticker),
      ),
    }
  })
  const unclassified = set.filter((p) => p.chainLayer === undefined).length
  const totalClassified = rows.reduce((t, r) => t + r.count, 0)
  return { rows, unclassified, totalClassified }
}

/** Arithmetic illustration only: apply the observed July 2026 index move to
 *  the share of the book sitting in one driver. Not a forecast, not a model —
 *  a multiplication, shown so nobody has to do it in their head. */
export function drawdownIllustration(concentrationShare: number, indexMove: number) {
  return concentrationShare * indexMove
}

/** How far apart the market-data vintages in a set are, in days.
 *
 *  This matters more than it looks. On the transcribed book the photonics rows
 *  are the 7 Aug 2026 close and every other section is 7-9 July. The July 2026
 *  drawdown sits BETWEEN those two dates, so any figure weighing a thesis name
 *  against a diversifier compared a post-correction price with a pre-correction
 *  one, and the diversifiers' own `edge` texts described a world that no longer
 *  existed when the photonics rows were written.
 *
 *  Run over merged positions this reads effective dates, so a live snapshot
 *  collapses the spread to hours and the warning below clears on its own
 *  merits. Rows that stayed unmapped keep their transcribed date and keep
 *  widening the spread, which is the honest result: they really are that old. */
export function vintageSpread(set: Position[]) {
  const times = set.map((p) => Date.parse(p.asOf)).filter((t) => !Number.isNaN(t))
  if (times.length === 0) return { days: 0, oldest: undefined, newest: undefined }
  const min = Math.min(...times)
  const max = Math.max(...times)
  return {
    days: Math.round((max - min) / 86_400_000),
    oldest: new Date(min).toISOString().slice(0, 10),
    newest: new Date(max).toISOString().slice(0, 10),
  }
}

/** Beyond this the tab says so rather than quietly weighing across vintages. */
export const VINTAGE_WARN_DAYS = 14

/** Oldest `asOf` per primary factor, so a factor table can carry its own
 *  vintage instead of deferring to a note at the bottom of the page. */
export function oldestAsOfByFactor(set: Position[]) {
  const out = new Map<Factor, string>()
  for (const p of set) {
    const current = out.get(p.factors[0])
    if (!current || p.asOf < current) out.set(p.factors[0], p.asOf)
  }
  return out
}
