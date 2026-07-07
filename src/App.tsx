import { useEffect, useState } from 'react'
import { CitriniTracker } from './sections/citrini/CitriniTracker'
import { EmbeddedDashboard } from './components/EmbeddedDashboard'

// The dashboard's sections. React trackers (like Citrini) render inline and
// scroll; embedded sections host a self-contained HTML dashboard in an iframe.
// To add another: drop its file in public/dashboards/ and add one entry here.
const sections = ['citrini', 'biology', 'robotics'] as const
type Section = (typeof sections)[number]

const navLabels: Record<Section, string> = {
  citrini: 'Citrini Research',
  biology: 'Digital Biology',
  robotics: 'Robotics',
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
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3">
          <span className="text-sm font-semibold tracking-tight">
            Investment Intelligence Dashboard
          </span>
          <nav className="flex gap-1 text-sm">
            {sections.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? 'page' : undefined}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  active === id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {navLabels[id]}
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
      </main>
    </div>
  )
}

export default App
