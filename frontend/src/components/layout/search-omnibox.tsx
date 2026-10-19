'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Folder as FolderIcon, CornerDownLeft, Loader2, FileText, SlidersHorizontal } from 'lucide-react'
import { useAccountStore } from '@/stores/account-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useDialogStore } from '@/stores/dialog-store'
import { FileTypeIcon } from '@/components/files/file-type-icon'
import { formatBytes } from '@/lib/utils'
import { api } from '@/lib/api'
import { FileItem, FolderItem } from '@/lib/types'

const QUICK_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'PDFs', value: 'pdf' },
  { label: 'Docs', value: 'doc' },
  { label: 'Sheets', value: 'spreadsheet' },
  { label: 'Images', value: 'image' },
] as const

export function SearchOmnibox() {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const activeSearch = useAccountStore((state) => state.filters.search || '')
  const activeType = useAccountStore((state) => state.filters.type)
  const setFilter = useAccountStore((state) => state.setFilter)
  const openDialog = useDialogStore((state) => state.openDialog)
  const openFolderInstantly = useWorkspaceStore((state) => state.openFolderInstantly)
  const recordFileInteraction = useWorkspaceStore((state) => state.recordFileInteraction)

  const [prevActiveSearch, setPrevActiveSearch] = React.useState(activeSearch)
  const [localQuery, setLocalQuery] = React.useState(activeSearch)
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSearching, setIsSearching] = React.useState(false)
  const [matchedFolders, setMatchedFolders] = React.useState<FolderItem[]>([])
  const [matchedFiles, setMatchedFiles] = React.useState<FileItem[]>([])

  if (activeSearch !== prevActiveSearch) {
    setPrevActiveSearch(activeSearch)
    setLocalQuery(activeSearch)
  }

  // Global shortcuts: Cmd+K / Ctrl+K, /, Escape, and click outside
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); inputRef.current?.focus(); setIsOpen(true)
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault(); inputRef.current?.focus(); setIsOpen(true)
      } else if (e.key === 'Escape') {
        setIsOpen(false); inputRef.current?.blur()
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Debounced search query (180ms) + AbortController to prevent race conditions
  React.useEffect(() => {
    const trimmed = localQuery.trim()
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      if (!trimmed) {
        setMatchedFolders([])
        setMatchedFiles([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const [folderRes, fileRes] = await Promise.all([
          api.get('/folders', { params: { q: trimmed }, signal: controller.signal }),
          api.get('/files', { params: { q: trimmed, ...(activeType ? { kind: activeType } : {}) }, signal: controller.signal }),
        ])
        setMatchedFolders(folderRes.data?.folders?.slice(0, 3) || [])
        setMatchedFiles(fileRes.data?.files?.slice(0, 5) || [])
      } catch {
        // Ignored if cancelled via AbortController
      } finally {
        setIsSearching(false)
      }
    }, 180)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [localQuery, activeType])

  const commitSearch = (val: string) => {
    const trimmed = val.trim()
    setFilter('search', trimmed || undefined)
    setIsOpen(false)
    router.push('/all-files')
  }

  const handleClear = () => {
    setLocalQuery('')
    setFilter('search', undefined)
    setMatchedFolders([])
    setMatchedFiles([])
    inputRef.current?.focus()
  }

  const handleOpenFolder = (folder: FolderItem) => {
    openFolderInstantly({ id: folder.id, name: folder.name })
    setIsOpen(false)
    router.push(`/all-files?folderId=${folder.id}`)
  }

  const handleOpenFile = (file: FileItem) => {
    recordFileInteraction(file.id)
    setIsOpen(false)
    openDialog('file-preview', { file, files: matchedFiles.length > 0 ? matchedFiles : [file] })
  }

  const hasResults = matchedFolders.length > 0 || matchedFiles.length > 0

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto select-none">
      {/* 1. Google Drive Material 3 Search Pill */}
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-ink-3">
          {isSearching ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin text-accent" />
          ) : (
            <Search className="h-4.5 w-4.5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setLocalQuery(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitSearch(localQuery)
            }
          }}
          placeholder="Search files and folders across all drives..."
          className="h-11 w-full rounded-full border border-transparent bg-surface-2 pl-10 pr-24 text-xs sm:text-sm text-ink placeholder:text-ink-3 transition-all focus:border-accent/40 focus:bg-surface focus:shadow-md focus:outline-none focus:ring-2 focus:ring-accent/15"
        />

        <div className="absolute right-3 flex items-center gap-1.5 text-ink-3">
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-2 border border-line text-ink-3 pointer-events-none">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* 2. Floating Omnibox Dropdown Card */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-line bg-surface/95 backdrop-blur-md shadow-xl overflow-hidden py-2 animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Quick Filter Chips */}
          <div className="px-3 pb-2 pt-1 border-b border-line/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-medium text-ink-3 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" />
              Filter:
            </span>
            {QUICK_FILTERS.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => {
                  setFilter('type', f.value)
                  inputRef.current?.focus()
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                  activeType === f.value || (!activeType && !f.value)
                    ? 'bg-accent text-accent-ink shadow-xs'
                    : 'bg-surface-2 text-ink-2 hover:bg-surface-2/80 hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Results Sections */}
          <div className="max-h-80 overflow-y-auto divide-y divide-line/30">
            {/* Matching Folders */}
            {matchedFolders.length > 0 && (
              <div className="py-1.5">
                <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-3">
                  Folders ({matchedFolders.length})
                </div>
                {matchedFolders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => handleOpenFolder(folder)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-surface-2 transition-colors cursor-pointer group"
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: `${folder.color || '#3b82f6'}20`, color: folder.color || '#3b82f6' }}
                    >
                      <FolderIcon className="h-4 w-4 fill-current" />
                    </div>
                    <span className="text-xs font-medium text-ink group-hover:text-accent truncate flex-1">
                      {folder.name}
                    </span>
                    <span className="text-[10px] text-ink-3 shrink-0">Open folder</span>
                  </button>
                ))}
              </div>
            )}

            {/* Matching Files */}
            {matchedFiles.length > 0 && (
              <div className="py-1.5">
                <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-3">
                  Files ({matchedFiles.length})
                </div>
                {matchedFiles.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => handleOpenFile(file)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-surface-2 transition-colors cursor-pointer group"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 shrink-0">
                      <FileTypeIcon mimeType={file.mimeType} name={file.name} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink group-hover:text-accent truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-ink-3">
                        {formatBytes(file.sizeBytes)} • {file.connectedAccount?.email || 'Unified Drive'}
                      </p>
                    </div>
                    <span className="text-[10px] text-ink-3 shrink-0">Preview</span>
                  </button>
                ))}
              </div>
            )}

            {/* No matches state */}
            {localQuery.trim() && !isSearching && !hasResults && (
              <div className="py-6 text-center text-ink-3">
                <FileText className="h-6 w-6 mx-auto mb-1.5 opacity-40 text-accent" />
                <p className="text-xs font-medium text-ink">No files or folders found</p>
                <p className="text-[11px] mt-0.5">Try searching with a different filename or extension</p>
              </div>
            )}
          </div>

          {/* Footer Action: Commit to Workspace */}
          {localQuery.trim() && (
            <button
              type="button"
              onClick={() => commitSearch(localQuery)}
              className="w-full flex items-center justify-between px-3.5 py-2 border-t border-line/50 text-xs font-semibold text-accent hover:bg-accent-soft/40 transition-colors cursor-pointer"
            >
              <span>See all results for &quot;{localQuery.trim()}&quot; in workspace</span>
              <CornerDownLeft className="h-3.5 w-3.5 opacity-70" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
