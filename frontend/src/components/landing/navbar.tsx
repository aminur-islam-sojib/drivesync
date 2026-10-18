'use client'

import * as React from 'react'
import Link from 'next/link'
import { HardDrive, ArrowRight, Sun, Moon } from 'lucide-react'

export function LandingNavbar() {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink shadow-sm transition-transform group-hover:scale-105">
            <HardDrive className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-ink">
            Drive<span className="text-accent">Sync</span>
          </span>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
            Beta
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-ink-2 transition-colors hover:text-ink"
          >
            Features
          </a>
          <a
            href="#preview"
            className="text-sm font-medium text-ink-2 transition-colors hover:text-ink"
          >
            Interactive Demo
          </a>
          <a
            href="#comparison"
            className="text-sm font-medium text-ink-2 transition-colors hover:text-ink"
          >
            Comparison
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-ink-2 transition-colors hover:text-ink"
          >
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link
            href="/login"
            className="hidden text-sm font-medium text-ink-2 transition-colors hover:text-ink sm:inline-block"
          >
            Sign in
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-ink shadow-sm transition-all hover:opacity-90 active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}

