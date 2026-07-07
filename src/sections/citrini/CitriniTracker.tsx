import { Section } from '../../components/Section'
import { citriniEntries } from './data'

// To add a new tracker: copy this folder (component + data.ts),
// point it at its own data file, and render it from App.tsx.
export function CitriniTracker() {
  return (
    <Section
      title="Citrini Research Tracker"
      description="Free, public-source-only tracker of themes and calls disclosed by Citrini Research (@Citrini7). Built exclusively from public posts, the free Substack tier, and interviews."
    >
      {citriniEntries.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-400">
          No entries yet. Research pending (Phase 1).
        </p>
      ) : (
        <ul className="space-y-3">
          {citriniEntries.map((entry) => (
            <li key={entry.theme}>{entry.theme}</li>
          ))}
        </ul>
      )}
    </Section>
  )
}
