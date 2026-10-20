'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X,
  HardDrive,
  Database,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDialogStore } from '@/stores/dialog-store'
import { useAccountStore } from '@/stores/account-store'
import { api, formatApiError } from '@/lib/api'
import { formatBytes } from '@/lib/utils'

export function ConnectedAccountsModal() {
  const activeDialog = useDialogStore((state) => state.activeDialog)
  const closeDialog = useDialogStore((state) => state.closeDialog)
  const openDialog = useDialogStore((state) => state.openDialog)

  const connectedAccounts = useAccountStore((state) => state.connectedAccounts)
  const fetchAccountsAndStorage = useAccountStore((state) => state.fetchAccountsAndStorage)

  const [isConnectingGoogle, setIsConnectingGoogle] = React.useState(false)
  const [syncingAccountId, setSyncingAccountId] = React.useState<string | null>(null)
  const [deletingAccountId, setDeletingAccountId] = React.useState<string | null>(null)

  const isOpen = activeDialog === 'connect-drive'

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true)
    try {
      const res = await api.get('/connected-accounts/google/connect-url')
      if (res.data?.url) {
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
        throw new Error('Google OAuth connect URL was not returned by server.')
      }
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to launch Google Drive authentication.')
      toast.error(msg)
    } finally {
      setIsConnectingGoogle(false)
    }
  }

  const handleSyncQuota = async (id: string) => {
    setSyncingAccountId(id)
    try {
      await api.post(`/connected-accounts/${id}/sync-quota`)
      await fetchAccountsAndStorage()
      toast.success('Quota updated from provider.')
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to sync quota.')
      toast.error(msg)
    } finally {
      setSyncingAccountId(null)
    }
  }

  const handleDisconnect = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to disconnect ${name}? Your files on the cloud will remain intact.`)) {
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs animate-in fade-in duration-150" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-pop text-ink animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <Dialog.Title className="text-lg font-bold text-ink">
                Connected Drives
              </Dialog.Title>
              <Dialog.Description className="text-xs text-ink-2 mt-0.5">
                Aggregate multiple Google accounts and S3 buckets into one unified pool
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 py-4 border-b border-line">
            <button
              type="button"
              onClick={handleConnectGoogle}
              disabled={isConnectingGoogle}
              className="flex-1 flex h-10 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {isConnectingGoogle ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 stroke-[2.5]" />
              )}
              <span>+ Connect Google Drive</span>
            </button>

            <button
              type="button"
              onClick={() => openDialog('s3-config')}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-4 text-xs font-semibold text-ink hover:bg-surface transition-colors cursor-pointer"
            >
              <Database className="h-4 w-4 text-amber-500" />
              <span>Connect S3 Bucket</span>
            </button>
          </div>

          {/* Connected Accounts List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {connectedAccounts.length === 0 ? (
              <div className="py-12 text-center text-ink-3">
                <HardDrive className="h-10 w-10 mx-auto opacity-30 text-accent mb-2" />
                <p className="text-xs font-bold text-ink">No drives connected</p>
                <p className="text-[11px] text-ink-3 mt-1 max-w-xs mx-auto">
                  Click the button above to link your first Google Drive account.
                </p>
              </div>
            ) : (
              connectedAccounts.map((account) => {
                const accUsed = Number(account.storageAccount?.usedBytes || 0)
                const accTotal = Number(account.storageAccount?.totalBytes || 15 * 1024 * 1024 * 1024)
                const accPercent =
                  accTotal > 0 ? Math.min(100, Math.round((accUsed / accTotal) * 100)) : 0
                const isSyncing = syncingAccountId === account.id
                const isDeleting = deletingAccountId === account.id
                const isError = account.status === 'error'

                return (
                  <div
                    key={account.id}
                    className="rounded-2xl border border-line bg-surface-2 p-4 space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 truncate">
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

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold mr-1 ${
                            isError ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                          }`}
                        >
                          {isError ? (
                            <>
                              <AlertTriangle className="h-3 w-3" />
                              <span>Error</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Connected</span>
                            </>
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleSyncQuota(account.id)}
                          disabled={isSyncing}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-40"
                          title="Sync Quota"
                        >
                          <RefreshCw
                            className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-accent' : ''}`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDisconnect(account.id, account.displayName || account.email)
                          }
                          disabled={isDeleting}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-danger hover:bg-danger/10 transition-colors cursor-pointer disabled:opacity-40"
                          title="Disconnect Account"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mini Quota Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-medium text-ink-2">
                        <span>{formatBytes(accUsed)} used</span>
                        <span className="text-ink-3">{formatBytes(accTotal)}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-surface-container-high overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${accPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

