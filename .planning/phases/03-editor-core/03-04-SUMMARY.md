---
phase: 03-editor-core
plan: 04
subsystem: ui-persistence
tags: [theming, persistence, api, storage, react-hooks]
requires: ["02", "03-03"]
provides: ["Session-based note updates", "Nord theme completeness"]
affects: ["04-01"]
tech-stack:
  added: []
  patterns: ["Session-based ID tracking using Refs", "Atomic file updates by ID"]
key-files:
  created: []
  modified:
    - apps/web/src/index.css
    - apps/api/src/services/storage.service.ts
    - apps/api/src/routes/notes.ts
    - apps/web/src/hooks/useDebouncedSave.ts
decisions:
  - Fixed visual regression by defining missing Nord4-6 theme colors.
  - Implemented Note ID tracking in frontend using a Ref to ensure stable debounced save behavior across sessions.
  - Enabled in-place updates in StorageService by searching for existing files by ID before generating new filenames.
metrics:
  duration: 5.03m
  completed: 2026-01-27
---

# Phase 03 Plan 04: Gap Closure - Persistence & Styling Summary

## Objective
Close identified gaps in Phase 03: Fix missing Nord4 theme colors and implement Note ID tracking to ensure session persistence (updating instead of creating new files).

## Results

### Visual Improvements
- Added `--color-nord4`, `--color-nord5`, and `--color-nord6` to the Tailwind `@theme` block in `apps/web/src/index.css`.
- This ensures the `StatusIndicator` correctly resolves `text-nord4/50` color.

### Persistence Engine
- **Storage Service:** Modified `saveNote` to accept an `id`. It now searches for existing files with the matching ID using `findFilePathById`. If found, it overwrites the file while updating `updatedAt`; otherwise, it creates a new file.
- **API Routes:** Updated the POST `/notes` endpoint to extract `id` from the request body and pass it to the storage service.
- **Frontend Hook:** Updated `useDebouncedSave` to track the current note's ID using a `useRef`. The first successful save captures the ID returned by the API, and subsequent saves in the same session pass this ID back to the API.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] React Ref Access During Render**
- **Found during:** Task 3 commit (lint check)
- **Issue:** The initial implementation of `useDebouncedSave` was accessing `noteIdRef.current` inside `useMemo`, which triggered a React lint error ("Cannot access refs during render").
- **Fix:** Refactored the hook to initialize the debounced save function inside a `useEffect` and store the debouncer itself in a ref (`debouncedSaveRef`). This ensures stability and follows React best practices for refs.
- **Files modified:** `apps/web/src/hooks/useDebouncedSave.ts`
- **Commit:** `144fe36`

**2. [Rule 3 - Blocking] Unused Import**
- **Found during:** Task 3 commit (lint check)
- **Issue:** `useMemo` became unused after the refactor to use `useEffect`.
- **Fix:** Removed the unused import.
- **Files modified:** `apps/web/src/hooks/useDebouncedSave.ts`
- **Commit:** `144fe36`

## Verification Results
- **Manual Verification:** Verified via script `verify-storage.js` that `StorageService.saveNote` correctly updates an existing file when an ID is provided, maintaining a single file in the directory.
- **Visual Check:** Confirmed `index.css` contains the required Nord variables.

## Next Phase Readiness
- The capture interface is now stable and doesn't bloat the storage with duplicate files.
- Visual styling for status indicators is correct.
- Ready for Phase 04: List View & Navigation.
