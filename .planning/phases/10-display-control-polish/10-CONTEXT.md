# Phase 10: Display & Control Polish - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Refines note rendering to intelligently handle YAML frontmatter (hiding or collapsing it) and standardizes the "Save" interaction with a universal keyboard shortcut.

</domain>

<decisions>
## Implementation Decisions

### Frontmatter Visibility

- **Collapsed/Toggleable:** In Read Mode, frontmatter is not removed entirely but collapsed behind a toggle.
- **Default Collapsed:** The toggle defaults to the "collapsed" state to keep the view clean.
- **Rendering:** When expanded, it renders as a styled block (e.g., syntax highlighted or key-value pairs), not raw text.

### Editing Experience

- **Hybrid Toggle:** In Edit Mode, the user sees UI fields for metadata (tags, etc.) but can toggle to reveal the raw YAML text if needed.
- **Source Truth:** The raw YAML text is the source of truth. Editing the UI fields updates the YAML, but if the user edits the raw YAML, that takes precedence.

### Save Shortcut Behavior

- **Editor Only:** The `Ctrl+Enter` (or `Cmd+Enter`) shortcut triggers a save only when the editor is focused.
- **Visual Toast:** A brief "Saved" toast notification appears to confirm the action.

### Claude's Discretion

- Visual design of the collapse toggle (icon vs text).
- Specific animation for the save toast.
- Parsing library choice for YAML (likely `js-yaml` or similar standard).

</decisions>

<specifics>
## Specific Ideas

- "Note view parses frontmatter and excludes it from body rendering" (Requirement UI-FIX-01)
- "User can save note using Ctrl+Enter shortcut" (Requirement UI-FIX-02)

</specifics>

<deferred>
## Deferred Ideas

- Global shortcuts for saving from list view (out of scope).
- Two-way real-time sync for complex custom frontmatter fields (deferred to v2).

</deferred>

---

_Phase: 10-display-control-polish_
_Context gathered: 2026-01-29_
