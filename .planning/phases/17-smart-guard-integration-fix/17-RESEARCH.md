# Phase 17: Smart Guard Integration Fix - Research

**Researched:** 2026-02-02
**Domain:** React State Sync & Navigation Guards
**Confidence:** HIGH

## Summary

The "Smart Dirty Check" implemented in Phase 16 is currently compromised because the background save mechanism is not fully wired in `App.tsx`. Specifically, the `save` function from the `useDebouncedSave` hook is not being called when content changes, meaning `originalContent` (the baseline for dirty checks) only updates on manual saves or initial loads. This causes the navigation guard to remain "dirty" even after a successful background auto-save.

Additionally, to satisfy the requirement that the dirty state clears "without user intervention," the `useNavigationGuard` hook needs to be enhanced to automatically proceed with a blocked navigation if the content becomes "clean" (matching the baseline) while the confirmation dialog is open.

**Primary recommendation:** Wire `useDebouncedSave` to `handleContentChange` in `App.tsx` and add a "watchdog" effect to `useNavigationGuard` to auto-proceed when `isDirty` becomes false.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.0.0 | UI Framework | Project base |
| React Router | 7.x (Data Router) | Navigation & Blocking | Industry standard for SPA routing |
| lodash.debounce | 4.0.8 | Rate limiting saves | Robust, well-tested |
| Tailwind CSS | v4 | Styling | Project base |

## Architecture Patterns

### Pattern 1: Auto-Proceeding Blocker
**What:** Using a `useEffect` inside the navigation guard hook to monitor the `isDirty` state.
**When to use:** When a background process (like auto-save) can resolve the condition that triggered the block.
**Example:**
```typescript
useEffect(() => {
  if (!isDirty && blocker.state === "blocked") {
    blocker.proceed();
  }
}, [isDirty, blocker.state]);
```

### Pattern 2: Multi-Callback Synchronization
**What:** Ensuring all save paths (manual, debounced, background) trigger the baseline update.
**When to use:** When maintaining a "dirty" state based on content comparison.

### Anti-Patterns to Avoid
- **Manual State Overlap:** Don't try to manually manage a `isDirty` boolean flag if you are already doing content-based comparison. Stick to the derived `isDirty` from `content !== originalContent`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debouncing | Custom setTimeout logic | `lodash.debounce` | Handles edge cases like cancellation and immediate execution better. |
| Navigation Blocking | Custom `window.onpopstate` | `useBlocker` | Deeply integrated with React Router's transition lifecycle. |

## Common Pitfalls

### Pitfall 1: Stale Blocker State
**What goes wrong:** Calling `blocker.proceed()` when the blocker is not in a `"blocked"` state throws an error or does nothing.
**How to avoid:** Always check `blocker.state === "blocked"` before calling `proceed()`.

### Pitfall 2: Race Conditions in Auto-Save
**What goes wrong:** A manual save and a background save happening nearly simultaneously.
**How to avoid:** `useDebouncedSave` already handles this via `cancelSave()` and `forceSave()`.

## Code Examples

### Fixed handleContentChange in App.tsx
```typescript
const { status, noteId, save, forceSave, cancelSave, setNoteId, clearNoteId } =
  useDebouncedSave(1000, (savedContent) => {
    setOriginalContent(savedContent);
  });

const handleContentChange = (newContent: string) => {
  setContent(newContent);
  setDraft(newContent);
  save(newContent); // CRITICAL: This was missing
};
```

### Pulse Animation (Tailwind v4)
The `StatusIndicator` should use `animate-pulse` when saving:
```tsx
<div className={status === "saving" ? "animate-pulse" : ""}>
  {text}
</div>
```

## Open Questions

1. **Should the pulse animation be customizable?**
   - Recommendation: Use a subtle opacity pulse (0.7 to 1.0) to avoid being too distracting while the user is typing.

## Sources

### Primary (HIGH confidence)
- [React Router useBlocker](https://reactrouter.com/en/main/hooks/use-blocker) - Documentation for navigation blocking.
- `apps/web/src/hooks/useDebouncedSave.ts` - Existing implementation analysis.
- `apps/web/src/App.tsx` - Existing implementation analysis.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Core project tech.
- Architecture: HIGH - Clear integration gap identified.
- Pitfalls: HIGH - Standard React/React Router behavior.

**Research date:** 2026-02-02
**Valid until:** 2026-03-02
