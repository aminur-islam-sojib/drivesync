import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield,
  Lock,
  KeyRound,
  EyeOff,
  UserCheck,
  ServerOff,
  ArrowRight,
} from 'lucide-react'
import { MarketingShell } from '@/components/layout/marketing-shell'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Security & Privacy – How DriveSync One Protects Your Drive Data',
  description:
    'Learn how DriveSync One secures your Google Drive and S3 accounts with AES-256 token encryption, official Google OAuth, zero file scraping, and instant account disconnects.',
  alternates: {
    canonical: absoluteUrl('/security'),
  },
  openGraph: {
    title: 'Security & Privacy – How DriveSync One Protects Your Drive Data',
    description:
      'Learn how DriveSync One secures your Google Drive and S3 accounts with AES-256 token encryption, official Google OAuth, zero file scraping, and instant account disconnects.',
    url: absoluteUrl('/security'),
  },
}

const SECURITY_PILLARS = [
  {
    icon: KeyRound,
    title: 'Official Google OAuth 2.0 Authorization',
    description:
      'DriveSync One connects to your accounts using official Google OAuth 2.0. You authorize access through Google’s secure authentication window. Your Google account password is never seen, requested, transmitted, or stored by DriveSync One. Access permissions are strictly scoped to Google Drive file management and can be revoked from your Google Account security dashboard at any time.',
  },
  {
    icon: Lock,
    title: 'AES-256-GCM Token Encryption at Rest',
    description:
      'OAuth access and refresh tokens returned by Google and AWS credentials are encrypted at rest using industry-standard AES-256-GCM (Galois/Counter Mode). Each token is encrypted before being saved to PostgreSQL using a cryptographically secure 256-bit encryption key. Even in the unlikely event of database exfiltration, raw provider credentials cannot be decrypted without the host key.',
  },
  {
    icon: EyeOff,
    title: 'Zero File Scraping & Zero Content Harvesting',
    description:
      'DriveSync One is a cloud storage manager and gateway—not a data broker. We do not inspect, parse, or scrape the contents of your documents, photos, spreadsheets, or private archives. When you stream video or download files, the binary stream passes directly through ephemeral proxy tunnels without being cached or retained on DriveSync One disks.',
  },
  {
    icon: ServerOff,
    title: 'Zero Artificial Intelligence Model Training',
    description:
      'Your files, document text, and personal media are never used to train machine learning or artificial intelligence models. DriveSync One adheres to strict confidentiality standards: your data belongs solely to you and your chosen storage providers.',
  },
  {
    icon: UserCheck,
    title: 'One-Click Disconnect & Instant Token Deletion',
    description:
      'You maintain full ownership and control over your connected accounts. If you decide to stop using DriveSync One, clicking "Disconnect Drive" permanently deletes all stored OAuth tokens and associated cached metadata from our database. Because your files live inside your actual Google Drive and S3 buckets, your files remain completely untouched and intact.',
  },
  {
    icon: Shield,
    title: 'Compliance with Google API Limited Use Policy',
    description:
      'DriveSync One’s use and transfer to any other app of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. We request only the permissions necessary to organize files, pool storage quotas, and facilitate requested uploads.',
  },
]

export default function SecurityPage() {
  return (
    <MarketingShell maxWidth="5xl">
      <Breadcrumbs items={[{ name: 'Security & Privacy', href: '/security' }]} />

      <header className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Enterprise-Grade Protection
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Security &amp; Privacy: How DriveSync One Protects Your Data
        </h1>
        <p className="mt-4 text-base sm:text-lg text-ink-2 leading-relaxed">
          When managing multiple cloud storage accounts, trust and security are foundational.
          Here is how DriveSync One (DriveSync) protects your credentials, guards your files, and ensures
          your cloud data remains confidential.
        </p>
      </header>

      <section className="mt-14 space-y-8" aria-label="Security Architecture">
        {SECURITY_PILLARS.map((item) => {
          const Icon = item.icon
          return (
            <article
              key={item.title}
              className="rounded-3xl border border-line bg-surface p-7 sm:p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-start"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent" aria-hidden="true">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink">
                  {item.title}
                </h2>
                <p className="mt-2.5 text-sm text-ink-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </article>
          )
        })}
      </section>

      {/* Trust & Verification CTA */}
      <section className="mt-16 rounded-3xl border border-line bg-surface-2 p-8 sm:p-10 text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-ink">
          Have Questions About Our Security Architecture?
        </h2>
        <p className="text-xs sm:text-sm text-ink-2 max-w-lg mx-auto leading-relaxed">
          Read our comprehensive <Link href="/privacy" className="text-accent underline font-semibold">Privacy Policy</Link> or
          review our open source codebase on <a href="https://github.com/aminur-islam-sojib/drivesyncone" target="_blank" rel="noopener noreferrer" className="text-accent underline font-semibold">GitHub</a>.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-7 text-sm font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <span>Connect Your First Google Drive</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  )
}
