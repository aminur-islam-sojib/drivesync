'use client'

import * as React from 'react'
import { Copy, Check, FileEdit, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useDialogStore } from '@/stores/dialog-store'

interface CodeTextViewerProps {
  src: string
  fileName: string
  fileId?: string
}

export function CodeTextViewer({ src, fileName, fileId }: CodeTextViewerProps) {
  const [content, setContent] = React.useState<string>('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasCopied, setHasCopied] = React.useState(false)
  const openDialog = useDialogStore((state) => state.openDialog)

  React.useEffect(() => {
    let isMounted = true

    async function fetchText() {
      try {
        const res = await fetch(src)
        const text = await res.text()
        if (isMounted) {
          setContent(text)
          setIsLoading(false)
        }
      } catch {
        if (isMounted) {
          setContent('Unable to load file content.')
          setIsLoading(false)
        }
      }
    }

    void fetchText()
    return () => {
      isMounted = false
    }
  }, [src])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setHasCopied(true)
      toast.success('File content copied to clipboard')
      setTimeout(() => setHasCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  const lines = React.useMemo(() => content.split('\n'), [content])
  const isEditable =
    fileName.endsWith('.md') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.json') ||
    fileName.endsWith('.csv')

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full flex-col rounded-2xl border border-line bg-surface overflow-hidden shadow-inner">
      {/* Code Header Bar */}
      <div className="flex h-11 items-center justify-between border-b border-line bg-surface-2 px-4 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-ink-2">{fileName}</span>
          <span className="text-[11px] text-ink-3">({lines.length} lines)</span>
        </div>

        <div className="flex items-center gap-2">
          {isEditable && (
            <button
              type="button"
              onClick={() =>
                openDialog('editor', {
                  fileId,
                  fileName,
                  initialTitle: fileName,
                  initialContent: content,
                })
              }
              className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors cursor-pointer"
            >
              <FileEdit className="h-3.5 w-3.5" />
              <span>Edit Document</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
          >
            {hasCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-ink-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content with Line Numbers */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-ink">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-surface-2/60 transition-colors">
                <td className="w-10 pr-4 text-right select-none text-ink-3/60 font-mono text-[11px]">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono">{line || ' '}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
