# DriveSync: Google Drive Web UI Reference & Design Specification

> **Status**: Authoritative UI/UX and Component Design Reference for DriveSync frontend development.  
> **Target Aesthetic**: Modern Google Drive Web UI (Material Design 3 / Google Workspace) infused with DriveSync's Multi-Account capabilities and "Quiet Archive" craftsmanship.

---

## 1. Executive Summary & Philosophy

Google Drive is the global benchmark for web cloud storage: familiar to billions of users, highly productive, uncluttered, and ergonomic. DriveSync adopts the **modern Google Drive Web interface (Material Design 3)** as its primary visual reference.

By mirroring Google Drive's spatial layout, search paradigms, filter chips, folder cards, and context menus, users experience **instant familiarity and zero learning curve**. On top of this foundation, DriveSync introduces our multi-account superpowers:
1. **Multi-Account Transparency**: Source account badges on every file and folder.
2. **Aggregated Quota Metering**: Segmented storage progress across multiple Google accounts.
3. **Smart Upload Routing**: Live target account selection and auto-allocation in the upload tray.
4. **Signature Folder Cards**: Tactile folder cards with paper sheets peeking out, combining Google Drive simplicity with physical desktop warmth.

---

## 2. Google Drive Web Layout & Spatial Anatomy

Google Drive web uses a modern containerized surface architecture (Material 3). The outer window is a soft canvas, while the main content lives inside a elevated, rounded container.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP APP BAR (h: 64px)                                                                                  │
│ [DriveSync Logo]         [  🔍 Search in DriveSync               (x) (≡) ]          [⚡] [⚙️] [Theme] [Avatar]│
├───────────────────┬──────────────────────────────────────────────────────────┬─────────────────────────┤
│ NAVIGATION DRAWER │ MAIN CONTENT CONTAINER (rounded-3xl, bg-surface)         │ INFO / ACTIVITY DRAWER  │
│ (w: 256px)        │                                                          │ (w: 320px, Collapsible) │
│                   │ ┌──────────────────────────────────────────────────────┐ │                         │
│ [ + New Button ]  │ │ FILTER CHIPS: [Account ▾] [Type ▾] [People ▾] [Date ▾]│ │ [ Details | Activity ]  │
│                   │ ├──────────────────────────────────────────────────────┤ │                         │
│  🏠 Home          │ │ Breadcrumbs: My Drive > Projects > 2026 Branding     │ │ [Large File Preview]    │
│  📁 My Drive (▾)  │ │ Views: [ 𝄜 List | ⊞ Grid ]       [ Sort ▾ ]  [ ℹ️ Info]│ │                         │
│  👥 Shared        │ ├──────────────────────────────────────────────────────┤ │ Storage Account:        │
│  🕒 Recent        │ │ FOLDERS                                              │ │  google_drive (Work)    │
│  ⭐ Starred       │ │ [Folder A]   [Folder B]   [Folder C]                 │ │                         │
│  🗑️ Trash          │ ├──────────────────────────────────────────────────────┤ │ Properties:             │
│                   │ │ FILES                                                │ │  Type: PDF Document     │
│ ───────────────── │ │ [File Card 1]  [File Card 2]  [File Card 3]          │ │  Size: 14.8 MB          │
│ ACCOUNTS (3)      │ │                                                      │ │  Created: Oct 18, 2026  │
│  🔵 personal@...  │ │                                                      │ │                         │
│  🟢 work@corp...  │ │                                                      │ │ Who has access:         │
│                   │ │                                                      │ │  [Avatar A] [Avatar B]  │
│ STORAGE POOL      │ │                                                      │ │                         │
│ [====---] 42/130GB│ └──────────────────────────────────────────────────────┘ │ [Manage Access]         │
└───────────────────┴──────────────────────────────────────────────────────────┴─────────────────────────┘
                                                                 ┌───────────────────────────────────────┐
                                                                 │ FLOATING UPLOAD TRAY (Bottom-Right)   │
                                                                 │ Uploading 2 items... [==] [—] [✕]     │
                                                                 └───────────────────────────────────────┘
```

### 2.1 Dimensional Standards

| Element | Height / Width | Border Radius | Light Mode Token | Dark Mode Token |
| :--- | :--- | :--- | :--- | :--- |
| **Top App Bar** | `h-16` (64px) | `none` | `bg-canvas` (`#F8FAFD`) | `bg-canvas` (`#131314`) |
| **Search Bar** | `h-12` (48px), max-w: 720px | `rounded-full` (9999px) | `bg-surface-2` (`#EEF2F6`) | `bg-surface-2` (`#282A2D`) |
| **Left Sidebar** | `w-64` (256px) | `none` | `bg-canvas` (`#F8FAFD`) | `bg-canvas` (`#131314`) |
| **Main Content Container** | `calc(100vh - 80px)` | `rounded-3xl` (24px) | `bg-surface` (`#FFFFFF`) | `bg-surface` (`#1E1F20`) |
| **"+ New" Button** | `h-14` (56px), min-w: 120px | `rounded-2xl` (16px) | `bg-surface`, elevated shadow | `bg-surface-2`, elevated shadow |
| **Filter Chips** | `h-8` (32px) | `rounded-lg` (8px) | `border border-line bg-surface` | `border border-line bg-surface` |
| **Folder Card** | `h-28` to `h-36`, w-full | `rounded-xl` (12px) | `bg-surface-2` / custom tint | `bg-surface-2` / custom tint |
| **Grid File Card** | `h-52` (208px), w-full | `rounded-xl` (12px) | `bg-surface-2` | `bg-surface-2` |
| **Details Drawer** | `w-80` to `w-96` (320-384px) | `rounded-3xl` (24px) | `bg-surface` (`#FFFFFF`) | `bg-surface` (`#1E1F20`) |

---

## 3. Top App Bar & Search

### 3.1 Search Bar Interaction
The search bar is the central anchor of Google Drive:
- **Default State**:
  - Soft grey pill with search magnifying glass on left.
  - Text placeholder: `"Search in DriveSync"`.
  - Right icons: Clear query `✕` (when text entered) and Filter tuning sliders icon `≡` (opens advanced search modal).
- **Active / Focused State**:
  - Expands slightly with a clean elevation shadow (`--shadow-pop`).
  - Background shifts to solid white in light mode (`#FFFFFF`) with a subtle blue focus ring (`#0B57D0`).
  - Opens instant autocomplete popover showing:
    - Quick search suggestions based on file names.
    - Quick type filter pills: `PDFs`, `Documents`, `Spreadsheets`, `Presentations`, `Photos & Images`.
    - Recent searches with clock icon and remove button.

### 3.2 Right Utility Header Cluster
From left to right:
1. **Sync / Health Indicator**: Rotating arrows or cloud checkmark indicating real-time sync with Google Drive and S3 accounts.
2. **Settings Gear**: Opens modal for Upload Routing Policies, S3 configurations, and App preferences.
3. **Theme Switcher**: Smooth toggle between Light and Dark modes.
4. **User Profile Avatar**: Displays current user picture, name, and opens the **Multi-Account Switcher & Management Menu**.

---

## 4. Left Navigation Drawer ("The Rail")

### 4.1 The Google "+ New" Action Button
The primary call-to-action is styled after Google's Material 3 action pill:
- Shape: `rounded-2xl` (16px radius) with soft drop shadow.
- Content: Multicolor Google-themed plus icon (or high-contrast accent) + `"New"` bold text label.
- Behavior: Clicking triggers a Radix dropdown menu:
  - 📁 **New folder** (`Ctrl+Shift+N`)
  - 📤 **Upload files** (`Ctrl+U`)
  - 📂 **Upload folder**
  - ──────────
  - ➕ **Connect Google Drive account**
  - 🪣 **Connect S3 Storage bucket**

### 4.2 Navigation Tree Items
Each navigation row has:
- Height: `h-10` (40px) with generous hit area.
- Hover State: Subtle rounded pill background (`bg-surface-2`).
- Active State: Filled background with bold ink (`bg-accent-soft text-accent font-medium`).
- Expandable Tree: Rows with child folders have a leading chevron (`›` / `ˇ`) that dynamically animates to reveal subfolders.

### 4.3 Multi-Account Status Section
Below navigation items, a dedicated **Connected Accounts** accordion shows:
- Account row: Avatar/favicon, email handle (`work@corp.com`), and green status dot.
- Mini storage meter under each account showing percent full.
- Fast filter: Clicking an account immediately filters the main view to that account only.

### 4.4 Aggregated Storage Meter
At the bottom of the drawer:
- **Segmented Storage Bar**: Stacks each connected account's used gigabytes into a multi-colored unified bar.
- Text: `"42.8 GB of 130 GB used"` (bold, clean typography).
- Action button: `"Manage accounts & storage"` opens the detailed storage routing and accounts modal.

---

## 5. Search Filter Chips Bar

Located directly underneath the top bar at the top of the main stage. Users can combine chips to pinpoint files in seconds across any connected drive:

```
[ Account: All Drives ▾ ]  [ Type: All ▾ ]  [ Modified: Anytime ▾ ]  [ People: Anyone ▾ ]  [ Clear Filters ✕ ]
```

### Supported Filter Chips
1. **Account Chip** *(DriveSync Superpower)*:
   - Options: `All Accounts`, `personal@gmail.com (15GB)`, `work@company.com (100GB)`, `S3 Backup`.
   - Displays count of files matching the selected account.
2. **Type Chip**:
   - `Documents` (`.docx`, Google Docs)
   - `Spreadsheets` (`.xlsx`, Google Sheets)
   - `Presentations` (`.pptx`, Google Slides)
   - `PDFs` (`.pdf`)
   - `Photos & Images` (`.jpg`, `.png`, `.webp`, `.svg`)
   - `Videos` (`.mp4`, `.mov`, `.mkv`)
   - `Audio` (`.mp3`, `.wav`)
   - `Archives` (`.zip`, `.tar.gz`)
   - `Folders`
3. **Modified Date Chip**:
   - `Today`, `Last 7 days`, `Last 30 days`, `This year`, `Custom date range...`
4. **People / Owner Chip**:
   - `Anyone`, `Owned by me`, `Shared with me`.

---

## 6. Main Stage: Files & Folders Presentation

DriveSync supports seamless switching between **Grid View** and **List View** with preserved selection states.

### 6.1 Section Layout
The main stage is divided into clear vertical sections:
1. **Suggested / Recent Files** (Horizontal scroll or small 4-card grid of recently touched items).
2. **Folders** (Grid of folder cards or collapsible list).
3. **Files** (Full grid of file preview cards or dense data table).

---

### 6.2 Signature Folder Card (Grid Mode)

Fusing Google Drive's clean folder paradigm with the physical paper-sheet peek from the reference designs:

```
┌───────────────────────────────────────────────┐
│  ┌──────────────────────┐                     │
│  │ Peeking Paper Note   │ (Lifts on hover)    │
│ ┌┴──────────────────────┴───────────────────┐ │
│ │  📁 Folder Pocket (Tinted by folder color)│ │
│ │                                           │ │
│ │  Onboarding Assets                        │ │
│ │  15 files • 180 MB                        │ │
│ │                                           │ │
│ │  [🔵 personal@gmail.com]            [ ⋮ ] │ │
│ └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

- **Interactive Paper Sheet**: Peeks out from the folder tab. On `:hover`, it lifts by 6px (`translate-y-[-6px]`). On `:dragover`, it lifts further to welcome incoming files.
- **Account Badge**: Renders at bottom-left of the folder card with provider icon and email.
- **Folder Color**: Inherits user-customized colors (Blue, Green, Red, Amber, Purple, Slate).
- **Options Button (`⋮`)**: Appears on hover for quick access to Rename, Change Color, Download ZIP, and Trash.

---

### 6.3 File Preview Card (Grid Mode)

```
┌───────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────┐ │
│ │                                           │ │
│ │      VISUAL PREVIEW THUMBNAIL             │ │
│ │      (Image / Video Frame / PDF Cover)    │ │
│ │                                           │ │
│ └───────────────────────────────────────────┘ │
│  📄 Project_Proposal_Final.pdf                │
│  4.8 MB • Modified Oct 18, 2026               │
│                                               │
│  [🔵 personal@gmail.com]                [ ⋮ ] │
└───────────────────────────────────────────────┘
```

- **Thumbnail Preview (`h-36`)**: High-resolution image preview, PDF first-page render, video poster, or styled Material 3 mime-type illustration.
- **Footer Metadata**:
  - File type icon (Google Drive colored: Blue Doc, Green Sheet, Yellow Slide, Red PDF).
  - Truncated filename with full title on hover tooltip.
  - Account pill indicating which Google account holds this file.
  - Context menu trigger `⋮`.

---

### 6.4 File Table (List View)

For power users who prefer high-density browsing:

| [ ] | Name | Account / Owner | Last Modified | File Size | Actions |
| :---: | :--- | :--- | :--- | :--- | :---: |
| [ ] | 📄 **Contract_Signed.pdf** ⭐ | [Avatar] `work@corp.com` | Today at 2:15 PM | 2.4 MB | `⋮` |
| [ ] | 📊 **Q3_Financials.xlsx** | [Avatar] `personal@gmail.com`| Oct 14, 2026 | 18.2 MB | `⋮` |
| [ ] | 🎬 **Keynote_Recording.mp4** | [Avatar] `work@corp.com` | Oct 10, 2026 | 1.4 GB | `⋮` |

- **Header Sorting**: Clicking `Name`, `Last Modified`, or `File Size` toggles ascending/descending order with animated sort arrows.
- **Hover & Selection**: Rows smoothly tint with `--accent-soft` when selected. Multi-selection via Shift+Click and Ctrl/Cmd+Click.

---

## 7. Floating Multi-Selection Action Bar

When one or more items are selected, a floating pill toolbar animates in at the top-center or bottom-center:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [✕] 3 items selected  │  📥 Download ZIP  │  ➡️ Move  │  🔗 Share  │  ⭐ Star  │  🗑️ Trash  │  ⋮  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- Prevents cluttering the default view with disabled action buttons.
- Supports batch actions across multiple accounts simultaneously (e.g., download files from Account A and Account B together in a single generated ZIP).

---

## 8. File Information & Activity Drawer

Toggled via the top-right `ℹ️` button or by double-clicking/right-clicking `"View details"`:

### 8.1 "Details" Tab
1. **Large Preview**: Formatted interactive preview card.
2. **Who has access**: Google Drive collaborators with avatars, permissions (`Viewer`, `Editor`), and `"Share"` button.
3. **Properties Table**:
   - **Type**: `PDF Document (.pdf)`
   - **Size**: `14.8 MB (15,518,720 bytes)`
   - **Storage Account**: `Google Drive: work@company.com`
   - **Storage Used**: `14.8 MB`
   - **Location**: `My Drive > Projects > 2026`
   - **Owner**: `Sojib Ahmed`
   - **Created**: `Oct 16, 2026, 11:12 PM`
   - **Modified**: `Oct 18, 2026, 4:20 PM`

### 8.2 "Activity" Tab
Chronological event stream matching Google Drive's audit trail:
- 📤 *You uploaded an item to work@company.com — Today, 2:15 PM*
- ✏️ *You renamed Contract_Draft.pdf to Contract_Signed.pdf — Today, 1:40 PM*
- 📁 *You moved 3 items to Projects folder — Yesterday, 5:30 PM*

---

## 9. Floating Upload Tray (Bottom-Right)

Modeled directly after Google Drive's iconic transfer widget:

```
┌──────────────────────────────────────────────────────────────┐
│  Uploading 3 items                      [ 33% ]   [ — ] [ ✕ ]│
├──────────────────────────────────────────────────────────────┤
│  Destination: 🔵 personal@gmail.com (Most free space)        │
├──────────────────────────────────────────────────────────────┤
│  📄 pitch_deck.pdf                     4.2/12 MB  [==---] [✕]│
│  🎬 demo_video.mp4                     Waiting...             │
│  📊 projections.xlsx                   ✓ Completed            │
└──────────────────────────────────────────────────────────────┘
```

- **Collapsible**: Can be minimized to a small status pill at bottom-right during long uploads.
- **Transfer Metrics**: Shows live upload speed (e.g. `12.4 MB/s`) and estimated time remaining.
- **Auto-Routing Indicator**: Explicitly names which Google Drive is receiving each file according to the active policy.

---

## 10. Material 3 Color Tokens & Theming

### 10.1 Semantic CSS Tokens

```css
/* Light Theme (Aligned with Google Drive Web M3) */
:root {
  color-scheme: light;
  --canvas: #F8FAFD;                    /* Google Drive page background */
  --surface: #FFFFFF;                   /* Elevated main container & cards */
  --surface-2: #EEF2F6;                 /* Search bar, chips, hover states */
  --surface-container-high: #E3E8EF;    /* Selected row, borders */
  --line: #E0E3E7;                      /* Hairline dividers */
  --line-strong: #C4C7C5;
  --ink: #1F1F1F;                       /* High-emphasis text */
  --ink-2: #444746;                     /* Medium-emphasis metadata */
  --ink-3: #747775;                     /* Placeholders and disabled */
  --accent: #0B57D0;                    /* Google Drive primary action blue */
  --accent-soft: #D3E3FD;               /* Active navigation pill tint */
  --accent-ink: #FFFFFF;
}

/* Dark Theme (Aligned with Google Drive Dark M3) */
.dark {
  color-scheme: dark;
  --canvas: #131314;                    /* Google Drive dark canvas */
  --surface: #1E1F20;                   /* Main stage dark container */
  --surface-2: #282A2D;                 /* Dark search bar & chip fill */
  --surface-container-high: #333538;    /* Dark hover & selection */
  --line: #444746;                      /* Dark line dividers */
  --line-strong: #5E5E5E;
  --ink: #E3E3E3;                       /* High-emphasis dark text */
  --ink-2: #C4C7C5;                     /* Secondary dark text */
  --ink-3: #8E918F;                     /* Muted dark text */
  --accent: #A8C7FA;                    /* Google Drive dark accent blue */
  --accent-soft: #0842A0;               /* Dark active pill tint */
  --accent-ink: #040C1A;
}
```

### 10.2 Google File Type Brand Colors
- **Google Docs / Word**: `#4285F4` (Docs Blue)
- **Google Sheets / Excel**: `#0F9D58` (Sheets Green)
- **Google Slides / PowerPoint**: `#F4B400` (Slides Amber)
- **Adobe Acrobat / PDFs**: `#EA4335` (PDF Red)
- **Photos & Graphics**: `#A142F4` (Purple)
- **Video Media**: `#E91E63` (Rose)
- **Audio Media**: `#00ACC1` (Teal)
- **Compressed Archives**: `#78909C` (Slate)

---

## 11. Design Letter to the Coding Agent: Rules of Execution

When implementing any frontend component or page, adhere strictly to these principles:

1. **No Clutter, No Box-in-Box**: Wrap file lists directly inside the primary surface container. Never nest cards inside extra border cards.
2. **Generous Spacing & Soft Radii**: Use `rounded-3xl` for the main stage, `rounded-2xl` for the "+ New" button, and `rounded-xl` for cards. Avoid harsh 90-degree corners.
3. **Pill-Shaped Everything**: Search bars, active nav indicators, and filter chips must use pill or soft capsule geometry (`rounded-full` or `rounded-lg`).
4. **Always Show the Owning Account**: Every folder, file row, and file card must make it obvious which Google Drive or S3 account holds the file using the compact `AccountBadge`.
5. **Real Google Drive Context Menus**: Right-clicking an item must trigger a full Radix context menu with icons matching Google Drive conventions. Never rely on the default browser menu.
6. **Smooth State Transitions**: All hover, focus, and selection states must use standard CSS transitions (`transition-all duration-150 ease-out`).
7. **Mobile & Tablet Responsiveness**: At `<1024px`, collapse the left drawer into a slide-over sheet and dock primary actions into a mobile bottom app bar.
