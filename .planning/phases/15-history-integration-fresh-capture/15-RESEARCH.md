# Phase 15: History Integration & Fresh Capture - Research

**Researched:** 2026-02-02
**Domain:** Frontend State Management / UI Integration
**Confidence:** HIGH

## Summary

This phase focuses on the transition between "Draft" (new capture) and "Editing" (existing note) modes. The research indicates that the current architecture in `App.tsx` and `useDebouncedSave` already provides a foundation for note IDs and content management, but requires formalizing the "New Note" flow and sidebar highlighting.

Key findings:

- The system already tracks `noteId` via `useDebouncedSave`.
- Dirty checking is currently simple (content only) and needs to be expanded.
- CodeMirror 6 (via `@uiw/react-codemirror`) handles value updates well, but focus management needs explicit care.
- The "New Note" action must reset both the local draft and the active `noteId` in `useDebouncedSave`.

**Primary recommendation:** Formalize `currentNoteId` as the source of truth for "Mode" (Draft vs Editing) and use it to drive UI states (badges, sidebar highlighting, and button labels).

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library               | Version | Purpose       | Why Standard                                  |
| --------------------- | ------- | ------------- | --------------------------------------------- |
| React                 | 19      | UI framework  | Project standard                              |
| Tailwind CSS          | v4      | Styling       | Project standard                              |
| Lucide React          | latest  | Icons         | Project standard                              |
| @tanstack/react-query | 5.x     | Data fetching | Used for `useTimeline` and cache invalidation |

### Supporting

| Library            | Version | Purpose             | When to Use                      |
| ------------------ | ------- | ------------------- | -------------------------------- |
| react-hotkeys-hook | latest  | Shortcut management | Used for `Cmd+N` and `Cmd+Enter` |

## Architecture Patterns

### Recommended Project Structure

The implementation will primarily affect `apps/web/src/App.tsx` and potentially some minor enhancements to `useDebouncedSave.ts` and `SidebarNoteCard.tsx`.

### Pattern 1: State-Driven Mode

**What:** Use the presence or absence of a `currentNoteId` to determine the application mode.
**When to use:** Always, to distinguish between "Draft" (null) and "Editing" (string).
**Example:**

```typescript
const isEditing = !!currentNoteId;
const modeLabel = isEditing ? "Saved" : "Draft";
```

### Pattern 2: Explicit Navigation / Loading

**What:** When a note is selected from history, it should trigger a fetch and update the editor state.
**When to use:** In `handleEditNote` or `handleNoteClick`.

### Anti-Patterns to Avoid

- **Implicit "New Note":** Simply clearing content without resetting the `noteId` leads to accidental overwrites of existing notes.
- **Manual DOM manipulation for focus:** Use React refs and the `EditorHandle` already established in `Editor.tsx`.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem        | Don't Build                          | Use Instead         | Why                                                              |
| -------------- | ------------------------------------ | ------------------- | ---------------------------------------------------------------- |
| Shortcuts      | `window.addEventListener('keydown')` | `useHotkeys`        | Handles platform differences (Cmd vs Ctrl) and cleanup.          |
| Dirty Checking | Custom deep comparison               | `useUnsavedChanges` | Already exists in the codebase and handles confirmation dialogs. |

**Key insight:** The `useUnsavedChanges` hook should be updated to track the "initial state" (both content and tags) when a note is loaded to accurately detect changes.

## Common Pitfalls

### Pitfall 1: Race conditions with autosave

**What goes wrong:** Switching from one note to another while an autosave is debounced or in-flight.
**Why it happens:** The `useDebouncedSave` might try to save the _previous_ note's content with the _new_ note's ID or vice versa.
**How to avoid:** Explicitly call `cancel()` on the debounced function when switching notes or clicking "New Note".

### Pitfall 2: CodeMirror History Leakage

**What goes wrong:** Undo/Redo stack persists between different notes.
**Why it happens:** React-CodeMirror might reuse the same state if not properly reset.
**How to avoid:** Ensure the `Editor` component's `value` update clears the history or triggers a fresh state when the `noteId` changes (though usually handled by `value` prop in the wrapper).

## Code Examples

### Sidebar Highlighting

```tsx
// In SidebarNoteCard.tsx
const isActive = currentNoteId === note.metadata.id;
return (
  <div className={clsx("...", isActive && "ring-2 ring-nord-frost3")}>...</div>
);
```

### New Note Reset

```typescript
const handleNewNote = () => {
  requestAction(() => {
    setNoteId(null);
    setContent("");
    clearDraft();
    markClean();
    editorRef.current?.focus();
  });
};
```

## State of the Art

| Old Approach      | Current Approach        | When Changed  | Impact                                                    |
| ----------------- | ----------------------- | ------------- | --------------------------------------------------------- |
| Route-based notes | Single-page state-based | Project Start | Feels "snappier" and supports local-first capture better. |

## Open Questions

1. **Skeleton Screen Scope:** Does the skeleton screen need to cover the entire editor area or just show a loading indicator within the toolbar?
   - _Recommendation:_ Skeleton the editor area to prevent layout shift.

## Sources

### Primary (HIGH confidence)

- `apps/web/src/App.tsx` - Existing capture logic.
- `apps/web/src/hooks/useDebouncedSave.ts` - Persistence logic.
- `apps/web/src/components/editor/Editor.tsx` - Editor interface.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Using project standards.
- Architecture: HIGH - Fits existing patterns.
- Pitfalls: MEDIUM - Requires careful implementation of `useDebouncedSave` reset.

**Research date:** 2026-02-02
**Valid until:** 2026-03-04
