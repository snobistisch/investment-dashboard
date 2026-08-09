import { useMemo, useState } from 'react'
import { Section } from '../../components/Section'
import { Panel, Bar } from '../../components/Panel'
import { FACTOR_LABELS } from '../../data/positions'
import type { Factor } from '../../data/positions'
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

function PositionRow({ row, nameCap }: { row: AllocatedPosition; nameCap: number }) {
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
        <span className="mt-0.5 block text-[10px] text-term-dim">{row.position.name}</span>
        <span className="mt-0.5 block text-[10px] text-term-dim">
          <span className={factorColor[row.position.factors[0]]}>
            {FACTOR_LABELS[row.position.factors[0]]}
          </span>
          {row.position.chainLayer && ` · ${row.position.chainLayer}`}
        </span>
      </td>
      <td className="py-2 pr-2 text-right align-top tabular-nums text-term-text">
        {row.position.conviction}/5
      </td>
      <td className="py-2 pr-2 align-top">
        <div className="text-right tabular-nums text-term-text">
          {pct(row.weight)}
          {row.nameCapped && (
            <span className="ml-1 text-[10px] text-term-yellow" title="Held at its ceiling">
              ●
            </span>
          )}
        </div>
        {/* Scaled against the per-name cap, so a full bar is a position at
            its ceiling — same reading as the bars above. */}
        <div className="mt-1 ml-auto w-16">
          <Bar
            share={nameCap ? row.weight / nameCap : 0}
            className={row.bottleneck ? 'bg-term-green' : 'bg-term-amber'}
          />
        </div>
      </td>
      <td className="py-2 pr-2 text-right align-top tabular-nums text-term-dim">
        {usd(row.dollars)}
      </td>
      <td className="py-2 align-top text-[11px] leading-relaxed text-term-dim">{row.rationale}</td>
    </tr>
  )
}

export function AllocatorPanel() {
  const [capital, setCapital] = useState(100_000)
  const [risk, setRisk] = useState(35)
  const [sleeveOn, setSleeveOn] = useState(false)

  const capitalUsd = Number.isFinite(capital) && capital > 0 ? capital : 0
  const result = useMemo(
    () => buildAllocation(capitalUsd, risk, sleeveOn),
    [capitalUsd, risk, sleeveOn],
  )
  const band = riskBand(risk)
  const sleeve = result.sleeve
  const thesisRows = result.positions.filter((p) => p.sleeveName === 'thesis')
  const diversifierRows = result.positions.filter((p) => p.sleeveName === 'diversifier')

  return (
    <Section
      title="Allocator"
      description="Sizes a concrete allocation across the dashboard's own researched universe. It is built around the hypothesis the research actually argues — AI infrastructure bought at the optical interconnect bottleneck — rather than spreading capital evenly over seven drivers. Universe is src/data/positions.ts, filtered to the active book, to stance === 'long', and to names carrying a documented edge. Every figure is computed in allocation.ts."
    >
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
          At this setting: thesis floor {pct(result.thesisFloorShare, 0)}, per-name cap{' '}
          {pct(result.perNameCapPct)}, conviction tilt {result.convictionTilt.toFixed(2)},
          diversifiers capped at {pct(result.diversifierFactorCapPct)} per driver. Drawn from{' '}
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
                            : 'ballast'}
                    </span>
                    <div className="mt-1 w-40 max-w-full">
                      <Bar
                        share={row.share}
                        className={row.bottleneck ? 'bg-term-green' : 'bg-term-dim/60'}
                      />
                    </div>
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
            becomes a second thesis.
            {result.unallocatedUsd > 0 && (
              <>
                {' '}
                Unallocated: {usd(result.unallocatedUsd)} ({pct(result.unallocatedShare)}).
              </>
            )}
          </p>
        </Panel>
      </div>

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4">
        <Panel
          title={`Allocation — ${thesisRows.length} thesis, ${diversifierRows.length} diversifiers`}
        >
          {capitalUsd === 0 ? (
            <p className="text-xs text-term-dim">
              Enter a capital amount above to size the allocation.
            </p>
          ) : result.positions.length === 0 ? (
            <p className="text-xs text-term-dim">No eligible candidates at this setting.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-term-line text-[10px] uppercase tracking-[0.15em] text-term-dim">
                  <th className="py-1.5 pr-2 font-bold">Ticker</th>
                  <th className="py-1.5 pr-2 text-right font-bold">Conv.</th>
                  <th className="py-1.5 pr-2 text-right font-bold">Weight</th>
                  <th className="py-1.5 pr-2 text-right font-bold">$</th>
                  <th className="py-1.5 font-bold">Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-term-line bg-term-bg">
                  <td
                    colSpan={5}
                    className="py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-term-amber"
                  >
                    Thesis core — {pct(result.thesisActualShare)} of capital
                  </td>
                </tr>
                {thesisRows.map((row) => (
                  <PositionRow
                    key={row.position.ticker}
                    row={row}
                    nameCap={result.perNameCapPct}
                  />
                ))}
                <tr className="border-b border-term-line bg-term-bg">
                  <td
                    colSpan={5}
                    className="py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-term-dim"
                  >
                    Diversifiers — {pct(1 - result.thesisActualShare - result.unallocatedShare)} of
                    capital, capped so none can outrank the thesis
                  </td>
                </tr>
                {diversifierRows.map((row) => (
                  <PositionRow
                    key={row.position.ticker}
                    row={row}
                    nameCap={result.perNameCapPct}
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
              <span className="text-term-yellow">This is a concentrated book by design.</span> Two
              thirds of capital keys off one driver, and the Exposure tab&rsquo;s whole argument is
              that those names move together. The July 2026 reference is the calibration case: a
              correct thesis, concentrated, levered, force-liquidated. This tab keeps the
              concentration and caps the leverage — a deliberate choice, not a neutral default.
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
              <span className="text-term-yellow">Not investment advice.</span> A sizing exercise
              over a research universe, not a recommendation to trade.
            </li>
          </ul>
        </Panel>
      </div>
    </Section>
  )
}
