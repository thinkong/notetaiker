# Phase 9: AI Provider Resilience - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Ensures AI processing continues robustly even if provider base URLs are left blank by using standard defaults. Adds ability to select models from provider-fetched lists while maintaining manual fallback.

</domain>

<decisions>
## Implementation Decisions

### Migration Behavior

- **Runtime handling:** Do not modify existing database records. Logic will interpret empty/null values at runtime.
- **Empty string = Default:** An empty string in the database `baseUrl` field signifies "Use the provider's standard default".
- **Hot reload:** Changes to configuration apply immediately without requiring an app restart.

### Settings UI Presentation

- **Placeholder text:** Show the default URL (e.g. `https://api.openai.com/v1`) as gray placeholder text in the input field when empty.
- **Minimal indication:** No extra badges/labels ("Default") needed; the placeholder communicates the state sufficiently.

### Model Selection

- **Require Key:** Only attempt to fetch model lists if a valid API key is present.
- **Auto-fetch:** Automatically attempt to fetch models when the settings page loads (if key exists).
- **Allow manual entry:** The model selection input must be a hybrid (combobox/datalist) that allows selecting from the fetched list OR typing a custom model name manually (resilience fallback).

### Claude's Discretion

- Exact debounce timing for auto-fetch
- Error message wording if fetch fails
- Caching strategy for model lists (session vs persistent)

</decisions>

<specifics>
## Specific Ideas

- "If I don't set the base url, it won't properly send the api. it should use the default if no base url is specified."
- UI should feel standard and expected — empty field works.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

_Phase: 09-ai-provider-resilience_
_Context gathered: 2026-01-29_
