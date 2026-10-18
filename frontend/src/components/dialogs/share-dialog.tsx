'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Trash2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDialogStore } from '@/stores/dialog-store'
import { FileItem } from '@/lib/types'
import { api, formatApiError } from '@/lib/api'
import { FileTypeIcon } from '@/components/files/file-type-icon'

interface ShareDialogProps {
  onShareUpdated?: () => void
}

export function ShareDialog({ onShareUpdated }: ShareDialogProps) {
  const activeDialog = useDialogStore((state) => state.activeDialog)
  const dialogData = useDialogStore((state) => state.dialogData)
  const closeDialog = useDialogStore((state) => state.closeDialog)

  const file = (dialogData?.file as FileItem) || null
  const fileId = file?.id

  const [loadedShare, setLoadedShare] = React.useState<{
    fileId: string
    url: string | null
  } | null>(null)
  const [googleDriveUrl, setGoogleDriveUrl] = React.useState<string | null>(null)
  const [isCopying, setIsCopying] = React.useState(false)
  const [isUpdatingGoogle, setIsUpdatingGoogle] = React.useState(false)
  const [isRevoking, setIsRevoking] = React.useState(false)

  const shareUrl = loadedShare?.fileId === fileId ? loadedShare.url : null
  const isLoading = Boolean(
    fileId && activeDialog === 'share' && (!loadedShare || loadedShare.fileId !== fileId)
  )

  // Fetch or generate public share link when dialog opens
  React.useEffect(() => {
    if (activeDialog !== 'share' || !fileId) return

    let isMounted = true

    async function initShareLink() {
      try {
        const res = await api.post(`/files/${fileId}/share`)
        if (isMounted) {
          setLoadedShare({ fileId, url: res.data?.url || null })
        }
      } catch (err: unknown) {
        if (isMounted) {
          toast.error(formatApiError(err, 'Failed to generate share link.'))
          setLoadedShare({ fileId, url: null })
        }
      }
    }

    void initShareLink()
    return () => {
      isMounted = false
    }
  }, [activeDialog, fileId])

  if (activeDialog !== 'share' || !file) return null

  const handleCopy = async (urlToCopy: string) => {
    try {
      await navigator.clipboard.writeText(urlToCopy)
      setIsCopying(true)
      toast.success('Public link copied to clipboard!')
      setTimeout(() => setIsCopying(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard.')
    }
  }

  const handleMakeGooglePublic = async () => {
    setIsUpdatingGoogle(true)
    try {
      const res = await api.post(`/files/${file.id}/public-permission`)
      if (res.data?.url) {
        setGoogleDriveUrl(res.data.url)
        toast.success('Google Drive public permissions updated!')
        onShareUpdated?.()
      }
    } catch (err: unknown) {
      toast.error(formatApiError(err, 'Failed to update Google Drive permission.'))
    } finally {
      setIsUpdatingGoogle(false)
    }
  }

  const handleRevoke = async () => {
    setIsRevoking(true)
    try {
      await api.delete(`/files/${file.id}/share`)
      setLoadedShare(null)
      toast.success('Public share link revoked.')
      onShareUpdated?.()
      closeDialog()
    } catch (err: unknown) {
      toast.error(formatApiError(err, 'Failed to revoke share link.'))
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && closeDialog()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-line bg-surface p-6 shadow-pop animate-in fade-in zoom-in-95 duration-150 select-none outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-line/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-ink">Share File</Dialog.Title>
                <p className="text-xs text-ink-3">Manage public links and sharing permissions</p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDialog}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* File Card Preview */}
          <div className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-surface-2 border border-line">
            <FileTypeIcon name={file.name} mimeType={file.mimeType} className="h-6 w-6 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-semibold text-ink truncate">{file.name}</p>
              <p className="text-[11px] text-ink-3">
                {file.provider === 'google_drive' ? 'Google Drive' : 'S3 Storage'} •{' '}
                {file.connectedAccount?.email || 'Cloud File'}
              </p>
            </div>
          </div>

          {/* Main Public Link Section */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-accent" />
                <span>DriveSync Public Link</span>
              </span>
              <span className="text-[11px] text-ink-3">Anyone with the link can view</span>
            </div>

            {isLoading ? (
              <div className="flex h-11 items-center justify-center rounded-xl bg-surface-2 border border-line">
                <RefreshCw className="h-4 w-4 animate-spin text-accent mr-2" />
                <span className="text-xs text-ink-3">Generating public token...</span>
              </div>
            ) : shareUrl ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 h-10 px-3.5 rounded-xl border border-line bg-surface-2 text-xs text-ink font-mono select-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(shareUrl)}
                  className="flex h-10 items-center gap-1.5 px-4 rounded-xl bg-accent text-accent-ink text-xs font-semibold hover:opacity-90 active:scale-98 transition-all cursor-pointer shrink-0"
                >
                  {isCopying ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{isCopying ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* Google Drive Direct Permission Section */}
          {file.provider === 'google_drive' && (
            <div className="mt-5 pt-4 border-t border-line/60 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-ink">Google Drive Web Access</p>
                  <p className="text-[11px] text-ink-3">
                    Grant public viewing directly inside Google Drive
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleMakeGooglePublic}
                  disabled={isUpdatingGoogle}
                  className="inline-flex h-8 items-center gap-1.5 px-3 rounded-xl border border-line bg-surface text-xs font-medium text-ink hover:bg-surface-2 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isUpdatingGoogle ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5 text-accent" />
                  )}
                  <span>Make Public</span>
                </button>
              </div>

              {googleDriveUrl && (
                <div className="mt-2 flex items-center justify-between p-2 rounded-xl bg-accent-soft/30 border border-accent/20">
                  <span className="text-[11px] text-accent truncate mr-2 font-mono">
                    {googleDriveUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(googleDriveUrl)}
                    className="text-xs text-accent font-semibold hover:underline shrink-0 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between">
            {shareUrl ? (
              <button
                type="button"
                onClick={handleRevoke}
                disabled={isRevoking}
                className="inline-flex h-9 items-center gap-1.5 px-3 rounded-xl text-xs font-medium text-danger hover:bg-danger/10 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Revoke Link</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={closeDialog}
              className="inline-flex h-9 items-center px-4 rounded-xl border border-line bg-surface text-xs font-semibold text-ink hover:bg-surface-2 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
