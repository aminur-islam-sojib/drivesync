import * as React from 'react'
import { ChevronDown } from 'lucide-react'

export interface FAQItem {
  question: string
  answer: string
}

export const FAQS: FAQItem[] = [
  {
    question: 'What is DriveSync One?',
    answer:
      'DriveSync One is a unified cloud storage manager built for individuals and teams with multiple Google Drive and Amazon S3 accounts. It combines separate cloud drives into a single virtual workspace featuring pooled storage quotas, real-time cross-account search, and smart automated upload routing.',
  },
  {
    question: 'How does DriveSync connect to my Google accounts?',
    answer:
      'DriveSync connects via official Google OAuth 2.0 authorization. You authenticate via a secure Google popup window for each account you want to link. Your Google password is never seen by DriveSync, and all tokens are encrypted with AES-256-GCM before storage.',
  },
  {
    question: 'Is DriveSync the same as Google Drive for desktop sync?',
    answer:
      'No. Google Drive for desktop is a local file synchronization client that mirrors cloud files to your physical computer drive. DriveSync One is a web-based multi-account manager that unifies multiple cloud drives directly in your browser without consuming local disk space or causing file duplicates.',
  },
  {
    question: 'Is DriveSync One free and open-source?',
    answer:
      'Yes! DriveSync One is 100% free and open-source software released under the MIT license. There are no paid subscription walls, no artificial data transfer limits, and no credit cards required. You can use our hosted web version at $0 cost or freely self-host the open-source code from our public GitHub repository.',
  },
  {
    question: 'Does DriveSync store or host my files on its own servers?',
    answer:
      'No. Your files remain stored securely inside your actual Google Drive and S3 accounts. DriveSync One acts as a virtual filesystem gateway: it synchronizes file metadata (names, sizes, types) and proxies streaming previews and downloads directly through Google APIs on demand.',
  },
  {
    question: 'How does storage pooling work?',
    answer:
      'Every standard Google account provides 15 GB of free cloud storage shared across Drive, Gmail, and Photos. When you link multiple accounts, DriveSync One aggregates their free space into one virtual pool (3 accounts yield 45 GB, 5 accounts yield 75 GB). Our smart routing engine automatically deposits new uploads into whichever account currently has the most available space.',
  },
  {
    question: 'Can I disconnect an account at any time?',
    answer:
      'Yes. You can disconnect any linked Google Drive account with a single click. When disconnected, its access tokens are permanently deleted from DriveSync, and your files remain completely safe and untouched inside your original Google Drive.',
  },
  {
    question: 'Can I also connect Amazon S3 or Wasabi buckets?',
    answer:
      'Yes. In addition to Google Drive accounts, DriveSync One features a native S3-compatible storage gateway integration, allowing you to connect AWS S3, Cloudflare R2, MinIO, or Wasabi buckets alongside your Google Drives.',
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Got Questions?
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-ink-2">
            Everything you need to know about multi-account aggregation, quota pooling, and security.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, idx) => {
            return (
              <details
                key={faq.question}
                open={idx === 0}
                className="group overflow-hidden rounded-2xl border border-line bg-surface transition-all"
              >
                <summary className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-2 cursor-pointer list-none select-none">
                  <span>{faq.question}</span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180 group-open:text-accent"
                    aria-hidden="true"
                  />
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed text-ink-2 border-t border-line/60 pt-3">
                  {faq.answer}
                </div>
              </details>
            )
          })}
        </div>
      </div>
    </section>
  )
}
