'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Share2,
  Copy,
  Check,
  Eye,
  Trash2,
  ExternalLink,
  Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import { api, formatApiError } from '@/lib/api'
import { FileItem } from '@/lib/types'
import { formatBytes, formatDate } from '@/lib/utils'
import { useDialogStore } from '@/stores/dialog-store'
import { FileTypeIcon } from '@/components/files/file-type-icon'

interface ShareItem {
  id: string
  url: string | null
  createdAt: string
  expiresAt: string | null
  file: FileItem
}

export default function SharedPage() {
  const [shares, setShares] = React.useState<ShareItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const openDialog = useDialogStore((state) => state.openDialog)

  const [refreshIndex, setRefreshIndex] = React.useState(0)
  const triggerRefresh = () => setRefreshIndex((v) => v + 1)

  React.useEffect(() => {
    let isMounted = true

    async function fetchShares() {
      try {
        const res = await api.get('/files/shared-links')
        if (isMounted) {
          setShares(res.data?.shares || [])
          setIsLoading(false)
        }
      } catch (err: unknown) {
        if (isMounted) {
          toast.error(formatApiError(err, 'Failed to load shared links.'))
          setIsLoading(false)
        }
      }
    }

    void fetchShares()

    const handleRefresh = () => triggerRefresh()
    window.addEventListener('drivesync-refresh-items', handleRefresh)
    return () => {
      isMounted = false
      window.removeEventListener('drivesync-refresh-items', handleRefresh)
    }
  }, [refreshIndex])

  const handleCopy = async (share: ShareItem) => {
    if (!share.url) return
    try {
      await navigator.clipboard.writeText(share.url)
      setCopiedId(share.id)
      toast.success('Public link copied to clipboard!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Failed to copy to clipboard.')
    }
  }

  const handleRevoke = async (fileId: string) => {
    if (!confirm('Revoke this public link? Anyone with this link will no longer be able to access the file.')) {
      return
    }

    try {
      await api.delete(`/files/${fileId}/share`)
      toast.success('Public share link revoked.')
      triggerRefresh()
    } catch (err: unknown) {
      toast.error(formatApiError(err, 'Failed to revoke share link.'))
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/40 select-none">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-3">
            <Link href="/all-files" className="hover:text-ink transition-colors">
              DriveSync
            </Link>
            <span>&gt;</span>
            <span className="text-ink font-semibold">Shared</span>
          </nav>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-ink">
            Public Share Links
          </h1>
        </div>
      </div>

      {/* Shares List */}
      <section className="space-y-3" aria-label="Public Shares">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-surface-2 animate-pulse border border-line"
              />
            ))}
          </div>
        ) : shares.length > 0 ? (
          <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs select-none">
              <thead className="bg-surface-2 border-b border-line text-ink-3">
                <tr>
                  <th className="px-4 py-3 font-semibold">File</th>
                  <th className="hidden sm:table-cell px-4 py-3 font-semibold">Size</th>
                  <th className="hidden md:table-cell px-4 py-3 font-semibold">Shared On</th>
                  <th className="hidden lg:table-cell px-4 py-3 font-semibold">Public Link</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {shares.map((share) => (
                  <tr key={share.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">
                      <div className="flex items-center gap-2.5 truncate max-w-xs sm:max-w-md">
                        <FileTypeIcon
                          name={share.file.name}
                          mimeType={share.file.mimeType}
                          className="h-4 w-4 shrink-0"
                        />
                        <span className="truncate">{share.file.name}</span>
                      </div>
                    </td>

                    <td className="hidden sm:table-cell px-4 py-3 text-ink-3 font-mono">
                      {formatBytes(Number(share.file.sizeBytes || 0))}
                    </td>

                    <td className="hidden md:table-cell px-4 py-3 text-ink-3">
                      {formatDate(share.createdAt)}
                    </td>

                    <td className="hidden lg:table-cell px-4 py-3 text-ink-3 font-mono text-[11px] truncate max-w-xs">
                      {share.url ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <Globe className="h-3 w-3 text-accent shrink-0" />
                          <span className="truncate">{share.url}</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {share.url && (
                          <button
                            type="button"
                            onClick={() => handleCopy(share)}
                            className="flex h-7 px-2 items-center gap-1 rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink text-[11px] font-medium transition-colors cursor-pointer"
                            title="Copy Link"
                          >
                            {copiedId === share.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-success" />
                                <span className="hidden sm:inline">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Copy</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openDialog('file-preview', { file: share.file })}
                          className="flex h-7 px-2 items-center gap-1 rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink text-[11px] font-medium transition-colors cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5 text-accent" />
                          <span className="hidden sm:inline">Preview</span>
                        </button>

                        {share.url && (
                          <a
                            href={share.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-7 px-2 items-center gap-1 rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink text-[11px] font-medium transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRevoke(share.file.id)}
                          className="flex h-7 px-2 items-center gap-1 rounded-lg text-danger hover:bg-danger/10 text-[11px] font-medium transition-colors cursor-pointer"
                          title="Revoke Share Link"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-ink-3 border border-dashed border-line rounded-3xl bg-surface/50">
            <Share2 className="h-10 w-10 mb-2 opacity-30 text-accent" />
            <p className="text-xs font-semibold text-ink">No active public share links</p>
            <p className="text-[11px] max-w-xs mt-1 text-ink-3">
              Right-click any file in your workspace and choose &quot;Share &amp; Public Link&quot;
              to generate secure public links.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
