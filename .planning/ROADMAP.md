# Roadmap: NoteTaiker

## Overview

NoteTaiker will be built as a local-first, AI-enhanced note-taking system. The journey starts with establishing a rock-solid filesystem-based storage engine (Atomic Notes), followed by a high-performance capture interface (sub-100ms readiness). Once core capture and display are stable, we will integrate a background AI worker that enriches notes with automated tags and YAML metadata, finally polishing the system for a seamless v1 release.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation** - Project scaffolding and architecture setup.
- [x] **Phase 2: Storage Engine** - Atomic Markdown file operations and filesystem management.
- [x] **Phase 3: Editor Core** - Instant-capture web interface with Markdown support.
- [ ] **Phase 4: Timeline UI** - Reverse-chronological note stream and basic navigation.
- [x] **Phase 5: AI Configuration** - Cloud API key management and settings.
- [x] **Phase 6: AI Processor** - Background worker orchestration for note processing.
- [ ] **Phase 7: Smart Tagging** - Automated tag generation and YAML frontmatter injection.
- [ ] **Phase 8: V1 Polish** - Performance optimization and final validation.

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
- [ ] 01-01-PLAN.md — Initialize monorepo and shared configs
- [ ] 01-02-PLAN.md — Establish Hono API foundation
- [ ] 01-03-PLAN.md — Setup React frontend with Tailwind v4 and RPC
- [ ] 01-04-PLAN.md — Configure development tooling (Husky, Changesets)

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
- [ ] 02-01-PLAN.md — Setup dependencies and environment
- [ ] 02-02-PLAN.md — Implement Storage Service (atomic writes/frontmatter)
- [ ] 02-03-PLAN.md — Expose Storage API routes

### Phase 3: Editor Core
**Goal**: Create the high-performance capture interface.
**Depends on**: Phase 2
**Requirements**: [CAPT-01, CAPT-02]
**Success Criteria**:
  1. User can start typing immediately upon page load (sub-100ms readiness).
  2. Markdown characters (e.g., #, **, -) are rendered/handled correctly in the editor.
  3. Notes are automatically saved to the storage engine as the user types or on blur.
**Plans**: 4 plans

Plans:
- [ ] 03-01-PLAN.md — Foundation & Theme
- [ ] 03-02-PLAN.md — Persistence & Layout
- [ ] 03-03-PLAN.md — Markdown UX & Polish
- [ ] 03-04-PLAN.md — Gap Closure: Persistence & Theme Fixes

### Phase 4: Timeline UI
**Goal**: Enable users to view and navigate their notes history.
**Depends on**: Phase 3
**Requirements**: [CAPT-04]
**Success Criteria**:
  1. User sees a vertical list of notes sorted by most recent first.
  2. Note previews show the first few lines of content.
  3. Scrolling the timeline is smooth and responsive.
**Plans**: 3 plans

Plans:
- [ ] 04-01-PLAN.md — Implement Timeline data retrieval
- [ ] 04-02-PLAN.md — Setup TanStack Query and useTimeline hook
- [ ] 04-03-PLAN.md — Create Timeline UI components and integrate

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
- [x] 05-01-PLAN.md — Create settings UI for API configuration
- [x] 05-02-PLAN.md — Implement secure local storage for secrets
- [x] 05-03-PLAN.md — Implement masked input and form handling
- [x] 05-04-PLAN.md — E2E Integration plan

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
- [ ] 06-01-PLAN.md — Persistent Queue with SQLite
- [ ] 06-02-PLAN.md — Background Worker Orchestration
- [ ] 06-03-PLAN.md — Real-time Updates (SSE) & UI Polish

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
- [ ] 07-01-PLAN.md — Implement AIService for tag generation
- [ ] 07-02-PLAN.md — Integrate tagging with Worker and Storage
- [ ] 07-03-PLAN.md — Display tags in the Timeline UI

### Phase 8: V1 Polish
**Goal**: Finalize performance and UX for the initial release.
**Depends on**: Phase 7
**Requirements**: [CAPT-01 Validation]
**Success Criteria**:
  1. Cold start to typing readiness consistently meets the 100ms target.
  2. User can search/filter notes by the newly generated tags.
  3. End-to-end "Capture -> Tag -> View" workflow is seamless.
**Plans**: TBD

Plans:
- [ ] 08-01: Performance profiling and optimization
- [ ] 08-02: UI/UX refinement and final bug fixes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete | 2026-01-26 |
| 2. Storage Engine | 3/3 | Complete | 2026-01-27 |
| 3. Editor Core | 4/4 | Complete | 2026-01-27 |
| 4. Timeline UI | 0/2 | Not started | - |
| 5. AI Configuration | 4/4 | Complete | 2026-01-28 |
| 6. AI Processor | 3/3 | Complete | 2026-01-28 |
| 7. Smart Tagging | 0/3 | Not started | - |
| 8. V1 Polish | 0/2 | Not started | - |
