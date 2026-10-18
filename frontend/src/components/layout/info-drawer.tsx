'use client'

import * as React from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import {
  X,
  HardDrive,
  Clock,
  FileText,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { useUIStore } from '@/stores/ui-store'
import { useAccountStore } from '@/stores/account-store'
import { formatBytes } from '@/lib/utils'

export function InfoDrawer() {
  const isOpen = useUIStore((state) => state.isInfoDrawerOpen)
  const setOpen = useUIStore((state) => state.setInfoDrawerOpen)
  const activeTab = useUIStore((state) => state.activeInfoTab)
  const setActiveTab = useUIStore((state) => state.setActiveInfoTab)
  const selectedItemId = useUIStore((state) => state.selectedItemId)

  const storageSummary = useAccountStore((state) => state.storageSummary)
  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)

  if (!isOpen) return null

  return (
    <aside className="hidden xl:flex w-80 shrink-0 flex-col bg-surface border-l border-line/40 h-full overflow-hidden select-none animate-in slide-in-from-right duration-200">
      <Tabs.Root
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'details' | 'activity')}
        className="flex flex-col h-full"
      >
        {/* Header with Tabs and Close Button */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-line/60">
          <Tabs.List className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl">
            <Tabs.Trigger
              value="details"
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              Details
            </Tabs.Trigger>
            <Tabs.Trigger
              value="activity"
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              Activity
            </Tabs.Trigger>
          </Tabs.List>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab 1: Details */}
        <Tabs.Content value="details" className="flex-1 overflow-y-auto p-5 outline-none space-y-6">
          {selectedItemId ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-2 border border-line">
                <FileText className="h-8 w-8 text-accent shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-bold text-ink truncate">Selected Item</p>
                  <p className="text-[11px] text-ink-3">ID: {selectedItemId}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-line/40">
                  <span className="text-ink-3">Type</span>
                  <span className="font-medium text-ink">Virtual Item</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-line/40">
                  <span className="text-ink-3">Modified</span>
                  <span className="font-medium text-ink">Just now</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent mb-3">
                  <HardDrive className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-ink">Unified Workspace</h3>
                <p className="text-xs text-ink-3 mt-1">
                  Select an item to view its details or manage your aggregate storage below.
                </p>
              </div>

              {/* Aggregated Quota Info */}
              <div className="rounded-2xl border border-line bg-surface-2 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">Connected Drives</span>
                  <span className="font-bold text-accent">{connectedAccounts.length}</span>
                </div>

                <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{
                      width: `${
                        storageSummary && Number(storageSummary.totalBytes) > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (Number(storageSummary.usedBytes) /
                                  Number(storageSummary.totalBytes)) *
                                  100
                              )
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-ink-3">
                  <span>Used: {formatBytes(storageSummary?.usedBytes || 0)}</span>
                  <span>Total: {formatBytes(storageSummary?.totalBytes || 0)}</span>
                </div>

                <Link
                  href="/storage"
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-accent hover:underline pt-1"
                >
                  <span>View Storage Breakdown</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Connected Accounts Quick List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Active Providers
                </h4>
                {connectedAccounts.length === 0 ? (
                  <p className="text-xs text-ink-3 italic">No external accounts connected yet.</p>
                ) : (
                  connectedAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-line/60 bg-surface text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 rounded-full bg-success shrink-0" />
                        <span className="truncate text-ink font-medium">
                          {acc.displayName || acc.email}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-ink-3">
                        {acc.provider === 'google_drive' ? 'Google' : 'S3'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </Tabs.Content>

        {/* Tab 2: Activity */}
        <Tabs.Content value="activity" className="flex-1 overflow-y-auto p-5 outline-none">
          <div className="flex flex-col items-center justify-center h-48 text-center text-ink-3">
            <Clock className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-xs font-medium">No recent actions recorded.</p>
            <p className="text-[11px] mt-1">
              File uploads, moves, and shares will appear here in chronological order.
            </p>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </aside>
  )
}
