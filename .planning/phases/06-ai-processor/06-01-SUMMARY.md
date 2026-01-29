---
phase: 06-ai-processor
plan: 01
subsystem: AI Processor
tags: [sqlite, queue, background-jobs, persistence]
requires: [05-04]
provides: [persistent-job-queue]
affects: [06-02]
tech-stack:
  added: [better-sqlite3, p-queue, p-retry]
  patterns: [SQLite-backed state machine]
key-files:
  created:
    [
      apps/api/src/services/queue.service.ts,
      apps/api/src/services/queue.service.test.ts,
    ]
  modified: [apps/api/src/index.ts, apps/api/package.json]
decisions:
  - SQLite for Queue: Used better-sqlite3 for local, zero-config persistence of AI jobs.
  - Startup Recovery: Jobs stuck in 'processing' are automatically reset to 'queued' on API boot.
metrics:
  duration: 10m
  completed: 2026-01-28
---

# Phase 06 Plan 01: Persistent Queue Storage Summary

## Substantive Summary

Established a robust, persistent storage layer for background AI processing jobs using SQLite. This ensures that long-running tasks like note summarization or tagging survive application crashes or restarts. The `QueueService` manages the lifecycle of these jobs, providing a foundation for the upcoming AI worker implementation.

## Deviations from Plan

None - plan executed exactly as written.

## Technical Details

- **Storage:** Jobs are stored in `.notetaiker/queue.db` within the workspace root.
- **Table Schema:** Includes `id` (UUID), `noteId`, `status` (queued/processing/completed/failed), `attempts`, `lastError`, and timestamps.
- **Concurrency & Resilience:** Integrated `p-queue` for future worker concurrency control and `p-retry` for handling transient AI provider failures.
- **Recovery Logic:** On application startup, the `QueueService` identifies any jobs left in the `processing` state and resets them to `queued`, preventing them from being lost.

## Test Plan Results

- **Unit Tests:** `apps/api/src/services/queue.service.test.ts` covers enqueueing, status transitions, and recovery logic (Passed).
- **Integration Check:** Manual verification script confirmed that `resetProcessingJobs()` correctly transitions state in a live SQLite file.
