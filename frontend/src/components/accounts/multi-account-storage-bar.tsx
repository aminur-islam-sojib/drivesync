'use client'

import * as React from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useAccountStore } from '@/stores/account-store'
import { formatBytes } from '@/lib/utils'

export const ACCOUNT_PALETTE = [
  '#4285F4', // Google Blue
  '#34A853', // Google Green
  '#FBBC05', // Google Amber
  '#A142F4', // Purple
  '#00ACC1', // Teal
  '#E91E63', // Rose
  '#FF7043', // Deep Orange
  '#5C6BC0', // Indigo
]

export function getAccountColor(index: number): string {
  return ACCOUNT_PALETTE[index % ACCOUNT_PALETTE.length]
}

interface MultiAccountStorageBarProps {
  showLegend?: boolean
  compact?: boolean
  className?: string
}

export function MultiAccountStorageBar({
  showLegend = false,
  compact = false,
  className = '',
}: MultiAccountStorageBarProps) {
  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)
  const storageSummary = useAccountStore((state) => state.storageSummary)

  const usedBytes = Number(storageSummary?.usedBytes || 0)
  const totalBytes = Number(storageSummary?.totalBytes || 0)
  const totalPercentage =
    totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 100)) : 0

  return (
    <Tooltip.Provider delayDuration={150}>
      <div className={`space-y-2 select-none ${className}`}>
        {/* Segmented Bar Track */}
        <div
          className={`w-full rounded-full bg-surface-container-high overflow-hidden flex ${
            compact ? 'h-2' : 'h-3.5 p-0.5'
          }`}
        >
          {connectedAccounts.length === 0 || totalBytes === 0 ? (
            <div
              className="h-full rounded-full bg-accent/40 transition-all duration-300"
              style={{ width: `${totalPercentage}%` }}
            />
          ) : (
            connectedAccounts.map((account, index) => {
              const accUsed = Number(account.storageAccount?.usedBytes || 0)
              if (accUsed <= 0) return null

              const widthPercent = (accUsed / totalBytes) * 100
              const color = getAccountColor(index)
              const accTotal = Number(account.storageAccount?.totalBytes || 15 * 1024 * 1024 * 1024)

              return (
                <Tooltip.Root key={account.id}>
                  <Tooltip.Trigger asChild>
                    <div
                      className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:opacity-85 cursor-pointer"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: color,
                      }}
                    />
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="top"
                      sideOffset={6}
                      className="z-50 rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-pop text-ink animate-in fade-in duration-150"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-bold text-ink truncate max-w-[180px]">
                          {account.displayName || account.email}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-2">
                        {formatBytes(accUsed)} of {formatBytes(accTotal)}
                      </p>
                      <p className="text-[10px] text-ink-3">
                        {widthPercent.toFixed(1)}% of pooled capacity
                      </p>
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              )
            })
          )}
        </div>

        {/* Optional Multi-Account Legend */}
        {showLegend && connectedAccounts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
            {connectedAccounts.map((account, index) => {
              const color = getAccountColor(index)
              const accUsed = Number(account.storageAccount?.usedBytes || 0)
              const accTotal = Number(account.storageAccount?.totalBytes || 15 * 1024 * 1024 * 1024)

              return (
                <div
                  key={account.id}
                  className="flex items-center gap-2 text-xs text-ink-2 p-1.5 rounded-lg bg-surface border border-line/40 truncate"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="truncate flex-1">
                    <span className="font-medium text-ink truncate block">
                      {account.displayName || account.email}
                    </span>
                    <span className="text-[10px] text-ink-3">
                      {formatBytes(accUsed)} / {formatBytes(accTotal)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Tooltip.Provider>
  )
}

