# Phase 19: Embeddings Infrastructure

**Goal**: System automatically generates and stores vector embeddings for all notes locally.

## Execution Strategy

This phase is divided into 3 waves of atomic plans to ensure stability and isolation of concerns.

### Wave 1: Foundation

**Plan 19-01: Core Infrastructure**

- **Goal**: Setup `sqlite-vec` and basic `EmbeddingsService`.
- **Key Files**: `package.json`, `indexer.service.ts`, `embeddings.service.ts`.
- **Verification**: Database tables created, extension loads, vectors can be stored/retrieved.

### Wave 2: Async Pipeline

**Plan 19-02: Background Processing**

- **Goal**: Integrate embedding generation into the non-blocking job queue.
- **Key Files**: `ai.service.ts`, `queue.service.ts`, `worker.service.ts`, `storage.service.ts`.
- **Verification**: Saving a note triggers a background job that populates the embeddings table.

### Wave 3: Management

**Plan 19-03: User Controls**

- **Goal**: Add "Rebuild Index" functionality and UI.
- **Key Files**: `embeddings.service.ts`, `SettingsPage.tsx`.
- **Verification**: User can force a re-index of all notes from the Settings page.

## Success Criteria

1. **Local Storage**: Vectors stored in SQLite using `sqlite-vec`.
2. **Performance**: Note save operation remains <100ms (blocking part).
3. **Automation**: New notes are indexed automatically.
4. **Resilience**: System handles content changes efficiently (hashing).

## Next Phase

- Phase 20: Related Notes Feature (UI)
