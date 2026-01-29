---
phase: 06-ai-processor
plan: 02
subsystem: AI Processor
tags: [worker, p-queue, p-retry, background-jobs]
requires: [06-01]
provides: [background-worker-orchestration]
affects: [06-03]
tech-stack:
  added: []
  patterns: [Event-driven worker, Controlled concurrency]
key-files:
  created: [apps/api/src/services/worker.service.ts]
  modified:
    [
      apps/api/src/services/queue.service.ts,
      apps/api/src/index.ts,
      apps/api/src/routes/notes.ts,
      apps/api/src/routes/notes.test.ts,
    ]
decisions:
  - Concurrency Limit: Set to 2 to prevent overloading local resources or hitting LLM rate limits.
  - Event-Driven Trigger: Worker picks up jobs immediately via EventEmitter notifications, falling back to polling if needed.
  - Retry Strategy: 3 retries with exponential backoff for transient failures.
metrics:
  duration: 15m
  completed: 2026-01-28
---

# Phase 06 Plan 02: Background Worker Orchestration Summary

## Substantive Summary

Implemented the background worker orchestrator that manages the execution of AI processing jobs. The system now automatically enqueued a job whenever a note is created or updated. The `WorkerService` picks up these jobs and processes them with a concurrency limit of 2, ensuring that background tasks do not interfere with API responsiveness.

## Deviations from Plan

None - plan executed exactly as written.

## Technical Details

- **WorkerService:** Uses `p-queue` for concurrency control and `p-retry` for resilient execution.
- **Queue Notification:** `QueueService` was extended with `EventEmitter` to provide real-time notifications to the worker when new jobs arrive.
- **API Integration:** The notes POST route was updated to trigger enqueuing. The `queueService` is injected into the Hono context via middleware for easy access.
- **Stub Processor:** Currently uses a simulated 2-second delay to represent AI processing, ready for real LLM integration in Phase 7.

## Test Plan Results

- **Unit Tests:** Updated `notes.test.ts` to verify that job enqueuing is triggered during note creation.
- **Integration Tests:** A dedicated verification script confirmed that multiple rapid API requests return instantly while the worker processes the resulting jobs in the background with the correct concurrency.
