import Link from 'next/link'
import { HardDrive, Home } from 'lucide-react'

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you requested could not be found on DriveSync One.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="flex h-16 w-full items-center justify-between px-6 sm:px-10 border-b border-line">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink shadow-sm">
            <HardDrive className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-ink">
            Drive<span className="text-accent">Sync</span> One
          </span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          404 Error
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl text-ink">
          Page Not Found
        </h1>
        <p className="mt-3 max-w-md text-sm text-ink-2">
          The page or file you are looking for does not exist, has been moved, or is temporarily unavailable.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Back to Homepage</span>
          </Link>
          <Link
            href="/features"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-6 text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
          >
            <span>Explore Features</span>
          </Link>
        </div>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-3">
        <p>© 2026 DriveSync One. All rights reserved.</p>
      </footer>
    </div>
  )
}
