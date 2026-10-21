import type { Metadata } from 'next'
import Link from 'next/link'
import { HardDrive, Target, Sparkles, Heart, ArrowRight } from 'lucide-react'
import { MarketingShell } from '@/components/layout/marketing-shell'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'About DriveSync One',
  description:
    'Discover the story behind DriveSync One (DriveSync). Learn why we built a unified multi-account Google Drive and S3 cloud storage manager to eliminate cloud fragmentation.',
  alternates: {
    canonical: absoluteUrl('/about'),
  },
  openGraph: {
    title: 'About DriveSync One',
    description:
      'Discover the story behind DriveSync One (DriveSync). Learn why we built a unified multi-account Google Drive and S3 cloud storage manager to eliminate cloud fragmentation.',
    url: absoluteUrl('/about'),
  },
}

export default function AboutPage() {
  return (
    <MarketingShell maxWidth="4xl">
      <Breadcrumbs items={[{ name: 'About', href: '/about' }]} />

      <article className="space-y-10">
        <header>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Our Mission &amp; Story
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            About DriveSync One
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink-2 leading-relaxed">
            DriveSync One (commonly called DriveSync or Drive Sync One) was created to solve a universal
            modern productivity challenge: cloud storage fragmentation.
          </p>
        </header>

        {/* Section 1: The Problem */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent" aria-hidden="true">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-ink">
              The Problem with Multi-Account Cloud Storage
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-ink-2">
            Most developers, freelancers, students, and digital creators own more than one Google
            account. You likely have a personal Gmail address, a corporate workspace account, an alumni
            or university email, and secondary accounts for side projects or client work. Each Google
            account includes 15 GB of free cloud storage, but they operate as completely isolated silos.
          </p>
          <p className="text-sm leading-relaxed text-ink-2">
            Managing files across these separate accounts traditionally meant constantly switching
            browser profiles, signing in and out of accounts, or emailing attachments to yourself. Even
            worse, one drive might be at 98% capacity while another has 12 GB of unused, wasted space.
          </p>
        </section>

        {/* Section 2: Why We Built DriveSync One */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent" aria-hidden="true">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-ink">
              Building a Unified Cloud Gateway
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-ink-2">
            We built DriveSync One to unite these fragmented accounts into a single, cohesive
            workspace. Instead of forcing users to migrate their files to a new proprietary host or
            pay for redundant Google One subscriptions, DriveSync One aggregates existing Google
            Drives using official Google OAuth 2.0.
          </p>
          <p className="text-sm leading-relaxed text-ink-2">
            By pooling free storage tiers, users immediately gain access to 45 GB (with 3 accounts) or
            75 GB (with 5 accounts) of usable cloud space. With our real-time cross-account search and
            smart upload auto-routing engine, Drive Sync One automatically directs new uploads to the
            account with the most available capacity.
          </p>
        </section>

        {/* Section 3: Engineering & Open Standards */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent" aria-hidden="true">
              <HardDrive className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-ink">
              Engineering Principles: Security and Speed
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-ink-2">
            Built with Next.js App Router, Express, Prisma, and PostgreSQL, DriveSync One is engineered
            for zero-latency responsiveness. Our optimistic in-memory folder caching delivers
            0-millisecond navigation transitions. On the security side, all credentials and OAuth refresh
            tokens are encrypted at rest with AES-256-GCM. We never inspect your private file contents
            or use your documents for artificial intelligence training.
          </p>
        </section>

        {/* Section 4: The Team & Open Source */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent" aria-hidden="true">
              <Heart className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-ink">
              Who Built DriveSync One: 100% Free &amp; Open Source
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-ink-2">
            DriveSync One was developed by <strong className="text-ink">Sojib Ahmed</strong> and an
            active community of open-source contributors passionate about building fast, quiet, and
            respectful web software. The project is completely open source under the permissive MIT
            license, with zero subscription paywalls, no artificial file quotas, and no venture capital
            pressure to monetize your storage.
          </p>
          <p className="text-sm leading-relaxed text-ink-2">
            The entire codebase is published on{' '}
            <a
              href="https://github.com/aminur-islam-sojib/drivesyncone"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline font-semibold"
            >
              GitHub
            </a>
            , where anyone can audit the code, run their own instance, file feature requests, or contribute
            improvements directly.
          </p>
        </section>

        {/* Call to action */}
        <section className="rounded-3xl border border-line bg-surface p-8 text-center space-y-4 mt-8">
          <h2 className="text-2xl font-bold text-ink">
            Experience the Future of Multi-Drive Cloud Management
          </h2>
          <p className="text-xs sm:text-sm text-ink-2 max-w-lg mx-auto">
            Ready to stop switching browser accounts? Link your Google Drives in seconds and explore our{' '}
            <Link href="/features" className="text-accent underline font-medium">full feature set</Link> or{' '}
            <Link href="/contact" className="text-accent underline font-medium">contact our team</Link>.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-7 text-sm font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <span>Get Started with DriveSync One</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </article>
    </MarketingShell>
  )
}

