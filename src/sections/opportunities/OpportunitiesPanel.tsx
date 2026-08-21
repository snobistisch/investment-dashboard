import { useMemo, useState } from 'react'
import { Panel } from '../../components/Panel'
import { Section } from '../../components/Section'
import { equityOpportunityModels } from '../../data/equity-opportunities'
import { useMarketSnapshot } from '../../data/market-data'
import { positions } from '../../data/positions'
import { isDirectlyTradable } from '../allocator/allocation'
import { CoverageMatrix, type CoverageRow } from './CoverageMatrix'
import { OpportunityComparison } from './OpportunityComparison'
import { OpportunityDetail } from './OpportunityDetail'
import { money, pct, signedPp, signedPct } from './format'
import {
  DEFAULT_OPPORTUNITY_POLICY,
  type OpportunityPolicy,
} from './model'
import {
  assessOpportunity,
  businessSessionAge,
  type OpportunityAssessment,
} from './opportunity'
import {
  readOpportunityShortlist,
  writeOpportunityShortlist,
  type OpportunityShortlistItem,
} from './handoff'

const MAX_COMPARE = 4

function policyChanged(policy: OpportunityPolicy) {
  return (Object.keys(DEFAULT_OPPORTUNITY_POLICY) as (keyof OpportunityPolicy)[]).some(
    (key) => policy[key] !== DEFAULT_OPPORTUNITY_POLICY[key],
  )
}

function StateBadge({ assessment }: { assessment: OpportunityAssessment }) {
  const tone = assessment.positiveEdge
    ? 'border-term-green text-term-green'
    : assessment.decisionReady
      ? 'border-term-amber text-term-amber'
      : 'border-term-yellow text-term-yellow'
  return <span className={`border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${tone}`}>{assessment.state}</span>
}

function PolicyField({
  label,
  value,
  onChange,
  suffix,
  step = 0.1,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  suffix: string
  step?: number
  min?: number
  max?: number
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">{label}</span>
      <div className="mt-1 flex border border-term-line bg-term-bg focus-within:border-term-amber">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const parsed = Number(event.target.value)
            if (Number.isFinite(parsed)) onChange(parsed)
          }}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums outline-none sm:text-sm"
        />
        <span className="py-2 pr-3 text-xs text-term-dim">{suffix}</span>
      </div>
    </label>
  )
}

function OpportunityRow({
  assessment,
  theme,
  expanded,
  onToggleExpanded,
  compareSelected,
  compareDisabled,
  onToggleCompare,
  shortlisted,
  onToggleShortlist,
  policy,
}: {
  assessment: OpportunityAssessment
  theme: string
  expanded: boolean
  onToggleExpanded: () => void
  compareSelected: boolean
  compareDisabled: boolean
  onToggleCompare: () => void
  shortlisted: boolean
  onToggleShortlist: () => void
  policy: OpportunityPolicy
}) {
  const bear = assessment.scenarios.find((scenario) => scenario.key === 'bear')
  return (
    <article className="border border-term-line bg-term-panel">
      <div className="p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-term-amber">{assessment.model.ticker}</span>
              <span className="text-xs text-term-text">{assessment.model.company}</span>
              <StateBadge assessment={assessment} />
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-term-cyan">{theme}</p>
          </div>
          <label className={`flex min-h-8 items-center gap-2 border border-term-line px-2 text-[10px] uppercase tracking-wider ${compareDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-term-cyan'}`}>
            <input type="checkbox" checked={compareSelected} disabled={compareDisabled} onChange={onToggleCompare} className="accent-term-cyan" /> Compare
          </label>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] sm:grid-cols-3 lg:grid-cols-6">
          <div><dt className="text-[9px] uppercase tracking-wider text-term-dim">Current</dt><dd className="mt-1 tabular-nums">{money(assessment.quote?.priceLocal, assessment.model.currency)}</dd></div>
          <div><dt className="text-[9px] uppercase tracking-wider text-term-dim">Expected value</dt><dd className="mt-1 tabular-nums">{money(assessment.expectedTerminalValue, assessment.model.currency)}</dd></div>
          <div><dt className="text-[9px] uppercase tracking-wider text-term-dim">Annual return</dt><dd className="mt-1 tabular-nums">{pct(assessment.annualisedExpectedTerminalWealthReturnPct)}</dd></div>
          <div><dt className="text-[9px] uppercase tracking-wider text-term-dim">Hurdle edge</dt><dd className={`mt-1 tabular-nums ${assessment.positiveEdge ? 'text-term-green' : 'text-term-red'}`}>{signedPp(assessment.hurdleEdgePct)}</dd></div>
          <div><dt className="text-[9px] uppercase tracking-wider text-term-dim">Max entry</dt><dd className="mt-1 tabular-nums text-term-amber">{money(assessment.maxEntryPrice, assessment.model.currency)}</dd></div>
          <div><dt className="text-[9px] uppercase tracking-wider text-term-dim">Bear case</dt><dd className="mt-1 tabular-nums text-term-red">{signedPct(bear?.netTotalReturnPct)}</dd></div>
        </dl>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-term-line pt-3">
          <p className="text-[10px] text-term-dim">Quote {assessment.quote?.asOf ?? 'missing'} · research {assessment.model.reviewedAt} · model {assessment.model.version}</p>
          <button type="button" onClick={onToggleExpanded} aria-expanded={expanded} className="min-h-8 border border-term-cyan px-3 text-[10px] uppercase tracking-wider text-term-cyan hover:bg-term-cyan hover:text-black">{expanded ? 'Hide analysis' : 'Inspect analysis'}</button>
        </div>
      </div>
      {expanded && <OpportunityDetail assessment={assessment} policy={policy} shortlisted={shortlisted} onToggleShortlist={onToggleShortlist} />}
    </article>
  )
}

export function OpportunitiesPanel() {
  const market = useMarketSnapshot()
  const [policy, setPolicy] = useState<OpportunityPolicy>({ ...DEFAULT_OPPORTUNITY_POLICY })
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [compare, setCompare] = useState<Set<string>>(new Set())
  const [shortlist, setShortlist] = useState<Set<string>>(
    () => new Set(readOpportunityShortlist().map((item) => item.ticker)),
  )
  const today = new Date().toISOString().slice(0, 10)

  const positionsByTicker = useMemo(
    () => new Map(positions.map((position) => [position.ticker, position])),
    [],
  )
  const themeByTicker = useMemo(
    () => Object.fromEntries(positions.map((position) => [position.ticker, position.sections.filter((section) => section !== 'crypto').join(' · ')])),
    [],
  )
  const assessments = useMemo(
    () => equityOpportunityModels.map((model) => {
      const position = positionsByTicker.get(model.ticker)
      return assessOpportunity(
        model,
        market.snapshot?.quotes[model.ticker],
        policy,
        Boolean(position && isDirectlyTradable(position)),
        today,
      )
    }),
    [market.snapshot, policy, positionsByTicker, today],
  )
  const assessmentByTicker = useMemo(
    () => new Map(assessments.map((assessment) => [assessment.model.ticker, assessment])),
    [assessments],
  )
  const qualified = useMemo(
    () => assessments.filter((assessment) => assessment.decisionReady && assessment.positiveEdge).sort((a, b) => (b.hurdleEdgePct ?? -Infinity) - (a.hurdleEdgePct ?? -Infinity)),
    [assessments],
  )
  const watch = useMemo(
    () => assessments.filter((assessment) => assessment.decisionReady && !assessment.positiveEdge).sort((a, b) => (a.neededPullbackPct ?? Infinity) - (b.neededPullbackPct ?? Infinity)),
    [assessments],
  )
  const blocked = assessments.filter((assessment) => !assessment.decisionReady)
  const researchCurrent = assessments.filter((assessment) => !assessment.blockers.some((blocker) => blocker.code === 'model' || blocker.code === 'research-stale')).length
  const quotesCurrent = assessments.filter((assessment) => !assessment.blockers.some((blocker) => blocker.code.startsWith('market'))).length
  const fxAge = market.snapshot ? businessSessionAge(market.snapshot.fx.asOf, today) : Infinity
  const fxCurrent = fxAge <= policy.maxQuoteBusinessSessions
  const alteredPolicy = policyChanged(policy)
  const readyForMonday = !market.loading && quotesCurrent === assessments.length && researchCurrent === assessments.length

  const equityLongs = useMemo(
    () => positions.filter((position) => !position.sections.includes('crypto') && position.stance === 'long').sort((a, b) => a.ticker.localeCompare(b.ticker)),
    [],
  )
  const coverageRows: CoverageRow[] = equityLongs.map((position) => ({
    ticker: position.ticker,
    company: position.name,
    themes: position.sections.join(' · '),
    tradable: isDirectlyTradable(position),
    quoteAsOf: market.snapshot?.quotes[position.ticker]?.asOf,
    assessment: assessmentByTicker.get(position.ticker),
  }))

  const toggleExpanded = (ticker: string) => setExpanded((current) => {
    const next = new Set(current)
    if (next.has(ticker)) next.delete(ticker)
    else next.add(ticker)
    return next
  })
  const toggleCompare = (ticker: string) => setCompare((current) => {
    const next = new Set(current)
    if (next.has(ticker)) next.delete(ticker)
    else if (next.size < MAX_COMPARE) next.add(ticker)
    return next
  })
  const toggleShortlist = (ticker: string) => setShortlist((current) => {
    const next = new Set(current)
    if (next.has(ticker)) next.delete(ticker)
    else next.add(ticker)
    const items = equityOpportunityModels
      .filter((model) => next.has(model.ticker))
      .map((model): OpportunityShortlistItem => ({ ticker: model.ticker, company: model.company, modelVersion: model.version, reviewedAt: model.reviewedAt }))
    writeOpportunityShortlist(items)
    return next
  })
  const goToPlan = () => {
    const items = equityOpportunityModels
      .filter((model) => shortlist.has(model.ticker))
      .map((model): OpportunityShortlistItem => ({ ticker: model.ticker, company: model.company, modelVersion: model.version, reviewedAt: model.reviewedAt }))
    writeOpportunityShortlist(items)
    window.location.hash = 'equities/allocator'
  }

  const renderList = (rows: OpportunityAssessment[], empty: string) => rows.length === 0
    ? <div className="border border-term-line bg-term-panel p-4 text-xs leading-relaxed text-term-dim">{empty}</div>
    : <div className="space-y-3">{rows.map((assessment) => {
        const ticker = assessment.model.ticker
        return <OpportunityRow
          key={ticker}
          assessment={assessment}
          theme={themeByTicker[ticker] || 'theme not mapped'}
          expanded={expanded.has(ticker)}
          onToggleExpanded={() => toggleExpanded(ticker)}
          compareSelected={compare.has(ticker)}
          compareDisabled={!compare.has(ticker) && compare.size >= MAX_COMPARE}
          onToggleCompare={() => toggleCompare(ticker)}
          shortlisted={shortlist.has(ticker)}
          onToggleShortlist={() => toggleShortlist(ticker)}
          policy={policy}
        />
      })}</div>

  return (
    <Section
      title="Equity opportunities"
      description="Price-aware decision support over authored equity scenarios. Security valuation is ranked only after research, market freshness and tradability pass. Portfolio sizing remains in Plan; this page never submits or authorises a trade."
    >
      <div className={`border p-4 ${readyForMonday ? 'border-term-green' : 'border-term-yellow'}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`text-[10px] uppercase tracking-[0.2em] ${readyForMonday ? 'text-term-green' : 'text-term-yellow'}`}>{market.loading ? 'Loading decision inputs' : readyForMonday ? 'Ready for Monday review' : 'Partial coverage · read blockers'}</p>
            <p className="mt-2 text-xl font-bold sm:text-2xl">{qualified.length} of {assessments.length} modelled equities clear the active hurdle.</p>
          </div>
          {alteredPolicy && <span className="border border-term-magenta px-2 py-1 text-[10px] uppercase tracking-wider text-term-magenta">My what-if · canonical research unchanged</span>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-px border border-term-line bg-term-line sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['Quotes current', `${quotesCurrent}/${assessments.length}`],
            ['FX', market.snapshot ? `${market.snapshot.fx.asOf} · ${fxCurrent ? 'current' : 'stale'}` : 'missing'],
            ['Research current', `${researchCurrent}/${assessments.length}`],
            ['Decision-ready', `${assessments.length - blocked.length}`],
            ['Watch below', `${watch.length}`],
            ['Universe modelled', `${assessments.length}/${equityLongs.length}`],
          ].map(([label, value]) => <div key={label} className="bg-term-panel p-3"><dt className="text-[9px] uppercase tracking-wider text-term-dim">{label}</dt><dd className="mt-1 text-xs tabular-nums">{value}</dd></div>)}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-term-dim">Market snapshot {market.snapshot?.fetchedAt ?? 'not loaded'} · {market.source}. Benchmark return and active premium are declared policy inputs, not live market facts. History starts with the first generated 2026-08-21 snapshot; no earlier comparison is claimed.</p>
      </div>

      <div className="mt-4">
        <Panel title={alteredPolicy ? 'Local policy · My what-if' : 'Declared opportunity policy · default research case'}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PolicyField label="Benchmark return" value={policy.benchmarkAnnualReturnPct} onChange={(value) => setPolicy((current) => ({ ...current, benchmarkAnnualReturnPct: value }))} suffix="% p.a." min={-20} max={30} />
            <PolicyField label="Required active premium" value={policy.requiredActivePremiumPct} onChange={(value) => setPolicy((current) => ({ ...current, requiredActivePremiumPct: value }))} suffix="pp" min={0} max={30} />
            <PolicyField label="Entry cost" value={policy.buyCostPct} onChange={(value) => setPolicy((current) => ({ ...current, buyCostPct: value }))} suffix="%" min={0} max={10} />
            <PolicyField label="Exit cost" value={policy.sellCostPct} onChange={(value) => setPolicy((current) => ({ ...current, sellCostPct: value }))} suffix="%" min={0} max={10} />
            <PolicyField label="Near-hurdle pullback" value={policy.nearHurdlePullbackPct} onChange={(value) => setPolicy((current) => ({ ...current, nearHurdlePullbackPct: value }))} suffix="%" min={0} max={50} />
            <PolicyField label="Max quote age" value={policy.maxQuoteBusinessSessions} onChange={(value) => setPolicy((current) => ({ ...current, maxQuoteBusinessSessions: Math.max(0, Math.round(value)) }))} suffix="sessions" step={1} min={0} max={5} />
            <PolicyField label="Max fundamental age" value={policy.maxFundamentalAgeDays} onChange={(value) => setPolicy((current) => ({ ...current, maxFundamentalAgeDays: Math.max(1, Math.round(value)) }))} suffix="days" step={1} min={1} max={365} />
            <button type="button" disabled={!alteredPolicy} onClick={() => setPolicy({ ...DEFAULT_OPPORTUNITY_POLICY })} className="self-end border border-term-magenta px-3 py-2 text-xs uppercase tracking-wider text-term-magenta enabled:hover:bg-term-magenta enabled:hover:text-black disabled:cursor-not-allowed disabled:opacity-30">Reset what-if</button>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-term-dim">Edits reprice this browser view immediately. They do not modify the authored terminal assumptions or persist as canonical research.</p>
        </Panel>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-term-green">Qualified now</h3><span className="text-[10px] text-term-dim">Sorted by scenario-implied annual hurdle edge · {compare.size}/{MAX_COMPARE} compared</span></div>
        {renderList(qualified, 'No decision-ready stock currently clears the declared hurdle. That is a valid result; the broad baseline or cash remains available in Plan.')}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-term-amber">Watch below</h3><span className="text-[10px] text-term-dim">Only complete, fresh models · nearest threshold first</span></div>
        {renderList(watch, 'No complete model sits below the hurdle under this policy. Blocked names remain in the coverage matrix, never promoted into this watchlist.')}
      </div>

      {compare.size > 0 && <div className="mt-4"><OpportunityComparison assessments={[...compare].map((ticker) => assessmentByTicker.get(ticker)).filter((assessment): assessment is OpportunityAssessment => Boolean(assessment))} themeByTicker={themeByTicker} onRemove={(ticker) => toggleCompare(ticker)} /></div>}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]">
        <Panel title={`Plan shortlist · ${shortlist.size} selected`}>
          {shortlist.size === 0 ? <p className="text-xs text-term-dim">Inspect a decision-ready opportunity before shortlisting it. A shortlist is not an allocation.</p> : <div className="flex flex-wrap gap-2">{[...shortlist].map((ticker) => <button key={ticker} type="button" onClick={() => toggleShortlist(ticker)} className="border border-term-amber px-2 py-1 text-xs text-term-amber hover:bg-term-amber hover:text-black" title={`Remove ${ticker}`}>{ticker} ×</button>)}</div>}
          <p className="mt-3 text-[10px] leading-relaxed text-term-dim">Plan will show this research shortlist for review. Individual stocks stay disabled, the active sleeve stays at 0%, and all personal, benchmark, evidence and execution gates still apply.</p>
        </Panel>
        <Panel title="Portfolio handoff">
          <button type="button" disabled={shortlist.size === 0} onClick={goToPlan} className="w-full border border-term-cyan px-3 py-2 text-xs uppercase tracking-wider text-term-cyan enabled:hover:bg-term-cyan enabled:hover:text-black disabled:cursor-not-allowed disabled:opacity-30">Review shortlist in Plan →</button>
          <p className="mt-3 text-[10px] leading-relaxed text-term-dim">No holding state is inferred. Portfolio effects remain hypothetical until the owner enters trustworthy personal inputs.</p>
        </Panel>
      </div>

      <div className="mt-4"><CoverageMatrix rows={coverageRows} /></div>
    </Section>
  )
}
