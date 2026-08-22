import { useMemo, useState } from 'react'
import { Panel } from '../../components/Panel'
import { Section } from '../../components/Section'
import { equityOpportunityModels } from '../../data/equity-opportunities'
import { useMarketSnapshot } from '../../data/market-data'
import { positions } from '../../data/positions'
import { isDirectlyTradable } from '../allocator/allocation'
import { CoverageMatrix, type CoverageRow } from './CoverageMatrix'
import { EquityChartAtlas } from './EquityChartAtlas'
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
import {
  DEFAULT_UNIVERSE_SCREEN_POLICY,
  EQUITY_SCREEN_THEMES,
  screenUniversePosition,
  type EquityScreenTheme,
  type UniverseScreenResult,
  type UniverseScreenPolicy,
} from './universe-screen'

const MAX_COMPARE = 4

function policyChanged(policy: OpportunityPolicy) {
  return (Object.keys(DEFAULT_OPPORTUNITY_POLICY) as (keyof OpportunityPolicy)[]).some(
    (key) => policy[key] !== DEFAULT_OPPORTUNITY_POLICY[key],
  )
}

function screenPolicyChanged(policy: UniverseScreenPolicy) {
  return (Object.keys(DEFAULT_UNIVERSE_SCREEN_POLICY) as (keyof UniverseScreenPolicy)[]).some(
    (key) => policy[key] !== DEFAULT_UNIVERSE_SCREEN_POLICY[key],
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
  impact,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  suffix: string
  step?: number
  min?: number
  max?: number
  impact: 'UNIVERSE FILTER' | 'QUALIFICATION' | 'EVIDENCE GATE' | 'OPPORTUNITY PRIORITY' | 'WATCH LABEL ONLY'
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
      <span className="mt-1 block text-[9px] uppercase tracking-wider text-term-cyan">{impact}</span>
    </label>
  )
}

function ThemeField({ value, onChange }: { value: EquityScreenTheme; onChange: (value: EquityScreenTheme) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.16em] text-term-dim">Theme</span>
      <select value={value} onChange={(event) => onChange(event.target.value as EquityScreenTheme)} className="mt-1 w-full border border-term-line bg-term-bg px-3 py-2 text-base uppercase outline-none focus:border-term-amber sm:text-sm">
        {EQUITY_SCREEN_THEMES.map((theme) => <option key={theme} value={theme}>{theme}</option>)}
      </select>
      <span className="mt-1 block text-[9px] uppercase tracking-wider text-term-cyan">UNIVERSE FILTER</span>
    </label>
  )
}

function TrendGateField({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="block border border-term-line bg-term-bg px-3 py-2">
      <span className="flex min-h-8 items-center gap-3 text-xs">
        <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-term-cyan" />
        Require price above 200MA
      </span>
      <span className="mt-1 block text-[9px] uppercase tracking-wider text-term-cyan">PRIMARY TECHNICAL GATE</span>
    </label>
  )
}

function TrendSetupBadge({ screen, qualifies }: { screen: UniverseScreenResult; qualifies: boolean }) {
  if (screen.ma200OpportunityState === 'entry-zone' && qualifies) return <span className="border border-term-green px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-term-green">200MA entry setup</span>
  if (screen.ma200OpportunityState === 'entry-zone') return <span className="border border-term-yellow px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-term-yellow">Near 200MA · valuation fails</span>
  if (screen.ma200OpportunityState === 'extended') return <span className="border border-term-amber px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-term-amber">Extended above 200MA</span>
  if (screen.ma200OpportunityState === 'below') return <span className="border border-term-red px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-term-red">Below 200MA</span>
  return <span className="border border-term-dim px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-term-dim">200MA unavailable</span>
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
  screen,
  chart,
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
  screen: UniverseScreenResult
  chart?: import('../../data/market-data').EquityChartSeries
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
              <TrendSetupBadge screen={screen} qualifies={assessment.decisionReady && assessment.positiveEdge} />
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-term-cyan">{theme}</p>
          </div>
          <label className={`flex min-h-8 items-center gap-2 border border-term-line px-2 text-[10px] uppercase tracking-wider ${compareDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-term-cyan'}`}>
            <input type="checkbox" checked={compareSelected} disabled={compareDisabled} onChange={onToggleCompare} className="accent-term-cyan" /> Compare
          </label>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] sm:grid-cols-4 lg:grid-cols-7">
          <div><dt className="text-[9px] uppercase tracking-wider text-term-dim">Current</dt><dd className="mt-1 tabular-nums">{money(assessment.quote?.priceLocal, assessment.model.currency)}</dd></div>
          <div><dt className="text-[9px] uppercase tracking-wider text-term-dim">200MA entry</dt><dd className={`mt-1 tabular-nums ${screen.ma200OpportunityState === 'entry-zone' && assessment.decisionReady && assessment.positiveEdge ? 'text-term-green' : screen.ma200OpportunityState === 'extended' ? 'text-term-amber' : 'text-term-yellow'}`}>{money(assessment.quote?.trend200?.ma200, assessment.model.currency)}<span className="block text-[9px]">{signedPct(assessment.quote?.trend200?.distancePct)} · {screen.ma200OpportunityState === 'entry-zone' ? assessment.decisionReady && assessment.positiveEdge ? 'SETUP' : 'NEAR · NOT QUALIFIED' : screen.ma200OpportunityState.toUpperCase()}</span></dd></div>
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
      {expanded && <OpportunityDetail assessment={assessment} policy={policy} screen={screen} shortlisted={shortlisted} onToggleShortlist={onToggleShortlist} chart={chart} />}
    </article>
  )
}

export function OpportunitiesPanel() {
  const market = useMarketSnapshot()
  const [policy, setPolicy] = useState<OpportunityPolicy>({ ...DEFAULT_OPPORTUNITY_POLICY })
  const [screenPolicy, setScreenPolicy] = useState<UniverseScreenPolicy>({ ...DEFAULT_UNIVERSE_SCREEN_POLICY })
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
  const equityLongs = useMemo(
    () => positions.filter((position) => !position.sections.includes('crypto') && position.stance === 'long').sort((a, b) => a.ticker.localeCompare(b.ticker)),
    [],
  )
  const screenResults = useMemo(
    () => equityLongs.map((position) => screenUniversePosition(
      position,
      market.snapshot?.quotes[position.ticker],
      isDirectlyTradable(position),
      screenPolicy,
      policy.maxQuoteBusinessSessions,
      today,
    )),
    [equityLongs, market.snapshot, policy.maxQuoteBusinessSessions, screenPolicy, today],
  )
  const screenByTicker = useMemo(
    () => new Map(screenResults.map((result) => [result.ticker, result])),
    [screenResults],
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
    () => assessments
      .filter((assessment) => screenByTicker.get(assessment.model.ticker)?.passes && assessment.decisionReady && assessment.positiveEdge)
      .sort((a, b) => {
        const aScreen = screenByTicker.get(a.model.ticker)
        const bScreen = screenByTicker.get(b.model.ticker)
        const aNear = aScreen?.ma200OpportunityState === 'entry-zone'
        const bNear = bScreen?.ma200OpportunityState === 'entry-zone'
        if (aNear !== bNear) return aNear ? -1 : 1
        if (aNear && bNear) {
          const distance = (aScreen?.distanceFromMa200Pct ?? Infinity) - (bScreen?.distanceFromMa200Pct ?? Infinity)
          if (distance !== 0) return distance
        }
        return (b.hurdleEdgePct ?? -Infinity) - (a.hurdleEdgePct ?? -Infinity)
      }),
    [assessments, screenByTicker],
  )
  const ma200EntrySetups = qualified.filter((assessment) => screenByTicker.get(assessment.model.ticker)?.ma200OpportunityState === 'entry-zone')
  const extendedQualified = qualified.filter((assessment) => screenByTicker.get(assessment.model.ticker)?.ma200OpportunityState !== 'entry-zone')
  const watch = useMemo(
    () => assessments.filter((assessment) => screenByTicker.get(assessment.model.ticker)?.passes && assessment.decisionReady && !assessment.positiveEdge).sort((a, b) => (a.neededPullbackPct ?? Infinity) - (b.neededPullbackPct ?? Infinity)),
    [assessments, screenByTicker],
  )
  const researchCurrent = assessments.filter((assessment) => !assessment.blockers.some((blocker) => blocker.code === 'model' || blocker.code === 'research-stale')).length
  const universeQuotesCurrent = screenResults.filter((result) => !result.blockers.some((blocker) => blocker.code === 'market-missing' || blocker.code === 'market-stale')).length
  const fxAge = market.snapshot ? businessSessionAge(market.snapshot.fx.asOf, today) : Infinity
  const fxCurrent = fxAge <= policy.maxQuoteBusinessSessions
  const alteredPolicy = policyChanged(policy) || screenPolicyChanged(screenPolicy)
  const screenSurvivors = screenResults.filter((result) => result.passes)
  const screenEligibleModels = assessments.filter((assessment) => screenByTicker.get(assessment.model.ticker)?.passes)
  const withMa200 = screenResults.filter((result) => result.ma200 !== undefined).length
  const aboveMa200 = screenResults.filter((result) => result.aboveMa200).length
  const nearAboveMa200 = screenResults.filter((result) => result.ma200OpportunityState === 'entry-zone').length
  const readyForMonday = !market.loading && assessments.length > 0 && researchCurrent === assessments.length && screenResults.length === equityLongs.length && universeQuotesCurrent === equityLongs.length

  const coverageRows: CoverageRow[] = equityLongs.map((position) => ({
    ticker: position.ticker,
    company: position.name,
    themes: position.sections.join(' · '),
    tradable: isDirectlyTradable(position),
    quoteAsOf: market.snapshot?.quotes[position.ticker]?.asOf,
    screen: screenByTicker.get(position.ticker)!,
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
          screen={screenByTicker.get(ticker)!}
          chart={market.snapshot?.equityCharts?.[ticker]}
        />
      })}</div>

  return (
    <Section
      title="Equity opportunities"
      description="The 200-session moving average is the primary technical gate and entry-timing signal. Qualified equities just above it are shown first; authored valuation must still clear the return hurdle. Portfolio sizing remains in Plan; this page never submits or authorises a trade."
    >
      <div className={`border p-4 ${readyForMonday ? 'border-term-green' : 'border-term-yellow'}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`text-[10px] uppercase tracking-[0.2em] ${readyForMonday ? 'text-term-green' : 'text-term-yellow'}`}>{market.loading ? 'Loading decision inputs' : readyForMonday ? 'Ready for Monday review' : 'Partial coverage · read blockers'}</p>
            <p className="mt-2 text-xl font-bold sm:text-2xl">{qualified.length} qualified after scanning {equityLongs.length} equities.</p>
          </div>
          {alteredPolicy && <div className="flex flex-wrap items-center gap-2"><span className="border border-term-magenta px-2 py-1 text-[10px] uppercase tracking-wider text-term-magenta">My what-if · canonical research unchanged</span><button type="button" onClick={() => { setPolicy({ ...DEFAULT_OPPORTUNITY_POLICY }); setScreenPolicy({ ...DEFAULT_UNIVERSE_SCREEN_POLICY }) }} className="border border-term-magenta px-2 py-1 text-[10px] uppercase tracking-wider text-term-magenta hover:bg-term-magenta hover:text-black">Reset all</button></div>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-px border border-term-line bg-term-line sm:grid-cols-4 lg:grid-cols-8">
          {[
            ['Universe scanned', `${screenResults.length}/${equityLongs.length}`],
            ['With 200MA', `${withMa200}/${equityLongs.length}`],
            ['Above 200MA', `${aboveMa200}`],
            [`Near above 200MA (≤${screenPolicy.maxMa200OpportunityDistancePct}%)`, `${nearAboveMa200}`],
            ['Pass stage 1', `${screenSurvivors.length}`],
            ['Quotes current', `${universeQuotesCurrent}/${equityLongs.length}`],
            ['Models screen-eligible', `${screenEligibleModels.length}`],
            ['Qualified', `${qualified.length}`],
          ].map(([label, value]) => <div key={label} className="bg-term-panel p-3"><dt className="text-[9px] uppercase tracking-wider text-term-dim">{label}</dt><dd className="mt-1 text-xs tabular-nums">{value}</dd></div>)}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-term-dim">Market snapshot {market.snapshot?.fetchedAt ?? 'not loaded'} · {market.source} · FX {market.snapshot ? `${market.snapshot.fx.asOf} (${fxCurrent ? 'current' : 'stale'})` : 'missing'}. Stage one requires the trend to be above 200MA. Stage two applies authored valuation. Among equities that clear both, a close from 0% through {screenPolicy.maxMa200OpportunityDistancePct.toFixed(1)}% above 200MA is the preferred entry zone and ranks first. This technical label does not change terminal value or hurdle edge.</p>
      </div>

      <div className="mt-4">
        <Panel title={`1 · Whole-universe screen · ${screenSurvivors.length}/${equityLongs.length} pass`}>
          <p className="mb-3 text-[11px] leading-relaxed text-term-dim">These filters rerun over all {equityLongs.length} researched equity longs. They are eligibility rules, not a valuation score. Missing market fields fail closed.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ThemeField value={screenPolicy.theme} onChange={(theme) => setScreenPolicy((current) => ({ ...current, theme }))} />
            <TrendGateField value={screenPolicy.requireAbove200DayMa} onChange={(requireAbove200DayMa) => setScreenPolicy((current) => ({ ...current, requireAbove200DayMa }))} />
            <PolicyField label="200MA entry-zone ceiling" value={screenPolicy.maxMa200OpportunityDistancePct} onChange={(value) => setScreenPolicy((current) => ({ ...current, maxMa200OpportunityDistancePct: Math.min(100, Math.max(0, value)) }))} suffix="% above" min={0} max={100} impact="OPPORTUNITY PRIORITY" />
            <PolicyField label="Minimum market cap" value={screenPolicy.minMarketCapUsdBn} onChange={(value) => setScreenPolicy((current) => ({ ...current, minMarketCapUsdBn: Math.max(0, value) }))} suffix="USD bn" min={0} max={1000} impact="UNIVERSE FILTER" />
            <PolicyField label="Maximum 1Y volatility" value={screenPolicy.maxRealisedVolPct} onChange={(value) => setScreenPolicy((current) => ({ ...current, maxRealisedVolPct: Math.min(300, Math.max(0, value)) }))} suffix="%" min={0} max={300} impact="UNIVERSE FILTER" />
            <PolicyField label="Maximum 1Y drawdown" value={screenPolicy.maxDrawdownMagnitudePct} onChange={(value) => setScreenPolicy((current) => ({ ...current, maxDrawdownMagnitudePct: Math.min(100, Math.max(0, value)) }))} suffix="%" min={0} max={100} impact="UNIVERSE FILTER" />
            <PolicyField label="Minimum 3M return" value={screenPolicy.minThreeMonthReturnPct} onChange={(value) => setScreenPolicy((current) => ({ ...current, minThreeMonthReturnPct: Math.min(300, Math.max(-100, value)) }))} suffix="%" min={-100} max={300} impact="UNIVERSE FILTER" />
            <PolicyField label="Maximum quote age" value={policy.maxQuoteBusinessSessions} onChange={(value) => setPolicy((current) => ({ ...current, maxQuoteBusinessSessions: Math.max(0, Math.round(value)) }))} suffix="sessions" step={1} min={0} max={5} impact="UNIVERSE FILTER" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="border border-term-line bg-term-bg p-3"><p className="text-[10px] uppercase tracking-wider text-term-cyan">Passed screen · valuation present</p><p className="mt-2 text-xs leading-relaxed">{screenEligibleModels.length ? screenEligibleModels.map((assessment) => assessment.model.ticker).join(' · ') : 'None'}</p></div>
            <div className="border border-term-green/60 bg-term-bg p-3"><p className="text-[10px] uppercase tracking-wider text-term-green">Coverage invariant</p><p className="mt-2 text-xs">{assessments.length}/{equityLongs.length} equity longs have exactly one versioned model.</p><p className="mt-2 text-[10px] leading-relaxed text-term-dim">Restricted routes remain modelled but cannot qualify. Adding a long without a model now fails verification.</p></div>
          </div>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title={`2 · Valuation policy · ${screenEligibleModels.length}/${assessments.length} models pass stage 1`}>
          <p className="mb-3 text-[11px] leading-relaxed text-term-dim">Only these controls determine whether a screen-eligible model clears the return hurdle. The watch band changes a label only. Scenario assumptions remain frozen.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PolicyField label="Benchmark return" value={policy.benchmarkAnnualReturnPct} onChange={(value) => setPolicy((current) => ({ ...current, benchmarkAnnualReturnPct: value }))} suffix="% p.a." min={-20} max={30} impact="QUALIFICATION" />
            <PolicyField label="Required active premium" value={policy.requiredActivePremiumPct} onChange={(value) => setPolicy((current) => ({ ...current, requiredActivePremiumPct: value }))} suffix="pp" min={0} max={30} impact="QUALIFICATION" />
            <PolicyField label="Entry cost" value={policy.buyCostPct} onChange={(value) => setPolicy((current) => ({ ...current, buyCostPct: value }))} suffix="%" min={0} max={10} impact="QUALIFICATION" />
            <PolicyField label="Exit cost" value={policy.sellCostPct} onChange={(value) => setPolicy((current) => ({ ...current, sellCostPct: value }))} suffix="%" min={0} max={10} impact="QUALIFICATION" />
            <PolicyField label="Maximum fundamental age" value={policy.maxFundamentalAgeDays} onChange={(value) => setPolicy((current) => ({ ...current, maxFundamentalAgeDays: Math.max(1, Math.round(value)) }))} suffix="days" step={1} min={1} max={365} impact="EVIDENCE GATE" />
            <PolicyField label="Near-hurdle pullback" value={policy.nearHurdlePullbackPct} onChange={(value) => setPolicy((current) => ({ ...current, nearHurdlePullbackPct: value }))} suffix="%" min={0} max={50} impact="WATCH LABEL ONLY" />
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-term-dim">Edits recalculate this browser view immediately. They do not modify or persist the canonical research.</p>
        </Panel>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-term-green">200MA entry setups · {ma200EntrySetups.length} of {qualified.length} qualified</h3><span className="text-[10px] text-term-dim">0%–{screenPolicy.maxMa200OpportunityDistancePct.toFixed(1)}% above 200MA · nearest line first · hurdle edge breaks ties · {compare.size}/{MAX_COMPARE} compared</span></div>
        {renderList(ma200EntrySetups, 'No screen-eligible, decision-ready model is both above and inside the selected 200MA entry zone while clearing the declared return hurdle.')}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-term-amber">Qualified but extended · {extendedQualified.length}</h3><span className="text-[10px] text-term-dim">Clears valuation hurdle · outside the preferred 200MA entry zone · sorted by hurdle edge</span></div>
        {renderList(extendedQualified, 'Every qualified equity is currently inside the selected 200MA entry zone.')}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-term-amber">Watch below</h3><span className="text-[10px] text-term-dim">Only screen-eligible, complete and fresh models · nearest threshold first</span></div>
        {renderList(watch, 'No complete model sits below the hurdle under this policy. Blocked names remain in the coverage matrix, never promoted into this watchlist.')}
      </div>

      {compare.size > 0 && <div className="mt-4"><OpportunityComparison assessments={[...compare].map((ticker) => assessmentByTicker.get(ticker)).filter((assessment): assessment is OpportunityAssessment => Boolean(assessment))} themeByTicker={themeByTicker} ma200OpportunityDistancePct={screenPolicy.maxMa200OpportunityDistancePct} onRemove={(ticker) => toggleCompare(ticker)} /></div>}

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
      <div className="mt-4"><EquityChartAtlas positions={positions.filter((position) => !position.sections.includes('crypto'))} snapshot={market.snapshot} /></div>
    </Section>
  )
}
