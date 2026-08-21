import { Panel } from '../../components/Panel'
import type { OpportunityAssessment } from './opportunity'

export interface CoverageRow {
  ticker: string
  company: string
  themes: string
  tradable: boolean
  quoteAsOf?: string
  assessment?: OpportunityAssessment
}
function State({ row }: { row: CoverageRow }) {
  if (!row.assessment) return <span className="text-term-yellow">RESEARCH REQUIRED</span>
  const tone = row.assessment.positiveEdge
    ? 'text-term-green'
    : row.assessment.decisionReady
      ? 'text-term-amber'
      : 'text-term-yellow'
  return <span className={tone}>{row.assessment.state}</span>
}

export function CoverageMatrix({ rows }: { rows: CoverageRow[] }) {
  const modelled = rows.filter((row) => row.assessment).length
  return (
    <Panel title={`Research coverage · ${modelled}/${rows.length} equity longs modelled`}>
      <p className="text-[11px] leading-relaxed text-term-dim">Every researched equity long remains visible. An absent scenario model is a research gap, not a low score. Context rows and crypto are outside this matrix; Defence remains a separate research-only universe.</p>
      <details className="mt-3">
        <summary className="cursor-pointer border border-term-line px-3 py-2 text-xs uppercase tracking-wider text-term-cyan focus:outline-none focus-visible:ring-1 focus-visible:ring-term-cyan">Open full coverage matrix</summary>

        <div className="mt-3 space-y-2 md:hidden">
          {rows.map((row) => (
            <div key={row.ticker} className="border border-term-line bg-term-bg p-3 text-[11px]">
              <div className="flex items-start justify-between gap-3"><span><b className="text-term-amber">{row.ticker}</b> · {row.company}</span><State row={row} /></div>
              <p className="mt-2 text-term-dim">{row.themes}</p>
              <p className="mt-1 text-term-dim">Quote {row.quoteAsOf ?? 'missing'} · {row.tradable ? 'directly tradable' : 'restricted route'} · {row.assessment ? `${row.assessment.model.sources.length} source(s), valuation and scenarios present` : 'sources/valuation/scenarios not authored in the opportunity engine'}</p>
              {row.assessment?.blockers[0] && <p className="mt-1 text-term-yellow">Blocked: {row.assessment.blockers[0].message}</p>}
            </div>
          ))}
        </div>

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] text-left text-[11px]">
            <thead className="text-[10px] uppercase tracking-wider text-term-dim">
              <tr className="border-b border-term-line"><th className="pb-2 pr-3">Ticker</th><th className="pb-2 pr-3">Theme</th><th className="pb-2 pr-3">Quote</th><th className="pb-2 pr-3">Sources</th><th className="pb-2 pr-3">Valuation</th><th className="pb-2 pr-3">Scenarios</th><th className="pb-2 pr-3">Tradable</th><th className="pb-2">State / first blocker</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.ticker} className="border-b border-term-line/60 align-top last:border-b-0">
                  <td className="py-2 pr-3"><b className="text-term-amber">{row.ticker}</b><span className="block text-[10px] text-term-dim">{row.company}</span></td>
                  <td className="py-2 pr-3 text-term-dim">{row.themes}</td>
                  <td className="py-2 pr-3 tabular-nums">{row.quoteAsOf ?? '—'}</td>
                  <td className="py-2 pr-3 tabular-nums">{row.assessment?.model.sources.length ?? '—'}</td>
                  <td className="py-2 pr-3">{row.assessment ? row.assessment.model.valuation.kind : '—'}</td>
                  <td className="py-2 pr-3">{row.assessment ? '3 / 100%' : '—'}</td>
                  <td className={`py-2 pr-3 ${row.tradable ? 'text-term-green' : 'text-term-yellow'}`}>{row.tradable ? 'yes' : 'no'}</td>
                  <td className="py-2"><State row={row} />{row.assessment?.blockers[0] && <span className="mt-1 block max-w-xs text-[10px] leading-relaxed text-term-dim">{row.assessment.blockers[0].message}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Panel>
  )
}
