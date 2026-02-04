# Codebase Concerns

**Analysis Date:** 2026-02-04

## Tech Debt

**Indexer Tag Filtering:**
- Issue: Tag filtering is implemented using naive `LIKE` queries against a JSON string column in SQLite.
- Files: `apps/api/src/services/indexer.service.ts`
- Impact: Performance will degrade linearly with the number of notes and tags. Filtering for "tag1" might incorrectly match "tag10".
- Fix approach: Use a separate `note_tags` junction table or SQLite's JSON1 extension for proper querying.

**Monolithic Main Component:**
- Issue: `App.tsx` in the web app is over 400 lines and manages too much state and logic (drafts, saving, search, sidebar, hotkeys, navigation guards).
- Files: `apps/web/src/App.tsx`
- Impact: Difficult to test in isolation, high risk of regression when changing unrelated features, and poor readability.
- Fix approach: Extract logic into smaller, focused hooks and move UI sub-sections into dedicated container components.

**Storage and Indexing Coupling:**
- Issue: `StorageService` is directly responsible for triggering index syncs and file path generation.
- Files: `apps/api/src/services/storage.service.ts`
- Impact: Harder to change storage backends or indexing strategies independently.
- Fix approach: Use an event-driven architecture (e.g., `EventEmitter`) where `StorageService` emits a `noteSaved` event that `IndexerService` listens to.

## Known Bugs

**Potential Filename Collisions:**
- Symptoms: Extremely rare, but could cause file overwrites or save failures.
- Files: `apps/api/src/services/storage.service.ts`
- Trigger: Multiple saves occurring within the same millisecond with the same 4-character random suffix.
- Workaround: The code has a counter-based retry loop, but the entropy is low.

## Security Considerations

**Secrets Stored in Plaintext:**
- Risk: AI provider API keys are stored in plaintext on the local filesystem.
- Files: `apps/api/src/services/secrets.service.ts`, `.notetaiker/secrets.json`
- Current mitigation: The `.notetaiker` directory is automatically added to `.gitignore`, and the file is created with `0o600` permissions.
- Recommendations: Encrypt secrets at rest using a machine-specific key or OS-level keychain integration (e.g., `keytar`).

## Performance Bottlenecks

**Startup Index Sync:**
- Problem: The API performs a full filesystem scan and reads every markdown file to sync the SQLite index on every startup.
- Files: `apps/api/src/services/indexer.service.ts`
- Cause: Lack of a persistent file-watch or incremental sync state beyond just re-reading everything.
- Improvement path: Implement a file watcher (like `chokidar`) for runtime updates and use file modification times (mtime) to perform incremental syncs on startup.

**SQLite Search:**
- Problem: Note content search is likely using `LIKE` queries (though full-text search is not yet fully implemented).
- Files: `apps/api/src/services/indexer.service.ts`
- Cause: Basic SQLite table structure.
- Improvement path: Implement SQLite FTS5 (Full-Text Search) for efficient searching across thousands of notes.

## Fragile Areas

**AI Tag Merging Logic:**
- Files: `apps/api/src/services/worker.service.ts`, `apps/api/src/services/storage.service.ts`
- Why fragile: Complex rules about when to merge `tags` vs `ai_tags` vs `ignored_tags`. If the UI and Backend get out of sync on these definitions, AI might re-add deleted tags.
- Safe modification: Ensure all tag manipulations go through a shared utility library with exhaustive tests.
- Test coverage: Gaps in testing the interaction between manual tag removal and AI re-processing.

## Missing Critical Features

**Full-Text Search (FTS):**
- Problem: No specialized full-text search capability.
- Blocks: Efficient and relevant searching as the codebase grows.

**Note Deletion (UI):**
- Problem: While the backend supports deletion from the index, the primary storage and UI paths for deletion are not prominently featured or robustly tested.
- Blocks: Basic CRUD lifecycle.

## Test Coverage Gaps

**Frontend Components:**
- What's not tested: Complex UI interactions in `App.tsx`, `Editor.tsx`, and `GraphView.tsx`.
- Files: `apps/web/src/**/*`
- Risk: UI regressions in critical paths like note capture and graph rendering.
- Priority: Medium

**AI Service Error Handling:**
- What's not tested: Graceful degradation when AI providers are offline or rate-limited (though `p-retry` is used).
- Files: `apps/api/src/services/ai.service.ts`
- Risk: Background worker crashes or stalled queues.
- Priority: Low

---

*Concerns audit: 2026-02-04*
