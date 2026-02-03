# Coding Conventions

**Analysis Date:** 2026-02-03

## Naming Patterns

**Files:**
- API Services: `kebab-case.service.ts` (e.g., `apps/api/src/services/ai.service.ts`)
- API Routes: `kebab-case.ts` (e.g., `apps/api/src/routes/notes.ts`)
- Web Components: `PascalCase.tsx` (e.g., `apps/web/src/components/common/Tag.tsx`)
- Web Hooks: `useCamelCase.ts` (e.g., `apps/web/src/hooks/useSSE.ts`)
- Utilities: `kebab-case.ts` (e.g., `apps/api/src/lib/markdown.ts`)
- Tests: `[name].test.ts` or `[name].spec.ts` co-located with implementation.

**Functions:**
- camelCase for standard functions and methods: `generateTags`, `saveNote`, `parseMarkdown`.
- PascalCase for React components: `Tag`, `Editor`.

**Variables:**
- camelCase for local variables and class properties: `storagePath`, `mergedTags`, `workspaceRoot`.
- UPPER_SNAKE_CASE for constants: `DEFAULT_MODELS`.

**Types:**
- PascalCase for interfaces and type aliases: `NoteMetadata`, `SSEOptions`, `ParsedNote`.
- Schemas: PascalCase + "Schema" suffix (e.g., `NoteFrontmatterSchema` in `apps/api/src/lib/markdown.ts`).

## Code Style

**Formatting:**
- Prettier is used for consistent formatting across the monorepo.
- Standard settings: 2-space indentation, trailing commas.
- Run via `pnpm format`.

**Linting:**
- ESLint with flat config (`eslint.config.js`).
- Root configuration in `packages/eslint-config`.
- App-specific rules in `apps/api/eslint.config.js` and `apps/web/eslint.config.js`.
- Rules sometimes require using `console.warn` instead of `console.log` for debug information (e.g., `apps/web/src/hooks/useSSE.ts`).

## Import Organization

**Order:**
1. Node.js built-ins (`import path from "node:path"`)
2. React/Framework imports (in web)
3. External library imports (`zod`, `hono`, `ai`)
4. Internal workspace packages (`@notetaiker/env`, `@notetaiker/api`)
5. Internal relative imports (`../services/...`)

**Path Aliases:**
- `@notetaiker/env`: Shared environment configuration.
- `@notetaiker/api`: API types and client shared with the web app.

## Error Handling

**Patterns:**
- **Zod Validation**: Used for runtime validation of API requests and frontmatter (e.g., `NoteFrontmatterSchema.parse(data)`).
- **Hono Context**: Return JSON error responses in routes: `return c.json({ error: "Note not found" }, 404)`.
- **Try/Catch**: Used around file system operations and external calls. Services often return `null` or empty arrays to indicate failure safely.
- **Validation**: `zValidator` middleware for Hono routes.

## Logging

**Framework:** `console`

**Patterns:**
- `console.error`: Used for critical failures in catch blocks.
- `console.warn`: Used for debug information or to bypass linting rules against `console.log`.

## Comments

**When to Comment:**
- To explain complex logic or directory traversal (e.g., calculating `workspaceRoot` in routes).
- To satisfy linting (e.g., `void notesDir`).

**JSDoc/TSDoc:**
- Used sparingly for complex parameters; not strictly enforced.

## Function Design

**Size:** Most functions are focused and modular.
**Parameters:** Destructuring or object parameters (e.g., `QueryOptions`) are preferred for complex arguments.
**Return Values:** Explicit return types are preferred in services and critical logic.

## Module Design

**Exports:** Named exports are preferred for services, components, and hooks. Default exports are occasionally used for React components.
**Barrel Files:** Used in specific locations like `apps/web/src/types/index.ts`.

---

*Convention analysis: 2026-02-03*
