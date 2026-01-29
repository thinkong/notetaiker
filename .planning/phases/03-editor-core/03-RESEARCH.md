# Phase 03: Editor Core - Research

**Researched:** 2026-01-27
**Domain:** High-performance Markdown Editor (CodeMirror 6)
**Confidence:** HIGH

## Summary

Phase 03 focuses on building the "Capture Interface"—a high-performance, developer-focused Markdown editor. Research confirms that **CodeMirror 6 (CM6)** is the optimal choice for this requirement. Unlike its predecessor or Monaco, CM6 is highly modular, allowing for a sub-100ms "Time to Interactive" (TTI) by only loading essential extensions.

The editor will prioritize a "raw but styled" Markdown experience where markers (like `#` or `**`) remain visible but are enhanced with color, weight, and scaling. List auto-formatting and link following (Cmd+Click) are achievable through standard CM6 extensions and custom event handlers.

**Primary recommendation:** Use CodeMirror 6 with a minimal set of extensions to ensure instant readiness, leveraging `@codemirror/lang-markdown` for syntax awareness and `HighlightStyle` for custom "visible marker" styling.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library                     | Version | Purpose                   | Why Standard                                                      |
| --------------------------- | ------- | ------------------------- | ----------------------------------------------------------------- |
| `codemirror`                | ^6.0.0  | Core editor engine        | Modular, performant, and mobile-friendly.                         |
| `@codemirror/lang-markdown` | ^6.0.0  | Markdown language support | Provides the syntax tree for highlighting and list continuation.  |
| `@uiw/react-codemirror`     | ^4.0.0  | React wrapper for CM6     | Simplifies integration with React 19 while exposing full CM6 API. |

### Supporting

| Library                      | Version | Purpose         | When to Use                                                           |
| ---------------------------- | ------- | --------------- | --------------------------------------------------------------------- |
| `@codemirror/theme-one-dark` | ^6.0.0  | Reference theme | Used as a baseline for building the "Soft/Muted" Nord-inspired theme. |
| `lodash.debounce`            | ^4.0.0  | Save throttling | Prevents API spamming while typing.                                   |

### Alternatives Considered

| Instead of   | Could Use            | Tradeoff                                                                              |
| ------------ | -------------------- | ------------------------------------------------------------------------------------- |
| CodeMirror 6 | Monaco Editor        | Monaco is heavy (>1MB) and harder to achieve sub-100ms load times on low-end devices. |
| CodeMirror 6 | TipTap / ProseMirror | Better for WYSIWYG, but more complex for "raw markdown" styling requirements.         |

**Installation:**

```bash
pnpm add @uiw/react-codemirror @codemirror/lang-markdown @codemirror/language @codemirror/commands @codemirror/state @codemirror/view lodash.debounce
pnpm add -D @types/lodash.debounce
```

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/
├── components/
│   └── editor/
│       ├── Editor.tsx           # Main component
│       ├── useEditor.ts        # Custom hook for CM6 logic
│       ├── extensions/         # Custom CM6 extensions
│       │   ├── listPlugin.ts   # List continuation
│       │   └── linkPlugin.ts   # Cmd+Click link handling
│       └── theme.ts            # Nord-inspired custom theme
```

### Pattern 1: Visible Marker Styling

CM6 does not hide Markdown markers by default. To scale headers while keeping `#` visible, we apply styles to the tags provided by the Markdown parser.

**Example:**

```typescript
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const markdownHighlightStyle = HighlightStyle.define([
  { tag: t.heading1, fontSize: "1.5em", fontWeight: "bold", color: "#81a1c1" },
  { tag: t.heading2, fontSize: "1.25em", fontWeight: "bold", color: "#81a1c1" },
  { tag: t.strong, fontWeight: "bold", color: "#ebcb8b" },
  { tag: t.emphasis, fontStyle: "italic", color: "#b48ead" },
]);

// Usage: [syntaxHighlighting(markdownHighlightStyle)]
```

### Anti-Patterns to Avoid

- **Hiding the Markdown:** Avoid "Live Preview" (hiding `#` when not focused). The requirement explicitly asks for "raw/highlighted" behavior.
- **Heavy Initialization:** Don't load 50+ extensions on mount. Start with `basicSetup` and prune.

## Don't Hand-Roll

| Problem           | Don't Build              | Use Instead                   | Why                                                          |
| ----------------- | ------------------------ | ----------------------------- | ------------------------------------------------------------ |
| List Continuation | Custom `onKeyDown`       | `insertNewlineContinueMarkup` | Handles nested lists, task lists, and blockquotes correctly. |
| Markdown Parsing  | Regex-based highlighters | `@codemirror/lang-markdown`   | Provides a real Lezer-based syntax tree.                     |
| Debouncing        | `setTimeout` logic       | `lodash.debounce`             | Robust handling of edge cases and cancellation.              |

## Common Pitfalls

### Pitfall 1: Focus Latency

**What goes wrong:** `editor.focus()` called too late in the React lifecycle, missing the 100ms window.
**How to avoid:** Use `autoFocus` prop in `react-codemirror` and ensure the editor component is NOT lazy-loaded (keep it in the main bundle).

### Pitfall 2: Link Navigation

**What goes wrong:** Clicking a link accidentally navigates away while editing.
**How to avoid:** Use a custom extension to capture `mousedown` events. Only allow navigation if `event.metaKey` (Mac) or `event.ctrlKey` (Windows/Linux) is pressed.

## Code Examples

### Debounced Save Hook

```typescript
import { useCallback } from "react";
import debounce from "lodash.debounce";

export function useDebouncedSave(
  saveFn: (content: string) => void,
  delay = 1000,
) {
  return useCallback(
    debounce((content: string) => {
      saveFn(content);
    }, delay),
    [saveFn, delay],
  );
}
```

### Cmd+Click Link Extension

```typescript
import { EditorView } from "@codemirror/view";

const linkClickExtension = EditorView.domEventHandlers({
  mousedown(event, view) {
    if (
      (event.metaKey || event.ctrlKey) &&
      event.target instanceof HTMLSpanElement
    ) {
      // Check if target is a link via CM6 tags
      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      // Logic to find URL at pos and window.open
    }
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact                                        |
| ------------ | ---------------- | ------------ | --------------------------------------------- |
| CodeMirror 5 | CodeMirror 6     | 2022         | Modular, tree-shakable, better accessibility. |
| `textarea`   | CM6 + Markdown   | Ongoing      | Real IDE-like features in a browser.          |

## Open Questions

1. **Font Licensing:** Should we bundle `JetBrains Mono` or rely on system monospace?
   - _Recommendation:_ Start with a robust system stack (e.g., `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`).
2. **Offline Strategy:** How persistent is the "Offline" indicator?
   - _Recommendation:_ Use a simple global state (Zod/TanStack Query) to monitor request failures.

## Sources

### Primary (HIGH confidence)

- [CodeMirror 6 Docs](https://codemirror.net/6/docs/ref/) - Official reference for extensions and configuration.
- [React CodeMirror](https://github.com/uiwjs/react-codemirror) - Authoritative integration patterns.

### Secondary (MEDIUM confidence)

- [Nord Theme Official](https://www.nordtheme.com/) - Color palette reference (#2e3440, #d8dee9).

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - CM6 is the industry standard for this use case.
- Architecture: HIGH - Modular extension pattern is well-documented.
- Pitfalls: MEDIUM - Based on common issues in capture apps.

**Research date:** 2026-01-27
**Valid until:** 2026-06-27 (CM6 is stable, but extensions move fast)
