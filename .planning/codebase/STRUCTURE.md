# Codebase Structure

**Analysis Date:** 2026-02-04

## Directory Layout

```
notetaiker/
├── apps/
│   ├── api/            # Hono backend + background worker
│   └── web/            # React + Vite frontend
├── packages/
│   ├── env/            # Shared environment configuration
│   ├── eslint-config/  # Shared ESLint configuration
│   └── tsconfig/       # Shared TypeScript configuration
├── data/
│   └── notes/          # Primary storage for .md note files
└── .notetaiker/        # SQLite index and local system data
```

## Directory Purposes

**apps/api:**
- Purpose: Backend server and background processing.
- Contains: Hono routes, business logic services, and database indexing.
- Key files: `src/index.ts` (entry), `src/services/` (core logic).

**apps/web:**
- Purpose: Frontend user interface.
- Contains: React components, hooks, and static assets.
- Key files: `src/App.tsx` (main layout), `src/components/` (UI elements).

**packages/env:**
- Purpose: Unified environment variable management.
- Contains: Zod schemas for validating system configuration.
- Key files: `index.ts`.

**data/notes:**
- Purpose: Local-first data storage.
- Contains: Atomic Markdown files with YAML frontmatter.

## Key File Locations

**Entry Points:**
- `apps/api/src/index.ts`: Backend server entry and service initialization.
- `apps/web/src/main.tsx`: Frontend React root mounting.

**Configuration:**
- `turbo.json`: Monorepo build pipeline configuration.
- `pnpm-workspace.yaml`: Workspace package definitions.
- `packages/env/index.ts`: Environment variable schema and validation.

**Core Logic:**
- `apps/api/src/services/storage.service.ts`: File-based note persistence.
- `apps/api/src/services/indexer.service.ts`: SQLite indexing logic.
- `apps/api/src/services/worker.service.ts`: Background task orchestration.

**Testing:**
- `apps/api/src/**/*.test.ts`: Vitest unit and integration tests for backend services.

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `Editor.tsx`).
- Services: `kebab-case.service.ts` (e.g., `ai.service.ts`).
- Hooks: `useCamelCase.ts` (e.g., `useDebouncedSave.ts`).
- Routes: `kebab-case.ts` (e.g., `notes.ts`).

**Directories:**
- Feature-based in `apps/web/src/components/` (e.g., `editor/`, `search/`).
- Layer-based in `apps/api/src/` (e.g., `services/`, `routes/`).

## Where to Add New Code

**New Feature:**
- API Route: `apps/api/src/routes/[feature].ts`
- Service Logic: `apps/api/src/services/[feature].service.ts`
- UI Component: `apps/web/src/components/[feature]/`
- Shared Type: `apps/web/src/types/index.ts` or a new package if shared with API.

**New Component/Module:**
- Implementation: `apps/web/src/components/[category]/[Name].tsx`

**Utilities:**
- Shared helpers: `apps/api/src/lib/` or `apps/web/src/lib/`.

## Special Directories

**.notetaiker/:**
- Purpose: Stores the SQLite index database (`index.db`) and other local system state.
- Generated: Yes
- Committed: No

**data/notes/:**
- Purpose: Default directory for user-created notes.
- Generated: Yes (if missing)
- Committed: Optional (usually contains user data)

---

*Structure analysis: 2026-02-04*
