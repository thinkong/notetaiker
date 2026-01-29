# Phase 02: Storage Engine - Research

**Researched:** 2026-01-27
**Domain:** Filesystem Storage & Metadata Management
**Confidence:** HIGH

## Summary

Phase 02 focuses on the core storage logic for NoteTaiker. We need to implement a robust, atomic way to write Markdown files with YAML frontmatter to a flat directory. The research confirms that using established libraries for atomic writes and frontmatter parsing is superior to hand-rolling these solutions, especially regarding edge cases like file system locks, partial writes, and cross-platform compatibility.

Key findings:

- **write-file-atomic** is the industry standard for ensuring files are written completely or not at all (using the temp-then-rename pattern).
- **gray-matter** remains the standard for YAML frontmatter, though it requires specific import handling in ESM environments.
- **UUID v4** should be used for internal IDs to decouple file names from record identity, allowing for future renames without breaking links.

**Primary recommendation:** Use `write-file-atomic` for all disk writes and `gray-matter` for all frontmatter operations to ensure data integrity and standard-compliant Markdown.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library             | Version | Purpose                          | Why Standard                                                                  |
| ------------------- | ------- | -------------------------------- | ----------------------------------------------------------------------------- |
| `write-file-atomic` | ^6.0.0  | Atomic filesystem writes         | Handles cross-platform rename quirks and ownership preservation.              |
| `gray-matter`       | ^4.0.0  | Frontmatter parsing/stringifying | High performance, widely used in static site generators (Jekyll, Hugo, etc.). |
| `uuid`              | ^11.0.0 | Unique identifier generation     | Industry standard for UUIDs; used for `id` field in frontmatter.              |

### Supporting

| Library    | Version | Purpose           | When to Use                                                  |
| ---------- | ------- | ----------------- | ------------------------------------------------------------ |
| `date-fns` | ^4.0.0  | Date formatting   | Generating `YYYYMMDD-HHMMSS` filenames and timestamp fields. |
| `zod`      | ^3.24.0 | Schema validation | Validating frontmatter structure (already in monorepo).      |

### Alternatives Considered

| Instead of          | Could Use            | Tradeoff                                                                                        |
| ------------------- | -------------------- | ----------------------------------------------------------------------------------------------- |
| `write-file-atomic` | `fs.promises.rename` | Manual implementation is prone to errors on Windows and doesn't handle permission preservation. |
| `gray-matter`       | `front-matter`       | `gray-matter` is better maintained and supports more engines (YAML, JSON, TOML).                |

**Installation:**

```bash
pnpm add write-file-atomic gray-matter uuid date-fns
pnpm add -D @types/write-file-atomic @types/gray-matter @types/uuid
```

## Architecture Patterns

### Recommended Project Structure

```
apps/api/src/
├── services/
│   └── storage.service.ts   # Core logic for file IO
├── lib/
│   └── markdown.ts          # Helpers for gray-matter & Zod
└── routes/
    └── notes.ts             # Hono handlers calling storage service
```

### Pattern 1: Storage Service

**What:** A singleton or class-based service that abstracts the filesystem. It should not expose raw `fs` calls to the rest of the application.
**When to use:** Always. Decouples the API logic from the storage implementation (Markdown files).

### Anti-Patterns to Avoid

- **Direct `fs.writeFile`:** Risk of corrupted files if the process crashes mid-write.
- **Parsing frontmatter with Regex:** Error-prone and fails on complex nested YAML.
- **Using filenames as primary keys:** Makes renaming files difficult and breaks references if the user or system changes the filename.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem       | Don't Build        | Use Instead         | Why                                                                |
| ------------- | ------------------ | ------------------- | ------------------------------------------------------------------ |
| Atomic Writes | Temp file + Rename | `write-file-atomic` | Handles `EPERM` on Windows and keeps file modes/ownership.         |
| Frontmatter   | Regex-based split  | `gray-matter`       | Handles delimiters (---, +++), multi-line content, and edge cases. |
| Unique IDs    | `Math.random()`    | `uuid` (v4)         | Avoids collisions and provides standard GUID format.               |

**Key insight:** Data integrity is paramount. In a "local-first" app, losing or corrupting a user's text file is a fatal error. Atomic writes are non-negotiable.

## Common Pitfalls

### Pitfall 1: ESM/CJS Compatibility

**What goes wrong:** `gray-matter` is a CommonJS library. In a Node.js ESM project (`"type": "module"`), a standard named import may fail.
**How to avoid:** Use a default import or a namespace import.
**Example:** `import matter from 'gray-matter';`

### Pitfall 2: Filename Collisions

**What goes wrong:** Two notes created in the same second will have the same `YYYYMMDD-HHMMSS.md` name.
**How to avoid:** Implement a "slugifier" or "collision resolver" that appends `_1`, `_2` etc. if `fs.existsSync(path)` is true.

## Code Examples

### Atomic Write with Frontmatter

```typescript
import matter from "gray-matter";
import writeFileAtomic from "write-file-atomic";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

async function saveNote(content: string, metadata: any) {
  const id = uuidv4();
  const now = new Date();
  const filename = `${format(now, "yyyyMMdd-HHmmss")}.md`;
  const filePath = `./notes/${filename}`;

  const fileContent = matter.stringify(content, {
    id,
    created: now.toISOString(),
    updated: now.toISOString(),
    ...metadata,
  });

  await writeFileAtomic(filePath, fileContent);
  return { id, filename };
}
```

## State of the Art

| Old Approach   | Current Approach    | When Changed | Impact                            |
| -------------- | ------------------- | ------------ | --------------------------------- |
| `fs.writeFile` | `write-file-atomic` | ~2015        | Prevented 0-byte files on crash   |
| `front-matter` | `gray-matter`       | ~2017        | Better YAML support & performance |
| Filename IDs   | UUID in Frontmatter | -            | Decouples storage from identity   |

## Open Questions

1. **Storage Path Configuration**
   - What we know: It should be a configurable directory.
   - What's unclear: Should we default to a hidden `.notetaiker` folder or a user-specified `~/Documents/Notes`?
   - Recommendation: Use an environment variable with a sane default (e.g. `./data/notes`).

2. **File Watching**
   - What we know: We might need to detect external changes to notes.
   - What's unclear: Is this part of Phase 2 or a later "Sync" phase?
   - Recommendation: Keep Phase 2 focused on API-driven IO; add watching in a later phase if needed for UI reactivity.

## Sources

### Primary (HIGH confidence)

- [write-file-atomic NPM](https://www.npmjs.com/package/write-file-atomic) - Usage and atomic guarantees.
- [gray-matter GitHub](https://github.com/jonschlinkert/gray-matter) - API and features.
- [Node.js fs.rename documentation](https://nodejs.org/api/fs.html#fspromisesrenameoldpath-newpath) - Limitations of raw rename.

### Secondary (MEDIUM confidence)

- [Obsidian/Zettelkasten patterns](https://zettelkasten.de/) - Standard for timestamped filenames.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Libraries are mature and ubiquitous.
- Architecture: HIGH - Service pattern is standard for Hono/Node.js.
- Pitfalls: MEDIUM - ESM quirks vary by Node.js version but are well-documented.

**Research date:** 2026-01-27
**Valid until:** 2026-02-26
