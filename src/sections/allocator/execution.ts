import type { MarketSnapshot } from '../../data/market-data'
import { assessCandidate, buildActivePortfolio, type ActiveCandidateInput } from './active-selection'
import { assessBenchmark, type BenchmarkInput } from './benchmark'
import { assessPlanningInput, type PlanningInput } from './planning'

export interface ExecutionInput {
  fixedCostPerOrderEur: number | null
  fxCostPct: number | null
  slippageAllowancePct: number | null
  minimumOrderEur: number | null
  tranches: number | null
  windowStart: string
  windowEnd: string
  baselineLimitPriceEur: number | null
  stockLimitPricesEur: Record<string, number | null>
  costScheduleConfirmed: boolean
  limitDisciplineConfirmed: boolean
  recheckBeforeSubmitConfirmed: boolean
}

export const EMPTY_EXECUTION_INPUT: ExecutionInput = {
  fixedCostPerOrderEur: null,
  fxCostPct: null,
  slippageAllowancePct: null,
  minimumOrderEur: null,
  tranches: 1,
  windowStart: '',
  windowEnd: '',
  baselineLimitPriceEur: null,
  stockLimitPricesEur: {},
  costScheduleConfirmed: false,
  limitDisciplineConfirmed: false,
  recheckBeforeSubmitConfirmed: false,
}

export interface ConceptOrder {
  instrument: 'baseline' | 'active-stock'
  ticker: string
  name: string
  isin?: string
  venue: string
  tranche: number
  tranches: number
  side: 'BUY'
  quantity: number
  fractional: boolean
  referencePriceEur: number
  referencePriceAsOf: string
  limitPriceEur: number
  grossNotionalEur: number
  estimatedCostsEur: number
  maximumCashUseEur: number
}

export interface DecisionSnapshot {
  schemaVersion: 1
  createdAt: string
  status: 'concept-only'
  warning: string
  planning: PlanningInput
  benchmark: BenchmarkInput
  candidates: ActiveCandidateInput[]
  execution: ExecutionInput
  market: { fetchedAt?: string; fxAsOf?: string; providers?: MarketSnapshot['providers'] }
  orders: ConceptOrder[]
}

export interface ExecutionAssessment {
  ready: boolean
  blockers: string[]
  warnings: string[]
  orders: ConceptOrder[]
  totalCashUseEur: number
  totalEstimatedCostsEur: number
  snapshot?: DecisionSnapshot
}

function finiteAtLeast(value: number | null, minimum: number) {
  return value !== null && Number.isFinite(value) && value >= minimum
}

function iso(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals
  return Math.floor((value + Number.EPSILON) * factor) / factor
}

interface InstrumentPlan {
  instrument: ConceptOrder['instrument']
  ticker: string
  name: string
  isin?: string
  venue: string
  currency: string
  budgetEur: number
  referencePriceEur: number
  referencePriceAsOf: string
  limitPriceEur: number | null
}

export function buildConceptOrders(
  planning: PlanningInput,
  benchmark: BenchmarkInput,
  candidates: ActiveCandidateInput[],
  market: MarketSnapshot | null,
  execution: ExecutionInput,
  today = new Date().toISOString().slice(0, 10),
): ExecutionAssessment {
  const blockers: string[] = []
  const warnings: string[] = []
  const planningAssessment = assessPlanningInput(planning)
  if (!planningAssessment.ready) blockers.push('The personal decision frame is incomplete.')
  const capital = planning.riskCapitalEur ?? 0
  const benchmarkAssessment = assessBenchmark(benchmark, capital, planning.activeSleevePct, today)
  if (!benchmarkAssessment.ready) blockers.push('The broad baseline instrument is incomplete or stale.')
  if (planning.broker.trim().length < 2) blockers.push('Name the broker and legal account route.')
  if (planning.fractionalShares === null) blockers.push('Confirm whether this broker supports fractional shares for these instruments.')
  if ((planning.existingInvestmentsEur ?? 0) > 0) blockers.push('Existing holdings are not aggregated into this planner. Do not create new orders until total-portfolio exposure is modelled.')

  if (!finiteAtLeast(execution.fixedCostPerOrderEur, 0)) blockers.push('Enter the broker fee per order in EUR.')
  if (!finiteAtLeast(execution.fxCostPct, 0) || (execution.fxCostPct ?? 0) > 10) blockers.push('Enter an FX cost between 0% and 10%.')
  if (!finiteAtLeast(execution.slippageAllowancePct, 0) || (execution.slippageAllowancePct ?? 0) > 10) blockers.push('Enter a slippage allowance between 0% and 10%.')
  if (!finiteAtLeast(execution.minimumOrderEur, 0)) blockers.push('Enter the broker minimum order size.')
  if (execution.tranches === null || !Number.isInteger(execution.tranches) || execution.tranches < 1 || execution.tranches > 4) blockers.push('Choose one to four tranches.')
  if (!iso(execution.windowStart) || execution.windowStart < today) blockers.push('Set an execution-window start date that is not in the past.')
  if (!iso(execution.windowEnd) || execution.windowEnd < execution.windowStart) blockers.push('Set an execution-window end on or after its start.')
  if (!execution.costScheduleConfirmed) blockers.push('Confirm the broker cost schedule was checked.')
  if (!execution.limitDisciplineConfirmed) blockers.push('Confirm that every row will be submitted as a limit order, never a market order.')
  if (!execution.recheckBeforeSubmitConfirmed) blockers.push('Confirm that price, spread, FX and news will be rechecked in the broker before submission.')

  const active = buildActivePortfolio(candidates, market, benchmark.expectedAnnualReturnPct, capital, planning.activeSleevePct, today)
  if (active.blockers.length) blockers.push(...active.blockers)
  for (const assessment of active.assessments) {
    if (!assessment.complete) blockers.push(`${assessment.candidate.ticker || 'Blank candidate'} has an incomplete evidence record.`)
  }

  const instrumentPlans: InstrumentPlan[] = []
  if (benchmark.priceEur && benchmark.priceAsOf) {
    instrumentPlans.push({
      instrument: 'baseline',
      ticker: benchmark.ticker,
      name: benchmark.fundName,
      isin: benchmark.isin,
      venue: benchmark.venue,
      currency: benchmark.tradingCurrency.toUpperCase(),
      budgetEur: Math.max(0, capital - active.allocatedEur),
      referencePriceEur: benchmark.priceEur,
      referencePriceAsOf: benchmark.priceAsOf,
      limitPriceEur: execution.baselineLimitPriceEur,
    })
  }
  for (const allocation of active.allocations) {
    const candidateAssessment = assessCandidate(candidates.find((candidate) => candidate.ticker === allocation.ticker) as ActiveCandidateInput, market, benchmark.expectedAnnualReturnPct, today)
    const quote = market?.quotes[allocation.ticker]
    if (candidateAssessment.priceEur && candidateAssessment.priceAsOf && quote) {
      instrumentPlans.push({
        instrument: 'active-stock',
        ticker: allocation.ticker,
        name: allocation.name,
        venue: candidateAssessment.position?.exchange ?? '',
        currency: quote.currency,
        budgetEur: allocation.amountEur,
        referencePriceEur: candidateAssessment.priceEur,
        referencePriceAsOf: candidateAssessment.priceAsOf,
        limitPriceEur: execution.stockLimitPricesEur[allocation.ticker] ?? null,
      })
    }
  }

  for (const plan of instrumentPlans) {
    if (!finiteAtLeast(plan.limitPriceEur, 0.01)) blockers.push(`Enter a positive EUR limit for ${plan.ticker}.`)
    else {
      const deviation = Math.abs((plan.limitPriceEur as number) / plan.referencePriceEur - 1) * 100
      if (deviation > 5) warnings.push(`${plan.ticker} limit differs ${deviation.toFixed(1)}% from its dated reference price; verify the unit and venue.`)
    }
  }
  if (blockers.length) return { ready: false, blockers: [...new Set(blockers)], warnings, orders: [], totalCashUseEur: 0, totalEstimatedCostsEur: 0 }

  const tranches = execution.tranches as number
  const orders: ConceptOrder[] = []
  for (const plan of instrumentPlans) {
    for (let tranche = 1; tranche <= tranches; tranche++) {
      const trancheBudget = plan.budgetEur / tranches
      const fixed = execution.fixedCostPerOrderEur as number
      const variablePct = (execution.slippageAllowancePct as number) + (plan.currency === 'EUR' ? 0 : execution.fxCostPct as number)
      const spendable = Math.max(0, trancheBudget - fixed)
      const grossCapacity = spendable / (1 + variablePct / 100)
      const rawQuantity = grossCapacity / (plan.limitPriceEur as number)
      const quantity = planning.fractionalShares ? round(rawQuantity, 4) : Math.floor(rawQuantity)
      const gross = quantity * (plan.limitPriceEur as number)
      const estimatedCosts = fixed + gross * variablePct / 100
      if (quantity <= 0 || gross < (execution.minimumOrderEur as number)) blockers.push(`${plan.ticker} tranche ${tranche} is below the minimum usable order at this price and cost schedule.`)
      else orders.push({
        instrument: plan.instrument,
        ticker: plan.ticker,
        name: plan.name,
        isin: plan.isin,
        venue: plan.venue,
        tranche,
        tranches,
        side: 'BUY',
        quantity,
        fractional: Boolean(planning.fractionalShares && !Number.isInteger(quantity)),
        referencePriceEur: round(plan.referencePriceEur),
        referencePriceAsOf: plan.referencePriceAsOf,
        limitPriceEur: plan.limitPriceEur as number,
        grossNotionalEur: round(gross),
        estimatedCostsEur: round(estimatedCosts),
        maximumCashUseEur: round(gross + estimatedCosts),
      })
    }
  }
  if (blockers.length) return { ready: false, blockers: [...new Set(blockers)], warnings, orders: [], totalCashUseEur: 0, totalEstimatedCostsEur: 0 }

  const totalCashUseEur = orders.reduce((sum, order) => sum + order.maximumCashUseEur, 0)
  const totalEstimatedCostsEur = orders.reduce((sum, order) => sum + order.estimatedCostsEur, 0)
  const snapshot: DecisionSnapshot = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    status: 'concept-only',
    warning: 'Not an instruction to trade. Recheck price, spread, FX, news, venue and broker fields before any submission.',
    planning,
    benchmark,
    candidates,
    execution,
    market: { fetchedAt: market?.fetchedAt, fxAsOf: market?.fx.asOf, providers: market?.providers },
    orders,
  }
  return { ready: true, blockers: [], warnings, orders, totalCashUseEur, totalEstimatedCostsEur, snapshot }
}
