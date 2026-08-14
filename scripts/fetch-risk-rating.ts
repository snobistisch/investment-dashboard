/** Measures the two inputs to the risk rating that cannot be read off the tab.
 *
 *  The crypto tab already publishes float, FDV/cap and daily volume per asset.
 *  It does not publish realised volatility or drawdown, and those are half the
 *  risk rating — so this fetches a year of daily closes for all forty ranked
 *  assets from CoinGecko and computes them with the same method
 *  `fetch-market-data.ts` uses for the four held rows.
 *
 *  Run it, do not call it. Output goes to two places:
 *    public/data/risk-rating.json   the machine-readable artefact, with inputs,
 *                                   components and provenance per asset
 *    public/dashboards/crypto.html  a generated block between two markers, so
 *                                   the page stays a static file that fetches
 *                                   nothing at runtime
 *
 *  The page then computes R, the poker EV and f* in the browser from numbers
 *  printed in its own table. That is deliberate: every figure on the tab has to
 *  be recomputable by a reader who disagrees with it, and a precomputed score
 *  cannot be argued with.
 *
 *      npm run fetch-risk-rating
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CRYPTO_HTML = resolve(HERE, '../public/dashboards/crypto.html')
const OUT_JSON = resolve(HERE, '../public/data/risk-rating.json')
/** The daily closes themselves, kept rather than discarded.
 *  The first version of this script reduced a year of prices to two numbers and
 *  threw the series away, which made the one thing the book most needs —
 *  correlation between the assets — unmeasurable without refetching all forty.
 *  Stored once, read by scripts/build-portfolio.ts. */
const OUT_HISTORY = resolve(HERE, '../public/data/crypto-history.json')

/** Schema version of risk-rating.json. Bump when the shape changes so a stale
 *  file is rejected rather than misread. */
const SCHEMA_VERSION = 1

// ---------------------------------------------------------------------------
// Pinned CoinGecko identifiers
// ---------------------------------------------------------------------------
// Resolved on 14 Aug 2026 against /coins/list by symbol AND project name, then
// the two ambiguous ones checked against their homepage — the same discipline
// as the ticker map in fetch-market-data.ts, and for the same reason: a symbol
// lookup returns the wrong asset often enough that a wrong price is a realistic
// outcome, and a wrong price here becomes a wrong risk rating.
//
// The two that needed a homepage check:
//   CAP   three live coins are called "Cap" with symbol CAP. cap-2 (caponsui.xyz,
//         $3.3k cap) and cap-3 (cap.bet, $7.7k) are dust; cap-4 is cap.app, the
//         stablecoin credit engine this tab ranks.
//   EIGEN listed as "EigenCloud (prev. EigenLayer)" under the id `eigenlayer`,
//         so a name match on "EigenCloud" alone finds nothing.
const CG_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  NEAR: 'near',
  ZEC: 'zcash',
  MON: 'monad',
  XPL: 'plasma',
  MEGA: 'megaeth',
  HYPE: 'hyperliquid',
  LIT: 'lighter',
  JUP: 'jupiter-exchange-solana',
  ASTER: 'aster-2',
  UNI: 'uniswap',
  AAVE: 'aave',
  SYRUP: 'syrup',
  SKY: 'sky',
  ENA: 'ethena',
  ONDO: 'ondo-finance',
  CAP: 'cap-4',
  UP: 'superform',
  LINK: 'chainlink',
  EIGEN: 'eigenlayer',
  LDO: 'lido-dao',
  AKT: 'akash-network',
  ATH: 'aethir',
  NOS: 'nosana',
  TAO: 'bittensor',
  VIRTUAL: 'virtual-protocol',
  NOCK: 'nockchain',
  ZAMA: 'zama',
  PROVE: 'succinct',
  LA: 'lagrange',
  AZTEC: 'aztec',
  ARX: 'arcium',
  NIL: 'nillion',
  IRYS: 'irys',
  AI: 'gensyn',
  ALEO: 'aleo',
  OCT: 'octra',
  PRL: 'pearl-2',
}

// ---------------------------------------------------------------------------
// Risk-rating thresholds — every one a named constant
// ---------------------------------------------------------------------------
// Four components, equally weighted. Each maps a raw measure onto 0..1 where 0
// is safe and 1 is extreme, by a linear ramp between two named bounds. The
// bounds are the tunable part; the logic below never needs to change to retune
// the rating.
export const RISK_WEIGHTS = { vol: 0.25, drawdown: 0.25, dilution: 0.25, liquidity: 0.25 }

/** Realised annualised volatility, per cent. NVDA runs about 37% and lands
 *  near zero; 300% is the point past which a further increase stops carrying
 *  information, because the position is already ungovernable. */
export const VOL_BOUNDS = { safe: 30, extreme: 300 }

/** Maximum peak-to-trough drawdown inside the measured window, per cent,
 *  stated positive. A 20% fall is an ordinary correction; 95% is where the
 *  round trip stops being plausible. */
export const DRAWDOWN_BOUNDS = { safe: 20, extreme: 95 }

/** FDV divided by market cap — how much of the eventual supply is still to
 *  arrive. 1x is fully issued; 8x means seven eighths of the float is still
 *  overhead. */
export const DILUTION_BOUNDS = { safe: 1, extreme: 8 }

/** Daily traded volume in dollars, on a log scale because the difference
 *  between $0.5m and $5m matters more than between $45m and $50m. */
export const LIQUIDITY_BOUNDS = { extreme: 0.5e6, safe: 50e6 }

/** Where each band starts. A rating is a number; a reader acts on a word. */
export const RISK_BUCKETS = [
  { from: 0, label: 'Low' },
  { from: 0.25, label: 'Medium' },
  { from: 0.5, label: 'High' },
  { from: 0.75, label: 'Extreme' },
] as const

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const ramp = (value: number, safe: number, extreme: number) =>
  clamp01((value - safe) / (extreme - safe))

export function riskComponents(input: {
  realisedVolPct?: number
  drawdownPct?: number
  fdvx: number
  vol24hUsd: number
}) {
  const v = input.realisedVolPct === undefined
    ? undefined
    : ramp(input.realisedVolPct, VOL_BOUNDS.safe, VOL_BOUNDS.extreme)
  const d = input.drawdownPct === undefined
    ? undefined
    : ramp(Math.abs(input.drawdownPct), DRAWDOWN_BOUNDS.safe, DRAWDOWN_BOUNDS.extreme)
  const f = ramp(input.fdvx, DILUTION_BOUNDS.safe, DILUTION_BOUNDS.extreme)
  // Inverted: more volume is less risk. Guarded against a zero, which would
  // otherwise take log10 to -Infinity and quietly produce a valid-looking 1.
  const l = input.vol24hUsd > 0
    ? clamp01(
        1 -
          (Math.log10(input.vol24hUsd) - Math.log10(LIQUIDITY_BOUNDS.extreme)) /
            (Math.log10(LIQUIDITY_BOUNDS.safe) - Math.log10(LIQUIDITY_BOUNDS.extreme)),
      )
    : 1
  return { v, d, f, l }
}

// ---------------------------------------------------------------------------
// Statistics — same method as fetch-market-data.ts, deliberately
// ---------------------------------------------------------------------------

type Series = { date: string; close: number }[]

/** Worst peak-to-trough inside the series, per cent and negative.
 *
 *  Measured over the fetched window rather than from the all-time high on
 *  purpose. The tab already documents why: ZEC's "-85% from ATH" refers to its
 *  October 2016 listing print on near-zero float, which says something about
 *  which cycle an asset launched in and nothing about what it is worth. A
 *  one-year peak is a price somebody could actually have paid recently. */
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

function realisedVolPct(closes: number[]) {
  const returns: number[] = []
  for (let i = 1; i < closes.length; i++) returns.push(Math.log(closes[i] / closes[i - 1]))
  const mean = returns.reduce((t, r) => t + r, 0) / returns.length
  const variance = returns.reduce((t, r) => t + (r - mean) ** 2, 0) / (returns.length - 1)
  return Math.sqrt(variance) * Math.sqrt(252) * 100
}

const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

const WINDOW_DAYS = 365
/** Below this many daily closes the statistics are not reported at all. Thirty
 *  is the same floor fetch-market-data.ts uses. */
const MIN_OBSERVATIONS = 30
/** Spacing between CoinGecko calls. Keyless tier, same pacing as the existing
 *  fetch — forty calls at this rate is about four minutes. */
const CG_SPACING_MS = 6_000

async function cgHistory(id: string): Promise<Series | undefined> {
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${WINDOW_DAYS}&interval=daily`
  const backoffMs = [5_000, 15_000, 30_000, 60_000, 90_000]
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (res.ok) {
      const body = (await res.json()) as { prices?: [number, number][] }
      if (!body.prices?.length) return undefined
      return body.prices.map(([ms, px]) => ({
        date: new Date(ms).toISOString().slice(0, 10),
        close: px,
      }))
    }
    if (res.status !== 429 || attempt >= backoffMs.length) {
      throw new Error(`${id}: HTTP ${res.status}`)
    }
    const served = Number(res.headers.get('retry-after')) * 1000
    await new Promise((r) => setTimeout(r, Number.isFinite(served) && served > 0 ? served : backoffMs[attempt]))
  }
}

// ---------------------------------------------------------------------------
// The tab's own token array is the single source of truth for float and volume
// ---------------------------------------------------------------------------

interface Token {
  tk: string
  nm: string
  tier: string
  fdvx: number
  flt: number
  vol: number
  sc: [number, number][]
}

/** Reads TOKENS straight out of crypto.html rather than keeping a second copy.
 *  Two lists of forty assets drift; one does not. */
function readTokens(): Token[] {
  const html = readFileSync(CRYPTO_HTML, 'utf8')
  const start = html.indexOf('const TOKENS = [')
  const end = html.indexOf('\n];', start)
  if (start < 0 || end < 0) throw new Error('could not locate the TOKENS array in crypto.html')
  const literal = html.slice(start + 'const TOKENS = '.length, end + 2)
  return new Function(`return ${literal}`)() as Token[]
}

async function main() {
  const tokens = readTokens()
  console.log(`tokens on the tab: ${tokens.length}`)

  const missingId = tokens.filter((t) => !CG_IDS[t.tk]).map((t) => t.tk)
  if (missingId.length) {
    // Not fatal, and not silent: an unrated row renders as unrated.
    console.log(`no pinned CoinGecko id: ${missingId.join(', ')}`)
  }

  const measured: Record<
    string,
    { vol?: number; dd?: number; days: number; from?: string; partial: boolean }
  > = {}
  const history: Record<string, Series> = {}
  const failures: string[] = []

  for (const token of tokens) {
    const id = CG_IDS[token.tk]
    if (!id) continue
    try {
      const series = await cgHistory(id)
      if (!series || series.length < MIN_OBSERVATIONS) {
        failures.push(`${token.tk}: only ${series?.length ?? 0} closes`)
        measured[token.tk] = { days: series?.length ?? 0, partial: true }
      } else {
        history[token.tk] = series
        const closes = series.map((p) => p.close)
        measured[token.tk] = {
          vol: round(realisedVolPct(closes), 1),
          dd: round(maxDrawdownPct(closes), 1),
          days: series.length,
          from: series[0].date,
          // A window shorter than a year means the peak inside it may be the
          // listing print. Flagged rather than corrected: for an asset that
          // listed nine months ago, that print IS the cycle high.
          partial: series.length < WINDOW_DAYS - 10,
        }
        console.log(
          `${token.tk.padEnd(8)} ${id.padEnd(24)} vol ${String(measured[token.tk].vol).padStart(7)}%  ` +
            `dd ${String(measured[token.tk].dd).padStart(7)}%  ${series.length}d`,
        )
      }
    } catch (err) {
      failures.push(`${token.tk}: ${err instanceof Error ? err.message : String(err)}`)
      console.log(`${token.tk.padEnd(8)} ${id.padEnd(24)} FAILED`)
    }
    await new Promise((r) => setTimeout(r, CG_SPACING_MS))
  }

  // --- the JSON artefact -----------------------------------------------
  const rows = tokens.map((t) => {
    const m = measured[t.tk]
    const c = riskComponents({
      realisedVolPct: m?.vol,
      drawdownPct: m?.dd,
      fdvx: t.fdvx,
      vol24hUsd: t.vol * 1e6,
    })
    // R needs all four components. A partial rating would rank an asset on
    // three quarters of the evidence and look identical to a full one.
    const complete = c.v !== undefined && c.d !== undefined
    const r = complete ? (c.v! + c.d! + c.f + c.l) / 4 : undefined
    return {
      ticker: t.tk,
      name: t.nm,
      coingeckoId: CG_IDS[t.tk],
      measured: { realisedVolPct: m?.vol, drawdownPct: m?.dd, observations: m?.days ?? 0, from: m?.from, partialWindow: m?.partial ?? true },
      inputs: { fdvx: t.fdvx, floatPct: t.flt, vol24hUsd: t.vol * 1e6 },
      components: {
        v: c.v === undefined ? undefined : round(c.v, 4),
        d: c.d === undefined ? undefined : round(c.d, 4),
        f: round(c.f, 4),
        l: round(c.l, 4),
      },
      r: r === undefined ? undefined : round(r, 4),
      bucket: r === undefined ? undefined : bucketOf(r),
    }
  })

  writeFileSync(
    OUT_JSON,
    JSON.stringify(
      {
        schemaVersion: SCHEMA_VERSION,
        fetchedAt: new Date().toISOString(),
        method: {
          note: 'R = 0.25*V + 0.25*D + 0.25*F + 0.25*L. V and D are measured from a year of daily CoinGecko closes; F and L are read from the tab. Every threshold below is a named constant in scripts/fetch-risk-rating.ts.',
          windowDays: WINDOW_DAYS,
          weights: RISK_WEIGHTS,
          volBounds: VOL_BOUNDS,
          drawdownBounds: DRAWDOWN_BOUNDS,
          dilutionBounds: DILUTION_BOUNDS,
          liquidityBounds: LIQUIDITY_BOUNDS,
          buckets: RISK_BUCKETS,
        },
        failures,
        rows,
      },
      null,
      2,
    ) + '\n',
  )
  console.log(`\nwrote ${OUT_JSON}`)

  // Closes rounded to six significant figures: enough for a log return, and it
  // keeps the file small enough to commit without thinking about it.
  writeFileSync(
    OUT_HISTORY,
    JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      fetchedAt: new Date().toISOString(),
      note: 'Daily USD closes per asset from CoinGecko market_chart, one year. Kept so correlation can be measured without refetching. Calendars differ per asset: align on date before computing returns.',
      series: Object.fromEntries(
        Object.entries(history).map(([tk, s]) => [
          tk,
          { from: s[0].date, to: s[s.length - 1].date, closes: s.map((p) => ({ d: p.date, c: Number(p.close.toPrecision(6)) })) },
        ]),
      ),
    }) + '\n',
  )
  console.log(`wrote ${OUT_HISTORY}`)

  // --- the generated block inside crypto.html ---------------------------
  const html = readFileSync(CRYPTO_HTML, 'utf8')
  const START = '/* RISK-MEASURED-START'
  const END = '/* RISK-MEASURED-END */'
  const from = html.indexOf(START)
  const to = html.indexOf(END)
  if (from < 0 || to < 0) throw new Error('crypto.html carries no RISK-MEASURED markers')

  const body =
    `${START} — generated by scripts/fetch-risk-rating.ts, do not edit by hand.\n` +
    `   A year of daily CoinGecko closes per asset, reduced to two numbers:\n` +
    `   annualised volatility of daily log returns, and worst peak-to-trough\n` +
    `   inside the window. Fetched ${new Date().toISOString().slice(0, 10)}.\n` +
    `   'p' marks a window shorter than a year, where the peak may be the\n` +
    `   listing print — for a recent listing that print is the cycle high. */\n` +
    `const RISK_MEASURED = {\n` +
    rows
      .filter((r) => r.measured.realisedVolPct !== undefined)
      .map(
        (r) =>
          `  ${r.ticker}: {vol:${r.measured.realisedVolPct}, dd:${r.measured.drawdownPct}, d:${r.measured.observations}${r.measured.partialWindow ? ', p:1' : ''}},`,
      )
      .join('\n') +
    `\n};\n`

  writeFileSync(CRYPTO_HTML, html.slice(0, from) + body + html.slice(to))
  console.log(`patched ${CRYPTO_HTML}`)

  if (failures.length) {
    console.log(`\nnot rated (${failures.length}): ${failures.join(' · ')}`)
  }
}

export function bucketOf(r: number) {
  let label = RISK_BUCKETS[0].label as string
  for (const b of RISK_BUCKETS) if (r >= b.from) label = b.label
  return label
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
