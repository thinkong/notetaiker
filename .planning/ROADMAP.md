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
- [ ] **v1.6 Smart Connections** - Phases 19-20 (planned)

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

<details open>
<summary>⏳ v1.6 Smart Connections (Phases 19-20) - IN PROGRESS</summary>

- [x] **Phase 19: Embeddings Infrastructure**
  - **Goal**: System automatically generates and stores vector embeddings for all notes locally.
  - **Success Criteria**:
    1. New notes automatically trigger embedding generation in the background using Ollama (`nomic-embed-text`).
    2. Embeddings are stored in the local SQLite database via `sqlite-vec`.
    3. System detects significant content changes (via hash) to update embeddings efficiently.
    4. User can trigger a full "Rebuild Index" from settings.
- [ ] **Phase 20: Related Notes Feature**
  - **Goal**: Users can discover semantically related notes while viewing or editing a note.
  - **Success Criteria**:
    1. "Related Notes" panel displays top 5-10 semantically similar notes in the sidebar.
    2. Panel updates automatically (debounced) as the current note context changes.
    3. Clicking a related note navigates to that note instantly.
    4. Similarity levels (e.g., "High/Medium") are visually indicated rather than raw scores.

</details>

## Progress

| Phase | Milestone | Plans Complete | Status      | Completed  |
| ----- | --------- | -------------- | ----------- | ---------- |
| 1-8   | v1.0      | 26/26          | Complete    | 2026-01-29 |
| 9-10  | v1.1      | 3/3            | Complete    | 2026-01-30 |
| 11    | v1.2      | 3/3            | Complete    | 2026-01-30 |
| 12-13 | v1.3      | 7/7            | Complete    | 2026-01-31 |
| 14    | v1.3.1    | 2/2            | Complete    | 2026-01-31 |
| 15-18 | v1.4      | 7/7            | Complete    | 2026-02-03 |
| Q006-007 | v1.5   | 2/2 tasks      | Complete    | 2026-02-06 |
| 19    | v1.6      | 0/1            | Planned     | -          |
| 20    | v1.6      | 0/1            | Planned     | -          |
