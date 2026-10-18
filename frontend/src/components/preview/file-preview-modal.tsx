'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X,
  Download,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDialogStore } from '@/stores/dialog-store'
import { FileItem } from '@/lib/types'
import { formatBytes } from '@/lib/utils'
import { api, formatApiError, downloadFile } from '@/lib/api'
import { getFilePreviewKind } from '@/lib/preview-helpers'
import { FileTypeIcon } from '@/components/files/file-type-icon'
import { ImageViewer } from './image-viewer'
import { VideoPlayer } from './video-player'
import { AudioPlayer } from './audio-player'
import { PdfViewer } from './pdf-viewer'
import { CodeTextViewer } from './code-text-viewer'
import { GenericViewer } from './generic-viewer'

export function FilePreviewModal() {
  const activeDialog = useDialogStore((state) => state.activeDialog)
  const dialogData = useDialogStore((state) => state.dialogData)
  const closeDialog = useDialogStore((state) => state.closeDialog)

  const initialFile = (dialogData?.file as FileItem) || null
  const fileList = React.useMemo(
    () => (dialogData?.files as FileItem[]) || [],
    [dialogData?.files]
  )

  const [selectedFileOverride, setSelectedFileOverride] = React.useState<FileItem | null>(null)
  const activeFile = selectedFileOverride ?? initialFile
  const [loadedPreview, setLoadedPreview] = React.useState<{
    fileId: string
    url: string | null
  } | null>(null)

  const previewUrl = loadedPreview?.fileId === activeFile?.id ? loadedPreview.url : null
  const isLoadingToken = Boolean(
    activeFile?.id &&
      activeDialog === 'file-preview' &&
      (!loadedPreview || loadedPreview.fileId !== activeFile.id)
  )

  // Fetch temporary streaming preview token when activeFile changes
  React.useEffect(() => {
    const fileId = activeFile?.id
    if (!fileId || activeDialog !== 'file-preview') return

    let isMounted = true

    async function fetchPreviewToken() {
      try {
        const res = await api.post(`/files/${fileId}/preview-token`)
        if (isMounted) {
          const path = res.data?.path
          const base = api.defaults.baseURL || 'http://localhost:4000'
          setLoadedPreview({ fileId, url: `${base}${path}` })
        }
      } catch {
        if (isMounted) {
          setLoadedPreview({ fileId, url: null })
        }
      }
    }

    void fetchPreviewToken()
    return () => {
      isMounted = false
    }
  }, [activeFile?.id, activeDialog])

  const currentIndex = fileList.findIndex((f) => f.id === activeFile?.id)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < fileList.length - 1

  const handlePrev = React.useCallback(() => {
    if (hasPrev) setSelectedFileOverride(fileList[currentIndex - 1])
  }, [hasPrev, fileList, currentIndex])

  const handleNext = React.useCallback(() => {
    if (hasNext) setSelectedFileOverride(fileList[currentIndex + 1])
  }, [hasNext, fileList, currentIndex])

  const handleClose = () => {
    setSelectedFileOverride(null)
    setLoadedPreview(null)
    closeDialog()
  }

  // Keyboard navigation
  React.useEffect(() => {
    if (activeDialog !== 'file-preview') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeDialog, handlePrev, handleNext])

  if (activeDialog !== 'file-preview' || !activeFile) return null

  const kind = getFilePreviewKind(activeFile.name, activeFile.mimeType)

  const handleDownload = async () => {
    try {
      await downloadFile(activeFile.id, activeFile.name)
      toast.success(`Downloaded ${activeFile.name}`)
    } catch (err: unknown) {
      toast.error(formatApiError(err, 'Download failed'))
    }
  }

  const handleShare = async () => {
    try {
      const res = await api.post(`/files/${activeFile.id}/share`)
      if (res.data?.url) {
        await navigator.clipboard.writeText(res.data.url)
        toast.success('Public share link copied to clipboard!')
      }
    } catch (err: unknown) {
      toast.error(formatApiError(err, 'Failed to generate share link'))
    }
  }

  const handleOpenGoogleDrive = async () => {
    try {
      const res = await api.get(`/files/${activeFile.id}/view-url`)
      if (res.data?.url) {
        window.open(res.data.url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      toast.error('Google Drive link is unavailable.')
    }
  }

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-6 outline-none"
        >
          <Dialog.Title className="sr-only">Preview {activeFile.name}</Dialog.Title>

          {/* Top Bar */}
          <div className="flex h-14 w-full shrink-0 items-center justify-between rounded-2xl bg-surface/90 border border-line px-4 shadow-pop backdrop-blur-md z-30 select-none">
            <div className="flex items-center gap-3 truncate">
              <FileTypeIcon
                name={activeFile.name}
                mimeType={activeFile.mimeType}
                className="h-5 w-5 shrink-0"
              />
              <div className="truncate">
                <span className="text-xs sm:text-sm font-bold text-ink truncate block">
                  {activeFile.name}
                </span>
                <span className="text-[11px] text-ink-3">
                  {formatBytes(Number(activeFile.sizeBytes || 0))}
                  {fileList.length > 1 && ` • ${currentIndex + 1} of ${fileList.length}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {activeFile.provider === 'google_drive' && (
                <button
                  type="button"
                  onClick={handleOpenGoogleDrive}
                  className="hidden sm:flex h-8 items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 text-xs font-semibold text-ink hover:bg-surface-2 transition-colors cursor-pointer"
                  title="Open in Google Drive"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-accent" />
                  <span>Google Drive</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
                title="Copy share link"
              >
                <Share2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
                title="Download file"
              >
                <Download className="h-4 w-4" />
              </button>

              <div className="h-4 w-px bg-line mx-1" />

              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Main Media Stage */}
          <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden rounded-2xl bg-surface/40 border border-line/40 backdrop-blur-xs">
            {/* Previous File Button */}
            {hasPrev && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 border border-line text-ink shadow-pop hover:bg-surface hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Previous file (Left Arrow)"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Next File Button */}
            {hasNext && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 border border-line text-ink shadow-pop hover:bg-surface hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Next file (Right Arrow)"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {/* Media Content */}
            {isLoadingToken ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-7 w-7 animate-spin text-accent" />
                <span className="text-xs text-ink-3">Preparing preview stream...</span>
              </div>
            ) : previewUrl ? (
              <>
                {kind === 'image' && <ImageViewer src={previewUrl} alt={activeFile.name} />}
                {kind === 'video' && <VideoPlayer src={previewUrl} title={activeFile.name} />}
                {kind === 'audio' && <AudioPlayer src={previewUrl} title={activeFile.name} />}
                {kind === 'pdf' && <PdfViewer src={previewUrl} title={activeFile.name} />}
                {kind === 'text' && (
                  <CodeTextViewer
                    src={previewUrl}
                    fileName={activeFile.name}
                    fileId={activeFile.id}
                  />
                )}
                {kind === 'generic' && (
                  <GenericViewer
                    file={activeFile}
                    onDownload={handleDownload}
                    onOpenGoogleDrive={handleOpenGoogleDrive}
                  />
                )}
              </>
            ) : (
              <GenericViewer
                file={activeFile}
                onDownload={handleDownload}
                onOpenGoogleDrive={handleOpenGoogleDrive}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
