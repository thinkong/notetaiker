# Quick Plan: Add Manual Tags and Display AI Tags in Editor

**Phase:** 005-add-manual-tags-and-display-ai-tags-in-e
**Plan:** 005
**Type:** execute
**Wave:** 1

**Objective:**
Allow users to manually add/remove tags and view/dismiss AI-generated tags in the editor.

**Tasks:**

1. **Update State Management in `App.tsx`**:
   - Add state to track `tags`, `ai_tags`, and `ignored_tags` for the current note.
   - Update `handleEditNote` to populate this state from the fetched note metadata.
   - Modify `handleSave` and the `useDebouncedSave` hook to include metadata when persisting changes.

2. **Create Tag Management UI**:
   - Build a `TagManager` component (or integrate into the main layout) that displays manual tags (blue) and AI tags (purple).
   - Implement an input field for adding new manual tags.
   - Add dismissal logic: removing a manual tag deletes it from the list; dismissing an AI tag moves it to `ignored_tags` to prevent it from reappearing.

3. **Verify Persistence**:
   - Ensure that adding/removing tags triggers the save process.
   - Confirm that the backend correctly updates the markdown frontmatter with the new `tags`, `ai_tags`, and `ignored_tags` arrays.
