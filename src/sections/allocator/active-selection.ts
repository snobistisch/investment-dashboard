import type { MarketSnapshot } from '../../data/market-data'
import { positions, type Factor, type Position } from '../../data/positions'
import { isDirectlyTradable } from './allocation'

export const ACTIVE_NAME_CAP_PCT = 5
export const ACTIVE_FACTOR_CAP_PCT = 10
export const MAX_FUNDAMENTAL_AGE_DAYS = 120
export const MIN_CORRELATION_OBSERVATIONS = 90

export interface ScenarioInput {
  probabilityPct: number | null
  totalReturnPct: number | null
}

export interface ActiveCandidateInput {
  id: string
  ticker: string
  thesis: string
  falsifier: string
  horizonYears: number | null
  valuationMetric: string
  valuationValue: number | null
  valuationAsOf: string
  fundamentalPeriod: string
  fundamentalPublishedAt: string
  reviewedAt: string
  nextReviewAt: string
  thesisSourceUrl: string
  valuationSourceUrl: string
  officialSourcesConfirmed: boolean
  noMaterialEventAfterReviewConfirmed: boolean
  brokerAvailableConfirmed: boolean
  roundTripCostPct: number | null
  bull: ScenarioInput
  base: ScenarioInput
  bear: ScenarioInput
}

let candidateIdSequence = 0

function nextCandidateId() {
  candidateIdSequence += 1
  return `candidate-${Date.now()}-${candidateIdSequence}`
}

export function emptyCandidate(id = nextCandidateId()): ActiveCandidateInput {
  return {
    id,
    ticker: '',
    thesis: '',
    falsifier: '',
    horizonYears: null,
    valuationMetric: '',
    valuationValue: null,
    valuationAsOf: '',
    fundamentalPeriod: '',
    fundamentalPublishedAt: '',
    reviewedAt: '',
    nextReviewAt: '',
    thesisSourceUrl: '',
    valuationSourceUrl: '',
    officialSourcesConfirmed: false,
    noMaterialEventAfterReviewConfirmed: false,
    brokerAvailableConfirmed: false,
    roundTripCostPct: null,
    bull: { probabilityPct: null, totalReturnPct: null },
    base: { probabilityPct: null, totalReturnPct: null },
    bear: { probabilityPct: null, totalReturnPct: null },
  }
}

export interface CandidateAssessment {
  candidate: ActiveCandidateInput
  position?: Position
  blockers: string[]
  complete: boolean
  qualifies: boolean
  expectedTerminalReturnPct?: number
  expectedAnnualReturnPct?: number
  edgeAfterCostPct?: number
  priceEur?: number
  priceAsOf?: string
}

function validIso(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

function directHttps(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !/^(www\.)?(google|bing)\./i.test(url.hostname)
  } catch {
    return false
  }
}

function daysBetween(from: string, to: string) {
  return Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

/** Completed weekdays after the quote date. A Friday close is one session old
 *  on the next review day; weekends do not make a valid last close appear stale. */
export function businessSessionAge(asOf: string, today: string) {
  if (!validIso(asOf) || !validIso(today) || asOf > today) return Infinity
  let age = 0
  const cursor = new Date(`${asOf}T00:00:00Z`)
  const end = new Date(`${today}T00:00:00Z`)
  while (cursor < end) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    const day = cursor.getUTCDay()
    if (day !== 0 && day !== 6) age++
  }
  return age
}

export function assessCandidate(
  candidate: ActiveCandidateInput,
  snapshot: MarketSnapshot | null,
  benchmarkExpectedAnnualReturnPct: number | null,
  today = new Date().toISOString().slice(0, 10),
): CandidateAssessment {
  const blockers: string[] = []
  const position = positions.find((row) => row.ticker === candidate.ticker)
  const quote = candidate.ticker ? snapshot?.quotes[candidate.ticker] : undefined

  if (!position) blockers.push('Select a ticker from the transcribed equity universe.')
  if (position && position.stance !== 'long') blockers.push('Only a directly researched long can enter this stock sleeve.')
  if (position && !isDirectlyTradable(position)) blockers.push(`${position.exchange} is not directly tradable through the assumed Dutch retail route.`)
  if (!quote?.priceUsd) blockers.push('A current mapped market price is required.')
  if (quote && businessSessionAge(quote.asOf, today) > 1) blockers.push(`The market price is older than one completed business session (${quote.asOf}).`)
  if (!snapshot?.fx.usdPerEur || snapshot.fx.usdPerEur <= 0) blockers.push('The snapshot has no current ECB EUR/USD conversion.')

  if (candidate.thesis.trim().length < 20) blockers.push('Write a specific thesis of at least 20 characters.')
  if (candidate.falsifier.trim().length < 15) blockers.push('State what evidence would falsify the thesis.')
  if (candidate.horizonYears === null || !Number.isFinite(candidate.horizonYears) || candidate.horizonYears <= 0) blockers.push('Enter a positive thesis horizon.')
  if (candidate.valuationMetric.trim().length < 2) blockers.push('Name the valuation metric used.')
  if (candidate.valuationValue === null || !Number.isFinite(candidate.valuationValue) || candidate.valuationValue < 0) blockers.push('Enter the measured valuation value; zero is allowed only when it is real.')
  if (!validIso(candidate.valuationAsOf)) blockers.push('Date the valuation input.')
  if (candidate.fundamentalPeriod.trim().length < 3) blockers.push('Name the reported financial period used.')
  if (!validIso(candidate.fundamentalPublishedAt)) blockers.push('Enter the publication date of the fundamentals.')
  if (!validIso(candidate.reviewedAt)) blockers.push('Enter when the source set was last reviewed.')
  if (!validIso(candidate.nextReviewAt)) blockers.push('Set the next mandatory review date.')

  if (validIso(candidate.fundamentalPublishedAt) && daysBetween(candidate.fundamentalPublishedAt, today) > MAX_FUNDAMENTAL_AGE_DAYS) blockers.push(`Fundamentals are older than the declared ${MAX_FUNDAMENTAL_AGE_DAYS}-day limit.`)
  if (validIso(candidate.fundamentalPublishedAt) && validIso(candidate.reviewedAt) && candidate.reviewedAt < candidate.fundamentalPublishedAt) blockers.push('Review date predates the published fundamentals.')
  if (validIso(candidate.reviewedAt) && candidate.reviewedAt > today) blockers.push('Review date cannot be in the future.')
  if (validIso(candidate.nextReviewAt) && candidate.nextReviewAt < today) blockers.push('The mandatory review date has passed.')
  if (!directHttps(candidate.thesisSourceUrl)) blockers.push('Link a direct HTTPS primary source for the thesis evidence.')
  if (!directHttps(candidate.valuationSourceUrl)) blockers.push('Link a direct HTTPS source or calculation for valuation.')
  if (candidate.thesisSourceUrl && candidate.thesisSourceUrl === candidate.valuationSourceUrl) blockers.push('Use separate thesis and valuation evidence, or document the calculation separately.')
  if (!candidate.officialSourcesConfirmed) blockers.push('Confirm the inputs were checked against primary or official sources.')
  if (!candidate.noMaterialEventAfterReviewConfirmed) blockers.push('Confirm there was no material event after the review date.')
  if (!candidate.brokerAvailableConfirmed) blockers.push('Confirm the exact listing is available at the named broker.')
  if (candidate.roundTripCostPct === null || !Number.isFinite(candidate.roundTripCostPct) || candidate.roundTripCostPct < 0 || candidate.roundTripCostPct > 10) blockers.push('Enter a plausible all-in round-trip cost between 0% and 10%.')

  const scenarios = [candidate.bull, candidate.base, candidate.bear]
  for (const [index, scenario] of scenarios.entries()) {
    const name = ['bull', 'base', 'bear'][index]
    if (scenario.probabilityPct === null || !Number.isFinite(scenario.probabilityPct) || scenario.probabilityPct < 0 || scenario.probabilityPct > 100) blockers.push(`Enter a ${name} probability between 0% and 100%.`)
    if (scenario.totalReturnPct === null || !Number.isFinite(scenario.totalReturnPct) || scenario.totalReturnPct < -100) blockers.push(`Enter a ${name} total return of at least -100%.`)
  }
  const probabilityTotal = scenarios.reduce((sum, scenario) => sum + (scenario.probabilityPct ?? 0), 0)
  if (Math.abs(probabilityTotal - 100) > 0.01) blockers.push(`Scenario probabilities total ${probabilityTotal.toFixed(1)}%, not 100%.`)
  if (benchmarkExpectedAnnualReturnPct === null || !Number.isFinite(benchmarkExpectedAnnualReturnPct)) blockers.push('The benchmark-return assumption is missing.')

  let expectedTerminalReturnPct: number | undefined
  let expectedAnnualReturnPct: number | undefined
  let edgeAfterCostPct: number | undefined
  if (scenarios.every((scenario) => scenario.probabilityPct !== null && scenario.totalReturnPct !== null)) {
    expectedTerminalReturnPct = scenarios.reduce(
      (sum, scenario) => sum + (scenario.probabilityPct as number) * (scenario.totalReturnPct as number) / 100,
      0,
    )
    const netTerminal = expectedTerminalReturnPct - (candidate.roundTripCostPct ?? 0)
    if (candidate.horizonYears && netTerminal > -100) {
      expectedAnnualReturnPct = (Math.pow(1 + netTerminal / 100, 1 / candidate.horizonYears) - 1) * 100
      if (benchmarkExpectedAnnualReturnPct !== null) edgeAfterCostPct = expectedAnnualReturnPct - benchmarkExpectedAnnualReturnPct
    } else if (netTerminal <= -100) {
      blockers.push('Expected terminal return after costs cannot be annualised at or below -100%.')
    }
  }

  const priceEur = quote?.priceUsd && snapshot?.fx.usdPerEur ? quote.priceUsd / snapshot.fx.usdPerEur : undefined
  const complete = blockers.length === 0
  return {
    candidate,
    position,
    blockers,
    complete,
    qualifies: complete && edgeAfterCostPct !== undefined && edgeAfterCostPct > 0,
    expectedTerminalReturnPct,
    expectedAnnualReturnPct,
    edgeAfterCostPct,
    priceEur,
    priceAsOf: quote?.asOf,
  }
}

export function measuredCorrelation(snapshot: MarketSnapshot | null, left: string, right: string) {
  const result = snapshot?.correlations?.[[left, right].sort().join('|')]
  return result && result.observations >= MIN_CORRELATION_OBSERVATIONS ? result : undefined
}

export interface ActiveAllocation {
  ticker: string
  name: string
  factor: Factor
  totalCapitalPct: number
  amountEur: number
  edgeAfterCostPct: number
  realisedVolPct: number
}

export interface ActivePortfolioAssessment {
  assessments: CandidateAssessment[]
  allocations: ActiveAllocation[]
  correlations: { left: string; right: string; value: number; observations: number }[]
  blockers: string[]
  warnings: string[]
  allocatedEur: number
  activeBudgetEur: number
  unusedActiveBudgetEur: number
}

export function buildActivePortfolio(
  candidates: ActiveCandidateInput[],
  snapshot: MarketSnapshot | null,
  benchmarkExpectedAnnualReturnPct: number | null,
  totalCapitalEur: number,
  activeSleevePct: number,
  today = new Date().toISOString().slice(0, 10),
): ActivePortfolioAssessment {
  const assessments = candidates.map((candidate) => assessCandidate(candidate, snapshot, benchmarkExpectedAnnualReturnPct, today))
  const qualifying = assessments.filter((assessment) => assessment.qualifies)
  const blockers: string[] = []
  const warnings: string[] = []
  const duplicateTickers = qualifying.map((assessment) => assessment.candidate.ticker).filter((ticker, index, all) => all.indexOf(ticker) !== index)
  if (duplicateTickers.length) blockers.push(`Duplicate active ticker: ${[...new Set(duplicateTickers)].join(', ')}.`)

  const correlations: ActivePortfolioAssessment['correlations'] = []
  for (let left = 0; left < qualifying.length; left++) {
    for (let right = left + 1; right < qualifying.length; right++) {
      const a = qualifying[left].candidate.ticker
      const b = qualifying[right].candidate.ticker
      const result = measuredCorrelation(snapshot, a, b)
      if (!result) blockers.push(`No measured ${MIN_CORRELATION_OBSERVATIONS}-observation correlation for ${a}/${b}.`)
      else {
        correlations.push({ left: a, right: b, ...result })
        if (result.value >= 0.8) warnings.push(`${a}/${b} correlation is ${result.value.toFixed(2)}; separate tickers do not create much diversification.`)
      }
    }
  }

  const activeBudgetEur = totalCapitalEur * Math.max(0, Math.min(20, activeSleevePct)) / 100
  if (blockers.length) return { assessments, allocations: [], correlations, blockers, warnings, allocatedEur: 0, activeBudgetEur, unusedActiveBudgetEur: activeBudgetEur }

  const scored = qualifying.map((assessment) => {
    const volatility = snapshot?.quotes[assessment.candidate.ticker]?.stats?.realisedVolPct
    if (!volatility || volatility <= 0) blockers.push(`No realised volatility for ${assessment.candidate.ticker}.`)
    return { assessment, volatility: volatility ?? 0, score: (assessment.edgeAfterCostPct ?? 0) / Math.max(volatility ?? 0, 10) }
  })
  if (blockers.length) return { assessments, allocations: [], correlations, blockers, warnings, allocatedEur: 0, activeBudgetEur, unusedActiveBudgetEur: activeBudgetEur }

  const scoreTotal = scored.reduce((sum, item) => sum + item.score, 0)
  const draft = scored.map((item) => ({
    item,
    pct: Math.min(ACTIVE_NAME_CAP_PCT, activeSleevePct * item.score / scoreTotal),
  }))
  for (const factor of new Set(draft.map(({ item }) => item.assessment.position?.factors[0]).filter(Boolean) as Factor[])) {
    const group = draft.filter(({ item }) => item.assessment.position?.factors[0] === factor)
    const total = group.reduce((sum, row) => sum + row.pct, 0)
    if (total > ACTIVE_FACTOR_CAP_PCT) for (const row of group) row.pct *= ACTIVE_FACTOR_CAP_PCT / total
  }

  const allocations = draft.map(({ item, pct }) => ({
    ticker: item.assessment.candidate.ticker,
    name: item.assessment.position?.name ?? item.assessment.candidate.ticker,
    factor: item.assessment.position?.factors[0] ?? 'rates-macro',
    totalCapitalPct: pct,
    amountEur: totalCapitalEur * pct / 100,
    edgeAfterCostPct: item.assessment.edgeAfterCostPct as number,
    realisedVolPct: item.volatility,
  }))
  const allocatedEur = allocations.reduce((sum, allocation) => sum + allocation.amountEur, 0)
  return { assessments, allocations, correlations, blockers, warnings, allocatedEur, activeBudgetEur, unusedActiveBudgetEur: activeBudgetEur - allocatedEur }
}
