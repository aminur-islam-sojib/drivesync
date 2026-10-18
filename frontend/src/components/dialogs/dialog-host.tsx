'use client'

import * as React from 'react'
import { ConnectedAccountsModal } from '@/components/accounts/connected-accounts-modal'
import { S3ConfigDialog } from '@/components/dialogs/s3-config-dialog'
import { NewFolderDialog } from '@/components/dialogs/new-folder-dialog'
import { RenameDialog } from '@/components/dialogs/rename-dialog'
import { MoveDialog } from '@/components/dialogs/move-dialog'
import { MarkdownEditorModal } from '@/components/editor/markdown-editor-modal'

export function DialogHost() {
  const triggerRefresh = () => {
    // Dispatch custom event to notify active views to refresh files and folders
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('drivesync-refresh-items'))
    }
  }

  return (
    <>
      <ConnectedAccountsModal />
      <S3ConfigDialog />
      <NewFolderDialog onFolderCreated={triggerRefresh} />
      <RenameDialog onRenamed={triggerRefresh} />
      <MoveDialog onMoved={triggerRefresh} />
      <MarkdownEditorModal />
    </>
  )
}
