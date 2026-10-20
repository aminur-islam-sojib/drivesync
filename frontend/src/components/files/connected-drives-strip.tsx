'use client'

import * as React from 'react'
import { HardDrive, Cloud, Database, Plus, Layers } from 'lucide-react'
import { useAccountStore } from '@/stores/account-store'
import { useDialogStore } from '@/stores/dialog-store'
import { formatBytes } from '@/lib/utils'

export function ConnectedDrivesStrip() {
  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)
  const selectedAccountId = useAccountStore((state) => state.selectedAccountId)
  const setSelectedAccountId = useAccountStore((state) => state.setSelectedAccountId)
  const openDialog = useDialogStore((state) => state.openDialog)

  if (connectedAccounts.length === 0) {
    return null
  }

  // Calculate total unified metrics across drives
  const totalUsedBytes = connectedAccounts.reduce((acc, account) => {
    return acc + BigInt(account.storageAccount?.usedBytes || 0)
  }, BigInt(0))

  return (
    <section aria-label="Connected Drives" className="space-y-2 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-3">
          <HardDrive className="h-3.5 w-3.5 text-ink-3" />
          <span>Storage Sources</span>
        </div>
        <button
          type="button"
          onClick={() => openDialog('connect-drive')}
          className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline cursor-pointer"
        >
          <Plus className="h-3 w-3 stroke-[2.5]" />
          <span>Add Drive</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* 1. All Drives (Unified Virtual Volume) */}
        <button
          type="button"
          onClick={() => setSelectedAccountId(null)}
          className={`group flex items-center gap-2.5 rounded-2xl border px-3.5 py-2 text-left transition-all cursor-pointer shrink-0 outline-none ${
            selectedAccountId === null
              ? 'border-accent bg-accent-soft/40 shadow-xs ring-1 ring-accent'
              : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/50'
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              selectedAccountId === null
                ? 'bg-accent text-accent-ink shadow-xs'
                : 'bg-surface-2 text-ink-2 group-hover:text-ink'
            }`}
          >
            <Layers className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-ink">All Drives</span>
              <span className="rounded-full bg-surface-2 px-1.5 py-0.2 text-[9px] font-medium text-ink-3">
                Unified
              </span>
            </div>
            <p className="text-[10px] text-ink-3 truncate">
              {connectedAccounts.length} sources • {formatBytes(totalUsedBytes.toString())}
            </p>
          </div>
        </button>

        {/* 2. Individual Cloud Sources (Google Drive & S3) */}
        {connectedAccounts.map((account) => {
          const isSelected = selectedAccountId === account.id
          const isS3 = account.provider === 's3'
          const usedBytes = account.storageAccount?.usedBytes || '0'
          const totalQuota = account.storageAccount?.totalBytes

          return (
            <button
              key={account.id}
              type="button"
              onClick={() => setSelectedAccountId(account.id)}
              className={`group flex items-center gap-2.5 rounded-2xl border px-3.5 py-2 text-left transition-all cursor-pointer shrink-0 outline-none ${
                isSelected
                  ? 'border-accent bg-accent-soft/40 shadow-xs ring-1 ring-accent'
                  : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/50'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-accent text-accent-ink shadow-xs'
                    : 'bg-surface-2 text-ink-2 group-hover:text-ink'
                }`}
              >
                {isS3 ? (
                  <Database className="h-4 w-4" />
                ) : (
                  <Cloud className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 max-w-[160px]">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-ink truncate">
                    {account.displayName || account.email.split('@')[0]}
                  </p>
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      account.status === 'connected' ? 'bg-success' : 'bg-warning'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-ink-3 truncate">
                  {formatBytes(usedBytes)}
                  {totalQuota ? ` / ${formatBytes(totalQuota)}` : ''}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

