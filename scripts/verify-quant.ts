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

type Close = { d: string; c: number }

interface RiskFile {
  fetchedAt: string
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

assert(risk.method.daysPerYear === 365, 'crypto volatility must annualise over 365 trading days')
assert(risk.fetchedAt === history.fetchedAt, 'derived risk data must retain the history data vintage')
assert(risk.rows.length === 40, `expected 40 risk rows, got ${risk.rows.length}`)
assert(new Set(risk.rows.map((row) => row.coingeckoId)).size === 40, 'CoinGecko ids must be unique')

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

console.log(`${assertions.toLocaleString('en-US')} quantitative risk invariants hold`)
