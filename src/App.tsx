import { CitriniTracker } from './sections/citrini/CitriniTracker'

// Each tracker section is one self-contained folder under src/sections/
// (component + data file). Add a new tracker by rendering it below.
function App() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
          <h1 className="text-2xl font-semibold">Investment Intelligence Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Personal trackers built from public sources.
          </p>
        </div>
      </header>
      <main>
        <CitriniTracker />
      </main>
    </div>
  )
}

export default App
