# Phase 13 Plan 03: Tag Curation UI Summary

## Summary

Updated the user interface to distinguish between user-defined (manual) tags and AI-generated suggestions. Implemented a curation workflow that allows users to dismiss unwanted AI tags, which also prevents them from being re-suggested by adding them to an `ignored_tags` list.

- Created a unified `Tag` component with visual variants: Blue for manual tags, Purple for AI tags.
- Added dismissal functionality (the 'x' button) for AI tags in the `NoteCard`.
- Updated `SidebarNoteCard` and `NoteSidePanel` to reflect the dual-source tag system.
- Enhanced the graph visualization to include AI tags in the network and side panel previews.

## Tech Stack

- **React**: UI components and state management.
- **Lucide React**: Icons for Tag UI.
- **TanStack Query**: Cache invalidation after tag dismissal.
- **Tailwind CSS**: Visual distinction for tag variants.

## Key Files

- `apps/web/src/components/common/Tag.tsx`: Unified tag component.
- `apps/web/src/components/timeline/NoteCard.tsx`: Implementation of dismissal logic.
- `apps/web/src/hooks/useGraphData.ts`: Inclusion of AI tags in graph nodes.
- `apps/web/src/types/index.ts`: Updated metadata types for AI and ignored tags.

## Deviations from Plan

- **Rule 3 (Blocking)**: Updated `NoteMetadata` type and `useGraphData` hook to support AI tags before they could be rendered in the UI.

## Decisions Made

- **Visual Language**: Used Nord Aurora 4 (Purple) for AI tags to subtly distinguish them from user-created Frost 3 (Blue) tags, while maintaining a cohesive theme.
- **Persistence**: Dismissing a tag adds it to `ignored_tags`. This ensures that even if the AI worker runs again, it won't re-add a tag the user has explicitly rejected.

## Performance

- **Duration**: 4 minutes
- **Completed**: 2026-01-30
