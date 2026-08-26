import { Panel } from '../../components/Panel'
import { pct, signedPct } from './format'
import type { OpportunityAssessment } from './opportunity'
import type { UniverseScreenResult } from './universe-screen'

export interface CoverageRow {
  ticker: string
  company: string
  themes: string
  tradable: boolean
  quoteAsOf?: string
  screen: UniverseScreenResult
  assessment?: OpportunityAssessment
}
function State({ row }: { row: CoverageRow }) {
  if (!row.screen.passes) return <span className="text-term-red">SCREENED OUT</span>
  if (!row.assessment) return <span className="text-term-cyan">PASSED SCREEN · MODEL REQUIRED</span>
  const tone = row.assessment.positiveEdge
    ? 'text-term-green'
    : row.assessment.decisionReady
      ? 'text-term-amber'
      : 'text-term-yellow'
  return <span className={tone}>{row.assessment.state}</span>
}

export function CoverageMatrix({ rows }: { rows: CoverageRow[] }) {
  const modelled = rows.filter((row) => row.assessment).length
  const passed = rows.filter((row) => row.screen.passes).length
  return (
    <Panel title={`Coverage and blockers · ${passed}/${rows.length} pass screen · ${modelled} modelled`}>
      <p className="text-[11px] leading-relaxed text-term-dim">Every researched equity long is retested when a local screen setting changes, and each row has one versioned model. Passing stage one only earns a valuation review; evidence, required return and tradability still decide qualification. Context rows and Defence sit outside this matrix.</p>
      <details className="mt-3">
        <summary className="cursor-pointer border border-term-line px-3 py-2 text-xs uppercase tracking-wider text-term-cyan focus:outline-none focus-visible:ring-1 focus-visible:ring-term-cyan">Show every name and first blocker</summary>

        <div className="mt-3 space-y-2 md:hidden">
          {rows.map((row) => (
            <div key={row.ticker} className="border border-term-line bg-term-bg p-3 text-[11px]">
              <div className="flex items-start justify-between gap-3"><span><b className="text-term-amber">{row.ticker}</b> · {row.company}</span><State row={row} /></div>
              <p className="mt-2 text-term-dim">{row.themes}</p>
              <p className="mt-1 text-term-dim">Quote {row.quoteAsOf ?? 'missing'} · 200MA {row.screen.ma200 === undefined ? '—' : `${signedPct(row.screen.distanceFromMa200Pct)} · ${row.screen.ma200OpportunityState}`} · cap {row.screen.marketCapUsdBn === undefined ? '—' : `$${row.screen.marketCapUsdBn.toFixed(2)}bn`} · vol {pct(row.screen.realisedVolPct)} · drawdown {pct(row.screen.drawdownMagnitudePct)} · 3M {signedPct(row.screen.threeMonthReturnPct)}</p>
              <p className="mt-1 text-term-dim">{row.tradable ? 'directly tradable' : 'restricted route'} · {row.assessment ? `${row.assessment.model.sources.length} source(s), valuation and scenarios present` : 'valuation model not authored'}</p>
              {row.screen.blockers[0] && <p className="mt-1 text-term-red">Screen: {row.screen.blockers[0].message}</p>}
              {!row.screen.blockers[0] && row.assessment?.blockers[0] && <p className="mt-1 text-term-yellow">Valuation: {row.assessment.blockers[0].message}</p>}
            </div>
          ))}
        </div>

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1040px] text-left text-[11px]">
            <thead className="text-[10px] uppercase tracking-wider text-term-dim">
              <tr className="border-b border-term-line"><th className="pb-2 pr-3">Ticker</th><th className="pb-2 pr-3">Theme</th><th className="pb-2 pr-3">200MA</th><th className="pb-2 pr-3">Cap</th><th className="pb-2 pr-3">Vol</th><th className="pb-2 pr-3">Drawdown</th><th className="pb-2 pr-3">3M</th><th className="pb-2 pr-3">Model</th><th className="pb-2">Stage / first blocker</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.ticker} className="border-b border-term-line/60 align-top last:border-b-0">
                  <td className="py-2 pr-3"><b className="text-term-amber">{row.ticker}</b><span className="block text-[10px] text-term-dim">{row.company}</span></td>
                  <td className="py-2 pr-3 text-term-dim">{row.themes}</td>
                  <td className={`py-2 pr-3 tabular-nums ${row.screen.ma200OpportunityState === 'entry-zone' ? 'text-term-green' : row.screen.aboveMa200 ? 'text-term-amber' : 'text-term-red'}`}>{signedPct(row.screen.distanceFromMa200Pct)}<span className="block text-[9px] uppercase">{row.screen.ma200OpportunityState}</span></td>
                  <td className="py-2 pr-3 tabular-nums">{row.screen.marketCapUsdBn === undefined ? '—' : `$${row.screen.marketCapUsdBn.toFixed(2)}bn`}</td>
                  <td className="py-2 pr-3 tabular-nums">{pct(row.screen.realisedVolPct)}</td>
                  <td className="py-2 pr-3 tabular-nums">{pct(row.screen.drawdownMagnitudePct)}</td>
                  <td className="py-2 pr-3 tabular-nums">{signedPct(row.screen.threeMonthReturnPct)}</td>
                  <td className="py-2 pr-3">{row.assessment ? row.assessment.model.valuation.kind : '—'}</td>
                  <td className="py-2"><State row={row} />{(row.screen.blockers[0]?.message ?? row.assessment?.blockers[0]?.message) && <span className="mt-1 block max-w-xs text-[10px] leading-relaxed text-term-dim">{row.screen.blockers[0]?.message ?? row.assessment?.blockers[0]?.message}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Panel>
  )
}
