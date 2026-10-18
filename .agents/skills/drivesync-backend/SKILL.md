---
name: drivesync-backend
description: Reference and guide for interacting with the ready Express 5 backend in backend/. Use whenever connecting frontend components to backend endpoints, Google Drive OAuth, uploads, or storage quotas.
---

# DriveSync Backend Interaction Skill

The DriveSync backend is a ready, running Express 5 server on port 4000 (`http://localhost:4000`).

## First, Load Context
* Complete endpoint specifications and schemas: `docs/API_REFERENCE.md`
* Backend Prisma schema: `backend/prisma/schema.prisma`
* Backend route definitions: `backend/src/modules/`

## Key Integration Patterns

### 1. Authentication
* Attach header `Authorization: Bearer <accessToken>` to every protected request.
* Intercept 401 responses to request a new token via `POST /auth/refresh` with `{ refreshToken }`.

### 2. Multi-Account Google Drive
* Fetch connected accounts: `GET /connected-accounts`
* Connect an additional Google account:
  1. Call `GET /connected-accounts/google/connect-url` to get the OAuth authorization URL.
  2. Open the URL in a browser popup.
  3. Google redirects to backend `GET /connected-accounts/google/callback`.
  4. Backend redirects the popup to `${FRONTEND_URL}/google-connected?status=success`.
  5. The popup sends a message to the opener (`postMessage({ type: 'GOOGLE_CONNECTED' })`) and closes itself.
  6. The parent window re-fetches connected accounts.

### 3. Folder Operations
* Folders created via `POST /folders` are created both in the database and automatically inside the Google Drive `drivesync` app folder.
* Folder renames and moves (`PATCH /folders/:id`) automatically update Google Drive.
* Folder deletes (`DELETE /folders/:id`) trash all files and subfolders in both DB and Google Drive.

### 4. Upload Pipeline
* Standard upload: `POST /uploads` with `multipart/form-data`. Fields `sizeBytes`, `fileName`, and `mimeType` must precede the binary stream.
* Resumable chunked upload:
  - `POST /uploads/resumable/init`: returns `{ sessionId, offset: 0 }`.
  - `PUT /uploads/resumable/chunk/:sessionId`: stream chunks with `Content-Range: bytes START-END/TOTAL`.

