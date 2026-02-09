---
phase: 22-graph-filtering-local-view
plan: 01
subsystem: graph-viz
tags: [react, force-graph, canvas, state-management]
requires: [21-02]
provides: [filtering-rendering, local-view-logic]
affects: [22-02]
tech-stack:
  added: []
  patterns: [Ghosting (Opacity-based filtering), 1-hop focus]
key-files:
  created: []
  modified:
    - apps/web/src/contexts/GraphStateContext.tsx
    - apps/web/src/components/graph/ForceGraph.tsx
decisions:
  - Ghosted nodes/links use 0.15 opacity but remain interactive.
  - Local view focus shifts on single-click to visible neighbor nodes.
  - Alt + Double-click used as the primary entry/exit toggle for local view.
metrics:
  duration: 11m
  completed: 2026-02-06
---

# Phase 22 Plan 01: Establish Filter and Local View Logic Summary

## Substantive Summary

Implemented the core logic for graph filtering and local "focus" view. The `GraphStateContext` was expanded to store `filterTags`, `filterLogic`, and `localNodeId`. The `ForceGraph` component now calculates node/link visibility based on these states.

Nodes that don't match the current filter or are outside the 1-hop radius of a focused node are rendered as "ghosts" with 15% opacity using the Canvas `globalAlpha` property. This allows the graph layout to remain stable while providing visual focus.

Navigation features include:

- **Alt + Double-click**: Enters local view for a node, centering the camera and zooming in.
- **Walking the Graph**: While in local view, single-clicking a visible neighbor shifts the focus to that node.
- **Filtering**: Nodes/links dim automatically when tags are applied via context (to be wired to UI in next plan).

## Task Commits

- `833afaa`: feat(22-01): update GraphStateContext for filtering and local view
- `2b5f0c2`: feat(22-01): implement graph filtering and local view rendering

## Deviations from Plan

- None - plan executed exactly as written.

## Self-Check: PASSED

- [x] Commits 833afaa and 2b5f0c2 exist.
- [x] apps/web/src/contexts/GraphStateContext.tsx modified.
- [x] apps/web/src/components/graph/ForceGraph.tsx modified.
