'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, CloudUpload, FolderOpen } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useAccountStore } from '@/stores/account-store'
import { useDialogStore } from '@/stores/dialog-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { WorkspaceToolbar, SortOption } from '@/components/files/workspace-toolbar'
import { ConnectedDrivesStrip } from '@/components/files/connected-drives-strip'
import { SuggestedFiles } from '@/components/files/suggested-files'
import { FolderGrid } from '@/components/folders/folder-grid'
import { WindowedFileList } from '@/components/files/windowed-file-list'
import { SelectionBar } from '@/components/files/selection-bar'
import { api } from '@/lib/api'
import { FolderItem, FileItem } from '@/lib/types'

function AllFilesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlFolderId = searchParams.get('folderId')

  const viewMode = useUIStore((state) => state.viewMode)
  const openDialog = useDialogStore((state) => state.openDialog)

  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)
  const selectedAccountId = useAccountStore((state) => state.selectedAccountId)
  const filters = useAccountStore((state) => state.filters)

  // Workspace store for instant 0ms folder transitions and in-memory cache
  const currentFolderId = useWorkspaceStore((state) => state.currentFolderId)
  const openFolderInstantly = useWorkspaceStore((state) => state.openFolderInstantly)
  const navigateCrumb = useWorkspaceStore((state) => state.navigateCrumb)
  const setCurrentFolder = useWorkspaceStore((state) => state.setCurrentFolder)
  const setFolderCrumbs = useWorkspaceStore((state) => state.setFolderCrumbs)
  const setCachedData = useWorkspaceStore((state) => state.setCachedData)
  const invalidateCache = useWorkspaceStore((state) => state.invalidateCache)
  const recordFileInteraction = useWorkspaceStore((state) => state.recordFileInteraction)

  const cacheKey = `${currentFolderId ?? 'root'}:${selectedAccountId || ''}:${filters.search || ''}:${filters.type || ''}`
  const cachedContent = useWorkspaceStore((state) => state.folderCache[cacheKey])
  const isCacheFresh = Boolean(cachedContent)

  const [serverFolders, setServerFolders] = React.useState<FolderItem[]>([])
  const [serverFiles, setServerFiles] = React.useState<FileItem[]>([])
  const [loadedKey, setLoadedKey] = React.useState<string | null>(null)
  const [sortBy, setSortBy] = React.useState<SortOption>('name-asc')
  const [refreshIndex, setRefreshIndex] = React.useState(0)

  // Synchronize when URL searchParams changes externally (browser Back/Forward, sidebar link, initial mount)
  React.useEffect(() => {
    if (urlFolderId !== useWorkspaceStore.getState().currentFolderId) {
      navigateCrumb(urlFolderId)
    }
  }, [urlFolderId, navigateCrumb])

  const handleOpenFolder = React.useCallback(
    (folder: FolderItem) => {
      openFolderInstantly({ id: folder.id, name: folder.name })
      router.push(`/all-files?folderId=${folder.id}`, { scroll: false })
    },
    [openFolderInstantly, router]
  )

  const refreshData = React.useCallback(() => {
    invalidateCache()
    setLoadedKey(null)
    setRefreshIndex((prev) => prev + 1)
  }, [invalidateCache])

  // Streaming data fetch with concurrent requests
  React.useEffect(() => {
    let isMounted = true

    async function loadWorkspaceData() {
      try {
        const fileParams: Record<string, string | number | undefined> = {
          folderId: currentFolderId ?? undefined,
          q: filters.search || undefined,
          accountId: selectedAccountId || undefined,
          ...(filters.type ? { kind: filters.type } : {}),
        }

        const needsFolderMetadata = !useWorkspaceStore.getState().currentFolder && Boolean(currentFolderId)

        const folderParams = filters.search ? { q: filters.search } : { parentId: currentFolderId ?? undefined }

        const [folderRes, fileRes, allFoldersRes] = await Promise.all([
          api.get('/folders', { params: folderParams }),
          api.get('/files', { params: fileParams }),
          needsFolderMetadata ? api.get('/folders?all=1') : Promise.resolve(null),
        ])

        if (!isMounted) return

        const fetchedFolders: FolderItem[] = folderRes.data?.folders || []
        const fetchedFiles: FileItem[] = fileRes.data?.files || []

        if (allFoldersRes?.data?.folders && currentFolderId) {
          const match = allFoldersRes.data.folders.find((f: FolderItem) => f.id === currentFolderId)
          if (match) {
            setCurrentFolder(match)
            setFolderCrumbs([
              { id: null, name: 'All Files' },
              { id: match.id, name: match.name },
            ])
          }
        }

        setServerFolders(fetchedFolders)
        setServerFiles(fetchedFiles)
        setLoadedKey(cacheKey)
        setCachedData(cacheKey, fetchedFolders, fetchedFiles)
      } catch {
        if (isMounted) setLoadedKey(cacheKey)
      }
    }

    void loadWorkspaceData()

    const handleExternalRefresh = () => {
      invalidateCache()
      setLoadedKey(null)
      void loadWorkspaceData()
    }
    window.addEventListener('drivesync-refresh-items', handleExternalRefresh)
    return () => {
      isMounted = false
      window.removeEventListener('drivesync-refresh-items', handleExternalRefresh)
    }
  }, [currentFolderId, selectedAccountId, filters.search, filters.type, refreshIndex, cacheKey, setCachedData, setCurrentFolder, setFolderCrumbs, invalidateCache])

  // Derived instant data: if cache is available, display immediately; otherwise fallback to server data
  const isLoaded = isCacheFresh || loadedKey === cacheKey
  const folders = isCacheFresh && cachedContent ? cachedContent.folders : serverFolders
  const files = isCacheFresh && cachedContent ? cachedContent.files : serverFiles
  const isLoading = !isLoaded

  const isSearching = Boolean(filters.search || filters.type)
  const isRootView = !currentFolderId && !isSearching

  // Strict Level Scoping:
  // - Root view: only files directly in root (folderId === null)
  // - Subfolder view: files belonging to that subfolder (folderId === currentFolderId)
  // - Global search/filter: search across all folders
  const scopedFiles = React.useMemo(() => {
    if (isSearching) return files
    if (currentFolderId) return files.filter((f) => f.folderId === currentFolderId)
    return files.filter((f) => !f.folderId)
  }, [files, isSearching, currentFolderId])

  // Sorting scoped files
  const sortedScopedFiles = React.useMemo(() => {
    const list = [...scopedFiles]
    if (sortBy === 'name-asc') return list.sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'name-desc') return list.sort((a, b) => b.name.localeCompare(a.name))
    if (sortBy === 'size-desc') return list.sort((a, b) => Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0))
    if (sortBy === 'size-asc') return list.sort((a, b) => Number(a.sizeBytes || 0) - Number(b.sizeBytes || 0))
    if (sortBy === 'date-desc') return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return list
  }, [scopedFiles, sortBy])

  const sortedFolders = React.useMemo(() => {
    return [...folders].sort((a, b) => a.name.localeCompare(b.name))
  }, [folders])

  const handleFilePreview = React.useCallback(
    (file: FileItem) => {
      recordFileInteraction(file.id)
      openDialog('file-preview', { file, files: sortedScopedFiles })
    },
    [recordFileInteraction, openDialog, sortedScopedFiles]
  )

  const cycleSort = () => {
    const opts: SortOption[] = ['name-asc', 'name-desc', 'size-desc', 'size-asc', 'date-desc']
    setSortBy(opts[(opts.indexOf(sortBy) + 1) % opts.length])
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24">
      {/* 1. Header Toolbar: Title, Breadcrumbs & View Controls */}
      <WorkspaceToolbar sortBy={sortBy} onCycleSort={cycleSort} />

      {/* 2. Connected Drives Wayfinding Strip */}
      <ConnectedDrivesStrip />

      {/* 3. Zero Connected Accounts Onboarding Banner */}
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

      {/* 4. Suggested Files Quick Access (Root view only) */}
      {isRootView && (
        <SuggestedFiles
          files={files}
          isLoading={isLoading}
          onFileMutated={refreshData}
          onFileDoubleClick={handleFilePreview}
        />
      )}

      {/* 5. Signature Folder Cards Section */}
      <FolderGrid
        folders={sortedFolders}
        isLoading={isLoading}
        onFolderMutated={refreshData}
        onOpenFolder={handleOpenFolder}
      />

      {/* 6. Progressive Scoped Files Section */}
      <section className="space-y-3" aria-label="Files">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-3">
            {isSearching
              ? `Search Results (${scopedFiles.length})`
              : currentFolderId
                ? `Folder Files (${scopedFiles.length})`
                : `Root Files (${scopedFiles.length})`}
          </h2>
          <span className="text-xs text-ink-3">
            {connectedAccounts.length > 0 ? 'Aggregated across drives' : 'No drives connected'}
          </span>
        </div>

        <WindowedFileList
          files={sortedScopedFiles}
          viewMode={viewMode}
          isLoading={isLoading}
          onFileMutated={refreshData}
          onFileDoubleClick={handleFilePreview}
        />

        {/* Empty State when no folders and no files match scope */}
        {!isLoading && folders.length === 0 && scopedFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-ink-3 border border-dashed border-line rounded-3xl bg-surface/50">
            <FolderOpen className="h-10 w-10 mb-2 opacity-30 text-accent" />
            <p className="text-xs font-semibold text-ink">
              {isSearching ? 'No matching files or folders found' : 'This folder is empty'}
            </p>
            <p className="text-[11px] max-w-xs mt-1 text-ink-3">
              {isSearching
                ? 'Try searching with different keywords or clearing filters.'
                : 'Drop files here or click "Upload" to add content into this location.'}
            </p>
          </div>
        )}
      </section>

      {/* 5. Floating Multi-Selection Batch Actions Bar */}
      <SelectionBar onItemsMutated={refreshData} />
    </div>
  )
}

export default function AllFilesPage() {
  return (
    <React.Suspense fallback={<div className="p-4 sm:p-6 space-y-6 animate-pulse" />}>
      <AllFilesContent />
    </React.Suspense>
  )
}
