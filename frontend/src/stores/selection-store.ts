import { create } from 'zustand'

export type SelectedType = 'file' | 'folder'

interface SelectionState {
  selectedFileIds: string[]
  selectedFolderIds: string[]
  activeItem: { id: string; type: SelectedType } | null

  selectItem: (id: string, type: SelectedType, isMulti?: boolean) => void
  toggleFile: (id: string) => void
  toggleFolder: (id: string) => void
  selectAll: (fileIds: string[], folderIds?: string[]) => void
  clearSelection: () => void
  isSelected: (id: string) => boolean
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedFileIds: [],
  selectedFolderIds: [],
  activeItem: null,

  selectItem: (id, type, isMulti = false) => {
    if (isMulti) {
      if (type === 'file') {
        const exists = get().selectedFileIds.includes(id)
        set({
          selectedFileIds: exists
            ? get().selectedFileIds.filter((item) => item !== id)
            : [...get().selectedFileIds, id],
          activeItem: exists ? null : { id, type },
        })
      } else {
        const exists = get().selectedFolderIds.includes(id)
        set({
          selectedFolderIds: exists
            ? get().selectedFolderIds.filter((item) => item !== id)
            : [...get().selectedFolderIds, id],
          activeItem: exists ? null : { id, type },
        })
      }
    } else {
      set({
        selectedFileIds: type === 'file' ? [id] : [],
        selectedFolderIds: type === 'folder' ? [id] : [],
        activeItem: { id, type },
      })
    }
  },

  toggleFile: (id) => {
    const { selectedFileIds } = get()
    const exists = selectedFileIds.includes(id)
    set({
      selectedFileIds: exists
        ? selectedFileIds.filter((item) => item !== id)
        : [...selectedFileIds, id],
      activeItem: exists ? null : { id, type: 'file' },
    })
  },

  toggleFolder: (id) => {
    const { selectedFolderIds } = get()
    const exists = selectedFolderIds.includes(id)
    set({
      selectedFolderIds: exists
        ? selectedFolderIds.filter((item) => item !== id)
        : [...selectedFolderIds, id],
      activeItem: exists ? null : { id, type: 'folder' },
    })
  },

  selectAll: (fileIds, folderIds = []) => {
    set({
      selectedFileIds: [...fileIds],
      selectedFolderIds: [...folderIds],
      activeItem: fileIds.length > 0 ? { id: fileIds[0], type: 'file' } : null,
    })
  },

  clearSelection: () => {
    set({
      selectedFileIds: [],
      selectedFolderIds: [],
      activeItem: null,
    })
  },

  isSelected: (id) => {
    const { selectedFileIds, selectedFolderIds } = get()
    return selectedFileIds.includes(id) || selectedFolderIds.includes(id)
  },
}))
