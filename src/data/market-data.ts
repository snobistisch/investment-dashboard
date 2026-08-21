// Live market data: runtime read, and the merge that resolves each position to
// an effective market cap and date.
//
// ---------------------------------------------------------------------------
// Why this is a separate layer
// ---------------------------------------------------------------------------
// positions.ts is a transcription with per-section sourcing. Writing live
// values into it would destroy the property that makes it worth trusting, so
// live values stay here and are merged at read time. Every merged row carries
// where its number came from, and the UI shows it. A stale snapshot is visible
// as stale rather than presented as current.
//
// ---------------------------------------------------------------------------
// Three-step fallback — the site is never worse off than before this existed
// ---------------------------------------------------------------------------
//   1. raw.githubusercontent.com — fresh within minutes of a refresh commit,
//      without waiting for a Pages rebuild.
//   2. the copy bundled from public/data/ — always as new as the last deploy.
//   3. nothing — every row falls back to its transcribed value, which is
//      exactly what the site showed before any of this was added.
//
// Both network reads are cache-busted and time-limited. The load runs in an
// effect, so a slow provider delays nothing on first paint.

import { useEffect, useState } from 'react'
import type { Position } from './positions'
import { positions } from './positions'

const RAW_URL =
  'https://raw.githubusercontent.com/snobistisch/investment-dashboard/main/public/data/market-data.json'

/** Vite's base is './', so this resolves next to the page on Pages and in dev. */
const BUNDLED_URL = `${import.meta.env.BASE_URL}data/market-data.json`

const TIMEOUT_MS = 4_000
const SCHEMA_VERSION = 1

export interface MarketStats {
  windowDays: number
  realisedVolPct: number
  maxDrawdownPct: number
  julyDrawdownPct?: number
}

/** Price return per window, in percent, measured in USD so venues compare.
 *  A window the price history does not cover is absent, never approximated. */
export interface MarketReturns {
  d1?: number
  w1?: number
  m1?: number
  m3?: number
  m6?: number
  y1?: number
}

export const RETURN_COLUMNS = [
  ['d1', '1D'],
  ['w1', '1W'],
  ['m1', '1M'],
  ['m3', '3M'],
  ['m6', '6M'],
  ['y1', '1Y'],
] as const

export interface MarketQuote {
  symbol: string
  provider: 'yahoo' | 'coingecko'
  providerName: string
  currency: string
  /** Last close in the listing currency. */
  priceLocal: number
  /** Last close in USD, converted at the snapshot's FX rate. */
  priceUsd?: number
  returns?: MarketReturns
  /** USD billions, matching the units positions.ts uses. */
  marketCapUsd?: number
  asOf: string
  stats?: MarketStats
}

export interface MarketSnapshot {
  schemaVersion: number
  fetchedAt: string
  providers: { equity: string; crypto: string; fx: string }
  fx: { asOf: string; source: string; usdPer: Record<string, number>; usdPerEur?: number }
  quotes: Record<string, MarketQuote>
  /** Pearson correlations of aligned daily USD log returns, keyed by sorted tickers. */
  correlations?: Record<string, { value: number; observations: number }>
  unmapped: { ticker: string; exchange: string; reason: string }[]
}

export type SnapshotSource = 'remote' | 'bundled' | 'none'

async function load(url: string): Promise<MarketSnapshot | null> {
  try {
    const res = await fetch(`${url}?t=${Date.now()}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as MarketSnapshot
    // The only validation in this file. External data enters here and nowhere
    // else, so this is the one place a shape check belongs.
    if (data?.schemaVersion !== SCHEMA_VERSION) return null
    if (!data.quotes || typeof data.quotes !== 'object') return null
    if (!data.fx?.usdPer) return null
    return data
  } catch {
    return null
  }
}

export interface SnapshotState {
  snapshot: MarketSnapshot | null
  source: SnapshotSource
  loading: boolean
}

/** Shared across callers. Exposure and Allocator both want the snapshot and
 *  mount together, so without this they fetch the same file twice a
 *  millisecond apart — and raw.githubusercontent rate-limits. The snapshot
 *  cannot change during a session, so the resolved promise is kept. */
let inFlight: Promise<Omit<SnapshotState, 'loading'>> | null = null

function stamp(s: MarketSnapshot | null) {
  const t = s ? Date.parse(s.fetchedAt) : NaN
  return Number.isNaN(t) ? -Infinity : t
}

function loadSnapshot() {
  inFlight ??= (async () => {
    // In dev the local file is the one being worked on; the copy on main is
    // whatever was last deployed. Never go to the network for it.
    if (import.meta.env.DEV) {
      const local = await load(BUNDLED_URL)
      return local
        ? { snapshot: local, source: 'bundled' as const }
        : { snapshot: null, source: 'none' as const }
    }

    // Both, then the newer one wins.
    //
    // Remote-first was wrong, and it showed the first time a deploy changed the
    // schema: raw.githubusercontent caches for five minutes and its edges
    // disagree with each other, so the freshly deployed site read a snapshot
    // one commit behind and rendered empty price and return columns for fields
    // it had just shipped. Reading whichever copy is actually newer keeps the
    // freshness the remote read exists for, without ever being worse than the
    // build. They are fetched together, so this costs no extra latency.
    const [remote, bundled] = await Promise.all([load(RAW_URL), load(BUNDLED_URL)])
    if (!remote && !bundled) return { snapshot: null, source: 'none' as const }
    return stamp(remote) > stamp(bundled)
      ? { snapshot: remote, source: 'remote' as const }
      : { snapshot: bundled, source: 'bundled' as const }
  })()
  return inFlight
}

export function useMarketSnapshot(): SnapshotState {
  const [state, setState] = useState<SnapshotState>({
    snapshot: null,
    source: 'none',
    loading: true,
  })

  useEffect(() => {
    let live = true
    void loadSnapshot().then((result) => {
      if (live) setState({ ...result, loading: false })
    })
    return () => {
      live = false
    }
  }, [])

  return state
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

/** Where a displayed market cap came from. 'absent' means neither the snapshot
 *  nor positions.ts states one — which stays absent rather than being filled
 *  with a plausible guess. */
export type CapSource = 'live' | 'transcribed' | 'absent'

/** A position with live values merged over it. Extends Position, so every
 *  existing analysis function operates on it unchanged. */
export interface EffectivePosition extends Position {
  capSource: CapSource
  /** 'live' whenever the snapshot priced the row, even if it carried no cap. */
  dateSource: 'live' | 'transcribed'
  /** Kept so the before/after audit can show what the live number replaced. */
  transcribedCapUsd?: number
  providerSymbol?: string
  providerName?: string
  stats?: MarketStats
  /** Last close in USD, and the return over each window. Absent on rows no
   *  snapshot priced — there is no transcribed price to fall back to, since
   *  positions.ts never carried one. */
  priceUsd?: number
  returns?: MarketReturns
}

export function mergePositions(snapshot: MarketSnapshot | null): EffectivePosition[] {
  return positions.map((p) => {
    const q = snapshot?.quotes[p.ticker]
    const liveCap = q?.marketCapUsd
    const capSource: CapSource =
      liveCap !== undefined ? 'live' : p.marketCapUsd !== undefined ? 'transcribed' : 'absent'

    return {
      ...p,
      marketCapUsd: liveCap ?? p.marketCapUsd,
      asOf: q ? q.asOf : p.asOf,
      capSource,
      dateSource: q ? 'live' : 'transcribed',
      transcribedCapUsd: p.marketCapUsd,
      providerSymbol: q?.symbol,
      providerName: q?.providerName,
      stats: q?.stats,
      priceUsd: q?.priceUsd,
      returns: q?.returns,
    }
  })
}

/** Coverage before and after the merge, so the improvement is auditable rather
 *  than asserted. */
export function coverageDelta(book: EffectivePosition[]) {
  const live = book.filter((p) => p.capSource === 'live').length
  const transcribed = book.filter((p) => p.capSource === 'transcribed').length
  const absent = book.filter((p) => p.capSource === 'absent').length
  return {
    total: book.length,
    live,
    transcribed,
    absent,
    /** What positions.ts alone covers — the figure before any of this. */
    before: book.filter((p) => p.transcribedCapUsd !== undefined).length,
    after: live + transcribed,
  }
}

/** Rows where the live cap diverges from the transcribed one by more than
 *  `threshold`. The photonics rows match to within 1%; the gaps cluster in the
 *  sections whose own headers say the figures were not re-verified. */
export function capRevisions(book: EffectivePosition[], threshold = 0.25) {
  return book
    .filter((p) => p.capSource === 'live' && p.transcribedCapUsd !== undefined)
    .map((p) => ({
      position: p,
      transcribed: p.transcribedCapUsd as number,
      live: p.marketCapUsd as number,
      delta: (p.marketCapUsd as number) / (p.transcribedCapUsd as number) - 1,
    }))
    .filter((r) => Math.abs(r.delta) >= threshold)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
}

/** Age of the snapshot in whole days, for the staleness banner. */
export function snapshotAgeDays(snapshot: MarketSnapshot | null, now = Date.now()) {
  if (!snapshot) return undefined
  const t = Date.parse(snapshot.fetchedAt)
  if (Number.isNaN(t)) return undefined
  return Math.max(0, Math.floor((now - t) / 86_400_000))
}
