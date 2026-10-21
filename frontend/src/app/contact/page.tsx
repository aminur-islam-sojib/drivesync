import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'
import { MarketingShell } from '@/components/layout/marketing-shell'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Contact | DriveSync One',
  description:
    'Get in touch with the DriveSync One team. Reach out for technical support, feature requests, partnership inquiries, or open-source contributions.',
  alternates: {
    canonical: absoluteUrl('/contact'),
  },
  openGraph: {
    title: 'Contact | DriveSync One',
    description:
      'Get in touch with the DriveSync One team. Reach out for technical support, feature requests, partnership inquiries, or open-source contributions.',
    url: absoluteUrl('/contact'),
  },
}

export default function ContactPage() {
  return (
    <MarketingShell maxWidth="4xl">
      <Breadcrumbs items={[{ name: 'Contact', href: '/contact' }]} />

      <header className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Support &amp; Community
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Contact DriveSync One
        </h1>
        <p className="mt-4 text-base sm:text-lg text-ink-2 leading-relaxed">
          Whether you have a technical question, want to report an issue, or would like to propose a new
          storage integration, we are here to assist you.
        </p>
      </header>

      <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6" aria-label="Contact channels">
        {/* Email Support */}
        <article className="rounded-3xl border border-line bg-surface p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent" aria-hidden="true">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-ink">Direct Email Support</h2>
            <p className="mt-2 text-xs sm:text-sm text-ink-2 leading-relaxed">
              For account inquiries, privacy questions, or security disclosures, reach out directly
              to our engineering team via email.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-line">
            <a
              href="mailto:sojibahmed.connect@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              <span>sojibahmed.connect@gmail.com</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </article>

        {/* GitHub Community */}
        <article className="rounded-3xl border border-line bg-surface p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-ink" aria-hidden="true">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </div>
            <h2 className="mt-5 text-lg font-bold text-ink">GitHub Issues &amp; Discussions</h2>
            <p className="mt-2 text-xs sm:text-sm text-ink-2 leading-relaxed">
              Report bugs, discuss roadmap items, or contribute code directly on our public GitHub repository.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-line">
            <a
              href="https://github.com/aminur-islam-sojib/drivesyncone/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              <span>Open an issue on GitHub</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </article>
      </section>

      {/* Helpful Links */}
      <section className="mt-14 rounded-3xl border border-line bg-surface-2 p-8 text-center space-y-3">
        <h2 className="text-xl font-bold text-ink">Looking for Answers Right Now?</h2>
        <p className="text-xs sm:text-sm text-ink-2 max-w-md mx-auto">
          Check out our <Link href="/#faq" className="text-accent underline font-semibold">Frequently Asked Questions</Link> or{' '}
          read our detailed <Link href="/about" className="text-accent underline font-semibold">About Page</Link> for an overview of DriveSync One.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-6 text-xs font-semibold text-accent-ink hover:opacity-90 transition-all"
          >
            <span>Sign in to DriveSync One</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  )
}
