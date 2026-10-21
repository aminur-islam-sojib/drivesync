'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  HardDrive,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import axios from 'axios'
import { formatBytes, formatDate } from '@/lib/utils'
import { getFilePreviewKind } from '@/lib/preview-helpers'
import { FileTypeIcon } from '@/components/files/file-type-icon'
import { ImageViewer } from '@/components/preview/image-viewer'
import { VideoPlayer } from '@/components/preview/video-player'
import { AudioPlayer } from '@/components/preview/audio-player'
import { PdfViewer } from '@/components/preview/pdf-viewer'
import { CodeTextViewer } from '@/components/preview/code-text-viewer'
import { GenericViewer } from '@/components/preview/generic-viewer'

interface PublicFile {
  id: string
  name: string
  mimeType: string
  sizeBytes: string
  createdAt: string
  provider?: string
}

function PublicFileLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas p-4">
      <RefreshCw className="h-8 w-8 animate-spin text-accent mb-3" />
      <p className="text-xs text-ink-3">Loading shared file...</p>
    </div>
  )
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function PublicFileContent() {
  const params = useParams()
  const token = params?.token as string

  const [file, setFile] = React.useState<PublicFile | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isError, setIsError] = React.useState(false)

  React.useEffect(() => {
    if (!token) return
    let isMounted = true

    async function fetchPublicFile() {
      try {
        const res = await axios.get(`${API_BASE}/public/files/${token}`)
        if (isMounted) {
          setFile(res.data?.file || null)
          setIsLoading(false)
        }
      } catch {
        if (isMounted) {
          setIsError(true)
          setIsLoading(false)
        }
      }
    }

    void fetchPublicFile()
    return () => {
      isMounted = false
    }
  }, [token])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-canvas p-4">
        <RefreshCw className="h-8 w-8 animate-spin text-accent mb-3" />
        <p className="text-xs text-ink-3">Loading shared file...</p>
      </div>
    )
  }

  if (isError || !file) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-canvas p-4 text-center select-none">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-danger/10 text-danger mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-ink">Shared Link Unavailable</h2>
        <p className="text-xs text-ink-2 max-w-sm mt-1 mb-6">
          This shared link has expired, been revoked, or the file was removed by its owner.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-surface border border-line px-5 text-xs font-semibold text-ink hover:bg-surface-2 transition-colors"
        >
          <span>Go to DriveSync</span>
        </Link>
      </div>
    )
  }

  const kind = getFilePreviewKind(file.name, file.mimeType)
  const previewUrl = `${API_BASE}/public/files/${token}/preview`
  const downloadUrl = `${API_BASE}/public/files/${token}/download`

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', file.name)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-canvas text-ink select-none">
      {/* Top Navigation Bar */}
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface/80 px-4 sm:px-8 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink shadow-xs">
            <HardDrive className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="font-bold text-sm text-ink block leading-none">DriveSync</span>
            <span className="text-[10px] text-ink-3">Public Secure Share</span>
          </div>
        </div>

        <a
          href={downloadUrl}
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-98 transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download ({formatBytes(Number(file.sizeBytes || 0))})</span>
        </a>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-6xl w-full mx-auto justify-center">
        {/* File Header */}
        <div className="flex items-center gap-3 mb-4 p-3.5 rounded-2xl bg-surface border border-line shadow-xs">
          <FileTypeIcon name={file.name} mimeType={file.mimeType} className="h-6 w-6 shrink-0" />
          <div className="truncate">
            <h1 className="text-sm font-bold text-ink truncate">{file.name}</h1>
            <p className="text-[11px] text-ink-3">
              {formatBytes(Number(file.sizeBytes || 0))} • Shared on {formatDate(file.createdAt)}
            </p>
          </div>
        </div>

        {/* Media Preview Box */}
        <div className="relative flex-1 min-h-125 flex items-center justify-center rounded-3xl bg-surface/60 border border-line shadow-card overflow-hidden">
          {kind === 'image' && <ImageViewer src={previewUrl} alt={file.name} />}
          {kind === 'video' && <VideoPlayer src={previewUrl} title={file.name} />}
          {kind === 'audio' && <AudioPlayer src={previewUrl} title={file.name} />}
          {kind === 'pdf' && <PdfViewer src={previewUrl} title={file.name} />}
          {kind === 'text' && <CodeTextViewer src={previewUrl} fileName={file.name} />}
          {kind === 'generic' && (
            <GenericViewer
              file={file}
              onDownload={handleDownload}
            />
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="h-12 border-t border-line/40 flex items-center justify-center text-[11px] text-ink-3">
        <span>Powered by DriveSync — Multi-Account Cloud File Manager</span>
      </footer>
    </div>
  )
}

export default function PublicFilePage() {
  return (
    <React.Suspense fallback={<PublicFileLoading />}>
      <PublicFileContent />
    </React.Suspense>
  )
}

