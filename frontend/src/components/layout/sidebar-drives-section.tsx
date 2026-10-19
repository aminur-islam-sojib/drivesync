'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search,
  SlidersHorizontal,
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

  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterMode, setFilterMode] = React.useState<'all' | 'connected' | 'error'>('all')

  const handleAccountFilter = (accountId: string | null) => {
    setSelectedAccountId(accountId)
    if (pathname !== '/all-files') {
      router.push('/all-files')
    }
    onSelectAccount?.()
  }

  // Filter accounts based on search input and filter mode
  const filteredAccounts = React.useMemo(() => {
    return connectedAccounts.filter((account) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        (account.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.email.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (filterMode === 'connected') return account.status === 'connected'
      if (filterMode === 'error') return account.status === 'error'
      return true
    })
  }, [connectedAccounts, searchQuery, filterMode])

  const hasAnyError = React.useMemo(() => {
    return connectedAccounts.some((a) => a.status === 'error')
  }, [connectedAccounts])

  const toggleFilterMode = () => {
    setFilterMode((prev) => (prev === 'all' ? 'connected' : prev === 'connected' ? 'error' : 'all'))
  }

  return (
    <div className="pt-2">
      {/* Elevated Card Container matching Reference UI */}
      <div className="rounded-2xl border border-line bg-surface p-2.5 shadow-2xs">
        {/* 1. Search Bar with Filter Icon */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="h-8 w-full rounded-xl border border-line bg-surface-2/60 pl-8 pr-2.5 text-xs text-ink placeholder:text-ink-3 outline-none focus:border-accent focus:bg-surface transition-all"
            />
          </div>

          <button
            type="button"
            onClick={toggleFilterMode}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all cursor-pointer ${
              filterMode !== 'all'
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line bg-surface-2/60 text-ink-3 hover:text-ink hover:bg-surface'
            }`}
            title={`Filter status: ${filterMode}`}
            aria-label="Filter status"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-1">
          {/* Unified "All Drives" Row */}
          {searchQuery === '' && filterMode === 'all' && (
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
                className={`inline-flex items-center justify-center h-6 w-6 rounded-full border shrink-0 transition-all ${
                  hasAnyError
                    ? 'border-danger/30 bg-danger/10'
                    : 'border-emerald-500/25 bg-emerald-500/10'
                }`}
                title={hasAnyError ? 'Some drives have connection issues' : 'All drives connected'}
              >
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    hasAnyError ? 'bg-danger animate-pulse' : 'bg-emerald-500'
                  }`}
                />
              </div>
            </button>
          )}

          {/* Connected Account Drives */}
          {filteredAccounts.map((account) => {
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
                  className={`inline-flex items-center justify-center h-6 w-6 rounded-full border shrink-0 transition-all ${
                    isError
                      ? 'border-danger/30 bg-danger/10'
                      : 'border-emerald-500/25 bg-emerald-500/10'
                  }`}
                  title={isError ? 'Connection error' : 'Connected'}
                >
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      isError ? 'bg-danger animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </button>
            )
          })}

          {/* Empty search or zero accounts */}
          {filteredAccounts.length === 0 && (
            <div className="py-4 text-center">
              <p className="text-xs text-ink-3">No matching drives</p>
            </div>
          )}
        </div>

        {/* 3. Bottom Footer matching Reference UI: (+) Add integration + Settings */}
        <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between px-1">
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
      </div>
    </div>
  )
}
