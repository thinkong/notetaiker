# Phase 14: Stability & UI Polish - Research

**Researched:** 2026-01-31
**Domain:** TypeScript Configuration, ESLint Enforcement, React Component Unification
**Confidence:** HIGH

## Summary

This research phase focused on two primary tracks: unifying the tag UI in the Note Preview Overlay and hardening the build system by enforcing `verbatimModuleSyntax` and proper linter rules across the monorepo.

### UI Polish Findings

- The `Tag` component is located at `apps/web/src/components/common/Tag.tsx`. It already supports `manual` and `ai` variants with distinct styling.
- The `NotePreviewOverlay` (`apps/web/src/components/preview/NotePreviewOverlay.tsx`) currently renders tags as a comma-separated string, ignoring `ai_tags` and visual consistency with the rest of the app.
- Both `tags` and `ai_tags` are available in the `NoteMetadata` type and should be displayed in the preview.

### Stability & Build Hardening Findings

- TypeScript 5.9.3 is used across the monorepo.
- `verbatimModuleSyntax` is currently enabled in `apps/web` but missing from `apps/api` and the base TSConfig.
- Enabling `verbatimModuleSyntax` in `apps/api` revealed multiple "value is never read" errors for type-only imports (e.g., in `worker.service.test.ts`).
- To prevent regressions, the linter should be configured to enforce `import type` syntax. The `@typescript-eslint/consistent-type-imports` rule is the standard for this, though it must be carefully configured alongside `verbatimModuleSyntax`.

**Primary recommendation:** Enable `verbatimModuleSyntax` in the base TSConfig and use the `Tag` component in `NotePreviewOverlay` to render both manual and AI tags with their respective variants.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library           | Version | Purpose                       | Why Standard                                               |
| ----------------- | ------- | ----------------------------- | ---------------------------------------------------------- |
| TypeScript        | 5.9.3   | Static typing & module syntax | Industry standard, provides `verbatimModuleSyntax`         |
| typescript-eslint | ^8.46.4 | Linting for TypeScript        | Standard for enforcing TS-specific rules like type imports |
| React             | ^19.2.0 | Frontend framework            | Project framework                                          |

## Architecture Patterns

### Tag Unification Pattern

The `Tag` component should be the single source of truth for tag visualization. It handles:

- **Variants**: `manual` (blue/nord-frost3) vs `ai` (purple/nord-aurora4).
- **Icons**: AI tags feature a small dot indicator.
- **Interactions**: Optional `onDismiss` handler.

### Module Syntax Pattern

With `verbatimModuleSyntax: true`, TypeScript enforces that:

- Type-only imports MUST use `import type`.
- Imports that include values cannot be marked as `import type`.
- This ensures that the generated JavaScript is predictable and doesn't include ghost imports that cause runtime errors or bundle bloat.

## Don't Hand-Roll

| Problem                 | Don't Build                                | Use Instead                                  | Why                                                                 |
| ----------------------- | ------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------- |
| Type import enforcement | Custom regex or manual checks              | `@typescript-eslint/consistent-type-imports` | Handles complex cases like named vs default imports and auto-fixes. |
| Tag styling             | Inline Tailwind classes in multiple places | `apps/web/src/components/common/Tag.tsx`     | Ensures visual consistency and centralized theme updates.           |

## Common Pitfalls

### Pitfall 1: verbatimModuleSyntax vs consistent-type-imports

**What goes wrong:** Potential conflict or redundancy where both the compiler and linter report the same issue but with slightly different suggestions.
**How to avoid:** Configure `consistent-type-imports` with `prefer: 'type-imports'` and `fixStyle: 'separate-type-imports'` to match the behavior expected by `verbatimModuleSyntax`.
**Warning signs:** Build passes but lint fails, or vice versa.

### Pitfall 2: Missing ai_tags in Preview

**What goes wrong:** Users might not see AI-generated tags in the preview overlay even though they are indexed and stored.
**How to avoid:** Update the note fetching logic or the display logic in `NotePreviewOverlay` to explicitly check for and map over `ai_tags`.

## Code Examples

### Correct Type Import with verbatimModuleSyntax

```typescript
// Source: https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax
import type { QueueService } from "../services/queue.service";
import { WorkerService } from "./worker.service";
```

### Unifying Tags in Preview Overlay

```tsx
// Pattern for NotePreviewOverlay.tsx
<div className="flex flex-wrap gap-2">
  {note.metadata.tags?.map((tag) => (
    <Tag key={tag} label={tag} variant="manual" />
  ))}
  {note.metadata.ai_tags?.map((tag) => (
    <Tag key={tag} label={tag} variant="ai" />
  ))}
</div>
```

### ESLint Configuration for Type Imports

```javascript
// Pattern for apps/web/eslint.config.js and packages/eslint-config/base.js
{
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        fixStyle: "separate-type-imports",
      },
    ],
  }
}
```

## Open Questions

1. **Circular Dependencies**
   - What we know: `verbatimModuleSyntax` often exposes circular dependencies that were previously hidden by type-erasure.
   - What's unclear: If any exist in `apps/api`.
   - Recommendation: Run a full build with the flag enabled and address any "used as a value" errors by refining the import structure.

## Sources

### Primary (HIGH confidence)

- TypeScript Documentation - [verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax)
- typescript-eslint Documentation - [consistent-type-imports](https://typescript-eslint.io/rules/consistent-type-imports/)

### Secondary (MEDIUM confidence)

- Local Codebase - `apps/web/src/components/common/Tag.tsx` (Component definition)
- Local Codebase - `apps/web/src/components/preview/NotePreviewOverlay.tsx` (Target for refactoring)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH
- Architecture: HIGH
- Pitfalls: HIGH

**Research date:** 2026-01-31
**Valid until:** 2026-03-02
