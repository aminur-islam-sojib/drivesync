'use client'

import * as React from 'react'
import {
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { useUploadStore, type UploadTask } from '@/stores/upload-store'
import { formatBytes } from '@/lib/utils'
import { FileTypeIcon } from '@/components/files/file-type-icon'

export function UploadTray() {
  const tasks = useUploadStore((state) => state.tasks)
  const isTrayOpen = useUploadStore((state) => state.isTrayOpen)
  const isMinimized = useUploadStore((state) => state.isMinimized)
  const toggleMinimized = useUploadStore((state) => state.toggleMinimized)
  const clearCompleted = useUploadStore((state) => state.clearCompleted)
  const cancelUpload = useUploadStore((state) => state.cancelUpload)
  const setTrayOpen = useUploadStore((state) => state.setTrayOpen)

  if (!isTrayOpen || tasks.length === 0) return null

  const activeCount = tasks.filter((t) => t.status === 'uploading' || t.status === 'queued').length
  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const totalCount = tasks.length
  const isAllDone = activeCount === 0

  return (
    <div
      aria-label="Upload Progress Tray"
      className="fixed bottom-5 right-5 z-50 w-80 sm:w-96 rounded-2xl border border-line bg-surface shadow-pop overflow-hidden select-none animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-2/80 border-b border-line">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-ink">
            {isAllDone ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4 animate-spin" />
            )}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-ink truncate">
              {isAllDone
                ? `${completedCount} ${completedCount === 1 ? 'upload' : 'uploads'} complete`
                : `Uploading ${activeCount} of ${totalCount} items`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleMinimized}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 hover:bg-surface hover:text-ink transition-colors cursor-pointer"
            title={isMinimized ? 'Expand tray' : 'Minimize tray'}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {isAllDone && (
            <button
              type="button"
              onClick={() => {
                clearCompleted()
                setTrayOpen(false)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 hover:bg-surface hover:text-ink transition-colors cursor-pointer"
              title="Close tray"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body: Task List */}
      {!isMinimized && (
        <div className="max-h-72 overflow-y-auto divide-y divide-line/60 bg-surface">
          {tasks.map((task) => (
            <UploadTaskRow key={task.id} task={task} onCancel={() => cancelUpload(task.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function UploadTaskRow({
  task,
  onCancel,
}: {
  task: UploadTask
  onCancel: () => void
}) {
  const isUploading = task.status === 'uploading'
  const isQueued = task.status === 'queued'
  const isCompleted = task.status === 'completed'
  const isError = task.status === 'error'
  const isCanceled = task.status === 'canceled'

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-2/40">
      <div className="shrink-0">
        <FileTypeIcon mimeType={task.mimeType} name={task.fileName} size="md" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <p className="truncate font-semibold text-ink max-w-45" title={task.fileName}>
            {task.fileName}
          </p>
          <span className="font-mono text-[10px] text-ink-3 tabular-nums shrink-0 ml-2">
            {formatBytes(task.sizeBytes)}
          </span>
        </div>

        {/* Progress bar or Status text */}
        {isUploading && (
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-200 rounded-full"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-ink-3 font-mono">
              <span>{task.progress}%</span>
              {task.speedBytesPerSec > 0 && (
                <span>{formatBytes(task.speedBytesPerSec)}/s</span>
              )}
            </div>
          </div>
        )}

        {isQueued && (
          <p className="text-[10px] text-ink-3 italic">Waiting in queue...</p>
        )}

        {isCompleted && (
          <p className="flex items-center gap-1 text-[10px] text-success font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>Uploaded successfully</span>
          </p>
        )}

        {isError && (
          <p className="flex items-center gap-1 text-[10px] text-danger font-medium truncate" title={task.error}>
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span className="truncate">{task.error || 'Upload failed'}</span>
          </p>
        )}

        {isCanceled && (
          <p className="text-[10px] text-ink-3 italic">Canceled</p>
        )}
      </div>

      {/* Action button */}
      {(isUploading || isQueued) && (
        <button
          type="button"
          onClick={onCancel}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-danger transition-colors cursor-pointer"
          title="Cancel upload"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
