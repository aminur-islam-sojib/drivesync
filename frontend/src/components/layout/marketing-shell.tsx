import * as React from 'react'
import { LandingNavbar } from '@/components/landing/navbar'
import { LandingFooter } from '@/components/landing/landing-footer'

interface MarketingShellProps {
  children: React.ReactNode
  maxWidth?: '5xl' | '7xl' | '4xl'
}

export function MarketingShell({
  children,
  maxWidth = '5xl',
}: MarketingShellProps) {
  const maxClass =
    maxWidth === '7xl'
      ? 'max-w-7xl'
      : maxWidth === '4xl'
        ? 'max-w-4xl'
        : 'max-w-5xl'

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink selection:bg-accent-soft selection:text-accent">
      <LandingNavbar />
      <main className="flex-1 py-12 sm:py-16">
        <div className={`mx-auto ${maxClass} px-4 sm:px-6 lg:px-8`}>
          {children}
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
