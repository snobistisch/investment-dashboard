import { useEffect, useState } from 'react'
import { CitriniTracker } from './sections/citrini/CitriniTracker'
import { EmbeddedDashboard } from './components/EmbeddedDashboard'

// The dashboard's sections. React trackers (like Citrini) render inline and
// scroll; embedded sections host a self-contained HTML dashboard in an iframe.
// To add another: drop its file in public/dashboards/ and add one entry here.
const sections = ['citrini', 'biology', 'robotics', 'quantum', 'agentic', 'crypto'] as const
type Section = (typeof sections)[number]

const navLabels: Record<Section, string> = {
  citrini: 'CITRINI',
  biology: 'DIGITAL BIOLOGY',
  robotics: 'ROBOTICS',
  quantum: 'QUANTUM',
  agentic: 'AGENTIC',
  crypto: 'CRYPTO',
}

function sectionFromHash(): Section {
  const hash = window.location.hash.replace('#', '')
  return (sections as readonly string[]).includes(hash) ? (hash as Section) : 'citrini'
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
      </main>

      <footer className="border-t border-term-line bg-term-bg">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-1 text-[10px] uppercase tracking-wider text-term-dim">
          <span>Data: public sources only · Not investment advice</span>
          <span>snobistisch/investment-dashboard</span>
        </div>
      </footer>
    </div>
  )
}

export default App
