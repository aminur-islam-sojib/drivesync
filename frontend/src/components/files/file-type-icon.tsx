'use client'

import * as React from 'react'
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  File as GenericFile,
} from 'lucide-react'
import { getFileCategory, getFileCategoryColor } from '@/lib/utils'

interface FileTypeIconProps {
  mimeType: string
  name?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FileTypeIcon({
  mimeType,
  name = '',
  className = '',
  size = 'md',
}: FileTypeIconProps) {
  const category = getFileCategory(mimeType, name)
  const color = getFileCategoryColor(category)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8',
  }

  const iconClass = `${sizeClasses[size]} ${className}`

  switch (category) {
    case 'spreadsheet':
      return <FileSpreadsheet className={iconClass} style={{ color }} />
    case 'document':
      return <FileText className={iconClass} style={{ color }} />
    case 'presentation':
      return <Presentation className={iconClass} style={{ color }} />
    case 'pdf':
      return <FileText className={iconClass} style={{ color }} />
    case 'video':
      return <FileVideo className={iconClass} style={{ color }} />
    case 'audio':
      return <FileAudio className={iconClass} style={{ color }} />
    case 'image':
      return <ImageIcon className={iconClass} style={{ color }} />
    case 'archive':
      return <FileArchive className={iconClass} style={{ color }} />
    case 'code':
      return <FileCode className={iconClass} style={{ color }} />
    default:
      return <GenericFile className={iconClass} style={{ color }} />
  }
}
