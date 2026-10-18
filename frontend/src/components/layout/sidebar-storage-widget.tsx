'use client'

import * as React from 'react'
import Link from 'next/link'
import { formatBytes } from '@/lib/utils'
import { useAccountStore } from '@/stores/account-store'
import { MultiAccountStorageBar } from '@/components/accounts/multi-account-storage-bar'

interface SidebarStorageWidgetProps {
  onNavigate?: () => void
}

export function SidebarStorageWidget({ onNavigate }: SidebarStorageWidgetProps) {
  const storageSummary = useAccountStore((state) => state.storageSummary)

  const usedBytes = Number(storageSummary?.usedBytes || 0)
  const totalBytes = Number(storageSummary?.totalBytes || 0)
  const percentage = totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 100)) : 0

  return (
    <div className="pt-4 border-t border-line/60">
      <Link
        href="/storage"
        onClick={onNavigate}
        className="block rounded-2xl bg-surface-2 p-3.5 hover:bg-surface transition-all border border-line/40 group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-ink group-hover:text-accent transition-colors">
            Storage Pool
          </span>
          <span className="text-[11px] font-bold text-ink-2">{percentage}%</span>
        </div>

        {/* Multi-Account Segmented Progress Bar */}
        <MultiAccountStorageBar compact />

        <div className="mt-2 flex items-center justify-between text-[11px] text-ink-3">
          <span>
            {formatBytes(usedBytes)} of {formatBytes(totalBytes)}
          </span>
          <span className="text-accent group-hover:underline font-medium">Manage</span>
        </div>
      </Link>
    </div>
  )
}

