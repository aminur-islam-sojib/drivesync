'use client'

import * as React from 'react'
import { Trash2 } from 'lucide-react'

export default function TrashPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="pb-3 border-b border-line/40 select-none">
        <div className="flex items-center gap-2 text-xs text-ink-3">
          <span>DriveSync</span>
          <span>&gt;</span>
          <span className="text-ink font-medium">Trash</span>
        </div>
        <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-ink">Recycle Bin</h1>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center text-ink-3 border border-dashed border-line rounded-3xl">
        <Trash2 className="h-10 w-10 mb-2 opacity-30 text-danger" />
        <p className="text-xs font-semibold text-ink">Trash is empty</p>
        <p className="text-[11px] max-w-xs mt-1 text-ink-3">
          Items moved to trash will remain here and can be restored or permanently purged.
        </p>
      </div>
    </div>
  )
}

