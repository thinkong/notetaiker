# NoteTaiker

## What This Is

A local-first, AI-enhanced note-taking system designed for zero-friction capture. Users can "input anything" (text, images, code, links) into a stream of atomic Markdown files, while a background AI agent automatically organizes content by generating relevant tags in YAML frontmatter.

## Core Value

Zero-friction capture with intelligent, automated organization. The user just types; the system handles the sorting.

## Current Milestone: v1.2 Graph View (Complete)

**Goal:** Provide visual exploration of notes via a force-directed graph.

**Target features:**
- **Graph Visualization:** Interactive 2D graph of notes and tags.
- **Node Navigation:** Click nodes to view content in a side panel.

## Requirements

### Validated

- ✓ **CAPT-01**: User can open app and type within 100ms (Instant Capture) — v1.0
- ✓ **CAPT-02**: User can edit notes in standard Markdown — v1.0
- ✓ **CAPT-03**: Notes are saved automatically as timestamped atomic files — v1.0
- ✓ **CAPT-04**: User can view recent notes in a reverse-chronological stream — v1.0
- ✓ **AI-01**: New notes are automatically processed by AI in the background — v1.0
- ✓ **AI-02**: AI generates tags based on note content — v1.0
- ✓ **AI-03**: Tags are saved to the file's YAML frontmatter — v1.0
- ✓ **AI-04**: User can configure Cloud API keys (OpenAI/Anthropic) — v1.0
- ✓ **CONT-01**: User can capture plain text notes — v1.0
- ✓ **AI-FIX-01**: System uses default provider Base URL when user leaves it empty — v1.1
- ✓ **UI-FIX-01**: Note view parses frontmatter and excludes it from body rendering — v1.1
- ✓ **UI-FIX-02**: User can save note using `Ctrl+Enter` shortcut — v1.1
- ✓ **GRAPH-01**: User can view notes in a force-directed graph — v1.2
- ✓ **GRAPH-02**: Links between notes are visualized as edges — v1.2

### Active

- None (Milestone complete)

### Out of Scope

- **Desktop/CLI Apps**: Deferred to future milestones (Web first).
- **Hosted Service**: Deferred (local-first focus for v1).
- **Complex Editors**: No WYSIWYG for v1 (Markdown only).

## Context

Shipped v1.0 MVP with ~3000 LOC TypeScript.
Completed v1.1 (Fixes) and v1.2 (Graph View).
Tech stack: Hono (Node.js), React 19, Tailwind v4, SQLite, CodeMirror 6, React Force Graph.

## Constraints

- **Type**: Tech Stack — TypeScript (Node.js backend + Frontend) for unified development.
- **Type**: Data Format — Pure Markdown + YAML Frontmatter (non-negotiable for portability).
- **Type**: Performance — AI processing must happen in background, never blocking capture.

## Key Decisions

| Decision                      | Rationale                                                                                                  | Outcome       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------- |
| **Local Server Architecture** | Enables background processing, file system access, and future CLI/Desktop clients connecting to same core. | ✓ Good (v1.0) |
| **Atomic Notes**              | Reduces friction (no naming required) and fits "stream of thought" model better than daily notes.          | ✓ Good (v1.0) |
| **YAML Frontmatter**          | Standard, portable way to attach metadata without polluting body content.                                  | ✓ Good (v1.0) |
| **Web Client First**          | Fastest path to validation; PWA capabilities can mimic desktop feel.                                       | ✓ Good (v1.0) |
| **Local Mirror Pattern**      | Store full note content in SQLite index for <5ms listing performance.                                      | ✓ Good (v1.0) |
| **Separate Index DB**         | Placed metadata index in its own database (index.db) to decouple from the task queue.                      | ✓ Good (v1.0) |
| **Immediate-feedback-save**   | Bypass debounce for Cmd+Enter to ensure user data safety.                                                  | ✓ Good (v1.0) |
| **Graph Visualization**       | Used `react-force-graph-2d` for performance and Canvas rendering for scalability.                         | ✓ Good (v1.2) |

---

_Last updated: 2026-01-30 after v1.2 milestone (Graph View)_
