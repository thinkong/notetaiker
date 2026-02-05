# Phase 16: Intelligent Navigation Guarding - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Users are protected from data loss without being interrupted by unnecessary prompts. The guard triggers ONLY when actual changes exist (smart check) and handles both app navigation and browser events.

</domain>

<decisions>
## Implementation Decisions

### Trigger Events

- **Scope:** Protect both in-app navigation (React Router) and browser actions (Refresh/Close).
- **In-App Behavior:** Block navigation and show a custom prompt.
- **Empty New Note:** Silent discard (no prompt) if the note is a "Draft" with no content.
- **Reverted Content:** Silent allow. If user types and then deletes (or Undoes) back to the saved state, navigation proceeds without prompting.

### Dirty Logic

- **Smart Check:** Compare current editor state against the last saved state, not just a "touched" flag.
- **Tag Changes:** Treat with equal urgency to body text changes. A change in tags alone is sufficient to trigger the guard.
- **Whitespace:** Use trimmed comparison. Ignore leading/trailing whitespace changes.
- **Timing:** Lazy check. Calculate dirty state only when navigation is attempted, not on every keystroke.

### Prompt Experience

- **Type:** Custom Modal for in-app navigation. (Note: Browser close/refresh will inevitably use the native browser dialog due to security restrictions).
- **Options:** "Save", "Discard", "Cancel".
- **Visuals:** "Discard" action styled with a Warning color (Yellow/Orange), not Destructive (Red).
- **Context:** Display the title of the note being left in the prompt message.

### Auto-save Handling

- **Pending Saves:** If a save is debounced/pending, treat as dirty and Block & Prompt. Do not "flush and go".
- **Drafts:** If a New Note (Draft) has content, Prompt before leaving. Do not auto-save as "Untitled".
- **Save Action:** When user clicks "Save" in the prompt, wait for successful persistence before allowing navigation to proceed.
- **Failure:** If save fails (e.g., API error), Cancel the navigation. Do not allow the user to leave until resolved or explicitly discarded.

### Claude's Discretion

- Exact layout and styling of the Custom Modal (matching Nord theme).
- Implementation details of the `beforeunload` handler for browser events.

</decisions>

<specifics>
## Specific Ideas

- "Smart Dirty Check" is key — avoid "boy who cried wolf" prompts.
- Modal should feel native to the app, not a generic alert.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

_Phase: 16-intelligent-navigation-guarding_
_Context gathered: 2026-02-02_
