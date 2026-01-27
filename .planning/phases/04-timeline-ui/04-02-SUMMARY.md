---
phase: 04-timeline-ui
plan: 02
subsystem: Web
tags: [tanstack-query, react-query, hooks, api-client]
requires: [04-01]
provides: [timeline-data-fetching]
affects: [04-03]
tech-stack:
  added: [@tanstack/react-query, react-intersection-observer, date-fns]
  patterns: [Infinite Query Hook, RPC-typed API Client]
key-files:
  created:
    - apps/web/src/hooks/useTimeline.ts
  modified:
    - apps/web/package.json
    - apps/web/src/App.tsx
    - apps/web/src/components/editor/Editor.tsx
    - apps/api/src/routes/notes.ts
decisions:
  - id: 04-02-query-client-root
    description: Initialized QueryClient at the root of the App.
    rationale: Standard practice for TanStack Query to provide cache context to the entire application.
---

# Phase 04 Plan 02: Setup TanStack Query & Timeline Hook Summary

## Objective
Setup TanStack Query and implement the core data fetching hook for the Timeline.

## Key Changes
- **Dependency Installation**: Added `@tanstack/react-query`, `react-intersection-observer`, and `date-fns` to `@notetaiker/web`.
- **QueryClient Setup**: Initialized `QueryClient` in `App.tsx` and wrapped the application with `QueryClientProvider`.
- **useTimeline Hook**: Implemented a new custom hook `useTimeline` using `useInfiniteQuery`. It handles paginated fetching from the `/notes` API with a limit of 20 items per page.
- **RPC Fixes**: Refactored the API `notes` route to use Hono's chained route definition, which fixed TypeScript errors in the web app where the RPC client couldn't see the `.notes` property.
- **Editor Fixes**: Corrected CodeMirror imports in `Editor.tsx` where `insertNewlineContinueMarkup` was being imported from the wrong package.

## Deviations from Plan
- **Rule 3 - Blocking**: Discovered and fixed a major type issue where the RPC client (`api.notes`) was not recognized due to Hono route definition style.
- **Rule 3 - Blocking**: Fixed CodeMirror `insertNewlineContinueMarkup` import error that was blocking the web build.
- **Rule 1 - Bug**: Fixed a small unused import in API tests that was blocking the API build.

## Verification Results
- **Build/Lint**: Both `@notetaiker/api` and `@notetaiker/web` build and lint successfully after the fixes.
- **Type Safety**: Verified that `api.notes.$get` is now correctly typed and accessible in `useTimeline.ts`.

## Next Phase Readiness
The data fetching layer is ready. The next plan will focus on implementing the Timeline UI components and the infinite scroll list.
