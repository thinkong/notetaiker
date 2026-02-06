# Technology Stack: Interactive Graph Workspace

**Project:** NoteTaiker - Interactive Graph
**Researched:** 2026-02-06

## Recommended Stack

### Graph Visualization

| Technology            | Version | Purpose                   | Why                                                                  |
| --------------------- | ------- | ------------------------- | -------------------------------------------------------------------- |
| **D3.js**             | 7.x     | Force-directed simulation | Industry standard for high-performance physics-based graphs.         |
| **React-Force-Graph** | 1.x     | React Wrapper             | Simplifies integration of D3 force simulations into React lifecycle. |
| **Canvas API**        | N/A     | Rendering layer           | Better performance than SVG for graphs > 500 nodes.                  |

### State & Interaction

| Technology        | Version | Purpose       | Why                                                                    |
| ----------------- | ------- | ------------- | ---------------------------------------------------------------------- |
| **Zustand**       | 5.x     | View State    | Lightweight management of zoom levels, filters, and active nodes.      |
| **React-DND**     | 16.x    | Drag and Drop | Robust support for dragging between different areas (Graph -> Editor). |
| **Framer Motion** | 12.x    | Transitions   | Smooth animations for node expansions and filter transitions.          |

### Backend Support

| Technology        | Version | Purpose             | Why                                                                   |
| ----------------- | ------- | ------------------- | --------------------------------------------------------------------- |
| **SQLite (FTS5)** | N/A     | Fast Filtering      | Allows near-instant regex and full-text filtering for the graph view. |
| **Ollama**        | N/A     | Semantic Clustering | Existing infrastructure used for embedding-based grouping.            |

---

## Alternatives Considered

| Category  | Recommended       | Alternative     | Why Not                                                                     |
| --------- | ----------------- | --------------- | --------------------------------------------------------------------------- |
| Rendering | **Canvas**        | SVG             | SVG becomes slow with many nodes/edges due to DOM overhead.                 |
| Physics   | **D3-force**      | Cytoscape.js    | Cytoscape is great for analysis but less "organic" for exploration than D3. |
| Animation | **Framer Motion** | CSS Transitions | Framer handles complex layout changes (physics-to-static) more reliably.    |

---

## Installation

```bash
# Frontend dependencies
pnpm add d3 react-force-graph react-dnd react-dnd-html5-backend framer-motion zustand

# Type definitions
pnpm add -D @types/d3
```

## Sources

- [D3.js Official Documentation](https://d3js.org/)
- [React-Force-Graph Performance Benchmarks](https://github.com/vasturiano/react-force-graph)
- [MDN Canvas API vs SVG](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
