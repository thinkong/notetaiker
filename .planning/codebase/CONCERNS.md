# Codebase Concerns

**Analysis Date:** 2026-01-30

## Tech Debt

**Naive Tag Filtering:**

- Issue: Tag searching uses `LIKE %tag%` on a JSON string in SQLite. This matches partial tags (e.g., searching for "node" matches "nodejs") and is not performant for large datasets.
- Files: `apps/api/src/services/indexer.service.ts`
- Impact: Search accuracy and performance degrade as the number of notes and tags grows.
- Fix approach: Use SQLite's JSON1 extension or a dedicated many-to-many `note_tags` table for proper indexing.

**Manual Path Resolution:**

- Issue: Workspace root and notes directory are resolved using `__dirname` and relative paths (e.g., `../../..`).
- Files: `apps/api/src/index.ts`
- Impact: Brittle and depends on specific build/deployment directory structure.
- Fix approach: Use a more robust configuration management or standard project root detection.

**Worker Concurrency Race Conditions:**

- Issue: `WorkerService.processNext` checks `this.queue.pending >= 2` but doesn't atomically reserve slots, which could lead to exceeding concurrency limits if multiple events trigger nearly simultaneously.
- Files: `apps/api/src/services/worker.service.ts`
- Impact: Potential for unexpected resource usage.
- Fix approach: Use `p-queue`'s internal scheduling more effectively rather than manual checks.

## Known Bugs

**Silent Sync Failures:**

- Symptoms: Notes without an `id` in their frontmatter are silently skipped during indexing.
- Files: `apps/api/src/services/indexer.service.ts`
- Trigger: Creating a markdown file manually in the notes directory without an `id` field.
- Workaround: Ensure all notes have UUIDs in frontmatter.

## Security Considerations

**Unencrypted Secrets on Disk:**

- Risk: AI API keys are stored in plain text in `.notetaiker/secrets.json`.
- Files: `apps/api/src/services/secrets.service.ts`
- Current mitigation: The directory is added to `.gitignore` and file mode is set to `0o600`.
- Recommendations: Encrypt secrets using a user-provided master key or use the system's native keychain.

**Directory Traversal Potential:**

- Risk: `NOTES_DIR` env var can be set to any absolute path.
- Files: `apps/api/src/index.ts`, `apps/api/src/services/storage.service.ts`
- Current mitigation: None explicitly visible beyond basic path joining.
- Recommendations: Implement strict path validation to ensure all operations stay within the designated notes directory.

## Performance Bottlenecks

**Startup Sync Delay:**

- Problem: `indexerService.syncAll()` reads every file on every startup.
- Files: `apps/api/src/services/indexer.service.ts`, `apps/api/src/index.ts`
- Cause: Full scan of the notes directory.
- Improvement path: Use file system watchers (like `chokidar`) to maintain the index incrementally and check file stats (mtime) during startup instead of full reads.

**Graph Visualization Complexity:**

- Problem: Large numbers of notes may cause the force-directed graph to lag.
- Files: `apps/web/src/components/graph/ForceGraph.tsx`
- Cause: D3-force calculations and React re-rendering for high node/link counts.
- Improvement path: Implement virtualization, node clustering, or canvas-based rendering for the graph.

## Fragile Areas

**Index/Filesystem Desynchronization:**

- Files: `apps/api/src/services/indexer.service.ts`, `apps/api/src/services/storage.service.ts`
- Why fragile: SQLite is a cache/index, but the filesystem is the source of truth. If a file is moved or renamed outside the app, the index breaks. `StorageService` depends on the index for ID resolution.
- Safe modification: Always use the app's API for file operations.
- Test coverage: `storage.service.test.ts` covers basic sync but doesn't simulate external corruption/renames.

## Test Coverage Gaps

**Edge Case Error Handling:**

- What's not tested: Disk full, permission denied, or malformed frontmatter during mass sync.
- Files: `apps/api/src/services/storage.service.ts`, `apps/api/src/services/indexer.service.ts`
- Risk: Data loss or service crash under unusual but possible environment conditions.
- Priority: Medium

---

_Concerns audit: 2026-01-30_
