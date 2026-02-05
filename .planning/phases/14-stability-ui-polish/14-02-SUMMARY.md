---
phase: 14-stability-ui-polish
plan: 02
subsystem: infra
tags: [typescript, eslint, monorepo, build-system]

# Dependency graph
requires:
  - phase: 14-stability-ui-polish
    provides: Tag UI Unification (14-01)
provides:
  - Hardened build system with verbatimModuleSyntax
  - Enforced type-only imports across monorepo
  - Unified ESLint configuration for TypeScript support
affects: [all future phases]

# Tech tracking
tech-stack:
  added: [typescript-eslint]
  patterns: [verbatimModuleSyntax, separate-type-imports]

key-files:
  created: []
  modified:
    [
      packages/tsconfig/base.json,
      apps/web/tsconfig.app.json,
      packages/eslint-config/base.js,
      apps/api/src/routes/notes.ts,
      apps/api/src/services/worker.service.ts,
    ]

key-decisions:
  - "Enable verbatimModuleSyntax in base TSConfig to ensure import/export correctness."
  - "Enforce 'import type' for type-only imports to prevent accidental side-effect imports and runtime overhead."
  - "Centralize TypeScript ESLint rules in @notetaiker/eslint-config/base.js for monorepo-wide consistency."

patterns-established:
  - "Verbatim Module Syntax: ensures that imports and exports are handled exactly as written by TypeScript."
  - "Consistent Type Imports: forces the use of 'import type' for types, improving tree-shaking and build predictability."

# Metrics
duration: 8m
completed: 2026-01-31
---

# Phase 14 Plan 02: Build System Hardening Summary

**Hardened the monorepo build system by enabling verbatimModuleSyntax and enforcing type-only imports via centralized ESLint configuration.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-31T07:13:43Z
- **Completed:** 2026-01-31T07:21:39Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- **Enabled `verbatimModuleSyntax`**: Migrated this strictness to the base TypeScript configuration, ensuring all packages benefit from better module compliance and tree-shakability.
- **Enforced Type Imports**: Added `@typescript-eslint/consistent-type-imports` to the shared ESLint configuration, ensuring type-only imports are clearly marked.
- **Monorepo-wide Cleanup**: Automated the conversion of dozens of imports across `apps/api` and `apps/web` using `pnpm lint:fix`.
- **Refined Shared Linting**: Integrated `typescript-eslint` plugin and parser directly into the base configuration, reducing boilerplate in application-level ESLint configs.

## Task Commits

Each task was committed atomically:

1. **Task 1: Enable verbatimModuleSyntax** - `4b48f49` (chore)
2. **Task 2: Enforce Type Imports in Linter** - `d589af0` (feat)

**Plan metadata:** `pending` (docs: complete plan)

## Files Created/Modified

- `packages/tsconfig/base.json` - Enabled `verbatimModuleSyntax` centrally.
- `apps/web/tsconfig.app.json` - Removed redundant setting.
- `packages/eslint-config/base.js` - Integrated `typescript-eslint` and enforced type-only imports.
- `apps/api/src/services/worker.service.ts` - Converted imports to type imports.
- `apps/api/src/routes/notes.ts` - Converted imports to type imports.
- `apps/web/eslint.config.js` - Simplified by moving rules to base.
- `packages/eslint-config/package.json` - Added `typescript-eslint` dependency.

## Decisions Made

- **Centralized TS-Linting**: Decided to put basic TypeScript rules in the shared package rather than repeating them in every app, following the "DRY" principle for infrastructure.
- **separate-type-imports fixStyle**: Chose `separate-type-imports` over `inline-type-imports` for better readability and alignment with `verbatimModuleSyntax` best practices.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **ESLint Parser Configuration**: Initially, adding TS rules without explicitly setting the parser in the base config caused issues in `apps/api` which doesn't use the `tseslint.config` wrapper. Fixed by adding the parser and plugin to the shared `base.js`.

## Next Phase Readiness

- Build system is more robust and ready for further UI stability work.
- The monorepo now has a standardized way of handling TypeScript imports.

---

_Phase: 14-stability-ui-polish_
_Completed: 2026-01-31_
