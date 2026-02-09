---
phase: 20-related-notes
plan: 02
subsystem: web-ui
tags: [react, sidebar, vector-search, related-notes]
requires: [20-01]
provides: [related-notes-ui]
affects: [user-experience]
tech-stack:
  added: []
  patterns: [tab-switcher, similarity-indicator]
key-files:
  created: [apps/web/src/components/sidebar/RelatedNotesPanel.tsx]
  modified: [apps/web/src/components/sidebar/Sidebar.tsx, apps/web/src/App.tsx]
decisions:
  - Added a Similarity Percentage indicator to related note cards (calculated from L2 distance).
  - Integrated tab switcher in Sidebar to toggle between History and Related notes.
  - Sidebar automatically switches back to 'History' if the active note is cleared.
metrics:
  duration: 484s
  completed: 2026-02-06
---

# Phase 20 Plan 02: Related Notes UI Summary

## One-liner

Implemented a tabbed sidebar panel that displays semantically related notes with similarity indicators for the active note.

## Task Commits

| Task | Name                               | Commit  | Files                                                             |
| ---- | ---------------------------------- | ------- | ----------------------------------------------------------------- |
| 1    | Create RelatedNotesPanel Component | 3f03efa | apps/web/src/components/sidebar/RelatedNotesPanel.tsx             |
| 2    | Integrate into Sidebar             | 4179777 | apps/web/src/components/sidebar/Sidebar.tsx, apps/web/src/App.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] React cascading render warning in Sidebar**

- **Found during:** Linting
- **Issue:** Using `useEffect` to call `setActiveTab` when `activeNoteId` changed caused a cascading render warning.
- **Fix:** Refactored the tab state logic to derive the active tab display value from both the state and the `activeNoteId` presence.
- **Files modified:** apps/web/src/components/sidebar/Sidebar.tsx
- **Commit:** 4179777

**2. [Rule 3 - Blocking] Linting errors (any types, prettier)**

- **Found during:** Pre-commit hooks
- **Issue:** `any` type used in `RelatedNotesPanel.tsx` and Prettier formatting mismatches.
- **Fix:** Defined `SimilarNote` interface and manually aligned formatting to match the project's Prettier config.
- **Files modified:** apps/web/src/components/sidebar/RelatedNotesPanel.tsx
- **Commit:** 3f03efa, 4179777

## Success Criteria Verification

- [x] Opening a note triggers a fetch for related notes: Verified via `useQuery` dependency on `noteId`.
- [x] Related notes are displayed in the sidebar: Verified implementation of `RelatedNotesPanel`.
- [x] Clicking a related note opens it in the editor: Verified `onNoteClick` propagation.

## Self-Check: PASSED
