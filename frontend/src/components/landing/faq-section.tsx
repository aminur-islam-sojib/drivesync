'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const FAQS: FAQItem[] = [
  {
    question: 'How does DriveSync connect to my Google accounts?',
    answer:
      'DriveSync connects via official Google OAuth 2.0 authorization. You authenticate via a secure Google popup window for each account you want to link. Your Google password is never seen by DriveSync, and all tokens are encrypted with AES-256-GCM before storage.',
  },
  {
    question: 'Does DriveSync store or host my files on its own servers?',
    answer:
      'No. Your files remain stored inside your actual Google Drive storage. DriveSync acts as an aggregator and virtual filesystem: it syncs metadata (names, sizes, types) and proxies streaming previews and downloads directly through Google APIs on demand.',
  },
  {
    question: 'How does storage pooling work?',
    answer:
      'Every standard Google account provides 15 GB of free cloud storage. When you link 3 accounts, DriveSync aggregates them into a 45 GB virtual pool. Our smart routing engine automatically deposits new uploads into whichever account currently has the most available space.',
  },
  {
    question: 'Can I disconnect an account at any time?',
    answer:
      'Yes. You can disconnect any linked Google Drive account with a single click. When disconnected, its access tokens are permanently deleted from DriveSync, and your files remain completely safe and untouched inside Google Drive.',
  },
  {
    question: 'Can I also connect Amazon S3 or Wasabi buckets?',
    answer:
      'Yes! In addition to unlimited Google accounts, DriveSync features native S3-compatible storage gateway integration, allowing you to connect AWS S3, Cloudflare R2, MinIO, or Wasabi buckets alongside your Google Drives.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0)

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">
            Got Questions?
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Frequently Asked Questions
          </p>
          <p className="mt-3 text-sm text-ink-2">
            Everything you need to know about multi-account aggregation, security, and quotas.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-line bg-surface transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-ink-2 border-t border-line/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

