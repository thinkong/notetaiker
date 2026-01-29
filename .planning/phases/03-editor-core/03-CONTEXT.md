# Phase 03: Editor Core - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the high-performance capture interface. User can start typing immediately upon page load (sub-100ms readiness). Notes are automatically saved to the storage engine. Markdown is supported but kept simple (raw/highlighted).

</domain>

<decisions>
## Implementation Decisions

### Editor Experience

- **Focus:** Immediate autofocus on page load (sub-100ms target is critical).
- **Feel:** "Developer Focus" — primarily monospace, code-editor feel rather than rich text document.
- **Layout:** Centered document layout (max-width column) to maintain readability while keeping the app immersive.
- **Input:** Standard system keyboard shortcuts (no Vim mode for this phase).

### Visual Design

- **Theme:** Respect system theme preference (Auto Light/Dark).
- **Chrome:** Minimal interface with "Subtle Indicators" (header/status bar) rather than a heavy toolbar.
- **Typography:** Monospace Code font (e.g., JetBrains Mono, Fira Code, or system monospace) as the dominant typeface.
- **Contrast:** Soft/Muted palette (grays/off-whites) rather than high-contrast pure black/white.

### Saving Feedback

- **Success:** Subtle text status (e.g., "Saved") in the corner.
- **Chattiness:** Debounced updates — show "Saved" only after the user pauses typing, not on every keystroke.
- **Errors:** Toast notifications for save failures (non-blocking but visible).
- **Offline:** Explicit "Offline" indicator when the network/backend connection is lost.

### Markdown Style

- **Rendering:** Syntax highlighting — keep markup characters visible (e.g., `**bold**`, `# Header`) but style them with color/weight.
- **Headers:** Visual scaling — H1/H2 should look larger even if the markup (`#`) is still visible.
- **Lists:** Auto-formatting behavior — pressing Enter on a list item automatically creates the next bullet.
- **Links:** Modifier Click (e.g., Cmd+Click) to follow links, preventing accidental navigation while editing.

### Claude's Discretion

- Exact debounce timing (e.g., 500ms vs 1s).
- specific color palette values for the "Soft/Muted" theme.
- Choice of specific monospace font stack.
- Library selection for Markdown highlighting (e.g., Prism, CodeMirror, custom regex).

</decisions>

<specifics>
## Specific Ideas

- The editor should feel snappy and raw, like a lightweight code editor, but centered like a document.
- "Developer Focus" implies we value speed and predictability over WYSIWYG hiding of complexity.

</specifics>

<deferred>
## Deferred Ideas

- **Vim Mode:** Explicitly discussed but deferred (Standard Keys selected).
- **Rich Toolbar:** Explicitly rejected in favor of subtle indicators.
- **Live Preview / WYSIWYG:** Rejected in favor of Syntax Highlighting.

</deferred>

---

_Phase: 03-editor-core_
_Context gathered: 2026-01-27_
