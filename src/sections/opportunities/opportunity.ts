import type { MarketQuote } from '../../data/market-data'
import {
  SCENARIO_KEYS,
  type EquityOpportunityModel,
  type OpportunityPolicy,
  type ScenarioKey,
} from './model'

const DAY_MS = 86_400_000
const EPSILON = 1e-10

export type OpportunityState =
  | 'ATTRACTIVE NOW'
  | 'WATCH — CLOSE TO HURDLE'
  | 'WATCH BELOW'
  | 'STALE THESIS'
  | 'STALE MARKET DATA'
  | 'INSUFFICIENT EVIDENCE'
  | 'NOT DIRECTLY TRADABLE'

export interface OpportunityBlocker {
  code: 'model' | 'policy' | 'research-stale' | 'market-missing' | 'market-stale' | 'tradability'
  message: string
}

export interface ScenarioResult {
  key: ScenarioKey
  probability: number
  terminalValue: number
  grossTotalReturnPct: number
  netTotalReturnPct: number
  rationale: string
}

export interface OpportunityAssessment {
  model: EquityOpportunityModel
  quote?: MarketQuote
  blockers: OpportunityBlocker[]
  decisionReady: boolean
  positiveEdge: boolean
  state: OpportunityState
  expectedTerminalValue?: number
  expectedTotalReturnPct?: number
  annualisedExpectedTerminalWealthReturnPct?: number
  benchmarkEdgePct?: number
  hurdleEdgePct?: number
  requiredAnnualReturnPct?: number
  maxEntryPrice?: number
  entryHeadroomPct?: number
  neededPullbackPct?: number
  scenarios: ScenarioResult[]
  stress?: {
    bullToBearShiftPct: number | null
    survivesFullBullShift: boolean
    baseBullTerminalReductionPct: number | null
    additionalExitCostPct: number | null
    oneYearDelayEdgePct: number
  }
  sensitivity: { price: number; hurdleEdgePct: number }[]
}

function validIso(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

function daysBetween(from: string, to: string) {
  return Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS)
}

export function businessSessionAge(asOf: string, today: string) {
  if (!validIso(asOf) || !validIso(today) || asOf > today) return Infinity
  let age = 0
  const cursor = new Date(`${asOf}T00:00:00Z`)
  const end = new Date(`${today}T00:00:00Z`)
  while (cursor < end) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    if (![0, 6].includes(cursor.getUTCDay())) age++
  }
  return age
}

export function terminalValue(model: EquityOpportunityModel, key: ScenarioKey) {
  const scenario = model.valuation.scenarios[key]
  if (model.valuation.kind === 'eps-multiple') return scenario.metricValue * scenario.terminalMultiple
  return (scenario.metricValue * scenario.terminalMultiple - model.valuation.terminalNetDebtM) / model.valuation.dilutedSharesM
}

export function validateOpportunityModel(model: EquityOpportunityModel) {
  const errors: string[] = []
  if (model.schemaVersion !== 1) errors.push('Unsupported scenario schema.')
  if (!model.version.trim()) errors.push('Scenario version is missing.')
  if (!model.ticker.trim() || !model.company.trim()) errors.push('Identity is incomplete.')
  if (!/^[A-Z]{3}$/.test(model.currency)) errors.push('Scenario currency must be a three-letter code.')
  if (!Number.isFinite(model.horizonYears) || model.horizonYears <= 0) errors.push('Horizon must be positive.')
  if (!model.thesis.trim()) errors.push('Thesis is missing.')
  if (!model.falsifier.trim()) errors.push('Falsifier is missing.')
  if (!model.catalyst.trim()) errors.push('Catalyst is missing.')
  if (!model.limitation.trim()) errors.push('Model limitation is missing.')
  if (!model.risks.length || model.risks.some((risk) => !risk.trim())) errors.push('At least one stated risk is required.')
  for (const [label, value] of [['reviewed', model.reviewedAt], ['fundamentals', model.fundamentalsPublishedAt], ['next review', model.nextReviewAt]] as const) {
    if (!validIso(value)) errors.push(`${label} date is invalid.`)
  }
  if (model.sources.length === 0) errors.push('At least one source is required.')
  if (!model.sources.some((source) => source.kind === 'primary')) errors.push('At least one primary source is required.')
  for (const source of model.sources) {
    if (!source.label.trim()) errors.push('Source label is missing.')
    if (source.kind !== 'primary' && source.kind !== 'methodology') errors.push(`${source.label || 'Source'} kind is invalid.`)
    try {
      if (new URL(source.url).protocol !== 'https:') errors.push(`${source.label} is not HTTPS.`)
    } catch {
      errors.push(`${source.label} URL is invalid.`)
    }
    if (!validIso(source.publishedAt)) errors.push(`${source.label} date is invalid.`)
  }
  const scenarios = SCENARIO_KEYS.map((key) => model.valuation.scenarios[key])
  if (!Number.isInteger(model.valuation.fiscalYear) || model.valuation.fiscalYear <= 0) errors.push('Terminal fiscal year must be a positive integer.')
  if (!model.valuation.metricLabel.trim()) errors.push('Valuation metric label is missing.')
  const probability = scenarios.reduce((sum, scenario) => sum + scenario.probability, 0)
  if (Math.abs(probability - 1) > EPSILON) errors.push(`Scenario probabilities total ${probability}, not 1.`)
  for (const [index, scenario] of scenarios.entries()) {
    if (!Number.isFinite(scenario.probability) || scenario.probability < 0 || scenario.probability > 1) errors.push(`${SCENARIO_KEYS[index]} probability is invalid.`)
    if (!Number.isFinite(scenario.metricValue) || scenario.metricValue < 0) errors.push(`${SCENARIO_KEYS[index]} metric value is invalid.`)
    if (!Number.isFinite(scenario.terminalMultiple) || scenario.terminalMultiple < 0) errors.push(`${SCENARIO_KEYS[index]} terminal multiple is invalid.`)
    if (!scenario.rationale.trim()) errors.push(`${SCENARIO_KEYS[index]} rationale is missing.`)
  }
  if (model.valuation.kind === 'revenue-multiple') {
    if (!Number.isFinite(model.valuation.dilutedSharesM) || model.valuation.dilutedSharesM <= 0) errors.push('Terminal diluted shares must be positive.')
    if (!Number.isFinite(model.valuation.terminalNetDebtM)) errors.push('Terminal net debt must be finite.')
  }
  const values = SCENARIO_KEYS.map((key) => terminalValue(model, key))
  if (values.some((value) => !Number.isFinite(value) || value < 0)) errors.push('Terminal values must be finite and non-negative.')
  if (!(values[0] <= values[1] && values[1] <= values[2])) errors.push('Terminal values must be ordered bear ≤ base ≤ bull.')
  return errors
}

export function validateOpportunityPolicy(policy: OpportunityPolicy) {
  const errors: string[] = []
  if (!Number.isFinite(policy.benchmarkAnnualReturnPct)) errors.push('Benchmark annual return must be finite.')
  if (!Number.isFinite(policy.requiredActivePremiumPct) || policy.requiredActivePremiumPct < 0) errors.push('Required active premium must be finite and non-negative.')
  const hurdle = policy.benchmarkAnnualReturnPct + policy.requiredActivePremiumPct
  if (!Number.isFinite(hurdle) || hurdle <= -100) errors.push('Required annual return must be greater than -100%.')
  if (!Number.isFinite(policy.buyCostPct) || policy.buyCostPct < 0 || policy.buyCostPct >= 100) errors.push('Buy cost must be between 0% and 100%.')
  if (!Number.isFinite(policy.sellCostPct) || policy.sellCostPct < 0 || policy.sellCostPct >= 100) errors.push('Sell cost must be between 0% and 100%.')
  if (!Number.isFinite(policy.nearHurdlePullbackPct) || policy.nearHurdlePullbackPct < 0 || policy.nearHurdlePullbackPct > 100) errors.push('Near-hurdle pullback must be between 0% and 100%.')
  if (!Number.isInteger(policy.maxQuoteBusinessSessions) || policy.maxQuoteBusinessSessions < 0) errors.push('Quote-age limit must be a non-negative integer.')
  if (!Number.isInteger(policy.maxFundamentalAgeDays) || policy.maxFundamentalAgeDays < 0) errors.push('Fundamental-age limit must be a non-negative integer.')
  return errors
}

function metricsAtPrice(
  expectedTerminalValue: number,
  price: number,
  horizonYears: number,
  policy: OpportunityPolicy,
) {
  const buy = policy.buyCostPct / 100
  const sell = policy.sellCostPct / 100
  const netTerminalMultiple = (1 - sell) * expectedTerminalValue / ((1 + buy) * price)
  const annualised = (Math.pow(netTerminalMultiple, 1 / horizonYears) - 1) * 100
  const requiredAnnualReturnPct = policy.benchmarkAnnualReturnPct + policy.requiredActivePremiumPct
  return {
    expectedTotalReturnPct: (netTerminalMultiple - 1) * 100,
    annualised,
    benchmarkEdgePct: annualised - policy.benchmarkAnnualReturnPct,
    hurdleEdgePct: annualised - requiredAnnualReturnPct,
    requiredAnnualReturnPct,
  }
}

export function maxEntryPrice(
  expectedTerminalValue: number,
  horizonYears: number,
  policy: OpportunityPolicy,
) {
  const buy = policy.buyCostPct / 100
  const sell = policy.sellCostPct / 100
  const hurdle = (policy.benchmarkAnnualReturnPct + policy.requiredActivePremiumPct) / 100
  return (1 - sell) * expectedTerminalValue / ((1 + buy) * Math.pow(1 + hurdle, horizonYears))
}

export function assessOpportunity(
  model: EquityOpportunityModel,
  quote: MarketQuote | undefined,
  policy: OpportunityPolicy,
  directlyTradable: boolean,
  today = new Date().toISOString().slice(0, 10),
): OpportunityAssessment {
  const modelErrors = validateOpportunityModel(model)
  const policyErrors = validateOpportunityPolicy(policy)
  const blockers: OpportunityBlocker[] = modelErrors.map((message) => ({ code: 'model', message }))
  blockers.push(...policyErrors.map((message): OpportunityBlocker => ({ code: 'policy', message })))
  if (validIso(model.reviewedAt) && model.reviewedAt > today) blockers.push({ code: 'model', message: 'Research review date is in the future.' })
  if (validIso(model.fundamentalsPublishedAt) && model.fundamentalsPublishedAt > today) blockers.push({ code: 'model', message: 'Fundamentals publication date is in the future.' })
  if (validIso(model.nextReviewAt) && model.nextReviewAt < today) blockers.push({ code: 'research-stale', message: `Mandatory review expired ${model.nextReviewAt}.` })
  if (validIso(model.fundamentalsPublishedAt) && daysBetween(model.fundamentalsPublishedAt, today) > policy.maxFundamentalAgeDays) blockers.push({ code: 'research-stale', message: `Fundamentals exceed the ${policy.maxFundamentalAgeDays}-day policy.` })
  if (validIso(model.fundamentalsPublishedAt) && validIso(model.reviewedAt) && model.reviewedAt < model.fundamentalsPublishedAt) blockers.push({ code: 'model', message: 'Review predates the latest fundamentals.' })
  if (validIso(model.nextReviewAt) && validIso(model.reviewedAt) && model.nextReviewAt < model.reviewedAt) blockers.push({ code: 'model', message: 'Next mandatory review predates the research review.' })
  for (const source of model.sources) {
    if (validIso(source.publishedAt) && source.publishedAt > today) blockers.push({ code: 'model', message: `${source.label || 'Source'} publication date is in the future.` })
    if (validIso(source.publishedAt) && validIso(model.reviewedAt) && source.publishedAt > model.reviewedAt) blockers.push({ code: 'model', message: `Research review predates ${source.label || 'a source'}.` })
  }
  if (!directlyTradable) blockers.push({ code: 'tradability', message: 'Listing is not directly tradable through the assumed retail route.' })
  if (!quote || !Number.isFinite(quote.priceLocal) || quote.priceLocal <= 0) blockers.push({ code: 'market-missing', message: 'Current local-currency quote is missing.' })
  else {
    if (quote.currency !== model.currency) blockers.push({ code: 'model', message: `Quote currency ${quote.currency} differs from scenario currency ${model.currency}.` })
    if (businessSessionAge(quote.asOf, today) > policy.maxQuoteBusinessSessions) blockers.push({ code: 'market-stale', message: `Quote ${quote.asOf} is older than ${policy.maxQuoteBusinessSessions} completed business session.` })
  }

  const scenarioResults: ScenarioResult[] = []
  let expectedTerminalValue: number | undefined
  if (!modelErrors.length) {
    expectedTerminalValue = SCENARIO_KEYS.reduce((sum, key) => sum + model.valuation.scenarios[key].probability * terminalValue(model, key), 0)
    if (!policyErrors.length && quote?.priceLocal && quote.priceLocal > 0 && quote.currency === model.currency) {
      const buy = policy.buyCostPct / 100
      const sell = policy.sellCostPct / 100
      for (const key of SCENARIO_KEYS) {
        const value = terminalValue(model, key)
        const grossMultiple = value / quote.priceLocal
        const netMultiple = (1 - sell) * value / ((1 + buy) * quote.priceLocal)
        scenarioResults.push({
          key,
          probability: model.valuation.scenarios[key].probability,
          terminalValue: value,
          grossTotalReturnPct: (grossMultiple - 1) * 100,
          netTotalReturnPct: (netMultiple - 1) * 100,
          rationale: model.valuation.scenarios[key].rationale,
        })
      }
    }
  }

  const decisionReady = blockers.length === 0
  const usableQuote = quote !== undefined && Number.isFinite(quote.priceLocal) && quote.priceLocal > 0 && quote.currency === model.currency
  if (expectedTerminalValue === undefined || !usableQuote || policyErrors.length > 0) {
    const state: OpportunityState = blockers.some((blocker) => blocker.code.startsWith('market')) ? 'STALE MARKET DATA' : blockers.some((blocker) => blocker.code === 'tradability') ? 'NOT DIRECTLY TRADABLE' : 'INSUFFICIENT EVIDENCE'
    return { model, quote, blockers, decisionReady: false, positiveEdge: false, state, scenarios: scenarioResults, sensitivity: [] }
  }

  const metrics = metricsAtPrice(expectedTerminalValue, quote.priceLocal, model.horizonYears, policy)
  const maxEntry = maxEntryPrice(expectedTerminalValue, model.horizonYears, policy)
  const entryHeadroomPct = (maxEntry / quote.priceLocal - 1) * 100
  const neededPullbackPct = Math.max(0, (1 - maxEntry / quote.priceLocal) * 100)
  const positiveEdge = decisionReady && metrics.hurdleEdgePct > EPSILON
  let state: OpportunityState
  if (blockers.some((blocker) => blocker.code === 'research-stale')) state = 'STALE THESIS'
  else if (blockers.some((blocker) => blocker.code.startsWith('market'))) state = 'STALE MARKET DATA'
  else if (blockers.some((blocker) => blocker.code === 'tradability')) state = 'NOT DIRECTLY TRADABLE'
  else if (blockers.length) state = 'INSUFFICIENT EVIDENCE'
  else if (positiveEdge) state = 'ATTRACTIVE NOW'
  else if (neededPullbackPct <= policy.nearHurdlePullbackPct) state = 'WATCH — CLOSE TO HURDLE'
  else state = 'WATCH BELOW'

  const thresholdTerminal = quote.priceLocal * (1 + policy.buyCostPct / 100) * Math.pow(1 + metrics.requiredAnnualReturnPct / 100, model.horizonYears) / (1 - policy.sellCostPct / 100)
  const bull = terminalValue(model, 'bull')
  const bear = terminalValue(model, 'bear')
  const bullProbability = model.valuation.scenarios.bull.probability
  const bullBearSpread = bull - bear
  const neededShift = metrics.hurdleEdgePct <= 0 || bullBearSpread <= EPSILON ? 0 : (expectedTerminalValue - thresholdTerminal) / bullBearSpread
  const survivesFullBullShift = metrics.hurdleEdgePct > 0 && (bullBearSpread <= EPSILON || neededShift > bullProbability)
  const bullBaseContribution = model.valuation.scenarios.bull.probability * bull + model.valuation.scenarios.base.probability * terminalValue(model, 'base')
  const reduction = metrics.hurdleEdgePct <= 0 || bullBaseContribution <= 0 ? 0 : (expectedTerminalValue - thresholdTerminal) / bullBaseContribution
  const additionalExitCost = metrics.hurdleEdgePct <= 0 ? 0 : 1 - policy.sellCostPct / 100 - Math.pow(1 + metrics.requiredAnnualReturnPct / 100, model.horizonYears) * (1 + policy.buyCostPct / 100) * quote.priceLocal / expectedTerminalValue
  const delayed = metricsAtPrice(expectedTerminalValue, quote.priceLocal, model.horizonYears + 1, policy)
  const prices = [...new Set([quote.priceLocal * 0.8, quote.priceLocal * 0.9, maxEntry, quote.priceLocal, quote.priceLocal * 1.1]
    .filter((value) => value > 0)
    .map((value) => Number(value.toFixed(6))))].sort((a, b) => a - b)
  const sensitivity = prices.map((price) => ({ price, hurdleEdgePct: metricsAtPrice(expectedTerminalValue as number, price, model.horizonYears, policy).hurdleEdgePct }))

  return {
    model,
    quote,
    blockers,
    decisionReady,
    positiveEdge,
    state,
    expectedTerminalValue,
    expectedTotalReturnPct: metrics.expectedTotalReturnPct,
    annualisedExpectedTerminalWealthReturnPct: metrics.annualised,
    benchmarkEdgePct: metrics.benchmarkEdgePct,
    hurdleEdgePct: metrics.hurdleEdgePct,
    requiredAnnualReturnPct: metrics.requiredAnnualReturnPct,
    maxEntryPrice: maxEntry,
    entryHeadroomPct,
    neededPullbackPct,
    scenarios: scenarioResults,
    stress: {
      bullToBearShiftPct: survivesFullBullShift ? null : Math.max(0, neededShift * 100),
      survivesFullBullShift,
      baseBullTerminalReductionPct: reduction <= 1 ? Math.max(0, reduction * 100) : null,
      additionalExitCostPct: additionalExitCost >= 0 ? additionalExitCost * 100 : null,
      oneYearDelayEdgePct: delayed.hurdleEdgePct,
    },
    sensitivity,
  }
}
