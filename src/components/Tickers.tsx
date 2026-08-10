// Names the constituents of an aggregate row.
//
// Every table on the Exposure and Allocator tabs used to report a bucket — a
// factor, a chain layer — as a count and a total. That is checkable only if
// you already know which names are in it. These render the names inline, so a
// row can be read against the book without cross-referencing anything.

export interface TickerItem {
  ticker: string
  /** Shown after the ticker where a row has a figure worth carrying. */
  detail?: string
  /** Set where the figure behind the name came from a live quote. */
  live?: boolean
  /** Set where a name carries no market cap at all. */
  absent?: boolean
}

/** Inline list, for sitting under an aggregate row inside a table cell. */
export function Tickers({ items, max = 40 }: { items: TickerItem[]; max?: number }) {
  if (items.length === 0) return <span className="text-[10px] text-term-dim">none</span>
  const shown = items.slice(0, max)
  const rest = items.length - shown.length

  return (
    <span className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[10px] leading-tight">
      {shown.map((t) => (
        <span key={t.ticker} className="whitespace-nowrap">
          <span className={t.absent ? 'text-term-dim' : 'text-term-text'}>{t.ticker}</span>
          {t.live && <span className="text-term-cyan">*</span>}
          {t.detail && <span className="ml-1 text-term-dim tabular-nums">{t.detail}</span>}
        </span>
      ))}
      {rest > 0 && <span className="text-term-dim">+{rest} more</span>}
    </span>
  )
}
