# Phase 20: Related Notes Feature

**Goal**: Users can discover semantically related notes while viewing or editing a note.

## User Story
As a user, I want to see notes related to the one I'm working on so I can make connections and rediscover relevant information without manual searching.

## Dependencies
- **Phase 19 (Complete)**: `EmbeddingsService` and `sqlite-vec` infrastructure are in place.
- **Ollama**: Requires `nomic-embed-text` model to be available for generating embeddings (handled in Phase 19).

## Technical Approach

### Backend
- **Endpoint**: `GET /api/notes/:id/related`
- **Logic**:
  1. Fetch the embedding vector for the note with `:id` from the `vec_notes` table.
  2. If no embedding exists, return an empty list or a "not yet indexed" status (since indexing is async).
  3. Perform a KNN search using `sqlite-vec`'s `MATCH` syntax to find the nearest neighbors.
  4. Exclude the current note ID from results.
  5. Join with `notes_index` to return enriched metadata (title, tags, etc.).
  6. Return the top 5-10 results with their similarity distances.

### Frontend
- **Component**: `RelatedNotesPanel`
- **Location**: Added to the right sidebar (within `Sidebar.tsx`).
- **Data Fetching**:
  - Use TanStack Query (`useQuery`) to fetch data from the new endpoint.
  - Implement a debounce mechanism to avoid rapid refetching while the user is actively typing (only refetching when the note is "settled").
- **UI/UX**:
  - Display a list of related note cards.
  - Visual similarity indicator: Use labels like "Highly Related" or "Related" (or color/progress bars) instead of raw cosine distance.
  - Navigation: Clicking a related note should navigate to it immediately.

## Step-by-Step Implementation Plan

### Plan 20-01: Backend API
- **Objective**: Expose semantic similarity search via a Hono route.
- **Tasks**:
  1. Add `getEmbedding(noteId)` to `EmbeddingsService`.
  2. Implement `GET /api/notes/:id/related` in `notes.ts` route.
  3. Update `findSimilar` to optionally exclude a specific note ID.
- **Success Criteria**: `curl` request for a note ID returns a JSON list of semantically similar notes.

### Plan 20-02: Related Notes UI
- **Objective**: Create the sidebar panel and integrate with the backend.
- **Tasks**:
  1. Create `RelatedNotesPanel.tsx` component.
  2. Integrate the panel into the sidebar UI.
  3. Implement the `useRelatedNotes` hook using TanStack Query.
- **Success Criteria**: Sidebar shows related notes when a note is opened.

### Plan 20-03: UX Polish & Navigation
- **Objective**: Refine the visual representation and navigation flow.
- **Tasks**:
  1. Add visual similarity labels/indicators.
  2. Ensure smooth navigation between notes from the related list.
  3. Add empty/loading states and "not yet indexed" messaging.
- **Success Criteria**: Users can fluidly navigate through semantic connections with clear visual feedback.
