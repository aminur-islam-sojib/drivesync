# DriveSync Project Rules (Always On)

You are implementing the frontend for DriveSync, a multi-account Google Drive and S3 file manager.

## Architecture & Project Layout
* **Backend (`backend/`)**: Express 5 REST API, Prisma 6, PostgreSQL, Google Drive & AWS SDK integrations. **The backend is READY and running on port 4000**. Do not modify backend code or schemas unless explicitly instructed.
* **Frontend (`frontend/`)**: Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, Zustand 5, shadcn/ui on Radix. This is the active development area.
* **API Reference**: Refer to `docs/API_REFERENCE.md` for all backend endpoint contracts, headers, and payload schemas.
* **Design System**: Refer to `docs/DESIGN_SYSTEM.md` for colors, tokens, signature folder cards, and visual references in `docs/references/`.
* **Frontend Guide**: Refer to `docs/FRONTEND.md` for stores, routing, and component architecture.

## Core Capabilities to Implement in `frontend/`
1. **Multi-Account Aggregation**: Connect and manage multiple Google Drive accounts seamlessly from one interface, viewing combined quotas and individual storage bars.
2. **File & Folder Operations**: Browse virtual folder hierarchies, move files, rename (synced with Google Drive), search with filters (type, account, size, dates), and batch download as ZIP.
3. **Uploads**: Drag-and-drop zone with floating upload tray, supporting standard multipart uploads and chunked resumable uploads for large files.
4. **Media Previews**: In-app streaming playback for video (Plyr), audio, PDF, and image viewers.
5. **Recycle Bin & Sharing**: Trash with restore/permanent purge, public share link generation, and collaborator invites.

## Hard Rules
1. **Frontend Folder**: The frontend directory is strictly `frontend/`. Never refer to or create `drivesync-next/`.
2. **State Management**: Use Zustand 5 for client state only (auth tokens, view preferences, selection, active dialogs, upload queue).
3. **API Client**: All backend calls must go through `lib/api.ts` with `Authorization: Bearer <accessToken>` and automatic silent refresh on 401 via `POST /auth/refresh`.
4. **Design System & Tokens**: No hard-coded hex colors in components, no arbitrary gradients. Use semantic tokens (`bg-surface`, `text-ink-1`, `text-ink-2`, `border-line`, `bg-accent`).
5. **Primitives**: Use Radix-based shadcn primitives for dialogs, context menus, tooltips, and popovers. Never hand-roll modals.
6. **Signature Folder Card**: Folders must render as real folder cards with a paper sheet peeking out that lifts on hover, showing file count, size, and connected account badges.
7. **Code Quality**: No file over 300 lines, no `any`, no leftover `console.log`, clean TypeScript types.
8. **States & Responsiveness**: Every screen must provide loading skeletons, empty states, and error handling, responsive across 390px, 1024px, and 1440px in light and dark modes.

## Working Method
* Check installed package versions in `frontend/package.json` before adding dependencies.
* Build features in small, reviewable increments.
* Verify types and linting (`npm run typecheck`, `npm run lint`) after creating or modifying components.
