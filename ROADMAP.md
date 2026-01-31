# Roadmap: notetAIker

## Overview

notetAIker will be built as a local-first, AI-enhanced note-taking system. The journey starts with establishing a rock-solid filesystem-based storage engine (Atomic Notes), followed by a high-performance capture interface (sub-100ms readiness). Once core capture and display are stable, we will integrate a background AI worker that enriches notes with automated tags and YAML metadata, finally polishing the system for a seamless v1 release.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Project scaffolding and architecture setup.
- [x] **Phase 2: Storage Engine** - Atomic Markdown file operations and filesystem management.
- [x] **Phase 3: Editor Core** - Instant-capture web interface with Markdown support.
- [x] **Phase 4: Timeline UI** - Reverse-chronological note stream and basic navigation.
- [x] **Phase 5: AI Configuration** - Cloud API key management and settings.
- [x] **Phase 6: AI Processor** - Background worker orchestration for note processing.
- [x] **Phase 7: Smart Tagging** - Automated tag generation and YAML frontmatter injection.
- [x] **Phase 8: V1 Polish** - Performance optimization and final validation.
- [x] **Phase 9: AI Provider Resilience** - Graceful fallbacks for AI configuration.
- [x] **Phase 10: Display & Control Polish** - UI refinements and standardized controls.
- [x] **Phase 11: Graph View** - Visual exploration of notes.
- [ ] **Phase 12: UX Flow Improvements** - Seamless navigation and editing session management.
- [ ] **Phase 13: Manual Tag Control** - User control over tags with intelligent AI preservation.

## Phase Details

### Phase 1: Foundation

**Goal**: Establish the development environment and core system architecture.
**Depends on**: Nothing
**Requirements**: (Infrastructure)
**Success Criteria**:

1. Project initializes with TypeScript and required dependencies.
2. Local development server runs and serves a basic "hello world" state.
3. Environment variables and basic project structure are verified.
   **Plans**: 4 plans

Plans:

- [x] 01-01-PLAN.md — Initialize monorepo and shared configs
- [x] 01-02-PLAN.md — Establish Hono API foundation
- [x] 01-03-PLAN.md — Setup React frontend with Tailwind v4 and RPC
- [x] 01-04-PLAN.md — Configure development tooling (Husky, Changesets)

### Phase 2: Storage Engine

**Goal**: Implement the atomic, timestamp-based filesystem storage logic.
**Depends on**: Phase 1
**Requirements**: [CAPT-03, CONT-01]
**Success Criteria**:

1. System can create a new `.md` file with a timestamped name (e.g., `20260126-120000.md`).
2. Plain text content is correctly written to the local filesystem.
3. Basic file read/write operations are abstracted into a stable service.
   **Plans**: 3 plans

Plans:

- [x] 02-01-PLAN.md — Setup dependencies and environment
- [x] 02-02-PLAN.md — Implement Storage Service (atomic writes/frontmatter)
- [x] 02-03-PLAN.md — Expose Storage API routes

### Phase 3: Editor Core

**Goal**: Create the high-performance capture interface.
**Depends on**: Phase 2
**Requirements**: [CAPT-01, CAPT-02]
**Success Criteria**:

1. User can start typing immediately upon page load (sub-100ms readiness).
2. Markdown characters (e.g., #, \*\*, -) are rendered/handled correctly in the editor.
3. Notes are automatically saved to the storage engine as the user types or on blur.
   **Plans**: 4 plans

Plans:

- [x] 03-01-PLAN.md — Foundation & Theme
- [x] 03-02-PLAN.md — Persistence & Layout
- [x] 03-03-PLAN.md — Markdown UX & Polish
- [x] 03-04-PLAN.md — Gap Closure: Persistence & Theme Fixes

### Phase 4: Timeline UI

**Goal**: Enable users to view and navigate their notes history.
**Depends on**: Phase 3
**Requirements**: [CAPT-04]
**Success Criteria**:

1. User sees a vertical list of notes sorted by most recent first.
2. Note previews show the first few lines of content.
3. Scrolling the timeline is smooth and responsive.
   **Plans**: 2 plans

Plans:

- [x] 04-01-PLAN.md — Implement Timeline data retrieval
- [x] 04-02-PLAN.md — Create Timeline feed components
- [x] 04-03-PLAN.md — Implement Timeline UI with infinite scroll

### Phase 5: AI Configuration

**Goal**: Allow users to securely manage their AI service credentials.
**Depends on**: Phase 1
**Requirements**: [AI-04]
**Success Criteria**:

1. User can enter and save OpenAI or Anthropic API keys via the UI.
2. API keys are stored securely (local configuration file).
3. System validates the keys (simple connectivity check).
   **Plans**: 4 plans

Plans:

- [x] 05-01-PLAN.md — Implement backend secrets service and settings routes
- [x] 05-02-PLAN.md — Implement AI credential validation endpoints
- [x] 05-03-PLAN.md — Create Settings UI shell and provider forms
- [x] 05-04-PLAN.md — Integrate Settings UI with backend (save/test)

### Phase 6: AI Processor

**Goal**: Orchestrate background processing for newly created notes.
**Depends on**: Phase 4, Phase 5
**Requirements**: [AI-01]
**Success Criteria**:

1. New notes trigger a background processing job without blocking the UI.
2. Processing status (queued, working, complete) is tracked by the system.
3. The worker handles failures and retries gracefully.
   **Plans**: 3 plans

Plans:

- [x] 06-01-PLAN.md: Implement background job queue/worker
- [x] 06-02-PLAN.md: Link file creation events to AI worker
- [x] 06-03-PLAN.md: Implement real-time SSE updates

### Phase 7: Smart Tagging

**Goal**: Implement automated organization via AI-generated metadata.
**Depends on**: Phase 6
**Requirements**: [AI-02, AI-03]
**Success Criteria**:

1. AI successfully generates 2-5 relevant tags for a given note's content.
2. Generated tags are injected into the file's YAML frontmatter.
3. Note files maintain standard Markdown compatibility after metadata injection.
   **Plans**: 3 plans

Plans:

- [x] 07-01-PLAN.md: Integrate LLM prompts for tag generation
- [x] 07-02-PLAN.md: Implement YAML frontmatter parser/injector
- [x] 07-03-PLAN.md: Display tags in NoteCard UI

### Phase 8: V1 Polish

**Goal**: Finalize performance and UX for the initial release.
**Depends on**: Phase 7
**Requirements**: [CAPT-01 Validation]
**Success Criteria**:

1. Cold start to typing readiness consistently meets the 100ms target.
2. User can search/filter notes by the newly generated tags.
3. End-to-end "Capture -> Tag -> View" workflow is seamless.
   **Plans**: 2 plans

Plans:

- [x] 08-01-PLAN.md: Performance profiling and optimization (Indexer)
- [x] 08-02-PLAN.md: UI/UX refinement (Command Palette)

### Phase 9: AI Provider Resilience

**Goal**: Ensure AI features fail gracefully when providers are misconfigured.
**Depends on**: Phase 5
**Requirements**: [AI-FIX-01]
**Success Criteria**:

1. System uses default provider Base URL when user leaves it empty.
2. Settings UI shows default URLs as placeholders.
   **Plans**: 1 plan

Plans:

- [x] 09-01-PLAN.md: Implement resilient configuration defaults

### Phase 10: Display & Control Polish

**Goal**: Refine note rendering and standardize controls.
**Depends on**: Phase 8
**Requirements**: [UI-FIX-01, UI-FIX-02]
**Success Criteria**:

1. Note view parses frontmatter and excludes it from body rendering.
2. User can save note using `Ctrl+Enter` shortcut.
   **Plans**: 2 plans

Plans:

- [x] 10-01-PLAN.md: Implement metadata toggle and frontmatter stripping
- [x] 10-02-PLAN.md: Standardize save shortcut

### Phase 11: Graph View

**Goal**: Visual exploration of notes via a force-directed graph based on tags and links.
**Depends on**: Phase 10
**Requirements**: [GRAPH-01, GRAPH-02]
**Success Criteria**:

1. User can view a graph visualization of their notes.
2. Nodes represent notes; edges represent shared tags.
   **Plans**: 3 plans

Plans:

- [x] 11-01-PLAN.md: Setup Infrastructure and Data Transformation
- [x] 11-02-PLAN.md: Core Graph Visualization
- [x] 11-03-PLAN.md: Note Side Panel and Navigation

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> ... -> 11

| Phase               | Plans Complete | Status   | Completed  |
| ------------------- | -------------- | -------- | ---------- |
| 1. Foundation       | 4/4            | Complete | 2026-01-26 |
| 2. Storage Engine   | 3/3            | Complete | 2026-01-27 |
| 3. Editor Core      | 4/4            | Complete | 2026-01-27 |
| 4. Timeline UI      | 3/3            | Complete | 2026-01-27 |
| 5. AI Configuration | 4/4            | Complete | 2026-01-28 |
| 6. AI Processor     | 3/3            | Complete | 2026-01-28 |
| 7. Smart Tagging    | 3/3            | Complete | 2026-01-29 |
| 8. V1 Polish        | 2/2            | Complete | 2026-01-29 |
| 9. AI Resilience    | 1/1            | Complete | 2026-01-29 |
| 10. Display Polish  | 2/2            | Complete | 2026-01-30 |
| 11. Graph View      | 3/3            | Complete | 2026-01-30 |
