# Phase 13: Manual Tag Control - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

User control over tags with intelligent AI preservation.

- Enable manual tagging via editor interactions (typing `#tag`).
- Distinguish between User-defined tags and AI-generated tags in storage and UI.
- Ensure AI updates do not overwrite user decisions.
- Visualize tags clearly with control to remove/manage them.

</domain>

<decisions>
## Implementation Decisions

### Tag Entry Experience

- **Trigger**: Typing `#` immediately triggers tag mode/autocomplete.
- **Autocomplete**: Shows ALL existing tags (both Manual and AI-generated source).
- **Completion**: Pressing `,` (comma) completes the tag.
- **Visual Style**: Tags remain as highlighted text in the body (not immediate chips), but promote to metadata.

### Frontmatter Structure

- **Storage**: Separate keys in YAML frontmatter:
  - `tags`: User-defined tags (Manual).
  - `ai_tags`: AI-generated tags (AI).
- **Format**: Simple string arrays (e.g., `["work", "urgent"]`).
- **Promotion**: Hashtags typed in the body are automatically promoted to the `tags` frontmatter list.
- **Display**: The raw YAML block is collapsed/hidden by default.
- **UI Location**: Rendered tag list shown at the bottom of the editor.

### AI Interaction & Preservation

- **Update Frequency**: AI analysis runs **On Save**.
- **Conflict Handling**:
  - **User Wins**: If AI generates a tag that exists in `tags` (Manual), the Manual tag takes precedence (deduplicated in UI, stored in `tags`).
  - **Removal Memory**: If a user manually removes an AI tag, the AI should NOT silently re-add it. The user selected "Ask user" — implies a need for a mechanism to either track ignored tags or prompt before re-adding previously deleted ones (likely via a "Suggestions" review state or simple suppression).
- **Mutability**: User can delete AI-generated tags.

### Visual Distinction

- **Differentiation**: Color coding to distinguish sources (e.g., Blue for Manual, Purple for AI).
- **Management**: Hover over a tag to reveal an 'x' button to remove it.
- **Density**: If many tags (>10), truncate the list (e.g., "Show more").

### Claude's Discretion

- Specific colors/styling for the tags.
- Exact mechanism for "Ask user" on re-add (e.g., an `ignored_tags` field or just stateless heuristic).
- Design of the autocomplete dropdown.

</decisions>

<specifics>
## Specific Ideas

- "User may delete ai generated tags."
- Comma as the completion key (common pattern in tag inputs).
- Tags at the bottom of the editor (common in note apps like Bear/Obsidian).

</specifics>

<deferred>
## Deferred Ideas

- Advanced tag management (rename, merge) — future phase.
- Hierarchical tags (nested) — future phase.

</deferred>

---

_Phase: 13-manual-tag-control_
_Context gathered: 2026-01-30_
