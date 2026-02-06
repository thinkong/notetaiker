# Requirements: v1.7 Graph Interactions

**Goal:** Transform the static graph view into an interactive workspace for organizing thoughts.

**Scope:** Interactive Nodes, Drag & Drop, Cluster Management, Filtering.

## v1 Requirements

### Navigation
- [ ] **NAV-01**: User can click a node to highlight connections and double-click to navigate to the note.
- [ ] **NAV-02**: User sees a tooltip with the note title and brief excerpt when hovering over a node.
- [ ] **NAV-03**: User can zoom and pan the graph canvas smoothly using mouse/trackpad controls.

### Filtering
- [ ] **FILT-01**: User can filter visible nodes by selecting specific tags.
- [ ] **FILT-02**: User can toggle "Local Graph" mode to show only the active note and its immediate neighbors (1-2 hops).

### Interaction
- [ ] **INTER-01**: User can drag a node from the graph into the editor to insert a wikilink (`[[Note Name]]`).
- [ ] **INTER-02**: User can manually drag a node to a specific position and "pin" it there (persistence).

### Intelligence
- [ ] **SMART-01**: User can enable "Semantic Coloring" to visualize clusters based on embedding similarity.
- [ ] **SMART-02**: User can filter the graph to show only nodes semantically similar to the active note.

## Out of Scope

| Feature | Reason |
|---------|--------|
| 3D Graph View | Hard to control, obscures nodes, lower utility for organization. |
| Global Layout Auto-save | Saving the position of *every* node in a 1000-node physics sim is noisy; manual pinning is preferred. |
| Lasso Selection | High complexity for v1; focus on single-node interaction first. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | - | Pending |
| NAV-02 | - | Pending |
| NAV-03 | - | Pending |
| FILT-01 | - | Pending |
| FILT-02 | - | Pending |
| INTER-01 | - | Pending |
| INTER-02 | - | Pending |
| SMART-01 | - | Pending |
| SMART-02 | - | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 0
- Unmapped: 9 ⚠️
