import { create } from 'zustand'
import type { ConnectedAccount, StorageSummary } from '@/lib/types'
import { api } from '@/lib/api'

export type FilterType =
  | 'folder'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'

export type FilterModified = 'today' | '7d' | '30d' | 'year'

export interface AccountFilters {
  type?: FilterType
  modified?: FilterModified
  search?: string
}

interface AccountState {
  connectedAccounts: ConnectedAccount[]
  selectedAccountId: string | null // null = All Accounts
  storageSummary: StorageSummary | null
  filters: AccountFilters
  isLoading: boolean
  lastSyncedAt: Date | null

  setConnectedAccounts: (accounts: ConnectedAccount[]) => void
  setSelectedAccountId: (id: string | null) => void
  setStorageSummary: (summary: StorageSummary | null) => void
  setFilter: (key: keyof AccountFilters, value: string | undefined) => void
  resetFilters: () => void
  fetchAccountsAndStorage: () => Promise<void>
}

export const useAccountStore = create<AccountState>((set) => ({
  connectedAccounts: [],
  selectedAccountId: null,
  storageSummary: null,
  filters: {},
  isLoading: false,
  lastSyncedAt: null,

  setConnectedAccounts: (connectedAccounts) => set({ connectedAccounts }),
  setSelectedAccountId: (selectedAccountId) => set({ selectedAccountId }),
  setStorageSummary: (storageSummary) => set({ storageSummary }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),

  resetFilters: () => set({ filters: {} }),

  fetchAccountsAndStorage: async () => {
    set({ isLoading: true })
    try {
      const [accountsRes, summaryRes] = await Promise.allSettled([
        api.get<{ accounts: ConnectedAccount[] }>('/connected-accounts'),
        api.get<StorageSummary>('/storage/summary'),
      ])

      const accounts =
        accountsRes.status === 'fulfilled' && accountsRes.value.data?.accounts
          ? accountsRes.value.data.accounts
          : []

      const summary =
        summaryRes.status === 'fulfilled' && summaryRes.value.data
          ? summaryRes.value.data
          : null

      set({
        connectedAccounts: accounts,
        storageSummary: summary,
        lastSyncedAt: new Date(),
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },
}))
