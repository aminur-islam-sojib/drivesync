'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  FolderPlus,
  Plus,
  HardDrive,
  Clock,
  Star,
  Users,
  Trash2,
  Activity,
  Settings,
  Database,
  CloudUpload,
  Layers,
  X,
} from 'lucide-react'
import { useAccountStore } from '@/stores/account-store'
import { useUIStore } from '@/stores/ui-store'
import { useDialogStore } from '@/stores/dialog-store'
import { formatBytes } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { label: 'All Files', href: '/all-files', icon: HardDrive },
  { label: 'Recent', href: '/recent', icon: Clock },
  { label: 'Starred', href: '/starred', icon: Star },
  { label: 'Shared', href: '/shared', icon: Users },
  { label: 'Trash', href: '/trash', icon: Trash2 },
  { label: 'Activity', href: '/activity', icon: Activity },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isMobileOpen = useUIStore((state) => state.isMobileSidebarOpen)
  const setMobileOpen = useUIStore((state) => state.setMobileSidebarOpen)
  const openDialog = useDialogStore((state) => state.openDialog)

  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)
  const selectedAccountId = useAccountStore((state) => state.selectedAccountId)
  const setSelectedAccountId = useAccountStore((state) => state.setSelectedAccountId)
  const storageSummary = useAccountStore((state) => state.storageSummary)

  const usedBytes = Number(storageSummary?.usedBytes || 0)
  const totalBytes = Number(storageSummary?.totalBytes || 0)
  const percentage = totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 100)) : 0

  const handleNavClick = () => {
    if (isMobileOpen) setMobileOpen(false)
  }

  const handleAccountFilter = (accountId: string | null) => {
    setSelectedAccountId(accountId)
    if (pathname !== '/all-files') {
      router.push('/all-files')
    }
    handleNavClick()
  }

  const content = (
    <div className="flex h-full flex-col justify-between p-4 overflow-y-auto select-none">
      <div className="space-y-6">
        {/* Mobile Header with Close Button */}
        <div className="lg:hidden flex items-center justify-between pb-2 border-b border-line">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink">
              <HardDrive className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-ink">DriveSync</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Google Drive Material 3 "+ New" Action Button */}
        <div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="group flex h-13 w-full sm:w-44 items-center justify-start gap-3 rounded-2xl bg-surface border border-line/60 px-4 shadow-md hover:shadow-lg hover:border-line active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-ink transition-colors">
                  <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
                </div>
                <span className="text-sm font-semibold text-ink">New</span>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={6}
                className="z-50 w-56 rounded-2xl border border-line bg-surface p-1.5 shadow-pop text-ink animate-in fade-in zoom-in-95 duration-150"
              >
                <DropdownMenu.Item
                  onClick={() => openDialog('new-folder')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink-2 hover:text-ink hover:bg-surface-2 cursor-pointer outline-none transition-colors"
                >
                  <FolderPlus className="h-4 w-4 text-accent" />
                  <span>New folder</span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-line my-1" />

                <DropdownMenu.Item
                  onClick={() => openDialog('connect-drive')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink-2 hover:text-ink hover:bg-surface-2 cursor-pointer outline-none transition-colors"
                >
                  <CloudUpload className="h-4 w-4 text-success" />
                  <span>Connect Google Drive</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => openDialog('s3-config')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink-2 hover:text-ink hover:bg-surface-2 cursor-pointer outline-none transition-colors"
                >
                  <Database className="h-4 w-4 text-amber-500" />
                  <span>Connect S3 Bucket</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Primary Navigation Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex h-10 items-center gap-3.5 rounded-full px-4 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-accent-soft text-accent font-semibold shadow-xs'
                    : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-accent' : 'text-ink-3'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Multi-Account Connected Section */}
        <div className="pt-2 border-t border-line/60">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              Drives ({connectedAccounts.length})
            </span>
            <button
              type="button"
              onClick={() => openDialog('connect-drive')}
              className="text-xs text-accent hover:underline cursor-pointer font-medium"
              title="Add another Google Drive"
            >
              + Add
            </button>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleAccountFilter(null)}
              className={`flex w-full items-center justify-between h-8 px-3 rounded-lg text-xs transition-colors cursor-pointer ${
                selectedAccountId === null
                  ? 'bg-accent-soft text-accent font-semibold'
                  : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">All Connected Drives</span>
              </div>
            </button>

            {connectedAccounts.map((account) => {
              const isSelected = selectedAccountId === account.id
              const isError = account.status === 'error'

              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleAccountFilter(account.id)}
                  className={`flex w-full items-center justify-between h-8 px-3 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-accent-soft text-accent font-semibold'
                      : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        isError ? 'bg-danger' : 'bg-success'
                      }`}
                    />
                    <span className="truncate">{account.displayName || account.email}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Aggregated Storage Pool Meter */}
      <div className="pt-4 border-t border-line/60">
        <Link
          href="/storage"
          onClick={handleNavClick}
          className="block rounded-2xl bg-surface-2 p-3.5 hover:bg-surface transition-all border border-line/40 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink group-hover:text-accent transition-colors">
              Storage Pool
            </span>
            <span className="text-[11px] font-bold text-ink-2">{percentage}%</span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-3">
            <span>
              {formatBytes(usedBytes)} of {formatBytes(totalBytes)}
            </span>
            <span className="text-accent group-hover:underline">Manage</span>
          </div>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Rail */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-canvas border-r border-line/40">
        {content}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-canvas h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  )
}
