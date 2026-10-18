'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  Plus,
  CloudUpload,
  ChevronRight,
  FolderOpen,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useAccountStore } from '@/stores/account-store'
import { useDialogStore } from '@/stores/dialog-store'
import { FolderGrid } from '@/components/folders/folder-grid'
import { FileTable } from '@/components/files/file-table'
import { FileGrid } from '@/components/files/file-grid'
import { SelectionBar } from '@/components/files/selection-bar'
import { api } from '@/lib/api'
import { FolderItem, FileItem } from '@/lib/types'

type SortOption = 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc' | 'date-desc'

export default function AllFilesPage() {
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folderId')

  const viewMode = useUIStore((state) => state.viewMode)
  const setViewMode = useUIStore((state) => state.setViewMode)
  const setSelectedItem = useUIStore((state) => state.setSelectedItem)
  const openDialog = useDialogStore((state) => state.openDialog)

  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)
  const selectedAccountId = useAccountStore((state) => state.selectedAccountId)
  const filters = useAccountStore((state) => state.filters)

  const [folders, setFolders] = React.useState<FolderItem[]>([])
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [currentFolder, setCurrentFolder] = React.useState<FolderItem | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [sortBy, setSortBy] = React.useState<SortOption>('name-asc')

  const [refreshIndex, setRefreshIndex] = React.useState(0)
  const refreshData = React.useCallback(() => {
    setRefreshIndex((prev) => prev + 1)
  }, [])

  React.useEffect(() => {
    let isMounted = true

    async function loadWorkspaceData() {
      try {
        const folderRes = await api.get('/folders', {
          params: { parentId: folderId ?? undefined },
        })
        const fileParams: Record<string, string | number | undefined> = {
          folderId: folderId ?? undefined,
          q: filters.search || undefined,
          accountId: selectedAccountId || undefined,
        }
        if (filters.type) {
          fileParams.kind = filters.type
        }
        const fileRes = await api.get('/files', { params: fileParams })

        let current: FolderItem | null = null
        if (folderId) {
          const allRes = await api.get('/folders?all=1')
          current = (allRes.data?.folders || []).find((f: FolderItem) => f.id === folderId) || null
        }

        if (isMounted) {
          setFolders(folderRes.data?.folders || [])
          setFiles(fileRes.data?.files || [])
          setCurrentFolder(current)
          setIsLoading(false)
        }
      } catch {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadWorkspaceData()

    const handleRefresh = () => {
      void loadWorkspaceData()
    }
    window.addEventListener('drivesync-refresh-items', handleRefresh)
    return () => {
      isMounted = false
      window.removeEventListener('drivesync-refresh-items', handleRefresh)
    }
  }, [folderId, selectedAccountId, filters.search, filters.type, refreshIndex])

  // Sorting
  const sortedFiles = React.useMemo(() => {
    const list = [...files]
    switch (sortBy) {
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return list.sort((a, b) => b.name.localeCompare(a.name))
      case 'size-desc':
        return list.sort((a, b) => Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0))
      case 'size-asc':
        return list.sort((a, b) => Number(a.sizeBytes || 0) - Number(b.sizeBytes || 0))
      case 'date-desc':
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      default:
        return list
    }
  }, [files, sortBy])

  const sortedFolders = React.useMemo(() => {
    return [...folders].sort((a, b) => a.name.localeCompare(b.name))
  }, [folders])

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24">
      {/* 1. Header Toolbar: Title, Breadcrumbs & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/40 select-none">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-3">
            <Link href="/all-files" className="hover:text-ink transition-colors">
              DriveSync
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href="/all-files"
              className={folderId ? 'hover:text-ink transition-colors' : 'text-ink font-semibold'}
            >
              All Files
            </Link>
            {currentFolder && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-accent font-semibold truncate max-w-xs">
                  {currentFolder.name}
                </span>
              </>
            )}
          </nav>

          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-ink">
            {currentFolder ? currentFolder.name : 'Unified Workspace'}
          </h1>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center rounded-xl bg-surface-2 p-1 border border-line/40">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-surface text-ink shadow-xs' : 'text-ink-3 hover:text-ink'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-surface text-ink shadow-xs' : 'text-ink-3 hover:text-ink'
              }`}
              title="List view"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const options: SortOption[] = [
                'name-asc',
                'name-desc',
                'size-desc',
                'size-asc',
                'date-desc',
              ]
              const nextIndex = (options.indexOf(sortBy) + 1) % options.length
              setSortBy(options[nextIndex])
            }}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-medium text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sort: {sortBy.replace('-', ' ')}</span>
          </button>

          <button
            type="button"
            onClick={() => openDialog('new-folder', { parentId: folderId })}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-accent px-3.5 text-xs font-semibold text-accent-ink hover:opacity-90 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New folder</span>
          </button>
        </div>
      </div>

      {/* 2. Zero Connected Accounts Onboarding Banner */}
      {!isLoading && connectedAccounts.length === 0 && (
        <div className="rounded-3xl border border-accent/20 bg-accent-soft/30 p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-4 my-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-ink shadow-sm">
            <CloudUpload className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Connect Your First Google Drive</h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-2 max-w-md mx-auto leading-relaxed">
              DriveSync unites multiple Google Drive accounts and S3 buckets into one unified
              filesystem. Link an account to start browsing and searching your files.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openDialog('connect-drive')}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-6 text-sm font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Connect Google Drive</span>
          </button>
        </div>
      )}

      {/* 3. Signature Folder Cards Section */}
      <FolderGrid
        folders={sortedFolders}
        isLoading={isLoading}
        onFolderMutated={refreshData}
      />

      {/* 4. Files Section (Dual View: Grid or List) */}
      <section className="space-y-3" aria-label="Files">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-3">
            Files ({files.length})
          </h2>
          <span className="text-xs text-ink-3">
            {connectedAccounts.length > 0 ? 'Aggregated across drives' : 'No drives connected'}
          </span>
        </div>

        {viewMode === 'list' ? (
          <FileTable
            files={sortedFiles}
            isLoading={isLoading}
            onFileMutated={refreshData}
            onFileDoubleClick={(file) => setSelectedItem(file.id, 'file')}
          />
        ) : (
          <FileGrid
            files={sortedFiles}
            isLoading={isLoading}
            onFileMutated={refreshData}
            onFileDoubleClick={(file) => setSelectedItem(file.id, 'file')}
          />
        )}

        {/* Empty State when no folders and no files */}
        {!isLoading && folders.length === 0 && files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-ink-3 border border-dashed border-line rounded-3xl bg-surface/50">
            <FolderOpen className="h-10 w-10 mb-2 opacity-30 text-accent" />
            <p className="text-xs font-semibold text-ink">This folder is empty</p>
            <p className="text-[11px] max-w-xs mt-1 text-ink-3">
              Drop files here or click &quot;Upload&quot; to add content into this location.
            </p>
          </div>
        )}
      </section>

      {/* 5. Floating Multi-Selection Batch Actions Bar */}
      <SelectionBar onItemsMutated={refreshData} />
    </div>
  )
}
