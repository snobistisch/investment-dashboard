import { Panel } from '../../components/Panel'
import {
  assessBenchmark,
  MAX_BEGINNER_ACTIVE_SLEEVE_PCT,
  type BenchmarkInput,
} from './benchmark'

function eur(value: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function numberOrNull(value: string) {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function TextField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full border border-term-line bg-term-bg px-3 py-2 text-sm text-term-text outline-none placeholder:text-term-dim/50 focus:border-term-amber"
      />
    </label>
  )
}

export function BenchmarkPanel({ input, setInput, riskCapitalEur, activeSleevePct, setActiveSleevePct, stocksAllowed }: {
  input: BenchmarkInput
  setInput: (input: BenchmarkInput) => void
  riskCapitalEur: number
  activeSleevePct: number
  setActiveSleevePct: (value: number) => void
  stocksAllowed: boolean
}) {
  const assessment = assessBenchmark(input, riskCapitalEur, activeSleevePct)
  const set = <K extends keyof BenchmarkInput>(key: K, value: BenchmarkInput[K]) => setInput({ ...input, [key]: value })

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
      <Panel title="2 · Broad baseline instrument">
        <div className="border border-term-cyan/50 bg-term-bg p-3 text-xs leading-relaxed text-term-dim">
          No product is preselected. Enter the exact instrument only after reading its official product page and current KID/EID. The index is the comparison; the fund and venue are what can actually be bought.
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField label="Broad index" value={input.indexName} onChange={(v) => set('indexName', v)} placeholder="Index name, not a ticker" />
          <TextField label="Fund / ETF name" value={input.fundName} onChange={(v) => set('fundName', v)} />
          <TextField label="ISIN" value={input.isin} onChange={(v) => set('isin', v.toUpperCase())} />
          <TextField label="Ticker" value={input.ticker} onChange={(v) => set('ticker', v.toUpperCase())} />
          <TextField label="Venue" value={input.venue} onChange={(v) => set('venue', v)} />
          <TextField label="Trading currency" value={input.tradingCurrency} onChange={(v) => set('tradingCurrency', v.toUpperCase())} placeholder="EUR" />
          <TextField label="Domicile" value={input.domicile} onChange={(v) => set('domicile', v)} />
          <TextField label="Replication" value={input.replication} onChange={(v) => set('replication', v)} placeholder="physical / synthetic" />
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">Annual fund cost</span>
            <div className="mt-1 flex border border-term-line bg-term-bg focus-within:border-term-amber">
              <input type="number" min={0} max={5} step={0.01} value={input.terPct ?? ''} onChange={(event) => set('terPct', numberOrNull(event.target.value))} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
              <span className="pr-3 py-2 text-xs text-term-dim">%</span>
            </div>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">Verified price</span>
            <div className="mt-1 flex border border-term-line bg-term-bg focus-within:border-term-amber">
              <input type="number" min={0} step={0.01} value={input.priceEur ?? ''} onChange={(event) => set('priceEur', numberOrNull(event.target.value))} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
              <span className="pr-3 py-2 text-xs text-term-dim">EUR</span>
            </div>
          </label>
          <TextField label="Price as of" type="date" value={input.priceAsOf} onChange={(v) => set('priceAsOf', v)} />
          <div />
          <div className="sm:col-span-2"><TextField label="Official product URL" type="url" value={input.productUrl} onChange={(v) => set('productUrl', v)} /></div>
          <div className="sm:col-span-2"><TextField label="Current KID / EID URL" type="url" value={input.kidUrl} onChange={(v) => set('kidUrl', v)} /></div>
        </div>
        <div className="mt-4 space-y-2 border-t border-term-line pt-4">
          {[
            ['broadDiversificationConfirmed', 'I checked that the holdings span regions and sectors rather than one theme.'],
            ['officialDocumentsConfirmed', 'I checked every field above against the official product page and current KID/EID.'],
            ['brokerAvailableConfirmed', 'I confirmed this exact ISIN and venue are available at my broker.'],
          ].map(([key, label]) => (
            <label key={key} className="flex gap-2 text-xs leading-relaxed">
              <input type="checkbox" checked={input[key as keyof BenchmarkInput] as boolean} onChange={(event) => set(key as keyof BenchmarkInput, event.target.checked as never)} className="mt-0.5 accent-term-amber" />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel title="Core / satellite policy">
          <div className="flex justify-between text-xs">
            <span>Broad baseline</span><span className="text-term-cyan">{100 - activeSleevePct}%</span>
          </div>
          <div className="mt-1 flex justify-between text-xs">
            <span>Active stocks</span><span className="text-term-amber">{activeSleevePct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={MAX_BEGINNER_ACTIVE_SLEEVE_PCT}
            value={activeSleevePct}
            disabled={!stocksAllowed}
            onChange={(event) => setActiveSleevePct(Number(event.target.value))}
            className="mt-4 w-full accent-term-amber disabled:opacity-30"
          />
          <p className="mt-2 text-[11px] leading-relaxed text-term-dim">
            The beginner route declares a {MAX_BEGINNER_ACTIVE_SLEEVE_PCT}% ceiling. It is a safety policy, not an estimate of the optimal active share. Stocks remain at 0% unless explicitly enabled.
          </p>
          <dl className="mt-4 space-y-2 border-t border-term-line pt-3 text-xs">
            <div className="flex justify-between"><dt className="text-term-dim">Baseline budget</dt><dd>{eur(assessment.baselineBudgetEur)}</dd></div>
            <div className="flex justify-between"><dt className="text-term-dim">Active budget</dt><dd>{eur(assessment.activeBudgetEur)}</dd></div>
            <div className="flex justify-between"><dt className="text-term-dim">Annual fund cost</dt><dd>{assessment.annualFundCostEur === undefined ? '—' : eur(assessment.annualFundCostEur)}</dd></div>
          </dl>
        </Panel>

        <Panel title={assessment.ready ? 'Benchmark gate · ready' : `Benchmark gate · ${assessment.blockers.length} blocking`}>
          {assessment.ready ? (
            <p className="text-xs leading-relaxed text-term-green">The baseline instrument is fully specified. It can enter cost and order calculations; that still does not approve an active stock.</p>
          ) : (
            <ul className="space-y-2 text-[11px] leading-relaxed text-term-yellow">
              {assessment.blockers.map((blocker) => <li key={blocker}>— {blocker}</li>)}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}

