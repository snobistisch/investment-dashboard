import { useMemo } from 'react'
import { Section } from '../../components/Section'
import { Panel, Bar } from '../../components/Panel'
import { DataProvenance } from '../../components/DataProvenance'
import { Tickers } from '../../components/Tickers'
import { FACTOR_LABELS, JULY_2026_DRAWDOWN } from '../../data/positions'
import type { Factor } from '../../data/positions'
import {
  capRevisions,
  coverageDelta,
  mergePositions,
  RETURN_COLUMNS,
  useMarketSnapshot,
} from '../../data/market-data'
import {
  capCoverage,
  capCoverageByProvenance,
  chainBreakdown,
  crossSectionOverlap,
  drawdownIllustration,
  factorBreakdown,
  hiddenFactorOverlap,
  isContext,
  isThematic,
  oldestAsOfByFactor,
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

/** Last close in USD. Sub-dollar tokens need the extra places to say anything. */
function price(usd: number | undefined) {
  if (usd === undefined) return '—'
  if (usd >= 1000) return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (usd >= 1) return `$${usd.toFixed(2)}`
  if (usd >= 0.01) return `$${usd.toFixed(4)}`
  return `$${usd.toPrecision(2)}`
}

/** A return, or an em dash where the price history does not reach back far
 *  enough. An absent window is a fact about the listing's age, not a zero. */
function Ret({ value }: { value: number | undefined }) {
  if (value === undefined) return <span className="text-term-dim">—</span>
  const tone = value > 0 ? 'text-term-green' : value < 0 ? 'text-term-red' : 'text-term-dim'
  return (
    <span className={tone}>
      {value > 0 ? '+' : ''}
      {Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1)}%
    </span>
  )
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

export function ExposurePanel({ assetClass = 'equities' }: { assetClass?: 'equities' | 'crypto' }) {
  const { snapshot, source, loading } = useMarketSnapshot()

  // The merged book. Every figure below runs over these rows, so a live
  // snapshot changes the numbers and the absence of one leaves them exactly as
  // they were when positions.ts was the only source.
  const merged = useMemo(() => mergePositions(snapshot), [snapshot])
  // Split by asset class before anything is computed. Concentration, factor
  // weights and the July drawdown anchor are all averages, and averaging a
  // $228bn settlement layer with a photonics small cap answers neither
  // question. Crypto rows are the ones carrying the 'crypto' section.
  const inClass = useMemo(
    () =>
      merged.filter((p) =>
        assetClass === 'crypto' ? p.sections.includes('crypto') : !p.sections.includes('crypto'),
      ),
    [merged, assetClass],
  )
  const thematicPositions = useMemo(() => inClass.filter(isThematic), [inClass])
  const activeBook = useMemo(() => thematicPositions.filter((p) => !isContext(p)), [thematicPositions])
  // The whole researched book in one list, largest first. Context names are
  // included so the table is complete; they are marked and dimmed.
  const allNames = useMemo(
    () =>
      [...thematicPositions].sort(
        (a, b) => (b.marketCapUsd ?? 0) - (a.marketCapUsd ?? 0) || a.ticker.localeCompare(b.ticker),
      ),
    [thematicPositions],
  )
  const revisions = useMemo(() => capRevisions(activeBook), [activeBook])
  const provenance = capCoverageByProvenance(activeBook)
  const coverage = coverageDelta(activeBook)

  const bookRows = factorBreakdown(activeBook)
  const allRows = factorBreakdown(thematicPositions)

  // The same breakdown over transcribed caps only, so the headline can state
  // what the extra coverage did to the number instead of asserting it barely
  // moved. This is the before half of the before/after.
  const beforeRows = useMemo(
    () => factorBreakdown(activeBook.map((p) => ({ ...p, marketCapUsd: p.transcribedCapUsd }))),
    [activeBook],
  )
  const top = bookRows[0]
  const topAll = allRows.find((r) => r.factor === top.factor) ?? allRows[0]
  const beforeTop = beforeRows.find((r) => r.factor === top.factor)

  const bookCoverage = capCoverage(activeBook)
  const allCoverage = capCoverage(thematicPositions)

  const topFactorNames = activeBook.filter((p) => p.factors[0] === top.factor)
  const heaviest = topByCap(topFactorNames, 3)

  const overlap = crossSectionOverlap(merged)
  const hidden = hiddenFactorOverlap(activeBook)
  // Chain layer is computed over the FULL thematic set, not the active book:
  // every demand-setter (NVDA, the hyperscalers, TSLA) is a context name, so
  // excluding them would render the demand-setter row as zero and hide the
  // thing this panel exists to show.
  const chain = chainBreakdown(thematicPositions)

  const oldestAsOf = oldestAsOfByFactor(activeBook)
  // The worst relevant index, not the first one in the array. Using facts[0]
  // silently picked the SOX, which is the mild scenario for a momentum book.
  const worst = JULY_2026_DRAWDOWN.worstIndexMovePct
  const illustration = drawdownIllustration(top.capShare, worst)

  return (
    <Section
      title="Exposure"
      description="What the seven tabs actually add up to. Every figure on this tab is computed from src/data/positions.ts, which is a transcription of the other sections — no number here was re-derived or refreshed. Read the coverage panel at the bottom before trusting any weighted figure."
    >
      <DataProvenance snapshot={snapshot} source={source} loading={loading} book={activeBook} />

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
          <span className="text-term-amber">{FACTOR_LABELS[top.factor]}</span>.
        </p>
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-term-dim">
          <span className="text-term-yellow">The count is the robust number; read it first.</span>{' '}
          The cap-weighted version of the same fact — {pct(top.capShare)} of{' '}
          {cap(bookCoverage.capUsd)} — is more fragile than it looks, and the headline used to lead
          with it.{' '}
          {coverage.live > 0 ? (
            <>
              It now covers {bookCoverage.withCap} of {bookCoverage.total} names, against{' '}
              {coverage.before} before live data was merged. Those gaps were not random: robotics
              carried no market-cap column at all and biology stated two, which were precisely the
              buckets that would have pulled the concentration down. They did — this figure was{' '}
              <span className="text-term-text">{pct(beforeTop?.capShare ?? 0)}</span> on transcribed
              caps alone and is <span className="text-term-text">{pct(top.capShare)}</span> with the
              missing {coverage.after - coverage.before} names priced — an objection worth about{' '}
              {(Math.abs((beforeTop?.capShare ?? 0) - top.capShare) * 100).toFixed(0)} points, now
              measured rather than argued.
            </>
          ) : (
            <>
              It covers only {bookCoverage.withCap} of {bookCoverage.total} names, and the{' '}
              {bookCoverage.missing} without a market cap are not missing at random: robotics
              carries no cap column at all and biology states two, which are precisely the buckets
              that would pull the concentration down.
            </>
          )}{' '}
          Within the bucket itself {heaviest[0]?.position.ticker} alone is{' '}
          {pct(heaviest[0]?.share ?? 0)}, so one ticker drives roughly half the entire figure.
          Market cap is still not position size.
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

      {/* ------------------------------------------------------------------ */}
      {/* Every name, once. The tables below aggregate; this one does not.    */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-4">
        <Panel
          title={`The book — all ${allNames.length} researched positions, largest first`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-xs">
              <thead>
                <tr className="border-b border-term-line text-[10px] uppercase tracking-[0.15em] text-term-dim">
                  <th className="py-1.5 pr-2 font-bold">Ticker</th>
                  <th className="py-1.5 pr-2 font-bold">Name</th>
                  <th className="py-1.5 pr-2 font-bold">Sections</th>
                  <th className="py-1.5 pr-2 font-bold">Primary driver</th>
                  <th className="py-1.5 pr-2 font-bold">Chain</th>
                  <th className="py-1.5 pr-2 text-right font-bold">Price USD</th>
                  {RETURN_COLUMNS.map(([key, label]) => (
                    <th key={key} className="py-1.5 pr-2 text-right font-bold">
                      {label}
                    </th>
                  ))}
                  <th className="py-1.5 pr-2 text-right font-bold">Mkt cap</th>
                  <th className="py-1.5 pr-2 font-bold">As of</th>
                  <th className="py-1.5 font-bold">Source</th>
                </tr>
              </thead>
              <tbody>
                {allNames.map((p) => (
                  <tr
                    key={p.ticker}
                    className={`border-b border-term-line/60 last:border-b-0 ${
                      p.stance === 'context' ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="py-1.5 pr-2 whitespace-nowrap">
                      <span className="font-bold text-term-text">{p.ticker}</span>
                      {p.stance === 'context' && (
                        <span className="ml-1.5 text-[9px] uppercase tracking-wider text-term-dim">
                          ctx
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 pr-2 text-term-dim">{p.name}</td>
                    <td className="py-1.5 pr-2 whitespace-nowrap text-term-cyan">
                      {p.sections.join(' · ')}
                    </td>
                    <td className={`py-1.5 pr-2 whitespace-nowrap ${factorColor[p.factors[0]]}`}>
                      {FACTOR_LABELS[p.factors[0]]}
                    </td>
                    <td className="py-1.5 pr-2 whitespace-nowrap text-term-dim">
                      {p.chainLayer ?? '—'}
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular-nums text-term-text">
                      {price(p.priceUsd)}
                    </td>
                    {RETURN_COLUMNS.map(([key]) => (
                      <td key={key} className="py-1.5 pr-2 text-right tabular-nums">
                        <Ret value={p.returns?.[key]} />
                      </td>
                    ))}
                    <td className="py-1.5 pr-2 text-right tabular-nums text-term-text">
                      {cap(p.marketCapUsd)}
                    </td>
                    <td className="py-1.5 pr-2 whitespace-nowrap tabular-nums text-term-dim">
                      {p.asOf}
                    </td>
                    <td className="py-1.5 whitespace-nowrap text-[10px]">
                      {p.capSource === 'live' ? (
                        <span className="text-term-cyan">{p.providerSymbol}</span>
                      ) : p.capSource === 'transcribed' ? (
                        <span className="text-term-dim">positions.ts</span>
                      ) : (
                        <span className="text-term-dim">no cap stated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-4xl text-[11px] leading-relaxed text-term-dim">
            <span className="text-term-text">Prices and returns are in USD</span>, converted point
            by point against a year of daily FX rather than at today&rsquo;s rate — so a Japanese
            name up 20% in yen while the yen fell 8% reads as the ~11% a dollar holder actually
            made, not as 20%. These are price returns; dividends are not counted, which understates
            the income names over the longer windows. Windows are calendar-anchored — 1W is seven
            days, not five sessions — because crypto trades every day and equities do not, and the
            two sit in the same column here. 1D is the last session against the one before it, so
            for a token that is a 24-hour move and for a Tokyo listing it is the previous close. An{' '}
            <span className="text-term-dim">em dash</span> means the price history does not reach
            back that far: a listing three months old has no one-year return, and that is shown as
            absent rather than filled in from wherever its series happens to start.
          </p>
          <p className="mt-2 max-w-4xl text-[11px] leading-relaxed text-term-dim">
            Every researched name, listed once, with the market cap the figures above actually use
            and where that number came from. A{' '}
            <span className="text-term-cyan">cyan symbol</span> is the provider symbol the quote was
            fetched under — <span className="text-term-cyan">3081.TWO</span>, not 3081.TW — so a
            wrong mapping is visible here rather than buried in a script.{' '}
            <span className="text-term-dim">positions.ts</span> means the transcribed figure is
            still the one in use. Rows marked <span className="text-term-dim">ctx</span> are the
            ones their own section calls context rather than exposure; they are dimmed and excluded
            from the {activeBook.length}-name active book, but shown so nothing is hidden.
          </p>
        </Panel>
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
                    <span className="mt-1 block text-[10px] text-term-dim">
                      {row.missingCap > 0 ? (
                        <span className="text-term-yellow">
                          {row.count - row.missingCap}/{row.count} priced
                        </span>
                      ) : (
                        <span>{row.count}/{row.count} priced</span>
                      )}
                      {row.liveCap > 0 && (
                        <span className="text-term-cyan">
                          {' · '}
                          {row.liveCap} live
                          {row.count - row.missingCap - row.liveCap > 0 &&
                            `, ${row.count - row.missingCap - row.liveCap} transcribed`}
                        </span>
                      )}
                      {oldestAsOf.get(row.factor) && ` · from ${oldestAsOf.get(row.factor)}`}
                    </span>
                    <Tickers
                      items={row.members.map((p) => ({
                        ticker: p.ticker,
                        detail: cap(p.marketCapUsd),
                        live: p.capSource === 'live',
                        absent: p.capSource === 'absent',
                      }))}
                    />
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
                    <Tickers
                      items={row.members.map((p) => ({
                        ticker: p.ticker,
                        detail: cap(p.marketCapUsd),
                        live: p.capSource === 'live',
                        absent: p.capSource === 'absent',
                      }))}
                    />
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
                  What a repeat would do to this universe:
                </span>{' '}
                {pct(top.capShare)} of the market cap on file sits behind one driver. Applying the
                Momentum TMT move of {worst}% uniformly to that share is{' '}
                <span className="font-bold text-term-red">{illustration.toFixed(1)}%</span>. That
                index rather than the SOX, because a concentrated high-momentum book sits in that
                regime — the semiconductor index fell roughly half as far in the same window.{' '}
                <span className="text-term-yellow">
                  This shape is the universe&rsquo;s, not a portfolio&rsquo;s.
                </span>{' '}
                There are no position sizes on this tab. The Allocator has them, and runs the same
                arithmetic on the weights it actually produces.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-term-dim">
                The book is research-only and unlevered, so the ~4x that turned a correct thesis
                into a forced liquidation does not apply here. The correlation that made 4x fatal
                does. What killed that fund was not being wrong — it was being right, concentrated
                and levered through an ordinary correction.
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
                <span className="text-term-yellow">Against that reading:</span>{' '}
                {JULY_2026_DRAWDOWN.fundFailureCaveat}
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
      {revisions.length > 0 && (
        <div className="mt-4">
          <Panel title={`Revisions — ${revisions.length} transcribed caps the live snapshot disagrees with by 25% or more`}>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-term-line text-[10px] uppercase tracking-[0.15em] text-term-dim">
                  <th className="py-1.5 pr-2 font-bold">Ticker</th>
                  <th className="py-1.5 pr-2 font-bold">Sections</th>
                  <th className="py-1.5 pr-2 text-right font-bold">Transcribed</th>
                  <th className="py-1.5 pr-2 text-right font-bold">Live</th>
                  <th className="py-1.5 text-right font-bold">Delta</th>
                </tr>
              </thead>
              <tbody>
                {revisions.map((r) => (
                  <tr key={r.position.ticker} className="border-b border-term-line/60 last:border-b-0">
                    <td className="py-2 pr-2">
                      <span className="text-term-text">{r.position.ticker}</span>
                      <span className="ml-2 text-term-dim">{r.position.name}</span>
                    </td>
                    <td className="py-2 pr-2 text-term-dim">{r.position.sections.join(', ')}</td>
                    <td className="py-2 pr-2 text-right tabular-nums text-term-dim">
                      {cap(r.transcribed)}
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums text-term-text">
                      {cap(r.live)}
                    </td>
                    <td
                      className={`py-2 text-right font-bold tabular-nums ${
                        r.delta > 0 ? 'text-term-green' : 'text-term-red'
                      }`}
                    >
                      {r.delta > 0 ? '+' : ''}
                      {(r.delta * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 max-w-4xl text-[11px] leading-relaxed text-term-dim">
              Neither column is corrected here. positions.ts still says what it always said, and the
              figures above use the live number — this table exists so the gap between them is
              visible instead of silently resolved. The photonics rows, transcribed from the 7 Aug
              close, agree with live data to within about a percent and do not appear.{' '}
              <span className="text-term-yellow">
                The gaps cluster in the sections whose own headers say the figures were supplied
                rather than verified
              </span>{' '}
              — which is what those headers were warning about.
            </p>
          </Panel>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Coverage — what this tab cannot tell you">
          <ul className="space-y-2 text-[11px] leading-relaxed text-term-dim">
            <li>
              <span className={provenance.absent > 0 ? 'text-term-yellow' : 'text-term-cyan'}>
                Market-cap coverage is {provenance.absent === 0 ? 'complete' : 'partial'}.
              </span>{' '}
              {bookCoverage.withCap} of {bookCoverage.total} researched positions carry a market
              cap; {bookCoverage.missing} do not.{' '}
              {provenance.live > 0 ? (
                <>
                  Of those, <span className="text-term-cyan">{provenance.live} are live</span> and{' '}
                  {provenance.transcribed} are the transcribed figure. Before live data was wired
                  in, the robotics section had no market-cap column at all and biology stated only
                  two, so every &ldquo;% by market cap&rdquo; covered a third of the book.
                </>
              ) : (
                <>
                  The robotics section has no market-cap column at all, and biology states only two.
                  Every &ldquo;% by market cap&rdquo; above covers only the {bookCoverage.withCap}{' '}
                  names that have one.
                </>
              )}
            </li>
            <li>
              <span className="text-term-yellow">There are no position sizes.</span> Market cap is
              not weight. A cap-weighted concentration figure describes the universe, not a
              portfolio.
            </li>
            <li>
              {source === 'none' ? (
                <>
                  <span className="text-term-yellow">Prices are not synchronised.</span> Photonics
                  is the 7 Aug 2026 close; crypto, quantum, agentic and robotics are 9 July 2026;
                  biology is 7 July 2026. Comparing caps across sections compares different days.
                </>
              ) : (
                <>
                  <span className="text-term-cyan">Prices are synchronised where they are live.</span>{' '}
                  Every row the snapshot priced carries the same close. Rows it could not price keep
                  their transcribed date and still compare different days — the banner at the top
                  names them.
                </>
              )}
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

      </div>
    </Section>
  )
}
