// Shared shape for every research-tracker entry across all sections.
export type EntryStatus =
  | 'active' // latest free source still supports the view
  | 'closed' // position/basket explicitly exited, or the event has passed
  | 'watchlist' // explicitly framed as preparation, not conviction
  | 'scenario' // explicitly a scenario/essay, not a call
  | 'reversed' // explicitly walked back in a public source
  | 'no free update' // disclosed once, no public follow-up since
  | 'unverified/ambiguous' // public commentary too thin or contradictory
  | 'unknown'

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
