'use client'

import * as React from 'react'
import { Download, ExternalLink } from 'lucide-react'
import { formatBytes } from '@/lib/utils'
import { FileTypeIcon } from '@/components/files/file-type-icon'

interface GenericViewerProps {
  file: {
    name: string
    mimeType: string
    sizeBytes?: string | number | null
    provider?: string
  }
  onDownload: () => void
  onOpenGoogleDrive?: () => void
}

export function GenericViewer({ file, onDownload, onOpenGoogleDrive }: GenericViewerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-md w-full mx-auto text-center select-none">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-surface-2 border border-line shadow-card">
        <FileTypeIcon name={file.name} mimeType={file.mimeType} className="h-12 w-12" />
      </div>

      <h3 className="text-base font-bold text-ink max-w-sm truncate mb-1">{file.name}</h3>
      <p className="text-xs text-ink-3 mb-6">
        {formatBytes(Number(file.sizeBytes || 0))} • {file.mimeType || 'Unknown format'}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
        {file.provider === 'google_drive' && onOpenGoogleDrive && (
          <button
            type="button"
            onClick={onOpenGoogleDrive}
            className="inline-flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-accent px-5 text-xs font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-98 transition-all cursor-pointer"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open in Google Drive</span>
          </button>
        )}

        <button
          type="button"
          onClick={onDownload}
          className="inline-flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 text-xs font-semibold text-ink hover:bg-surface-2 transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4 text-ink-3" />
          <span>Download</span>
        </button>
      </div>
    </div>
  )
}
