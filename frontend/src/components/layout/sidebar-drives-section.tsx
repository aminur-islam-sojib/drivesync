'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Layers, HardDrive, Database, Plus, AlertCircle } from 'lucide-react'
import { useAccountStore } from '@/stores/account-store'
import { useDialogStore } from '@/stores/dialog-store'
import { getAccountColor } from '@/components/accounts/multi-account-storage-bar'
import { formatBytes } from '@/lib/utils'

interface SidebarDrivesSectionProps {
  onSelectAccount?: () => void
}

export function SidebarDrivesSection({ onSelectAccount }: SidebarDrivesSectionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const openDialog = useDialogStore((state) => state.openDialog)
  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)
  const selectedAccountId = useAccountStore((state) => state.selectedAccountId)
  const setSelectedAccountId = useAccountStore((state) => state.setSelectedAccountId)
  const storageSummary = useAccountStore((state) => state.storageSummary)

  const handleAccountFilter = (accountId: string | null) => {
    setSelectedAccountId(accountId)
    if (pathname !== '/all-files') {
      router.push('/all-files')
    }
    onSelectAccount?.()
  }

  // Aggregated totals for the "All Connected Drives" item
  const totalUsed = Number(storageSummary?.usedBytes || 0)
  const totalCapacity = Number(storageSummary?.totalBytes || 0)
  const totalPct =
    totalCapacity > 0 ? Math.min(100, Math.round((totalUsed / totalCapacity) * 100)) : 0

  return (
    <div className="pt-3 border-t border-line/60">
      {/* Header with Title & Add Action */}
      <div className="flex items-center justify-between px-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3">
            Connected Drives
          </span>
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-surface-2 px-1 text-[10px] font-bold text-ink-3 border border-line/40">
            {connectedAccounts.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => openDialog('connect-drive')}
          className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline cursor-pointer transition-colors"
          title="Connect another drive"
        >
          <Plus className="h-3 w-3 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {/* 1. All Connected Drives (Unified Pool) */}
        <button
          type="button"
          onClick={() => handleAccountFilter(null)}
          className={`flex flex-col w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer ${
            selectedAccountId === null
              ? 'bg-accent-soft/40 border-accent/40 shadow-xs ring-1 ring-accent/30'
              : 'border-transparent hover:border-line/60 hover:bg-surface-2/60 text-ink-2'
          }`}
        >
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20">
                <Layers className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-ink truncate">
                  All Connected Drives
                </span>
                <span className="block text-[10.5px] text-ink-3 truncate mt-0.5">
                  Unified storage pool ({connectedAccounts.length} {connectedAccounts.length === 1 ? 'drive' : 'drives'})
                </span>
              </div>
            </div>

            {totalCapacity > 0 && (
              <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md bg-surface-2 text-ink-2 border border-line/40 shrink-0">
                {totalPct}%
              </span>
            )}
          </div>

          {/* Micro Progress Track */}
          {totalCapacity > 0 && (
            <div className="mt-2 w-full space-y-1">
              <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(totalPct, 2)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-ink-3 tabular-nums">
                <span>{formatBytes(totalUsed)} used</span>
                <span>{formatBytes(totalCapacity)}</span>
              </div>
            </div>
          )}
        </button>

        {/* 2. Individual Drive Items with Display Name, Email & Analyzed UI */}
        {connectedAccounts.map((account, index) => {
          const isSelected = selectedAccountId === account.id
          const isError = account.status === 'error'
          const isGoogle = account.provider === 'google_drive'
          const accountColor = getAccountColor(index)

          // Find analyzed metrics from storage summary
          const metric = storageSummary?.accounts?.find(
            (m) => m.id === account.id || m.email === account.email
          )
          const usedBytes = Number(metric?.usedBytes ?? account.storageAccount?.usedBytes ?? 0)
          const totalBytes = Number(metric?.totalBytes ?? account.storageAccount?.totalBytes ?? 0)
          const pct =
            metric?.percentage ??
            (totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 100)) : 0)

          const driveTitle =
            account.displayName || (isGoogle ? 'Google Drive' : 'S3 Storage')

          return (
            <button
              key={account.id}
              type="button"
              onClick={() => handleAccountFilter(account.id)}
              className={`flex flex-col w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-accent-soft/40 border-accent/40 shadow-xs ring-1 ring-accent/30'
                  : 'border-transparent hover:border-line/60 hover:bg-surface-2/60 text-ink-2'
              }`}
            >
              {/* Account Identity: Avatar/Icon + Title + Email */}
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface border border-line/60 shadow-2xs overflow-hidden">
                      {account.avatarUrl ? (
                        <Image
                          src={account.avatarUrl}
                          alt={account.email}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : isGoogle ? (
                        <div className="flex h-full w-full items-center justify-center bg-[#4285F4]/10 text-[#4285F4]">
                          <HardDrive className="h-4 w-4 stroke-[2.2]" />
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-amber-500/10 text-amber-600">
                          <Database className="h-4 w-4 stroke-[2.2]" />
                        </div>
                      )}
                    </div>
                    {/* Status Indicator Dot */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface shrink-0 ${
                        isError ? 'bg-danger animate-pulse' : 'bg-success'
                      }`}
                    />
                  </div>

                  {/* Title & Email Address */}
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-ink truncate leading-tight">
                      {driveTitle}
                    </span>
                    <span
                      className="block text-[10.5px] text-ink-3 truncate mt-0.5 leading-tight font-normal"
                      title={account.email}
                    >
                      {account.email}
                    </span>
                  </div>
                </div>

                {/* Analyzed Percentage Badge or Status */}
                {isError ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-danger bg-danger/10 px-1.5 py-0.5 rounded-md border border-danger/20 shrink-0">
                    <AlertCircle className="h-3 w-3" />
                    <span>Error</span>
                  </span>
                ) : (
                  totalBytes > 0 && (
                    <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md bg-surface-2 text-ink-2 border border-line/40 shrink-0">
                      {pct}%
                    </span>
                  )
                )}
              </div>

              {/* Analyzed Storage Utilization Micro Bar */}
              {totalBytes > 0 && !isError && (
                <div className="mt-2 w-full space-y-1">
                  <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        backgroundColor: accountColor,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-ink-3 tabular-nums">
                    <span>{formatBytes(usedBytes)} used</span>
                    <span>{formatBytes(totalBytes)}</span>
                  </div>
                </div>
              )}
            </button>
          )
        })}

        {/* Empty state when 0 accounts */}
        {connectedAccounts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line/60 p-3.5 text-center bg-surface/40 my-1">
            <p className="text-xs text-ink-3">No drives connected yet</p>
            <button
              type="button"
              onClick={() => openDialog('connect-drive')}
              className="mt-1 text-xs text-accent font-semibold hover:underline cursor-pointer"
            >
              + Connect Google Drive
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
