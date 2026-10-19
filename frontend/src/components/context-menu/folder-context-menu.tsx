'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { FolderOpen, Edit3, FolderInput, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { FolderItem } from '@/lib/types'
import { useDialogStore } from '@/stores/dialog-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { api, formatApiError } from '@/lib/api'

interface FolderContextMenuProps {
  folder: FolderItem
  children: React.ReactNode
  onFolderMutated?: () => void
}

export function FolderContextMenu({
  folder,
  children,
  onFolderMutated,
}: FolderContextMenuProps) {
  const router = useRouter()
  const openDialog = useDialogStore((state) => state.openDialog)

  const handleOpen = () => {
    useWorkspaceStore.getState().openFolderInstantly({ id: folder.id, name: folder.name })
    if (typeof window !== 'undefined' && window.location.pathname !== '/all-files') {
      router.push(`/all-files?folderId=${folder.id}`)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete folder "${folder.name}" and all its contents?`
      )
    ) {
      return
    }

    try {
      await api.delete(`/folders/${folder.id}`)
      toast.success(`Deleted folder "${folder.name}".`)
      if (onFolderMutated) onFolderMutated()
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to delete folder.')
      toast.error(msg)
    }
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 min-w-47.5 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-pop select-none animate-in fade-in zoom-in-95">
          <ContextMenu.Item
            onClick={handleOpen}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-surface-2 outline-none cursor-pointer"
          >
            <FolderOpen className="h-4 w-4 text-ink-3" />
            <span>Open Folder</span>
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 h-px bg-line" />

          <ContextMenu.Item
            onClick={() =>
              openDialog('rename', {
                id: folder.id,
                name: folder.name,
                type: 'folder',
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
                folderId: folder.id,
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
            <span>Delete Folder</span>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}

