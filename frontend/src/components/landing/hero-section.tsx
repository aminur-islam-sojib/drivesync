'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Shield, Lock } from 'lucide-react'
import { StorageCalculator } from './storage-calculator'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Background Subtle Gradient Blobs */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-125 w-200 -translate-x-1/2 opacity-30 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Copy & Value Proposition */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-2 shadow-sm">
              <span className="flex h-2 w-2 items-center justify-center" aria-hidden="true">
                <span className="h-2 w-2 animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span>Unified Google Drive &amp; S3 Gateway</span>
            </div>

            {/* Main Headline Area */}
            <div className="mt-6">
              <span className="block text-xs font-bold uppercase tracking-wider text-accent mb-2">
                DriveSync One: Unified Multi-Account Google Drive &amp; S3 Manager
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                All your Google Drives.{' '}
                <span className="text-accent underline decoration-accent-soft decoration-wavy decoration-2">
                  One workspace.
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="mt-5 max-w-2xl text-base text-ink-2 sm:text-lg">
              Stop juggling browser profiles and running out of space. DriveSync (DriveSync One)
              connects your personal, work, and university Google accounts into a single pooled drive
              with instant cross-account search and smart auto-routed uploads.
            </p>

            {/* CTA Group */}
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/login"
                className="flex h-12 items-center justify-center gap-2.5 rounded-full bg-accent px-7 text-sm font-semibold text-accent-ink shadow-md transition-all hover:opacity-90 active:scale-95"
              >
                {/* Google multi-color G icon */}
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <a
                href="#preview"
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
              >
                <span>Interactive Demo</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-ink-3 lg:justify-start">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span>AES-256 Token Encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                <span>Official Google OAuth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-ink-2" aria-hidden="true" />
                <span>Zero File Scraping</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Calculator */}
          <div className="flex justify-center lg:col-span-5">
            <StorageCalculator />
          </div>
        </div>
      </div>
    </section>
  )
}