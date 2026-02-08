# Phase 23: Spatial Interaction & Linking - Research

**Researched:** 2026-02-08
**Domain:** Drag-and-Drop, Canvas Interaction, React State Management, LocalStorage Persistence
**Confidence:** HIGH

## Summary

Phase 23 implements two core capabilities: (1) drag a graph node and drop it into the editor to insert a wiki link, and (2) manually position and pin nodes with persistent positions. The implementation relies on:

- **react-force-graph-2d**'s built-in node dragging (`enableNodeDrag`), drag callbacks (`onNodeDrag`, `onNodeDragEnd`), and fixed-position nodes (`fx`, `fy`)
- **HTML5 Drag and Drop API** for cross-page data transfer (graph → editor)
- **CodeMirror 6** `dropCursor` extension for insertion indicator and custom `drop` handler for link insertion
- **localStorage** for persisting pinned node positions
- **React Context** (GraphStateContext) for managing pinned node state

**Primary recommendation:** Use force-graph's drag APIs combined with an HTML5 drag overlay for cross-page drops; store pinned positions separately from note data; implement editor drop handling with CodeMirror's `domEventHandlers`; use `dropCursor` for visual feedback.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library                         | Version  | Purpose                          | Why Standard                                                                                    |
| ------------------------------- | -------- | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| react-force-graph-2d            | 1.29.0   | 2D force-directed graph canvas   | Already in use; provides built-in node dragging, fixed positions via `fx`/`fy`, and drag events |
| @uiw/react-codemirror           | 4.25.4   | CodeMirror 6 React wrapper       | Already in use; provides editor component                                                       |
| CodeMirror 6 (@codemirror/view) | ^6.39.11 | Editor core with drop extensions | Native `dropCursor` extension matches requirement; `domEventHandlers` for custom drop logic     |

### Supporting

| Library                   | Version | Purpose                                        | When to Use                                                        |
| ------------------------- | ------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| localStorage API (native) | -       | Persist pinned node positions                  | Simple client-side persistence; already used for draft persistence |
| React Context             | -       | Share drag state and pinned nodes              | GraphStateProvider already exists; extend it                       |
| HTML5 Drag and Drop API   | -       | Cross-page data transfer from canvas to editor | Standard way to drag data between browser contexts                 |

### Alternatives Considered

| Instead of                    | Could Use                                    | Tradeoff                                                                      |
| ----------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| HTML5 Drag API + setDragImage | Custom drag element following mouse (no API) | Avoids dragstart complexity but loses cross-page capability; not standard     |
| Context Menu Pin              | Toolbar Pin button                           | Context menu is the decision; toolbar would be different placement            |
| localStorage                  | IndexedDB                                    | Overkill for small pinned positions; localStorage is simpler and already used |

**Installation:**
All packages are already installed. For reference:

```bash
# Already in package.json
"react-force-graph-2d": "^1.29.0"
"@uiw/react-codemirror": "^4.25.4"
"@codemirror/view": "^6.39.11"
```

## Architecture Patterns

### Recommended Project Structure

```
apps/web/
├── src/
│   ├── contexts/
│   │   └── GraphStateContext.tsx     # Extend with pinnedNodes map
│   ├── components/
│   │   ├── graph/
│   │   │   ├── ForceGraph.tsx        # Add drag handlers, visual dimming, pin badge
│   │   │   ├── GraphView.tsx         # Add context menu component
│   │   │   └── GraphContextMenu.tsx  # New: right-click menu for pin/unpin
│   │   └── editor/
│   │       └── Editor.tsx            # Add dropCursor, drop handler
│   └── hooks/
│       └── usePinnedNodes.ts         # Optional: extract localStorage logic
```

### Pattern 1: Graph Node Pinning with Fixed Positions

**What:** Store pinned node coordinates separately (not in note data) and apply them to graph nodes via `fx`/`fy` D3-force fixed position properties. When a pinned node is dragged, update the stored position on drag end.

**When to use:** Pinning is UI state, not note content. Separation keeps note model pure and avoids unnecessary frontmatter writes.

**Example:**

```typescript
// Extend GraphState
interface GraphState {
  // ...existing fields
  pinnedNodes: Record<string, {x: number, y: number}>;
}

// In ForceGraph, augment nodes before passing to graph
const augmentedData = useMemo(() => ({
  nodes: data.nodes.map(node => ({
    ...node,
    ...(graphState.pinnedNodes[node.id] && {
      fx: graphState.pinnedNodes[node.id].x,
      fy: graphState.pinnedNodes[node.id].y
    })
  })),
  links: data.links
}), [data, graphState.pinnedNodes]);

// Enable native node dragging
<ForceGraph2D
  enableNodeDrag={true}
  onNodeDrag={handleNodeDrag}
  onNodeDragEnd={handleNodeDragEnd}
/>
```

Source: `react-force-graph-2d` type definitions (`NodeObject` includes `fx`, `fy`).

### Pattern 2: Cross-Page Drag with HTML5 DataTransfer

**What:** Initiate an HTML5 drag from the graph canvas when force-graph's `onNodeDrag` fires, setting custom drag image and data. The editor on another page handles `dragover`/`drop` events.

**When to use:** Dragging between different routes/pages in the same browser. HTML5 drag API supports cross-window drags naturally.

**Example:**

```typescript
// In Graph wrapper
const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
const [isDragging, setIsDragging] = useState(false);
const dragFlagRef = useRef(false); // Track first drag event

const handleNodeDrag = useCallback((node, translate) => {
  if (!dragFlagRef.current) {
    dragFlagRef.current = true; // First call - mark drag started
    setDraggedNode(node as GraphNode);
    setIsDragging(true);
  }
}, []);

const handleDragStart = useCallback(
  (e: React.DragEvent) => {
    if (!draggedNode) {
      e.preventDefault(); // Cancel drag if not on a node
      return;
    }
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: draggedNode.id,
        name: draggedNode.name,
      }),
    );
    // Set custom drag image (full node ghost)
    const ghostCanvas = document.createElement("canvas");
    // draw node onto ghostCanvas...
    e.dataTransfer.setDragImage(
      ghostCanvas,
      ghostCanvas.width / 2,
      ghostCanvas.height / 2,
    );
  },
  [draggedNode],
);

const handleNodeDragEnd = useCallback(() => {
  setIsDragging(false);
  dragFlagRef.current = false;
  // Clear draggedNode after a short delay to avoid interfering with drop
  setTimeout(() => setDraggedNode(null), 0);
}, []);
```

Source: HTML5 Drag and Drop API (MDN); decision pattern from phase context.

### Pattern 3: CodeMirror Drop Handler with Link Replacement

**What:** Use `EditorView.domEventHandlers` to handle `drop` events, prevent default, detect wiki link under cursor, and insert or replace link text.

**When to use:** Handling custom dropped content in CodeMirror 6 editor.

**Example:**

```typescript
import { dropCursor } from "@codemirror/view";
import { domEventHandlers } from "@codemirror/view";

const dropHandler = domEventHandlers({
  drop: (event, view) => {
    event.preventDefault();
    const raw = event.dataTransfer?.getData("application/json");
    if (!raw) return false;

    const node = JSON.parse(raw);
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos === null) return false;

    const { state } = view;
    const text = state.doc.toString();

    // Check if dropping on existing wiki link [[...]]
    const before = text.slice(0, pos);
    const after = text.slice(pos);
    const open = before.lastIndexOf("[[");
    const close = after.indexOf("]]");
    if (open !== -1 && close !== -1) {
      const from = open;
      const to = pos + close + 2;
      view.dispatch({
        changes: { insert: `[[${node.name}|${node.id}]]`, from, to },
        selection: { anchor: from + node.name.length + 2 }, // place cursor after link
      });
    } else {
      view.dispatch({
        changes: { insert: `[[${node.name}|${node.id}]]`, from: pos },
        selection: { anchor: pos + node.name.length + 4 },
      });
    }
    return true;
  },
});

// In Editor extensions:
const extensions = [
  // ...existing extensions
  dropCursor(), // Shows insertion indicator during dragover
  dropHandler,
];
```

Source: CodeMirror 6 documentation (`EditorView.domEventHandlers`).

### Pattern 4: LocalStorage Hook

**What:** Create a hook to manage a JSON object in localStorage with auto-save and error handling.

**When to use:** Simple client-side persistence; already used for draft persistence in `useDraftPersistence`.

**Example:**

```typescript
const PINNED_KEY = "notetaiker:graph:pinned-nodes";

export function usePinnedNodes() {
  const [pinned, setPinned] = useState<
    Record<string, { x: number; y: number }>
  >(() => {
    try {
      const raw = localStorage.getItem(PINNED_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PINNED_KEY, JSON.stringify(pinned));
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.warn("localStorage quota exceeded, pinned nodes not saved");
      }
    }
  }, [pinned]);

  const pinNode = useCallback((id: string, x: number, y: number) => {
    setPinned((prev) => ({ ...prev, [id]: { x, y } }));
  }, []);

  const unpinNode = useCallback((id: string) => {
    setPinned((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  return { pinned, pinNode, unpinNode };
}
```

Source: `apps/web/src/hooks/useDraftPersistence.ts`.

### Anti-Patterns to Avoid

- **Mutating graph data directly:** Always copy nodes before adding `fx`/`fy`. The `data` from `useGraphData` should be treated as immutable.
- **Relying on nodePositionUpdate for persistence:** The `nodePositionUpdate` prop is for rendering; use node `fx`/`fy` for fixed positions.
- **Embedding pinned state in note frontmatter:** Pinned positions are UI-only; don't pollute note storage.
- **Complex drag image updates:** The drag ghost is static; don't try to dynamically update it during drag—it's unnecessary and performance-costly.
- **Placing drop logic inside ForceGraph:** Drop handling belongs in the Editor component; keep concerns separated.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                         | Don't Build              | Use Instead                                      | Why                                                                          |
| ------------------------------- | ------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------- |
| Node drag interaction           | Custom mouse handlers    | `enableNodeDrag` prop from react-force-graph-2d  | Library handles drag physics, positioning, and coordinate updates            |
| Fixed nodes in force simulation | Manual force adjustments | D3-force `fx`/`fy` properties                    | Standard pattern; nodes with `fx`,`fy` ignore forces                         |
| Insertion indicator in editor   | Custom overlay div       | CodeMirror `dropCursor` extension                | Built-in, integrates with editor coordinates, handles dragover automatically |
| Cross-page drag data transfer   | Global event bus         | HTML5 `dataTransfer`                             | Native browser support; works across windows/tabs                            |
| Client-side persistence         | Custom storage layer     | `localStorage` API                               | Already used in codebase; sufficient for small data                          |
| Context menu UI                 | From-scratch positioning | Simple absolute div with click-outside detection | Can be implemented quickly; no need for heavy library                        |
| Canvas node badging             | Complex canvas drawing   | Canvas `arc`, `lineTo` in existing `paintNode`   | Already customizing node drawing; extend it                                  |

**Key insight:** The force-graph library already implements most of the heavy lifting for dragging and fixed positions. The integration work is about wiring events, maintaining React state, and handling the editor drop.

## Common Pitfalls

### Pitfall 1: Inadvertent mutation of graph data

**What goes wrong:** Adding `fx`/`fy` directly to nodes returned from `useGraphData` mutates the query cache, causing stale checks and React state inconsistencies.

**Why it happens:** React Query returns the same object references; mutating them breaks cache invariants.

**How to avoid:** Always create new node objects when augmenting: `nodes.map(node => ({ ...node, fx, fy }))`.

**Warning signs:** Unexpected re-renders, loss of pin state after updates, TypeScript errors about property existence.

### Pitfall 2: HTML5 dragstart not firing or interfering with force-graph drag

**What goes wrong:** The canvas `dragstart` event may not fire if the user hasn't moved enough, or force-graph's own drag handling might prevent it.

**Why it happens:** HTML5 drag requires a threshold movement after mousedown. If the force-graph consumes the mousedown or calls `preventDefault`, dragstart may be canceled.

**How to avoid:** Ensure the canvas is `draggable` (the wrapper div can have `draggable={true}`). Set the flag when `onNodeDrag` first fires to indicate a node is being dragged. In `onDragStart`, check that flag; if not set, call `e.preventDefault()` to cancel the browser drag. Also make sure no parent element has `user-select: none` interfering.

**Warning signs:** Dragging a node does not show the custom drag ghost; dragover/drop events not firing.

### Pitfall 3: Drop on existing WikiLink fails to replace

**What goes wrong:** The simple regex approach might miss multi-line links or nested brackets, or replace only part of the link.

**Why it happens:** Wiki links are expected to be single-line and not contain nested `[[` but edge cases exist (e.g., `[[outer [[inner]]]]` unlikely).

**How to avoid:** Keep replacement logic simple: find nearest `[[` before drop position and `]]` after. Ensure the closing bracket is on the same line (optional but reduces false positives). For now, assume well-formed links are single-line.

**Warning signs:** Dropping on a link inserts new link instead of replacing, leaving double brackets.

### Pitfall 4: Dragged node position not updating after pin

**What goes wrong:** When a pinned node is dragged and dropped, it reverts to old position because `fx`/`fy` weren't updated.

**Why it happens:** Updating `pinnedNodes` in React state is asynchronous; the drag end event might fire before state update, causing the node to lose its fixed coordinates temporarily.

**How to avoid:** In `onNodeDragEnd`, immediately set `node.fx = node.x; node.fy = node.y;` (mutating the internal node) AND update the React state. This ensures the node stays in place until the re-render confirms the updated position.

**Warning signs:** Pinned node snaps back to previous location after dragging.

### Pitfall 5: Context menu loses position on scroll

**What goes wrong:** The context menu appears at the wrong coordinates after scrolling the page.

**Why it happens:** Using `clientX`/`clientY` for absolute positioning is fine relative to viewport, but if the menu is inside a scrolled container, need to account for offsets.

**How to avoid:** Position the menu using `position: fixed` with `left: event.clientX` and `top: event.clientY`. Use a portal if necessary to avoid overflow clipping.

**Warning signs:** Menu appears offset when the page is scrolled.

### Pitfall 6: Drag indicator in editor flickers or lags

**What goes wrong:** The insertion indicator (via `dropCursor`) jumps or lags behind the mouse.

**Why it happens:** `dropCursor` relies on native `dragover` events; if the drag is over a different page (tab), the indicator may not update until the cursor re-enters.

**How to avoid:** Accept this limitation—cross-tab dragging cannot have live indicator on the minimized tab. When over the editor page, it should work normally. Ensure the editor responds to `dragover` and doesn't block updates.

**Warning signs:** Indicator appears only after a delay or doesn't move smoothly.

## Code Examples

### Example 1: Enabling Node Drag and Visual Feedback

Source: `ForceGraph.tsx` (modified)

```typescript
interface ForceGraphProps {
  // ...existing
}

interface InternalNode extends GraphNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;   // fixed x for pinning
  fy?: number;   // fixed y for pinning
}

export const ForceGraph = forwardRef<ForceGraphHandle, ForceGraphProps>(
  ({ data, onNodeClick, onNodeDoubleClick, initialZoom, initialCenter }, ref) => {
    const { graphState, updateGraphState, pinNode, unpinNode } = useGraphState();
    // ...existing state
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const dragFlagRef = useRef(false);
    const [draggedNodeForDT, setDraggedNodeForDT] = useState<GraphNode | null>(null);

    // Augment nodes with pinned positions
    const augmentedData = useMemo(() => ({
      nodes: data.nodes.map(node => {
        const pinnedPos = graphState.pinnedNodes[node.id];
        return {
          ...node,
          ...(pinnedPos && { fx: pinnedPos.x, fy: pinnedPos.y })
        };
      }),
      links: data.links
    }), [data, graphState.pinnedNodes]);

    const handleNodeDrag = useCallback((node: InternalNode, translate: {x: number, y: number}) => {
      if (!dragFlagRef.current) {
        dragFlagRef.current = true;
        setDraggingNodeId(node.id);
        setDraggedNodeForDT(node as GraphNode);
      }
    }, []);

    const handleNodeDragEnd = useCallback((node: InternalNode, translate: {x: number, y: number}) => {
      setDraggingNodeId(null);
      dragFlagRef.current = false;

      // If node was pinned before drag, update its stored position
      if (graphState.pinnedNodes[node.id]) {
        // Mutate immediately to prevent spring-back before re-render
        node.fx = node.x;
        node.fy = node.y;
        // Update React state (persists to localStorage)
        updateGraphState({
          pinnedNodes: {
            ...graphState.pinnedNodes,
            [node.id]: { x: node.x, y: node.y }
          }
        });
      }
      // Clear drag data after a tick
      setTimeout(() => setDraggedNodeForDT(null), 0);
    }, [graphState.pinnedNodes, updateGraphState]);

    // Wrapper drag handler for HTML5 DataTransfer
    const handleDragStart = useCallback((e: React.DragEvent) => {
      if (!draggedNodeForDT) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData('application/json', JSON.stringify({
        id: draggedNodeForDT.id,
        name: draggedNodeForDT.name
      }));
      // Optional: set plain text fallback
      e.dataTransfer.setData('text/plain', draggedNodeForDT.name);
      e.dataTransfer.effectAllowed = 'copy';

      // Create drag ghost (full node)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const size = 40;
      canvas.width = size;
      canvas.height = size + 12; // space for label
      // Draw circle
      ctx.beginPath();
      ctx.arc(size/2, size/2, 12, 0, Math.PI*2);
      ctx.fillStyle = '#2196F3'; // note color
      ctx.fill();
      ctx.strokeStyle = '#0D47A1';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Draw label
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(draggedNodeForDT.name, size/2, size + 10);
      e.dataTransfer.setDragImage(canvas, size/2, size/2);
    }, [draggedNodeForDT]);

    // Dimming logic in paintNode: incorporate draggingNodeId
    const paintNode = useCallback((node: InternalNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const { x, y, type, name } = node;
      // ...
      const isDraggingThis = draggingNodeId === node.id;
      const isDimmed = draggingNodeId
        ? (!isDraggingThis && !isFlashed && !isHovered)
        : (highlightNodes.size > 0 && !isHighlighted && !isFlashed) || isGhosted;
      // ...rest of drawing
    }, [hoverNode, highlightNodes, flashNodeId, visibleNodes, draggingNodeId]);

    return (
      <div
        className="relative w-full h-full"
        draggable
        onDragStart={handleDragStart}
        style={{ cursor: draggingNodeId ? 'grabbing' : 'default' }}
      >
        <ForceGraph2D
          ref={fgRef}
          graphData={augmentedData}
          enableNodeDrag={true}
          onNodeClick={handleClick}
          onNodeHover={handleNodeHover}
          onNodeDrag={handleNodeDrag}
          onNodeDragEnd={handleNodeDragEnd}
          onNodeRightClick={(node, event) => {
            // Open context menu
            setContextMenu({ node: node as GraphNode, x: event.clientX, y: event.clientY });
          }}
          // ...other props
        />
        {/* Pin badge rendering in paintNode based on graphState.pinnedNodes[node.id] */}
      </div>
    );
  }
);
```

### Example 2: Graph State Context Extension

Source: `GraphStateContext.tsx` (modified)

```typescript
interface GraphState {
  zoom: number | undefined;
  center: GraphCenter | undefined;
  selectedNodeId: string | null;
  filterTags: string[];
  filterLogic: "AND" | "OR";
  localNodeId: string | null;
  pinnedNodes: Record<string, { x: number; y: number }>; // NEW
}

interface GraphStateContextType {
  // ...existing
  updateGraphState: (updates: Partial<GraphState>) => void;
  pinNode: (id: string, x: number, y: number) => void;       // NEW
  unpinNode: (id: string) => void;                            // NEW
}

const defaultState: GraphState = {
  // ...existing
  pinnedNodes: {}, // NEW
};

export function GraphStateProvider({ children }: { children: ReactNode }) {
  const [graphState, setGraphState] = useState<GraphState>(defaultState);

  const updateGraphState = (updates: Partial<GraphState>) => {
    setGraphState(prev => ({ ...prev, ...updates }));
  };

  const pinNode = useCallback((id: string, x: number, y: number) => {
    setGraphState(prev => ({
      ...prev,
      pinnedNodes: { ...prev.pinnedNodes, [id]: { x, y } }
    }));
  }, []);

  const unpinNode = useCallback((id: string) => {
    setGraphState(prev => {
      const { [id]: _, ...rest } = prev.pinnedNodes;
      return { ...prev, pinnedNodes: rest };
    });
  }, []);

  // ...
  return (
    <GraphStateContext.Provider value={{
      graphState,
      setGraphState,
      updateGraphState,
      setFilterTags,
      setFilterLogic,
      setLocalNodeId,
      pinNode,    // NEW
      unpinNode,  // NEW
    }}>
      {children}
    </GraphStateContext.Provider>
  );
}
```

### Example 3: Context Menu Component

`GraphContextMenu.tsx`:

```typescript
export function GraphContextMenu({ node, x, y, onClose, onPin, onUnpin, isPinned }: {
  node: GraphNode;
  x: number;
  y: number;
  onClose: () => void;
  onPin: () => void;
  onUnpin: () => void;
  isPinned: boolean;
}) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!e.target.closest('.context-menu')) onClose();
    };
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed z-50 bg-white dark:bg-nord-polar1 rounded-lg shadow-xl border border-nord-snow0 dark:border-nord-polar2 py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      <button
        className="w-full px-4 py-2 text-left text-nord-polar0 dark:text-nord-snow2 hover:bg-nord-snow1 dark:hover:bg-nord-polar2 flex items-center gap-2"
        onClick={() => { isPinned ? onUnpin() : onPin(); onClose(); }}
      >
        {isPinned ? <UnpinIcon className="w-4 h-4" /> : <PinIcon className="w-4 h-4" />}
        {isPinned ? 'Unpin' : 'Pin'}
      </button>
    </div>
  );
}
```

## State of the Art

| Old Approach                         | Current Approach                         | When Changed     | Impact                                                             |
| ------------------------------------ | ---------------------------------------- | ---------------- | ------------------------------------------------------------------ |
| Manual pin state in note frontmatter | Separate localStorage mapping (UI-only)  | Phase 23         | Keeps note data clean; UI preferences don't clutter markdown files |
| Custom drag implementations          | Use react-force-graph's enableNodeDrag   | Always available | Leverages tested physics and coordinate handling                   |
| Editor drop via DOM manipulation     | CodeMirror DropCursor + domEventHandlers | CodeMirror 6     | Consistent with editor architecture; no hacky workarounds          |
| Global variables for drag state      | React state with refs for batching       | Modern React     | Better encapsulation and fewer bugs                                |

**Deprecated/outdated:**

- None applicable; all approaches are current.

## Open Questions

1. **Should unpinned nodes retain their position across a single session?** Decisions say "Unpinned nodes keep their position (they don't reset to auto-layout)". This implies that after dragging an unpinned node, it stays where dropped until the simulation moves it naturally. Implementation: In `onNodeDragEnd`, we _do not_ clear `fx`/`fy` for unpinned nodes – but force-graph automatically clears them after drag end by default. If we want them to stay temporarily, we may need to avoid the library's internal cleanup. **Tradeoff:** Letting them stay without `fx`/`fy` is impossible because forces will act. Setting `fx`/`fy` would pin them. We interpret "keep their position" as the node doesn't snap back instantly; it remains at dropped coordinates but slowly drifts due to forces. That matches the default behavior of force-graph: after drag, the node's `fx`/`fy` are cleared, but its current `x`/`y` are left as starting point for forces. The node will gradually move, not snap. **Recommendation:** Use default force-graph behavior (no special handling) for unpinned nodes; only pinned nodes get persistent `fx`/`fy`. This satisfies "keep their position" in the immediate sense and "auto-layout runs normally" in the longer term.

2. **What opacity level for dimmed nodes during drag?** Left to discretion. Recommend `globalAlpha = 0.3` or a distinct dimmed color (e.g., `COLORS.dimmed` from existing palette). We'll follow the existing dimming pattern used for ghosted nodes (`isGhosted` -> 0.15 alpha). For dragging dim, use 0.4 alpha for clear distinction.

3. **Should wiki link replacement be case-sensitive?** The decision doesn't specify. Node names may have mixed case. Wiki links often preserve case. For replacement detection, we should match exact text; thus it will be case-sensitive. That's acceptable.

## Sources

### Primary (HIGH confidence)

- `react-force-graph-2d` type definitions (`/home/ubuntu/projects/notetaiker/node_modules/.pnpm/react-force-graph-2d@1.29.0_react@19.2.3/node_modules/react-force-graph-2d/dist/react-force-graph-2d.d.ts`)
- `force-graph` source index (`/home/ubuntu/projects/notetaiker/node_modules/.pnpm/force-graph@1.51.0/node_modules/force-graph/src/index.d.ts`)
- CodeMirror 6 documentation (API reference for `domEventHandlers`, `dropCursor`)
- Existing codebase patterns:
  - `apps/web/src/hooks/useDraftPersistence.ts` (localStorage hook)
  - `apps/web/src/components/graph/ForceGraph.tsx` (graph implementation)
  - `apps/web/src/components/editor/Editor.tsx` (CodeMirror integration)

### Secondary (MEDIUM confidence)

- HTML5 Drag and Drop API (MDN Web Docs) — standard browser API, universally supported

### Tertiary (LOW confidence)

- React-force-graph example directory listing ("fix-dragged-nodes", "drag-nodes") via GitHub repository browsing — indicates features exist but no code available due to 404s; inferred from type definitions.

## Metadata

**Confidence breakdown:**

- Standard Stack: HIGH — based on installed package types and existing codebase
- Architecture: HIGH — patterns derived from type definitions and established React practices
- Pitfalls: HIGH — based on common React/Canvas pitfalls observed in similar projects

**Research date:** 2026-02-08
**Valid until:** 2026-05-08 (30 days for stable APIs)

## RESEARCH COMPLETE

**Phase:** 23 - Spatial Interaction & Linking
**Confidence:** HIGH

### Key Findings

1. react-force-graph-2d provides all necessary drag APIs: `enableNodeDrag`, `onNodeDrag`, `onNodeDragEnd`, and fixed positions via `fx`/`fy`.
2. Type definitions confirm `fx`/`fy` are the mechanism for pinning nodes.
3. CodeMirror 6 has `dropCursor` extension for insertion indicator and `domEventHandlers` for custom drop logic.
4. Cross-page drag works via HTML5 DataTransfer; custom drag image provides "full node ghost".
5. Existing localStorage pattern (`useDraftPersistence`) should be replicated for pinned positions.
6. GraphStateContext should be extended to manage pinned nodes as a separate map.

### File Created

`.planning/phases/23-spatial-interaction-linking/23-RESEARCH.md`

### Confidence Assessment

| Area           | Level | Reason                                          |
| -------------- | ----- | ----------------------------------------------- |
| Standard Stack | HIGH  | Types and existing code confirm APIs            |
| Architecture   | HIGH  | Clear integration points in existing components |
| Pitfalls       | HIGH  | Based on common Canvas/React/DnD issues         |

### Open Questions

1. Exact behavior for unpinned node position retention — resolved by using default force-graph behavior.
2. Dim opacity level and pin icon styling — user discretion; recommended values provided.

### Ready for Planning

Research complete. Planner can now create PLAN.md files with concrete tasks.
