import * as React from 'react'
import Link from 'next/link'
import { HardDrive, ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      {/* Top Header */}
      <header className="flex h-16 w-full items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium text-ink-2 hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink shadow-sm">
            <HardDrive className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-ink">
            Drive<span className="text-accent">Sync</span>
          </span>
        </Link>
      </header>

      {/* Centered Auth Container */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-6 text-center text-xs text-ink-3">
        <p>© 2026 DriveSync. Bank-grade AES-256 token encryption.</p>
      </footer>
    </div>
  )
}

