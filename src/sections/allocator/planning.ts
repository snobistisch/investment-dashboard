// Personal decision gates for the equity planner.
//
// This is deliberately separate from allocation.ts. The older allocator starts
// with a research universe and always produces weights. A first-investment tool
// has to start one level earlier: whether this money may be invested at all.

export const MIN_EQUITY_HORIZON_YEARS = 5

export type ContributionMode = '' | 'one-off' | 'monthly' | 'mixed'

export interface PlanningInput {
  goal: string
  horizonYears: number | null
  riskCapitalEur: number | null
  emergencyBufferConfirmed: boolean
  moneyNotNeededConfirmed: boolean
  maxLossEur: number | null
  maxLossPct: number | null
  contributionMode: ContributionMode
  monthlyContributionEur: number | null
  existingInvestmentsEur: number | null
  broker: string
  fractionalShares: boolean | null
  allowEtfs: boolean
  allowStocks: boolean
  activeSleevePct: number
}

export const EMPTY_PLANNING_INPUT: PlanningInput = {
  goal: '',
  horizonYears: null,
  riskCapitalEur: null,
  emergencyBufferConfirmed: false,
  moneyNotNeededConfirmed: false,
  maxLossEur: null,
  maxLossPct: null,
  contributionMode: '',
  monthlyContributionEur: null,
  existingInvestmentsEur: 0,
  broker: '',
  fractionalShares: null,
  allowEtfs: true,
  allowStocks: false,
  activeSleevePct: 0,
}

export type GateCode =
  | 'goal'
  | 'horizon'
  | 'capital'
  | 'buffer'
  | 'liquidity'
  | 'max-loss-eur'
  | 'max-loss-pct'
  | 'loss-mismatch'
  | 'contribution'
  | 'monthly-amount'
  | 'existing-investments'
  | 'product'
  | 'active-sleeve'

export interface GateMessage {
  code: GateCode
  message: string
}

export interface PlanningAssessment {
  ready: boolean
  blockers: GateMessage[]
  warnings: string[]
  impliedMaxLossPct?: number
  baselineSleevePct: number
}

function positive(value: number | null) {
  return value !== null && Number.isFinite(value) && value > 0
}

export function assessPlanningInput(input: PlanningInput): PlanningAssessment {
  const blockers: GateMessage[] = []
  const warnings: string[] = []

  if (input.goal.trim().length < 3) {
    blockers.push({ code: 'goal', message: 'Name the financial goal this money serves.' })
  }
  if (!positive(input.horizonYears) || (input.horizonYears ?? 0) < MIN_EQUITY_HORIZON_YEARS) {
    blockers.push({ code: 'horizon', message: `Equities stay blocked below a ${MIN_EQUITY_HORIZON_YEARS}-year horizon.` })
  }
  if (!positive(input.riskCapitalEur)) blockers.push({ code: 'capital', message: 'Enter the EUR amount that is genuinely risk capital.' })
  if (!input.emergencyBufferConfirmed) blockers.push({ code: 'buffer', message: 'Confirm that an emergency buffer remains outside this plan.' })
  if (!input.moneyNotNeededConfirmed) blockers.push({ code: 'liquidity', message: 'Confirm that this money is not needed during the stated horizon.' })
  if (!positive(input.maxLossEur)) blockers.push({ code: 'max-loss-eur', message: 'State the largest EUR loss the plan may expose you to.' })
  if (!positive(input.maxLossPct) || (input.maxLossPct ?? 0) > 100) blockers.push({ code: 'max-loss-pct', message: 'State a maximum loss between 0% and 100%.' })
  if (!input.contributionMode) blockers.push({ code: 'contribution', message: 'Choose whether contributions are one-off, monthly or mixed.' })
  if ((input.contributionMode === 'monthly' || input.contributionMode === 'mixed') && !positive(input.monthlyContributionEur)) {
    blockers.push({ code: 'monthly-amount', message: 'Enter the planned monthly contribution.' })
  }
  if (input.existingInvestmentsEur === null || !Number.isFinite(input.existingInvestmentsEur) || input.existingInvestmentsEur < 0) blockers.push({ code: 'existing-investments', message: 'Enter existing investments as zero or a positive EUR amount.' })
  if (!input.allowEtfs && !input.allowStocks) blockers.push({ code: 'product', message: 'Allow at least one product type.' })
  if (!Number.isFinite(input.activeSleevePct) || input.activeSleevePct < 0 || input.activeSleevePct > 100) {
    blockers.push({ code: 'active-sleeve', message: 'The active sleeve must stay between 0% and 100%.' })
  }
  if (!input.allowStocks && input.activeSleevePct > 0) {
    blockers.push({ code: 'active-sleeve', message: 'An active stock sleeve requires individual stocks to be allowed.' })
  }

  let impliedMaxLossPct: number | undefined
  if (positive(input.riskCapitalEur) && positive(input.maxLossEur)) {
    impliedMaxLossPct = ((input.maxLossEur as number) / (input.riskCapitalEur as number)) * 100
    if (input.maxLossPct !== null && Math.abs(impliedMaxLossPct - input.maxLossPct) > 2) {
      blockers.push({ code: 'loss-mismatch', message: `EUR and percentage loss limits disagree (${impliedMaxLossPct.toFixed(1)}% versus ${input.maxLossPct.toFixed(1)}%).` })
    }
    if ((input.maxLossEur as number) > (input.riskCapitalEur as number)) blockers.push({ code: 'max-loss-eur', message: 'Maximum loss cannot exceed the risk capital.' })
  }

  if (input.activeSleevePct > 0) warnings.push('The active sleeve is optional and must clear benchmark, freshness and source gates later.')
  if (input.fractionalShares === null) warnings.push('Fractional-share availability is still unknown; whole-share orders may leave cash unused.')

  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
    impliedMaxLossPct,
    baselineSleevePct: 100 - Math.max(0, Math.min(100, input.activeSleevePct)),
  }
}
