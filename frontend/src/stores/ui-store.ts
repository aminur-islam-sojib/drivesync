import { create } from 'zustand'

export type ViewMode = 'grid' | 'list'
export type InfoTab = 'details' | 'activity'
export type SelectedItemType = 'file' | 'folder' | null

interface UIState {
  viewMode: ViewMode
  isSidebarCollapsed: boolean
  isMobileSidebarOpen: boolean
  isInfoDrawerOpen: boolean
  activeInfoTab: InfoTab
  selectedItemId: string | null
  selectedItemType: SelectedItemType

  setViewMode: (mode: ViewMode) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  toggleInfoDrawer: () => void
  setInfoDrawerOpen: (open: boolean) => void
  setActiveInfoTab: (tab: InfoTab) => void
  setSelectedItem: (id: string | null, type?: SelectedItemType) => void
  clearSelection: () => void
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'grid',
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  isInfoDrawerOpen: false,
  activeInfoTab: 'details',
  selectedItemId: null,
  selectedItemType: null,

  setViewMode: (viewMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('drivesync_view_mode', viewMode)
    }
    set({ viewMode })
  },

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
  setMobileSidebarOpen: (isMobileSidebarOpen) => set({ isMobileSidebarOpen }),

  toggleInfoDrawer: () => set((state) => ({ isInfoDrawerOpen: !state.isInfoDrawerOpen })),
  setInfoDrawerOpen: (isInfoDrawerOpen) => set({ isInfoDrawerOpen }),
  setActiveInfoTab: (activeInfoTab) => set({ activeInfoTab }),

  setSelectedItem: (id, type = null) =>
    set({
      selectedItemId: id,
      selectedItemType: type,
      // Automatically open drawer if an item is selected
      isInfoDrawerOpen: Boolean(id),
    }),

  clearSelection: () =>
    set({
      selectedItemId: null,
      selectedItemType: null,
    }),
}))

