# Project Research Summary

**Project:** NoteTaiker
**Domain:** Local-first AI Note-taking App
**Researched:** 2026-01-26
**Confidence:** HIGH

## Executive Summary

NoteTaiker is a local-first AI note-taking application designed for zero-friction capture and automated organization. Unlike traditional note-taking apps that rely on manual categorization, NoteTaiker uses local-only AI models to automatically tag and structure notes as they are written. Experts in the local-first space emphasize privacy, speed, and user ownership of data, which NoteTaiker achieves by storing notes as pure Markdown files on the user's local filesystem and performing all AI inference on-device.

The recommended approach utilizes **Tauri** for a native desktop experience, **Transformers.js (v3)** with **WebGPU** for high-performance local AI, and **LanceDB** for semantic search. A decoupled background agent architecture ensures that the UI remains responsive (zero-friction) while the AI worker processes notes in the background. This architecture allows for advanced features like "Smart Views" and semantic search without sacrificing the simplicity of a plain-text Markdown store.

Key risks include potential data loss during concurrent edits between the user and the AI agent (Frontmatter race conditions) and the risk of infinite write-loops triggered by the filesystem watcher. These will be mitigated through a robust synchronization layer, optimistic updates with debounced writes, and a strict event-filtering mechanism for the AI worker.

## Key Findings

### Recommended Stack

The stack is optimized for 2026 standards, focusing on performance, local-only AI, and native filesystem integration.

**Core technologies:**
- **Tauri (2.1+):** Desktop/Mobile App Shell — Superior performance/security over Electron and critical native Rust-based FS access.
- **Transformers.js (3.x):** Local AI Inference — Supports WebGPU for near-native background AI processing without server costs or privacy leaks.
- **LanceDB (0.x):** Local Vector Index — Serverless, disk-based vector DB for semantic search and AI retrieval (RAG).
- **TypeScript (5.x):** Unified Language — Ensures end-to-end type safety across the frontend and AI agent.

### Expected Features

The feature set prioritizes "Zero-Friction" capture and automated organization while explicitly avoiding legacy structures like manual folder trees.

**Must have (table stakes):**
- **Instant-Stream Capture:** Sub-100ms startup to typing for immediate note entry.
- **Pure Markdown Editor:** Native support for GFM and YAML frontmatter.
- **Local Filesystem Sync:** Real-time monitoring of local folders for external changes.

**Should have (competitive):**
- **Background AI Tagging:** Automated metadata generation using local SLMs.
- **Semantic Search:** Vibe-based retrieval powered by LanceDB vector embeddings.
- **AI-Organized "Smart Views":** Virtual groupings that replace manual folder management.

**Defer (v2+):**
- **Multimodal Capture:** Image/Link AI processing (alt-text generation).
- **Custom Schema Templates:** User-defined YAML structures for specific note types.

### Architecture Approach

NoteTaiker follows a **Decoupled Background Agent** architecture to maintain UI responsiveness while performing intensive AI tasks.

**Major components:**
1. **Editor (React):** Low-latency text entry and stream-based UI.
2. **Tauri Rust Core:** Native FS watching and secure system-level operations.
3. **Background AI Worker:** WebGPU-powered model inference for tagging and embeddings.
4. **Vector Store (LanceDB):** Transient index for semantic discovery.

### Critical Pitfalls

Addressing these pitfalls early is essential for data integrity and performance.

1. **Frontmatter Race Conditions:** Prevent AI and user edits from overwriting each other by using a robust sync layer and debounced writes.
2. **AI Write-Loops:** Ensure the filesystem watcher can distinguish between user changes and agent-initiated updates to avoid infinite loops.
3. **Automated Tag Bloat:** Prevent the AI from creating redundant tags (e.g., #AI vs #ai) by providing a global tag context to the agent.
4. **Hardware/Model Mismatch:** Implement hardware capability checks to fall back to smaller quantized models on lower-end devices.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Storage
**Rationale:** Establishing the "Pure Markdown" source of truth and a robust FS bridge is the prerequisite for all other features.
**Delivers:** Functional desktop app with instant-stream editor and local file sync.
**Addresses:** Instant-Stream Capture, Pure Markdown Editor, Local FS Sync.
**Avoids:** Frontmatter Race Conditions, Privacy Value Conflict.

### Phase 2: AI Enrichment Agent
**Rationale:** The core differentiator (automated organization) requires the AI worker and tagging logic.
**Delivers:** Background AI worker that automatically adds tags to notes.
**Uses:** Transformers.js (WebGPU), Unified/Remark.
**Implements:** Background AI Worker, Markdown Parser.

### Phase 3: Semantic Discovery
**Rationale:** Semantic search and smart views depend on the metadata generated in Phase 2.
**Delivers:** Vector indexing, semantic search UI, and tag-based virtual folders.
**Uses:** LanceDB, TanStack Query.
**Implements:** Vector Store, Search UI.

### Phase Ordering Rationale

- **Storage first:** The "Source of Truth" must be rock-solid before an AI agent starts modifying it.
- **Metadata before Search:** Semantic search is useless without the embeddings and tags generated by the AI agent.
- **Decoupled Development:** The architecture allows Phase 2 to be developed largely in isolation from the UI refinements in Phase 3.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Hardware benchmarking for local models and WebGPU compatibility across different hardware configurations.
- **Phase 1:** Tauri 2.0 security scopes for broad filesystem access.

Phases with standard patterns (skip research-phase):
- **Phase 3:** LanceDB integration and semantic search patterns are well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified with Tauri 2.0 and Transformers.js v3 status. |
| Features | HIGH | Aligned with modern local-first standards. |
| Architecture | HIGH | Standard decoupled worker pattern. |
| Pitfalls | HIGH | Common issues for FS-based apps identified. |

**Overall confidence:** HIGH

### Gaps to Address

- **Mobile WebGPU Support:** Fallback strategy for mobile devices needs validation during Phase 2.
- **Tag Consolidation Logic:** Specific agent prompts for deduplication need testing.

## Sources

### Primary (HIGH confidence)
- [Tauri 2.0 Docs](https://v2.tauri.app/) — Desktop/Mobile unification.
- [Transformers.js v3 GitHub](https://github.com/xenova/transformers.js) — WebGPU support.
- [Ink & Switch](https://www.inkandswitch.com/local-first/) — Local-first principles.

### Secondary (MEDIUM confidence)
- [Obsidian Roadmap](https://obsidian.md/roadmap) — Industry direction.
- [LanceDB Docs](https://lancedb.github.io/lancedb/) — Vector DB integration.

---
*Research completed: 2026-01-26*
*Ready for roadmap: yes*
