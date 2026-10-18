'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Layers } from 'lucide-react'
import { useAccountStore } from '@/stores/account-store'
import { useDialogStore } from '@/stores/dialog-store'

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

  const handleAccountFilter = (accountId: string | null) => {
    setSelectedAccountId(accountId)
    if (pathname !== '/all-files') {
      router.push('/all-files')
    }
    onSelectAccount?.()
  }

  return (
    <div className="pt-2 border-t border-line/60">
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
          Drives ({connectedAccounts.length})
        </span>
        <button
          type="button"
          onClick={() => openDialog('connect-drive')}
          className="text-xs text-accent hover:underline cursor-pointer font-medium"
          title="Add another Google Drive"
        >
          + Add
        </button>
      </div>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => handleAccountFilter(null)}
          className={`flex w-full items-center justify-between h-8 px-3 rounded-lg text-xs transition-colors cursor-pointer ${
            selectedAccountId === null
              ? 'bg-accent-soft text-accent font-semibold'
              : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Layers className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">All Connected Drives</span>
          </div>
        </button>

        {connectedAccounts.map((account) => {
          const isSelected = selectedAccountId === account.id
          const isError = account.status === 'error'

          return (
            <button
              key={account.id}
              type="button"
              onClick={() => handleAccountFilter(account.id)}
              className={`flex w-full items-center justify-between h-8 px-3 rounded-lg text-xs transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-accent-soft text-accent font-semibold'
                  : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    isError ? 'bg-danger' : 'bg-success'
                  }`}
                />
                <span className="truncate">{account.displayName || account.email}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

