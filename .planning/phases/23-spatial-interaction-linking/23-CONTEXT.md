# Phase 23: Spatial Interaction & Linking - Context

**Gathered:** 2026-02-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can manually organize the graph and use drag-and-drop to insert WikiLinks into the editor. Two key capabilities: (1) Drag a node from the graph and drop it into the editor to insert a `[[WikiLink]]`, and (2) Manually position and pin nodes so their locations persist between sessions.

</domain>

<decisions>
## Implementation Decisions

### Drag visual feedback
- Full node ghost follows cursor during drag (not compact preview)
- Standard 'grabbing' cursor during drag
- Other nodes dim while dragging (source node doesn't have special glow)
- Insertion position indicator shows in editor when dragging over it (not full highlight)

### Pin interaction model
- Right-click context menu action to pin/unpin nodes
- Toggle action (single option that flips state)
- Push-pin icon badge overlaid on pinned nodes
- Pinned nodes can be repositioned by dragging (stay pinned after move)

### Drop target behavior
- Insert at current cursor position when editor is focused
- Just cursor position indicator shown while hovering over editor (no live preview of link format)
- Dropping on existing WikiLink replaces the whole link
- WikiLink format: `[[Display Title|Note-ID]]` (title with ID fallback)

### Position persistence
- Unpinned nodes keep their position (they don't reset to auto-layout)
- Auto-layout runs normally as reset mechanism (user can unpin or let forces reorganize)
- Pinned node positions persist in localStorage across browser sessions
- Pinned nodes anchor others during auto-layout (unpinned nodes flow around them)

### Claude's Discretion
- Exact opacity level for dimmed nodes during drag
- Pin icon positioning/sizing on node badge
- localStorage key structure and data format

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 23-spatial-interaction-linking*
*Context gathered: 2026-02-07*
