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
  remote: 'live snapshot, read from the repo',
  bundled: 'snapshot bundled with this build',
  none: 'no snapshot — transcribed values only',
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
        {loading ? 'loading market data…' : SOURCE_LABEL[source]}
        {snapshot && (
          <>
            {' · '}
            {snapshot.fetchedAt.slice(0, 10)}
            {age !== undefined && ` · ${age === 0 ? 'today' : `${age}d old`}`}
          </>
        )}
      </p>

      <p className="mt-2 text-xs leading-relaxed text-term-text">
        <span className="text-term-cyan tabular-nums">{cov.live}</span> live ·{' '}
        <span className="tabular-nums">{cov.transcribed}</span> transcribed ·{' '}
        <span className="text-term-dim tabular-nums">{cov.absent}</span> no market cap at all, of{' '}
        <span className="tabular-nums">{cov.total}</span> positions.
        {cov.live > 0 && (
          <>
            {' '}
            Market-cap coverage was{' '}
            <span className="tabular-nums">
              {cov.before}/{cov.total}
            </span>{' '}
            from positions.ts alone; with the snapshot merged it is{' '}
            <span className="text-term-cyan tabular-nums">
              {cov.after}/{cov.total}
            </span>
            .
          </>
        )}
      </p>

      {stale && (
        <p className="mt-2 text-xs leading-relaxed text-term-yellow">
          This snapshot is {age} days old. The refresh runs on weekdays; a gap this size means it
          has been failing. Treat every live figure below as {age} days stale.
        </p>
      )}

      {source === 'none' && !loading && (
        <p className="mt-2 text-xs leading-relaxed text-term-text">
          The snapshot could not be read, so every figure below is the transcribed value from
          positions.ts on its own stated date — exactly what this dashboard showed before live data
          was wired in. Nothing here is a guess at a current price.
        </p>
      )}

      {snapshot && (
        <p className="mt-2 text-[11px] leading-relaxed text-term-dim">
          Equities {snapshot.providers.equity} · FX {snapshot.providers.fx}, {snapshot.fx.asOf}. positions.ts is not modified by any of
          this: live values are merged at read time, and every row below says which it is showing.
          {snapshot.unmapped.length > 0 && (
            <>
              {' '}
              <span className="text-term-text">
                {snapshot.unmapped.length} ticker
                {snapshot.unmapped.length === 1 ? '' : 's'} deliberately unmapped
              </span>{' '}
              ({snapshot.unmapped.map((u) => u.ticker).join(', ')}) — no symbol could be resolved
              with certainty, so they keep their transcribed values. A wrong symbol returning
              another company&rsquo;s price is worse than a missing one.
            </>
          )}
        </p>
      )}
    </div>
  )
}
