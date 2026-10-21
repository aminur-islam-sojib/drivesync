import * as React from 'react'
import Link from 'next/link'
import { Link2, Layers, Search, UploadCloud, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    title: 'Connect Your Google & S3 Accounts',
    description:
      'Authorize your personal, work, and university Google accounts via official Google OAuth 2.0 with a single click. Your credentials are never stored—access tokens are encrypted using AES-256-GCM.',
    icon: Link2,
  },
  {
    step: '02',
    title: 'Pool Your Free Storage Tiers',
    description:
      'DriveSync One aggregates the 15 GB quota from each connected Google account into one unified virtual pool (e.g., 3 accounts = 45 GB, 5 accounts = 75 GB) without paid subscriptions.',
    icon: Layers,
  },
  {
    step: '03',
    title: 'Search Across Every Drive in Real Time',
    description:
      'Query file names, document categories, and date ranges across all linked drives simultaneously. No more guessing which Google Drive contains your documents or presentations.',
    icon: Search,
  },
  {
    step: '04',
    title: 'Upload with Smart Auto-Routing',
    description:
      'Drag and drop files into your workspace. DriveSync One automatically uploads them to whichever connected Google Drive currently has the most available free space.',
    icon: UploadCloud,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-surface-2/20 border-t border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Simple 4-Step Workflow
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            How DriveSync One Works
          </h2>
          <p className="mt-3 text-sm text-ink-2">
            Eliminate profile switching and optimize cloud quota in four seamless steps.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="relative rounded-3xl border border-line bg-surface p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-ink-3/40 font-mono">
                      {item.step}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent" aria-hidden="true">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-2">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:underline"
          >
            <span>Get started with DriveSync One for free</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
