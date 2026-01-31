# Coding Conventions

**Analysis Date:** 2026-01-30

## Naming Patterns

**Files:**

- Services: `[name].service.ts` (e.g., `apps/api/src/services/indexer.service.ts`)
- Routes: `[name].ts` (e.g., `apps/api/src/routes/notes.ts`)
- Components: `[Name].tsx` (PascalCase, e.g., `apps/web/src/components/editor/Editor.tsx`)
- Hooks: `use[Name].ts` (e.g., `apps/web/src/hooks/useSSE.ts`)
- Tests: `[name].test.ts` or `[name].spec.ts` co-located with implementation

**Functions:**

- camelCase (e.g., `parseMarkdown`, `syncNote`, `handleChange`)

**Variables:**

- camelCase (e.g., `workspaceRoot`, `notesDir`, `stmt`)

**Types:**

- Interfaces and Types: PascalCase (e.g., `IndexEntry`, `ParsedNote`, `EditorProps`)
- Schemas: PascalCase + "Schema" suffix (e.g., `NoteFrontmatterSchema` in `apps/api/src/lib/markdown.ts`)

## Code Style

**Formatting:**

- Prettier is used project-wide. Configured in `package.json` and `.prettierrc` (implied).
- Standard settings: 2-space indentation, trailing commas.

**Linting:**

- ESLint is used across the monorepo.
- Root configuration in `packages/eslint-config`.
- App-specific rules in `apps/api/eslint.config.js` and `apps/web/eslint.config.js`.

## Import Organization

**Order:**

1. Node.js built-ins (`import path from "node:path"`)
2. External libraries (`import { Hono } from "hono"`)
3. Internal workspace packages (`import { env } from "@notetaiker/env"`)
4. Relative internal imports (`import { StorageService } from "../services/storage.service"`)

**Path Aliases:**

- Monorepo packages use workspace aliases (e.g., `@notetaiker/api`, `@notetaiker/env`).

## Error Handling

**Patterns:**

- **Zod Validation**: Used for runtime validation of API requests and frontmatter (e.g., `NoteFrontmatterSchema.parse(data)` in `apps/api/src/lib/markdown.ts`).
- **Try/Catch**: Used around file system operations and external calls.
- **Hono Error Response**: Returning JSON error objects with appropriate status codes (e.g., `return c.json({ error: "Note not found" }, 404)`).

## Logging

**Framework:** `console`

**Patterns:**

- Errors are logged via `console.error` in catch blocks (e.g., `apps/api/src/services/indexer.service.ts`).
- Information logs are minimal.

## Comments

**When to Comment:**

- Minimal commenting; used for explaining specific logic or monorepo structure navigation (e.g., `// apps/api/src/routes/notes.ts -> go up 4 levels`).

**JSDoc/TSDoc:**

- Not strictly enforced or widely used in the current codebase.

## Function Design

**Size:** Most functions are focused and small, though service methods like `syncAll` handle multiple steps.

**Parameters:** Prefer object parameters for options (e.g., `QueryOptions` in `indexer.service.ts`).

**Return Values:** Explicit return types are common in services.

## Module Design

**Exports:**

- Named exports are preferred for services and utilities.
- Default exports are used for React components (e.g., `export default Editor`).

**Barrel Files:**

- Used in some locations like `apps/web/src/types/index.ts`.

---

_Convention analysis: 2026-01-30_
