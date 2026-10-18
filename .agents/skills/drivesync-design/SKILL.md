---
name: drivesync-design
description: Use for any DriveSync visual work: layout, components, colors, typography, folder cards, empty and loading states, light and dark themes, responsive behavior, copy. Applies the project's "quiet archive" design system and the like/dislike references.
---

# DriveSync design skill

## When to use
Any task that creates or changes what the user sees: pages, components, styles, icons, empty states, copy.

## First, load context
1. Read `docs/DESIGN_SYSTEM.md` fully.
2. Look at the reference images in `docs/references/like/` (target) and `docs/references/dislike/` (what to leave behind).

## Design in this order
1. Write a 5-line plan: layout idea (ASCII wireframe), which tokens, which components, the one memorable element on this screen, states to cover.
2. Check the plan against the dislike list: identical folders, repeated timestamps, nested boxes, glow backgrounds, crowded top bar. Revise if any applies.
3. Build with tokens only (`bg-surface`, `text-ink-2`, `border-line`, `bg-accent`). No hex values in components.
4. Cover states: loading skeleton matching the layout, empty, error, selected, drag-over, disabled, focus.
5. Verify in the browser at 1440, 1024 and 390 px, light and dark. Screenshot and compare with the like references.

## Non-negotiables
- One accent color, used for primary action, selection and focus only.
- Flat neutral surfaces, hairline borders. No gradient page backgrounds, no glow, no blur on content.
- The folder card is the signature element: paper sheet inside a tinted folder, lifts on hover and drop, carries account badges. Show file count and size, not repeated "Updated" timestamps.
- Three-pane desktop layout: sidebar with tree, main area, optional Info panel. Mobile uses a drawer and bottom sheets.
- Text 12px minimum, contrast 4.5:1, touch targets 40px, visible focus ring, reduced-motion respected.
- Motion only in response to user actions, only `transform` and `opacity`.
- Copy: sentence case, plain verbs, one name per action, errors state cause and fix.

## Avoid
Uppercase tracked eyebrow labels, single highlighted words in headings, identical cards with identical shadows, fade-in on every section, numbered markers on non-sequences, third typefaces.

## Done when
The DESIGN_SYSTEM.md section 10 checklist passes and you have listed any remaining visual differences from the references.
