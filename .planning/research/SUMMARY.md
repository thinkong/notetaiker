# Project Research Summary

**Project:** NoteTaiker v1.6 Smart Connections
**Domain:** Semantic Intelligence for Local-First Note-Taking
**Researched:** 2026-02-06
**Confidence:** HIGH

## Executive Summary

Semantic intelligence in note-taking apps centers on understanding meaning rather than keywords. NoteTaiker can add embeddings-based features (related notes, semantic search, graph clustering, link suggestions) by extending existing infrastructure without new cloud dependencies or heavyweight vector databases. The recommended approach leverages Ollama (already integrated) for local embeddings generation via `nomic-embed-text` model, sqlite-vec extension for vector storage within the existing SQLite database, and graphology with Louvain algorithm for community detection.

The critical architectural principle is **never block the note save path**. Embedding generation must happen asynchronously via the existing p-queue background worker pattern. Notes save to filesystem immediately (\u003c50ms), then embedding jobs are queued for background processing. This maintains NoteTaiker's core UX promise of instant, non-blocking note capture while building semantic intelligence gradually in the background.

Key risks center on performance (cold start model loading, stale embedding detection, incremental updates) and user experience (eventual consistency, threshold tuning, monitoring). These are addressed through: pre-warming the Ollama model on startup, content-hash based staleness detection, debounced queue jobs, and clear UI feedback during embedding generation. The biggest danger is compromising note-taking speed for AI features—prevention requires disciplined async architecture and graceful degradation when embeddings unavailable.

## Key Findings

### Recommended Stack

The stack leverages existing NoteTaiker infrastructure (Ollama, SQLite, React Force Graph) with three targeted additions: sqlite-vec for vector storage, graphology for graph data structures, and graphology-communities-louvain for clustering. This minimalist approach avoids introducing cloud services, separate vector databases, or heavyweight dependencies.

**Core technologies:**
- **sqlite-vec (^0.1.7-alpha.2)**: Vector search extension for SQLite — integrates with existing better-sqlite3, stores embeddings alongside metadata, fast sub-millisecond search for thousands of notes, successor to deprecated sqlite-vss
- **Ollama nomic-embed-text model**: Local embedding generation — 274MB model size, 768 dimensions, 8K context window, supports Matryoshka (flexible 64-768 dimensions), generates embeddings in 50-200ms per note
- **graphology (^0.25.4) + communities-louvain (^2.0.1)**: Graph clustering — industry-standard graph library, Louvain algorithm discovers optimal cluster count automatically (vs k-means requiring k upfront), O(n log n) complexity, integrates with existing react-force-graph-2d

**Already have (no changes needed):**
- ollama-ai-provider-v2: ^1.2.0 (supports embeddings via `.embeddingModel()` API)
- better-sqlite3: ^12.6.2 (compatible with sqlite-vec extension)
- ai: ^6.0.69 (Vercel AI SDK for `embed()` API)
- react-force-graph-2d: ^1.29.0 (visualization ready for cluster coloring)

**Total new packages:** 3 (sqlite-vec, graphology, graphology-communities-louvain)

### Expected Features

Semantic intelligence features follow established patterns from Obsidian, Notion, and Roam. Users expect passive discovery (system shows connections) over active searching. The best implementations are invisible until needed—no configuration screens, no threshold sliders, just smart defaults.

**Must have (table stakes):**
- **Related Notes Panel**: Right sidebar showing top 5-10 similar notes with similarity scores, click-to-open, real-time updates on note changes (debounced 500ms-1s)
- **Semantic Search**: Natural language queries in search palette, hybrid ranking (semantic + keyword fallback), instant results with snippet highlighting
- **Graph Clustering**: Visual grouping with color coding, cluster labels showing dominant topics, zoom to cluster functionality
- **Post-Save Link Suggestions**: Top 3-5 suggested wikilinks after saving, one-click insert, dismiss option, explanation snippets

**Should have (competitive differentiators):**
- Context-aware ranking (related to current paragraph, not whole note)
- Temporal weighting (recent notes scored slightly higher)
- Bi-directional preview (hover to see snippet)
- Search history in dropdown
- Outlier highlighting (notes that don't fit any cluster)

**Defer (v2+):**
- Context-aware ranking with paragraph-level embeddings (requires sliding window approach)
- Question answering with RAG (retrieval + generation)
- Inline link suggestions (real-time as you type)
- Hierarchical clustering (clusters within clusters)
- Saved searches / smart folders

**Anti-features (explicitly avoid):**
- Similarity threshold sliders (users don't understand cosine similarity—use smart defaults 0.75-0.8)
- Refresh buttons (implies system isn't automatic)
- Algorithm selection dropdowns (don't expose cosine vs Euclidean internals)
- Auto-linking without confirmation (requires user action)

### Architecture Approach

Semantic intelligence integrates by extending three core components: the background worker pipeline (QueueService/WorkerService), the SQLite indexer (IndexerService), and Hono API routes. New components (EmbeddingsService, ClusteringService) plug into existing patterns without architectural changes.

**Major components:**

1. **EmbeddingsService** — Generates embeddings via Ollama, stores in sqlite-vec virtual table, performs similarity search using cosine distance, tracks content hash for staleness detection, handles incremental updates
2. **ClusteringService** — Builds graphology graph from tag relationships and semantic similarity edges, runs Louvain community detection, returns node-to-cluster mappings for visualization, enriches clusters with dominant tags
3. **Related Notes API (GET /notes/:id/related)** — Queries EmbeddingsService for top-k similar notes, fetches full note metadata from StorageService, returns ranked results with similarity scores
4. **Semantic Search API (GET /search/semantic)** — Generates query embedding, searches vector index, merges with keyword search for hybrid ranking, returns top 20-50 results with snippets
5. **Graph Clustering API (GET /graph/clusters)** — Computes clusters on-demand (or from cache), returns node-to-cluster mapping plus cluster summaries with top tags

**Integration pattern:**
```
Note Save → Filesystem Write (immediate) → Return Success
         ↓
         Queue Embedding Job (async)
         ↓
         Worker Processes → Ollama Embeddings → sqlite-vec Storage
         ↓
         EventsService Broadcast → Frontend Updates Related Panel
```

**Data flow maintains existing patterns:** Background processing via p-queue, SQLite for all persistence, SSE for real-time UI updates, TanStack Query for data fetching.

### Critical Pitfalls

Research identified 8 pitfalls; these are the top 5 that must be addressed in Phase 1:

1. **Blocking Note Save on Embedding Generation** — Adding synchronous embedding in save path causes UI freezes (100-500ms). Prevention: Decouple completely—save to filesystem first, enqueue embedding job after, return success immediately, design for eventual consistency
2. **Stale Embeddings After Content Changes** — Embeddings become stale when note content changes without detection mechanism. Prevention: Store content hash with each embedding, compare on save, mark stale if different, exclude stale embeddings from queries until regenerated
3. **Cold Start Performance Hell** — First embedding takes 5-10 seconds while Ollama loads model into memory. Prevention: Pre-warm model on app startup with dummy embedding, configure keepalive (30min), show loading states in UI, optimize for smaller model (nomic-embed-text vs mxbai-embed-large)
4. **SQLite Vector Extension Choice Lock-In** — Choosing wrong extension causes performance problems or missing features. Prevention: Choose sqlite-vec (actively maintained, better performance than sqlite-vss), design abstraction layer for easier switching, test with realistic corpus (1000+ notes)
5. **Incremental Update Performance** — Cascading updates slow down system when link suggestions trigger re-embeddings. Prevention: Differentiate content vs metadata changes, debounce embedding jobs (5s delay), prevent modification loops with skipHooks flag, implement change detection at hash level

**Additional pitfalls for later phases:**
- Full-note embedding loses granularity (Phase 2: add chunking for notes \u003e500 words)
- Similarity threshold tuning is fragile (Phase 3: make user-configurable with presets)
- No monitoring or observability (Phase 2: add health metrics, surface in UI)

## Implications for Roadmap

Based on research, recommended phase structure prioritizes foundation before features. The critical dependency is embeddings infrastructure—all other features require it. Order optimizes for validation (prove value early) and risk mitigation (address critical pitfalls upfront).

### Phase 1: Embeddings Foundation

**Rationale:** Must establish async embedding pipeline before any features. Architecture decisions here (sqlite-vec choice, content hash tracking, debouncing) are hard to change later. Addressing critical pitfalls (1, 2, 4, 5) upfront prevents rework.

**Delivers:** Background embedding generation for all notes, sqlite-vec storage, staleness detection, health monitoring

**Implements:**
- EmbeddingsService core methods (generate, store, get, findSimilar)
- Modify IndexerService to add embeddings_vec virtual table
- Modify AIService to add generateEmbeddings method via Ollama
- Extend QueueService with 'embeddings' job type
- Extend WorkerService to handle embedding jobs
- Hook into StorageService to enqueue jobs on note save
- Pre-warm Ollama model on worker startup

**Addresses:** Embeddings Infrastructure from FEATURES.md (foundational requirement)

**Avoids:** Pitfalls 1 (blocking save), 2 (stale embeddings), 4 (extension choice), 5 (incremental updates), 7 (cold start)

**Stack elements:** sqlite-vec, Ollama nomic-embed-text, existing p-queue pattern

**Success criteria:**
- All existing notes embedded in background (show progress)
- New notes automatically get embeddings without blocking save
- Content hash detects changes and triggers re-embedding
- Model pre-warmed on startup (\u003c1s first embedding)

### Phase 2: Related Notes Panel

**Rationale:** Smallest, highest-value feature to validate semantic intelligence. Proves embeddings work before investing in search or clustering. Low UI complexity (sidebar component similar to existing note list).

**Delivers:** Right sidebar showing top 5 semantically similar notes, click to navigate, real-time updates via SSE

**Implements:**
- GET /notes/:id/related API endpoint
- RelatedNotesPanel React component
- useRelatedNotes TanStack Query hook
- Similarity score visualization (0.0-1.0 bar or percentage)

**Addresses:** Related Notes Discovery from FEATURES.md (table stakes)

**Uses:** EmbeddingsService.findSimilar, existing EventsService for real-time updates

**Success criteria:**
- Opening note shows 5 related notes within 200ms
- Similarity scores visible and accurate
- Panel updates when embeddings regenerate
- Clicking related note navigates correctly

### Phase 3: Semantic Search

**Rationale:** Builds on proven embedding infrastructure. Adds query embedding (same as note embedding). Hybrid search (semantic + keyword) provides fallback for edge cases.

**Delivers:** Search palette with semantic mode, natural language queries, ranked results with snippets

**Implements:**
- GET /search/semantic API endpoint
- Modify SearchPalette with semantic toggle
- useSemanticSearch TanStack Query hook
- Hybrid ranking (merge semantic + keyword results)

**Addresses:** Semantic Search from FEATURES.md (table stakes)

**Uses:** EmbeddingsService.search, existing SearchPalette component

**Success criteria:**
- Natural language queries return relevant notes
- Performance \u003c300ms for searches
- Hybrid search handles exact match queries
- Snippet highlighting shows relevance

### Phase 4: Graph Clustering

**Rationale:** Extends existing force-directed graph with semantic edges. Louvain algorithm already proven in graphology library. Complexity is medium (clustering computation) but integrates easily with react-force-graph-2d.

**Delivers:** Color-coded graph clusters, cluster labels, legend

**Implements:**
- ClusteringService (build graph, run Louvain, enrich with tags)
- GET /graph/clusters API endpoint
- Modify ForceGraph component for cluster coloring
- useGraphClusters TanStack Query hook

**Addresses:** Graph Clustering from FEATURES.md (table stakes)

**Uses:** graphology, graphology-communities-louvain, existing react-force-graph-2d

**Success criteria:**
- Graph shows 5-10 visually distinct clusters
- Cluster labels show dominant tags or topics
- Clicking cluster filters or zooms to subgraph
- Performance \u003c2s for 1000 notes

### Phase 5: Link Suggestions

**Rationale:** Most complex UX (editor integration, post-save notifications). Builds on proven similarity ranking from Phase 2. Requires careful design to avoid loops (Pitfall 7).

**Delivers:** Post-save notification with top 3-5 link suggestions, one-click insert, explanation snippets

**Implements:**
- EmbeddingsService.suggestLinks with high threshold (0.8-0.85)
- LinkSuggestionsPanel component (post-save, dismissible)
- EventsService broadcast 'link_suggestions_ready'
- Editor integration for wikilink insertion

**Addresses:** Link Suggestions from FEATURES.md (table stakes)

**Uses:** EmbeddingsService.findSimilar, existing Editor component

**Success criteria:**
- Suggestions appear after save (non-blocking)
- High precision (users accept \u003e50% of suggestions)
- No modification loops (suggestions don't trigger re-embeddings)
- Explanation snippets build trust

### Phase Ordering Rationale

- **Foundation first (Phase 1):** Embedding infrastructure is hard dependency for all features. Getting async architecture right upfront prevents rework. Addressing critical pitfalls (blocking saves, stale embeddings, cold start) at foundation level protects all subsequent phases.

- **Validate early (Phase 2):** Related Notes is smallest feature with highest user visibility. Proves embeddings work before investing in search or clustering. Low implementation risk, high validation value.

- **Build incrementally (Phases 3-4):** Search and clustering build on proven embedding infrastructure. Both are medium complexity, can ship independently. Clustering extends existing graph view with minimal changes.

- **Advanced features last (Phase 5):** Link suggestions require editor integration and careful UX (avoid loops). Most likely to need iteration based on user feedback. Builds on proven similarity ranking from Phase 2.

- **Dependency chain:** Phase 1 → (Phase 2, 3, 4 can run in parallel) → Phase 5 depends on Phase 2 for similarity ranking patterns

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 1:** Optimal batch size for Ollama embeddings API (test 1 vs 10 vs 100 notes/request), sqlite-vec performance benchmarking with 1000+ notes, content hash strategy (MD5 vs SHA256 vs custom)
- **Phase 3:** Hybrid search ranking algorithm (how to weight semantic vs keyword results), snippet extraction for semantic matches (harder than keyword highlighting)
- **Phase 4:** Cluster naming strategy (use top tags vs LLM-generated labels), optimal similarity threshold for graph edges (0.6? 0.7? 0.8?)
- **Phase 5:** Editor integration for wikilink insertion (CodeMirror 6 API research), loop prevention strategy (skipHooks flag vs separate suggestions field)

**Phases with standard patterns (minimal research needed):**
- **Phase 2:** Related notes UI pattern well-established in Obsidian/Roam, standard sidebar component, TanStack Query hook follows existing patterns
- **Phase 3:** Search palette modification straightforward, existing SearchPalette component provides foundation

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | sqlite-vec confirmed as sqlite-vss successor, Ollama embeddings API verified in official docs, graphology is industry-standard, all versions current as of 2026-02-06 |
| Features | MEDIUM-HIGH | Table stakes well-established from Obsidian/Notion/Roam patterns, differentiators are emerging (2023-2026 shift to AI-assisted linking), implementation details heuristic-driven |
| Architecture | HIGH | Analyzed existing codebase (QueueService, WorkerService, IndexerService), integration points verified, async pattern proven in ai_tags jobs, minimal new infrastructure |
| Pitfalls | HIGH | Critical pitfalls (blocking saves, stale embeddings, cold start) are universal in vector DB systems, preventions tested in domain, codebase analysis confirms async pattern feasibility |

**Overall confidence:** HIGH

Research is grounded in official documentation (Ollama, sqlite-vec, graphology), existing codebase analysis, and established patterns from similar products. The main uncertainty is performance at scale (1000+ notes) which requires testing during Phase 1.

### Gaps to Address

- **Optimal similarity thresholds:** Research suggests 0.75-0.8 for related notes, 0.65-0.7 for search, 0.8-0.85 for link suggestions, but these are heuristics. Plan for user testing and configuration in Phase 3.

- **Chunking strategy:** Research recommends starting with full-note embeddings (simpler) and adding chunking in Phase 2 for notes \u003e500 words. Chunk boundaries (markdown headers? paragraphs? word count?) need validation with real NoteTaiker notes.

- **Cluster naming:** Most common tag is simplest approach, but LLM-generated cluster names may be better UX. Defer decision to Phase 4 implementation.

- **Link format:** Research recommends `[[wikilinks]]` over markdown links for conciseness, but NoteTaiker's current link handling needs verification during Phase 5.

- **Embedding model choice:** nomic-embed-text recommended (274MB, 768 dims, good quality/speed tradeoff), but user preference may vary. Consider making model configurable in settings.

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- [sqlite-vec GitHub](https://github.com/asg017/sqlite-vec) — Vector storage extension architecture, API reference, performance characteristics
- [Ollama Embedding Models Blog](https://ollama.com/blog/embedding-models) — Model recommendations, API usage, performance benchmarks
- [Vercel AI SDK - Ollama Provider](https://ai-sdk.dev/providers/community-providers/ollama) — `.embeddingModel()` API documentation
- [nomic-embed-text Model Card](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5) — Model specifications, dimensions, context window
- [graphology Documentation](https://graphology.github.io) — Graph library API, communities-louvain algorithm
- [better-sqlite3 API Docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md) — Extension loading pattern

**Codebase Analysis:**
- `/home/ubuntu/projects/notetaiker/apps/api/src/services/queue.service.ts` — Existing async job queue pattern
- `/home/ubuntu/projects/notetaiker/apps/api/src/services/worker.service.ts` — Background worker implementation
- `/home/ubuntu/projects/notetaiker/apps/api/src/services/indexer.service.ts` — SQLite indexing architecture
- `/home/ubuntu/projects/notetaiker/CLAUDE.md` — Project architecture, monorepo structure, development patterns

### Secondary (MEDIUM confidence)

**Version Information:**
- [sqlite-vec Releases](https://github.com/asg017/sqlite-vec/releases) — v0.1.7-alpha.2 released 2026-01-10
- [Ollama Library](https://ollama.com/library/nomic-embed-text) — Model size (274MB), library information

**Domain Knowledge:**
- Semantic search threshold tuning patterns (from ML literature, not specific sources)
- Vector database cache invalidation strategies (established best practices)
- Obsidian/Notion/Roam UX patterns (product usage, plugin ecosystems)

### Tertiary (LOW confidence - needs validation)

- Optimal chunk size for note embeddings (200-400 words is heuristic, needs testing)
- Similarity threshold values (corpus-dependent, requires user testing)
- Ollama model loading time (5-10s is estimate, varies by hardware)

---

*Research completed: 2026-02-06*
*Ready for roadmap: yes*
