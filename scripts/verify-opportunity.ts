import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MarketQuote, MarketSnapshot } from '../src/data/market-data'
import { equityOpportunityModels } from '../src/data/equity-opportunities'
import type { Position } from '../src/data/positions'
import { positions } from '../src/data/positions'
import { isDirectlyTradable } from '../src/sections/allocator/allocation'
import {
  DEFAULT_OPPORTUNITY_POLICY,
  SCENARIO_KEYS,
  type EquityOpportunityModel,
  type OpportunityPolicy,
} from '../src/sections/opportunities/model'
import {
  assessOpportunity,
  maxEntryPrice,
  terminalValue,
  validateOpportunityModel,
  validateOpportunityPolicy,
} from '../src/sections/opportunities/opportunity'
import {
  DEFAULT_UNIVERSE_SCREEN_POLICY,
  classifyMa200Opportunity,
  screenUniversePosition,
  validateUniverseScreenPolicy,
} from '../src/sections/opportunities/universe-screen'

const TOL = 1e-9
const here = dirname(fileURLToPath(import.meta.url))

function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message)
}

function close(actual: number | undefined, expected: number, message: string, tolerance = TOL) {
  assert(actual !== undefined && Number.isFinite(actual), `${message}: result is not finite`)
  assert(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${message}: ${actual} != ${expected}`)
}

const model: EquityOpportunityModel = {
  schemaVersion: 1,
  version: 'TEST-2026-08-21-v1',
  ticker: 'TEST',
  company: 'Test Company',
  currency: 'USD',
  thesis: 'A sourced test thesis with explicit terminal assumptions.',
  falsifier: 'The stated operating evidence fails.',
  horizonYears: 3,
  reviewedAt: '2026-08-21',
  fundamentalsAsOf: '2026-08-15',
  nextReviewAt: '2026-11-01',
  catalyst: 'The next reported result tests the operating thesis.',
  valuation: {
    kind: 'eps-multiple',
    fiscalYear: 2029,
    metricLabel: 'authored terminal per-share assumption',
    scenarios: {
      bear: { probability: 0.2, metricValue: 50, terminalMultiple: 1, rationale: 'Bear terminal value.' },
      base: { probability: 0.5, metricValue: 100, terminalMultiple: 1, rationale: 'Base terminal value.' },
      bull: { probability: 0.3, metricValue: 180, terminalMultiple: 1, rationale: 'Bull terminal value.' },
    },
  },
  sources: [{ label: 'Primary test evidence', url: 'https://example.com/evidence', evidenceAsOf: '2026-08-15', kind: 'primary' }],
  risks: ['The scenario probabilities are subjective.'],
  limitation: 'This fixture tests arithmetic, not forecasting skill.',
}

const quote: MarketQuote = {
  symbol: 'TEST',
  provider: 'yahoo',
  providerName: 'Yahoo Finance',
  currency: 'USD',
  priceLocal: 80,
  priceUsd: 80,
  asOf: '2026-08-21',
  marketCapUsd: 12,
  returns: { m3: 8 },
  stats: { windowDays: 252, realisedVolPct: 45, maxDrawdownPct: -35 },
  trend200: { ma200: 70, distancePct: 14.2857142857, above: true, observations: 260 },
}

const position: Position = {
  ticker: 'TEST',
  exchange: 'NASDAQ',
  name: 'Test Company',
  sections: ['robotics'],
  factors: ['industrial-cycle'],
  marketCapUsd: 12,
  asOf: '2026-08-21',
  conviction: 2,
  stance: 'long',
}

const policy: OpportunityPolicy = { ...DEFAULT_OPPORTUNITY_POLICY, benchmarkAnnualReturnPct: 7, requiredActivePremiumPct: 3, buyCostPct: 0.5, sellCostPct: 0.5 }

assert(validateOpportunityModel(model).length === 0, 'complete opportunity model must validate')
assert(validateOpportunityPolicy(policy).length === 0, 'complete opportunity policy must validate')
assert(validateUniverseScreenPolicy(DEFAULT_UNIVERSE_SCREEN_POLICY).length === 0, 'default universe screen policy must validate')
assert(validateUniverseScreenPolicy({ ...DEFAULT_UNIVERSE_SCREEN_POLICY, maxMa200OpportunityDistancePct: -1 }).length > 0, 'negative 200MA opportunity distance must fail validation')
assert(validateUniverseScreenPolicy({ ...DEFAULT_UNIVERSE_SCREEN_POLICY, maxMa200OpportunityDistancePct: 101 }).length > 0, '200MA opportunity distance above 100% must fail validation')
assert(classifyMa200Opportunity(undefined, 5) === 'unavailable', 'missing 200MA distance must remain unavailable')
assert(classifyMa200Opportunity(-0.01, 5) === 'below', 'a close below 200MA cannot enter the opportunity zone')
assert(classifyMa200Opportunity(0, 5) === 'entry-zone', 'the 200MA boundary belongs to the opportunity zone')
assert(classifyMa200Opportunity(5, 5) === 'entry-zone', 'the opportunity-zone ceiling is inclusive')
assert(classifyMa200Opportunity(5.01, 5) === 'extended', 'a close beyond the opportunity-zone ceiling must be extended')
for (const authored of equityOpportunityModels) {
  const errors = validateOpportunityModel(authored)
  assert(errors.length === 0, `${authored.ticker}: authored opportunity model invalid: ${errors.join('; ')}`)
}
const equityLongTickers = positions
  .filter((row) => !row.sections.includes('crypto') && row.stance === 'long')
  .map((row) => row.ticker)
  .sort()
const modelTickers = equityOpportunityModels.map((row) => row.ticker).sort()
assert(new Set(modelTickers).size === modelTickers.length, 'canonical opportunity models cannot duplicate a ticker')
assert(
  JSON.stringify(modelTickers) === JSON.stringify(equityLongTickers),
  `every equity long must have exactly one model: models=${modelTickers.length}, longs=${equityLongTickers.length}`,
)
assert(equityOpportunityModels.some((row) => row.valuation.kind === 'terminal-price'), 'full coverage must retain explicit frozen terminal-price envelopes')

const currentMarket = JSON.parse(readFileSync(resolve(here, '../public/data/market-data.json'), 'utf8')) as MarketSnapshot
const marketDate = currentMarket.fetchedAt.slice(0, 10)
function canonicalQualified(
  opportunityPolicy: OpportunityPolicy,
  theme: 'all' | 'biology' = 'all',
  requireAbove200DayMa = DEFAULT_UNIVERSE_SCREEN_POLICY.requireAbove200DayMa,
) {
  const screenPolicy = { ...DEFAULT_UNIVERSE_SCREEN_POLICY, theme, requireAbove200DayMa }
  return equityOpportunityModels
    .filter((authored) => {
      const row = positions.find((candidate) => candidate.ticker === authored.ticker)
      if (!row) return false
      const quote = currentMarket.quotes[authored.ticker]
      const screen = screenUniversePosition(row, quote, isDirectlyTradable(row), screenPolicy, opportunityPolicy.maxQuoteBusinessSessions, marketDate)
      return screen.passes && assessOpportunity(authored, quote, opportunityPolicy, isDirectlyTradable(row), marketDate).positiveEdge
    })
    .map((row) => row.ticker)
    .sort()
}
const defaultQualified = canonicalQualified(DEFAULT_OPPORTUNITY_POLICY)
const highHurdleQualified = canonicalQualified({ ...DEFAULT_OPPORTUNITY_POLICY, requiredActivePremiumPct: 15 })
const biologyQualified = canonicalQualified(DEFAULT_OPPORTUNITY_POLICY, 'biology')
const withoutTrendGateQualified = canonicalQualified(DEFAULT_OPPORTUNITY_POLICY, 'all', false)
const defaultMa200EntrySetups = defaultQualified.filter((ticker) => {
  const distance = currentMarket.quotes[ticker]?.trend200?.distancePct
  return classifyMa200Opportunity(distance, DEFAULT_UNIVERSE_SCREEN_POLICY.maxMa200OpportunityDistancePct) === 'entry-zone'
})
assert(defaultQualified.length > 5, 'full-universe modelling must break the former five-name output ceiling')
assert(JSON.stringify(defaultQualified) !== JSON.stringify(highHurdleQualified), 'changing valuation policy must change Qualified now')
assert(JSON.stringify(defaultQualified) !== JSON.stringify(biologyQualified), 'changing the universe theme must rescan and change Qualified now')
assert(defaultQualified.length < withoutTrendGateQualified.length, 'the default 200MA gate must materially reduce Qualified now')
assert(defaultMa200EntrySetups.length > 0, 'the canonical qualified set must expose at least one near-above-200MA entry setup')
assert(defaultMa200EntrySetups.length < defaultQualified.length, 'the 200MA entry zone must not relabel every qualified equity as a preferred setup')

const equityRows = positions.filter((row) => !row.sections.includes('crypto'))
const equityTickers = new Set(equityRows.map((row) => row.ticker))
for (const ticker of Object.keys(currentMarket.equityCharts ?? {})) assert(equityTickers.has(ticker), `${ticker}: non-equity leaked into equity charts`)
for (const row of equityRows) {
  const currentQuote = currentMarket.quotes[row.ticker]
  const chart = currentMarket.equityCharts?.[row.ticker]
  if (!currentQuote) {
    assert(!chart, `${row.ticker}: unpriced equity cannot carry an unexplained chart`)
    continue
  }
  assert(chart && chart.points.length >= 2 && chart.points.length <= 252, `${row.ticker}: mapped equity must carry at most 252 chart sessions`)
  assert(chart.currency === currentQuote.currency, `${row.ticker}: chart currency must match quote currency`)
  for (let index = 0; index < chart.points.length; index++) {
    const [date, close, ma200] = chart.points[index]
    assert(/^\d{4}-\d{2}-\d{2}$/.test(date), `${row.ticker}: invalid chart date`)
    assert(Number.isFinite(close) && close > 0, `${row.ticker}: invalid chart close`)
    assert(ma200 === null || Number.isFinite(ma200) && ma200 > 0, `${row.ticker}: invalid 200MA point`)
    if (index > 0) assert(chart.points[index - 1][0] < date, `${row.ticker}: chart dates must be unique and increasing`)
  }
  if (currentQuote.trend200) {
    assert(chart.points.length >= 200, `${row.ticker}: 200MA requires at least 200 stored closes`)
    const last = chart.points.at(-1) as [string, number, number | null]
    const recomputed = chart.points.slice(-200).reduce((sum, point) => sum + point[1], 0) / 200
    close(currentQuote.trend200.ma200, recomputed, `${row.ticker}: latest 200MA must equal the simple average`, 1e-4)
    close(last[2] ?? undefined, recomputed, `${row.ticker}: chart endpoint must match quote 200MA`, 1e-4)
    const recomputedDistance = (last[1] / recomputed - 1) * 100
    assert(Math.abs(currentQuote.trend200.distancePct - recomputedDistance) <= 0.011, `${row.ticker}: rounded 200MA distance drifted`)
    assert(currentQuote.trend200.above === (last[1] >= recomputed), `${row.ticker}: 200MA direction flag drifted`)
  }
}

const assessed = assessOpportunity(model, quote, policy, true, '2026-08-21')
assert(assessed.decisionReady, `complete opportunity blocked: ${assessed.blockers.map((blocker) => blocker.message).join('; ')}`)
const expectedTerminal = 0.2 * 50 + 0.5 * 100 + 0.3 * 180
const netMultiple = 0.995 * expectedTerminal / (1.005 * 80)
const annualised = (Math.pow(netMultiple, 1 / 3) - 1) * 100
close(assessed.expectedTerminalValue, expectedTerminal, 'probability-weighted terminal value')
close(assessed.expectedTotalReturnPct, (netMultiple - 1) * 100, 'net terminal return')
close(assessed.annualisedExpectedTerminalWealthReturnPct, annualised, 'CAGR of expected terminal wealth')
close(assessed.hurdleEdgePct, annualised - 10, 'annual hurdle edge')
assert(assessed.positiveEdge, 'positive hurdle edge must qualify only when decision-ready')

const maxEntry = maxEntryPrice(expectedTerminal, model.horizonYears, policy)
close(assessed.maxEntryPrice, maxEntry, 'closed-form max entry')
const atBoundary = assessOpportunity(model, { ...quote, priceLocal: maxEntry, priceUsd: maxEntry }, policy, true, '2026-08-21')
close(atBoundary.hurdleEdgePct, 0, 'max-entry boundary', 1e-8)
const belowBoundary = assessOpportunity(model, { ...quote, priceLocal: maxEntry * 0.99, priceUsd: maxEntry * 0.99 }, policy, true, '2026-08-21')
const aboveBoundary = assessOpportunity(model, { ...quote, priceLocal: maxEntry * 1.01, priceUsd: maxEntry * 1.01 }, policy, true, '2026-08-21')
assert((belowBoundary.hurdleEdgePct ?? -Infinity) > 0, 'price below max entry must clear the hurdle')
assert((aboveBoundary.hurdleEdgePct ?? Infinity) < 0, 'price above max entry must miss the hurdle')
const lowerPrice = assessOpportunity(model, { ...quote, priceLocal: quote.priceLocal * 0.9, priceUsd: (quote.priceUsd as number) * 0.9 }, policy, true, '2026-08-21')
const higherPrice = assessOpportunity(model, { ...quote, priceLocal: quote.priceLocal * 1.1, priceUsd: (quote.priceUsd as number) * 1.1 }, policy, true, '2026-08-21')
assert((lowerPrice.hurdleEdgePct ?? -Infinity) > (assessed.hurdleEdgePct ?? -Infinity), 'lower price cannot reduce edge')
assert((higherPrice.hurdleEdgePct ?? Infinity) < (assessed.hurdleEdgePct ?? Infinity), 'higher price cannot improve edge')

const scaledModel = structuredClone(model)
for (const scenario of Object.values(scaledModel.valuation.scenarios)) scenario.metricValue *= 10
const scaled = assessOpportunity(scaledModel, { ...quote, priceLocal: 800, priceUsd: 800 }, policy, true, '2026-08-21')
close(scaled.hurdleEdgePct, assessed.hurdleEdgePct as number, 'price/terminal-value scale invariance')
close(scaled.annualisedExpectedTerminalWealthReturnPct, assessed.annualisedExpectedTerminalWealthReturnPct as number, 'return scale invariance')

close(maxEntryPrice(expectedTerminal * 2, model.horizonYears, policy), maxEntry * 2, 'terminal-value monotonicity')
assert(maxEntryPrice(expectedTerminal, model.horizonYears + 1, policy) < maxEntry, 'one-year delay must lower max entry for a positive hurdle')
assert(maxEntryPrice(expectedTerminal, model.horizonYears, { ...policy, requiredActivePremiumPct: 4 }) < maxEntry, 'higher hurdle must lower max entry')
assert(maxEntryPrice(expectedTerminal, model.horizonYears, { ...policy, buyCostPct: 1 }) < maxEntry, 'higher buy cost must lower max entry')
assert(maxEntryPrice(expectedTerminal, model.horizonYears, { ...policy, sellCostPct: 1 }) < maxEntry, 'higher sell cost must lower max entry')

const shiftedModel = structuredClone(model)
const shift = 0.05
shiftedModel.valuation.scenarios.bull.probability -= shift
shiftedModel.valuation.scenarios.bear.probability += shift
const shifted = assessOpportunity(shiftedModel, quote, policy, true, '2026-08-21')
close(shifted.expectedTerminalValue, expectedTerminal - shift * (180 - 50), 'bull-to-bear probability stress')
assert((shifted.hurdleEdgePct ?? Infinity) < (assessed.hurdleEdgePct ?? -Infinity), 'bull-to-bear probability shift cannot improve edge')
const hurdleTerminal = quote.priceLocal * 1.005 * Math.pow(1.1, model.horizonYears) / 0.995
close(assessed.stress?.bullToBearShiftPct, ((expectedTerminal - hurdleTerminal) / (180 - 50)) * 100, 'zero-edge probability tolerance', 1e-8)

const flatModel = structuredClone(model)
for (const scenario of Object.values(flatModel.valuation.scenarios)) scenario.metricValue = 180
const flat = assessOpportunity(flatModel, quote, policy, true, '2026-08-21')
assert(flat.positiveEdge && flat.stress?.survivesFullBullShift === true && flat.stress.bullToBearShiftPct === null, 'equal terminal values must survive a full bull-probability shift')

const zeroModel = structuredClone(model)
for (const scenario of Object.values(zeroModel.valuation.scenarios)) scenario.metricValue = 0
const zero = assessOpportunity(zeroModel, quote, policy, true, '2026-08-21')
assert(zero.decisionReady && !zero.positiveEdge, 'a valid zero terminal value is a negative opportunity, not missing evidence')
close(zero.expectedTerminalValue, 0, 'zero terminal value')
close(zero.annualisedExpectedTerminalWealthReturnPct, -100, 'zero terminal wealth annualises to -100%')
assert(zero.sensitivity.every((row) => Number.isFinite(row.hurdleEdgePct)), 'zero terminal value must not create a zero-price sensitivity row')

const invalidProbability = structuredClone(model)
invalidProbability.valuation.scenarios.bull.probability = 0.4
assert(validateOpportunityModel(invalidProbability).some((error) => error.includes('probabilities')), 'probabilities not summing to one must fail')
const invalidOrder = structuredClone(model)
invalidOrder.valuation.scenarios.bear.metricValue = 200
assert(validateOpportunityModel(invalidOrder).some((error) => error.includes('ordered')), 'bear/base/bull terminal values must be ordered')
const missingRationale = structuredClone(model)
missingRationale.valuation.scenarios.base.rationale = ''
assert(validateOpportunityModel(missingRationale).some((error) => error.includes('rationale')), 'missing scenario rationale must fail')
assert(validateOpportunityPolicy({ ...policy, sellCostPct: 100 }).length > 0, '100% sell cost must fail policy validation')
assert(validateOpportunityPolicy({ ...policy, benchmarkAnnualReturnPct: -100, requiredActivePremiumPct: 0 }).length > 0, 'a -100% hurdle must fail policy validation')

const monday = assessOpportunity(model, quote, policy, true, '2026-08-24')
assert(monday.decisionReady, 'Friday close must be one completed business session old on Monday')
const tuesday = assessOpportunity(model, quote, policy, true, '2026-08-25')
assert(!tuesday.decisionReady && tuesday.blockers.some((blocker) => blocker.code === 'market-stale'), 'two completed sessions must make a quote stale')
const staleModel = structuredClone(model)
staleModel.nextReviewAt = '2026-08-20'
const staleCrash = assessOpportunity(staleModel, { ...quote, priceLocal: 1, priceUsd: 1 }, policy, true, '2026-08-21')
assert(!staleCrash.decisionReady && !staleCrash.positiveEdge && staleCrash.state === 'STALE THESIS', 'a price crash cannot make stale research actionable')
const futureSource = structuredClone(model)
futureSource.sources[0].evidenceAsOf = '2026-08-22'
assert(!assessOpportunity(futureSource, quote, policy, true, '2026-08-21').decisionReady, 'future-dated source must block')

const mismatch = assessOpportunity(model, { ...quote, currency: 'EUR' }, policy, true, '2026-08-21')
assert(!mismatch.decisionReady && mismatch.annualisedExpectedTerminalWealthReturnPct === undefined, 'currency mismatch must not produce comparable return metrics')
const untradable = assessOpportunity(model, quote, policy, false, '2026-08-21')
assert(!untradable.decisionReady && !untradable.positiveEdge && untradable.state === 'NOT DIRECTLY TRADABLE', 'untradable listing cannot become actionable')
const missingQuote = assessOpportunity(model, undefined, policy, true, '2026-08-21')
assert(!missingQuote.decisionReady && missingQuote.annualisedExpectedTerminalWealthReturnPct === undefined, 'missing quote cannot be coerced into a return')

const before = JSON.stringify(model)
const repriced = assessOpportunity(model, { ...quote, priceLocal: 40, priceUsd: 40 }, policy, true, '2026-08-21')
assert(JSON.stringify(model) === before, 'market repricing must not mutate research assumptions')
assert(repriced.maxEntryPrice === assessed.maxEntryPrice, 'max entry must be independent of current market price')
for (const key of ['bear', 'base', 'bull'] as const) {
  assert(terminalValue(model, key) === terminalValue(JSON.parse(before) as EquityOpportunityModel, key), `${key} terminal value changed during repricing`)
}

const defaultScreen = screenUniversePosition(position, quote, true, DEFAULT_UNIVERSE_SCREEN_POLICY, 1, '2026-08-21')
assert(defaultScreen.passes, `complete current universe row must pass default screen: ${defaultScreen.blockers.map((blocker) => blocker.message).join('; ')}`)
assert(!screenUniversePosition(position, quote, true, { ...DEFAULT_UNIVERSE_SCREEN_POLICY, theme: 'biology' }, 1, '2026-08-21').passes, 'theme filter must scan out a non-member')
assert(!screenUniversePosition(position, quote, false, DEFAULT_UNIVERSE_SCREEN_POLICY, 1, '2026-08-21').passes, 'restricted listing must fail the universe screen')
assert(!screenUniversePosition(position, undefined, true, DEFAULT_UNIVERSE_SCREEN_POLICY, 1, '2026-08-21').passes, 'missing market row must fail closed')
assert(!screenUniversePosition(position, { ...quote, asOf: '2026-08-18' }, true, DEFAULT_UNIVERSE_SCREEN_POLICY, 1, '2026-08-21').passes, 'stale quote must fail the universe screen')
assert(!screenUniversePosition(position, quote, true, { ...DEFAULT_UNIVERSE_SCREEN_POLICY, minMarketCapUsdBn: 13 }, 1, '2026-08-21').passes, 'market-cap policy must change screen membership')
assert(!screenUniversePosition(position, quote, true, { ...DEFAULT_UNIVERSE_SCREEN_POLICY, maxRealisedVolPct: 40 }, 1, '2026-08-21').passes, 'volatility policy must change screen membership')
assert(!screenUniversePosition(position, quote, true, { ...DEFAULT_UNIVERSE_SCREEN_POLICY, maxDrawdownMagnitudePct: 30 }, 1, '2026-08-21').passes, 'drawdown policy must change screen membership')
assert(!screenUniversePosition(position, quote, true, { ...DEFAULT_UNIVERSE_SCREEN_POLICY, minThreeMonthReturnPct: 9 }, 1, '2026-08-21').passes, 'three-month return policy must change screen membership')
assert(!screenUniversePosition(position, { ...quote, trend200: { ma200: 90, distancePct: -11.11, above: false, observations: 260 } }, true, DEFAULT_UNIVERSE_SCREEN_POLICY, 1, '2026-08-21').passes, 'price below 200MA must fail the default screen')
assert(screenUniversePosition(position, { ...quote, trend200: { ma200: 90, distancePct: -11.11, above: false, observations: 260 } }, true, { ...DEFAULT_UNIVERSE_SCREEN_POLICY, requireAbove200DayMa: false }, 1, '2026-08-21').passes, 'disabling the 200MA what-if gate must admit an otherwise complete row')
assert(validateUniverseScreenPolicy({ ...DEFAULT_UNIVERSE_SCREEN_POLICY, maxDrawdownMagnitudePct: 101 }).length > 0, 'invalid universe threshold must fail validation')

const history = JSON.parse(readFileSync(resolve(here, '../public/data/equity-opportunity-history.json'), 'utf8')) as {
  schemaVersion: number
  policy: OpportunityPolicy
  snapshots: { asOf: string; ticker: string; modelVersion: string; expectedTerminalValue: number }[]
}
assert(history.schemaVersion === 1, 'opportunity history schema must remain supported')
assert(JSON.stringify(history.policy) === JSON.stringify(DEFAULT_OPPORTUNITY_POLICY), 'generated history must record the canonical policy exactly')
const historyKeys = history.snapshots.map((row) => `${row.asOf}|${row.ticker}|${row.modelVersion}`)
assert(new Set(historyKeys).size === historyKeys.length, 'opportunity history cannot contain duplicate date/ticker/model rows')
for (const authored of equityOpportunityModels) {
  const rows = history.snapshots.filter((row) => row.ticker === authored.ticker && row.modelVersion === authored.version)
  assert(rows.length > 0, `${authored.ticker}: canonical model version is absent from generated history`)
  const expected = SCENARIO_KEYS.reduce(
    (sum, key) => sum + authored.valuation.scenarios[key].probability * terminalValue(authored, key),
    0,
  )
  for (const row of rows) close(row.expectedTerminalValue, expected, `${authored.ticker}: history terminal value drifted from frozen model`)
}

console.log('opportunity universe screen, math, max entry, evidence gates, stress and frozen-target invariants hold')
