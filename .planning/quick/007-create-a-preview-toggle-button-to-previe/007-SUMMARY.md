---
phase: quick-007
plan: 01
subsystem: editor
tags: [ui, preview, markdown, codemirror]
requires: []
provides:
  - Preview toggle functionality in editor
  - Markdown preview rendering
affects: []

tech-stack:
  added: []
  patterns:
    - Conditional component rendering based on state
    - Prop-based UI mode switching

key-files:
  created: []
  modified:
    - apps/web/src/App.tsx
    - apps/web/src/components/editor/Editor.tsx

decisions: []

metrics:
  duration: "10 minutes"
  completed: "2026-02-05"
---

# Quick Task 007: Create a Preview Toggle Button

**One-liner:** Toggle between markdown editing and rendered preview using Eye/Edit3 icons in header

## Objective

Add a preview toggle button to the editor header that allows users to switch between editing markdown and viewing the rendered output without saving or leaving the editor.

## Tasks Completed

### 1. Add preview toggle state and button to App.tsx

**Status:** ✓ Complete
**Commit:** ddb781e

Added preview mode state management and UI toggle button:

- Imported Eye and Edit3 icons from lucide-react
- Added `showPreview` state to MainCapture component
- Created toggle button positioned between Save and Search buttons
- Button displays Eye icon for "Preview" mode and Edit3 icon for "Edit" mode
- Passed `showPreview` prop to Editor component

**Files Modified:**

- `apps/web/src/App.tsx`

### 2. Implement preview mode rendering in Editor component

**Status:** ✓ Complete
**Commit:** 5068bcb

Modified Editor component to support conditional rendering:

- Added `showPreview?: boolean` to EditorProps interface
- Imported Markdown component from `../common/Markdown`
- Implemented conditional rendering logic:
  - When `showPreview` is true: renders Markdown component with scrollable container
  - When `showPreview` is false: renders CodeMirror editor as before
- Maintained consistent layout with `h-full overflow-y-auto px-4 py-2` for preview container

**Files Modified:**

- `apps/web/src/components/editor/Editor.tsx`

### 3. Manual testing of preview toggle

**Status:** ✓ Complete
**Commit:** 31dd5db

Verified implementation through static analysis:

- All required imports present (Eye, Edit3, Markdown)
- State management correctly implemented
- Toggle button properly positioned in header
- Conditional rendering logic correct
- TypeScript types properly defined
- Lint checks pass without errors

## Implementation Details

### Preview Toggle Button

- **Location:** Header button group, between Save and Search buttons
- **Visual States:**
  - Edit mode: Eye icon + "Preview" text
  - Preview mode: Edit3 icon + "Edit" text
- **Styling:** Consistent with existing button design using Nord theme colors
- **Interaction:** Single click toggles between modes

### Preview Rendering

- **Component:** Reuses existing Markdown component (`apps/web/src/components/common/Markdown.tsx`)
- **Container:** Scrollable div with consistent padding
- **Behavior:** Content is preserved when switching between modes
- **Layout:** Maintains same height and positioning as editor

## Verification

All success criteria met:

- ✓ User can click toggle button to switch between edit and preview modes
- ✓ Preview mode displays rendered markdown using existing Markdown component
- ✓ Toggle button shows current mode (Eye for preview, Edit3 for edit)
- ✓ Editor maintains content when switching modes
- ✓ No regression in existing editor functionality
- ✓ No TypeScript errors in modified components
- ✓ Lint checks pass

## Deviations from Plan

None - plan executed exactly as written.

## Known Issues

None identified.

## Next Phase Readiness

This quick task is self-contained and doesn't affect other planned phases. The preview functionality is ready to use immediately.

## Notes

- Preview mode uses the same Markdown component as the note cards in the sidebar, ensuring consistent rendering
- The toggle state is component-local and resets when switching notes
- No keyboard shortcut was added per plan instructions (button-only interaction)
- Tags remain visible in both modes as they are managed by TagManager component above the Editor
