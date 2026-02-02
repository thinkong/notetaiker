# Roadmap: notetAIker

## Overview

notetAIker will be built as a local-first, AI-enhanced note-taking system. The journey starts with establishing a rock-solid filesystem-based storage engine (Atomic Notes), followed by a high-performance capture interface (sub-100ms readiness). Once core capture and display are stable, we will integrate a background AI worker that enriches notes with automated tags and YAML metadata, finally polishing the system for a seamless v1 release.

## Milestones

- ✅ **v1.0 MVP** - Phases 1-8 (shipped 2026-01-29)
- ✅ **v1.1 Fixes & Polish** - Phases 9-10 (shipped 2026-01-30)
- ✅ **v1.2 Graph View** - Phase 11 (shipped 2026-01-30)
- ✅ **v1.3 UX Polish & Flow** - Phases 12-13 (shipped 2026-01-31)
- ✅ **v1.3.1 Patch Fixes** - Phase 14 (shipped 2026-01-31)
- 🚧 **v1.4 UX Refinement** - Phases 15-16 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-8) - SHIPPED 2026-01-29</summary>

- [x] Phase 1: Foundation (2/2 plans)
- [x] Phase 2: Core Storage (4/4 plans)
- [x] Phase 3: Simple Capture (3/3 plans)
- [x] Phase 4: AI Pipeline (4/4 plans)
- [x] Phase 5: UI Refinement (3/3 plans)
- [x] Phase 6: Navigation (3/3 plans)
- [x] Phase 7: Configuration (3/3 plans)
- [x] Phase 8: Final Polish (4/4 plans)

</details>

<details>
<summary>✅ v1.1 Fixes & Polish (Phases 9-10) - SHIPPED 2026-01-30</summary>

- [x] Phase 9: AI Provider Resilience (1/1 plan)
- [x] Phase 10: Display & Control Polish (2/2 plans)

</details>

<details>
<summary>✅ v1.2 Graph View (Phase 11) - SHIPPED 2026-01-30</summary>

- [x] Phase 11: Graph View (3/3 plans)

</details>

<details>
<summary>✅ v1.3 UX Polish & Flow (Phases 12-13) - SHIPPED 2026-01-31</summary>

- [x] Phase 12: UX Flow Improvements (4/4 plans)
- [x] Phase 13: Manual Tag Control (3/3 plans)

</details>

<details>
<summary>✅ v1.3.1 Patch Fixes (Phase 14) - SHIPPED 2026-01-31</summary>

- [x] Phase 14: Stability & UI Polish (2/2 plans)

</details>

### 🚧 v1.4 UX Refinement (In Progress)

**Milestone Goal:** Improve editor flow with explicit creation, smarter navigation guards, and history integration.

#### Phase 15: History Integration & Fresh Capture
**Goal**: Users can move fluidly between new capture and historical notes.
**Depends on**: Phase 14
**Requirements**: [UX-04, UX-06]
**Success Criteria**:
1. User can click a "New Note" button to reset the editor state and clear all content and tags.
2. User can click any note in the history sidebar to populate the editor with its content and metadata.
3. The UI clearly distinguishes between a "Draft" (new note) and "Editing" (existing note) state.
**Plans**: 3/3 plans
- [x] 15-01-PLAN.md — Core Mode State & Fresh Capture
- [x] 15-02-PLAN.md — Sidebar Integration & Note Loading
- [x] 15-03-PLAN.md — Mode Visuals & Shortcuts

#### Phase 16: Intelligent Navigation Guarding
**Goal**: Users are protected from data loss without being interrupted by unnecessary prompts.
**Depends on**: Phase 15
**Requirements**: [UX-05]
**Success Criteria**:
1. Navigation guard (browser/app) triggers ONLY when the user attempts to move away from a note with unsaved changes.
2. Guard remains silent when navigating away from an empty new note or a note that matches its last saved state.
3. The "Smart Dirty Check" accounts for both the body content and manual tag changes.
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-8   | v1.0      | 26/26          | Complete | 2026-01-29 |
| 9-10  | v1.1      | 3/3            | Complete | 2026-01-30 |
| 11    | v1.2      | 3/3            | Complete | 2026-01-30 |
| 12-13 | v1.3      | 7/7            | Complete | 2026-01-31 |
| 14    | v1.3.1    | 2/2            | Complete | 2026-01-31 |
| 15    | v1.4      | 3/3            | Complete | 2026-02-02 |
| 16    | v1.4      | 0/TBD          | Not started | - |
