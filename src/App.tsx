import { useEffect, useState } from 'react'
import { STALE_AFTER_DAYS, STATUS_DESCRIPTION, type EntryStatus } from './types'
import { ExposurePanel } from './sections/exposure/ExposurePanel'
import { AllocatorPanel } from './sections/allocator/AllocatorPanel'
import { EmbeddedDashboard } from './components/EmbeddedDashboard'
import { OpportunitiesPanel } from './sections/opportunities/OpportunitiesPanel'

type Tab = {
  id: string
  label: string
  kind: 'opportunities' | 'exposure' | 'allocator' | 'embed'
  src?: string
  title?: string
  vintage?: string
  status?: Exclude<EntryStatus, 'stale'>
  researchOnly?: boolean
  staleAfterDays?: number
  reviewRequiredAfter?: string
}

const TABS: Tab[] = [
  { id: 'opportunities', label: 'OPPORTUNITIES', kind: 'opportunities' },
  { id: 'exposure', label: 'EXPOSURE', kind: 'exposure' },
  { id: 'allocator', label: 'PLAN', kind: 'allocator' },
  { id: 'biology', label: 'DIGITAL BIOLOGY', kind: 'embed', src: 'dashboards/digital-biology.html', title: 'Digital Biology dashboard', vintage: '2026-07-07', status: 'hypothesis', researchOnly: true },
  { id: 'robotics', label: 'ROBOTICS', kind: 'embed', src: 'dashboards/robotics.html', title: 'Robotics landscape dashboard', vintage: '2026-07-09', status: 'hypothesis', researchOnly: true },
  { id: 'quantum', label: 'QUANTUM', kind: 'embed', src: 'dashboards/quantum.html', title: 'Quantum computing dashboard', vintage: '2026-07-15', status: 'watchlist', researchOnly: true },
  { id: 'agentic', label: 'AGENTIC', kind: 'embed', src: 'dashboards/agentic.html', title: 'Agent economy dashboard', vintage: '2026-07-09', status: 'hypothesis', researchOnly: true },
  { id: 'photonics', label: 'PHOTONICS', kind: 'embed', src: 'dashboards/photonics.html', title: 'Photonics and optical interconnect dashboard', vintage: '2026-08-07', status: 'hypothesis', researchOnly: true, staleAfterDays: 7, reviewRequiredAfter: '2026-08-11' },
  { id: 'defense', label: 'DEFENCE R/O', kind: 'embed', src: 'dashboards/defense.html', title: 'Defence and autonomy research dashboard', vintage: '2026-08-11', status: 'hypothesis', researchOnly: true },
]

const STATUS_COLOR: Record<EntryStatus, string> = {
  confirmed: 'border-term-green text-term-green',
  hypothesis: 'border-term-cyan text-term-cyan',
  watchlist: 'border-term-amber text-term-amber',
  stale: 'border-term-red text-term-red',
}

function TabStatus({ tab }: { tab: Tab }) {
  if (!tab.vintage || !tab.status) return null
  const days = Math.floor((Date.now() - Date.parse(`${tab.vintage}T00:00:00Z`)) / 86_400_000)
  const stale = days > (tab.staleAfterDays ?? STALE_AFTER_DAYS) || Boolean(tab.reviewRequiredAfter && Date.now() >= Date.parse(`${tab.reviewRequiredAfter}T00:00:00Z`))
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-term-line bg-term-bg px-4 py-1.5 text-[10px] uppercase tracking-wider text-term-dim">
      <span className={`border px-1 ${STATUS_COLOR[tab.status]}`} title={STATUS_DESCRIPTION[tab.status]}>{tab.status}</span>
      {stale && <span className={`border px-1 ${STATUS_COLOR.stale}`} title={STATUS_DESCRIPTION.stale}>stale</span>}
      {tab.researchOnly && <span className="border border-term-yellow px-1 text-term-yellow">research only · not order eligible</span>}
      <span>data as of {tab.vintage} · {days} {days === 1 ? 'day' : 'days'} old</span>
      <span className="text-term-dim/70">page is a static snapshot — a new evidence record in Plan is required</span>
      {tab.reviewRequiredAfter && stale && <span className="text-term-red">mandatory review triggered {tab.reviewRequiredAfter}</span>}
    </div>
  )
}

const LEGACY: Record<string, string> = {
  defense: 'defense', photonics: 'photonics', biology: 'biology', robotics: 'robotics',
  quantum: 'quantum', agentic: 'agentic', exposure: 'exposure',
  opportunities: 'opportunities', allocator: 'allocator',
}

function tabFromHash() {
  let hash = window.location.hash.replace(/^#/, '')
  if (hash.startsWith('equities/')) hash = hash.slice('equities/'.length)
  const requested = LEGACY[hash] ?? hash
  return TABS.some((tab) => tab.id === requested) ? requested : TABS[0].id
}

function App() {
  const [tabId, setTabId] = useState(tabFromHash)
  useEffect(() => {
    const onHashChange = () => setTabId(tabFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const active = TABS.find((tab) => tab.id === tabId) ?? TABS[0]
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-term-bg font-mono text-term-text">
      <header className="shrink-0 border-b border-term-line bg-term-bg">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
          <a href="#opportunities" className="text-xs font-bold uppercase tracking-[0.2em] text-term-amber hover:underline">Investment Intelligence</a>
          <span className="text-term-line">/</span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-term-cyan">EQUITIES</span>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 pb-2">
          <nav className="flex flex-nowrap gap-px overflow-x-auto text-xs" aria-label="Equity sections">
            {TABS.map((tab, index) => (
              <a key={tab.id} href={`#${tab.id}`} aria-current={active.id === tab.id ? 'page' : undefined}
                className={`shrink-0 px-3 py-1.5 uppercase tracking-wider transition-colors ${active.id === tab.id ? 'bg-term-amber font-bold text-black' : 'text-term-dim hover:bg-term-panel hover:text-term-amber'}`}>
                {index + 1} {tab.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        {active.kind === 'opportunities' && <div className="h-full overflow-y-auto"><OpportunitiesPanel /></div>}
        {active.kind === 'exposure' && <div className="h-full overflow-y-auto"><ExposurePanel /></div>}
        {active.kind === 'allocator' && <div className="h-full overflow-y-auto"><AllocatorPanel /></div>}
        {active.kind === 'embed' && active.src && (
          <div className="flex h-full flex-col">
            <TabStatus tab={active} />
            <div className="min-h-0 flex-1"><EmbeddedDashboard src={active.src} title={active.title ?? active.label} /></div>
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t border-term-line bg-term-bg">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-1 px-4 py-1 text-[10px] uppercase tracking-wider text-term-dim sm:flex-row sm:items-center sm:justify-between">
          <span>Research only · no positions held · unlevered by construction · public sources · not investment advice</span>
          <span>snobistisch/investment-dashboard</span>
        </div>
      </footer>
    </div>
  )
}

export default App
