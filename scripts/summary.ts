/** Prints the state of the repository in about fifty lines.
 *
 *  This exists for agents. The data artefacts in public/data are large — the
 *  price history alone is 375 KB, roughly a fifth of every tracked byte in the
 *  repository — and an agent that opens one to answer "how many assets are
 *  rated" has spent a large part of its context on numbers it cannot check by
 *  eye anyway.
 *
 *  So: read this output first. It answers the questions that are usually asked
 *  before any file needs opening, and it is generated from the files
 *  themselves, so it cannot drift from them.
 *
 *      npm run summary
 */

import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { equityOpportunityModels } from '../src/data/equity-opportunities'
import { positions as positionRows } from '../src/data/positions'
import type { MarketSnapshot } from '../src/data/market-data'
import { isDirectlyTradable } from '../src/sections/allocator/allocation'
import { DEFAULT_OPPORTUNITY_POLICY } from '../src/sections/opportunities/model'
import { assessOpportunity } from '../src/sections/opportunities/opportunity'
import { DEFAULT_UNIVERSE_SCREEN_POLICY, screenUniversePosition } from '../src/sections/opportunities/universe-screen'

const HERE = dirname(fileURLToPath(import.meta.url))
const at = (p: string) => resolve(HERE, '..', p)

const kb = (p: string) => (existsSync(at(p)) ? `${(statSync(at(p)).size / 1024).toFixed(0)} KB` : 'absent')
const readJson = <T>(p: string): T | undefined =>
  existsSync(at(p)) ? (JSON.parse(readFileSync(at(p), 'utf8')) as T) : undefined

const line = (label: string, value: string | number) =>
  console.log(`  ${label.padEnd(34)} ${value}`)
const head = (title: string) => console.log(`\n${title}\n${'-'.repeat(title.length)}`)

// --- the book -------------------------------------------------------------
const positions = readFileSync(at('src/data/positions.ts'), 'utf8')
const sections = [...positions.matchAll(/\/\/ ([A-Z ]+) — (\d+) tagged '([a-z-]+)', (\d+) transcribed here/g)]

head('BOOK — src/data/positions.ts')
line('rows transcribed', (positions.match(/\n {4}ticker: '/g) ?? []).length)
for (const [, name, tagged, , here] of sections) {
  line(`  ${name.trim().toLowerCase()}`, `${tagged} tagged, ${here} transcribed here`)
}

// --- market data ----------------------------------------------------------
interface Snapshot {
  fetchedAt: string
  quotes: Record<string, { marketCapUsd?: number }>
  correlations?: Record<string, { value: number; observations: number }>
  unmapped: unknown[]
}
const snap = readJson<Snapshot>('public/data/market-data.json')
interface OpportunityHistory {
  builtAt: string
  snapshots: { asOf: string; ticker: string; modelVersion: string }[]
}
const opportunityHistory = readJson<OpportunityHistory>('public/data/equity-opportunity-history.json')
head('MARKET SNAPSHOT — public/data/market-data.json')
if (snap) {
  const quotes = Object.values(snap.quotes)
  line('fetched', snap.fetchedAt.slice(0, 10))
  line('age (days)', ((Date.now() - Date.parse(snap.fetchedAt)) / 86_400_000).toFixed(1))
  line('priced / with cap / unmapped', `${quotes.length} / ${quotes.filter((q) => q.marketCapUsd !== undefined).length} / ${snap.unmapped.length}`)
  line('equity charts / with 200MA', `${Object.keys(snap.equityCharts ?? {}).length} / ${quotes.filter((q) => q.trend200).length}`)
  line('measured correlation pairs', Object.keys(snap.correlations ?? {}).length)
} else line('status', 'absent — the site falls back to transcribed values')

// --- equity opportunities -------------------------------------------------
head('EQUITY OPPORTUNITIES — src/data/equity-opportunities.ts')
if (snap) {
  const today = new Date().toISOString().slice(0, 10)
  const assessments = equityOpportunityModels.map((model) => {
    const position = positionRows.find((row) => row.ticker === model.ticker)
    return assessOpportunity(
      model,
      (snap as unknown as MarketSnapshot).quotes[model.ticker],
      DEFAULT_OPPORTUNITY_POLICY,
      position ? isDirectlyTradable(position) : false,
      today,
    )
  })
  const states = new Map<string, number>()
  for (const assessment of assessments) states.set(assessment.state, (states.get(assessment.state) ?? 0) + 1)
  const equityRows = positionRows.filter((row) => !row.sections.includes('crypto'))
  const equityLongs = equityRows.filter((row) => row.stance === 'long')
  const screenResults = equityLongs.map((position) => screenUniversePosition(
    position,
    (snap as unknown as MarketSnapshot).quotes[position.ticker],
    isDirectlyTradable(position),
    DEFAULT_UNIVERSE_SCREEN_POLICY,
    DEFAULT_OPPORTUNITY_POLICY.maxQuoteBusinessSessions,
    today,
  ))
  const screenByTicker = new Map(screenResults.map((row) => [row.ticker, row]))
  const defaultQualified = assessments.filter((row) => row.positiveEdge && screenByTicker.get(row.model.ticker)?.passes)
  line('modelled long candidates / longs', `${assessments.length} / ${equityLongs.length}`)
  line('non-long equity context rows', equityRows.length - equityLongs.length)
  line('universe scanned / pass stage 1', `${screenResults.length} / ${screenResults.filter((row) => row.passes).length}`)
  line('ready models / qualified', `${assessments.filter((row) => row.decisionReady).length} / ${defaultQualified.length}`)
  line('states', [...states].map(([state, count]) => `${state} ${count}`).join(' · '))
  line('default annual hurdle', `${DEFAULT_OPPORTUNITY_POLICY.benchmarkAnnualReturnPct}% benchmark + ${DEFAULT_OPPORTUNITY_POLICY.requiredActivePremiumPct}pp premium`)
  line('model review vintage', [...new Set(equityOpportunityModels.map((model) => model.reviewedAt))].join(', '))
  line('next mandatory review', equityOpportunityModels.map((model) => model.nextReviewAt).sort()[0])
  if (opportunityHistory) {
    const dates = [...new Set(opportunityHistory.snapshots.map((row) => row.asOf))]
    line('history snapshots / market dates', `${opportunityHistory.snapshots.length} / ${dates.length}`)
    line('history built', opportunityHistory.builtAt.slice(0, 10))
  } else line('history', 'absent — run npm run build-opportunity-history')
} else line('status', 'market snapshot absent — models cannot become decision-ready')

// --- crypto market and frozen forecast ----------------------------------
interface CryptoMarket {
  fetchedAt: string
  scenarioAsOf: string
  rows: { ticker: string; priceUsd: number; vol24hUsd: number; fdvx: number }[]
}
const cryptoMarket = readJson<CryptoMarket>('public/data/crypto-market.json')
head('CRYPTO MARKET — public/data/crypto-market.json')
if (cryptoMarket) {
  line('fetched', cryptoMarket.fetchedAt.slice(0, 19) + 'Z')
  line('age (hours)', ((Date.now() - Date.parse(cryptoMarket.fetchedAt)) / 3_600_000).toFixed(1))
  line('priced / total', `${cryptoMarket.rows.filter((r) => r.priceUsd > 0).length} / ${cryptoMarket.rows.length}`)
  line('scenario targets frozen', cryptoMarket.scenarioAsOf)
} else line('status', 'absent — run npm run fetch-crypto-market')

// --- risk rating ----------------------------------------------------------
interface Risk {
  fetchedAt: string
  rows: { ticker: string; r?: number; bucket?: string; measured: { partialWindow: boolean } }[]
  failures: string[]
}
const risk = readJson<Risk>('public/data/risk-rating.json')
head('RISK RATING — public/data/risk-rating.json')
if (risk) {
  const buckets = new Map<string, number>()
  for (const r of risk.rows) buckets.set(r.bucket ?? 'unrated', (buckets.get(r.bucket ?? 'unrated') ?? 0) + 1)
  line('fetched', risk.fetchedAt.slice(0, 10))
  line('rated / total', `${risk.rows.filter((r) => r.r !== undefined).length} / ${risk.rows.length}`)
  line('buckets', [...buckets].map(([k, v]) => `${k} ${v}`).join(' · '))
  line('partial windows (<1y history)', risk.rows.filter((r) => r.measured.partialWindow).length)
  line('failures', risk.failures.length)
} else line('status', 'absent — run npm run fetch-risk-rating')

// --- portfolio ------------------------------------------------------------
interface Portfolio {
  builtAt: string
  benchmark: string
  stats: {
    assets: number
    clusteredAssets: number
    unclusteredAssets: string[]
    clusters: number
    medianPairwiseActiveCorrelation?: number
    medianPairwiseActiveCorrelationLiquid?: number
    medianPairwiseActiveCorrelationStress?: number
    pairsWithTooLittleOverlap: number
  }
  clusters: { id: number; members: string[]; label: string }[]
  rows: {
    ticker: string
    scenarioEdgeVsBtcPct: number
    scenarioEdgeTerminalVsBtcPct: number
    scenarioLegs: { returnPct: number }[]
    observations: number
    vol24hUsdM: number
    fdvx: number
  }[]
}
const pf = readJson<Portfolio>('public/data/portfolio.json')
head('PORTFOLIO — public/data/portfolio.json')
if (pf) {
  line('built', pf.builtAt.slice(0, 10))
  line('benchmark (never a position)', pf.benchmark)
  line('assets / clustered / clusters', `${pf.stats.assets} / ${pf.stats.clusteredAssets} / ${pf.stats.clusters}`)
  line('median ACTIVE corr, all measured', pf.stats.medianPairwiseActiveCorrelation ?? 'n/a')
  line('median ACTIVE corr, liquid pairs', pf.stats.medianPairwiseActiveCorrelationLiquid ?? 'n/a')
  line('median ACTIVE corr, BTC stress', pf.stats.medianPairwiseActiveCorrelationStress ?? 'n/a')
  line('unclustered (<90d)', pf.stats.unclusteredAssets.join(', ') || 'none')
  line('pairs too thin to measure', pf.stats.pairsWithTooLittleOverlap)
  const multi = pf.clusters.filter((c) => c.members.length > 1)
  line('multi-name clusters', multi.length ? multi.map((c) => `(${c.members.join(',')})`).join(' ') : 'none')
  const raw = pf.rows.filter((r) => r.scenarioEdgeVsBtcPct > 0)
  const robust = raw.filter((r) => {
    const spread = r.scenarioLegs[0].returnPct - r.scenarioLegs[2].returnPct
    return r.scenarioEdgeTerminalVsBtcPct - 1 - 0.05 * spread > 0 && r.observations >= 90 && r.vol24hUsdM >= 1 && r.fdvx <= 3
  })
  line('raw positive scenario edge', raw.map((r) => r.ticker).join(', ') || 'none')
  line('pilot default (5pp + 1% cost)', robust.map((r) => r.ticker).join(', ') || 'none')
} else line('status', 'absent — run npm run build-portfolio')

// --- files not to open ----------------------------------------------------
head('DO NOT READ WHOLE — query these with node -e or jq')
for (const p of [
  'public/data/crypto-history.json',
  'public/data/crypto-market.json',
  'public/data/portfolio.json',
  'public/data/market-data.json',
  'public/dashboards/crypto.html',
  'public/dashboards/defense.html',
]) line(p, kb(p))

head('COMMANDS')
line('npm run verify', 'decision, opportunity and quantitative invariants — blocks the deploy')
line('npm run lint && npm run build', 'oxlint, then typecheck + vite build')
line('npm run fetch-risk-rating', 'CoinGecko, ~10 min, rewrites two data files')
line('npm run fetch-crypto-market', 'refreshes all live crypto decision inputs')
line('npm run build-portfolio', 'seconds, reads the history, patches portfolio.html')
console.log()
