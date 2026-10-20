'use client'

import * as React from 'react'
import { Zap, RefreshCw, ListOrdered, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { api, formatApiError } from '@/lib/api'
import type { UploadRoutingPolicy } from '@/lib/types'

const POLICIES = [
  {
    mode: 'most_available' as const,
    title: 'Most Free Space (Recommended)',
    description:
      'Incoming uploads automatically target the Google Drive with the largest available quota.',
    icon: Zap,
    badge: 'Smart Auto-Route',
  },
  {
    mode: 'round_robin' as const,
    title: 'Round Robin',
    description:
      'Distributes files sequentially across all connected drives to balance quota usage evenly.',
    icon: RefreshCw,
    badge: 'Balanced',
  },
  {
    mode: 'priority' as const,
    title: 'Priority Fill',
    description:
      'Fills your primary Google Drive first, then overflows to secondary drives when full.',
    icon: ListOrdered,
    badge: 'Sequential',
  },
]

export function RoutingPolicyCard() {
  const [policy, setPolicy] = React.useState<UploadRoutingPolicy | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUpdating, setIsUpdating] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true

    async function fetchPolicy() {
      try {
        const res = await api.get<{ policy: UploadRoutingPolicy }>('/storage/routing-policy')
        if (isMounted && res.data?.policy) {
          setPolicy(res.data.policy)
        }
      } catch {
        // Fallback default
        if (isMounted) {
          setPolicy({
            id: 'default',
            userId: 'me',
            mode: 'most_available',
            priorityAccountIds: [],
          })
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchPolicy()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSelectMode = async (mode: 'most_available' | 'round_robin' | 'priority') => {
    if (policy?.mode === mode || isUpdating) return
    setIsUpdating(true)

    try {
      const res = await api.patch<{ policy: UploadRoutingPolicy }>('/storage/routing-policy', {
        mode,
      })
      if (res.data?.policy) {
        setPolicy(res.data.policy)
        toast.success(`Upload routing strategy updated to "${mode.replace('_', ' ')}".`)
      }
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to update upload routing policy.')
      toast.error(msg)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-6 flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 sm:p-7 space-y-4 shadow-xs select-none">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-3">
          Upload Routing Strategy
        </h2>
        <p className="text-xs text-ink-2 mt-0.5">
          Controls how DriveSync allocates multi-account storage during drag-and-drop uploads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {POLICIES.map((p) => {
          const isSelected = policy?.mode === p.mode
          const Icon = p.icon

          return (
            <button
              key={p.mode}
              type="button"
              onClick={() => handleSelectMode(p.mode)}
              disabled={isUpdating}
              className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-accent bg-accent-soft/30 shadow-xs ring-1 ring-accent/30'
                  : 'border-line bg-surface-2 hover:bg-surface hover:border-line-strong'
              } disabled:opacity-50`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isSelected ? 'bg-accent text-accent-ink' : 'bg-surface text-ink-2 border border-line'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-accent">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-ink-3 bg-surface px-2 py-0.5 rounded-full border border-line/60">
                      {p.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold text-ink">{p.title}</h3>
                <p className="text-[11px] text-ink-2 mt-1 leading-relaxed">{p.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

