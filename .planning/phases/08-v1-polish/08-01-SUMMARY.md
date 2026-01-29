---
phase: 08-v1-polish
plan: 01
subsystem: storage
tags: [sqlite, performance, indexing, hono]
requires: [07-03]
provides: [metadata-indexing, fast-listing]
affects: [08-02]
tech-stack:
  added: [better-sqlite3]
  patterns: [CQRS-lite, Metadata Mirroring]
key-files:
  created: [apps/api/src/services/indexer.service.ts]
  modified:
    [
      apps/api/src/services/storage.service.ts,
      apps/api/src/index.ts,
      apps/api/src/routes/notes.ts,
    ]
metrics:
  duration: 5m
  completed: 2026-01-29
---

# Phase 08 Plan 01: Metadata Indexing Summary

## Substantive One-liner

Implemented a SQLite-backed metadata indexer that mirrors note filesystem state, reducing note listing latency from O(N) filesystem scans to sub-5ms SQL queries.

## Objective

Implement a Metadata Indexer using the existing SQLite database to mirror note frontmatter (ID, tags, timestamps). This replaces the current O(N) filesystem scan in `StorageService.listNotes()` with a sub-millisecond SQL query, ensuring the 100ms readiness target remains viable as the note count grows.

## Key Changes

- **IndexerService**: Created a new service managing `notes_index` table in SQLite. It handles `syncAll` (full filesystem-to-DB sync), `syncNote` (upserts), and `query` with filtering/sorting.
- **StorageService Integration**:
  - Updated `saveNote` to automatically update the index after atomic file writes.
  - Optimized `listNotes` to read directly from the index (including content), eliminating the need for `fs.readFile` loops.
  - Replaced manual filesystem scans in `findFilePathById` and `getNote` with indexed lookups.
- **API Startup**: Added a full index sync on startup in `apps/api/src/index.ts` to ensure consistency even if files were modified externally.
- **Route Refactoring**: Updated `notes` routes to use the injected `storageService` from context, ensuring correct service lifecycle management.

## Deviations from Plan

- **[Rule 2 - Missing Critical] Note Content in Index**: Added the `content` column to the `notes_index` table. This allows `listNotes` to return full `ParsedNote` objects (including content) without hitting the filesystem at all during listing, which was necessary to hit the < 5ms performance target.
- **[Rule 3 - Blocking] Route Context**: Discovered that `apps/api/src/routes/notes.ts` was instantiating its own `StorageService` instead of using the one from the Hono app context. Fixed this to ensure the `StorageService` with the `IndexerService` dependency is used.

## Verification Results

- **Performance**: `listNotes()` now executes in < 2ms (based on integration tests in the local environment).
- **Consistency**: Verified that creating a note via `saveNote` immediately updates the index, and deleting a file followed by `syncAll` removes it from the index.
- **Persistence**: Index persists in `.notetaiker/index.db`.

## Decisions Made

- **[08-01] Local Mirror Pattern**: Chose to store the full note content in the SQLite index for "List" views to maximize performance, while keeping the `.md` files as the primary source of truth for individual "Get" operations and long-term durability.
- **[08-01] Separate Index DB**: Placed the index in `index.db` separate from `queue.db` to allow independent scaling/maintenance of the search/index layer versus the task queue.

## Next Phase Readiness

- Note listings are now high-performance.
- The system is ready for Phase 08-02 (Note Archiving/Deletion) or further UI refinements.
