---
description: Review the current screen against the DriveSync design system and references, then fix the gaps
---

1. Open the running app on the screen I name (or the one I last changed).
2. Screenshot at 1440, 1024 and 390 px in light and dark.
3. Compare with `docs/references/like/` and the "dislike" list in `docs/DESIGN_SYSTEM.md` section 1.
4. Check: tokens only, one accent, folder cards show count and size, no nested boxes, top bar has only Upload and search prominent, text 12px minimum, focus ring visible, keyboard path works, loading/empty/error states exist.
5. Run axe (Playwright) and Lighthouse for the route.
6. Produce a numbered list of problems with severity, fix the high and medium ones, and re-check.
7. Summarize what changed and what remains.
