# Phase 14 Plan 01: Tag UI Unification Summary

## Frontmatter
- **phase**: 14
- **plan**: 01
- **subsystem**: UI/UX
- **tags**: [react, hono, tailwind, tags, metadata]
- **duration**: 15m
- **completed**: 2026-01-31

## Objective
Unify the tag UI in the Note Preview Overlay to display both manual and AI tags using the standard Tag component, and implement the tag removal workflow with confirmation by adding a backend update endpoint.

## Key Files
- **Created**: None
- **Modified**:
  - `apps/api/src/routes/notes.ts`: Added PATCH endpoint for metadata updates.
  - `apps/web/src/components/preview/NotePreviewOverlay.tsx`: Unified tag rendering and deletion workflow.
  - `apps/web/src/components/common/ConfirmDialog.tsx`: Enhanced to support custom titles and descriptions.
  - `apps/web/src/components/editor/extensions/hashtags.ts`: Fixed build issues.

## Decisions Made
- **Manual vs AI Tag Precedence**: Manual tags are shown before AI tags. If a tag is present in both, it is treated as manual to ensure the user's manual classification takes priority and is editable/removable as a primary tag.
- **Confirmation for AI Tags**: Decided to require confirmation for removing AI tags as well, providing a consistent UX across all tag types.

## Deviations from Plan

### Auto-fixed Issues
**1. [Rule 3 - Blocking] Build errors due to `verbatimModuleSyntax`**
- **Found during**: Task 2/3 development.
- **Issue**: TypeScript errors in `apps/web/src/components/editor/extensions/hashtags.ts` where type-only imports were used without the `type` keyword under strict module settings.
- **Fix**: Added `type` keyword to affected imports.
- **Commit**: `bc7d0af`

**2. [Rule 1 - Bug] Unused import in worker tests**
- **Found during**: Linting after changes.
- **Issue**: `QueueService` was imported but not used in `apps/api/src/services/worker.service.test.ts`.
- **Fix**: Removed the unused import.
- **Commit**: `bc7d0af`

## Next Phase Readiness
- **Blockers**: None.
- **Concerns**: Ensure that the `patch` endpoint remains performant as note volume grows, as it triggers a full re-index of the note.
- **Provides**: Stable metadata update API and unified Tag UI components for future use in other overlays or views.

## Verification Results
- [x] Note preview displays both manual and AI tags.
- [x] Manual and AI tags are visually distinguished.
- [x] Clicking 'x' on a tag triggers a confirmation dialog.
- [x] Tag removal is persisted to the backend and reflects on disk.
- [x] Build and lint checks pass.
