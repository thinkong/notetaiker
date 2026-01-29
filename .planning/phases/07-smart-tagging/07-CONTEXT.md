# Phase 07: Smart Tagging - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement automated tag generation and YAML frontmatter injection. The system analyzes note content using AI to generate relevant tags and updates the file's frontmatter. This phase focuses purely on the backend processing and data injection. UI for searching or filtering by tags is in Phase 8.

</domain>

<decisions>
## Implementation Decisions

### Tag Taxonomy & Style
- **Casing:** Title Case (e.g., `ProjectPlanning`, `React`, `MeetingNotes`).
- **Specificity:** Mixed/Balanced - include both high-level categories and specific keywords.
- **Quantity:** Target 3-5 tags per note.
- **Hierarchy:** Flat structure only (no nested tags like `dev/react`).

### Injection Strategy
- **Location:** YAML Frontmatter at the top of the file.
- **Format:** Comma-separated string (e.g., `tags: React, TypeScript, Planning`).
- **Conflict Handling:** Merge strategy. Preserve existing user-defined tags, deduplicate, and append new AI tags.
- **Scope:** Inject **only** tags. Do not add titles, summaries, or other metadata fields.

### Context Awareness
- **Scope:** Isolated/Stateless. The AI analyzes *only* the current note content. It is not aware of other tags in the codebase.
- **Bias:** Precision over consistency. Prioritize describing the specific note accurately rather than forcing it into a pre-existing taxonomy.
- **Inputs:** Content only. Ignore file paths or folder structures.
- **Configuration:** Standard/Generic prompt. No support for custom `.cursorrules` or project-specific tagging instructions yet.

### Trigger Rules
- **Triggers:** Run on note creation AND on significant edits.
- **Minimum Content:** No minimum length (process everything).
- **Opt-out:** Support an explicit frontmatter flag (e.g., `ai: false`) to disable processing for specific notes.
- **Failure Mode:** Retry with exponential backoff if the AI service fails.

### Claude's Discretion
- Exact debounce logic for "Update on Edit" to prevent excessive API calls.
- Specific name of the opt-out flag (e.g., `ai: false` vs `no-tag: true`).
- Prompt engineering details to ensure Title Case and quantity limits.

</decisions>

<specifics>
## Specific Ideas

- "Comma-separated string in YAML is preferred over list format for compactness."
- "Updates on edit mean the system must be robust enough to re-read frontmatter, parse it, and merge responsibly."

</specifics>

<deferred>
## Deferred Ideas

- **Tag UI:** filtering, searching, or clicking tags (Phase 8).
- **Global Taxonomy:** Having the AI learn from existing project tags to enforce consistency (Future Phase).
- **Folder-based inference:** Using file location to auto-tag (Future Phase).

</deferred>

---

*Phase: 07-smart-tagging*
*Context gathered: 2026-01-29*
