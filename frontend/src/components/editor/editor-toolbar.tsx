'use client'

import * as React from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
} from '@lexical/list'
import { $createCodeNode } from '@lexical/code'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Undo2,
  Redo2,
  FileCode,
} from 'lucide-react'

export function EditorToolbar() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = React.useState(false)
  const [isItalic, setIsItalic] = React.useState(false)
  const [isStrikethrough, setIsStrikethrough] = React.useState(false)
  const [isCode, setIsCode] = React.useState(false)

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsCode(selection.hasFormat('code'))
    }
  }, [])

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor, updateToolbar])

  const formatHeading = (level: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(level))
      }
    })
  }

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  const formatCodeBlock = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createCodeNode())
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-line bg-surface-2/60 select-none">
      {/* History */}
      <div className="flex items-center gap-0.5 border-r border-line/60 pr-1.5 mr-0.5">
        <button
          type="button"
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-0.5 border-r border-line/60 pr-1.5 mr-0.5">
        <button
          type="button"
          onClick={formatParagraph}
          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          title="Normal Text (Paragraph)"
        >
          <Pilcrow className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => formatHeading('h1')}
          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          title="Heading 1 (#)"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => formatHeading('h2')}
          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          title="Heading 2 (##)"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => formatHeading('h3')}
          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          title="Heading 3 (###)"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Text Format */}
      <div className="flex items-center gap-0.5 border-r border-line/60 pr-1.5 mr-0.5">
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isBold ? 'bg-accent text-accent-ink font-bold' : 'text-ink-3 hover:text-ink hover:bg-surface'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isItalic ? 'bg-accent text-accent-ink font-bold' : 'text-ink-3 hover:text-ink hover:bg-surface'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isStrikethrough ? 'bg-accent text-accent-ink font-bold' : 'text-ink-3 hover:text-ink hover:bg-surface'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isCode ? 'bg-accent text-accent-ink font-bold' : 'text-ink-3 hover:text-ink hover:bg-surface'
          }`}
          title="Inline Code"
        >
          <Code className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 border-r border-line/60 pr-1.5 mr-0.5">
        <button
          type="button"
          onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          title="Bullet List (-)"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          title="Numbered List (1.)"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}
          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          title="Checklist ([ ])"
        >
          <ListTodo className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Blocks */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={formatQuote}
          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          title="Quote (>)"
        >
          <Quote className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={formatCodeBlock}
          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          title="Code Block (```)"
        >
          <FileCode className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
