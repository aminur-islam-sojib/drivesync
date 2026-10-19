import { create } from 'zustand'
import { FolderItem, FileItem } from '@/lib/types'

export interface FolderCrumb {
  id: string | null
  name: string
}

interface CachedContent {
  folders: FolderItem[]
  files: FileItem[]
  fetchedAt: number
}

interface WorkspaceState {
  currentFolderId: string | null
  currentFolder: FolderItem | null
  folderCrumbs: FolderCrumb[]
  folderCache: Record<string, CachedContent>

  // Actions
  setCurrentFolderId: (id: string | null) => void
  setCurrentFolder: (folder: FolderItem | null) => void
  setFolderCrumbs: (crumbs: FolderCrumb[]) => void
  openFolderInstantly: (folder: { id: string; name: string }) => void
  navigateCrumb: (id: string | null) => void
  setCachedData: (key: string, folders: FolderItem[], files: FileItem[]) => void
  getCachedData: (key: string) => CachedContent | null
  invalidateCache: () => void
}

const CACHE_TTL_MS = 60 * 1000 // 1 minute fresh cache

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentFolderId: null,
  currentFolder: null,
  folderCrumbs: [{ id: null, name: 'All Files' }],
  folderCache: {},

  setCurrentFolderId: (id) => set({ currentFolderId: id }),
  setCurrentFolder: (folder) => set({ currentFolder: folder }),
  setFolderCrumbs: (crumbs) => set({ folderCrumbs: crumbs }),

  openFolderInstantly: (folder) => {
    const { folderCrumbs } = get()
    const key = folder.id

    // Check if folder is already in crumbs to avoid duplicates
    const existingIndex = folderCrumbs.findIndex((c) => c.id === key)
    let newCrumbs: FolderCrumb[]
    if (existingIndex >= 0) {
      newCrumbs = folderCrumbs.slice(0, existingIndex + 1)
    } else {
      newCrumbs = [...folderCrumbs, { id: folder.id, name: folder.name }]
    }

    set({
      currentFolderId: folder.id,
      currentFolder: {
        id: folder.id,
        name: folder.name,
        parentId: null,
        connectedAccountId: null,
        provider: 'google_drive',
        color: 'slate',
        createdAt: '',
        updatedAt: '',
      },
      folderCrumbs: newCrumbs,
    })

    // Update browser URL without full router transition overhead
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('folderId', folder.id)
      window.history.pushState({ folderId: folder.id }, '', url.toString())
    }
  },

  navigateCrumb: (crumbId) => {
    const { folderCrumbs } = get()
    if (!crumbId) {
      set({
        currentFolderId: null,
        currentFolder: null,
        folderCrumbs: [{ id: null, name: 'All Files' }],
      })
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('folderId')
        window.history.pushState({ folderId: null }, '', url.toString())
      }
      return
    }

    const idx = folderCrumbs.findIndex((c) => c.id === crumbId)
    const crumb = folderCrumbs[idx]
    const newCrumbs = idx >= 0 ? folderCrumbs.slice(0, idx + 1) : folderCrumbs

    set({
      currentFolderId: crumbId,
      currentFolder: crumb
        ? {
            id: crumb.id!,
            name: crumb.name,
            parentId: null,
            connectedAccountId: null,
            provider: 'google_drive',
            color: 'slate',
            createdAt: '',
            updatedAt: '',
          }
        : null,
      folderCrumbs: newCrumbs,
    })

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('folderId', crumbId)
      window.history.pushState({ folderId: crumbId }, '', url.toString())
    }
  },

  setCachedData: (key, folders, files) => {
    set((state) => ({
      folderCache: {
        ...state.folderCache,
        [key]: { folders, files, fetchedAt: Date.now() },
      },
    }))
  },

  getCachedData: (key) => {
    const cached = get().folderCache[key]
    if (!cached) return null
    if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null
    return cached
  },

  invalidateCache: () => set({ folderCache: {} }),
}))
