'use client'

import * as React from 'react'
import { CloudUpload } from 'lucide-react'
import { useUploadStore } from '@/stores/upload-store'
import { useWorkspaceStore } from '@/stores/workspace-store'

export function UploadDropzone() {
  const folderId = useWorkspaceStore((state) => state.currentFolderId)

  const [isDragging, setIsDragging] = React.useState(false)
  const dragCounterRef = React.useRef(0)
  const addFiles = useUploadStore((state) => state.addFiles)

  React.useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer?.types?.includes('Files')) {
        dragCounterRef.current += 1
        setIsDragging(true)
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      dragCounterRef.current -= 1
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0
        setIsDragging(false)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy'
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      dragCounterRef.current = 0
      setIsDragging(false)

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const filesArray = Array.from(e.dataTransfer.files)
        addFiles(filesArray, folderId)
      }
    }

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [addFiles, folderId])

  if (!isDragging) return null

  return (
    <div
      aria-label="Dropzone Overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6 select-none animate-in fade-in duration-150"
    >
      <div className="flex flex-col items-center justify-center w-full max-w-xl h-80 rounded-3xl border-3 border-dashed border-accent bg-surface/90 shadow-pop p-8 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-ink shadow-sm animate-bounce">
          <CloudUpload className="h-8 w-8 stroke-[2.5]" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-ink">Drop files here to upload</h2>
          <p className="mt-1 text-xs text-ink-2 max-w-sm mx-auto">
            Files will be uploaded and automatically synchronized to your connected Google Drive or
            S3 storage.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-accent">
          <span>Resumable 5MB chunking active</span>
        </div>
      </div>
    </div>
  )
}

