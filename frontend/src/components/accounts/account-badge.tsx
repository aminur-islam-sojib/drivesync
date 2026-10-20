'use client'

import * as React from 'react'
import { HardDrive, Database } from 'lucide-react'
import { useAccountStore } from '@/stores/account-store'

interface AccountBadgeProps {
  accountId?: string | null
  email?: string | null
  displayName?: string | null
  provider?: string
  clickable?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function AccountBadge({
  accountId,
  email,
  displayName,
  provider = 'google_drive',
  clickable = true,
  size = 'sm',
  className = '',
}: AccountBadgeProps) {
  const setSelectedAccountId = useAccountStore((state) => state.setSelectedAccountId)
  const selectedAccountId = useAccountStore((state) => state.selectedAccountId)

  const isSelected = accountId && selectedAccountId === accountId
  const label = displayName || email?.split('@')[0] || 'Drive'
  const isS3 = provider === 's3'

  const handleClick = (e: React.MouseEvent) => {
    if (!clickable || !accountId) return
    e.stopPropagation()
    // Toggle filter: if already selected, clear filter
    setSelectedAccountId(isSelected ? null : accountId)
  }

  const sizeClasses =
    size === 'sm'
      ? 'h-5 px-1.5 text-[10px] gap-1 rounded-md'
      : 'h-6 px-2 text-xs gap-1.5 rounded-lg'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!clickable || !accountId}
      title={email ? `${label} (${email})` : label}
      className={`inline-flex items-center font-medium transition-all select-none ${
        clickable ? 'cursor-pointer hover:border-accent/40 hover:text-ink' : 'cursor-default'
      } ${
        isSelected
          ? 'bg-accent-soft text-accent border border-accent/40 font-semibold shadow-2xs'
          : 'bg-surface-2 text-ink-2 border border-line/60'
      } ${sizeClasses} ${className}`}
    >
      {isS3 ? (
        <Database className="h-3 w-3 text-amber-500 shrink-0" />
      ) : (
        <HardDrive className="h-3 w-3 text-accent shrink-0" />
      )}
      <span className="truncate max-w-[120px]">{label}</span>
    </button>
  )
}

