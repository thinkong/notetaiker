# Features Research: Semantic Intelligence

**Domain:** Semantic Intelligence Layer for Note-Taking Apps
**Researched:** 2026-02-06
**Confidence:** MEDIUM-HIGH (based on ecosystem patterns, specific implementation details vary by approach)

## Executive Summary

Semantic intelligence in note-taking apps centers on understanding **meaning** rather than just **keywords**. The four core features (related notes, semantic search, graph clustering, link suggestions) work together to create a "second brain" experience where connections emerge automatically.

**Key insight:** Users expect **passive discovery** (system shows connections) over **active searching** (user must query). The best implementations are invisible until needed—no configuration screens, no threshold sliders, just smart defaults.

---

## Related Notes Discovery

### Table Stakes

Users expect these features or the product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Sidebar/Panel Display** | Standard pattern from Obsidian, Notion, Roam | Low | Right sidebar is conventional; avoid modal overlays |
| **Top 5-10 Results** | Users scan, don't paginate | Low | More than 10 creates decision paralysis |
| **Real-time Updates** | Context changes as user types/edits | Medium | Debounce to avoid constant recalculation (500ms-1s typical) |
| **Similarity Score Visualization** | Users want to know "how related" | Low | Simple bar, percentage, or dot density—not raw cosine values |
| **Click-to-Open** | One-click navigation to related note | Low | Should work like clicking a link (same navigation pattern) |
| **Exclude Current Note** | Don't show the note being edited | Low | Obvious but easy to forget in implementation |

### Differentiators

Features that set products apart—not expected but highly valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Context-Aware Ranking** | Shows notes related to *current paragraph*, not whole note | High | Requires paragraph-level embeddings or sliding window |
| **Explanation Snippets** | "Related because both mention X" | Medium | Extract common keywords/phrases between notes |
| **Temporal Weighting** | Recent notes score slightly higher | Low | Boosts serendipitous rediscovery of recent work |
| **Bi-directional Preview** | Hover to see snippet of related note | Medium | Tooltip with first 100 chars or extracted sentence |
| **Manual Pin/Dismiss** | User can pin important connections or hide irrelevant ones | Medium | Requires persistence layer for user overrides |

### Anti-Features

Features to explicitly NOT build—common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Similarity Threshold Slider** | Users don't understand cosine similarity (0.7? 0.85?) | Use smart defaults (0.75-0.8 for most embeddings); hide tuning |
| **"Refresh" Button** | Implies system isn't automatic | Always recompute on note change; make it seamless |
| **Infinite Scroll** | Related notes should be curated, not exhaustive | Hard limit at 10-15 results; user can search if needed |
| **Separate "Related Tags" Section** | Confusing separation of tag-based vs semantic similarity | Merge: tags are already semantic metadata |
| **Algorithm Selection Dropdown** | "Use cosine vs Euclidean distance" | Pick one (cosine) and optimize it; don't expose internals |

---

## Semantic Search

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Natural Language Queries** | "Notes about machine learning" not just "machine learning" | Low | LLM can rephrase, but even basic embeddings handle this |
| **Fallback to Keyword** | When semantic fails (e.g., searching for a proper name) | Medium | Hybrid search: semantic + BM25/full-text, merge results |
| **Instant Results** | Search as you type (no "Search" button) | Medium | Debounce input; pre-compute embeddings |
| **Snippet Highlighting** | Show *why* this note matched | High | Extract relevant sentence/paragraph; harder than keyword highlighting |
| **Chronological Sorting Option** | Sometimes users want "recent notes about X" | Low | Add sort toggle: relevance vs recency |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Conceptual Expansion** | "Python" also finds "programming" and "coding" notes | Low | Inherent to embeddings; just surface it visually |
| **Question Answering** | "What did I learn about React hooks?" returns answer, not list | High | Requires RAG (retrieval + generation); defer to later phase |
| **Multi-Note Synthesis** | "Summarize all notes tagged #research" | High | Defer; needs LLM generation over search results |
| **Search History** | Recent searches in dropdown | Low | Local storage; useful for repeated workflows |
| **Saved Searches / Smart Folders** | "All notes similar to 'project ideas' query" | Medium | Defer; requires persistence and UI for management |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Boolean Operators in Semantic Search** | "Machine learning AND Python NOT JavaScript" breaks semantic model | Offer two modes: semantic (natural) and advanced (boolean keyword) |
| **Exact Match Emphasis** | Highlighting exact keyword matches in semantic results | Show conceptual matches; exact match is keyword search's job |
| **Result Count in Hundreds** | Overwhelming; user can't process 500 "similar" notes | Cap at 50 results; quality over quantity |
| **Separate Search Bar for Semantic vs Keyword** | Decision fatigue—which one to use? | One search bar; auto-detect or use hybrid approach |

---

## Graph Clustering

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Visual Grouping** | Related notes visibly cluster together | Medium | Force-directed layout with community detection (Louvain, etc.) |
| **Color Coding** | Each cluster has distinct color | Low | Standard graph visualization pattern |
| **Zoom to Cluster** | Click cluster to focus on that subgraph | Medium | Requires camera controls in graph library |
| **Cluster Labels** | Show dominant topic/tag for each cluster | Medium | Extract most common tag or use LLM to name cluster |
| **Smooth Transitions** | Adding/removing notes doesn't cause jarring relayout | High | Incremental force simulation; avoid full recalculation |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Hierarchical Clustering** | Clusters within clusters (topics → subtopics) | High | Requires multi-level community detection; visually complex |
| **Temporal Clusters** | "Notes from last week" vs "notes from last year" | Medium | Color/position nodes by time; useful for journal-style notes |
| **Cluster Statistics** | "This cluster has 12 notes, created over 3 months" | Low | Tooltip on cluster label |
| **Outlier Highlighting** | Notes that don't fit any cluster | Low | Useful for finding orphaned/miscategorized notes |
| **Cluster Merging Suggestions** | "These two clusters seem similar—merge?" | High | Requires inter-cluster similarity; advanced UX |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Manual Cluster Assignment** | "Drag this note to the 'Work' cluster" | Let algorithm handle it; user can tag if they want manual control |
| **Too Many Clusters** | 50 clusters = useless; user can't comprehend | Limit to 5-10 major clusters; tune resolution parameter |
| **Static Layouts** | User moves nodes, layout "locks" | Allow temporary pinning for screenshots, but auto-layout is primary |
| **Cluster Deletion** | "Delete this cluster" → deletes notes? | Don't conflate visualization with data mutation |
| **3D Graphs** | Cool demo, unusable in practice | Stick to 2D; 3D obscures connections and is hard to navigate |

---

## Link Suggestions

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Post-Save Suggestions** | After saving, show "You might want to link to..." | Low | Non-blocking; don't interrupt typing flow |
| **Top 3-5 Candidates** | Short list of high-confidence suggestions | Low | More = noise; user ignores if too many |
| **One-Click Insert** | Click suggestion → inserts `[[wikilink]]` at cursor | Medium | Requires editor integration and cursor position tracking |
| **Bidirectional Awareness** | Suggests links from A→B and B→A | Low | Backlinks are foundational in modern note apps |
| **Dismiss Suggestion** | "Not relevant" → don't suggest again for this note | Low | Requires negative signal storage |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Inline Suggestions** | As user types "machine learning", suggest linking to ML notes | High | Real-time parsing + debouncing; can be distracting if poorly tuned |
| **Contextual Placement** | Suggests where in note to add link, not just what to link | High | Requires paragraph-level understanding and editor API |
| **Explanation of Suggestion** | "Link to 'Python Basics' because both discuss list comprehensions" | Medium | Extract overlapping concepts; builds trust |
| **Batch Linking** | "Add all 5 suggested links at once" | Low | Useful for highly connected notes |
| **Suggest External Links** | "This mentions React—link to official docs?" | Medium | Requires entity extraction + external knowledge base |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Auto-Linking Without Confirmation** | Inserting links user didn't approve | Always require user action; suggestions, not mandates |
| **Suggesting Links to Every Mention** | "Python" appears 10 times → suggest 10 links | One link per unique target; avoid spam |
| **Modal Dialogs for Suggestions** | Blocks workflow; forces decision | Sidebar or inline, dismissible notifications |
| **Suggestions for Common Words** | "Link to note titled 'The'" | Ignore stopwords and very frequent terms |
| **No Explanation** | "Link to Note XYZ" with no context | Show snippet or reason; helps user decide |

---

## Feature Dependencies

Dependencies between features and existing NoteTaiker capabilities.

```
Existing Features (v1.5)
├── AI Tags (in frontmatter)
├── Force-Directed Graph (tag hubs)
├── Local Ollama Integration
└── Title Auto-Generation

New Dependencies for v1.6
├── Embeddings Infrastructure (foundational)
│   ├── → Related Notes Panel (requires embeddings for similarity)
│   ├── → Semantic Search (requires embeddings for query matching)
│   ├── → Graph Clustering (uses embeddings for community detection)
│   └── → Link Suggestions (uses embeddings to find candidates)
│
├── Related Notes Panel
│   └── → Link Suggestions (panel shows targets; suggestions use same ranking)
│
├── Semantic Search
│   └── → Graph Clustering (search results can highlight cluster membership)
│
└── Graph Clustering
    └── → Related Notes Panel (clicking cluster can filter sidebar)
```

**Critical path:** Embeddings Infrastructure must ship first. Other features can ship incrementally.

---

## UX Patterns from Successful Apps

### Obsidian

**Strengths:**
- **Local-first embeddings** via Smart Connections plugin (respects privacy)
- **Context pane** (right sidebar) for backlinks/related notes
- **Graph view** with local/global modes (focus on one note vs see everything)

**Patterns to adopt:**
- Right sidebar for related notes (standard desktop layout)
- Related notes update when switching between notes (not just on edit)
- Graph clusters are color-coded but subtle (not garish)

**Patterns to avoid:**
- Smart Connections plugin requires manual "refresh embeddings" (should be automatic)
- Too many graph controls (filters, groupings) → decision paralysis

### Notion

**Strengths:**
- **Notion Q&A** (semantic search with LLM-generated answers)
- **Inline AI blocks** for summaries and expansions
- **Automatic backlinks** in every page

**Patterns to adopt:**
- Search bar accepts natural language ("what are my goals for Q1?")
- Results show snippet + relevance explanation
- Backlinks section shows context (surrounding paragraph, not just link)

**Patterns to avoid:**
- Cloud-only embeddings (privacy concern for NoteTaiker's local-first ethos)
- AI features require paid plan (NoteTaiker uses local Ollama by default)

### Roam Research

**Strengths:**
- **Bidirectional links** as first-class feature (not an add-on)
- **Daily notes** create temporal clusters automatically
- **Block-level references** (link to specific paragraph, not whole note)

**Patterns to adopt:**
- Unlinked references ("Notes that mention X but don't link to it")
- Graph focuses on immediate neighborhood, not global view (less overwhelming)
- Autocomplete for `[[wikilinks]]` based on existing notes

**Patterns to avoid:**
- Overly dense graph (every word becomes a link)
- Forced daily notes structure (NoteTaiker is atomic, not calendar-based)

---

## MVP Recommendation

For v1.6 Smart Connections, prioritize:

### Must Ship (Table Stakes)

1. **Embeddings Infrastructure**
   - Generate embeddings on note save (via Ollama)
   - Store in SQLite alongside existing index
   - Incremental updates (don't recompute all notes)

2. **Related Notes Panel**
   - Right sidebar (similar to existing note list)
   - Show top 5 similar notes with score visualization
   - Click to open note
   - Real-time updates with debouncing (500ms)

3. **Semantic Search**
   - Single search bar (natural language input)
   - Hybrid ranking: semantic + keyword fallback
   - Top 50 results, sorted by relevance
   - Show snippet highlighting

4. **Graph Clustering**
   - Extend existing force-directed graph
   - Add community detection (Louvain algorithm)
   - Color-code clusters
   - Show cluster labels (dominant tag or LLM-generated)

5. **Link Suggestions**
   - Post-save notification (top 3-5 suggestions)
   - One-click insert wikilink
   - Dismiss option
   - Show explanation snippet

### Defer to Post-MVP

- Context-aware ranking (paragraph-level embeddings)
- Question answering (RAG)
- Inline link suggestions (real-time as you type)
- Hierarchical clustering
- Saved searches
- External link suggestions

---

## Implementation Notes

### Embedding Model Selection

**Recommendation:** `nomic-embed-text` (Ollama)

**Why:**
- Optimized for semantic similarity tasks
- 137M parameters (fast on consumer hardware)
- 768-dimensional embeddings (good balance)
- Trained on diverse text (not domain-specific)

**Alternatives:**
- `all-MiniLM-L6-v2`: Smaller (23M), faster, slightly lower quality
- `mxbai-embed-large`: Larger (335M), slower, marginal quality gain

**Avoid:**
- Cloud APIs (OpenAI embeddings) as default (privacy concern)
- Very large models (>1B params) → too slow for real-time updates

### Similarity Thresholds

Based on community best practices:

| Use Case | Threshold | Rationale |
|----------|-----------|-----------|
| Related Notes | 0.75-0.8 | High precision; avoid false positives |
| Semantic Search | 0.65-0.7 | Higher recall; user can filter results |
| Link Suggestions | 0.8-0.85 | Very high confidence; avoid spam |
| Graph Clustering | N/A | Use community detection (modularity-based) |

**Do NOT expose these to users.** Tune based on user feedback, but keep interface simple.

### Performance Targets

| Operation | Target Latency | Notes |
|-----------|---------------|-------|
| Generate embedding (single note) | <500ms | Acceptable on save (background) |
| Find similar notes (query) | <100ms | Pre-computed; vector DB lookup |
| Update related panel | <200ms | Debounced; user won't notice delay |
| Graph clustering (100 notes) | <1s | One-time on load; cache results |
| Semantic search | <300ms | Comparable to keyword search |

---

## Complexity Assessment

| Feature | Backend Complexity | Frontend Complexity | Overall |
|---------|-------------------|---------------------|---------|
| Embeddings Infrastructure | High (Ollama integration, vector storage) | Low (no UI) | High |
| Related Notes Panel | Medium (similarity ranking) | Low (sidebar component) | Medium |
| Semantic Search | Medium (hybrid search ranking) | Medium (search UI, snippet extraction) | Medium |
| Graph Clustering | High (community detection algorithm) | Low (extend existing graph) | Medium-High |
| Link Suggestions | Medium (candidate extraction) | Medium (editor integration) | Medium |

**Hardest parts:**
1. Embeddings Infrastructure (new domain; vector storage design)
2. Graph Clustering (algorithm tuning for readable clusters)
3. Hybrid Search Ranking (balancing semantic vs keyword results)

**Easiest parts:**
1. Related Notes Panel (similar to existing note list UI)
2. Link Suggestions (post-save is simpler than inline)

---

## Open Questions

1. **Embedding Granularity:**
   - Embed entire note (simple) or split into chunks (better for long notes)?
   - Recommendation: Start with full-note embeddings; add chunking if notes exceed 1000 words.

2. **Vector Storage:**
   - Use SQLite with JSON columns or dedicated vector DB (e.g., LanceDB)?
   - Recommendation: SQLite for MVP (one less dependency); migrate if performance degrades.

3. **Cluster Naming:**
   - Use most common tag (simple) or LLM-generated labels (smarter)?
   - Recommendation: Most common tag for MVP; LLM labels in v1.7+.

4. **Link Format:**
   - Use `[[wikilinks]]` (Obsidian-style) or `[markdown links](path.md)`?
   - Recommendation: `[[wikilinks]]` are more concise; already familiar to target users.

---

## Sources

**Note:** Web searches returned limited actionable results. Confidence is based on:

1. **Domain knowledge** (established patterns in Obsidian, Notion, Roam ecosystems)
2. **Existing NoteTaiker research** (v1.2 Graph View research provides foundation)
3. **Embedding best practices** (nomic-embed-text via Ollama; similarity thresholds from ML literature)

**Key insight:** Semantic intelligence features are *emerging* in note apps (2023-2026 shift from manual to AI-assisted linking). Table stakes are being defined *now*; this is a competitive advantage window.

**Confidence Level:** MEDIUM-HIGH
- Table stakes: HIGH (well-established patterns)
- Differentiators: MEDIUM (emerging; less consensus)
- Implementation details: MEDIUM (model choice and thresholds are heuristic-driven)

---

**Research complete.** Ready for requirements definition and roadmap planning.
