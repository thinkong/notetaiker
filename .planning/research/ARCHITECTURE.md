# Architecture Patterns: Interactive Graph Features

**Domain:** Interactive Knowledge Visualization
**Researched:** 2026-02-06
**Confidence:** HIGH

## Recommended Architecture

The interactive graph features will be implemented as an enhancement to the existing `ForceGraph` component and a new `GraphControls` orchestration layer. To maintain NoteTaiker's local-first performance, layout persistence and filtering will leverage the existing SQLite backend for storage while keeping the simulation and interaction logic on the client.

### Component Boundaries

| Component                   | Responsibility                                      | Communicates With                 |
| --------------------------- | --------------------------------------------------- | --------------------------------- |
| **GraphView** (Modified)    | Main layout and state orchestration                 | ForceGraph, GraphControls, Editor |
| **ForceGraph** (Modified)   | Canvas rendering, simulation, interaction events    | GraphView (via callbacks)         |
| **GraphControls** (New)     | UI for filtering, search, and layout settings       | GraphView                         |
| **LayoutService** (New API) | Persistence of node positions and view state        | SQLite (index.db)                 |
| **DragOverlay** (New)       | Visual feedback for Graph-to-Editor drag operations | DOM / Editor                      |

### Data Flow

1. **Layout Persistence**: `ForceGraph` captures `onNodeDragEnd` events → sends `x, y` to `LayoutService` → stored in SQLite `graph_layout` table. On load, nodes are initialized with these fixed positions.
2. **Filtering**: `GraphControls` updates filter criteria → `GraphView` filters `data` prop → `ForceGraph` updates simulation.
3. **Graph-to-Editor**: User initiates drag on node → `ForceGraph` detects drag with modifier key → `DragOverlay` appears → Dropped in `Editor` → Editor inserts wikilink `[[note-title]]`.

## Patterns to Follow

### Pattern 1: Hybrid Coordinate System

**What:** Store manually "pinned" positions as `fx`, `fy` (fixed coordinates) in the d3-force simulation, while letting the engine handle unpinned nodes.
**When:** Users want to organize specific clusters manually while letting the rest of the graph self-organize.
**Example:**

```typescript
// When loading data
const nodes = data.nodes.map((node) => ({
  ...node,
  fx: layout[node.id]?.x || null,
  fy: layout[node.id]?.y || null,
}));
```

### Pattern 2: Intercepting Canvas Events for DOM Drag-and-Drop

**What:** Use `onNodeDrag` to trigger the HTML5 Drag and Drop API or a custom `PointerEvents` overlay to bridge the gap between Canvas rendering and DOM targets (the Editor).
**Instead:** Do not try to make the Canvas element itself the draggable target; use a coordinate-mapped overlay.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Simulation Reset on Filter

**What:** Re-initializing the `ForceGraph` component every time a filter is applied.
**Why bad:** Causes a jarring "flash" and loses the user's visual context.
**Instead:** Update the `graphData` prop while maintaining the existing engine instance. `react-force-graph` handles incremental updates gracefully.

### Anti-Pattern 2: LocalStorage for Layout

**What:** Storing 1000+ node positions in `window.localStorage`.
**Why bad:** Limited storage space, no relational integrity, and positions are lost if user clears browser data or moves to another device.
**Instead:** Use the existing SQLite `index.db` with a dedicated `graph_layout` table.

## Scalability Considerations

| Concern         | At 100 nodes         | At 1000 nodes          | At 5000 nodes                  |
| --------------- | -------------------- | ---------------------- | ------------------------------ |
| **Persistence** | Instant SQLite write | Batch debounced writes | Background sync queue          |
| **Filtering**   | Array.filter()       | Memoized selectors     | SQLite view / Full-text search |
| **Rendering**   | Canvas (Default)     | Canvas (Optimized)     | WebGL (ForceGraph3D)           |

## Suggested Build Order

1.  **Layout Persistence Foundation**: Create SQLite `graph_layout` table and `LayoutService` API.
2.  **Manual Pinning**: Implement `onNodeDragEnd` in `ForceGraph` to save positions.
3.  **Filtering UI**: Build `GraphControls` and integrate with `GraphView` state.
4.  **Cluster Management**: Add visual grouping logic (based on semantic clusters if available).
5.  **Graph-to-Editor Bridge**: Implement the drag-and-drop interaction between Canvas and CodeMirror.

## Sources

- [react-force-graph documentation](https://github.com/vasturiano/react-force-graph)
- [d3-force fixed positions](https://github.com/d3/d3-force#node_fx)
- [HTML5 Drag and Drop with Canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
