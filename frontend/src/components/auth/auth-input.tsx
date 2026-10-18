'use client'

import * as React from 'react'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  rightElement?: React.ReactNode
}

export function AuthInput({
  label,
  error,
  rightElement,
  className = '',
  id,
  ...props
}: AuthInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-medium text-ink-2 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          className={`h-10 w-full rounded-xl border bg-surface-2 px-3.5 ${
            rightElement ? 'pr-10' : ''
          } text-xs text-ink placeholder:text-ink-3 transition-colors focus:bg-surface focus:outline-none ${
            error
              ? 'border-danger focus:border-danger ring-1 ring-danger/20'
              : 'border-line focus:border-accent'
          } disabled:opacity-60 ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3">{rightElement}</div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-[11px] text-danger animate-in fade-in duration-150">{error}</p>
      )}
    </div>
  )
}

