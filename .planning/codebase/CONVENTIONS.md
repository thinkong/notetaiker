# Coding Conventions

**Analysis Date:** 2026-02-04

## Naming Patterns

**Files:**
- TypeScript files: kebab-case (e.g., `ai.service.ts`, `storage.service.ts`)
- React components: PascalCase (e.g., `Editor.tsx`, `SettingsPage.tsx`)
- Routes: kebab-case (e.g., `notes.ts`, `settings.ts`)

**Functions:**
- camelCase for standard functions (e.g., `generateTags`, `saveNote`)
- camelCase for React hooks (e.g., `useDebouncedSave`, `useTimeline`)

**Variables:**
- camelCase for variables and instances (e.g., `storageService`, `allNotes`)
- UPPER_SNAKE_CASE for constants (e.g., `DEFAULT_BASE_URLS`, `DEFAULT_MODELS`)

**Types & Interfaces:**
- PascalCase (e.g., `NoteMetadata`, `ParsedNote`, `EditorHandle`)
- Suffixes: `Service` for classes, `Props` for component inputs

## Code Style

**Formatting:**
- **Prettier**: Enforced via `pnpm format` and ESLint plugin.
- Key settings: Single quotes (implied), semi-colons (implied), 2-space indentation.

**Linting:**
- **ESLint**: Shared configuration in `packages/eslint-config/base.js`.
- Key rules:
  - `prettier/prettier`: "error"
  - `@typescript-eslint/no-unused-vars`: "warn"
  - `no-console`: "warn" (except for `warn` and `error`)
  - `@typescript-eslint/consistent-type-imports`: "error" (prefers `import type`)

## Import Organization

**Order:**
1. Standard library (e.g., `node:path`, `node:fs/promises`)
2. External dependencies (e.g., `hono`, `zod`, `ai`)
3. Workspace packages (e.g., `@notetaiker/env`, `@notetaiker/api`)
4. Internal modules (relative paths: `../services/...`, `./markdown`)

**Path Aliases:**
- `@notetaiker/env`: Shared environment config
- `@notetaiker/api`: API types and client shared with web

## Error Handling

**Patterns:**
- **Defensive IO**: Extensive use of `try-catch` around filesystem and database operations.
- **Graceful Failure**: Returning `null` or empty arrays `[]` instead of throwing for expected "not found" or "failed to parse" scenarios (e.g., `StorageService.getNote`).
- **Console Warning**: Logging warnings with context when non-critical operations fail (e.g., reading existing metadata during a save).
- **Zod Validation**: Using `zValidator` in Hono routes to catch input errors at the edge.

## Logging

**Framework:** `console` (standard)

**Patterns:**
- `console.error` for critical failures in services or routes.
- `console.warn` for non-breaking issues (e.g., "Ollama not available").
- Avoid `console.log` in production code (enforced by lint).

## Comments

**When to Comment:**
- Explaining complex logic or regex (e.g., hashtag extraction).
- Documenting directory structure and workspace root resolution logic.
- TODOs for pending features or improvements.

**JSDoc/TSDoc:**
- Minimal usage; types are primarily used for documentation.

## Function Design

**Size:** Generally focused and modular. Service methods are kept under 100 lines.

**Parameters:**
- Prefers named parameters via objects for complex signatures (e.g., `saveNote(content, metadata)`).
- Optional parameters used with defaults where appropriate.

**Return Values:**
- Explicit return types in services.
- Promises used for all async IO operations.

## Module Design

**Exports:**
- Named exports preferred for routes and services.
- Default exports used for main entry points like `App.tsx`.

**Barrel Files:**
- Limited usage; direct imports preferred for clarity.

---

*Convention analysis: 2026-02-04*
