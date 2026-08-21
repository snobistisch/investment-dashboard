export const SCENARIO_KEYS = ['bear', 'base', 'bull'] as const
export type ScenarioKey = (typeof SCENARIO_KEYS)[number]

export interface OpportunitySource {
  label: string
  url: string
  /** Date on which this evidence link was checked for the authored model. */
  evidenceAsOf: string
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

/** A deliberately simple underwriting envelope for rows where the repository
 * does not contain enough forecast detail for an EPS or revenue bridge. The
 * reference price is frozen and is never replaced by the live quote. */
export interface TerminalPriceValuation extends ValuationBase {
  kind: 'terminal-price'
  referencePrice: number
  referenceAsOf: string
}

export type OpportunityValuation = EpsMultipleValuation | RevenueMultipleValuation | TerminalPriceValuation

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
  /** Date through which the operating evidence was reviewed, not a claim that
   * every linked document was published on that date. */
  fundamentalsAsOf: string
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
