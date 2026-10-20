'use client'

import * as React from 'react'
import { Sparkles, Clock, Calendar, CheckCircle2 } from 'lucide-react'
import { FileItem } from '@/lib/types'
import { formatBytes } from '@/lib/utils'
import { FileTypeIcon } from './file-type-icon'
import { FileContextMenu } from '@/components/context-menu/file-context-menu'
import { useSelectionStore } from '@/stores/selection-store'
import { useUIStore } from '@/stores/ui-store'
import { useWorkspaceStore } from '@/stores/workspace-store'

interface SuggestedFilesProps {
  files: FileItem[]
  isLoading?: boolean
  onFileMutated?: () => void
  onFileDoubleClick?: (file: FileItem) => void
}

interface RankedSuggestion {
  file: FileItem
  score: number
  badgeText: string
  badgeVariant: 'recent' | 'opened' | 'modified'
}

export function SuggestedFiles({
  files,
  isLoading = false,
  onFileMutated,
  onFileDoubleClick,
}: SuggestedFilesProps) {
  const selectedFileIds = useSelectionStore((state) => state.selectedFileIds)
  const selectItem = useSelectionStore((state) => state.selectItem)
  const setSelectedItem = useUIStore((state) => state.setSelectedItem)
  const recentInteractions = useWorkspaceStore((state) => state.recentInteractions)

  // Rank candidate suggestions using lightweight in-memory scoring
  const suggestedItems = React.useMemo<RankedSuggestion[]>(() => {
    if (!files || files.length === 0) return []

    const scored = files.map((file) => {
      const interactionTime = recentInteractions[file.id] || 0
      const updatedTime = file.updatedAt ? new Date(file.updatedAt).getTime() : 0
      const createdTime = file.createdAt ? new Date(file.createdAt).getTime() : 0
      const latestTime = Math.max(updatedTime, createdTime)

      let badgeText = 'Recent'
      let badgeVariant: 'recent' | 'opened' | 'modified' = 'recent'

      if (interactionTime > 0) {
        badgeText = 'Opened recently'
        badgeVariant = 'opened'
      } else if (file.updatedAt && file.createdAt && file.updatedAt !== file.createdAt) {
        badgeText = 'Modified recently'
        badgeVariant = 'modified'
      }

      // Priority score: Interaction timestamp (if any) or file's latest activity timestamp
      const score = interactionTime > 0 ? interactionTime * 2 : latestTime

      return { file, score, badgeText, badgeVariant }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, 5)
  }, [files, recentInteractions])


  if (isLoading) {
    return (
      <section className="space-y-3 select-none" aria-label="Suggested files loading">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 rounded-md bg-surface-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-line bg-surface p-3 space-y-2.5 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-7 w-7 rounded-lg bg-surface-2" />
                <div className="h-4 w-16 rounded-full bg-surface-2" />
              </div>
              <div className="h-3.5 w-3/4 rounded bg-surface-2" />
              <div className="h-2.5 w-1/2 rounded bg-surface-2" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (suggestedItems.length === 0) {
    return null
  }

  return (
    <section className="space-y-3 select-none" aria-label="Suggested files">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-3">
            Suggested
          </h2>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
            Quick Access
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
        {suggestedItems.map(({ file, badgeText, badgeVariant }) => {
          const isSelected = selectedFileIds.includes(file.id)

          return (
            <FileContextMenu key={file.id} file={file} onFileMutated={onFileMutated}>
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  selectItem(file.id, 'file', e.shiftKey || e.metaKey || e.ctrlKey)
                  setSelectedItem(file.id, 'file')
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  onFileDoubleClick?.(file)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onFileDoubleClick?.(file)
                  }
                }}
                className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-150 cursor-pointer text-left select-none outline-none ${
                  isSelected
                    ? 'border-accent bg-accent-soft/40  ring-1 ring-accent'
                    : 'border-line bg-surface hover:border-line-strong hover:shadow-card hover:-translate-y-0.5'
                }`}
              >
                {/* Header: File Type Icon + Dynamic Reason Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 transition-transform duration-150 group-hover:scale-105">
                    <FileTypeIcon mimeType={file.mimeType} name={file.name} size="md" />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      badgeVariant === 'opened'
                        ? 'bg-accent-soft text-accent'
                        : badgeVariant === 'modified'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        : 'bg-surface-2 text-ink-3'
                    }`}
                  >
                    {badgeVariant === 'opened' ? (
                      <Clock className="h-2.5 w-2.5" />
                    ) : (
                      <Calendar className="h-2.5 w-2.5" />
                    )}
                    <span>{badgeText}</span>
                  </span>
                </div>

                {/* Footer: Name, Account Provider & Size */}
                <div className="mt-3 space-y-1">
                  <p
                    className="truncate text-xs font-semibold text-ink group-hover:text-accent transition-colors"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-ink-3">
                    <span className="truncate max-w-[120px]">
                      {file.connectedAccount?.email || (file.provider === 's3' ? 'S3 Bucket' : 'Google Drive')}
                    </span>
                    <span className="shrink-0">{formatBytes(file.sizeBytes)}</span>
                  </div>
                </div>

                {/* Selection Check Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-ink shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            </FileContextMenu>
          )
        })}
      </div>
    </section>
  )
}
