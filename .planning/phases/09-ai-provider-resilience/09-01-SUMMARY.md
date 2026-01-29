---
phase: 09-ai-provider-resilience
plan: 01
subsystem: ai
tags: [openai, anthropic, google-gemini, react-hook-form, zod]

# Dependency graph
requires:
  - phase: 08-polish
    provides: V1 polish and stable build
provides:
  - Resilient AI provider configuration with smart defaults
  - Hybrid model selection UI (predefined list + custom entry)
  - Shared provider constants between API and Web
affects: [09-ai-provider-resilience]

# Tech tracking
tech-stack:
  added: []
  patterns: [Shared constants for provider defaults, Hybrid input for model selection]

key-files:
  created: []
  modified:
    - packages/env/index.ts
    - apps/api/src/services/ai.service.ts
    - apps/api/src/routes/settings.ts
    - apps/web/src/components/settings/ProviderSection.tsx

key-decisions:
  - "Centralize default AI Base URLs and Models in AIService to ensure consistency between runtime and validation."
  - "Make the model field optional in schema to allow falling back to high-performance defaults (gpt-4o-mini, etc.)."
  - "Use a datalist-style hybrid input for model selection to balance ease-of-use with flexibility for new models."

patterns-established:
  - "Provider Defaults: Exporting shared constants for third-party service configurations."

# Metrics
duration: 25min
completed: 2026-01-29
---

# Phase 9 Plan 1: Default Base URLs and Model Selection Summary

**Centralized AI provider defaults in the API service and implemented a hybrid model selection UI in the settings page to improve configuration resilience.**

## Performance

- **Duration:** 25min
- **Started:** 2026-01-29T14:45:00Z
- **Completed:** 2026-01-29T15:10:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Added `model` field to `SecretsSchema` for OpenAI, Anthropic, and Gemini.
- Implemented fallback logic in `AIService` using `DEFAULT_BASE_URLS` and `DEFAULT_MODELS`.
- Updated validation route to use centralized constants, removing hardcoded strings.
- Refactored settings UI to show placeholders for default URLs and provide a searchable model list that still allows custom overrides.

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Secrets Schema, AIService, and Settings Route** - `235556b` (feat)
2. **Task 2: Enhance Settings UI with placeholders and hybrid model selection** - `351ed95` (feat)
3. **Task 3: Checkpoint: human-verify** - (approved by user)

**Plan metadata:** `pending` (docs: complete plan)

## Files Created/Modified
- `packages/env/index.ts` - Added `model` to SecretsSchema
- `apps/api/src/services/ai.service.ts` - Defined defaults and updated `getModel` logic
- `apps/api/src/routes/settings.ts` - Used shared constants for validation
- `apps/web/src/components/settings/ProviderSection.tsx` - Enhanced UI with placeholders and hybrid input

## Decisions Made
- Used `gpt-4o-mini`, `claude-3-5-sonnet-20240620`, and `gemini-1.5-flash` as defaults for cost/speed balance.
- Kept `baseUrl` and `model` as optional strings to allow the simplest possible "just paste API key" experience.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## Next Phase Readiness
- AI configuration is now resilient and user-friendly.
- Ready for any further resilience tasks in Phase 9 if planned (e.g., retries, fallback providers).

---
*Phase: 09-ai-provider-resilience*
*Completed: 2026-01-29*
