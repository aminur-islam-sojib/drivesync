'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Edit3, X } from 'lucide-react'
import { toast } from 'sonner'
import { useDialogStore } from '@/stores/dialog-store'
import { api, formatApiError } from '@/lib/api'

interface RenameDialogProps {
  onRenamed?: () => void
}

interface RenameFormProps {
  initialName: string
  itemId?: string
  itemType: 'file' | 'folder'
  closeDialog: () => void
  onRenamed?: () => void
}

function RenameForm({
  initialName,
  itemId,
  itemType,
  closeDialog,
  onRenamed,
}: RenameFormProps) {
  const [name, setName] = React.useState(initialName)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !itemId) {
      toast.error('Please enter a valid name.')
      return
    }

    setIsSubmitting(true)
    try {
      if (itemType === 'folder') {
        await api.patch(`/folders/${itemId}`, { name: trimmed })
      } else {
        await api.patch(`/files/${itemId}`, { name: trimmed })
      }

      toast.success(`Renamed to "${trimmed}".`)
      closeDialog()
      if (onRenamed) onRenamed()
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to rename item.')
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Content
      aria-describedby={undefined}
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-pop outline-none animate-in fade-in zoom-in-95"
    >
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Edit3 className="h-4 w-4" />
          </div>
          <Dialog.Title className="text-base font-bold text-ink">
            Rename {itemType === 'folder' ? 'Folder' : 'File'}
          </Dialog.Title>
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

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="rename-input" className="block text-xs font-semibold text-ink-2 mb-1.5">
            New Name
          </label>
          <input
            id="rename-input"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-xs text-ink placeholder:text-ink-3 focus:border-accent focus:bg-surface focus:outline-none transition-all"
          />
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
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="h-9 rounded-xl bg-accent px-5 text-xs font-semibold text-accent-ink hover:opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Renaming...' : 'Save'}
          </button>
        </div>
      </form>
    </Dialog.Content>
  )
}

export function RenameDialog({ onRenamed }: RenameDialogProps) {
  const activeDialog = useDialogStore((state) => state.activeDialog)
  const dialogData = useDialogStore((state) => state.dialogData)
  const closeDialog = useDialogStore((state) => state.closeDialog)

  const isOpen = activeDialog === 'rename'
  const itemType = (dialogData?.type as 'file' | 'folder') || 'file'
  const itemId = dialogData?.id as string | undefined
  const initialName = String(dialogData?.name || '')

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in" />
        {isOpen && (
          <RenameForm
            key={itemId || 'rename-item'}
            initialName={initialName}
            itemId={itemId}
            itemType={itemType}
            closeDialog={closeDialog}
            onRenamed={onRenamed}
          />
        )}
      </Dialog.Portal>
    </Dialog.Root>
  )
}

