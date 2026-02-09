# Requirements: v1.7 Graph Interactions

**Goal:** Transform the static graph view into an interactive workspace for organizing thoughts.

**Scope:** Interactive Nodes, Drag & Drop, Cluster Management, Filtering.

## v1 Requirements

### Navigation

- [x] **NAV-01**: User can click a node to highlight connections and double-click to navigate to the note.
- [x] **NAV-02**: User sees a tooltip with the note title and brief excerpt when hovering over a node.
- [x] **NAV-03**: User can zoom and pan the graph canvas smoothly using mouse/trackpad controls.

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

| Feature                 | Reason                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| 3D Graph View           | Hard to control, obscures nodes, lower utility for organization.                                      |
| Global Layout Auto-save | Saving the position of _every_ node in a 1000-node physics sim is noisy; manual pinning is preferred. |
| Lasso Selection         | High complexity for v1; focus on single-node interaction first.                                       |

## Traceability

| Requirement | Phase    | Status  |
| ----------- | -------- | ------- |
| NAV-01      | Phase 21 | Complete |
| NAV-02      | Phase 21 | Complete |
| NAV-03      | Phase 21 | Complete |
| FILT-01     | Phase 22 | Complete |
| FILT-02     | Phase 22 | Complete |
| INTER-01    | Phase 23 | Pending |
| INTER-02    | Phase 23 | Pending |
| SMART-01    | Phase 24 | Pending |
| SMART-02    | Phase 24 | Pending |

**Coverage:**

- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓
