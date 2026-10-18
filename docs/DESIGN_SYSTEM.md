# DriveSync Design System

Status: source of truth for all UI work in the Next.js rewrite.
Read together with `FRONTEND.md` (how to build it) and `PROJECT_AUDIT.md` section 11 (screens and states to cover).

---

## 1. What the references tell us

### Current UI (the four "I don't like" screenshots)
Observed problems, in priority order:

1. **Every folder looks identical.** Same outline icon, same box, same size. Nothing tells you what is inside or where it lives.
2. **Repeated metadata noise.** "Updated Oct 16, 2026, 11:12 PM" is printed on every card at about 11px. It carries no information when every card has the same value.
3. **Boxes inside boxes.** In the folder view the file cards sit inside an extra outer card inside the page. Three levels of border for one list.
4. **Dark theme is a navy/purple radial glow.** It reads as decoration, lowers text contrast, and costs paint performance (large gradients plus backdrop blur).
5. **Crowded top bar.** Search, XS/SM/MD/LG, Upload, New Folder, Sync, theme toggle and bell all compete at the same weight.
6. **No wayfinding.** No folder tree, no breadcrumbs beyond a title, no details panel. Users cannot see where they are or what a selection contains.
7. **Weak file rows.** Tiny file icon in a colored square, long names wrapping to two lines, owner shown as a pill.

### Target UI (the two "I like" screenshots)
- **Reference A (Kintsugi, light):** folder cards drawn as real folders with a paper sheet peeking out. The selected folder gets a soft blue fill and shows a preview of its newest note. Left tree navigation with nested items. Right "Info" panel with storage meters per type, a Properties list (size, created, last modified) and Tags. Plenty of white space and one accent color.
- **Reference B (Knowledge Base, graphite):** left tree with item counts and a Folders / Tags segmented switch. Large graphite folder illustrations with small source badges (which integration the content comes from). Folder footer shows "15 Files". Below, a clean Files table with Name and Added By columns using avatars.

### What we take from each
| Take | From |
|---|---|
| Folder-with-sheet illustration that reacts to hover, drop and selection | A and B |
| Left folder tree with counts, collapsible | A and B |
| Right Info panel (storage meters, properties, tags) | A |
| Account badges on folders (which Drive or S3 account holds the contents) | B, adapted to DriveSync |
| Folders / Tags segmented switch | B |
| Calm, mostly neutral surfaces with a single accent | A |
| Table with avatar column | B |

---

## 2. Direction: "Quiet archive"

DriveSync aggregates many Google Drive accounts into one place. The design should feel like a well-kept archive: calm, ordered, and obvious about where things physically live.

**One memorable element:** the folder card (section 6.1). A paper sheet sits inside every folder, lifts on hover, and slides further out when a file is dragged over it. It is tinted by the folder tone and carries small badges for the accounts that hold its files.

**Everything else is quiet.** Flat neutral surfaces, hairline borders, no gradient backgrounds, no glow, no glass blur on content. The accent color appears only on the primary action, selection and focus.

Avoid these defaults (they are the tell-tales of a generated dashboard):
- Gradient washes behind the page or on buttons.
- Identical rounded cards for everything, with the same shadow.
- Uppercase tracked eyebrow labels above headings.
- Highlighting a single word of a heading in color.
- Animated entrance on every card.

---

## 3. Tokens

Colors are semantic CSS variables. Tailwind v4 maps them with `@theme inline`. Never hard-code hex values in components, and never use global `!important` overrides (the legacy `style.css` did this and broke every component).

```css
/* app/globals.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

:root {
  color-scheme: light;
  --canvas: #F4F5F7;
  --surface: #FFFFFF;
  --surface-2: #EEF0F4;       /* sunken: inputs, table header, tracks */
  --line: #E3E6EB;
  --line-strong: #CFD4DC;
  --ink: #14171F;
  --ink-2: #3F4756;
  --ink-3: #5F6878;           /* about 5.6:1 on surface, safe for small text */
  --accent: #2F6BF3;          /* about 4.6:1 with white text */
  --accent-ink: #FFFFFF;
  --accent-soft: #E8EFFE;
  --success: #12875A;
  --warning: #B87708;
  --danger: #D92D3A;

  --folder-blue: #3B82F6;
  --folder-red: #EF4444;
  --folder-green: #10B981;
  --folder-amber: #F59E0B;
  --folder-violet: #8B5CF6;
  --folder-pink: #EC4899;
  --folder-cyan: #06B6D4;
  --folder-slate: #64748B;

  --shadow-card: 0 1px 2px rgb(16 24 40 / .06), 0 1px 3px rgb(16 24 40 / .04);
  --shadow-pop: 0 8px 24px rgb(16 24 40 / .12), 0 2px 6px rgb(16 24 40 / .06);
  --shadow-sheet: 0 1px 2px rgb(16 24 40 / .10);

  --r-sm: 6px; --r-md: 10px; --r-lg: 14px; --r-xl: 20px;
  --ease-out: cubic-bezier(.22, .8, .24, 1);
}

.dark {
  color-scheme: dark;
  --canvas: #0D0E11;
  --surface: #15171B;
  --surface-2: #1B1E23;
  --line: #272B32;
  --line-strong: #343943;
  --ink: #EDEFF3;
  --ink-2: #B3BAC6;
  --ink-3: #8A92A0;
  --accent: #6B93FF;
  --accent-ink: #0B1020;
  --accent-soft: #1B2640;
  --success: #34C48A;
  --warning: #E3A43A;
  --danger: #FF6B75;
  /* dark mode separates with borders, not shadows */
  --shadow-card: none;
  --shadow-pop: 0 8px 24px rgb(0 0 0 / .5);
  --shadow-sheet: 0 1px 2px rgb(0 0 0 / .4);
}

@theme inline {
  --font-sans: var(--font-ui), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-mono-face), ui-monospace, monospace;
  --color-canvas: var(--canvas);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-ink-3: var(--ink-3);
  --color-accent: var(--accent);
  --color-accent-ink: var(--accent-ink);
  --color-accent-soft: var(--accent-soft);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --radius-sm: var(--r-sm);
  --radius-md: var(--r-md);
  --radius-lg: var(--r-lg);
  --radius-xl: var(--r-xl);
}

html { background: var(--canvas); color: var(--ink); }
body { font-family: var(--font-sans); font-size: 14px; line-height: 1.5; -webkit-font-smoothing: antialiased; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
```

The `!important` in the reduced-motion reset is the only one allowed in the codebase.

### Typography
- **UI and headings:** Instrument Sans, weights 400, 500, 600, 700 (via `next/font/google`, CSS variable `--font-ui`).
- **Numbers, API keys, code, sizes:** Geist Mono (CSS variable `--font-mono-face`). Use `tabular-nums` on any column of sizes or counts.
- Do not add a third family.

| Role | Size / line | Weight |
|---|---|---|
| Page title | 28 / 34 | 600 |
| Section title | 18 / 26 | 600 |
| Body, row text | 14 / 21 | 400 to 500 |
| Secondary | 13 / 19 | 400, `ink-2` |
| Meta (counts, dates) | 12 / 16 | 400, `ink-3` |

Minimum text size is 12px (the legacy 11px meta text is removed). Keep prose (settings help, API docs) under 80 characters per line.

### Density (replaces XS / SM / MD / LG)
Keep the four levels because users already use them, but present them as a compact segmented control inside the toolbar's View popover, not as four top-level buttons.

| Level | Folder min width |
|---|---|
| xs | 132px |
| sm | 168px |
| md | 208px |
| lg | 260px |

Grid: `grid-template-columns: repeat(auto-fill, minmax(var(--folder-min), 1fr)); gap: 16px;`

### Legacy data note
`folders.color` currently stores a Tailwind class string (default `text-blue-500`) and the UI also uses hex values. Normalize to tone keys (`blue | red | green | amber | violet | pink | cyan | slate`) with a one-time migration, and keep a `toneFromLegacy()` helper for rows not yet migrated.

---

## 4. Layout

### Desktop (1280px and up): three panes
```
+-----------+-------------------------------------------------+------------+
| Logo      | Search ......................  [Upload v] [...]  |  Info      |
|           |-------------------------------------------------|            |
| Nav       | All files > Clients > randylnyc                 |  Storage   |
|  All      |                                 [View v] [Info] |  meters    |
|  Recent   |                                                 |            |
|  Starred  | Folders                                         |  Properties|
|  Shared   | +------+ +------+ +------+ +------+             |   Size     |
|  Trash    | |folder| |folder| |folder| |folder|             |   Created  |
|           | +------+ +------+ +------+ +------+             |   Modified |
| Tree      |                                                 |            |
|  v Clients| Files                                           |  Tags      |
|   > a     | Name         Account     Size    Modified       |            |
|   > b     | report.pdf   a@gmail     2 MB    Today          |  Activity  |
|           | ...                                             |            |
| Storage   |                                                 |            |
| 174 GB    |                                                 |            |
+-----------+-------------------------------------------------+------------+
```
- Sidebar 264px (collapses to a 64px icon rail). Contains nav, folder tree and a compact storage meter at the bottom.
- Main area, sidebar and info panel are independent scroll containers.
- Info panel 320px, toggled from the toolbar. With nothing selected it shows the per-account storage breakdown. With a selection it shows that selection's details.

### Tablet (768 to 1279px)
Sidebar becomes an icon rail. Info panel opens as an overlay sheet from the right.

### Mobile (under 768px)
- Top bar: menu button, search icon, upload icon.
- Navigation and tree open in a left drawer.
- Info opens as a bottom sheet (`vaul`).
- Selection bar docks to the bottom edge with batch actions.
- Folders are a 2-column grid at xs and sm. Files are always list rows.
- Context actions sit on a visible "more" button and on long-press, never right-click only.

### Toolbar rule
Only two things are prominent: **Upload** (accent) and **search**. New folder and Sync live in a menu beside Upload. Theme and notifications move into the user menu in the sidebar footer. View mode and density share one "View" popover.

---

## 5. Navigation
- The breadcrumb is real navigation: each segment is a link, and the last segment is the page title (28px).
- The folder tree and the breadcrumb share one source of truth: the `folderId` in the URL.
- Segmented switch "Folders | Tags" above the grid, as in reference B. Tags are post-v1: render the switch only once tags exist.
- Recents and Starred become real sidebar pages (they were mock pages in the legacy app) and also appear as filter chips inside a folder.

---

## 6. Components

### 6.1 FolderCard (the signature element)

Anatomy, back to front: back panel with tab, paper sheet, front panel, footer text, account badges.

```css
/* app/folder.css (imported once from globals.css) */
.folder { --tone: var(--folder-blue); position: relative; isolation: isolate; width: 100%; height: 100%; }
.folder[data-tone="red"]    { --tone: var(--folder-red); }
.folder[data-tone="green"]  { --tone: var(--folder-green); }
.folder[data-tone="amber"]  { --tone: var(--folder-amber); }
.folder[data-tone="violet"] { --tone: var(--folder-violet); }
.folder[data-tone="pink"]   { --tone: var(--folder-pink); }
.folder[data-tone="cyan"]   { --tone: var(--folder-cyan); }
.folder[data-tone="slate"]  { --tone: var(--folder-slate); }

.folder__back {
  position: absolute; inset: 14% 0 0 0; border-radius: var(--r-lg);
  background: color-mix(in oklab, var(--tone) 24%, var(--surface-2));
}
.folder__back::before {            /* the tab */
  content: ""; position: absolute; left: 0; top: -13%; width: 40%; height: 20%;
  border-radius: var(--r-md) var(--r-md) 0 0; background: inherit;
}
.folder__sheet {
  position: absolute; inset: 9% 7% 34% 7%; border-radius: var(--r-sm);
  background: var(--surface); box-shadow: var(--shadow-sheet);
  transition: transform 220ms var(--ease-out);
}
.folder__front {
  position: absolute; inset: 32% 0 0 0; border-radius: var(--r-lg);
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--tone) 10%, var(--surface)) 0%,
    color-mix(in oklab, var(--tone) 24%, var(--surface-2)) 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .5), var(--shadow-card);
}
.dark .folder__front { box-shadow: inset 0 1px 0 rgb(255 255 255 / .06); }

a:hover .folder__sheet,
a:focus-visible .folder__sheet,
.folder[data-drop="true"] .folder__sheet { transform: translateY(-9%); }
.folder[data-drop="true"] .folder__sheet { transform: translateY(-16%); }
.folder[data-selected="true"] { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: var(--r-lg); }
```

```tsx
// components/drive/folder-card.tsx
import Link from "next/link";
import { memo } from "react";
import { AccountBadges, type AccountBadge } from "./account-badges";

export type FolderTone = "blue" | "red" | "green" | "amber" | "violet" | "pink" | "cyan" | "slate";

export type FolderCardProps = {
  id: string;
  name: string;
  tone: FolderTone;
  fileCount: number;
  sizeLabel: string;        // "1.3 GB", formatted on the server
  accounts: AccountBadge[]; // max 3 shown, "+N" for the rest
  selected?: boolean;
};

export const FolderCard = memo(function FolderCard(p: FolderCardProps) {
  return (
    <Link
      href={`/all-files?folderId=${p.id}`}
      prefetch={false}
      data-folder-id={p.id}
      className="group block rounded-lg focus-visible:outline-none"
      aria-label={`${p.name}, ${p.fileCount} files, ${p.sizeLabel}`}
    >
      <div className="folder aspect-[1.35/1]" data-tone={p.tone} data-selected={p.selected}>
        <div className="folder__back" />
        <div className="folder__sheet" />
        <div className="folder__front" />
        <AccountBadges accounts={p.accounts} className="absolute bottom-[10%] left-[8%]" />
      </div>
      <div className="mt-2 px-0.5">
        <div className="truncate text-[14px] font-semibold text-ink">{p.name}</div>
        <div className="text-[12px] text-ink-3 tabular-nums">{p.fileCount} files · {p.sizeLabel}</div>
      </div>
    </Link>
  );
});
```

Rules:
- Show **file count and size**, not "Updated <timestamp>". Last modified goes in the Info panel and in list view.
- `prefetch={false}` on large grids.
- Hover and drop states are CSS only, so dragging across 200 folders re-renders nothing. The drag layer sets `data-drop="true"` directly on the hovered `.folder` element.
- The context menu wraps the card (Radix `ContextMenu.Trigger asChild`), see FRONTEND.md.

### 6.2 AccountBadges
12 to 16px circular avatars (Google avatar, or an S3 glyph) with a 2px `surface` ring, overlapped by 6px. A tooltip lists the full account emails. Maximum 3 shown plus "+N". This is DriveSync's version of the integration badges in reference B.

### 6.3 FolderTree (sidebar)
- Rows 32px high, 16px indent per level. The chevron is its own button, so clicking the label navigates and clicking the chevron expands.
- Right-aligned file count in a 12px `ink-3` chip, like reference B.
- Keyboard follows the WAI-ARIA tree pattern (`role="tree"`): Up/Down move, Right expands, Left collapses, Enter opens.
- Children load lazily on expand (one level per request).
- Active row: `accent-soft` background, `accent` label.

### 6.4 FileTable (list view)
Columns: checkbox, Name (icon plus single-line name, ellipsis for long names), Account (avatar plus short email), Size (mono, right-aligned), Modified (relative, absolute in a tooltip). Sticky header on `surface-2`. Row height 44px. Virtualized above 100 rows. Sortable headers set `aria-sort`.

### 6.5 FileGrid (grid view)
Thumbnail card at 4:3, name below, size and type on one line. Thumbnails lazy-load from `/api/files/[id]/thumb`. Files without a thumbnail show a large type glyph on `surface-2`, not a tiny icon in a colored square.

### 6.6 SelectionBar
Replaces the toolbar while items are selected: "3 selected", then Download, Move, Share, Delete, and a clear button. On mobile it docks to the bottom. Count changes are announced with `aria-live="polite"`.

### 6.7 InfoPanel
Sections in order: Storage (meters), Properties (key/value rows), Tags, Pinned items, Activity. With one file selected it replaces the old `FileDetailsDrawer`. With many selected it shows the count and total size.

### 6.8 Meters
Thin (6px) track on `surface-2`, filled with `accent` (or `warning` above 80%, `danger` above 95%). Always print the numbers beside the bar ("174.38 GB of 5 TB"). Never rely on color alone.

### 6.9 UploadTray
Minimized pill bottom-right: "Uploading 3 files, 42%". Expands to a list with per-file progress, retry on error, cancel while queued or active. It lives in the dashboard layout so it persists across navigation. On finish: "3 files uploaded" with a "Show in folder" link.

### 6.10 Context menus, dialogs, drawers
Use Radix primitives via shadcn/ui: ContextMenu, DropdownMenu, Dialog, AlertDialog, Tooltip, Popover. They provide focus trapping, `aria-modal`, arrow-key navigation and viewport collision handling, which fixes every accessibility and off-screen issue in audit section 11.1. Mobile bottom sheets use `vaul`. The command palette uses `cmdk` (Ctrl/Cmd+K) and replaces the advanced-search dropdown that overflowed small screens.

### 6.11 Empty, loading and error states
Every list has all three, designed, not plain text.

| State | Pattern |
|---|---|
| Loading | Skeleton matching the final layout (same grid, same row heights). Shimmer only when motion is allowed. |
| Empty folder | Large dashed folder outline, one sentence ("Nothing here yet"), one primary action ("Upload files"), one secondary ("New folder"). It also accepts drops. |
| Empty trash | "Trash is empty. Deleted files stay here until you remove them." No action. |
| Search, no results | Echo the query, suggest clearing filters, show a "Clear filters" button. |
| Error | What happened, what to do, a Retry button. No apology, no jargon. |

---

## 7. Motion
- Without user action: only skeleton shimmer and the upload progress bar.
- In response to user action: folder sheet lift (220ms), dialog and sheet open/close (160 to 200ms, opacity plus 8px translate), drop highlight, selection outline.
- Respect `prefers-reduced-motion` (reset in globals.css).
- Animate only `transform` and `opacity`. Never animate `width`, `height`, `top`, `left` or `box-shadow` on lists.

---

## 8. UI copy
- Sentence case, plain verbs, say what happens: "Move to folder", "Delete forever", "Copy link".
- One name per action everywhere: button "Delete", toast "Deleted", undo "Undo".
- Destructive confirmations name the object and the consequence: "Delete 3 files forever? You can't undo this."
- Errors give cause and fix: "Couldn't reach Google Drive. Check the account connection in Settings, then try again."
- No internal terms in the UI. Say "Drive account", not "connected account provider config".

---

## 9. Accessibility floor
- Text contrast 4.5:1 or better; borders of controls 3:1.
- Everything reachable by keyboard, visible focus ring on every interactive element.
- Drag and drop always has a non-drag equivalent (Move dialog or Cut / Paste).
- Icon-only buttons have `aria-label`.
- Dialogs trap focus, restore it on close, close on Escape.
- Status changes (upload finished, item deleted) are announced via `aria-live`.
- Touch targets at least 40px.

---

## 10. Visual QA loop (run after every screen)
1. Open the page at 1440, 1024 and 390px wide, in light and dark.
2. Compare with the "I like" references: same calm density, same single accent, same folder character.
3. Check against the "I don't like" list in section 1: identical folders, repeated timestamps, nested boxes, glow backgrounds, crowded top bar.
4. Tab through the page once. Every control reachable, focus visible.
5. Test loading, empty and error states (throttle the network, open an empty folder, force a failing action).
6. Run Lighthouse on `/all-files`: Performance 90 or higher, Accessibility 95 or higher.
