// States, on screen, where the numbers below it came from.
//
// The point is that a stale snapshot reads as stale rather than as current.
// Coverage is given as live / transcribed / absent rather than as one
// percentage, because those three are different claims: measured today,
// copied from a source on a stated date, and not known at all.

import type { EffectivePosition, SnapshotSource } from '../data/market-data'
import { coverageDelta, snapshotAgeDays, type MarketSnapshot } from '../data/market-data'

/** Beyond this the snapshot is called out rather than shown as fresh. Sits
 *  above the weekday refresh cadence so a normal weekend is not flagged. */
export const SNAPSHOT_STALE_DAYS = 4

const SOURCE_LABEL: Record<SnapshotSource, string> = {
  remote: 'committed market snapshot',
  bundled: 'market snapshot bundled with this build',
  none: 'market snapshot unavailable · transcribed values only',
}

export function DataProvenance({
  snapshot,
  source,
  loading,
  book,
}: {
  snapshot: MarketSnapshot | null
  source: SnapshotSource
  loading: boolean
  book: EffectivePosition[]
}) {
  const cov = coverageDelta(book)
  const age = snapshotAgeDays(snapshot)
  const stale = age !== undefined && age > SNAPSHOT_STALE_DAYS

  const tone = source === 'none' ? 'text-term-yellow' : stale ? 'text-term-yellow' : 'text-term-cyan'
  const border = source === 'none' || stale ? 'border-term-yellow/70' : 'border-term-line'

  return (
    <div className={`mb-4 border ${border} bg-term-panel p-3`}>
      <p className={`text-[10px] uppercase tracking-[0.2em] ${tone}`}>
        {loading ? 'loading market snapshot…' : SOURCE_LABEL[source]}
        {snapshot && (
          <>
            {' · '}
            {snapshot.fetchedAt.slice(0, 10)}
            {age !== undefined && ` · ${age === 0 ? 'today' : `${age}d old`}`}
          </>
        )}
      </p>

      <p className="mt-2 text-xs leading-relaxed text-term-text">
        <span className="text-term-cyan tabular-nums">{cov.live}</span> current ·{' '}
        <span className="tabular-nums">{cov.transcribed}</span> transcribed ·{' '}
        <span className="text-term-dim tabular-nums">{cov.absent}</span> without market cap ·{' '}
        <span className="tabular-nums">{cov.total}</span> researched names in total.
        {cov.live > 0 && (
          <>
            {' '}
            positions.ts supplies market caps for{' '}
            <span className="tabular-nums">
              {cov.before}/{cov.total}
            </span>{' '}
            names; the committed snapshot raises coverage to{' '}
            <span className="text-term-cyan tabular-nums">
              {cov.after}/{cov.total}
            </span>
            .
          </>
        )}
      </p>

      {stale && (
        <p className="mt-2 text-xs leading-relaxed text-term-yellow">
          This snapshot is {age} days old. Weekday refreshes should keep it within {SNAPSHOT_STALE_DAYS} days,
          so treat every current-market figure below as stale.
        </p>
      )}

      {source === 'none' && !loading && (
        <p className="mt-2 text-xs leading-relaxed text-term-text">
          The snapshot could not be read. Every figure below therefore comes from positions.ts and
          keeps its own stated date. No missing current price has been estimated.
        </p>
      )}

      {snapshot && (
        <p className="mt-2 text-[11px] leading-relaxed text-term-dim">
          Equities {snapshot.providers.equity} · FX {snapshot.providers.fx}, {snapshot.fx.asOf}. The merge happens only when the page
          loads; positions.ts remains unchanged, and each row identifies the value it shows.
          {snapshot.unmapped.length > 0 && (
            <>
              {' '}
              <span className="text-term-text">
                {snapshot.unmapped.length} ticker
                {snapshot.unmapped.length === 1 ? '' : 's'} deliberately unmapped
              </span>{' '}
              ({snapshot.unmapped.map((u) => u.ticker).join(', ')}). No symbol could be resolved
              with enough confidence, so these rows retain their transcribed values. Missing data
              is safer than attaching another company&rsquo;s price.
            </>
          )}
        </p>
      )}
    </div>
  )
}
