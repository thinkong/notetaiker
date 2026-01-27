---
phase: 04-timeline-ui
plan: 03
subsystem: Web
tags: [react, timeline, infinite-scroll, components]
requires: [04-02]
provides: [timeline-ui]
affects: []
tech-stack:
  added: []
  patterns: [Sentinel-based Infinite Scroll, Expand-in-place Cards, Skeleton Loading]
key-files:
  created:
    - apps/web/src/components/timeline/NoteCard.tsx
    - apps/web/src/components/timeline/SkeletonCard.tsx
    - apps/web/src/components/timeline/Timeline.tsx
  modified:
    - apps/web/src/App.tsx
    - apps/api/src/index.ts
decisions:
  - id: 04-03-title-extraction
    description: Implemented a simple title extraction heuristic for the timeline.
    rationale: If a note starts with a markdown header (#), it's treated as the title; otherwise, it's "Untitled Note". This improves scanability.
  - id: 04-03-line-clamping
    description: Clamped note body to 3 lines with an "expand" button.
    rationale: Prevents long notes from dominating the timeline while allowing access to full content without navigation.
---

# Phase 04 Plan 03: Implement Timeline UI Summary

## Objective
Implement the frontend components for the Timeline UI, including infinite scroll logic, note cards with "expand-in-place" functionality, and relative timestamps.

## Key Changes
- **NoteCard Component**: Displays note content with relative timestamps. Includes "Show more/less" toggle for long notes and displays tags if present.
- **SkeletonCard Component**: Provides a pulsed loading state matching the NoteCard layout.
- **Timeline Component**: Manages the infinite scroll feed using `react-intersection-observer`. Flattens paginated data from `useTimeline` and handles empty/loading/error states.
- **App Integration**: Positioned the Timeline below the Editor in the main layout with a divider.
- **API Export**: Exported `ParsedNote` and `NoteFrontmatter` types from `@notetaiker/api` to ensure type safety in the frontend components.

## Deviations from Plan
- **Rule 3 - Blocking**: Discovered that the `ParsedNote` type was not exported from the API package, causing build errors in the web app. Fixed by adding the export to `apps/api/src/index.ts`.

## Verification Results
- **Build/Lint**: Both `@notetaiker/api` and `@notetaiker/web` build and lint successfully.
- **Component Logic**: Verified that expansion logic, title extraction, and infinite scroll sentinel are correctly implemented.

## Next Phase Readiness
Phase 04 (Timeline UI) is now feature-complete. The user can capture notes and see them immediately appear in a smooth, infinite-scrolling history feed.
