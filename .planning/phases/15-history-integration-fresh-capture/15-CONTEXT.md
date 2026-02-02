# Phase 15: History Integration & Fresh Capture - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can move fluidly between new capture and historical notes. The system must clearly distinguish between creating a new note ("Draft") and editing an existing one ("Editing"). This includes mechanisms to reset the editor state and load existing content from history.

</domain>

<decisions>
## Implementation Decisions

### Mode Visuals
- **Status Badge**: Use a status badge (e.g., "Draft", "Saved") next to the title to signal current mode.
- **Primary Button**: Distinguish actions via text only (e.g., "Create" vs "Save").
- **Placeholder**: Minimalist approach - no specific placeholder text for new notes, just the cursor.
- **Sidebar**: Highlight the currently edited note in the sidebar list.

### Entry Points
- **Location**: Primary "New Note" button located in the editor toolbar.
- **App Start**: Restore the last session/note when the app opens.
- **Search**: Clicking "New Note" keeps existing search filters active.
- **Shortcut**: Standard `Cmd/Ctrl + N` to jump to "New Note" mode.

### Loading & Feedback
- **Loading State**: Show a skeleton screen if a note takes a moment to load.
- **Transitions**: Instant replacement when switching notes (no animations).
- **Confirmation**: Show a brief "Toast notification" on successful save.
- **Focus**: Auto-focus the editor body when loading a note or starting fresh.

### Claude's Discretion
- Exact styling of the status badge.
- Duration and positioning of the toast notification.
- Specific design of the skeleton screen.

</decisions>

<specifics>
## Specific Ideas

- "I want it to feel snappy - instant transitions."
- "Don't clear my search context just because I want to write a new note."

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 15-history-integration-fresh-capture*
*Context gathered: 2026-02-02*
