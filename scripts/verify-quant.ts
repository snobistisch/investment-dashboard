/** Independent invariants for the quantitative crypto artefacts.
 *
 *  The allocator has had a deploy-blocking verifier from the start. The risk
 *  rating did not, which allowed an equity annualisation constant to survive
 *  in a market that trades every day. Keep this file independent of the
 *  generator: it recomputes from the committed closes and published method.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const RISK_JSON = resolve(HERE, '../public/data/risk-rating.json')
const HISTORY_JSON = resolve(HERE, '../public/data/crypto-history.json')
const CRYPTO_HTML = resolve(HERE, '../public/dashboards/crypto.html')
const PORTFOLIO_JSON = resolve(HERE, '../public/data/portfolio.json')
const PORTFOLIO_HTML = resolve(HERE, '../public/dashboards/portfolio.html')
const MARKET_JSON = resolve(HERE, '../public/data/crypto-market.json')
const SCENARIOS_JSON = resolve(HERE, '../public/data/crypto-scenarios.json')

type Close = { d: string; c: number }

interface RiskFile {
  fetchedAt: string
  marketFetchedAt: string
  method: {
    daysPerYear: number
    weights: { vol: number; drawdown: number; dilution: number; liquidity: number }
    volBounds: { safe: number; extreme: number }
    drawdownBounds: { safe: number; extreme: number }
    dilutionBounds: { safe: number; extreme: number }
    liquidityBounds: { safe: number; extreme: number }
    buckets: { from: number; label: string }[]
  }
  rows: {
    ticker: string
    coingeckoId?: string
    measured: { realisedVolPct?: number; drawdownPct?: number; observations: number }
    inputs: { fdvx: number; vol24hUsd: number }
    components: { v?: number; d?: number; f: number; l: number }
    r?: number
    bucket?: string
  }[]
}

interface HistoryFile {
  fetchedAt: string
  series: Record<string, { closes: Close[] }>
}

interface PortfolioFile {
  marketFetchedAt: string
  historyFetchedAt: string
  riskFetchedAt: string
  scenarioAsOf: string
  scenarioHorizonYears: number
  method: { minOverlapDays: number; screenLiquidityUsdM: number }
  stats: {
    assets: number
    clusteredAssets: number
    unclusteredAssets: string[]
    clusters: number
    medianPairwiseActiveCorrelation: number
    medianPairwiseActiveCorrelationLiquid: number
    pairsWithTooLittleOverlap: number
  }
  rows: {
    ticker: string
    cluster: number
    observations: number
    vol24hUsdM: number
    fdvx: number
    scenarioEvAnnualPct: number
    scenarioEvTerminalPct: number
    scenarioEdgeVsBtcPct: number
    scenarioEdgeTerminalVsBtcPct: number
    scenarioLegs: { label: string; probability: number; returnPct: number }[]
    priceUsd: number
  }[]
  clusters: { members: string[] }[]
  correlation: Record<string, Record<string, number>>
}

let assertions = 0
function assert(condition: unknown, message: string): asserts condition {
  assertions++
  if (!condition) throw new Error(message)
}

const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const ramp = (n: number, safe: number, extreme: number) => clamp01((n - safe) / (extreme - safe))

function realisedVolPct(closes: number[], daysPerYear: number) {
  const returns = closes.slice(1).map((c, i) => Math.log(c / closes[i]))
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (returns.length - 1)
  return Math.sqrt(variance) * Math.sqrt(daysPerYear) * 100
}

function maxDrawdownPct(closes: number[]) {
  let peak = closes[0]
  let worst = 0
  for (const close of closes) {
    peak = Math.max(peak, close)
    worst = Math.min(worst, close / peak - 1)
  }
  return worst * 100
}

const risk = JSON.parse(readFileSync(RISK_JSON, 'utf8')) as RiskFile
const history = JSON.parse(readFileSync(HISTORY_JSON, 'utf8')) as HistoryFile
const cryptoHtml = readFileSync(CRYPTO_HTML, 'utf8')
const portfolio = JSON.parse(readFileSync(PORTFOLIO_JSON, 'utf8')) as PortfolioFile
const portfolioHtml = readFileSync(PORTFOLIO_HTML, 'utf8')
const market = JSON.parse(readFileSync(MARKET_JSON, 'utf8')) as {
  schemaVersion: number
  fetchedAt: string
  scenarioAsOf: string
  rows: {
    ticker: string
    priceUsd: number
    marketCapUsd: number
    fdvx: number
    floatPct: number
    vol24hUsd: number
    scenarioReturns: [number, number][]
    scenarioTargetsUsd: number[]
  }[]
}
const scenarios = JSON.parse(readFileSync(SCENARIOS_JSON, 'utf8')) as {
  schemaVersion: number
  asOf: string
  horizonYears: number
  rows: { ticker: string; legs: { probability: number; targetPriceUsd: number }[] }[]
}

assert(risk.method.daysPerYear === 365, 'crypto volatility must annualise over 365 trading days')
assert(risk.fetchedAt === history.fetchedAt, 'derived risk data must retain the history data vintage')
assert(risk.rows.length === 40, `expected 40 risk rows, got ${risk.rows.length}`)
assert(new Set(risk.rows.map((row) => row.coingeckoId)).size === 40, 'CoinGecko ids must be unique')
assert(!cryptoHtml.includes('EV_poker'), 'retired poker EV must not return to the live dashboard')
assert(!cryptoHtml.includes('fstar'), 'retired f* sizing must not return to the live dashboard')
assert(!portfolioHtml.toLowerCase().includes('rebalanc'), 'manual rebalancing must not be presented as a rule')
assert(portfolioHtml.includes('id="minDays" min="90"'), 'builder must exclude sub-90-day histories')
assert(!portfolioHtml.includes('ROWS.indexOf'), 'source-array order must never stand in for EV rank')
assert(!portfolioHtml.includes('data-l="mom"'), 'momentum must not bypass the scenario-EV gate')
assert(portfolioHtml.includes('id="probBuffer"'), 'pilot must expose probability robustness')
assert(portfolioHtml.includes('id="costBuffer"'), 'pilot must expose execution-cost uncertainty')
assert(portfolioHtml.includes('id="scenarioHorizon"'), 'pilot must expose the scenario horizon')
assert(portfolioHtml.includes('id="venueConfirmed"'), 'pilot orders must require a venue check')
assert(portfolioHtml.includes('Download frozen decision snapshot'), 'pilot must preserve its decision inputs')
assert(portfolioHtml.includes('public/data/crypto-scenarios.json'), 'pilot must state frozen-scenario provenance')
assert(!portfolioHtml.includes('Spread and slippage are not modelled'), 'pilot must not deny its visible cost buffer')
assert(market.schemaVersion === 1 && scenarios.schemaVersion === 1, 'crypto pilot schemas must be recognised')
assert(market.rows.length === 40, `expected 40 live crypto market rows, got ${market.rows.length}`)
assert(scenarios.rows.length === 40, `expected 40 frozen scenario rows, got ${scenarios.rows.length}`)
assert(market.scenarioAsOf === scenarios.asOf, 'market and scenario anchor dates disagree')
assert(portfolio.marketFetchedAt === market.fetchedAt, 'portfolio did not consume the current crypto market artefact')
assert(risk.marketFetchedAt === market.fetchedAt, 'risk rating did not consume the current crypto market artefact')
assert(portfolio.historyFetchedAt === history.fetchedAt, 'portfolio did not consume the current price history')
assert(portfolio.riskFetchedAt === risk.fetchedAt, 'portfolio did not consume the current risk rating')
assert(portfolio.scenarioAsOf === scenarios.asOf, 'portfolio did not consume the frozen scenario set')
assert(portfolio.scenarioHorizonYears === scenarios.horizonYears, 'portfolio scenario horizon drifted')
const marketAgeHours = (Date.now() - Date.parse(market.fetchedAt)) / 3_600_000
assert(marketAgeHours >= -1 && marketAgeHours <= 48, `crypto market data is ${marketAgeHours.toFixed(1)}h old; refresh before deploy`)
const historyAgeHours = (Date.now() - Date.parse(history.fetchedAt)) / 3_600_000
const riskAgeHours = (Date.now() - Date.parse(risk.fetchedAt)) / 3_600_000
assert(historyAgeHours >= -1 && historyAgeHours <= 48, `crypto history is ${historyAgeHours.toFixed(1)}h old; refresh before deploy`)
assert(riskAgeHours >= -1 && riskAgeHours <= 48, `crypto risk data is ${riskAgeHours.toFixed(1)}h old; refresh before deploy`)

const marketBy = Object.fromEntries(market.rows.map((row) => [row.ticker, row]))
const scenarioBy = Object.fromEntries(scenarios.rows.map((row) => [row.ticker, row]))
for (const row of market.rows) {
  assert(row.priceUsd > 0 && row.marketCapUsd > 0, `${row.ticker}: unusable live price or cap`)
  assert(row.fdvx >= 1 && row.floatPct > 0 && row.floatPct <= 100, `${row.ticker}: invalid supply evidence`)
  assert(row.vol24hUsd >= 0, `${row.ticker}: invalid volume`)
  const frozen = scenarioBy[row.ticker]
  assert(frozen !== undefined, `${row.ticker}: live row has no frozen scenario`)
  assert(row.scenarioReturns.length === frozen.legs.length, `${row.ticker}: scenario leg count drifted`)
  row.scenarioReturns.forEach(([probability, outcome], index) => {
    assert(probability === frozen.legs[index].probability, `${row.ticker}: probability changed during market refresh`)
    const expected = frozen.legs[index].targetPriceUsd / row.priceUsd - 1
    assert(
      Math.abs(outcome - expected) < 1e-7 * Math.max(1, Math.abs(expected)),
      `${row.ticker}: scenario return did not reprice from frozen target`,
    )
  })
}

for (const row of risk.rows) {
  const series = history.series[row.ticker]
  assert(series !== undefined, `${row.ticker}: missing committed price history`)
  const closes = series.closes.map((point) => point.c)
  assert(closes.length === row.measured.observations, `${row.ticker}: observation count drifted`)

  const vol = round(realisedVolPct(closes, risk.method.daysPerYear), 1)
  const drawdown = round(maxDrawdownPct(closes), 1)
  assert(vol === row.measured.realisedVolPct, `${row.ticker}: volatility ${row.measured.realisedVolPct} != ${vol}`)
  assert(drawdown === row.measured.drawdownPct, `${row.ticker}: drawdown ${row.measured.drawdownPct} != ${drawdown}`)

  const v = ramp(vol, risk.method.volBounds.safe, risk.method.volBounds.extreme)
  const d = ramp(Math.abs(drawdown), risk.method.drawdownBounds.safe, risk.method.drawdownBounds.extreme)
  const f = ramp(row.inputs.fdvx, risk.method.dilutionBounds.safe, risk.method.dilutionBounds.extreme)
  const l = row.inputs.vol24hUsd > 0
    ? clamp01(
        1 -
          (Math.log10(row.inputs.vol24hUsd) - Math.log10(risk.method.liquidityBounds.extreme)) /
            (Math.log10(risk.method.liquidityBounds.safe) - Math.log10(risk.method.liquidityBounds.extreme)),
      )
    : 1
  assert(row.components.v === round(v, 4), `${row.ticker}: V component drifted`)
  assert(row.components.d === round(d, 4), `${row.ticker}: D component drifted`)
  assert(row.components.f === round(f, 4), `${row.ticker}: F component drifted`)
  assert(row.components.l === round(l, 4), `${row.ticker}: L component drifted`)

  const rating =
    risk.method.weights.vol * v +
    risk.method.weights.drawdown * d +
    risk.method.weights.dilution * f +
    risk.method.weights.liquidity * l
  assert(row.r === round(rating, 4), `${row.ticker}: rating drifted`)
  let bucket = risk.method.buckets[0].label
  for (const candidate of risk.method.buckets) if (rating >= candidate.from) bucket = candidate.label
  assert(row.bucket === bucket, `${row.ticker}: bucket ${row.bucket} != ${bucket}`)
}

const portfolioRows = Object.fromEntries(portfolio.rows.map((row) => [row.ticker, row]))
const scenarioCandidates = portfolio.rows.filter((row) => row.scenarioEdgeVsBtcPct > 0)
assert(scenarioCandidates.length > 0, 'the frozen scenario set currently produces no positive BTC edge')
const btcMarket = marketBy.BTC
assert(btcMarket !== undefined, 'live market artefact has no BTC benchmark')
const btcTerminalPct = btcMarket.scenarioReturns.reduce((sum, [probability, outcome]) => sum + probability * outcome, 0) * 100
const btcAnnualPct = (Math.pow(1 + btcTerminalPct / 100, 1 / scenarios.horizonYears) - 1) * 100
for (const row of portfolio.rows) {
  const live = marketBy[row.ticker]
  assert(live !== undefined, `${row.ticker}: portfolio row has no live market input`)
  assert(row.priceUsd === live.priceUsd, `${row.ticker}: portfolio reference price drifted`)
  assert(Math.abs(row.scenarioLegs.reduce((sum, leg) => sum + leg.probability, 0) - 1) < 1e-9, `${row.ticker}: probabilities do not sum to one`)
  const terminalPct = live.scenarioReturns.reduce((sum, [probability, outcome]) => sum + probability * outcome, 0) * 100
  const annualPct = (Math.pow(1 + terminalPct / 100, 1 / scenarios.horizonYears) - 1) * 100
  assert(Math.abs(row.scenarioEvTerminalPct - round(terminalPct, 2)) < 1e-9, `${row.ticker}: terminal scenario EV drifted`)
  assert(Math.abs(row.scenarioEvAnnualPct - round(annualPct, 1)) < 1e-9, `${row.ticker}: annualised scenario EV drifted`)
  assert(Math.abs(row.scenarioEdgeTerminalVsBtcPct - round(terminalPct - btcTerminalPct, 2)) < 1e-9, `${row.ticker}: terminal BTC edge drifted`)
  assert(Math.abs(row.scenarioEdgeVsBtcPct - round(annualPct - btcAnnualPct, 1)) < 1e-9, `${row.ticker}: annualised BTC edge drifted`)
  const annualSign = Math.sign(row.scenarioEdgeVsBtcPct)
  const terminalSign = Math.sign(row.scenarioEdgeTerminalVsBtcPct)
  assert(annualSign === terminalSign, `${row.ticker}: annualisation changed the edge sign`)
}
const clusteredMembers = portfolio.clusters.flatMap((cluster) => cluster.members)
assert(portfolio.stats.assets === portfolio.rows.length, 'portfolio asset count drifted')
assert(portfolio.stats.clusters === portfolio.clusters.length, 'portfolio cluster count drifted')
assert(clusteredMembers.length === portfolio.stats.clusteredAssets, 'clustered asset count drifted')
assert(new Set(clusteredMembers).size === clusteredMembers.length, 'an asset appears in more than one cluster')
for (const ticker of clusteredMembers) {
  assert(portfolioRows[ticker].observations >= portfolio.method.minOverlapDays, `${ticker}: clustered too early`)
  assert(portfolioRows[ticker].cluster >= 0, `${ticker}: cluster id missing`)
}
for (const ticker of portfolio.stats.unclusteredAssets) {
  assert(portfolioRows[ticker].observations < portfolio.method.minOverlapDays, `${ticker}: should be clusterable`)
  assert(portfolioRows[ticker].cluster === -1, `${ticker}: unknown cluster must be explicit`)
}

const correlations: number[] = []
const liquidCorrelations: number[] = []
let thinPairs = 0
const tickers = portfolio.rows.map((row) => row.ticker)
for (let i = 0; i < tickers.length; i++) {
  for (let j = i + 1; j < tickers.length; j++) {
    const a = tickers[i]
    const b = tickers[j]
    const rho = portfolio.correlation[a]?.[b]
    if (rho === undefined) {
      thinPairs++
      continue
    }
    assert(rho >= -1 && rho <= 1, `${a}/${b}: correlation outside [-1,1]`)
    assert(rho === portfolio.correlation[b]?.[a], `${a}/${b}: correlation matrix is asymmetric`)
    correlations.push(rho)
    if (
      portfolioRows[a].vol24hUsdM >= portfolio.method.screenLiquidityUsdM &&
      portfolioRows[b].vol24hUsdM >= portfolio.method.screenLiquidityUsdM
    ) {
      liquidCorrelations.push(rho)
    }
  }
}
const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
assert(round(median(correlations), 4) === portfolio.stats.medianPairwiseActiveCorrelation, 'all-pair median drifted')
assert(
  round(median(liquidCorrelations), 4) === portfolio.stats.medianPairwiseActiveCorrelationLiquid,
  'liquid-pair median drifted',
)
assert(thinPairs === portfolio.stats.pairsWithTooLittleOverlap, 'thin-pair count drifted')

console.log(`${assertions.toLocaleString('en-US')} quantitative risk invariants hold`)
