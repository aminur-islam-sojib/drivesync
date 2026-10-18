# DriveSync

DriveSync is a multi-account Google Drive and S3 storage gateway and aggregator. It consolidates multiple cloud accounts into a unified, high-performance file manager with virtual folder hierarchies, fast streaming previews, and seamless upload pipelines.

---

## Architecture Overview

```
drivesync/
├── backend/                   # READY: Express 5 + Prisma 7 + PostgreSQL REST API (Port 4000)
│   ├── src/
│   │   ├── modules/           # auth, connected-accounts, storage, files, folders, uploads
│   │   ├── config/            # environment, prisma client, pg driver adapter
│   │   └── middleware/        # auth, error handling
│   ├── prisma.config.ts       # Prisma 7 CLI configuration
│   └── prisma/schema.prisma   # Database schema
├── frontend/                  # ACTIVE: Next.js 16 App Router + React 19 + Tailwind v4 (Port 3000)
│   ├── src/app/               # Pages, layouts, and route handlers
│   ├── src/components/        # Layout, folders, files, uploads, dialogs
│   ├── src/lib/               # API client, upload coordinator, formatters
│   └── src/stores/            # Zustand 5 client stores (auth, ui, selection, upload, dialog)
├── docs/                      # Architectural specifications and references
│   ├── APP_ARCHITECTURE_AND_TECH_STACK.md # App capabilities, public/protected domains & tech stack
│   ├── GOOGLE_DRIVE_UI_REFERENCE.md # Modern Google Drive Web UI & Material 3 reference
│   ├── MULTI_ACCOUNT_MANAGEMENT.md # Multi-Account Google Drive architecture & UX guide
│   ├── API_REFERENCE.md       # Complete backend endpoint contracts & schemas
│   ├── FRONTEND.md            # Frontend architecture & state patterns
│   ├── DESIGN_SYSTEM.md       # "Quiet archive" design system & tokens
│   ├── PROJECT_AUDIT.md       # Full legacy audit and decision log
│   └── references/            # Visual target screenshots (like/ & dislike/)
├── .agents/                   # Antigravity agent configuration (rules, skills, workflows)
│   ├── rules/drivesync.md     # Always-on development guidelines
│   ├── skills/                # drivesync-frontend, drivesync-backend, drivesync-design, etc.
│   └── workflows/             # Slash commands (/migrate-feature, /ui-review)
├── AGENTS.md                  # Root rules file (auto-loaded by Antigravity)
├── GEMINI.md                  # Symlink -> AGENTS.md
└── AGENT_KICKOFF_PROMPT.md    # Phase-by-phase prompts for implementing the frontend
```

---

## Quickstart

### 1. Backend (`backend/`)
The backend is already implemented and ready.
```bash
cd backend
npm install
# Ensure PostgreSQL database is configured in backend/.env
npm run db:push
npm run dev
# Server listens on http://localhost:4000
```

### 2. Frontend (`frontend/`)
The frontend is the active development workspace.
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

---

## Agent Guidance & Prompts

* Read **[AGENTS.md](file:///home/sojib-ahmed/Projects%20/drivesync/AGENTS.md)** for project rules and conventions.
* Open **[AGENT_KICKOFF_PROMPT.md](file:///home/sojib-ahmed/Projects%20/drivesync/AGENT_KICKOFF_PROMPT.md)** to execute the frontend implementation phase by phase.
* Check **[docs/API_REFERENCE.md](file:///home/sojib-ahmed/Projects%20/drivesync/docs/API_REFERENCE.md)** whenever integrating an endpoint.
