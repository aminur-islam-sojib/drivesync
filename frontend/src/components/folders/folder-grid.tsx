'use client'

import * as React from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { FolderCard } from './folder-card'
import { FolderContextMenu } from '@/components/context-menu/folder-context-menu'
import { FolderItem } from '@/lib/types'
import { toneFromLegacy, formatBytes } from '@/lib/utils'
import { useSelectionStore } from '@/stores/selection-store'
import { useDialogStore } from '@/stores/dialog-store'

interface FolderGridProps {
  folders: FolderItem[]
  isLoading?: boolean
  onFolderMutated?: () => void
  onOpenFolder?: (folder: FolderItem) => void
  initialLimit?: number
}

export function FolderGrid({
  folders,
  isLoading = false,
  onFolderMutated,
  onOpenFolder,
  initialLimit = 18,
}: FolderGridProps) {
  const selectedFolderIds = useSelectionStore((state) => state.selectedFolderIds)
  const selectItem = useSelectionStore((state) => state.selectItem)
  const openDialog = useDialogStore((state) => state.openDialog)
  const [isExpanded, setIsExpanded] = React.useState(false)

  const canExpand = folders.length > initialLimit
  const hiddenCount = folders.length - initialLimit
  const visibleFolders = React.useMemo(() => {
    return isExpanded ? folders : folders.slice(0, initialLimit)
  }, [folders, isExpanded, initialLimit])

  if (isLoading) {
    return (
      <div className="space-y-3 select-none">
        <div className="h-4 w-28 rounded-md bg-surface-2 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[1.38/1] rounded-2xl bg-surface-2 animate-pulse" />
              <div className="h-3 w-3/4 rounded bg-surface-2 animate-pulse" />
              <div className="h-2.5 w-1/2 rounded bg-surface-2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (folders.length === 0) {
    return null
  }

  return (
    <section className="space-y-3" aria-label="Folders">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-3">
            Folders ({folders.length})
          </h2>
          {canExpand && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline cursor-pointer"
            >
              <span>{isExpanded ? 'Show fewer' : `See all (${hiddenCount} more)`}</span>
              <ChevronDown
                className={`h-3 w-3 stroke-[2.5] transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => openDialog('new-folder')}
          className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline cursor-pointer"
        >
          <Plus className="h-3 w-3 stroke-[2.5]" />
          <span>New folder</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
        {visibleFolders.map((folder) => {
          const isSelected = selectedFolderIds.includes(folder.id)
          const tone = toneFromLegacy(folder.color)
          const accounts = folder.connectedAccount
            ? [
                {
                  id: folder.connectedAccount.id,
                  email: folder.connectedAccount.email,
                  provider: folder.connectedAccount.provider,
                },
              ]
            : []

          return (
            <FolderContextMenu
              key={folder.id}
              folder={folder}
              onFolderMutated={onFolderMutated}
            >
              <div>
                <FolderCard
                  id={folder.id}
                  name={folder.name}
                  tone={tone}
                  fileCount={folder.fileCount ?? 0}
                  sizeLabel={formatBytes(folder.totalBytes ?? 0)}
                  accounts={accounts}
                  selected={isSelected}
                  onOpen={() => onOpenFolder?.(folder)}
                  onSelect={(e) => {
                    selectItem(folder.id, 'folder', e.metaKey || e.ctrlKey || e.shiftKey)
                  }}
                />
              </div>
            </FolderContextMenu>
          )
        })}
      </div>

      {/* Bottom Expansion Controls */}
      {canExpand && (
        <div className="flex items-center justify-center pt-2">
          {!isExpanded ? (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2 text-xs font-semibold text-ink-2 shadow-2xs hover:border-line-strong hover:bg-surface-2 hover:text-ink active:scale-98 transition-all cursor-pointer"
            >
              <span>Show all {folders.length} folders ({hiddenCount} more)</span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-3 group-hover:text-ink transition-transform group-hover:translate-y-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line/60 bg-surface px-4 py-1.5 text-[11px] font-medium text-ink-3 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
            >
              <span>Show fewer folders</span>
              <ChevronDown className="h-3 w-3 rotate-180" />
            </button>
          )}
        </div>
      )}
    </section>
  )
}

