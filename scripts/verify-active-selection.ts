import {
  ACTIVE_FACTOR_CAP_PCT,
  ACTIVE_NAME_CAP_PCT,
  assessCandidate,
  buildActivePortfolio,
  emptyCandidate,
  type ActiveCandidateInput,
} from '../src/sections/allocator/active-selection'
import { FIXTURE_DATE, FIXTURE_MARKET } from './fixtures/market'

function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message)
}

// Frozen prices: whether LITE qualifies is a property of the market, not of
// the gates under test. See scripts/fixtures/market.ts.
const snapshot = FIXTURE_MARKET
const today = FIXTURE_DATE

const complete: ActiveCandidateInput = {
  ...emptyCandidate('lite'),
  ticker: 'LITE',
  thesis: 'A specific test thesis that can be falsified by slowing funded demand.',
  falsifier: 'Two reported quarters of falling accelerator demand.',
  horizonYears: 5,
  valuationMetric: 'EV / forward sales',
  valuationValue: 20,
  valuationAsOf: '2026-08-21',
  fundamentalPeriod: 'FY2026 Q2',
  fundamentalPublishedAt: '2026-08-15',
  reviewedAt: '2026-08-21',
  nextReviewAt: '2026-11-21',
  thesisSourceUrl: 'https://example.com/primary-evidence',
  valuationSourceUrl: 'https://example.com/valuation-calculation',
  officialSourcesConfirmed: true,
  noMaterialEventAfterReviewConfirmed: true,
  brokerAvailableConfirmed: true,
  roundTripCostPct: 1,
  bull: { probabilityPct: 40, totalReturnPct: 120 },
  base: { probabilityPct: 40, totalReturnPct: 50 },
  bear: { probabilityPct: 20, totalReturnPct: -50 },
}

const empty = assessCandidate(emptyCandidate('empty'), snapshot, 6, today)
assert(!empty.complete && !empty.qualifies, 'empty candidate must fail closed')

const assessed = assessCandidate(complete, snapshot, 6, today)
assert(assessed.complete, `complete candidate blocked: ${assessed.blockers.join('; ')}`)
assert(assessed.qualifies, 'positive after-cost edge must qualify')
assert((assessed.priceEur ?? 0) > 0, 'EUR reference price must be derived from snapshot FX')

const noEdge = assessCandidate({ ...complete, bull: { probabilityPct: 40, totalReturnPct: 10 }, base: { probabilityPct: 40, totalReturnPct: 5 }, bear: { probabilityPct: 20, totalReturnPct: -20 } }, snapshot, 6, today)
assert(noEdge.complete && !noEdge.qualifies, 'complete evidence without benchmark edge must not qualify')

const stale = assessCandidate({ ...complete, fundamentalPublishedAt: '2025-01-01' }, snapshot, 6, today)
assert(stale.blockers.some((blocker) => blocker.includes('older')), 'stale fundamentals must block')

const second: ActiveCandidateInput = { ...complete, id: 'cohr', ticker: 'COHR', thesisSourceUrl: 'https://example.com/cohr-evidence', valuationSourceUrl: 'https://example.com/cohr-valuation' }
const portfolio = buildActivePortfolio([complete, second], snapshot, 6, 10_000, 20, today)
assert(portfolio.blockers.length === 0, `portfolio blocked: ${portfolio.blockers.join('; ')}`)
assert(portfolio.correlations.length === 1 && portfolio.correlations[0].observations >= 90, 'pair correlation must be measured from history')
assert(portfolio.allocations.every((row) => row.totalCapitalPct <= ACTIVE_NAME_CAP_PCT + 1e-9), 'per-name cap must hold')
const factorTotals = new Map<string, number>()
for (const row of portfolio.allocations) factorTotals.set(row.factor, (factorTotals.get(row.factor) ?? 0) + row.totalCapitalPct)
assert([...factorTotals.values()].every((total) => total <= ACTIVE_FACTOR_CAP_PCT + 1e-9), 'factor cap must hold')

console.log('active selection fails closed and uses sourced edge, volatility and measured correlation')
