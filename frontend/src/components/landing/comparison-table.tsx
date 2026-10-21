import * as React from 'react'
import Link from 'next/link'
import { Check, X, ArrowRight } from 'lucide-react'

interface ComparisonRow {
  feature: string
  drivesync: boolean | string
  multcloud: boolean | string
  rclone: boolean | string
  googleDrive: boolean | string
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: 'Connect Multiple Google Accounts',
    drivesync: true,
    multcloud: true,
    rclone: true,
    googleDrive: false,
  },
  {
    feature: 'Storage Quota Pooling',
    drivesync: '45–75 GB Free (15 GB/account)',
    multcloud: '5 GB/mo transfer limit',
    rclone: 'Manual union config',
    googleDrive: '15 GB isolated per profile',
  },
  {
    feature: 'Cross-Account Search',
    drivesync: true,
    multcloud: 'Basic search',
    rclone: 'CLI grep only',
    googleDrive: false,
  },
  {
    feature: 'Smart Upload Auto-Routing',
    drivesync: true,
    multcloud: false,
    rclone: 'Complex CLI policy',
    googleDrive: false,
  },
  {
    feature: 'Zero Profile Switching',
    drivesync: true,
    multcloud: true,
    rclone: 'Terminal only',
    googleDrive: false,
  },
  {
    feature: 'Modern Web UI with Streaming Previews',
    drivesync: true,
    multcloud: 'Basic viewer',
    rclone: false,
    googleDrive: true,
  },
  {
    feature: 'Amazon S3 & S3-Compatible Gateway',
    drivesync: true,
    multcloud: true,
    rclone: true,
    googleDrive: false,
  },
  {
    feature: 'Pricing Model',
    drivesync: 'Free Core Tier',
    multcloud: 'From $9.90 / mo',
    rclone: 'Free (open-source)',
    googleDrive: 'From $1.99 / mo',
  },
]

export function ComparisonTable() {
  return (
    <section id="comparison" className="py-20 sm:py-28 bg-surface-2/30 border-t border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Factual Cloud Comparison
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Why Multi-Account Users Choose DriveSync One
          </h2>
          <p className="mt-3 text-sm text-ink-2">
            See how DriveSync One compares against single-account cloud drives, MultCloud, and CLI tools.
          </p>
        </div>

        {/* Table Frame */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-line bg-surface-2 text-ink">
                <tr>
                  <th className="py-4 px-5 font-semibold w-2/6">Capability</th>
                  <th className="py-4 px-5 font-bold text-accent bg-accent-soft/30 w-1/6">
                    DriveSync One
                  </th>
                  <th className="py-4 px-5 font-medium text-ink-2 w-1/6">MultCloud</th>
                  <th className="py-4 px-5 font-medium text-ink-2 w-1/6">rclone (union)</th>
                  <th className="py-4 px-5 font-medium text-ink-2 w-1/6">Google Drive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {COMPARISON_DATA.map((row) => (
                  <tr key={row.feature} className="hover:bg-surface-2/40 transition-colors">
                    <td className="py-4 px-5 font-medium text-ink">{row.feature}</td>

                    {/* DriveSync One Column */}
                    <td className="py-4 px-5 font-semibold text-accent bg-accent-soft/10">
                      {typeof row.drivesync === 'boolean' ? (
                        row.drivesync ? (
                          <span className="flex items-center gap-1.5 text-accent">
                            <Check className="h-4 w-4" aria-hidden="true" /> Yes
                          </span>
                        ) : (
                          <X className="h-4 w-4 text-danger" aria-hidden="true" />
                        )
                      ) : (
                        row.drivesync
                      )}
                    </td>

                    {/* MultCloud Column */}
                    <td className="py-4 px-5 text-ink-2">
                      {typeof row.multcloud === 'boolean' ? (
                        row.multcloud ? (
                          <span className="flex items-center gap-1.5 text-ink-2">
                            <Check className="h-4 w-4" aria-hidden="true" /> Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-ink-3">
                            <X className="h-4 w-4 text-danger/80" aria-hidden="true" /> No
                          </span>
                        )
                      ) : (
                        row.multcloud
                      )}
                    </td>

                    {/* rclone Column */}
                    <td className="py-4 px-5 text-ink-2">
                      {typeof row.rclone === 'boolean' ? (
                        row.rclone ? (
                          <span className="flex items-center gap-1.5 text-ink-2">
                            <Check className="h-4 w-4" aria-hidden="true" /> Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-ink-3">
                            <X className="h-4 w-4 text-danger/80" aria-hidden="true" /> No
                          </span>
                        )
                      ) : (
                        row.rclone
                      )}
                    </td>

                    {/* Google Drive Column */}
                    <td className="py-4 px-5 text-ink-2">
                      {typeof row.googleDrive === 'boolean' ? (
                        row.googleDrive ? (
                          <span className="flex items-center gap-1.5 text-ink-2">
                            <Check className="h-4 w-4" aria-hidden="true" /> Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-ink-3">
                            <X className="h-4 w-4 text-danger/80" aria-hidden="true" /> No
                          </span>
                        )
                      ) : (
                        row.googleDrive
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-3">
          <p>
            *Free Google account quota (15 GB) is shared across Google Drive, Gmail, and Google Photos.
          </p>
          <Link
            href="/compare/multcloud"
            className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
          >
            <span>Read full DriveSync One vs MultCloud comparison</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
