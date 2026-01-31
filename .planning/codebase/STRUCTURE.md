# Codebase Structure

**Analysis Date:** 2026-01-30

## Directory Layout

```
notetaiker/
├── apps/
│   ├── api/                # Hono backend + Worker
│   │   ├── src/
│   │   │   ├── lib/        # Shared utilities (markdown parsing)
│   │   │   ├── routes/     # API endpoints
│   │   │   └── services/   # Business logic & data access
│   │   └── test/           # API tests
│   └── web/                # React frontend
│       ├── src/
│       │   ├── components/ # UI components
│       │   ├── hooks/      # Custom React hooks
│       │   ├── lib/        # Frontend utilities
│       │   └── types/      # TypeScript definitions
├── packages/               # Shared monorepo packages
│   ├── env/                # Environment variable schemas
│   ├── eslint-config/      # Linting rules
│   └── tsconfig/           # Base TS configs
├── data/                   # Default local storage for notes (ignored by git)
└── .notetaiker/            # App configuration and SQLite database
```

## Directory Purposes

**apps/api/src/services:**

- Purpose: Core logic and infrastructure abstraction.
- Contains: Service classes for storage, indexing, AI, and queuing.
- Key files: `storage.service.ts`, `indexer.service.ts`, `ai.service.ts`.

**apps/api/src/routes:**

- Purpose: API endpoint definitions.
- Contains: Hono route handlers.
- Key files: `notes.ts`, `settings.ts`, `events.ts`.

**apps/web/src/components:**

- Purpose: Reusable UI elements and views.
- Contains: Layout, Editor, Graph, Search, and Sidebar components.
- Key files: `editor/Editor.tsx`, `graph/GraphView.tsx`.

**packages/env:**

- Purpose: Centralized environment variable management.
- Contains: Zod schemas for validation.
- Key files: `index.ts`.

## Key File Locations

**Entry Points:**

- `apps/api/src/index.ts`: Backend entry point.
- `apps/web/src/main.tsx`: Frontend entry point.

**Configuration:**

- `pnpm-workspace.yaml`: Monorepo workspace config.
- `turbo.json`: Build pipeline configuration.
- `apps/api/package.json`: Backend dependencies and scripts.
- `apps/web/package.json`: Frontend dependencies and scripts.

**Core Logic:**

- `apps/api/src/services/storage.service.ts`: Note persistence logic.
- `apps/api/src/services/worker.service.ts`: Background job processing.

**Testing:**

- `apps/api/src/**/*.test.ts`: Vitest unit and integration tests.

## Naming Conventions

**Files:**

- API Services: `*.service.ts`
- API Routes: `*.ts` (usually plural matching resource)
- Web Components: `PascalCase.tsx`
- Web Hooks: `use*.ts`

**Directories:**

- Kebab-case: `eslint-config`, `notetaiker-api`.

## Where to Add New Code

**New Feature:**

- Primary API logic: `apps/api/src/services/`
- API Endpoint: `apps/api/src/routes/`
- Frontend Hook: `apps/web/src/hooks/`
- Frontend View: `apps/web/src/components/`

**New Component/Module:**

- Implementation: `apps/web/src/components/` in a relevant subfolder.

**Utilities:**

- Backend shared helpers: `apps/api/src/lib/`
- Frontend shared helpers: `apps/web/src/lib/`

## Special Directories

**data/:**

- Purpose: Local note storage (Markdown files).
- Generated: Yes (by API)
- Committed: No

**.notetaiker/:**

- Purpose: Application metadata and SQLite index.
- Generated: Yes (by API)
- Committed: No

---

_Structure analysis: 2026-01-30_
