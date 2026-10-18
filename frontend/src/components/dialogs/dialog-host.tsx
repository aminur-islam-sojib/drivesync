'use client'

import * as React from 'react'
import { ConnectedAccountsModal } from '@/components/accounts/connected-accounts-modal'
import { S3ConfigDialog } from '@/components/dialogs/s3-config-dialog'

export function DialogHost() {
  return (
    <>
      <ConnectedAccountsModal />
      <S3ConfigDialog />
    </>
  )
}

