/** Prints the state of the repository in about fifty lines.
 *
 *  This exists for agents. The data artefacts in public/data are large — the
 *  market snapshot is generated and large, so opening it merely to count rows
 *  spends context on numbers that are easier to verify mechanically.
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
  const equityRows = positionRows
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
  const ma200EntrySetups = defaultQualified.filter((row) => screenByTicker.get(row.model.ticker)?.ma200OpportunityState === 'entry-zone')
  line('modelled long candidates / longs', `${assessments.length} / ${equityLongs.length}`)
  line('non-long equity context rows', equityRows.length - equityLongs.length)
  line('universe scanned / pass stage 1', `${screenResults.length} / ${screenResults.filter((row) => row.passes).length}`)
  line('ready models / qualified', `${assessments.filter((row) => row.decisionReady).length} / ${defaultQualified.length}`)
  line(`qualified in 200MA entry zone`, `${ma200EntrySetups.length} / ${defaultQualified.length} (0%–${DEFAULT_UNIVERSE_SCREEN_POLICY.maxMa200OpportunityDistancePct}% above): ${ma200EntrySetups.map((row) => row.model.ticker).join(', ') || 'none'}`)
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

// --- files not to open ----------------------------------------------------
head('DO NOT READ WHOLE — query these with node -e or jq')
for (const p of [
  'public/data/market-data.json',
  'public/dashboards/defense.html',
]) line(p, kb(p))

head('COMMANDS')
line('npm run verify', 'planning and opportunity invariants — blocks the deploy')
line('npm run lint && npm run build', 'oxlint, then typecheck + vite build')
line('npm run fetch-market-data', 'refreshes the equity and FX snapshot')
console.log()
