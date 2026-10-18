import * as React from 'react'
import { Check, X, Minus } from 'lucide-react'

interface ComparisonRow {
  feature: string
  drivesync: boolean | string
  googleDrive: boolean | string
  dropbox: boolean | string
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: 'Connect Multiple Google Accounts',
    drivesync: true,
    googleDrive: false,
    dropbox: false,
  },
  {
    feature: 'Combined Storage Quota Pooling',
    drivesync: 'Up to 75+ GB Free',
    googleDrive: '15 GB per profile',
    dropbox: '2 GB Free',
  },
  {
    feature: 'Cross-Account Global Search',
    drivesync: true,
    googleDrive: false,
    dropbox: false,
  },
  {
    feature: 'Smart Upload Auto-Routing',
    drivesync: true,
    googleDrive: false,
    dropbox: false,
  },
  {
    feature: 'Zero Profile Switching',
    drivesync: true,
    googleDrive: false,
    dropbox: false,
  },
  {
    feature: 'In-App Video & PDF Streaming',
    drivesync: true,
    googleDrive: true,
    dropbox: 'Limited',
  },
  {
    feature: 'Custom S3 Storage Support',
    drivesync: true,
    googleDrive: false,
    dropbox: false,
  },
  {
    feature: 'AES-256 Token Encryption at Rest',
    drivesync: true,
    googleDrive: true,
    dropbox: true,
  },
]

export function ComparisonTable() {
  return (
    <section id="comparison" className="py-20 sm:py-28 bg-surface-2/30 border-t border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">
            Head-to-Head Comparison
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Why Multi-Account Users Switch to DriveSync
          </p>
          <p className="mt-3 text-sm text-ink-2">
            See how DriveSync stacks up against single-account cloud storage providers.
          </p>
        </div>

        {/* Table Frame */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface-2 text-ink">
                <tr>
                  <th className="py-4 px-6 font-semibold w-1/3">Capability</th>
                  <th className="py-4 px-6 font-bold text-accent bg-accent-soft/30 w-1/4">
                    DriveSync
                  </th>
                  <th className="py-4 px-6 font-medium text-ink-2 w-1/5">Google Drive</th>
                  <th className="py-4 px-6 font-medium text-ink-2 w-1/5">Dropbox</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {COMPARISON_DATA.map((row) => (
                  <tr key={row.feature} className="hover:bg-surface-2/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-ink">{row.feature}</td>

                    {/* DriveSync Column */}
                    <td className="py-4 px-6 font-semibold text-accent bg-accent-soft/10">
                      {typeof row.drivesync === 'boolean' ? (
                        row.drivesync ? (
                          <span className="flex items-center gap-1.5 text-accent">
                            <Check className="h-4 w-4" /> Yes
                          </span>
                        ) : (
                          <X className="h-4 w-4 text-danger" />
                        )
                      ) : (
                        row.drivesync
                      )}
                    </td>

                    {/* Google Drive Column */}
                    <td className="py-4 px-6 text-ink-2">
                      {typeof row.googleDrive === 'boolean' ? (
                        row.googleDrive ? (
                          <span className="flex items-center gap-1.5 text-ink-2">
                            <Check className="h-4 w-4" /> Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-ink-3">
                            <X className="h-4 w-4 text-danger/80" /> No
                          </span>
                        )
                      ) : (
                        row.googleDrive
                      )}
                    </td>

                    {/* Dropbox Column */}
                    <td className="py-4 px-6 text-ink-2">
                      {typeof row.dropbox === 'boolean' ? (
                        row.dropbox ? (
                          <span className="flex items-center gap-1.5 text-ink-2">
                            <Check className="h-4 w-4" /> Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-ink-3">
                            <X className="h-4 w-4 text-danger/80" /> No
                          </span>
                        )
                      ) : (
                        row.dropbox
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

