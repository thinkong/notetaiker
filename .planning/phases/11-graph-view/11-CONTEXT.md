# Phase 11: Graph View - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual exploration of notes via a force-directed graph. The graph visualizes relationships primarily through **Shared Tags**, where notes connect to central "Tag Nodes". The goal is high-level exploration and discovery, not precise navigation history.

</domain>

<decisions>
## Implementation Decisions

### Visual Style

- **2D Force Graph**: Standard 2D canvas/SVG implementation.
- **Uniform Nodes**: All note nodes are the same size and color (theme compliant).
- **Adaptive Labels**: Text labels should not be always visible to avoid clutter; show based on zoom level or node importance/hover.

### Connection Logic

- **Tag-Based Linking**: The primary connection structure is **Tag Hubs**. Notes do not link directly to each other based on tags; instead, Note A and Note B both link to a central `#tag` node.
- **Undirected**: Links are simple lines representing relationship, no directional arrows.
- **Ghost Nodes**: If a note references a missing file or tag, a "ghost" node is displayed to indicate the broken connection.

### Interactions

- **Click Behavior**: Clicking a node opens the note in a **Side Panel** (preserving the graph view context).
- **Hover Behavior**: Dual action — **Highlight** connected nodes/edges AND show a **Preview Tooltip** of the note content.
- **Physics**: Nodes are interactive and draggable.
- **Controls**: Standard mouse interactions (wheel to zoom, drag background to pan).

### Scope & Filtering

- **Default Scope**: **Global Graph** — shows all notes in the system by default.
- **Orphans**: Unconnected notes (orphans) are **included** in the view, floating freely.
- **Filtering**:
  - **Tag Filter**: A specific control to toggle/filter visible tags.
  - **Time Filter**: None (shows All Time).

### Claude's Discretion

- Exact physics simulation parameters (gravity, repulsion).
- Specific styling of "Tag Nodes" vs "Note Nodes" (likely distinct shapes or icons to differentiate).
- Layout of the side panel when a note is clicked.

</decisions>

<specifics>
## Specific Ideas

- "Tag Hub Nodes" pattern (Obsidian-style graph often does this or offers it as an option).
- Dual hover effect (dimming background + tooltip) for maximum clarity.

</specifics>

<deferred>
## Deferred Ideas

- **Wikilinks**: Explicit `[[link]]` support was not selected; focusing on Tag-based graph for this phase.
- **3D View**: Deferred to future phases (if ever).
- **Time-based filtering**: Deferred.

</deferred>

---

_Phase: 11-graph-view_
_Context gathered: 2026-01-30_
