---
type: quick
task: 003
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/sidebar/SidebarNoteCard.tsx
autonomous: true

must_haves:
  truths:
    - "Expand icon only shows when there are more than 3 tags"
    - "Clicking expand icon shows all tags instead of note preview"
    - "Tags display in same styling as currently shown"
  artifacts:
    - path: "apps/web/src/components/sidebar/SidebarNoteCard.tsx"
      provides: "Tag expansion functionality"
      min_lines: 100
  key_links:
    - from: "expand button click handler"
      to: "tag expansion state"
      via: "isExpanded state toggle"
      pattern: "setIsExpanded"
---

<objective>
Replace note preview expansion with tag list expansion in sidebar note cards.

Purpose: Improve UI by showing expanded tag information when users need it, removing the preview feature that was recently deemed unnecessary.
Output: Sidebar note cards that expand to show full tag list when clicked, with expand icon only visible when needed.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

## Current Implementation

The SidebarNoteCard currently:
- Shows up to 3 tags with "+N" indicator if more exist (lines 72-86)
- Has an expand button that shows/hides note preview (lines 89-116)
- Uses `isExpanded` state to toggle preview content (line 19)

## Required Changes

1. Move expand icon next to tags section
2. Only show expand icon when `allTags.length > 3`
3. Change expanded content from Markdown preview to full tag list
4. Maintain hover-to-show behavior for expand icon
</context>

<tasks>

<task type="auto">
  <name>Refactor SidebarNoteCard to expand tags instead of preview</name>
  <files>apps/web/src/components/sidebar/SidebarNoteCard.tsx</files>
  <action>
Modify the SidebarNoteCard component to replace preview expansion with tag expansion:

1. **Restructure tags section** (lines 71-87):
   - Wrap tags display in a container div
   - Add expand button next to tags (not at card level)
   - Only render expand button when `allTags.length > 3`
   - Move expand button to be inline with tags, not at top-right of card

2. **Update expanded content** (lines 105-116):
   - Replace Markdown preview with full tag list
   - Show all tags when expanded (not just first 3)
   - Remove "+N more" indicator when expanded
   - Use same Tag component styling with consistent sizing
   - Keep smooth transition animation

3. **Update button styling**:
   - Keep hover-to-show behavior (`opacity-0 group-hover:opacity-100`)
   - Position expand icon logically near tags section
   - Use smaller icon size to fit with tag sizing (w-3 h-3)

4. **Simplify component**:
   - Remove bodyContent extraction (lines 32-34) - no longer needed
   - Remove Markdown import if not used elsewhere
   - Keep clean separation between collapsed (3 tags) and expanded (all tags) states

Expected structure:
```tsx
{allTags.length > 0 && (
  <div className="flex items-start gap-1 mt-2">
    <div className="flex flex-wrap gap-1 flex-1">
      {/* Show 3 tags when collapsed, all when expanded */}
      {(isExpanded ? allTags : allTags.slice(0, 3)).map(...)}
      {!isExpanded && allTags.length > 3 && (
        <span>+{allTags.length - 3}</span>
      )}
    </div>
    {allTags.length > 3 && (
      <button onClick={...} /* expand/collapse toggle */>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </button>
    )}
  </div>
)}
```
  </action>
  <verify>
1. Run `pnpm dev` and open web client
2. Open sidebar (Ctrl+B) and locate notes with varying tag counts:
   - Notes with 0-3 tags: No expand icon visible
   - Notes with 4+ tags: Expand icon visible on hover
3. Click expand icon on note with 4+ tags:
   - All tags should display in expanded view
   - ChevronDown changes to ChevronUp
4. Click collapse icon:
   - Returns to showing 3 tags + "+N" indicator
   - ChevronUp changes to ChevronDown
5. Verify no console errors
  </verify>
  <done>
- Expand icon only appears on notes with more than 3 tags
- Clicking expand shows all tags (not note preview)
- Expand icon positioned next to tags section
- Smooth expand/collapse animation maintained
- Tag styling consistent between collapsed and expanded states
  </done>
</task>

</tasks>

<verification>
Run application and test sidebar note cards:
- Notes with ≤3 tags: No expand icon
- Notes with >3 tags: Expand icon on hover
- Expansion shows full tag list, not preview
- Visual consistency maintained
</verification>

<success_criteria>
- [ ] Expand icon only visible when allTags.length > 3
- [ ] Clicking expand icon toggles tag list (not preview)
- [ ] Expanded view shows all tags with consistent styling
- [ ] Collapsed view shows 3 tags + "+N" indicator
- [ ] Smooth animation on expand/collapse
- [ ] No console errors or warnings
</success_criteria>

<output>
After completion, create `.planning/quick/003-replace-preview-with-expandable-tags-in-/003-SUMMARY.md`
</output>
