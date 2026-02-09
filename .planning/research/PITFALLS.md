# Domain Pitfalls: Interactive Graphs

**Domain:** Interactive Graph Visualization
**Researched:** 2026-02-06

## Critical Pitfalls

Mistakes that cause significant performance issues or user frustration.

### 1. The "Spaghetti Ball" Performance

**What goes wrong:** Rendering 1000+ nodes and 2000+ edges as SVG elements kills browser performance.
**Prevention:** Use **HTML5 Canvas** for rendering the graph body. Keep only the tooltips and active interaction layers in the DOM.
**Detection:** FPS drops below 30 during pan/zoom operations.

### 2. The "Endless Jiggle"

**What goes wrong:** Force-directed simulations that never "cool down" make it impossible to click specific nodes.
**Prevention:** Implement a `decay` or `alphaMin` threshold in the D3 simulation. Once the energy drops below a level, freeze the layout.
**Detection:** Nodes constantly vibrate even when the user isn't interacting.

### 3. Navigation Disorientation

**What goes wrong:** Clicking a node in the graph opens a note but "loses" the user's place in the graph (e.g., resets zoom/pan).
**Prevention:** Persist graph view state in a global store (Zustand). Use "Center on Node" animations rather than hard jumps.

---

## Moderate Pitfalls

### 4. Over-sensitive Drag & Drop

**What goes wrong:** Accidentally dragging a node while trying to click it (or vice-versa).
**Prevention:** Implement a drag threshold (e.g., 5-10 pixels of movement required before "dragging" state begins).

### 5. Semantic Noise

**What goes wrong:** Showing too many semantic connections makes the graph unreadable.
**Prevention:** Only show semantic links (un-explicit links) when a node is hovered or when a specific "Similarity" filter is active.

---

## Phase-Specific Warnings

| Phase                     | Likely Pitfall       | Mitigation                                                                               |
| ------------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| **Initial Interactivity** | Physics collisions   | Tune `nodeSpacing` and `charge` early to avoid overlapping nodes.                        |
| **Drag-to-Editor**        | Drop Target mismatch | Ensure the Editor's drop zone correctly identifies the node ID and formats the Wikilink. |
| **Filtering**             | Layout jump          | When filtering, don't re-randomize node positions; start from current positions.         |

## Sources

- [D3-force Documentation: Alpha Decay](https://github.com/d3/d3-force#simulation_alphaDecay)
- [Obsidian Forum: "Graph view makes my laptop fans spin"](https://forum.obsidian.md/)
- [User Experience of Force-Directed Graphs](https://vdl.sci.utah.edu/blog/2017/11/08/graphs/)
