import { assessPlanningInput, EMPTY_PLANNING_INPUT, type PlanningInput } from '../src/sections/allocator/planning'

function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message)
}

const empty = assessPlanningInput(EMPTY_PLANNING_INPUT)
assert(!empty.ready, 'empty plan must fail closed')
assert(empty.blockers.length >= 8, 'empty plan must name every material missing input')
assert(empty.baselineSleevePct === 100, 'active sleeve must start at zero')

const complete: PlanningInput = {
  ...EMPTY_PLANNING_INPUT,
  goal: 'Long-term wealth building',
  horizonYears: 15,
  riskCapitalEur: 10_000,
  emergencyBufferConfirmed: true,
  moneyNotNeededConfirmed: true,
  maxLossEur: 4_000,
  maxLossPct: 40,
  contributionMode: 'monthly',
  monthlyContributionEur: 250,
  existingInvestmentsEur: 0,
  broker: 'Example broker',
  fractionalShares: false,
}

const ready = assessPlanningInput(complete)
assert(ready.ready, `complete plan blocked: ${ready.blockers.map((b) => b.code).join(', ')}`)
assert(ready.impliedMaxLossPct === 40, 'loss boundary must be recomputable')

for (let horizon = 0; horizon < 5; horizon++) {
  const result = assessPlanningInput({ ...complete, horizonYears: horizon })
  assert(!result.ready && result.blockers.some((b) => b.code === 'horizon'), `horizon ${horizon} must block`)
}

const mismatch = assessPlanningInput({ ...complete, maxLossEur: 2_000, maxLossPct: 40 })
assert(mismatch.blockers.some((b) => b.code === 'loss-mismatch'), 'loss limits that disagree must block')

const stocksOff = assessPlanningInput({ ...complete, allowStocks: false, activeSleevePct: 10 })
assert(stocksOff.blockers.some((b) => b.code === 'active-sleeve'), 'active sleeve must require stocks')

const negativeExisting = assessPlanningInput({ ...complete, existingInvestmentsEur: -1 })
assert(negativeExisting.blockers.some((b) => b.code === 'existing-investments'), 'existing investments cannot be negative')

console.log('personal planning gates fail closed')
