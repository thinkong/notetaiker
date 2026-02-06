# Roadmap: notetAIker

## Overview

notetAIker will be built as a local-first, AI-enhanced note-taking system. The journey starts with establishing a rock-solid filesystem-based storage engine (Atomic Notes), followed by a high-performance capture interface (sub-100ms readiness). Once core capture and display are stable, we will integrate a background AI worker that enriches notes with automated tags and YAML metadata, finally polishing the system for a seamless v1 release.

## Milestones

- ✅ **v1.0 MVP** - Phases 1-8 (shipped 2026-01-29)
- ✅ **v1.1 Fixes & Polish** - Phases 9-10 (shipped 2026-01-30)
- ✅ **v1.2 Graph View** - Phase 11 (shipped 2026-01-30)
- ✅ **v1.3 UX Polish & Flow** - Phases 12-13 (shipped 2026-01-31)
- ✅ **v1.3.1 Patch Fixes** - Phase 14 (shipped 2026-01-31)
- ✅ **v1.4 UX Refinement** - Phases 15-18 (shipped 2026-02-03)
- ✅ **v1.5 AI Enhancements** - Quick tasks 006-007 (shipped 2026-02-06)
- ✅ **v1.6 Smart Connections** - Phases 19-20 (shipped 2026-02-06)
- 🚧 **v1.7 Graph Interactions** - Phases 21-24 (planned)

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

<details>
<summary>✅ v1.4 UX Refinement (Phases 15-18) - SHIPPED 2026-02-03</summary>

- [x] Phase 15: History Integration & Fresh Capture (3/3 plans)
- [x] Phase 16: Intelligent Navigation Guarding (2/2 plans)
- [x] Phase 17: Smart Guard Integration Fix (1/1 plan)
- [x] Phase 18: UI Polish (Pulse Animation) (1/1 plan)

</details>

<details>
<summary>✅ v1.5 AI Enhancements (Quick Tasks) - SHIPPED 2026-02-06</summary>

- [x] Quick 006: Automated Title Generation
- [x] Quick 007: Preview Toggle Button
- [x] Infrastructure: Local Ollama Integration
- [x] Infrastructure: Docker GPU Support

</details>

<details>
<summary>✅ v1.6 Smart Connections (Phases 19-20) - SHIPPED 2026-02-06</summary>

- [x] **Phase 19: Embeddings Infrastructure**
  - **Goal**: System automatically generates and stores vector embeddings for all notes locally.
  - **Success Criteria**:
    1. New notes automatically trigger embedding generation in the background using Ollama (`nomic-embed-text`).
    2. Embeddings are stored in the local SQLite database via `sqlite-vec`.
    3. System detects significant content changes (via hash) to update embeddings efficiently.
    4. User can trigger a full "Rebuild Index" from settings.
- [x] **Phase 20: Related Notes Feature**
  - **Goal**: Users can discover semantically related notes while viewing or editing a note.
  - **Plans**: 3 plans
    - [x] 20-01-PLAN.md — Backend API for similarity search
    - [x] 20-02-PLAN.md — Related Notes sidebar component
    - [x] 20-03-PLAN.md — UX Polish, debouncing, and labels
  - **Success Criteria**:
    1. "Related Notes" panel displays top 5-10 semantically similar notes in the sidebar.
    2. Panel updates automatically (debounced) as the current note context changes.
    3. Clicking a related note navigates to that note instantly.
    4. Similarity levels (e.g., "High/Medium") are visually indicated rather than raw scores.

</details>

### 🚧 v1.7 Graph Interactions (Planned)

**Milestone Goal:** Transform the static graph view into an interactive workspace for organizing thoughts.

#### Phase 21: Graph Navigation & Tooltips

**Goal**: Users can smoothly explore the graph and navigate to notes with rich context.
**Depends on**: Phase 11
**Requirements**: NAV-01, NAV-02, NAV-03
**Success Criteria**:

1. User can hover over any node to see a tooltip containing the note title and a 2-line content excerpt.
2. User can double-click a node to load that note into the editor instantly.
3. User can click a node once to highlight its direct connections while dimming the rest of the graph.
4. User can pan and zoom the canvas smoothly without physics "jitter" or stuttering.
   **Plans**: 2 plans

- [x] 21-01-PLAN.md — Graph persistence & deep linking
- [x] 21-02-PLAN.md — Advanced interactions & tooltips

#### Phase 22: Graph Filtering & Local View

**Goal**: Users can reduce noise and focus on specific sub-sections of their knowledge base.
**Depends on**: Phase 21
**Requirements**: FILT-01, FILT-02
**Success Criteria**:

1. User can select one or more tags from a filter menu to hide all notes without those tags.
2. User can toggle a "Local Graph" view that isolates the active note and its immediate neighbors (1-2 hops).
   **Plans**: 3 plans

- [x] 22-01-PLAN.md — Graph State & Rendering Infrastructure
- [x] 22-02-PLAN.md — Filtering UI Components
- [x] 22-03-PLAN.md — Integration & Global Interactions

#### Phase 23: Spatial Interaction & Linking

**Goal**: Users can manually organize the graph and use it as a creative source for the editor.
**Depends on**: Phase 22
**Requirements**: INTER-01, INTER-02
**Success Criteria**:

1. User can drag a node from the graph and drop it into the editor to automatically insert a `[[WikiLink]]`.
2. User can manually position a node and pin it so its location persists between sessions.
   **Plans**: TBD

#### Phase 24: Semantic Graph Intelligence

**Goal**: Leverage vector embeddings to reveal conceptual relationships visually.
**Depends on**: Phase 23, Phase 19
**Requirements**: SMART-01, SMART-02
**Success Criteria**:

1. User can enable "Semantic Coloring" to see nodes grouped by topic clusters (hued by similarity).
2. User can filter the graph to show only nodes semantically similar to the active note.
   **Plans**: TBD

## Progress

| Phase    | Milestone | Plans Complete | Status      | Completed  |
| -------- | --------- | -------------- | ----------- | ---------- |
| 1-8      | v1.0      | 26/26          | Complete    | 2026-01-29 |
| 9-10     | v1.1      | 3/3            | Complete    | 2026-01-30 |
| 11       | v1.2      | 3/3            | Complete    | 2026-01-30 |
| 12-13    | v1.3      | 7/7            | Complete    | 2026-01-31 |
| 14       | v1.3.1    | 2/2            | Complete    | 2026-01-31 |
| 15-18    | v1.4      | 7/7            | Complete    | 2026-02-03 |
| Q006-007 | v1.5      | 2/2 tasks      | Complete    | 2026-02-06 |
| 19       | v1.6      | 3/3            | Complete    | 2026-02-06 |
| 20       | v1.6      | 3/3            | Complete    | 2026-02-06 |
| 21       | v1.7      | 2/2            | Complete    | 2026-02-06 |
| 22       | v1.7      | 3/3            | Complete    | 2026-02-06 |
| 23       | v1.7      | 0/TBD          | Not started | -          |
| 24       | v1.7      | 0/TBD          | Not started | -          |
