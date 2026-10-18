'use client'

import * as React from 'react'
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  Plus,
  CloudUpload,
  Folder,
  FileText,
  HardDrive,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useAccountStore } from '@/stores/account-store'
import { useDialogStore } from '@/stores/dialog-store'

export default function AllFilesPage() {
  const viewMode = useUIStore((state) => state.viewMode)
  const setViewMode = useUIStore((state) => state.setViewMode)
  const openDialog = useDialogStore((state) => state.openDialog)

  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)
  const selectedAccountId = useAccountStore((state) => state.selectedAccountId)
  const isLoading = useAccountStore((state) => state.isLoading)

  const activeAccount = connectedAccounts.find((a) => a.id === selectedAccountId)

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* 1. Header Toolbar: Title, Breadcrumbs & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/40 select-none">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-3">
            <span>DriveSync</span>
            <span>&gt;</span>
            <span className="text-ink font-medium">All Files</span>
            {activeAccount && (
              <>
                <span>&gt;</span>
                <span className="text-accent font-medium truncate max-w-xs">
                  {activeAccount.displayName || activeAccount.email}
                </span>
              </>
            )}
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-ink">
            {activeAccount ? activeAccount.displayName || activeAccount.email : 'Unified Files'}
          </h1>
        </div>

        {/* View Switcher & Sort Toolbar */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center rounded-xl bg-surface-2 p-1 border border-line/40">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-3 hover:text-ink'
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
                viewMode === 'list'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-3 hover:text-ink'
              }`}
              title="List view"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-medium text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort</span>
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
          <div>
            <button
              type="button"
              onClick={() => openDialog('connect-drive')}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-6 text-sm font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Connect Google Drive</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Folders Section Container (Phase 6 will populate with Signature Folder Cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-3">Folders</h2>
          <button
            type="button"
            onClick={() => openDialog('new-folder')}
            className="text-xs text-accent font-semibold hover:underline cursor-pointer"
          >
            + New Folder
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {/* Default Root Virtual Folders Placeholder */}
          {['Documents', 'Media & Assets', 'Projects', 'Archives'].map((name) => (
            <div
              key={name}
              className="group relative flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3 hover:bg-surface hover:shadow-xs transition-all cursor-pointer"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:scale-105 transition-transform">
                <Folder className="h-5 w-5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-ink truncate group-hover:text-accent transition-colors">
                  {name}
                </p>
                <p className="text-[10px] text-ink-3">Virtual Folder</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Files Section Container (Phase 6 will populate with File Table/Grid) */}
      <section className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-3">Files</h2>
          <span className="text-xs text-ink-3">
            {connectedAccounts.length > 0 ? 'Aggregated across all drives' : 'No files found'}
          </span>
        </div>

        {connectedAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-ink-3 border border-dashed border-line rounded-3xl">
            <HardDrive className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-xs font-semibold text-ink">No connected files</p>
            <p className="text-[11px] max-w-xs mt-1 text-ink-3">
              Once you connect a Google account, your Google Drive files will synchronize here
              automatically.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface overflow-hidden">
            <div className="p-8 text-center text-ink-3 space-y-2">
              <FileText className="h-10 w-10 mx-auto opacity-30 text-accent" />
              <p className="text-xs font-semibold text-ink">Workspace Ready</p>
              <p className="text-[11px] text-ink-3 max-w-sm mx-auto">
                File indexing and signature cards will be rendered in Phase 6. Use the &quot;+ New&quot; button
                or dropzone to upload items.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
