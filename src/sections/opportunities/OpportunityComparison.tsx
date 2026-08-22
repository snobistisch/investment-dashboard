import type { ReactNode } from 'react'
import { Panel } from '../../components/Panel'
import type { OpportunityAssessment } from './opportunity'
import { money, pct, signedPp, signedPct } from './format'
import { classifyMa200Opportunity } from './universe-screen'

export function OpportunityComparison({
  assessments,
  themeByTicker,
  ma200OpportunityDistancePct,
  onRemove,
}: {
  assessments: OpportunityAssessment[]
  themeByTicker: Record<string, string>
  ma200OpportunityDistancePct: number
  onRemove: (ticker: string) => void
}) {
  if (assessments.length === 0) return null

  const rows: { label: string; value: (assessment: OpportunityAssessment) => ReactNode }[] = [
    { label: 'Theme', value: (assessment) => themeByTicker[assessment.model.ticker] ?? '—' },
    { label: 'State', value: (assessment) => assessment.state },
    { label: 'Current price', value: (assessment) => money(assessment.quote?.priceLocal, assessment.model.currency) },
    { label: 'Expected terminal value', value: (assessment) => money(assessment.expectedTerminalValue, assessment.model.currency) },
    { label: 'Expected annual return', value: (assessment) => pct(assessment.annualisedExpectedTerminalWealthReturnPct) },
    { label: 'Hurdle edge', value: (assessment) => signedPp(assessment.hurdleEdgePct) },
    { label: 'Max entry', value: (assessment) => money(assessment.maxEntryPrice, assessment.model.currency) },
    { label: 'Entry headroom', value: (assessment) => signedPct(assessment.entryHeadroomPct) },
    { label: 'Bear total return', value: (assessment) => signedPct(assessment.scenarios.find((scenario) => scenario.key === 'bear')?.netTotalReturnPct) },
    { label: 'Bull→bear tolerance', value: (assessment) => assessment.stress?.survivesFullBullShift ? 'Full bull probability' : pct(assessment.stress?.bullToBearShiftPct) },
    { label: 'One-year delay edge', value: (assessment) => signedPp(assessment.stress?.oneYearDelayEdgePct) },
    { label: 'Research vintage', value: (assessment) => assessment.model.reviewedAt },
    { label: 'Next review', value: (assessment) => assessment.model.nextReviewAt },
    { label: 'Volatility', value: (assessment) => pct(assessment.quote?.stats?.realisedVolPct) },
    { label: '200MA distance', value: (assessment) => signedPct(assessment.quote?.trend200?.distancePct) },
    { label: '200MA setup', value: (assessment) => classifyMa200Opportunity(assessment.quote?.trend200?.distancePct, ma200OpportunityDistancePct).replace('-', ' ') },
  ]

  return (
    <Panel title={`Compare · ${assessments.length} of 4 selected`}>
      <p className="mb-3 text-[11px] leading-relaxed text-term-dim">Metrics remain separate. Low volatility, low correlation or strong thesis prose does not increase expected edge.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-term-line text-[10px] uppercase tracking-wider text-term-dim">
              <th className="sticky left-0 z-10 bg-term-panel pb-2 pr-4">Metric</th>
              {assessments.map((assessment) => (
                <th key={assessment.model.ticker} className="min-w-36 pb-2 pr-4 text-term-amber">
                  <span>{assessment.model.ticker}</span>
                  <button type="button" onClick={() => onRemove(assessment.model.ticker)} className="ml-2 text-[9px] text-term-red hover:underline" aria-label={`Remove ${assessment.model.ticker} from comparison`}>remove</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-term-line/60 last:border-b-0">
                <th className="sticky left-0 z-10 bg-term-panel py-2 pr-4 font-normal text-term-dim">{row.label}</th>
                {assessments.map((assessment) => <td key={assessment.model.ticker} className="py-2 pr-4 tabular-nums">{row.value(assessment)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
