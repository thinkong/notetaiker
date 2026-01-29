# Phase 08: V1 Polish - Research

**Researched:** 2026-01-29
**Domain:** Performance Optimization, UX Refinement, and Tag Filtering
**Confidence:** HIGH

## Summary

Phase 08 focuses on transitioning the app from "functional" to "polished." The primary technical challenge is maintaining the 100ms "typing readiness" target while adding features like tag filtering and keyboard-driven navigation. The current implementation of `StorageService.listNotes()` reads and parses every markdown file on the disk for every request, which is a major performance bottleneck that must be addressed via SQLite indexing.

**Primary recommendation:** Implement a "Metadata Indexer" that mirrors note metadata (including tags) into the existing SQLite database to allow sub-millisecond filtering and sorting, while keeping the filesystem as the source of truth for content.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-hotkeys-hook` | ^4.6.0 | Keyboard shortcuts | Mature, declarative API for React keyboard management. |
| `cmdk` | ^1.0.0 | Search/Command Palette | The industry standard for "Cmd+K" experiences (used by Linear, Vercel). |
| `better-sqlite3` | ^11.0.0 | Metadata Indexing | Already in use; provides the fastest local persistence for Node.js. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `framer-motion` | ^11.0.0 | Layout transitions | For smooth "Expanded" state transitions in NoteCards. |
| `clsx` / `tailwind-merge` | ^2.0.0 | Dynamic styling | Managing complex Tailwind classes for active/inactive filters. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `cmdk` | `downshift` | Downshift is lower-level; `cmdk` provides the "command palette" pattern out-of-the-box. |
| `react-hotkeys-hook` | Native `addEventListener` | Native is lighter but harder to manage with React component lifecycles and focus trapping. |

**Installation:**
```bash
npm install react-hotkeys-hook cmdk framer-motion tailwind-merge clsx
```

## Architecture Patterns

### Recommended Project Structure
```
apps/api/src/
├── services/
│   ├── storage.service.ts  # Updated: Triggers indexer on write
│   └── indexer.service.ts  # New: Syncs filesystem -> SQLite
apps/web/src/
├── components/
│   ├── search/
│   │   └── SearchPalette.tsx # Cmd+K interface
│   └── tags/
│       └── TagFilter.tsx     # Filter UI
```

### Pattern 1: Metadata Indexing (Mirroring)
**What:** Store note metadata (ID, tags, createdAt) in SQLite. Use the filesystem as the authoritative source for content.
**When to use:** When you need fast filtering/sorting over a large set of files.
**Example:**
```typescript
// apps/api/src/services/indexer.service.ts
export class IndexerService {
  async syncAll() {
    const files = await fs.readdir(this.notesDir);
    // 1. Identify files modified since last sync
    // 2. Parse YAML frontmatter
    // 3. Upsert into 'notes_index' table
  }

  async searchByTag(tag: string) {
    return this.db.prepare('SELECT id FROM notes_index WHERE tags LIKE ?').all(`%${tag}%`);
  }
}
```

### Pattern 2: Optimistic Tagging
**What:** Update the UI immediately when AI processing starts/ends using TanStack Query `onSuccess` and SSE.
**When to use:** To provide the "Seamless" workflow required by success criteria.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard Focus | Manual `ref.focus()` | `cmdk` / `focus-trap` | Handling focus cycles, escape keys, and accessibility is complex. |
| Search Ranking | Custom `indexOf` | `command-score` | `cmdk` includes built-in fuzzy sorting for better UX. |
| Pulse Animations | Custom CSS `@keyframes` | Tailwind `animate-pulse` | Consistency with the design system and zero configuration. |

## Common Pitfalls

### Pitfall 1: Bundle Bloat vs. 100ms Target
**What goes wrong:** CodeMirror 6 and other libraries increase the initial JS bundle size, causing First Input Delay (FID) to exceed 100ms.
**How to avoid:** Use `React.lazy()` for the Editor. Show a simple `<textarea>` placeholder for the first few hundred milliseconds or until the user interacts.

### Pitfall 2: Sync Lag
**What goes wrong:** User edits a file manually on disk, but the SQLite index doesn't reflect it.
**How to avoid:** Implement a "Scan on Startup" in the API and use `fs.watch` for real-time indexing if the API is running.

## Code Examples

### [Keyboard Shortcut Setup]
```typescript
// Source: https://react-hotkeys-hook.vercel.app/docs/intro
import { useHotkeys } from 'react-hotkeys-hook';

export function useAppShortcuts() {
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    toggleSearch();
  });

  useHotkeys('mod+enter', () => {
    saveNote();
  }, { enableOnFormTags: true });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full-text search on files | Metadata indexing + FTS5 | 2024+ | Instant search even with 10k+ notes. |
| Imperative Shortcuts | Declarative Hooks | 2023+ | Less buggy shortcut management in React. |

## Open Questions

1. **SQLite FTS5 vs Simple Index?**
   - What we know: `better-sqlite3` supports FTS5.
   - What's unclear: If full-text search is required for V1 beyond just tag filtering.
   - Recommendation: Start with a simple metadata table; upgrade to FTS5 if "content search" becomes a requirement.

## Sources

### Primary (HIGH confidence)
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) - Optimistic updates for seamless flow.
- [CodeMirror 6 Performance](https://codemirror.net/6/docs/guide/#performance) - Strategies for initialization.
- [React 19 Docs](https://react.dev/reference/react/useOptimistic) - New hook for optimistic UI.

### Secondary (MEDIUM confidence)
- [cmdk Documentation](https://cmdk.paco.me/) - Verified command palette patterns.
- [SQLite Performance with Node](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md) - Benchmarks for indexing.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries are industry standards.
- Architecture: HIGH - File+DB hybrid is a proven pattern for local-first apps.
- Pitfalls: MEDIUM - Specific performance bottlenecks (100ms) are environmental.

**Research date:** 2026-01-29
**Valid until:** 2026-02-28
