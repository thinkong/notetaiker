# Phase 13: Manual Tag Control - Research

**Researched:** 2026-01-30
**Domain:** CodeMirror 6 Extensions, Markdown Frontmatter Management, AI Enrichment Preservation
**Confidence:** HIGH

## Summary

This research explores the transition from a single AI-managed `tags` field to a dual-source tag system (Manual and AI). The current implementation in `notetaiker` stores all tags in a single `tags` array in the Markdown frontmatter, which is updated by the `WorkerService` using a simple merge strategy.

To implement Phase 13, we must:

1.  **Split Storage**: Introduce `ai_tags` for AI-generated metadata while reserving `tags` for user-defined input.
2.  **Editor Enhancement**: Implement a CodeMirror 6 extension to highlight hashtags (`#tag`) and provide autocompletion using the `@codemirror/autocomplete` library.
3.  **Promotion Logic**: Detect hashtags in the note body on save and "promote" them to the `tags` frontmatter field.
4.  **AI Safety**: Modify the `WorkerService` to only update `ai_tags` and strictly respect user deletions (via an `ignored_tags` list or similar heuristic).

**Primary recommendation:** Use CodeMirror's `MatchDecorator` for hashtag highlighting and a custom `CompletionSource` for autocompletion, while updating the API to manage `tags` and `ai_tags` as distinct collections.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library                    | Version | Purpose                 | Why Standard                                      |
| -------------------------- | ------- | ----------------------- | ------------------------------------------------- |
| `@codemirror/autocomplete` | ^6.0.0  | Autocomplete framework  | Official CodeMirror 6 extension for completions.  |
| `@codemirror/view`         | ^6.0.0  | Editor UI & Decorations | Required for `MatchDecorator` and visual styling. |
| `gray-matter`              | ^4.0.0  | Frontmatter parsing     | Currently used in the project for YAML metadata.  |

### Supporting

| Library | Version | Purpose    | When to Use                                                 |
| ------- | ------- | ---------- | ----------------------------------------------------------- |
| `zod`   | ^3.0.0  | Validation | For updating the `NoteFrontmatterSchema` with the new keys. |

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/components/editor/
├── extensions/
│   ├── hashtags.ts      # Highlight and Autocomplete logic
│   └── ...
└── ...
```

### Pattern 1: Hashtag Highlighting & Interaction

**What:** Use a `ViewPlugin` with a `MatchDecorator` to find hashtags and apply a specific CSS class.
**When to use:** Always, to provide immediate visual feedback that `#text` is being treated as a tag.
**Example:**

```typescript
// Source: https://codemirror.net/examples/decoration/
import {
  Decoration,
  MatchDecorator,
  ViewPlugin,
  EditorView,
} from "@codemirror/view";

export const hashtagHighlighter = ViewPlugin.fromClass(
  class {
    decorations = new MatchDecorator({
      regexp: /#(\w+)/g,
      decoration: Decoration.mark({ class: "cm-hashtag" }),
    }).createDeco(view);
    // ... update logic
  },
  {
    decorations: (v) => v.decorations,
  },
);
```

### Anti-Patterns to Avoid

- **Hard-overwriting `tags`:** AI must NEVER touch the `tags` key once the split is implemented.
- **Immediate promotion:** Don't move hashtags to frontmatter _while_ typing; it creates noise in the document. Wait for the save event.

## Don't Hand-Roll

| Problem         | Don't Build           | Use Instead                | Why                                                             |
| --------------- | --------------------- | -------------------------- | --------------------------------------------------------------- |
| Autocomplete UI | Custom dropdown       | `@codemirror/autocomplete` | Handles positioning, keyboard nav, and accessibility correctly. |
| Regexp Matching | Manual `pos` tracking | `MatchDecorator`           | Highly optimized for CodeMirror's document structure.           |

## Common Pitfalls

### Pitfall 1: Tag Source Confusion

**What goes wrong:** UI shows duplicate tags because "work" is in both `tags` and `ai_tags`.
**Why it happens:** AI suggests a tag the user already manually typed.
**How to avoid:** The UI should deduplicate by name, preferring the "Manual" (Blue) styling if a tag exists in both.

### Pitfall 2: Re-adding Deleted Tags

**What goes wrong:** User deletes an AI tag, but the AI worker puts it back on next save.
**Why it happens:** The worker is stateless and just sees "missing tags" from its perspective.
**How to avoid:** Implement an `ignored_tags` (or `deleted_ai_tags`) list in frontmatter to track AI tags the user has explicitly rejected.

## Code Examples

### Hashtag Autocomplete Source

```typescript
// Source: https://codemirror.net/docs/ref/#autocomplete.CompletionSource
import { autocompletion } from "@codemirror/autocomplete";

const hashtagCompletionSource = (context) => {
  let word = context.matchBefore(/#\w*/);
  if (!word || (word.from == word.to && !context.explicit)) return null;
  return {
    from: word.from,
    options: [
      { label: "#work", type: "keyword" },
      { label: "#urgent", type: "keyword" },
    ],
  };
};

// Use in extensions: [autocompletion({ override: [hashtagCompletionSource] })]
```

## Open Questions

1. **How to handle tag removal?**
   - What we know: Users can delete tags in the UI.
   - What's unclear: If they delete a `#tag` from the _body_, should it be removed from the frontmatter `tags` list on next save?
   - Recommendation: Yes. The frontmatter `tags` list should be treated as a "computed" field derived from the hashtags present in the body + any manually added chips.

2. **Is "On Save" AI processing too aggressive?**
   - What we know: Context says AI runs on save.
   - What's unclear: If the user saves 5 times in 1 minute, do we hit AI 5 times?
   - Recommendation: The `WorkerService` already handles queueing; ensuring it skips if a job for that `noteId` is already pending/active is sufficient.

## Sources

### Primary (HIGH confidence)

- [CodeMirror 6 Autocomplete](https://codemirror.net/docs/ref/#autocomplete.autocompletion)
- [CodeMirror 6 Decorations](https://codemirror.net/examples/decoration/)
- Project File: `apps/api/src/lib/markdown.ts` (Existing Frontmatter Schema)
- Project File: `apps/api/src/services/worker.service.ts` (Current AI Merge Logic)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Using official CodeMirror extensions.
- Architecture: HIGH - Fits well with existing frontmatter/worker pattern.
- Pitfalls: MEDIUM - Derived from common "AI feedback loop" problems.

**Research date:** 2026-01-30
**Valid until:** 2026-03-01
