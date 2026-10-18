import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Access Token to all outgoing requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Shared promise to prevent multiple simultaneous refresh calls
let refreshPromise: Promise<string | null> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't refresh on auth endpoints
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register')
      ) {
        return Promise.reject(error)
      }

      if (originalRequest.url?.includes('/auth/refresh')) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      originalRequest._retry = true
      const refreshToken = useAuthStore.getState().refreshToken

      if (!refreshToken) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            try {
              const res = await axios.post(`${BASE_URL}/auth/refresh`, {
                refreshToken,
              })
              const newAccessToken = res.data?.accessToken
              if (newAccessToken) {
                useAuthStore.getState().setAccessToken(newAccessToken)
                return newAccessToken
              }
              return null
            } catch {
              useAuthStore.getState().logout()
              return null
            } finally {
              refreshPromise = null
            }
          })()
        }

        const newAccessToken = await refreshPromise

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        }
      } catch (refreshErr) {
        useAuthStore.getState().logout()
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  }
)

export function formatApiError(
  error: unknown,
  fallback = 'An unexpected error occurred. Please try again.'
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return 'Request timed out. Please check your connection and try again.'
      }
      return 'Unable to reach the server. Please check your network connection or verify the backend is running.'
    }

    const data = error.response.data as { code?: string; message?: string } | undefined
    if (data?.message) {
      if (data.code === 'AUTH_EMAIL_TAKEN') {
        return 'This email address is already registered. Please sign in instead.'
      }
      if (data.code === 'AUTH_INVALID_CREDENTIALS') {
        return 'Invalid email or password. Please verify your credentials.'
      }
      if (data.code === 'AUTH_SESSION_EXPIRED') {
        return 'Your session has expired. Please sign in again.'
      }
      if (data.code === 'AUTH_GOOGLE_HANDOFF_INVALID') {
        return 'Google authentication session expired. Please sign in again.'
      }
      if (data.code === 'GOOGLE_CONFIG_MISSING') {
        return 'Google OAuth is not configured on the server. Please check backend configuration.'
      }
      if (data.code === 'CAPTCHA_FAILED') {
        return 'Captcha verification failed. Please try again.'
      }
      // Parse JSON Zod error message if returned
      if (typeof data.message === 'string' && data.message.startsWith('[') && data.message.endsWith(']')) {
        try {
          const parsed = JSON.parse(data.message) as Array<{ message?: string }>
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.message) {
            return parsed.map((item) => item.message).filter(Boolean).join('. ')
          }
        } catch {
          // Ignore parse errors and return raw message
        }
      }
      return data.message
    }

    if (error.response.status === 401) {
      return 'Unauthorized. Please sign in to continue.'
    }
    if (error.response.status === 403) {
      return 'You do not have permission to perform this action.'
    }
    if (error.response.status === 404) {
      return 'The requested resource was not found.'
    }
    if (error.response.status === 409) {
      return 'A conflict occurred with an existing resource.'
    }
    if (error.response.status === 429) {
      return 'Too many attempts. Please slow down and try again shortly.'
    }
    if (error.response.status >= 500) {
      return 'A server error occurred. Please try again in a few moments.'
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

