'use client'

import * as React from 'react'
import { Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react'

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

interface EditorStatusBarProps {
  status: SaveStatus
  wordCount: number
  charCount: number
  lastSavedAt?: Date | null
}

export function EditorStatusBar({
  status,
  wordCount,
  charCount,
  lastSavedAt,
}: EditorStatusBarProps) {
  const readTimeMin = Math.ceil(wordCount / 200) || 1

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-t border-line bg-surface text-xs text-ink-3 select-none">
      {/* Save state indicator */}
      <div className="flex items-center gap-2">
        {status === 'saved' && (
          <div className="flex items-center gap-1.5 text-success font-medium">
            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>
              All changes saved
              {lastSavedAt && ` · ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          </div>
        )}

        {status === 'saving' && (
          <div className="flex items-center gap-1.5 text-accent font-medium">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>Syncing to Google Drive...</span>
          </div>
        )}

        {status === 'unsaved' && (
          <div className="flex items-center gap-1.5 text-amber-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Unsaved edits</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-1.5 text-danger font-medium">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Failed to save. Retrying...</span>
          </div>
        )}
      </div>

      {/* Metrics & Markdown shortcuts badge */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline font-mono tabular-nums">
          {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars · {readTimeMin} min read
        </span>

        <div className="hidden md:flex items-center gap-1 text-[11px] text-ink-3 bg-surface-2 px-2.5 py-0.5 rounded-full border border-line">
          <Sparkles className="h-3 w-3 text-accent" />
          <span>Markdown shortcuts active</span>
        </div>
      </div>
    </div>
  )
}

