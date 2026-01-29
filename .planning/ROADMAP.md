# Roadmap: NoteTaiker

## Overview

Milestone v1.1 focuses on hardening the AI configuration defaults and polishing the user interface to ensure a distraction-free experience. We are moving from a functional MVP to a resilient, polished tool.

## Milestones

- ✅ **v1.0 MVP** - Phases 1-8 (shipped 2026-01-29)
- 🚧 **v1.1 Fixes & Polish** - Phases 9-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-8) - SHIPPED 2026-01-29</summary>

### Phase 1: Foundation
**Goal**: Project scaffolding and environment setup.
**Plans**: 2 plans

### Phase 2: Core Storage
**Goal**: Implement atomic file storage with SQLite indexing.
**Plans**: 4 plans

### Phase 3: Simple Capture
**Goal**: Basic note creation and viewing.
**Plans**: 3 plans

### Phase 4: AI Pipeline
**Goal**: Background processing for AI tagging.
**Plans**: 4 plans

### Phase 5: UI Refinement
**Goal**: Better stream visualization and editor experience.
**Plans**: 3 plans

### Phase 6: Navigation
**Goal**: Command palette and search.
**Plans**: 3 plans

### Phase 7: Configuration
**Goal**: Settings management for AI providers.
**Plans**: 3 plans

### Phase 8: Final Polish
**Goal**: Bug fixes and deployment readiness.
**Plans**: 4 plans

</details>

### 🚧 v1.1 Fixes & Polish (In Progress)

**Milestone Goal:** Robustify configuration and refine presentation to ensure a polished v1 experience.

#### Phase 9: AI Provider Resilience
**Goal**: AI processing continues even if provider base URLs are left blank by using standard defaults.
**Depends on**: Phase 8
**Requirements**: [AI-FIX-01]
**Success Criteria**:
  1. System processes notes using OpenAI default URL when field is empty.
  2. System processes notes using Anthropic default URL when field is empty.
**Plans**: 1 plan

Plans:
- [ ] 09-01-PLAN.md — Implement default Base URLs and Model Selection

#### Phase 10: Display & Control Polish
**Goal**: Refine note rendering to hide technical metadata and provide universal save shortcuts.
**Depends on**: Phase 9
**Requirements**: [UI-FIX-01, UI-FIX-02]
**Success Criteria**:
  1. Note stream view parses YAML frontmatter and excludes it from the main body display.
  2. User can trigger immediate save using `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (macOS).
**Plans**: 2 plans

Plans:
- [ ] 10-01: Filter frontmatter from note list and detail views
- [ ] 10-02: Implement universal Save shortcut (Ctrl/Cmd + Enter)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-8 | v1.0 | 26/26 | Complete | 2026-01-29 |
| 9 | v1.1 | 0/1 | Not started | - |
| 10 | v1.1 | 0/2 | Not started | - |
