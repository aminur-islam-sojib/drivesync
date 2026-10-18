export interface User {
  id: string
  name: string
  email: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface StorageAccount {
  totalBytes: string | null
  usedBytes: string
  availableBytes: string | null
  trashBytes: string | null
  lastSyncedAt: string | null
}

export interface S3StorageConfig {
  id: string
  name: string
  bucket: string
  region: string
  endpoint?: string | null
  prefix?: string
  quotaBytes?: string | null
  status: string
}

export interface ConnectedAccount {
  id: string
  userId?: string
  provider: 'google_drive' | 's3'
  providerAccountId?: string
  email: string
  displayName?: string | null
  avatarUrl?: string | null
  status: 'connected' | 'error' | 'revoked'
  lastError?: string | null
  createdAt?: string
  updatedAt?: string
  storageAccount?: StorageAccount | null
  s3StorageConfig?: S3StorageConfig | null
}

export interface AccountStorageMetric {
  id: string
  email: string
  provider: string
  displayName?: string | null
  avatarUrl?: string | null
  totalBytes: string
  usedBytes: string
  availableBytes: string
  percentage: number
}

export interface StorageSummary {
  totalBytes: string
  usedBytes: string
  availableBytes: string
  accounts: AccountStorageMetric[]
}

export interface StorageBreakdown {
  photo?: string
  video?: string
  document?: string
  archive?: string
  other?: string
}

export interface UploadRoutingPolicy {
  id: string
  userId: string
  mode: 'most_available' | 'round_robin' | 'priority'
  priorityAccountIds: string[]
  roundRobinCursor?: number
}

export interface FolderItem {
  id: string
  name: string
  parentId: string | null
  connectedAccountId: string | null
  provider: string
  color: string
  iconUrl?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  fileCount?: number
  totalBytes?: string | number
  connectedAccount?: {
    id: string
    email: string
    provider: string
    displayName?: string | null
  } | null
  children?: FolderItem[]
}

export interface FileShare {
  id: string
  fileId: string
  token?: string | null
  enabled: boolean
  expiresAt?: string | null
  createdAt: string
  updatedAt?: string
}

export interface FileItem {
  id: string
  userId: string
  connectedAccountId: string
  folderId: string | null
  provider: string
  providerFileId: string
  name: string
  mimeType: string
  sizeBytes: string
  checksum?: string | null
  status: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  connectedAccount?: {
    id: string
    email: string
    provider: string
    displayName?: string | null
    avatarUrl?: string | null
  } | null
  folder?: {
    id: string
    name: string
  } | null
  shares?: FileShare[]
}

export interface ActivityLog {
  id: string
  action: string
  entityType: string
  entityId: string
  metadata?: Record<string, unknown> | null
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface ApiErrorResponse {
  code: string
  message: string
}

