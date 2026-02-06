# Stack Research: Semantic Intelligence

**Project:** NoteTaiker
**Researched:** 2026-02-06
**Confidence:** HIGH

## Executive Summary

For adding semantic intelligence (embeddings, vector search, similarity clustering) to NoteTaiker, the recommended approach leverages **existing infrastructure** (Ollama, SQLite, React Force Graph) with minimal new dependencies. The stack is optimized for local-first constraints and integrates seamlessly with the current Vercel AI SDK and better-sqlite3 setup.

**Key principle:** Add semantic capabilities without introducing cloud dependencies or heavyweight vector databases.

## Recommended Stack Additions

### Embeddings Generation

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **ollama-ai-provider-v2** | ^1.2.0 | Ollama embeddings via Vercel AI SDK | Already installed. Provides `.embeddingModel()` API for local embedding generation with nomic-embed-text |
| **Ollama Model: nomic-embed-text** | latest | Generate 768-dim embeddings locally | 274MB model, 8K context, supports Matryoshka (flexible dimensions 64-768), excellent for semantic search |

**Why NOT mxbai-embed-large:** 670MB (2.4x larger), 512 context (vs 8K), and 1024 dimensions (larger storage). nomic-embed-text offers better size/performance tradeoff for note-taking use case.

**Why NOT all-minilm:** Only 23MB but significantly lower quality embeddings. For semantic search quality matters.

### Vector Storage

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **sqlite-vec** | ^0.1.7-alpha.2 | Vector search extension for SQLite | Native SQLite integration, works with existing better-sqlite3, local-first, actively maintained (successor to deprecated sqlite-vss) |

**Integration:** Extends existing SQLite database with `vec0` virtual tables. No separate vector database needed.

**Why sqlite-vec:**
- Works directly with better-sqlite3 (already using v12.6.2)
- Stores vectors alongside metadata in existing SQLite schema
- Fast sub-millisecond search for small/medium corpora (thousands of notes)
- Recent releases (v0.1.7-alpha.2 on 2026-01-10) with active development
- Zero infrastructure - just a SQLite extension

### Similarity & Clustering

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **graphology** | ^0.25.4 | Graph structure for clustering algorithms | Industry-standard graph library, integrates with react-force-graph-2d (already using v1.29.0) |
| **graphology-communities-louvain** | ^2.0.1 | Community detection clustering | Best algorithm for semantic grouping - finds natural clusters without pre-specifying k |

**Why Louvain algorithm:**
- Discovers optimal number of clusters automatically (vs k-means requiring k upfront)
- Excellent for semantic communities in note graphs
- Fast O(n log n) complexity
- Standard algorithm for network community detection

**Why NOT k-means:** Requires knowing cluster count in advance, poor for semantic grouping where natural communities vary

**Why NOT vectra/hnswlib-node:** These are standalone vector DBs. sqlite-vec integrates better with existing SQLite infrastructure.

## Integration Architecture

### 1. Embeddings Generation (Backend)

```typescript
// Using existing ollama-ai-provider-v2 (already installed)
import { ollama } from 'ollama-ai-provider-v2';
import { embed } from 'ai';

const embeddingModel = ollama.embeddingModel('nomic-embed-text');

// Generate embeddings for a note
const { embedding } = await embed({
  model: embeddingModel,
  value: noteContent,
});
// Returns Float32Array of 768 dimensions
```

**Storage in SQLite:**
```typescript
import sqliteVec from 'sqlite-vec';
import Database from 'better-sqlite3';

const db = new Database('./notes.db'); // Existing DB
sqliteVec.load(db); // Load extension

// Create vector table
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS note_embeddings
  USING vec0(
    note_id TEXT PRIMARY KEY,
    embedding float[768]
  )
`);

// Insert embedding
const stmt = db.prepare(`
  INSERT INTO note_embeddings(note_id, embedding)
  VALUES (?, ?)
`);
stmt.run(noteId, new Float32Array(embedding));
```

### 2. Similarity Search (Backend)

```typescript
// Find similar notes using sqlite-vec
const findSimilar = db.prepare(`
  SELECT
    note_id,
    distance
  FROM note_embeddings
  WHERE embedding MATCH ?
  ORDER BY distance
  LIMIT ?
`);

const similar = findSimilar.all(
  new Float32Array(queryEmbedding),
  10 // top 10 similar notes
);
```

**Distance metric:** sqlite-vec uses cosine distance by default (1 - cosine similarity), optimal for semantic similarity.

### 3. Graph Clustering (Frontend)

```typescript
// Using existing react-force-graph-2d with graphology
import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';

// Build graph from similarity relationships
const graph = new Graph();
notes.forEach(note => graph.addNode(note.id));
similarityEdges.forEach(({ from, to, similarity }) => {
  if (similarity > threshold) {
    graph.addEdge(from, to, { weight: similarity });
  }
});

// Detect semantic communities
const communities = louvain(graph);
// Returns: { noteId: communityId, ... }

// Color nodes by community in react-force-graph-2d
<ForceGraph2D
  graphData={{
    nodes: notes.map(n => ({
      id: n.id,
      group: communities[n.id] // Community as color group
    })),
    links: similarityEdges
  }}
/>
```

**Integration with existing visualization:** react-force-graph-2d already supports node grouping/coloring. Just add `group` property from Louvain output.

## NOT Recommended (Anti-Patterns)

| What | Why Avoid | When to Reconsider |
|------|-----------|-------------------|
| **Pinecone/Qdrant/Weaviate** | Cloud vector DBs violate local-first principle | If scaling to millions of notes or need distributed search |
| **Vectra** | Redundant - sqlite-vec provides same functionality with better SQLite integration | If NOT using SQLite (but you are) |
| **hnswlib-node** | Standalone index, doesn't integrate with existing SQLite schema | If need HNSW algorithm specifically (sqlite-vec uses simpler but sufficient for this scale) |
| **OpenAI/Anthropic embeddings** | Cloud APIs, cost per embedding, privacy concerns | If Ollama performance insufficient (unlikely for notes) |
| **K-means clustering** | Requires pre-specifying cluster count | Never for semantic grouping - use Louvain |
| **Separate vector database** | Adds complexity, synchronization issues | If SQLite performance degrades at scale |

## Dependency Changes Summary

### Backend (`apps/api/package.json`)

**Add:**
```json
{
  "dependencies": {
    "sqlite-vec": "^0.1.7-alpha.2",
    "graphology": "^0.25.4",
    "graphology-communities-louvain": "^2.0.1"
  }
}
```

**Already have (no changes):**
- `ollama-ai-provider`: ^1.2.0 (supports embeddings)
- `better-sqlite3`: ^12.6.2 (compatible with sqlite-vec)
- `ai`: ^6.0.69 (Vercel AI SDK for embed() API)

### Frontend (`apps/web/package.json`)

**Add:**
```json
{
  "dependencies": {
    "graphology": "^0.25.4",
    "graphology-communities-louvain": "^2.0.1"
  }
}
```

**Already have (no changes):**
- `react-force-graph-2d`: ^1.29.0 (visualization ready)

**Total new packages:** 3 (sqlite-vec, graphology, graphology-communities-louvain)

## Performance Considerations

### Embedding Generation
- **Speed:** ~50-200ms per note with nomic-embed-text on modern CPU
- **Batch processing:** Generate embeddings in background queue (use existing p-queue: ^9.1.0)
- **Storage:** 768 floats × 4 bytes = 3KB per note embedding

### Vector Search
- **sqlite-vec performance:** Sub-millisecond for <10K notes, low-millisecond for 10K-100K notes
- **Scaling:** Linear scan with SIMD optimizations, sufficient for local note collections
- **Index:** No separate index needed - vec0 virtual table handles it

### Clustering
- **Louvain complexity:** O(n log n) - fast even for thousands of notes
- **Graph size:** Only store high-similarity edges (threshold > 0.7) to keep graph sparse
- **Frontend computation:** Run clustering in Web Worker if graph >1000 nodes

## Migration Path

### Phase 1: Embeddings Infrastructure
1. Add sqlite-vec extension to existing SQLite database
2. Create `note_embeddings` virtual table
3. Add background job to generate embeddings for existing notes (use p-queue)
4. Hook into note save workflow to generate embeddings on update

### Phase 2: Similarity Search
1. Implement similarity search API endpoint
2. Add "Similar Notes" UI component
3. Use embeddings for semantic search (complement existing text search)

### Phase 3: Semantic Clustering
1. Add graphology dependencies
2. Compute similarity graph from embeddings
3. Run Louvain clustering
4. Visualize communities in existing react-force-graph-2d

**Risk:** sqlite-vec is in alpha. Monitor for breaking changes, but author is responsive and library is actively developed.

## Alternative Scenarios

| If... | Then Switch To... | Rationale |
|-------|------------------|-----------|
| Notes exceed 100K | hnswlib-node for embeddings, keep SQLite for metadata | HNSW algorithm scales better than brute-force for large corpora |
| Need cloud sync | Turso (SQLite over HTTP) | Maintains SQLite compatibility, adds sync |
| Local performance insufficient | Reduce embedding dimensions to 256 or 512 | nomic-embed-text supports Matryoshka - minimal quality loss |
| Alpha instability issues | sqlite-vss (deprecated but stable) | Fallback to previous generation, same API |

## Installation Commands

```bash
# Backend
cd apps/api
pnpm add sqlite-vec@^0.1.7-alpha.2
pnpm add graphology@^0.25.4 graphology-communities-louvain@^2.0.1

# Frontend
cd apps/web
pnpm add graphology@^0.25.4 graphology-communities-louvain@^2.0.1

# Ollama model (one-time, run on host)
ollama pull nomic-embed-text
```

## Verification Checklist

- [x] All packages respect local-first constraint
- [x] Integrates with existing stack (Ollama, SQLite, React Force Graph)
- [x] No cloud dependencies introduced
- [x] Versions verified current as of 2026-02-06
- [x] Performance suitable for local note collections
- [x] Migration path clear and incremental

## Sources

**High Confidence (Official Documentation):**
- [Ollama Embedding Models](https://ollama.com/blog/embedding-models) - Official Ollama blog
- [sqlite-vec GitHub](https://github.com/asg017/sqlite-vec) - Official repository and documentation
- [Vercel AI SDK - Ollama Provider](https://ai-sdk.dev/providers/community-providers/ollama) - Official SDK docs
- [nomic-embed-text Model Card](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5) - Official Hugging Face model page
- [mxbai-embed-large Model Card](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1) - Official Hugging Face model page
- [graphology-communities-louvain](https://github.com/graphology/graphology/tree/master/src/communities-louvain) - Official graphology repository

**Medium Confidence (Version Information):**
- [sqlite-vec Releases](https://github.com/asg017/sqlite-vec/releases) - Official GitHub releases page
- [Ollama nomic-embed-text Library](https://ollama.com/library/nomic-embed-text) - Model information
- [Ollama mxbai-embed-large Library](https://ollama.com/library/mxbai-embed-large) - Model information

**Note:** Package versions verified against npm registry and GitHub releases as of 2026-02-06. All recommended packages are actively maintained.
