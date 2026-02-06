# Phase 21: Graph Navigation & Tooltips - Research

**Researched:** 2026-02-06
**Domain:** Graph Visualization & Interaction
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Implementation Decisions

#### Tooltip presentation

- Content: Note title + 2-line content excerpt only (no tags, no metadata)
- Style: Frosted glass effect (slightly transparent with backdrop blur)
- Delay: ~200ms before showing (prevents flickering when passing over nodes)
- Position: Auto-position intelligently above/below node, staying within canvas bounds

#### Selection feedback

- Dimming: Moderate (~50% opacity) for unconnected nodes when a node is selected
- Highlighting: Both edges AND connected nodes stand out (thicker lines + node glow)
- Transition: Animated fade (~150ms) for polish
- Clear selection: Both click-on-canvas and Escape key work

#### Navigation transitions

- Graph panel: Keep graph open when navigating (don't close the panel)
- Visual feedback: Brief flash confirmation on the clicked node as editor loads
- Editor scroll: Scroll to top of note (ready to read)
- Graph centering: Keep current view position stable (no re-centering on navigation)

#### Canvas controls

- Zoom limits: Wide range (10%-500%) for maximum flexibility
- Reset view: "Fit All" button to reset and show all nodes
- Mouse controls: Scroll wheel = zoom, click-drag = pan
- Animation feel: Snappy (~100ms transitions)

### Claude's Discretion

- Exact blur intensity for frosted glass tooltips
- Precise glow/highlight colors for selected nodes
- Flash animation implementation details
- Keyboard shortcuts for zoom/pan (beyond Escape)

### Deferred Ideas

None — discussion stayed within phase scope
</user_constraints>

## Summary

This phase transforms the graph from a passive visualization into a primary navigation tool. The core challenges are implementing interactions that the underlying library (`react-force-graph-2d`) doesn't natively support (like double-click and custom React-based tooltips) and ensuring the graph's state (zoom, pan, node positions) persists across navigation events.

The standard approach uses `react-force-graph-2d`'s ref methods for programmatic zoom/pan and coordinate translation (`graph2ScreenCoords`) to overlay HTML tooltips. Since the library lacks a native double-click event, a custom timing handler is required. To satisfy the "stable view" requirement, graph state must be lifted out of the component or cached in a context/store to prevent re-initialization when the user navigates back to the graph.

**Primary recommendation:** Implement a `GraphInteractionContext` to persist camera state and use a custom "Click vs. Double-Click" handler to differentiate selection from navigation.

## Standard Stack

### Core

| Library                | Version | Purpose         | Why Standard                                                |
| ---------------------- | ------- | --------------- | ----------------------------------------------------------- |
| `react-force-graph-2d` | 1.29.0  | Graph rendering | Existing project choice, high performance canvas rendering. |
| `d3-force`             | 3.0.0   | Physics engine  | Underlying engine for force-directed layout.                |

### Supporting

| Library           | Version | Purpose        | When to Use                                         |
| ----------------- | ------- | -------------- | --------------------------------------------------- |
| `lodash.debounce` | 4.x     | Event handling | Debouncing tooltip show/hide to prevent flickering. |
| `lucide-react`    | 0.563.0 | Icons          | Zoom/Fit control buttons.                           |

## Architecture Patterns

### 1. Persistent Graph State

To meet the requirement "Keep current view position stable (no re-centering on navigation)", the graph's state (zoom level, pan coordinates, and optionally node positions) must survive unmounting.

**Pattern:** `GraphStateContext` or Lifted State

- **Store:** `zoom`, `pan`, `frozenNodes` (if dragging enabled).
- **On Mount:** Read from store and apply using `fgRef.current.zoom()` and `fgRef.current.centerAt()`.
- **On Unmount/Navigate:** Save current state to store.

### 2. Custom HTML Tooltips via Overlay

Canvas cannot render frosted glass (backdrop-blur). Use an HTML overlay.

**Pattern:** Coordinate Projection

1. `onNodeHover` sets the `hoveredNode` state.
2. A `useEffect` or `requestAnimationFrame` loop tracks the node's position.
3. Use `fgRef.current.graph2ScreenCoords(node.x, node.y)` to get screen (x, y).
4. Render a fixed `div` at those coordinates with `pointer-events-none`.

### 3. Click vs. Double-Click Handling

`react-force-graph-2d` does not expose `onNodeDoubleClick`.

**Pattern:** Time-based discriminator

```typescript
const lastClick = useRef(0);
const handleNodeClick = (node) => {
  const now = Date.now();
  if (now - lastClick.current < 300) {
    // Double click detected
    handleNavigate(node);
  } else {
    // Single click detected
    lastClick.current = now;
    handleSelect(node);
  }
};
```

## Don't Hand-Roll

| Problem        | Don't Build             | Use Instead            | Why                                                    |
| -------------- | ----------------------- | ---------------------- | ------------------------------------------------------ |
| Physics Layout | Custom force simulation | `d3-force` (built-in)  | Optimized, handles collision/charge correctly.         |
| Zoom Logic     | Manual transform matrix | `fgRef.current.zoom()` | Handles smooth transitions and limits natively.        |
| Text Rendering | Canvas text wrapping    | HTML Tooltip           | Canvas text wrapping is complex; HTML is built for it. |

## Common Pitfalls

### Pitfall 1: Double-Click Zoom Conflict

**What goes wrong:** Double-clicking a node triggers the library's default "zoom to fit" or "zoom in" behavior while also navigating.
**How to avoid:**

- Disable default zoom-on-double-click: `enableZoomInteraction={true}` but set `cooldownTicks={0}` if needed, or largely irrelevant if we navigate away immediately.
- _Better:_ The library treats double click on canvas as zoom. Double click on node might not trigger zoom if handled.
- **Fix:** `onNodeClick` captures the event. If `react-force-graph` consumes the event, we are good.

### Pitfall 2: Tooltip Jitter

**What goes wrong:** The tooltip flashes or moves efficiently as the physics simulation settles.
**How to avoid:**

- Only show tooltip when simulation is paused or "cool".
- Use `graph2ScreenCoords` in a `useLayoutEffect` or `requestAnimationFrame` to sync perfectly with render.
- **Requirement:** "Delay: ~200ms". This debouncing naturally solves most jitter issues as the user pauses on a node.

### Pitfall 3: Re-simulation on Back

**What goes wrong:** Returning to the graph causes the nodes to explode/re-simulate positions.
**How to avoid:**

- Store `node.x`, `node.y`, `node.vx`, `node.vy` in the persistent state/cache.
- Re-inject these coordinates into the data object when re-mounting.

## Code Examples

### 1. Click vs. Double-Click Logic

```typescript
// Source: Community pattern for react-force-graph
const handleNodeClick = useCallback(
  (node) => {
    const now = Date.now();
    const DOUBLE_CLICK_DELAY = 300; // ms

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;

      // Double click logic
      onNodeDoubleClick(node);
    } else {
      // Single click logic (delayed to wait for potential second click)
      clickTimeoutRef.current = setTimeout(() => {
        onNodeClick(node);
        clickTimeoutRef.current = null;
      }, DOUBLE_CLICK_DELAY);
    }
  },
  [onNodeClick, onNodeDoubleClick],
);
```

*Note: The user requirement allows "Click to highlight" and "Double click to navigate". If we want instant highlighting, we can run the single click logic immediately and the double click logic *also* if it happens. However, usually double-click supersedes single click. Given the "Flash confirmation" requirement, firing single click (highlight) followed by double click (nav) is acceptable and feels snappier.*

### 2. Positioning Tooltip

```typescript
const Tooltip = ({ node, graphRef }) => {
  const { x, y } = graphRef.current.graph2ScreenCoords(node.x, node.y);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -120%)', // Above node
        pointerEvents: 'none'
      }}
      className="backdrop-blur-md bg-white/80 p-2 rounded shadow-lg border"
    >
      <h3 className="font-bold">{node.name}</h3>
      <p className="line-clamp-2 text-sm">{node.excerpt}</p>
    </div>
  );
};
```

## Open Questions

1. **Exact Flash Animation:**
   - How should the "flash" look? A temporary color change? A ring expansion?
   - **Recommendation:** A rapid scale up/down or a bright white glow overlay that fades out over 300ms.

## Sources

### Primary (HIGH confidence)

- `react-force-graph-2d` internal types (read from `node_modules`)
- User Constraints (CONTEXT.md)

### Secondary (MEDIUM confidence)

- React d3-force interaction patterns (standard web practices)

### Tertiary (LOW confidence)

- WebSearch for specific "frosted glass tooltip on canvas" examples (mostly generic HTML/CSS)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH (Existing project code)
- Architecture: HIGH (Standard React patterns)
- Pitfalls: HIGH (Known library limitations)

**Research date:** 2026-02-06
