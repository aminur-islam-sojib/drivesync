'use client'

import * as React from 'react'
import {
  HardDrive,
  Database,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAccountStore } from '@/stores/account-store'
import { useDialogStore } from '@/stores/dialog-store'
import { formatBytes } from '@/lib/utils'
import { MultiAccountStorageBar } from '@/components/accounts/multi-account-storage-bar'
import { RoutingPolicyCard } from '@/components/accounts/routing-policy-card'

export default function StoragePage() {
  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)
  const storageSummary = useAccountStore((state) => state.storageSummary)
  const isLoading = useAccountStore((state) => state.isLoading)
  const fetchAccountsAndStorage = useAccountStore((state) => state.fetchAccountsAndStorage)
  const openDialog = useDialogStore((state) => state.openDialog)

  const usedBytes = Number(storageSummary?.usedBytes || 0)
  const totalBytes = Number(storageSummary?.totalBytes || 0)
  const availableBytes = Number(storageSummary?.availableBytes || 0)
  const percentage = totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 100)) : 0

  const handleRefresh = async () => {
    await fetchAccountsAndStorage()
    toast.success('Storage quotas synchronized with Google Drive and S3.')
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/40 select-none">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-3">
            <span>DriveSync</span>
            <span>&gt;</span>
            <span className="text-ink font-medium">Storage</span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-ink">
            Storage Pool & Quotas
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-accent' : ''}`} />
            <span>Sync Quotas</span>
          </button>

          <button
            type="button"
            onClick={() => openDialog('connect-drive')}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Drive</span>
          </button>
        </div>
      </div>

      {/* Aggregate Storage Card */}
      <div className="rounded-3xl border border-line bg-surface-2 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              Combined Storage Capacity
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                {formatBytes(usedBytes)}
              </span>
              <span className="text-sm font-semibold text-ink-3">
                of {formatBytes(totalBytes)} pooled
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="rounded-2xl bg-surface p-3 border border-line text-center min-w-28">
              <span className="text-ink-3 block text-[11px]">Free Space</span>
              <span className="text-sm font-bold text-success">{formatBytes(availableBytes)}</span>
            </div>
            <div className="rounded-2xl bg-surface p-3 border border-line text-center min-w-28">
              <span className="text-ink-3 block text-[11px]">Connected Accounts</span>
              <span className="text-sm font-bold text-accent">{connectedAccounts.length}</span>
            </div>
          </div>
        </div>

        {/* Multi-Account Segmented Storage Visualizer */}
        <div className="space-y-3">
          <MultiAccountStorageBar showLegend />
          <div className="flex justify-between text-xs text-ink-3 pt-1">
            <span>{percentage}% utilized</span>
            <span>{100 - percentage}% remaining across all pooled accounts</span>
          </div>
        </div>
      </div>

      {/* Per-Account Breakdown */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-3">
            Connected Storage Accounts ({connectedAccounts.length})
          </h2>
        </div>

        {connectedAccounts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line p-10 text-center text-ink-3 space-y-3">
            <HardDrive className="h-10 w-10 mx-auto opacity-30 text-accent" />
            <p className="text-sm font-semibold text-ink">No storage accounts connected</p>
            <p className="text-xs text-ink-3 max-w-sm mx-auto">
              Link your personal and work Google Drives or AWS S3 buckets to aggregate your quotas.
            </p>
            <button
              type="button"
              onClick={() => openDialog('connect-drive')}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-ink shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Connect First Drive</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedAccounts.map((account) => {
              const accUsed = Number(account.storageAccount?.usedBytes || 0)
              const accTotal = Number(account.storageAccount?.totalBytes || 15 * 1024 * 1024 * 1024)
              const accPercent =
                accTotal > 0 ? Math.min(100, Math.round((accUsed / accTotal) * 100)) : 0
              const isError = account.status === 'error'

              return (
                <div
                  key={account.id}
                  className="rounded-2xl border border-line bg-surface p-5 space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 truncate">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 border border-line">
                        {account.provider === 'google_drive' ? (
                          <HardDrive className="h-5 w-5 text-accent" />
                        ) : (
                          <Database className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-ink truncate">
                          {account.displayName || account.email}
                        </p>
                        <p className="text-[11px] text-ink-3 truncate">{account.email}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isError
                          ? 'bg-danger/10 text-danger'
                          : 'bg-success/10 text-success'
                      }`}
                    >
                      {isError ? (
                        <>
                          <AlertTriangle className="h-3 w-3" />
                          <span>Error</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Active</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-ink-2">{formatBytes(accUsed)}</span>
                      <span className="text-ink-3">{formatBytes(accTotal)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${accPercent}%` }}
                      />
                    </div>
                    <div className="text-right text-[10px] text-ink-3">
                      {accPercent}% capacity used
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Upload Routing Strategy */}
      <RoutingPolicyCard />
    </div>
  )
}
