'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Upload,
  FileEdit,
  X,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useDialogStore } from '@/stores/dialog-store'
import { useUploadStore } from '@/stores/upload-store'
import { SidebarDrivesSection } from './sidebar-drives-section'
import { SidebarStorageWidget } from './sidebar-storage-widget'

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
  const isMobileOpen = useUIStore((state) => state.isMobileSidebarOpen)
  const setMobileOpen = useUIStore((state) => state.setMobileSidebarOpen)
  const openDialog = useDialogStore((state) => state.openDialog)
  const addFiles = useUploadStore((state) => state.addFiles)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleNavClick = () => {
    if (isMobileOpen) setMobileOpen(false)
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

                <DropdownMenu.Item
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink-2 hover:text-ink hover:bg-surface-2 cursor-pointer outline-none transition-colors"
                >
                  <Upload className="h-4 w-4 text-accent" />
                  <span>File upload</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() =>
                    openDialog('editor', {
                      initialTitle: 'Untitled Document.md',
                      initialContent: '# Untitled Document\n\nStart writing here...',
                    })
                  }
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink-2 hover:text-ink hover:bg-surface-2 cursor-pointer outline-none transition-colors"
                >
                  <FileEdit className="h-4 w-4 text-accent" />
                  <span>New document</span>
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

          {/* Hidden File Input for Native File Selection */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                addFiles(Array.from(e.target.files))
                e.target.value = ''
              }
            }}
          />
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
        <SidebarDrivesSection onSelectAccount={handleNavClick} />
      </div>

      {/* Aggregated Storage Pool Meter */}
      <SidebarStorageWidget onNavigate={handleNavClick} />
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
