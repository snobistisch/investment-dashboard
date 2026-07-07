// Shared shape for every research-tracker entry across all sections.
export type EntryStatus =
  | 'active' // source supports an ongoing/still-held view
  | 'no update' // disclosed once, no public follow-up since
  | 'reversed' // explicitly walked back in a public source
  | 'unverified/ambiguous' // public commentary too thin or contradictory
  | 'unknown'

export interface TrackerEntry {
  theme: string
  thesis: string
  sourceUrl: string
  /** ISO date (YYYY-MM-DD) or 'unknown' — never a guessed date. */
  date: string
  status: EntryStatus
  /** Optional note shown alongside status, e.g. what makes it ambiguous. */
  note?: string
}
