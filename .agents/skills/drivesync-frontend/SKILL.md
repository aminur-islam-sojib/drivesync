---
name: drivesync-frontend
description: Use when building or refactoring DriveSync client and page code in frontend/: Next.js App Router, Zustand stores (auth, ui, selection, dialog, upload), API client calls, virtualization, drag-and-drop, and media previews.
---

# DriveSync Frontend Skill

## When to Use
Any development in `frontend/src/app`, `frontend/src/components`, `frontend/src/stores`, or `frontend/src/lib`.

## First, Load Context
1. Read `docs/FRONTEND.md`.
2. Check backend endpoint schemas in `docs/API_REFERENCE.md`.
3. Check UI tokens and benchmarks in `docs/DESIGN_SYSTEM.md`.

## Decision Flow
1. **API Interaction**: All backend requests must use `lib/api.ts` with automatic Bearer token injection and silent refresh on 401.
2. **State Scope**:
   - `auth-store`: user profile, access token, refresh token, login/logout.
   - `ui-store`: view preferences (grid vs list), density, dark/light theme, active filters, sidebar collapsed.
   - `selection-store`: selected file IDs and folder IDs, bulk actions.
   - `upload-store`: upload queue, active progress %, resumable chunk state, upload tray minimize/expand.
   - `dialog-store`: active modal dialogs (New Folder, Rename, Delete Confirmation, Share, Connect Drive, S3 Config, Workspace Invite).
   - Component state: ephemeral UI state stays in React `useState`.
3. **URL State**: Search query (`q`), filter criteria (`kind`, `accountId`), and active folder (`folderId`) should sync with URL search params for bookmarkability.
4. **Lists**: Virtualize long lists (>100 files) using TanStack Virtual.
5. **Heavy Modals**: Dynamically import heavy libraries (Plyr video player, PDF viewer) using `next/dynamic`.

## Quality & Responsiveness
* Provide skeleton loaders, empty states, and error handling for every view.
* Verify responsiveness at 390px, 1024px, and 1440px in light and dark themes.
* Run `npm run typecheck` and `npm run lint` in `frontend/` after any changes.
