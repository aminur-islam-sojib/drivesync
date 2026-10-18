# DriveSync Project Audit

This document is a comprehensive, read-only architectural audit of the DriveSync codebase prepared for the frontend migration to Next.js (App Router + TypeScript), backend consolidation, and complete UI/UX redesign.

---

## 1. Project Overview

### 1.1 App Name & Purpose
- **App Name**: DriveSync (legacy references in code to `9drive`).
- **Core Functionality**: Google Drive storage gateway and aggregator. It allows users to register/log in via email/password or Google OAuth, connect multiple Google Drive accounts (plus S3-compatible buckets), track combined and per-account storage quotas, upload files streamed directly to a dedicated `drivesync` Google Drive folder, organize files into virtual hierarchical folders, stream/preview media (video, audio, image, PDF, Office documents), share files via public tokens and direct Google Drive permissions, invite workspace collaborators, manage API keys for programmatic uploads, and view system activity logs.

### 1.2 Main User Flows
1. **Authentication Flow**:
   - Register with email, name, password, and optional Google reCAPTCHA.
   - Login with email and password -> returns JWT access token + refresh token.
   - Google Sign-In -> Google OAuth consent -> callback creates user account, connects initial Drive account, syncs quota, creates one-time `AuthHandoff` token, redirects to `/google-auth?token=...`, which exchanges handoff token for JWT session.
2. **Account Aggregation & Quota Flow**:
   - Navigate to `/settings` or `/quota` -> click "Connect Drive" -> opens popup window for Google OAuth -> callback saves encrypted tokens in DB, syncs quota, sends `postMessage` (`GOOGLE_CONNECTED`) to parent window, parent closes popup and reloads accounts.
   - Connect S3 bucket via modal in Settings -> validates connection via `HeadBucketCommand` -> calculates usage via `ListObjectsV2Command`.
   - Set upload routing policy (`most_available`, `round_robin`, `priority`).
3. **File & Folder Management Flow**:
   - View `/all-files` -> browse virtual folders or flat files.
   - Drag and drop files onto folders -> moves files to target folder via batch API.
   - Advanced search with filters (file kind, connected account, size range, date range).
   - Right-click context menus for files, folders, and empty canvas area.
   - Soft-delete files/folders -> moved to Recycle Bin (`/trash`) -> restore or permanent purge.
4. **Upload Flow**:
   - Standard upload: Files streamed via Busboy directly to Google Drive or S3.
   - Resumable upload: Initializes session with Google Drive API (`uploadType=resumable`), tracks offset, uploads 5MB chunks via `PUT /uploads/resumable/chunk/:id` with `Content-Range`.
5. **Sharing & Preview Flow**:
   - Create public share link -> generates random token -> `/public/files/:token` (standalone viewer or iframe embed).
   - Generate direct Google Drive public link (`role: 'writer', type: 'anyone'`).
   - In-app preview modal using Plyr for videos, native iframes for PDF/Docs, and Office Online Viewer for Office formats.
   - Workspace invites sent to collaborator emails for specific files or folders.
6. **API Management Flow**:
   - Generate scoped API key (`files:upload`) -> display secret once (`9d_live_...`) -> upload files via `POST /api/v1/uploads`.

### 1.3 Repository Architecture
- **Repo Type**: Multi-folder single repository (not a managed npm/pnpm/yarn monorepo workspace). Root contains no root `package.json` workspace configuration (only an empty `package-lock.json` and Docker orchestration files).
- **Top-Level Folders & Purpose**:
  - `backend/`: Node.js Express 5 REST API, Prisma 6 ORM, MySQL migrations, Google & AWS SDK integrations.
  - `frontend/`: Vite 8, React 19, TypeScript single-page application with Tailwind CSS 4.
  - `docker-compose.yml`: Multi-container Docker deployment (MySQL 8.4, backend, nginx frontend).
  - `.env.docker.example`: Environment variable template for Docker Compose.
  - `setup.sh` / `setup.ps1`: Interactive bootstrap scripts generating `.env` files and running migrations.
  - `AGENTS.md` / `README.md` / `LICENSE`: Project documentation and open-source licensing (ISC).

---

## 2. Folder Structure

```
drivesync/
├── AGENTS.md
├── docker-compose.yml
├── .env.docker.example
├── LICENSE
├── package-lock.json
├── README.md
├── setup.ps1
├── setup.sh
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │       ├── 20260604084325_init/
│   │       ├── 20260604090020_global_provider_config/
│   │       ├── 20260604091957_virtual_folders/
│   │       ├── 20260604095418_nested_folders/
│   │       ├── 20260604095705_file_shares/
│   │       ├── 20260604100802_file_preview_tokens/
│   │       ├── 20260604120000_add_file_share_token/
│   │       ├── 20260604130000_workspace_invites/
│   │       ├── 20260604133000_invite_targets/
│   │       ├── 20260605090000_query_indexes/
│   │       ├── 20260605100000_folder_icons/
│   │       ├── 20260605110000_google_auth_handoff/
│   │       ├── 20260611120000_s3_storage_support/
│   │       ├── 20260611130000_upload_routing_policy/
│   │       ├── 20260611140000_api_keys/
│   │       └── 20260630030000_upload_session_resumable_fields/
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       │   ├── env.ts
│       │   └── prisma.ts
│       ├── middleware/
│       │   ├── api-key.middleware.ts
│       │   ├── auth.middleware.ts
│       │   └── error.middleware.ts
│       ├── modules/
│       │   ├── api-keys/
│       │   ├── audit-logs/
│       │   ├── auth/
│       │   ├── connected-accounts/
│       │   ├── files/
│       │   ├── folders/
│       │   ├── google/
│       │   ├── invites/
│       │   ├── provider-configs/
│       │   ├── public/
│       │   ├── public-api/
│       │   ├── s3/
│       │   ├── storage/
│       │   ├── system/
│       │   └── uploads/
│       ├── scripts/
│       │   ├── seed-google-config.ts
│       │   ├── seed-google-config-if-present.ts
│       │   ├── test-api-upload.ts
│       │   └── test-s3-connection.ts
│       └── utils/
│           ├── audit.ts
│           ├── crypto.ts
│           ├── jwt.ts
│           └── password.ts
└── frontend/
    ├── Dockerfile
    ├── index.html
    ├── nginx.conf
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tsconfig.json
    ├── vite.config.ts
    ├── public/
    │   ├── favicon.svg
    │   ├── icons.svg
    │   ├── maskable-icon.svg
    │   ├── pwa-192x192.svg
    │   └── pwa-512x512.svg
    └── src/
        ├── App.tsx
        ├── counter.ts
        ├── main.tsx
        ├── style.css
        ├── assets/
        │   ├── hero.png
        │   ├── typescript.svg
        │   └── vite.svg
        ├── components/
        │   ├── auth/
        │   ├── drive/
        │   └── ui/
        ├── context/
        │   └── UploadContext.tsx
        ├── data/
        │   └── drive-data.ts
        ├── layouts/
        │   └── DriveLayout.tsx
        ├── lib/
        │   ├── api.ts
        │   ├── auth.ts
        │   ├── gravatar.ts
        │   ├── plyr.ts
        │   ├── preview.ts
        │   └── utils.ts
        └── pages/
            ├── ActivityLogPage.tsx
            ├── AllFilesPage.tsx
            ├── ApiManagementPage.tsx
            ├── ArchivedPage.tsx
            ├── GoogleAuthPage.tsx
            ├── GoogleConnectedPage.tsx
            ├── LoginPage.tsx
            ├── PublicFilePage.tsx
            ├── QuotaTrackerPage.tsx
            ├── RecentPage.tsx
            ├── RegisterPage.tsx
            ├── SettingsPage.tsx
            ├── SharedPage.tsx
            ├── StarredPage.tsx
            └── TrashPage.tsx
```

### Entry Points
- **Backend Entry Point**: `backend/src/server.ts` (imports Express application from `backend/src/app.ts` and listens on `env.APP_PORT`).
- **Frontend Entry Point**: `frontend/index.html` -> `frontend/src/main.tsx` (renders `<App />` into DOM element `#root` with React 19 `createRoot` and `BrowserRouter`).

---

## 3. Tech Stack (Exact Versions)

### 3.1 Environment & Package Managers
- **Node.js**: Dockerfile uses `node:20-alpine`; Host system running `v24.21.0`; `.nvmrc` / `.node-version`: NOT FOUND.
- **Package Manager**: npm `11.19.0` (backend and frontend each have their own `package-lock.json` v3).

### 3.2 Frontend Tech Stack
- **React**: `^19.2.7`
- **React DOM**: `^19.2.7`
- **Bundler**: Vite `^8.0.12` with `@vitejs/plugin-react` `^6.0.2` and `vite-plugin-pwa` `^1.3.0`
- **Router**: `react-router-dom` `^7.16.0`
- **State Management**: React Context (`UploadContext.tsx`), local component state (`useState`), `localStorage` for auth/tokens/theme/view preferences, DOM CustomEvents (`drivesync:storage-changed`, `drivesync:upload-completed`, `drivesync:invites-changed`)
- **UI Primitives**: Custom Tailwind components (`button.tsx`, `card.tsx`, `input.tsx`), `class-variance-authority` `^0.7.1`, `clsx` `^2.1.1`, `tailwind-merge` `^3.6.0`, `lucide-react` `^1.17.0`
- **CSS Approach**: Tailwind CSS `^4.3.0` via `@tailwindcss/postcss` `^4.3.0` and `postcss` `^8.5.15` (no `tailwind.config.js`; uses Tailwind v4 `@import "tailwindcss";` and custom CSS properties in `style.css`)
- **Form Library**: NOT FOUND (plain HTML uncontrolled/controlled inputs with React `useState` and `FormEvent`)
- **Data-Fetching Library**: NOT FOUND (custom `apiFetch` wrapper around native `fetch` with token refresh interceptor in `frontend/src/lib/api.ts`)
- **Video Player**: Plyr v3.7.8 dynamically loaded via CDN (`cdnjs.cloudflare.com`) in `frontend/src/lib/plyr.ts`

### 3.3 Backend Tech Stack
- **Framework**: Express `^5.2.1`
- **Language**: TypeScript `^6.0.3`, executed in dev via `tsx` `^4.22.4`, built via `tsc`
- **API Architecture**: REST JSON API
- **Middleware List**:
  - `trust proxy` enabled (`app.set('trust proxy', true)`)
  - `cors({ origin: env.FRONTEND_URL })`
  - `express.json({ limit: '1mb' })`
  - `requireAuth` (`backend/src/middleware/auth.middleware.ts`): validates Bearer JWT access token and active DB session
  - `requireApiKey(scope)` (`backend/src/middleware/api-key.middleware.ts`): validates Bearer API key hash, expiration, status, and required scope
  - `errorMiddleware` (`backend/src/middleware/error.middleware.ts`): standard JSON 500 error handler
- **Validation Library**: Zod `^4.4.3` (runtime body/query parsing across all routes)
- **Database**: MySQL 8.4 (Docker image `mysql:8.4`)
- **ORM**: Prisma `^6.19.3` (`@prisma/client` `^6.19.3`, schema in `backend/prisma/schema.prisma`)

### 3.4 Database Models & Fields (`backend/prisma/schema.prisma`)

| Model | Table Name | Fields (Name, Type, Modifiers) |
|---|---|---|
| `User` | `users` | `id` (Char(36), PK), `name` (VarChar(191)), `email` (VarChar(191), Unique), `passwordHash` (VarChar(255)), `status` (VarChar(32), default "active"), `createdAt` (DateTime), `updatedAt` (DateTime) |
| `ApiKey` | `api_keys` | `id` (Char(36), PK), `userId` (Char(36), FK), `name` (VarChar(191)), `keyPrefix` (VarChar(32)), `keyHash` (VarChar(255), Unique), `scopes` (Json), `status` (VarChar(32), default "active"), `lastUsedAt` (DateTime, null), `expiresAt` (DateTime, null), `revokedAt` (DateTime, null), `createdAt` (DateTime), `updatedAt` (DateTime) |
| `UploadRoutingPolicy` | `upload_routing_policies` | `id` (Char(36), PK), `userId` (Char(36), FK, Unique), `mode` (VarChar(32), default "most_available"), `priorityAccountIds` (Json), `roundRobinCursor` (Int, default 0), `createdAt` (DateTime), `updatedAt` (DateTime) |
| `UserSession` | `user_sessions` | `id` (Char(36), PK), `userId` (Char(36), FK), `refreshTokenHash` (VarChar(255), Indexed), `userAgent` (Text, null), `ipAddress` (VarChar(64), null), `expiresAt` (DateTime), `revokedAt` (DateTime, null), `createdAt` (DateTime), `updatedAt` (DateTime) |
| `AuthHandoff` | `auth_handoffs` | `id` (Char(36), PK), `userId` (Char(36), FK), `tokenHash` (VarChar(255), Unique), `expiresAt` (DateTime), `usedAt` (DateTime, null), `createdAt` (DateTime) |
| `ProviderConfig` | `provider_configs` | `id` (Char(36), PK), `userId` (Char(36), FK, null), `provider` (VarChar(32)), `clientIdEncrypted` (Text), `clientSecretEncrypted` (Text), `redirectUri` (Text), `scopes` (Json), `status` (VarChar(32), default "active"), `createdAt` (DateTime), `updatedAt` (DateTime) |
| `OauthState` | `oauth_states` | `id` (Char(36), PK), `userId` (Char(36), FK, null), `providerConfigId` (Char(36), FK), `flow` (VarChar(32), default "connect"), `stateHash` (VarChar(255), Unique), `expiresAt` (DateTime), `usedAt` (DateTime, null), `createdAt` (DateTime) |
| `ConnectedAccount` | `connected_accounts` | `id` (Char(36), PK), `userId` (Char(36), FK), `providerConfigId` (Char(36), FK, null), `provider` (VarChar(32)), `providerAccountId` (VarChar(191)), `email` (VarChar(191)), `displayName` (VarChar(191), null), `avatarUrl` (Text, null), `accessTokenEncrypted` (Text, null), `refreshTokenEncrypted` (Text, null), `tokenExpiresAt` (DateTime, null), `scopes` (Json), `status` (VarChar(32), default "connected"), `lastError` (Text, null), `createdAt` (DateTime), `updatedAt` (DateTime). Unique: `[userId, provider, providerAccountId]` |
| `S3StorageConfig` | `s3_storage_configs` | `id` (Char(36), PK), `userId` (Char(36), FK), `connectedAccountId` (Char(36), FK, Unique), `name` (VarChar(191)), `bucket` (VarChar(191)), `region` (VarChar(191)), `endpoint` (Text, null), `accessKeyIdEncrypted` (Text), `secretAccessKeyEncrypted` (Text), `forcePathStyle` (Boolean, default false), `prefix` (VarChar(191), default "drivesync"), `quotaBytes` (BigInt, null), `status` (VarChar(32), default "active"), `createdAt` (DateTime), `updatedAt` (DateTime) |
| `StorageAccount` | `storage_accounts` | `id` (Char(36), PK), `connectedAccountId` (Char(36), FK, Unique), `totalBytes` (BigInt, null), `usedBytes` (BigInt, default 0), `availableBytes` (BigInt, null), `trashBytes` (BigInt, null), `lastSyncedAt` (DateTime, null), `createdAt` (DateTime), `updatedAt` (DateTime) |
| `File` | `files` | `id` (Char(36), PK), `userId` (Char(36), FK), `connectedAccountId` (Char(36), FK), `folderId` (Char(36), FK, null), `provider` (VarChar(32)), `providerFileId` (VarChar(191)), `name` (VarChar(255)), `mimeType` (VarChar(191)), `sizeBytes` (BigInt), `checksum` (VarChar(191), null), `status` (VarChar(32), default "active"), `createdAt` (DateTime), `updatedAt` (DateTime), `deletedAt` (DateTime, null) |
| `FileShare` | `file_shares` | `id` (Char(36), PK), `fileId` (Char(36), FK), `userId` (Char(36), FK), `token` (VarChar(191), Unique, null), `tokenHash` (VarChar(255), Unique), `enabled` (Boolean, default true), `expiresAt` (DateTime, null), `createdAt` (DateTime), `updatedAt` (DateTime) |
| `FilePreviewToken` | `file_preview_tokens` | `id` (Char(36), PK), `fileId` (Char(36), FK), `userId` (Char(36), FK), `tokenHash` (VarChar(255), Unique), `expiresAt` (DateTime), `createdAt` (DateTime) |
| `Folder` | `folders` | `id` (Char(36), PK), `userId` (Char(36), FK), `parentId` (Char(36), FK, null), `connectedAccountId` (Char(36), FK, null), `provider` (VarChar(32), default "google_drive"), `providerFolderId` (VarChar(191), null), `name` (VarChar(255)), `color` (VarChar(64), default "text-blue-500"), `iconUrl` (Text, null), `createdAt` (DateTime), `updatedAt` (DateTime), `deletedAt` (DateTime, null) |
| `UploadSession` | `upload_sessions` | `id` (Char(36), PK), `userId` (Char(36), FK), `targetConnectedAccountId` (Char(36), FK, null), `folderId` (Char(36), FK, null), `fileName` (VarChar(255)), `mimeType` (VarChar(191)), `sizeBytes` (BigInt), `status` (VarChar(32)), `googleSessionUri` (Text, null), `errorMessage` (Text, null), `createdAt` (DateTime), `completedAt` (DateTime, null) |
| `AuditLog` | `audit_logs` | `id` (Char(36), PK), `userId` (Char(36), FK, null), `action` (VarChar(191)), `entityType` (VarChar(191)), `entityId` (Char(36), null), `metadata` (Json, null), `createdAt` (DateTime) |
| `WorkspaceInvite` | `workspace_invites` | `id` (Char(36), PK), `inviterId` (Char(36), FK), `inviteeEmail` (VarChar(191)), `targetType` (VarChar(32), default "file"), `targetId` (Char(36), default ""), `role` (VarChar(32), default "viewer"), `status` (VarChar(32), default "pending"), `revokedAt` (DateTime, null), `acceptedAt` (DateTime, null), `createdAt` (DateTime), `updatedAt` (DateTime). Unique: `[inviterId, inviteeEmail, targetType, targetId]` |

### 3.5 Full Dependencies Manifest

#### Backend (`backend/package.json`)
- **dependencies**:
  - `@aws-sdk/client-s3`: `^3.954.0`
  - `@aws-sdk/lib-storage`: `^3.954.0`
  - `@prisma/client`: `^6.19.3`
  - `archiver`: `^8.0.0`
  - `argon2`: `^0.44.0`
  - `busboy`: `^1.6.0`
  - `cors`: `^2.8.6`
  - `dotenv`: `^17.4.2`
  - `express`: `^5.2.1`
  - `googleapis`: `^173.0.0`
  - `jsonwebtoken`: `^9.0.3`
  - `prisma`: `^6.19.3`
  - `undici`: `^7.27.1` (declared, but unused in code)
  - `zod`: `^4.4.3`
- **devDependencies**:
  - `@types/archiver`: `^8.0.0`
  - `@types/busboy`: `^1.5.4`
  - `@types/cors`: `^2.8.19`
  - `@types/express`: `^5.0.6`
  - `@types/jsonwebtoken`: `^9.0.10`
  - `@types/node`: `^25.9.1`
  - `tsx`: `^4.22.4`
  - `typescript`: `^6.0.3`

#### Frontend (`frontend/package.json`)
- **dependencies**:
  - `class-variance-authority`: `^0.7.1`
  - `clsx`: `^2.1.1`
  - `lucide-react`: `^1.17.0`
  - `react`: `^19.2.7`
  - `react-dom`: `^19.2.7`
  - `react-router-dom`: `^7.16.0`
  - `tailwind-merge`: `^3.6.0`
- **devDependencies**:
  - `@tailwindcss/postcss`: `^4.3.0`
  - `@types/react`: `^19.2.16`
  - `@types/react-dom`: `^19.2.3`
  - `@vitejs/plugin-react`: `^6.0.2`
  - `autoprefixer`: `^10.5.0` (declared, but unused with Tailwind v4)
  - `postcss`: `^8.5.15`
  - `tailwindcss`: `^4.3.0`
  - `typescript`: `~6.0.2`
  - `vite`: `^8.0.12`
  - `vite-plugin-pwa`: `^1.3.0`

---

## 4. Authentication and Google Integration

### 4.1 Google OAuth Flow (Step-by-Step)
1. **Initiation**:
   - **Login/Registration flow**: User clicks "Continue with Google" -> Frontend calls `GET /auth/google/url` -> Backend looks up active global `ProviderConfig` (or seeds it on-the-fly from env vars `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`), generates a random `state`, saves sha256 hash in `oauth_states` table (`flow = 'login'`, expires in 10 minutes), and returns Google Auth URL generated via `oauth2Client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', include_granted_scopes: true, scope, state })`.
   - **Account connection flow**: User clicks "Connect Drive" -> Frontend calls `GET /connected-accounts/google/connect-url` -> Backend generates random `state`, saves in `oauth_states` (`flow = 'connect'`, linked to `userId`), and returns Google Auth URL.
2. **Consent & Callback**:
   - Google redirects the user browser to `GOOGLE_REDIRECT_URI` (`http://localhost:4000/connected-accounts/google/callback`).
   - Callback handler parses `code` and `state`, verifies state hash in DB, marks state `usedAt`.
   - Exchanges code for tokens via `client.getToken(code)`.
   - Fetches user profile via Google OAuth2 v2 (`oauth2.userinfo.get()`).
3. **Login Handoff**:
   - If `flow === 'login'`: Upserts `User` row by email. Upserts `ConnectedAccount` row with encrypted tokens. Syncs Google storage quota. Generates random `handoffToken`, stores sha256 hash in `auth_handoffs` table (expires in 5 minutes). Redirects browser to `${FRONTEND_URL}/google-auth?token=${handoffToken}`.
   - Frontend `GoogleAuthPage` calls `POST /auth/google/exchange` with `{ token }`. Backend verifies and marks handoff token used, creates a `UserSession` with hashed refresh token, and returns `{ accessToken, refreshToken, user }`. Frontend stores tokens in `localStorage` and navigates to `/all-files`.
4. **Connect Completion**:
   - If `flow === 'connect'`: Upserts `ConnectedAccount` row linked to existing `userId`. Syncs storage quota. Starts initial folder/file sync in background. Redirects browser to `${FRONTEND_URL}/google-connected?status=success`.
   - In popup window, `GoogleConnectedPage` sends `window.opener.postMessage({ type: 'GOOGLE_CONNECTED', status: 'success' })` and closes window.

### 4.2 OAuth Library & Implementation
- Custom implementation using official Google SDK `googleapis` (`google.auth.OAuth2`).
- Passport.js, NextAuth, or other high-level OAuth libraries: NOT FOUND.

### 4.3 Google Scopes Requested
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

### 4.4 Token Storage & Encryption
- **Google OAuth Tokens**:
  - `access_token` and `refresh_token` are stored in MySQL `connected_accounts` table as `access_token_encrypted` and `refresh_token_encrypted`.
  - Encryption: AES-256-GCM using `TOKEN_ENCRYPTION_KEY` (sha256 digest of key). Stored format: `<base64(iv)>:<base64(tag)>:<base64(ciphertext)>`.
- **App Session Refresh Tokens**:
  - Stored in MySQL `user_sessions` table as `refresh_token_hash` (sha256 hash of random 32-byte base64url token). Raw token is never stored in DB.
- **Frontend App Tokens**:
  - Stored in browser `localStorage`:
    - `drivesync.accessToken` (fallback: `9drive.accessToken`)
    - `drivesync.refreshToken` (fallback: `9drive.refreshToken`)
    - `drivesync.user` (fallback: `9drive.user`)

### 4.5 Token Refresh Mechanisms
- **Google Tokens**:
  - Implemented in `backend/src/modules/google/google.service.ts` (`getAuthedGoogleClient`).
  - Checks if `tokenExpiresAt < Date.now() + 60_000` (within 60 seconds of expiration).
  - Calls `client.refreshAccessToken()`, encrypts new `access_token`, updates DB record and expiry.
- **App JWT Tokens**:
  - JWT Access Token signed with `JWT_ACCESS_SECRET` (default TTL: 900s / 15m; docker default 3600s).
  - When frontend `apiFetch` receives HTTP 401, it calls `POST /auth/refresh` sending `refreshToken`.
  - Backend verifies unrevoked session where `expiresAt > now()`, and returns a new JWT access token.
  - Frontend retries original request with the new access token.

### 4.6 Multi-Account Modeling
- Modeled via `ConnectedAccount` table with composite unique index `@@unique([userId, provider, providerAccountId])`.
- A user can connect unlimited Google Drive accounts and S3 configs.
- Each connected account has a corresponding `StorageAccount` tracking `totalBytes`, `usedBytes`, `availableBytes`, and `trashBytes`.
- Upload routing policy in `upload_routing_policies` controls distribution across accounts.

### 4.7 Session Handling
- Stateless Bearer JWT access tokens for API requests (`sub: userId`, `sid: sessionId`).
- Stateful database session in `user_sessions` validated on every request (`requireAuth` checks `session.revokedAt` and `session.expiresAt`).
- Express sessions / cookies: NOT FOUND.

---

## 5. API Inventory

### 5.1 Backend Endpoints Table

| Method | Path | Purpose | Auth Required | Request Body | Response Shape | File Location |
|---|---|---|---|---|---|---|
| `GET` | `/health` | Service health check | None | None | `{ status: "ok" }` | `backend/src/app.ts` |
| `POST` | `/api/v1/uploads` | Public API multipart file upload | API Key (`files:upload`) | `multipart/form-data` (`filesMeta`, files) | `{ file: File }` or `{ files: File[], failed: [] }` | `backend/src/modules/public-api/public-api.routes.ts` |
| `GET` | `/public/files/:token` | Get metadata for shared file | None | None | `{ file: { id, name, mimeType, sizeBytes, createdAt } }` | `backend/src/modules/public/public.routes.ts` |
| `GET` | `/public/files/:token/download` | Download public shared file stream | None | None | Binary stream (`Content-Disposition: attachment`) | `backend/src/modules/public/public.routes.ts` |
| `GET` | `/public/files/:token/preview` | Stream inline preview of shared file | None | None | Binary stream (`Content-Disposition: inline`) | `backend/src/modules/public/public.routes.ts` |
| `POST` | `/auth/register` | Register new user | None | `{ name, email, password, captchaToken? }` | `{ accessToken, refreshToken, user: { id, name, email } }` | `backend/src/modules/auth/auth.routes.ts` |
| `POST` | `/auth/login` | Login with credentials | None | `{ email, password }` | `{ accessToken, refreshToken, user: { id, name, email } }` | `backend/src/modules/auth/auth.routes.ts` |
| `GET` | `/auth/google/url` | Get Google login consent URL | None | None | `{ url: string }` | `backend/src/modules/auth/auth.routes.ts` |
| `GET` | `/auth/google/callback` | OAuth redirect callback for login | None | Query: `code`, `state` | Redirects to `/google-auth?token=...` or error | `backend/src/modules/auth/auth.routes.ts` |
| `POST` | `/auth/google/exchange` | Exchange one-time handoff token | None | `{ token: string }` | `{ accessToken, refreshToken, user }` | `backend/src/modules/auth/auth.routes.ts` |
| `POST` | `/auth/refresh` | Refresh JWT access token | None | `{ refreshToken: string }` | `{ accessToken: string }` | `backend/src/modules/auth/auth.routes.ts` |
| `POST` | `/auth/logout` | Revoke current session | Bearer JWT | None | `{ status: "ok" }` | `backend/src/modules/auth/auth.routes.ts` |
| `GET` | `/auth/me` | Get current logged in user | Bearer JWT | None | `{ user: { id, name, email, status } }` | `backend/src/modules/auth/auth.routes.ts` |
| `GET` | `/api-keys` | List user API keys | Bearer JWT | None | `{ apiKeys: ApiKey[] }` | `backend/src/modules/api-keys/api-key.routes.ts` |
| `POST` | `/api-keys` | Create scoped API key | Bearer JWT | `{ name, expiresAt? }` | `{ apiKey: ApiKey, secret: string }` | `backend/src/modules/api-keys/api-key.routes.ts` |
| `DELETE` | `/api-keys/:id` | Revoke an API key | Bearer JWT | None | `{ status: "ok" }` | `backend/src/modules/api-keys/api-key.routes.ts` |
| `GET` | `/provider-configs` | List user OAuth configs | Bearer JWT | None | `{ configs: ProviderConfig[] }` | `backend/src/modules/provider-configs/provider-config.routes.ts` |
| `POST` | `/provider-configs/google` | Create user Google OAuth config | Bearer JWT | `{ clientId, clientSecret, redirectUri, scopes }` | Created config summary | `backend/src/modules/provider-configs/provider-config.routes.ts` |
| `DELETE` | `/provider-configs/:id` | Delete user OAuth config | Bearer JWT | None | `{ status: "ok" }` | `backend/src/modules/provider-configs/provider-config.routes.ts` |
| `GET` | `/connected-accounts` | List connected accounts & quotas | Bearer JWT | None | `{ accounts: ConnectedAccount[] }` | `backend/src/modules/connected-accounts/connected-account.routes.ts` |
| `POST` | `/connected-accounts/s3` | Connect S3 storage account | Bearer JWT | `{ name, bucket, region, endpoint?, accessKeyId, secretAccessKey, forcePathStyle?, quotaBytes? }` | `{ account: ConnectedAccount }` | `backend/src/modules/connected-accounts/connected-account.routes.ts` |
| `GET` | `/connected-accounts/google/connect-url` | Get URL to connect Google Drive | Bearer JWT | Query: `providerConfigId?` | `{ url: string }` | `backend/src/modules/connected-accounts/connected-account.routes.ts` |
| `GET` | `/connected-accounts/google/connect` | Redirect to Google OAuth consent | Bearer JWT | Query: `providerConfigId?` | HTTP 302 Redirect to Google | `backend/src/modules/connected-accounts/connected-account.routes.ts` |
| `GET` | `/connected-accounts/google/callback` | OAuth redirect callback (all flows) | None | Query: `code`, `state` | Redirects to `/google-connected` or `/google-auth` | `backend/src/modules/connected-accounts/connected-account.routes.ts` |
| `POST` | `/connected-accounts/:id/sync-quota` | Sync quota for account | Bearer JWT | None | `{ quota: StorageAccount }` | `backend/src/modules/connected-accounts/connected-account.routes.ts` |
| `DELETE` | `/connected-accounts/:id` | Disconnect storage account | Bearer JWT | None | `{ status: "ok" }` | `backend/src/modules/connected-accounts/connected-account.routes.ts` |
| `GET` | `/storage/summary` | Combined quota summary | Bearer JWT | None | `{ totalBytes, usedBytes, availableBytes, accounts }` | `backend/src/modules/storage/storage.routes.ts` |
| `GET` | `/storage/routing-policy` | Get upload routing policy | Bearer JWT | None | `{ policy: UploadRoutingPolicy }` | `backend/src/modules/storage/storage.routes.ts` |
| `PATCH` | `/storage/routing-policy` | Update upload routing policy | Bearer JWT | `{ mode: 'most_available'\|'round_robin'\|'priority', priorityAccountIds? }` | `{ policy: UploadRoutingPolicy }` | `backend/src/modules/storage/storage.routes.ts` |
| `GET` | `/storage/breakdown` | File type breakdown by kind | Bearer JWT | None | `{ photo: string, video: string, document: string }` | `backend/src/modules/storage/storage.routes.ts` |
| `POST` | `/uploads` | Multipart file upload | Bearer JWT | `multipart/form-data` (`filesMeta`, `sizeBytes`, files) | `{ file: File }` or `{ files: File[], failed: [] }` | `backend/src/modules/uploads/upload.routes.ts` |
| `POST` | `/uploads/resumable/init` | Initialize resumable upload | Bearer JWT | `{ fileName, mimeType, sizeBytes, folderId?, targetAccountId? }` | `{ sessionId: string, provider: string, offset: 0 }` | `backend/src/modules/uploads/upload.routes.ts` |
| `GET` | `/uploads/resumable/status/:id` | Query resumable upload offset | Bearer JWT | None | `{ status: "uploading"\|"completed"\|"failed", offset: string }` | `backend/src/modules/uploads/upload.routes.ts` |
| `PUT` | `/uploads/resumable/chunk/:id` | Upload resumable chunk | Bearer JWT | Binary stream with header `Content-Range: bytes X-Y/Z` | `{ status: string, offset?: string, file?: File }` | `backend/src/modules/uploads/upload.routes.ts` |
| `GET` | `/files/preview/:token` | Preview file using preview token | None | Header: `Range?` | Binary stream (`inline`) | `backend/src/modules/files/file.routes.ts` |
| `GET` | `/files` | List active files with filters | Bearer JWT | Query: `folderId?`, `q?`, `kind?`, `accountId?`, `minSize?`, `maxSize?`, `startDate?`, `endDate?` | `{ files: File[] }` | `backend/src/modules/files/file.routes.ts` |
| `PATCH` | `/files/batch` | Batch move files to folder | Bearer JWT | `{ fileIds: string[], folderId?: string\|null }` | `{ status: "ok", moved: number }` | `backend/src/modules/files/file.routes.ts` |
| `DELETE` | `/files/batch` | Batch soft-delete files to trash | Bearer JWT | `{ fileIds: string[] }` | `{ status: "ok", deleted: number }` | `backend/src/modules/files/file.routes.ts` |
| `GET` | `/files/trash` | List deleted files | Bearer JWT | Query: `q?` | `{ files: File[] }` | `backend/src/modules/files/file.routes.ts` |
| `POST` | `/files/batch/restore` | Batch restore files from trash | Bearer JWT | `{ fileIds: string[] }` | `{ status: "ok", restored: number }` | `backend/src/modules/files/file.routes.ts` |
| `DELETE` | `/files/batch/permanent` | Batch permanently delete files | Bearer JWT | `{ fileIds: string[] }` | `{ status: "ok", deleted: number, failed: [] }` | `backend/src/modules/files/file.routes.ts` |
| `GET` | `/files/shared-links` | List user's active file shares | Bearer JWT | None | `{ shares: FileShare[] }` | `backend/src/modules/files/file.routes.ts` |
| `POST` | `/files/sync-google` | Trigger Drive folder sync | Bearer JWT | `{ connectedAccountId? }` | `{ status: "ok", results: [] }` | `backend/src/modules/files/file.routes.ts` |
| `GET` | `/files/:id` | Get file metadata | Bearer JWT | None | `{ file: File }` | `backend/src/modules/files/file.routes.ts` |
| `PATCH` | `/files/:id` | Rename or move single file | Bearer JWT | `{ name?, folderId? }` | `{ file: File }` | `backend/src/modules/files/file.routes.ts` |
| `POST` | `/files/:id/share` | Create/retrieve public share URL | Bearer JWT | None | `{ url: string, shareId: string }` | `backend/src/modules/files/file.routes.ts` |
| `POST` | `/files/:id/public-permission` | Set GDrive permission to public | Bearer JWT | None | `{ status: "ok", url: string }` | `backend/src/modules/files/file.routes.ts` |
| `DELETE` | `/files/:id/share` | Disable public share for file | Bearer JWT | None | `{ status: "ok" }` | `backend/src/modules/files/file.routes.ts` |
| `POST` | `/files/:id/preview-token` | Generate temporary preview token | Bearer JWT | None | `{ path: string, url: string }` | `backend/src/modules/files/file.routes.ts` |
| `GET` | `/files/:id/view-url` | Get GDrive web link & make public | Bearer JWT | None | `{ url: string\|null }` | `backend/src/modules/files/file.routes.ts` |
| `GET` | `/files/:id/download` | Stream download file | Bearer JWT | Header: `Range?` | Binary stream (`attachment`) | `backend/src/modules/files/file.routes.ts` |
| `DELETE` | `/files/:id` | Soft delete single file | Bearer JWT | None | `{ status: "ok" }` | `backend/src/modules/files/file.routes.ts` |
| `POST` | `/files/batch-download` | Stream multiple files as zip | Bearer JWT | `{ fileIds: string[] }` | Binary ZIP stream (`Content-Type: application/zip`) | `backend/src/modules/files/file.routes.ts` |
| `GET` | `/folders` | List virtual folders | Bearer JWT | Query: `parentId?`, `all?` | `{ folders: Folder[] }` | `backend/src/modules/folders/folder.routes.ts` |
| `GET` | `/folders/recent` | List recent virtual folders | Bearer JWT | Query: `limit?` (max 4) | `{ folders: Folder[] }` | `backend/src/modules/folders/folder.routes.ts` |
| `POST` | `/folders` | Create virtual folder | Bearer JWT | `{ name, color?, iconUrl?, parentId? }` | `{ folder: Folder }` | `backend/src/modules/folders/folder.routes.ts` |
| `PATCH` | `/folders/:id` | Rename, recolor, move folder | Bearer JWT | `{ name?, color?, iconUrl?, parentId? }` | `{ folder: Folder }` | `backend/src/modules/folders/folder.routes.ts` |
| `DELETE` | `/folders/:id` | Delete folder & contents | Bearer JWT | None | `{ status: "ok" }` | `backend/src/modules/folders/folder.routes.ts` |
| `GET` | `/invites` | List sent & received invites | Bearer JWT | None | `{ sent: [], received: [], invites: [] }` | `backend/src/modules/invites/invite.routes.ts` |
| `POST` | `/invites` | Invite user to file or folder | Bearer JWT | `{ email, role, targetType, targetId }` | `{ invite: Invite }` | `backend/src/modules/invites/invite.routes.ts` |
| `DELETE` | `/invites/:id` | Revoke invite | Bearer JWT | None | `{ status: "ok" }` | `backend/src/modules/invites/invite.routes.ts` |
| `GET` | `/audit-logs` | Get activity audit trail | Bearer JWT | None | `{ logs: AuditLog[] }` (max 100) | `backend/src/modules/audit-logs/audit-log.routes.ts` |
| `POST` | `/system/update` | Trigger git pull / update script | Bearer JWT | None | `{ status: string, message: string }` | `backend/src/modules/system/system.routes.ts` |
| `GET` | `/system/update-log` | Read background update log | Bearer JWT | None | `{ log: string }` | `backend/src/modules/system/system.routes.ts` |
| `GET` | `/system/google-config` | Read global Google OAuth config | Bearer JWT | None | `{ exists, clientId, redirectUri, hasSecret, defaultRedirectUri }` | `backend/src/modules/system/system.routes.ts` |
| `POST` | `/system/google-config` | Update global Google OAuth config | Bearer JWT | `{ clientId, clientSecret?, redirectUri? }` | `{ status: "success", message, id }` | `backend/src/modules/system/system.routes.ts` |
| `GET` | `/system/backup` | Download SQLite database file | Bearer JWT | None | Binary stream (Broken for MySQL) | `backend/src/modules/system/system.routes.ts` |
| `POST` | `/system/restore` | Restore SQLite database file | Bearer JWT | `multipart/form-data` (file) | `{ status: "success", message }` (Broken for MySQL) | `backend/src/modules/system/system.routes.ts` |

### 5.2 External Google APIs Called

| Google Service | API Version | Methods / Endpoints Called | Calling Function / File |
|---|---|---|---|
| **Google Drive API** | v3 | `drive.about.get` (`storageQuota,user`) | `syncGoogleQuota()` in `backend/src/modules/google/google.service.ts` |
| **Google Drive API** | v3 | `drive.files.list` (`q, spaces, fields, pageSize, pageToken`) | `ensureGoogleAppFolder()`, `syncGoogleAppFolderFiles()` in `backend/src/modules/google/google.service.ts` |
| **Google Drive API** | v3 | `drive.files.create` (`name, mimeType, parents, media`) | `ensureGoogleAppFolder()` in `google.service.ts`; `folderRouter.post`, `ensureProviderFolderIds` in `folder.routes.ts`; `handleUpload` in `upload.routes.ts` |
| **Google Drive API** | v3 | `drive.files.update` (`name, addParents, removeParents`) | `fileRouter.patch('/:id')` in `file.routes.ts`; `folderRouter.patch('/:id')` in `folder.routes.ts` |
| **Google Drive API** | v3 | `drive.files.delete` (`fileId`) | `fileRouter.delete('/batch/permanent')` in `file.routes.ts`; `folderRouter.delete('/:id')` in `folder.routes.ts` |
| **Google Drive API** | v3 | `drive.files.get` (`webViewLink,webContentLink,parents`) | `fileRouter.get('/:id/view-url')`, `fileRouter.post('/:id/public-permission')` in `file.routes.ts`; `folderRouter.patch` in `folder.routes.ts` |
| **Google Drive API** | v3 | `drive.permissions.create` (`role: 'writer', type: 'anyone'`) | `handleUpload`, resumable chunk completion in `upload.routes.ts`; `view-url`, `public-permission` in `file.routes.ts` |
| **Google Drive REST** | v3 | `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable` | Resumable upload init in `backend/src/modules/uploads/upload.routes.ts` |
| **Google Drive REST** | v3 | `PUT <googleSessionUri>` (`Content-Range`, `Range`) | Query status & stream chunks in `backend/src/modules/uploads/upload.routes.ts` |
| **Google Drive REST** | v3 | `GET https://www.googleapis.com/drive/v3/files/:id/export?mimeType=...` | Stream Google Docs/Sheets to PDF/XLSX in `backend/src/modules/files/stream-google-file.ts` & `file.routes.ts` |
| **Google Drive REST** | v3 | `GET https://www.googleapis.com/drive/v3/files/:id?alt=media` | Stream media download/inline preview with byte range in `backend/src/modules/files/stream-google-file.ts` |
| **Google OAuth2 API** | v2 | `oauth2.userinfo.get()` | Google login callback in `auth.routes.ts`; Google connect callback in `connected-account.routes.ts` |
| **Google reCAPTCHA** | v2/v3 | `POST https://www.google.com/recaptcha/api/siteverify` | `verifyCaptcha()` in `backend/src/modules/auth/auth.routes.ts` |
| **Gmail / Calendar / People / Others** | - | NOT FOUND | None |

---

## 6. Frontend Inventory

### 6.1 Pages & Routes

| Route | File Path | Purpose |
|---|---|---|
| `/login` | `frontend/src/pages/LoginPage.tsx` | Email/password login and "Continue with Google" button. |
| `/register` | `frontend/src/pages/RegisterPage.tsx` | Account registration with name, email, password, optional reCAPTCHA. |
| `/google-auth` | `frontend/src/pages/GoogleAuthPage.tsx` | Landing page for Google OAuth sign-in handoff token exchange. |
| `/google-connected` | `frontend/src/pages/GoogleConnectedPage.tsx` | Popup callback handler for connecting additional Drive accounts (`postMessage`). |
| `/public/files/:token` | `frontend/src/pages/PublicFilePage.tsx` | Public file viewer with inline preview and direct download. |
| `/public/files/:token/embed` | `frontend/src/pages/PublicFilePage.tsx` | Frameless iframe embed version of public preview. |
| `/all-files` | `frontend/src/pages/AllFilesPage.tsx` | Main dashboard view: folder tree, file grid/table, context menus, search, uploads, move/rename modals. |
| `/quota` | `frontend/src/pages/QuotaTrackerPage.tsx` | Multi-account quota aggregation, storage breakdown, upload routing policy ordering. |
| `/shared` | `frontend/src/pages/SharedPage.tsx` | Sent and received workspace invites for files/folders. |
| `/recent` | `frontend/src/pages/RecentPage.tsx` | Recently accessed files (currently renders hardcoded mock data). |
| `/starred` | `frontend/src/pages/StarredPage.tsx` | Starred files (currently renders hardcoded mock data; link disabled in sidebar). |
| `/archived` | `frontend/src/pages/ArchivedPage.tsx` | Archived files (currently renders hardcoded mock data; not linked in sidebar). |
| `/trash` | `frontend/src/pages/TrashPage.tsx` | Recycle bin: view soft-deleted files, batch restore, batch permanent delete. |
| `/activity` | `frontend/src/pages/ActivityLogPage.tsx` | Audit log trail displaying user actions (upload, move, trash, restore, folders). |
| `/settings` | `frontend/src/pages/SettingsPage.tsx` | Account profile, connect Google Drive/S3, global Google OAuth credentials, database backup/restore, system updates. |
| `/api` | `frontend/src/pages/ApiManagementPage.tsx` | Manage API keys, view upload docs, copy cURL / JavaScript snippets. |

### 6.2 Major Components

| Component Name | File Path | Purpose | APIs Called |
|---|---|---|---|
| `DriveLayout` | `frontend/src/layouts/DriveLayout.tsx` | Shell layout containing sidebar, header search, advanced filters modal, system status notification popup, theme toggle, and global upload progress panel. | `GET /auth/me`, `GET /storage/summary`, `GET /storage/breakdown`, `GET /connected-accounts`, `POST /auth/logout` |
| `UploadProvider` | `frontend/src/context/UploadContext.tsx` | Global context providing multi-file resumable uploading, chunk sequencing, retry failed uploads, progress status, and event dispatching. | `POST /uploads/resumable/init`, `GET /uploads/resumable/status/:id`, `PUT /uploads/resumable/chunk/:id` |
| `FileTable` | `frontend/src/components/drive/FileTable.tsx` | Responsive table view for files with column sorting, checkboxes, context menus, and inline action buttons. | Dispatches context events |
| `FileGrid` | `frontend/src/components/drive/FileGrid.tsx` | Responsive grid view for files with icon/thumbnail previews, multi-select, and context menu triggers. | Dispatches context events |
| `FolderGrid` | `frontend/src/components/drive/FolderGrid.tsx` | Grid view for virtual folders with customizable icon and color, click navigation, drag-over target for moving files. | `PATCH /files/batch` via drop handler |
| `FileContextMenu` | `frontend/src/components/drive/FileContextMenu.tsx` | Custom right-click context menu on file items (Preview, Download, Rename, Move, Share, Public Link, Invite, Details, Delete). | None (calls parent callbacks) |
| `FolderContextMenu` | `frontend/src/components/drive/FolderContextMenu.tsx` | Custom right-click context menu on folders (Cut, Rename, Invite, Copy Link, Delete). | None (calls parent callbacks) |
| `EmptyAreaContextMenu` | `frontend/src/components/drive/EmptyAreaContextMenu.tsx` | Right-click context menu on blank page background (Upload, New Folder, Paste Folder). | None (calls parent callbacks) |
| `FileDetailsDrawer` | `frontend/src/components/drive/FileDetailsDrawer.tsx` | Slide-over drawer presenting comprehensive file metadata (name, size, type, location, storage account, dates). | None |
| `DummyModal` | `frontend/src/components/drive/DummyModal.tsx` | Reusable accessible modal dialog wrapper with backdrop, escape key handler, and close button. | None |
| `PageHeader` | `frontend/src/components/drive/PageHeader.tsx` | Standardized page header with title, subtitle, and dynamic action buttons. | None |
| `MetricCard` | `frontend/src/components/drive/MetricCard.tsx` | Stat card with Lucide icon, large numeric value, and descriptive label. | None |
| `AvatarStack` | `frontend/src/components/drive/AvatarStack.tsx` | Visual stack of collaborator avatars. | None |
| `BrandLogo` | `frontend/src/components/drive/BrandLogo.tsx` | SVG geometric logo. | None |
| `GoogleLogo` | `frontend/src/components/auth/GoogleLogo.tsx` | Official 4-color Google logo SVG. | None |
| `ProtectedRoute` | `frontend/src/components/auth/ProtectedRoute.tsx` | Route guard checking `getAccessToken()`, redirecting to `/login` if unauthenticated. | None |
| `Button` | `frontend/src/components/ui/button.tsx` | CVA button primitive with variants: `default`, `outline`, `ghost`, `soft`, `danger`. | None |
| `Card` | `frontend/src/components/ui/card.tsx` | Rounded bordered card container with glassmorphism classes. | None |
| `Input` | `frontend/src/components/ui/input.tsx` | Styled HTML input primitive. | None |

### 6.3 Global State & Storage
- **Auth State**: Stored in `localStorage` under `drivesync.accessToken`, `drivesync.refreshToken`, `drivesync.user`.
- **Upload State**: Held in `UploadContext.tsx` (`uploadProgress` object: open, fileName, percent, status, files array; and `resumableSessions` record).
- **Theme State**: Light / Dark mode stored in `localStorage.getItem('drivesync:theme')`, applied as `.dark` / `.light` class on `document.documentElement`.
- **View Preferences**:
  - File view mode (`'list'` vs `'grid'`) in `localStorage.getItem('drivesync:all-files-view-mode')`.
  - Folder grid scale (`'xs'`, `'sm'`, `'md'`, `'lg'`) in `localStorage.getItem('drivesync:folder-size')`.
- **Cross-Component Events**: Browser `window.dispatchEvent` / `window.addEventListener`:
  - `drivesync:storage-changed`: triggers sidebar and quota tracker reload.
  - `drivesync:upload-completed`: triggers file/folder list reload.
  - `drivesync:invites-changed`: triggers shared page reload.
  - `drivesync:open-move-modal`: keyboard shortcut to open move modal.

### 6.4 Custom Hooks & Utilities
- `useUpload()`: Hook in `UploadContext.tsx` to trigger uploads and track progress.
- `useDriveLayoutActions()`: Hook in `DriveLayout.tsx` using `useOutletContext` to inject page-specific header action buttons into the layout header.
- `apiFetch<T>()` (`frontend/src/lib/api.ts`): Fetch wrapper with Bearer token injection, automatic 401 retry via refresh token, and JSON error parsing.
- `formatBytes(bytes)` (`frontend/src/lib/api.ts`): Formats byte integers into B, KB, MB, GB, TB strings.
- `formatDate(date)` (`frontend/src/lib/api.ts`): Formats ISO timestamps using `Intl.DateTimeFormat`.
- `getGravatarUrl(email, size)` (`frontend/src/lib/gravatar.ts`): Fetches Gravatar with fallback to DiceBear Bottts robot SVG avatars.
- `getPreviewKind(mimeType)` (`frontend/src/lib/preview.ts`): Classifies MIME type into `'image'`, `'video'`, `'document'`, `'office'`.
- `officeViewerUrl(url)` (`frontend/src/lib/preview.ts`): Generates Microsoft Office Online iframe URL.
- `ensurePlyr()` / `createPlyr()` (`frontend/src/lib/plyr.ts`): Dynamically injects CDN CSS/JS for Plyr video player.
- `cn(...inputs)` (`frontend/src/lib/utils.ts`): Merges class names with `clsx` and `tailwind-merge`.

### 6.5 Styling, Theme, and Fonts
- **Font**: Manrope (`fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap`) defined in `frontend/index.html` and applied in `frontend/src/style.css`.
- **Theme System**: Custom CSS variables defined in `:root, :root.light` and `:root.dark` in `frontend/src/style.css`:
  - `--bg-gradient`: Multi-point radial gradient with subtle tint.
  - `--text-primary`: `#0f172a` (light) / `#f1f5f9` (dark)
  - `--text-secondary`: `#475569` (light) / `#94a3b8` (dark)
  - `--card-bg`: `rgba(255, 255, 255, 0.45)` (light) / `rgba(18, 24, 43, 0.55)` (dark)
  - Glassmorphism: `backdrop-filter: blur(20px) saturate(130%)` on cards, `blur(25px)` on sidebar.
- **Button Tokens**:
  - Primary button: `linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)` with glowing drop shadow.
  - Success/Emerald: `#10b981`, Warning/Amber: `#f59e0b`, Danger/Red: `#ef4444`.

### 6.6 Assets
- `frontend/public/favicon.svg`: DriveSync cloud icon.
- `frontend/public/icons.svg`: SVG icon sprite.
- `frontend/public/pwa-192x192.svg` & `pwa-512x512.svg`: PWA application icons.
- `frontend/public/maskable-icon.svg`: Maskable Android PWA icon.
- `frontend/src/assets/hero.png`: Unused raster asset (13 KB).
- `frontend/src/assets/typescript.svg`: Unused TS logo (1.3 KB).
- `frontend/src/assets/vite.svg`: Unused Vite logo (8.7 KB).

---

## 7. Features

### 7.1 Existing Features (Working in Code)
- **User Authentication**: Email/Password registration, credential login, password hashing via Argon2, session tracking with hashed refresh tokens.
- **Google OAuth Login**: Direct sign-in/register with Google; seeds Drive account; one-time handoff token exchange.
- **Multi-Account Storage Connection**: Connect multiple Google Drive accounts via popup OAuth flow; connect S3-compatible buckets (AWS, Cloudflare R2, MinIO, Wasabi, Backblaze B2) with access keys and custom endpoints.
- **Storage Quota Aggregation**: Real-time aggregated storage calculation (total, used, available); per-account breakdown; background quota refresh.
- **Smart Upload Routing**: Automatic selection of storage account based on configured policy (`most_available`, `round_robin`, `priority`), with account quota validation before stream start.
- **Resumable Chunked Uploads**: 5MB chunked uploads to Google Drive with `Content-Range` headers; pause/resume/retry capability on network failure.
- **Virtual Hierarchy & Google Drive Sync**: Virtual database folders with custom colors and Iconify icons; automatic 2-way sync with Google Drive folder `drivesync`; self-healing folder ID mappings.
- **File Actions**: Rename files and folders (syncs to Google Drive name); move files to virtual folders; soft-delete to Recycle Bin; batch move; batch trash.
- **Recycle Bin**: Dedicated trash view (`/trash`); batch restore; batch permanent deletion from Google Drive / S3 and MySQL.
- **Batch ZIP Download**: Multi-file selection download streamed as a ZIP archive using `archiver`.
- **Public Sharing**: Generate public share link (`/public/files/:token`); public viewer page with responsive embed mode (`/public/files/:token/embed`).
- **Direct Google Drive Link Generation**: Automatic permission escalation to `role: 'writer', type: 'anyone'` on Google Drive and retrieval of `webViewLink` / `webContentLink`.
- **Multi-Format Preview**: Inline preview modal for images, Plyr video player for streaming video, native browser iframe for PDF/Google Docs, and Microsoft Office Online Viewer for Word/Excel/PowerPoint.
- **Collaborator Invites**: Workspace file/folder invites with 'viewer' or 'editor' roles; sent and received tabs on `/shared`.
- **Programmatic API Keys**: Create and revoke API keys with `files:upload` scope; documentation page with cURL and JavaScript code snippets.
- **Audit Logging**: Comprehensive trail tracking user actions (`CREATE_FOLDER`, `UPDATE_FOLDER`, `DELETE_FOLDER`, `UPLOAD_FILE`, `TRASH_FILE`, `RESTORE_FILE`, `PERMANENT_DELETE_FILE`, `MOVE_FILES`, `UPDATE_FILE`) with metadata rendering.
- **Theme Switcher & PWA**: Dark/Light mode glassmorphism UI; installable Progressive Web App with manifest and service worker.

### 7.2 Partial or Broken Features
1. **Database Backup & Restore (`/system/backup`, `/system/restore`)**:
   - **Broken**: Code in `backend/src/modules/system/system.routes.ts` (`getDatabaseFilePath()`) assumes SQLite local file storage (`file:./dev.db`), doing `fs.createReadStream` and `fs.renameSync`. Because the project runs on MySQL (`mysql://...`), downloading backup returns 404/500 and restore fails or can corrupt the file system. UI in Settings and layout popup also incorrectly labels the engine as "SQLite (Local Database)".
2. **System In-App Update (`/system/update`, `/system/update-log`)**:
   - **Broken in Docker**: Tries to execute `git --version` or `spawn('bash', ['update.sh'])`. Inside the `node:20-alpine` Docker container, `git` and `bash` are not installed, returning an error with a hardcoded VPS IP address (`ssh root@103.65.237.136`).
3. **Recent Files Page (`/recent`)**:
   - **Mock/Partial**: Uses static hardcoded mock data from `drive-data.ts`. It does not connect to `/audit-logs` or any backend recent files API.
4. **Starred Files Page (`/starred`)**:
   - **Mock/Disabled**: Uses static mock data from `drive-data.ts`. Sidebar menu link is explicitly marked `disabled: true`. Prisma schema has no `starred` column.
5. **Archived Files Page (`/archived`)**:
   - **Mock/Orphaned**: Uses static mock data from `drive-data.ts`. Route is registered in `App.tsx`, but no navigation link exists in the sidebar. Prisma schema has no `archived` column.
6. **In-Memory Upload Buffering (`POST /uploads`)**:
   - **Architectural Flaw**: In `upload.routes.ts`, non-resumable multipart uploads buffer the file stream in RAM (`chunks.push(chunk)`, `Buffer.concat(chunks)`). Any file over ~1.5 GB crashes the Node.js process with an Out-of-Memory (OOM) error, contradicting the 5GB declared max limit.
7. **Workspace Invite Access Control**:
   - **Partial**: Invites are created and saved in `workspace_invites`, but `file.routes.ts` and `folder.routes.ts` enforce strict ownership (`where: { userId: req.user.id }`). Accepted invitees cannot actually view, access, or edit the shared files or folders in their own dashboard.

### 7.3 Missing Features Hinted by Code Structure
- Password reset / "Forgot password" flow (no email verification, reset tokens, or mailing provider).
- Trash auto-expiry worker (no scheduled task or cron to permanently purge files after 30 days).
- Virtual folder download as ZIP (can only batch download flat files, not entire folder structures).
- Storage account re-authentication (when Google refresh token is revoked or expires, account enters error state with no one-click re-auth flow).

---

## 8. Environment and Config

### 8.1 Environment Variables

#### Backend Environment Variables
| Variable Name | Required | Default / Format | Where Used |
|---|---|---|---|
| `DATABASE_URL` | Yes | MySQL connection URL (`mysql://...`) | `backend/src/config/env.ts`, `backend/prisma/schema.prisma` |
| `APP_PORT` | No | `4000` | `backend/src/config/env.ts`, `backend/src/server.ts` |
| `FRONTEND_URL` | Yes | URL (`http://localhost:5173`) | `backend/src/config/env.ts`, CORS in `app.ts`, OAuth redirects in `auth.routes.ts`, `connected-account.routes.ts`, public links |
| `JWT_ACCESS_SECRET` | Yes | String (min 32 chars) | `backend/src/config/env.ts`, `backend/src/utils/jwt.ts` |
| `TOKEN_ENCRYPTION_KEY` | Yes | String (min 32 chars) | `backend/src/config/env.ts`, `backend/src/utils/crypto.ts` (AES-256-GCM) |
| `ACCESS_TOKEN_TTL_SECONDS` | No | `900` (15 minutes) | `backend/src/config/env.ts`, `backend/src/utils/jwt.ts` |
| `REFRESH_TOKEN_TTL_DAYS` | No | `30` (30 days) | `backend/src/config/env.ts`, `backend/src/modules/auth/auth.routes.ts` |
| `MAX_UPLOAD_BYTES` | No | `5368709120` (5 GB) | `backend/src/config/env.ts`, `backend/src/modules/uploads/upload.routes.ts` |
| `RECAPTCHA_SECRET_KEY` | No | String (empty disables captcha) | `backend/src/config/env.ts`, `backend/src/modules/auth/auth.routes.ts` |
| `GOOGLE_CLIENT_ID` | Optional* | Google OAuth Client ID string | `seed-google-config.ts`, `seed-google-config-if-present.ts`, fallback in `auth.routes.ts` & `connected-account.routes.ts` |
| `GOOGLE_CLIENT_SECRET` | Optional* | Google OAuth Client Secret string | `seed-google-config.ts`, `seed-google-config-if-present.ts`, fallback in `auth.routes.ts` & `connected-account.routes.ts` |
| `GOOGLE_REDIRECT_URI` | No | `http://localhost:4000/connected-accounts/google/callback` | OAuth redirect generation in `seed-google-config.ts`, `auth.routes.ts`, `connected-account.routes.ts` |
| `API_URL` | No | `http://localhost:4000` | Smoke test script `backend/src/scripts/test-api-upload.ts` |

*\*Note: Google credentials can also be configured dynamically at runtime through the Settings UI and stored encrypted in the `provider_configs` table.*

#### Frontend Environment Variables
| Variable Name | Required | Default / Format | Where Used |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:4000` (or `/api` in production) | `frontend/src/lib/api.ts` |
| `VITE_RECAPTCHA_SITE_KEY` | No | Google reCAPTCHA v2 site key string | `frontend/src/pages/RegisterPage.tsx` |

### 8.2 Configuration Files
- `frontend/vite.config.ts`: Vite 8 configuration with React plugin, PWA plugin, `@/` path alias.
- `frontend/postcss.config.js`: PostCSS plugin configuration (`@tailwindcss/postcss`).
- `frontend/tsconfig.json`: TypeScript configuration targeting `es2023`, `moduleResolution: "bundler"`, paths `@/*`.
- `backend/tsconfig.json`: TypeScript configuration targeting `ES2022`, `NodeNext` modules, output directory `dist`.
- `docker-compose.yml`: Multi-container definition for `mysql` (port 3306), `backend` (port 4000), `frontend` (port 5173 -> 80).
- `frontend/nginx.conf`: Nginx reverse proxy configuration routing `/api/` to `backend:4000` with 5GB max body size and 3600s timeouts.
- `backend/Dockerfile`: Node 20 Alpine container building TypeScript and running Prisma migrations.
- `frontend/Dockerfile`: Multi-stage build (Node 20 Alpine builder -> Nginx 1.27 Alpine runtime).
- `setup.sh` / `setup.ps1`: Shell scripts generating local `.env` files and installing dependencies.
- **ESLint / Prettier / CI/CD Files**: NOT FOUND.

### 8.3 Scripts Manifest

#### Backend Scripts (`backend/package.json`)
- `npm run dev`: `tsx watch src/server.ts`
- `npm run build`: `tsc`
- `npm run start`: `node dist/server.js`
- `npm run start:deploy`: `npm run db:migrate:deploy && node dist/server.js`
- `npm run prisma:generate`: `prisma generate`
- `npm run prisma:migrate`: `prisma migrate dev`
- `npm run db:migrate:deploy`: `prisma migrate deploy`
- `npm run seed:google-config`: `tsx src/scripts/seed-google-config.ts`
- `npm run seed:google-config:docker`: `tsx src/scripts/seed-google-config-if-present.ts`
- `npm run test:s3`: `tsx src/scripts/test-s3-connection.ts`
- `npm run test:api-upload`: `tsx src/scripts/test-api-upload.ts`

#### Frontend Scripts (`frontend/package.json`)
- `npm run dev`: `vite`
- `npm run build`: `tsc && vite build`
- `npm run preview`: `vite preview`

---

## 9. Code Quality and Problems

### 9.1 Language Distribution
- **TypeScript**: 78 files (8,521 lines of code) -> **>99.9%**
- **JavaScript**: 1 file (`frontend/postcss.config.js`, 6 lines) -> **<0.1%**

### 9.2 Security Issues
1. **Tokens Stored in `localStorage`**:
   - `frontend/src/lib/auth.ts`: Stores both JWT access tokens and long-lived refresh tokens in browser `localStorage`. Any Cross-Site Scripting (XSS) vulnerability allows full session hijacking. Refresh tokens must be stored in HTTP-only, Secure, SameSite cookies.
2. **Missing Rate Limiting**:
   - No rate limiting middleware on brute-force sensitive routes: `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /api/v1/uploads`.
3. **Hardcoded IP Address & Command Execution**:
   - `backend/src/modules/system/system.routes.ts`: `POST /system/update` executes `spawn('bash', ['update.sh'])` and `exec('git pull')`. Contains a hardcoded server IP address (`103.65.237.136`) in the error response. Executing arbitrary host shell commands from an Express HTTP endpoint poses severe Remote Code Execution (RCE) risk.
4. **Arbitrary File Overwrite in Database Restore**:
   - `backend/src/modules/system/system.routes.ts`: `POST /system/restore` accepts an unvalidated multipart upload and directly overwrites the database file on disk without file signature verification or transaction protection.
5. **Indiscriminate Public Permissions on Google Drive**:
   - `upload.routes.ts` (lines 230-236, 507-513) and `file.routes.ts` (lines 313-319, 360-366): When files are uploaded or viewed, the backend calls `drive.permissions.create({ fileId, requestBody: { role: 'writer', type: 'anyone' } })`. This makes files globally writable and downloadable to anyone on the internet who obtains the Google file ID.
6. **Dual Storage of Share Tokens**:
   - `schema.prisma`: `FileShare` table stores both plaintext `token` (`token String? @unique`) and `tokenHash`. Plaintext tokens in the database defeat the purpose of token hashing.

### 9.3 Performance Issues
1. **In-Memory RAM Buffering on Uploads**:
   - `backend/src/modules/uploads/upload.routes.ts` lines 181-189: Standard uploads collect stream chunks into an in-memory array (`chunks.push(chunk)`) and run `Buffer.concat(chunks)`. Storing multiple 500MB - 5GB files in Node.js process memory will trigger V8 heap exhaustion and crash the server.
2. **Missing Pagination on Primary Data Endpoints**:
   - `GET /files`, `GET /folders`, `GET /files/trash`, and `GET /connected-accounts` return unbounded lists (`findMany` without `take` or `skip`/cursor). Users with thousands of files will experience slow database queries, huge JSON payloads, and frontend UI lag.
3. **Sequential N+1 Network & Database Calls**:
   - `connected-account.routes.ts`: Sequentially loops over accounts with `await syncQuotaForAccount(account)`.
   - `file.routes.ts`: `DELETE /files/batch/permanent` loops over each file sequentially with `await drive.files.delete()`.
   - `file.routes.ts`: `POST /files/batch-download` fetches files one after another sequentially before adding to the ZIP stream.
   - `folders/folder.routes.ts`: Deletes files and folders from Google Drive sequentially one-by-one.
   - `google.service.ts`: `syncGoogleAppFolderFiles` runs sequential `prisma.folder.create` / `update` inside loops instead of batch operations.
   - `UploadContext.tsx`: Uploads multiple files in a sequential `for` loop rather than concurrent streams.
4. **No HTTP Caching / ETag**:
   - Static file preview and download endpoints do not implement `ETag`, `Cache-Control`, or `Last-Modified` headers.

### 9.4 Duplicate Code, Dead Code, and Unused Dependencies
1. **Dead Code**:
   - `frontend/src/counter.ts`: Leftover template file from Vite init; never imported.
   - `frontend/src/assets/hero.png`, `typescript.svg`, `vite.svg`: Never imported or used.
   - `frontend/src/pages/ArchivedPage.tsx`: Mock page disconnected from navigation.
   - `frontend/src/pages/StarredPage.tsx`: Mock page disabled in navigation.
   - `frontend/src/pages/RecentPage.tsx`: Mock page displaying hardcoded activity array.
2. **Duplicate Routes**:
   - `GET /auth/google/callback` in `auth.routes.ts` duplicates logic with `GET /connected-accounts/google/callback`. Google Redirect URI always directs to the latter, rendering `/auth/google/callback` redundant.
3. **Unused Dependencies**:
   - `backend/package.json`: `undici` is installed as a dependency and mentioned in `AGENTS.md`, but native global `fetch` is used everywhere; `undici` is never imported.
   - `frontend/package.json`: `autoprefixer` is installed in `devDependencies`, but Tailwind CSS v4 uses `@tailwindcss/postcss` and does not use `autoprefixer`.

### 9.5 Missing Tests
- **Automated Test Setup**: NOT FOUND. There is no Jest, Vitest, Playwright, Cypress, or Mocha setup.
- **Existing Scripts**: Only two ad-hoc manual scripts (`backend/src/scripts/test-s3-connection.ts` and `backend/src/scripts/test-api-upload.ts`).

---

## 10. Migration Analysis (Next.js)

### 10.1 Route Handlers vs. Server Actions

| Backend Route / Domain | Target in Next.js App Router | Justification |
|---|---|---|
| `POST /auth/login`, `register`, `logout` | **Server Actions** or **Route Handlers** | Form-based authentication with direct HTTP-only cookie setting (`cookies().set()`). |
| `GET /auth/google/url`, `connect-url` | **Server Actions** or **Route Handlers** | Redirects user to Google OAuth consent page. |
| `GET /connected-accounts/google/callback` | **Route Handler** (`app/api/auth/google/callback/route.ts`) | Incoming HTTP GET callback redirect from Google requiring query parameter handling and session creation. |
| `GET /storage/summary`, `breakdown`, `policy` | **Server Components** / **Server Actions** | Can be fetched directly on the server in React Server Components (RSC) without client-side `apiFetch`. |
| `PATCH /storage/routing-policy` | **Server Action** | Form or button mutation updating DB records. |
| `GET /files`, `GET /folders`, `GET /trash` | **Server Components** with URL search params | RSC direct database queries with fast streaming and Suspense; pagination via searchParams (`?page=1&q=...`). |
| `POST /folders`, `PATCH /folders/:id`, `DELETE /folders/:id` | **Server Actions** | Standard folder mutations with automatic `revalidatePath()`. |
| `PATCH /files/batch`, `DELETE /files/batch` | **Server Actions** | Batch file operations with path revalidation. |
| `POST /uploads` (Standard Multipart) | **Route Handler** (`app/api/uploads/route.ts`) | Multipart streaming requires raw Node.js request body stream (`runtime = 'nodejs'`). |
| `POST /uploads/resumable/init` | **Server Action** or **Route Handler** | Session initialization returning JSON session ID and offset. |
| `GET /uploads/resumable/status/[id]` | **Route Handler** | REST status check returning offset. |
| `PUT /uploads/resumable/chunk/[id]` | **Route Handler** | Binary streaming chunk upload with `Content-Range` header directly piped to Google Drive. |
| `GET /files/[id]/download`, `preview/[token]` | **Route Handler** | Binary streaming responses with custom headers (`Content-Disposition`, `Content-Range`, `Accept-Ranges`). |
| `POST /files/batch-download` | **Route Handler** | Archiver ZIP generation piped to response stream. |
| `GET /public/files/[token]` | **Server Component** (`app/public/files/[token]/page.tsx`) | Shared file viewer page rendered server-side for instant SEO/OpenGraph preview. |
| `POST /api/v1/uploads` | **Route Handler** (`app/api/v1/uploads/route.ts`) | External developer API with API key authorization. |
| `GET /api-keys`, `POST /api-keys`, `DELETE /api-keys` | **Server Actions** | User API key management. |
| `GET /invites`, `POST /invites`, `DELETE /invites` | **Server Actions** | Collaboration invite management. |

### 10.2 Backend Parts That Must Stay Separate
1. **Background Full Folder Sync (`syncGoogleAppFolderFiles`)**:
   - In serverless Next.js deployments (e.g. Vercel), serverless functions freeze immediately after the response is returned, aborting background promises. If Next.js is deployed in a long-running Node container (`output: 'standalone'`), background promises can run, but for reliability with large Google Drive accounts (thousands of files), syncing should be offloaded to a background job queue (e.g. BullMQ with Redis, Inngest, or a lightweight worker).
2. **System Host Updates (`/system/update`)**:
   - Executing shell commands (`git pull`, `docker compose up`) from inside Next.js application code is an anti-pattern and security hazard. Updates must be managed outside the application via CI/CD pipelines (GitHub Actions, webhook runners, or Watchtower).

### 10.3 React Component Reusability

| Component | Migration Strategy | Notes |
|---|---|---|
| `components/ui/button.tsx` | **Reuse as-is** | Standard CVA primitive; fully compatible with Next.js Client & Server Components. |
| `components/ui/card.tsx` | **Reuse as-is** | Pure layout container; compatible as Server Component. |
| `components/ui/input.tsx` | **Reuse as-is** | Standard form input primitive. |
| `components/drive/BrandLogo.tsx`, `FileIcon.tsx` | **Reuse as-is** | Pure SVG and presentational components. |
| `components/drive/MetricCard.tsx` | **Reuse as-is** | Presentational card component. |
| `components/drive/FolderVisual.tsx` | **Reuse as-is** | Color and icon constants. |
| `layouts/DriveLayout.tsx` | **Rewrite into `app/(dashboard)/layout.tsx`** | Replace `react-router-dom` (`NavLink`, `useLocation`, `Outlet`) with Next.js App Router (`next/link`, `usePathname()`, `{children}`). Move user/storage data fetching into Server Layout. |
| `pages/AllFilesPage.tsx` | **Decompose & Rewrite** | Current file is 849 lines containing 10+ modal forms and context menus. Split into: Server Component page (`app/(dashboard)/all-files/page.tsx`), Client file grid/table, separate modal components with Server Actions. |
| `context/UploadContext.tsx` | **Keep as Client Context** | Mark with `'use client'`; replace `API_URL` with relative `/api/...` calls. |
| `components/drive/DummyModal.tsx` | **Refactor** | Convert to Radix UI / Headless UI / native `<dialog>` for better accessibility and focus trapping. |
| `pages/PublicFilePage.tsx` | **Rewrite into Server Component** | `app/public/files/[token]/page.tsx`: Fetch file metadata on the server, render OpenGraph meta tags, and embed media. |

### 10.4 Library Conflicts & Replacements
- **`react-router-dom`**: **Remove**. Replace with Next.js App Router (`next/navigation`: `useRouter`, `usePathname`, `useSearchParams`, `redirect`).
- **`localStorage` Auth**: **Remove**. Replace with HTTP-only cookies managed via Server Actions and Next.js middleware (`next/headers`: `cookies()`).
- **`vite-plugin-pwa`**: **Replace** with `@ducanh2912/next-pwa` or `@serwist/next`.
- **`dotenv` / `cors`**: **Remove** in Next.js (built-in `.env` handling; same-origin calls do not need CORS).
- **`busboy`**: Can be used in Route Handlers (`runtime: 'nodejs'`) by piping the incoming Web Request to a Node stream, or use `request.formData()` for standard forms.

### 10.5 Recommended Phased Migration Plan
- **Phase 1: Next.js Foundation & Database Setup**
  - Initialize Next.js 15+ (App Router, TypeScript, Tailwind CSS v4).
  - Move `backend/prisma/` into root. Configure Prisma Client with edge/standalone compatibility.
  - Set up session management using encrypted HTTP-only session cookies.
- **Phase 2: Authentication & Google OAuth Migration**
  - Implement Next.js Route Handlers for Google OAuth redirect and callback (`/api/auth/google/callback`).
  - Implement login, register, and logout Server Actions with cookie persistence.
  - Test multi-account Google Drive connecting via popup window or redirect.
- **Phase 3: Core Storage & File Operations**
  - Migrate storage summary, quota tracking, and routing policies to Server Actions and RSC.
  - Implement streaming Route Handlers for file download, preview tokens, and batch ZIP download.
  - Implement resumable chunk upload Route Handlers (`/api/uploads/resumable/...`).
- **Phase 4: Dashboard UI & Feature Redesign**
  - Build redesigned dashboard shell layout with responsive sidebar and command bar.
  - Implement All Files view with Server Components, streaming Suspense, and client-side context menus.
  - Implement Recycle Bin, Activity Log, and API Key management pages.
- **Phase 5: Cleanup & Verification**
  - Implement Playwright E2E and Vitest unit tests.
  - Remove dead code, redundant endpoints, and mock files.

### 10.6 Biggest Migration Risks
1. **Large File Streaming in Next.js**: Next.js route handlers handle body streams differently than Express. Streaming multi-gigabyte files to Google Drive without memory buffering requires carefully handling `request.body` (a Web `ReadableStream`) converted to a Node.js stream without breaking serverless payload limits (must run in Node.js standalone runtime, not serverless edge).
2. **Google OAuth Callback Port/Origin Mismatch**: Changing frontend/backend domains or merging them into a single port (e.g. 3000) requires updating authorized redirect URIs in Google Cloud Console.
3. **Database Concurrency & Quota Race Conditions**: Multiple simultaneous chunk uploads updating the same `StorageAccount` record can cause lock contention in MySQL.

---

## 11. Redesign Inputs

### 11.1 Current UI Weaknesses Detected in Code
1. **Glassmorphism CSS Overrides with `!important`**:
   - `frontend/src/style.css` contains over 400 lines of heavy CSS overrides using `!important` on generic selectors (e.g., `p, span, h1, div { color: var(--text-primary) }`, `div.bg-white:not(button) { background-color: transparent !important }`). This breaks standard Tailwind component styling and causes unintended visual bleed.
2. **Missing Loading, Skeleton, and Empty States**:
   - Many pages show basic "Loading..." plain text rather than proper skeleton placeholders.
   - Folders and files render empty text without visual illustrations or onboarding guides.
3. **Mobile & Tablet Layout Constraints**:
   - Advanced search filter dropdown is absolute-positioned and overflows small viewports.
   - Action buttons in `AllFilesPage` duplicate between desktop header injection and a mobile secondary bar.
   - Context menus use raw `event.clientX` / `event.clientY` coordinates without viewport edge boundary detection, causing menus to render off-screen on mobile or near viewport edges.
4. **Accessibility (a11y) Gaps**:
   - `DummyModal` uses a basic `<div>` overlay without ARIA dialog attributes, focus trapping, or `aria-modal`.
   - Context menus lack keyboard arrow-key navigation.
   - Color picker for folders relies solely on color swatches without descriptive text or high-contrast labels.
5. **Inconsistent Component Hierarchy**:
   - `AllFilesPage.tsx` is an 849-line monolith managing 15 separate modals, drawers, and context menus in a single component.

### 11.2 Screens and States Required for Redesign

| Screen | Required States to Cover |
|---|---|
| **Login / Register** | Default, Loading/Submitting, Error alert, reCAPTCHA loaded/expired, Google OAuth redirecting. |
| **Dashboard Shell** | Desktop expanded sidebar, Mobile drawer, Storage quota progress bar, User profile avatar with fallback, Light/Dark theme. |
| **All Files (Folder Tree & Files)** | Initial loading skeleton, Empty folder state, Folder grid (scales: xs, sm, md, lg), File list view, File grid view, Selection active bar (count, batch download, batch move, batch delete), Drop-target active state on folders. |
| **Context Menus & Modals** | File context menu, Folder context menu, Empty area menu, New Folder modal, Rename modal, Move to Folder modal, Delete confirmation modal, File Details drawer, Invite Member modal. |
| **File Preview Modal** | Image preview, Video player (Plyr controls, buffer bar), PDF viewer, Office Document viewer, Unsupported file fallback with download button, Loading spinner, Error state. |
| **Public File Viewer** | Standalone branded viewer, Minimal iframe embed view, Expired/Invalid token error view. |
| **Quota Tracker** | Summary metric cards, Routing policy selector, Account priority ordering (drag or up/down), Account card with progress bar, Manual sync spinning state. |
| **Settings** | User profile card, Connected accounts list, Connect S3 modal, Connect Google Drive popup handler, Google OAuth credentials configuration form with setup guide accordion. |
| **Recycle Bin (Trash)** | Empty trash state, Table list with checkboxes, Select all, Restore selected, Permanent delete confirmation modal. |
| **Activity Log** | Empty state, Loading spinner, Paginated/infinite scroll event list with action badges and JSON metadata viewer. |
| **API Management** | Empty state, Key list with revocation button, "Copy Key Secret Once" modal, Copyable cURL and JavaScript code blocks. |
| **Global Upload Progress** | Minimized floating pill, Expanded multi-file progress list, Uploading spinner, Success checkmark, Error state with retry button. |

### 11.3 Design Tokens Needed (Colors, Fonts, Spacing)
- **Colors**:
  - `brand-primary`: Currently hardcoded gradient `#6366f1` (Indigo 500) to `#4f46e5` (Indigo 600) and `#2563eb` (Blue 600).
  - `status-success`: `#10b981` (Emerald 500), `status-warning`: `#f59e0b` (Amber 500), `status-danger`: `#ef4444` (Red 500).
  - `surface-light`: `#fafcfd`, `surface-dark`: `#090d16`.
  - `card-surface-light`: `rgba(255, 255, 255, 0.7)`, `card-surface-dark`: `rgba(18, 24, 43, 0.7)`.
  - Folder colors: Currently hardcoded as hex array (`#3b82f6`, `#ef4444`, `#10b981`, `#f59e0b`, `#8b5cf6`, `#ec4899`, `#06b6d4`, `#64748b`).
- **Typography**:
  - Primary Font: `Manrope` (weights: 400, 500, 600, 700, 800).
  - Code/Monospace: System mono for API keys and cURL examples.
- **Elevation & Shadows**:
  - Custom button glow: `0 4px 20px rgba(99, 102, 241, 0.35)`.
  - Card elevation: `0 10px 30px rgba(0, 0, 0, 0.04)`.

---

## 12. Open Questions

Before proceeding with the Next.js migration and redesign plan, the following architectural and product questions must be resolved:

1. **Deployment Target & Hosting Model**:
   - Will the consolidated Next.js app be deployed as a Docker container on a VPS (e.g. via `output: 'standalone'`) or on a serverless platform (e.g. Vercel / AWS Amplify)?
   - *Rationale*: Serverless platforms have strict function timeout limits (15–60s) and request body payload limits (4.5MB on Vercel), which would break 5GB file uploads and long-running Google Drive syncs unless uploads go directly to S3/Google Drive via signed URLs or run in a container.
2. **Direct-to-Cloud Uploads vs. Proxied Backend Streaming**:
   - Currently, uploads stream through the backend to Google Drive. Do you want to continue proxying uploads through the Next.js server, or would you prefer client-side direct uploads (using presigned URLs for S3 and Google Drive resumable session URIs returned by the server)?
   - *Rationale*: Direct client-to-cloud uploads eliminate server bandwidth costs, eliminate server memory pressure, and support massive files without timeout risks.
3. **Session & Authentication Architecture**:
   - Do you want to implement NextAuth.js / Auth.js with Google Provider + Credentials Provider, or keep the existing custom JWT + MySQL session table model using HTTP-only cookies?
4. **Google Drive "Public Writer" Permission Behavior**:
   - The current code automatically makes uploaded and viewed Google Drive files publicly writable by anyone with the link (`drive.permissions.create({ role: 'writer', type: 'anyone' })`). Should this security behavior be retained, made optional, or restricted to view-only?
5. **Missing Features (Starred, Archived, Recent)**:
   - Should the migration implement real database models and APIs for Starred files and Archived files, or should those pages and navigation links be removed from the redesigned dashboard?
6. **Workspace Sharing Access Control**:
   - The current workspace invite system allows inviting users by email, but the backend does not grant invited users read/write access to the files in their own dashboard. Should true multi-user team file access be implemented in the migration?
7. **Database Engine**:
   - The production app uses MySQL 8.4 via Prisma, but legacy endpoints and UI text refer to SQLite. Are we standardizing exclusively on MySQL (or PostgreSQL), and should all SQLite backup/restore code be replaced with proper SQL dumps or removed?

