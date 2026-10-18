'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Folder, X } from 'lucide-react'
import { toast } from 'sonner'
import { useDialogStore } from '@/stores/dialog-store'
import { api, formatApiError } from '@/lib/api'

const FOLDER_COLORS = [
  { tone: 'blue', hex: '#3B82F6', label: 'Blue' },
  { tone: 'green', hex: '#10B981', label: 'Green' },
  { tone: 'amber', hex: '#F59E0B', label: 'Amber' },
  { tone: 'red', hex: '#EF4444', label: 'Red' },
  { tone: 'violet', hex: '#8B5CF6', label: 'Violet' },
  { tone: 'pink', hex: '#EC4899', label: 'Pink' },
  { tone: 'cyan', hex: '#06B6D4', label: 'Cyan' },
  { tone: 'slate', hex: '#64748B', label: 'Slate' },
]

interface NewFolderDialogProps {
  onFolderCreated?: () => void
}

export function NewFolderDialog({ onFolderCreated }: NewFolderDialogProps) {
  const activeDialog = useDialogStore((state) => state.activeDialog)
  const dialogData = useDialogStore((state) => state.dialogData)
  const closeDialog = useDialogStore((state) => state.closeDialog)

  const [folderName, setFolderName] = React.useState('')
  const [selectedColor, setSelectedColor] = React.useState('#3B82F6')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const isOpen = activeDialog === 'new-folder'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = folderName.trim()
    if (!trimmed) {
      toast.error('Please enter a folder name.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.post('/folders', {
        name: trimmed,
        color: selectedColor,
        parentId: dialogData?.parentId ?? null,
      })

      toast.success(`Folder "${trimmed}" created!`)
      setFolderName('')
      closeDialog()
      if (onFolderCreated) onFolderCreated()
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to create folder.')
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-pop outline-none animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Folder className="h-5 w-5 fill-accent/20" />
              </div>
              <Dialog.Title className="text-base font-bold text-ink">New Folder</Dialog.Title>
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
              <label htmlFor="folder-name-input" className="block text-xs font-semibold text-ink-2 mb-1.5">
                Folder Name
              </label>
              <input
                id="folder-name-input"
                type="text"
                autoFocus
                placeholder="e.g., Client Proposals, Taxes 2026"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-xs text-ink placeholder:text-ink-3 focus:border-accent focus:bg-surface focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-2">Folder Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c.tone}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                    className={`h-7 w-7 rounded-full cursor-pointer transition-transform ${
                      selectedColor.toLowerCase() === c.hex.toLowerCase()
                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface scale-110'
                        : 'hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
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
                disabled={isSubmitting || !folderName.trim()}
                className="h-9 rounded-xl bg-accent px-5 text-xs font-semibold text-accent-ink hover:opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Folder'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

