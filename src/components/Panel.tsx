import type { ReactNode } from 'react'

// Shared by exposure and allocator: a bordered card with an amber caption,
// and a proportional bar. Pulled out once a second section needed them.
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-term-line bg-term-panel">
      <h3 className="border-b border-term-line px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-term-amber">
        {title}
      </h3>
      <div className="p-3">{children}</div>
    </div>
  )
}

export function Bar({ share, className }: { share: number; className: string }) {
  return (
    <div className="h-1.5 w-full bg-[#1a1a1a]">
      <div className={`h-full ${className}`} style={{ width: `${Math.max(share * 100, 0.5)}%` }} />
    </div>
  )
}
