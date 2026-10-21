export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://drivesyncone.vercel.app'

export const SITE_NAME = 'DriveSync One'
export const SHORT_NAME = 'DriveSync'
export const ALTERNATE_NAMES = [
  'DriveSync',
  'Drive Sync One',
  'DriveSyncOne',
  'Drive Sync',
  'drivesync',
  'drivesyncone',
]

export const DEFAULT_TITLE =
  'DriveSync One – Combine Multiple Google Drive Accounts in One Place'

export const DEFAULT_DESCRIPTION =
  'DriveSync One (DriveSync) is a 100% free and open-source manager that merges multiple Google Drive and S3 accounts into one workspace with pooled storage and cross-drive search.'

export const DEFAULT_OG_IMAGE = '/opengraph-image'

export const SOCIAL_PROFILES = {
  github: 'https://github.com/aminur-islam-sojib/drivesyncone',
  twitter: 'https://twitter.com/drivesyncone',
}

export function absoluteUrl(path: string = ''): string {
  const cleanBase = SITE_URL.replace(/\/+$/, '')
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  return `${cleanBase}${cleanPath}`
}

