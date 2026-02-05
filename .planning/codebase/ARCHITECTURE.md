# Architecture

**Analysis Date:** 2026-02-04

## Pattern Overview

**Overall:** Local-first Monorepo with Service-Oriented Backend and Component-based Frontend.

**Key Characteristics:**

- **Local-First Persistence:** Primary data storage is atomic Markdown files on the local filesystem.
- **Hybrid Indexing:** SQLite is used as a secondary "view" layer for fast querying and full-text search, kept in sync with the filesystem.
- **Asynchronous Processing:** AI analysis and indexing tasks are handled via a background worker and queue system to keep the UI responsive.

## Layers

**API Layer (Backend):**

- Purpose: Provides a RESTful interface for the frontend to interact with notes and settings.
- Location: `apps/api/src/routes/`
- Contains: Hono route definitions and input validation (Zod).
- Depends on: Services Layer.
- Used by: Web Client.

**Services Layer (Backend):**

- Purpose: Encapsulates business logic, file I/O, and external integrations.
- Location: `apps/api/src/services/`
- Contains: `StorageService`, `IndexerService`, `AIService`, `WorkerService`, `QueueService`.
- Depends on: Local filesystem, SQLite (via `better-sqlite3`), Vercel AI SDK.
- Used by: API Layer, Worker Service.

**UI Layer (Frontend):**

- Purpose: User interface for capturing and managing notes.
- Location: `apps/web/src/components/`
- Contains: React components, hooks for state management and API interaction.
- Depends on: TanStack Query, React Router, Hono Client.
- Used by: End user.

## Data Flow

**Note Creation/Update Flow:**

1. **User Input:** User types in the editor in `apps/web/src/App.tsx`.
2. **Auto-save:** `useDebouncedSave` hook sends content to `POST/PATCH /notes`.
3. **Persistence:** `StorageService` in `apps/api/src/services/storage.service.ts` writes the Markdown file to disk with frontmatter.
4. **Indexing:** `StorageService` calls `IndexerService` to update the SQLite index immediately.
5. **Background Task:** `QueueService` enqueues a job for AI processing.
6. **AI Enhancement:** `WorkerService` picks up the job, calls `AIService` to generate tags/summaries, and updates the Markdown file via `StorageService`.

**State Management:**

- **Server State:** Managed by TanStack Query in the frontend, synchronizing with the API.
- **Local State:** React `useState` for UI-specific state (editor content, modal visibility).
- **Draft Persistence:** `localStorage` via `useDraftPersistence` for unsaved changes.

## Key Abstractions

**Service Pattern:**

- Purpose: Decouples business logic from the transport layer (Hono).
- Examples: `apps/api/src/services/storage.service.ts`, `apps/api/src/services/indexer.service.ts`.
- Pattern: Singleton-like services instantiated at startup and injected into the Hono context.

**Markdown with Frontmatter:**

- Purpose: Unified format for content and metadata (tags, IDs, timestamps).
- Examples: Files in `data/notes/`.
- Pattern: `gray-matter` for parsing/stringifying metadata in Markdown files.

## Entry Points

**Backend API:**

- Location: `apps/api/src/index.ts`
- Triggers: Node.js startup.
- Responsibilities: Service initialization, directory setup, initial index sync, starting the worker service, and serving the Hono app.

**Web Client:**

- Location: `apps/web/src/main.tsx`
- Triggers: Browser page load.
- Responsibilities: React root rendering, setting up QueryClient and Router.

## Error Handling Strategy

**Strategy:** Fail-safe local storage with background recovery.

**Patterns:**

- **Atomic Writes:** Using `write-file-atomic` to prevent data loss during file operations.
- **Job Recovery:** `QueueService.resetProcessingJobs()` on startup to recover from crashes.
- **Validation:** Zod schemas in `packages/env` and API routes to catch configuration and input errors early.

## Cross-Cutting Concerns

**Logging:** Standard console logging on the backend; handled by `WorkerService` for background tasks.
**Validation:** Zod schemas used for environment variables and API request bodies.
**Authentication:** Not currently implemented (local-only focus).

---

_Architecture analysis: 2026-02-04_
