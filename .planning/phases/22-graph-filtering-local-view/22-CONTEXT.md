# Phase 22: Graph Filtering & Local View - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can reduce noise and focus on specific sub-sections of their knowledge base. Includes tag-based filtering and a "Local Graph" view that isolates the active note and its immediate neighbors. This builds on the graph infrastructure from Phase 11/21.

</domain>

<decisions>
## Implementation Decisions

### Filter UI & Logic
- **Location:** Top Toolbar (dedicated control area above canvas).
- **Interaction:** Search & Chips pattern (type to find tags, click to add as chip).
- **Logic:** Toggleable AND/OR. User can switch between "Match ANY" and "Match ALL".
- **Persistence:** Session only. Filters reset when navigating away from the graph view.

### Local View Mechanics
- **Entry Method:** Alt + Double-click on a node (resolves conflict with standard Double-click which opens note).
- **Depth:** Immediate neighbors only (1 hop).
- **Layout:** Preserve Global Position. Nodes do not re-layout; the camera focuses on the subset within the global structure.
- **Camera:** Free Exploration. User can pan/zoom away from the local cluster.
- **"Walking" the Graph:** In Local View, clicking a neighbor makes IT the new center (shifting focus).

### Visual Feedback
- **Filtered/Hidden Nodes:** Dimmed / Ghosted. They remain faintly visible to preserve context.
- **Connections:** Connections to hidden nodes are rendered faintly.
- **Active Filter Indicator:** Background Tint. The canvas background changes slightly to indicate a filtered state.
- **Empty State:** Text message overlay ("No matching notes") if filters result in zero matches.

### Navigation in Filtered Mode
- **Ghost Node Interaction:** Fully interactive. User can still select or open "ghosted" nodes without clearing filters first.
- **External Selection:** If a user selects a note (e.g. via Sidebar) that is currently hidden by filters, the system automatically **clears all filters** to reveal it.

### Claude's Discretion
- **URL State:** Whether to reflect filter/local state in the URL or keep it internal is left to discretion.
- **Styling details:** Exact colors for "dimmed" state and background tint.
- **Transition animations:** Exact timing and easing for camera movements.

</decisions>

<specifics>
## Specific Ideas

- **Conflict Resolution:** Distinct separation between "Open Note" (Double-click) and "Enter Local View" (Alt + Double-click).
- **Context Preservation:** The decision to "Ghost" rather than "Hide" is key — users want to see where they are in the whole, even when focusing.

</specifics>

<deferred>
## Deferred Ideas

- **Saved Filters:** Persisting filters or saving named filter sets (future phase).
- **Complex Queries:** Advanced boolean logic ( (A OR B) AND C ) — out of scope for now.
- **Adjustable Depth:** Slider for 2+ hops in Local View — kept simple (1 hop) for this phase.

</deferred>

---

*Phase: 22-graph-filtering-local-view*
*Context gathered: 2026-02-06*
