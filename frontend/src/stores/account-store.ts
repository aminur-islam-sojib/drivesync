import { create } from 'zustand'
import type { ConnectedAccount, StorageSummary } from '@/lib/types'

interface AccountFilters {
  type?: string
  modified?: string
  search?: string
}

interface AccountState {
  connectedAccounts: ConnectedAccount[]
  selectedAccountId: string | null // null = All Accounts
  storageSummary: StorageSummary | null
  filters: AccountFilters

  setConnectedAccounts: (accounts: ConnectedAccount[]) => void
  setSelectedAccountId: (id: string | null) => void
  setStorageSummary: (summary: StorageSummary | null) => void
  setFilter: (key: keyof AccountFilters, value: string | undefined) => void
  resetFilters: () => void
}

export const useAccountStore = create<AccountState>((set) => ({
  connectedAccounts: [],
  selectedAccountId: null,
  storageSummary: null,
  filters: {},

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
}))

