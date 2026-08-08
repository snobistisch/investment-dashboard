import type { Factor, Position } from '../../data/positions'
import { positions, THEMATIC_SECTIONS } from '../../data/positions'

// Every number on the exposure tab is computed here from positions.ts.
// Nothing is hardcoded — if a position changes, the headline changes with it.

const thematic = new Set<string>(THEMATIC_SECTIONS)

/** A position is part of the research book if any of its sections is thematic.
 *  Citrini-only rows are third-party idea flow, not exposure. */
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
export const citriniOnly = positions.filter((p) => !isThematic(p))
export const activeBook = thematicPositions.filter((p) => !isContext(p))

export interface FactorRow {
  factor: Factor
  count: number
  countShare: number
  capUsd: number
  capShare: number
  /** Positions in this bucket that carry no market cap at all. */
  missingCap: number
}

/** Buckets by PRIMARY factor — factors[0]. A name's secondary factors are
 *  real but do not decide what its P&L keys off first. */
export function factorBreakdown(set: Position[]): FactorRow[] {
  const byFactor = new Map<Factor, Position[]>()
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

/** Every ticker appearing in two or more sections. */
export function crossSectionOverlap(): OverlapRow[] {
  return positions
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

export function chainBreakdown(set: Position[]) {
  const rows = CHAIN_ORDER.map((layer) => {
    const ps = set.filter((p) => p.chainLayer === layer)
    return { layer, count: ps.length, capUsd: sumCap(ps) }
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
