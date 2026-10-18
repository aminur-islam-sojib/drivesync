# DriveSync Frontend Architecture Guide

This guide defines the architecture, conventions, and state patterns for implementing the new DriveSync frontend in `frontend/`.

The frontend is a **Next.js 16 App Router** application (React 19, Tailwind CSS v4, TypeScript strict, Zustand 5, shadcn/ui) that connects to the ready Express 5 backend at `http://localhost:4000` (or `process.env.NEXT_PUBLIC_API_URL`).

---

## 1. Stack & Dependencies

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) + React 19 | Fast routing, Server & Client Components, metadata |
| **Language** | TypeScript strict | Type safety across API responses and stores |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/turbopack`) | Token-based CSS variables (`docs/DESIGN_SYSTEM.md`) |
| **Client State** | Zustand 5 (`zustand`, `zustand/shallow`) | UI state only: prefs, selection, dialogs, upload queue |
| **UI Primitives** | shadcn/ui (Radix Primitives) | Accessible Dialog, DropdownMenu, ContextMenu, Tooltip, Popover |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/utilities` | Dragging files into folders with keyboard accessibility |
| **Icons** | `lucide-react` | Unified icon language |
| **Video & Media** | `plyr` (dynamic import) | Streaming video playback |
| **Toasts** | `sonner` | Action confirmations and error notifications |

---

## 2. Project Structure (`frontend/src`)

```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx             # Email/Password + Google Sign-In button
│   │   └── register/page.tsx          # User registration + Google Sign-In
│   ├── google-auth/page.tsx           # Exchanges ?token=... for session tokens
│   ├── google-connected/page.tsx      # Popup callback helper (notifies parent & closes)
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # Protected layout with Sidebar, Topbar, UploadTray
│   │   ├── all-files/page.tsx         # Root folder grid + file table/grid + filters
│   │   ├── folder/[id]/page.tsx       # Subfolder view with breadcrumbs
│   │   ├── quota/page.tsx             # Combined meters, per-account list, routing policy
│   │   ├── recent/page.tsx            # Recent folders and files
│   │   ├── trash/page.tsx             # Recycle bin with restore & permanent delete
│   │   ├── shared/page.tsx            # Active share links and workspace invites
│   │   ├── activity/page.tsx          # Audit log history
│   │   ├── api-keys/page.tsx          # Developer API keys
│   │   └── settings/page.tsx          # Global OAuth configuration & connected accounts
│   ├── public/files/[token]/page.tsx  # Public share landing page (preview & download)
│   ├── globals.css                    # Design system semantic CSS tokens
│   └── layout.tsx                     # Root HTML shell, fonts, Toaster
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx                # Collapsible folder tree, navigation, quota summary
│   │   ├── topbar.tsx                 # Search input, upload trigger, user menu
│   │   └── info-panel.tsx             # Right sidebar properties & storage breakdown
│   ├── folders/
│   │   ├── folder-card.tsx            # Signature folder with animated sheet & account badges
│   │   ├── folder-grid.tsx
│   │   └── folder-tree.tsx            # Recursive collapsible tree
│   ├── files/
│   │   ├── file-table.tsx             # Table view with avatars & size
│   │   ├── file-grid.tsx              # Grid view with thumbnails
│   │   ├── file-preview-modal.tsx     # Plyr video, PDF, audio, image viewer
│   │   └── file-context-menu.tsx      # Radix right-click menu
│   ├── uploads/
│   │   ├── upload-dropzone.tsx        # Drag-and-drop overlay
│   │   └── upload-tray.tsx            # Floating bottom tray with progress & chunk coordinator
│   └── dialogs/
│       ├── dialog-host.tsx            # Central dialog controller
│       ├── new-folder-dialog.tsx
│       ├── rename-dialog.tsx
│       ├── share-dialog.tsx
│       ├── connect-drive-dialog.tsx   # Google OAuth connection helper
│       └── s3-config-dialog.tsx
├── lib/
│   ├── api.ts                         # Axios/Fetch client with Bearer auth & token refresh
│   ├── utils.ts                       # Formatters (bytes, dates, mime helpers)
│   └── types.ts                       # Full TypeScript types mirroring backend DTOs
└── stores/
    ├── auth-store.ts                  # User, tokens, login/logout actions
    ├── ui-store.ts                    # View mode, active filters, sidebar collapsed
    ├── selection-store.ts             # Selected items, bulk move/delete/download
    ├── upload-store.ts                # Queue, progress, resumable chunk coordinator
    └── dialog-store.ts                # Modal control (open/close dialogs)
```

---

## 3. Connecting to the Backend (`lib/api.ts`)

The backend runs separately on port 4000. All API communications must use an authenticated client that manages JWT access tokens and silent refresh:

```typescript
// frontend/src/lib/api.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
})

// Attach Bearer Access Token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Silent Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
        useAuthStore.getState().setAccessToken(data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshErr) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      }
    }
    return Promise.reject(error)
  }
)
```

---

## 4. Multi-Account Google Drive Flow

Connecting multiple Google accounts is a signature feature of DriveSync:
1. **User triggers "Connect Drive"**:
   - Frontend calls `GET /connected-accounts/google/connect-url`.
   - Opens a popup window pointing to the Google OAuth consent URL.
2. **Google OAuth Callback**:
   - Google redirects to backend `GET /connected-accounts/google/callback`.
   - Backend links the account, initializes the `drivesync` app folder, syncs quota, and redirects to:
     `${FRONTEND_URL}/google-connected?status=success`
3. **Popup Communication (`google-connected/page.tsx`)**:
   - The popup detects `status=success` and executes:
     ```typescript
     window.opener?.postMessage({ type: 'GOOGLE_CONNECTED' }, window.location.origin)
     window.close()
     ```
   - The parent window listens for `GOOGLE_CONNECTED`, shows a success toast, and refreshes the connected accounts list.

---

## 5. Upload Pipeline & Chunking

1. **Standard Upload (`POST /uploads`)**:
   - For files < 10 MB or S3 files. Sent as `multipart/form-data`.
2. **Google Drive Resumable Upload**:
   - For files > 10 MB, use chunked resumable upload:
     1. `POST /uploads/resumable/init`: returns `{ sessionId, offset: 0 }`.
     2. Upload chunks in 5MB slices via `PUT /uploads/resumable/chunk/:sessionId` with header:
        `Content-Range: bytes START-END/TOTAL`.
     3. Track progress smoothly in `upload-store`.

---

## 6. UI & Design Rules

* Follow **[DESIGN_SYSTEM.md](file:///home/sojib-ahmed/Projects%20/drivesync/docs/DESIGN_SYSTEM.md)** strictly.
* Only use semantic CSS tokens (`bg-surface`, `text-ink-1`, `text-ink-2`, `border-line`, `bg-accent`).
* Do not add hard-coded hex colors or arbitrary gradients.
* The **Folder Card** must feature the signature paper sheet peeking out, lifting on hover, with small badges indicating which connected account owns the folder.
