# NoteTaiker

## What This Is

A local-first, AI-enhanced note-taking system designed for zero-friction capture. Users can "input anything" (text, images, code, links) into a stream of atomic Markdown files, while a background AI agent automatically organizes content by generating relevant tags in YAML frontmatter.

## Core Value

Zero-friction capture with intelligent, automated organization. The user just types; the system handles the sorting.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **Local Server**: TypeScript-based local backend to manage file operations and AI processing.
- [ ] **Web Client (v1)**: Browser-based interface for quick capture and timeline viewing.
- [ ] **Atomic Storage**: Save each note as a unique Markdown file (timestamp-based naming).
- [ ] **Rich Content**: Support text, images, link previews, and code snippets.
- [ ] **Background AI**: Process new notes asynchronously to generate tags.
- [ ] **YAML Metadata**: Store AI-generated tags and metadata in file frontmatter.
- [ ] **Configurable AI**: Allow users to select between Local LLMs (Ollama) or Cloud APIs.
- [ ] **Timeline View**: View notes in a reverse-chronological stream.
- [ ] **Search & Filter**: Find notes by content or AI-generated tags.

### Out of Scope

- **Graph View**: Deferred to v2 (focus on capture and list retrieval first).
- **Desktop/CLI Apps**: Deferred to future milestones (Web first).
- **Hosted Service**: Deferred (local-first focus for v1).
- **Complex Editors**: No WYSIWYG for v1 (Markdown only).

## Context

- **Local-First Philosophy**: User owns the data (files on disk).
- **AI as Augmentation**: AI doesn't write the note, it organizes it.
- **Ecosystem**: Needs to run locally on user machines; stack chosen is Node/TS for ecosystem synergy.

## Constraints

- **Type**: Tech Stack — TypeScript (Node.js backend + Frontend) for unified development.
- **Type**: Data Format — Pure Markdown + YAML Frontmatter (non-negotiable for portability).
- **Type**: Performance — AI processing must happen in background, never blocking capture.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Local Server Architecture** | Enables background processing, file system access, and future CLI/Desktop clients connecting to same core. | — Pending |
| **Atomic Notes** | Reduces friction (no naming required) and fits "stream of thought" model better than daily notes. | — Pending |
| **YAML Frontmatter** | Standard, portable way to attach metadata without polluting body content. | — Pending |
| **Web Client First** | Fastest path to validation; PWA capabilities can mimic desktop feel. | — Pending |

---
*Last updated: 2026-01-26 after initialization*
