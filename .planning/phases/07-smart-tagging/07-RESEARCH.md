# Phase 07: Smart Tagging - Research

**Researched:** 2026-01-29
**Domain:** AI-generated metadata & YAML injection
**Confidence:** HIGH

## Summary

Phase 07 focuses on implementing automated tag generation for notes using AI. The system will extract 3-5 relevant, Title Case tags from note content and inject them into the file's YAML frontmatter using a merge strategy that preserves existing tags.

The research confirms that the Vercel AI SDK (`ai`) is the current standard for multi-provider AI integrations (OpenAI, Anthropic, Gemini), providing a unified API for structured data generation via `generateObject`. This approach ensures type safety and simplifies prompt engineering for specific formats like tag lists.

**Primary recommendation:** Use the Vercel AI SDK (`ai`) with `generateObject` to produce structured tag lists, and leverage the existing `gray-matter` library for safe frontmatter injection.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | ^6.0.0 | Unified AI SDK | Standard for multi-provider support and structured output. |
| `@ai-sdk/openai` | ^3.0.0 | OpenAI Provider | Official Vercel AI SDK provider for OpenAI models. |
| `@ai-sdk/anthropic` | ^3.0.0 | Anthropic Provider | Official Vercel AI SDK provider for Claude models. |
| `@ai-sdk/google` | ^3.0.0 | Gemini Provider | Official Vercel AI SDK provider for Google models. |
| `gray-matter` | ^4.0.0 | Frontmatter parsing | Already in codebase; supports `stringify` for metadata injection. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | ^3.0.0 | Schema validation | To define the structured output schema for the AI. |
| `p-retry` | ^7.0.0 | Error handling | Already in codebase; handles transient AI API failures. |

**Installation:**
```bash
npm install ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google
```

## Architecture Patterns

### Recommended Project Structure
```
apps/api/src/
├── services/
│   ├── ai.service.ts      # New: Handles LLM interaction via Vercel AI SDK
│   └── worker.service.ts  # Updated: Orchestrates tagging via AIService
└── lib/
    └── markdown.ts        # Updated: Add frontmatter injection logic
```

### Pattern 1: Structured Tag Generation
**What:** Using `generateObject` with a Zod schema to ensure the AI returns a valid array of strings.
**When to use:** Every time a note needs tagging.
**Example:**
```typescript
// Source: https://sdk.ai.dev/docs/ai-sdk-core/generating-structured-objects
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const { object } = await generateObject({
  model: openai('gpt-4o'),
  schema: z.object({
    tags: z.array(z.string()).min(3).max(5),
  }),
  prompt: 'Generate 3-5 relevant tags for this note. Use Title Case.',
  system: 'You are a professional organizer. Categorize notes with concise tags.',
});
```

### Anti-Patterns to Avoid
- **Regex Frontmatter Parsing:** Never use regex to find/replace frontmatter. Use `gray-matter` to parse, modify the data object, and re-stringify.
- **Provider Lock-in:** Don't use the `openai` or `anthropic` SDKs directly. The Vercel AI SDK allows switching providers based on user configuration.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-provider support | Custom abstraction | `ai` SDK | Handles auth, formatting, and tool-calling across providers. |
| Structured extraction | Prompting with "return JSON" | `generateObject` | Built-in support for tool-calling/JSON mode with Zod validation. |
| Metadata injection | String manipulation | `gray-matter.stringify` | Handles YAML delimiters and edge cases (like multi-line strings). |

**Key insight:** The Vercel AI SDK removes the need to write complex "Return only JSON" prompts, as it handles the underlying tool-calling or response formatting automatically for structured output.

## Common Pitfalls

### Pitfall 1: Overwriting User Tags
**What goes wrong:** AI-generated tags replace tags the user manually added.
**Why it happens:** Simple assignment (`metadata.tags = aiTags`).
**How to avoid:** Implement a merge strategy: `Array.from(new Set([...existingTags, ...aiTags]))`.
**Warning signs:** Tags disappearing after "Smart Tagging" runs.

### Pitfall 2: YAML String vs List
**What goes wrong:** `gray-matter` might stringify tags as a YAML list (`- tag1`) while requirements ask for a comma-separated string.
**Why it happens:** Default YAML serialization behavior.
**How to avoid:** Store tags in the metadata object as a single string joined by `, ` if compactness is strictly required, or ensure the parser/writer is consistent.

## Code Examples

### Frontmatter Merge & Inject
```typescript
import matter from 'gray-matter';

function injectTags(fileContent: string, newTags: string[]): string {
  const { content, data } = matter(fileContent);

  // Merge logic
  const existingTags = data.tags
    ? data.tags.split(',').map((t: string) => t.trim())
    : [];
  const mergedTags = Array.from(new Set([...existingTags, ...newTags]));

  // Inject back as comma-separated string
  data.tags = mergedTags.join(', ');

  return matter.stringify(content, data);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Provider-specific SDKs | Unified AI SDK (`ai`) | 2024-2025 | Easier to support OpenAI, Claude, and Gemini simultaneously. |
| Raw Prompting for JSON | Structured Output (`generateObject`) | 2024 | Guaranteed type-safe responses without regex/parsing hacks. |

## Open Questions

1. **Opt-out Flag Name**
   - What we know: Requirement says `ai: false`.
   - What's unclear: Should we also support `tags: false`?
   - Recommendation: Stick to `ai: false` as the primary opt-out for all AI processing for that file.

2. **Debounce for Edits**
   - What we know: Must run on "significant edits".
   - What's unclear: What constitutes "significant"?
   - Recommendation: Use a 5-minute debounce or a word-count threshold change (e.g., ±50 words) to avoid excessive API calls during active typing.

## Sources

### Primary (HIGH confidence)
- [ai-sdk] - Vercel AI SDK Core (generateObject)
- [gray-matter] - Official documentation for parsing and stringifying.
- [apps/api/src/services/worker.service.ts] - Current implementation of background jobs.

### Secondary (MEDIUM confidence)
- [WebSearch] - Confirmed Vercel AI SDK 6.x is the standard in 2026.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Industry standard and already partially supported by env schema.
- Architecture: HIGH - Fits perfectly into existing Worker/Queue pattern.
- Pitfalls: HIGH - Common issues in metadata management.

**Research date:** 2026-01-29
**Valid until:** 2026-02-28
