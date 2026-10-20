'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from 'lucide-react'
import { api, formatApiError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/all-files'
  const initialEmail = searchParams.get('email') || ''

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const setAuth = useAuthStore((state) => state.setAuth)

  const [email, setEmail] = React.useState(initialEmail)
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<{ email?: string; password?: string }>({})
  const [serverError, setServerError] = React.useState<string | null>(null)

  // Redirect if already logged in
  React.useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(redirectPath)
    }
  }, [isHydrated, isAuthenticated, router, redirectPath])

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {}
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setServerError(null)
    setFieldErrors({})

    try {
      const res = await api.get('/auth/google/url')
      if (res.data?.url) {
        window.location.href = res.data.url
      } else {
        throw new Error('Google sign-in URL was not returned by server.')
      }
    } catch (err: unknown) {
      const msg = formatApiError(
        err,
        'Failed to connect to Google OAuth service. Please verify server connection.'
      )
      setServerError(msg)
      toast.error(msg)
      setIsGoogleLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validate()) {
      return
    }

    setIsLoading(true)

    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      })

      if (res.data?.accessToken && res.data?.user) {
        setAuth({
          user: res.data.user,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        })
        toast.success(`Welcome back, ${res.data.user.name || 'User'}!`)
        router.replace(redirectPath)
      } else {
        throw new Error('Unexpected response format from server.')
      }
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Invalid email or password.')
      setServerError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const isSubmitting = isLoading || isGoogleLoading

  return (
    <div className="rounded-3xl border border-line bg-surface p-7 sm:p-9 shadow-card transition-all">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Welcome back</h1>
        <p className="mt-2 text-xs sm:text-sm text-ink-2">
          Sign in to access your unified Google Drives & S3 workspace
        </p>
      </div>

      {/* Global Server / Network Error Alert */}
      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-5 flex items-start gap-2.5 rounded-2xl border border-danger/25 bg-danger/5 p-3.5 text-xs text-danger animate-in fade-in duration-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-danger" />
          <div className="flex-1 leading-relaxed">{serverError}</div>
        </div>
      )}

      {/* One-Click Google Sign In */}
      <div className="mt-6">
        <GoogleAuthButton
          mode="signin"
          isLoading={isGoogleLoading}
          disabled={isLoading}
          onClick={handleGoogleLogin}
        />
      </div>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-line" />
        <span className="absolute bg-surface px-3 text-[11px] font-medium uppercase tracking-wider text-ink-3">
          or sign in with email
        </span>
      </div>

      {/* Email Form */}
      <form onSubmit={handleEmailSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink-2 mb-1.5">Email address</label>
          <input
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
            }}
            placeholder="you@domain.com"
            aria-invalid={Boolean(fieldErrors.email)}
            className={`h-10 w-full rounded-xl border bg-surface-2 px-3.5 text-xs text-ink placeholder:text-ink-3 transition-colors focus:bg-surface focus:outline-none ${
              fieldErrors.email
                ? 'border-danger focus:border-danger ring-1 ring-danger/20'
                : 'border-line focus:border-accent'
            } disabled:opacity-60`}
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-[11px] text-danger animate-in fade-in duration-150">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-ink-2">Password</label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              disabled={isSubmitting}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }}
              placeholder="••••••••••••"
              aria-invalid={Boolean(fieldErrors.password)}
              className={`h-10 w-full rounded-xl border bg-surface-2 px-3.5 pr-10 text-xs text-ink placeholder:text-ink-3 transition-colors focus:bg-surface focus:outline-none ${
                fieldErrors.password
                  ? 'border-danger focus:border-danger ring-1 ring-danger/20'
                  : 'border-line focus:border-accent'
              } disabled:opacity-60`}
            />
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors cursor-pointer disabled:opacity-40"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1.5 text-[11px] text-danger animate-in fade-in duration-150">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-semibold text-accent-ink shadow-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 text-center text-xs text-ink-2">
        Don&apos;t have an account?{' '}
        <Link
          href={`/register${email ? `?email=${encodeURIComponent(email)}` : ''}`}
          className="font-semibold text-accent hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  )
}
