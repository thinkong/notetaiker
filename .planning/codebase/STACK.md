# Technology Stack

**Analysis Date:** 2026-02-03

## Languages

**Primary:**
- TypeScript 5.x - Used throughout the monorepo for both frontend (`apps/web`) and backend (`apps/api`).

**Secondary:**
- CSS - Used with Tailwind CSS v4 in `apps/web`.
- SQL - Used via `better-sqlite3` for indexing in `apps/api`.

## Runtime

**Environment:**
- Node.js (v20+) - Execution environment for API and build tools.
- Web Browser - Execution environment for the React-based frontend.

**Package Manager:**
- pnpm (v9.0.0)
- Lockfile: `pnpm-lock.yaml` present.

## Frameworks

**Core:**
- Hono (^4.6.14) - Web framework for `apps/api` (running on Node.js).
- React (^19.2.0) - UI library for `apps/web`.
- Vite (^7.2.4) - Build tool and dev server for `apps/web`.

**Testing:**
- Vitest (^4.0.18) - Unit and integration testing, primarily in `apps/api`.

**Build/Dev:**
- Turbo (^2.3.3) - Monorepo build system and task runner.
- tsx - For running the API in development mode.
- Tailwind CSS (^4.1.18) - Utility-first CSS framework.

## Key Dependencies

**Critical:**
- ai (^6.0.59) - Vercel AI SDK for LLM interactions in `apps/api`.
- better-sqlite3 (^12.6.2) - SQLite driver for indexing and background processing.
- @tanstack/react-query (^5.90.20) - Data fetching and state management in `apps/web`.
- @uiw/react-codemirror (^4.25.4) - Markdown editor component in `apps/web`.

**Infrastructure:**
- zod (^3.24.1) - Runtime validation and type inference.
- p-queue (^9.1.0) - Background task processing in `apps/api`.
- write-file-atomic (^6.0.0) - Ensures atomic file writes for note persistence.

## Configuration

**Environment:**
- Managed via `@notetaiker/env` package using Zod for validation.
- `NODE_ENV` and `NOTES_DIR` are primary environment variables.

**Secrets:**
- Stored in `.notetaiker/secrets.json` (managed by `apps/api/src/services/secrets.service.ts`).
- Includes configuration for OpenAI, Anthropic, and Gemini.

**Build:**
- `turbo.json` - Orchestrates build, lint, and dev tasks.
- `packages/tsconfig` - Shared TypeScript configuration.

## Platform Requirements

**Development:**
- Node.js v20+ and pnpm v9+.
- Local filesystem access for note storage.

**Production:**
- Local-first execution (Node.js for API, static assets for Web).

---

*Stack analysis: 2026-02-03*
