# Roadmap: NoteTaiker

## Overview

NoteTaiker will be built as a local-first, AI-enhanced note-taking system. The journey starts with establishing a rock-solid filesystem-based storage engine (Atomic Notes), followed by a high-performance capture interface (sub-100ms readiness). Once core capture and display are stable, we will integrate a background AI worker that enriches notes with automated tags and YAML metadata, finally polishing the system for a seamless v1 release.

## Phases

- [x] **Phase 1: Foundation** - Project scaffolding and architecture setup.
- [x] **Phase 2: Storage Engine** - Atomic Markdown file operations and filesystem management.
- [x] **Phase 3: Editor Core** - Instant-capture web interface with Markdown support.
- [x] **Phase 4: Timeline UI** - Reverse-chronological note stream and basic navigation.
- [x] **Phase 5: AI Configuration** - Cloud API key management and settings.
- [x] **Phase 6: AI Processor** - Background worker orchestration for note processing.
- [x] **Phase 7: Smart Tagging** - Automated tag generation and YAML frontmatter injection.
- [x] **Phase 8: V1 Polish** - Performance optimization and final validation.

## Phase Details

### Phase 1: Foundation
- [x] 01-01-PLAN.md — Initialize monorepo and shared configs
- [x] 01-02-PLAN.md — Establish Hono API foundation
- [x] 01-03-PLAN.md — Setup React frontend with Tailwind v4 and RPC
- [x] 01-04-PLAN.md — Configure development tooling (Husky, Changesets)

### Phase 2: Storage Engine
- [x] 02-01-PLAN.md — Setup dependencies and environment
- [x] 02-02-PLAN.md — Implement Storage Service (atomic writes/frontmatter)
- [x] 02-03-PLAN.md — Expose Storage API routes

### Phase 3: Editor Core
- [x] 03-01-PLAN.md — Foundation & Theme
- [x] 03-02-PLAN.md — Persistence & Layout
- [x] 03-03-PLAN.md — Markdown UX & Polish
- [x] 03-04-PLAN.md — Gap Closure: Persistence & Theme Fixes

### Phase 4: Timeline UI
- [x] 04-01-PLAN.md — Implement Timeline data retrieval
- [x] 04-02-PLAN.md — Setup TanStack Query and useTimeline hook
- [x] 04-03-PLAN.md — Create Timeline UI components and integrate

### Phase 5: AI Configuration
- [x] 05-01-PLAN.md — Create settings UI for API configuration
- [x] 05-02-PLAN.md — Implement secure local storage for secrets
- [x] 05-03-PLAN.md — Implement masked input and form handling
- [x] 05-04-PLAN.md — E2E Integration plan

### Phase 6: AI Processor
- [x] 06-01-PLAN.md — Persistent Queue with SQLite
- [x] 06-02-PLAN.md — Background Worker Orchestration
- [x] 06-03-PLAN.md — Real-time Updates (SSE) & UI Polish

### Phase 7: Smart Tagging
- [x] 07-01-PLAN.md — Implement AIService for tag generation
- [x] 07-02-PLAN.md — Integrate tagging with Worker and Storage
- [x] 07-03-PLAN.md — Display tags in the Timeline UI

### Phase 8: V1 Polish
- [x] 08-01: Performance profiling and optimization
- [x] 08-02: UI/UX refinement and final bug fixes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete | 2026-01-26 |
| 2. Storage Engine | 3/3 | Complete | 2026-01-27 |
| 3. Editor Core | 4/4 | Complete | 2026-01-27 |
| 4. Timeline UI | 3/3 | Complete | 2026-01-27 |
| 5. AI Configuration | 4/4 | Complete | 2026-01-28 |
| 6. AI Processor | 3/3 | Complete | 2026-01-28 |
| 7. Smart Tagging | 3/3 | Complete | 2026-01-29 |
| 8. V1 Polish | 2/2 | Complete | 2026-01-29 |
