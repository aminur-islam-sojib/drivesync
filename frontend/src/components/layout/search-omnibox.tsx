'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { useAccountStore } from '@/stores/account-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useDialogStore } from '@/stores/dialog-store'
import { api } from '@/lib/api'
import { FileItem, FolderItem } from '@/lib/types'
import { SearchOmniboxDropdown } from './search-omnibox-dropdown'

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
  const [selectedIndex, setSelectedIndex] = React.useState(-1)

  if (activeSearch !== prevActiveSearch) {
    setPrevActiveSearch(activeSearch)
    setLocalQuery(activeSearch)
  }

  // Global shortcuts: Cmd+K / Ctrl+K, /, and click outside
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
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

  const totalItems = matchedFolders.length + matchedFiles.length + (localQuery.trim() ? 1 : 0)

  const commitSearch = (val: string) => {
    const trimmed = val.trim()
    setFilter('search', trimmed || undefined)
    setIsOpen(false)
    setSelectedIndex(-1)
    router.push('/all-files')
  }

  const handleClear = () => {
    setLocalQuery('')
    setFilter('search', undefined)
    setMatchedFolders([])
    setMatchedFiles([])
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleOpenFolder = (folder: FolderItem) => {
    openFolderInstantly({ id: folder.id, name: folder.name })
    setIsOpen(false)
    setSelectedIndex(-1)
    router.push(`/all-files?folderId=${folder.id}`)
  }

  const handleOpenFile = (file: FileItem) => {
    recordFileInteraction(file.id)
    setIsOpen(false)
    setSelectedIndex(-1)
    openDialog('file-preview', { file, files: matchedFiles.length > 0 ? matchedFiles : [file] })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      if (totalItems > 0) {
        setSelectedIndex((prev) => (prev + 1 >= totalItems ? 0 : prev + 1))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      if (totalItems > 0) {
        setSelectedIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1))
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < matchedFolders.length) {
        handleOpenFolder(matchedFolders[selectedIndex])
      } else if (
        selectedIndex >= matchedFolders.length &&
        selectedIndex < matchedFolders.length + matchedFiles.length
      ) {
        handleOpenFile(matchedFiles[selectedIndex - matchedFolders.length])
      } else {
        commitSearch(localQuery)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
    }
  }

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
            setSelectedIndex(-1)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
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

      {/* 2. Floating Omnibox Dropdown Card with Arrow & Enter Keyboard Navigation */}
      <SearchOmniboxDropdown
        isOpen={isOpen}
        localQuery={localQuery}
        activeType={activeType}
        isSearching={isSearching}
        matchedFolders={matchedFolders}
        matchedFiles={matchedFiles}
        selectedIndex={selectedIndex}
        totalItems={totalItems}
        onSelectIndex={setSelectedIndex}
        onFilterType={(type) => {
          setFilter('type', type)
          inputRef.current?.focus()
        }}
        onOpenFolder={handleOpenFolder}
        onOpenFile={handleOpenFile}
        onCommitSearch={commitSearch}
      />
    </div>
  )
}
