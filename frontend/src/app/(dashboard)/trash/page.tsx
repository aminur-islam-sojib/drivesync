'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import { api, formatApiError } from '@/lib/api'
import { FileItem } from '@/lib/types'
import { formatBytes, formatDate } from '@/lib/utils'
import { FileTypeIcon } from '@/components/files/file-type-icon'

export default function TrashPage() {
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [refreshIndex, setRefreshIndex] = React.useState(0)

  const triggerRefresh = () => setRefreshIndex((v) => v + 1)

  React.useEffect(() => {
    let isMounted = true

    async function fetchTrash() {
      try {
        const res = await api.get('/files/trash')
        if (isMounted) {
          setFiles(res.data?.files || [])
          setSelectedIds([])
          setIsLoading(false)
        }
      } catch (err: unknown) {
        if (isMounted) {
          toast.error(formatApiError(err, 'Failed to load recycle bin.'))
          setIsLoading(false)
        }
      }
    }

    void fetchTrash()

    const handleRefresh = () => triggerRefresh()
    window.addEventListener('drivesync-refresh-items', handleRefresh)
    return () => {
      isMounted = false
      window.removeEventListener('drivesync-refresh-items', handleRefresh)
    }
  }, [refreshIndex])

  const handleSelectAll = () => {
    if (selectedIds.length === files.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(files.map((f) => f.id))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleRestore = async (idsToRestore: string[]) => {
    if (idsToRestore.length === 0) return
    setIsProcessing(true)
    try {
      const res = await api.post('/files/batch/restore', { fileIds: idsToRestore })
      toast.success(`Restored ${res.data?.restored || idsToRestore.length} item(s).`)
      triggerRefresh()
    } catch (err: unknown) {
      toast.error(formatApiError(err, 'Failed to restore items.'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePermanentDelete = async (idsToDelete: string[]) => {
    if (idsToDelete.length === 0) return
    const msg =
      idsToDelete.length === 1
        ? 'Delete this file permanently? This cannot be undone and will delete it from Google Drive / S3 storage.'
        : `Delete ${idsToDelete.length} files permanently? This cannot be undone.`

    if (!confirm(msg)) return

    setIsProcessing(true)
    try {
      await api.delete('/files/batch/permanent', { data: { fileIds: idsToDelete } })
      toast.success(`Permanently deleted ${idsToDelete.length} item(s).`)
      triggerRefresh()
    } catch (err: unknown) {
      toast.error(formatApiError(err, 'Failed to permanently delete items.'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEmptyTrash = () => {
    if (files.length === 0) return
    handlePermanentDelete(files.map((f) => f.id))
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/40 select-none">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-3">
            <Link href="/all-files" className="hover:text-ink transition-colors">
              DriveSync
            </Link>
            <span>&gt;</span>
            <span className="text-ink font-semibold">Trash</span>
          </nav>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-ink">Recycle Bin</h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {files.length > 0 && (
            <button
              type="button"
              onClick={handleEmptyTrash}
              disabled={isProcessing}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-danger/40 bg-danger/10 px-4 text-xs font-semibold text-danger hover:bg-danger/20 active:scale-98 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Empty Trash</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Selection Bar for Trash */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-accent/40 shadow-pop animate-in fade-in select-none">
          <span className="text-xs font-semibold text-accent">{selectedIds.length} item(s) selected</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRestore(selectedIds)}
              disabled={isProcessing}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-accent px-3 text-xs font-semibold text-accent-ink hover:opacity-90 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore</span>
            </button>
            <button
              type="button"
              onClick={() => handlePermanentDelete(selectedIds)}
              disabled={isProcessing}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-danger px-3 text-xs font-semibold text-white hover:opacity-90 cursor-pointer"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Delete Forever</span>
            </button>
          </div>
        </div>
      )}

      {/* Trash Items List */}
      <section className="space-y-3" aria-label="Trash Content">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded-2xl bg-surface-2 animate-pulse border border-line"
              />
            ))}
          </div>
        ) : files.length > 0 ? (
          <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs select-none">
              <thead className="bg-surface-2 border-b border-line text-ink-3">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === files.length && files.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-line text-accent cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="hidden sm:table-cell px-4 py-3 font-semibold">Account</th>
                  <th className="hidden md:table-cell px-4 py-3 font-semibold">Size</th>
                  <th className="hidden lg:table-cell px-4 py-3 font-semibold">Deleted</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {files.map((file) => {
                  const isSelected = selectedIds.includes(file.id)

                  return (
                    <tr
                      key={file.id}
                      className={`hover:bg-surface-2 transition-colors ${
                        isSelected ? 'bg-accent-soft/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(file.id)}
                          className="rounded border-line text-accent cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3 font-medium text-ink">
                        <div className="flex items-center gap-2.5 truncate max-w-xs sm:max-w-md">
                          <FileTypeIcon
                            name={file.name}
                            mimeType={file.mimeType}
                            className="h-4 w-4 shrink-0"
                          />
                          <span className="truncate">{file.name}</span>
                        </div>
                      </td>

                      <td className="hidden sm:table-cell px-4 py-3 text-ink-3">
                        <div className="flex items-center gap-1.5 truncate max-w-xs">
                          <Layers className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {file.connectedAccount?.displayName ||
                              file.connectedAccount?.email ||
                              file.provider}
                          </span>
                        </div>
                      </td>

                      <td className="hidden md:table-cell px-4 py-3 text-ink-3 font-mono">
                        {formatBytes(Number(file.sizeBytes || 0))}
                      </td>

                      <td className="hidden lg:table-cell px-4 py-3 text-ink-3">
                        {formatDate(file.deletedAt || file.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRestore([file.id])}
                            disabled={isProcessing}
                            className="flex h-7 px-2 items-center gap-1 rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink text-[11px] font-medium transition-colors cursor-pointer"
                            title="Restore"
                          >
                            <RotateCcw className="h-3.5 w-3.5 text-accent" />
                            <span className="hidden sm:inline">Restore</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePermanentDelete([file.id])}
                            disabled={isProcessing}
                            className="flex h-7 px-2 items-center gap-1 rounded-lg text-danger hover:bg-danger/10 text-[11px] font-medium transition-colors cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Purge</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-ink-3 border border-dashed border-line rounded-3xl bg-surface/50">
            <Trash2 className="h-10 w-10 mb-2 opacity-30 text-accent" />
            <p className="text-xs font-semibold text-ink">Recycle bin is empty</p>
            <p className="text-[11px] max-w-xs mt-1 text-ink-3">
              Items moved to trash will remain here and can be restored anytime or permanently
              purged.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
