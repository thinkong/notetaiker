# Phase 21: Graph Navigation & Tooltips - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform the graph from a static display into an interactive navigation tool. Users can hover nodes for previews, click to highlight connections, and double-click to navigate to notes. Pan and zoom controls provide smooth exploration.

</domain>

<decisions>
## Implementation Decisions

### Tooltip presentation
- Content: Note title + 2-line content excerpt only (no tags, no metadata)
- Style: Frosted glass effect (slightly transparent with backdrop blur)
- Delay: ~200ms before showing (prevents flickering when passing over nodes)
- Position: Auto-position intelligently above/below node, staying within canvas bounds

### Selection feedback
- Dimming: Moderate (~50% opacity) for unconnected nodes when a node is selected
- Highlighting: Both edges AND connected nodes stand out (thicker lines + node glow)
- Transition: Animated fade (~150ms) for polish
- Clear selection: Both click-on-canvas and Escape key work

### Navigation transitions
- Graph panel: Keep graph open when navigating (don't close the panel)
- Visual feedback: Brief flash confirmation on the clicked node as editor loads
- Editor scroll: Scroll to top of note (ready to read)
- Graph centering: Keep current view position stable (no re-centering on navigation)

### Canvas controls
- Zoom limits: Wide range (10%-500%) for maximum flexibility
- Reset view: "Fit All" button to reset and show all nodes
- Mouse controls: Scroll wheel = zoom, click-drag = pan
- Animation feel: Snappy (~100ms transitions)

### Claude's Discretion
- Exact blur intensity for frosted glass tooltips
- Precise glow/highlight colors for selected nodes
- Flash animation implementation details
- Keyboard shortcuts for zoom/pan (beyond Escape)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 21-graph-navigation-tooltips*
*Context gathered: 2026-02-06*
