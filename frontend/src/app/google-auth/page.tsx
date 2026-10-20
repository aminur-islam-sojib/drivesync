'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle, CheckCircle2, HardDrive, RefreshCw } from 'lucide-react'
import { api, formatApiError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

function GoogleAuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const statusParam = searchParams.get('status')
  const errorParam = searchParams.get('error')

  const initialErrorMessage = React.useMemo(() => {
    if (statusParam === 'error' || errorParam) {
      if (errorParam === 'access_denied') {
        return 'Google sign-in was cancelled by user.'
      }
      return 'Google authentication could not be completed. The authorization session may have expired.'
    }
    if (!token) {
      return 'No authentication token provided.'
    }
    return null
  }, [statusParam, errorParam, token])

  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>(
    initialErrorMessage ? 'error' : 'loading'
  )
  const [errorMessage, setErrorMessage] = React.useState<string | null>(initialErrorMessage)
  const [isRetrying, setIsRetrying] = React.useState(false)

  const setAuth = useAuthStore((state) => state.setAuth)

  const handleRetryGoogle = async () => {
    setIsRetrying(true)
    try {
      const res = await api.get('/auth/google/url')
      if (res.data?.url) {
        window.location.href = res.data.url
      } else {
        throw new Error('Google sign-in URL was not returned by server.')
      }
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to connect to Google OAuth service.')
      toast.error(msg)
      setIsRetrying(false)
    }
  }

  React.useEffect(() => {
    // If there is an initial error or no token, don't attempt exchange
    if (initialErrorMessage || !token) {
      if (!token && !statusParam && !errorParam) {
        router.replace('/login')
      }
      return
    }

    // Exchange handoff token with backend
    let isMounted = true

    async function exchangeToken() {
      try {
        const res = await api.post('/auth/google/exchange', { token })
        if (res.data?.accessToken && res.data?.user) {
          if (!isMounted) return
          setAuth({
            user: res.data.user,
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          })
          setStatus('success')
          toast.success(`Welcome, ${res.data.user.name || 'User'}! Signed in with Google.`)

          // Smooth transition to dashboard
          setTimeout(() => {
            router.replace('/all-files')
          }, 500)
        } else {
          throw new Error('Invalid token exchange payload from server.')
        }
      } catch (err: unknown) {
        if (!isMounted) return
        setStatus('error')
        const msg = formatApiError(
          err,
          'Google authentication session expired or was already used. Please try again.'
        )
        setErrorMessage(msg)
        toast.error(msg)
      }
    }

    exchangeToken()

    return () => {
      isMounted = false
    }
  }, [token, statusParam, errorParam, initialErrorMessage, router, setAuth])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-4 text-ink">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-card animate-in fade-in duration-200">
        {/* Brand Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-ink shadow-sm mb-6">
          <HardDrive className="h-6 w-6" />
        </div>

        {status === 'loading' && (
          <div className="space-y-3">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />
            <h2 className="text-lg font-bold text-ink">Signing you into DriveSync...</h2>
            <p className="text-xs text-ink-2 max-w-sm mx-auto leading-relaxed">
              Verifying your Google credentials and initializing your unified workspace.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <CheckCircle2 className="mx-auto h-8 w-8 text-success animate-in zoom-in-75 duration-200" />
            <h2 className="text-lg font-bold text-ink">Authentication Successful!</h2>
            <p className="text-xs text-ink-2">
              Redirecting you to your files and storage dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="mx-auto h-8 w-8 text-danger" />
            <h2 className="text-lg font-bold text-ink">Authentication Failed</h2>
            <div className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-2xl p-3.5 leading-relaxed text-left">
              {errorMessage}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleRetryGoogle}
                disabled={isRetrying}
                className="flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-accent px-5 text-xs font-semibold text-accent-ink shadow-sm hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isRetrying ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                <span>Try Google Again</span>
              </button>
              <Link
                href="/login"
                className="flex h-10 w-full sm:w-auto items-center justify-center rounded-xl border border-line bg-surface-2 px-5 text-xs font-semibold text-ink hover:bg-surface transition-colors"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GoogleAuthPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      }
    >
      <GoogleAuthContent />
    </React.Suspense>
  )
}
