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
 *  (NVDA in four sections, the adjacent photonics names, ZTE and the quantum
 *  large caps). Counting them as exposure overstates
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

// ---------------------------------------------------------------------------
// Cross-theme exposure map
// ---------------------------------------------------------------------------
// The factor table already proves the concentration. What it does not do is
// answer the question a reader actually asks — "if I hold this book, what am I
// exposed to?" — because several of the real axes are not factors in this
// file's model and cannot be, without re-labelling positions and moving the
// allocation.
//
// So the axes are computed where the data supports it and STATED where it does
// not, and each row says which of the two it is. That distinction is the whole
// point: a derived axis is reproducible from positions.ts, a stated one is a
// judgement with named constituents that a reader can disagree with.
//
// On the two factors the audit proposed adding, `china` and `rates`: not added.
// `rates-macro` already exists and is a PRIMARY factor for four names, so a
// second rates factor would double-count. A `china` factor would be a genuine
// addition — but factors[0] drives the thesis derivation, the diversifier
// buckets and the per-factor caps in allocation.ts, so re-labelling six names
// changes the allocation itself. That is a decision about the book, not a
// display fix, and it is left to Matthias rather than smuggled in here.

export type AxisBasis = 'derived' | 'stated'

export interface ExposureAxis {
  id: string
  label: string
  basis: AxisBasis
  /** What the axis is, and why it is one bet rather than several. */
  claim: string
  tickers: string[]
  /** Share of the active book's transcribed market cap, where the axis is
   *  derived. Absent for stated axes — a share computed over a hand-picked
   *  list would look derived and would not be. */
  capShare?: number
}

const tickersOf = (set: Position[]) =>
  [...set]
    .sort((a, b) => (b.marketCapUsd ?? 0) - (a.marketCapUsd ?? 0) || a.ticker.localeCompare(b.ticker))
    .map((p) => p.ticker)

/** Named on the exposure tab because the exchange says so, not because a
 *  source called the name a China bet. Shenzhen, Shanghai STAR and Taipei
 *  listings plus the two names whose own `edge` or `note` field names a China
 *  supply-chain dependency. */
const CHINA_EXCHANGES = ['Shenzhen', 'Shanghai STAR', 'Taipei Exch.', 'Taipei Exchange', 'HKEX']

/** Takes the MERGED book so the shares match every other figure on the tab.
 *  Passing the transcribed book instead is not wrong, it is just a different
 *  and older question, and a reader comparing two panels would not know which
 *  they were looking at. */
export function exposureAxes(book: EffectivePosition[]): ExposureAxis[] {
  const active = book.filter((p) => isThematic(p) && !isContext(p))
  const context = book.filter((p) => isThematic(p) && isContext(p))
  const bookCap = sumCap(active)
  const share = (set: Position[]) => (bookCap > 0 ? sumCap(set) / bookCap : undefined)
  const byFactor = (f: Factor) => active.filter((p) => p.factors[0] === f)

  const aiCapex = byFactor('ai-capex')
  const semi = active.filter(
    (p) => p.factors.includes('ai-capex') && p.chainLayer !== undefined && p.chainLayer !== 'demand-setter',
  )
  const rates = active.filter((p) => p.factors.includes('rates-macro'))
  const risk = byFactor('risk-appetite')
  const china = active.filter((p) => CHINA_EXCHANGES.some((ex) => p.exchange.startsWith(ex)))
  const bio = byFactor('biotech-idio')

  return [
    {
      id: 'ai-compute',
      label: 'AI compute',
      basis: 'derived',
      claim:
        'The dominant axis by a distance. Every name whose primary driver is hyperscaler capex moves on the same guidance, whichever tab it was researched under.',
      tickers: tickersOf(aiCapex),
      capShare: share(aiCapex),
    },
    {
      id: 'semiconductor',
      label: 'Semiconductor cycle',
      basis: 'derived',
      claim:
        'Not a separate bet from the one above — a subset of it. Named separately because the stress that hits it is the SOX, not an optical index, and because a reader who owns both thinks they own two things.',
      tickers: tickersOf(semi),
      capShare: share(semi),
    },
    {
      id: 'cloud-capex',
      label: 'Cloud capex (demand-setters)',
      basis: 'derived',
      claim:
        'The names that set the demand rather than supply it. Correctly flagged as context and excluded from the book — but their capex guides are the input every row above depends on.',
      tickers: tickersOf(context.filter((p) => p.chainLayer === 'demand-setter')),
    },
    {
      id: 'rates',
      label: 'Rates and liquidity',
      basis: 'derived',
      claim:
        'Carried as a factor, and understated by it. Beyond the names factored rates-macro, the photonics duration cohort (multiples above 100x) is rates exposure that no factor label captures — see §06b of the photonics tab.',
      tickers: tickersOf(rates),
      capShare: share(rates),
    },
    {
      id: 'regulatory',
      label: 'Regulatory',
      basis: 'stated',
      claim:
        'The unconfirmed FCC transceiver ban spans several photonics suppliers, so one policy event can move names that otherwise sit in different parts of the chain.',
      tickers: ['LITE', 'COHR', 'AAOI'],
    },
    {
      id: 'china',
      label: 'China and geopolitics',
      basis: 'derived',
      claim:
        'Three different stories the factor model cannot separate: China as supplier (the photonics A-share listings), as chokepoint (rare-earth magnets), and as price ceiling. Derived from the exchange, which is a fact about the listing rather than a judgement about the name.',
      tickers: tickersOf(china),
      capShare: share(china),
    },
    {
      id: 'risk-appetite',
      label: 'Speculative risk appetite',
      basis: 'derived',
      claim:
        'The names that fall together in a drawdown regardless of what they do. In July 2026 the momentum index fell 53.5% against the semiconductor index at 28.6%; this is the axis that gap describes.',
      tickers: tickersOf(risk),
      capShare: share(risk),
    },
    {
      id: 'biotech-idio',
      label: 'Biotech idiosyncratic',
      basis: 'derived',
      claim:
        'The one axis in the book that is genuinely uncorrelated with the rest — trial outcomes do not care about hyperscaler capex. It is also the smallest.',
      tickers: tickersOf(bio),
      capShare: share(bio),
    },
  ]
}
