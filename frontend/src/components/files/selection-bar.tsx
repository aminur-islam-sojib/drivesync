'use client'

import * as React from 'react'
import { Download, FolderInput, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useSelectionStore } from '@/stores/selection-store'
import { useDialogStore } from '@/stores/dialog-store'
import { api, formatApiError } from '@/lib/api'

interface SelectionBarProps {
  onItemsMutated?: () => void
}

export function SelectionBar({ onItemsMutated }: SelectionBarProps) {
  const selectedFileIds = useSelectionStore((state) => state.selectedFileIds)
  const selectedFolderIds = useSelectionStore((state) => state.selectedFolderIds)
  const clearSelection = useSelectionStore((state) => state.clearSelection)
  const openDialog = useDialogStore((state) => state.openDialog)

  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isDownloading, setIsDownloading] = React.useState(false)

  const totalCount = selectedFileIds.length + selectedFolderIds.length
  if (totalCount === 0) return null

  const handleBatchDownload = async () => {
    if (selectedFileIds.length === 0) {
      toast.error('Only files can be downloaded as a ZIP archive.')
      return
    }

    setIsDownloading(true)
    const toastId = toast.loading('Preparing download archive...')
    try {
      const response = await api.post(
        '/files/batch-download',
        { fileIds: selectedFileIds },
        { responseType: 'blob' }
      )

      // Create download trigger
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `drivesync-download-${Date.now()}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Download started!', { id: toastId })
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to download files.')
      toast.error(msg, { id: toastId })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleBatchDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to move ${totalCount} selected ${
          totalCount === 1 ? 'item' : 'items'
        } to the Recycle Bin?`
      )
    ) {
      return
    }

    setIsDeleting(true)
    const toastId = toast.loading('Moving items to trash...')
    try {
      if (selectedFileIds.length > 0) {
        await api.delete('/files/batch', {
          data: { fileIds: selectedFileIds },
        })
      }

      for (const folderId of selectedFolderIds) {
        await api.delete(`/folders/${folderId}`)
      }

      toast.success(`Moved ${totalCount} items to Recycle Bin.`, { id: toastId })
      clearSelection()
      if (onItemsMutated) onItemsMutated()
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to delete selected items.')
      toast.error(msg, { id: toastId })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <aside
      aria-label="Selection actions"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-line bg-surface/95 px-4 py-2.5 shadow-pop backdrop-blur-md transition-all select-none"
    >
      <div className="flex items-center gap-2 border-r border-line pr-3">
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-ink">
          {totalCount}
        </span>
        <span className="text-xs font-semibold text-ink">Selected</span>
      </div>

      <div className="flex items-center gap-1.5">
        {selectedFileIds.length > 0 && (
          <button
            type="button"
            onClick={handleBatchDownload}
            disabled={isDownloading}
            className="flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-40"
            title="Download ZIP"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download ZIP</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => openDialog('move')}
          className="flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
          title="Move to Folder"
        >
          <FolderInput className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Move</span>
        </button>

        <button
          type="button"
          onClick={handleBatchDelete}
          disabled={isDeleting}
          className="flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors cursor-pointer disabled:opacity-40"
          title="Move to Trash"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      <button
        type="button"
        onClick={clearSelection}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer ml-1"
        title="Clear Selection"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </aside>
  )
}

