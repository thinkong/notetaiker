# Phase 24: Semantic Graph Intelligence - Context

**Gathered:** 2026-02-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Leverage existing vector embeddings (from Phase 19) to reveal conceptual relationships visually in the graph view. Users can enable semantic coloring to see nodes grouped by topic clusters, and filter the graph to show only nodes semantically similar to the active note.

</domain>

<decisions>
## Implementation Decisions

### Clustering Logic

- **Algorithm**: Density-based clustering (DBSCAN) for natural cluster formation without specifying cluster count upfront
- **Cluster count**: Fixed maximum of 6-8 distinct clusters/colors for visual clarity
- **Threshold approach**: Soft clustering - nodes can have blended colors based on membership in multiple topic areas (no hard similarity threshold)
- **Cluster labels**: Auto-generated from common keywords in note titles within each cluster

### Visual Presentation

- **Color palette**: Distinct vivid hues for clear differentiation between clusters
- **Node styling**: Colored fill with glow effect to indicate cluster membership
- **Legend placement**: Collapsible sidebar panel (similar to existing filter panel pattern)
- **Accessibility**: High contrast mode toggle for color blindness support

### Filtering Behavior

- **Trigger**: Manual toggle button in the graph toolbar (not automatic)
- **Threshold**: Adaptive similarity cutoff based on data distribution (not fixed or user-adjustable)
- **Dissimilar nodes**: Ghost/fade out to 15% opacity (consistent with existing tag filtering behavior)
- **Tag filter interaction**: Independent toggles - both semantic and tag filters can be active simultaneously (AND logic)

### Performance & Controls

- **Computation timing**: Pre-computed when embeddings change (not real-time on every load)
- **Computation location**: Backend/API server (client fetches pre-computed clusters)
- **Feature toggle**: Global toggle in graph toolbar for all semantic features
- **Large graph handling**: Show all nodes with rendering optimizations (no sampling or zoom requirements)

### Claude's Discretion

- Exact clustering algorithm parameters (epsilon, minPoints for DBSCAN)
- Specific color palette selection (which 6-8 vivid hues)
- Glow effect intensity and animation
- API endpoint design for cluster data
- Caching strategy for pre-computed clusters
- Rendering optimization techniques for large graphs

</decisions>

<specifics>
## Specific Ideas

- Consistency with existing Phase 22 tag filtering: Ghosted nodes at 15% opacity, independent filter toggles
- Soft clustering allows nodes at intersection of multiple topics to visually represent that overlap
- Collapsible sidebar pattern from GraphToolbar/GraphFilterChips (Phase 22) should be reused
- Backend computation leverages existing embeddings infrastructure from Phase 19

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 24-semantic-graph-intelligence_
_Context gathered: 2026-02-08_
