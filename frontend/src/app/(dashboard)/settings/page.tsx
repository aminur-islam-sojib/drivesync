'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  HardDrive,
  Database,
  Trash2,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useAccountStore } from '@/stores/account-store'
import { useDialogStore } from '@/stores/dialog-store'
import { api, formatApiError } from '@/lib/api'
import { RoutingPolicyCard } from '@/components/accounts/routing-policy-card'

export default function SettingsPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)
  const fetchAccountsAndStorage = useAccountStore((state) => state.fetchAccountsAndStorage)
  const openDialog = useDialogStore((state) => state.openDialog)

  const [isConnecting, setIsConnecting] = React.useState(false)
  const [syncingAccountId, setSyncingAccountId] = React.useState<string | null>(null)
  const [deletingAccountId, setDeletingAccountId] = React.useState<string | null>(null)

  const handleConnectGoogle = async () => {
    setIsConnecting(true)
    try {
      const res = await api.get('/connected-accounts/google/connect-url')
      if (res.data?.url) {
        // Open Google OAuth in a popup window
        const width = 500
        const height = 650
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2
        window.open(
          res.data.url,
          'google-connect-popup',
          `width=${width},height=${height},left=${left},top=${top}`
        )
      } else {
        throw new Error('Google OAuth connection URL was not returned.')
      }
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to initiate Google Drive connection.')
      toast.error(msg)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSyncQuota = async (id: string) => {
    setSyncingAccountId(id)
    try {
      await api.post(`/connected-accounts/${id}/sync-quota`)
      await fetchAccountsAndStorage()
      toast.success('Quota synchronized successfully.')
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to synchronize quota.')
      toast.error(msg)
    } finally {
      setSyncingAccountId(null)
    }
  }

  const handleDisconnect = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to disconnect ${name}? Your files on Google Drive will not be deleted.`)) {
      return
    }

    setDeletingAccountId(id)
    try {
      await api.delete(`/connected-accounts/${id}`)
      await fetchAccountsAndStorage()
      toast.success(`Disconnected ${name}.`)
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to disconnect account.')
      toast.error(msg)
    } finally {
      setDeletingAccountId(null)
    }
  }

  const handleSignOut = () => {
    logout()
    router.replace('/login')
  }

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-line/40 select-none">
        <div className="flex items-center gap-2 text-xs text-ink-3">
          <span>DriveSync</span>
          <span>&gt;</span>
          <span className="text-ink font-medium">Settings</span>
        </div>
        <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-ink">
          Workspace Settings
        </h1>
      </div>

      {/* Profile Section */}
      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-7 space-y-4 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-3">User Profile</h2>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-ink font-bold text-lg shadow-sm">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="truncate">
            <p className="text-sm font-bold text-ink">{user?.name || 'DriveSync User'}</p>
            <p className="text-xs text-ink-2">{user?.email}</p>
          </div>
        </div>
      </section>

      {/* Connected Accounts Section */}
      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              Connected Drives ({connectedAccounts.length})
            </h2>
            <p className="text-xs text-ink-2 mt-0.5">
              Manage your connected Google accounts and S3 storage endpoints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openDialog('s3-config')}
              className="flex h-9 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-xs font-semibold text-ink shadow-2xs hover:bg-surface-2 transition-all cursor-pointer"
            >
              <Database className="h-3.5 w-3.5 text-amber-500" />
              <span>Connect S3</span>
            </button>
            <button
              type="button"
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              className="flex h-9 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Connect Google Drive</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {connectedAccounts.length === 0 ? (
            <p className="text-xs text-ink-3 italic py-4">No external accounts connected yet.</p>
          ) : (
            connectedAccounts.map((account) => {
              const isSyncing = syncingAccountId === account.id
              const isDeleting = deletingAccountId === account.id

              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-line bg-surface-2 transition-all"
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-line">
                      {account.provider === 'google_drive' ? (
                        <HardDrive className="h-5 w-5 text-accent" />
                      ) : (
                        <Database className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-ink truncate">
                        {account.displayName || account.email}
                      </p>
                      <p className="text-[11px] text-ink-3 truncate">{account.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSyncQuota(account.id)}
                      disabled={isSyncing}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-40"
                      title="Sync Quota"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-accent' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDisconnect(account.id, account.displayName || account.email)}
                      disabled={isDeleting}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-danger hover:bg-danger/10 transition-colors cursor-pointer disabled:opacity-40"
                      title="Disconnect Account"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* Upload Routing Policy */}
      <RoutingPolicyCard />

      {/* Security & Sign Out */}
      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-7 space-y-4 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-3">Security & Session</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-success" />
            <div>
              <p className="text-xs font-bold text-ink">AES-256 Token Encryption</p>
              <p className="text-[11px] text-ink-3">All OAuth tokens are encrypted at rest with bank-grade AES-256-GCM.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-9 items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 text-xs font-semibold text-danger hover:bg-danger/15 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>
    </div>
  )
}
