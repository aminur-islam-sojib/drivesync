'use client'

import * as React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  ChevronDown,
  X,
  Check,
  Filter,
  Folder,
  FileText,
  Table,
  Presentation,
  FileCode,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Layers,
} from 'lucide-react'
import { useAccountStore, FilterType, FilterModified } from '@/stores/account-store'

interface TypeOption {
  label: string
  value: FilterType | undefined
  icon: React.ComponentType<{ className?: string }>
}

const TYPE_OPTIONS: TypeOption[] = [
  { label: 'All Types', value: undefined, icon: Layers },
  { label: 'Folders', value: 'folder', icon: Folder },
  { label: 'Documents (.docx, docs)', value: 'document', icon: FileText },
  { label: 'Spreadsheets (.xlsx, sheets)', value: 'spreadsheet', icon: Table },
  { label: 'Presentations (.pptx, slides)', value: 'presentation', icon: Presentation },
  { label: 'PDF Documents (.pdf)', value: 'pdf', icon: FileCode },
  { label: 'Photos & Images', value: 'image', icon: ImageIcon },
  { label: 'Videos', value: 'video', icon: Video },
  { label: 'Audio', value: 'audio', icon: Music },
  { label: 'Archives (.zip, .tar)', value: 'archive', icon: Archive },
]

interface ModifiedOption {
  label: string
  value: FilterModified | undefined
}

const MODIFIED_OPTIONS: ModifiedOption[] = [
  { label: 'Anytime', value: undefined },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'This year', value: 'year' },
]

export function FilterChipsBar() {
  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)
  const selectedAccountId = useAccountStore((state) => state.selectedAccountId)
  const setSelectedAccountId = useAccountStore((state) => state.setSelectedAccountId)

  const filters = useAccountStore((state) => state.filters)
  const setFilter = useAccountStore((state) => state.setFilter)
  const resetFilters = useAccountStore((state) => state.resetFilters)

  const activeAccount = connectedAccounts.find((a) => a.id === selectedAccountId)
  const activeType = TYPE_OPTIONS.find((t) => t.value === filters.type)
  const activeModified = MODIFIED_OPTIONS.find((m) => m.value === filters.modified)

  const activeFilterCount =
    (selectedAccountId !== null ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.modified ? 1 : 0) +
    (filters.search ? 1 : 0)

  const hasActiveFilters = activeFilterCount > 0

  const handleClearAll = () => {
    setSelectedAccountId(null)
    resetFilters()
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2.5 px-4 sm:px-6 border-b border-line/40 bg-surface/50 scrollbar-none select-none">
      <div className="flex items-center gap-1.5 text-ink-3 mr-1 text-xs font-medium shrink-0">
        <Filter className="h-3.5 w-3.5 text-accent" />
        <span className="hidden sm:inline">Filters:</span>
      </div>

      {/* 1. Account / Drive Filter Chip */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedAccountId
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink'
            }`}
          >
            <span>{activeAccount ? activeAccount.displayName || activeAccount.email : 'All Drives'}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            className="z-50 w-56 rounded-xl border border-line bg-surface p-1 shadow-pop text-ink animate-in fade-in duration-100"
          >
            <DropdownMenu.Item
              onClick={() => setSelectedAccountId(null)}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-ink hover:bg-surface-2 cursor-pointer outline-none"
            >
              <span>All Connected Drives</span>
              {selectedAccountId === null && <Check className="h-3.5 w-3.5 text-accent" />}
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-line my-1" />

            {connectedAccounts.map((account) => (
              <DropdownMenu.Item
                key={account.id}
                onClick={() => setSelectedAccountId(account.id)}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-ink hover:bg-surface-2 cursor-pointer outline-none"
              >
                <span className="truncate">{account.displayName || account.email}</span>
                {selectedAccountId === account.id && <Check className="h-3.5 w-3.5 text-accent" />}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* 2. File / Folder Type Chip */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all shrink-0 cursor-pointer ${
              filters.type
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink'
            }`}
          >
            <span>{activeType?.label ? `Type: ${activeType.label}` : 'Type: All'}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            className="z-50 w-64 rounded-xl border border-line bg-surface p-1 shadow-pop text-ink animate-in fade-in duration-100"
          >
            {TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const isSelected = filters.type === opt.value
              return (
                <DropdownMenu.Item
                  key={opt.label}
                  onClick={() => setFilter('type', opt.value)}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-2 cursor-pointer outline-none ${
                    isSelected ? 'text-accent font-semibold bg-accent-soft/30' : 'text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="h-3.5 w-3.5 text-ink-3 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-accent shrink-0" />}
                </DropdownMenu.Item>
              )
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* 3. Modified Date Chip */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all shrink-0 cursor-pointer ${
              filters.modified
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink'
            }`}
          >
            <span>{activeModified?.label ? `Modified: ${activeModified.label}` : 'Modified: Anytime'}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            className="z-50 w-48 rounded-xl border border-line bg-surface p-1 shadow-pop text-ink animate-in fade-in duration-100"
          >
            {MODIFIED_OPTIONS.map((opt) => (
              <DropdownMenu.Item
                key={opt.label}
                onClick={() => setFilter('modified', opt.value)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-2 cursor-pointer outline-none ${
                  filters.modified === opt.value ? 'text-accent font-semibold bg-accent-soft/30' : 'text-ink'
                }`}
              >
                <span>{opt.label}</span>
                {filters.modified === opt.value && <Check className="h-3.5 w-3.5 text-accent" />}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* 4. Clear Filters Pill */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearAll}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 text-xs font-semibold text-ink-2 hover:bg-surface hover:text-danger hover:border-danger/30 border border-transparent transition-all shrink-0 cursor-pointer"
          title="Reset all search, type, modified, and drive filters"
        >
          <X className="h-3 w-3" />
          <span>Clear filters ({activeFilterCount})</span>
        </button>
      )}
    </div>
  )
}
