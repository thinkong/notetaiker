# NoteTaiker

## What This Is

A local-first, AI-enhanced note-taking system designed for zero-friction capture. Users can "input anything" (text, images, code, links) into a stream of atomic Markdown files, while a background AI agent automatically organizes content by generating relevant tags in YAML frontmatter.

## Core Value

Zero-friction capture with intelligent, automated organization. The user just types; the system handles the sorting.

## Current Milestone: v1.1 Fixes & Polish

**Goal:** robustify configuration and refine presentation to ensure a polished v1 experience.

**Target features:**
- **Robust AI Config:** Default to standard Base URLs if unspecified (don't fail on empty).
- **Clean Note Rendering:** Hide/parse YAML frontmatter in note views (don't render as body text).

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

### Active

- [ ] **AI-FIX-01**: System uses default provider Base URL when user leaves it empty
- [ ] **UI-FIX-01**: Note view parses frontmatter and excludes it from body rendering

### Out of Scope

- **Graph View**: Deferred to v2 (focus on capture and list retrieval first).
- **Desktop/CLI Apps**: Deferred to future milestones (Web first).
- **Hosted Service**: Deferred (local-first focus for v1).
- **Complex Editors**: No WYSIWYG for v1 (Markdown only).

## Context

Shipped v1.0 MVP with ~3000 LOC TypeScript.
Tech stack: Hono (Node.js), React 19, Tailwind v4, SQLite, CodeMirror 6.
Performance: <100ms TTI, <5ms note listing via SQLite index.

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

---

_Last updated: 2026-01-29 after v1.0 milestone (started v1.1)_
