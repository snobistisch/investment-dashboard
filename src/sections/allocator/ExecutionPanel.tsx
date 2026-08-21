import { Panel } from '../../components/Panel'
import type { MarketSnapshot } from '../../data/market-data'
import { buildActivePortfolio, type ActiveCandidateInput } from './active-selection'
import type { BenchmarkInput } from './benchmark'
import { buildConceptOrders, type ExecutionInput } from './execution'
import type { PlanningInput } from './planning'

function numberOrNull(value: string) {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function Numeric({ label, value, onChange, suffix, min = 0, step = 0.01 }: { label: string; value: number | null; onChange: (value: number | null) => void; suffix?: string; min?: number; step?: number }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">{label}</span><div className="mt-1 flex border border-term-line bg-term-bg focus-within:border-term-amber"><input type="number" min={min} step={step} value={value ?? ''} onChange={(event) => onChange(numberOrNull(event.target.value))} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" />{suffix && <span className="py-2 pr-3 text-xs text-term-dim">{suffix}</span>}</div></label>
}

function eur(value: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value)
}

export function ExecutionPanel({ planning, benchmark, candidates, market, input, setInput }: {
  planning: PlanningInput
  benchmark: BenchmarkInput
  candidates: ActiveCandidateInput[]
  market: MarketSnapshot | null
  input: ExecutionInput
  setInput: (input: ExecutionInput) => void
}) {
  const set = <K extends keyof ExecutionInput>(key: K, value: ExecutionInput[K]) => setInput({ ...input, [key]: value })
  const active = buildActivePortfolio(candidates, market, benchmark.expectedAnnualReturnPct, planning.riskCapitalEur ?? 0, planning.activeSleevePct)
  const assessment = buildConceptOrders(planning, benchmark, candidates, market, input)
  const download = () => {
    if (!assessment.snapshot) return
    const blob = new Blob([`${JSON.stringify(assessment.snapshot, null, 2)}\n`], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `equity-decision-${assessment.snapshot.createdAt.slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return <div className="mt-4 space-y-4">
    <Panel title="4 · Concept order policy">
      <div className="border border-term-red/50 bg-term-bg p-3 text-xs leading-relaxed text-term-dim">This creates a calculation, not an order. It cannot see the broker order book, tax treatment, account permissions or Monday&rsquo;s news. Every limit remains your input and must be checked again before submission.</div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Numeric label="Fixed broker fee" value={input.fixedCostPerOrderEur} onChange={(v) => set('fixedCostPerOrderEur', v)} suffix="EUR/order" />
        <Numeric label="FX cost" value={input.fxCostPct} onChange={(v) => set('fxCostPct', v)} suffix="%" />
        <Numeric label="Slippage allowance" value={input.slippageAllowancePct} onChange={(v) => set('slippageAllowancePct', v)} suffix="%" />
        <Numeric label="Minimum order" value={input.minimumOrderEur} onChange={(v) => set('minimumOrderEur', v)} suffix="EUR" />
        <Numeric label="Tranches" value={input.tranches} onChange={(v) => set('tranches', v)} min={1} step={1} />
        <label className="block"><span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">Window start</span><input type="date" value={input.windowStart} onChange={(event) => set('windowStart', event.target.value)} className="mt-1 w-full border border-term-line bg-term-bg px-3 py-2 text-sm outline-none focus:border-term-amber" /></label>
        <label className="block"><span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">Window end</span><input type="date" value={input.windowEnd} onChange={(event) => set('windowEnd', event.target.value)} className="mt-1 w-full border border-term-line bg-term-bg px-3 py-2 text-sm outline-none focus:border-term-amber" /></label>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Numeric label={`${benchmark.ticker || 'Baseline'} limit`} value={input.baselineLimitPriceEur} onChange={(v) => set('baselineLimitPriceEur', v)} suffix="EUR" />
        {active.allocations.map((allocation) => <Numeric key={allocation.ticker} label={`${allocation.ticker} limit`} value={input.stockLimitPricesEur[allocation.ticker] ?? null} onChange={(value) => set('stockLimitPricesEur', { ...input.stockLimitPricesEur, [allocation.ticker]: value })} suffix="EUR" />)}
      </div>
      <div className="mt-5 space-y-2 border-t border-term-line pt-4">
        <label className="flex gap-2 text-xs"><input type="checkbox" checked={input.costScheduleConfirmed} onChange={(event) => set('costScheduleConfirmed', event.target.checked)} className="accent-term-amber" />I checked the named broker&rsquo;s current fee and FX schedule.</label>
        <label className="flex gap-2 text-xs"><input type="checkbox" checked={input.limitDisciplineConfirmed} onChange={(event) => set('limitDisciplineConfirmed', event.target.checked)} className="accent-term-amber" />Every concept row will remain a limit order; no market-order substitution.</label>
        <label className="flex gap-2 text-xs"><input type="checkbox" checked={input.recheckBeforeSubmitConfirmed} onChange={(event) => set('recheckBeforeSubmitConfirmed', event.target.checked)} className="accent-term-amber" />Before submission I will recheck news, price, spread, FX, venue and instrument identity in the broker.</label>
      </div>
    </Panel>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
      <Panel title={assessment.ready ? 'Concept orders · ready to export' : `Concept orders · ${assessment.blockers.length} blocking`}>
        {assessment.blockers.length > 0 ? <ul className="space-y-2 text-[11px] text-term-yellow">{assessment.blockers.map((blocker) => <li key={blocker}>— {blocker}</li>)}</ul> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="text-[10px] uppercase text-term-dim"><tr><th className="pb-2">Instrument</th><th>Venue</th><th>Tranche</th><th>Quantity</th><th>Limit</th><th>Reference</th><th>Max cash</th></tr></thead><tbody>{assessment.orders.map((order) => <tr key={`${order.ticker}-${order.tranche}`} className="border-t border-term-line"><td className="py-2"><span className="text-term-amber">{order.ticker}</span><br/><span className="text-[10px] text-term-dim">{order.isin ?? order.name}</span></td><td>{order.venue}</td><td>{order.tranche}/{order.tranches}</td><td>{order.quantity}</td><td>{eur(order.limitPriceEur)}</td><td>{eur(order.referencePriceEur)}<br/><span className="text-[10px] text-term-dim">{order.referencePriceAsOf}</span></td><td>{eur(order.maximumCashUseEur)}</td></tr>)}</tbody></table></div>}
        {assessment.warnings.map((warning) => <p key={warning} className="mt-3 text-[11px] text-term-yellow">— {warning}</p>)}
      </Panel>
      <Panel title="Decision snapshot">
        <dl className="space-y-2 text-xs"><div className="flex justify-between"><dt className="text-term-dim">Cash reserved</dt><dd>{eur(assessment.totalCashUseEur)}</dd></div><div className="flex justify-between"><dt className="text-term-dim">Estimated costs</dt><dd>{eur(assessment.totalEstimatedCostsEur)}</dd></div><div className="flex justify-between"><dt className="text-term-dim">Market fetched</dt><dd>{market?.fetchedAt.slice(0, 10) ?? '—'}</dd></div></dl>
        <button type="button" disabled={!assessment.ready} onClick={download} className="mt-4 w-full border border-term-cyan px-3 py-2 text-xs uppercase tracking-wider text-term-cyan enabled:hover:bg-term-cyan enabled:hover:text-black disabled:cursor-not-allowed disabled:opacity-30">Download decision JSON</button>
        <p className="mt-3 text-[10px] leading-relaxed text-term-dim">The file contains the personal inputs, direct URLs, assumptions, market vintage, limits, quantities and estimated costs. It stays local unless you choose to share it.</p>
      </Panel>
    </div>
  </div>
}
