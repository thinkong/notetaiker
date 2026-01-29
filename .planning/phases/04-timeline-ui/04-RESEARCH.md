# Phase 04: Timeline UI - Research

**Researched:** 2026-01-27
**Domain:** Frontend UI / Infinite Scroll / Data Fetching
**Confidence:** HIGH

## Summary

The Timeline UI phase focuses on displaying a reverse-chronological stream of notes. Based on the "local-first" philosophy and the existing filesystem-based storage, the primary challenge is implementing efficient pagination and smooth infinite scrolling without a traditional database.

Key findings:
- **Pagination**: The current `StorageService` reads all files to sort them. For infinite scroll, we need to introduce `limit` and `offset` parameters to the API, while acknowledging that the server still needs to read file metadata to sort correctly for now.
- **Data Fetching**: **TanStack Query (v5)** is the industry standard for managing infinite scroll state, handling caching, and deduplicating requests.
- **UI Interaction**: "Expand in place" can be handled using React state per card. CSS `line-clamp` is the preferred method for adaptive content truncation.
- **Time Formatting**: `date-fns` is already in the project and provides `formatDistanceToNow` for the required relative timestamps.

**Primary recommendation:** Use **TanStack Query** for infinite scroll management and implement **Offset-based pagination** in the Hono API to support the timeline stream.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TanStack Query | v5 | Data fetching & Infinite Scroll | Handles complex loading states, caching, and "load more" logic out-of-the-box. |
| date-fns | ^4.0.0 | Time formatting | Already a project dependency; provides robust relative time helpers. |
| Tailwind CSS | v4 | Styling | Project standard; handles layout and responsive truncation easily. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Intersection Observer | v9 | Scroll detection | To trigger the "load more" fetch when the user nears the bottom of the list. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom `useEffect` | - | High risk of race conditions, hard to manage cache and "expand" state. |
| Virtualization | native scroll | `react-window` is better for 1000s of items, but adds complexity for variable-height "expandable" cards. |

**Installation:**
```bash
pnpm add @tanstack/react-query react-intersection-observer
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── components/
│   ├── timeline/
│   │   ├── Timeline.tsx       # Orchestrator for infinite scroll
│   │   ├── NoteCard.tsx       # Individual note display with expand/collapse
│   │   └── SkeletonCard.tsx   # Loading state
├── hooks/
│   └── useTimeline.ts         # Wrapper for useInfiniteQuery
```

### Pattern 1: Infinite Query with Intersection Observer
**What:** Use `@tanstack/react-query`'s `useInfiniteQuery` hook combined with a sentinel element at the bottom of the list.
**When to use:** For reverse-chronological feeds where users expect "endless" scrolling.
**Example:**
```typescript
// Source: https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['notes'],
  queryFn: async ({ pageParam = 0 }) => {
    const res = await api.notes.$get({ query: { offset: String(pageParam), limit: '50' } });
    return res.json();
  },
  initialPageParam: 0,
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length === 50 ? allPages.length * 50 : undefined;
  },
})
```

### Anti-Patterns to Avoid
- **Client-side sorting only:** Do not fetch all notes and sort them in the browser. The API must handle sorting and pagination.
- **Prop drilling for Expand state:** Don't manage every card's expanded state in the parent `Timeline`. Let each `NoteCard` manage its own `isExpanded` state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Infinite Scroll Logic | Custom `onScroll` | TanStack Query | Handles edge cases like "loading more" while already loading. |
| Relative Time | Custom `ms` math | `date-fns/formatDistanceToNow` | Handles leap years and different month lengths. |
| Truncation | JS `substring` | CSS `line-clamp` | More performant; handles "..." automatically and responsively. |

## Common Pitfalls

### Pitfall 1: Filesystem Performance
**What goes wrong:** Reading every file in `notesDir` to sort by `createdAt` becomes slow as the number of notes grows.
**Why it happens:** Local-first storage (Markdown files) lacks an index.
**How to avoid:** For this phase, accept the O(n) read on the server but limit the payload sent to the client. In future phases, consider a metadata cache.
**Warning signs:** API response time for `/api/notes` exceeds 200ms with >100 notes.

### Pitfall 2: Layout Shift on Load
**What goes wrong:** Notes pop in and push the "New Note" input around.
**Why it happens:** Dynamic content loading without reserved space.
**How to avoid:** Use **Skeleton Screens** (placeholders) with fixed heights to match the expected "compact" density.

## Code Examples

### Relative Time with Date-fns
```typescript
import { formatDistanceToNow } from 'date-fns';

const RelativeTime = ({ date }: { date: string }) => {
  return (
    <span title={new Date(date).toLocaleString()}>
      {formatDistanceToNow(new Date(date), { addSuffix: true })}
    </span>
  );
};
```

### CSS Truncation (Tailwind v4)
```html
<div class="line-clamp-3 text-nord-polar3 dark:text-nord-snow1 font-mono">
  {content}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `scroll` events | `IntersectionObserver` | ~2019 | Performance boost (off-main-thread). |
| Redux for data | TanStack Query | ~2022 | Drastic reduction in async boilerplate. |

## Open Questions

1. **Search Integration**: Should the timeline support filtering/searching in this phase?
   - Recommendation: Keep it out of scope for Phase 4 to focus on the scrolling mechanics.
2. **File Deletions**: How does the timeline react if a file is deleted from the disk?
   - Recommendation: Let the UI naturally reconcile on the next fetch or manual refresh.

## Sources

### Primary (HIGH confidence)
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries) - Infinite Scroll patterns.
- [date-fns Docs](https://date-fns.org/docs/formatDistanceToNow) - Relative time implementation.
- [Tailwind CSS line-clamp](https://tailwindcss.com/docs/line-clamp) - Multi-line truncation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Industry standards (Query, date-fns).
- Architecture: HIGH - Proven infinite scroll patterns.
- Pitfalls: MEDIUM - Filesystem performance is a known trade-off for "local-first".

**Research date:** 2026-01-27
**Valid until:** 2026-02-26
