export const SCENARIO_KEYS = ['bear', 'base', 'bull'] as const
export type ScenarioKey = (typeof SCENARIO_KEYS)[number]

export interface OpportunitySource {
  label: string
  url: string
  publishedAt: string
  kind: 'primary' | 'methodology'
}

export interface ScenarioAssumption {
  probability: number
  metricValue: number
  terminalMultiple: number
  rationale: string
}

interface ValuationBase {
  fiscalYear: number
  metricLabel: string
  scenarios: Record<ScenarioKey, ScenarioAssumption>
}

export interface EpsMultipleValuation extends ValuationBase {
  kind: 'eps-multiple'
}

export interface RevenueMultipleValuation extends ValuationBase {
  kind: 'revenue-multiple'
  metricUnit: 'USDm'
  dilutedSharesM: number
  terminalNetDebtM: number
}

export type OpportunityValuation = EpsMultipleValuation | RevenueMultipleValuation

export interface EquityOpportunityModel {
  schemaVersion: 1
  version: string
  ticker: string
  company: string
  currency: string
  thesis: string
  falsifier: string
  horizonYears: number
  reviewedAt: string
  fundamentalsPublishedAt: string
  nextReviewAt: string
  catalyst: string
  valuation: OpportunityValuation
  sources: OpportunitySource[]
  risks: string[]
  limitation: string
}

export interface OpportunityPolicy {
  benchmarkAnnualReturnPct: number
  requiredActivePremiumPct: number
  buyCostPct: number
  sellCostPct: number
  nearHurdlePullbackPct: number
  maxQuoteBusinessSessions: number
  maxFundamentalAgeDays: number
}

export const DEFAULT_OPPORTUNITY_POLICY: OpportunityPolicy = {
  benchmarkAnnualReturnPct: 7,
  requiredActivePremiumPct: 3,
  buyCostPct: 0.25,
  sellCostPct: 0.25,
  nearHurdlePullbackPct: 10,
  maxQuoteBusinessSessions: 1,
  maxFundamentalAgeDays: 120,
}
