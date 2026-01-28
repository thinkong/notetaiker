# Phase 06: AI Processor - Research

**Researched:** 2026-01-28
**Domain:** Background Job Orchestration & Real-time Updates
**Confidence:** MEDIUM

## Summary

Phase 06 focuses on the "machinery" for background AI processing. The primary challenge is implementing a robust, persistent job queue in a local-first Node.js environment without heavy dependencies like Redis.

The research identified **p-queue** as the industry standard for concurrency control and **p-retry** for handling transient failures with exponential backoff. For persistence (necessary for offline handling and recovery), a simple **SQLite-based queue** (using `better-sqlite3` or `sqlite3`) is the most reliable approach for a local-first application.

Real-time UI updates for generated tags will be handled via **Server-Sent Events (SSE)** using Hono's `streamSSE` helper, providing a lightweight alternative to WebSockets for one-way server-to-client updates.

**Primary recommendation:** Use `p-queue` for in-memory concurrency management backed by a lightweight SQLite table for persistence and recovery.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `p-queue` | ^8.0.0 | Concurrency management | Standard for Node.js task orchestration with clear limits and event hooks. |
| `p-retry` | ^6.0.0 | Exponential backoff | Handles transient API failures gracefully without complex custom logic. |
| `better-sqlite3` | ^11.0.0 | Queue Persistence | Fastest and simplest SQLite driver for Node.js; perfect for local state. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `hono/streaming` | N/A | SSE Support | Built into Hono; used for pushing tag updates to the frontend. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `better-sqlite3` | `sqlite3` | `better-sqlite3` is synchronous (easier to reason about for local ops) and generally faster. |
| `p-queue` | `bullmq` | `bullmq` requires Redis, which violates the local-first/lightweight requirement. |
| SSE | WebSockets | WebSockets are overkill for one-way tag updates and more complex to maintain. |

**Installation:**
```bash
pnpm add p-queue p-retry better-sqlite3
pnpm add -D @types/better-sqlite3
```

## Architecture Patterns

### Recommended Project Structure
```
apps/api/src/
├── services/
│   ├── worker.service.ts    # Main job orchestrator (p-queue)
│   ├── queue.service.ts     # Persistence layer (SQLite)
│   └── processor.ts         # Logic for individual job execution
├── routes/
│   └── events.ts            # SSE endpoint for UI updates
```

### Pattern 1: Persistent Queue with Memory Concurrency
**What:** Jobs are written to SQLite immediately. `p-queue` pulls from SQLite to execute with a concurrency limit.
**When to use:** When jobs must survive restarts and handle offline states.
**Example:**
```typescript
// Source: https://github.com/sindresorhus/p-queue
import PQueue from 'p-queue';
import pRetry from 'p-retry';

const queue = new PQueue({ concurrency: 2 });

async function enqueueJob(noteId: string) {
  // 1. Persist to SQLite (status: 'queued')
  // 2. Add to p-queue
  queue.add(async () => {
    return pRetry(async () => {
      // 3. Update SQLite (status: 'processing')
      // 4. Call AI Processor
      // 5. Update SQLite (status: 'complete')
      // 6. Notify SSE clients
    }, { retries: 3 });
  });
}
```

### Anti-Patterns to Avoid
- **In-memory only queue:** Jobs will be lost on app restart or crash.
- **Polling for tags:** Frontend polling creates unnecessary load and latency; use SSE.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Concurrency Limits | Custom counter/array | `p-queue` | Handles edge cases, pausing, and event emitting. |
| Exponential Backoff | `setTimeout` loop | `p-retry` | Standardized jitter and backoff strategies prevent "thundering herd". |

**Key insight:** Local-first apps need a persistence layer for queues because they are frequently restarted by users.

## Common Pitfalls

### Pitfall 1: Ghost Jobs on Restart
**What goes wrong:** Jobs marked 'processing' in SQLite stay 'processing' forever if the app crashes.
**How to avoid:** On startup, reset any 'processing' jobs in SQLite back to 'queued' or 'failed' before starting the worker.

### Pitfall 2: SSE Memory Leaks
**What goes wrong:** Connection objects in Hono/Node can leak if not cleaned up when a client disconnects.
**How to avoid:** Use Hono's `streamSSE` cleanup callback to remove the client from the active notification list.

## Code Examples

### SSE Pattern in Hono
```typescript
// Source: https://hono.dev/helpers/streaming#streamsse
app.get('/api/events', (c) => {
  return streamSSE(c, async (stream) => {
    const clientId = addClient(stream);
    stream.onAbort(() => removeClient(clientId));

    // Keep alive
    while (true) {
      await stream.sleep(30000);
      await stream.writeSSE({ event: 'ping', data: 'pong' });
    }
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Polling | SSE / WebSockets | 2020+ | Reduced battery/network usage on clients. |
| Redis Queues | SQLite Queues | 2022+ | Enables powerful "local-first" desktop/mobile apps. |

## Open Questions

1. **SQLite Driver:** Should we use `better-sqlite3` or the native Node.js `node:sqlite` (introduced in Node 22)?
   - Recommendation: Use `better-sqlite3` as it's more mature and feature-complete for complex queries, but check Node version compatibility.
2. **Offline Detection:** How specifically to detect "connectivity return"?
   - Recommendation: Rely on the job failing and `p-retry` backing off; the final failure can remain in 'queued' state for a manual or timer-based retry.

## Sources

### Primary (HIGH confidence)
- [p-queue](https://github.com/sindresorhus/p-queue) - Concurrency management
- [Hono Streaming](https://hono.dev/helpers/streaming) - SSE Implementation
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - Persistence

### Secondary (MEDIUM confidence)
- [p-retry](https://github.com/sindresorhus/p-retry) - Backoff strategy

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries are mature and standard.
- Architecture: MEDIUM - Implementation details for persistent p-queue need careful wiring.
- Pitfalls: MEDIUM - Crash recovery is the main complexity.

**Research date:** 2026-01-28
**Valid until:** 2026-02-28
