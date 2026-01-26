# Stack Research

**Domain:** Local-first AI Note-taking App
**Researched:** 2026-01-26
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Tauri** | 2.1+ | Desktop/Mobile App Shell | Superior performance and security over Electron. Native Rust-based FS access is critical for "Pure Markdown" storage. |
| **TypeScript** | 5.x | Unified Language | Provides end-to-end type safety for the note schema (YAML frontmatter) and AI agent messages. |
| **Transformers.js** | 3.x | Local AI Inference | v3 supports **WebGPU**, allowing background AI tagging and embedding generation at near-native speeds without server costs. |
| **LanceDB** | 0.x | Local Vector Index | Serverless, disk-based vector DB. Perfect for indexing Markdown notes for semantic search and AI retrieval (RAG). |
| **React** | 19.x | UI Framework | Standard for 2026; Server Components (in static mode) and robust ecosystem for complex editor components. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Unified / Remark** | 13.x+ | Markdown Parsing/AST | Use for programmatic manipulation of YAML frontmatter and Markdown content with high precision. |
| **Chokidar** | 4.x | Filesystem Watcher | To trigger the background AI agent whenever the user saves or moves a Markdown file. |
| **Zod** | 3.x | Schema Validation | Validating YAML frontmatter against the expected "AI-generated" schema to prevent data corruption. |
| **TanStack Query** | 5.x | Local Data Fetching | Managing the "async" state of reading files and querying the local LanceDB index. |
| **Shadcn/UI** | Latest | UI Components | Rapidly building a clean, "zero-friction" capture interface that feels native. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Vite** | Frontend Bundler | Extremely fast HMR; essential for the low-friction development required for Tauri apps. |
| **Biome** | Linting/Formatting | 2026 standard replacement for ESLint/Prettier; significantly faster for large TS codebases. |
| **Tauri Action** | CI/CD | Automates cross-platform builds (macOS, Windows, Linux) for every commit. |

## Installation

```bash
# Core Tauri + Frontend
npx create-tauri-app@latest

# AI & Data
npm install @xenova/transformers @lancedb/lancedb chokidar

# Markdown & Validation
npm install unified remark-parse remark-frontmatter remark-stringify yaml zod

# UI & State
npm install @tanstack/react-query lucide-react clsx tailwind-merge
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Tauri** | **Electron** | If you need legacy support for very old Chromium versions or specific deep Node.js native modules. |
| **Transformers.js** | **Ollama** | If the user already has Ollama installed and you want to offload processing to a dedicated system service. |
| **LanceDB** | **SQLite (VSS)** | If the app requires complex relational queries alongside vector search. |
| **Unified/Remark** | **gray-matter** | If you only need to read frontmatter and never programmatically modify the Markdown AST. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Cloud-only LLMs** | Violates "Local-first" and adds latency/cost to a "zero-friction" experience. | Local Transformers.js (WebGPU) |
| **IndexedDB for notes** | Violates "Pure Markdown" constraint; data becomes trapped in browser storage. | Native FS via Tauri Rust bridge |
| **Heavyweight ORMs** | Overkill for a filesystem-based app; adds unnecessary abstraction and bundle size. | Simple FS utilities + Zod |

## Stack Patterns by Variant

**If Mobile Support is required (Tauri 2.0+):**
- Use **Capacitor**-like plugins within Tauri for native mobile filesystem access.
- Note: WebGPU support varies on mobile; fallback to WebAssembly (WASM) for AI tasks.

**If Real-time Collaboration is added:**
- Use **Automerge** or **Yjs** for CRDT support.
- Note: Requires a bridge to sync CRDT changes back to the "Source of Truth" Markdown files.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `tauri@2.1.0` | `rust@1.75+` | Required for the latest cross-platform FS features. |
| `@xenova/transformers@3.0` | `WebGPU` | Requires Chrome 113+ or equivalent Tauri/WebView2 versions. |
| `remark-frontmatter` | `unified@11` | Ensure ESM compatibility across the Markdown pipeline. |

## Sources

- [Tauri 2.0 Docs](https://v2.tauri.app/) — Desktop/Mobile unification verified.
- [Transformers.js v3 Roadmap](https://github.com/xenova/transformers.js) — WebGPU support and background worker patterns.
- [LanceDB Node.js SDK](https://lancedb.github.io/lancedb/) — Performance for local vector search.
- [Ecosystem Survey 2026] — Community shift toward Biome and React 19.

---
*Stack research for: Local-first AI Note-taking*
*Researched: 2026-01-26*
