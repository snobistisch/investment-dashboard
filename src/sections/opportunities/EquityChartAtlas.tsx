import { useMemo, useState } from 'react'
import { Panel } from '../../components/Panel'
import type { MarketSnapshot } from '../../data/market-data'
import type { Position } from '../../data/positions'
import { EquityPriceChart } from './EquityPriceChart'

type TrendFilter = 'all' | 'above' | 'below' | 'missing'

export function EquityChartAtlas({ positions, snapshot }: { positions: Position[]; snapshot: MarketSnapshot | null }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [trend, setTrend] = useState<TrendFilter>('all')
  const charts = snapshot?.equityCharts ?? {}
  const withChart = positions.filter((position) => charts[position.ticker]?.points.length).length
  const withMa = positions.filter((position) => snapshot?.quotes[position.ticker]?.trend200).length
  const rows = useMemo(() => positions.filter((position) => {
    const needle = query.trim().toLowerCase()
    if (needle && !`${position.ticker} ${position.name} ${position.sections.join(' ')}`.toLowerCase().includes(needle)) return false
    const value = snapshot?.quotes[position.ticker]?.trend200
    if (trend === 'above') return value?.above === true
    if (trend === 'below') return value?.above === false
    if (trend === 'missing') return !value
    return true
  }), [positions, query, snapshot, trend])

  return (
    <Panel title={`All equity charts · ${withChart}/${positions.length} charted · ${withMa} with 200MA`}>
      <p className="text-[11px] leading-relaxed text-term-dim">The atlas includes every transcribed equity, including context rows. Charts use daily closes in the listing currency. The cyan line is the simple 200-session average; a recent listing remains unclassified until 200 closes exist.</p>
      <button type="button" onClick={() => setOpen((current) => !current)} className="mt-3 border border-term-cyan px-3 py-2 text-[10px] uppercase tracking-wider text-term-cyan hover:bg-term-cyan hover:text-black">{open ? 'Close chart atlas' : 'Open all charts'}</button>
      {open && (
        <div className="mt-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <label className="block"><span className="text-[10px] uppercase tracking-wider text-term-dim">Find ticker or company</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="mt-1 w-full border border-term-line bg-term-bg px-3 py-2 text-base outline-none focus:border-term-cyan sm:text-sm" /></label>
            <label className="block"><span className="text-[10px] uppercase tracking-wider text-term-dim">200MA state</span><select value={trend} onChange={(event) => setTrend(event.target.value as TrendFilter)} className="mt-1 w-full border border-term-line bg-term-bg px-3 py-2 text-base outline-none focus:border-term-cyan sm:text-sm"><option value="all">All</option><option value="above">Above</option><option value="below">Below</option><option value="missing">Not available</option></select></label>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-wider text-term-dim">{rows.length} charts shown</p>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {rows.map((position) => (
              <div key={position.ticker} className="border border-term-line bg-term-panel p-2">
                <p className="mb-2 text-[10px] text-term-dim">{position.name} · {position.stance} · {position.sections.join(' · ')}</p>
                <EquityPriceChart ticker={position.ticker} series={charts[position.ticker]} quote={snapshot?.quotes[position.ticker]} compact />
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  )
}
