import * as React from 'react'
import Link from 'next/link'
import { HardDrive, Shield } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-surface py-12 text-xs text-ink-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-ink" aria-hidden="true">
              <HardDrive className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-ink">
              Drive<span className="text-accent">Sync</span> One
            </span>
            <span className="text-ink-3 text-[11px] hidden sm:inline">
              — Multi-Account Google Drive &amp; S3 Manager
            </span>
          </div>

          {/* Core Navigation Links */}
          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-ink-2 font-medium">
            <Link href="/features" className="hover:text-ink transition-colors">
              Features
            </Link>
            <Link href="/compare/multcloud" className="hover:text-ink transition-colors">
              Compare MultCloud
            </Link>
            <Link href="/security" className="hover:text-ink transition-colors">
              Security
            </Link>
            <Link href="/about" className="hover:text-ink transition-colors">
              About DriveSync
            </Link>
            <Link href="/blog" className="hover:text-ink transition-colors">
              Blog &amp; Guides
            </Link>
            <Link href="/contact" className="hover:text-ink transition-colors">
              Contact
            </Link>
            <Link href="/login" className="hover:text-ink transition-colors">
              Sign In
            </Link>
          </nav>

          {/* External Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/aminur-islam-sojib/drivesyncone"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-ink transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Legal & Notice */}
        <div className="mt-8 pt-8 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-3">
          <div className="flex flex-wrap items-center gap-4">
            <p>© 2026 DriveSync One. All rights reserved.</p>
            <Link href="/privacy" className="hover:text-ink transition-colors underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-ink transition-colors underline">
              Terms of Service
            </Link>
          </div>
          <p className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-success shrink-0" aria-hidden="true" />
            <span>Google Drive is a trademark of Google LLC. DriveSync One is an independent application.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
