'use client'

import dynamic from 'next/dynamic'

const InteractiveSimulator = dynamic(
  () =>
    import('./interactive-simulator').then((mod) => mod.InteractiveSimulator),
  {
    ssr: false,
    loading: () => (
      <div className="mt-12 overflow-hidden rounded-3xl border border-line bg-surface shadow-pop min-h-[500px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="text-xs text-ink-3">Loading interactive workspace simulator...</p>
        </div>
      </div>
    ),
  }
)

export function SimulatorLoader() {
  return <InteractiveSimulator />
}

