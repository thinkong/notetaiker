---
phase: 06-ai-processor
plan: 03
subsystem: AI Processor
tags: [sse, real-time, react-hooks, events]
requires: [06-02]
provides: [real-time-notification-pipeline]
affects: [07-01]
tech-stack:
  added: []
  patterns: [Server-Sent Events, EventSource hook]
key-files:
  created: [apps/api/src/routes/events.ts, apps/api/src/services/events.service.ts, apps/web/src/hooks/useSSE.ts]
  modified: [apps/api/src/index.ts, apps/api/src/services/worker.service.ts]
decisions:
  - SSE for Real-time: Chose Server-Sent Events over WebSockets for its simplicity and unidirectional suitability (server to client updates).
  - Event Bus: Centralized event broadcasting in `EventsService` to decouple worker logic from streaming logic.
  - Automatic Cache Invalidation: Integrated `useSSE` with TanStack Query to automatically refresh note data when processing completes.
metrics:
  duration: 15m
  completed: 2026-01-28
---

# Phase 06 Plan 03: Real-time Updates (SSE) Summary

## Substantive Summary
Established a real-time communication channel between the background worker and the frontend using Server-Sent Events (SSE). This allows the UI to react instantly when background AI processing completes, enabling features like automatic metadata updates and status indicators without requiring manual page refreshes.

## Deviations from Plan
- **Linting Fixes:** Corrected quote styles and console logging constraints in the `useSSE` hook to satisfy project linting rules.

## Technical Details
- **EventsService:** A shared `EventEmitter` that acts as an application-wide message bus.
- **SSE Endpoint:** `GET /api/events` streams updates to clients, including a 30-second heart-beat (ping) to keep connections alive.
- **useSSE Hook:** A React hook that manages the `EventSource` lifecycle, listening for `note_updated` events and triggering TanStack Query invalidation.
- **Worker Integration:** The `WorkerService` now broadcasts a signal upon successful job completion.

## Test Plan Results
- **API Verification:** A dedicated script confirmed that `WorkerService` successfully broadcasts through the `EventsService` and that the SSE endpoint correctly receives and formats these broadcasts.
- **Linting:** Verified that all new files pass the project's strict ESLint/Prettier configuration.
