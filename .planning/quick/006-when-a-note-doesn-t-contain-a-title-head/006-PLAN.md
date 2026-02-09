---
phase: quick-006
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/api/src/services/ai.service.ts
  - apps/api/src/lib/markdown.ts
  - apps/api/src/services/worker.service.ts
  - apps/api/src/services/ai.service.test.ts
autonomous: true

must_haves:
  truths:
    - "Notes without a header (#) get an AI-generated title in frontmatter"
    - "Title generation happens during background processing"
    - "Existing titles (header or frontmatter) are preserved"
  artifacts:
    - path: "apps/api/src/services/ai.service.ts"
      provides: "generateTitle method using LLM"
      exports: ["generateTitle"]
    - path: "apps/api/src/lib/markdown.ts"
      provides: "extractFirstHeader utility function"
      exports: ["extractFirstHeader"]
    - path: "apps/api/src/services/worker.service.ts"
      provides: "Title generation logic in executeJob"
      contains: "generateTitle"
  key_links:
    - from: "apps/api/src/services/worker.service.ts"
      to: "apps/api/src/lib/markdown.ts"
      via: "extractFirstHeader call"
      pattern: "extractFirstHeader\\("
    - from: "apps/api/src/services/worker.service.ts"
      to: "apps/api/src/services/ai.service.ts"
      via: "generateTitle call when no header found"
      pattern: "aiService\\.generateTitle\\("
---

<objective>
Automatically generate a title using an LLM when a note doesn't contain a header (# ...).

Purpose: Improve note discoverability and organization by ensuring all notes have meaningful titles, even when users don't explicitly add headers.
Output: Working title generation that runs during background processing, storing titles in frontmatter.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

# Current implementation

@apps/api/src/services/ai.service.ts
@apps/api/src/services/worker.service.ts
@apps/api/src/lib/markdown.ts

# Frontend usage (read-only for understanding)

@apps/web/src/components/sidebar/SidebarNoteCard.tsx
@apps/web/src/hooks/useGraphData.ts

# Testing patterns

@apps/api/src/services/ai.service.test.ts
</context>

<tasks>

<task type="auto">
  <name>Add extractFirstHeader utility and generateTitle method</name>
  <files>
    apps/api/src/lib/markdown.ts
    apps/api/src/services/ai.service.ts
    apps/api/src/services/ai.service.test.ts
  </files>
  <action>
1. In `apps/api/src/lib/markdown.ts`, add `extractFirstHeader` function:
   - Check if content has a line starting with `#` (one or more #)
   - Return the header text without the `#` symbols and trimmed, or null if no header found
   - Export the function

2. In `apps/api/src/services/ai.service.ts`, add `generateTitle` method:
   - Accept `content: string` parameter
   - Use existing `getModel()` to get the AI model
   - Use `generateText` with `Output.object` to generate a structured response
   - Schema: `{ title: z.string().max(60).describe("Concise, descriptive title") }`
   - Prompt: "Generate a concise, descriptive title (max 60 chars) for this note content:\n\n{content}"
   - Return the generated title string
   - Follow the same pattern as `generateTags` method

3. In `apps/api/src/services/ai.service.test.ts`, add test for `generateTitle`:
   - Mock the AI response
   - Verify title is generated from note content
   - Verify title respects max length constraint
     </action>
     <verify>
     pnpm --filter @notetaiker/api test markdown.test.ts
     pnpm --filter @notetaiker/api test ai.service.test.ts
     </verify>
     <done>
   - extractFirstHeader correctly identifies headers and returns null when missing
   - generateTitle method exists and returns AI-generated titles
   - Tests pass
     </done>
     </task>

<task type="auto">
  <name>Integrate title generation in worker service</name>
  <files>
    apps/api/src/services/worker.service.ts
  </files>
  <action>
In `apps/api/src/services/worker.service.ts`, modify `executeJob` method to generate titles:

1. Import `extractFirstHeader` from `../lib/markdown`

2. After loading the note and checking `ai === false`, add title generation logic:
   - Check if `note.metadata.title` already exists - if yes, skip title generation
   - Call `extractFirstHeader(note.content)` to check for existing header
   - If header exists, use it as title (save to frontmatter for consistency)
   - If no header and no existing title, call `await this.aiService.generateTitle(note.content)`
   - Store result in `note.metadata.title`

3. Update the metadata saving logic:
   - Track if title was added/changed with a boolean `titleChanged`
   - Include title in `updatedMetadata` object
   - Only save if `aiTagsChanged || titleChanged`
   - Update console.log messages to indicate when title is generated

4. Preserve existing tag generation logic - title generation runs alongside it.
   </action>
   <verify>
   pnpm --filter @notetaiker/api test worker.service.test.ts
   pnpm lint
   </verify>
   <done> - Worker generates titles for notes without headers during background processing - Existing titles and headers are preserved - Title is saved to frontmatter (metadata.title) - Tests pass and no linting errors
   </done>
   </task>

<task type="auto">
  <name>Add test coverage for title generation workflow</name>
  <files>
    apps/api/src/lib/markdown.test.ts
  </files>
  <action>
In `apps/api/src/lib/markdown.test.ts`, add tests for `extractFirstHeader`:

1. Test "should extract first header when present":
   - Content: "# My Title\n\nSome content"
   - Expect: "My Title"

2. Test "should handle multiple # symbols (h2, h3)":
   - Content: "## Second Level\n\nContent"
   - Expect: "Second Level"

3. Test "should return null when no header present":
   - Content: "Just some text without a header"
   - Expect: null

4. Test "should handle empty content":
   - Content: ""
   - Expect: null

5. Test "should handle header with extra whitespace":
   - Content: "# Spaced Title \n\nContent"
   - Expect: "Spaced Title"
     </action>
     <verify>
     pnpm --filter @notetaiker/api test markdown.test.ts
     </verify>
     <done>
   - All extractFirstHeader tests pass
   - Edge cases are handled correctly
     </done>
     </task>

</tasks>

<verification>
Integration verification:
1. Create a note without a header: POST /api/notes with content "This is my note without any header"
2. Wait for background worker to process the job
3. Fetch the note: GET /api/notes/:id
4. Verify `metadata.title` is populated with an AI-generated title
5. Verify the original note content is unchanged
6. Create another note with a header: "# My Header\n\nContent"
7. Verify the header is extracted to `metadata.title` instead of generating one
</verification>

<success_criteria>

- Notes without headers get AI-generated titles stored in frontmatter
- Notes with headers use the header text as the title
- Existing titles are never overwritten
- Title generation happens during background processing (same job as tags)
- Frontend continues to work (reads from metadata.title first, then extracts from content)
- All tests pass: `pnpm test`
  </success_criteria>

<output>
After completion, create `.planning/quick/006-when-a-note-doesn-t-contain-a-title-head/006-SUMMARY.md`
</output>
