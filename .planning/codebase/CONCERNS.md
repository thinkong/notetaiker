# Codebase Concerns

**Analysis Date:** 2026-02-03

## Tech Debt

**Naive Tag Filtering:**
- Issue: `IndexerService` uses `metadata LIKE ?` with `%tag%` to filter notes by tags. Since `metadata` is a JSON string, this can lead to false positives (e.g., searching for "AI" might match a note with "Maintainer" in its metadata).
- Files: `apps/api/src/services/indexer.service.ts`
- Impact: Inaccurate search results for tags and poor performance as the codebase grows.
- Fix approach: Use SQLite's JSON1 extension functions (like `json_each`) or a proper join table for tags.

**Duplicated Workspace Root Logic:**
- Issue: Multiple files calculate the workspace root using hardcoded relative paths from `__dirname` (e.g., `../../../..`).
- Files: `apps/api/src/index.ts`, `apps/api/src/routes/settings.ts`, `apps/api/src/routes/notes.ts`
- Impact: Fragile path resolution; if files are moved, the logic breaks.
- Fix approach: Centralize workspace root detection in a utility or use a reliable project-root detection library.

**Large Component Complexity (God Component):**
- Issue: `App.tsx` has grown to over 400 lines, managing routing, layout, global state, and navigation guards.
- Files: `apps/web/src/App.tsx`
- Impact: Harder to maintain, test, and understand the main application flow.
- Fix approach: Refactor `App.tsx` by extracting the router configuration, layout components, and context providers into separate files.

**SSE Keep-Alive Implementation:**
- Issue: The SSE implementation uses a `while (true)` loop with a 1-second `setTimeout` to keep the connection alive.
- Files: `apps/api/src/routes/events.ts`
- Impact: Potential for resource leaks if client disconnects aren't handled perfectly across all environments.
- Fix approach: Use a standard heartbeat interval and rely on Hono's streaming lifecycle hooks properly.

## Known Bugs

**Silent Indexing Failures:**
- Symptoms: Notes without a valid UUID `id` in their frontmatter are silently skipped during the indexing process.
- Files: `apps/api/src/services/indexer.service.ts` (line 104)
- Trigger: Manually creating a markdown file without the required `id` metadata.
- Workaround: Ensure all markdown files have a valid `id` in their YAML frontmatter.

## Security Considerations

**Plaintext Secret Storage:**
- Risk: AI provider API keys are stored in plaintext in a JSON file on disk.
- Files: `apps/api/src/services/secrets.service.ts`, `apps/.notetaiker/secrets.json`
- Current mitigation: The `.notetaiker` directory is added to `.gitignore` and file permissions are restricted to `0o600`.
- Recommendations: Use the system's native keychain (e.g., `keytar`) or encrypt the secrets file with a user-provided master password.

**Directory Traversal Potential:**
- Risk: The `NOTES_DIR` environment variable can be configured to any path, and file operations do not strictly validate that they remain within this root.
- Files: `apps/api/src/services/storage.service.ts`, `apps/api/src/index.ts`
- Current mitigation: Basic `path.resolve` and `path.isAbsolute` checks.
- Recommendations: Implement a "jail" check to ensure all resolved file paths start with the intended `NOTES_DIR`.

## Performance Bottlenecks

**Full Sync on Startup:**
- Problem: The API performs a full scan and read of all markdown files in the notes directory every time it starts.
- Files: `apps/api/src/index.ts`, `apps/api/src/services/indexer.service.ts`
- Cause: `syncAll()` reads every file to verify metadata and content.
- Improvement path: Implement incremental sync by checking file modification times (mtime) against the last indexed time in the database.

**Force-Directed Graph Scaling:**
- Problem: The D3-based force graph may experience performance degradation with hundreds of notes.
- Files: `apps/web/src/components/graph/ForceGraph.tsx`
- Cause: High CPU usage for physics calculations and React rendering overhead for many SVG elements.
- Improvement path: Switch to Canvas-based rendering or implement node clustering/virtualization for large graphs.

## Fragile Areas

**Index/Filesystem Synchronization:**
- Files: `apps/api/src/services/indexer.service.ts`, `apps/api/src/services/storage.service.ts`
- Why fragile: If files are moved or renamed manually on the filesystem, the SQLite index becomes stale. The system heavily relies on the index for ID-to-filename resolution.
- Safe modification: Always perform file operations through the `StorageService`.
- Test coverage: Missing tests for manual filesystem interference and recovery.

## Test Coverage Gaps

**Real-time Event Flow:**
- What's not tested: The end-to-end integration of background worker completion -> `EventsService` broadcast -> SSE transmission -> Frontend UI update.
- Files: `apps/api/src/services/events.service.ts`, `apps/api/src/routes/events.ts`, `apps/web/src/hooks/useSSE.ts`
- Risk: Changes to the event schema or SSE logic could break real-time updates unnoticed.
- Priority: Medium

---

*Concerns audit: 2026-02-03*
