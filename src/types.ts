// The status taxonomy, and the one place it is defined.
//
// This file used to describe a tracker that no longer ships, and had been dead
// code since 11 Aug 2026. It is repurposed rather than deleted, because the gap
// it now fills is real: seven embedded dashboards render theses, evidence and
// speculation in identical visual weight, and a reader has to infer which is
// which from the prose.
//
// Four values, in descending order of how much weight a claim can carry.
export type EntryStatus =
  /** Checked against a primary source — a filing, an on-chain figure, a
   *  statute. The number is what the source says, and the source is named. */
  | 'confirmed'
  /** An argument, held with stated confidence and a stated falsifier. It may
   *  be well reasoned and still be wrong; that is the point of the label. */
  | 'hypothesis'
  /** Followed, not held. Preparation rather than conviction — the thing to
   *  watch is named, and no position follows from it. */
  | 'watchlist'
  /** The reasoning may stand; the data behind it does not. Anything whose
   *  vintage is older than roughly one reporting cycle. Applied by date, not
   *  by judgement — see the vintage badge on each embedded dashboard. */
  | 'stale'

export const STATUS_LABEL: Record<EntryStatus, string> = {
  confirmed: 'confirmed',
  hypothesis: 'hypothesis',
  watchlist: 'watchlist',
  stale: 'stale',
}

/** What each status means, shown on hover rather than in a legend nobody
 *  reads. Kept next to the type so the two cannot drift. */
export const STATUS_DESCRIPTION: Record<EntryStatus, string> = {
  confirmed: 'Checked against a primary source, which is named on the page.',
  hypothesis: 'An argument with a stated confidence and a stated falsifier, not a fact.',
  watchlist: 'Followed rather than held. No position follows from it.',
  stale: 'Data older than roughly one reporting cycle. The reasoning may stand; the numbers do not.',
}

/** Days after which a page's data is called stale. One reporting cycle, give
 *  or take — past this a price on a static page is decoration. The embedded
 *  dashboards apply the same threshold in their own vintage badge. */
export const STALE_AFTER_DAYS = 14

/** Shared shape for a research-tracker entry, kept for a future section that
 *  lists entries rather than computing over them. No section uses it today;
 *  README "Adding a section" describes the pattern it belongs to. */
export interface TrackerEntry {
  theme: string
  thesis: string
  sourceUrl: string
  /** ISO date (YYYY-MM-DD) or 'unknown' — never a guessed date. */
  date: string
  status: EntryStatus
  /** Optional note shown alongside status, e.g. what the status is based on. */
  note?: string
}
