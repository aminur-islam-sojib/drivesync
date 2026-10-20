'use client'

import * as React from 'react'
import Link from 'next/link'
import { Clock, LayoutGrid, List } from 'lucide-react'
import { api } from '@/lib/api'
import { FileItem } from '@/lib/types'
import { useUIStore } from '@/stores/ui-store'
import { useDialogStore } from '@/stores/dialog-store'
import { FileGrid } from '@/components/files/file-grid'
import { FileTable } from '@/components/files/file-table'

export default function RecentPage() {
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const viewMode = useUIStore((state) => state.viewMode)
  const setViewMode = useUIStore((state) => state.setViewMode)
  const openDialog = useDialogStore((state) => state.openDialog)

  const [refreshIndex, setRefreshIndex] = React.useState(0)
  const triggerRefresh = () => setRefreshIndex((v) => v + 1)

  React.useEffect(() => {
    let isMounted = true

    async function fetchRecent() {
      try {
        const res = await api.get('/files')
        const items: FileItem[] = res.data?.files || []
        items.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        if (isMounted) {
          setFiles(items)
          setIsLoading(false)
        }
      } catch {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchRecent()

    const handleRefresh = () => triggerRefresh()
    window.addEventListener('drivesync-refresh-items', handleRefresh)
    return () => {
      isMounted = false
      window.removeEventListener('drivesync-refresh-items', handleRefresh)
    }
  }, [refreshIndex])

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/40 select-none">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-3">
            <Link href="/all-files" className="hover:text-ink transition-colors">
              DriveSync
            </Link>
            <span>&gt;</span>
            <span className="text-ink font-semibold">Recent</span>
          </nav>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-ink">Recent Files</h1>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center rounded-xl bg-surface-2 p-1 border border-line/40">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-surface text-ink shadow-xs font-semibold'
                  : 'text-ink-3 hover:text-ink'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-surface text-ink shadow-xs font-semibold'
                  : 'text-ink-3 hover:text-ink'
              }`}
              title="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Files List/Grid */}
      <section className="space-y-3" aria-label="Recent Files">
        {viewMode === 'list' ? (
          <FileTable
            files={files}
            isLoading={isLoading}
            onFileMutated={triggerRefresh}
            onFileDoubleClick={(file) => openDialog('file-preview', { file, files })}
          />
        ) : (
          <FileGrid
            files={files}
            isLoading={isLoading}
            onFileMutated={triggerRefresh}
            onFileDoubleClick={(file) => openDialog('file-preview', { file, files })}
          />
        )}

        {!isLoading && files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-ink-3 border border-dashed border-line rounded-3xl bg-surface/50">
            <Clock className="h-10 w-10 mb-2 opacity-30 text-accent" />
            <p className="text-xs font-semibold text-ink">No recent files</p>
            <p className="text-[11px] max-w-xs mt-1 text-ink-3">
              Files and documents you upload or modify will appear here automatically.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
