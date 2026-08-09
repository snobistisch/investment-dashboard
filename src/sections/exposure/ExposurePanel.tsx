import { Section } from '../../components/Section'
import { Panel, Bar } from '../../components/Panel'
import { FACTOR_LABELS, JULY_2026_DRAWDOWN } from '../../data/positions'
import type { Factor, Position } from '../../data/positions'
import {
  activeBook,
  capCoverage,
  chainBreakdown,
  citriniOnly,
  crossSectionOverlap,
  drawdownIllustration,
  factorBreakdown,
  hiddenFactorOverlap,
  thematicPositions,
  topByCap,
} from './analysis'

// Market caps are stored in USD billions.
function cap(billions: number | undefined) {
  if (billions === undefined) return '—'
  if (billions >= 1000) return `$${(billions / 1000).toFixed(2)}tn`
  if (billions >= 1) return `$${billions.toFixed(1)}bn`
  return `$${Math.round(billions * 1000)}m`
}

function pct(share: number, digits = 0) {
  return `${(share * 100).toFixed(digits)}%`
}

const factorColor: Record<Factor, string> = {
  'ai-capex': 'text-term-amber',
  'ai-adoption': 'text-term-cyan',
  'risk-appetite': 'text-term-magenta',
  'gov-capital': 'text-term-green',
  'biotech-idio': 'text-term-yellow',
  'industrial-cycle': 'text-term-text',
  'rates-macro': 'text-term-dim',
}

export function ExposurePanel() {
  const bookRows = factorBreakdown(activeBook)
  const allRows = factorBreakdown(thematicPositions)
  const top = bookRows[0]
  const topAll = allRows.find((r) => r.factor === top.factor) ?? allRows[0]

  const bookCoverage = capCoverage(activeBook)
  const allCoverage = capCoverage(thematicPositions)

  const topFactorNames = activeBook.filter((p) => p.factors[0] === top.factor)
  const heaviest = topByCap(topFactorNames, 3)

  const overlap = crossSectionOverlap()
  const hidden = hiddenFactorOverlap(activeBook)
  // Chain layer is computed over the FULL thematic set, not the active book:
  // every demand-setter (NVDA, the hyperscalers, TSLA) is a context name, so
  // excluding them would render the demand-setter row as zero and hide the
  // thing this panel exists to show.
  const chain = chainBreakdown(thematicPositions)

  const sox = JULY_2026_DRAWDOWN.facts[0].value // −28.6%
  const illustration = drawdownIllustration(top.capShare, sox)

  return (
    <Section
      title="Exposure"
      description="What the seven tabs actually add up to. Every figure on this tab is computed from src/data/positions.ts, which is a transcription of the other sections — no number here was re-derived or refreshed. Read the coverage panel at the bottom before trusting any weighted figure."
    >
      {/* ------------------------------------------------------------------ */}
      {/* The headline. This sentence is the point of the tab.               */}
      {/* ------------------------------------------------------------------ */}
      <div className="border border-term-amber bg-term-panel p-4 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-term-dim">
          Factor concentration · researched book
        </p>
        <p className="mt-3 text-xl leading-snug font-bold text-term-text sm:text-3xl">
          <span className="text-term-amber">
            {top.count} of {activeBook.length}
          </span>{' '}
          researched names share one primary driver —{' '}
          <span className="text-term-amber">{FACTOR_LABELS[top.factor]}</span> —{' '}
          <span className="text-term-amber">{pct(top.capShare)}</span> of the{' '}
          {cap(bookCoverage.capUsd)} of market cap on file.
        </p>
        <p className="mt-4 max-w-4xl text-xs leading-relaxed text-term-dim">
          That is {pct(top.countShare)} of the book by count and {pct(top.capShare)} by market cap.
          Include the {thematicPositions.length - activeBook.length} names each section explicitly
          flags as <em>context, not exposure</em> and it becomes {topAll.count} of{' '}
          {thematicPositions.length} at {pct(topAll.capShare)} of {cap(allCoverage.capUsd)}. Neither
          number is the book&rsquo;s risk: there are no position sizes here, so market cap is a
          proxy for the universe&rsquo;s shape, not for what is owned.
        </p>
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-term-dim">
          The cap-weighted figure is not spread evenly. Three names carry most of it:{' '}
          {heaviest.map((h, i) => (
            <span key={h.position.ticker}>
              {i > 0 ? ', ' : ''}
              <span className="text-term-text">{h.position.ticker}</span> {pct(h.share)}
            </span>
          ))}
          {' '}of the {FACTOR_LABELS[top.factor]} bucket. A concentration that rests on three
          tickers is a different fact from one spread across thirty.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* ---------------------------------------------------------------- */}
        <Panel title="Factor concentration — primary driver only">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-term-line text-[10px] uppercase tracking-[0.15em] text-term-dim">
                <th className="py-1.5 pr-2 font-bold">Driver</th>
                <th className="py-1.5 pr-2 text-right font-bold">N</th>
                <th className="py-1.5 pr-2 text-right font-bold">% N</th>
                <th className="py-1.5 pr-2 text-right font-bold">Mkt cap</th>
                <th className="py-1.5 text-right font-bold">% cap</th>
              </tr>
            </thead>
            <tbody>
              {bookRows.map((row) => (
                <tr key={row.factor} className="border-b border-term-line/60 last:border-b-0">
                  <td className="py-2 pr-2">
                    <span className={`font-bold ${factorColor[row.factor]}`}>
                      {FACTOR_LABELS[row.factor]}
                    </span>
                    <div className="mt-1 w-40 max-w-full">
                      <Bar
                        share={row.capShare}
                        className={
                          row.factor === top.factor ? 'bg-term-amber' : 'bg-term-dim/60'
                        }
                      />
                    </div>
                    {row.missingCap > 0 && (
                      <span className="mt-1 block text-[10px] text-term-dim">
                        {row.missingCap} of {row.count} carry no market cap
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-2 text-right align-top tabular-nums text-term-text">
                    {row.count}
                  </td>
                  <td className="py-2 pr-2 text-right align-top tabular-nums text-term-dim">
                    {pct(row.countShare)}
                  </td>
                  <td className="py-2 pr-2 text-right align-top tabular-nums text-term-text">
                    {cap(row.capUsd)}
                  </td>
                  <td className="py-2 text-right align-top tabular-nums text-term-dim">
                    {pct(row.capShare)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            Bucketed by <span className="text-term-text">factors[0]</span> — what the P&amp;L keys
            off first, not which tab the name sits in. Photonics module makers and Astera Labs are
            both AI-capex; IPGP, LASR, LPTH and 6965 are industrial-cycle, per their own section&rsquo;s
            flag; quantum names are government-capital first, risk-appetite second.
          </p>
        </Panel>

        {/* ---------------------------------------------------------------- */}
        <Panel title="Chain layer — where the economics sit">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-term-line text-[10px] uppercase tracking-[0.15em] text-term-dim">
                <th className="py-1.5 pr-2 font-bold">Layer</th>
                <th className="py-1.5 pr-2 text-right font-bold">N</th>
                <th className="py-1.5 text-right font-bold">Mkt cap</th>
              </tr>
            </thead>
            <tbody>
              {chain.rows.map((row) => (
                <tr key={row.layer} className="border-b border-term-line/60 last:border-b-0">
                  <td className="py-2 pr-2">
                    <span
                      className={
                        row.layer === 'substrate' || row.layer === 'component'
                          ? 'font-bold text-term-green'
                          : 'text-term-text'
                      }
                    >
                      {row.layer}
                    </span>
                    <span className="ml-2 text-[10px] text-term-dim">
                      {row.layer === 'substrate' || row.layer === 'component'
                        ? 'bottleneck'
                        : row.layer === 'module'
                          ? 'volume layer'
                          : 'beta'}
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums text-term-text">{row.count}</td>
                  <td className="py-2 text-right tabular-nums text-term-dim">{cap(row.capUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            Computed across all {thematicPositions.length} thematic names, context ones included —
            every demand-setter is a context name, so excluding them would zero out the row that
            matters most. {chain.unclassified} carry no chain layer at all: the biology, crypto and
            most quantum names sit outside a hardware value chain, so the field is left absent
            rather than forced. The classified split covers {chain.totalClassified} names.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-term-dim">
            <span className="text-term-amber">Read the cap column, not the count.</span> Substrate
            and component are the bottleneck the thesis says to buy; system and demand-setter are
            beta. The bottleneck layers hold the most names, but the cap sits with the
            demand-setters — which is the same concentration the headline reports, seen from the
            other side.
          </p>
        </Panel>
      </div>

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title={`Cross-section overlap — ${overlap.length} tickers in 2+ sections`}>
          {overlap.length === 0 ? (
            <p className="text-xs text-term-dim">None.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-term-line text-[10px] uppercase tracking-[0.15em] text-term-dim">
                  <th className="py-1.5 pr-2 font-bold">Ticker</th>
                  <th className="py-1.5 pr-2 font-bold">Sections</th>
                  <th className="py-1.5 font-bold">Primary driver</th>
                </tr>
              </thead>
              <tbody>
                {overlap.map((row) => (
                  <tr key={row.ticker} className="border-b border-term-line/60 last:border-b-0">
                    <td className="py-2 pr-2 align-top">
                      <span className="font-bold text-term-text">{row.ticker}</span>
                      <span className="mt-0.5 block text-[10px] text-term-dim">{row.name}</span>
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <span className="text-term-cyan">{row.sections.join(' · ')}</span>
                      <span className="ml-1 text-term-dim">×{row.sections.length}</span>
                    </td>
                    <td className={`py-2 align-top font-bold ${factorColor[row.factors[0]]}`}>
                      {FACTOR_LABELS[row.factors[0]]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            <span className="text-term-amber">Ticker overlap is the wrong test on this book.</span>{' '}
            The sections barely share tickers — they share a driver. The panel below is the
            concentration argument in its real form.
          </p>
        </Panel>

        <Panel title="Shared drivers across sections — the overlap ticker-matching misses">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-term-line text-[10px] uppercase tracking-[0.15em] text-term-dim">
                <th className="py-1.5 pr-2 font-bold">Driver</th>
                <th className="py-1.5 font-bold">Sections it spans</th>
              </tr>
            </thead>
            <tbody>
              {hidden.map((row) => (
                <tr key={row.factor} className="border-b border-term-line/60 last:border-b-0">
                  <td className={`py-2 pr-2 align-top font-bold ${factorColor[row.factor]}`}>
                    {FACTOR_LABELS[row.factor]}
                  </td>
                  <td className="py-2 align-top text-term-text">
                    {row.sections.join(' · ')}
                    <span className="ml-1 text-term-dim">×{row.sections.length}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            Seven tabs presented as seven research areas resolve into a much smaller number of
            drivers. The photonics note says so about itself: the thesis is &ldquo;a derivative of
            ~$700bn of hyperscaler spending&rdquo;.
          </p>
        </Panel>
      </div>

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4">
        <Panel title="Drawdown reference — July 2026, historical fact">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <table className="w-full text-left text-xs">
                <tbody>
                  {JULY_2026_DRAWDOWN.facts.map((f) => (
                    <tr key={f.label} className="border-b border-term-line/60 last:border-b-0">
                      <td className="py-2 pr-2 align-top">
                        <span className="font-bold text-term-text">{f.label}</span>
                        <span className="mt-0.5 block text-[10px] leading-relaxed text-term-dim">
                          {f.detail}
                        </span>
                      </td>
                      <td className="py-2 text-right align-top font-bold tabular-nums text-term-red">
                        {f.value.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs leading-relaxed text-term-text">
                {JULY_2026_DRAWDOWN.fundFailure}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-term-text">
                <span className="font-bold text-term-amber">
                  What a repeat would do to this book:
                </span>{' '}
                {pct(top.capShare)} of the market cap on file sits behind one driver. Applying the
                observed SOX move of {sox}% uniformly to that share is{' '}
                <span className="font-bold text-term-red">
                  {illustration.toFixed(1)}%
                </span>{' '}
                at the book level. That is arithmetic, not a forecast — it assumes uniform beta,
                equal weighting and no position sizing, none of which hold.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-term-dim">
                The book is research-only and unlevered, so the ~4x that turned a correct thesis
                into a forced liquidation does not apply here. The correlation that made 4x fatal
                does. What killed that fund was not being wrong — it was being right, concentrated
                and levered through an ordinary correction.
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
                <span className="text-term-yellow">Provenance:</span>{' '}
                {JULY_2026_DRAWDOWN.provenance}
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Coverage — what this tab cannot tell you">
          <ul className="space-y-2 text-[11px] leading-relaxed text-term-dim">
            <li>
              <span className="text-term-yellow">Market-cap coverage is partial.</span>{' '}
              {bookCoverage.withCap} of {bookCoverage.total} researched positions carry a market
              cap; {bookCoverage.missing} do not. The robotics section has no market-cap column at
              all, and biology states only two. Every &ldquo;% by market cap&rdquo; above covers
              only the {bookCoverage.withCap} names that have one.
            </li>
            <li>
              <span className="text-term-yellow">There are no position sizes.</span> Market cap is
              not weight. A cap-weighted concentration figure describes the universe, not a
              portfolio.
            </li>
            <li>
              <span className="text-term-yellow">Prices are not synchronised.</span> Photonics is
              the 7 Aug 2026 close; crypto, quantum, agentic and robotics are 9 July 2026; biology
              is 7 July 2026. Comparing caps across sections compares different days. Automatic
              staleness banners are Phase 3.
            </li>
            <li>
              <span className="text-term-yellow">Conviction is derived, not stated.</span> Matthias
              has not set convictions. The values in positions.ts are mapped mechanically from each
              dashboard&rsquo;s own risk-profile tier (A→4, B→3, C→2, untiered→1), capped at 2 where
              no specific mispricing is documented and where the source itself says the name is not
              real exposure. Treat that column as a placeholder with a rule attached.
            </li>
            <li>
              <span className="text-term-yellow">The July 2026 figures are supplied, not
              sourced.</span> They came from Matthias in August 2026, are not in research/, and
              were not re-verified in this session.
            </li>
          </ul>
        </Panel>

        <Panel title={`Idea sources — ${citriniOnly.length} tickers, excluded from the figures above`}>
          <p className="text-[11px] leading-relaxed text-term-dim">
            The Citrini section names {citriniOnly.length} tickers that appear nowhere else in the
            dashboard. They are transcribed into positions.ts so the overlap test is complete, and
            excluded from every concentration figure above, because they are third-party ideas
            reconstructed from free public sources: disclosed late, without updates and without
            exits. None of them carries a market cap — the section has no market data at all.
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {citriniOnly.map((p: Position) => (
              <span
                key={p.ticker}
                className={`border border-term-line px-1.5 py-0.5 text-[10px] ${
                  p.stance === 'short'
                    ? 'text-term-red'
                    : p.stance === 'pair'
                      ? 'text-term-cyan'
                      : p.stance === 'context'
                        ? 'text-term-dim'
                        : 'text-term-text'
                }`}
                title={`${p.name} · ${p.stance} · ${p.asOf}`}
              >
                {p.ticker}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-term-dim">
            <span className="text-term-red">red</span> = short leg ·{' '}
            <span className="text-term-cyan">cyan</span> = one side of a pair ·{' '}
            <span className="text-term-dim">grey</span> = named in a scenario essay with no stance
            disclosed. Two of these names, MU and SNDK, are the calibration cases: both appear in
            the July 2026 drawdown above, and neither entry was ever updated.
          </p>
        </Panel>
      </div>
    </Section>
  )
}
