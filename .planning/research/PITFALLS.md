# Pitfalls Research: Local LLM Support & Summarization

**Domain:** Local-first AI (Ollama)
**Researched:** 2026-02-04
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Ollama CORS & Connection Blocks

**What goes wrong:**
The React frontend attempts to call the Ollama API directly, but the request is blocked by CORS (Cross-Origin Resource Sharing) or a connection error occurs because Ollama is only listening on localhost and not configured for web access.

**Why it happens:**
By default, Ollama's API is restricted to prevent unauthorized access. Developers often forget to set the `OLLAMA_ORIGINS` environment variable, or users run the app in an environment where localhost access is restricted.

**How to avoid:**
Proxy all Ollama requests through the Hono backend. This avoids browser CORS issues entirely and allows the backend to handle authentication or rate limiting if NoteTaiker ever moves to a multi-user setup.

**Warning signs:**
"Failed to fetch" errors in the browser console. AI features working for the developer but failing for users.

**Phase to address:**
Phase 1: Connectivity & Infrastructure

---

### Pitfall 2: Model Availability & Cold Starts

**What goes wrong:**
The app requests a specific model (e.g., `llama3.2`) that the user hasn't downloaded yet, or the first request takes 30+ seconds while the model loads into VRAM.

**Why it happens:**
Local models are large (GBs) and must be "pulled" before use. Loading them into GPU memory also takes significant time depending on hardware speed.

**How to avoid:**
Implement a "Model Readiness" check on startup. If a required model is missing, provide a UI to pull it. Use a "Loading Model..." state in the UI to manage user expectations during the first inference.

**Warning signs:**
Timeouts on the first AI request of a session. 404 errors from the Ollama API when requesting a model.

**Phase to address:**
Phase 1: Connectivity & Infrastructure

---

### Pitfall 3: Context Window Overflow

**What goes wrong:**
When summarizing long notes, the text exceeds the local model's context window (often 2048 or 4096 tokens for smaller models like Phi-3 or TinyLlama).

**Why it happens:**
Developers assume local models have the same massive context windows (128k+) as cloud providers like Claude or GPT-4.

**How to avoid:**
Implement token counting on the server side (using `tiktoken` or a simple word-count heuristic). If a note is too long, use a "Map-Reduce" summarization strategy (summarize chunks, then summarize the results).

**Warning signs:**
Summaries that cut off mid-sentence. Model returning empty responses or "Out of memory" errors.

**Phase to address:**
Phase 3: Context & Quality

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut              | Immediate Benefit     | Long-term Cost                                                                | When Acceptable           |
| --------------------- | --------------------- | ----------------------------------------------------------------------------- | ------------------------- |
| Direct Frontend calls | Faster implementation | CORS hell, security risks, no centralized token management.                   | Never                     |
| Hardcoded Model Names | Quick prototyping     | App breaks when the model is updated or if the user wants a different flavor. | Phase 1 only              |
| Skipping Token Counts | Less code to write    | Frequent crashes on long notes; poor UX for power users.                      | MVP with short notes only |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration   | Common Mistake                   | Correct Approach                                                                 |
| ------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| Ollama API    | Assuming it's always running     | Polling a `/status` or `/api/tags` endpoint and showing a "Start Ollama" prompt. |
| Vercel AI SDK | Not handling stream errors       | Wrapping `streamText` in try/catch and providing fallback non-AI UI.             |
| Filesystem    | Triggering AI on every keystroke | Debouncing AI tasks until the file has been idle for 2-5 seconds.                |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap                | Symptoms                 | Prevention                                                                     | When It Breaks                               |
| ------------------- | ------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------- |
| Large Model on CPU  | 1 token per second speed | Hardware check; recommend/require GPU or small (3B) models.                    | Immediately on non-M-series Mac / No-GPU PCs |
| Blocking API Thread | UI lag while AI thinks   | Use `p-queue` or background workers to ensure the Hono API remains responsive. | > 1 concurrent user/task                     |
| Non-Streaming UI    | "Dead" screen for 10s    | Use SSE (Server-Sent Events) to stream tokens as they are generated.           | > 50 word summaries                          |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake              | Risk                                                                 | Prevention                                                                 |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Exposing Ollama Port | Unauthenticated users on the local network could use the user's GPU. | Bind Ollama to `127.0.0.1` and only allow access via the Hono proxy.       |
| Prompt Injection     | User notes could "trick" the summarizer into executing commands.     | Sanitize input and use strict System Prompts with structured output (Zod). |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall             | User Impact                                        | Better Approach                                                  |
| ------------------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| Hidden "Cold Start" | User thinks the app is broken during first load.   | Explicit "Waking up AI..." progress bar.                         |
| Over-Confidence     | Inaccurate summaries presented as fact.            | Add a "Generated by AI" disclaimer and an "Edit Summary" button. |
| No "Stop" Button    | User stuck waiting for a long, irrelevant summary. | Implement an AbortController to cancel inference.                |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Summarization:** Often missing token limits — verify long notes (10k+ words) don't crash the server.
- [ ] **Ollama Setup:** Often missing "Model Not Found" handling — verify the app handles a clean Ollama install with no models.
- [ ] **Streaming:** Often missing error recovery — verify the UI handles a broken stream mid-sentence.
- [ ] **Privacy:** Often missing local-only guarantee — verify no data is sent to external APIs when "Local Mode" is on.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall           | Recovery Cost | Recovery Steps                                                        |
| ----------------- | ------------- | --------------------------------------------------------------------- |
| Connection Lost   | LOW           | Show "Reconnecting..." and retry with exponential backoff.            |
| Model Crash (OOM) | MEDIUM        | Clear the AI context, notify the user, and suggest a smaller model.   |
| Hallucination     | MEDIUM        | Provide a "Regenerate" button with a different temperature or prompt. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall             | Prevention Phase | Verification                                                     |
| ------------------- | ---------------- | ---------------------------------------------------------------- |
| CORS & Connectivity | Phase 1          | Success check: UI shows "Ollama Connected" on a fresh install.   |
| Model Cold Starts   | Phase 1          | Success check: UI shows loading spinner, doesn't timeout.        |
| Context Overflow    | Phase 3          | Success check: 50-page PDF/Note can be summarized without error. |

## Sources

- [Vercel AI SDK Error Handling](https://sdk.vercel.ai/docs/concepts/error-handling)
- [Ollama FAQ: Common Issues](https://github.com/ollama/ollama/blob/main/docs/faq.md)
- [Personal experience with Local-first AI projects 2024-2025]

---

_Pitfalls research for: Local LLM Support & Summarization_
_Researched: 2026-02-04_
