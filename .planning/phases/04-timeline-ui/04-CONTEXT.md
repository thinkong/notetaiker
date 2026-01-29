# Phase 4: Timeline UI - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable users to view and navigate their notes history. Delivers a reverse-chronological note stream with basic navigation capabilities.

</domain>

<decisions>
## Implementation Decisions

### Layout & Density

- **Card-based layout**: Notes displayed as distinct boxes with borders/shadows (Twitter/Bluesky style).
- **Adaptive content**: Show full content for short notes, truncate long ones.
- **Hybrid timestamps**: Display relative time (e.g., "2h ago") as primary, absolute date/time as secondary/tooltip.
- **Compact density**: Data-dense presentation, prioritizing visibility of multiple notes.

### Navigation & Interaction

- **Structure**: Timeline lives directly below the capture input area (single page view).
- **Click behavior**: Clicking a note card expands it in place to show full content.
- **Return to capture**: The "New Note" input field remains always visible at the top.

### Loading Behavior

- **Pagination**: Infinite scroll implementation.
- **Initial load**: Standard batch size (approx. 50 notes).
- **Updates**: Auto-prepend new notes immediately if added from another source.
- **Loading state**: Use skeleton screens (gray bars) while loading.

### Visual Details

- **Content font**: Monospace (code-like) to match the editor and Markdown nature.
- **Empty state**: Minimal text-only message (e.g., "No notes yet").
- **IDs**: Internal Note IDs are hidden from the card view.

### Claude's Discretion

- **Quick actions**: Design and visibility of actions (delete/edit) on cards.
- **Truncation UI**: Visual execution of the "adaptive" truncation (fade vs cut).
- **Compact spacing**: Exact padding/margin values to achieve "compact" feel while remaining readable.

</decisions>

<specifics>
## Specific Ideas

- Content uses monospace font to maintain consistency with the Markdown editor experience.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 04-timeline-ui_
_Context gathered: 2026-01-27_
