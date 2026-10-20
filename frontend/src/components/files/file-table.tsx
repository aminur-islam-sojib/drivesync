'use client'

import * as React from 'react'
import { MoreVertical } from 'lucide-react'
import { FileItem } from '@/lib/types'
import { formatBytes, formatRelativeTime, formatDateTime } from '@/lib/utils'
import { FileTypeIcon } from './file-type-icon'
import { AccountBadge } from '@/components/accounts/account-badge'
import { FileContextMenu } from '@/components/context-menu/file-context-menu'
import { useSelectionStore } from '@/stores/selection-store'
import { useUIStore } from '@/stores/ui-store'

interface FileTableProps {
  files: FileItem[]
  isLoading?: boolean
  onFileMutated?: () => void
  onFileDoubleClick?: (file: FileItem) => void
}

export function FileTable({
  files,
  isLoading = false,
  onFileMutated,
  onFileDoubleClick,
}: FileTableProps) {
  const selectedFileIds = useSelectionStore((state) => state.selectedFileIds)
  const selectItem = useSelectionStore((state) => state.selectItem)
  const selectAll = useSelectionStore((state) => state.selectAll)
  const clearSelection = useSelectionStore((state) => state.clearSelection)
  const setSelectedItem = useUIStore((state) => state.setSelectedItem)

  const isAllSelected = files.length > 0 && files.every((f) => selectedFileIds.includes(f.id))
  const isPartiallySelected =
    files.some((f) => selectedFileIds.includes(f.id)) && !isAllSelected

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      clearSelection()
    } else {
      selectAll(files.map((f) => f.id))
    }
  }

  const handleRowClick = (e: React.MouseEvent, file: FileItem) => {
    const isMulti = e.metaKey || e.ctrlKey || e.shiftKey
    if (isMulti) {
      selectItem(file.id, 'file', true)
      setSelectedItem(file.id, 'file')
    } else {
      selectItem(file.id, 'file', false)
      setSelectedItem(file.id, 'file')
      if (onFileDoubleClick) onFileDoubleClick(file)
    }
  }

  const handleRowDoubleClick = (file: FileItem) => {
    if (onFileDoubleClick) {
      onFileDoubleClick(file)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2 select-none">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex h-11 items-center gap-4 rounded-xl bg-surface-2/60 px-4 animate-pulse"
          >
            <div className="h-4 w-4 rounded bg-surface-2" />
            <div className="h-4 w-4 rounded bg-surface-2" />
            <div className="h-4 w-48 rounded bg-surface-2" />
            <div className="ml-auto h-4 w-20 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    )
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface select-none">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-line bg-surface-2 text-ink-3 font-semibold sticky top-0 z-10">
          <tr>
            <th className="w-10 py-3 pl-4 pr-1">
              <input
                type="checkbox"
                aria-label="Select all files"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isPartiallySelected
                }}
                onChange={handleToggleSelectAll}
                className="h-4 w-4 rounded border-line text-accent focus:ring-accent cursor-pointer"
              />
            </th>
            <th className="py-3 px-3">Name</th>
            <th className="hidden sm:table-cell py-3 px-3">Account</th>
            <th className="py-3 px-3 text-right">Size</th>
            <th className="hidden md:table-cell py-3 px-3">Modified</th>
            <th className="w-12 py-3 pr-4 pl-1 text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-line/60">
          {files.map((file) => {
            const isSelected = selectedFileIds.includes(file.id)

            return (
              <FileContextMenu
                key={file.id}
                file={file}
                onFileMutated={onFileMutated}
              >
                <tr
                  onClick={(e) => handleRowClick(e, file)}
                  onDoubleClick={() => handleRowDoubleClick(file)}
                  className={`group transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-accent-soft/40 dark:bg-accent-soft/20 text-ink font-medium'
                      : 'hover:bg-surface-2/60 text-ink'
                  }`}
                >
                  <td
                    className="py-2.5 pl-4 pr-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      selectItem(file.id, 'file', true)
                    }}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${file.name}`}
                      checked={isSelected}
                      onChange={() => selectItem(file.id, 'file', true)}
                      className="h-4 w-4 rounded border-line text-accent focus:ring-accent cursor-pointer"
                    />
                  </td>

                  <td className="py-2.5 px-3 min-w-[200px] max-w-md">
                    <div className="flex items-center gap-3">
                      <FileTypeIcon mimeType={file.mimeType} name={file.name} size="md" />
                      <span className="truncate font-medium text-ink group-hover:text-accent transition-colors">
                        {file.name}
                      </span>
                    </div>
                  </td>

                  <td className="hidden sm:table-cell py-2.5 px-3">
                    {file.connectedAccount ? (
                      <AccountBadge
                        provider={file.connectedAccount.provider}
                        email={file.connectedAccount.email}
                        displayName={file.connectedAccount.displayName}
                      />
                    ) : (
                      <span className="text-ink-3">—</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono text-[11px] text-ink-2 tabular-nums">
                    {formatBytes(file.sizeBytes)}
                  </td>

                  <td
                    className="hidden md:table-cell py-2.5 px-3 text-[11px] text-ink-3"
                    title={formatDateTime(file.updatedAt || file.createdAt)}
                  >
                    {formatRelativeTime(file.updatedAt || file.createdAt)}
                  </td>

                  <td className="py-2.5 pr-4 pl-1 text-right">
                    <button
                      type="button"
                      className="flex h-7 w-7 ml-auto items-center justify-center rounded-lg text-ink-3 opacity-0 group-hover:opacity-100 hover:bg-surface hover:text-ink transition-all cursor-pointer"
                      title="File actions"
                      aria-label="File actions"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              </FileContextMenu>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

