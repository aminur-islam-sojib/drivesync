# Prompts for Implementing the DriveSync Frontend

Use these prompts in the chat / Agent Manager one at a time to build the new Next.js frontend in `frontend/` against the ready Express backend in `backend/`.

---

## Prompt 1: Shell & Design System (Phase 1)

```
You are implementing the frontend for DriveSync in `frontend/`. The Express backend in `backend/` is ready and running at http://localhost:4000.

Read these files before starting:
- AGENTS.md
- docs/DESIGN_SYSTEM.md
- docs/FRONTEND.md
- docs/API_REFERENCE.md
and inspect the target design in docs/references/like.

Task:
1. Verify package dependencies in frontend/package.json. Install required dependencies: lucide-react, zustand, sonner, axios, @radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-tooltip, @radix-ui/react-context-menu, @radix-ui/react-popover, @dnd-kit/core, @dnd-kit/utilities.
2. Configure globals.css in frontend/src/app/globals.css with the semantic CSS tokens from docs/DESIGN_SYSTEM.md section 3.
3. Build the dashboard layout shell in frontend/src/components/layout/:
   - Sidebar: Brand logo, navigation links (/all-files, /recent, /quota, /trash, /shared, /activity, /settings), collapsible folder tree placeholder, and bottom storage meter preview.
   - Topbar: Global search bar, Quick Upload button, theme toggle, and user profile avatar menu.
   - Main content area with responsive container.
4. Set up ui-store.ts in frontend/src/stores/ for theme (light/dark), sidebar collapsed, and view mode (grid/list).
5. Run `npm run typecheck` and `npm run lint` in frontend/. Start dev server, screenshot at 1440px and 390px in light and dark, and report.
```

---

## Prompt 2: Auth Flow & Session Management (Phase 2)

```
Do Phase 2 in frontend/: Authentication and Session Management.

Backend auth endpoints:
- POST /auth/register
- POST /auth/login
- GET /auth/google/url
- POST /auth/google/exchange
- POST /auth/refresh
- POST /auth/logout
- GET /auth/me

Task:
1. Create frontend/src/lib/api.ts with an authenticated Axios instance:
   - Automatically injects Authorization: Bearer <accessToken>
   - Automatically catches 401, calls POST /auth/refresh with refreshToken, updates token in auth-store, and retries the original request.
2. Build frontend/src/stores/auth-store.ts with Zustand (persist accessToken, refreshToken, user profile).
3. Build the Auth pages:
   - frontend/src/app/(auth)/login/page.tsx: Email/password form, "Sign in with Google" button, error alerts with sonner.
   - frontend/src/app/(auth)/register/page.tsx: Name/email/password registration with form validation.
   - frontend/src/app/google-auth/page.tsx: Reads token from URL (?token=...), calls POST /auth/google/exchange, saves session, and redirects to /all-files.
4. Add client-side route protection so unauthenticated users are redirected to /login.
5. Test registration, login, logout, and token refresh flow, and report.
```

---

## Prompt 3: Multi-Account Google Drive & Quotas (Phase 3)

```
Do Phase 3 in frontend/: Multi-Account Google Drive Connection & Storage Quota Dashboard.

Backend endpoints:
- GET /connected-accounts
- GET /connected-accounts/google/connect-url
- POST /connected-accounts/:id/sync-quota
- DELETE /connected-accounts/:id
- POST /connected-accounts/s3
- GET /storage/summary
- GET /storage/breakdown
- GET /storage/routing-policy
- PATCH /storage/routing-policy

Task:
1. Implement the popup connection flow:
   - "Connect Drive" button calls GET /connected-accounts/google/connect-url and opens the authorization URL in a centered popup window.
   - Create frontend/src/app/google-connected/page.tsx: Extracts status from query (?status=success), posts message window.opener.postMessage({ type: 'GOOGLE_CONNECTED' }, window.location.origin), and closes itself.
   - Dashboard listens for GOOGLE_CONNECTED and immediately re-fetches connected accounts.
2. Build the /quota page (frontend/src/app/(dashboard)/quota/page.tsx):
   - Combined storage progress bar showing total, used, and available bytes.
   - Category breakdown (photo, video, document) with visual proportion bar.
   - List of connected Google Drive and S3 accounts with individual storage meters, email, status, and manual Sync / Disconnect actions.
   - Routing policy switcher: radio cards for "Most Available", "Round Robin", and "Priority".
   - S3 Connection modal for adding custom S3-compatible buckets.
3. Test account listing, quota calculation, and popup flow, and report.
```

---

## Prompt 4: Virtual Folders & File Browser (Phase 4)

```
Do Phase 4 in frontend/: Virtual Folders & File Browser with the signature "Quiet Archive" design.

Backend endpoints:
- GET /folders (query: parentId, all=1)
- GET /folders/recent
- POST /folders
- PATCH /folders/:id
- DELETE /folders/:id
- GET /files (query: folderId, q, kind, accountId, minSize, maxSize, startDate, endDate)
- PATCH /files/:id
- DELETE /files/:id
- PATCH /files/batch
- DELETE /files/batch
- POST /files/sync-google

Task:
1. Implement the Folder Card (frontend/src/components/folders/folder-card.tsx):
   - Signature look from docs/DESIGN_SYSTEM.md section 6.1: Paper sheet peeking out of tinted folder, lifts on hover and drag-over.
   - Displays file count and total size (no repeated timestamp noise).
   - Shows badge of the connected Google Drive account that owns the folder.
2. Build the /all-files and /folder/[id] views:
   - Breadcrumb navigation for nested folders.
   - Folder grid at the top.
   - Filter bar: search input, kind dropdown (images, videos, docs, archives), connected account selector, sort options.
   - File Table (list mode) with avatars and formatted size/dates, and File Grid (card mode).
   - Selection bar for batch operations: Move to folder, Download as ZIP, Move to Trash.
3. Implement folder management dialogs: New Folder, Rename, Delete confirmation.
4. Add "Sync Drive" button that triggers POST /files/sync-google and updates the view.
5. Review against docs/references/like at 1440px and 390px, and report.
```

---

## Prompt 5: Upload Pipeline & Resumable Chunking (Phase 5)

```
Do Phase 5 in frontend/: Upload Pipeline with Drag-and-Drop and Resumable Chunking.

Backend endpoints:
- POST /uploads (standard multipart)
- POST /uploads/resumable/init
- GET /uploads/resumable/status/:id
- PUT /uploads/resumable/chunk/:id (Content-Range header)

Task:
1. Build frontend/src/stores/upload-store.ts:
   - Queue of active uploads with fileName, size, progress %, status, error.
   - Minimizable/expandable state for the floating upload tray.
2. Build frontend/src/components/uploads/upload-tray.tsx:
   - Floating widget at bottom-right showing active, completed, and failed uploads.
3. Build the upload coordinator in frontend/src/lib/upload.ts:
   - For files <= 10MB: POST to /uploads.
   - For files > 10MB: Call POST /uploads/resumable/init, then upload 5MB slices via PUT /uploads/resumable/chunk/:sessionId with Content-Range: bytes START-END/TOTAL.
4. Implement full-page drag-and-drop overlay (UploadDropzone) and Topbar file picker trigger.
5. Test small and large file uploads, verify progress reporting, and report.
```

---

## Prompt 6: Previews, Sharing, Trash & Settings (Phase 6)

```
Do Phase 6 in frontend/: File Previews, Public Sharing, Trash, Activity Logs, and Settings.

Backend endpoints:
- GET /files/:id/download
- POST /files/:id/preview-token -> GET /files/preview/:token
- GET /files/:id/view-url
- POST /files/:id/share & DELETE /files/:id/share
- POST /files/batch-download
- GET /files/trash, POST /files/batch/restore, DELETE /files/batch/permanent
- GET /invites, POST /invites, DELETE /invites/:id
- GET /audit-logs
- GET /api-keys, POST /api-keys, DELETE /api-keys/:id
- GET /system/google-config, POST /system/google-config
- Public route: GET /public/files/:token

Task:
1. Media Preview Modal (dynamically imported):
   - Video streaming using Plyr.
   - Audio playback.
   - PDF inline preview.
   - High-resolution image zoom.
   - Fallback button to open in Google Drive via GET /files/:id/view-url.
2. Share Dialog: Generate public link, copy to clipboard, or invite collaborators by email.
3. Public Share Page (frontend/src/app/public/files/[token]/page.tsx): Standalone download and preview page for non-logged-in users.
4. Trash Page (frontend/src/app/(dashboard)/trash/page.tsx): List deleted files with Restore and Permanent Delete actions.
5. Additional views: /activity (audit logs table), /api-keys (key generator), and /settings (OAuth client ID/secret configuration).
6. Run full visual and typecheck QA, and report.
```
