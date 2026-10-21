import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import { MarketingShell } from '@/components/layout/marketing-shell'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { BLOG_POSTS } from '@/lib/blog-data'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Blog – Google Drive Multi-Account Guides | DriveSync One',
  description:
    'In-depth guides, technical tutorials, and workflows for managing multiple Google Drive accounts, pooling cloud storage quotas, and securing your files.',
  alternates: {
    canonical: absoluteUrl('/blog'),
  },
  openGraph: {
    title: 'Blog – Google Drive Multi-Account Guides | DriveSync One',
    description:
      'In-depth guides, technical tutorials, and workflows for managing multiple Google Drive accounts, pooling cloud storage quotas, and securing your files.',
    url: absoluteUrl('/blog'),
  },
}

export default function BlogIndexPage() {
  return (
    <MarketingShell maxWidth="5xl">
      <Breadcrumbs items={[{ name: 'Blog', href: '/blog' }]} />

      <header className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Guides, Tutorials &amp; Product Updates
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Google Drive Multi-Account &amp; Cloud Storage Guides
        </h1>
        <p className="mt-4 text-base sm:text-lg text-ink-2 leading-relaxed">
          Actionable walkthroughs and technical deep-dives on how to combine Google Drive accounts,
          maximize free storage quotas, search across cloud silos, and streamline your workflow.
        </p>
      </header>

      <section className="mt-14 space-y-8" aria-label="Blog posts list">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="rounded-3xl border border-line bg-surface p-7 sm:p-8 shadow-sm hover:border-line-strong transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-ink-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  <time dateTime={post.datePublished}>
                    {new Date(post.datePublished).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{post.readTime}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{post.author.name}</span>
                </span>
              </div>

              <h2 className="mt-4 text-xl sm:text-2xl font-bold text-ink">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  {post.title}
                </Link>
              </h2>

              <p className="mt-3 text-sm text-ink-2 leading-relaxed">
                {post.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {post.targetKeywords.slice(0, 2).map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-ink-3 border border-line"
                  >
                    {kw}
                  </span>
                ))}
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
              >
                <span>Read article</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* Newsletter / CTA */}
      <section className="mt-16 rounded-3xl border border-line bg-surface-2 p-8 text-center space-y-3">
        <h2 className="text-xl font-bold text-ink">Ready to Combine Your Accounts?</h2>
        <p className="text-xs sm:text-sm text-ink-2 max-w-md mx-auto">
          Start pooling your Google Drive storage with DriveSync One today. 100% free with official Google OAuth.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-6 text-xs font-semibold text-accent-ink hover:opacity-90 transition-all"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  )
}

