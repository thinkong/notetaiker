# Phase 22: Graph Filtering & Local View - Research

**Researched:** 2026-02-06
**Domain:** Graph Visualization, Data Filtering, UI/UX
**Confidence:** HIGH

## Summary

This research focuses on implementing tag-based filtering and a local graph view within the existing `react-force-graph-2d` infrastructure. The core challenge is balancing context preservation (ghosting nodes) with focus (local view) while maintaining performance.

Key findings:
- `react-force-graph-2d` provides excellent hooks for custom rendering, which is essential for the "ghosting" effect.
- Filtering can be implemented purely at the rendering level or by updating the data passed to the graph. For "ghosting," rendering-level filtering is preferred.
- The "Local View" requires a center-out neighbor traversal (BFS/DFS with depth limit) and camera manipulation via `zoomToFit` or `centerAt`.
- UI for filtering can leverage the existing `cmdk` patterns already used in the `SearchPalette`.

**Primary recommendation:** Implement filtering as a state overlay in `GraphStateContext` and use custom `nodeCanvasObject` rendering to apply ghosting styles without removing nodes from the simulation, preserving the global layout as requested.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Location:** Top Toolbar (dedicated control area above canvas).
- **Interaction:** Search & Chips pattern (type to find tags, click to add as chip).
- **Logic:** Toggleable AND/OR. User can switch between "Match ANY" and "Match ALL".
- **Persistence:** Session only. Filters reset when navigating away from the graph view.
- **Entry Method:** Alt + Double-click on a node (resolves conflict with standard Double-click which opens note).
- **Depth:** Immediate neighbors only (1 hop).
- **Layout:** Preserve Global Position. Nodes do not re-layout; the camera focuses on the subset within the global structure.
- **Camera:** Free Exploration. User can pan/zoom away from the local cluster.
- **"Walking" the Graph:** In Local View, clicking a neighbor makes IT the new center (shifting focus).
- **Filtered/Hidden Nodes:** Dimmed / Ghosted. They remain faintly visible to preserve context.
- **Connections:** Connections to hidden nodes are rendered faintly.
- **Active Filter Indicator:** Background Tint. The canvas background changes slightly to indicate a filtered state.
- **Empty State:** Text message overlay ("No matching notes") if filters result in zero matches.
- **Ghost Node Interaction:** Fully interactive. User can still select or open "ghosted" nodes without clearing filters first.
- **External Selection:** If a user selects a note (e.g. via Sidebar) that is currently hidden by filters, the system automatically **clears all filters** to reveal it.

### Claude's Discretion
- **URL State:** Whether to reflect filter/local state in the URL or keep it internal is left to discretion.
- **Styling details:** Exact colors for "dimmed" state and background tint.
- **Transition animations:** Exact timing and easing for camera movements.

### Deferred Ideas (OUT OF SCOPE)
- **Saved Filters:** Persisting filters or saving named filter sets (future phase).
- **Complex Queries:** Advanced boolean logic ( (A OR B) AND C ) — out of scope for now.
- **Adjustable Depth:** Slider for 2+ hops in Local View — kept simple (1 hop) for this phase.
</user_constraints>

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-force-graph-2d` | ^1.29.0 | Graph visualization | Already integrated in `ForceGraph.tsx`. Supports high performance canvas rendering. |
| `cmdk` | ^1.1.1 | Filter input | Used for `SearchPalette.tsx`. Consistent UI pattern for search/selection. |
| `lucide-react` | ^0.563.0 | UI Icons | Standard icon set for the project. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lodash.debounce` | ^4.0.8 | Performance | Debouncing filter updates to prevent UI stutter during typing. |

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── components/
│   └── graph/
│       ├── GraphToolbar.tsx     # New: Filter UI and Local View controls
│       ├── GraphFilterChips.tsx  # New: Chip list for active filters
│       └── ...
├── contexts/
│   └── GraphStateContext.tsx     # Updated: Add filter and local view state
└── hooks/
    └── useGraphFilters.ts       # New: Logic for node/link visibility calculation
```

### Pattern 1: Render-Layer Ghosting
**What:** Apply opacity and desaturation in the `nodeCanvasObject` based on filter state.
**When to use:** To satisfy "Ghosted" requirement while keeping nodes interactive and layout stable.
**Example:**
```typescript
// Inside paintNode in ForceGraph.tsx
const isMatch = checkFilterMatch(node, activeFilters, filterLogic);
const isLocal = localCenterId ? isNeighbor(node.id, localCenterId) : true;
const isGhosted = !isMatch || !isLocal;

ctx.globalAlpha = isGhosted ? 0.2 : 1.0;
// ... draw node ...
ctx.globalAlpha = 1.0; // Reset
```

### Anti-Patterns to Avoid
- **Removing nodes from data:** If we remove nodes from the `graphData` object, the force simulation will re-layout, violating the "Preserve Global Position" constraint. Use render-level opacity instead.
- **Heavy computations in `nodeCanvasObject`:** This function runs every frame. Pre-calculate sets of `visibleNodeIds` and `visibleLinkIds` in a `useMemo` when filters change.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chip Input UI | Custom input with relative positioning | `cmdk` or a headless chip component | Handling focus, deletion, and search within a single input is complex. |
| Graph Traversal | Manual recursive loop | Pre-computed `neighborsMap` | We already have a `neighborsMap` in `ForceGraph.tsx` that can be extended for BFS. |

## Common Pitfalls

### Pitfall 1: Double-click vs Alt+Double-click Race
**What goes wrong:** The browser or the component might trigger a single click or standard double click before identifying the Alt key.
**Why it happens:** Event timing and event object properties can be tricky with specific libraries.
**How to avoid:** Check `event.altKey` in the `onNodeClick` and `onNodeDoubleClick` handlers. `react-force-graph-2d` passes the native event as the second argument.

### Pitfall 2: Camera Focus Jitter
**What goes wrong:** `zoomToFit` might be too aggressive or feel jarring when "walking" the graph.
**Why it happens:** Default animations might be too fast or have bad easing.
**How to avoid:** Use `fgRef.current.centerAt(x, y, transitionMs)` and `fgRef.current.zoom(level, transitionMs)` with calculated coordinates rather than generic `zoomToFit`.

## Code Examples

### Detection of Alt + Double-click
```typescript
// Source: https://github.com/vasturiano/react-force-graph/blob/master/README.md
<ForceGraph2D
  onNodeClick={(node, event) => {
    if (event.altKey) {
      // Handle Alt+Click if needed
    }
  }}
  onNodeDoubleClick={(node, event) => {
    if (event.altKey) {
      handleEnterLocalView(node);
    } else {
      handleOpenNote(node);
    }
  }}
/>
```

### Background Tinting for Filter State
```typescript
// In GraphView.tsx
const containerClasses = clsx(
  "flex-1 relative flex transition-colors duration-500",
  isFiltered ? "bg-nord-frost3/5 dark:bg-nord-frost0/10" : "bg-transparent"
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Filtering by mutating data | Filtering by render properties | Recent years (Canvas-based graphs) | Keeps simulation stable; prevents "exploding" graphs when filters change. |

## Open Questions

1. **URL State:**
   - What we know: `react-router-dom` is used.
   - What's unclear: If users want to share filtered views.
   - Recommendation: Keep it session-only as per "Persistence" decision, but allow `localNodeId` to be a URL param for deep linking.

2. **Large Graphs:**
   - What we know: `react-force-graph-2d` is fast.
   - What's unclear: Impact of ghosting 1000+ nodes.
   - Recommendation: Use a `Set` for `ghostedNodeIds` to keep lookup O(1) in the render loop.

## Sources

### Primary (HIGH confidence)
- `react-force-graph-2d` - Official README and API Reference.
- `apps/web/src/components/graph/ForceGraph.tsx` - Existing codebase implementation.
- `apps/web/src/components/search/SearchPalette.tsx` - Existing `cmdk` usage.

### Secondary (MEDIUM confidence)
- D3.js force simulation patterns for stable layouts.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries are already in the project.
- Architecture: HIGH - Clear path to extend existing components.
- Pitfalls: MEDIUM - Event handling can vary across browsers.

**Research date:** 2026-02-06
**Valid until:** 2026-03-08
