import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  description: string
  children: ReactNode
}

// Shared shell for every tracker section: consistent heading + description,
// content is whatever the section renders (table, cards, ...).
export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-term-amber">
        {title}
      </h2>
      <p className="mt-2 max-w-4xl text-xs leading-relaxed text-term-dim">
        {description}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  )
}
