'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  Plus,
  FileEdit,
  ChevronRight,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useDialogStore } from '@/stores/dialog-store'
import { useWorkspaceStore } from '@/stores/workspace-store'

export type SortOption = 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc' | 'date-desc'

interface WorkspaceToolbarProps {
  sortBy: SortOption
  onCycleSort: () => void
}

export function WorkspaceToolbar({ sortBy, onCycleSort }: WorkspaceToolbarProps) {
  const router = useRouter()
  const viewMode = useUIStore((state) => state.viewMode)
  const setViewMode = useUIStore((state) => state.setViewMode)
  const openDialog = useDialogStore((state) => state.openDialog)

  const currentFolderId = useWorkspaceStore((state) => state.currentFolderId)
  const currentFolder = useWorkspaceStore((state) => state.currentFolder)
  const folderCrumbs = useWorkspaceStore((state) => state.folderCrumbs)
  const navigateCrumb = useWorkspaceStore((state) => state.navigateCrumb)

  const handleCrumbClick = (crumbId: string | null) => {
    navigateCrumb(crumbId)
    if (crumbId) {
      router.push(`/all-files?folderId=${crumbId}`, { scroll: false })
    } else {
      router.push('/all-files', { scroll: false })
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/40 select-none">
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-3 flex-wrap">
          <span className="text-ink-3">DriveSync</span>
          {folderCrumbs.map((crumb, idx) => {
            const isLast = idx === folderCrumbs.length - 1
            return (
              <React.Fragment key={crumb.id ?? 'root'}>
                <ChevronRight className="h-3 w-3 shrink-0" />
                {isLast ? (
                  <span className="font-semibold text-accent truncate max-w-xs">{crumb.name}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCrumbClick(crumb.id)}
                    className="hover:text-ink transition-colors cursor-pointer"
                  >
                    {crumb.name}
                  </button>
                )}
              </React.Fragment>
            )
          })}
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
          onClick={onCycleSort}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-medium text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sort: {sortBy.replace('-', ' ')}</span>
        </button>

        <button
          type="button"
          onClick={() => openDialog('editor', { folderId: currentFolderId, fileName: 'Untitled-Note.md' })}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-semibold text-ink hover:bg-surface-2 transition-colors cursor-pointer"
        >
          <FileEdit className="h-3.5 w-3.5 text-accent" />
          <span className="hidden sm:inline">New Note</span>
        </button>

        <button
          type="button"
          onClick={() => openDialog('new-folder', { parentId: currentFolderId })}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-accent px-3.5 text-xs font-semibold text-accent-ink hover:opacity-90 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New folder</span>
        </button>
      </div>
    </div>
  )
}

