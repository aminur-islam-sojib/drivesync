---
description: Implement or migrate one DriveSync feature in frontend/ against the ready Express backend
---

1. Check the backend endpoint specification in `docs/API_REFERENCE.md`.
2. Write a short plan (components, store slices, API calls, states to cover).
3. Implement the API methods and types in `frontend/src/lib/`.
4. Build the UI in `frontend/` using `drivesync-design` and `drivesync-frontend` skills.
5. Cover all states: loading skeleton, empty state, and error handling with `sonner`.
6. Run `npm run typecheck` and `npm run lint` in `frontend/`.
7. Verify responsive layout at 1440px and 390px in light and dark modes against `docs/references/like/`.
