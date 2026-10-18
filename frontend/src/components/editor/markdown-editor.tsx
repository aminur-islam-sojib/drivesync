'use client'

import * as React from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'

import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { LinkNode, AutoLinkNode } from '@lexical/link'
import {
  TRANSFORMERS,
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from '@lexical/markdown'
import type { EditorState } from 'lexical'

import { editorTheme } from './editor-theme'
import { EditorToolbar } from './editor-toolbar'

interface MarkdownEditorProps {
  initialMarkdown?: string
  onChange?: (markdown: string, stats: { words: number; chars: number }) => void
  readOnly?: boolean
}

function InitialContentPlugin({ markdown = '' }: { markdown: string }) {
  const [editor] = useLexicalComposerContext()
  const isInitializedRef = React.useRef(false)

  React.useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      if (markdown) {
        editor.update(() => {
          $convertFromMarkdownString(markdown, TRANSFORMERS)
        })
      }
    }
  }, [editor, markdown])

  return null
}

export function MarkdownEditor({
  initialMarkdown = '',
  onChange,
  readOnly = false,
}: MarkdownEditorProps) {
  const initialConfig = React.useMemo(
    () => ({
      namespace: 'DriveSyncEditor',
      theme: editorTheme,
      editable: !readOnly,
      onError: (error: Error) => {
        // Silently handled
        void error
      },
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        CodeHighlightNode,
        LinkNode,
        AutoLinkNode,
      ],
    }),
    [readOnly]
  )

  const handleEditorChange = React.useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const markdown = $convertToMarkdownString(TRANSFORMERS)
        const text = markdown.trim()
        const words = text ? text.split(/\s+/).length : 0
        const chars = text.length

        if (onChange) {
          onChange(markdown, { words, chars })
        }
      })
    },
    [onChange]
  )

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="flex flex-col h-full rounded-2xl border border-line bg-surface overflow-hidden shadow-xs">
        {!readOnly && <EditorToolbar />}

        <div className="relative flex-1 overflow-y-auto px-6 py-6 sm:px-12 sm:py-8 max-w-4xl mx-auto w-full">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="outline-none min-h-[360px] text-ink leading-relaxed prose prose-neutral dark:prose-invert max-w-none"
                aria-label="Markdown document body"
              />
            }
            placeholder={
              <div className="pointer-events-none absolute left-6 sm:left-12 top-6 sm:top-8 text-sm sm:text-base text-ink-3 select-none">
                Start typing notes, or type &apos;#&apos; for heading, &apos;-&apos; for list...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>

        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <InitialContentPlugin markdown={initialMarkdown} />
        {onChange && <OnChangePlugin onChange={handleEditorChange} />}
      </div>
    </LexicalComposer>
  )
}

