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
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm text-neutral-500">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  )
}
