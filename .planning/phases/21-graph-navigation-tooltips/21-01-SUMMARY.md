---
phase: 21-graph-navigation-tooltips
plan: 01
subsystem: ui
tags:
  - graph
  - navigation
  - state-management
  - context
---

# Phase 21 Plan 01: Graph Persistence & Navigation Summary

Implemented graph state persistence and deep linking capabilities to ensure a seamless user experience when switching between the graph view and the editor.

## Key Deliverables

- **GraphStateContext**: A global context provider that maintains the camera state (zoom, center) of the force-directed graph even when the component unmounts.
- **Persistent Graph View**: The graph now remembers exactly where the user left it (pan/zoom position) when navigating away and returning.
- **Deep Linking Support**: `App.tsx` now listens for incoming navigation state (`noteId`), allowing other parts of the app (like the graph) to trigger opening a specific note in the editor.

## Technical Details

### Dependencies
- **Requires**: Existing GraphView and Editor components.
- **Provides**: `GraphStateProvider` and `useGraphState` hook.
- **Affects**: `App.tsx`, `GraphView.tsx`, `ForceGraph.tsx`.

### Tech Stack
- **Patterns**: React Context for global state, `useImperativeHandle` for exposing graph internal state, `useLocation` for navigation state handling.
- **Libraries**: `react-force-graph-2d` (interaction via ref).

### File Tracking
- **Created**:
  - `apps/web/src/contexts/GraphStateContext.tsx`
- **Modified**:
  - `apps/web/src/App.tsx`
  - `apps/web/src/components/graph/GraphView.tsx`
  - `apps/web/src/components/graph/ForceGraph.tsx`

## Decisions Made

- **Context-based Persistence**: Chose React Context over LocalStorage for graph state because the persistence only needs to last for the session. LocalStorage might be annoying if users return days later to a zoomed-in empty spot.
- **Navigation State**: Used `location.state` for passing `noteId` to the editor instead of URL query parameters for a cleaner URL and to treat it as an "action" rather than a permanent address for now (though URL support could be added later).
- **Ref Exposure**: Wrapped `ForceGraph` with `forwardRef` and `useImperativeHandle` to cleanly expose the internal D3 force graph methods (`zoom`, `centerAt`) needed for state restoration.

## Deviations from Plan

### Auto-fixed Issues
- **[Rule 1 - Bug] Linter errors in App.tsx**: Fixed a React hook dependency issue and a "setState in effect" warning by wrapping the state update in a `setTimeout` to push it to the next tick.
- **[Rule 1 - Bug] Lint fixes**: Fixed various prettier and import formatting issues in the new files.
