import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingShell } from '@/components/layout/marketing-shell'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Terms of Service | DriveSync One',
  description:
    'Review the Terms of Service for DriveSync One. Understand user responsibilities, acceptable use, account management, and service warranties.',
  alternates: {
    canonical: absoluteUrl('/terms'),
  },
  openGraph: {
    title: 'Terms of Service | DriveSync One',
    description:
      'Review the Terms of Service for DriveSync One. Understand user responsibilities, acceptable use, account management, and service warranties.',
    url: absoluteUrl('/terms'),
  },
}

export default function TermsPage() {
  return (
    <MarketingShell maxWidth="4xl">
      <Breadcrumbs items={[{ name: 'Terms of Service', href: '/terms' }]} />

      <article className="prose prose-invert max-w-none text-ink-2 text-sm leading-relaxed space-y-8">
        <header className="border-b border-line pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Agreement &amp; Guidelines
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-ink">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-ink-3">
            Last Updated: March 25, 2026 • Effective Date: January 1, 2026
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">1. Acceptance of Terms</h2>
          <p>
            By accessing or using DriveSync One (&quot;DriveSync One&quot;, &quot;DriveSync&quot;, &quot;the Service&quot;),
            you agree to be bound by these Terms of Service (&quot;Terms&quot;) and our{' '}
            <Link href="/privacy" className="text-accent underline font-semibold">
              Privacy Policy
            </Link>. If you do not agree to these Terms, you must immediately discontinue use of the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">2. Description of Service</h2>
          <p>
            DriveSync One provides a unified cloud storage gateway that allows users to connect,
            aggregate, search, preview, and upload to multiple Google Drive and S3-compatible cloud storage
            accounts through a centralized web application. DriveSync One does not provide physical cloud
            storage hardware; instead, it interfaces directly with your third-party cloud accounts via
            authorized APIs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">3. User Accounts and Security</h2>
          <p>
            To use DriveSync One, you must create an account. You are responsible for safeguarding your login
            credentials and for all activities that occur under your account. You agree to notify us immediately
            of any unauthorized use of your account. DriveSync One cannot and will not be liable for any loss
            or damage arising from your failure to comply with this security obligation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">4. Acceptable Use Policy</h2>
          <p>
            You agree not to misuse the Service or assist anyone else in doing so. Specifically, you agree
            not to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Use the Service to transmit, store, or distribute illegal content, malware, or pirated materials.</li>
            <li>Violate or attempt to violate the terms of service of connected providers (such as the Google Drive Terms of Service or AWS Acceptable Use Policy).</li>
            <li>Attempt to probe, scan, or test the vulnerability of DriveSync One systems, networks, or API endpoints.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service or its underlying infrastructure.</li>
            <li>Reverse engineer, decompile, or disassemble any portion of the Service except to the extent permitted by open-source licensing.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">5. Third-Party Services and API Limitations</h2>
          <p>
            DriveSync One depends on APIs provided by third parties, notably Google LLC (Google Drive API) and
            Amazon Web Services (S3 API). We are not responsible for any service interruptions, API rate limits,
            quota restrictions, or policy changes enacted by these third parties. You must comply with all third-party
            terms when connecting their services to DriveSync One.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">6. Intellectual Property &amp; Trademarks</h2>
          <p>
            The software, visual design, trademarks, logos, and code comprising DriveSync One are the intellectual
            property of DriveSync One and its licensors. Google Drive, Google, and Gmail are registered trademarks
            of Google LLC. Amazon S3 and AWS are registered trademarks of Amazon.com, Inc. DriveSync One is an
            independent software application and is not affiliated with, endorsed by, or sponsored by Google LLC or
            Amazon Web Services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">7. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, AND NON-INFRINGEMENT. DRIVESYNC ONE DOES NOT WARRANT THAT THE SERVICE WILL BE
            UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">8. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL DRIVESYNC ONE, ITS FOUNDERS, OR ITS
            CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
            WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR
            ACCESS TO OR INABILITY TO USE THE SERVICE.
          </p>
        </section>

        <section className="space-y-3 border-t border-line pt-6">
          <h2 className="text-xl font-bold text-ink">9. Governing Law &amp; Contact</h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws. If you have any
            questions concerning these Terms, please reach out through our{' '}
            <Link href="/contact" className="text-accent underline font-semibold">
              Contact Page
            </Link>{' '}
            or review our project on{' '}
            <a
              href="https://github.com/aminur-islam-sojib/drivesyncone"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              GitHub
            </a>.
          </p>
        </section>
      </article>
    </MarketingShell>
  )
}
