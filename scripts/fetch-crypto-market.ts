/** Refreshes every market-dependent input used by the crypto decision layer.
 *
 * One CoinGecko /coins/markets request updates price, market cap, FDV, float,
 * volume, trailing return and ATH distance for the full pinned universe. The
 * subjective forecast remains frozen in crypto-scenarios.json; only the
 * return offered by today's price is recomputed.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CRYPTO_IDS, TOTAL_SUPPLY_DENOMINATOR } from './crypto-config'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../public/data/crypto-market.json')
const SCENARIOS_JSON = resolve(HERE, '../public/data/crypto-scenarios.json')
const CRYPTO_HTML = resolve(HERE, '../public/dashboards/crypto.html')

interface ScenarioFile {
  schemaVersion: number
  asOf: string
  horizonYears: number
  rows: {
    ticker: string
    legs: { label: string; probability: number; targetPriceUsd: number }[]
  }[]
}

interface MarketRow {
  id: string
  symbol: string
  name: string
  current_price: number | null
  market_cap: number | null
  fully_diluted_valuation: number | null
  total_volume: number | null
  circulating_supply: number | null
  total_supply: number | null
  max_supply: number | null
  ath_change_percentage: number | null
  ath_date: string | null
  price_change_percentage_1y_in_currency: number | null
  last_updated: string | null
}

const scenarios = JSON.parse(readFileSync(SCENARIOS_JSON, 'utf8')) as ScenarioFile
if (scenarios.schemaVersion !== 1) throw new Error('unsupported crypto scenario schema')
const scenarioBy = Object.fromEntries(scenarios.rows.map((row) => [row.ticker, row]))
const tickerById = Object.fromEntries(Object.entries(CRYPTO_IDS).map(([ticker, id]) => [id, ticker]))
const ids = Object.values(CRYPTO_IDS)
const url =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd' +
  `&ids=${encodeURIComponent(ids.join(','))}` +
  '&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1y'

const sleep = (milliseconds: number) => new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds))
let body: MarketRow[] | undefined
for (let attempt = 0; attempt < 6; attempt++) {
  const response = await fetch(url, { headers: { accept: 'application/json' } })
  if (response.ok) {
    body = (await response.json()) as MarketRow[]
    break
  }
  const retryable = response.status === 429 || response.status >= 500
  if (!retryable || attempt === 5) throw new Error(`CoinGecko markets: HTTP ${response.status}`)
  const retryAfterSeconds = Number(response.headers.get('retry-after'))
  const backoffMilliseconds = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
    ? Math.min(60_000, retryAfterSeconds * 1_000)
    : 2_000 * 2 ** attempt
  console.warn(`CoinGecko markets: HTTP ${response.status}; retrying in ${backoffMilliseconds / 1_000}s`)
  await sleep(backoffMilliseconds)
}
if (!body) throw new Error('CoinGecko markets returned no body')
const byId = Object.fromEntries(body.map((row) => [row.id, row]))
const missing = ids.filter((id) => !byId[id])
if (missing.length) throw new Error(`CoinGecko omitted pinned ids: ${missing.join(', ')}`)

const sig = (n: number) => Number(n.toPrecision(8))
const fmtMoney = (n: number | undefined) => {
  if (n === undefined) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(n >= 100e9 ? 0 : 2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(n >= 100e6 ? 0 : 1)}M`
  return `$${Math.round(n).toLocaleString('en-US')}`
}

const rows = ids.map((id) => {
  const source = byId[id]
  const ticker = tickerById[id]
  const scenario = scenarioBy[ticker]
  if (!scenario) throw new Error(`${ticker}: missing frozen scenario`)
  const priceUsd = source.current_price ?? undefined
  const marketCapUsd = source.market_cap ?? undefined
  if (!(priceUsd && priceUsd > 0) || !(marketCapUsd && marketCapUsd > 0)) {
    throw new Error(`${ticker}: unusable live price or market cap`)
  }
  const fdvUsd = source.fully_diluted_valuation ?? undefined
  const denominator = TOTAL_SUPPLY_DENOMINATOR.has(ticker)
    ? source.total_supply
    : source.max_supply ?? source.total_supply
  const floatPct = source.circulating_supply && denominator
    ? Math.min(100, (source.circulating_supply / denominator) * 100)
    : undefined
  const fdvx = fdvUsd && marketCapUsd ? fdvUsd / marketCapUsd : floatPct ? 100 / floatPct : undefined
  if (!(fdvx && fdvx > 0) || floatPct === undefined) throw new Error(`${ticker}: missing supply or FDV evidence`)
  return {
    ticker,
    coingeckoId: id,
    providerName: source.name,
    priceUsd: sig(priceUsd),
    marketCapUsd: sig(marketCapUsd),
    fdvUsd: fdvUsd ? sig(fdvUsd) : undefined,
    fdvx: sig(fdvx),
    floatPct: sig(floatPct),
    vol24hUsd: sig(source.total_volume ?? 0),
    return1yPct: source.price_change_percentage_1y_in_currency === null
      ? undefined
      : sig(source.price_change_percentage_1y_in_currency),
    athChangePct: source.ath_change_percentage === null ? undefined : sig(source.ath_change_percentage),
    athDate: source.ath_date?.slice(0, 10),
    asOf: source.last_updated ?? new Date().toISOString(),
    scenarioReturns: scenario.legs.map((leg) => [
      leg.probability,
      sig(leg.targetPriceUsd / priceUsd - 1),
    ]),
    scenarioTargetsUsd: scenario.legs.map((leg) => leg.targetPriceUsd),
  }
})

const fetchedAt = new Date().toISOString()
const artefact = {
  schemaVersion: 1,
  fetchedAt,
  provider: 'CoinGecko /coins/markets; pinned ids',
  scenarioAsOf: scenarios.asOf,
  scenarioHorizonYears: scenarios.horizonYears,
  rows,
}
writeFileSync(OUT, JSON.stringify(artefact, null, 2) + '\n')

const pageRows = Object.fromEntries(
  rows.map((row) => [
    row.ticker,
    {
      price: row.priceUsd,
      mcap: row.marketCapUsd / 1e9,
      mcapd: fmtMoney(row.marketCapUsd),
      fdvd: fmtMoney(row.fdvUsd),
      fdvx: Number(row.fdvx.toFixed(2)),
      flt: Number(row.floatPct.toFixed(1)),
      vol: Number((row.vol24hUsd / 1e6).toFixed(1)),
      y1: row.return1yPct === undefined ? null : Math.round(row.return1yPct),
      ath: row.athChangePct === undefined ? null : Math.round(row.athChangePct),
      athY: row.athDate?.slice(0, 7) ?? null,
      sc: row.scenarioReturns,
      targets: row.scenarioTargetsUsd,
    },
  ]),
)

const START = '/* CRYPTO-MARKET-START'
const END = '/* CRYPTO-MARKET-END */'
const html = readFileSync(CRYPTO_HTML, 'utf8')
const from = html.indexOf(START)
const to = html.indexOf(END)
if (from < 0 || to < 0) throw new Error('crypto.html carries no CRYPTO-MARKET markers')
const block =
  `${START} — generated by scripts/fetch-crypto-market.ts, do not edit by hand.\n` +
  `   Market inputs fetched ${fetchedAt}; scenario targets frozen ${scenarios.asOf}. */\n` +
  `const CRYPTO_MARKET = ${JSON.stringify(pageRows)};\n` +
  `TOKENS.forEach(c => { if(CRYPTO_MARKET[c.tk]) Object.assign(c, CRYPTO_MARKET[c.tk]); });\n`
writeFileSync(CRYPTO_HTML, html.slice(0, from) + block + html.slice(to))

console.log(`refreshed ${rows.length} crypto market rows at ${fetchedAt}`)
console.log(`wrote ${OUT}`)
console.log(`patched ${CRYPTO_HTML}`)
