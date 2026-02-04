# Project Research Summary

**Project:** NoteTaiker
**Domain:** Local-first AI Note-taking
**Researched:** 2026-02-04
**Confidence:** HIGH

## Executive Summary

NoteTaiker v1.5 aims to integrate powerful local AI capabilities for note summarization and metadata extraction while strictly adhering to its privacy-first, local-only mission. Research indicates that using **Ollama** as the primary local LLM runtime, integrated via the **Vercel AI SDK**, provides the most robust and developer-friendly path forward. This approach allows users to leverage state-of-the-art small language models (like Llama 3.2 1B/3B) without sending sensitive data to the cloud.

The recommended architecture centers on a **Backend Proxy Agent** pattern where the Hono API handles all communication with Ollama. This design eliminates common browser-side pitfalls like CORS blocks and enables "Zero-Config" discovery. To ensure a smooth user experience on consumer hardware, the system must prioritize streaming responses and implement a serialized job queue to prevent CPU/GPU saturation.

Key risks involve hardware variability and the inherent latency of local inference. These will be mitigated by implementing clear "Model Readiness" indicators, "Cold Start" progress tracking, and token-aware context management. By focusing on these areas, NoteTaiker can deliver a high-quality AI experience that feels responsive and remains 100% private.

## Key Findings

### Recommended Stack

The stack builds upon the existing Hono/React/Vercel AI SDK foundation, adding specialized tools for local LLM orchestration.

**Core technologies:**
- **Ollama / Llamafile**: Local LLM Runtime — Industry standard for high-performance local inference.
- **@ai-sdk/ollama**: Vercel AI SDK Provider — Seamless integration with existing backend AI patterns.
- **tiktoken**: Token Counting — Essential for pre-flight context window validation to prevent crashes.
- **p-queue**: Concurrency Control — Ensures serialized inference to protect system resources.

### Expected Features

Users expect local AI to be transparent, fast (via streaming), and non-intrusive.

**Must have (table stakes):**
- **Manual Summarize Button** — User-triggered AI actions in the editor.
- **Streaming Responses** — Prevents UI "hangs" during slow local generation.
- **Model Download/Status UI** — Transparent feedback on model availability and loading.

**Should have (competitive):**
- **"Privacy Guard" Badge** — Visual reinforcement of the "100% Local" promise.
- **Summary "Flavors"** — Options for bullet points, action items, or executive summaries.
- **Zero-Config Discovery** — Automatic detection of local Ollama instances.

**Defer (v2+):**
- **Parallel Auto-Summarize** — Too resource-intensive for initial release.
- **Local RAG (Search over all notes)** — High complexity, better suited for a dedicated future update.

### Architecture Approach

A proxy-based approach ensures stability and avoids complex client-side configuration.

**Major components:**
1. **Hono Proxy Agent** — Acts as a secure bridge between the React frontend and the Ollama API.
2. **Serialized Job Queue** — Manages LLM tasks to ensure only one model runs at a time.
3. **Structured Response Handler** — Uses Zod to extract metadata/frontmatter from AI outputs.

### Critical Pitfalls

1. **Ollama CORS Blocks** — Avoided by proxying all requests through the Hono backend.
2. **Context Window Overflow** — Avoided by using `tiktoken` and Map-Reduce strategies for long notes.
3. **Hardware Saturation** — Avoided by enforcing a concurrency limit of 1 for inference tasks.
4. **Model Cold Starts** — Avoided by implementing explicit "Waking up AI" UI states.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Connectivity & Infrastructure
**Rationale:** Foundations must be solid before AI features can be reliably tested.
**Delivers:** Backend proxy, Ollama discovery, and Model Management UI.
**Addresses:** Local Runtime Discovery, Model Download Progress.
**Avoids:** CORS & Connectivity blocks.

### Phase 2: Core Summarization
**Rationale:** Delivers the primary value proposition with minimal complexity.
**Delivers:** Streaming summarization button and basic frontmatter updates.
**Uses:** @ai-sdk/ollama, streaming SSE.
**Implements:** Editor Result Panel.

### Phase 3: Context & Quality
**Rationale:** Ensures the system is robust for "power users" with long notes.
**Delivers:** Token-aware truncation, Map-Reduce for long notes, and Summary "Flavors".
**Addresses:** Context Window Overflow.
**Avoids:** Model crashes on large files.

### Phase 4: Metadata & Automation
**Rationale:** Enhances the ecosystem by turning summaries into searchable metadata.
**Delivers:** Structured tag extraction and hybrid background tagging.
**Uses:** Zod for structured output extraction.

### Phase Ordering Rationale

- **Infrastructure First:** Establishing the Hono-to-Ollama link first avoids the most common "broken on arrival" bugs.
- **Core Value Second:** Delivering a basic summarizer allows for early feedback on model quality.
- **Scalability Third:** Context management (Map-Reduce) is technically complex and follows the basic implementation.
- **Automation Last:** Background tagging depends on a high-quality summary being available first.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Context):** Needs specific investigation into "Map-Reduce" summarization algorithms for optimal local performance.
- **Phase 4 (Metadata):** Needs prompt engineering research for consistent tag extraction from diverse note types.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Infrastructure):** Standard proxy and polling patterns are well-documented.
- **Phase 2 (Summarization):** Basic streaming with Vercel AI SDK is a standard implementation.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Vercel AI SDK and Ollama are stable and widely used. |
| Features | HIGH | Table stakes are consistent across the local AI ecosystem. |
| Architecture | HIGH | Backend proxying is the standard for local-first web apps. |
| Pitfalls | HIGH | Common Ollama issues are well-documented and predictable. |

**Overall confidence:** HIGH

### Gaps to Address

- **Hardware Heuristics:** We need a way to reliably detect VRAM to suggest model sizes (e.g., 1B vs 3B).
- **Model Unloading:** Need to decide on the best strategy for freeing VRAM (timeout vs. manual signal).

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs) — Core integration patterns.
- [Ollama API Docs](https://github.com/ollama/ollama/blob/main/docs/api.md) — Connectivity and model management.
- [Hono Streaming](https://hono.dev/helpers/streaming) — Implementation of SSE for Hono.

### Secondary (MEDIUM confidence)
- [Obsidian/Logseq Community Plugins] — Feature sets and user expectations for local AI.

---
*Research completed: 2026-02-04*
*Ready for roadmap: yes*
