import { positions } from '../data/positions'

// The chooser. Deliberately the only screen with no data on it beyond counts:
// the point is to make the reader pick a question before reading an answer,
// because the two halves of this dashboard answer different ones.
const equityCount = positions.filter((p) => !p.sections.includes('crypto')).length
const cryptoCount = positions.filter((p) => p.sections.includes('crypto')).length

type Card = {
  href: string
  title: string
  count: number
  unit: string
  themes: string
  question: string
  accent: string
}

const CARDS: Card[] = [
  {
    href: '#equities',
    title: 'EQUITIES',
    count: equityCount,
    unit: 'researched positions',
    themes: 'Digital Biology · Robotics · Quantum · Agentic · Photonics · Defence',
    question:
      'Which listed companies own the bottleneck in a capital cycle that is already funded? Ranked on evidence and, on the newer tabs, on an explicit three-scenario expected value.',
    accent: 'text-term-amber',
  },
  {
    href: '#crypto',
    title: 'CRYPTO',
    count: cryptoCount,
    unit: 'held positions · 40 assets ranked',
    themes: 'Assets — settlement · trading venues · DeFi · verifiable compute · new layer ones',
    question:
      'Does this asset beat simply holding bitcoin? One factor with forty tickers, where float and fee capture decide more than the narrative does.',
    accent: 'text-term-cyan',
  },
]

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-term-bg font-mono text-term-text">
      <header className="border-b border-term-line px-4 py-3">
        <div className="mx-auto w-full max-w-5xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-term-amber">
            Investment Intelligence
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-10">
        <h1 className="mb-3 text-2xl font-bold leading-tight sm:text-3xl">
          Two books, two different questions.
        </h1>
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-term-dim">
          Equities and crypto used to share one exposure model here. They should not: a
          $228bn settlement layer and a photonics small cap do not belong in the same
          factor bucket, and the hypotheses behind them are not comparable. Each side now
          carries its own Exposure and Allocator.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {CARDS.map((c) => (
            <a
              key={c.href}
              href={c.href}
              className="group flex flex-col border border-term-line bg-term-panel p-5 transition-colors hover:border-term-amber"
            >
              <span className={`text-lg font-bold tracking-[0.2em] ${c.accent}`}>{c.title}</span>
              <span className="mt-1 text-xs text-term-dim">
                {c.count} {c.unit}
              </span>
              <p className="mt-4 flex-1 text-sm leading-relaxed">{c.question}</p>
              <span className="mt-4 border-t border-term-line pt-3 text-[11px] leading-relaxed text-term-dim">
                {c.themes}
              </span>
              <span className="mt-3 text-xs uppercase tracking-wider text-term-dim group-hover:text-term-amber">
                Open →
              </span>
            </a>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-[11px] leading-relaxed text-term-dim">
          Research only · no positions held · public sources · not investment advice. Every
          figure traces to <span className="text-term-text">src/data/positions.ts</span> or to
          a dated snapshot, and each tab states which of the two it is showing.
        </p>
      </main>
    </div>
  )
}
