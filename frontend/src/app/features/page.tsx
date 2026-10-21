import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Layers,
  Search,
  Zap,
  Eye,
  ShieldCheck,
  HardDrive,
  FolderTree,
  Share2,
  Trash2,
  ArrowRight,
  Code2,
} from 'lucide-react'
import { MarketingShell } from '@/components/layout/marketing-shell'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Features – Multi-Account Google Drive Manager | DriveSync One',
  description:
    'Explore DriveSync One features: pooled Google Drive storage, cross-account file search, smart upload auto-routing, in-app streaming previews, and S3 integration.',
  alternates: {
    canonical: absoluteUrl('/features'),
  },
  openGraph: {
    title: 'Features – Multi-Account Google Drive Manager | DriveSync One',
    description:
      'Explore DriveSync One features: pooled Google Drive storage, cross-account file search, smart upload auto-routing, in-app streaming previews, and S3 integration.',
    url: absoluteUrl('/features'),
  },
}

const FEATURE_LIST = [
  {
    icon: Layers,
    title: 'Virtual Storage Quota Pooling',
    desc: 'DriveSync One connects multiple separate Google Drive accounts via official Google OAuth 2.0 and merges their free storage quotas into one combined virtual drive. Every free Google account provides 15 GB of cloud storage. By connecting 3 accounts, you instantly receive a 45 GB pooled workspace; connecting 5 accounts provides 75 GB of consolidated free cloud storage without paying for multiple recurring Google One subscriptions. You can monitor individual drive health, storage usage bars, and remaining capacity in real time.',
  },
  {
    icon: Search,
    title: 'Instant Cross-Account Global Search',
    desc: 'When files are scattered across personal, university, client, and work Google accounts, finding documents becomes time-consuming. DriveSync One features a unified omnibox search engine that queries all connected accounts simultaneously. You can filter results by file category (PDFs, spreadsheets, presentations, photos, videos, archives, and folders), sort by modification date, and filter by specific account origins. Keyboard navigation (Cmd/Ctrl+K) provides zero-latency file location across your entire multi-account library.',
  },
  {
    icon: Zap,
    title: 'Smart Upload Auto-Routing Engine',
    desc: 'Instead of manually inspecting which Google Drive has free capacity before uploading, DriveSync One includes an automated upload routing engine. Drag and drop any file or folder into the upload dropzone, and DriveSync One automatically selects the destination account based on your active routing policy. Supported routing modes include Most Available (targets the drive with the highest free quota), Round Robin (balances storage across all linked drives), and Priority (fills specific primary accounts first before overflowing into secondary drives).',
  },
  {
    icon: Eye,
    title: 'In-App Media Streaming & Previews',
    desc: 'Preview and inspect your files directly within the web application without downloading heavy assets to your local computer. DriveSync One supports in-app streaming video playback with plyr, audio playback with seek controls, rich multi-page PDF rendering, high-resolution image zoom viewers, and formatted code/markdown document reading. Stream requests are proxied securely on demand directly from Google APIs.',
  },
  {
    icon: FolderTree,
    title: 'Virtual Folder Tree & Instant Navigation',
    desc: 'Organize files into clean virtual folder hierarchies with signature folder cards that display file counts, total bytes, and account badges. DriveSync One features an optimistic 0-millisecond in-memory cache with background synchronization, ensuring immediate folder navigation without waiting for server round-trips.',
  },
  {
    icon: HardDrive,
    title: 'Amazon S3 & S3-Compatible Gateway',
    desc: 'DriveSync One is not limited to Google Drive. It features a native S3-compatible cloud storage gateway that allows you to connect AWS S3 buckets, Cloudflare R2, Wasabi, and MinIO storage alongside your Google Drive accounts. Browse, upload, download, and manage your object storage and consumer cloud drives within one unified interface.',
  },
  {
    icon: Share2,
    title: 'Secure Public Sharing & Link Management',
    desc: 'Generate secure public download and preview links for any file stored in your connected Google Drives. Configure optional link expiration dates, enable or disable public sharing with one toggle, and revoke access tokens instantly whenever collaboration concludes.',
  },
  {
    icon: Trash2,
    title: 'Recycle Bin & Safe Recovery',
    desc: 'Accidental file deletions are protected by DriveSync One’s dedicated Recycle Bin. View trashed items across all connected cloud accounts, restore files back to their original folder locations with a single click, or permanently purge files when you need to free up storage quota.',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-Grade AES-256 Token Encryption',
    desc: 'Security and privacy are engineered into every layer of DriveSync One. All Google OAuth refresh tokens and provider secrets are encrypted at rest using AES-256-GCM. DriveSync One never stores your Google account passwords, never scrapes your private file contents, and does not train artificial intelligence models on your documents.',
  },
  {
    icon: Code2,
    title: '100% Free & Open-Source Software',
    desc: 'DriveSync One is completely free to use with zero paywalls, zero subscription tiers, and no artificial bandwidth caps. The entire codebase is open-source under the MIT license on GitHub, enabling complete transparency, community contributions, and self-hosting capabilities.',
  },
]

export default function FeaturesPage() {
  return (
    <MarketingShell maxWidth="7xl">
      <Breadcrumbs items={[{ name: 'Features', href: '/features' }]} />

      <header className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Platform Architecture &amp; Capabilities
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Everything You Need to Manage Multiple Google Drives &amp; S3
        </h1>
        <p className="mt-4 text-base sm:text-lg text-ink-2 leading-relaxed">
          DriveSync One (DriveSync) solves cloud fragmentation. Explore our complete suite of
          multi-account storage pooling, cross-drive search, automated upload routing, and
          in-browser streaming tools built for power users.
        </p>
      </header>

      <section className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Feature list">
        {FEATURE_LIST.map((feat) => {
          const Icon = feat.icon
          return (
            <article
              key={feat.title}
              className="rounded-3xl border border-line bg-surface p-7 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent" aria-hidden="true">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-lg font-bold text-ink">
                  {feat.title}
                </h2>
                <p className="mt-2.5 text-xs sm:text-sm text-ink-2 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </article>
          )
        })}
      </section>

      {/* Conversion Banner */}
      <section className="mt-20 rounded-3xl border border-accent/20 bg-accent-soft/20 p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
          Start Combining Your Google Drive Accounts Today
        </h2>
        <p className="text-sm text-ink-2 max-w-xl mx-auto leading-relaxed">
          Connect your Google accounts in 30 seconds via official Google OAuth. Pool your free
          storage tiers and manage all your files from one fast, unified workspace.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-7 text-sm font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/compare/multcloud"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-6 text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
          >
            <span>Compare with MultCloud</span>
          </Link>
        </div>
      </section>
    </MarketingShell>
  )
}

