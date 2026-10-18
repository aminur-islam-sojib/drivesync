'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X,
  Save,
  Download,
  Copy,
  Check,
  FileText,
  Code2,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { MarkdownEditor } from './markdown-editor'
import { EditorStatusBar, type SaveStatus } from './editor-status-bar'
import { useDialogStore } from '@/stores/dialog-store'
import { api, formatApiError } from '@/lib/api'

interface EditorModalContentProps {
  fileId?: string
  initialFileName?: string
  folderId?: string | null
  closeDialog: () => void
}

function EditorModalContent({
  fileId,
  initialFileName = 'Untitled-Note.md',
  folderId = null,
  closeDialog,
}: EditorModalContentProps) {
  const [fileName, setFileName] = React.useState(initialFileName)
  const [content, setContent] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(Boolean(fileId))
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>('saved')
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null)
  const [mode, setMode] = React.useState<'wysiwyg' | 'raw'>('wysiwyg')
  const [stats, setStats] = React.useState({ words: 0, chars: 0 })
  const [isCopied, setIsCopied] = React.useState(false)

  const contentRef = React.useRef(content)

  React.useEffect(() => {
    contentRef.current = content
  }, [content])

  // Fetch initial content if editing an existing file
  React.useEffect(() => {
    if (!fileId) return
    let isMounted = true
    api
      .get(`/files/${fileId}/download`, { responseType: 'text' })
      .then((res) => {
        if (isMounted) {
          const text = typeof res.data === 'string' ? res.data : String(res.data || '')
          setContent(text)
          const words = text.trim() ? text.trim().split(/\s+/).length : 0
          setStats({ words, chars: text.length })
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          toast.error(formatApiError(err, 'Failed to load document content.'))
          setIsLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [fileId])

  // Save implementation
  const performSave = React.useCallback(
    async (textToSave: string) => {
      setSaveStatus('saving')
      try {
        const nameToUse = fileName.trim().endsWith('.md')
          ? fileName.trim()
          : `${fileName.trim()}.md`

        const blob = new Blob([textToSave], { type: 'text/markdown' })
        const formData = new FormData()
        formData.append('sizeBytes', String(blob.size))
        formData.append('fileName', nameToUse)
        formData.append('mimeType', 'text/markdown')
        if (folderId) formData.append('folderId', folderId)
        formData.append('file', blob, nameToUse)
        await api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

        setSaveStatus('saved')
        setLastSavedAt(new Date())

        // Notify file browser to refresh items
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('drivesync-refresh-items'))
        }
      } catch (err: unknown) {
        setSaveStatus('error')
        toast.error(formatApiError(err, 'Failed to save document.'))
      }
    },
    [fileName, folderId]
  )

  // Debounced auto-save on content change
  React.useEffect(() => {
    if (saveStatus !== 'unsaved') return
    const timer = setTimeout(() => {
      void performSave(contentRef.current)
    }, 1500)
    return () => clearTimeout(timer)
  }, [content, saveStatus, performSave])

  const handleEditorChange = (newMarkdown: string, newStats: { words: number; chars: number }) => {
    setContent(newMarkdown)
    setStats(newStats)
    setSaveStatus('unsaved')
  }

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(content)
    setIsCopied(true)
    toast.success('Markdown copied!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDownloadFile = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: fileName.endsWith('.md') ? fileName : `${fileName}.md`,
    })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog.Content
      aria-describedby={undefined}
      className="fixed inset-2 sm:inset-6 z-50 flex flex-col rounded-3xl border border-line bg-surface shadow-pop outline-none animate-in fade-in zoom-in-95 overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-line bg-surface-2/40 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <FileText className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value)
              setSaveStatus('unsaved')
            }}
            placeholder="Document title"
            className="text-sm sm:text-base font-bold text-ink bg-transparent border-none outline-none focus:ring-1 focus:ring-accent rounded px-1.5 py-0.5 truncate max-w-[200px] sm:max-w-md"
          />
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-xl bg-surface p-1 border border-line">
            <button
              type="button"
              onClick={() => setMode('wysiwyg')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'wysiwyg'
                  ? 'bg-accent text-accent-ink shadow-2xs'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Visual</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('raw')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'raw'
                  ? 'bg-accent text-accent-ink shadow-2xs'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Raw</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 text-xs font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
            title="Copy Markdown"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">Copy</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadFile}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 text-xs font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
            title="Download file"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Download</span>
          </button>

          <button
            type="button"
            onClick={() => void performSave(contentRef.current)}
            className="flex h-8 items-center gap-1.5 rounded-xl bg-accent px-3 text-xs font-semibold text-accent-ink hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save</span>
          </button>

          <button
            type="button"
            onClick={closeDialog}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-3 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer ml-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-hidden p-3 sm:p-6 bg-canvas/40">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-xs text-ink-3">Loading document from cloud...</p>
          </div>
        ) : mode === 'wysiwyg' ? (
          <MarkdownEditor initialMarkdown={content} onChange={handleEditorChange} />
        ) : (
          <textarea
            value={content}
            onChange={(e) => {
              const val = e.target.value
              handleEditorChange(val, { words: val.trim() ? val.trim().split(/\s+/).length : 0, chars: val.length })
            }}
            placeholder="Type raw markdown here..."
            className="w-full h-full p-6 font-mono text-xs sm:text-sm bg-surface rounded-2xl border border-line text-ink leading-relaxed outline-none focus:border-accent resize-none overflow-y-auto"
          />
        )}
      </div>

      {/* Metrics & Save Status Bar */}
      <EditorStatusBar
        status={saveStatus}
        wordCount={stats.words}
        charCount={stats.chars}
        lastSavedAt={lastSavedAt}
      />
    </Dialog.Content>
  )
}

export function MarkdownEditorModal() {
  const activeDialog = useDialogStore((state) => state.activeDialog)
  const dialogData = useDialogStore((state) => state.dialogData)
  const closeDialog = useDialogStore((state) => state.closeDialog)

  const isOpen = activeDialog === 'editor'
  const fileId = dialogData?.fileId as string | undefined
  const fileName = (dialogData?.fileName as string) || 'Notes.md'
  const folderId = (dialogData?.folderId as string | null) || null

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        {isOpen && (
          <EditorModalContent
            key={fileId || 'editor-content'}
            fileId={fileId}
            initialFileName={fileName}
            folderId={folderId}
            closeDialog={closeDialog}
          />
        )}
      </Dialog.Portal>
    </Dialog.Root>
  )
}
