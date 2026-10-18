'use client'

import * as React from 'react'
import { ExternalLink, Download, FileText } from 'lucide-react'

interface PdfViewerProps {
  src: string
  title: string
}

export function PdfViewer({ src, title }: PdfViewerProps) {
  const [loadError, setLoadError] = React.useState(false)

  return (
    <div className="relative flex h-full w-full flex-col bg-surface-2 rounded-xl overflow-hidden border border-line">
      {loadError ? (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <FileText className="h-12 w-12 text-accent mb-3" />
          <h4 className="text-sm font-bold text-ink">PDF Preview Unavailable</h4>
          <p className="text-xs text-ink-3 max-w-sm mt-1 mb-4">
            Your browser could not preview this PDF inline. You can open it in a new window or
            download it directly.
          </p>
          <div className="flex items-center gap-3">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-ink hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open in New Tab</span>
            </a>
            <a
              href={src}
              download={title}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-surface border border-line px-4 text-xs font-semibold text-ink hover:bg-surface-2 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>
      ) : (
        <iframe
          src={`${src}#toolbar=1&navpanes=0`}
          title={title}
          className="h-full w-full border-none bg-surface"
          onError={() => setLoadError(true)}
        />
      )}
    </div>
  )
}

