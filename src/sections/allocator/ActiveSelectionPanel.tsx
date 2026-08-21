import { Panel } from '../../components/Panel'
import type { MarketSnapshot } from '../../data/market-data'
import { FACTOR_LABELS, positions } from '../../data/positions'
import { isDirectlyTradable } from './allocation'
import {
  ACTIVE_FACTOR_CAP_PCT,
  ACTIVE_NAME_CAP_PCT,
  buildActivePortfolio,
  emptyCandidate,
  type ActiveCandidateInput,
  type ScenarioInput,
} from './active-selection'

function numberOrNull(value: string) {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full border border-term-line bg-term-bg px-3 py-2 text-sm outline-none placeholder:text-term-dim/50 focus:border-term-amber" /></label>
}

function NumberField({ label, value, onChange, suffix, min }: { label: string; value: number | null; onChange: (value: number | null) => void; suffix?: string; min?: number }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">{label}</span><div className="mt-1 flex border border-term-line bg-term-bg focus-within:border-term-amber"><input type="number" min={min} step="0.1" value={value ?? ''} onChange={(event) => onChange(numberOrNull(event.target.value))} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" />{suffix && <span className="py-2 pr-3 text-xs text-term-dim">{suffix}</span>}</div></label>
}

function ScenarioRow({ name, value, onChange }: { name: string; value: ScenarioInput; onChange: (value: ScenarioInput) => void }) {
  return <div className="grid grid-cols-[4rem_1fr_1fr] items-end gap-2"><span className="pb-2 text-xs uppercase text-term-dim">{name}</span><NumberField label="Probability" value={value.probabilityPct} onChange={(v) => onChange({ ...value, probabilityPct: v })} suffix="%" min={0} /><NumberField label="Total return" value={value.totalReturnPct} onChange={(v) => onChange({ ...value, totalReturnPct: v })} suffix="%" min={-100} /></div>
}

const eligibleUniverse = positions
  .filter((position) => !position.sections.includes('crypto') && position.stance === 'long' && isDirectlyTradable(position))
  .sort((a, b) => a.ticker.localeCompare(b.ticker))

export function ActiveSelectionPanel({ candidates, setCandidates, snapshot, benchmarkExpectedAnnualReturnPct, totalCapitalEur, activeSleevePct }: {
  candidates: ActiveCandidateInput[]
  setCandidates: (candidates: ActiveCandidateInput[]) => void
  snapshot: MarketSnapshot | null
  benchmarkExpectedAnnualReturnPct: number | null
  totalCapitalEur: number
  activeSleevePct: number
}) {
  const portfolio = buildActivePortfolio(candidates, snapshot, benchmarkExpectedAnnualReturnPct, totalCapitalEur, activeSleevePct)
  const update = (id: string, changes: Partial<ActiveCandidateInput>) => setCandidates(candidates.map((candidate) => candidate.id === id ? { ...candidate, ...changes } : candidate))

  return <div className="mt-4 space-y-4">
    <Panel title="3 · Active stock evidence">
      <div className="border border-term-yellow/50 bg-term-bg p-3 text-xs leading-relaxed text-term-dim">
        The thematic tabs are discovery material, not an approved universe. Defence remains a separate research-only page. A ticker enters this sleeve only through a new, dated evidence record below; nothing is imported as a recommendation.
      </div>
      {candidates.length === 0 && <p className="mt-4 text-xs text-term-dim">No active candidates. The valid default is 100% broad baseline.</p>}
      <div className="mt-4 space-y-5">
        {candidates.map((candidate, index) => {
          const assessment = portfolio.assessments[index]
          const set = <K extends keyof ActiveCandidateInput>(key: K, value: ActiveCandidateInput[K]) => update(candidate.id, { [key]: value } as Partial<ActiveCandidateInput>)
          return <section key={candidate.id} className="border border-term-line p-4">
            <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-xs font-bold uppercase tracking-wider text-term-amber">Candidate {index + 1}</h3><button type="button" onClick={() => setCandidates(candidates.filter((row) => row.id !== candidate.id))} className="text-[10px] uppercase text-term-red hover:underline">remove</button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">Ticker</span><select value={candidate.ticker} onChange={(event) => set('ticker', event.target.value)} className="mt-1 w-full border border-term-line bg-term-bg px-3 py-2 text-sm outline-none focus:border-term-amber"><option value="">Choose…</option>{eligibleUniverse.map((position) => <option key={position.ticker} value={position.ticker}>{position.ticker} · {position.name}</option>)}</select></label>
              <NumberField label="Thesis horizon" value={candidate.horizonYears} onChange={(v) => set('horizonYears', v)} suffix="years" min={0.1} />
              <div className="sm:col-span-2"><Field label="Specific thesis" value={candidate.thesis} onChange={(v) => set('thesis', v)} /></div>
              <div className="sm:col-span-2"><Field label="Falsifier" value={candidate.falsifier} onChange={(v) => set('falsifier', v)} /></div>
              <Field label="Valuation metric" value={candidate.valuationMetric} onChange={(v) => set('valuationMetric', v)} placeholder="e.g. EV / forward sales" />
              <NumberField label="Valuation value" value={candidate.valuationValue} onChange={(v) => set('valuationValue', v)} min={0} />
              <Field label="Valuation as of" type="date" value={candidate.valuationAsOf} onChange={(v) => set('valuationAsOf', v)} />
              <Field label="Reported period" value={candidate.fundamentalPeriod} onChange={(v) => set('fundamentalPeriod', v)} placeholder="e.g. FY2026 Q2" />
              <Field label="Fundamentals published" type="date" value={candidate.fundamentalPublishedAt} onChange={(v) => set('fundamentalPublishedAt', v)} />
              <Field label="Last reviewed" type="date" value={candidate.reviewedAt} onChange={(v) => set('reviewedAt', v)} />
              <Field label="Next mandatory review" type="date" value={candidate.nextReviewAt} onChange={(v) => set('nextReviewAt', v)} />
              <NumberField label="All-in round-trip cost" value={candidate.roundTripCostPct} onChange={(v) => set('roundTripCostPct', v)} suffix="%" min={0} />
              <div className="sm:col-span-2"><Field label="Direct thesis source URL" type="url" value={candidate.thesisSourceUrl} onChange={(v) => set('thesisSourceUrl', v)} /></div>
              <div className="sm:col-span-2"><Field label="Direct valuation source / calculation URL" type="url" value={candidate.valuationSourceUrl} onChange={(v) => set('valuationSourceUrl', v)} /></div>
            </div>
            <div className="mt-4 space-y-2 border-y border-term-line py-4">
              <ScenarioRow name="Bull" value={candidate.bull} onChange={(v) => set('bull', v)} />
              <ScenarioRow name="Base" value={candidate.base} onChange={(v) => set('base', v)} />
              <ScenarioRow name="Bear" value={candidate.bear} onChange={(v) => set('bear', v)} />
            </div>
            <div className="mt-4 space-y-2">
              <label className="flex gap-2 text-xs"><input type="checkbox" checked={candidate.officialSourcesConfirmed} onChange={(event) => set('officialSourcesConfirmed', event.target.checked)} className="accent-term-amber" />Inputs checked against primary or official sources.</label>
              <label className="flex gap-2 text-xs"><input type="checkbox" checked={candidate.noMaterialEventAfterReviewConfirmed} onChange={(event) => set('noMaterialEventAfterReviewConfirmed', event.target.checked)} className="accent-term-amber" />No material event occurred after the stated review.</label>
            </div>
            <div className="mt-4 border-t border-term-line pt-3 text-[11px] leading-relaxed">
              {assessment?.blockers.length ? <ul className="space-y-1 text-term-yellow">{assessment.blockers.map((blocker) => <li key={blocker}>— {blocker}</li>)}</ul> : assessment?.qualifies ? <p className="text-term-green">Evidence complete · expected {assessment.expectedAnnualReturnPct?.toFixed(1)}% p.a. after costs · edge {assessment.edgeAfterCostPct?.toFixed(1)} pp versus baseline · EUR reference {assessment.priceEur?.toFixed(2)} ({assessment.priceAsOf}).</p> : <p className="text-term-red">Evidence complete, but expected return after costs does not beat the declared broad baseline. No active allocation.</p>}
            </div>
          </section>
        })}
      </div>
      <button type="button" onClick={() => setCandidates([...candidates, emptyCandidate()])} className="mt-4 border border-term-amber px-3 py-2 text-xs uppercase tracking-wider text-term-amber hover:bg-term-amber hover:text-black">Add blank candidate</button>
    </Panel>

    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Active risk budget">
        <p className="text-[11px] leading-relaxed text-term-dim">Positive benchmark-relative edge is divided by realised volatility. Hard ceilings are {ACTIVE_NAME_CAP_PCT}% of total capital per name and {ACTIVE_FACTOR_CAP_PCT}% per primary factor. Unused room returns to the broad baseline; the active percentage is a ceiling, not a quota.</p>
        <dl className="mt-4 space-y-2 border-t border-term-line pt-3 text-xs">
          <div className="flex justify-between"><dt className="text-term-dim">Active ceiling</dt><dd>€{portfolio.activeBudgetEur.toFixed(0)}</dd></div>
          <div className="flex justify-between"><dt className="text-term-dim">Qualified allocation</dt><dd>€{portfolio.allocatedEur.toFixed(0)}</dd></div>
          <div className="flex justify-between"><dt className="text-term-dim">Returns to baseline</dt><dd>€{portfolio.unusedActiveBudgetEur.toFixed(0)}</dd></div>
        </dl>
        {portfolio.allocations.map((allocation) => <div key={allocation.ticker} className="mt-3 border-t border-term-line pt-3 text-xs"><div className="flex justify-between"><span>{allocation.ticker} · {allocation.name}</span><span className="text-term-amber">{allocation.totalCapitalPct.toFixed(2)}% · €{allocation.amountEur.toFixed(0)}</span></div><p className="mt-1 text-[10px] text-term-dim">{FACTOR_LABELS[allocation.factor]} · vol {allocation.realisedVolPct.toFixed(1)}% · edge {allocation.edgeAfterCostPct.toFixed(1)} pp</p></div>)}
      </Panel>
      <Panel title="Correlation and blockers">
        {portfolio.blockers.length > 0 && <ul className="space-y-2 text-[11px] text-term-red">{portfolio.blockers.map((blocker) => <li key={blocker}>— {blocker}</li>)}</ul>}
        {portfolio.correlations.map((row) => <p key={`${row.left}-${row.right}`} className="text-xs">{row.left}/{row.right}: <span className="text-term-cyan">{row.value.toFixed(2)}</span> · {row.observations} overlapping USD-return days</p>)}
        {portfolio.warnings.map((warning) => <p key={warning} className="mt-2 text-[11px] text-term-yellow">— {warning}</p>)}
        {!portfolio.blockers.length && !portfolio.correlations.length && <p className="text-xs text-term-dim">Correlation becomes relevant from two qualifying stocks. It is measured from the committed daily USD-close history, never typed by hand.</p>}
      </Panel>
    </div>
  </div>
}
