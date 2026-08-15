/** Freezes the subjective scenario set as terminal USD prices.
 *
 * The Assets tab originally stored returns. A return that stays fixed while
 * the market price moves is not a forecast: it is a moving price target. This
 * command converts the published probabilities and returns into immutable
 * terminal prices at an explicit date. Daily refreshes can then recompute the
 * return offered by today's price without rewriting the judgement.
 *
 * Run deliberately, never on a schedule:
 *   npm run freeze-crypto-scenarios -- --as-of 2026-08-12
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CRYPTO_HTML = resolve(HERE, '../public/dashboards/crypto.html')
const HISTORY_JSON = resolve(HERE, '../public/data/crypto-history.json')
const OUT = resolve(HERE, '../public/data/crypto-scenarios.json')

type Token = { tk: string; nm: string; sc: [number, number][] }
type History = { series: Record<string, { closes: { d: string; c: number }[] }> }

const at = process.argv.indexOf('--as-of')
const asOf = at >= 0 ? process.argv[at + 1] : undefined
const force = process.argv.includes('--force')
if (!asOf || !/^\d{4}-\d{2}-\d{2}$/.test(asOf)) {
  throw new Error('pass an explicit ISO date: --as-of YYYY-MM-DD')
}
if (existsSync(OUT) && !force) {
  throw new Error('crypto-scenarios.json is already frozen; pass --force only for an explicit thesis revision')
}

const html = readFileSync(CRYPTO_HTML, 'utf8')
const start = html.indexOf('const TOKENS = [')
const end = html.indexOf('\n];', start)
if (start < 0 || end < 0) throw new Error('could not locate TOKENS in crypto.html')
const tokens = new Function(`return ${html.slice(start + 'const TOKENS = '.length, end + 2)}`)() as Token[]
const history = JSON.parse(readFileSync(HISTORY_JSON, 'utf8')) as History
const sig = (n: number) => Number(n.toPrecision(8))

const rows = tokens.map((token) => {
  const closes = history.series[token.tk]?.closes.filter((point) => point.d <= asOf)
  const anchor = closes?.[closes.length - 1]
  if (!anchor) throw new Error(`${token.tk}: no close on or before ${asOf}`)
  const probabilityTotal = token.sc.reduce((sum, [probability]) => sum + probability, 0)
  if (Math.abs(probabilityTotal - 1) > 1e-9) throw new Error(`${token.tk}: probabilities do not sum to one`)
  return {
    ticker: token.tk,
    name: token.nm,
    anchorDate: anchor.d,
    anchorPriceUsd: sig(anchor.c),
    legs: token.sc.map(([probability, returnFromAnchor], index) => ({
      label: ['bull', 'base', 'bear'][index],
      probability,
      targetPriceUsd: sig(anchor.c * (1 + returnFromAnchor)),
    })),
  }
})

writeFileSync(
  OUT,
  JSON.stringify(
    {
      schemaVersion: 1,
      asOf,
      horizonYears: 3,
      note: 'Subjective probabilities and terminal USD price targets frozen from the published Assets scenarios. A refresh recomputes returns from the latest price but never changes these targets.',
      rows,
    },
    null,
    2,
  ) + '\n',
)
console.log(`froze ${rows.length} scenario sets at ${asOf} in ${OUT}`)
