# Phase 12: UX Flow Improvements - Research

**Researched:** 2026-01-30
**Domain:** React UX patterns (overlays, focus management, toasts, draft persistence)
**Confidence:** MEDIUM

## Summary

This phase implements four interconnected UX flows: note preview overlays, save-and-reset editor flow, focus management, and draft autosave. The research identified that these patterns require careful state coordination and accessibility considerations.

The standard approach uses existing libraries already in the stack (cmdk for modals, react-hotkeys-hook for shortcuts) combined with custom React state management. The key challenge is maintaining intentional, predictable state transitions without accidental data loss.

**Primary recommendation:** Build on existing patterns from SearchPalette (cmdk-based overlay) and extend useDebouncedSave for localStorage draft persistence. Avoid introducing new UI libraries; use Tailwind for transitions and focus states.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| cmdk | ^1.1.1 | Modal overlays and dialogs | Already in stack, provides Command.Dialog with backdrop/escape handling |
| react-hotkeys-hook | ^5.2.3 | Keyboard shortcuts | Already in stack, handles Cmd+Enter, focus conflicts |
| @uiw/react-codemirror | ^4.25.4 | Editor integration | Already in stack, provides CodeMirror wrapper with React refs |
| React 19 built-in state | ^19.2.0 | State management | useState/useRef for overlay visibility, draft content |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| localStorage API | Browser native | Draft persistence | Auto-save every N seconds, restore on mount |
| TanStack Query | ^5.90.20 | Cache invalidation | Invalidate notes list after save for immediate update |
| Tailwind CSS | ^4.1.18 | Transitions/animations | Background shifts, overlay fade-in, toast animations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| cmdk | Radix Dialog | More features but new dependency; cmdk already handles our needs |
| Custom toast | react-hot-toast/sonner | Cleaner API but new dependency; Tailwind animations sufficient |
| localStorage | IndexedDB | Better for large data but overkill for single draft string |

**Installation:**
No new dependencies needed - all required libraries already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── editor/
│   │   └── Editor.tsx          # Extend with ref forwarding for focus control
│   ├── preview/
│   │   └── NotePreviewOverlay.tsx  # New: full-screen note preview
│   └── common/
│       ├── Toast.tsx           # New: simple toast notification component
│       └── ConfirmDialog.tsx   # New: save/discard/cancel dialog
├── hooks/
│   ├── useDebouncedSave.ts     # Extend with clear() and reset methods
│   ├── useDraftPersistence.ts  # New: localStorage auto-save/restore
│   └── useUnsavedChanges.ts    # New: track dirty state, warn on navigation
└── App.tsx                      # Coordinate overlay visibility states
```

### Pattern 1: Modal Overlay with cmdk
**What:** Full-screen overlay using Command.Dialog pattern from existing SearchPalette
**When to use:** Note preview overlay, confirmation dialogs
**Example:**
```typescript
// Based on existing SearchPalette pattern
import { Command } from "cmdk";

function NotePreviewOverlay({ noteId, open, onClose }) {
  return (
    <Command.Dialog
      open={open}
      onOpenChange={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop - click outside to close */}
      <div
        className="fixed inset-0 bg-nord-polar0/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content overlay */}
      <div className="relative w-full max-w-3xl bg-nord-snow2 dark:bg-nord-polar1
                      rounded-xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
        {/* Preview content with Edit button */}
      </div>
    </Command.Dialog>
  );
}
```

### Pattern 2: Focus Management with useRef
**What:** Programmatic focus control after state changes
**When to use:** Return focus to editor after save, auto-focus on mount
**Example:**
```typescript
// Editor component needs ref forwarding
import { forwardRef, useImperativeHandle, useRef } from "react";

export const Editor = forwardRef((props, ref) => {
  const editorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      editorRef.current?.focus();
    }
  }));

  return <CodeMirror ref={editorRef} autoFocus {...props} />;
});

// Parent component usage
function App() {
  const editorRef = useRef(null);

  const handleSave = () => {
    // Save logic...
    editorRef.current?.focus(); // Return focus after save
  };

  return <Editor ref={editorRef} onSave={handleSave} />;
}
```

### Pattern 3: localStorage Draft Persistence
**What:** Auto-save draft to localStorage as user types, restore on mount
**When to use:** Prevent data loss from accidental refresh/close
**Example:**
```typescript
function useDraftPersistence(key: string, debounceMs = 2000) {
  const [draft, setDraft] = useState(() => {
    // Silent restore on mount
    return localStorage.getItem(key) || "";
  });

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft) {
        localStorage.setItem(key, draft);
      } else {
        localStorage.removeItem(key); // Cleanup when empty
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [draft, key, debounceMs]);

  const clearDraft = () => {
    localStorage.removeItem(key);
    setDraft("");
  };

  return { draft, setDraft, clearDraft };
}
```

### Pattern 4: Toast Notification with Tailwind
**What:** Simple auto-dismissing notification without external library
**When to use:** Feedback after save action
**Example:**
```typescript
function Toast({ message, onDismiss, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div className="fixed bottom-4 right-4 bg-nord-frost3 text-white px-4 py-3
                    rounded-lg shadow-lg animate-in slide-in-from-bottom-5 duration-300">
      {message}
    </div>
  );
}
```

### Pattern 5: Unsaved Changes Dialog
**What:** Three-button confirmation dialog (Save / Discard / Cancel)
**When to use:** User clicks note in sidebar while editor has unsaved content
**Example:**
```typescript
function ConfirmDialog({ open, onSave, onDiscard, onCancel }) {
  return (
    <Command.Dialog open={open} onOpenChange={onCancel}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-nord-polar1 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2">Unsaved Changes</h3>
        <p className="text-sm text-nord-polar3 mb-4">
          You have unsaved content. What would you like to do?
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onDiscard}>Discard</button>
          <button onClick={onSave}>Save</button>
        </div>
      </div>
    </Command.Dialog>
  );
}
```

### Anti-Patterns to Avoid
- **Clearing editor before save completes:** Race condition if save fails, user loses content
- **No confirmation on data loss:** Clicking notes while editing causes accidental loss
- **Focus trap without escape:** User can't dismiss overlay with keyboard
- **Placeholder controlled by value prop:** CodeMirror's placeholder only shows when value is empty, don't manually hide it
- **Multiple simultaneous overlays:** Search palette + preview overlay = confusion, ensure mutual exclusivity

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal backdrop/focus trap | Custom overlay with manual event listeners | cmdk Command.Dialog | Already in stack, handles escape key, click outside, focus management |
| Keyboard shortcut conflicts | Manual event.preventDefault() everywhere | react-hotkeys-hook scopes | Already in stack, handles enableOnFormTags, prevents conflicts |
| Toast auto-dismiss timing | setTimeout in component | Simple custom hook with cleanup | Needs cancellation on unmount, easy to get wrong |
| localStorage quota errors | Direct setItem without try/catch | Wrapper with error handling | QuotaExceededError crashes silently, needs graceful degradation |
| Debounced autosave | Custom setTimeout logic | Extend existing useDebouncedSave | Already working pattern, just add localStorage |

**Key insight:** This phase builds on existing patterns rather than introducing new paradigms. The SearchPalette already demonstrates the overlay pattern; useDebouncedSave already handles debouncing. Don't reinvent these.

## Common Pitfalls

### Pitfall 1: Focus Lost After Save
**What goes wrong:** User presses Cmd+Enter to save, focus remains on Save button or is lost entirely
**Why it happens:** Save action doesn't explicitly return focus to editor
**How to avoid:**
- Add ref forwarding to Editor component exposing focus() method
- Call editorRef.current.focus() immediately after save completes
- Verify focus returns in both success and error cases
**Warning signs:** User has to click into editor after every save

### Pitfall 2: Overlay Doesn't Dismiss on Escape
**What goes wrong:** User presses Escape but preview overlay stays open
**Why it happens:** cmdk Command.Dialog requires onOpenChange handler to be wired correctly
**How to avoid:**
- Always pass onOpenChange={onClose} to Command.Dialog
- Test escape key, click outside, and close button all work
- Don't preventDefault on Escape globally
**Warning signs:** Escape key works in SearchPalette but not in preview

### Pitfall 3: Race Condition on Clear
**What goes wrong:** Editor clears before save completes, then save fails and content is lost
**Why it happens:** Optimistic clearing without waiting for save promise
**How to avoid:**
- Wait for save API to return success before clearing
- Show saving state while waiting
- If save fails, don't clear and show error toast
**Warning signs:** Intermittent content loss on slow connections

### Pitfall 4: Draft Persists After Successful Save
**What goes wrong:** localStorage draft remains even after note is saved successfully
**Why it happens:** No cleanup of localStorage after save
**How to avoid:**
- Call localStorage.removeItem(draftKey) immediately after successful save
- Clear draft on explicit save (Cmd+Enter), not just debounced save
- Verify draft is gone with dev tools after save
**Warning signs:** Draft content appears on reload even after saving

### Pitfall 5: TanStack Query Cache Stale
**What goes wrong:** User saves note, but sidebar doesn't show new note for 5-10 seconds
**Why it happens:** TanStack Query cache isn't invalidated after mutation
**How to avoid:**
- Import queryClient from App.tsx context
- Call queryClient.invalidateQueries(['notes']) after successful save
- Consider optimistic updates for immediate feedback
**Warning signs:** Notes appear in sidebar only after manual refresh

### Pitfall 6: Placeholder Shows While Typing
**What goes wrong:** CodeMirror placeholder flickers or shows with content
**Why it happens:** Trying to manually control placeholder visibility based on focus
**How to avoid:**
- Let CodeMirror handle placeholder automatically (shows only when value is empty string)
- Use EditorView focus state styling for background color shift instead
- Don't set placeholder="" conditionally
**Warning signs:** Placeholder text visible while typing

### Pitfall 7: Multiple Overlays Open Simultaneously
**What goes wrong:** Search palette and note preview both open, keyboard shortcuts conflict
**Why it happens:** Independent state for each overlay without coordination
**How to avoid:**
- When opening preview, close search palette first
- Consider single overlayState = "none" | "search" | "preview" | "confirm"
- Test Cmd+K while preview is open
**Warning signs:** User sees two overlays stacked, keyboard navigation broken

### Pitfall 8: localStorage Quota Exceeded
**What goes wrong:** localStorage.setItem() throws QuotaExceededError on large drafts
**Why it happens:** No try/catch around localStorage operations, no size limits
**How to avoid:**
- Wrap all localStorage.setItem in try/catch
- Gracefully degrade (don't save draft, show warning)
- Consider 5MB total quota limit (~5000 chars safe)
**Warning signs:** App crashes silently on very long notes

## Code Examples

Verified patterns based on existing codebase:

### Extending Editor with Focus Control
```typescript
// apps/web/src/components/editor/Editor.tsx
import { forwardRef, useImperativeHandle, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";

export interface EditorHandle {
  focus: () => void;
}

export const Editor = forwardRef<EditorHandle, EditorProps>((props, ref) => {
  const cmRef = useRef<ReactCodeMirrorRef>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      // CodeMirror's view is accessible via ref
      cmRef.current?.view?.focus();
    }
  }));

  return (
    <CodeMirror
      ref={cmRef}
      value={props.value}
      onChange={props.onChange}
      autoFocus
      {...props}
    />
  );
});
```

### Save-and-Reset Flow with Focus Return
```typescript
// apps/web/src/App.tsx (MainCapture component)
const editorRef = useRef<EditorHandle>(null);
const [showToast, setShowToast] = useState(false);
const queryClient = useQueryClient();

const handleSave = async (content: string) => {
  try {
    await forceSave(content);

    // Wait for save to complete, then:
    setContent(""); // Clear editor
    localStorage.removeItem("notetaiker:draft"); // Clear draft
    queryClient.invalidateQueries(["notes"]); // Refresh sidebar
    setShowToast(true); // Show success toast

    // Return focus to editor
    setTimeout(() => editorRef.current?.focus(), 50);
  } catch (error) {
    // Don't clear on error
    console.error("Save failed:", error);
  }
};

return (
  <>
    <Editor ref={editorRef} value={content} onChange={setContent} onSave={handleSave} />
    {showToast && (
      <Toast message="Note saved" onDismiss={() => setShowToast(false)} />
    )}
  </>
);
```

### Draft Persistence Hook
```typescript
// apps/web/src/hooks/useDraftPersistence.ts
import { useState, useEffect } from "react";

const DRAFT_KEY = "notetaiker:draft";
const AUTOSAVE_DELAY = 2000;

export function useDraftPersistence() {
  const [draft, setDraft] = useState<string>(() => {
    // Silent restore on mount
    try {
      return localStorage.getItem(DRAFT_KEY) || "";
    } catch {
      return ""; // Graceful fallback
    }
  });

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (draft.trim()) {
          localStorage.setItem(DRAFT_KEY, draft);
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn("localStorage quota exceeded, draft not saved");
        }
      }
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [draft]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Silent failure OK
    }
    setDraft("");
  };

  return { draft, setDraft, clearDraft, hasDraft: draft.trim().length > 0 };
}
```

### Unsaved Changes Hook
```typescript
// apps/web/src/hooks/useUnsavedChanges.ts
import { useState, useCallback } from "react";

export function useUnsavedChanges() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const markDirty = useCallback(() => setHasUnsavedChanges(true), []);
  const markClean = useCallback(() => setHasUnsavedChanges(false), []);

  const requestAction = useCallback((action: () => void) => {
    if (hasUnsavedChanges) {
      // Store action, show confirm dialog
      setPendingAction(() => action);
      return false; // Dialog will be shown
    } else {
      // No unsaved changes, execute immediately
      action();
      return true;
    }
  }, [hasUnsavedChanges]);

  const confirmDiscard = useCallback(() => {
    pendingAction?.();
    setPendingAction(null);
    setHasUnsavedChanges(false);
  }, [pendingAction]);

  const cancelAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  return {
    hasUnsavedChanges,
    markDirty,
    markClean,
    requestAction,
    confirmDiscard,
    cancelAction,
    showDialog: pendingAction !== null
  };
}
```

### Note Click Handler with Unsaved Warning
```typescript
// apps/web/src/App.tsx (MainCapture component)
const {
  hasUnsavedChanges,
  markDirty,
  markClean,
  requestAction,
  showDialog,
  confirmDiscard,
  cancelAction
} = useUnsavedChanges();

const handleNoteClick = (noteId: string) => {
  requestAction(() => {
    // Load note into preview overlay
    setPreviewNoteId(noteId);
    setShowPreview(true);
  });
};

const handleContentChange = (newContent: string) => {
  setContent(newContent);
  if (newContent.trim()) {
    markDirty();
  }
};

const handleSaveWithCleanup = async () => {
  await handleSave(content);
  markClean();
};

return (
  <>
    <SidebarNoteCard onClick={handleNoteClick} />
    <Editor value={content} onChange={handleContentChange} />

    {showDialog && (
      <ConfirmDialog
        open={showDialog}
        onSave={async () => {
          await handleSaveWithCleanup();
          confirmDiscard(); // Execute pending action after save
        }}
        onDiscard={confirmDiscard}
        onCancel={cancelAction}
      />
    )}
  </>
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Modal portals with ReactDOM.createPortal | cmdk Command.Dialog | 2023+ | Simpler API, built-in keyboard handling |
| window.confirm() for dialogs | Custom React dialog components | 2020+ | Better UX, styled consistently, non-blocking |
| Inline editing in sidebar | Full overlay preview with edit mode | Current trend | Clearer separation of read vs write modes |
| Auto-save on every keystroke | Debounced auto-save (1-2s) | 2021+ | Reduces server load, better performance |

**Deprecated/outdated:**
- Using alert() or confirm() for user notifications (blocks UI, poor UX)
- Manually implementing focus traps (use library like cmdk or Radix)
- Storing large data in localStorage without IndexedDB fallback (5MB limit)

## Open Questions

Things that couldn't be fully resolved:

1. **CodeMirror view.focus() method accessibility**
   - What we know: @uiw/react-codemirror provides ref to view
   - What's unclear: Exact TypeScript interface for ReactCodeMirrorRef
   - Recommendation: Test ref.current.view.focus() empirically, add type assertion if needed

2. **TanStack Query optimistic updates vs invalidation**
   - What we know: invalidateQueries works but causes re-fetch delay
   - What's unclear: Whether optimistic update is worth complexity for this phase
   - Recommendation: Start with simple invalidation, add optimistic updates if UX feels slow

3. **Toast animation library choice**
   - What we know: Can build custom toast with Tailwind, or use sonner/react-hot-toast
   - What's unclear: Whether custom toast is sufficient or library provides better UX
   - Recommendation: Start with custom Tailwind toast, add library if animation needs increase

## Sources

### Primary (HIGH confidence)
- Existing codebase patterns:
  - /home/ubuntu/projects/notetaiker/apps/web/src/components/search/SearchPalette.tsx - cmdk overlay pattern
  - /home/ubuntu/projects/notetaiker/apps/web/src/hooks/useDebouncedSave.ts - debounce and save pattern
  - /home/ubuntu/projects/notetaiker/apps/web/src/components/editor/Editor.tsx - CodeMirror integration
  - /home/ubuntu/projects/notetaiker/apps/web/src/App.tsx - keyboard shortcut patterns with react-hotkeys-hook

### Secondary (MEDIUM confidence)
- React 19 documentation (forwardRef, useImperativeHandle patterns)
- localStorage API (MDN Web Docs, standard browser API)
- Tailwind CSS v4 animation utilities

### Tertiary (LOW confidence)
- WebSearch results for toast libraries (need verification with specific library docs if chosen)
- General React modal accessibility patterns (need verification with WCAG guidelines)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in package.json, verified in codebase
- Architecture: HIGH - Based on existing working patterns (SearchPalette, useDebouncedSave)
- Pitfalls: MEDIUM - Based on common React patterns, but not all verified in this codebase
- Code examples: HIGH - Built on existing codebase patterns, adapted for new requirements

**Research date:** 2026-01-30
**Valid until:** 2026-02-28 (30 days - stable React patterns, no fast-moving dependencies)
