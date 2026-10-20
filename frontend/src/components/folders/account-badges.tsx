'use client'

import * as React from 'react'
import Image from 'next/image'
import { HardDrive, Database } from 'lucide-react'

export interface FolderAccountBadge {
  id: string
  email: string
  provider: string
  avatarUrl?: string | null
}

interface AccountBadgesProps {
  accounts?: FolderAccountBadge[]
  className?: string
}

export const AccountBadges = React.memo(function AccountBadges({
  accounts = [],
  className = '',
}: AccountBadgesProps) {
  if (!accounts || accounts.length === 0) return null

  const displayAccounts = accounts.slice(0, 3)
  const remainingCount = accounts.length - 3

  const tooltipText = accounts.map((a) => a.email).join(', ')

  return (
    <div
      className={`flex items-center -space-x-1.5 select-none ${className}`}
      title={tooltipText}
      aria-label={`Stored in: ${tooltipText}`}
    >
      {displayAccounts.map((account) => {
        const isGoogle = account.provider === 'google_drive'
        return (
          <div
            key={account.id}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface border-2 border-surface shadow-2xs overflow-hidden"
          >
            {account.avatarUrl ? (
              <Image
                src={account.avatarUrl}
                alt={account.email}
                width={20}
                height={20}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : isGoogle ? (
              <div className="flex h-full w-full items-center justify-center bg-[#4285F4]/15 text-[#4285F4]">
                <HardDrive className="h-2.5 w-2.5 stroke-[2.5]" />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-amber-500/15 text-amber-600">
                <Database className="h-2.5 w-2.5 stroke-[2.5]" />
              </div>
            )}
          </div>
        )
      })}

      {remainingCount > 0 && (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 border-2 border-surface text-[9px] font-bold text-ink-2 shadow-2xs">
          +{remainingCount}
        </div>
      )}
    </div>
  )
})

