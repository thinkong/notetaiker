---
phase: quick
plan: 001
subsystem: storage
tags: [sqlite, filesystem, tagging, bugfix]
requires: []
provides: [robust-storage, intelligent-tagging]
affects: [ai-processor]
tech-stack:
  added: []
  patterns: [metadata-preservation, filename-entropy]
key-files:
  created: []
  modified:
    [
      apps/api/src/services/storage.service.ts,
      apps/api/src/services/indexer.service.ts,
      apps/api/src/routes/notes.ts,
    ]
decisions:
  - Preserving full metadata in SQLite index to avoid data loss during listing and filtering.
  - Adding millisecond precision and random suffix to filenames to eliminate race conditions in note creation.
metrics:
  duration: 275s
  completed: 2026-02-02
---

# Phase quick Plan 001: Fix Note Overwrite and Missing Tags Summary

Fixed two critical bugs affecting note persistence and metadata integrity. The system now robustly handles rapid note creation and intelligently merges tags without losing existing manual or AI-generated metadata.

## Deviations from Plan

None - plan executed exactly as written.

## Key Improvements

### 1. Robust Filename Generation

Modified `StorageService.generateUniqueFileName` to use millisecond precision and a 4-character random suffix. This ensures that even notes created within the same millisecond by concurrent processes (or rapid UI actions) will have unique filenames, preventing accidental overwrites.

### 2. Intelligent Metadata Preservation

Updated `IndexerService` to store the complete metadata JSON in the SQLite index. This allows the system to return full metadata when listing notes without having to read every file from disk, while ensuring that custom fields (like `title`, `ai_tags`, or `ignored_tags`) are never lost.

### 3. Centralized Tag Merging

Consolidated tag merging logic into `StorageService.saveNote`. The system now:

- Preserves existing manual tags.
- Merges new hashtags extracted from content.
- Protects `ai_tags` and `ignored_tags` from being overwritten by manual updates.
- Simplifies API routes by delegating these concerns to the service layer.

## Verification Results

- Verified unique filenames for rapid saves via `storage.service.test.ts`.
- Verified metadata preservation and tag merging via unit tests.
- Verified that `listNotes` correctly returns full metadata from the index.
