'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle, HardDrive } from 'lucide-react'

function GoogleConnectedContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status') || 'success'
  const message = searchParams.get('message')

  React.useEffect(() => {
    // Notify parent window that secondary Google Drive account was connected
    if (typeof window !== 'undefined' && window.opener) {
      try {
        window.opener.postMessage(
          {
            type: 'GOOGLE_CONNECTED',
            status,
            message: message ? decodeURIComponent(message) : undefined,
          },
          window.location.origin
        )
      } catch {
        // Fallback for cross-origin boundary
        window.opener.postMessage(
          {
            type: 'GOOGLE_CONNECTED',
            status,
          },
          '*'
        )
      }

      // Automatically close the popup window after 600ms
      const timer = setTimeout(() => {
        window.close()
      }, 700)

      return () => clearTimeout(timer)
    }
  }, [status, message])

  const handleManualClose = () => {
    if (typeof window !== 'undefined') {
      window.close()
    }
  }

  const isSuccess = status === 'success'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-4 text-ink">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-7 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-ink shadow-sm mb-4">
          <HardDrive className="h-6 w-6" />
        </div>

        {isSuccess ? (
          <div>
            <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
            <h2 className="mt-3 text-base font-bold text-ink">Google Drive Connected!</h2>
            <p className="mt-1.5 text-xs text-ink-2">
              Your Google Drive account was linked successfully. This window will close automatically.
            </p>
          </div>
        ) : (
          <div>
            <AlertCircle className="mx-auto h-8 w-8 text-danger" />
            <h2 className="mt-3 text-base font-bold text-ink">Connection Failed</h2>
            <p className="mt-1.5 text-xs text-danger bg-danger/5 border border-danger/20 rounded-xl p-2.5">
              {message ? decodeURIComponent(message) : 'Could not link the requested Google account.'}
            </p>
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={handleManualClose}
            className="w-full rounded-xl border border-line bg-surface-2 py-2 text-xs font-semibold text-ink hover:bg-surface transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GoogleConnectedPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <GoogleConnectedContent />
    </React.Suspense>
  )
}

