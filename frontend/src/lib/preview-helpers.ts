export type PreviewKind = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'generic'

export function getFilePreviewKind(fileName: string, mimeType = ''): PreviewKind {
  const ext = fileName.toLowerCase().split('.').pop() || ''
  const mime = mimeType.toLowerCase()

  if (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif', 'ico'].includes(ext)
  ) {
    return 'image'
  }

  if (
    mime.startsWith('video/') ||
    ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi', 'm4v'].includes(ext)
  ) {
    return 'video'
  }

  if (
    mime.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'].includes(ext)
  ) {
    return 'audio'
  }

  if (mime === 'application/pdf' || ext === 'pdf') {
    return 'pdf'
  }

  if (
    mime.startsWith('text/') ||
    mime.includes('json') ||
    mime.includes('javascript') ||
    mime.includes('typescript') ||
    mime.includes('xml') ||
    [
      'txt',
      'md',
      'json',
      'csv',
      'ts',
      'tsx',
      'js',
      'jsx',
      'py',
      'html',
      'css',
      'yaml',
      'yml',
      'xml',
      'sql',
      'sh',
      'bash',
      'log',
      'env',
      'rust',
      'rs',
      'go',
    ].includes(ext)
  ) {
    return 'text'
  }

  return 'generic'
}

