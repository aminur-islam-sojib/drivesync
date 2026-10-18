'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  Search,
  X,
  SlidersHorizontal,
  CloudCheck,
  Info,
  Sun,
  Moon,
  Menu,
  LogOut,
  Settings,
  HardDrive,
  Database,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useAccountStore } from '@/stores/account-store'
import { useUIStore } from '@/stores/ui-store'
import { formatBytes } from '@/lib/utils'

function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains('dark')
}

function getServerSnapshot() {
  return false
}

export function DashboardTopbar() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const isDark = React.useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot)
  const toggleMobileSidebar = () => useUIStore.getState().setMobileSidebarOpen(true)
  const isInfoDrawerOpen = useUIStore((state) => state.isInfoDrawerOpen)
  const toggleInfoDrawer = useUIStore((state) => state.toggleInfoDrawer)

  const searchQuery = useAccountStore((state) => state.filters.search || '')
  const setFilter = useAccountStore((state) => state.setFilter)
  const storageSummary = useAccountStore((state) => state.storageSummary)
  const isLoading = useAccountStore((state) => state.isLoading)
  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)

  const handleSearchChange = (val: string) => {
    setFilter('search', val || undefined)
  }

  const handleClearSearch = () => {
    setFilter('search', undefined)
  }

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  const handleSignOut = () => {
    logout()
    router.replace('/login')
  }

  const userInitial = user?.name ? user.name[0].toUpperCase() : 'U'

  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between gap-4 px-4 sm:px-6 bg-canvas border-b border-line/40 select-none">
      {/* Left: Mobile Menu & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 transition-colors cursor-pointer"
          aria-label="Open sidebar navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/all-files" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink shadow-sm">
            <HardDrive className="h-4.5 w-4.5" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-base font-bold tracking-tight text-ink leading-tight">
              Drive<span className="text-accent">Sync</span>
            </span>
            <span className="text-[10px] font-medium text-ink-3 tracking-wide uppercase">
              Unified Storage
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Google Drive Material 3 Search Pill */}
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="relative flex items-center w-full">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-ink-3">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search files and folders across all drives..."
            className="h-11 w-full rounded-full border border-transparent bg-surface-2 pl-10 pr-20 text-xs sm:text-sm text-ink placeholder:text-ink-3 transition-all focus:border-accent/40 focus:bg-surface focus:shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/15"
          />
          <div className="absolute right-3 flex items-center gap-1 text-ink-3">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-surface-container-high hover:text-ink transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-surface-container-high hover:text-ink transition-colors cursor-pointer"
              title="Search filters"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Cluster: Health, Info Drawer, Theme, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Realtime Sync Status Indicator */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-ink-2 bg-surface-2 border border-line/50"
          title={
            isLoading
              ? 'Synchronizing connected accounts...'
              : `${connectedAccounts.length} account(s) connected`
          }
        >
          {isLoading ? (
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          ) : (
            <CloudCheck className="h-3.5 w-3.5 text-success" />
          )}
          <span className="hidden md:inline text-[11px]">
            {connectedAccounts.length} {connectedAccounts.length === 1 ? 'Drive' : 'Drives'}
          </span>
        </div>

        {/* Toggle Info / Details Drawer */}
        <button
          type="button"
          onClick={toggleInfoDrawer}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors cursor-pointer ${
            isInfoDrawerOpen
              ? 'bg-accent-soft text-accent'
              : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
          }`}
          title="Toggle Details & Activity Drawer"
          aria-label="Toggle Details Drawer"
        >
          <Info className="h-4.5 w-4.5" />
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* User Profile Dropdown Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-ink font-semibold text-xs shadow-sm hover:opacity-90 transition-opacity cursor-pointer focus:outline-none ring-2 ring-accent/20"
              aria-label="User account menu"
            >
              {userInitial}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 w-64 rounded-2xl border border-line bg-surface p-2 shadow-pop text-ink animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-2.5 border-b border-line mb-1">
                <p className="text-xs font-bold text-ink truncate">{user?.name || 'DriveSync User'}</p>
                <p className="text-[11px] text-ink-2 truncate">{user?.email}</p>
                {storageSummary && (
                  <div className="mt-2 text-[10px] text-ink-3">
                    {formatBytes(storageSummary.usedBytes)} of {formatBytes(storageSummary.totalBytes)} used
                  </div>
                )}
              </div>

              <DropdownMenu.Item
                onClick={() => router.push('/storage')}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink-2 hover:text-ink hover:bg-surface-2 cursor-pointer outline-none transition-colors"
              >
                <Database className="h-4 w-4" />
                <span>Storage & Quota</span>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={() => router.push('/settings')}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink-2 hover:text-ink hover:bg-surface-2 cursor-pointer outline-none transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings & Connected Accounts</span>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-line my-1" />

              <DropdownMenu.Item
                onClick={handleSignOut}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-danger hover:bg-danger/10 cursor-pointer outline-none transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
