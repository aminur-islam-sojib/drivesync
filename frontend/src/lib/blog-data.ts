export interface BlogPost {
  slug: string
  title: string
  description: string
  datePublished: string
  dateModified: string
  author: {
    name: string
    title: string
  }
  readTime: string
  targetKeywords: string[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-combine-multiple-google-drive-accounts',
    title: 'How to Combine Multiple Google Drive Accounts in One Place (2026)',
    description:
      'Learn how to combine and merge multiple Google Drive accounts into a single pooled workspace. Step-by-step guide to aggregating storage quotas and searching across drives.',
    datePublished: '2026-01-15T08:00:00Z',
    dateModified: '2026-03-20T10:00:00Z',
    author: {
      name: 'Sojib Ahmed',
      title: 'Founder & Lead Engineer',
    },
    readTime: '7 min read',
    targetKeywords: [
      'combine multiple google drive accounts',
      'merge google drive storage',
      'pool google drive storage',
      'manage multiple google drive accounts in one place',
    ],
  },
  {
    slug: 'what-is-drivesync-one',
    title: 'What Is DriveSync One? Multi-Account Google Drive Manager Explained',
    description:
      'A comprehensive guide to DriveSync One (DriveSync). Discover how it pools Google Drive quotas, routes uploads automatically, and enables cross-drive search with AES-256 security.',
    datePublished: '2026-02-01T08:00:00Z',
    dateModified: '2026-03-22T09:30:00Z',
    author: {
      name: 'Sojib Ahmed',
      title: 'Founder & Lead Engineer',
    },
    readTime: '5 min read',
    targetKeywords: [
      'DriveSync One',
      'drivesyncone',
      'drive sync one',
      'DriveSync',
      'google drive multi-account manager',
    ],
  },
  {
    slug: 'drive-sync-vs-google-drive-for-desktop',
    title: 'Drive Sync Explained: DriveSync One vs Google Drive for Desktop',
    description:
      'Understand the difference between DriveSync One multi-account aggregation and Google Drive for Desktop client syncing. Learn which tool fits your workflow.',
    datePublished: '2026-02-18T08:00:00Z',
    dateModified: '2026-03-25T11:00:00Z',
    author: {
      name: 'Sojib Ahmed',
      title: 'Founder & Lead Engineer',
    },
    readTime: '6 min read',
    targetKeywords: [
      'drive sync',
      'DriveSync One',
      'google drive desktop sync vs web aggregator',
      'sync multiple google drives',
    ],
  },
]

