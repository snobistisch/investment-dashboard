/** Measures what a portfolio builder needs and cannot guess.
 *
 *  The objective this file is built around is Matthias's, stated on 15 Aug
 *  2026: bitcoin is the benchmark and not a holding, the book should beat it,
 *  and it is allowed to be risky. That objective decides the statistics.
 *
 *  EVERYTHING HERE IS MEASURED RELATIVE TO BITCOIN. The daily figure for each
 *  asset is its log return minus bitcoin's log return on the same day — the
 *  active return. Two consequences, and they are the whole design:
 *
 *    activeVol   how far this name can travel away from bitcoin in a year.
 *                Against a beat-the-benchmark objective this is the resource,
 *                not the danger. A name with almost no active volatility is a
 *                bitcoin tracker with extra steps and cannot beat it.
 *    activeCorr  whether two names are the SAME deviation from bitcoin. This
 *                is the number the book has never had, and it is the reason
 *                forty tickers can be three bets.
 *
 *  Absolute volatility is deliberately not the weighting input. Weighting on
 *  absolute volatility minimises how much the book moves, which for someone
 *  who wants to outperform bitcoin is the wrong objective solved well: it
 *  concentrates in the most bitcoin-like names and converges on bitcoin's
 *  return minus costs.
 *
 *  Run it, do not call it:  npm run build-portfolio
 *
 *  Output:
 *    public/data/portfolio.json          the artefact, with provenance
 *    public/dashboards/portfolio.html    a generated block between markers, so
 *                                        the page stays static and fetches
 *                                        nothing at runtime
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CRYPTO_HTML = resolve(HERE, '../public/dashboards/crypto.html')
const HISTORY_JSON = resolve(HERE, '../public/data/crypto-history.json')
const RISK_JSON = resolve(HERE, '../public/data/risk-rating.json')
const PORTFOLIO_HTML = resolve(HERE, '../public/dashboards/portfolio.html')
const OUT_JSON = resolve(HERE, '../public/data/portfolio.json')

const SCHEMA_VERSION = 1

/** The benchmark. Not a position — that is the point. */
const BENCHMARK = 'BTC'

/** Fewer overlapping days than this and the pair's correlation is noise
 *  dressed as a number. Fourteen of the forty listed inside the last year, so
 *  this bites and is meant to. */
const MIN_OVERLAP_DAYS = 90

/** Trading days per year, for annualising. Crypto trades every day; 365 is the
 *  honest constant here, not the 252 an equity book would use. */
const DAYS_PER_YEAR = 365

/** Correlation above which two names are treated as the same bet when
 *  clustering. Set from the data rather than from theory — see the note the
 *  script prints, which reports the median pairwise active correlation. */
const CLUSTER_CORR = 0.6

type Closes = { d: string; c: number }[]

interface HistoryFile {
  fetchedAt: string
  series: Record<string, { from: string; to: string; closes: Closes }>
}

interface RiskFile {
  fetchedAt: string
  rows: {
    ticker: string
    r?: number
    bucket?: string
    measured: { realisedVolPct?: number; drawdownPct?: number; observations: number }
    inputs: { fdvx: number; floatPct: number; vol24hUsd: number }
  }[]
}

interface Token {
  tk: string
  nm: string
  cat: string
  tier: string
  chain: string
  mcap: number
  fdvx: number
  flt: number
  vol: number
  fee: number | null
  y1: number | null
  sc: [number, number][]
}

function readTokens(): Token[] {
  const html = readFileSync(CRYPTO_HTML, 'utf8')
  const start = html.indexOf('const TOKENS = [')
  const end = html.indexOf('\n];', start)
  if (start < 0 || end < 0) throw new Error('could not locate the TOKENS array in crypto.html')
  const literal = html.slice(start + 'const TOKENS = '.length, end + 2)
  return new Function(`return ${literal}`)() as Token[]
}

const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp

// ---------------------------------------------------------------------------
// Returns, aligned on a shared calendar
// ---------------------------------------------------------------------------

/** Daily log returns keyed by date. Keyed rather than arrayed because the
 *  forty series do not share a start date and eight do not share every day —
 *  aligning by index would silently compare a Tuesday with a Thursday. */
function logReturns(closes: Closes): Map<string, number> {
  const out = new Map<string, number>()
  for (let i = 1; i < closes.length; i++) {
    const prev = closes[i - 1].c
    const cur = closes[i].c
    if (prev > 0 && cur > 0) out.set(closes[i].d, Math.log(cur / prev))
  }
  return out
}

/** Active return: the asset's log return minus the benchmark's, on days both
 *  traded. Everything downstream is computed on this. */
function activeReturns(asset: Map<string, number>, bench: Map<string, number>) {
  const out = new Map<string, number>()
  for (const [date, r] of asset) {
    const b = bench.get(date)
    if (b !== undefined) out.set(date, r - b)
  }
  return out
}

function stdev(values: number[]) {
  if (values.length < 2) return undefined
  const mean = values.reduce((t, v) => t + v, 0) / values.length
  const variance = values.reduce((t, v) => t + (v - mean) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

/** Pearson correlation over the dates the two series share. */
function correlation(a: Map<string, number>, b: Map<string, number>) {
  const xs: number[] = []
  const ys: number[] = []
  for (const [date, v] of a) {
    const w = b.get(date)
    if (w !== undefined) {
      xs.push(v)
      ys.push(w)
    }
  }
  if (xs.length < MIN_OVERLAP_DAYS) return { rho: undefined, n: xs.length }
  const mx = xs.reduce((t, v) => t + v, 0) / xs.length
  const my = ys.reduce((t, v) => t + v, 0) / ys.length
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < xs.length; i++) {
    const a1 = xs[i] - mx
    const b1 = ys[i] - my
    num += a1 * b1
    dx += a1 * a1
    dy += b1 * b1
  }
  const den = Math.sqrt(dx * dy)
  return { rho: den > 0 ? num / den : undefined, n: xs.length }
}

// ---------------------------------------------------------------------------
// Clustering — average linkage on correlation distance
// ---------------------------------------------------------------------------
// Distance d = sqrt(0.5 * (1 - rho)): 0 when two names move identically
// against bitcoin, 1 when they are opposite. Average linkage rather than
// single, because single linkage chains — one moderately correlated pair drags
// two otherwise separate groups together, which is exactly the mistake a
// concentration check must not make.
//
// Cut at CLUSTER_CORR. A missing correlation (too little overlap) is treated
// as maximally distant, so a name with three months of history lands in its
// own cluster rather than being merged on no evidence.

function cluster(tickers: string[], rho: (a: string, b: string) => number | undefined) {
  const dist = (a: string, b: string) => {
    const r = rho(a, b)
    return r === undefined ? 1 : Math.sqrt(Math.max(0, 0.5 * (1 - r)))
  }
  const cutoff = Math.sqrt(Math.max(0, 0.5 * (1 - CLUSTER_CORR)))

  let groups = tickers.map((t) => [t])
  for (;;) {
    let best = { i: -1, j: -1, d: Infinity }
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        let total = 0
        let count = 0
        for (const a of groups[i]) {
          for (const b of groups[j]) {
            total += dist(a, b)
            count++
          }
        }
        const d = total / count
        if (d < best.d) best = { i, j, d }
      }
    }
    if (best.i < 0 || best.d > cutoff) break
    groups = groups
      .map((g, k) => (k === best.i ? [...groups[best.i], ...groups[best.j]] : g))
      .filter((_, k) => k !== best.j)
  }
  return groups
}

// ---------------------------------------------------------------------------

function main() {
  const tokens = readTokens()
  const history = JSON.parse(readFileSync(HISTORY_JSON, 'utf8')) as HistoryFile
  const risk = JSON.parse(readFileSync(RISK_JSON, 'utf8')) as RiskFile
  const riskBy = Object.fromEntries(risk.rows.map((r) => [r.ticker, r]))

  const bench = history.series[BENCHMARK]
  if (!bench) throw new Error(`no history for the benchmark ${BENCHMARK}`)
  const benchReturns = logReturns(bench.closes)

  // --- per-asset active statistics --------------------------------------
  const active = new Map<string, Map<string, number>>()
  for (const token of tokens) {
    if (token.tk === BENCHMARK) continue
    const series = history.series[token.tk]
    if (!series) continue
    active.set(token.tk, activeReturns(logReturns(series.closes), benchReturns))
  }

  const tickers = [...active.keys()]

  // --- correlation of active returns ------------------------------------
  const corr: Record<string, Record<string, number>> = {}
  const overlap: Record<string, Record<string, number>> = {}
  const pairwise: number[] = []
  for (const a of tickers) {
    corr[a] = {}
    overlap[a] = {}
    for (const b of tickers) {
      if (a === b) {
        corr[a][b] = 1
        continue
      }
      const { rho, n } = correlation(active.get(a)!, active.get(b)!)
      overlap[a][b] = n
      if (rho !== undefined) {
        corr[a][b] = round(rho, 4)
        if (a < b) pairwise.push(rho)
      }
    }
  }
  pairwise.sort((x, y) => x - y)
  const medianCorr = pairwise.length ? pairwise[Math.floor(pairwise.length / 2)] : undefined

  const groups = cluster(tickers, (a, b) => corr[a]?.[b])
  const clusterOf: Record<string, number> = {}
  groups.forEach((g, i) => g.forEach((t) => (clusterOf[t] = i)))

  // --- rows --------------------------------------------------------------
  const rows = tokens
    .filter((t) => t.tk !== BENCHMARK)
    .map((t) => {
      const a = active.get(t.tk)
      const values = a ? [...a.values()] : []
      const sd = stdev(values)
      const total = values.reduce((s, v) => s + v, 0)
      const r = riskBy[t.tk]
      return {
        ticker: t.tk,
        name: t.nm,
        category: t.cat,
        tier: t.tier,
        cluster: clusterOf[t.tk] ?? -1,
        /** Annualised standard deviation of the daily active return, per cent. */
        activeVolPct: sd === undefined ? undefined : round(sd * Math.sqrt(DAYS_PER_YEAR) * 100, 1),
        /** Total active log return over the measured window, per cent. This is
         *  the measured answer to "did it beat bitcoin", with no probability
         *  in it. Not annualised: the windows differ per asset. */
        activeReturnPct: values.length ? round((Math.exp(total) - 1) * 100, 1) : undefined,
        observations: values.length,
        marketCapUsdBn: t.mcap,
        fdvx: t.fdvx,
        floatPct: t.flt,
        vol24hUsdM: t.vol,
        feesUsdM: t.fee,
        riskRating: r?.r,
        riskBucket: r?.bucket,
      }
    })

  const clusters = groups.map((g, i) => ({
    id: i,
    members: g,
    /** The cluster's own name is not invented — it is the category tag that
     *  the most members already carry, or 'mixed' when there is no majority. */
    label: dominantCategory(g, tokens),
  }))

  const artefact = {
    schemaVersion: SCHEMA_VERSION,
    builtAt: new Date().toISOString(),
    benchmark: BENCHMARK,
    historyFetchedAt: history.fetchedAt,
    riskFetchedAt: risk.fetchedAt,
    method: {
      note:
        'All statistics are relative to the benchmark: daily active return = asset log return minus benchmark log return on the same day. Correlation is of active returns, so it answers "are these the same deviation from bitcoin", not "do they both go up when the market goes up".',
      minOverlapDays: MIN_OVERLAP_DAYS,
      daysPerYear: DAYS_PER_YEAR,
      clusterCorrelation: CLUSTER_CORR,
      linkage: 'average, on distance sqrt(0.5*(1-rho))',
    },
    stats: {
      assets: rows.length,
      medianPairwiseActiveCorrelation: medianCorr === undefined ? undefined : round(medianCorr, 4),
      clusters: clusters.length,
      pairsWithTooLittleOverlap: countThinPairs(tickers, corr),
    },
    clusters,
    rows,
    correlation: corr,
  }

  writeFileSync(OUT_JSON, JSON.stringify(artefact, null, 1) + '\n')
  console.log(`wrote ${OUT_JSON}`)
  console.log(`assets ${rows.length} · clusters ${clusters.length}`)
  console.log(
    `median pairwise ACTIVE correlation: ${medianCorr === undefined ? 'n/a' : medianCorr.toFixed(3)}`,
  )
  for (const c of clusters) {
    console.log(`  cluster ${c.id} (${c.label}, ${c.members.length}): ${c.members.join(' ')}`)
  }

  patchPage(artefact)
}

function dominantCategory(members: string[], tokens: Token[]) {
  const byTicker = Object.fromEntries(tokens.map((t) => [t.tk, t.cat]))
  const counts = new Map<string, number>()
  for (const m of members) {
    const c = byTicker[m] ?? 'other'
    counts.set(c, (counts.get(c) ?? 0) + 1)
  }
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return top && top[1] > members.length / 2 ? top[0] : 'mixed'
}

function countThinPairs(tickers: string[], corr: Record<string, Record<string, number>>) {
  let n = 0
  for (let i = 0; i < tickers.length; i++) {
    for (let j = i + 1; j < tickers.length; j++) {
      if (corr[tickers[i]]?.[tickers[j]] === undefined) n++
    }
  }
  return n
}

function patchPage(artefact: unknown) {
  let html: string
  try {
    html = readFileSync(PORTFOLIO_HTML, 'utf8')
  } catch {
    console.log(`${PORTFOLIO_HTML} does not exist yet — JSON written, page not patched`)
    return
  }
  const START = '/* PORTFOLIO-DATA-START'
  const END = '/* PORTFOLIO-DATA-END */'
  const from = html.indexOf(START)
  const to = html.indexOf(END)
  if (from < 0 || to < 0) {
    console.log('portfolio.html carries no PORTFOLIO-DATA markers — page not patched')
    return
  }
  const body =
    `${START} — generated by scripts/build-portfolio.ts, do not edit by hand.\n` +
    `   Active statistics against ${BENCHMARK} and the active-return correlation\n` +
    `   matrix, measured from public/data/crypto-history.json. */\n` +
    `const PORTFOLIO = ${JSON.stringify(artefact)};\n`
  writeFileSync(PORTFOLIO_HTML, html.slice(0, from) + body + html.slice(to))
  console.log(`patched ${PORTFOLIO_HTML}`)
}

main()
