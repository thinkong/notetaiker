# Architecture

**Analysis Date:** 2026-02-03

## Pattern Overview

**Overall:** Local-first Monorepo with AI-Enriched Indexing

**Key Characteristics:**
- **Local-First Persistence:** Notes are stored as individual Markdown files on the local filesystem.
- **Asynchronous AI Enrichment:** Background workers process notes to generate tags and metadata without blocking the main thread.
- **SQLite Search Index:** A local SQLite database maintains a searchable index of the Markdown files for performance.
- **SSE Real-time Updates:** Server-Sent Events notify the frontend of background task completion (e.g., AI tag generation).

## Layers

**API Layer:**
- Purpose: Provides RESTful endpoints and real-time event streaming.
- Location: `apps/api/src/routes`
- Contains: Hono route definitions, request validation, and service orchestration.
- Depends on: Services Layer.
- Used by: Web Frontend.

**Services Layer:**
- Purpose: Encapsulates core business logic and infrastructure access.
- Location: `apps/api/src/services`
- Contains: `StorageService`, `IndexerService`, `AIService`, `QueueService`, `WorkerService`.
- Depends on: Node.js standard libraries (`fs`, `path`), `better-sqlite3`, `p-queue`.
- Used by: API Layer, Background Workers.

**Frontend Layer:**
- Purpose: User interface for creating, editing, and visualizing notes.
- Location: `apps/web/src`
- Contains: React components, TanStack Query hooks, React Router definitions.
- Depends on: API Layer (via Hono client).
- Used by: End Users.

**Shared Packages:**
- Purpose: Shared configuration and environment management.
- Location: `packages/`
- Contains: `@notetaiker/env`, `@notetaiker/eslint-config`, `@notetaiker/tsconfig`.
- Depends on: `zod`.
- Used by: `apps/api`, `apps/web`.

## Data Flow

**Note Capture & Enrichment:**

1. User submits note content in `apps/web/src/App.tsx`.
2. Frontend calls `/notes` endpoint in `apps/api/src/routes/notes.ts`.
3. `StorageService` (`apps/api/src/services/storage.service.ts`) writes the Markdown file.
4. `IndexerService` (`apps/api/src/services/indexer.service.ts`) updates the SQLite index.
5. `QueueService` enqueues a job for AI processing.
6. `WorkerService` (`apps/api/src/services/worker.service.ts`) picks up the job, calls `AIService`, and updates the note with tags.
7. `EventsService` broadcasts a `note_updated` event via SSE to the frontend.

**Search and Retrieval:**

1. Frontend requests notes via `useTimeline` hook in `apps/web/src/hooks/useTimeline.ts`.
2. API queries `IndexerService` which performs a SELECT on the SQLite database.
3. Metadata and partial content are returned to the frontend.

**State Management:**
- Server state managed via TanStack Query.
- Local draft state managed via `useDraftPersistence` in `apps/web/src/hooks/useDraftPersistence.ts`.
- Source of truth is the local filesystem.

## Key Abstractions

**StorageService:**
- Purpose: High-level API for reading/writing notes and coordinating index updates.
- Examples: `apps/api/src/services/storage.service.ts`
- Pattern: Repository Pattern.

**IndexerService:**
- Purpose: Manages the SQLite database that acts as a cache/search index for the Markdown files.
- Examples: `apps/api/src/services/indexer.service.ts`
- Pattern: Search Index / Materialized View.

**WorkerService:**
- Purpose: Orchestrates background tasks using a priority queue.
- Examples: `apps/api/src/services/worker.service.ts`
- Pattern: Consumer / Task Processor.

## Entry Points

**Backend Server:**
- Location: `apps/api/src/index.ts`
- Triggers: Starts the Node.js process.
- Responsibilities: Initializes services, runs initial index sync, starts background workers, and listens for HTTP requests.

**Frontend Application:**
- Location: `apps/web/src/main.tsx`
- Triggers: Browser page load.
- Responsibilities: Mounts the React application, initializes providers (QueryClient, Router).

## Error Handling

**Strategy:** Fail-soft with retries for background tasks.

**Patterns:**
- **p-retry:** Used in `WorkerService` for AI API calls.
- **Validation:** Zod schemas for all environment variables and API payloads.
- **Safe Writes:** `write-file-atomic` used in `StorageService` to prevent file corruption.

## Cross-Cutting Concerns

**Logging:** Console logging with specific service prefixes.
**Validation:** Zod-based runtime validation at the boundary (ENV and API).
**Authentication:** Secret management for AI provider API keys.

---

*Architecture analysis: 2026-02-03*
