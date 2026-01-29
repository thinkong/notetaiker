# Phase 8: V1 Polish - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Finalize performance and UX for the initial release. Ensure cold start meets 100ms target. Enable tag filtering and search. Polish the end-to-end "Capture -> Tag -> View" workflow.

</domain>

<decisions>
## Implementation Decisions

### Tag Filtering UX
- **Primary Action:** Clicking a tag opens a **Dedicated View** (separate from main timeline).
- **Selection Logic:** **Single-select** only. Clicking a new tag replaces the current filter.
- **Discovery:** Tags appear in **Search Autocomplete** suggestions.
- **Clearing:** **Explicit Clear Button** to remove the active filter.

### Processing Feedback
- **Location:** Status shown directly **On Note Card**.
- **Thinking State:** **Small Spinner** while AI processes.
- **Success:** **Success Toast** ("Tags added") when complete.
- **Failure:** **Silent Fail** (no user interruption).

### Keyboard Control
- **Focus Input:** `Cmd+K`
- **Submit Note:** `Cmd+Enter`
- **Timeline Navigation:** **Arrow Keys** to move selection.
- **Escape Key:** **Blur Input** (removes focus, keeps text).

### Empty States
- **Zero Notes (Fresh):** **Minimal Input Focus** (clean interface, focus in input).
- **No Filter Matches:** Simple **No Matches Message**.
- **Loading:** **Skeleton Loader** (gray bars).
- **Error:** **Manual Retry Button**.

### Claude's Discretion
- Exact styling of the "Dedicated View" for tags.
- Animation details for the skeleton loader.
- Specific implementation of the search autocomplete dropdown.
- Performance optimization techniques to hit 100ms target.

</decisions>

<specifics>
## Specific Ideas

- "Minimal, clean interface" for the fresh install state — emphasis on "Zero-friction capture".
- "Silent fail" for AI suggests treating tags as a "nice to have" enhancement, not a critical dependency.
- Keyboard shortcuts (`Cmd+K`, `Cmd+Enter`) align with power-user expectations (like Linear/Slack).

</specifics>

<deferred>
## Deferred Ideas

- Multi-select tag filtering (AND/OR logic) — deferred to future update.
- Complex error handling for AI (retry logic/warnings) — deferred.
- Global activity indicators — deferred.

</deferred>

---

*Phase: 08-v1-polish*
*Context gathered: 2026-01-29*
