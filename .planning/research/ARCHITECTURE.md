# Architecture Research

**Domain:** Local-first AI Note-taking App
**Researched:** 2026-01-26
**Confidence:** HIGH

## Recommended Architecture

NoteTaiker follows a **Decoupled Background Agent** architecture. The UI remains reactive and "zero-friction" by offloading all intelligence tasks to a separate process.

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Tauri WebView (Frontend)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │ Editor    │ <──> │ State        │ <──> │ Search UI    │  │
│  │ (React)   │      │ (TanStack)   │      │ (LanceDB)    │  │
│  └─────┬─────┘      └──────┬───────┘      └──────┬───────┘  │
└────────┼───────────────────┼─────────────────────┼──────────┘
         │                   │                     │
┌────────┼───────────────────┼─────────────────────┼──────────┐
│        │          Tauri Rust Core (Backend)      │          │
├────────┼───────────────────┼─────────────────────┼──────────┤
│  ┌─────▼─────┐      ┌──────▼──────┐      ┌───────▼──────┐  │
│  │ FS Watcher│ ───> │ Event Bus   │ <──> │ Vector Store │  │
│  │ (Notify)  │      │ (Commands)  │      │ (LanceDB)    │  │
│  └─────┬─────┘      └──────┬──────┘      └───────┬──────┘  │
└────────┼───────────────────┼─────────────────────┼──────────┘
         │                   │                     │
┌────────┼───────────────────┼─────────────────────┼──────────┐
│        │          Background AI Worker           │          │
├────────┼───────────────────┼─────────────────────┼──────────┤
│  ┌─────▼─────┐      ┌──────▼──────┐      ┌───────▼──────┐  │
│  │ Markdown  │      │ Transformers│      │ Tagging      │  │
│  │ Parser    │ ───> │ .js (WebGPU)│ ───> │ Logic        │  │
│  └───────────┘      └─────────────┘      └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component           | Responsibility                                 | Implementation               |
| ------------------- | ---------------------------------------------- | ---------------------------- |
| **Editor**          | Low-latency text entry and Markdown rendering. | React + CodeMirror/Lexical   |
| **FS Watcher**      | Monitoring local `.md` files for changes.      | Tauri `fs` + `notify` (Rust) |
| **AI Worker**       | Local LLM inference (Tagging/Embedding).       | Transformers.js v3 (WebGPU)  |
| **Vector Store**    | Fast semantic retrieval and tag indexing.      | LanceDB (Node/Rust)          |
| **Source of Truth** | Permanent storage.                             | Plain Markdown + YAML files  |

## Recommended Project Structure

```
/
├── src/
│   ├── components/      # UI: Stream, Editor, Search
│   ├── hooks/           # TanStack Query + FS bindings
│   ├── worker/          # AI Worker (Transformers.js)
│   │   ├── models/      # Local model management
│   │   └── pipelines/   # Tagging & Embedding logic
│   └── lib/
│       ├── markdown.ts  # Unified/Remark processing
│       └── vector.ts    # LanceDB client
├── src-tauri/
│   ├── src/             # Rust: Native FS, System Tray
│   └── capabilities/    # Tauri 2.0 security scopes
└── notes/               # User's Markdown store (SOT)
```

## Architectural Patterns

### Pattern 1: Optimistic FS Updates

**What:** The UI updates its local state immediately when a user types, then debounces the write to the physical `.md` file.
**When:** Essential for "Zero-Friction" capture.
**Trade-offs:** If the app crashes before the debounce, the last few characters might be lost. (Mitigation: 500ms debounce + WAL-style temp file).

### Pattern 2: Sidecar Metadata Indexing

**What:** While Markdown is the Source of Truth, a transient LanceDB index is maintained in the background for fast search.
**When:** When the note count exceeds ~100.
**Trade-offs:** The index must be "re-hydrated" if deleted; it's a derived view, not the primary data.

### Pattern 3: Worker Isolation

**What:** Running the LLM in a separate Web Worker with a dedicated WebGPU context.
**When:** Always.
**Trade-offs:** Slight overhead in message passing (postMessage), but prevents UI jank.

## Data Flow

### The "Magic" Tagging Flow

1. **User saves note** → Tauri triggers `fs-notify`.
2. **Event Bus** → Sends `FILE_CHANGED` message to AI Worker.
3. **AI Worker** → Reads content, runs SLM (Small Language Model) to extract tags.
4. **Markdown Parser** → Merges new tags into YAML frontmatter.
5. **FS Write** → Tauri writes the updated `.md` back to disk.
6. **UI Refresh** → State updates to show the new "Smart Tags."

## Suggested Build Order

Based on component dependencies, the recommended implementation sequence is:

1.  **Foundation (Tauri + FS Bridge):** Implement basic file reading/writing and the "Zero-Friction" editor stream. The app must work as a basic note-taker first.
2.  **Metadata Layer (Unified/Remark):** Build the logic to programmatically parse and update YAML frontmatter without destroying user content.
3.  **AI Integration (Transformers.js):** Set up the Web Worker and local model loading. Implement simple keyword-based tagging as a fallback before full SLM tagging.
4.  **Discovery Layer (LanceDB):** Implement vector indexing and semantic search once there is AI-generated metadata to query.
5.  **Smart Views:** Build the UI for "Virtual Folders" that rely on the metadata/vector layers.

## Scaling Considerations

| Concern           | At 100 notes | At 10k notes     | At 100k notes             |
| ----------------- | ------------ | ---------------- | ------------------------- |
| **Search**        | Grep is fine | LanceDB Required | LanceDB + IVF-PQ Index    |
| **AI Processing** | Real-time    | Batch/Queue      | Distant-Background (Idle) |
| **Memory**        | < 200MB      | ~500MB (Index)   | ~1GB+ (Vector Cache)      |

## Sources

- [Tauri 2.0 Reference](https://v2.tauri.app/)
- [LanceDB Architecture Guide](https://lancedb.github.io/lancedb/concepts/architecture/)
- [Local-first Web Patterns (Ink & Switch)](https://www.inkandswitch.com/local-first/)

---

_Architecture research for: NoteTaiker_
_Researched: 2026-01-26_
