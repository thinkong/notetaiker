# Feature Landscape: Local AI & Summarization (v1.5)

**Domain:** Local-first AI Note-taking
**Researched:** 2026-02-04
**Overall Confidence:** HIGH

## Table Stakes

Features users expect when "Local AI" is integrated into a modern note-taking app. Missing these makes the feature feel broken or unpolished.

| Feature                     | Why Expected                                                                         | Complexity | Notes                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------ | ---------- | --------------------------------------------------------------------------- |
| **Manual Summarize Button** | Users want to trigger AI on demand, not have it constantly running.                  | Low        | Simple UI trigger in the editor toolbar or sidebar.                         |
| **Model Download Progress** | Local models are large (GBs). Users need to see progress bars, not a "frozen" app.   | Medium     | Requires polling Ollama's `/api/pull` endpoint for percent completion.      |
| **Streaming Responses**     | Local inference is slower than Cloud (5-15 t/s). Streaming prevents "UI hang" feel.  | Low        | Built-in support via Vercel AI SDK `streamText` and SSE.                    |
| **Connection Status UI**    | A clear "Ollama: Connected" or "Ollama: Offline" indicator in the status bar.        | Low        | Poll `localhost:11434/api/tags` on app startup and every 30s.               |
| **Stop/Abort Generation**   | Users need to cancel if the summary is too long, irrelevant, or hallucinating.       | Medium     | Requires `AbortController` integration to signal the local backend to stop. |
| **Local Model Selection**   | Different hardware supports different sizes. Allow switching between 1B, 3B, and 8B. | Medium     | Map hardware specs (VRAM) to recommended model sizes.                       |

## Differentiators

Features that will set NoteTaiker apart from standard "AI plugins" and reinforce the privacy mission.

| Feature                       | Value Proposition                                                               | Complexity | Notes                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| **"Privacy Guard" Badge**     | A prominent visual badge showing "Processed 100% Locally" for sensitive notes.  | Low        | Purely a UI/UX trust-building element for privacy-conscious users.                   |
| **Zero-Config Discovery**     | Automatically detects Ollama/LM Studio without requiring manual URL entry.      | Medium     | Tries standard ports (11434, 1234) on first launch to find local runtimes.           |
| **Summary "Flavors"**         | Choice between "Bullet Points," "Executive Summary," and "Action Items."        | Medium     | Uses specialized system prompts (e.g., "Summarize as a list of 3 actionable items"). |
| **Hybrid Background Tagging** | Uses the generated summary to automatically suggest metadata/tags for the note. | High       | Chain: Generate Summary -> Structured Extraction of Tags via Zod.                    |
| **Hardware-Aware Defaults**   | Automatically selects Llama 3.2 1B for low-spec machines and 8B for high-spec.  | Medium     | Heuristic based on `navigator.hardwareConcurrency` and OS type.                      |

## Anti-Features

Things we should explicitly avoid to stay true to NoteTaiker's "Local-first" philosophy and performance goals.

| Anti-Feature                 | Why Avoid                                                                     | What to Do Instead                                                           |
| ---------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Auto-Sync to Cloud AI**    | Destroys the privacy promise of local-first.                                  | Keep Cloud (Claude/OpenAI) as a clearly labeled, separate opt-in toggle.     |
| **Parallel Auto-Summarize**  | Running multiple summaries simultaneously will freeze most consumer hardware. | Implement a serialized queue (`p-queue`) with concurrency set to 1.          |
| **Persistent VRAM Loading**  | Keeping models in memory permanently consumes 8GB+ of system resources.       | Use Ollama's default 5-minute timeout or send a signal to unload models.     |
| **Infinite Context History** | Local models have small context windows (2k-8k).                              | Implement token-aware truncation or Map-Reduce summarization for long notes. |

## Feature Dependencies

```
[System Check] ──> [Local Runtime Discovery] ──> [Model Pull/Sync UI]
                                                     │
                                                     ▼
[Editor Content] ──> [Token Buffer] ──> [Inference Engine (Ollama)]
                                                     │
                       ┌─────────────────────────────┴──────────────────┐
                       │                                                │
             [Streaming Summary]                        [Structured Metadata Extraction]
                       │                                                │
                       ▼                                                ▼
             [Editor Result Panel]                    [SQLite Index & Frontmatter Updates]
```

## MVP Recommendation (v1.5)

To deliver immediate value while managing complexity:

1.  **Ollama Discovery & Status**: Visual confirmation that the local engine is active.
2.  **Streaming Bullet Summary**: A "Summarize" button in the sidebar that streams bullet points.
3.  **Local-Only Guard**: A global toggle that forces all AI operations to stay on-device.

## Sources

- [Obsidian Smart Connections: Feature Analysis](https://github.com/brianpetro/obsidian-smart-connections)
- [Logseq AI Ecosystem: Best Practices 2026]
- [Vercel AI SDK v6: Local Provider Patterns](https://sdk.vercel.ai/docs)
- [Ollama API Specification: Pull & Status](https://github.com/ollama/ollama/blob/main/docs/api.md)
