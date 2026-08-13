import { useEffect, useMemo, useState } from 'react'
import { Section } from '../../components/Section'
import { Panel, Bar } from '../../components/Panel'
import { DataProvenance } from '../../components/DataProvenance'
import { Tickers } from '../../components/Tickers'
import { FACTOR_LABELS } from '../../data/positions'
import type { Factor } from '../../data/positions'
import {
  mergePositions,
  RETURN_COLUMNS,
  useMarketSnapshot,
  type MarketQuote,
} from '../../data/market-data'
import { VINTAGE_WARN_DAYS } from '../exposure/analysis'
import {
  buildAllocation,
  riskBand,
  SLEEVE_CAP_AGGRESSIVE,
  type AllocatedPosition,
  type RiskBand,
} from './allocation'

function usd(n: number) {
  if (!Number.isFinite(n)) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}m`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

function pct(share: number, digits = 1) {
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

const bandColor: Record<RiskBand, string> = {
  Conservative: 'text-term-green',
  Balanced: 'text-term-amber',
  Aggressive: 'text-term-red',
}

/** Last close in USD. Sub-dollar tokens need the extra places to say anything. */
function price(usd: number | undefined) {
  if (usd === undefined) return '—'
  if (usd >= 1000) return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (usd >= 1) return `$${usd.toFixed(2)}`
  if (usd >= 0.01) return `$${usd.toFixed(4)}`
  return `$${usd.toPrecision(2)}`
}

/** A return, or an em dash where the history does not reach back that far. */
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

function PositionRow({
  row,
  nameCap,
  quote,
}: {
  row: AllocatedPosition
  nameCap: number
  quote?: MarketQuote
}) {
  return (
    <tr className="border-b border-term-line/60 last:border-b-0">
      <td className="py-2 pr-2 align-top">
        <span className="font-bold text-term-text">{row.position.ticker}</span>
        {row.bottleneck && (
          <span
            className="ml-1.5 border border-term-green px-1 text-[9px] uppercase tracking-wider text-term-green"
            title="Substrate or component in the thesis chain — what the research says to buy"
          >
            bottleneck
          </span>
        )}
        {row.hedge && (
          <span
            className="ml-1.5 border border-term-cyan px-1 text-[9px] uppercase tracking-wider text-term-cyan"
            title="The source frames this name as a hedge against the book's own thesis, not an expression of it"
          >
            hedge
          </span>
        )}
        {!row.tradable && (
          <span
            className="ml-1.5 border border-term-red px-1 text-[9px] uppercase tracking-wider text-term-red"
            title="Not directly tradable from a Dutch retail account — mainland China A-share or Taipei Exchange listing"
          >
            not tradable
          </span>
        )}
        <span className="mt-0.5 block text-[10px] text-term-dim">{row.position.name}</span>
        <span className="mt-0.5 block text-[10px] text-term-dim">
          <span className={factorColor[row.position.factors[0]]}>
            {FACTOR_LABELS[row.position.factors[0]]}
          </span>
          {row.position.chainLayer && ` · ${row.position.chainLayer}`}
        </span>
        {quote && (
          <span className="mt-1 flex flex-wrap items-baseline gap-x-2 text-[10px] tabular-nums">
            <span className="text-term-text">{price(quote.priceUsd)}</span>
            {RETURN_COLUMNS.map(([key, label]) => (
              <span key={key} className="whitespace-nowrap">
                <span className="text-term-dim">{label}</span> <Ret value={quote.returns?.[key]} />
              </span>
            ))}
          </span>
        )}
      </td>
      <td className="py-2 pr-2 text-right align-top tabular-nums text-term-text">
        {row.position.conviction}/5
      </td>
      <td className="py-2 pr-2 align-top">
        <div className="text-right tabular-nums text-term-text">
          {pct(row.exposureWeight)}
          {row.nameCapped && (
            <span className="ml-1 text-[10px] text-term-yellow" title="Held at its ceiling">
              ●
            </span>
          )}
        </div>
        {/* Scaled against the per-name cap and drawn on TOTAL exposure, so a
            full bar is a position at its ceiling however it got there. */}
        <div className="mt-1 ml-auto w-16">
          <Bar
            share={nameCap ? row.exposureWeight / nameCap : 0}
            className={row.premiumUsd > 0 ? 'bg-term-red' : row.bottleneck ? 'bg-term-green' : 'bg-term-amber'}
          />
        </div>
      </td>
      <td className="py-2 pr-2 text-right align-top tabular-nums text-term-dim">
        {usd(row.dollars)}
        {row.premiumUsd > 0 && (
          <span className="mt-0.5 block text-[10px] text-term-red">
            + {usd(row.premiumUsd)} premium
          </span>
        )}
      </td>
      <td className="py-2 align-top text-[11px] leading-relaxed text-term-dim">{row.rationale}</td>
    </tr>
  )
}

export function AllocatorPanel({
  onLeverageChange,
  assetClass = 'equities',
}: {
  /** Lets the app footer state the book's leverage instead of asserting it. */
  onLeverageChange?: (active: boolean) => void
  /** Which half of the book to render. The sizing model is unchanged and still
   *  solves for the whole book at once — allocation.ts has always held crypto
   *  to a separate fixed mandate. What this switches is which sleeves are
   *  shown, so each asset class is read against its own hypothesis instead of
   *  a blended one. */
  assetClass?: 'equities' | 'crypto'
}) {
  const [capital, setCapital] = useState(100_000)
  const [risk, setRisk] = useState(35)
  const [sleeveOn, setSleeveOn] = useState(false)

  const { snapshot, source, loading } = useMarketSnapshot()

  const capitalUsd = Number.isFinite(capital) && capital > 0 ? capital : 0
  const result = useMemo(
    () => buildAllocation(capitalUsd, risk, sleeveOn, snapshot),
    [capitalUsd, risk, sleeveOn, snapshot],
  )
  const band = riskBand(risk)
  const sleeve = result.sleeve

  const leverageActive = sleeve !== null && sleeve.premiumUsd > 0
  useEffect(() => {
    onLeverageChange?.(leverageActive)
    return () => onLeverageChange?.(false)
  }, [leverageActive, onLeverageChange])
  // The solver still sizes the whole book in one pass — splitting the model
  // would change the answer, not just the view. What changes here is which
  // sleeves are shown, so each asset class is read against its own hypothesis.
  const equitiesView = assetClass === 'equities'
  const thesisRows = equitiesView ? result.positions.filter((p) => p.sleeveName === 'thesis') : []
  const diversifierRows = equitiesView
    ? result.positions.filter((p) => p.sleeveName === 'diversifier')
    : []
  const cryptoRows = equitiesView ? [] : result.positions.filter((p) => p.sleeveName === 'crypto')
  const cryptoShare = cryptoRows.reduce((t, p) => t + p.exposureWeight, 0)

  // Sizing never reads market cap, so this book is here for the provenance
  // banner and nothing else — the allocation itself is identical either way.
  const sizedTickers = new Set(result.positions.map((p) => p.position.ticker))
  const book = useMemo(
    () => mergePositions(snapshot).filter((p) => sizedTickers.has(p.ticker)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snapshot, result],
  )

  return (
    <Section
      title="Allocator"
      description="Sizes a concrete allocation across the dashboard's own researched universe. It is built around the hypothesis the research actually argues — AI infrastructure bought at the optical interconnect bottleneck — rather than spreading capital evenly over seven drivers. Universe is src/data/positions.ts, filtered to the active book, to stance === 'long', and to names carrying a documented edge. Every figure is computed in allocation.ts."
    >
      <DataProvenance snapshot={snapshot} source={source} loading={loading} book={book} />

      {/* ------------------------------------------------------------------ */}
      <div className="border border-term-line bg-term-panel p-4 sm:p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.2em] text-term-dim">
              Capital (USD)
            </span>
            <input
              type="number"
              min={0}
              step={1000}
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="mt-2 w-full border border-term-line bg-term-bg px-3 py-2 text-sm text-term-text tabular-nums focus:border-term-amber focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.2em] text-term-dim">
              Risk tolerance — <span className={`font-bold ${bandColor[band]}`}>{band}</span> ({risk}
              )
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={risk}
              onChange={(e) => setRisk(Number(e.target.value))}
              className="mt-3 w-full accent-term-amber"
            />
            <div className="mt-1 flex justify-between text-[10px] text-term-dim">
              <span>Conservative</span>
              <span>Balanced</span>
              <span>Aggressive</span>
            </div>
          </label>
        </div>

        <label className="mt-6 flex items-center gap-2 text-xs text-term-text">
          <input
            type="checkbox"
            checked={sleeveOn}
            onChange={(e) => setSleeveOn(e.target.checked)}
            className="accent-term-amber"
          />
          Leverage sleeve — express the bottleneck names via options instead of equity (off by
          default; capped at {pct(SLEEVE_CAP_AGGRESSIVE)} of capital at max risk)
        </label>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* The headline. What this allocation IS, in one sentence.            */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 border border-term-amber bg-term-panel p-4 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-term-dim">
          Thesis core · {result.positions.length} positions
        </p>
        <p className="mt-3 text-xl leading-snug font-bold text-term-text sm:text-3xl">
          <span className="text-term-amber">{pct(result.thesisActualShare, 0)}</span> of capital
          sits in <span className="text-term-amber">{FACTOR_LABELS[result.thesisFactor]}</span> —
          and{' '}
          <span className="text-term-green">
            {pct(
              result.thesisActualShare ? result.bottleneckShare / result.thesisActualShare : 0,
              0,
            )}
          </span>{' '}
          of that core sits in the substrate and component layers the research calls the bottleneck.
        </p>
        <p className="mt-4 max-w-4xl text-xs leading-relaxed text-term-dim">
          That is the point, not a side effect.{' '}
          <span className="text-term-text">
            research/photonics-tracker-research.md §5 argues copper runs out of reach above 200G per
            lane as clusters grow
          </span>
          , §4 calls compound-semiconductor substrates &ldquo;the hardest constraint&rdquo; and the
          laser layer &ldquo;the genuine bottleneck&rdquo;, and the Exposure tab states the rule
          that follows: substrate and component are what the thesis says to buy, system and
          demand-setter are beta. An allocator that spread capital evenly across seven drivers would
          be contradicting the only theme this dashboard researched in depth.
        </p>
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-term-dim">
          <span className="text-term-yellow">The risk this creates is named, not hidden.</span> The
          Exposure tab exists because 88% of the book&rsquo;s market cap sits behind this one
          driver, and {FACTOR_LABELS[result.thesisFactor]} names move together. Per{' '}
          <span className="text-term-text">JULY_2026_DRAWDOWN</span>, the fund that held this exact
          thesis was right and was still force-liquidated — by roughly 4x leverage, not by being
          concentrated. So concentration is what this tab expresses and{' '}
          <span className="text-term-text">leverage is what it caps</span>.
        </p>
        <p className="mt-3 max-w-4xl text-[11px] leading-relaxed text-term-dim">
          At this setting: <span className="text-term-text">{pct(result.reserveShare)}</span> held
          in reserve, thesis floor {pct(result.thesisFloorShare, 0)} of the invested part, per-name
          cap {pct(result.perNameCapPct)} measured on total exposure including any option premium,
          conviction tilt {result.convictionTilt.toFixed(2)}, diversifiers capped at{' '}
          {pct(result.diversifierFactorCapPct)} per driver. Drawn from{' '}
          {result.thesisUniverseCount} thesis names and {result.diversifierUniverseCount}{' '}
          diversifiers — the {result.thesisUniverseCount + result.diversifierUniverseCount} of{' '}
          {result.longUniverseCount} long positions that carry a documented edge.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Where the money sits in the chain">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-term-line text-[10px] uppercase tracking-[0.15em] text-term-dim">
                <th className="py-1.5 pr-2 font-bold">Layer</th>
                <th className="py-1.5 pr-2 text-right font-bold">$</th>
                <th className="py-1.5 text-right font-bold">% of capital</th>
              </tr>
            </thead>
            <tbody>
              {result.chainTotals.map((row) => (
                <tr key={row.layer} className="border-b border-term-line/60 last:border-b-0">
                  <td className="py-2 pr-2">
                    <span
                      className={row.bottleneck ? 'font-bold text-term-green' : 'text-term-text'}
                    >
                      {row.layer}
                    </span>
                    <span className="ml-2 text-[10px] text-term-dim">
                      {row.bottleneck
                        ? 'what the thesis says to buy'
                        : row.layer === 'module'
                          ? 'volume layer'
                          : row.layer === 'system'
                            ? 'beta'
                            : row.layer === 'crypto mandate'
                              ? 'sized to instruction, not to conviction'
                              : 'ballast'}
                    </span>
                    <div className="mt-1 w-40 max-w-full">
                      <Bar
                        share={row.share}
                        className={row.bottleneck ? 'bg-term-green' : 'bg-term-dim/60'}
                      />
                    </div>
                    <Tickers
                      items={row.holdings.map((h) => ({
                        ticker: h.ticker,
                        detail: usd(h.dollars),
                      }))}
                    />
                  </td>
                  <td className="py-2 pr-2 text-right align-top tabular-nums text-term-text">
                    {usd(row.dollars)}
                  </td>
                  <td className="py-2 text-right align-top tabular-nums text-term-dim">
                    {pct(row.share)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            Layers are the <em>thesis</em> chain only. The word component is not globally
            meaningful — Harmonic Drive is a component in the robotics chain, Hesai in the lidar one
            — so counting those here would credit the optical bottleneck with capital sitting in an
            unrelated supply chain. They appear in the ballast row instead.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-term-dim">
            This is the panel that decides whether the allocation expresses the thesis or merely
            correlates with it. Weighting on <span className="text-term-text">conviction</span>{' '}
            alone would push the other way: conviction is derived from each dashboard&rsquo;s risk
            tier, so the volatile bottleneck names score <em>lower</em> than the steadier module
            makers. A chain-layer multiplier corrects for that.
          </p>
        </Panel>

        <Panel title="Driver exposure">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-term-line text-[10px] uppercase tracking-[0.15em] text-term-dim">
                <th className="py-1.5 pr-2 font-bold">Driver</th>
                <th className="py-1.5 pr-2 text-right font-bold">$</th>
                <th className="py-1.5 text-right font-bold">% of capital</th>
              </tr>
            </thead>
            <tbody>
              {result.factorTotals.map((row) => (
                <tr key={row.factor} className="border-b border-term-line/60 last:border-b-0">
                  <td className="py-2 pr-2">
                    <span className={`font-bold ${factorColor[row.factor]}`}>
                      {FACTOR_LABELS[row.factor]}
                    </span>
                    {row.isThesis && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-term-amber">
                        thesis
                      </span>
                    )}
                    <div className="mt-1 w-40 max-w-full">
                      <Bar
                        share={row.share}
                        className={row.isThesis ? 'bg-term-amber' : 'bg-term-dim/60'}
                      />
                    </div>
                    <Tickers
                      items={row.holdings.map((h) => ({
                        ticker: h.ticker,
                        detail: usd(h.dollars),
                      }))}
                    />
                  </td>
                  <td className="py-2 pr-2 text-right align-top tabular-nums text-term-text">
                    {usd(row.dollars)}
                  </td>
                  <td className="py-2 text-right align-top tabular-nums text-term-dim">
                    {pct(row.share)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            Bars are drawn against capital, not against a cap — there is no per-factor ceiling on
            the thesis, by design. The diversifiers keep one:{' '}
            {pct(result.diversifierFactorCapPct)} of capital per driver, so no secondary bet quietly
            becomes a second thesis. Every figure here is{' '}
            <span className="text-term-text">exposure</span>, so an option premium counts toward the
            ticker it is written on.
          </p>
        </Panel>
      </div>

      {result.forkExclusions.length > 0 && (
        <div className="mt-4">
          <Panel title="Architectural forks — one side taken, the other excluded">
            <ul className="space-y-2 text-xs">
              {result.forkExclusions.map((f) => (
                <li key={f.ticker} className="text-term-dim">
                  <span className="font-bold text-term-text">{f.ticker}</span> ({f.name}) excluded —
                  it is the <span className="text-term-text">{f.side}</span> side of the{' '}
                  <span className="text-term-text">{f.fork}</span> fork, and{' '}
                  <span className="text-term-text">{f.beatenBy}</span> already holds the other side
                  with a higher score.
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
              Several rationales in positions.ts describe the same disagreement from opposite
              sides: Marvell owns roughly 70% of the optical DSP market, and Semtech is described
              there as &ldquo;the direct short leg against Marvell&rsquo;s DSP TAM&rdquo;. Sized
              side by side at equal weight, the idiosyncratic half of each thesis cancels and what
              remains is sector beta paid for twice.{' '}
              {result.hedgeTickers.length > 0 && (
                <>
                  Exempt from this rule:{' '}
                  <span className="text-term-cyan">{result.hedgeTickers.join(', ')}</span> — their
                  own sources frame them as hedges against the optical thesis rather than
                  expressions of it, so they are deliberate offsets rather than accidents.
                </>
              )}
            </p>
          </Panel>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4">
        <Panel title="Stress — this allocation, not the universe">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-term-line text-[10px] uppercase tracking-[0.15em] text-term-dim">
                <th className="py-1.5 pr-2 font-bold">Scenario</th>
                <th className="py-1.5 pr-2 text-right font-bold">Equity</th>
                <th className="py-1.5 pr-2 text-right font-bold">Premium</th>
                <th className="py-1.5 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {result.stress.map((s) => (
                <tr key={s.label} className="border-b border-term-line/60 last:border-b-0">
                  <td className="py-2 pr-2">
                    <span className="text-term-text">{s.label}</span>
                    {s.indexMovePct !== undefined && (
                      <span className="ml-2 text-term-dim">{s.indexMovePct.toFixed(1)}%</span>
                    )}
                    <span
                      className={`ml-2 text-[10px] uppercase tracking-[0.1em] ${
                        s.basis === 'realised' ? 'text-term-cyan' : 'text-term-yellow'
                      }`}
                    >
                      {s.basis === 'realised'
                        ? `measured · ${s.namesCovered}/${s.namesTotal} names`
                        : 'index anchor'}
                    </span>
                    {s.note && (
                      <span className="mt-0.5 block text-[10px] leading-snug text-term-dim">
                        {s.note}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums text-term-dim">
                    {usd(s.equityLossUsd)}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums text-term-dim">
                    {s.premiumLossUsd === 0 ? '—' : usd(s.premiumLossUsd)}
                  </td>
                  <td className="py-2 text-right font-bold tabular-nums text-term-red">
                    {pct(s.totalLossShare)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            Applied to the <span className="text-term-text">thesis exposure above</span> — real
            position sizes, not the universe&rsquo;s market-cap shares. The premium column is a full
            write-off, because an out-of-the-money call below its strike is worth zero however far
            below it lands.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-term-dim">
            <span className="text-term-yellow">Plan against the worst row, not the mildest.</span>{' '}
            The <span className="text-term-cyan">measured</span> rows move each held name by its own
            recorded drawdown or volatility, from the price history in the live snapshot — a book of
            90%-volatility Chinese optics no longer stresses like a book of megacaps. The{' '}
            <span className="text-term-yellow">index anchor</span> rows are the older method, kept
            because they are a stated historical fact worth seeing beside the measured numbers, not
            because they are the better estimate: they apply one index figure to the whole thesis
            block and assume nothing else moves. None of these is a forecast. Each measured row says
            how many of the sized names it actually covers.
          </p>
        </Panel>
      </div>

      {result.vintageSpreadDays > VINTAGE_WARN_DAYS && (
        <div className="mt-4 border border-term-yellow/70 bg-term-panel p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-term-yellow">
            Market data vintages differ by {result.vintageSpreadDays} days
          </p>
          <p className="mt-2 max-w-4xl text-xs leading-relaxed text-term-text">
            Oldest row here is {result.vintageOldest}, newest {result.vintageNewest}, measured on
            effective dates — a row the snapshot priced carries the snapshot&rsquo;s date, one it
            did not keeps its transcribed date.{' '}
            {source === 'none'
              ? 'No snapshot loaded, so these are the transcribed vintages. The July 2026 drawdown sits between them, which means this allocation weighs post-correction photonics prices against pre-correction prices for every other section, and the diversifiers’ own rationales describe a world from before the move.'
              : 'The rows still spread this far are the ones no snapshot could price. Relative weights that cross the gap are not comparing like with like.'}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4">
        <Panel title={`Reserve — ${usd(result.reserveUsd)} held back, ${pct(result.reserveShare)} of capital`}>
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <p className="text-2xl font-bold text-term-text">{pct(result.reserveShare)}</p>
              <p className="mt-1 text-xs text-term-dim">
                not at risk · {pct(result.investedShare)} invested
              </p>
              <div className="mt-2 w-full">
                <Bar share={result.investedShare} className="bg-term-amber" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs leading-relaxed text-term-text">
                This is the only control on the slider that moves in one direction and means one
                thing. Everything else — thesis share, name count, per-name cap, conviction tilt,
                sleeve size — pushes the same way as risk rises, so without a reserve
                &ldquo;Conservative&rdquo; was 100% invested with two thirds of it behind a single
                driver: a slightly smaller version of the same bet rather than a different one.
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
                It is a reserve, not a forecast. There is no cash-yield assumption here and no claim
                that holding it beats being invested — it is the part of the number a drawdown
                cannot reach. Read the allocation above as{' '}
                <span className="text-term-text">risk capital</span>, not as your net worth.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4">
        <Panel
          title={
            equitiesView
              ? `Allocation — ${thesisRows.length} thesis, ${diversifierRows.length} diversifiers`
              : `Crypto mandate — ${cryptoRows.length} positions at ${pct(cryptoShare)} of capital`
          }
        >
          {capitalUsd === 0 ? (
            <p className="text-xs text-term-dim">
              Enter a capital amount above to size the allocation.
            </p>
          ) : thesisRows.length + diversifierRows.length + cryptoRows.length === 0 ? (
            <p className="text-xs text-term-dim">No eligible candidates at this setting.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-term-line text-[10px] uppercase tracking-[0.15em] text-term-dim">
                  <th className="py-1.5 pr-2 font-bold">Ticker</th>
                  <th className="py-1.5 pr-2 text-right font-bold">Conv.</th>
                  <th className="py-1.5 pr-2 text-right font-bold">Exposure</th>
                  <th className="py-1.5 pr-2 text-right font-bold">$ equity</th>
                  <th className="py-1.5 font-bold">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {thesisRows.length > 0 && (
                  <tr className="border-b border-term-line bg-term-bg">
                    <td
                      colSpan={5}
                      className="py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-term-amber"
                    >
                      Thesis core — {pct(result.thesisActualShare)} of capital
                    </td>
                  </tr>
                )}
                {thesisRows.map((row) => (
                  <PositionRow
                    key={row.position.ticker}
                    row={row}
                    nameCap={result.perNameCapPct}
                    quote={snapshot?.quotes[row.position.ticker]}
                    />
                ))}
                {diversifierRows.length > 0 && (
                  <tr className="border-b border-term-line bg-term-bg">
                    <td
                      colSpan={5}
                      className="py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-term-dim"
                    >
                      Diversifiers — {pct(1 - result.thesisActualShare - result.unallocatedShare)} of
                      capital, capped so none can outrank the thesis
                    </td>
                  </tr>
                )}
                {diversifierRows.map((row) => (
                  <PositionRow
                    key={row.position.ticker}
                    row={row}
                    nameCap={result.perNameCapPct}
                    quote={snapshot?.quotes[row.position.ticker]}
                    />
                ))}
                {cryptoRows.length > 0 && (
                  <tr className="border-b border-term-line bg-term-bg">
                    <td
                      colSpan={5}
                      className="py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-term-magenta"
                    >
                      Crypto mandate — {pct(cryptoShare)} of capital, sized to instruction rather
                      than to the conviction ranking
                    </td>
                  </tr>
                )}
                {cryptoRows.map((row) => (
                  <PositionRow
                    key={row.position.ticker}
                    row={row}
                    nameCap={result.perNameCapPct}
                    quote={snapshot?.quotes[row.position.ticker]}
                  />
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            Thesis names are weighted on <span className="text-term-text">conviction</span> raised
            to the tilt, multiplied by their chain-layer weight. Diversifiers are weighted on
            conviction alone and carry a tighter ceiling —{' '}
            {pct(result.perNameCapPct * 0.6)} of capital against the core&rsquo;s{' '}
            {pct(result.perNameCapPct)} — so ballast stays ballast. No win-probability or
            Kelly-style math; nothing in positions.ts supports that precision. Each rationale is the
            position&rsquo;s own <span className="text-term-text">edge</span> field, verbatim.
          </p>
        </Panel>
      </div>

      {/* ------------------------------------------------------------------ */}
      {sleeve && (
        <div className="mt-4">
          <Panel
            title={`Leverage sleeve — ${usd(sleeve.premiumUsd)} premium budget, ${pct(sleeve.targetShare)} of capital`}
          >
            <div className="border border-term-red/60 bg-term-bg p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-term-red">
                Options overlay — read before acting
              </p>
              <p className="mt-2 text-xs leading-relaxed text-term-text">
                Structure only, not a tradable quote: a moderately out-of-the-money call, roughly
                2-4 months to expiry, sized so total premium loss across the sleeve is capped at{' '}
                {pct(sleeve.targetShare)} of total capital. No strikes, premiums, implied volatility
                or greeks are shown — this is a static site with no live market data, and a
                plausible-looking fake number is worse than none.{' '}
                <span className="text-term-yellow">Check a live options chain before acting.</span>
              </p>
              <p className="mt-3 text-xs leading-relaxed text-term-text">
                <span className="font-bold text-term-red">
                  &ldquo;Capped at {pct(sleeve.targetShare)}&rdquo; is the best case for the
                  downside, not the expected one.
                </span>{' '}
                An out-of-the-money call expires worthless at any price below its strike, so the
                modal outcome of this block is not a partial loss but a total one: the full{' '}
                {usd(sleeve.premiumUsd)} goes to zero unless the underlying rises past the strike,
                and it needs to clear strike + premium paid before the position makes anything.
                Compute that breakeven off the live chain — it cannot be derived here. In a repeat
                of July 2026 the honest planning assumption for this sleeve is −100%, on top of
                whatever the equity does.
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
                Worth knowing before switching this on: Bauer, Cosemans and Eichholtz (2009,{' '}
                <em>Journal of Banking &amp; Finance</em>) find Dutch retail investors lost an
                average of 1.81% <em>per month</em> on option positions — well above their losses on
                equities — attributed to poor timing after strong price run-ups and to transaction
                costs. This book is filled by construction with names that have already run.
              </p>
              <div className="mt-3 space-y-2">
                {sleeve.legs.map((leg) => (
                  <div key={leg.position.ticker} className="flex items-baseline justify-between">
                    <span className="text-xs">
                      <span className="font-bold text-term-text">{leg.position.ticker}</span>{' '}
                      <span className="text-term-green">{leg.position.chainLayer}</span>{' '}
                      <span className="text-term-dim">conv. {leg.position.conviction}/5</span>
                    </span>
                    <span className="text-xs tabular-nums text-term-amber">
                      {usd(leg.premiumUsd)} premium ({pct(leg.premiumShare * sleeve.targetShare)} of
                      capital)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
              Drawn only from <span className="text-term-green">bottleneck</span> names already held
              in the thesis core — substrate and component, never a diversifier and never a separate
              pick. A leveraged expression belongs on the sharpest version of the thesis; ranking by
              the derived conviction column instead used to surface two names with no chain position
              at all. The book is unlevered by construction, and this sleeve exists so a leveraged
              view is possible without the ~4x structure that forced the July 2026 liquidation. The
              premium budget is a separate slice of capital — turning the toggle on never reduces
              the core allocation&rsquo;s sizing.
            </p>
          </Panel>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4">
        <Panel title="What this tab cannot tell you">
          <ul className="space-y-2 text-[11px] leading-relaxed text-term-dim">
            <li>
              <span className="text-term-yellow">This is a concentrated book by design.</span>{' '}
              {pct(result.thesisActualShare)} of capital keys off one driver, and the Exposure
              tab&rsquo;s whole argument is that those names move together. The July 2026 reference
              is the calibration case: a correct thesis, concentrated, levered, force-liquidated.
              This tab keeps the concentration, caps the leverage and holds a reserve — deliberate
              choices, not neutral defaults.
            </li>
            <li>
              <span className="text-term-yellow">
                There is no risk input anywhere in this model.
              </span>{' '}
              No prices, no volatility, no correlations, no expected returns. Weights come from a
              conviction column positions.ts itself calls a placeholder, a chain-layer multiplier
              set by hand, and the caps above. &ldquo;How correlated is it&rdquo; is not measured
              here — what is measured is how many names share a stated driver, which is a weaker
              claim. Treat the output as a structured reading of the research, not as a risk model.
            </li>
            <li>
              <span className="text-term-yellow">Conviction is derived, not stated.</span> Mapped
              mechanically from each dashboard&rsquo;s risk tier, not Matthias&rsquo;s judgement.
              That is precisely why the chain-layer weight exists — and it means the ranking inside
              the thesis core rests on a value-chain classification, which is an editorial call
              made during transcription.
            </li>
            <li>
              <span className="text-term-yellow">
                Only {result.thesisUniverseCount + result.diversifierUniverseCount} of{' '}
                {result.longUniverseCount} long names are sizeable.
              </span>{' '}
              A position is eligible only if it carries a documented{' '}
              <span className="text-term-text">edge</span>. The rest carry a{' '}
              <span className="text-term-text">note</span>, which positions.ts defines as a
              transcription caveat and which is frequently a bear case. One caveat on that filter:
              the `edge` field is not uniformly a mispricing claim — Robinhood&rsquo;s records a
              cross-reference between two sections rather than a reason the market is wrong, which
              is part of why it used to size so large.
            </li>
            <li>
              <span className="text-term-yellow">No live pricing.</span> Dollar allocations at
              today&rsquo;s capital figure, not share counts. Prices across sections are also not
              synchronised — photonics is 7 Aug 2026, the rest early July.
            </li>
            <li>
              <span className="text-term-yellow">Nothing here is execution-tested.</span> Positions
              marked <span className="text-term-red">not tradable</span> are mainland China
              A-shares or Taipei Exchange listings that a Dutch retail account cannot buy directly;
              where a dual listing exists (Zhongji Innolight also trades in Hong Kong) this tab does
              not route you to it. Transaction costs, bid-ask spread, the one-off FX assumptions
              carried over from the photonics note, and Dutch box 3 — a levy on the value of the
              holding rather than on the gain, which changes the net outcome of a volatile book —
              are all absent. None of them is derivable from anything in this repo, so they are
              named here rather than modelled badly.
            </li>
            <li>
              <span className="text-term-yellow">Valuation does not enter the sizing.</span> The PE
              multiples scattered through the <span className="text-term-text">note</span> fields —
              472x, 333x, 169x trailing, 90x on 16.8% growth — touch no weight. The largest thesis
              positions are among the strongest 12-month performers in the universe, and the
              literature on both sides of that is unflattering: long-run earnings growth does not
              persist beyond chance (Chan, Karceski and Lakonishok 2003), and a sector up 100% over
              the market in two years has carried a 53% chance of a subsequent 40% drawdown
              (Greenwood, Shleifer and You 2019). Adding valuation fields needs sourced numbers per
              row, which is a data task, not a code one.
            </li>
            <li>
              <span className="text-term-yellow">Not investment advice.</span> A sizing exercise
              over a research universe, not a recommendation to trade.
            </li>
          </ul>
        </Panel>
      </div>
    </Section>
  )
}
