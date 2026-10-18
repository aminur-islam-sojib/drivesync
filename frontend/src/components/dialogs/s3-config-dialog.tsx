'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Database, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useDialogStore } from '@/stores/dialog-store'
import { useAccountStore } from '@/stores/account-store'
import { api, formatApiError } from '@/lib/api'

export function S3ConfigDialog() {
  const activeDialog = useDialogStore((state) => state.activeDialog)
  const closeDialog = useDialogStore((state) => state.closeDialog)
  const fetchAccountsAndStorage = useAccountStore((state) => state.fetchAccountsAndStorage)

  const isOpen = activeDialog === 's3-config'

  const [name, setName] = React.useState('')
  const [bucket, setBucket] = React.useState('')
  const [region, setRegion] = React.useState('us-east-1')
  const [endpoint, setEndpoint] = React.useState('')
  const [accessKeyId, setAccessKeyId] = React.useState('')
  const [secretAccessKey, setSecretAccessKey] = React.useState('')
  const [forcePathStyle, setForcePathStyle] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name || !bucket || !region || !accessKeyId || !secretAccessKey) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    setIsLoading(true)

    try {
      await api.post('/connected-accounts/s3', {
        name: name.trim(),
        bucket: bucket.trim(),
        region: region.trim(),
        endpoint: endpoint.trim() || undefined,
        accessKeyId: accessKeyId.trim(),
        secretAccessKey: secretAccessKey.trim(),
        forcePathStyle,
      })

      toast.success(`Connected S3 bucket "${bucket}" successfully!`)
      await fetchAccountsAndStorage()
      closeDialog()

      // Reset form
      setName('')
      setBucket('')
      setEndpoint('')
      setAccessKeyId('')
      setSecretAccessKey('')
      setForcePathStyle(false)
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to connect S3 bucket. Verify credentials.')
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs animate-in fade-in duration-150" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-pop text-ink animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-ink">
                  Connect S3 Storage
                </Dialog.Title>
                <Dialog.Description className="text-xs text-ink-2 mt-0.5">
                  AWS S3, Cloudflare R2, MinIO, or Wasabi compatible bucket
                </Dialog.Description>
              </div>
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

          {/* Error Alert */}
          {errorMessage && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-danger/25 bg-danger/5 p-3 text-xs text-danger">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-danger" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-ink-2 mb-1">Display Label *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AWS Production Assets"
                className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-ink placeholder:text-ink-3 focus:border-accent focus:bg-surface focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-ink-2 mb-1">Bucket Name *</label>
                <input
                  type="text"
                  required
                  value={bucket}
                  onChange={(e) => setBucket(e.target.value)}
                  placeholder="my-bucket-name"
                  className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-ink placeholder:text-ink-3 focus:border-accent focus:bg-surface focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-medium text-ink-2 mb-1">Region *</label>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="us-east-1"
                  className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-ink placeholder:text-ink-3 focus:border-accent focus:bg-surface focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-ink-2 mb-1">
                Custom Endpoint (Optional)
              </label>
              <input
                type="url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://<account-id>.r2.cloudflarestorage.com"
                className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-ink placeholder:text-ink-3 focus:border-accent focus:bg-surface focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium text-ink-2 mb-1">Access Key ID *</label>
              <input
                type="text"
                required
                value={accessKeyId}
                onChange={(e) => setAccessKeyId(e.target.value)}
                placeholder="AKIAIOSFODNN7EXAMPLE"
                className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-ink placeholder:text-ink-3 focus:border-accent focus:bg-surface focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-ink-2 mb-1">Secret Access Key *</label>
              <input
                type="password"
                required
                value={secretAccessKey}
                onChange={(e) => setSecretAccessKey(e.target.value)}
                placeholder="••••••••••••••••••••••••"
                className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-ink placeholder:text-ink-3 focus:border-accent focus:bg-surface focus:outline-none transition-colors font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="forcePathStyle"
                checked={forcePathStyle}
                onChange={(e) => setForcePathStyle(e.target.checked)}
                className="h-4 w-4 rounded text-accent cursor-pointer"
              />
              <label htmlFor="forcePathStyle" className="text-xs text-ink-2 cursor-pointer">
                Use path-style URLs (Required for MinIO and some custom S3 proxies)
              </label>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-line">
              <button
                type="button"
                onClick={closeDialog}
                disabled={isLoading}
                className="h-10 rounded-xl border border-line bg-surface px-4 font-semibold text-ink-2 hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-accent px-5 font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Validating & Connecting...</span>
                  </>
                ) : (
                  <span>Connect S3 Bucket</span>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

