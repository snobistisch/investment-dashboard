import { useMemo, useState } from 'react'
import { Section } from '../../components/Section'
import { Panel, Bar } from '../../components/Panel'
import { FACTOR_LABELS } from '../../data/positions'
import type { Factor } from '../../data/positions'
import { buildAllocation, riskBand, SLEEVE_CAP_AGGRESSIVE, type RiskBand } from './allocation'

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

  return (
    <Section
      title="Allocator"
      description="Sizes a concrete allocation across the dashboard's own researched universe, using the position-sizing discipline of a portfolio manager rather than a stock-picker. Universe is src/data/positions.ts, filtered to the active book (thematic, not context-flagged), to stance === 'long', and to names carrying a documented edge. Every figure below is computed in allocation.ts — nothing here is hardcoded."
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
              Risk tolerance —{' '}
              <span className={`font-bold ${bandColor[band]}`}>{band}</span> ({risk})
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
          Leverage sleeve — express the highest-conviction names via options instead of equity
          (off by default; capped at {pct(SLEEVE_CAP_AGGRESSIVE)} of capital at max risk)
        </label>

        <p className="mt-4 max-w-4xl text-xs leading-relaxed text-term-dim">
          <span className="text-term-amber">{result.targetPositionCount}</span> names,{' '}
          <span className="text-term-amber">{pct(result.perNameCapPct)}</span> per-name cap,{' '}
          <span className="text-term-amber">{pct(result.perFactorCapPct)}</span> per-factor cap, at
          most <span className="text-term-amber">{result.maxNamesPerFactor}</span> names per factor,
          conviction tilt <span className="text-term-amber">{result.convictionTilt.toFixed(2)}</span>{' '}
          at this setting. Drawn from the {result.sizeableUniverseCount} names — of{' '}
          {result.longUniverseCount} long positions in the active book — that carry a documented{' '}
          <span className="text-term-text">edge</span>.
        </p>
        <p className="mt-2 max-w-4xl text-[11px] leading-relaxed text-term-dim">
          Risk tolerance moves four things at once: fewer names, a higher ceiling on any one of
          them, a steeper tilt toward conviction, and a larger sleeve. It deliberately does{' '}
          <em>not</em> move the per-factor cap much — that one exists to stop this tab recreating
          the concentration the Exposure tab measures.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title={`Factor exposure — cap ${pct(result.perFactorCapPct)} held across the range`}>
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
                    <div className="mt-1 w-40 max-w-full">
                      <Bar
                        share={row.cap ? row.share / row.cap : 0}
                        className={row.atCap ? 'bg-term-red' : 'bg-term-amber'}
                      />
                    </div>
                  </td>
                  <td className="py-2 pr-2 text-right align-top tabular-nums text-term-text">
                    {usd(row.dollars)}
                  </td>
                  <td className="py-2 text-right align-top tabular-nums text-term-dim">
                    {pct(row.share)}
                    {row.atCap && <span className="ml-1.5 text-term-red">at cap</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            Bucketed by <span className="text-term-text">factors[0]</span>, same convention as the
            Exposure tab. The bar is filled against the cap, not against capital, so a full bar
            means that driver is at its ceiling. Capital a full bucket refuses is offered to the
            buckets still under theirs — never held back and never forced into the bucket that was
            already full.
          </p>
        </Panel>

        <Panel title="Cash / unallocated">
          <p className="text-2xl font-bold text-term-text">{usd(result.unallocatedUsd)}</p>
          <p className="mt-1 text-xs text-term-dim">{pct(result.unallocatedShare)} of capital.</p>
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            Cash appears only when every remaining name is already at its own ceiling and every
            factor bucket is at its cap — that is, when the caps genuinely bind everywhere at once.
            On the current universe that does not happen at any slider setting, so this normally
            reads zero. It is a diagnostic, not a target.
          </p>
          {result.sleeve && (
            <div className="mt-4 border-t border-term-line pt-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-term-dim">
                Sleeve premium budget (separate from the above)
              </p>
              <p className="mt-1 text-sm font-bold text-term-amber">
                {usd(result.sleeve.premiumUsd)} · {pct(result.sleeve.targetShare)} of capital
              </p>
            </div>
          )}
        </Panel>
      </div>

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4">
        <Panel title={`Core allocation — ${result.positions.length} positions`}>
          {capitalUsd === 0 ? (
            <p className="text-xs text-term-dim">
              Enter a capital amount above to size the allocation.
            </p>
          ) : result.positions.length === 0 ? (
            <p className="text-xs text-term-dim">
              No eligible candidates at this capital / risk setting.
            </p>
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
                {result.positions.map((row) => (
                  <tr
                    key={row.position.ticker}
                    className="border-b border-term-line/60 last:border-b-0"
                  >
                    <td className="py-2 pr-2 align-top">
                      <span className="font-bold text-term-text">{row.position.ticker}</span>
                      <span className="mt-0.5 block text-[10px] text-term-dim">
                        {row.position.name}
                      </span>
                      <span className={`mt-0.5 block text-[10px] ${factorColor[row.position.factors[0]]}`}>
                        {FACTOR_LABELS[row.position.factors[0]]}
                      </span>
                    </td>
                    <td className="py-2 pr-2 text-right align-top tabular-nums text-term-text">
                      {row.position.conviction}/5
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <div className="text-right tabular-nums text-term-text">
                        {pct(row.weight)}
                        {(row.nameCapped || row.factorCapped) && (
                          <span
                            className="ml-1 text-[10px] text-term-yellow"
                            title={
                              row.nameCapped && row.factorCapped
                                ? 'Held down by both the per-name and the per-factor limit'
                                : row.nameCapped
                                  ? 'Held at the per-name limit'
                                  : 'Held down by the per-factor limit'
                            }
                          >
                            ●
                          </span>
                        )}
                      </div>
                      {/* Scaled against the per-name cap, so a full bar is a
                          position at its ceiling — the same reading as the
                          factor bars above. */}
                      <div className="mt-1 ml-auto w-16">
                        <Bar
                          share={result.perNameCapPct ? row.weight / result.perNameCapPct : 0}
                          className={row.nameCapped ? 'bg-term-red' : 'bg-term-amber'}
                        />
                      </div>
                    </td>
                    <td className="py-2 pr-2 text-right align-top tabular-nums text-term-dim">
                      {usd(row.dollars)}
                    </td>
                    <td className="py-2 align-top text-[11px] leading-relaxed text-term-dim">
                      {row.rationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
            Weighted proportional to <span className="text-term-text">conviction</span> (1-5) raised
            to the tilt above, then filled bucket by bucket so no name in a crowded factor is left
            at zero. No win-probability or Kelly-style math — nothing in positions.ts supports that
            precision. <span className="text-term-yellow">●</span> marks a position a cap held below
            its raw conviction-weighted size. Each rationale is the position&rsquo;s own{' '}
            <span className="text-term-text">edge</span> field, verbatim.
          </p>
        </Panel>
      </div>

      {/* ------------------------------------------------------------------ */}
      {sleeve && (
        <div className="mt-4">
          <Panel title={`Leverage sleeve — ${usd(sleeve.premiumUsd)} premium budget, ${pct(sleeve.targetShare)} of capital`}>
            <div className="border border-term-red/60 bg-term-bg p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-term-red">
                Options overlay — read before acting
              </p>
              <p className="mt-2 text-xs leading-relaxed text-term-text">
                Structure only, not a tradable quote: a moderately out-of-the-money call,
                roughly 2-4 months to expiry, sized so total premium loss across the sleeve is
                capped at {pct(sleeve.targetShare)} of total capital. No strikes, premiums,
                implied volatility or greeks are shown — this is a static site with no live market
                data, and a plausible-looking fake number is worse than none.{' '}
                <span className="text-term-yellow">Check a live options chain before acting.</span>
              </p>
              <div className="mt-3 space-y-2">
                {sleeve.legs.map((leg) => (
                  <div key={leg.position.ticker} className="flex items-baseline justify-between">
                    <span className="text-xs">
                      <span className="font-bold text-term-text">{leg.position.ticker}</span>{' '}
                      <span className="text-term-dim">conv. {leg.position.conviction}/5</span>
                    </span>
                    <span className="text-xs tabular-nums text-term-amber">
                      {usd(leg.premiumUsd)} premium ({pct(leg.premiumShare * sleeve.targetShare)} of capital)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-term-dim">
              Drawn only from names already in the core allocation above — never a separate pick.
              The book is unlevered by construction (see the Exposure tab&rsquo;s July 2026
              drawdown reference); this sleeve exists so a leveraged view on the best idea is
              possible without the correlated, ~4x structure that forced that fund&rsquo;s
              liquidation. The premium budget is a separate slice of capital, not carved out of the
              positions above — turning the toggle on never reduces the core allocation&rsquo;s
              sizing.
            </p>
          </Panel>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      <div className="mt-4">
        <Panel title="What this tab cannot tell you">
          <ul className="space-y-2 text-[11px] leading-relaxed text-term-dim">
            <li>
              <span className="text-term-yellow">Conviction is derived, not stated.</span> Same
              caveat as the Exposure tab: values are mapped mechanically from each dashboard&rsquo;s
              own risk-profile tier, not Matthias&rsquo;s judgement.
            </li>
            <li>
              <span className="text-term-yellow">
                Only {result.sizeableUniverseCount} of {result.longUniverseCount} long names are
                sizeable.
              </span>{' '}
              A position is eligible only if it carries a documented{' '}
              <span className="text-term-text">edge</span>. The other{' '}
              {result.longUniverseCount - result.sizeableUniverseCount} carry a{' '}
              <span className="text-term-text">note</span>, which positions.ts defines as a
              transcription caveat — what the source did not say — and which is frequently a bear
              case (&ldquo;option value, not a business&rdquo;, &ldquo;the conglomerate discount is
              deserved&rdquo;). Printing one of those beside a dollar amount would state the reason
              not to own a name as the reason to own it. Citrini-only entries are third-party idea
              flow and excluded separately.
            </li>
            <li>
              <span className="text-term-yellow">No live pricing.</span> Weights are dollar
              allocations at today&rsquo;s capital figure, not share counts — this tab does not know
              current prices.
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
