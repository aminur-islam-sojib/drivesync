'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  Cloud,
  Database,
  Plus,
  Settings,
} from 'lucide-react'
import { useAccountStore } from '@/stores/account-store'
import { useDialogStore } from '@/stores/dialog-store'

function GoogleDriveLogo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 87.3 78" className={className} fill="none">
      <path
        d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
        fill="#0066da"
      />
      <path
        d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z"
        fill="#00ac47"
      />
      <path
        d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
        fill="#ea4335"
      />
      <path
        d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.25z"
        fill="#00832d"
      />
      <path
        d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.25z"
        fill="#2684fc"
      />
      <path
        d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
        fill="#ffba00"
      />
    </svg>
  )
}

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

  const hasAnyError = React.useMemo(() => {
    return connectedAccounts.some((a) => a.status === 'error')
  }, [connectedAccounts])

  return (
    <div className="rounded-2xl bg-surface-2 p-2.5 border border-line/20">
      <div className="border-line/60 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => openDialog('connect-drive')}
          className="flex items-center gap-2 text-xs font-semibold text-ink hover:text-accent transition-colors cursor-pointer group"
        >
          <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full border border-line text-ink-2 group-hover:border-accent group-hover:text-accent group-hover:bg-accent-soft/40 transition-all">
            <Plus className="h-3 w-3 stroke-[2.5]" />
          </div>
          <span>Add integration</span>
        </button>

        <button
          type="button"
          onClick={() => {
            router.push('/settings')
            onSelectAccount?.()
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2 transition-all cursor-pointer"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-1 border-t border-line/70 p-2.5 mt-2">
        {/* Unified "All Drives" Row */}
        <button
          type="button"
          onClick={() => handleAccountFilter(null)}
          className={`flex items-center justify-between w-full p-2 rounded-xl border transition-all text-left cursor-pointer group ${selectedAccountId === null
            ? 'bg-accent-soft/40 border-accent/40 shadow-xs'
            : 'border-transparent hover:border-line/60 hover:bg-surface-2/60'
            }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface border border-line/60 shadow-2xs">
              <Cloud className="h-4.5 w-4.5 text-[#0284c7]" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-ink truncate leading-tight group-hover:text-accent transition-colors">
                All Drives
              </span>
              <span className="block text-[11px] text-ink-3 truncate leading-tight mt-0.5 font-normal">
                cloud.unified
              </span>
            </div>
          </div>

          {/* Dynamic Status Indicator: Green for Connected, Red for Error */}
          <div
            className="inline-flex items-center justify-center h-6 w-6"
            title={hasAnyError ? 'Some drives have connection issues' : 'All drives connected'}
          >
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${hasAnyError ? 'bg-danger animate-pulse' : 'bg-emerald-500'
                }`}
            />
          </div>
        </button>

        {/* Connected Account Drives */}
        {connectedAccounts.map((account) => {
          const isSelected = selectedAccountId === account.id
          const isError = account.status === 'error'
          const isGoogle = account.provider === 'google_drive'
          const displayName =
            account.displayName || (isGoogle ? 'Google Drive' : 'S3 Storage')

          return (
            <button
              key={account.id}
              type="button"
              onClick={() => handleAccountFilter(account.id)}
              className={`flex items-center justify-between w-full p-2 rounded-xl border transition-all text-left cursor-pointer group ${isSelected
                ? 'bg-accent-soft/40 border-accent/40 shadow-xs'
                : 'border-transparent hover:border-line/60 hover:bg-surface-2/60'
                }`}
            >
              {/* Left: Squircle Icon + Name & Email */}
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface border border-line/60 shadow-2xs overflow-hidden">
                  {account.avatarUrl ? (
                    <Image
                      src={account.avatarUrl}
                      alt={account.email}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : isGoogle ? (
                    <GoogleDriveLogo className="h-4.5 w-4.5" />
                  ) : (
                    <Database className="h-4.5 w-4.5 text-amber-500" />
                  )}
                </div>

                <div className="min-w-0">
                  <span className="block text-xs font-bold text-ink truncate leading-tight group-hover:text-accent transition-colors">
                    {displayName}
                  </span>
                  <span
                    className="block text-[11px] text-ink-3 truncate leading-tight mt-0.5 font-normal"
                    title={account.email}
                  >
                    {account.email}
                  </span>
                </div>
              </div>

              {/* Right: Dynamic Connection Dot (Green for Connected, Red for Error) */}
              <div
                className={`inline-flex items-center justify-center h-6 w-6  shrink-0 transition-all  `}
                title={isError ? 'Connection error' : 'Connected'}
              >
                <span
                  className={`h-2 w-2 rounded-full  ${isError ? 'bg-danger animate-pulse' : 'bg-emerald-500'
                    }`}
                />
              </div>
            </button>
          )
        })}

        {/* Zero accounts empty state */}
        {connectedAccounts.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-xs text-ink-3">No connected drives</p>
          </div>
        )}
      </div>

    </div >


  )
}
