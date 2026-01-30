# Architecture

**Analysis Date:** 2026-01-30

## Pattern Overview

**Overall:** Service-Oriented Monorepo with Local-First Data Strategy

**Key Characteristics:**
- **Local-First:** Notes are stored as Markdown files on the local filesystem, ensuring user ownership and offline availability.
- **Asynchronous Enrichment:** AI analysis (tagging, etc.) is handled via a background job queue to keep the UI responsive.
- **Hybrid Storage:** SQLite is used as a high-performance index and job queue, while the filesystem remains the source of truth for content.

## Layers

**API Layer:**
- Purpose: Provides REST endpoints and Server-Sent Events (SSE) for the frontend.
- Location: `apps/api/src/routes`
- Contains: Hono route definitions, request validation (Zod), and service orchestration.
- Depends on: Services Layer
- Used by: Frontend Web Application

**Services Layer:**
- Purpose: Encapsulates business logic, data persistence, and external integrations.
- Location: `apps/api/src/services`
- Contains: `StorageService`, `IndexerService`, `AIService`, `QueueService`, `WorkerService`.
- Depends on: Libraries, SQLite, Filesystem, External AI APIs.
- Used by: API Layer, Worker Service.

**Frontend Layer:**
- Purpose: User interface for capturing and viewing notes, including a graph visualization.
- Location: `apps/web/src`
- Contains: React components, TanStack Query hooks, CodeMirror editor extensions.
- Depends on: API Layer (via HTTP/SSE).
- Used by: End user.

## Data Flow

**Note Capture Flow:**

1. User types in the editor in `apps/web/src/App.tsx`.
2. `useDebouncedSave` hook triggers a POST request to `/notes` in `apps/api/src/routes/notes.ts`.
3. `StorageService` saves the Markdown file to disk and updates the `IndexerService` (SQLite).
4. `QueueService` enqueues a background job for AI processing.
5. `WorkerService` picks up the job, calls `AIService`, and updates the note's frontmatter via `StorageService`.

**Note Retrieval Flow:**

1. Frontend requests notes from `/notes` or specific note from `/notes/:id`.
2. `StorageService` retrieves data. For lists, it queries `IndexerService` (SQLite) for performance. For single notes, it reads the Markdown file from disk.
3. Metadata is parsed from frontmatter using `apps/api/src/lib/markdown.ts`.

## Key Abstractions

**Storage Service:**
- Purpose: Unified interface for filesystem operations and index synchronization.
- Examples: `apps/api/src/services/storage.service.ts`
- Pattern: Repository Pattern

**Indexer Service:**
- Purpose: Maintains a searchable SQLite index of the Markdown files.
- Examples: `apps/api/src/services/indexer.service.ts`
- Pattern: Search Index / Projection

**Worker Service:**
- Purpose: Manages background processing of notes.
- Examples: `apps/api/src/services/worker.service.ts`
- Pattern: Background Worker / Consumer

## Entry Points

**API Server:**
- Location: `apps/api/src/index.ts`
- Triggers: `pnpm dev` or `node index.js`
- Responsibilities: Initializes services, starts Hono server, begins background worker.

**Web Client:**
- Location: `apps/web/src/main.tsx`
- Triggers: Browser loading the application.
- Responsibilities: Mounts React tree, initializes QueryClient and Router.

## Error Handling

**Strategy:** Fail-soft with background recovery.

**Patterns:**
- **Job Recovery:** Stuck jobs are reset on server restart in `apps/api/src/index.ts`.
- **Validation:** Runtime request validation using Zod in Hono routes.

## Cross-Cutting Concerns

**Logging:** Standard console logging in API and Web.
**Validation:** Zod schemas used for API contracts and environment variables.
**Authentication:** Secrets management handled by `SecretsService` via environment variables.

---

*Architecture analysis: 2026-01-30*
