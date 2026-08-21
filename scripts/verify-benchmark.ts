import { assessBenchmark, EMPTY_BENCHMARK_INPUT, MAX_BEGINNER_ACTIVE_SLEEVE_PCT, type BenchmarkInput } from '../src/sections/allocator/benchmark'

function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message)
}

const empty = assessBenchmark(EMPTY_BENCHMARK_INPUT, 10_000, 0)
assert(!empty.ready, 'empty benchmark must fail closed')
assert(empty.baselineBudgetEur === 10_000 && empty.activeBudgetEur === 0, 'baseline must start at 100%')

const complete: BenchmarkInput = {
  indexName: 'Example broad global index',
  fundName: 'Example UCITS ETF',
  isin: 'IE00ABCDEFG1',
  ticker: 'EXAMPLE',
  venue: 'Example venue',
  tradingCurrency: 'EUR',
  domicile: 'Ireland',
  replication: 'Physical',
  terPct: 0.2,
  priceEur: 100,
  priceAsOf: '2026-08-21',
  productUrl: 'https://example.com/product',
  kidUrl: 'https://example.com/kid.pdf',
  broadDiversificationConfirmed: true,
  officialDocumentsConfirmed: true,
  brokerAvailableConfirmed: true,
}

const ready = assessBenchmark(complete, 10_000, 10)
assert(ready.ready, `complete benchmark blocked: ${ready.blockers.join('; ')}`)
assert(ready.baselineBudgetEur === 9_000 && ready.activeBudgetEur === 1_000, 'sleeve budgets must sum')
assert(ready.annualFundCostEur === 18, 'fund cost must apply to the baseline sleeve only')

const capped = assessBenchmark(complete, 10_000, 100)
assert(capped.activeBudgetEur === 10_000 * (MAX_BEGINNER_ACTIVE_SLEEVE_PCT / 100), 'active sleeve must be capped')

console.log('broad benchmark starts at 100% and fails closed')

