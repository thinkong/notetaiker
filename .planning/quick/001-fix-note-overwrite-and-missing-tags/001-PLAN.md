---
phase: quick
plan: 001
type: fix
autonomous: true
---

# Quick Plan 001: Fix Note Overwrite and Missing Tags

Fix two critical bugs in the storage and tagging logic:
1. Race condition/collision in filename generation causing note overwrites.
2. Incorrect tag merging during updates causing loss of existing or AI-generated tags.

## Context
- `StorageService.generateUniqueFileName` uses `yyyyMMdd-HHmmss` which is too coarse.
- `StorageService.saveNote` merges metadata in a way that overwrites the `tags` array rather than merging it.

## Tasks

### Task 1: Fix Filename Collision (Overwrite)
**Type:** auto
**Description:** Add millisecond precision and a short random suffix to generated filenames to prevent collisions.
**Verification:**
- Save two notes rapidly in the same second.
- Verify they both persist with unique filenames.

### Task 2: Fix Tag Merging Logic
**Type:** auto
**Description:** Update `StorageService.saveNote` to intelligently merge `tags`, `ai_tags`, and `ignored_tags` instead of simply overwriting the arrays.
**Verification:**
- Create a note with tags.
- Update it with a new hashtag in the content.
- Verify both the old tags and the new hashtag are present.

### Task 3: Unified Tag Merging in Routes
**Type:** auto
**Description:** Ensure `notes.ts` routes use a consistent approach for extracting and merging tags that doesn't conflict with `StorageService` logic.
**Verification:**
- Verify `POST` and `PATCH` routes both handle tags correctly.

## Success Criteria
- [ ] No note overwrites during concurrent/rapid saves.
- [ ] Updating a note preserves existing tags and merges new hashtags.
- [ ] AI tags and ignored tags are preserved during manual updates.
