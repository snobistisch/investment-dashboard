import { positions, type Position } from './positions'
import type { EquityOpportunityModel, ScenarioAssumption } from '../sections/opportunities/model'

// One-time underwriting inputs fixed to the 21 Aug 2026 market snapshot. These
// are deliberately not read from market-data.json: a later quote may reprice an
// opportunity, but it may never move its terminal targets.
const REVIEWED_AT = '2026-08-21'
const NEXT_REVIEW_AT = '2026-11-19'
const HORIZON_YEARS = 3

type EnvelopeInput = readonly [ticker: string, referencePrice: number, baseCagrPct: number]

const INPUTS: EnvelopeInput[] = [
  ['LITE', 866.8, 14], ['COHR', 288.19, 13], ['AXTI', 70.82, 12],
  ['688498', 1587, 2], ['3081', 2920, 3], ['4979', 577, 1],
  ['300308', 943, 13], ['300502', 442, 20], ['002281', 178.58, 4],
  ['AAOI', 125.145, 13], ['TSEM', 222.215, 12], ['POET', 8.265, 0],
  ['MRVL', 236.919, 13], ['AVGO', 368.27, 12], ['CRDO', 230.35, 15],
  ['SMTC', 124.13, 12], ['MXL', 66.47, 3], ['MTSI', 266.605, 14],
  ['FN', 435.86, 13], ['GLW', 149.89, 6], ['300394', 273.08, 4],
  ['5803', 5280, 5], ['5802', 2178.5, 8], ['5801', 3818, 6],
  ['CIEN', 396.76, 6], ['ANET', 189.1924, 13],
  ['RXRX', 3.49, 2], ['SDGR', 19.62, 7], ['TXG', 65.1, 5],
  ['TWST', 145.535, 7], ['ABCL', 11.345, 9], ['ABSI', 9.525, 1],
  ['IOVA', 8.275, 6], ['RLAY', 19.46, 4], ['ILMN', 219.625, 7],
  ['GENB', 16.17, 2], ['EIKN', 11.33, 1],
  ['6324.T', 5700, 13], ['MP', 60.02, 7], ['HSAI', 19.065, 15],
  ['OUST', 38.395, 6], ['SERV', 4.985, 1],
  ['RGTI', 17.875, 13], ['INFQ', 14.0501, 12], ['QUBT', 8.8899, 0],
  ['QNT', 56.45, 5], ['QBTS', 20.375, 4], ['XNDU', 10.87, 2],
  ['HQ', 20.135, 3], ['QTUM', 150.51, 7],
  ['CRCL', 88.31, 13], ['SOFI', 18.895, 13], ['CRWV', 88.05, 5],
  ['IREN', 41.89, 4], ['MQ', 16.34, 13], ['HOOD', 107.8, 18],
]

const sectionFalsifier: Record<string, string> = {
  photonics: 'Two consecutive reports show the cited optical or connectivity exposure slowing while margins also contract, or the documented architecture loses adoption.',
  biology: 'The named clinical or commercial milestone fails, cash runway compresses materially, or dilution grows faster than the operating evidence.',
  robotics: 'Orders or deployments fail to convert into profitable growth, or the documented component or system advantage loses share.',
  quantum: 'The named technical or government milestone does not convert into commercial revenue before financing needs force material dilution.',
  agentic: 'The cited distribution or infrastructure advantage fails to produce durable revenue, or concentration, credit, rates or funding costs overwhelm it.',
}

function primaryEvidence(position: Position) {
  if (position.exchange.includes('Shanghai')) return 'https://www.sse.com.cn/disclosure/listedinfo/announcement/'
  if (position.exchange.includes('Shenzhen')) return 'https://www.szse.cn/disclosure/listed/notice/index.html'
  if (position.exchange.includes('Taipei')) return 'https://mops.twse.com.tw/mops/#/web/home'
  if (position.exchange.includes('Tokyo')) return 'https://disclosure2.edinet-fsa.go.jp/WEEK0010.aspx'
  return `https://www.sec.gov/edgar/browse/?CIK=${encodeURIComponent(position.ticker)}`
}

function probability(position: Position) {
  if (position.conviction >= 4) return { bear: 0.25, base: 0.50, bull: 0.25 }
  if (position.conviction === 3) return { bear: 0.30, base: 0.50, bull: 0.20 }
  return { bear: 0.40, base: 0.45, bull: 0.15 }
}

function scenario(
  position: Position,
  referencePrice: number,
  baseCagrPct: number,
): Record<'bear' | 'base' | 'bull', ScenarioAssumption> {
  const speculative = position.factors.includes('risk-appetite')
  const bearCagrPct = speculative ? -40 : position.conviction >= 3 ? -22 : -25
  const bullCagrPct = speculative ? 55 : position.conviction >= 4 ? 45 : position.conviction === 3 ? 38 : 30
  const p = probability(position)
  const terminal = (cagr: number) => Number((referencePrice * Math.pow(1 + cagr / 100, HORIZON_YEARS)).toPrecision(8))
  return {
    bear: {
      probability: p.bear,
      metricValue: terminal(bearCagrPct),
      terminalMultiple: 1,
      rationale: `The documented ${position.sections[0]} risk dominates; the frozen envelope compounds at ${bearCagrPct}% a year.`,
    },
    base: {
      probability: p.base,
      metricValue: terminal(baseCagrPct),
      terminalMultiple: 1,
      rationale: `The local thesis works only partly; the frozen envelope compounds at ${baseCagrPct}% a year.`,
    },
    bull: {
      probability: p.bull,
      metricValue: terminal(bullCagrPct),
      terminalMultiple: 1,
      rationale: `The cited operating evidence converts into durable economics; the frozen envelope compounds at ${bullCagrPct}% a year.`,
    },
  }
}

function makeModel([ticker, referencePrice, baseCagrPct]: EnvelopeInput): EquityOpportunityModel {
  const position = positions.find((row) => row.ticker === ticker && row.stance === 'long')
  if (!position) throw new Error(`${ticker}: frozen opportunity input has no matching equity long`)
  const section = position.sections[0]
  const thesis = position.edge
    ?? `${position.name} remains a ${section} research candidate only if its ${position.factors.join(' and ')} exposure can overcome the recorded limitation: ${position.note ?? 'no company-specific edge has yet been transcribed.'}`
  return {
    schemaVersion: 1,
    version: `${ticker}-2026-08-21-v1`,
    ticker,
    company: position.name,
    currency: ticker === '688498' || ticker.startsWith('300') || ticker === '002281'
      ? 'CNY'
      : ticker === '3081' || ticker === '4979'
        ? 'TWD'
        : ticker.startsWith('580') || ticker === '6324.T'
          ? 'JPY'
          : 'USD',
    thesis,
    falsifier: sectionFalsifier[section] ?? 'The cited operating evidence fails to repeat in the next two disclosures.',
    horizonYears: HORIZON_YEARS,
    reviewedAt: REVIEWED_AT,
    fundamentalsAsOf: position.asOf,
    nextReviewAt: NEXT_REVIEW_AT,
    catalyst: `The next issuer filing must confirm or refute the exact claim in the thesis; price action alone is not a catalyst.`,
    valuation: {
      kind: 'terminal-price',
      fiscalYear: 2029,
      metricLabel: 'authored FY2029 terminal price',
      referencePrice,
      referenceAsOf: REVIEWED_AT,
      scenarios: scenario(position, referencePrice, baseCagrPct),
    },
    sources: [{
      kind: 'primary',
      label: `${position.name} · official issuer filing index`,
      url: primaryEvidence(position),
      evidenceAsOf: REVIEWED_AT,
    }],
    risks: [
      position.note ?? 'The repository contains no more specific company risk statement.',
      `Primary factor exposure: ${position.factors.join(', ')}.`,
      'Scenario probabilities and return paths are authored judgements with no calibration history.',
    ],
    limitation: `This is a dated return envelope anchored to ${referencePrice} ${ticker.startsWith('580') || ticker === '6324.T' ? 'JPY' : ticker === '688498' || ticker.startsWith('300') || ticker === '002281' ? 'CNY' : ticker === '3081' || ticker === '4979' ? 'TWD' : 'USD'} on ${REVIEWED_AT}, not company guidance, consensus or a bottom-up forecast. It is frozen until a versioned research revision.`,
  }
}

export const equityOpportunityEnvelopeModels = INPUTS.map(makeModel)

