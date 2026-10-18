import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number | bigint | string | null | undefined, decimals = 1): string {
  if (bytes === null || bytes === undefined) return '0 B'
  const num = typeof bytes === 'bigint' ? Number(bytes) : typeof bytes === 'string' ? Number(bytes) : bytes
  if (isNaN(num) || num <= 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(num) / Math.log(k))
  const formatted = (num / Math.pow(k, i)).toFixed(decimals)
  return `${parseFloat(formatted)} ${sizes[i] || 'B'}`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'

  const now = new Date()
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffSec < 60) return 'Just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} days ago`
  return formatDate(d)
}

export type FileCategory =
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'code'
  | 'other'

export function getFileCategory(mimeType: string, filename = ''): FileCategory {
  const mime = mimeType.toLowerCase()
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  if (mime.includes('pdf') || ext === 'pdf') return 'pdf'
  if (
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    ['xlsx', 'xls', 'csv'].includes(ext)
  ) {
    return 'spreadsheet'
  }
  if (
    mime.includes('presentation') ||
    mime.includes('powerpoint') ||
    ['pptx', 'ppt', 'key'].includes(ext)
  ) {
    return 'presentation'
  }
  if (
    mime.includes('word') ||
    mime.includes('document') ||
    mime.includes('text/plain') ||
    ['docx', 'doc', 'txt', 'rtf', 'md'].includes(ext)
  ) {
    return 'document'
  }
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return 'image'
  }
  if (mime.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(ext)) {
    return 'video'
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
    return 'audio'
  }
  if (
    mime.includes('zip') ||
    mime.includes('tar') ||
    mime.includes('rar') ||
    ['zip', 'tar', 'gz', '7z'].includes(ext)
  ) {
    return 'archive'
  }
  if (
    mime.includes('json') ||
    mime.includes('javascript') ||
    ['json', 'js', 'ts', 'tsx', 'html', 'css', 'py'].includes(ext)
  ) {
    return 'code'
  }

  return 'other'
}

export function getFileCategoryColor(category: FileCategory): string {
  switch (category) {
    case 'pdf':
      return '#EA4335' // Google Red
    case 'document':
      return '#4285F4' // Google Docs Blue
    case 'spreadsheet':
      return '#0F9D58' // Google Sheets Green
    case 'presentation':
      return '#F4B400' // Google Slides Amber
    case 'image':
      return '#A142F4' // Purple
    case 'video':
      return '#E91E63' // Rose
    case 'audio':
      return '#00ACC1' // Teal
    case 'archive':
      return '#78909C' // Slate
    case 'code':
      return '#26A69A' // Cyan
    default:
      return '#5F6878' // Neutral ink
  }
}

export function truncateMiddle(str: string, maxLen = 32): string {
  if (str.length <= maxLen) return str
  const half = Math.floor((maxLen - 3) / 2)
  return `${str.slice(0, half)}...${str.slice(-half)}`
}

