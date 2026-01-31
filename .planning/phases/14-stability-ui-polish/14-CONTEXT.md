# Phase 14: Stability & UI Polish - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Resolve known regressions and harden the build system. Specifically, unify the tag display in note previews to handle both manual and AI tags consistently, and fix TypeScript `verbatimModuleSyntax` build issues.

</domain>

<decisions>
## Implementation Decisions

### Tag Visuals & Distinction

- **Distinction:** Color-coded. Use distinct background colors to differentiate Manual tags from AI tags (e.g., specific theme colors for each type).
- **Style:** Label (Minimal). Rectangular shape with slight rounding, avoiding the full "pill" look.
- **Icons:** Text Only. Do not use icons like `#` or `✨`.
- **Prominence:** Standard text size.

### Tag Ordering & Grouping

- **Order:** Manual Priority. Display manual tags first, followed by AI tags.
- **Separation:** Continuous. No visual dividers or headers; rely on the color coding to distinguish the groups within the single flow.
- **Duplicates:** Merge (Prefer Manual). If a tag exists in both lists (e.g., 'todo'), display it only once, treating it as a Manual tag (using manual color/style).
- **Overflow:** Truncate. Show a single line of tags and truncate with a "+X more" indicator if they exceed the available space.

### Tag Interactions

- **Click Action:** Filter. Clicking the tag body triggers a filter for that tag.
- **Removal:** 'x' Button. Include a small 'x' button inside the tag for removal. This applies to **both** manual and AI tags.
- **Verification:** Confirm Modal. Show a confirmation dialog (OK/Cancel) before removing a tag to prevent accidental deletion.
- **Hover:** None. No specific hover effects required.
- **Copy:** Text Selection. Users should be able to select the text of the tag to copy it.

### Claude's Discretion

- Exact color palette choices for Manual vs AI tags (within the "Color-coded" decision).
- Specific implementation of the "Confirm Modal" (native vs custom UI).
- Exact logic for the "+X more" calculation and display.
- Technical implementation of `verbatimModuleSyntax` fixes (technical task).

</decisions>

<specifics>
## Specific Ideas

- "one click to remove both manual and ai tags with verification" - Clear requirement for removal workflow.
- Visual style should remain minimal and clean, avoiding visual clutter.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 14-stability-ui-polish_
_Context gathered: 2026-01-31_
