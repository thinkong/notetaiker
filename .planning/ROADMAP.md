# Roadmap: notetAIker

## Overview

notetAIker will be built as a local-first, AI-enhanced note-taking system. The journey starts with establishing a rock-solid filesystem-based storage engine (Atomic Notes), followed by a high-performance capture interface (sub-100ms readiness). Once core capture and display are stable, we will integrate a background AI worker that enriches notes with automated tags and YAML metadata, finally polishing the system for a seamless v1 release.

## Milestones

- ✅ **v1.0 MVP** - Phases 1-8 (shipped 2026-01-29)
- ✅ **v1.1 Fixes & Polish** - Phases 9-10 (shipped 2026-01-30)
- ✅ **v1.2 Graph View** - Phase 11 (shipped 2026-01-30)
- 🚧 **v1.3 UX Polish & Flow** - Phases 12-13 (in progress)

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

### ✅ v1.3 UX Polish & Flow (In Progress)

**Milestone Goal:** Improve user experience with better navigation, manual controls, and smoother editing flow.

#### ✅ Phase 12: UX Flow Improvements
**Goal**: Seamless navigation and editing session management
**Depends on**: Phase 11
**Requirements**: UX-01, UX-02, UX-03
**Success Criteria** (what must be TRUE):
  1. User can click any note in the side panel and see its content load into the main editor
  2. User can save a note with Cmd+Enter and immediately start a fresh note without manual clearing
  3. Editor placeholder text disappears the moment user clicks into the editor field
  4. Navigation between notes feels instant and intentional (no accidental state preservation)

**Plans**: 4 plans

Plans:
- [x] 12-01-PLAN.md — Foundation hooks and UI components (draft persistence, unsaved changes, toast, confirm dialog)
- [x] 12-02-PLAN.md — Note preview overlay and editor focus control
- [x] 12-03-PLAN.md — Save-and-reset flow integration with draft management
- [x] 12-04-PLAN.md — Complete note navigation with human verification

#### 🚧 Phase 13: Manual Tag Control
**Goal**: User control over tags with intelligent AI preservation
**Depends on**: Phase 12
**Requirements**: TAG-01, TAG-02, TAG-03
**Success Criteria** (what must be TRUE):
  1. User can type hashtags (e.g., #work, #personal) directly in note body during creation
  2. System clearly distinguishes between user-defined tags and AI-generated tags in frontmatter metadata
  3. When AI re-processes a note, user-defined tags remain untouched while AI tags update
  4. User can inspect note frontmatter and identify which tags came from AI vs manual input

**Plans**: TBD

Plans:
- [ ] 13-01: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-8 | v1.0 | 26/26 | Complete | 2026-01-29 |
| 9-10 | v1.1 | 3/3 | Complete | 2026-01-30 |
| 11 | v1.2 | 3/3 | Complete | 2026-01-30 |
| 12. UX Flow Improvements | v1.3 | 4/4 | Complete | 2026-01-30 |
| 13. Manual Tag Control | v1.3 | 0/? | Not started | - |
