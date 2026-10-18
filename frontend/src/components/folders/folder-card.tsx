'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Folder as FolderIcon } from 'lucide-react'
import { AccountBadges, type FolderAccountBadge } from './account-badges'
import { type FolderTone } from '@/lib/utils'

export interface FolderCardProps {
  id: string
  name: string
  tone?: FolderTone
  fileCount?: number
  sizeLabel?: string
  accounts?: FolderAccountBadge[]
  selected?: boolean
  onSelect?: (e: React.MouseEvent) => void
  onOpenContextMenu?: (e: React.MouseEvent) => void
}

export const FolderCard = React.memo(function FolderCard({
  id,
  name,
  tone = 'blue',
  fileCount = 0,
  sizeLabel = '0 B',
  accounts = [],
  selected = false,
  onSelect,
  onOpenContextMenu,
}: FolderCardProps) {
  const router = useRouter()

  const handleOpen = () => {
    router.push(`/all-files?folderId=${id}`)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      onSelect(e)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleOpen()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOpen()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-folder-id={id}
      data-selected={selected}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onContextMenu={onOpenContextMenu}
      className={`group relative flex flex-col cursor-pointer rounded-2xl p-2.5 transition-all outline-none select-none ${
        selected ? 'bg-accent-soft/40 shadow-xs ring-2 ring-accent' : 'hover:bg-surface-2/70'
      }`}
      aria-label={`${name}, ${fileCount} files, ${sizeLabel}`}
    >
      {/* Signature Physical Folder Illustration */}
      <div
        className="folder aspect-[1.38/1] w-full rounded-xl"
        data-tone={tone}
        data-selected={selected}
      >
        <div className="folder__back" />
        <div className="folder__sheet">
          <div className="h-full w-full p-2.5 flex flex-col justify-start opacity-35">
            <div className="h-1.5 w-1/2 rounded-full bg-ink/30 mb-1.5" />
            <div className="h-1 w-3/4 rounded-full bg-ink/20 mb-1" />
            <div className="h-1 w-2/3 rounded-full bg-ink/20" />
          </div>
        </div>
        <div className="folder__front" />

        {/* Small corner folder icon hint */}
        <div className="absolute top-[38%] left-[8%] text-ink/30 group-hover:text-accent/60 transition-colors">
          <FolderIcon className="h-4 w-4 fill-current/15" />
        </div>

        {/* Account badges positioned over the front lip */}
        <div className="absolute bottom-[10%] left-[8%] z-10">
          <AccountBadges accounts={accounts} />
        </div>

        {/* More options button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (onOpenContextMenu) onOpenContextMenu(e)
          }}
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-surface/80 text-ink-3 backdrop-blur-xs opacity-0 group-hover:opacity-100 hover:bg-surface hover:text-ink transition-all shadow-2xs"
          title="Folder actions"
          aria-label="Folder actions"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Meta Footer */}
      <div className="mt-2.5 px-1 min-w-0">
        <p
          className="truncate text-xs font-semibold text-ink group-hover:text-accent transition-colors"
          title={name}
        >
          {name}
        </p>
        <p className="text-[11px] text-ink-3 tabular-nums mt-0.5">
          {fileCount} {fileCount === 1 ? 'file' : 'files'} · {sizeLabel}
        </p>
      </div>
    </div>
  )
})
