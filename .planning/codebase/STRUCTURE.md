# Codebase Structure

**Analysis Date:** 2026-02-03

## Directory Layout

```
notetaiker/
├── apps/
│   ├── api/                # Hono backend + Background Workers
│   │   ├── src/
│   │   │   ├── lib/        # Shared backend utilities (markdown, etc.)
│   │   │   ├── routes/     # Hono route definitions
│   │   │   └── services/   # Business logic, DB access, AI, Workers
│   │   └── dist/           # Compiled backend output
│   └── web/                # React + Vite frontend
│       ├── src/
│       │   ├── components/ # React components (UI, Editor, Graph, etc.)
│       │   ├── hooks/      # Custom React hooks (save, persistence, SSE)
│       │   ├── lib/        # API client and utilities
│       │   └── types/      # Frontend TypeScript definitions
│       └── dist/           # Bundled frontend output
├── packages/               # Shared monorepo packages
│   ├── env/                # Zod environment schemas
│   ├── eslint-config/      # Shared linting configuration
│   └── tsconfig/           # Base TypeScript configurations
├── data/                   # Default storage for Markdown notes (git-ignored)
└── .notetaiker/            # App metadata and SQLite index database
```

## Directory Purposes

**apps/api/src/services:**
- Purpose: Core infrastructure and logic encapsulation.
- Contains: Services for storage, indexing, AI provider integration, and background task management.
- Key files: `storage.service.ts`, `indexer.service.ts`, `ai.service.ts`, `worker.service.ts`.

**apps/api/src/routes:**
- Purpose: HTTP endpoint definitions and request handling.
- Contains: Hono route modules.
- Key files: `notes.ts`, `settings.ts`, `events.ts`.

**apps/web/src/components:**
- Purpose: User interface modules.
- Contains: Atomic components and complex views like the graph and editor extensions.
- Key files: `editor/Editor.tsx`, `graph/ForceGraph.tsx`, `sidebar/Sidebar.tsx`.

**apps/web/src/hooks:**
- Purpose: Shared React logic and state management.
- Contains: Logic for debounced saving, local persistence, and SSE event handling.
- Key files: `useDebouncedSave.ts`, `useTimeline.ts`, `useSSE.ts`.

## Key File Locations

**Entry Points:**
- `apps/api/src/index.ts`: Backend entry point (Node.js server).
- `apps/web/src/main.tsx`: Frontend entry point (React mount).

**Configuration:**
- `package.json`: Workspace-level dependencies and scripts.
- `turbo.json`: Turbo build pipeline definition.
- `pnpm-workspace.yaml`: Monorepo workspace setup.

**Core Logic:**
- `apps/api/src/services/storage.service.ts`: Note persistence and index coordination.
- `apps/api/src/services/worker.service.ts`: Background enrichment process.
- `apps/api/src/lib/markdown.ts`: Markdown parsing and frontmatter extraction.

**Testing:**
- `apps/api/src/**/*.test.ts`: Backend unit and service tests.

## Naming Conventions

**Files:**
- API Services: `*.service.ts`
- API Routes: Plural resource names (e.g., `notes.ts`).
- React Components: `PascalCase.tsx`.
- React Hooks: `use*.ts` (camelCase).
- Test Files: `*.test.ts`.

**Directories:**
- Kebab-case: `eslint-config`, `apps/api`, `apps/web`.

## Where to Add New Code

**New Feature:**
- API logic: `apps/api/src/services/`
- API Route: `apps/api/src/routes/`
- Frontend Hook: `apps/web/src/hooks/`
- Frontend View: `apps/web/src/components/`

**New Component/Module:**
- Implementation: `apps/web/src/components/[category]/`

**Utilities:**
- Shared API logic: `apps/api/src/lib/`
- Shared Web logic: `apps/web/src/lib/`

## Special Directories

**data/:**
- Purpose: Default directory for user Markdown notes.
- Generated: No (configured via ENV, created on startup if missing).
- Committed: No.

**.notetaiker/:**
- Purpose: Persistent application metadata and search index.
- Generated: Yes (on first run).
- Committed: No.

---

*Structure analysis: 2026-02-03*
