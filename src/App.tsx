import { useEffect, useState } from 'react'
import { STALE_AFTER_DAYS, STATUS_DESCRIPTION, type EntryStatus } from './types'
import { ExposurePanel } from './sections/exposure/ExposurePanel'
import { AllocatorPanel } from './sections/allocator/AllocatorPanel'
import { EmbeddedDashboard } from './components/EmbeddedDashboard'
import { Landing } from './components/Landing'

// ---------------------------------------------------------------------------
// Two asset classes, split on purpose
// ---------------------------------------------------------------------------
// The repository transcribes equities and four crypto research rows, but those
// crypto rows are not holdings. Until August 2026 one allocation model treated
// them as a fixed mandate. The Crypto Pilot now starts from zero and the
// equities allocator excludes crypto completely.
//
// Matthias's instruction (13 Aug 2026) is the analytical reason to split rather
// than the cosmetic one: the hypotheses differ. Equities here are a bet on a
// named industrial bottleneck; crypto is a bet on float, fee capture and a
// benchmark that is bitcoin rather than zero. Averaging two different questions
// produces an answer to neither.
//
// Research, selection and sizing remain separate so a research row cannot turn
// into a position merely by appearing in positions.ts.
type AssetClass = 'equities' | 'crypto'

type Tab = {
  id: string
  label: string
  kind: 'exposure' | 'allocator' | 'embed'
  src?: string
  title?: string
  /** ISO date the embedded page's data was true. The page states its own
   *  vintage in its badge; this is the same date, held here so the shell can
   *  say it before the iframe has loaded. Absent for the computed tabs, which
   *  read the live snapshot instead. */
  vintage?: string
  /** What kind of claim the tab is making, on the taxonomy in types.ts.
   *  `stale` is never written here — it is derived from `vintage`, because a
   *  hand-maintained staleness flag is wrong the day after it is set. */
  status?: Exclude<EntryStatus, 'stale'>
  researchOnly?: boolean
  staleAfterDays?: number
  /** A known result or event after which the snapshot requires a fresh review. */
  reviewRequiredAfter?: string
}

const EQUITY_TABS: Tab[] = [
  { id: 'exposure', label: 'EXPOSURE', kind: 'exposure' },
  { id: 'allocator', label: 'PLAN', kind: 'allocator' },
  { id: 'biology', label: 'DIGITAL BIOLOGY', kind: 'embed', src: 'dashboards/digital-biology.html', title: 'Digital Biology dashboard', vintage: '2026-07-07', status: 'hypothesis', researchOnly: true },
  { id: 'robotics', label: 'ROBOTICS', kind: 'embed', src: 'dashboards/robotics.html', title: 'Robotics landscape dashboard', vintage: '2026-07-09', status: 'hypothesis', researchOnly: true },
  { id: 'quantum', label: 'QUANTUM', kind: 'embed', src: 'dashboards/quantum.html', title: 'Quantum computing dashboard', vintage: '2026-07-15', status: 'watchlist', researchOnly: true },
  { id: 'agentic', label: 'AGENTIC', kind: 'embed', src: 'dashboards/agentic.html', title: 'Agent economy dashboard', vintage: '2026-07-09', status: 'hypothesis', researchOnly: true },
  { id: 'photonics', label: 'PHOTONICS', kind: 'embed', src: 'dashboards/photonics.html', title: 'Photonics and optical interconnect dashboard', vintage: '2026-08-07', status: 'hypothesis', researchOnly: true, staleAfterDays: 7, reviewRequiredAfter: '2026-08-11' },
  { id: 'defense', label: 'DEFENCE R/O', kind: 'embed', src: 'dashboards/defense.html', title: 'Defence and autonomy research dashboard', vintage: '2026-08-11', status: 'hypothesis', researchOnly: true },
]

// Crypto has two decision views: the 40-asset ranking and the zero-holdings
// pilot. The deeper theme work remains in research notes until it carries a
// ranking that belongs in the dashboard.
const CRYPTO_TABS: Tab[] = [
  { id: 'assets', label: 'ASSETS', kind: 'embed', src: 'dashboards/crypto.html', title: 'Crypto and innovation research dashboard' , vintage: '2026-08-12', status: 'confirmed' },
  { id: 'pilot', label: 'PILOT', kind: 'embed', src: 'dashboards/portfolio.html', title: 'Crypto pilot — robust screen, orders and bitcoin benchmark' },
]


// The status strip above every embedded dashboard.
//
// The seven embedded pages render a thesis, a piece of evidence and a piece of
// speculation in the same visual weight, and the app shell around them said
// nothing at all. This says two things before the iframe loads: how old the
// page's data is, and what kind of claim the page is making. `stale` is
// computed from the vintage rather than stored, because a hand-set staleness
// flag is wrong the day after someone sets it.
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
      <span
        className={`border px-1 ${STATUS_COLOR[tab.status]}`}
        title={STATUS_DESCRIPTION[tab.status]}
      >
        {tab.status}
      </span>
      {stale && (
        <span
          className={`border px-1 ${STATUS_COLOR.stale}`}
          title={STATUS_DESCRIPTION.stale}
        >
          stale
        </span>
      )}
      {tab.researchOnly && <span className="border border-term-yellow px-1 text-term-yellow">research only · not order eligible</span>}
      <span>
        data as of {tab.vintage} · {days} {days === 1 ? 'day' : 'days'} old
      </span>
      <span className="text-term-dim/70">
        page is a static snapshot — a new evidence record in Plan is required
      </span>
      {tab.reviewRequiredAfter && stale && <span className="text-term-red">mandatory review triggered {tab.reviewRequiredAfter}</span>}
    </div>
  )
}

const TABS: Record<AssetClass, Tab[]> = { equities: EQUITY_TABS, crypto: CRYPTO_TABS }
const CLASS_LABEL: Record<AssetClass, string> = { equities: 'EQUITIES', crypto: 'CRYPTO' }

// Routing is `#<class>/<tab>`. The bare `#crypto` and `#defense` links that were
// shared before this change still resolve, so nothing already sent out breaks.
const LEGACY: Record<string, string> = {
  crypto: 'crypto/assets',
  defense: 'equities/defense',
  photonics: 'equities/photonics',
  biology: 'equities/biology',
  robotics: 'equities/robotics',
  quantum: 'equities/quantum',
  agentic: 'equities/agentic',
  exposure: 'equities/exposure',
  allocator: 'equities/allocator',
  'crypto/allocator': 'crypto/pilot',
  'crypto/builder': 'crypto/pilot',
  'crypto/exposure': 'crypto/pilot',
}

type Route = { cls: AssetClass; tab: string } | null

function routeFromHash(): Route {
  let h = window.location.hash.replace(/^#/, '')
  if (!h) return null
  if (LEGACY[h]) h = LEGACY[h]
  const [cls, tab] = h.split('/')
  if (cls !== 'equities' && cls !== 'crypto') return null
  const tabs = TABS[cls]
  const found = tabs.find((t) => t.id === tab)
  return { cls, tab: found ? found.id : tabs[0].id }
}

function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)
  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (!route) return <Landing />

  const { cls, tab } = route
  const tabs = TABS[cls]
  const active = tabs.find((t) => t.id === tab) ?? tabs[0]
  const other: AssetClass = cls === 'equities' ? 'crypto' : 'equities'

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-term-bg font-mono text-term-text">
      <header className="border-b border-term-line bg-term-bg">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
          <a
            href="#"
            className="text-xs font-bold uppercase tracking-[0.2em] text-term-amber hover:underline"
            title="Back to the asset-class chooser"
          >
            Investment Intelligence
          </a>
          <span className="text-term-line">/</span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-term-cyan">
            {CLASS_LABEL[cls]}
          </span>
          <a
            href={`#${other}`}
            className="ml-auto text-[10px] uppercase tracking-wider text-term-dim hover:text-term-amber"
          >
            switch to {CLASS_LABEL[other]} →
          </a>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 pb-2">
          <nav className="flex flex-wrap gap-px text-xs">
            {tabs.map((t, i) => (
              <a
                key={t.id}
                href={`#${cls}/${t.id}`}
                aria-current={active.id === t.id ? 'page' : undefined}
                className={`px-3 py-1.5 uppercase tracking-wider transition-colors ${
                  active.id === t.id
                    ? 'bg-term-amber font-bold text-black'
                    : 'text-term-dim hover:bg-term-panel hover:text-term-amber'
                }`}
              >
                {i + 1} {t.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        {active.kind === 'exposure' && (
          <div className="h-full overflow-y-auto">
            <ExposurePanel assetClass={cls} />
          </div>
        )}
        {active.kind === 'allocator' && (
          <div className="h-full overflow-y-auto">
            <AllocatorPanel />
          </div>
        )}
        {active.kind === 'embed' && active.src && (
          <div className="flex h-full flex-col">
            <TabStatus tab={active} />
            <div className="min-h-0 flex-1">
              <EmbeddedDashboard src={active.src} title={active.title ?? active.label} />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-term-line bg-term-bg">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-1 px-4 py-1 text-[10px] uppercase tracking-wider text-term-dim sm:flex-row sm:items-center sm:justify-between">
          <span>
            Research only · no positions held · unlevered by construction · public sources · not investment advice
          </span>
          <span>snobistisch/investment-dashboard</span>
        </div>
      </footer>
    </div>
  )
}

export default App
