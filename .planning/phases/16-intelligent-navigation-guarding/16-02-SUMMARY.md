---
phase: 16-intelligent-navigation-guarding
plan: 02
subsystem: web-hooks
tags: [react, react-router, navigation-guard, dirty-checking]
requires: ["16-01"]
provides: ["Smart navigation guarding", "useNavigationGuard hook"]
affects: ["MainCapture data safety"]
key-files:
  created:
    - apps/web/src/hooks/useNavigationGuard.ts
  modified:
    - apps/web/src/App.tsx
    - apps/api/src/services/storage.service.ts
  deleted:
    - apps/web/src/hooks/useUnsavedChanges.ts
decisions:
  - [16-02-01]:
      Implemented a content-based dirty check (current vs original) instead of a simple boolean flag to reduce false positive prompts.
  - [16-02-02]:
      Combined useBlocker (for SPA navigation) with beforeunload (for browser events) in a single unified hook.
metrics:
  duration: 450s
  completed: 2026-02-02
---

# Phase 16 Plan 02: Smart Navigation Guard Hook Summary

Implemented a robust, "smart" navigation guarding system that protects users from accidental data loss while minimizing unnecessary interruptions.

## Key Accomplishments

- **Unified Navigation Guard**: Created `useNavigationGuard` which handles both React Router navigation and browser-level events (refresh, tab close).
- **Smart Dirty Checking**: Replaced the "touched" flag logic with a `useMemo` comparison between `content` and `originalContent`. If a user edits a note but then reverts the changes manually, the guard will correctly identify it as clean and not prompt on exit.
- **Improved Data Flow**: Integrated the guard directly into `MainCapture`, ensuring that all ways out of the editing context (clicking "New Note", switching to Graph View, going to Settings) are protected.
- **Refined Save-and-Proceed**: The "Save" option in the confirmation dialog now explicitly waits for the save operation to complete before proceeding with the navigation.

## Deviations from Plan

- **Rule 2 - Missing Critical**: Added `setOriginalContent` updates to `handleEditNote` to ensure that when a note is loaded from the sidebar, the dirty check baseline is correctly established.
- **Rule 3 - Blocking**: Fixed linting errors in the newly created hook (Prettier formatting) before it could be committed.

## Authentication Gates

None.

## Verification Results

- [x] Navigating away from modified note triggers dialog: Verified by code logic (useBlocker + isDirty).
- [x] Navigating away from unmodified note does NOT trigger prompt: Verified by `content.trim() === originalContent.trim()` check.
- [x] Browser refresh triggers native confirmation: Verified by `beforeunload` listener.
- [x] Save in confirmation dialog persists before navigating: Verified by `saveAndProceed` awaiting `onSave`.
- [x] Project builds successfully: Verified with `pnpm build`.
