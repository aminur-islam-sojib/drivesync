'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useAccountStore } from '@/stores/account-store'
import { DashboardTopbar } from '@/components/layout/topbar'
import { DashboardSidebar } from '@/components/layout/sidebar'
import { FilterChipsBar } from '@/components/layout/filter-chips-bar'
import { InfoDrawer } from '@/components/layout/info-drawer'
import { DialogHost } from '@/components/dialogs/dialog-host'
import { UploadDropzone } from '@/components/uploads/upload-dropzone'
import { UploadTray } from '@/components/uploads/upload-tray'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const fetchAccountsAndStorage = useAccountStore((state) => state.fetchAccountsAndStorage)

  // 1. Authentication Protection Guard
  React.useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isHydrated, isAuthenticated, router, pathname])

  // 2. Fetch Connected Accounts & Storage Quota on Mount
  React.useEffect(() => {
    if (isAuthenticated) {
      fetchAccountsAndStorage()
    }
  }, [isAuthenticated, fetchAccountsAndStorage])

  // 3. Listen for Google Drive popup connection completion
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if applicable
      if (event.data?.type === 'GOOGLE_CONNECTED') {
        if (event.data.status === 'success') {
          toast.success('Google Drive connected successfully!')
          fetchAccountsAndStorage()
        } else {
          toast.error(event.data.message || 'Failed to connect Google Drive.')
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [fetchAccountsAndStorage])

  // If not hydrated yet or not authenticated, show smooth initial loader
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-xs font-medium text-ink-3">Loading your DriveSync workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-ink flex-col">
      {/* 1. Global App Bar (Topbar) */}
      <DashboardTopbar />

      {/* 2. Workspace Body: Sidebar + Main Content Container + Info Drawer */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Rail (Desktop & Mobile Drawer) */}
        <DashboardSidebar />

        {/* Main Stage: Material 3 Elevated Surface Container */}
        <div className="flex flex-1 flex-col overflow-hidden m-2 lg:ml-0 rounded-3xl bg-surface border border-line shadow-card">
          {/* Search Filter Chips Bar */}
          <FilterChipsBar />

          {/* Page View Stage */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Collapsible Info & Activity Drawer */}
        <InfoDrawer />
      </div>

      {/* 3. Central Dialogs & Modals Controller */}
      <DialogHost />

      {/* 4. Global Drag & Drop Overlay and Floating Upload Tray */}
      <UploadDropzone />
      <UploadTray />
    </div>
  )
}

