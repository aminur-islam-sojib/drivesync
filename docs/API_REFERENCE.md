# DriveSync Backend API Reference

This document provides the complete, authoritative specification of the ready Express 5 backend API (`backend/`).
The backend runs on `http://localhost:4000` (or the configured `APP_PORT`).

---

## 1. Authentication & Security Conventions

### Headers
* **Protected Routes**: Require `Authorization: Bearer <accessToken>`.
* **Public API Routes**: Require `X-Api-Key: 9d_live_<secret>`.

### Error Responses
All endpoints return standard JSON error structures on failure:
```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable description of error"
}
```

---

## 2. Authentication Endpoints (`/auth`)

### `POST /auth/register`
* **Body**: `{ "name": "string", "email": "string", "password": "string", "captchaToken"?: "string" }`
* **Response (201)**:
  ```json
  {
    "accessToken": "jwt_token",
    "refreshToken": "random_token",
    "user": { "id": "uuid", "name": "string", "email": "string" }
  }
  ```

### `POST /auth/login`
* **Body**: `{ "email": "string", "password": "string" }`
* **Response (200)**:
  ```json
  {
    "accessToken": "jwt_token",
    "refreshToken": "random_token",
    "user": { "id": "uuid", "name": "string", "email": "string" }
  }
  ```

### `POST /auth/refresh`
* **Body**: `{ "refreshToken": "string" }`
* **Response (200)**: `{ "accessToken": "jwt_token" }`

### `POST /auth/logout` *(Auth Required)*
* **Response (200)**: `{ "status": "ok" }`

### `GET /auth/me` *(Auth Required)*
* **Response (200)**: `{ "user": { "id": "uuid", "name": "string", "email": "string", "status": "active" } }`

### `GET /auth/google/url`
* **Purpose**: Generates Google OAuth URL for user sign-in/registration.
* **Response (200)**: `{ "url": "https://accounts.google.com/o/oauth2/v2/auth?..." }`

### `GET /auth/google/callback`
* **Purpose**: Google OAuth redirects here. Backend handles user upsert, initial Drive account connection, quota sync, and redirects to:
  `${FRONTEND_URL}/google-auth?token=${handoffToken}`

### `POST /auth/google/exchange`
* **Purpose**: Frontend on `/google-auth` exchanges the `handoffToken` for access and refresh tokens.
* **Body**: `{ "token": "string" }`
* **Response (200)**:
  ```json
  {
    "accessToken": "jwt_token",
    "refreshToken": "random_token",
    "user": { "id": "uuid", "name": "string", "email": "string" }
  }
  ```

---

## 3. Connected Accounts (Multi-Account Google Drive) (`/connected-accounts`)

### `GET /connected-accounts` *(Auth Required)*
* **Purpose**: Returns all connected storage accounts (Google Drive & S3) with their quota metrics.
* **Response (200)**:
  ```json
  {
    "accounts": [
      {
        "id": "uuid",
        "provider": "google_drive",
        "email": "user@gmail.com",
        "displayName": "User Name",
        "avatarUrl": "https://...",
        "status": "connected",
        "storageAccount": {
          "totalBytes": "16106127360",
          "usedBytes": "5368709120",
          "availableBytes": "10737418240",
          "trashBytes": "104857600",
          "lastSyncedAt": "2026-10-18T00:00:00.000Z"
        }
      }
    ]
  }
  ```

### `GET /connected-accounts/google/connect-url` *(Auth Required)*
* **Purpose**: Generates OAuth URL to connect an additional Google Drive account.
* **Response (200)**: `{ "url": "https://accounts.google.com/o/oauth2/v2/auth?..." }`

### `GET /connected-accounts/google/callback`
* **Purpose**: OAuth callback after connecting a Google account. Links account, syncs files, and redirects to:
  `${FRONTEND_URL}/google-connected?status=success`
* **Frontend Handling**: Open in a popup window; the callback page uses `window.opener.postMessage({ type: 'GOOGLE_CONNECTED' }, window.location.origin)` and closes itself.

### `POST /connected-accounts/:id/sync-quota` *(Auth Required)*
* **Purpose**: Forces a fresh quota check with Google Drive or S3.
* **Response (200)**: `{ "quota": { "totalBytes": "...", "usedBytes": "...", "availableBytes": "...", "trashBytes": "..." } }`

### `DELETE /connected-accounts/:id` *(Auth Required)*
* **Purpose**: Disconnects a storage account.
* **Response (200)**: `{ "status": "ok" }`

### `POST /connected-accounts/s3` *(Auth Required)*
* **Body**: `{ "name": "...", "bucket": "...", "region": "...", "endpoint"?: "...", "accessKeyId": "...", "secretAccessKey": "...", "forcePathStyle"?: boolean, "quotaBytes"?: string }`
* **Response (201)**: `{ "account": { ... } }`

---

## 4. Storage & Quota Management (`/storage`)

### `GET /storage/summary` *(Auth Required)*
* **Purpose**: Aggregated storage statistics across all connected Google Drive and S3 accounts.
* **Response (200)**:
  ```json
  {
    "totalBytes": "32212254720",
    "usedBytes": "10737418240",
    "availableBytes": "21474836480",
    "accounts": [ ... ]
  }
  ```

### `GET /storage/breakdown` *(Auth Required)*
* **Purpose**: Byte breakdown of files by category.
* **Response (200)**: `{ "photo": "1024000", "video": "2048000", "document": "512000" }`

### `GET /storage/routing-policy` *(Auth Required)*
* **Response (200)**: `{ "policy": { "id": "...", "mode": "most_available", "priorityAccountIds": [], "roundRobinCursor": 0 } }`

### `PATCH /storage/routing-policy` *(Auth Required)*
* **Body**: `{ "mode": "most_available" | "round_robin" | "priority", "priorityAccountIds"?: string[] }`
* **Response (200)**: `{ "policy": { ... } }`

---

## 5. File Management (`/files`)

### `GET /files` *(Auth Required)*
* **Query Params**:
  - `folderId` (string, optional)
  - `q` (search string, optional)
  - `kind` (`image` | `video` | `pdf` | `doc` | `archive`, optional)
  - `accountId` (string, optional)
  - `minSize`, `maxSize` (numbers in bytes, optional)
  - `startDate`, `endDate` (ISO dates, optional)
* **Response (200)**: `{ "files": [ { "id": "...", "name": "...", "mimeType": "...", "sizeBytes": "1024", "folderId": null, "connectedAccount": { "id": "...", "email": "...", "provider": "google_drive" }, ... } ] }`

### `GET /files/:id` *(Auth Required)*
* **Response (200)**: `{ "file": { ... } }`

### `PATCH /files/:id` *(Auth Required)*
* **Body**: `{ "name"?: "new-name.pdf", "folderId"?: "uuid" | null }`
* **Note**: Renaming synchronizes the file name to Google Drive automatically!
* **Response (200)**: `{ "file": { ... } }`

### `DELETE /files/:id` *(Auth Required)*
* **Purpose**: Moves file to recycle bin (soft delete).
* **Response (200)**: `{ "status": "ok" }`

### `PATCH /files/batch` *(Auth Required)*
* **Body**: `{ "fileIds": ["uuid1", "uuid2"], "folderId": "uuid" | null }`
* **Response (200)**: `{ "status": "ok", "moved": 2 }`

### `DELETE /files/batch` *(Auth Required)*
* **Body**: `{ "fileIds": ["uuid1", "uuid2"] }`
* **Response (200)**: `{ "status": "ok", "deleted": 2 }`

### `GET /files/trash` *(Auth Required)*
* **Query**: `?q=...`
* **Response (200)**: `{ "files": [ ... ] }`

### `POST /files/batch/restore` *(Auth Required)*
* **Body**: `{ "fileIds": ["uuid1"] }`
* **Response (200)**: `{ "status": "ok", "restored": 1 }`

### `DELETE /files/batch/permanent` *(Auth Required)*
* **Body**: `{ "fileIds": ["uuid1"] }`
* **Purpose**: Permanently deletes files from Google Drive / S3 storage and removes database records.
* **Response (200)**: `{ "status": "ok", "deleted": 1, "failed": [] }`

### `GET /files/:id/download` *(Auth Required)*
* **Response**: Streamed file binary with `Content-Disposition: attachment`. Supports `Range` headers.

### `POST /files/batch-download` *(Auth Required)*
* **Body**: `{ "fileIds": ["uuid1", "uuid2"] }`
* **Response**: Streamed on-the-fly ZIP archive (`drivesync-download.zip`).

### `POST /files/:id/preview-token` *(Auth Required)*
* **Response (201)**: `{ "path": "/files/preview/<token>", "url": "http://localhost:4000/files/preview/<token>" }`

### `GET /files/preview/:token` *(Public with Valid Token)*
* **Response**: Streamed file binary with `Content-Disposition: inline` for video players, audio, PDFs, and images.

### `GET /files/:id/view-url` *(Auth Required)*
* **Response (200)**: `{ "url": "https://drive.google.com/file/d/.../view" }` (Google Drive direct web view link).

### `POST /files/:id/share` *(Auth Required)*
* **Response (200/201)**: `{ "url": "http://localhost:3000/public/files/<token>", "shareId": "uuid" }`

### `DELETE /files/:id/share` *(Auth Required)*
* **Response (200)**: `{ "status": "ok" }`

### `GET /files/shared-links` *(Auth Required)*
* **Response (200)**: `{ "shares": [ { "id": "...", "url": "...", "createdAt": "...", "file": { ... } } ] }`

### `POST /files/sync-google` *(Auth Required)*
* **Body**: `{ "connectedAccountId"?: "uuid" }`
* **Purpose**: Runs a full bidirectional sync with Google Drive `drivesync` app folder.
* **Response (200)**: `{ "status": "ok", "results": [ { "accountId": "...", "created": 2, "updated": 0, "deleted": 0 } ] }`

---

## 6. Virtual & Cloud Folders (`/folders`)

### `GET /folders` *(Auth Required)*
* **Query**: `parentId` (string, optional), `all=1` (returns all non-deleted folders).
* **Note**: Automatically performs self-healing sync of folder IDs with Google Drive app folder.
* **Response (200)**: `{ "folders": [ { "id": "...", "name": "Documents", "color": "#3b82f6", "iconUrl": "...", "parentId": null, "providerFolderId": "..." } ] }`

### `GET /folders/recent` *(Auth Required)*
* **Query**: `limit=4`
* **Response (200)**: `{ "folders": [ ... ] }`

### `POST /folders` *(Auth Required)*
* **Body**: `{ "name": "...", "color"?: "#3b82f6", "iconUrl"?: "...", "parentId"?: null }`
* **Note**: Creates the folder in DB and creates the matching folder inside Google Drive!
* **Response (201)**: `{ "folder": { ... } }`

### `PATCH /folders/:id` *(Auth Required)*
* **Body**: `{ "name"?: "...", "color"?: "...", "parentId"?: "..." }`
* **Note**: Renames or moves folder in DB and on Google Drive.
* **Response (200)**: `{ "folder": { ... } }`

### `DELETE /folders/:id` *(Auth Required)*
* **Note**: Recursively trashes all subfolders and files in DB and on Google Drive.
* **Response (200)**: `{ "status": "ok" }`

---

## 7. Upload Endpoints (`/uploads`)

### Standard Multipart Stream (`POST /uploads`) *(Auth Required)*
* `multipart/form-data`:
  - `sizeBytes`: file size in bytes (must precede file field)
  - `fileName`: file name
  - `mimeType`: MIME type
  - `folderId`: optional target folder ID
  - `file`: binary stream
* **Multi-file metadata**: `filesMeta=[{ fieldName, fileName, mimeType, sizeBytes, folderId }]`
* **Routing**: The backend automatically chooses the connected account with the most available space (or according to routing policy).
* **Response (201)**: `{ "file": { ... } }` or `{ "files": [ ... ], "failed": [] }`

### Resumable Chunked Uploads (Large Files)
1. **Initialize Session**: `POST /uploads/resumable/init`
   - **Body**: `{ "fileName": "movie.mp4", "mimeType": "video/mp4", "sizeBytes": "104857600", "folderId"?: null, "targetAccountId"?: null }`
   - **Response (201)**: `{ "sessionId": "uuid", "provider": "google_drive", "offset": 0 }`
2. **Query Status**: `GET /uploads/resumable/status/:sessionId`
   - **Response (200)**: `{ "status": "uploading" | "completed", "offset": "52428800" }`
3. **Upload Chunk**: `PUT /uploads/resumable/chunk/:sessionId`
   - **Headers**:
     - `Content-Range: bytes 0-52428799/104857600`
     - `Content-Length: 52428800`
   - **Body**: Chunk binary stream
   - **Response (308 Resume Incomplete)**: `{ "status": "uploading", "offset": "52428800" }`
   - **Response (201 Completed)**: `{ "status": "completed", "file": { ... } }`

---

## 8. Workspace Invites, API Keys & Audit Logs

* **Invites (`/invites`)**:
  - `GET /invites`: `{ "sent": [ ... ], "received": [ ... ] }`
  - `POST /invites`: `{ "email": "colleague@domain.com", "role": "viewer" | "editor", "targetType": "file" | "folder", "targetId": "uuid" }`
  - `DELETE /invites/:id`
* **API Keys (`/api-keys`)**:
  - `GET /api-keys`, `POST /api-keys` (returns `{ apiKey, secret }`), `DELETE /api-keys/:id`
* **Audit Logs (`/audit-logs`)**:
  - `GET /audit-logs`: `{ "logs": [ { "id": "...", "action": "UPLOAD_FILE", "entityType": "file", "metadata": { ... }, "createdAt": "..." } ] }`
* **System (`/system`)**:
  - `GET /system/google-config`: `{ "exists": boolean, "clientId": "...", "redirectUri": "..." }`
  - `POST /system/google-config`: `{ "clientId": "...", "clientSecret": "...", "redirectUri": "..." }`

