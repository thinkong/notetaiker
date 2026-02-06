# Architecture Research: Semantic Intelligence Integration

**Project:** NoteTaiker Semantic Intelligence Layer
**Researched:** 2026-02-06
**Confidence:** HIGH

## Executive Summary

Semantic intelligence features integrate seamlessly with NoteTaiker's existing architecture by extending three core components: the background worker pipeline, the SQLite indexer, and the Hono API routes. The architecture leverages existing patterns (background processing via p-queue, SQLite for persistence, SSE for real-time updates) while adding new capabilities (embeddings generation, vector search, semantic clustering).

Key insight: **sqlite-vec** (successor to sqlite-vss) enables local-first vector search within the existing better-sqlite3 infrastructure without external dependencies. Ollama already provides embeddings API alongside text generation, requiring minimal new infrastructure.

## Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │   Editor     │  │  ForceGraph  │  │  RelatedNotesPanel      │  │
│  │ (Modified)   │  │  (Modified)  │  │  (New)                  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────────────┘  │
│         │                 │                   │                    │
│         └─────────────────┴───────────────────┘                    │
│                           │                                        │
│                  TanStack Query (Modified)                         │
└───────────────────────────┼────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      HONO API (Node.js)                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Existing Routes (Modified)                                  │  │
│  │  • POST /notes      → triggers embedding job                 │  │
│  │  • PATCH /notes/:id → triggers embedding job                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  New Routes                                                   │  │
│  │  • GET  /notes/:id/related  → semantic similarity search     │  │
│  │  • GET  /search/semantic    → semantic search                │  │
│  │  • GET  /graph/clusters     → graph clustering               │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                    │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ QueueService    │  │ IndexerService   │  │ AIService        │  │
│  │ (Modified)      │  │ (Modified)       │  │ (Modified)       │  │
│  │                 │  │                  │  │                  │  │
│  │ Job Types:      │  │ Tables:          │  │ New Methods:     │  │
│  │ • ai_tags       │  │ • notes_index    │  │ • embeddings()   │  │
│  │ • embeddings    │  │ • embeddings_vec │  │                  │  │
│  │   (NEW)         │  │   (NEW)          │  │                  │  │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                    │                     │             │
│           ▼                    ▼                     ▼             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ WorkerService (Modified)                                     │  │
│  │ • Processes ai_tags jobs (existing)                          │  │
│  │ • Processes embeddings jobs (NEW)                            │  │
│  │ • Broadcasts events via EventsService                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│           │                                                         │
│           ▼                                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ NEW: EmbeddingsService                                       │  │
│  │ • Generates embeddings via Ollama                            │  │
│  │ • Stores vectors in sqlite-vec                               │  │
│  │ • Similarity search (cosine distance)                        │  │
│  │ • Incremental updates (only modified notes)                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│           │                                                         │
│           ▼                                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ NEW: ClusteringService                                       │  │
│  │ • Builds graph from tag relationships                        │  │
│  │ • Runs Louvain community detection (graphology)              │  │
│  │ • Enriches with semantic similarity edges                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Markdown Files   │  │ SQLite: index.db │  │ SQLite: queue.db │ │
│  │ (filesystem)     │  │ (Modified)       │  │ (Existing)       │ │
│  │                  │  │                  │  │                  │ │
│  │ • Note content   │  │ • notes_index    │  │ • jobs table     │ │
│  │ • Frontmatter    │  │ • embeddings_vec │  │                  │ │
│  │                  │  │   (vec0 table)   │  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICE                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Ollama (localhost:11434 or Docker)                           │  │
│  │ • Text generation (existing)                                 │  │
│  │ • Embeddings generation (NEW)                                │  │
│  │   Models: nomic-embed-text (137M, recommended)               │  │
│  │           mxbai-embed-large (334M, higher quality)           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## New Components

| Component | Purpose | Integrates With | File Location |
|-----------|---------|-----------------|---------------|
| **EmbeddingsService** | Generate and store note embeddings, perform similarity search | AIService, IndexerService, Ollama | `apps/api/src/services/embeddings.service.ts` |
| **ClusteringService** | Compute graph clusters using Louvain algorithm on semantic + tag relationships | IndexerService, EmbeddingsService, GraphData | `apps/api/src/services/clustering.service.ts` |
| **Related Notes API** | GET endpoint returning semantically similar notes | EmbeddingsService, StorageService | `apps/api/src/routes/notes.ts` (extend) |
| **Semantic Search API** | GET endpoint for semantic search across all notes | EmbeddingsService, IndexerService | `apps/api/src/routes/search.ts` (new) |
| **Graph Clustering API** | GET endpoint returning cluster assignments for graph visualization | ClusteringService | `apps/api/src/routes/graph.ts` (new) |
| **RelatedNotesPanel** | UI component showing related notes in sidebar | TanStack Query, Related Notes API | `apps/web/src/components/sidebar/RelatedNotesPanel.tsx` |
| **SemanticSearchInput** | Search input with semantic mode toggle | TanStack Query, Semantic Search API | `apps/web/src/components/search/SearchPalette.tsx` (modify) |

## Modified Components

| Component | Changes Needed | Reason |
|-----------|----------------|--------|
| **QueueService** | Add `embeddings` job type to schema and enqueue method | Process embeddings in background |
| **WorkerService** | Add handler for `embeddings` job type, call EmbeddingsService | Execute embeddings generation asynchronously |
| **IndexerService** | Add `embeddings_vec` virtual table (sqlite-vec), add methods to query by similarity | Store and retrieve vectors |
| **AIService** | Add `generateEmbeddings(text: string)` method using Ollama embeddings API | Generate vector representations |
| **StorageService** | Trigger embeddings job on note save (in addition to ai_tags job) | Keep embeddings in sync with note changes |
| **notes routes** | Add `/notes/:id/related` GET endpoint | Expose related notes API |
| **ForceGraph** | Color nodes by cluster ID, add legend for clusters | Visualize semantic groupings |
| **EventsService** | Broadcast `embeddings_updated` event | Notify frontend when vectors are ready |

## Data Flow

### 1. Note Saved → Embeddings Generation

```
User saves note in Editor
  → POST /notes (content + metadata)
  → StorageService.saveNote()
    → Saves markdown file
    → IndexerService.syncNote() (updates notes_index)
    → Returns note ID
  → QueueService.enqueue(noteId, 'ai_tags')     [existing]
  → QueueService.enqueue(noteId, 'embeddings')  [NEW]
  → Returns 201 Created

Background (p-queue, concurrency: 2):
  Worker picks up 'embeddings' job
    → EmbeddingsService.generateAndStore(noteId)
      → Fetches note content
      → AIService.generateEmbeddings(content)
        → Ollama POST /api/embed (model: nomic-embed-text)
        → Returns float32[] vector (768 dimensions)
      → EmbeddingsService.store(noteId, vector)
        → INSERT INTO embeddings_vec (note_id, embedding)
      → Updates job status: 'completed'
      → EventsService.broadcast('embeddings_updated', { noteId })
```

### 2. Similarity Query → Related Notes

```
User opens note in Editor
  → Frontend requests related notes
  → GET /notes/:id/related?limit=5
  → EmbeddingsService.findSimilar(noteId, limit)
    → Fetches vector for noteId from embeddings_vec
    → SELECT note_id, distance FROM embeddings_vec
         WHERE vec_search(embedding, ?)
         ORDER BY distance ASC
         LIMIT 5
    → Returns array of { noteId, similarity }
  → StorageService.getNotes(noteIds)
  → Returns array of related notes with metadata
```

### 3. Semantic Search → Results

```
User types query in search palette
  → Frontend sends search query
  → GET /search/semantic?q=machine%20learning
  → AIService.generateEmbeddings(query)
    → Ollama embeddings for query text
  → EmbeddingsService.search(queryVector, limit: 20)
    → SELECT note_id, distance FROM embeddings_vec
         WHERE vec_search(embedding, ?)
         ORDER BY distance ASC
         LIMIT 20
  → StorageService.getNotes(noteIds)
  → Returns ranked search results
```

### 4. Graph Clustering → Visualization

```
User opens Graph View
  → GET /graph/clusters
  → ClusteringService.computeClusters()
    → Builds graphology graph:
      • Nodes: all notes
      • Edges: tag relationships (existing)
      • Edges: semantic similarity > threshold (NEW)
    → EmbeddingsService.getAllVectors()
    → For each pair with cosine similarity > 0.7:
        graph.addEdge(noteA, noteB, { weight: similarity })
    → louvain.detailed(graph)
      → Returns { communities: Map<nodeId, clusterId> }
    → Returns { nodeId: clusterId } mapping
  → Frontend colors ForceGraph nodes by clusterId
```

## Technology Stack

### Vector Storage: sqlite-vec

**Why:** sqlite-vec is the successor to sqlite-vss, optimized for "fast enough" vector search that runs anywhere SQLite runs (including WASM). It stores vectors in shadow tables and processes chunk-by-chunk, avoiding RAM constraints.

**Integration:**
```typescript
// In IndexerService.init()
import Database from 'better-sqlite3';
import { loadSqliteVec } from 'sqlite-vec';

const db = new Database(dbPath);
loadSqliteVec(db); // Load extension

// Create virtual table for embeddings
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS embeddings_vec USING vec0(
    note_id TEXT PRIMARY KEY,
    embedding FLOAT[768]
  );
`);
```

**Source:** [sqlite-vec GitHub](https://github.com/asg017/sqlite-vec) (HIGH confidence - official documentation)

### Embeddings Generation: Ollama

**Why:** Ollama already integrated for text generation. Embeddings API is built-in, no new infrastructure needed. Local-first, no external API calls.

**Models:**
- **nomic-embed-text** (137M) - Recommended, good balance of quality/speed
- **mxbai-embed-large** (334M) - Higher quality, slower
- **all-minilm** (23M) - Fastest, lower quality

**Integration:**
```typescript
// In AIService
import { Ollama } from 'ollama';

async generateEmbeddings(text: string): Promise<number[]> {
  const ollama = new Ollama({ baseURL: this.ollamaBaseUrl });
  const response = await ollama.embed({
    model: 'nomic-embed-text',
    input: text,
  });
  return response.embeddings[0]; // float32[] of length 768
}
```

**Source:** [Ollama Embeddings Blog](https://ollama.com/blog/embedding-models), [ollama-js GitHub](https://github.com/ollama/ollama-js) (HIGH confidence - official documentation)

### Graph Clustering: graphology + communities-louvain

**Why:** Graphology is a comprehensive graph library for JavaScript with a standard library including Louvain community detection. React Force Graph uses d3-force for layout but doesn't do clustering—graphology fills this gap.

**Integration:**
```typescript
import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';

const graph = new Graph({ type: 'undirected' });

// Add nodes (notes)
notes.forEach(note => graph.addNode(note.id));

// Add edges (tag relationships + semantic similarity)
tagRelationships.forEach(([a, b]) =>
  graph.addEdge(a, b, { weight: 1.0 })
);

semanticPairs.forEach(([a, b, similarity]) => {
  if (similarity > 0.7) {
    graph.addEdge(a, b, { weight: similarity });
  }
});

// Compute clusters
const communities = louvain.detailed(graph);
// Returns: { count: 5, communities: Map { 'note1' => 0, 'note2' => 1, ... } }
```

**Source:** [Graphology Documentation](https://graphology.github.io) (MEDIUM confidence - official docs confirm standard library with communities-louvain)

## Build Order (Suggested Phase Structure)

### Phase 1: Embeddings Foundation (Weeks 1-2)

**Goal:** Generate and store embeddings for existing notes

**Components:**
1. EmbeddingsService (core methods: generate, store, get)
2. Modify IndexerService (add embeddings_vec table, load sqlite-vec extension)
3. Modify AIService (add generateEmbeddings method)
4. Modify QueueService (add embeddings job type)
5. Modify WorkerService (add embeddings job handler)
6. Modify StorageService (enqueue embeddings job on save)

**Acceptance Criteria:**
- All existing notes have embeddings generated
- New notes automatically get embeddings in background
- No blocking on note save (background processing)

**Dependencies:**
- sqlite-vec npm package
- Ollama with nomic-embed-text model pulled

**Risks:**
- sqlite-vec may require native compilation (better-sqlite3 already in onlyBuiltDependencies)
- Large note corpus may take hours to generate initial embeddings (use rate limiting)

### Phase 2: Related Notes API (Week 3)

**Goal:** Surface semantically similar notes

**Components:**
1. EmbeddingsService.findSimilar(noteId, limit)
2. GET /notes/:id/related endpoint
3. RelatedNotesPanel component (frontend)
4. TanStack Query hook: useRelatedNotes(noteId)

**Acceptance Criteria:**
- Opening a note shows 5 related notes in sidebar
- Similarity score visible (0.0-1.0)
- Click related note to navigate
- Real-time updates when embeddings change (SSE)

**Dependencies:**
- Phase 1 complete (embeddings exist)

**Risks:**
- sqlite-vec performance on large datasets (test with 1000+ notes)
- May need to add indexing or caching for hot queries

### Phase 3: Semantic Search (Week 4)

**Goal:** Search notes by meaning, not just keywords

**Components:**
1. EmbeddingsService.search(queryVector, limit)
2. GET /search/semantic endpoint
3. Modify SearchPalette (add semantic toggle)
4. TanStack Query hook: useSemanticSearch(query)

**Acceptance Criteria:**
- Search palette has "Semantic" vs "Keyword" toggle
- Semantic search returns relevant notes even without exact keyword matches
- Results ranked by similarity
- Performance: <500ms for searches

**Dependencies:**
- Phase 1 complete (embeddings exist)

**Risks:**
- Embedding short queries may be less accurate than full notes
- May need to adjust similarity thresholds based on user feedback

### Phase 4: Graph Clustering (Week 5)

**Goal:** Visualize semantic groupings in graph view

**Components:**
1. ClusteringService (compute clusters from graph + embeddings)
2. GET /graph/clusters endpoint
3. Modify ForceGraph (color by cluster, add legend)
4. TanStack Query hook: useGraphClusters()

**Acceptance Criteria:**
- Graph view colors nodes by cluster
- Legend shows cluster names (auto-generated or user-defined)
- Clusters update when notes change
- Hovering cluster shows all members

**Dependencies:**
- Phase 1 complete (embeddings exist)
- Phase 2 complete (similarity logic tested)

**Risks:**
- Louvain may produce unstable clusters (different results on same data)
- May need to cache cluster assignments to avoid re-computation on every load
- Color palette limited (>10 clusters may be hard to distinguish)

### Phase 5: Link Suggestions (Week 6)

**Goal:** Suggest bidirectional links when saving notes

**Components:**
1. EmbeddingsService.suggestLinks(noteId, threshold: 0.75)
2. Modify WorkerService (add link_suggestions job)
3. LinkSuggestionsPanel component (appears after save)
4. EventsService broadcast `link_suggestions_ready`

**Acceptance Criteria:**
- After saving note, panel shows 3-5 suggested links
- User can accept (add to frontmatter) or dismiss
- Suggestions based on semantic similarity + tag overlap
- Non-blocking (appears after save completes)

**Dependencies:**
- Phase 1 complete (embeddings exist)
- Phase 2 complete (similarity API working)

**Risks:**
- Too many suggestions = noise (need good threshold tuning)
- User may expect manual link creation (not auto-generated)
- Bi-directional links may conflict with existing tag system

## Performance Considerations

### Embeddings Generation

| Scenario | Notes | Time Estimate | Strategy |
|----------|-------|---------------|----------|
| Initial sync (100 notes) | 100 × 200 words avg | ~2-3 minutes | Background, show progress in status bar |
| Initial sync (1000 notes) | 1000 × 200 words avg | ~20-30 minutes | Background, allow usage during generation |
| Incremental (1 note) | Single note on save | ~200-500ms | Background, never block save |

**Optimization:**
- Batch embeddings API calls (Ollama supports array input)
- Rate limiting: max 10 embeddings/second (avoid overloading Ollama)
- Skip re-embedding if content hash unchanged

### Vector Search

| Scenario | Database Size | Time Estimate | Strategy |
|----------|---------------|---------------|----------|
| Find similar (5 results) | 100 notes | <50ms | Direct query, no optimization needed |
| Find similar (5 results) | 1000 notes | <200ms | sqlite-vec handles efficiently |
| Find similar (5 results) | 10,000 notes | <1s | May need HNSW index (future optimization) |
| Semantic search | 1000 notes | <500ms | Acceptable for MVP |

**Optimization:**
- sqlite-vec uses chunk-by-chunk processing (memory efficient)
- Consider caching frequent queries (e.g., homepage related notes)
- Lazy load related notes (only fetch when sidebar opened)

### Graph Clustering

| Scenario | Nodes | Edges | Time Estimate | Strategy |
|----------|-------|-------|---------------|----------|
| Louvain (100 notes) | 100 | ~500 | <100ms | Compute on-demand |
| Louvain (1000 notes) | 1000 | ~5000 | ~1-2s | Cache results, recompute on note changes |
| Louvain (10,000 notes) | 10,000 | ~50,000 | ~10-30s | Pre-compute nightly, cache aggressively |

**Optimization:**
- Cache cluster assignments in memory (Map<noteId, clusterId>)
- Recompute only when graph structure changes (new notes, deleted notes)
- For large graphs, consider incremental clustering (add node to existing cluster)

## Data Schema Changes

### index.db (Modified)

```sql
-- Existing table (no changes)
CREATE TABLE IF NOT EXISTS notes_index (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  content TEXT,
  metadata TEXT,  -- JSON string
  createdAt DATETIME,
  updatedAt DATETIME
);

-- NEW: Virtual table for vector storage
CREATE VIRTUAL TABLE IF NOT EXISTS embeddings_vec USING vec0(
  note_id TEXT PRIMARY KEY,
  embedding FLOAT[768],  -- nomic-embed-text dimensions
  content_hash TEXT,     -- MD5 of content, for change detection
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_embeddings_updated
  ON embeddings_vec(updated_at);
```

### queue.db (Modified)

```sql
-- Existing jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  noteId TEXT NOT NULL,
  status TEXT NOT NULL,  -- 'queued' | 'processing' | 'completed' | 'failed'
  attempts INTEGER DEFAULT 0,
  lastError TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  job_type TEXT DEFAULT 'ai_tags'  -- NEW: 'ai_tags' | 'embeddings'
);

-- NEW: Index for job type filtering
CREATE INDEX IF NOT EXISTS idx_jobs_type
  ON jobs(job_type, status, createdAt);
```

## Integration Points

### Existing → Semantic Intelligence

| Existing Component | Integration Point | How |
|-------------------|-------------------|-----|
| **StorageService.saveNote()** | Enqueue embeddings job | Add `queueService.enqueue(noteId, 'embeddings')` after ai_tags job |
| **WorkerService.executeJob()** | Handle embeddings jobs | Add case for `job_type === 'embeddings'` → call EmbeddingsService |
| **IndexerService.syncAll()** | Generate embeddings for existing notes | On startup, check for notes without embeddings, enqueue jobs |
| **EventsService** | Broadcast embeddings updates | Emit `embeddings_updated` when worker completes embeddings job |
| **ForceGraph** | Color nodes by cluster | Fetch clusters from API, map nodeId → clusterId → color |
| **SearchPalette** | Add semantic mode | Add toggle, use useSemanticSearch hook when enabled |

### Semantic Intelligence → Existing

| New Component | Uses Existing | How |
|---------------|---------------|-----|
| **EmbeddingsService** | AIService | Calls `aiService.generateEmbeddings()` for Ollama integration |
| **EmbeddingsService** | IndexerService | Reads from `notes_index` to get note content |
| **ClusteringService** | IndexerService | Reads all notes to build graph structure |
| **Related Notes API** | StorageService | Fetches note metadata for related note IDs |
| **Semantic Search API** | StorageService | Fetches full notes for search result IDs |

## API Contracts

### GET /notes/:id/related

**Request:**
```
GET /notes/abc-123-def/related?limit=5&threshold=0.5
```

**Response:**
```json
{
  "noteId": "abc-123-def",
  "related": [
    {
      "noteId": "xyz-789",
      "similarity": 0.87,
      "title": "Machine Learning Fundamentals",
      "tags": ["AI", "Data Science"],
      "createdAt": "2026-01-15T10:30:00Z"
    },
    // ... 4 more
  ]
}
```

### GET /search/semantic

**Request:**
```
GET /search/semantic?q=deep+learning+applications&limit=20
```

**Response:**
```json
{
  "query": "deep learning applications",
  "results": [
    {
      "noteId": "note-123",
      "similarity": 0.92,
      "title": "Neural Networks in Computer Vision",
      "excerpt": "CNNs are widely used for image classification...",
      "tags": ["AI", "Computer Vision"],
      "createdAt": "2026-01-20T14:00:00Z"
    },
    // ... 19 more
  ]
}
```

### GET /graph/clusters

**Request:**
```
GET /graph/clusters
```

**Response:**
```json
{
  "clusters": {
    "note-1": 0,
    "note-2": 0,
    "note-3": 1,
    "note-4": 1,
    "note-5": 2
  },
  "clusterSummaries": [
    {
      "clusterId": 0,
      "size": 15,
      "topTags": ["AI", "Machine Learning", "Python"],
      "representative": "note-1"
    },
    {
      "clusterId": 1,
      "size": 8,
      "topTags": ["Web Dev", "React", "TypeScript"],
      "representative": "note-3"
    }
  ]
}
```

## Error Handling & Edge Cases

| Scenario | Handling Strategy |
|----------|------------------|
| **Ollama down during embedding generation** | Worker retries 3x with p-retry, marks job as 'failed', user can retry later from settings |
| **sqlite-vec extension fails to load** | Graceful degradation: log error, disable semantic features, show warning in UI |
| **Note has no embeddings yet** | Return empty array for related notes, show "Generating..." in UI with SSE for update |
| **Very short notes (<10 words)** | Generate embeddings anyway (even short text has semantic meaning), may have lower similarity scores |
| **Very long notes (>10k words)** | Truncate to first 2000 words for embeddings (Ollama models have token limits), log warning |
| **Duplicate embeddings (note saved twice quickly)** | Queue deduplicates by noteId, only process latest version |
| **User deletes note before embeddings complete** | Worker checks note exists before processing, skips if deleted, cleans up embeddings_vec row |
| **Cluster count changes (user adds many notes)** | Frontend refetches clusters periodically or on note_updated event, updates colors smoothly |

## Security & Privacy

**Concern:** Embeddings stored in SQLite are theoretically reversible (vector → approximate text)

**Mitigation:**
- All data local-first (no cloud transmission)
- Embeddings stored in `.notetaiker/index.db` (same security as notes themselves)
- User controls Ollama instance (no external API calls)

**Concern:** Semantic search may surface sensitive notes unexpectedly

**Mitigation:**
- Respect existing note privacy settings (if implemented in future)
- Search only indexes notes user has access to
- Clear visual indication of search mode (semantic vs keyword)

## Testing Strategy

### Unit Tests

| Component | Test Coverage |
|-----------|---------------|
| **EmbeddingsService** | • Mock Ollama responses<br>• Test vector storage<br>• Test similarity calculation<br>• Test cache invalidation |
| **ClusteringService** | • Mock graph data<br>• Test Louvain output<br>• Test cluster stability<br>• Test edge weighting |
| **Related Notes API** | • Mock embeddings service<br>• Test pagination<br>• Test threshold filtering |

### Integration Tests

| Scenario | Test |
|----------|------|
| **End-to-end embeddings** | Save note → wait for job → verify vector in DB → query related notes |
| **Semantic search** | Index notes → search query → verify results ranked by similarity |
| **Graph clustering** | Add notes → trigger clustering → verify cluster assignments → visualize |

### Performance Tests

| Scenario | Benchmark |
|----------|-----------|
| **Embeddings generation** | 100 notes in <5 minutes |
| **Similarity search** | 1000 notes, <200ms per query |
| **Clustering** | 1000 notes, <2s computation |

## Rollout Strategy

**Phase 1-3:** MVP (Embeddings + Related Notes + Semantic Search)
- Feature flag in settings: "Enable Semantic Intelligence (Beta)"
- Requires Ollama with nomic-embed-text pulled
- Show progress indicator during initial embedding generation
- Fallback to keyword search if embeddings unavailable

**Phase 4-5:** Advanced Features (Clustering + Link Suggestions)
- Graduate semantic search from beta
- Add clustering as experimental feature
- Link suggestions opt-in (may be polarizing)

## Dependencies to Install

```json
// apps/api/package.json
{
  "dependencies": {
    "sqlite-vec": "^0.1.0",      // Vector storage extension
    "graphology": "^0.25.0",      // Graph data structure
    "graphology-communities-louvain": "^2.0.0"  // Clustering algorithm
  }
}

// apps/web/package.json (no new dependencies needed)
```

**Note:** Ollama embeddings models installed via CLI:
```bash
ollama pull nomic-embed-text
```

## Confidence Assessment

| Decision | Confidence | Rationale |
|----------|-----------|-----------|
| **sqlite-vec for vector storage** | HIGH | Official successor to sqlite-vss, maintained by same author, designed for better-sqlite3 integration |
| **Ollama for embeddings** | HIGH | Already integrated, official embeddings API, local-first |
| **nomic-embed-text model** | MEDIUM | Recommended by Ollama docs, but user preference may vary (size vs quality tradeoff) |
| **graphology + Louvain** | MEDIUM | Standard algorithm, but cluster stability may be issue (deterministic results not guaranteed) |
| **Background processing pattern** | HIGH | Existing pattern proven in codebase (ai_tags jobs), extends cleanly |
| **sqlite-vec performance** | MEDIUM | Author claims "fast enough" but not benchmarked on NoteTaiker's scale (need testing) |

## Open Questions for Phase-Specific Research

- **Phase 1:** What's the optimal batch size for Ollama embeddings API? (Test 1 vs 10 vs 100 notes/request)
- **Phase 2:** What similarity threshold produces good "related notes" (0.5? 0.7? 0.9?)? Requires user testing.
- **Phase 4:** How to name clusters automatically? (Use top tags? Use AI to summarize? Let user label?)
- **Phase 5:** Should link suggestions auto-create bidirectional links or require user confirmation? UX research needed.

## Sources

- [sqlite-vec GitHub](https://github.com/asg017/sqlite-vec) - Vector storage extension (HIGH confidence)
- [sqlite-vss GitHub](https://github.com/asg017/sqlite-vss) - Predecessor to sqlite-vec (HIGH confidence)
- [Ollama Embeddings Blog](https://ollama.com/blog/embedding-models) - Embeddings models and API (HIGH confidence)
- [ollama-js GitHub](https://github.com/ollama/ollama-js) - JavaScript client library (HIGH confidence)
- [Graphology Documentation](https://graphology.github.io) - Graph library with standard algorithms (MEDIUM confidence)
- [better-sqlite3 API Docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md) - Extension loading (HIGH confidence)
- [Building Vector Search with SQLite](https://alexgarcia.xyz/blog/2024/building-new-vector-search-sqlite/index.html) - sqlite-vec design rationale (MEDIUM confidence - author's blog)
