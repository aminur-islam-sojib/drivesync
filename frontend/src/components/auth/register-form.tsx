'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, ArrowRight, AlertCircle, Check } from 'lucide-react'
import { api, formatApiError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { AuthInput } from '@/components/auth/auth-input'

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const setAuth = useAuthStore((state) => state.setAuth)

  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState(initialEmail)
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [isEmailTaken, setIsEmailTaken] = React.useState(false)

  React.useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace('/all-files')
    }
  }, [isHydrated, isAuthenticated, router])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) errors.name = 'Full name is required'
    else if (trimmedName.length < 2) errors.name = 'Name must be at least 2 characters'

    if (!trimmedEmail) errors.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) errors.email = 'Please enter a valid email address'

    if (!password) errors.password = 'Password is required'
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters long'

    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true)
    setServerError(null)
    setIsEmailTaken(false)
    setFieldErrors({})

    try {
      const res = await api.get('/auth/google/url')
      if (res.data?.url) {
        window.location.href = res.data.url
      } else {
        throw new Error('Google sign-up URL was not returned by server.')
      }
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Failed to connect to Google OAuth service.')
      setServerError(msg)
      toast.error(msg)
      setIsGoogleLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setIsEmailTaken(false)

    if (!validate()) return
    setIsLoading(true)

    try {
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })

      if (res.data?.accessToken && res.data?.user) {
        setAuth({
          user: res.data.user,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        })
        toast.success(`Account created! Welcome to DriveSync, ${res.data.user.name}!`)
        router.replace('/all-files')
      } else {
        throw new Error('Unexpected response format from server.')
      }
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Registration failed. Please try again.')
      setServerError(msg)
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        setIsEmailTaken(true)
      }
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const isSubmitting = isLoading || isGoogleLoading
  const passwordHasMinLength = password.length >= 8

  return (
    <div className="rounded-3xl border border-line bg-surface p-7 sm:p-9 shadow-card transition-all">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Create account</h1>
        <p className="mt-2 text-xs sm:text-sm text-ink-2">
          Start pooling your Google Drives into one powerful workspace
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-5 flex items-start gap-2.5 rounded-2xl border border-danger/25 bg-danger/5 p-3.5 text-xs text-danger animate-in fade-in duration-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-danger" />
          <div className="flex-1 leading-relaxed">
            {serverError}
            {isEmailTaken && (
              <span className="block mt-1">
                <Link
                  href={`/login?email=${encodeURIComponent(email)}`}
                  className="font-semibold underline hover:opacity-80"
                >
                  Click here to sign in instead →
                </Link>
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <GoogleAuthButton
          mode="signup"
          isLoading={isGoogleLoading}
          disabled={isLoading}
          onClick={handleGoogleSignup}
        />
      </div>

      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-line" />
        <span className="absolute bg-surface px-3 text-[11px] font-medium uppercase tracking-wider text-ink-3">
          or register with email
        </span>
      </div>

      <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
        <AuthInput
          label="Full Name"
          type="text"
          autoComplete="name"
          disabled={isSubmitting}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }))
          }}
          placeholder="John Doe"
          error={fieldErrors.name}
        />

        <AuthInput
          label="Email address"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }))
          }}
          placeholder="you@domain.com"
          error={fieldErrors.email}
        />

        <div>
          <AuthInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            disabled={isSubmitting}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }))
            }}
            placeholder="Minimum 8 characters"
            error={fieldErrors.password}
            rightElement={
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-ink transition-colors cursor-pointer disabled:opacity-40"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          {!fieldErrors.password && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-3">
              <Check className={`h-3 w-3 ${passwordHasMinLength ? 'text-success' : 'text-ink-3'}`} />
              <span className={passwordHasMinLength ? 'text-success' : 'text-ink-3'}>
                At least 8 characters
              </span>
            </div>
          )}
        </div>

        <AuthInput
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          disabled={isSubmitting}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }))
          }}
          placeholder="Repeat your password"
          error={fieldErrors.confirmPassword}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-semibold text-accent-ink shadow-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-ink-2">
        Already have an account?{' '}
        <Link
          href={`/login${email ? `?email=${encodeURIComponent(email)}` : ''}`}
          className="font-semibold text-accent hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}

