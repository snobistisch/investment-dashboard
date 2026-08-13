import { useEffect, useState } from 'react'
import { ExposurePanel } from './sections/exposure/ExposurePanel'
import { AllocatorPanel } from './sections/allocator/AllocatorPanel'
import { EmbeddedDashboard } from './components/EmbeddedDashboard'
import { Landing } from './components/Landing'

// ---------------------------------------------------------------------------
// Two asset classes, split on purpose
// ---------------------------------------------------------------------------
// The book is 82 equity positions and 4 crypto positions. Until August 2026 one
// Exposure tab computed factor concentration across both, which put a $228bn ETH
// in the same buckets as a photonics small cap and sized them with one risk
// model. At 82-to-4 that distortion is invisible; it is still a distortion.
//
// Matthias's instruction (13 Aug 2026) is the analytical reason to split rather
// than the cosmetic one: the hypotheses differ. Equities here are a bet on a
// named industrial bottleneck; crypto is a bet on float, fee capture and a
// benchmark that is bitcoin rather than zero. Averaging two different questions
// produces an answer to neither.
//
// The allocation model already agreed with that — allocation.ts has carried a
// separate cryptoUniverse on a fixed 10% mandate for months. This change makes
// the interface say what the model already did.
type AssetClass = 'equities' | 'crypto'

type Tab = {
  id: string
  label: string
  kind: 'exposure' | 'allocator' | 'embed'
  src?: string
  title?: string
}

const EQUITY_TABS: Tab[] = [
  { id: 'exposure', label: 'EXPOSURE', kind: 'exposure' },
  { id: 'allocator', label: 'ALLOCATOR', kind: 'allocator' },
  { id: 'biology', label: 'DIGITAL BIOLOGY', kind: 'embed', src: 'dashboards/digital-biology.html', title: 'Digital Biology dashboard' },
  { id: 'robotics', label: 'ROBOTICS', kind: 'embed', src: 'dashboards/robotics.html', title: 'Robotics landscape dashboard' },
  { id: 'quantum', label: 'QUANTUM', kind: 'embed', src: 'dashboards/quantum.html', title: 'Quantum computing dashboard' },
  { id: 'agentic', label: 'AGENTIC', kind: 'embed', src: 'dashboards/agentic.html', title: 'Agent economy dashboard' },
  { id: 'photonics', label: 'PHOTONICS', kind: 'embed', src: 'dashboards/photonics.html', title: 'Photonics and optical interconnect dashboard' },
  { id: 'defense', label: 'DEFENCE', kind: 'embed', src: 'dashboards/defense.html', title: 'Defence and autonomy research dashboard' },
]

// Crypto themes. Deliberately fewer than the equity side: a tab asserts a ranked
// view, and only the assets tab currently has one. Hooks & MEV and Base have
// research notes in research/ but no ranking yet, so they are not tabs.
const CRYPTO_TABS: Tab[] = [
  { id: 'exposure', label: 'EXPOSURE', kind: 'exposure' },
  { id: 'allocator', label: 'ALLOCATOR', kind: 'allocator' },
  { id: 'assets', label: 'ASSETS', kind: 'embed', src: 'dashboards/crypto.html', title: 'Crypto and innovation research dashboard' },
]

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
  // Leverage state is the single most important risk fact about any book — the
  // difference between the July 2026 drawdown being survivable and terminal.
  const [leverageActive, setLeverageActive] = useState(false)

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
            <AllocatorPanel assetClass={cls} onLeverageChange={setLeverageActive} />
          </div>
        )}
        {active.kind === 'embed' && active.src && (
          <EmbeddedDashboard src={active.src} title={active.title ?? active.label} />
        )}
      </main>

      <footer className="border-t border-term-line bg-term-bg">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-1 text-[10px] uppercase tracking-wider text-term-dim">
          <span>
            Research only · no positions held ·{' '}
            {leverageActive ? (
              <span className="text-term-red">leverage sleeve active in Allocator</span>
            ) : (
              'unlevered by construction'
            )}{' '}
            · public sources · not investment advice
          </span>
          <span>snobistisch/investment-dashboard</span>
        </div>
      </footer>
    </div>
  )
}

export default App
