// Fetches live market data for every ticker in positions.ts and writes
// public/data/market-data.json. Run with `npm run fetch-market-data`.
//
// ---------------------------------------------------------------------------
// PROVENANCE — this script never writes to positions.ts
// ---------------------------------------------------------------------------
// positions.ts is a transcription with per-section sourcing. Swapping live
// values into it would destroy the one property that makes it trustworthy.
// Live values live here, in their own layer, and are merged at read time so
// the UI can show which rows are live, which are transcribed, and how old the
// snapshot is.
//
// ---------------------------------------------------------------------------
// MAPPING — the part that goes wrong quietly
// ---------------------------------------------------------------------------
// A wrong symbol that silently returns another company's price is far worse
// than a missing one. So: every non-US venue suffix and every crypto id is
// stated explicitly below, and anything that cannot be mapped with certainty
// is listed in UNMAPPED with a reason and keeps its transcribed value.
//
// Two traps measured on 2026-08-09, both live in this file:
//   - Taipei Exchange is `.TWO`, not `.TW`. `3081.TW` returns nothing.
//   - Crypto symbols are ambiguous on CoinGecko: `LIT` matches Lighter, LIT
//     and Litentry; `NOCK` matches Nock and Nockchain; peaq's id is `peaq-2`.
//     Every id here is pinned by hand against the full coin list.
//
// Providers:
//   equities  Yahoo Finance  v7/finance/quote (cap) + v8/finance/chart (history)
//   crypto    CoinGecko      simple/price + market_chart   [COINGECKO_API_KEY]
//   fx        ECB daily reference rates + Yahoo `TWD=X` (ECB omits TWD)

import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { positions } from '../src/data/positions'

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data/market-data.json')
const SCHEMA_VERSION = 1
const BN = 1e9
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

/** Trailing window for realised volatility and max drawdown. */
const WINDOW_DAYS = 365

/** The window JULY_2026_DRAWDOWN describes: the SOX peaked 22 Jun 2026 and the
 *  Situational Awareness fund was liquidated 29 Jul 2026. Per-name realised
 *  drawdown over this window is what replaces the flat index multiplication in
 *  StressScenario — the anchor stays, as a labelled historical fact. */
const JULY_WINDOW = { from: '2026-06-22', to: '2026-07-29' }

// ---------------------------------------------------------------------------
// Ticker map
// ---------------------------------------------------------------------------

/** Yahoo suffix per exchange. '' means the ticker in positions.ts is already
 *  the provider symbol (US listings, and the rows that carry their own suffix). */
const EXCHANGE_SUFFIX: Record<string, string> = {
  Nasdaq: '',
  NYSE: '',
  'Nasdaq (ETF)': '',
  'Nasdaq / TSXV': '', // POET trades on both; the Nasdaq line is the liquid one
  Tokyo: '.T',
  Shenzhen: '.SZ',
  'Shenzhen (+3308.HK)': '.SZ', // dual-listed; the A-share is the primary line
  'Shenzhen (+0763.HK)': '.SZ',
  'Shanghai STAR': '.SS',
  'Taipei Exchange': '.TWO', // TPEx is .TWO — .TW is the separate TWSE main board
  Taiwan: '', // 3711.TW already carries it
  Korea: '', // 000660.KS
  'Hong Kong': '', // 9880.HK
  Copenhagen: '', // ZEAL.CO
  Mexico: '', // AGUA.MX
}

/** CoinGecko ids, pinned by hand against the full 18k coin list. Symbol lookup
 *  is not safe here — see the trap note in the header. */
const CRYPTO_IDS: Record<string, string> = {
  ETH: 'ethereum',
  HYPE: 'hyperliquid',
  LIT: 'lighter',
  NOCK: 'nockchain',
  PRL: 'pearl-2',
  ZEC: 'zcash',
  GEOD: 'geodnet',
  PEAQ: 'peaq-2',
}

/** Deliberately not mapped. Listed explicitly rather than left to a lookup
 *  failure, so that a provider later assigning one of these tickers to some
 *  other instrument cannot quietly pull a wrong price into the book. */
const UNMAPPED: Record<string, string> = {
  X: 'US Steel ceased trading 2025-06-18 on the Nippon Steel acquisition',
  Unitree: 'Shanghai STAR listing approved, not trading',
  BitRobot: 'no CoinGecko listing (zero symbol matches across the full coin list)',
}

type Resolved =
  | { kind: 'yahoo'; symbol: string }
  | { kind: 'coingecko'; id: string }
  | { kind: 'unmapped'; reason: string }

function resolveSymbol(ticker: string, exchange: string): Resolved {
  const unmapped = UNMAPPED[ticker]
  if (unmapped) return { kind: 'unmapped', reason: unmapped }

  if (exchange.startsWith('crypto')) {
    const id = CRYPTO_IDS[ticker]
    return id ? { kind: 'coingecko', id } : { kind: 'unmapped', reason: 'no pinned CoinGecko id' }
  }

  const suffix = EXCHANGE_SUFFIX[exchange]
  if (suffix === undefined) return { kind: 'unmapped', reason: `no symbol rule for exchange '${exchange}'` }
  return { kind: 'yahoo', symbol: ticker.endsWith(suffix) ? ticker : ticker + suffix }
}

// ---------------------------------------------------------------------------
// Output shape
// ---------------------------------------------------------------------------

interface Stats {
  windowDays: number
  /** Annualised stdev of daily log returns, in percent. */
  realisedVolPct: number
  /** Worst peak-to-trough over the window, in percent (negative). */
  maxDrawdownPct: number
  /** Peak-to-trough inside the July 2026 window, in percent (negative).
   *  Absent where the series does not cover that window. */
  julyDrawdownPct?: number
}

interface Quote {
  symbol: string
  provider: 'yahoo' | 'coingecko'
  /** The provider's own name for the symbol. Recorded so a wrong mapping is
   *  visible on screen rather than only in this script. */
  providerName: string
  currency: string
  priceLocal: number
  /** USD BILLIONS, matching the units positions.ts already uses. Absent where
   *  the provider reports no market cap (ETFs report net assets instead). */
  marketCapUsd?: number
  /** Date the price was true, ISO. */
  asOf: string
  stats?: Stats
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

async function getText(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.text()
}

async function getJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  return JSON.parse(await getText(url, headers)) as T
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const out: R[] = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++
        out[i] = await fn(items[i])
      }
    }),
  )
  return out
}

// ---------------------------------------------------------------------------
// Yahoo
// ---------------------------------------------------------------------------

/** Yahoo gates the quote endpoint behind a cookie + crumb pair. */
async function yahooSession() {
  const res = await fetch('https://fc.yahoo.com/', { headers: { 'User-Agent': UA } })
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ')
  const crumb = await getText('https://query2.finance.yahoo.com/v1/test/getcrumb', { Cookie: cookie })
  if (!crumb || crumb.includes('<')) throw new Error(`no Yahoo crumb (got ${crumb.slice(0, 60)})`)
  return { cookie, crumb }
}

interface YahooQuote {
  symbol: string
  shortName?: string
  longName?: string
  currency?: string
  regularMarketPrice?: number
  regularMarketTime?: number
  marketCap?: number
  quoteType?: string
}

async function yahooQuotes(symbols: string[], s: { cookie: string; crumb: string }) {
  const fields = 'symbol,shortName,longName,currency,regularMarketPrice,regularMarketTime,marketCap,quoteType'
  const out = new Map<string, YahooQuote>()
  for (let i = 0; i < symbols.length; i += 20) {
    const batch = symbols.slice(i, i + 20)
    const url =
      `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(batch.join(','))}` +
      `&fields=${fields}&crumb=${encodeURIComponent(s.crumb)}`
    const body = await getJson<{ quoteResponse: { result: YahooQuote[] } }>(url, { Cookie: s.cookie })
    for (const q of body.quoteResponse.result) out.set(q.symbol, q)
  }
  return out
}

async function yahooHistory(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d`
  const body = await getJson<{
    chart: { result?: [{ timestamp?: number[]; indicators: { quote: [{ close?: (number | null)[] }] } }] }
  }>(url)
  const r = body.chart.result?.[0]
  if (!r?.timestamp) return null
  const closes = r.indicators.quote[0].close ?? []
  const series: { date: string; close: number }[] = []
  for (let i = 0; i < r.timestamp.length; i++) {
    const c = closes[i]
    if (typeof c === 'number' && Number.isFinite(c) && c > 0) {
      series.push({ date: new Date(r.timestamp[i] * 1000).toISOString().slice(0, 10), close: c })
    }
  }
  return series.length ? series : null
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

function maxDrawdownPct(closes: number[]) {
  let peak = closes[0]
  let worst = 0
  for (const c of closes) {
    if (c > peak) peak = c
    const dd = c / peak - 1
    if (dd < worst) worst = dd
  }
  return worst * 100
}

function computeStats(series: { date: string; close: number }[]): Stats | undefined {
  if (series.length < 30) return undefined
  const closes = series.map((p) => p.close)

  const returns: number[] = []
  for (let i = 1; i < closes.length; i++) returns.push(Math.log(closes[i] / closes[i - 1]))
  const mean = returns.reduce((t, r) => t + r, 0) / returns.length
  const variance = returns.reduce((t, r) => t + (r - mean) ** 2, 0) / (returns.length - 1)
  const realisedVolPct = Math.sqrt(variance) * Math.sqrt(252) * 100

  const july = series.filter((p) => p.date >= JULY_WINDOW.from && p.date <= JULY_WINDOW.to)

  return {
    windowDays: WINDOW_DAYS,
    realisedVolPct: round(realisedVolPct, 2),
    maxDrawdownPct: round(maxDrawdownPct(closes), 2),
    julyDrawdownPct: july.length >= 5 ? round(maxDrawdownPct(july.map((p) => p.close)), 2) : undefined,
  }
}

function round(n: number, dp: number) {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

// ---------------------------------------------------------------------------
// FX
// ---------------------------------------------------------------------------

/** ECB reference rates are EUR-based; USD per unit is derived by cross. ECB
 *  does not publish TWD, so that one pair comes from Yahoo. */
async function fetchFx(needed: Set<string>) {
  const xml = await getText('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml')
  const asOf = /time='([\d-]+)'/.exec(xml)?.[1]
  if (!asOf) throw new Error('ECB feed carried no date')

  const eur = new Map<string, number>()
  for (const m of xml.matchAll(/currency='(\w+)' rate='([\d.]+)'/g)) eur.set(m[1], Number(m[2]))
  const usd = eur.get('USD')
  if (!usd) throw new Error('ECB feed carried no USD rate')

  const usdPer: Record<string, number> = { USD: 1 }
  for (const ccy of needed) {
    if (ccy === 'USD') continue
    const rate = eur.get(ccy)
    if (rate) usdPer[ccy] = round(rate / usd, 6)
  }

  const missing = [...needed].filter((c) => usdPer[c] === undefined)
  for (const ccy of missing) {
    const body = await getJson<{ chart: { result?: [{ meta: { regularMarketPrice?: number } }] } }>(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ccy}=X?range=5d&interval=1d`,
    )
    const px = body.chart.result?.[0]?.meta?.regularMarketPrice
    if (px) usdPer[ccy] = round(px, 6)
  }

  return { asOf, source: missing.length ? 'ecb+yahoo' : 'ecb', usdPer }
}

// ---------------------------------------------------------------------------
// CoinGecko
// ---------------------------------------------------------------------------

function cgHeaders(): Record<string, string> {
  const key = process.env.COINGECKO_API_KEY
  return key ? { 'x-cg-demo-api-key': key } : {}
}

/** CoinGecko rate-limits hard, and a shared CI runner IP is throttled harder
 *  than a laptop. Observed on the first local run without a key. */
async function cgJson<T>(url: string): Promise<T> {
  const backoffMs = [1_500, 5_000, 15_000, 30_000]
  for (let attempt = 0; ; attempt++) {
    try {
      return await getJson<T>(url, cgHeaders())
    } catch (err) {
      const rateLimited = err instanceof Error && err.message.startsWith('429')
      if (!rateLimited || attempt >= backoffMs.length) throw err
      await new Promise((r) => setTimeout(r, backoffMs[attempt]))
    }
  }
}

type CryptoPrice = Record<string, { usd?: number; usd_market_cap?: number; last_updated_at?: number }>

/** Crypto is 8 rows of 161. If CoinGecko is unreachable or throttling, those
 *  rows fall back to their transcribed values and the other 150 still refresh —
 *  losing the whole snapshot over an eighth of it would be the worse trade.
 *  Whatever failed is named in the run summary rather than passed over. */
async function fetchCrypto(ids: string[]) {
  let price: CryptoPrice = {}
  let priceError: string | undefined
  try {
    price = await cgJson<CryptoPrice>(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}` +
        `&vs_currencies=usd&include_market_cap=true&include_last_updated_at=true`,
    )
  } catch (err) {
    priceError = err instanceof Error ? err.message : String(err)
  }

  const history = new Map<string, { date: string; close: number }[]>()
  let historyErrors = 0
  for (const id of ids) {
    if (!price[id]) continue
    try {
      const body = await cgJson<{ prices?: [number, number][] }>(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${WINDOW_DAYS}&interval=daily`,
      )
      if (body.prices?.length) {
        history.set(
          id,
          body.prices.map(([ms, px]) => ({ date: new Date(ms).toISOString().slice(0, 10), close: px })),
        )
      }
    } catch {
      historyErrors++
    }
    await new Promise((r) => setTimeout(r, 2_000))
  }
  return { price, history, priceError, historyErrors }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const resolved = positions.map((p) => ({ p, r: resolveSymbol(p.ticker, p.exchange) }))
const yahooRows = resolved.filter((x) => x.r.kind === 'yahoo') as { p: (typeof positions)[0]; r: { kind: 'yahoo'; symbol: string } }[]
const cryptoRows = resolved.filter((x) => x.r.kind === 'coingecko') as { p: (typeof positions)[0]; r: { kind: 'coingecko'; id: string } }[]
const unmappedRows = resolved.filter((x) => x.r.kind === 'unmapped') as { p: (typeof positions)[0]; r: { kind: 'unmapped'; reason: string } }[]

console.log(`positions: ${positions.length}`)
console.log(`  yahoo:     ${yahooRows.length}`)
console.log(`  coingecko: ${cryptoRows.length}`)
console.log(`  unmapped:  ${unmappedRows.length}`)

const session = await yahooSession()
console.log(`\nyahoo session ok (crumb ${session.crumb.length} chars)`)

const quotesRaw = await yahooQuotes(yahooRows.map((x) => x.r.symbol), session)
console.log(`quotes returned: ${quotesRaw.size}/${yahooRows.length}`)

const currencies = new Set<string>(['USD'])
for (const q of quotesRaw.values()) if (q.currency) currencies.add(q.currency)
const fx = await fetchFx(currencies)
console.log(`fx ${fx.asOf} (${fx.source}): ${Object.keys(fx.usdPer).sort().join(' ')}`)

console.log(`\nfetching ${yahooRows.length} price histories...`)
const histories = new Map<string, { date: string; close: number }[]>()
await mapLimit(yahooRows, 6, async (x) => {
  try {
    const s = await yahooHistory(x.r.symbol)
    if (s) histories.set(x.r.symbol, s)
  } catch {
    // A single symbol's history failing is not a reason to lose the whole run;
    // it simply lands without stats and is reported in the summary below.
  }
})
console.log(`histories: ${histories.size}/${yahooRows.length}`)

const crypto = await fetchCrypto(cryptoRows.map((x) => x.r.id))
console.log(`coingecko: ${Object.keys(crypto.price).length}/${cryptoRows.length} priced, ${crypto.history.size} histories`)
if (crypto.priceError) console.log(`  CoinGecko unavailable: ${crypto.priceError}`)
if (crypto.historyErrors) console.log(`  ${crypto.historyErrors} history call(s) failed — those rows land without stats`)

// --- assemble, validating at the boundary ---------------------------------
const quotes: Record<string, Quote> = {}
const dropped: { ticker: string; reason: string }[] = []
const nameFlags: { ticker: string; expected: string; got: string }[] = []

function normalise(s: string) {
  return s
    .toLowerCase()
    .replace(/\b(inc|corp|corporation|co|ltd|limited|plc|group|holdings?|technologies|technology|the|company)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
}

for (const { p, r } of yahooRows) {
  const q = quotesRaw.get(r.symbol)
  if (!q) {
    dropped.push({ ticker: p.ticker, reason: `provider returned nothing for ${r.symbol}` })
    continue
  }
  const price = q.regularMarketPrice
  const currency = q.currency
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    dropped.push({ ticker: p.ticker, reason: `no usable price for ${r.symbol}` })
    continue
  }
  if (!currency || fx.usdPer[currency] === undefined) {
    dropped.push({ ticker: p.ticker, reason: `no FX rate for ${currency ?? 'unknown currency'}` })
    continue
  }

  const providerName = q.longName ?? q.shortName ?? r.symbol
  const a = normalise(p.name)
  const b = normalise(providerName)
  if (!(a.includes(b) || b.includes(a) || a.slice(0, 6) === b.slice(0, 6))) {
    nameFlags.push({ ticker: p.ticker, expected: p.name, got: providerName })
  }

  // Market cap is absent for ETFs (the provider reports net assets instead).
  // Absent beats a plausible substitute.
  const capLocal = q.marketCap
  const marketCapUsd =
    typeof capLocal === 'number' && Number.isFinite(capLocal) && capLocal > 0
      ? round(capLocal / fx.usdPer[currency] / BN, 4)
      : undefined

  const series = histories.get(r.symbol)

  quotes[p.ticker] = {
    symbol: r.symbol,
    provider: 'yahoo',
    providerName,
    currency,
    priceLocal: price,
    marketCapUsd,
    // Every venue in this book closes within its own UTC day (Tokyo 15:00 JST
    // = 06:00 UTC, Mexico 15:00 CST = 21:00 UTC), so the UTC date is the
    // trading date without needing per-exchange timezone handling.
    asOf: new Date((q.regularMarketTime ?? Date.now() / 1000) * 1000).toISOString().slice(0, 10),
    stats: series ? computeStats(series) : undefined,
  }
}

for (const { p, r } of cryptoRows) {
  const c = crypto.price[r.id]
  if (!c || typeof c.usd !== 'number' || !Number.isFinite(c.usd) || c.usd <= 0) {
    dropped.push({ ticker: p.ticker, reason: `no usable price for CoinGecko id ${r.id}` })
    continue
  }
  const series = crypto.history.get(r.id)
  const cap = c.usd_market_cap
  quotes[p.ticker] = {
    symbol: r.id,
    provider: 'coingecko',
    providerName: r.id,
    currency: 'USD',
    priceLocal: c.usd,
    marketCapUsd: typeof cap === 'number' && Number.isFinite(cap) && cap > 0 ? round(cap / BN, 4) : undefined,
    asOf: new Date((c.last_updated_at ?? Date.now() / 1000) * 1000).toISOString().slice(0, 10),
    stats: series ? computeStats(series) : undefined,
  }
}

const payload = {
  schemaVersion: SCHEMA_VERSION,
  fetchedAt: new Date().toISOString(),
  providers: {
    equity: 'Yahoo Finance (v7 quote + v8 chart)',
    crypto: 'CoinGecko',
    fx: `ECB reference rates${fx.source === 'ecb+yahoo' ? ' + Yahoo for pairs ECB does not publish' : ''}`,
  },
  fx,
  quotes,
  unmapped: [
    ...unmappedRows.map(({ p, r }) => ({ ticker: p.ticker, exchange: p.exchange, reason: r.reason })),
    ...dropped.map((d) => ({ ticker: d.ticker, exchange: positions.find((p) => p.ticker === d.ticker)?.exchange ?? '', reason: d.reason })),
  ].sort((a, b) => a.ticker.localeCompare(b.ticker)),
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(payload, null, 1) + '\n')

// --- run summary -----------------------------------------------------------
const withCap = Object.values(quotes).filter((q) => q.marketCapUsd !== undefined).length
const withStats = Object.values(quotes).filter((q) => q.stats).length
const transcribed = positions.filter((p) => p.marketCapUsd !== undefined).length

console.log(`\n${'='.repeat(64)}`)
console.log(`wrote ${OUT.split('/').slice(-3).join('/')}`)
console.log(`  quotes:        ${Object.keys(quotes).length}/${positions.length}`)
console.log(`  with cap:      ${withCap}/${positions.length}  (transcribed today: ${transcribed})`)
console.log(`  with stats:    ${withStats}/${positions.length}`)
console.log(`  fx pairs:      ${Object.keys(fx.usdPer).length} as of ${fx.asOf}`)

console.log(`\nUNMAPPED (${payload.unmapped.length}) — these keep their transcribed values:`)
for (const u of payload.unmapped) console.log(`  ${u.ticker.padEnd(12)} ${u.exchange.padEnd(22)} ${u.reason}`)

if (nameFlags.length) {
  console.log(`\nNAME MISMATCHES (${nameFlags.length}) — check these are the right company:`)
  for (const f of nameFlags) console.log(`  ${f.ticker.padEnd(12)} positions.ts: ${f.expected}  |  provider: ${f.got}`)
}

// The same summary in the Actions run page, so an unmapped ticker or a wrong
// mapping is visible without opening the log.
const summaryPath = process.env.GITHUB_STEP_SUMMARY
if (summaryPath) {
  const lines = [
    `## Market data ${fx.asOf}`,
    '',
    `| | |`,
    `|---|---|`,
    `| Quotes | ${Object.keys(quotes).length} / ${positions.length} |`,
    `| With market cap | ${withCap} / ${positions.length} (transcribed in positions.ts: ${transcribed}) |`,
    `| With price stats | ${withStats} / ${positions.length} |`,
    `| FX pairs | ${Object.keys(fx.usdPer).length} as of ${fx.asOf} (${fx.source}) |`,
    '',
    `### Unmapped (${payload.unmapped.length}) — keeping transcribed values`,
    '',
    ...payload.unmapped.map((u) => `- \`${u.ticker}\` (${u.exchange}) — ${u.reason}`),
  ]
  if (nameFlags.length) {
    lines.push(
      '',
      `### Name mismatches (${nameFlags.length}) — confirm these are the right company`,
      '',
      ...nameFlags.map((f) => `- \`${f.ticker}\` positions.ts: **${f.expected}** / provider: **${f.got}**`),
    )
  }
  appendFileSync(summaryPath, lines.join('\n') + '\n')
}
