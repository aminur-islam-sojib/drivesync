import { create } from 'zustand'
import type { User } from '@/lib/types'

const ACCESS_TOKEN_KEY = 'drivesync_access_token'
const REFRESH_TOKEN_KEY = 'drivesync_refresh_token'
const USER_KEY = 'drivesync_user'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean

  setAuth: (payload: { user: User; accessToken: string; refreshToken: string }) => void
  setAccessToken: (accessToken: string) => void
  setUser: (user: User) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: ({ user, accessToken, refreshToken }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isHydrated: true,
    })
  },

  setAccessToken: (accessToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    }
    set({ accessToken })
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
    set({ user })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: true,
    })
  },

  hydrate: () => {
    if (typeof window === 'undefined') return
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      const storedUser = localStorage.getItem(USER_KEY)
      const user = storedUser ? (JSON.parse(storedUser) as User) : null

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: Boolean(accessToken && user),
        isHydrated: true,
      })
    } catch {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isHydrated: true,
      })
    }
  },
}))

