# Phase 16: Intelligent Navigation Guarding - Research

**Researched:** 2026-02-02
**Domain:** React Navigation Guarding & Browser Event Handling
**Confidence:** HIGH

## Summary

This research focuses on implementing a "Smart Navigation Guard" in a local-first React application using React Router v7. The goal is to protect users from data loss (unsaved notes/tags) during both in-app navigation and browser-level actions (refresh/close) without "crying wolf" for non-changes.

The core technology is React Router's `useBlocker` hook, which provides a robust way to intercept navigation attempts and present a custom UI. This will be paired with a refined "Smart Dirty Check" that compares the current editor state against the last successfully persisted state, rather than relying on a simple "touched" boolean.

**Primary recommendation:** Use React Router v7's `useBlocker` for in-app navigation guarding and a standard `beforeunload` listener for browser-level protection, both sharing a centralized "smart dirty" logic.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library            | Version | Purpose                 | Why Standard                                                                                                                           |
| ------------------ | ------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `react-router-dom` | ^7.13.0 | Navigation Interception | `useBlocker` is the official, type-safe way to handle navigation guards in v7. **Note: Requires Data Router (`createBrowserRouter`).** |
| React              | ^19.2.0 | State Management        | Hooks (`useBlocker`, `useEffect`) for managing guard state.                                                                            |

### Supporting

| Library           | Version | Purpose     | When to Use                                                                   |
| ----------------- | ------- | ----------- | ----------------------------------------------------------------------------- |
| `lodash.debounce` | ^4.0.8  | Performance | Ensuring dirty checks don't block the UI thread during high-frequency typing. |

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/
├── hooks/
│   ├── useNavigationGuard.ts   # NEW: Centralizes useBlocker + beforeunload
│   └── useDirtyCheck.ts        # UPGRADED: Logic for comparing content/tags
├── components/
│   └── common/
│       └── ConfirmDialog.tsx   # EXISTING: Custom Nord-themed modal
└── App.tsx                    # Integration point
```

### Pattern 1: useBlocker Integration

**What:** React Router v7 `useBlocker` intercepts navigation when a condition is met.
**When to use:** For all in-app navigation (clicking links, `navigate()` calls).
**Example:**

```typescript
// Source: https://api.reactrouter.com/v7/functions/react_router.useBlocker.html
const blocker = useBlocker(({ currentValue, nextLocation }) => {
  return isDirty && currentValue.pathname !== nextLocation.pathname;
});

// In UI
if (blocker.state === "blocked") {
  return (
    <ConfirmDialog
      onSave={() => { save(); blocker.proceed(); }}
      onDiscard={() => blocker.proceed()}
      onCancel={() => blocker.reset()}
    />
  );
}
```

### Anti-Patterns to Avoid

- **"Touched" Flag Only:** Marking a note as dirty on the first keystroke leads to false positives if the user reverts their changes.
- **Custom Router Guards:** Attempting to monkey-patch `window.history` instead of using the framework's built-in blocker.
- **Auto-save on Block:** Automatically saving and proceeding when a user navigates away. The requirements explicitly state we should **Block & Prompt** if a save is pending.

## Don't Hand-Roll

| Problem                  | Don't Build                     | Use Instead           | Why                                                                 |
| ------------------------ | ------------------------------- | --------------------- | ------------------------------------------------------------------- |
| Navigation Interception  | Custom History Listener         | `useBlocker`          | Handles edge cases like browser back/forward buttons correctly.     |
| Browser Close Protection | Custom Modal for `beforeunload` | Native Browser Dialog | Modern browsers block custom modals in `beforeunload` for security. |

## Common Pitfalls

### Pitfall 1: browser security restrictions on `beforeunload`

**What goes wrong:** Attempting to show the `ConfirmDialog` when the user closes the tab.
**Why it happens:** Browsers ignore custom UI and only show a generic "Leave site?" message if `event.preventDefault()` is called.
**How to avoid:** Use the `beforeunload` event ONLY to trigger the native browser dialog. Use `useBlocker` for everything else.

### Pitfall 2: Race conditions during "Save & Proceed"

**What goes wrong:** The user clicks "Save" in the prompt, navigation proceeds before the save completes, and the user closes the app.
**Why it happens:** Proceeding with navigation immediately after calling a `save()` function without awaiting its resolution.
**How to avoid:** The "Save" action in the `ConfirmDialog` must `await` the persistence layer before calling `blocker.proceed()`.

### Pitfall 3: Data Router Requirement

**What goes wrong:** `useBlocker` throws "useBlocker must be used within a data router".
**Why it happens:** The app currently uses `<BrowserRouter>`. `useBlocker` only works with routers created via `createBrowserRouter` (Data Routers).
**How to avoid:** Migrate `App.tsx` from `<BrowserRouter>` to `createBrowserRouter` + `<RouterProvider>`.

## Code Examples

### Smart Dirty Check (Trimmed & Tag-Aware)

```typescript
const isDirty = useMemo(() => {
  const currentBody = content.trim();
  const savedBody = (savedNote?.content || "").trim();

  const currentTags = [...tags].sort().join(",");
  const savedTags = [...(savedNote?.metadata.tags || [])].sort().join(",");

  return currentBody !== savedBody || currentTags !== savedTags;
}, [content, tags, savedNote]);
```

## State of the Art

| Old Approach        | Current Approach         | When Changed       | Impact                                                                    |
| ------------------- | ------------------------ | ------------------ | ------------------------------------------------------------------------- |
| `Prompt` component  | `useBlocker` hook        | React Router v6.4+ | Functional hook-based approach, more flexible than declarative component. |
| `event.returnValue` | `event.preventDefault()` | Modern Browsers    | Standardized way to trigger "Leave site" dialog.                          |

## Open Questions

1. **Tag Change Urgency**
   - What we know: Tags are stored in frontmatter and should trigger the guard.
   - What's unclear: If the AI generates tags automatically while editing, does this count as a "user change" for the guard?
   - Recommendation: Only manual tag additions/removals or AI tags that the user has seen/accepted should trigger the guard.

## Sources

### Primary (HIGH confidence)

- [react-router-dom v7](https://api.reactrouter.com/v7/functions/react_router.useBlocker.html) - Official documentation for navigation blocking.
- [MDN beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) - Browser standards for tab closure.

### Secondary (MEDIUM confidence)

- [Nord Theme Documentation](https://www.nordtheme.com/docs/colors-and-palettes) - Color hex codes for Nord 13 (Yellow: `#ebcb8b`).
- [React Router v7 Migration Guide](https://reactrouter.com/en/main/upgrading/v6-data) - Details on migrating to Data Routers for hook support.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Using official React Router v7 APIs.
- Architecture: HIGH - Pattern is standard for modern React apps.
- Pitfalls: HIGH - Browser security limits on `beforeunload` are well-documented.

**Research date:** 2026-02-02
**Valid until:** 2026-03-04
