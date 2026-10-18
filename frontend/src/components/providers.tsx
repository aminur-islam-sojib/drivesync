'use client'

import * as React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate)

  React.useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--ink)',
            borderColor: 'var(--line)',
            boxShadow: 'var(--shadow-pop)',
            borderRadius: 'var(--radius-lg)',
          },
        }}
      />
    </QueryClientProvider>
  )
}

