'use client'

import * as React from 'react'
import { MoreVertical } from 'lucide-react'
import { FileItem } from '@/lib/types'
import { formatBytes } from '@/lib/utils'
import { FileTypeIcon } from './file-type-icon'
import { FileContextMenu } from '@/components/context-menu/file-context-menu'
import { useSelectionStore } from '@/stores/selection-store'
import { useUIStore } from '@/stores/ui-store'

interface FileGridProps {
  files: FileItem[]
  isLoading?: boolean
  onFileMutated?: () => void
  onFileDoubleClick?: (file: FileItem) => void
}

export function FileGrid({
  files,
  isLoading = false,
  onFileMutated,
  onFileDoubleClick,
}: FileGridProps) {
  const selectedFileIds = useSelectionStore((state) => state.selectedFileIds)
  const selectItem = useSelectionStore((state) => state.selectItem)
  const setSelectedItem = useUIStore((state) => state.setSelectedItem)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 select-none">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2 rounded-2xl border border-line bg-surface p-3 animate-pulse">
            <div className="aspect-[4/3] rounded-xl bg-surface-2" />
            <div className="h-3 w-3/4 rounded bg-surface-2" />
            <div className="h-2.5 w-1/2 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    )
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 select-none">
      {files.map((file) => {
        const isSelected = selectedFileIds.includes(file.id)

        return (
          <FileContextMenu
            key={file.id}
            file={file}
            onFileMutated={onFileMutated}
          >
            <div
              role="button"
              tabIndex={0}
              data-file-id={file.id}
              onClick={(e) => {
                const isMulti = e.metaKey || e.ctrlKey || e.shiftKey
                selectItem(file.id, 'file', isMulti)
                setSelectedItem(file.id, 'file')
              }}
              onDoubleClick={() => {
                if (onFileDoubleClick) onFileDoubleClick(file)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onFileDoubleClick) onFileDoubleClick(file)
              }}
              className={`group relative flex flex-col justify-between rounded-2xl border transition-all cursor-pointer p-3 outline-none ${
                isSelected
                  ? 'border-accent bg-accent-soft/30 dark:bg-accent-soft/15 shadow-xs ring-2 ring-accent'
                  : 'border-line bg-surface hover:border-line-strong hover:shadow-card'
              }`}
            >
              {/* Header controls (checkbox & more options) */}
              <div className="flex items-center justify-between z-10">
                <input
                  type="checkbox"
                  aria-label={`Select ${file.name}`}
                  checked={isSelected}
                  onChange={() => selectItem(file.id, 'file', true)}
                  onClick={(e) => e.stopPropagation()}
                  className={`h-4 w-4 rounded border-line text-accent focus:ring-accent cursor-pointer transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                />

                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-ink-3 opacity-0 group-hover:opacity-100 hover:bg-surface-2 hover:text-ink transition-all cursor-pointer"
                  title="File actions"
                  aria-label="File actions"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Thumbnail / File Glyphs Preview */}
              <div className="my-2 flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-surface-2/60 group-hover:bg-surface-2 transition-colors">
                <FileTypeIcon mimeType={file.mimeType} name={file.name} size="lg" />
              </div>

              {/* File Info */}
              <div className="min-w-0 pt-1">
                <p
                  className="truncate text-xs font-semibold text-ink group-hover:text-accent transition-colors"
                  title={file.name}
                >
                  {file.name}
                </p>

                <div className="mt-1 flex items-center justify-between text-[11px] text-ink-3">
                  <span className="font-mono tabular-nums">{formatBytes(file.sizeBytes)}</span>
                  {file.connectedAccount && (
                    <span
                      className="truncate max-w-[80px] text-[10px] text-ink-3"
                      title={file.connectedAccount.email}
                    >
                      {file.connectedAccount.email.split('@')[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </FileContextMenu>
        )
      })}
    </div>
  )
}

