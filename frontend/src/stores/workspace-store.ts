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

  recentInteractions: Record<string, number>

  // Actions
  recordFileInteraction: (fileId: string) => void
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
  recentInteractions: {},

  recordFileInteraction: (fileId) => {
    set((state) => ({
      recentInteractions: {
        ...state.recentInteractions,
        [fileId]: Date.now(),
      },
    }))
  },

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
  },

  navigateCrumb: (crumbId) => {
    const { folderCrumbs } = get()
    if (!crumbId) {
      set({
        currentFolderId: null,
        currentFolder: null,
        folderCrumbs: [{ id: null, name: 'All Files' }],
      })
      return
    }

    const idx = folderCrumbs.findIndex((c) => c.id === crumbId)
    const crumb = idx >= 0 ? folderCrumbs[idx] : null
    const newCrumbs =
      idx >= 0
        ? folderCrumbs.slice(0, idx + 1)
        : [{ id: null, name: 'All Files' }, { id: crumbId, name: '...' }]

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
