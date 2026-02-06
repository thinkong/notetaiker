# Pitfalls Research: Semantic Intelligence

**Domain:** Adding vector embeddings, semantic search, and similarity features to existing local-first note-taking app
**Context:** NoteTaiker constraints - Local-first, SQLite storage, Ollama embeddings, non-blocking note capture
**Researched:** 2026-02-06
**Confidence:** MEDIUM (based on domain knowledge, architectural analysis, and web research)

## Critical Pitfalls

### Pitfall 1: Blocking Note Save on Embedding Generation

**Symptom:** UI freezes or shows long save times when user creates/edits notes. Users experience delays between typing and confirmation that note is saved.

**Cause:** Synchronous embedding generation in the save path. Ollama embedding generation can take 100-500ms for a typical note (depending on length and model), which is perceptible to users expecting instant saves in a note-taking app.

**Why This Happens:**
- Developers add `generateEmbedding()` directly in the note save handler
- Treating embeddings as required before save completes
- Not understanding that embeddings are an indexing concern, not a storage concern

**Warning Signs:**
- Save endpoint response time increases from <50ms to >200ms
- User reports of "lag" when saving notes
- Embedding generation errors cause note saves to fail
- CPU spikes during note saves (Ollama model loading)

**Prevention:**
1. **Decouple embedding generation from save path completely**
   - Save note to filesystem FIRST (current behavior)
   - Enqueue embedding job AFTER save succeeds
   - Return success to user immediately

2. **Use existing queue infrastructure**
   - Extend `QueueService` with embedding job types
   - Reuse `WorkerService` pattern for async processing
   - Keep embeddings in separate table, linked by note ID

3. **Design for eventual consistency**
   - UI shows "embedding pending" state for new/edited notes
   - Related notes panel shows "updating..." during regeneration
   - Semantic search includes disclaimer when embeddings incomplete

4. **Implement debouncing for rapid edits**
   - Don't queue embedding job on every keystroke
   - Queue job only when note is closed or after 30s idle
   - Cancel pending job if note edited again before processing

**Code Pattern to Avoid:**
```typescript
// BAD: Blocking save
async saveNote(id, content) {
  await writeFile(path, content);
  const embedding = await generateEmbedding(content); // BLOCKS HERE
  await saveEmbedding(id, embedding);
  return { success: true };
}
```

**Code Pattern to Use:**
```typescript
// GOOD: Non-blocking save
async saveNote(id, content) {
  await writeFile(path, content);
  queueService.enqueue({ type: 'embedding', noteId: id }); // Async
  return { success: true };
}
```

**Phase to Address:** Phase 1 (Foundation) - Architecture decision must be made upfront

---

### Pitfall 2: Stale Embeddings After Content Changes

**Symptom:** Related notes panel shows irrelevant notes. Semantic search returns old content. User edits note about "React" to be about "Python" but it still appears related to JavaScript notes.

**Cause:** Embedding cache invalidation strategy missing. Embeddings stored in database become stale when note content changes, but no mechanism exists to detect staleness or trigger regeneration.

**Why This Happens:**
- Embeddings stored with note ID only, no content hash or version tracking
- No trigger to regenerate embedding when note updated
- Assuming embeddings are immutable once generated

**Warning Signs:**
- User reports "related notes are wrong"
- Search results don't match current note content
- Embeddings table has older updatedAt than notes_index table
- Manual re-indexing "fixes" the problem temporarily

**Prevention:**
1. **Track embedding freshness with content hash**
   ```sql
   CREATE TABLE embeddings (
     noteId TEXT PRIMARY KEY,
     embedding BLOB NOT NULL,
     contentHash TEXT NOT NULL,  -- MD5/SHA256 of content when embedded
     generatedAt DATETIME NOT NULL,
     modelVersion TEXT NOT NULL   -- Track which model generated it
   )
   ```

2. **Invalidate on content change**
   - When note saved, compute content hash
   - Compare to stored contentHash in embeddings table
   - If different, mark embedding as stale and enqueue regeneration job
   - Until new embedding ready, exclude from similarity queries or mark as "pending"

3. **Handle frontmatter vs content separately**
   - Only generate new embedding if CONTENT changed (not tags/dates)
   - Hash the parsed content (after markdown parsing), not raw file
   - Prevents unnecessary regeneration when AI adds tags

4. **Implement versioning for model changes**
   - Store model name/version with each embedding
   - When switching Ollama models, bulk re-embed all notes
   - Provide "re-embed all" function for model upgrades

**Detection Strategy:**
```typescript
async needsReembedding(noteId: string, currentContent: string): boolean {
  const existing = await db.getEmbedding(noteId);
  if (!existing) return true;

  const currentHash = computeHash(currentContent);
  if (existing.contentHash !== currentHash) return true;

  if (existing.modelVersion !== getCurrentModelVersion()) return true;

  return false;
}
```

**Phase to Address:** Phase 1 (Foundation) - Build into initial schema design

---

### Pitfall 3: Full-Note Embedding Loses Granularity

**Symptom:** Long notes (>1000 words) about multiple topics don't surface in semantic search for specific subtopics. A note about "React, Python, and Docker" only matches queries about all three, not individual topics.

**Cause:** Embedding entire note as single vector averages out semantic meaning. Long documents with multiple topics produce "muddy" embeddings that don't match specific queries well.

**Why This Happens:**
- Simplistic "one note = one embedding" assumption
- Not understanding that embedding models have context windows and semantic dilution
- Treating all notes uniformly regardless of length

**Warning Signs:**
- Short notes appear in semantic search more often than long notes
- Long comprehensive notes never show up as "related"
- Users complain that detailed notes are "invisible" to AI features
- Similarity scores for long notes cluster around 0.5-0.6 (mediocre matches)

**Prevention:**
1. **Implement semantic chunking for long notes**
   - Split notes >500 words into semantic chunks
   - Use markdown headers as natural boundaries
   - Each chunk gets its own embedding, linked to parent note

2. **Chunk schema design**
   ```sql
   CREATE TABLE embeddings (
     id TEXT PRIMARY KEY,
     noteId TEXT NOT NULL,         -- Parent note
     chunkIndex INTEGER DEFAULT 0,  -- 0 = whole note, 1+ = chunks
     chunkContent TEXT,             -- The chunked text (for retrieval)
     embedding BLOB NOT NULL,
     contentHash TEXT NOT NULL,
     FOREIGN KEY (noteId) REFERENCES notes_index(id)
   )
   ```

3. **Smart chunking algorithm**
   - For notes <500 words: single embedding (chunkIndex=0)
   - For notes >500 words:
     - Split on markdown headers (## or ###)
     - If no headers, split on paragraph boundaries
     - Aim for 200-400 word chunks with slight overlap
   - Always include note title in each chunk embedding

4. **Aggregation strategy for retrieval**
   - When querying, return note if ANY chunk matches
   - Show matching chunk snippet in results
   - Rank by best chunk match, not average

**Chunking Example:**
```typescript
async chunkAndEmbed(noteId: string, content: string, title: string) {
  if (content.length < 2000) {
    // Short note: single embedding
    return [await embedWithTitle(title, content)];
  }

  const chunks = splitOnHeaders(content);
  return Promise.all(
    chunks.map((chunk, idx) =>
      embedWithTitle(title, chunk, idx + 1)
    )
  );
}
```

**Phase to Address:** Phase 2 (Enhanced Embeddings) - Start with simple whole-note, add chunking after basic system works

---

### Pitfall 4: Cold Start Performance Hell

**Symptom:** First embedding request takes 5-10 seconds. Ollama needs to load model into memory. User opens app, creates note, waits forever for "related notes" to appear.

**Cause:** Ollama lazy-loads models on first use. When app starts, no model in memory. First embedding request triggers model download/loading, which is slow.

**Why This Happens:**
- Not understanding Ollama's model lifecycle
- Not pre-warming model on app startup
- No model keepalive configuration

**Warning Signs:**
- First API call to Ollama takes >5s, subsequent calls <200ms
- After app idle for 30min, next embedding slow again
- Worker service appears "stuck" on first job after restart
- CPU spike on first embedding, then quiet

**Prevention:**
1. **Pre-warm model on app startup**
   ```typescript
   // In worker service initialization
   async warmupEmbeddingModel() {
     await ollama.embeddings({
       model: 'nomic-embed-text',
       prompt: 'warmup'
     });
   }
   ```

2. **Configure Ollama keepalive**
   - Set environment variable `OLLAMA_KEEP_ALIVE=30m`
   - Or pass in API call: `keep_alive: "30m"`
   - Prevents model unload during normal usage

3. **Show loading states in UI**
   - "Loading AI model..." on first app start
   - Progress indicator during initial bulk embedding
   - Don't hide latency, communicate it

4. **Optimize model choice**
   - Use smaller embedding model for faster loading
   - `nomic-embed-text` (274MB) vs larger alternatives
   - Accept slightly lower quality for better UX

5. **Background bulk embedding strategy**
   - On app start, count notes without embeddings
   - If >10 notes missing embeddings, show "Indexing X notes..."
   - Process in batches with progress tracking
   - Don't block UI on bulk operations

**Phase to Address:** Phase 1 (Foundation) - Handle in initial worker setup

---

### Pitfall 5: SQLite Vector Extension Choice Lock-In

**Symptom:** Choosing wrong vector extension leads to performance problems, migration pain, or missing features later. Switching extensions requires re-embedding entire corpus.

**Cause:** Multiple SQLite vector extensions exist with different tradeoffs:
- `sqlite-vss` (old, deprecated)
- `sqlite-vec` (new, maintained, but basic)
- `pgvector` (PostgreSQL only)

**Why This Happens:**
- Not researching extension maturity and roadmap
- Choosing first Google result without comparison
- Not testing with realistic corpus size

**Warning Signs:**
- Extension documentation last updated >1 year ago
- GitHub issues piling up without maintainer response
- Performance degradation as corpus grows >1000 notes
- Missing features needed for filtering (e.g., can't combine vector search with tag filter)

**Prevention:**
1. **Choose sqlite-vec (as of 2026)**
   - Actively maintained by Alex Garcia
   - Better performance than sqlite-vss
   - Supports multiple distance metrics (cosine, L2, inner product)
   - Good TypeScript/Node.js bindings

2. **Design abstraction layer**
   ```typescript
   interface VectorStore {
     insert(id: string, embedding: number[]): Promise<void>;
     search(query: number[], limit: number): Promise<Match[]>;
     delete(id: string): Promise<void>;
   }
   ```
   - Makes switching extensions less painful
   - Allows testing multiple implementations
   - Isolates vector logic from business logic

3. **Test with realistic corpus**
   - Before committing, test with 1000+ notes
   - Measure query latency at scale
   - Check memory usage during bulk insert
   - Verify filtered search performance (vector + WHERE clause)

4. **Plan migration path**
   - Store embeddings as JSON or binary blob
   - Keep export/import functions
   - Version embedding table schema
   - Document re-embedding process

**Current Recommendation (2026):**
- **Use**: `sqlite-vec` via better-sqlite3 extension
- **Avoid**: `sqlite-vss` (less maintained)
- **Monitor**: GitHub releases and community adoption

**Phase to Address:** Phase 1 (Foundation) - Must choose before schema creation

---

### Pitfall 6: Similarity Threshold Tuning is Manual and Fragile

**Symptom:** "Related notes" shows either too many irrelevant notes or too few relevant ones. Threshold of 0.7 seems arbitrary. What's "similar enough"?

**Cause:** Cosine similarity thresholds are corpus-dependent and subjective. No single threshold works for all use cases. Thresholds that work for 100 notes break with 1000 notes.

**Why This Happens:**
- Hardcoding similarity threshold (e.g., `WHERE similarity > 0.7`)
- Not providing user control over sensitivity
- Assuming linear relationship between score and relevance
- Not accounting for corpus density changes

**Warning Signs:**
- User feedback: "related notes are useless"
- Some notes show 0 related notes, others show 50
- Threshold needs frequent manual adjustment
- Different users want different sensitivity

**Prevention:**
1. **Make threshold user-configurable**
   ```typescript
   interface SemanticSettings {
     similarityThreshold: number;  // 0.0 - 1.0
     maxRelatedNotes: number;      // 1 - 20
     minRelatedNotes: number;      // 0 - 5
   }
   ```

2. **Use adaptive thresholds**
   - Don't filter by absolute threshold
   - Instead: return top-k results, show score
   - Let user decide what's relevant
   - Provide "more/fewer" controls in UI

3. **Implement score bucketing**
   ```typescript
   function categorizeMatch(score: number) {
     if (score > 0.85) return 'highly-related';
     if (score > 0.70) return 'related';
     if (score > 0.55) return 'possibly-related';
     return 'weakly-related';
   }
   ```
   - Show visual indicators (star ratings, color coding)
   - Allow filtering by category
   - More intuitive than raw scores

4. **Provide threshold calibration UI**
   - Show distribution of similarity scores for current note
   - Let user drag slider and see results update
   - Remember per-user preference
   - Provide presets: "strict", "balanced", "exploratory"

5. **Log and analyze threshold effectiveness**
   - Track which related notes users click
   - Measure click-through rate by score band
   - Auto-suggest threshold based on usage patterns

**Phase to Address:** Phase 3 (UI Refinement) - Start with fixed threshold, add controls after user feedback

---

### Pitfall 7: Ignoring Incremental Update Performance

**Symptom:** Updating a single note triggers re-embedding of multiple notes. Cascading updates slow down the system. Link suggestion feature causes embedding regeneration loops.

**Cause:** Not designing for incremental updates. Features that modify notes (like link suggestions) trigger embedding regeneration, which triggers more link suggestions, creating loops.

**Why This Happens:**
- Save hook triggers embedding job on ANY save
- Link suggestion modifies note frontmatter (adds suggestions)
- Modified note re-triggers save hook
- Infinite loop or cascading updates

**Warning Signs:**
- Queue fills up with duplicate jobs for same note
- CPU constantly busy with embedding generation
- Worker processes note multiple times in sequence
- Database lock contention on embeddings table

**Prevention:**
1. **Differentiate content changes from metadata changes**
   ```typescript
   async onNoteSaved(noteId: string, change: Change) {
     if (change.type === 'content') {
       // Re-embed
       queueService.enqueue({ type: 'embedding', noteId });
     } else if (change.type === 'metadata') {
       // Don't re-embed, just update index
       indexerService.syncNote(noteId);
     }
   }
   ```

2. **Debounce embedding jobs**
   ```typescript
   class EmbeddingQueue {
     private pending = new Map<string, NodeJS.Timeout>();

     enqueueWithDebounce(noteId: string, delayMs = 5000) {
       const existing = this.pending.get(noteId);
       if (existing) clearTimeout(existing);

       this.pending.set(noteId, setTimeout(() => {
         this.actuallyEnqueue(noteId);
         this.pending.delete(noteId);
       }, delayMs));
     }
   }
   ```

3. **Prevent modification loops**
   - Link suggestions write to separate field (don't trigger save)
   - Or: add `skipHooks: true` flag to programmatic saves
   - Track "source" of save (user vs system)

4. **Batch related updates**
   - If note A updated, and it's similar to notes B, C, D
   - Don't immediately update all bidirectional links
   - Instead: mark them as "stale" and update in batch job

5. **Implement change detection at hash level**
   ```typescript
   async shouldReembed(noteId: string, newContent: string): boolean {
     const embedding = await getEmbedding(noteId);
     if (!embedding) return true;

     const newHash = hash(normalizeContent(newContent));
     return embedding.contentHash !== newHash;
   }
   ```

**Phase to Address:** Phase 1 (Foundation) - Build debouncing into initial queue design

---

### Pitfall 8: No Monitoring or Observability

**Symptom:** Embedding queue has 1000+ failed jobs. Users report "semantic search doesn't work" but no visibility into why. Silent failures accumulate.

**Cause:** No metrics, logging, or health checks for embedding pipeline. Treating embeddings as "fire and forget" without monitoring success rates.

**Why This Happens:**
- Focus on happy path (embeddings work)
- No alerting when Ollama service down
- Queue failures not surfaced to user or developer
- No tracking of embedding coverage (% of notes embedded)

**Warning Signs:**
- User reports features not working, but no errors in logs
- Queue table grows unbounded with failed jobs
- Ollama connection errors not noticed for days
- No idea what % of notes have embeddings

**Prevention:**
1. **Add embedding health metrics**
   ```typescript
   interface EmbeddingMetrics {
     totalNotes: number;
     embeddedNotes: number;
     pendingJobs: number;
     failedJobs: number;
     avgEmbeddingTime: number;
     lastSuccessfulEmbedding: Date;
     ollamaHealthy: boolean;
   }
   ```

2. **Surface metrics in UI**
   - Settings page: "Indexing: 847/1000 notes (84%)"
   - Show failed job count with "retry" button
   - Display last successful embedding time
   - Warning if Ollama unreachable

3. **Implement background health checks**
   ```typescript
   setInterval(async () => {
     try {
       await ollama.embeddings({ model: 'nomic-embed-text', prompt: 'health' });
       metrics.ollamaHealthy = true;
     } catch {
       metrics.ollamaHealthy = false;
       notifyUser('AI features unavailable - Ollama not responding');
     }
   }, 60000);
   ```

4. **Add structured logging**
   ```typescript
   logger.info('embedding_generated', {
     noteId,
     duration: endTime - startTime,
     contentLength: content.length,
     modelVersion: 'nomic-embed-text-v1'
   });
   ```

5. **Provide self-healing mechanisms**
   - Auto-retry failed jobs (with exponential backoff)
   - Periodic "sync check" to find notes without embeddings
   - Button to "re-index all notes" for recovery

**Phase to Address:** Phase 2 (Robustness) - Add after basic feature works

---

## Integration Checklist

Before implementing semantic intelligence features, verify these integration points with existing notetAIker system:

### Storage Layer
- [ ] Embeddings stored in separate table (not in notes_index)
- [ ] Embedding table has foreign key to notes_index(id)
- [ ] Content hash stored with each embedding for staleness detection
- [ ] Schema supports chunking (chunkIndex field)
- [ ] Model version tracked for each embedding

### Queue System
- [ ] Extend existing QueueService with embedding job type
- [ ] Debouncing implemented for rapid note edits
- [ ] Job deduplication prevents duplicate embedding jobs
- [ ] Failed jobs can be retried with exponential backoff
- [ ] Queue size limits to prevent unbounded growth

### Worker Service
- [ ] Ollama model pre-warmed on worker startup
- [ ] Keepalive configured to prevent model unloading
- [ ] Graceful handling of Ollama connection failures
- [ ] Batch processing for bulk re-embedding
- [ ] Progress tracking for long-running operations

### Save Path
- [ ] Note save NEVER blocks on embedding generation
- [ ] Embedding job enqueued AFTER filesystem write succeeds
- [ ] Content hash computed and compared before embedding
- [ ] Metadata-only changes don't trigger re-embedding
- [ ] System saves (link suggestions) don't trigger embedding loops

### UI/UX
- [ ] Loading states for "embeddings pending"
- [ ] Progress indicator during bulk re-indexing
- [ ] Settings page shows embedding coverage metrics
- [ ] Retry button for failed embedding jobs
- [ ] Similarity threshold configurable by user

### Error Handling
- [ ] Ollama unavailable doesn't break note saving
- [ ] Failed embeddings don't prevent note access
- [ ] Health check endpoint for Ollama connectivity
- [ ] Graceful degradation (features disabled if embeddings unavailable)
- [ ] Clear error messages surfaced to user

### Performance
- [ ] Embedding generation is async (uses queue)
- [ ] Vector search queries optimized (proper indexes)
- [ ] Chunking only applied to notes >500 words
- [ ] Maximum chunk size enforced (prevents huge embeddings)
- [ ] Similarity search limited to top-k results (no full scan)

---

## Phase Mapping

| Pitfall | Prevention Phase | Why |
|---------|------------------|-----|
| **1. Blocking Note Save** | Phase 1: Foundation | Architecture decision - must be async from start |
| **2. Stale Embeddings** | Phase 1: Foundation | Schema design - add content hash upfront |
| **3. Full-Note Embedding** | Phase 2: Enhanced Embeddings | Can start simple, add chunking after validation |
| **4. Cold Start Performance** | Phase 1: Foundation | Worker initialization - pre-warm model |
| **5. Vector Extension Choice** | Phase 1: Foundation | Schema and dependencies - hard to change later |
| **6. Similarity Threshold** | Phase 3: UI Refinement | User control - add after basic feature validated |
| **7. Incremental Update Performance** | Phase 1: Foundation | Queue design - debouncing and deduplication |
| **8. No Monitoring** | Phase 2: Robustness | Observability - add after core feature works |

---

## Anti-Patterns to Avoid

### 1. "Embeddings are Metadata"
**Wrong:** Storing embeddings in note frontmatter or as part of note file
**Right:** Embeddings are indexes - store in separate database table
**Why:** Embeddings are 384-1536 floats (KB of data), version-dependent, and regenerable

### 2. "Semantic Search Replaces Full-Text Search"
**Wrong:** Removing traditional search, only offering semantic search
**Right:** Offer both - semantic for exploration, full-text for precision
**Why:** Users want exact match for known terms (e.g., filename, code snippet)

### 3. "One Model Forever"
**Wrong:** Hardcoding model name, no versioning
**Right:** Track model version, plan for model upgrades
**Why:** Embedding models improve - Nomic v1.5 may be incompatible with v1.0

### 4. "Similarity Score is Relevance"
**Wrong:** Assuming 0.8 similarity = 80% relevant
**Right:** Scores are relative - what matters is ranking
**Why:** Scores depend on corpus, model, and chunking strategy

### 5. "More Features = Better"
**Wrong:** Adding link suggestions, clustering, graph view, semantic search all at once
**Right:** Start with basic semantic search, validate, then add features
**Why:** Each feature multiplies complexity - get one working first

---

## Recommended Phase Structure

Based on pitfall analysis, recommended implementation order:

### Phase 1: Embedding Foundation (Address Pitfalls 1, 2, 4, 5, 7)
**Goal:** Non-blocking embedding generation with proper invalidation

1. Choose vector extension (sqlite-vec)
2. Design embedding schema (with contentHash, modelVersion)
3. Extend QueueService with embedding jobs
4. Implement async embedding worker
5. Add model pre-warming on startup
6. Build content hash-based invalidation
7. Add debouncing to prevent cascading updates

**Success Criteria:**
- Note saves remain <50ms (never block on embeddings)
- Embeddings regenerated only when content changes
- Failed embeddings don't break note saving

### Phase 2: Basic Semantic Search (Validate Core Feature)
**Goal:** Prove value of semantic intelligence before advanced features

1. Implement basic vector search (top-k similar notes)
2. Add "Related Notes" panel in UI
3. Show embedding coverage metrics
4. Add health monitoring and error handling
5. Implement retry mechanism for failed jobs

**Success Criteria:**
- Users can find related notes semantically
- Embeddings kept in sync with note edits
- Clear feedback when embeddings unavailable

### Phase 3: Enhanced Features (Address Pitfalls 3, 6)
**Goal:** Improve quality and user control

1. Add semantic chunking for long notes
2. Implement user-configurable similarity threshold
3. Add score visualization (categories, not raw numbers)
4. Improve ranking algorithm
5. Add semantic search (query → embedding → similar notes)

**Success Criteria:**
- Long notes surface in semantic search
- Users can tune sensitivity to preference
- Search quality subjectively "good"

### Phase 4: Advanced Features (Link Suggestions, Clustering)
**Goal:** Build on proven foundation

1. Link suggestions on save
2. Semantic graph clustering
3. Automatic tag suggestions based on similar notes

**Success Criteria:**
- Link suggestions don't create loops
- Graph view performs well with 1000+ notes

---

## Research Confidence Assessment

| Area | Confidence | Evidence |
|------|-----------|----------|
| **Async Architecture** | HIGH | Analyzed existing QueueService/WorkerService code - proven pattern |
| **Ollama Performance** | MEDIUM | Based on domain knowledge - actual latency varies by model/hardware |
| **SQLite Vector Extensions** | MEDIUM | Web research on sqlite-vec vs sqlite-vss - evolving landscape |
| **Embedding Staleness** | HIGH | Common problem in all vector DB systems - well-understood pattern |
| **Chunking Strategy** | MEDIUM | Based on best practices - optimal chunk size varies by domain |
| **Similarity Thresholds** | HIGH | Universal problem in semantic search - no perfect threshold exists |
| **Integration Patterns** | HIGH | Analyzed codebase architecture - specific to notetAIker constraints |

---

## Sources

Research informed by:

- **Codebase Analysis:**
  - `/home/ubuntu/projects/notetaiker/apps/api/src/services/queue.service.ts` - Existing async job queue pattern
  - `/home/ubuntu/projects/notetaiker/apps/api/src/services/indexer.service.ts` - Current indexing architecture
  - `/home/ubuntu/projects/notetaiker/apps/api/src/services/worker.service.ts` - Background worker pattern

- **Domain Knowledge:**
  - Vector database best practices (embedding versioning, cache invalidation)
  - Ollama architecture and performance characteristics
  - Semantic search threshold tuning patterns
  - Local-first application constraints

- **Web Research:**
  - SQLite vector extension comparisons (sqlite-vec vs sqlite-vss)
  - Embedding model performance benchmarks
  - Semantic chunking strategies for markdown documents
  - Similarity threshold calibration approaches

**Note:** Web search results from 2026 queries did not return detailed results, so recommendations are based primarily on codebase analysis and domain expertise. Specific implementation details for sqlite-vec and Ollama performance should be verified against official documentation during Phase 1 implementation.

---

## Next Steps for Roadmap Creation

This pitfall research should inform:

1. **Phase ordering:** Foundation → Validation → Enhancement (not all at once)
2. **Architecture decisions:** Async embeddings, content hash tracking, vector extension choice
3. **Risk mitigation:** Address critical pitfalls (1, 2, 4, 5, 7) in Phase 1
4. **Success metrics:** Define what "working" means before building advanced features
5. **User experience:** Plan for eventual consistency, loading states, failure modes

**Key insight:** The biggest risk is adding semantic features that make note-taking SLOWER. Prevention: never block the save path, always show progress, gracefully degrade when embeddings unavailable.
