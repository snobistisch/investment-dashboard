import { useEffect, useMemo, useState } from 'react'
import { Panel } from '../../components/Panel'
import { Section } from '../../components/Section'
import {
  assessPlanningInput,
  EMPTY_PLANNING_INPUT,
  MIN_EQUITY_HORIZON_YEARS,
  type PlanningInput,
} from './planning'

function numberOrNull(value: string) {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}
function NumberField({ label, value, onChange, min = 0, step = 1, suffix }: {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  step?: number
  suffix?: string
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">{label}</span>
      <div className="mt-1 flex items-center border border-term-line bg-term-bg focus-within:border-term-amber">
        <input
          type="number"
          min={min}
          step={step}
          value={value ?? ''}
          onChange={(event) => onChange(numberOrNull(event.target.value))}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-term-text tabular-nums outline-none"
        />
        {suffix && <span className="pr-3 text-xs text-term-dim">{suffix}</span>}
      </div>
    </label>
  )
}

function Check({ checked, onChange, children }: {
  checked: boolean
  onChange: (value: boolean) => void
  children: string
}) {
  return (
    <label className="flex items-start gap-2 text-xs leading-relaxed text-term-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 accent-term-amber"
      />
      <span>{children}</span>
    </label>
  )
}

export function AllocatorPanel({ onLeverageChange }: { onLeverageChange?: (active: boolean) => void }) {
  const [input, setInput] = useState<PlanningInput>(EMPTY_PLANNING_INPUT)
  const assessment = useMemo(() => assessPlanningInput(input), [input])

  useEffect(() => onLeverageChange?.(false), [onLeverageChange])

  const set = <K extends keyof PlanningInput>(key: K, value: PlanningInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }))
  }

  return (
    <Section
      title="Investment plan"
      description="Start with the decision that comes before security selection: whether this money can be invested, for what goal and with what loss boundary. Inputs stay in this browser session and are not persisted. No allocation or order appears until every material gate passes."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <Panel title="1 · Personal decision frame">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">Financial goal</span>
              <input
                type="text"
                value={input.goal}
                onChange={(event) => set('goal', event.target.value)}
                placeholder="e.g. long-term wealth building"
                className="mt-1 w-full border border-term-line bg-term-bg px-3 py-2 text-sm text-term-text outline-none placeholder:text-term-dim/60 focus:border-term-amber"
              />
            </label>

            <NumberField label="Time horizon" value={input.horizonYears} onChange={(v) => set('horizonYears', v)} suffix="years" />
            <NumberField label="Risk capital" value={input.riskCapitalEur} onChange={(v) => set('riskCapitalEur', v)} step={100} suffix="EUR" />
            <NumberField label="Maximum tolerable loss" value={input.maxLossEur} onChange={(v) => set('maxLossEur', v)} step={100} suffix="EUR" />
            <NumberField label="Maximum tolerable loss" value={input.maxLossPct} onChange={(v) => set('maxLossPct', v)} suffix="%" />
            <NumberField label="Existing investments" value={input.existingInvestmentsEur} onChange={(v) => set('existingInvestmentsEur', v)} step={100} suffix="EUR" />

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">Contribution pattern</span>
              <select
                value={input.contributionMode}
                onChange={(event) => set('contributionMode', event.target.value as PlanningInput['contributionMode'])}
                className="mt-1 w-full border border-term-line bg-term-bg px-3 py-2 text-sm text-term-text outline-none focus:border-term-amber"
              >
                <option value="">Choose…</option>
                <option value="one-off">One-off</option>
                <option value="monthly">Monthly</option>
                <option value="mixed">One-off + monthly</option>
              </select>
            </label>

            {(input.contributionMode === 'monthly' || input.contributionMode === 'mixed') && (
              <NumberField label="Monthly contribution" value={input.monthlyContributionEur} onChange={(v) => set('monthlyContributionEur', v)} step={25} suffix="EUR" />
            )}

            <div className="space-y-3 sm:col-span-2">
              <Check checked={input.emergencyBufferConfirmed} onChange={(v) => set('emergencyBufferConfirmed', v)}>
                I have a separate emergency buffer; none of it is included above.
              </Check>
              <Check checked={input.moneyNotNeededConfirmed} onChange={(v) => set('moneyNotNeededConfirmed', v)}>
                I do not expect to need this money during the stated horizon.
              </Check>
            </div>
          </div>

          <div className="mt-5 border-t border-term-line pt-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-term-dim">Allowed products</p>
            <div className="mt-2 flex flex-wrap gap-5">
              <Check checked={input.allowEtfs} onChange={(v) => set('allowEtfs', v)}>Broad funds / ETFs</Check>
              <Check checked={input.allowStocks} onChange={(v) => set('allowStocks', v)}>Individual stocks</Check>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
              Individual stocks are off by default. The active thematic sleeve starts at 0% and remains blocked until benchmark, source and freshness checks pass.
            </p>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title={assessment.ready ? 'Gate status · ready for benchmark setup' : `Gate status · ${assessment.blockers.length} blocking`}>
            {assessment.blockers.length > 0 ? (
              <ul className="space-y-2 text-xs leading-relaxed text-term-yellow">
                {assessment.blockers.map((blocker) => <li key={blocker.code}>— {blocker.message}</li>)}
              </ul>
            ) : (
              <p className="text-xs leading-relaxed text-term-green">
                The personal gates pass. This does not yet authorize a security: benchmark, source, freshness, cost and execution gates come next.
              </p>
            )}
            {assessment.warnings.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-term-line pt-3 text-[11px] leading-relaxed text-term-dim">
                {assessment.warnings.map((warning) => <li key={warning}>— {warning}</li>)}
              </ul>
            )}
          </Panel>

          <Panel title="Policy, not a prediction">
            <p className="text-[11px] leading-relaxed text-term-dim">
              Equities are blocked below {MIN_EQUITY_HORIZON_YEARS} years. That is a declared safety policy grounded in the AFM&rsquo;s long-horizon guidance, not a forecast that five years guarantees a gain.
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
              <a className="text-term-cyan underline underline-offset-2" href="https://www.afm.nl/nl-nl/consumenten/themas/zelf-beleggen" target="_blank" rel="noopener noreferrer">AFM · (Zelf) beleggen</a>
              {' · '}
              <a className="text-term-cyan underline underline-offset-2" href="https://www.afm.nl/en/consumenten/themas/zelf-beleggen/is-beleggen-iets-voor-jou/praktische-checklist-bij-beleggen" target="_blank" rel="noopener noreferrer">AFM · practical checklist</a>
            </p>
          </Panel>
        </div>
      </div>
    </Section>
  )
}
