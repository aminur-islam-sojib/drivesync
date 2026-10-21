'use client'

import * as React from 'react'
import Link from 'next/link'
import { HardDrive, ArrowRight, Sun, Moon } from 'lucide-react'

function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains('dark')
}

function getServerSnapshot() {
  return false
}

export function LandingNavbar() {
  const isDark = React.useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot)

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink shadow-sm transition-transform group-hover:scale-105" aria-hidden="true">
            <HardDrive className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-ink">
            Drive<span className="text-accent">Sync</span> One
          </span>
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent">
            Free &amp; Open Source
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden items-center gap-7 md:flex">
          <Link
            href="/features"
            className="text-sm font-medium text-ink-2 transition-colors hover:text-ink"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-ink-2 transition-colors hover:text-ink"
          >
            How it Works
          </Link>
          <Link
            href="/compare/multcloud"
            className="text-sm font-medium text-ink-2 transition-colors hover:text-ink"
          >
            Compare
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-ink-2 transition-colors hover:text-ink"
          >
            Blog
          </Link>
          <Link
            href="/#faq"
            className="text-sm font-medium text-ink-2 transition-colors hover:text-ink"
          >
            FAQ
          </Link>
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
            {isDark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
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
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  )
}

