/** Prints the Opportunities result for every modelled long as one json object.
 *
 *  This exists for monitoring agents. Recomputing the screen and the valuation
 *  outside this repository would copy the engine and drift from it; calling
 *  the engine here keeps an alert identical to what the dashboard shows.
 *
 *      npm run -s signals              committed snapshot, today's date (UTC)
 *      npm run -s signals -- --live    adds a what-if at the provider's current price
 *
 *  The --live block is a what-if, never the dashboard result: it moves only the
 *  price and the 200MA distance, while volatility, drawdown and the three-month
 *  return stay at the snapshot's completed sessions. A quote fetch that fails
 *  leaves `live` null for that row; it is not retried or estimated.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { equityOpportunityModels } from '../src/data/equity-opportunities'
import type { MarketQuote, MarketSnapshot } from '../src/data/market-data'
import { positions } from '../src/data/positions'
import { isDirectlyTradable } from '../src/sections/allocator/allocation'
import { DEFAULT_OPPORTUNITY_POLICY as policy, type EquityOpportunityModel } from '../src/sections/opportunities/model'
import { assessOpportunity } from '../src/sections/opportunities/opportunity'
import {
  DEFAULT_UNIVERSE_SCREEN_POLICY as screenPolicy,
  classifyMa200Opportunity,
  screenUniversePosition,
} from '../src/sections/opportunities/universe-screen'

const HERE = dirname(fileURLToPath(import.meta.url))
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
const live = process.argv.includes('--live')
const today = new Date().toISOString().slice(0, 10)
const snapshot = JSON.parse(readFileSync(resolve(HERE, '../public/data/market-data.json'), 'utf8')) as MarketSnapshot

function round(value: number | undefined | null, dp = 2) {
  if (value === undefined || value === null || !Number.isFinite(value)) return null
  const f = 10 ** dp
  return Math.round(value * f) / f
}

function evaluate(model: EquityOpportunityModel, quote: MarketQuote | undefined) {
  const position = positions.find((row) => row.ticker === model.ticker)
  const tradable = Boolean(position && isDirectlyTradable(position))
  const screen = position
    ? screenUniversePosition(position, quote, tradable, screenPolicy, policy.maxQuoteBusinessSessions, today)
    : undefined
  const assessment = assessOpportunity(model, quote, policy, tradable, today)
  return {
    qualified: Boolean(screen?.passes && assessment.decisionReady && assessment.positiveEdge),
    state: assessment.state,
    screenPasses: screen?.passes ?? false,
    screenBlockers: screen?.blockers.map((blocker) => blocker.code) ?? ['missing-position'],
    assessmentBlockers: assessment.blockers.map((blocker) => blocker.code),
    hurdleEdgePct: round(assessment.hurdleEdgePct),
    ma200DistancePct: round(quote?.trend200?.distancePct),
    ma200State: classifyMa200Opportunity(quote?.trend200?.distancePct, screenPolicy.maxMa200OpportunityDistancePct),
    bullToBearShiftPct: round(assessment.stress?.bullToBearShiftPct),
    maxEntryPrice: round(assessment.maxEntryPrice, 4),
  }
}

async function currentPrice(symbol: string) {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
      { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10_000) },
    )
    if (!res.ok) return null
    const body = (await res.json()) as {
      chart: { result?: [{ meta: { regularMarketPrice?: number; regularMarketTime?: number; currentTradingPeriod?: { regular?: { start: number; end: number } } } }] }
    }
    const meta = body.chart.result?.[0]?.meta
    if (!meta?.regularMarketPrice || meta.regularMarketPrice <= 0 || !meta.regularMarketTime) return null
    const regular = meta.currentTradingPeriod?.regular
    const now = Date.now() / 1000
    return {
      price: meta.regularMarketPrice,
      time: new Date(meta.regularMarketTime * 1000).toISOString(),
      sessionOpen: Boolean(regular && now >= regular.start && now < regular.end),
    }
  } catch {
    return null
  }
}

/** The snapshot quote moved to the current price; everything else unchanged. */
function atPrice(quote: MarketQuote, price: number): MarketQuote {
  const trend200 = quote.trend200
    ? { ...quote.trend200, distancePct: (price / quote.trend200.ma200 - 1) * 100, above: price >= quote.trend200.ma200 }
    : undefined
  return {
    ...quote,
    priceLocal: price,
    priceUsd: quote.priceUsd === undefined ? undefined : quote.priceUsd * (price / quote.priceLocal),
    asOf: today,
    trend200,
  }
}

const rows = []
for (const model of [...equityOpportunityModels].sort((a, b) => a.ticker.localeCompare(b.ticker))) {
  const position = positions.find((row) => row.ticker === model.ticker)
  const quote = snapshot.quotes[model.ticker]
  rows.push({
    ticker: model.ticker,
    company: model.company,
    exchange: position?.exchange ?? null,
    themes: position?.sections ?? [],
    providerSymbol: quote?.symbol ?? null,
    currency: quote?.currency ?? model.currency,
    close: quote?.priceLocal ?? null,
    closeAsOf: quote?.asOf ?? null,
    ...evaluate(model, quote),
    modelVersion: model.version,
    nextReviewAt: model.nextReviewAt,
    thesis: model.thesis,
    falsifier: model.falsifier,
    catalyst: model.catalyst,
    live: null as null | Record<string, unknown>,
  })
}

if (live) {
  // Six at a time: the provider rate-limits bursts, and a serial loop over
  // the whole book takes long enough to matter for a frequent job.
  for (let start = 0; start < rows.length; start += 6) {
    await Promise.all(rows.slice(start, start + 6).map(async (row) => {
      const quote = snapshot.quotes[row.ticker]
      const model = equityOpportunityModels.find((candidate) => candidate.ticker === row.ticker)
      if (!quote || !model) return
      const current = await currentPrice(quote.symbol)
      if (!current) return
      const whatIf = evaluate(model, atPrice(quote, current.price))
      row.live = {
        price: current.price,
        time: current.time,
        sessionOpen: current.sessionOpen,
        changeVsClosePct: round((current.price / quote.priceLocal - 1) * 100),
        qualified: whatIf.qualified,
        screenBlockers: whatIf.screenBlockers,
        hurdleEdgePct: whatIf.hurdleEdgePct,
        ma200DistancePct: whatIf.ma200DistancePct,
        ma200State: whatIf.ma200State,
      }
    }))
  }
}

const fetchedAt = Date.parse(snapshot.fetchedAt)
console.log(JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  evaluatedFor: today,
  snapshot: {
    fetchedAt: snapshot.fetchedAt,
    ageHours: Number.isFinite(fetchedAt) ? round((Date.now() - fetchedAt) / 3_600_000, 1) : null,
    fxAsOf: snapshot.fx.asOf,
  },
  policy: {
    hurdleAnnualPct: policy.benchmarkAnnualReturnPct + policy.requiredActivePremiumPct,
    ma200EntryZonePct: [0, screenPolicy.maxMa200OpportunityDistancePct],
  },
  nextMandatoryReview: equityOpportunityModels.map((model) => model.nextReviewAt).sort()[0] ?? null,
  qualified: rows.filter((row) => row.qualified).map((row) => row.ticker),
  liveQualified: live ? rows.filter((row) => row.live?.qualified).map((row) => row.ticker) : null,
  rows,
}, null, 1))
