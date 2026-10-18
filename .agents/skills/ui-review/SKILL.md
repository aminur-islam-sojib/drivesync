---
name: ui-review
description: Review the current screen against the DriveSync design system and references, then identify and fix visual gaps.
---

# UI Review

Audit the active or specified screen against the DriveSync design system (`docs/DESIGN_SYSTEM.md`) and reference screenshots, and resolve design discrepancies.

## Review Steps

1. **Navigate to Target View**: Open the running app on the screen requested by the user (or the one most recently modified).
2. **Capture Across Viewports**: Inspect at 1440px (desktop), 1024px (tablet), and 390px (mobile) in both light and dark themes.
3. **Compare with Design References**:
   - Check against `docs/references/like/` (target aesthetic: calm, quiet archive, signature folder cards with sheets).
   - Verify absence of anti-patterns listed in `docs/references/dislike/` and `docs/DESIGN_SYSTEM.md` Section 1 (no identical outline folders, no repeated metadata noise, no nested boxes inside boxes, no navy/purple glow or heavy gradients, clean top bar).
4. **Design System Conformance**:
   - Semantic tokens only (`bg-surface`, `text-ink-2`, `border-line`, `bg-accent`); no hard-coded hex colors.
   - Single accent color reserved for primary action, selection, and focus.
   - Folder cards display file count and total size, not repeated update timestamps.
   - Minimum 12px text size, visible focus rings, keyboard accessibility.
   - All necessary states exist: loading skeleton matching layout, empty, error, selected, drag-over.
5. **Run Audits**: Run automated accessibility (axe / Playwright) and Lighthouse checks for the route.
6. **Remediate**: Compile a prioritized list of issues, immediately resolve high- and medium-severity items, and re-verify.
7. **Report**: Summarize visual and accessibility improvements made, and note any remaining differences.

