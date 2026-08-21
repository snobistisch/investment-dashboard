import type { MarketQuote } from '../../data/market-data'
import type { Position } from '../../data/positions'
import { businessSessionAge } from './opportunity'

export const EQUITY_SCREEN_THEMES = ['all', 'photonics', 'biology', 'robotics', 'quantum', 'agentic'] as const
export type EquityScreenTheme = (typeof EQUITY_SCREEN_THEMES)[number]

export interface UniverseScreenPolicy {
  theme: EquityScreenTheme
  minMarketCapUsdBn: number
  maxRealisedVolPct: number
  maxDrawdownMagnitudePct: number
  minThreeMonthReturnPct: number
}

export const DEFAULT_UNIVERSE_SCREEN_POLICY: UniverseScreenPolicy = {
  theme: 'all',
  minMarketCapUsdBn: 0,
  maxRealisedVolPct: 200,
  maxDrawdownMagnitudePct: 100,
  minThreeMonthReturnPct: -100,
}

export type UniverseScreenBlockerCode =
  | 'policy'
  | 'theme'
  | 'tradability'
  | 'market-missing'
  | 'market-stale'
  | 'market-cap'
  | 'volatility'
  | 'drawdown'
  | 'momentum'

export interface UniverseScreenBlocker {
  code: UniverseScreenBlockerCode
  message: string
}

export interface UniverseScreenResult {
  ticker: string
  quote?: MarketQuote
  directlyTradable: boolean
  passes: boolean
  blockers: UniverseScreenBlocker[]
  marketCapUsdBn?: number
  realisedVolPct?: number
  drawdownMagnitudePct?: number
  threeMonthReturnPct?: number
}

export function validateUniverseScreenPolicy(policy: UniverseScreenPolicy) {
  const errors: string[] = []
  if (!EQUITY_SCREEN_THEMES.includes(policy.theme)) errors.push('Theme is not supported.')
  if (!Number.isFinite(policy.minMarketCapUsdBn) || policy.minMarketCapUsdBn < 0) errors.push('Minimum market cap must be non-negative.')
  if (!Number.isFinite(policy.maxRealisedVolPct) || policy.maxRealisedVolPct < 0) errors.push('Maximum realised volatility must be non-negative.')
  if (!Number.isFinite(policy.maxDrawdownMagnitudePct) || policy.maxDrawdownMagnitudePct < 0 || policy.maxDrawdownMagnitudePct > 100) errors.push('Maximum drawdown magnitude must be between 0% and 100%.')
  if (!Number.isFinite(policy.minThreeMonthReturnPct) || policy.minThreeMonthReturnPct < -100) errors.push('Minimum three-month return must be at least -100%.')
  return errors
}

export function screenUniversePosition(
  position: Position,
  quote: MarketQuote | undefined,
  directlyTradable: boolean,
  policy: UniverseScreenPolicy,
  maxQuoteBusinessSessions: number,
  today = new Date().toISOString().slice(0, 10),
): UniverseScreenResult {
  const blockers: UniverseScreenBlocker[] = []
  const marketCapUsdBn = quote?.marketCapUsd
  const realisedVolPct = quote?.stats?.realisedVolPct
  const drawdownMagnitudePct = quote?.stats?.maxDrawdownPct === undefined
    ? undefined
    : Math.abs(quote.stats.maxDrawdownPct)
  const threeMonthReturnPct = quote?.returns?.m3

  blockers.push(...validateUniverseScreenPolicy(policy).map((message) => ({ code: 'policy' as const, message })))

  if (policy.theme !== 'all' && !position.sections.includes(policy.theme)) {
    blockers.push({ code: 'theme', message: `Outside the ${policy.theme} theme selected in this screen.` })
  }
  if (!directlyTradable) blockers.push({ code: 'tradability', message: 'Not directly tradable through the assumed Dutch retail route.' })
  if (!quote) blockers.push({ code: 'market-missing', message: 'Current quote and market statistics are missing.' })
  else if (businessSessionAge(quote.asOf, today) > maxQuoteBusinessSessions) {
    blockers.push({ code: 'market-stale', message: `Quote ${quote.asOf} is older than ${maxQuoteBusinessSessions} completed business session.` })
  }

  if (marketCapUsdBn === undefined || !Number.isFinite(marketCapUsdBn)) blockers.push({ code: 'market-cap', message: 'Current USD market cap is missing.' })
  else if (marketCapUsdBn < policy.minMarketCapUsdBn) blockers.push({ code: 'market-cap', message: `Market cap $${marketCapUsdBn.toFixed(2)}bn is below the $${policy.minMarketCapUsdBn.toFixed(2)}bn minimum.` })

  if (realisedVolPct === undefined || !Number.isFinite(realisedVolPct)) blockers.push({ code: 'volatility', message: 'One-year realised volatility is missing.' })
  else if (realisedVolPct > policy.maxRealisedVolPct) blockers.push({ code: 'volatility', message: `One-year volatility ${realisedVolPct.toFixed(1)}% exceeds the ${policy.maxRealisedVolPct.toFixed(1)}% maximum.` })

  if (drawdownMagnitudePct === undefined || !Number.isFinite(drawdownMagnitudePct)) blockers.push({ code: 'drawdown', message: 'One-year maximum drawdown is missing.' })
  else if (drawdownMagnitudePct > policy.maxDrawdownMagnitudePct) blockers.push({ code: 'drawdown', message: `One-year drawdown ${drawdownMagnitudePct.toFixed(1)}% exceeds the ${policy.maxDrawdownMagnitudePct.toFixed(1)}% maximum.` })

  if (threeMonthReturnPct === undefined || !Number.isFinite(threeMonthReturnPct)) blockers.push({ code: 'momentum', message: 'Three-month USD return is missing.' })
  else if (threeMonthReturnPct < policy.minThreeMonthReturnPct) blockers.push({ code: 'momentum', message: `Three-month return ${threeMonthReturnPct.toFixed(1)}% is below the ${policy.minThreeMonthReturnPct.toFixed(1)}% minimum.` })

  return {
    ticker: position.ticker,
    quote,
    directlyTradable,
    passes: blockers.length === 0,
    blockers,
    marketCapUsdBn,
    realisedVolPct,
    drawdownMagnitudePct,
    threeMonthReturnPct,
  }
}
