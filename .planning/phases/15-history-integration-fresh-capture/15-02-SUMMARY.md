---
phase: 15-history-integration-fresh-capture
plan: 02
subsystem: web-client
tags: [react, ui, sidebar, loading]
requires: [15-01]
provides: [sidebar-highlighting, note-loading-states]
affects: [15-03]
tech-stack:
  added: []
  patterns: [skeleton-loading]
key-files:
  created: []
  modified:
    [
      apps/web/src/components/sidebar/SidebarNoteCard.tsx,
      apps/web/src/components/sidebar/SidebarTimeline.tsx,
      apps/web/src/App.tsx,
    ]
metrics:
  duration: 300s
  completed: 2026-02-02
---

# Phase 15 Plan 02: Sidebar Integration & Note Loading Summary

Integrated the active note state with the sidebar to provide visual feedback on which note is being edited, and implemented a skeleton loading state for smooth transitions when switching between notes.

## Accomplishments

### 1. Active Note Highlighting

Updated the sidebar components to reflect the currently active note:

- `SidebarTimeline` now accepts an `activeNoteId` prop from the main application.
- `SidebarNoteCard` uses this prop to apply a visual highlight (`border-nord-frost3`, `bg-nord-snow0/80`) when it matches the note's ID.
- This provides immediate visual confirmation to the user about which historical note they are currently modifying.

### 2. Note Transition Loading States

Improved the perceived performance and UX when loading notes from history:

- Added `isLoadingNote` state to track background API fetches during note selection.
- Implemented a skeleton loading UI in `App.tsx` that replaces the Editor while content is being fetched.
- This prevents layout shifts and gives clear feedback that the system is responding to the user's click.

### 3. State Synchronization

Ensured that the sidebar highlight correctly synchronizes with the application state:

- When "New Note" is clicked, the `activeNoteId` becomes null, and the sidebar highlight is automatically removed.
- When a note is successfully saved and the editor resets, the highlight is cleared.

## Deviations from Plan

None - plan executed as written.

## Decisions Made

- [15-02]: Chose a subtle background tint and border for the active note highlight to maintain the clean Nord aesthetic while remaining clearly visible.
- [15-02]: Implemented a simple vertical skeleton pattern for the loading state to match the expected markdown document structure.

## Next Phase Readiness

The application now has solid visual feedback for its "Draft" vs "Editing" modes. Plan 03 will focus on refining these visuals with explicit badges, dynamic labels, and the `Cmd+N` shortcut.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
