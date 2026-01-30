---
phase: 13-manual-tag-control
plan: 01
subsystem: core-api
tags: [zod, worker-service, tagging, markdown]
requires: [12-04]
provides: [schema-separation, tag-filtering]
affects: [13-02, 13-03]
tech-stack:
  added: []
  patterns: [schema-driven-isolation]
key-files:
  created: [apps/api/src/services/worker.service.test.ts]
  modified: [apps/api/src/lib/markdown.ts, apps/api/src/services/worker.service.ts, apps/api/src/routes/notes.test.ts]
decisions:
  - id: 13-01-01
    title: Isolate AI tags from user tags
    description: AI suggestions are now stored in `ai_tags` in the frontmatter, while user-controlled hashtags and manual tags remain in `tags`.
    impact: Prevents AI from overwriting user intent.
  - id: 13-01-02
    title: Implement ignored_tags for persistent dismissal
    description: Added `ignored_tags` field to frontmatter. The AI worker will skip suggesting any tag present in this list.
    impact: Allows users to permanently reject AI suggestions.
metrics:
  duration: 6m
  completed: 2026-01-30
---

# Phase 13 Plan 01: Core Tag Model Separation Summary

## Objective
Update the core data model and background worker to support the distinction between manual and AI-generated tags.

## Deliverables
- **Frontmatter Schema**: Updated `NoteFrontmatterSchema` with `ai_tags` and `ignored_tags`.
- **Hashtag Utility**: New `extractHashtags` and `toTitleCase` utilities for consistent tag handling.
- **Worker Refactor**: `WorkerService` now strictly manages `ai_tags` and respects `tags` (manual) and `ignored_tags` (dismissed).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Broken Routing Tests**

- **Found during:** Post-implementation verification.
- **Issue:** `src/routes/notes.test.ts` was failing because the `StorageService` was not correctly injected into the Hono context, leading to "Cannot read properties of undefined (reading 'listNotes')".
- **Fix:** Manually injected the mock services into the Hono app instance during test setup.
- **Files modified:** `apps/api/src/routes/notes.test.ts`
- **Commit:** `4bbc83d`

## Verification Results

### Automated Tests
- `apps/api/src/lib/markdown.test.ts`: Passed (9/9)
- `apps/api/src/services/worker.service.test.ts`: Passed (3/3)
- `apps/api/src/routes/notes.test.ts`: Fixed and Passed (7/7)

### Success Criteria
- [x] Frontmatter schema supports `ai_tags` and `ignored_tags`.
- [x] WorkerService no longer touches the `tags` array.
- [x] AI suggestions are saved to `ai_tags`.

## Next Phase Readiness
The core backend logic for tag separation is now in place. Phase 13-02 can proceed with updating the Web Client to display these tags correctly.
