'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      }
    >
      <RegisterForm />
    </React.Suspense>
  )
}
