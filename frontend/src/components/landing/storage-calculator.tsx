'use client'

import * as React from 'react'
import { ShieldCheck, Sparkles } from 'lucide-react'

interface AccountOption {
  email: string
  label: string
  quotaGb: number
  color: string
}

const SAMPLE_ACCOUNTS: AccountOption[] = [
  { email: 'personal@gmail.com', label: 'Personal', quotaGb: 15, color: '#4285F4' },
  { email: 'work@company.com', label: 'Work', quotaGb: 15, color: '#0F9D58' },
  { email: 'student@university.edu', label: 'University', quotaGb: 15, color: '#F4B400' },
  { email: 'freelance@client.org', label: 'Projects', quotaGb: 15, color: '#EA4335' },
  { email: 'archive@backup.net', label: 'Backups', quotaGb: 15, color: '#8B5CF6' },
]

export function StorageCalculator() {
  const [selectedCount, setSelectedCount] = React.useState(3)

  const activeAccounts = SAMPLE_ACCOUNTS.slice(0, selectedCount)
  const totalPooledGb = activeAccounts.reduce((acc, curr) => acc + curr.quotaGb, 0)
  const estimatedUsedGb = Math.round(totalPooledGb * 0.38)

  return (
    <div className="w-full max-w-xl rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-card">
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-ink">
            Live Storage Pooling Calculator
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-success">
          <ShieldCheck className="h-3.5 w-3.5" />
          100% Free Tiers
        </span>
      </div>

      {/* Account Count Selector */}
      <div className="mt-6">
        <label className="text-xs font-medium uppercase tracking-wider text-ink-3">
          Select How Many Google Accounts You Own
        </label>
        <div className="mt-2.5 flex items-center gap-2">
          {[2, 3, 4, 5].map((count) => {
            const isSelected = selectedCount === count
            return (
              <button
                key={count}
                type="button"
                onClick={() => setSelectedCount(count)}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-accent text-accent-ink shadow-sm'
                    : 'border border-line bg-surface-2 text-ink-2 hover:bg-surface hover:text-ink'
                }`}
              >
                {count} Accounts
              </button>
            )
          })}
        </div>
      </div>

      {/* Pooled Storage Metric */}
      <div className="mt-6 rounded-2xl bg-surface-2 p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs text-ink-3 font-medium">Combined Cloud Storage</div>
            <div className="text-3xl font-bold tracking-tight text-ink mt-0.5">
              {totalPooledGb} <span className="text-lg font-medium text-ink-2">GB</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full inline-block">
              $0.00 / month
            </div>
            <div className="text-[11px] text-ink-3 mt-1">Free 15 GB Google tiers merged</div>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="mt-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-line flex">
            {activeAccounts.map((account, idx) => {
              const widthPct = (1 / selectedCount) * 100
              return (
                <div
                  key={account.email}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: account.color,
                  }}
                  className={`h-full transition-all duration-300 ${
                    idx !== activeAccounts.length - 1 ? 'border-r-2 border-surface' : ''
                  }`}
                  title={`${account.label}: ${account.quotaGb} GB`}
                />
              )
            })}
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-3">
            <span>~{estimatedUsedGb} GB Used (38%)</span>
            <span>{totalPooledGb - estimatedUsedGb} GB Available Free</span>
          </div>
        </div>
      </div>

      {/* Connected Accounts Preview Chips */}
      <div className="mt-5 space-y-2">
        <div className="text-xs font-medium text-ink-3">Accounts in your virtual pool:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activeAccounts.map((account) => (
            <div
              key={account.email}
              className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs"
            >
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: account.color }}
              />
              <span className="truncate font-medium text-ink flex-1">{account.email}</span>
              <span className="font-semibold text-ink-2 shrink-0">{account.quotaGb} GB</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

