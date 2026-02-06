---
phase: 20-related-notes
plan: 01
subsystem: Backend API
tags: [sqlite-vec, embeddings, similarity-search, hono]
requires: [19-01]
provides: [related-notes-api]
affects: [20-02]
tech-stack:
  added: []
  patterns: [KNN Search]
key-files:
  created: []
  modified: [apps/api/src/services/embeddings.service.ts, apps/api/src/routes/notes.ts]
decisions:
  - use-sqlite-vec-knn: Used sqlite-vec MATCH syntax for efficient similarity search.
  - exclude-self-in-related: Added filter to ensure current note isn't returned as its own related note.
metrics:
  duration: 15m
  completed: 2026-02-06
---

# Phase 20 Plan 01: Backend API for similarity search Summary

Implemented the backend infrastructure and API endpoint for semantic similarity search between notes.

## Substantive Changes
- **EmbeddingsService**: Added `getVector(noteId)` to retrieve existing embeddings and updated `findSimilar` to support an `excludeNoteId` parameter.
- **Notes Route**: Created `GET /api/notes/:id/related` endpoint which retrieves the source note's vector, finds similar vectors, and enriches them with note metadata (title, tags, etc.).

## Deviations from Plan
None - plan executed exactly as written.

## Task Commits
- `0fce119`: feat(20-01): enhance EmbeddingsService with vector retrieval and filtered search
- `6cd592e`: feat(20-01): implement GET /api/notes/:id/related endpoint

## Self-Check: PASSED
- Verified `EmbeddingsService.getVector` implementation correctly handles sqlite-vec blob format.
- Verified `findSimilar` correctly filters out the source note.
- Verified API endpoint correctly merges metadata and similarity score.
