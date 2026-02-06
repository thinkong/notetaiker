---
phase: quick-006
plan: 01
subsystem: api
tags: [ai, markdown, worker, llm]

# Dependency graph
requires:
  - phase: 005
    provides: "Manual tags and display AI tags in editor"
provides:
  - "Automated title generation for notes without headers"
  - "Markdown header extraction utility"
  - "LLM-powered title generation service"
affects: [ui, sidebar]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Background metadata enrichment during worker processing"]

key-files:
  created: []
  modified:
    - apps/api/src/lib/markdown.ts
    - apps/api/src/services/ai.service.ts
    - apps/api/src/services/worker.service.ts
    - apps/api/src/lib/markdown.test.ts
    - apps/api/src/services/ai.service.test.ts
    - apps/api/src/services/worker.service.test.ts

key-decisions:
  - "Store AI-generated titles in frontmatter (metadata.title) for consistency with user-defined titles."
  - "Prefer markdown headers (#) as titles if present, falling back to LLM generation only if both metadata.title and header are missing."
  - "Limited AI-generated titles to 60 characters for UI compatibility in sidebar and graph views."

patterns-established:
  - "Pattern: Extracting content-based metadata before falling back to AI generation to reduce LLM calls and honor user intent."

# Metrics
duration: 5m
completed: 2026-02-05
---

# Quick Task 006: Automated Title Generation Summary

**Automated title generation using LLM for notes lacking headers, integrated into the background worker with header extraction fallback.**

## Performance

- **Duration:** 5m
- **Started:** 2026-02-05T05:55:20Z
- **Completed:** 2026-02-05T06:00:25Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Implemented `extractFirstHeader` utility to reliably identify markdown headers as titles.
- Added `generateTitle` method to `AIService` leveraging the Vercel AI SDK for concise title generation.
- Integrated title generation into the background `WorkerService`, ensuring all notes get a title during indexing.
- Enhanced test coverage for markdown utilities, AI service, and worker integration.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add extractFirstHeader utility and generateTitle method** - `2292ee7` (feat)
2. **Task 2: Integrate title generation in worker service** - `6dd8463` (feat)
3. **Task 3: Add test coverage for title generation workflow** - `2fc217a` (test)

## Files Created/Modified

- `apps/api/src/lib/markdown.ts` - Added `extractFirstHeader` function.
- `apps/api/src/services/ai.service.ts` - Added `generateTitle` using LLM.
- `apps/api/src/services/worker.service.ts` - Integrated title generation in background processing.
- `apps/api/src/lib/markdown.test.ts` - Added tests for header extraction.
- `apps/api/src/services/ai.service.test.ts` - Added tests for AI title generation and updated mocks.
- `apps/api/src/services/worker.service.test.ts` - Added integration tests for title generation logic.

## Decisions Made

- AI titles are stored in the `title` field of frontmatter. This ensures that once a title is generated (or extracted from a header at first process), it stays stable unless the user manually changes it.
- Existing titles in metadata are strictly preserved.
- The worker logic was updated to check for title existence _before_ processing, similar to how it handles AI processing flags.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **AI Service Mocking:** The existing tests used `generateObject` while the new code and some existing logic were using `generateText`. Updated the test mocks to support both patterns and properly reset mocks between tests to avoid interference.

## User Setup Required

None - no external service configuration required beyond existing AI provider keys.

## Next Phase Readiness

- Core metadata enrichment (tags and titles) is now robust.
- Ready for further UI enhancements that rely on reliable note titles (e.g., better search, improved graph visualization).

---

_Phase: quick-006_
_Completed: 2026-02-05_
