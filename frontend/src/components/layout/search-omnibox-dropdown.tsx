'use client'

import * as React from 'react'
import { Folder as FolderIcon, CornerDownLeft, FileText, SlidersHorizontal } from 'lucide-react'
import { FileTypeIcon } from '@/components/files/file-type-icon'
import { formatBytes } from '@/lib/utils'
import { FileItem, FolderItem } from '@/lib/types'

export const QUICK_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'PDFs', value: 'pdf' },
  { label: 'Docs', value: 'doc' },
  { label: 'Sheets', value: 'spreadsheet' },
  { label: 'Images', value: 'image' },
] as const

interface SearchOmniboxDropdownProps {
  isOpen: boolean
  localQuery: string
  activeType?: string
  isSearching: boolean
  matchedFolders: FolderItem[]
  matchedFiles: FileItem[]
  selectedIndex: number
  totalItems: number
  onSelectIndex: (index: number) => void
  onFilterType: (type?: string) => void
  onOpenFolder: (folder: FolderItem) => void
  onOpenFile: (file: FileItem) => void
  onCommitSearch: (query: string) => void
}

function DropdownRow({
  isSelected,
  onMouseEnter,
  onClick,
  children,
  className = '',
}: {
  isSelected: boolean
  onMouseEnter: () => void
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  const rowRef = React.useRef<HTMLButtonElement | null>(null)

  React.useEffect(() => {
    if (isSelected) {
      rowRef.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isSelected])

  return (
    <button
      ref={rowRef}
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-colors cursor-pointer group outline-none ${
        isSelected ? 'bg-surface-2' : 'hover:bg-surface-2'
      } text-ink ${className}`}
    >
      {children}
    </button>
  )
}

export function SearchOmniboxDropdown({
  isOpen,
  localQuery,
  activeType,
  isSearching,
  matchedFolders,
  matchedFiles,
  selectedIndex,
  totalItems,
  onSelectIndex,
  onFilterType,
  onOpenFolder,
  onOpenFile,
  onCommitSearch,
}: SearchOmniboxDropdownProps) {
  if (!isOpen) return null

  const hasResults = matchedFolders.length > 0 || matchedFiles.length > 0
  const footerIndex = matchedFolders.length + matchedFiles.length

  return (
    <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-line bg-surface/95 backdrop-blur-md shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100 select-none">
      {/* 1. Quick Filter Chips Bar */}
      <div className="px-3 pb-2 pt-2 border-b border-line/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-medium text-ink-3 mr-1 flex items-center gap-1">
          <SlidersHorizontal className="h-3 w-3" />
          Filter:
        </span>
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => onFilterType(f.value)}
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

      {/* 2. Scrollable Results List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-line/30">
        {/* Matching Folders */}
        {matchedFolders.length > 0 && (
          <div className="py-1.5">
            <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-3">
              Folders ({matchedFolders.length})
            </div>
            {matchedFolders.map((folder, idx) => {
              const isSelected = selectedIndex === idx
              return (
                <DropdownRow
                  key={folder.id}
                  isSelected={isSelected}
                  onMouseEnter={() => onSelectIndex(idx)}
                  onClick={() => onOpenFolder(folder)}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                    style={{ backgroundColor: `${folder.color || '#3b82f6'}20`, color: folder.color || '#3b82f6' }}
                  >
                    <FolderIcon className="h-4 w-4 fill-current" />
                  </div>
                  <span
                    className={`text-xs font-medium truncate flex-1 transition-colors ${
                      isSelected ? 'text-accent' : 'text-ink group-hover:text-accent'
                    }`}
                  >
                    {folder.name}
                  </span>
                  <span className="text-[10px] text-ink-3 shrink-0">Open folder</span>
                </DropdownRow>
              )
            })}
          </div>
        )}

        {/* Matching Files */}
        {matchedFiles.length > 0 && (
          <div className="py-1.5">
            <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-3">
              Files ({matchedFiles.length})
            </div>
            {matchedFiles.map((file, idx) => {
              const fileGlobalIndex = matchedFolders.length + idx
              const isSelected = selectedIndex === fileGlobalIndex
              return (
                <DropdownRow
                  key={file.id}
                  isSelected={isSelected}
                  onMouseEnter={() => onSelectIndex(fileGlobalIndex)}
                  onClick={() => onOpenFile(file)}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 shrink-0">
                    <FileTypeIcon mimeType={file.mimeType} name={file.name} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate transition-colors ${
                        isSelected ? 'text-accent' : 'text-ink group-hover:text-accent'
                      }`}
                    >
                      {file.name}
                    </p>
                    <p className="text-[10px] text-ink-3 truncate">
                      {formatBytes(file.sizeBytes)} • {file.connectedAccount?.email || 'Unified Drive'}
                    </p>
                  </div>
                  <span className="text-[10px] text-ink-3 shrink-0">Preview</span>
                </DropdownRow>
              )
            })}
          </div>
        )}

        {/* Empty Search State */}
        {localQuery.trim() && !isSearching && !hasResults && (
          <div className="py-6 text-center text-ink-3">
            <FileText className="h-6 w-6 mx-auto mb-1.5 opacity-40 text-accent" />
            <p className="text-xs font-medium text-ink">No files or folders found</p>
            <p className="text-[11px] mt-0.5">Try searching with a different name or clear filter</p>
          </div>
        )}
      </div>

      {/* 3. Footer Action: Commit to Workspace */}
      {localQuery.trim() && (
        <DropdownRow
          isSelected={selectedIndex === footerIndex}
          onMouseEnter={() => onSelectIndex(footerIndex)}
          onClick={() => onCommitSearch(localQuery)}
        >
          <span className="flex-1 text-xs font-semibold text-accent truncate">
            See all results for &quot;{localQuery.trim()}&quot; in workspace
          </span>
          <CornerDownLeft className="h-3.5 w-3.5 text-accent opacity-70 shrink-0" />
        </DropdownRow>
      )}

      {/* 4. Keyboard Shortcuts Legend Bar */}
      <div className="flex items-center justify-between border-t border-line/40 bg-surface-2/40 px-3.5 py-1.5 text-[10px] text-ink-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-line bg-surface px-1 py-0.5 font-mono text-[9px] shadow-2xs">↑</kbd>
            <kbd className="rounded border border-line bg-surface px-1 py-0.5 font-mono text-[9px] shadow-2xs">↓</kbd>
            <span>navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[9px] shadow-2xs">↵</kbd>
            <span>open</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[9px] shadow-2xs">esc</kbd>
            <span>dismiss</span>
          </span>
        </div>
        <span className="text-ink-3/70 text-[9px]">
          {totalItems > 0 && selectedIndex >= 0 ? `${selectedIndex + 1} of ${totalItems}` : ''}
        </span>
      </div>
    </div>
  )
}

