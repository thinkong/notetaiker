# Technology Stack

**Analysis Date:** 2026-02-04

## Languages

**Primary:**

- TypeScript 5.x - Used throughout the monorepo for type-safe development in both `apps/` and `packages/`.

## Runtime

**Environment:**

- Node.js (Version >= 20.x recommended based on package features)
- Docker - Used for local development (Ollama) and production containerization.

**Package Manager:**

- pnpm 9.x
- Lockfile: `pnpm-lock.yaml` present.

## Frameworks

**Core:**

- Hono ^4.6.14 - Web framework used for the backend API in `apps/api`.
- React ^19.2.0 - UI library used for the frontend in `apps/web`.
- Vite ^7.2.4 - Build tool and development server for the frontend.
- Tailwind CSS ^4.1.18 - Utility-first CSS framework for styling.

**Testing:**

- Vitest ^4.0.18 - Test runner used for unit and integration tests in `apps/api`.

**Build/Dev:**

- Turborepo ^2.3.3 - Monorepo build system for task orchestration.
- tsx - Used for running TypeScript directly in development (`apps/api`).

## Key Dependencies

**Critical:**

- Vercel AI SDK (`ai` ^6.0.69) - Unified interface for AI model interactions.
- TanStack Query ^5.90.20 - Data fetching and state management in the frontend.
- CodeMirror 6 - Core editor component for markdown note editing.

**Infrastructure:**

- better-sqlite3 ^12.6.2 - High-performance SQLite driver for indexing and job queues.
- p-queue ^9.1.0 - Queue management for background tasks like indexing and AI tag generation.
- gray-matter ^4.0.3 - Frontmatter parsing for markdown files.

## Configuration

**Environment:**

- Managed via `@notetaiker/env` package using Zod for validation.
- Key variables: `NOTES_DIR`, `NODE_ENV`, `PORT`, `DOCKER_ENV`.

**Build:**

- `turbo.json` - Turbo configuration.
- `tsconfig.json` - Base TypeScript configuration in `packages/tsconfig`.
- `apps/web/vite.config.ts` - Vite configuration.

## Platform Requirements

**Development:**

- Node.js, pnpm, Docker (for Ollama).

**Production:**

- Docker container based on `Dockerfile` and `docker-compose.yml`.

---

_Stack analysis: 2026-02-04_
