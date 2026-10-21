import * as React from 'react'
import {
  Layers,
  Zap,
  ShieldCheck,
  Search,
  Eye,
} from 'lucide-react'

export function BentoFeatures() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">
            Core Capabilities
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Everything You Need Across Every Google Drive
          </p>
          <p className="mt-3 text-sm text-ink-2">
            Engineered from the ground up to eliminate the friction of managing fragmented cloud
            accounts.
          </p>

          {/* Quick Explainer for Search Snippets & Direct Answers */}
          <div className="mt-6 rounded-2xl border border-line bg-surface p-5 text-left text-xs sm:text-sm text-ink-2 leading-relaxed shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent mb-1.5">
              What is DriveSync One?
            </h3>
            <p>
              <strong>DriveSync One</strong> (also known as <strong>DriveSync</strong>) is a 100% free
              and open-source unified multi-account Google Drive and S3 cloud file manager. It merges
              multiple Google accounts into a single pooled workspace with cross-account search, smart
              upload auto-routing, and streaming previews. With zero subscriptions or transfer fees,
              DriveSync One lets you access all your cloud storage in one place while your files remain
              safely stored in your original cloud accounts.
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Multi-Account Storage Pooling (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 rounded-3xl border border-line bg-surface p-8 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent" aria-hidden="true">
                <Layers className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-ink">
                Virtual Storage Quota Pooling
              </h3>
              <p className="mt-2 text-sm text-ink-2 max-w-xl">
                Combine multiple 15 GB free tiers from your personal, university, and secondary Google
                accounts into one pooled virtual drive. Maximize underutilized space across drives
                without paying for multiple Google One subscriptions.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-line bg-surface-2 p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-ink">
                <span>Unified Cloud Pool (3 Linked Accounts)</span>
                <span className="text-accent font-bold">45 GB Combined Free Storage</span>
              </div>
              <div className="mt-3 h-3 w-full rounded-full bg-line overflow-hidden flex">
                <div style={{ width: '33.33%' }} className="bg-[#4285F4] h-full" title="Personal: 15 GB" />
                <div style={{ width: '33.33%' }} className="bg-[#0F9D58] h-full" title="Work: 15 GB" />
                <div style={{ width: '33.34%' }} className="bg-[#F4B400] h-full" title="University: 15 GB" />
              </div>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-3">
                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#4285F4]" aria-hidden="true" /> personal@gmail.com (15 GB)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#0F9D58]" aria-hidden="true" /> work@company.com (15 GB)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#F4B400]" aria-hidden="true" /> alumni@university.edu (15 GB)
                  </span>
                </div>
                <span className="text-[10px] text-ink-3 italic">
                  *Google 15 GB quota is shared across Drive, Gmail, &amp; Photos per account
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Smart Upload Auto-Routing */}
          <div className="rounded-3xl border border-line bg-surface p-8 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success" aria-hidden="true">
                <Zap className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-ink">
                Smart Upload Auto-Routing
              </h3>
              <p className="mt-2 text-sm text-ink-2">
                Drop your files and DriveSync automatically selects the Google Drive with the most
                available space, or routes based on your custom priority rules.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-4 text-xs">
              <div className="font-semibold text-ink">Active Policy: Most Available</div>
              <div className="mt-1 text-ink-3 text-[11px]">
                Incoming uploads target the drive with the highest free quota automatically.
              </div>
            </div>
          </div>

          {/* Card 3: Cross-Account Global Search */}
          <div className="rounded-3xl border border-line bg-surface p-8 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EA4335]/10 text-[#EA4335]" aria-hidden="true">
                <Search className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-ink">
                Cross-Account Global Search
              </h3>
              <p className="mt-2 text-sm text-ink-2">
                Search file names, mime types, and date ranges spanning every connected drive
                simultaneously. Never wonder which account holds a file again.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-ink-2 border border-line">
                Type: PDF
              </span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-ink-2 border border-line">
                Modified: 7 days
              </span>
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent font-medium">
                Account: All
              </span>
            </div>
          </div>

          {/* Card 4: In-App Media Previews */}
          <div className="rounded-3xl border border-line bg-surface p-8 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B5CF6]/10 text-[#8B5CF6]" aria-hidden="true">
                <Eye className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-ink">
                Streaming Media Previews
              </h3>
              <p className="mt-2 text-sm text-ink-2">
                Play 4K videos, listen to audio files, read multi-page PDFs, and zoom images directly
                in your browser without waiting for large downloads.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-4 text-xs flex items-center justify-between">
              <span className="text-ink-2 font-medium">Supported Formats:</span>
              <span className="text-accent font-semibold">MP4, PDF, MP3, PNG, DOCX</span>
            </div>
          </div>

          {/* Card 5: Bank-Grade Security & Isolation */}
          <div className="rounded-3xl border border-line bg-surface p-8 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent" aria-hidden="true">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-ink">
                AES-256 Token Encryption
              </h3>
              <p className="mt-2 text-sm text-ink-2">
                Google OAuth tokens are encrypted at rest with AES-256-GCM. DriveSync never exposes
                credentials to the browser and never scrapes your file content.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-success font-medium">
              <span className="h-2 w-2 rounded-full bg-success" />
              100% Free &amp; Open Source • Zero AI Training • Official Google OAuth
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

