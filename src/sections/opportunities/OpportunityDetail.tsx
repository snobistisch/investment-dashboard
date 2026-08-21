import type { OpportunityAssessment } from './opportunity'
import type { OpportunityPolicy } from './model'
import { money, pct, signedPp, signedPct } from './format'

export function OpportunityDetail({
  assessment,
  policy,
  shortlisted,
  onToggleShortlist,
}: {
  assessment: OpportunityAssessment
  policy: OpportunityPolicy
  shortlisted: boolean
  onToggleShortlist: () => void
}) {
  const { model, quote } = assessment
  const bear = assessment.scenarios.find((scenario) => scenario.key === 'bear')

  return (
    <div className="border-t border-term-line bg-term-bg p-3 sm:p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-term-cyan">Why it is here</p>
          <p className="mt-2 text-xs leading-relaxed text-term-text">{model.thesis}</p>
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            {assessment.positiveEdge
              ? `At the dated quote, the model has ${pct(assessment.entryHeadroomPct)} headroom before it reaches the declared hurdle.`
              : assessment.decisionReady
                ? `The research case is complete, but price must fall ${pct(assessment.neededPullbackPct)} to reach the declared hurdle.`
                : 'The apparent valuation is blocked until every evidence, freshness and tradability gate passes.'}
            {' '}No cause is assigned to the price move.
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            <span className="text-term-yellow">Falsifier:</span> {model.falsifier}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-term-dim">
            <span className="text-term-cyan">Known catalyst:</span> {model.catalyst}
          </p>
        </div>

        <div className="border border-term-line bg-term-panel p-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-term-dim">Decision boundary</p>
          <dl className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between gap-3"><dt className="text-term-dim">Current</dt><dd className="tabular-nums">{money(quote?.priceLocal, model.currency)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-term-dim">Max entry</dt><dd className="tabular-nums text-term-amber">{money(assessment.maxEntryPrice, model.currency)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-term-dim">Hurdle edge</dt><dd className="tabular-nums">{signedPp(assessment.hurdleEdgePct)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-term-dim">Bear outcome</dt><dd className="tabular-nums text-term-red">{signedPct(bear?.netTotalReturnPct)}</dd></div>
          </dl>
          <button
            type="button"
            disabled={!assessment.decisionReady}
            onClick={onToggleShortlist}
            className="mt-4 w-full border border-term-amber px-3 py-2 text-xs uppercase tracking-wider text-term-amber enabled:hover:bg-term-amber enabled:hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
          >
            {shortlisted ? 'Remove from Plan shortlist' : 'Shortlist for Plan'}
          </button>
          <p className="mt-2 text-[10px] leading-relaxed text-term-dim">Shortlisting does not enable stocks, assign a weight or create an order.</p>
        </div>
      </div>

      {assessment.blockers.length > 0 && (
        <div className="mt-4 border border-term-yellow/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-term-yellow">Blocked</p>
          <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-term-yellow">
            {assessment.blockers.map((blocker) => <li key={`${blocker.code}-${blocker.message}`}>— {blocker.message}</li>)}
          </ul>
        </div>
      )}

      {assessment.scenarios.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-term-dim">
              <tr className="border-b border-term-line">
                <th className="pb-2 pr-3">Scenario</th><th className="pb-2 pr-3 text-right">Probability</th><th className="pb-2 pr-3 text-right">{model.valuation.metricLabel}</th><th className="pb-2 pr-3 text-right">Multiple</th><th className="pb-2 pr-3 text-right">Terminal value</th><th className="pb-2 text-right">Net return</th>
              </tr>
            </thead>
            <tbody>
              {assessment.scenarios.map((scenario) => {
                const input = model.valuation.scenarios[scenario.key]
                return (
                  <tr key={scenario.key} className="border-b border-term-line/60 align-top last:border-b-0">
                    <td className="py-2 pr-3 uppercase text-term-amber">{scenario.key}<span className="mt-1 block max-w-xs normal-case text-[10px] leading-relaxed text-term-dim">{scenario.rationale}</span></td>
                    <td className="py-2 pr-3 text-right tabular-nums">{pct(scenario.probability * 100, 0)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{input.metricValue.toLocaleString('en-US')}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{model.valuation.kind === 'terminal-price' ? 'direct' : `${input.terminalMultiple.toFixed(1)}×`}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{money(scenario.terminalValue, model.currency)}</td>
                    <td className={`py-2 text-right tabular-nums ${scenario.netTotalReturnPct < 0 ? 'text-term-red' : 'text-term-green'}`}>{signedPct(scenario.netTotalReturnPct)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {assessment.stress && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="border border-term-line p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-term-cyan">Robustness, kept separate</p>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-term-dim">
              <li>— Bull → bear probability shift: <span className="text-term-text">{assessment.stress.survivesFullBullShift ? 'survives the full bull probability' : `${pct(assessment.stress.bullToBearShiftPct)} to zero edge`}</span></li>
              <li>— Base/bull terminal reduction: <span className="text-term-text">{assessment.stress.baseBullTerminalReductionPct === null ? 'not bounded by this stress' : `${pct(assessment.stress.baseBullTerminalReductionPct)} to zero edge`}</span></li>
              <li>— Additional exit cost capacity: <span className="text-term-text">{pct(assessment.stress.additionalExitCostPct)}</span></li>
              <li>— Edge with one-year delay: <span className="text-term-text">{signedPp(assessment.stress.oneYearDelayEdgePct)}</span></li>
            </ul>
          </div>
          <div className="border border-term-line p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-term-cyan">Price sensitivity</p>
            <div className="mt-3 space-y-1 text-[11px]">
              {assessment.sensitivity.map((row) => (
                <div key={row.price} className="flex justify-between gap-3 border-b border-term-line/50 py-1 last:border-b-0">
                  <span className="tabular-nums">{money(row.price, model.currency)}</span>
                  <span className={`tabular-nums ${row.hurdleEdgePct >= 0 ? 'text-term-green' : 'text-term-red'}`}>{signedPp(row.hurdleEdgePct)} edge</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <details className="mt-4 border border-term-line">
        <summary className="cursor-pointer px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-term-cyan focus:outline-none focus-visible:ring-1 focus-visible:ring-term-cyan">Calculation trace and sources</summary>
        <div className="border-t border-term-line p-3 text-[11px] leading-relaxed text-term-dim">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 font-mono">
              <p>Quote: {money(quote?.priceLocal, model.currency)} · {quote?.asOf ?? 'missing'}</p>
              <p>Expected terminal value: Σ probability × terminal value = {money(assessment.expectedTerminalValue, model.currency)}</p>
              <p>Net expected total return: {signedPct(assessment.expectedTotalReturnPct)}</p>
              <p>Annualised expected-terminal-wealth return: {pct(assessment.annualisedExpectedTerminalWealthReturnPct)}</p>
              <p>Required annual return: {policy.benchmarkAnnualReturnPct.toFixed(1)}% benchmark + {policy.requiredActivePremiumPct.toFixed(1)} pp premium = {pct(assessment.requiredAnnualReturnPct)}</p>
              <p>Hurdle edge: {signedPp(assessment.hurdleEdgePct)}</p>
              <p>Max entry solves the same return at zero hurdle edge: {money(assessment.maxEntryPrice, model.currency)}</p>
              <p>Costs: {policy.buyCostPct.toFixed(2)}% entry + {policy.sellCostPct.toFixed(2)}% exit.</p>
            </div>
            <div>
              <p><span className="text-term-yellow">Model limitation:</span> {model.limitation}</p>
              <p className="mt-3"><span className="text-term-yellow">Risks:</span></p>
              <ul className="mt-1 space-y-1">{model.risks.map((risk) => <li key={risk}>— {risk}</li>)}</ul>
              <p className="mt-3">Research reviewed {model.reviewedAt} · fundamentals checked through {model.fundamentalsAsOf} · mandatory review {model.nextReviewAt} · model {model.version}.</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {model.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="text-term-cyan underline underline-offset-2">{source.label} · checked {source.evidenceAsOf}</a>)}
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}
