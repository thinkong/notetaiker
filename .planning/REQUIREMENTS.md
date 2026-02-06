# Requirements: v1.6 Smart Connections (Core)

**Goal:** Establish the semantic intelligence foundation for NoteTaiker and ship the first user-facing feature: automatic discovery of related notes.

**Scope:** Core Only (Embeddings Infrastructure + Related Notes Panel).
**Defer:** Semantic Search, Graph Clustering, Link Suggestions.

## functional

- **EMBED-01**: System must store vector embeddings for all notes in a local SQLite database using `sqlite-vec`.
- **EMBED-02**: System must automatically generate embeddings for new or modified notes using a local LLM (Ollama `nomic-embed-text`).
- **EMBED-03**: Embedding generation must happen asynchronously in a background queue to prevent blocking the UI or save operations.
- **EMBED-04**: System must detect when a note's content has changed significantly enough to require re-embedding (hash check).
- **RELATED-01**: User can view a "Related Notes" panel in the sidebar while viewing or editing a note.
- **RELATED-02**: Panel must display the top 5-10 semantically similar notes based on vector cosine similarity.
- **RELATED-03**: Panel must update automatically when the current note context changes (debounced).
- **RELATED-04**: Clicking a related note must navigate to that note.
- **SETTINGS-01**: User can trigger a "Rebuild Index" operation to generate embeddings for all notes from scratch.

## non-functional

- **PERF-01**: Editor typing latency must remain under 16ms (60fps); embedding generation must never run on the main thread.
- **PERF-02**: Related notes query must return in <200ms once embeddings are generated.
- **PRIVACY-01**: All embeddings must be generated and stored locally; no note content sent to cloud APIs by default.
- **UX-01**: Related notes should not show the current note itself.
- **UX-02**: Similarity scores should be visualized intuitively (e.g., progress bar or "High/Medium" label), not raw float values.

## out-of-scope (Deferred to v1.7)

- Semantic Search (finding notes by meaning query)
- Graph Clustering (visualizing semantic clusters)
- Link Suggestions (proposing wiki-links on save)
- Inline AI suggestions
- Cloud-based embeddings (OpenAI/Anthropic)

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| EMBED-01 | Phase 19 | Planned |
| EMBED-02 | Phase 19 | Planned |
| EMBED-03 | Phase 19 | Planned |
| EMBED-04 | Phase 19 | Planned |
| SETTINGS-01 | Phase 19 | Planned |
| RELATED-01 | Phase 20 | Planned |
| RELATED-02 | Phase 20 | Planned |
| RELATED-03 | Phase 20 | Planned |
| RELATED-04 | Phase 20 | Planned |
| PERF-01 | Phase 19 | Planned |
| PERF-02 | Phase 20 | Planned |
| PRIVACY-01 | Phase 19 | Planned |
| UX-01 | Phase 20 | Planned |
| UX-02 | Phase 20 | Planned |

**Coverage**: 14/14 requirements mapped (100%)
