import { Section } from '../../components/Section'
import type { EntryStatus } from '../../types'
import { citriniEntries } from './data'

// Terminal-style status colors: colored uppercase text in square brackets.
const statusColor: Record<EntryStatus, string> = {
  active: 'text-term-green',
  closed: 'text-term-dim',
  watchlist: 'text-term-cyan',
  scenario: 'text-term-magenta',
  reversed: 'text-term-red',
  'no free update': 'text-term-yellow',
  'unverified/ambiguous': 'text-term-red',
  unknown: 'text-term-dim',
}

function sourceLabel(url: string) {
  return new URL(url).hostname.replace(/^www\./, '')
}

// To add a new tracker: copy this folder (component + data.ts),
// point it at its own data file, and render it from App.tsx.
export function CitriniTracker() {
  const entries = [...citriniEntries].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Section
      title="Citrini Research Tracker"
      description="Free, public-source-only tracker of themes and calls disclosed by Citrini Research (@Citrini7). Built exclusively from the free Substack tier, public podcast pages and public posts; the paid Citrindex is not accessed or reconstructed. Not affiliated with Citrini Research. Nothing here is investment advice."
    >
      <div className="overflow-x-auto border border-term-line bg-term-panel">
        <table className="min-w-[64rem] w-full text-left text-xs">
          <thead>
            <tr className="border-b border-term-line text-[10px] uppercase tracking-[0.15em] text-term-amber">
              <th className="px-3 py-2 font-bold">Theme / Company</th>
              <th className="px-3 py-2 font-bold">Thesis</th>
              <th className="px-3 py-2 font-bold">Source</th>
              <th className="px-3 py-2 font-bold">Date</th>
              <th className="px-3 py-2 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.theme + entry.date}
                className="border-b border-term-line/60 align-top last:border-b-0 hover:bg-[#141414]"
              >
                <td className="w-44 px-3 py-2.5 font-bold uppercase leading-relaxed text-term-text">
                  {entry.theme}
                </td>
                <td className="max-w-xl px-3 py-2.5 leading-relaxed text-term-text/80">
                  {entry.thesis}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <a
                    href={entry.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-term-cyan hover:underline"
                  >
                    {sourceLabel(entry.sourceUrl)}
                  </a>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-term-dim">
                  {entry.date}
                </td>
                <td className="w-72 px-3 py-2.5">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${statusColor[entry.status]}`}
                  >
                    [{entry.status}]
                  </span>
                  {entry.note && (
                    <p className="mt-1 text-[11px] leading-relaxed text-term-dim">
                      {entry.note}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-term-dim">
        {entries.length} entries · newest first · every entry has a direct
        public source; anything without one was excluded
      </p>
    </Section>
  )
}
