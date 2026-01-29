# Phase 05: AI Configuration - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Allow users to securely manage their AI service credentials. This phase delivers the settings interface and the local storage mechanism for secrets. Orchestration of AI jobs (Phase 6) and actual tag generation (Phase 7) are separate.

</domain>

<decisions>
## Implementation Decisions

### Settings UI Location & Layout
- **Full Page UI**: Dedicated settings route/page, not a modal or sidebar.
- **Visual Security**: API keys are masked by default with a show/hide toggle.
- **Minimalist**: Just the inputs and labels, no heavy wizard or guided onboarding.
- **Manual Save**: Explicit "Save" button required to persist changes.

### Storage Strategy
- **Project-local**: Secrets stored in a file within the project directory (e.g., `.notetaiker/secrets.json`).
- **Git Safety**: Application must automatically ensure this file is added to `.gitignore`.
- **Security Level**: Standard file permissions (0600), plain text JSON content (no complex encryption/keychain integration).
- **Structure**: Grouped by provider in JSON.
  ```json
  {
    "openai": { "apiKey": "...", "baseUrl": "..." },
    "anthropic": { "apiKey": "..." }
  }
  ```

### Validation Behavior
- **Real Verification**: Validation performs a real HTTP request to the provider's API (e.g., `listModels` or `user` endpoint).
- **Non-blocking**: User can save invalid keys (system warns but persists).
- **Trigger**: Validation happens only on explicit "Test" or "Save" action.
- **Detailed Feedback**: Show specific error messages from the API (e.g., "Quota Exceeded") rather than generic failures.

### Provider Scope
- **Supported Providers**: Anthropic, OpenAI, and Google Gemini.
- **Custom Base URL**: Users can configure the Base URL for any provider (enables proxies).
- **Model Selection**: Dynamic fetching of available models from the API where possible.
- **Advanced Config**: Support per-provider settings beyond just the key (e.g., default temperature, max tokens).

### Claude's Discretion
- Specific library choices for form handling (e.g., React Hook Form vs controlled inputs).
- Exact design of the "Advanced Settings" collapsible/section.
- Detailed error message mapping.

</decisions>

<specifics>
## Specific Ideas

- "Allow user to set custom Base URL" — crucial for non-standard environments.
- "Detailed API error" — helpful for debugging key issues.
- "Dynamic Fetch" — keeps the model list up to date without app updates.

</specifics>

<deferred>
## Deferred Ideas

- System-global storage (e.g., `~/.config`) — decided against for now (sticking to project-local).
- OS Keychain integration — deferred for simplicity/portability.
- AI Worker implementation — Phase 6.

</deferred>

---

*Phase: 05-ai-configuration*
*Context gathered: 2026-01-27*
