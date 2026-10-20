import * as React from 'react'
import { FolderItem, FileItem } from '@/lib/types'
import { AccountFilters, FilterType, FilterModified } from '@/stores/account-store'
import { getFileCategory } from '@/lib/utils'

export function getModifiedDateThreshold(modified?: FilterModified): Date | null {
  if (!modified) return null
  const now = new Date()
  if (modified === 'today') {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (modified === '7d') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
  if (modified === '30d') {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
  if (modified === 'year') {
    return new Date(now.getFullYear(), 0, 1)
  }
  return null
}

export function mapFilterTypeToBackendKind(type?: FilterType): 'image' | 'video' | 'pdf' | 'doc' | 'archive' | undefined {
  if (!type || type === 'folder') return undefined
  if (type === 'image' || type === 'video' || type === 'pdf' || type === 'archive') {
    return type
  }
  if (type === 'document') {
    return 'doc'
  }
  // For 'spreadsheet', 'presentation', 'audio', backend has no enum for them.
  // We omit kind to avoid a 400 Bad Request and filter with 100% precision on client.
  return undefined
}

interface UseWorkspaceFiltersProps {
  rawFolders: FolderItem[]
  rawFiles: FileItem[]
  filters: AccountFilters
  selectedAccountId: string | null
  currentFolderId: string | null
}

export interface FilteredWorkspaceResult {
  filteredFolders: FolderItem[]
  filteredFiles: FileItem[]
  showFolders: boolean
  showFiles: boolean
  isFilterActive: boolean
  activeFilterCount: number
}

export function useWorkspaceFilters({
  rawFolders,
  rawFiles,
  filters,
  selectedAccountId,
  currentFolderId,
}: UseWorkspaceFiltersProps): FilteredWorkspaceResult {
  const isFilterActive = Boolean(
    filters.search || filters.type || filters.modified || selectedAccountId !== null
  )

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.modified ? 1 : 0) +
    (selectedAccountId !== null ? 1 : 0)

  const dateThreshold = React.useMemo(() => {
    return getModifiedDateThreshold(filters.modified)
  }, [filters.modified])

  // Folders with files belonging to the selected account
  const accountFolderIds = React.useMemo(() => {
    if (!selectedAccountId) return null
    const set = new Set<string>()
    for (const file of rawFiles) {
      if (file.connectedAccountId === selectedAccountId && file.folderId) {
        set.add(file.folderId)
      }
    }
    return set
  }, [rawFiles, selectedAccountId])

  // Determine visibility based on Type filter (Google Drive paradigm)
  const showFolders = !filters.type || filters.type === 'folder'
  const showFiles = filters.type !== 'folder'

  // Filter Folders
  const filteredFolders = React.useMemo(() => {
    if (!showFolders) return []

    return rawFolders.filter((folder) => {
      // 1. Search Query Filter
      if (filters.search) {
        const q = filters.search.toLowerCase().trim()
        if (!folder.name.toLowerCase().includes(q)) {
          return false
        }
      }

      // 2. Account Filter
      if (selectedAccountId) {
        const matchesDirectly =
          folder.connectedAccountId === selectedAccountId ||
          folder.connectedAccount?.id === selectedAccountId
        const containsAccountFiles = accountFolderIds?.has(folder.id)
        if (matchesDirectly || containsAccountFiles) {
          // Matches selected account or contains files from this account
        } else if (folder.connectedAccountId) {
          return false
        } else if (folder.fileCount && folder.fileCount > 0 && !containsAccountFiles) {
          return false
        }
      }

      // 3. Modified Date Filter
      if (dateThreshold) {
        const folderDate = new Date(folder.updatedAt || folder.createdAt).getTime()
        if (isNaN(folderDate) || folderDate < dateThreshold.getTime()) {
          return false
        }
      }

      return true
    })
  }, [rawFolders, showFolders, filters.search, selectedAccountId, accountFolderIds, dateThreshold])

  // Filter Files
  const filteredFiles = React.useMemo(() => {
    if (!showFiles) return []

    return rawFiles.filter((file) => {
      // 1. Hierarchy Scoping:
      // When inside a folder: always scope to that folder unless global search (filters.search) is active
      // When at root: only show root files (folderId === null) if no type/date/search filter is active
      if (currentFolderId && !filters.search) {
        if (file.folderId !== currentFolderId) return false
      } else if (!currentFolderId && !filters.search && !filters.type && !filters.modified) {
        if (file.folderId) return false
      }

      // 2. Search Query Filter
      if (filters.search) {
        const q = filters.search.toLowerCase().trim()
        if (!file.name.toLowerCase().includes(q)) {
          return false
        }
      }

      // 3. Account Filter
      if (selectedAccountId) {
        const accountId = file.connectedAccountId || file.connectedAccount?.id
        if (accountId && accountId !== selectedAccountId) {
          return false
        }
      }

      // 4. File Type / Category Filter
      if (filters.type && filters.type !== 'folder') {
        const category = getFileCategory(file.mimeType, file.name)
        if (category !== filters.type) {
          return false
        }
      }

      // 5. Modified Date Filter
      if (dateThreshold) {
        const fileDate = new Date(file.updatedAt || file.createdAt).getTime()
        if (isNaN(fileDate) || fileDate < dateThreshold.getTime()) {
          return false
        }
      }

      return true
    })
  }, [
    rawFiles,
    showFiles,
    currentFolderId,
    filters.search,
    selectedAccountId,
    filters.type,
    filters.modified,
    dateThreshold,
  ])

  return {
    filteredFolders,
    filteredFiles,
    showFolders,
    showFiles,
    isFilterActive,
    activeFilterCount,
  }
}
