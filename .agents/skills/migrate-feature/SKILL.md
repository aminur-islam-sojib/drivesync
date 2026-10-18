---
name: migrate-feature
description: Guide to implementing or migrating a single DriveSync feature in the Next.js frontend (frontend/) against the ready Express backend (backend/).
---

# Feature Implementation Runbook

Use this skill when implementing a specific feature or page in `frontend/` (such as `/all-files`, `/quota`, `/trash`, or file preview).

## Execution Steps

1. **Review Endpoint Contract**: Check `docs/API_REFERENCE.md` and `backend/src/modules/` for the relevant endpoints (e.g. `/files`, `/folders`, `/storage`, `/connected-accounts`).
2. **Draft Feature Plan**: Detail the components needed, store interactions, API calls, and states (loading, empty, error) before writing code.
3. **API Integration**: Add or verify typed API methods in `frontend/src/lib/` consuming the backend endpoints.
4. **Implement UI**: Build components using semantic tokens from `docs/DESIGN_SYSTEM.md`, shadcn/Radix primitives, and Zustand stores.
5. **Add States**: Include skeleton loading, clean empty states, and toast notifications (via `sonner`) for errors and success actions.
6. **Verify Code**: Run `npm run typecheck` and `npm run lint` inside `frontend/`.
7. **Visual Check**: Test in the browser at 1440px and 390px in both light and dark modes, comparing against references in `docs/references/like/`.
