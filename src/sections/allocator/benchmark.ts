export const MAX_BEGINNER_ACTIVE_SLEEVE_PCT = 20

export interface BenchmarkInput {
  indexName: string
  fundName: string
  isin: string
  ticker: string
  venue: string
  tradingCurrency: string
  domicile: string
  replication: string
  terPct: number | null
  expectedAnnualReturnPct: number | null
  returnAssumptionUrl: string
  priceEur: number | null
  priceAsOf: string
  productUrl: string
  kidUrl: string
  broadDiversificationConfirmed: boolean
  officialDocumentsConfirmed: boolean
  brokerAvailableConfirmed: boolean
}

export const EMPTY_BENCHMARK_INPUT: BenchmarkInput = {
  indexName: '',
  fundName: '',
  isin: '',
  ticker: '',
  venue: '',
  tradingCurrency: '',
  domicile: '',
  replication: '',
  terPct: null,
  expectedAnnualReturnPct: null,
  returnAssumptionUrl: '',
  priceEur: null,
  priceAsOf: '',
  productUrl: '',
  kidUrl: '',
  broadDiversificationConfirmed: false,
  officialDocumentsConfirmed: false,
  brokerAvailableConfirmed: false,
}

export interface BenchmarkAssessment {
  ready: boolean
  blockers: string[]
  annualFundCostEur?: number
  baselineBudgetEur: number
  activeBudgetEur: number
}

function httpsUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function businessSessionAge(asOf: string, today: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf) || asOf > today) return Infinity
  let age = 0
  const cursor = new Date(`${asOf}T00:00:00Z`)
  const end = new Date(`${today}T00:00:00Z`)
  while (cursor < end) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    if (![0, 6].includes(cursor.getUTCDay())) age++
  }
  return age
}

export function assessBenchmark(
  input: BenchmarkInput,
  riskCapitalEur: number,
  activeSleevePct: number,
  today = new Date().toISOString().slice(0, 10),
): BenchmarkAssessment {
  const blockers: string[] = []
  const activePct = Math.max(0, Math.min(MAX_BEGINNER_ACTIVE_SLEEVE_PCT, activeSleevePct))
  const baselineBudgetEur = riskCapitalEur * (1 - activePct / 100)
  const activeBudgetEur = riskCapitalEur - baselineBudgetEur

  if (input.indexName.trim().length < 3) blockers.push('Name the broad index the product is intended to track.')
  if (input.fundName.trim().length < 3) blockers.push('Name the actual fund or ETF; an index itself cannot be purchased.')
  if (!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(input.isin.trim().toUpperCase())) blockers.push('Enter a 12-character ISIN.')
  if (!input.ticker.trim()) blockers.push('Enter the ticker used at the selected venue.')
  if (!input.venue.trim()) blockers.push('Enter the exchange or trading venue.')
  if (!/^[A-Z]{3}$/.test(input.tradingCurrency.trim().toUpperCase())) blockers.push('Enter a three-letter trading currency.')
  if (!input.domicile.trim()) blockers.push('Enter the fund domicile.')
  if (!input.replication.trim()) blockers.push('State the replication method from the official document.')
  if (input.terPct === null || !Number.isFinite(input.terPct) || input.terPct < 0 || input.terPct > 5) blockers.push('Enter a plausible annual fund cost between 0% and 5%.')
  if (input.expectedAnnualReturnPct === null || !Number.isFinite(input.expectedAnnualReturnPct) || input.expectedAnnualReturnPct <= -100 || input.expectedAnnualReturnPct > 30) blockers.push('Enter a declared annual benchmark-return assumption between -100% and 30%.')
  if (!httpsUrl(input.returnAssumptionUrl)) blockers.push('Link the source or calculation behind the benchmark-return assumption.')
  if (input.priceEur === null || !Number.isFinite(input.priceEur) || input.priceEur <= 0) blockers.push('Enter a verified EUR price for order planning.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.priceAsOf)) blockers.push('Enter the verified price date as YYYY-MM-DD.')
  else if (businessSessionAge(input.priceAsOf, today) > 1) blockers.push('Refresh the benchmark price; it is older than one completed business session.')
  if (!httpsUrl(input.productUrl)) blockers.push('Link the official product page over HTTPS.')
  if (!httpsUrl(input.kidUrl)) blockers.push('Link the current official KID/EID over HTTPS.')
  if (input.productUrl && input.productUrl === input.kidUrl) blockers.push('Link the product page and current KID/EID separately.')
  if (!input.broadDiversificationConfirmed) blockers.push('Confirm that holdings span regions and sectors rather than one theme.')
  if (!input.officialDocumentsConfirmed) blockers.push('Confirm that the fields were checked against official documents.')
  if (!input.brokerAvailableConfirmed) blockers.push('Confirm that this exact ISIN and venue are available at the named broker.')

  return {
    ready: blockers.length === 0,
    blockers,
    annualFundCostEur:
      input.terPct === null || !Number.isFinite(input.terPct)
        ? undefined
        : baselineBudgetEur * (input.terPct / 100),
    baselineBudgetEur,
    activeBudgetEur,
  }
}
