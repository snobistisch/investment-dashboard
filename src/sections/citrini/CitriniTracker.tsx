import { Section } from '../../components/Section'
import type { EntryStatus } from '../../types'
import { citriniEntries } from './data'

const statusStyles: Record<EntryStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  closed: 'bg-neutral-100 text-neutral-600 ring-neutral-500/20',
  watchlist: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  scenario: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  reversed: 'bg-red-50 text-red-700 ring-red-600/20',
  'no free update': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'unverified/ambiguous': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  unknown: 'bg-neutral-100 text-neutral-500 ring-neutral-500/20',
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
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="min-w-[64rem] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3 font-medium">Theme / Company</th>
              <th className="px-4 py-3 font-medium">Thesis</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.theme + entry.date}
                className="border-b border-neutral-100 align-top last:border-b-0"
              >
                <td className="w-44 px-4 py-3 font-medium text-neutral-900">
                  {entry.theme}
                </td>
                <td className="max-w-xl px-4 py-3 text-neutral-600">{entry.thesis}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <a
                    href={entry.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 underline decoration-sky-300 underline-offset-2 hover:decoration-sky-600"
                  >
                    {sourceLabel(entry.sourceUrl)}
                  </a>
                </td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-600">
                  {entry.date}
                </td>
                <td className="w-72 px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[entry.status]}`}
                  >
                    {entry.status}
                  </span>
                  {entry.note && (
                    <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                      {entry.note}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-neutral-400">
        {entries.length} entries, newest first. Every entry has a direct public
        source; anything without one was excluded (see research notes in the
        repo).
      </p>
    </Section>
  )
}
