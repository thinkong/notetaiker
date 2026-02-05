# Architecture Patterns

**Domain:** Local AI Integration
**Researched:** 2026-02-04

## Recommended Architecture: Backend Proxy Agent

To maintain the local-first promise while ensuring UI responsiveness, NoteTaiker should use the **Backend Proxy Agent** pattern.

### System Structure

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│  React UI     │       │  Hono API     │       │  Ollama /     │
│  (Editor)     │ <───> │  (Node.js)    │ <───> │  Llamafile    │
└───────────────┘       └───────┬───────┘       └───────────────┘
                                │
                        ┌───────▼───────┐
                        │  p-queue      │
                        │  (Job Serial) │
                        └───────────────┘
```

### Component Boundaries

| Component      | Responsibility                              | Communicates With           |
| -------------- | ------------------------------------------- | --------------------------- |
| **Web Client** | Captures input, displays AI status/results. | Hono API (SSE/JSON)         |
| **Hono API**   | Routes requests, manages auth/context.      | SQLite, File System, Ollama |
| **Job Queue**  | Ensures only one LLM task runs at a time.   | Hono Handlers               |
| **Ollama**     | Executes model inference.                   | Hono API (via Provider)     |

### Data Flow (Summarization)

1. **Trigger:** User saves a note or clicks "Summarize".
2. **API:** Fetches full note from local disk.
3. **Queue:** Task is added to `p-queue` (concurrency: 1).
4. **Inference:** Calls `@ai-sdk/ollama` with a structured prompt.
5. **Update:** Result is written to Markdown frontmatter using `gray-matter`.
6. **Sync:** Frontend is notified of update (Websocket or Poll).

## Patterns to Follow

### Pattern 1: Token-Aware Truncation

Before sending text to a local model, use `tiktoken` to ensure it fits in the context window (typically 2048-4096 tokens for small models).

### Pattern 2: Server-Sent Events (SSE)

Use SSE for streaming AI responses to the UI. This provides immediate feedback and prevents timeouts on slow local hardware.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Direct Client-to-Ollama

**Why bad:** Requires users to manually set `OLLAMA_ORIGINS` (CORS), which breaks the "Zero-Config" goal.
**Instead:** Always proxy through the Hono API.

### Anti-Pattern 2: Large Model Default

**Why bad:** Defaulting to an 8B or 13B model on an 8GB laptop will crash the app.
**Instead:** Default to 1B/3B (e.g., Llama 3.2 1B) and allow upgrading.

## Sources

- [Vercel AI SDK Core Concepts](https://sdk.vercel.ai/docs/concepts/architecture)
- [Ink & Switch: Local-first Software](https://www.inkandswitch.com/local-first/)
- [Hono Streaming Helpers](https://hono.dev/helpers/streaming)
