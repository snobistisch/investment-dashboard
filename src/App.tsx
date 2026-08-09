import { useEffect, useState } from 'react'
import { CitriniTracker } from './sections/citrini/CitriniTracker'
import { ExposurePanel } from './sections/exposure/ExposurePanel'
import { AllocatorPanel } from './sections/allocator/AllocatorPanel'
import { EmbeddedDashboard } from './components/EmbeddedDashboard'

// The dashboard's sections. React trackers (like Citrini) render inline and
// scroll; embedded sections host a self-contained HTML dashboard in an iframe.
// To add another: drop its file in public/dashboards/ and add one entry here.
// Exposure comes first on purpose: it is the only view that reads across the
// others, and the concentration question should be answered before the
// individual theses are read.
const sections = [
  'exposure',
  'allocator',
  'citrini',
  'biology',
  'robotics',
  'quantum',
  'agentic',
  'crypto',
  'photonics',
] as const
type Section = (typeof sections)[number]

const navLabels: Record<Section, string> = {
  exposure: 'EXPOSURE',
  allocator: 'ALLOCATOR',
  citrini: 'CITRINI',
  biology: 'DIGITAL BIOLOGY',
  robotics: 'ROBOTICS',
  quantum: 'QUANTUM',
  agentic: 'AGENTIC',
  crypto: 'CRYPTO',
  photonics: 'PHOTONICS',
}

function sectionFromHash(): Section {
  const hash = window.location.hash.replace('#', '')
  return (sections as readonly string[]).includes(hash) ? (hash as Section) : 'exposure'
}

function App() {
  const [active, setActive] = useState<Section>(sectionFromHash)

  useEffect(() => {
    const onHashChange = () => setActive(sectionFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-term-bg font-mono text-term-text">
      <header className="border-b border-term-line bg-term-bg">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-term-amber">
            Investment Intelligence
          </span>
          <nav className="flex gap-px text-xs">
            {sections.map((id, i) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? 'page' : undefined}
                className={`px-3 py-1.5 uppercase tracking-wider transition-colors ${
                  active === id
                    ? 'bg-term-amber font-bold text-black'
                    : 'text-term-dim hover:bg-term-panel hover:text-term-amber'
                }`}
              >
                {i + 1} {navLabels[id]}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        {active === 'exposure' && (
          <div className="h-full overflow-y-auto">
            <ExposurePanel />
          </div>
        )}
        {active === 'allocator' && (
          <div className="h-full overflow-y-auto">
            <AllocatorPanel />
          </div>
        )}
        {active === 'citrini' && (
          <div className="h-full overflow-y-auto">
            <CitriniTracker />
          </div>
        )}
        {active === 'biology' && (
          <EmbeddedDashboard src="dashboards/digital-biology.html" title="Digital Biology dashboard" />
        )}
        {active === 'robotics' && (
          <EmbeddedDashboard src="dashboards/robotics.html" title="Robotics landscape dashboard" />
        )}
        {active === 'quantum' && (
          <EmbeddedDashboard src="dashboards/quantum.html" title="Quantum computing dashboard" />
        )}
        {active === 'agentic' && (
          <EmbeddedDashboard src="dashboards/agentic.html" title="Agent economy dashboard" />
        )}
        {active === 'crypto' && (
          <EmbeddedDashboard src="dashboards/crypto.html" title="Digital assets research tracker" />
        )}
        {active === 'photonics' && (
          <EmbeddedDashboard
            src="dashboards/photonics.html"
            title="Photonics and optical interconnect dashboard"
          />
        )}
      </main>

      <footer className="border-t border-term-line bg-term-bg">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-1 text-[10px] uppercase tracking-wider text-term-dim">
          {/* Leverage state is the single most important risk fact about any
              book — the difference between the July 2026 drawdown being
              survivable and being terminal. Stated explicitly, per Matthias
              (2026-08-08): this is research, not a live book. */}
          <span>
            Research only · no positions held · unlevered by construction · public sources ·
            not investment advice
          </span>
          <span>snobistisch/investment-dashboard</span>
        </div>
      </footer>
    </div>
  )
}

export default App
