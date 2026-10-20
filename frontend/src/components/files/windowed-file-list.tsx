'use client'

import * as React from 'react'
import { FileItem } from '@/lib/types'
import { FileGrid } from './file-grid'
import { FileTable } from './file-table'
import { Loader2 } from 'lucide-react'

interface WindowedFileListProps {
  files: FileItem[]
  viewMode: 'grid' | 'list'
  isLoading?: boolean
  onFileMutated?: () => void
  onFileDoubleClick?: (file: FileItem) => void
  pageSize?: number
}

export function WindowedFileList({
  files,
  viewMode,
  isLoading = false,
  onFileMutated,
  onFileDoubleClick,
  pageSize = 30,
}: WindowedFileListProps) {
  const [prevFiles, setPrevFiles] = React.useState(files)
  const [visibleCount, setVisibleCount] = React.useState(pageSize)
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)

  // Standard React pattern: adjust state during render when props change to avoid cascading effect renders
  if (files !== prevFiles) {
    setPrevFiles(files)
    setVisibleCount(pageSize)
  }

  // Incrementally stream more items as the user scrolls near the end of the viewport
  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first?.isIntersecting) {
          setVisibleCount((prev) => Math.min(files.length, prev + pageSize))
        }
      },
      { rootMargin: '300px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [files.length, pageSize])

  const visibleFiles = React.useMemo(() => {
    return files.slice(0, visibleCount)
  }, [files, visibleCount])

  const hasMore = visibleCount < files.length

  return (
    <div className="space-y-4">
      {viewMode === 'list' ? (
        <FileTable
          files={visibleFiles}
          isLoading={isLoading}
          onFileMutated={onFileMutated}
          onFileDoubleClick={onFileDoubleClick}
        />
      ) : (
        <FileGrid
          files={visibleFiles}
          isLoading={isLoading}
          onFileMutated={onFileMutated}
          onFileDoubleClick={onFileDoubleClick}
        />
      )}

      {/* Incremental Stream Sentinel & Status Indicator */}
      {!isLoading && files.length > pageSize && (
        <div
          ref={sentinelRef}
          className="flex flex-col items-center justify-center py-4 text-xs text-ink-3 border-t border-line/40"
        >
          {hasMore ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
              <span>
                Showing {visibleFiles.length} of {files.length} files • scroll for more
              </span>
            </div>
          ) : (
            <span className="text-ink-3/70">
              Showing all {files.length} files
            </span>
          )}
        </div>
      )}
    </div>
  )
}
