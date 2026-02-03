---
phase: quick-002
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/App.tsx
  - apps/web/src/components/preview/NotePreviewOverlay.tsx
autonomous: true

must_haves:
  truths:
    - "User clicks sidebar recent note and note loads directly into editor"
    - "If editor has unsaved changes, user sees save/discard/cancel dialog before loading note"
    - "If editor is clean, note loads immediately without any modal"
  artifacts:
    - path: "apps/web/src/App.tsx"
      provides: "Direct note loading on sidebar click"
      min_lines: 400
  key_links:
    - from: "SidebarTimeline"
      to: "handleEditNote"
      via: "onClick bypasses preview modal"
      pattern: "handleNoteClick.*handleEditNote"
---

<objective>
Remove the preview modal when clicking sidebar recent notes and load notes directly into the editor with save guard protection.

Purpose: Streamline the note editing workflow by eliminating an unnecessary preview step while maintaining safety through the existing navigation guard system.

Output: Sidebar note clicks will directly load notes into the editor, with automatic save prompts when there are unsaved changes.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

# Current implementation files
@apps/web/src/App.tsx
@apps/web/src/components/sidebar/SidebarTimeline.tsx
@apps/web/src/components/sidebar/SidebarNoteCard.tsx
@apps/web/src/components/preview/NotePreviewOverlay.tsx
@apps/web/src/hooks/useNavigationGuard.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Refactor sidebar note click to load directly into editor</name>
  <files>apps/web/src/App.tsx</files>
  <action>
    In the MainCapture component:

    1. Update `handleNoteClick` function (currently lines 143-148) to directly call the note loading logic instead of showing the preview modal:
       - Change the `requestAction` callback to call `handleEditNote(noteId)` directly
       - Remove the lines that set `setPreviewNoteId(noteId)` and `setShowPreview(true)`

    2. Remove or comment out the NotePreviewOverlay component usage (lines 354-362) since it's no longer needed for the sidebar workflow
       - Keep the component import and state (`showPreview`, `previewNoteId`) temporarily in case it's used elsewhere
       - Only remove the JSX rendering of `<NotePreviewOverlay>`

    3. Verify the navigation guard flow:
       - `requestAction` wrapper ensures that if editor `isDirty` is true, the ConfirmDialog appears
       - If editor is clean, the note loads immediately via `handleEditNote`

    The existing `handleEditNote` function already:
    - Fetches the note content from the API
    - Sets noteId for editing mode
    - Updates content, originalContent, and draft state
    - Focuses the editor

    Do NOT modify `handleEditNote` - it already works correctly.
  </action>
  <verify>
    1. Run `pnpm dev` and open http://localhost:5173
    2. Type some content in the editor (to make it dirty)
    3. Click a recent note in the sidebar
    4. Verify ConfirmDialog appears with save/discard/cancel options
    5. Test each option:
       - Save: saves current note, then loads clicked note
       - Discard: discards changes, loads clicked note
       - Cancel: closes dialog, stays in current note
    6. With clean editor (no changes), click a sidebar note
    7. Verify note loads directly without any modal
  </verify>
  <done>
    - Clicking sidebar notes bypasses preview modal
    - Notes load directly into editor
    - Save guard (ConfirmDialog) appears only when editor has unsaved changes
    - All three dialog options (save/discard/cancel) work correctly
    - Clean editor allows immediate note loading
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Direct note loading from sidebar with save guard protection.

    Changes made:
    - Modified `handleNoteClick` in App.tsx to directly call `handleEditNote`
    - Removed NotePreviewOverlay from rendering (preview modal no longer shown)
    - Existing navigation guard system provides save/discard prompts
  </what-built>
  <how-to-verify>
    **Test 1: Clean editor (no unsaved changes)**
    1. Start with empty/saved editor
    2. Click any recent note in the sidebar
    3. Expected: Note loads immediately into editor, no modal appears

    **Test 2: Dirty editor (with unsaved changes)**
    1. Type some text in the editor (don't save)
    2. Click a different recent note in the sidebar
    3. Expected: ConfirmDialog appears with three options:
       - "Save and Continue" button
       - "Discard Changes" button
       - "Cancel" button
    4. Click "Cancel" - dialog closes, original content remains in editor
    5. Click another note, choose "Discard Changes" - new note loads, changes discarded
    6. Make more changes, click another note, choose "Save and Continue" - saves then loads new note

    **Test 3: Verify no preview modal**
    1. Click multiple different sidebar notes
    2. Expected: Never see the old preview modal overlay
    3. Always either see direct loading or the save guard dialog

    **Visual check:**
    - Sidebar interaction feels smooth and direct
    - No unnecessary steps between clicking and editing
    - Save protection still works as expected
  </how-to-verify>
  <resume-signal>
    Type "approved" if all tests pass, or describe any issues found.
  </resume-signal>
</task>

</tasks>

<verification>
Manual testing confirms:
- Preview modal no longer appears when clicking sidebar notes
- Navigation guard correctly prompts for save/discard when editor has changes
- Notes load directly when editor is clean
- All save guard options work correctly
</verification>

<success_criteria>
- Sidebar note clicks trigger direct note loading
- No preview modal appears in the workflow
- Save guard dialog appears only when editor has unsaved changes
- User can save/discard/cancel as needed
- Clean editor allows instant note loading
</success_criteria>

<output>
After completion, create `.planning/quick/002-remove-preview-modal-and-load-note-direc/002-SUMMARY.md`
</output>
