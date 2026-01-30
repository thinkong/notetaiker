# Phase 11: Graph View - Research

**Researched:** 2026-01-30
**Domain:** Graph Visualization / Force-Directed Graphs
**Confidence:** HIGH

## Summary

The research focused on implementing a force-directed graph visualization for NoteTaiker, specifically following the "Tag Hubs" pattern where notes connect to central tag nodes rather than directly to each other. The standard library for this in the React ecosystem is `react-force-graph`, which provides a high-performance 2D canvas-based implementation suitable for hundreds or thousands of nodes.

Key findings:
- **react-force-graph-2d** is the industry standard for React-based force graphs. It uses HTML5 Canvas for rendering, which is significantly more performant than SVG for large datasets while maintaining high interactivity.
- The "Tag Hub" pattern is best implemented by transforming the note list into a set of "Note Nodes" and "Tag Nodes" (virtual nodes) and creating links between them.
- Highlighting connected components on hover is a built-in capability but requires state management for optimal UX.
- React 19 compatibility is confirmed (peer dependencies are broad), though standard `ref` usage should follow the latest React 19 patterns (preferring props over `forwardRef` if applicable, though the library handles this internally).

**Primary recommendation:** Use `react-force-graph-2d` for the visualization and implement a custom data transformer to create the "Tag Hub" structure from the flat notes list.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-force-graph-2d` | ^1.25.x | Core graph visualization | High performance (Canvas), highly customizable, D3-force powered. |
| `d3-force` | ^3.0.x | Physics simulation | The gold standard for force-directed layout algorithms. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | ^0.x | Node icons | For differentiating "Tag" nodes from "Note" nodes visually. |
| `clsx` / `tailwind-merge` | Latest | Tooltip styling | For the requested preview tooltips. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-force-graph-2d` | `react-sigma` | Better for extremely large graphs (WebGL) but harder to customize tooltips/interactivity. |
| `react-force-graph-2d` | `react-d3-graph` | Uses SVG; performance degrades quickly after ~200 nodes. |

**Installation:**
```bash
npm install react-force-graph-2d d3-force
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/components/graph/
├── GraphView.tsx          # Main container and page
├── ForceGraph.tsx         # Wrapper for react-force-graph-2d
├── NoteSidePanel.tsx      # The side panel for note viewing
└── useGraphData.ts        # Data transformation hook (Notes -> Graph)
```

### Pattern 1: Tag Hub Transformation
**What:** Transforming a list of notes with tags into a bipartite-like graph where notes link to shared tag nodes.
**When to use:** Always, as per "Tag-Based Linking" decision.
**Example:**
```typescript
// Source: Community best practices for Obsidian-like graphs
function transformToTagHubs(notes: Note[]) {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const tagSet = new Set<string>();

  notes.forEach(note => {
    nodes.push({ id: note.id, type: 'note', name: note.title });
    note.tags.forEach(tag => {
      tagSet.add(tag);
      links.push({ source: note.id, target: `tag-${tag}` });
    });
  });

  tagSet.forEach(tag => {
    nodes.push({ id: `tag-${tag}`, type: 'tag', name: `#${tag}` });
  });

  return { nodes, links };
}
```

### Anti-Patterns to Avoid
- **Re-rendering the entire graph on hover:** Use local state or the library's internal `nodeCanvasObject` to handle highlights without a full React commit cycle.
- **Direct Note-to-Note links for tags:** The context explicitly requests "Tag Hubs" to avoid clutter and emphasize organization.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Physics Simulation | Custom gravity/springs | `d3-force` | Handling collision, repulsion, and centering is complex to get "right" and smooth. |
| Canvas Interactivity | Custom click/drag detection | `react-force-graph` | Library handles coordinate mapping, zoom levels, and object picking. |
| Pan/Zoom | Custom transform logic | `react-force-graph` (via d3-zoom) | Smooth interpolation and bound handling are non-trivial. |

**Key insight:** The physics engine is the most "magical" part of a graph view; using `d3-force` (via the wrapper) allows fine-tuning without writing differential equations.

## Common Pitfalls

### Pitfall 1: Canvas Density / Blur
**What goes wrong:** Labels and nodes look blurry on high-DPI screens.
**Why it happens:** The canvas isn't scaled to `window.devicePixelRatio`.
**How to avoid:** `react-force-graph` handles this by default, but custom `nodeCanvasObject` functions must use the provided scale.

### Pitfall 2: Label Overlap (Hairball)
**What goes wrong:** Text labels cover each other, making the graph unreadable.
**Why it happens:** Global graph view with many notes.
**How to avoid:** Implement "Adaptive Labels" (Decision) by checking `globalScale` provided by the library or only showing labels on hover/zoom.

### Pitfall 3: React 19 Ref Usage
**What goes wrong:** `graphRef.current` is null or methods are missing.
**Why it happens:** Incompatibility with new ref behavior or timing of canvas mounting.
**How to avoid:** Ensure `useEffect` is used for any imperative calls to the graph instance (like `d3Force('charge').strength(...)`).

## Code Examples

### Custom Node Styling (Differentiating Tags/Notes)
```typescript
// Source: https://github.com/vasturiano/react-force-graph/blob/master/example/custom-node-canvas/index.html
const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
  const label = node.name;
  const fontSize = 12 / globalScale;
  ctx.font = `${fontSize}px Sans-Serif`;

  // Draw Circle
  ctx.beginPath();
  ctx.arc(node.x, node.y, node.type === 'tag' ? 5 : 3, 0, 2 * Math.PI, false);
  ctx.fillStyle = node.type === 'tag' ? '#88c0d0' : '#d8dee9'; // Nord theme colors
  ctx.fill();

  // Adaptive Label
  if (globalScale > 2 || node.isHovered) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#4c566a';
    ctx.fillText(label, node.x, node.y + (node.type === 'tag' ? 8 : 6));
  }
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SVG-based graphs | Canvas-based graphs | ~2022-2023 | Allows 5000+ nodes at 60fps on mobile. |
| Manual D3 management | React wrappers with hooks | Recent | Cleaner lifecycle management and better state sync. |

**Deprecated/outdated:**
- `react-d3-graph`: Mostly unmaintained, performance issues with many nodes.

## Open Questions

1. **"Ghost Nodes" Implementation:**
   - What we know: We need to show nodes for missing files/tags.
   - What's unclear: How the IndexerService currently reports "broken" links (it likely doesn't).
   - Recommendation: Create a virtual "Ghost" node type in the data transformer when a tag exists in a note but isn't in the global tag list (though in this system, tags *are* derived from notes, so "missing tags" is rare unless we add explicit tag definitions). Broken internal links are the primary use case.

2. **Side Panel Layout:**
   - What we know: Clicking a node opens a side panel.
   - What's unclear: Should it be a Right Sidebar or a Slide-over?
   - Recommendation: Implement as a `ResizableSidePane` on the right, keeping the Graph visible on the left/center.

## Sources

### Primary (HIGH confidence)
- [vasturiano/react-force-graph](https://github.com/vasturiano/react-force-graph) - Official documentation and examples for highlight/interactivity.
- [d3-force docs](https://github.com/d3/d3-force) - Physics simulation parameters.

### Secondary (MEDIUM confidence)
- [Obsidian Graph View logic](https://help.obsidian.md/Plugins/Graph+view) - Reference for "Tag Hubs" pattern.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - `react-force-graph` is the clear winner for React.
- Architecture: HIGH - Tag hubs and bipartite mapping are standard graph patterns.
- Pitfalls: MEDIUM - Depends on specific React 19 edge cases.

**Research date:** 2026-01-30
**Valid until:** 2026-03-01
