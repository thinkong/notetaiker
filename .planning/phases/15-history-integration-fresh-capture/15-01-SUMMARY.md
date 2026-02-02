---
phase: 15-history-integration-fresh-capture
plan: 01
subsystem: web-client
tags: [react, hooks, state-management]
requires: [14-02]
provides: [reactive-note-id, fresh-capture-logic]
affects: [15-02, 15-03]
tech-stack:
  added: []
  patterns: [synchronized-ref-state]
key-files:
  created: []
  modified: [apps/web/src/hooks/useDebouncedSave.ts, apps/web/src/App.tsx]
metrics:
  duration: 345s
  completed: 2026-02-02
---

# Phase 15 Plan 01: Reactive Note ID & Fresh Capture Summary

Exposed the current note ID as reactive state in the persistence hook and implemented the 'New Note' reset logic in the main application component to support clean transitions between draft and editing modes.

## Accomplishments

### 1. Reactive Note ID State
Converted `noteId` from a pure `useRef` to a synchronized `useState` + `useRef` pattern in `useDebouncedSave`. This ensures that the current note ID is reactive (triggering re-renders when it changes) while remaining accessible to the debounced save closure without stale closures.

### 2. Explicit Save Cancellation
Added `cancelSave` to the `useDebouncedSave` hook, allowing the UI to explicitly stop any pending background saves when transitioning to a new note or clearing state.

### 3. Handle New Note Logic
Implemented `handleNewNote` in `App.tsx` which orchestrates a full reset of the capture environment:
- Cancels pending saves.
- Clears the active `noteId`.
- Resets editor content and local draft persistence.
- Marks the state as clean (no unsaved changes).
- Re-focuses the editor for immediate typing.

### 4. Reactive UI Feedback
Updated the header subtitle to reactively reflect the current mode: "Editing Note" when a `noteId` is present, and the standard welcome message when in "Draft" mode.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added cancelSave functionality**
- **Found during:** Task 1
- **Issue:** Without explicit cancellation, a user clicking "New Note" might still have a pending save from their previous draft fire and overwrite or conflict with the new state.
- **Fix:** Added `cancelSave` to the hook and called it in `handleNewNote`.
- **Files modified:** `apps/web/src/hooks/useDebouncedSave.ts`, `apps/web/src/App.tsx`
- **Commit:** `4c7021c`

**2. [Rule 3 - Blocking] Prettier/Lint formatting errors**
- **Found during:** Task 2
- **Issue:** Commit failed due to prettier formatting rules (ternary operator line breaks) and an unused variable (`noteId`).
- **Fix:** Manually formatted the code to satisfy prettier and used the `noteId` variable in the header subtitle.
- **Files modified:** `apps/web/src/App.tsx`
- **Commit:** `b0034ee`

## Decisions Made

- [15-01]: Used a synchronized state+ref pattern for `noteId` to balance React reactivity with debounced closure requirements.
- [15-01]: Chose to update the header subtitle as a visual indicator of "Draft" vs "Editing" mode.

## Next Phase Readiness

The system now has a clear concept of "What note am I editing?". This unblocks Plan 02, which will focus on loading historical notes into this state.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
