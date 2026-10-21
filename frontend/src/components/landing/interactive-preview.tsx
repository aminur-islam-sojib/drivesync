import { SimulatorLoader } from './simulator-loader'

export function InteractivePreview() {
  return (
    <section id="preview" className="py-20 sm:py-28 bg-surface-2/40 border-y border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">
            Live Interactive Simulator
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Experience the Unified Workspace
          </p>
          <p className="mt-3 text-sm text-ink-2">
            Try searching or filtering below to see how files from multiple Google accounts are
            organized in one seamless interface.
          </p>
        </div>

        <SimulatorLoader />
      </div>
    </section>
  )
}
