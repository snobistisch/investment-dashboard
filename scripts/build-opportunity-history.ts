import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MarketSnapshot } from '../src/data/market-data'
import { equityOpportunityModels } from '../src/data/equity-opportunities'
import { positions } from '../src/data/positions'
import { isDirectlyTradable } from '../src/sections/allocator/allocation'
import { DEFAULT_OPPORTUNITY_POLICY } from '../src/sections/opportunities/model'
import { assessOpportunity } from '../src/sections/opportunities/opportunity'

const here = dirname(fileURLToPath(import.meta.url))
const at = (path: string) => resolve(here, '..', path)
const output = at('public/data/equity-opportunity-history.json')

interface OpportunityHistoryRow {
  asOf: string
  ticker: string
  modelVersion: string
  currency: string
  price: number
  expectedTerminalValue: number
  annualisedReturnPct: number
  hurdleEdgePct: number
  maxEntryPrice: number
  state: string
}

interface OpportunityHistory {
  schemaVersion: 1
  builtAt: string
  policy: typeof DEFAULT_OPPORTUNITY_POLICY
  snapshots: OpportunityHistoryRow[]
}

const market = JSON.parse(readFileSync(at('public/data/market-data.json'), 'utf8')) as MarketSnapshot
const modelQuoteDates = equityOpportunityModels
  .map((model) => market.quotes[model.ticker]?.asOf)
  .filter((date): date is string => Boolean(date))
const asOf = modelQuoteDates.sort().at(-1) ?? market.fetchedAt.slice(0, 10)
const existing: OpportunityHistory = existsSync(output)
  ? JSON.parse(readFileSync(output, 'utf8')) as OpportunityHistory
  : { schemaVersion: 1, builtAt: market.fetchedAt, policy: DEFAULT_OPPORTUNITY_POLICY, snapshots: [] }

if (existing.schemaVersion !== 1) throw new Error('Unsupported equity opportunity history schema.')

const replacements = new Set(equityOpportunityModels.map((model) => `${asOf}|${model.ticker}|${model.version}`))
const snapshots = existing.snapshots.filter((row) => !replacements.has(`${row.asOf}|${row.ticker}|${row.modelVersion}`))

for (const model of equityOpportunityModels) {
  const position = positions.find((row) => row.ticker === model.ticker)
  const assessment = assessOpportunity(
    model,
    market.quotes[model.ticker],
    DEFAULT_OPPORTUNITY_POLICY,
    Boolean(position && isDirectlyTradable(position)),
    asOf,
  )
  if (
    !assessment.quote
    || assessment.expectedTerminalValue === undefined
    || assessment.annualisedExpectedTerminalWealthReturnPct === undefined
    || assessment.hurdleEdgePct === undefined
    || assessment.maxEntryPrice === undefined
  ) continue
  snapshots.push({
    asOf,
    ticker: model.ticker,
    modelVersion: model.version,
    currency: model.currency,
    price: assessment.quote.priceLocal,
    expectedTerminalValue: assessment.expectedTerminalValue,
    annualisedReturnPct: assessment.annualisedExpectedTerminalWealthReturnPct,
    hurdleEdgePct: assessment.hurdleEdgePct,
    maxEntryPrice: assessment.maxEntryPrice,
    state: assessment.state,
  })
}

snapshots.sort((left, right) => left.asOf.localeCompare(right.asOf) || left.ticker.localeCompare(right.ticker) || left.modelVersion.localeCompare(right.modelVersion))

const history: OpportunityHistory = {
  schemaVersion: 1,
  builtAt: market.fetchedAt,
  policy: DEFAULT_OPPORTUNITY_POLICY,
  snapshots,
}

writeFileSync(output, `${JSON.stringify(history, null, 2)}\n`)
console.log(`equity opportunity history: ${snapshots.length} rows through ${asOf}`)
