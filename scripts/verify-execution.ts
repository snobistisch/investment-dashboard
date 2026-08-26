import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MarketSnapshot } from '../src/data/market-data'
import type { BenchmarkInput } from '../src/sections/allocator/benchmark'
import { buildConceptOrders, EMPTY_EXECUTION_INPUT, type ExecutionInput } from '../src/sections/allocator/execution'
import type { PlanningInput } from '../src/sections/allocator/planning'

function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message)
}

const here = dirname(fileURLToPath(import.meta.url))
const market = JSON.parse(readFileSync(resolve(here, '../public/data/market-data.json'), 'utf8')) as MarketSnapshot

const planning: PlanningInput = {
  goal: 'Long-term wealth building', horizonYears: 10, riskCapitalEur: 10_000,
  emergencyBufferConfirmed: true, moneyNotNeededConfirmed: true,
  maxLossEur: 5_000, maxLossPct: 50, contributionMode: 'one-off',
  monthlyContributionEur: null, existingInvestmentsEur: 0, broker: 'Example broker EU',
  fractionalShares: false, allowEtfs: true, allowStocks: false, activeSleevePct: 0,
}
const benchmark: BenchmarkInput = {
  indexName: 'Example broad global index', fundName: 'Example UCITS ETF',
  isin: 'IE00ABCDEFG1', ticker: 'EXAMPLE', venue: 'Example venue', tradingCurrency: 'EUR',
  domicile: 'Ireland', replication: 'Physical', terPct: 0.2,
  expectedAnnualReturnPct: 6, returnAssumptionUrl: 'https://example.com/return-method',
  priceEur: 100, priceAsOf: '2026-08-21', productUrl: 'https://example.com/product',
  kidUrl: 'https://example.com/kid.pdf', broadDiversificationConfirmed: true,
  officialDocumentsConfirmed: true, brokerAvailableConfirmed: true,
}
const execution: ExecutionInput = {
  ...EMPTY_EXECUTION_INPUT,
  fixedCostPerOrderEur: 2,
  fxCostPct: 0.25,
  slippageAllowancePct: 0.1,
  minimumOrderEur: 25,
  tranches: 2,
  windowStart: '2026-08-21',
  windowEnd: '2026-08-28',
  baselineLimitPriceEur: 100,
  costScheduleConfirmed: true,
  limitDisciplineConfirmed: true,
  recheckBeforeSubmitConfirmed: true,
}

const empty = buildConceptOrders(planning, benchmark, [], market, EMPTY_EXECUTION_INPUT, '2026-08-21')
assert(!empty.ready && empty.orders.length === 0, 'empty execution policy must fail closed')

const ready = buildConceptOrders(planning, benchmark, [], market, execution, '2026-08-21')
assert(ready.ready, `complete concept plan blocked: ${ready.blockers.join('; ')}`)
assert(ready.orders.length === 2, 'two tranches must produce two concept orders')
assert(ready.orders.every((order) => Number.isInteger(order.quantity) && !order.fractional), 'whole-share route must floor quantities')
assert(ready.totalCashUseEur <= 10_000, 'cost-inclusive cash use must not exceed risk capital')
assert((ready.snapshot?.orders.length ?? 0) === 2 && ready.snapshot?.status === 'concept-only', 'snapshot must preserve concept status and orders')

const tooSmall = buildConceptOrders({ ...planning, riskCapitalEur: 100 }, benchmark, [], market, { ...execution, minimumOrderEur: 100 }, '2026-08-21')
assert(!tooSmall.ready && tooSmall.orders.length === 0, 'unusable order size must fail closed')

const existingBook = buildConceptOrders({ ...planning, existingInvestmentsEur: 1_000 }, benchmark, [], market, execution, '2026-08-21')
assert(!existingBook.ready && existingBook.blockers.some((blocker) => blocker.includes('Existing holdings')), 'unmodelled existing holdings must block new orders')

console.log('concept orders include costs, limits, tranches and fail closed')
