'use client'

import * as React from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import {
  Eye,
  Download,
  Edit3,
  FileEdit,
  FolderInput,
  Share2,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { FileItem } from '@/lib/types'
import { useDialogStore } from '@/stores/dialog-store'
import { useUIStore } from '@/stores/ui-store'
import { api, formatApiError } from '@/lib/api'

interface FileContextMenuProps {
  file: FileItem
  children: React.ReactNode
  onFileMutated?: () => void
}

export function FileContextMenu({
  file,
  children,
  onFileMutated,
}: FileContextMenuProps) {
  const openDialog = useDialogStore((state) => state.openDialog)
  const setSelectedItem = useUIStore((state) => state.setSelectedItem)

  const isEditable =
    file.name.endsWith('.md') ||
    file.name.endsWith('.txt') ||
    file.name.endsWith('.json') ||
    file.name.endsWith('.csv') ||
    file.name.endsWith('.yml') ||
    file.name.endsWith('.yaml') ||
    file.mimeType.includes('text') ||
    file.mimeType.includes('markdown') ||
    file.mimeType.includes('json')

  const handleDownload = async () => {
    try {
      const response = await api.get(`/files/${file.id}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`Downloaded ${file.name}`)
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to download file.')
      toast.error(msg)
    }
  }

  const handleOpenGoogleDrive = async () => {
    try {
      const res = await api.get(`/files/${file.id}/view-url`)
      if (res.data?.url) {
        window.open(res.data.url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      toast.error('Google Drive link is not available.')
    }
  }

  const handleShare = async () => {
    try {
      const res = await api.post(`/files/${file.id}/share`)
      if (res.data?.url) {
        await navigator.clipboard.writeText(res.data.url)
        toast.success('Public share link copied to clipboard!')
      }
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to create share link.')
      toast.error(msg)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to move "${file.name}" to the Recycle Bin?`)) {
      return
    }

    try {
      await api.delete(`/files/${file.id}`)
      toast.success(`Moved "${file.name}" to Recycle Bin.`)
      if (onFileMutated) onFileMutated()
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to delete file.')
      toast.error(msg)
    }
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 min-w-47.5 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-pop select-none animate-in fade-in zoom-in-95">
          {isEditable && (
            <ContextMenu.Item
              onClick={() =>
                openDialog('editor', {
                  fileId: file.id,
                  fileName: file.name,
                  folderId: file.folderId,
                })
              }
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-accent hover:bg-accent-soft/30 outline-none cursor-pointer"
            >
              <FileEdit className="h-4 w-4 text-accent" />
              <span>Edit Document</span>
            </ContextMenu.Item>
          )}

          <ContextMenu.Item
            onClick={() => setSelectedItem(file.id, 'file')}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-surface-2 outline-none cursor-pointer"
          >
            <Eye className="h-4 w-4 text-ink-3" />
            <span>Preview & Details</span>
          </ContextMenu.Item>

          <ContextMenu.Item
            onClick={handleDownload}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-surface-2 outline-none cursor-pointer"
          >
            <Download className="h-4 w-4 text-ink-3" />
            <span>Download</span>
          </ContextMenu.Item>

          {file.provider === 'google_drive' && (
            <ContextMenu.Item
              onClick={handleOpenGoogleDrive}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-surface-2 outline-none cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 text-accent" />
              <span>Open in Google Drive</span>
            </ContextMenu.Item>
          )}

          <ContextMenu.Item
            onClick={handleShare}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-surface-2 outline-none cursor-pointer"
          >
            <Share2 className="h-4 w-4 text-ink-3" />
            <span>Copy Share Link</span>
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 h-px bg-line" />

          <ContextMenu.Item
            onClick={() =>
              openDialog('rename', {
                id: file.id,
                name: file.name,
                type: 'file',
              })
            }
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-surface-2 outline-none cursor-pointer"
          >
            <Edit3 className="h-4 w-4 text-ink-3" />
            <span>Rename</span>
          </ContextMenu.Item>

          <ContextMenu.Item
            onClick={() =>
              openDialog('move', {
                fileIds: [file.id],
              })
            }
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-surface-2 outline-none cursor-pointer"
          >
            <FolderInput className="h-4 w-4 text-ink-3" />
            <span>Move to...</span>
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 h-px bg-line" />

          <ContextMenu.Item
            onClick={handleDelete}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 outline-none cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Move to Trash</span>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}

