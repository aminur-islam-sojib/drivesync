import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingShell } from '@/components/layout/marketing-shell'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Privacy Policy | DriveSync One',
  description:
    'Read the DriveSync One Privacy Policy. Learn about our Google OAuth integration, data protection, AES-256 encryption, and Google API Limited Use compliance.',
  alternates: {
    canonical: absoluteUrl('/privacy'),
  },
  openGraph: {
    title: 'Privacy Policy | DriveSync One',
    description:
      'Read the DriveSync One Privacy Policy. Learn about our Google OAuth integration, data protection, AES-256 encryption, and Google API Limited Use compliance.',
    url: absoluteUrl('/privacy'),
  },
}

export default function PrivacyPolicyPage() {
  return (
    <MarketingShell maxWidth="4xl">
      <Breadcrumbs items={[{ name: 'Privacy Policy', href: '/privacy' }]} />

      <article className="prose prose-invert max-w-none text-ink-2 text-sm leading-relaxed space-y-8">
        <header className="border-b border-line pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Legal &amp; Compliance
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-ink">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-ink-3">
            Last Updated: March 25, 2026 • Effective Date: January 1, 2026
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">1. Introduction</h2>
          <p>
            Welcome to DriveSync One (&quot;DriveSync One&quot;, &quot;DriveSync&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            DriveSync One operates the web application available at{' '}
            <a href="https://drivesyncone.vercel.app" className="text-accent underline">
              https://drivesyncone.vercel.app
            </a>{' '}
            and associated API services. We respect your privacy and are committed to protecting your
            personal data. This Privacy Policy explains what information we collect, how it is used,
            and the rigorous measures we employ to keep your data secure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">2. Information We Collect</h2>
          <p>
            DriveSync One collects only the minimum amount of data required to provide unified
            cloud storage aggregation services:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-ink">Account Credentials:</strong> When you register an account,
              we collect your email address and an Argon2-hashed password. If you register via Google
              OAuth, we receive your email and basic public profile information from Google.
            </li>
            <li>
              <strong className="text-ink">Cloud Provider Tokens:</strong> When you link a Google Drive
              account or an S3 storage bucket, we store OAuth authorization tokens and S3 endpoint
              credentials. All tokens are encrypted at rest using AES-256-GCM.
            </li>
            <li>
              <strong className="text-ink">File Metadata:</strong> To display your files, calculate pooled
              storage quotas, and perform cross-account searches, we index file names, file sizes, MIME
              types, created dates, and virtual folder structures.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">3. What We Do NOT Collect</h2>
          <p>
            We adhere to strict data minimization principles:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>We do NOT store, scrape, or read the underlying content of your files on persistent disks.</li>
            <li>We do NOT sell, lease, or monetize your personal information or metadata to third parties.</li>
            <li>We do NOT use your private documents, media, or files to train artificial intelligence or machine learning models.</li>
            <li>We do NOT track your browsing habits across unrelated websites or sell behavioral advertising profiles.</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-accent/20 bg-accent-soft/10 p-6">
          <h2 className="text-lg font-bold text-ink">
            4. Google API Services User Data Policy: Limited Use Disclosure
          </h2>
          <p>
            DriveSync One’s use and transfer to any other app of information received from Google APIs
            will adhere to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline font-semibold"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              We only use Google user data to provide and improve user-facing features that are prominent
              in DriveSync One&apos;s user interface (such as displaying folder hierarchies, computing pooled quotas,
              routing uploads, and providing streaming file previews).
            </li>
            <li>
              We do not transfer Google user data to third parties unless necessary to provide the user-facing
              features, comply with applicable law, or as part of a merger or acquisition with explicit user notice.
            </li>
            <li>
              We do not use or transfer Google user data for serving advertisements, including personalized,
              re-targeted, or interest-based advertising.
            </li>
            <li>
              Human beings are not allowed to read Google user data unless we have obtained your affirmative
              agreement for specific files (e.g. for technical support), it is necessary for security purposes,
              or to comply with applicable laws.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">5. Data Storage and Cryptographic Security</h2>
          <p>
            All network communication with DriveSync One is strictly encrypted in transit via TLS 1.3.
            OAuth tokens, refresh tokens, and provider keys are encrypted at rest using AES-256-GCM.
            User passwords are encrypted with memory-hard Argon2 hashing algorithms. For more details,
            visit our <Link href="/security" className="text-accent underline">Security Architecture Page</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">6. Account Disconnection and Data Deletion</h2>
          <p>
            You retain absolute ownership of your data. You may disconnect any linked Google Drive account
            at any time from your settings panel. Upon disconnection, all encrypted tokens and associated
            metadata are immediately and permanently removed from our databases. Your files inside Google
            Drive remain completely unaffected. You may also request complete account termination by
            contacting us via our <Link href="/contact" className="text-accent underline">Contact Page</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">7. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our legal obligations
            or feature offerings. We will notify you of any material changes by updating the &quot;Last Updated&quot;
            date at the top of this document. Continued use of DriveSync One constitutes acceptance of these terms.
          </p>
        </section>

        <section className="space-y-3 border-t border-line pt-6">
          <h2 className="text-xl font-bold text-ink">8. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy or our compliance with Google API User Data
            policies, please reach out via our <Link href="/contact" className="text-accent underline">Contact Page</Link>{' '}
            or submit an issue on our official{' '}
            <a
              href="https://github.com/aminur-islam-sojib/drivesyncone"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              GitHub repository
            </a>.
          </p>
        </section>
      </article>
    </MarketingShell>
  )
}

