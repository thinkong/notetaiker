# Technology Stack

**Analysis Date:** 2026-01-30

## Languages

**Primary:**

- TypeScript 5.x - Used throughout the monorepo (`apps/`, `packages/`)

**Secondary:**

- CSS - Used with Tailwind CSS v4 in `apps/web`
- SQL - Used via `better-sqlite3` for indexing in `apps/api`

## Runtime

**Environment:**

- Node.js (v20+) - Execution environment for API and build tools

**Package Manager:**

- pnpm (v9.0.0)
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**

- Hono (^4.6.14) - Web framework for `apps/api`
- React (^19.2.0) - UI library for `apps/web`
- Vite (^7.2.4) - Build tool and dev server for `apps/web`

**Testing:**

- Vitest (^4.0.18) - Unit and integration testing in `apps/api`

**Build/Dev:**

- Turbo (^2.3.3) - Monorepo build system
- tsx - For running the API in development mode

## Key Dependencies

**Critical:**

- ai (^6.0.59) - Vercel AI SDK for LLM interactions in `apps/api`
- better-sqlite3 (^12.6.2) - SQLite driver for indexing and job queues
- @tanstack/react-query (^5.90.20) - Data fetching and state management in `apps/web`
- @uiw/react-codemirror (^4.25.4) - Markdown editor component in `apps/web`

**Infrastructure:**

- zod (^3.24.1) - Runtime validation and type inference
- tailwindcss (^4.1.18) - Utility-first CSS framework
- p-queue (^9.1.0) - Background task processing in `apps/api`

## Configuration

**Environment:**

- Managed via `@notetaiker/env` package using Zod for validation
- `.env` files are used for basic configuration like `NOTES_DIR`

**Secrets:**

- Stored in `.notetaiker/secrets.json` (managed by `apps/api/src/services/secrets.service.ts`)
- Includes API keys for OpenAI, Anthropic, and Gemini

**Build:**

- `turbo.json` - Orchestrates build, lint, and dev tasks
- `package.json` - Workspace configuration and shared scripts

## Platform Requirements

**Development:**

- Node.js v20 or higher
- pnpm v9 or higher

**Production:**

- Deployment target is local machine (local-first application)

---

_Stack analysis: 2026-01-30_
