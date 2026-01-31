# Phase 12: UX Flow Improvements - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Seamless navigation and editing session management. Users can click notes to view them, save with Cmd+Enter and immediately start fresh, and experience instant, intentional navigation between notes. This phase focuses on flow — not new features.

</domain>

<decisions>
## Implementation Decisions

### Note loading

- Click on note in side panel opens a **full overlay preview** (read-only)
- **Double-click not used** — Edit button in preview transitions to edit mode
- Dismiss preview via **click outside, Escape, or close button** (multiple options)
- Preview takes over main content area, editor hidden until dismissed

### Save-and-reset flow

- After Cmd+Enter: **toast notification** appears, editor clears
- Toast **auto-dismisses** (2-3 seconds), no undo option needed
- **Focus returns to editor** after clear — ready to type immediately
- Side panel **updates immediately** with new note, tags appear progressively when AI completes

### Editor focus states

- Placeholder **disappears instantly** when editor is clicked (not on type)
- **Background color shift** indicates focused state (not border highlight)
- Cursor appears at **click position** in empty editor
- **Auto-focus on page load** — editor ready immediately

### Draft handling

- If unsaved content exists when clicking a note: **warn dialog** appears
- Dialog offers three options: **Save / Discard / Cancel**
- **Auto-save drafts to localStorage** as user types
- On app load with existing draft: **silent restore** (no prompt, content appears)

### Claude's Discretion

- Toast styling and animation
- Exact timing for auto-dismiss (within 2-4 second range)
- Background shift color values
- localStorage key naming and cleanup strategy
- Preview overlay animation/transition style

</decisions>

<specifics>
## Specific Ideas

- Note list should feel responsive — immediate update on save, then tags fill in when AI finishes (progressive enhancement pattern)
- The overall flow should feel like rapid capture: save → clear → ready

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 12-ux-flow-improvements_
_Context gathered: 2026-01-30_
