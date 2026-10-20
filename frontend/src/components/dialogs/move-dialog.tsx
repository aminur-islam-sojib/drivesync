'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FolderInput, Folder, Home, X } from 'lucide-react'
import { toast } from 'sonner'
import { useDialogStore } from '@/stores/dialog-store'
import { useSelectionStore } from '@/stores/selection-store'
import { api, formatApiError } from '@/lib/api'
import { FolderItem } from '@/lib/types'

interface MoveDialogProps {
  onMoved?: () => void
}

interface MoveFormProps {
  targetFileIds: string[]
  targetFolderId: string | null
  closeDialog: () => void
  onMoved?: () => void
}

function MoveForm({
  targetFileIds,
  targetFolderId,
  closeDialog,
  onMoved,
}: MoveFormProps) {
  const clearSelection = useSelectionStore((state) => state.clearSelection)
  const [folders, setFolders] = React.useState<FolderItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true
    api
      .get('/folders?all=1')
      .then((res) => {
        if (isMounted) {
          setFolders(res.data?.folders || [])
        }
      })
      .catch(() => {
        toast.error('Failed to load folders.')
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleMove = async () => {
    setIsSubmitting(true)
    try {
      if (targetFolderId) {
        await api.patch(`/folders/${targetFolderId}`, {
          parentId: selectedFolderId,
        })
      } else if (targetFileIds.length > 0) {
        await api.patch('/files/batch', {
          fileIds: targetFileIds,
          folderId: selectedFolderId,
        })
      }

      toast.success('Items moved successfully.')
      clearSelection()
      closeDialog()
      if (onMoved) onMoved()
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to move items.')
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableFolders = folders.filter((f) => f.id !== targetFolderId)

  return (
    <Dialog.Content
      aria-describedby={undefined}
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-md rounded-3xl bg-surface p-6 outline-none animate-in fade-in zoom-in-95"
    >
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <FolderInput className="h-5 w-5" />
          </div>
          <Dialog.Title className="text-base font-bold text-ink">Move to Folder</Dialog.Title>
        </div>
        <Dialog.Close asChild>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-3 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </Dialog.Close>
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-xs text-ink-2">Select destination folder:</p>

        <div className="max-h-60 overflow-y-auto space-y-1 rounded-2xl border border-line bg-surface-2 p-2">
          <button
            type="button"
            onClick={() => setSelectedFolderId(null)}
            className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-xs font-medium transition-colors cursor-pointer ${
              selectedFolderId === null
                ? 'bg-accent text-accent-ink font-semibold'
                : 'hover:bg-surface text-ink'
            }`}
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>DriveSync Home (Root)</span>
          </button>

          {isLoading ? (
            <div className="py-6 text-center text-xs text-ink-3">Loading folders...</div>
          ) : (
            availableFolders.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFolderId(f.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-xs font-medium transition-colors cursor-pointer ${
                  selectedFolderId === f.id
                    ? 'bg-accent text-accent-ink font-semibold'
                    : 'hover:bg-surface text-ink'
                }`}
              >
                <Folder className="h-4 w-4 shrink-0" />
                <span className="truncate">{f.name}</span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={closeDialog}
            className="h-9 rounded-xl border border-line bg-surface px-4 text-xs font-semibold text-ink hover:bg-surface-2 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMove}
            disabled={isSubmitting}
            className="h-9 rounded-xl bg-accent px-5 text-xs font-semibold text-accent-ink hover:opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Moving...' : 'Move Here'}
          </button>
        </div>
      </div>
    </Dialog.Content>
  )
}

export function MoveDialog({ onMoved }: MoveDialogProps) {
  const activeDialog = useDialogStore((state) => state.activeDialog)
  const dialogData = useDialogStore((state) => state.dialogData)
  const closeDialog = useDialogStore((state) => state.closeDialog)

  const selectedFileIds = useSelectionStore((state) => state.selectedFileIds)
  const selectedFolderIds = useSelectionStore((state) => state.selectedFolderIds)

  const isOpen = activeDialog === 'move'
  const targetFileIds = (dialogData?.fileIds as string[]) || selectedFileIds
  const targetFolderId =
    (dialogData?.folderId as string) || (selectedFolderIds.length === 1 ? selectedFolderIds[0] : null)

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <Dialog.Portal>
        {isOpen && (
          <>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in" />
            <MoveForm
              key={targetFolderId || targetFileIds.join(',') || 'move-form'}
              targetFileIds={targetFileIds}
              targetFolderId={targetFolderId}
              closeDialog={closeDialog}
              onMoved={onMoved}
            />
          </>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  )
}

