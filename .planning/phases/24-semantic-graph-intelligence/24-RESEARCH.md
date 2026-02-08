# Phase 24: Semantic Graph Intelligence - Research

**Researched:** 2026-02-08
**Domain:** Vector clustering, soft clustering visualization, color generation, API design for pre-computed data
**Confidence:** HIGH

## Summary

Phase 24 implements semantic clustering visualization for the note graph using DBSCAN density-based clustering on existing vector embeddings. The key technical challenges involve:

1. **DBSCAN on high-dimensional embeddings** - Using cosine similarity as the distance metric, with epsilon selection based on the typical similarity distribution of semantic embeddings (0.7-0.95 range for related content)

2. **Soft clustering visualization** - Implementing blended colors for nodes that belong to multiple clusters, using weighted RGB mixing based on membership scores

3. **Color generation** - Selecting 6-8 vivid, distinct colors that are accessible for colorblind users (avoiding red-green combinations, using blue-orange as the primary contrast pair)

4. **Performance optimization** - Pre-computing clusters server-side, using react-force-graph's Canvas API for efficient rendering with glow effects via radial gradients

5. **API design** - Following the existing Hono route patterns with service injection, caching cluster results with the embeddings service lifecycle

**Primary recommendation:** Use a custom TypeScript DBSCAN implementation with cosine similarity, pre-compute clusters when embeddings change, blend colors using weighted RGB mixing for soft clustering, and leverage existing react-force-graph Canvas rendering patterns with radial gradients for glow effects.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Algorithm**: Density-based clustering (DBSCAN) for natural cluster formation without specifying cluster count upfront
- **Cluster count**: Fixed maximum of 6-8 distinct clusters/colors for visual clarity
- **Threshold approach**: Soft clustering - nodes can have blended colors based on membership in multiple topic areas (no hard similarity threshold)
- **Cluster labels**: Auto-generated from common keywords in note titles within each cluster
- **Color palette**: Distinct vivid hues for clear differentiation between clusters
- **Node styling**: Colored fill with glow effect to indicate cluster membership
- **Legend placement**: Collapsible sidebar panel (similar to existing filter panel pattern)
- **Accessibility**: High contrast mode toggle for color blindness support
- **Trigger**: Manual toggle button in the graph toolbar (not automatic)
- **Threshold**: Adaptive similarity cutoff based on data distribution (not fixed or user-adjustable)
- **Dissimilar nodes**: Ghost/fade out to 15% opacity (consistent with existing tag filtering behavior)
- **Tag filter interaction**: Independent toggles - both semantic and tag filters can be active simultaneously (AND logic)
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

## Standard Stack

### Core

| Library       | Version                     | Purpose                                | Why Standard                                                                                                                                             |
| ------------- | --------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom DBSCAN | N/A (custom implementation) | Density-based clustering on embeddings | No mature TypeScript DBSCAN library with cosine similarity support; custom implementation gives full control over epsilon and soft clustering extensions |
| Canvas 2D API | Built-in                    | Node rendering with glow effects       | react-force-graph 2D uses Canvas, allowing custom paint functions with radial gradients for glow                                                         |

### Supporting

| Library                                      | Version | Purpose                              | When to Use                                                   |
| -------------------------------------------- | ------- | ------------------------------------ | ------------------------------------------------------------- |
| `cos-similarity` or `fast-cosine-similarity` | ^1.2.0  | Cosine similarity calculation        | Pre-built, optimized cosine similarity for vector comparisons |
| `chroma-js`                                  | ^3.0.0  | Color manipulation and interpolation | Blending cluster colors for soft clustering visualization     |

### Installation

```bash
# For cosine similarity (option 1 - fastest)
npm install cos-similarity

# OR option 2 (also fast, slightly different API)
npm install fast-cosine-similarity

# For color blending
npm install chroma-js
npm install --save-dev @types/chroma-js
```

### Alternatives Considered

| Instead of          | Could Use               | Tradeoff                                                                                                     |
| ------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| Custom DBSCAN       | `dbscanjs` or `sdbscan` | These libraries don't support custom distance functions well; limited control for soft clustering extensions |
| Custom DBSCAN       | `hdbscan-ts`            | HDBSCAN is more complex, automatically determines epsilon; less control over exact cluster count (6-8)       |
| `chroma-js`         | Manual RGB blending     | chroma-js provides perceptually uniform blending in LAB space, better for color mixing                       |
| Canvas glow effects | CSS filters             | CSS filters don't work on Canvas-rendered content; must use Canvas gradients                                 |

## Architecture Patterns

### Recommended Project Structure

```
apps/api/src/
├── routes/
│   └── clusters.ts          # API endpoints for cluster data
├── services/
│   ├── embeddings.service.ts # Existing - add cluster computation
│   └── clusters.service.ts   # New - clustering logic
└── types/
    └── clusters.ts          # Cluster data types

apps/web/src/
├── components/graph/
│   ├── ForceGraph.tsx       # Modify - add cluster coloring
│   ├── GraphToolbar.tsx     # Modify - add semantic toggle
│   └── ClusterLegend.tsx    # New - collapsible cluster panel
├── hooks/
│   └── useClusters.ts       # New - fetch cluster data
└── contexts/
    └── GraphStateContext.tsx # Modify - add semantic filter state
```

### Pattern 1: Pre-computed Cluster Data with Cache Invalidation

**What:** Compute clusters server-side when embeddings change, store in memory with TTL, invalidate on embedding updates

**When to use:** When clustering is expensive (O(n²) for DBSCAN with naive neighbor search) and data changes infrequently

**Example:**

```typescript
// apps/api/src/services/clusters.service.ts
interface ClusterData {
  clusters: {
    id: number;
    label: string;
    color: string;
    nodeIds: string[];
    centroid: number[];
  }[];
  memberships: Map<string, number[]>; // nodeId -> cluster index weights
  noiseNodeIds: string[];
  computedAt: Date;
}

class ClustersService {
  private cache: ClusterData | null = null;
  private cacheVersion: number = 0;

  async getClusters(): Promise<ClusterData> {
    if (this.cache) {
      return this.cache;
    }
    return this.computeClusters();
  }

  async computeClusters(): Promise<ClusterData> {
    const embeddings = await this.embeddingsService.getAllEmbeddings();
    const clusters = this.runDBSCAN(embeddings);
    this.cache = clusters;
    this.cacheVersion++;
    return clusters;
  }

  invalidateCache(): void {
    this.cache = null;
  }
}
```

### Pattern 2: Soft Clustering with Membership Scores

**What:** For nodes near cluster boundaries, calculate membership scores to multiple clusters instead of hard assignment

**When to use:** When nodes conceptually belong to multiple topics (e.g., "JavaScript Testing" belongs to both "JavaScript" and "Testing" clusters)

**Example:**

```typescript
// Calculate soft membership for a node to all clusters
function calculateSoftMembership(
  embedding: number[],
  clusters: Cluster[],
  epsilon: number,
): number[] {
  return clusters.map((cluster) => {
    // Calculate similarity to cluster centroid
    const similarity = cosineSimilarity(embedding, cluster.centroid);
    // Convert to membership score (0-1) based on epsilon threshold
    // Higher similarity = higher membership
    return Math.max(0, (similarity - (1 - epsilon)) / epsilon);
  });
}

// Blend colors based on membership weights
function blendClusterColors(
  memberships: number[],
  clusterColors: string[],
): string {
  // Normalize weights to sum to 1
  const total = memberships.reduce((a, b) => a + b, 0);
  if (total === 0) return "#94a3b8"; // Default gray for noise

  const weights = memberships.map((m) => m / total);

  // Use chroma-js for perceptual blending
  let blended = chroma(clusterColors[0]).alpha(weights[0]);
  for (let i = 1; i < clusterColors.length; i++) {
    if (weights[i] > 0) {
      blended = blended.mix(clusterColors[i], weights[i]);
    }
  }
  return blended.hex();
}
```

### Pattern 3: Canvas Glow Effect via Radial Gradients

**What:** Use HTML5 Canvas createRadialGradient for node glow effects that are performant and visually distinct

**When to use:** When rendering 100-1000+ nodes with react-force-graph 2D

**Example (from existing codebase patterns):**

```typescript
// In paintNode callback (react-force-graph nodeCanvasObject)
const paintNode = (node, ctx, globalScale) => {
  const { x, y } = node;
  const r = 6; // Base radius

  // Draw glow effect
  if (node.clusterColors && node.clusterColors.length > 0) {
    ctx.beginPath();
    const glowRadius = r + 8;
    ctx.arc(x, y, glowRadius, 0, 2 * Math.PI);

    // Create radial gradient for glow
    const gradient = ctx.createRadialGradient(x, y, r, x, y, glowRadius);

    // Add colors from all clusters
    node.clusterColors.forEach((color, i) => {
      const weight = node.clusterWeights[i];
      // Inner: full color, outer: transparent
      gradient.addColorStop(
        0,
        chroma(color)
          .alpha(0.6 * weight)
          .css(),
      );
    });
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Draw node circle
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = node.color || "#94a3b8";
  ctx.fill();
};
```

### Anti-Patterns to Avoid

- **Computing clusters on every request:** DBSCAN on 1000+ embeddings with cosine similarity is O(n²) - cache results and invalidate only when embeddings change
- **Hard clustering only:** Nodes at cluster boundaries will arbitrarily flip colors; use soft clustering for smoother visual transitions
- **Pure RGB color mixing:** Perceptually, RGB mixing can produce muddy browns; use chroma-js in LAB color space for better blends
- **Real-time clustering in the browser:** Vector embeddings are high-dimensional (384+ dims), clustering computation will freeze the UI
- **Fixed epsilon for DBSCAN:** Different embedding models have different similarity distributions; use adaptive epsilon based on data

## Don't Hand-Roll

| Problem                       | Don't Build                                | Use Instead                                              | Why                                                                                |
| ----------------------------- | ------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Cosine similarity calculation | Manual dot product + magnitude calculation | `cos-similarity` or `fast-cosine-similarity` npm package | Already optimized, handles edge cases (zero vectors), type-safe                    |
| Color interpolation/blending  | Manual RGB math                            | `chroma-js`                                              | Perceptually uniform color spaces (LAB, LCH), proper alpha handling, battle-tested |
| DBSCAN parameter selection    | Fixed epsilon guess                        | K-distance graph analysis (elbow method)                 | Data-dependent epsilon selection prevents over/under-clustering                    |
| Text tokenization for labels  | Split by spaces                            | Simple regex word extraction with stopword removal       | Handles punctuation, case normalization, removes common words (the, and, etc.)     |

**Key insight:** The DBSCAN algorithm itself should be custom-implemented (it's ~100 lines of TypeScript) because existing libraries don't support soft clustering extensions and cosine similarity well. However, the mathematical primitives (cosine similarity, color blending) should use battle-tested libraries.

## Common Pitfalls

### Pitfall 1: Cosine Similarity vs Euclidean Distance for DBSCAN

**What goes wrong:** Using Euclidean distance on high-dimensional embeddings causes all points to appear equidistant (curse of dimensionality)

**Why it happens:** In 384-dimensional space, Euclidean distances tend to cluster around a narrow range, making epsilon selection impossible

**How to avoid:** Always use cosine similarity (angular distance) for semantic embeddings. Convert to distance: `distance = 1 - cosine_similarity`

**Warning signs:** All nodes classified as noise, or one giant cluster containing everything

### Pitfall 2: Too Many Clusters for Visual Clarity

**What goes wrong:** DBSCAN finds 15+ natural clusters, but the UI can only support 6-8 colors

**Why it happens:** Semantic data naturally fragments into many subtopics

**How to avoid:**

1. Run DBSCAN with epsilon that produces ~8-12 clusters
2. Merge smallest clusters into "Other" category
3. Or use hierarchical clustering to merge similar clusters

**Warning signs:** Legend overflows screen, colors become indistinguishable

### Pitfall 3: Soft Clustering Producing Gray/Muddy Colors

**What goes wrong:** Blending complementary colors (e.g., red + green) produces brownish/grayish results

**Why it happens:** RGB mixing of complementary colors neutralizes

**How to avoid:**

1. Use perceptually uniform color space (LAB) via chroma-js
2. Limit soft blending to 2-3 clusters max per node
3. Use vivid, saturated colors that blend to recognizable intermediates

**Warning signs:** Many nodes appear brown/gray instead of vibrant colors

### Pitfall 4: Canvas Performance with Many Nodes

**What goes wrong:** Frame rate drops to <30fps when rendering 500+ nodes with glow effects

**Why it happens:** Each glow effect requires gradient creation and multiple fill operations per frame

**How to avoid:**

1. Only render glow when semantic coloring is enabled
2. Use simpler visuals (solid color ring around node) instead of gradient glow for large graphs
3. Cache node color calculations (don't recompute blend every frame)

**Warning signs:** Janky animation, browser dev tools showing long paint times

### Pitfall 5: Cache Stale Cluster Data

**What goes wrong:** User adds new note but clustering doesn't update

**Why it happens:** Cluster cache isn't invalidated when embeddings change

**How to avoid:**

1. Hook into existing events service pattern (see embeddings.service.ts)
2. Increment a cluster version counter whenever embeddings are rebuilt
3. Include version in API response, client can detect staleness

**Warning signs:** New notes appear as noise (no color) while old notes retain cluster colors

## Code Examples

### DBSCAN Implementation with Cosine Similarity

```typescript
// apps/api/src/services/clusters.service.ts

interface Embedding {
  id: string;
  vector: number[];
  title: string;
}

interface DBSCANResult {
  labels: number[]; // -1 = noise, 0..n = cluster id
  clusters: number[][]; // Array of node indices per cluster
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Distance = 1 - similarity (so 0 = identical, 1 = orthogonal)
function cosineDistance(a: number[], b: number[]): number {
  return 1 - cosineSimilarity(a, b);
}

function regionQuery(
  embeddings: Embedding[],
  pointIdx: number,
  epsilon: number,
): number[] {
  const neighbors: number[] = [];
  const point = embeddings[pointIdx];

  for (let i = 0; i < embeddings.length; i++) {
    if (i === pointIdx) continue;
    const dist = cosineDistance(point.vector, embeddings[i].vector);
    if (dist <= epsilon) {
      neighbors.push(i);
    }
  }
  return neighbors;
}

export function dbscan(
  embeddings: Embedding[],
  epsilon: number,
  minPoints: number,
): DBSCANResult {
  const n = embeddings.length;
  const labels = new Array(n).fill(-2); // -2 = unvisited
  let clusterId = 0;
  const clusters: number[][] = [];

  for (let i = 0; i < n; i++) {
    if (labels[i] !== -2) continue; // Already processed

    const neighbors = regionQuery(embeddings, i, epsilon);

    if (neighbors.length < minPoints) {
      labels[i] = -1; // Mark as noise (temporarily)
      continue;
    }

    // Start new cluster
    clusters[clusterId] = [i];
    labels[i] = clusterId;

    // Expand cluster
    const seeds = [...neighbors];
    for (let j = 0; j < seeds.length; j++) {
      const currentIdx = seeds[j];

      if (labels[currentIdx] === -1) {
        // Change noise to border point
        labels[currentIdx] = clusterId;
        clusters[clusterId].push(currentIdx);
      }

      if (labels[currentIdx] !== -2) continue;

      labels[currentIdx] = clusterId;
      clusters[clusterId].push(currentIdx);

      const currentNeighbors = regionQuery(embeddings, currentIdx, epsilon);
      if (currentNeighbors.length >= minPoints) {
        seeds.push(...currentNeighbors);
      }
    }

    clusterId++;
  }

  return { labels, clusters };
}

// Adaptive epsilon selection based on k-distance graph
export function estimateEpsilon(
  embeddings: Embedding[],
  k: number = 4,
): number {
  const distances: number[] = [];

  for (let i = 0; i < embeddings.length; i++) {
    const dists: number[] = [];
    for (let j = 0; j < embeddings.length; j++) {
      if (i !== j) {
        dists.push(cosineDistance(embeddings[i].vector, embeddings[j].vector));
      }
    }
    dists.sort((a, b) => a - b);
    distances.push(dists[k - 1]); // k-th nearest neighbor distance
  }

  distances.sort((a, b) => a - b);

  // Find elbow (simplified: use percentile-based approach)
  // In practice, use knee-point detection algorithm
  const elbowIndex = Math.floor(distances.length * 0.15); // 15th percentile
  return distances[elbowIndex];
}
```

### Color Palette Selection (Accessible)

```typescript
// apps/web/src/constants/clusterColors.ts

// 8 distinct, vivid colors optimized for color blindness accessibility
// Based on research by Martin Krzywinski and Paul Tol's color schemes
// Avoids red-green confusion (most common colorblindness)
export const CLUSTER_COLORS = [
  "#4477AA", // Blue - highly distinct
  "#EE6677", // Red-pink
  "#228833", // Green (distinguishable from red-pink for most)
  "#CCBB44", // Yellow
  "#66CCEE", // Cyan
  "#AA3377", // Magenta-purple
  "#BBBBBB", // Gray (for "Other" category)
  "#FF8C00", // Dark orange (backup)
] as const;

// High contrast mode palette (monochromatic patterns + color)
export const HIGH_CONTRAST_COLORS = [
  "#0000FF", // Pure blue
  "#FF0000", // Pure red
  "#00FF00", // Pure green
  "#FFFF00", // Pure yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#000000", // Black
  "#808080", // Gray
] as const;

// Get color with accessibility mode support
export function getClusterColor(
  clusterIndex: number,
  highContrast: boolean = false,
): string {
  const palette = highContrast ? HIGH_CONTRAST_COLORS : CLUSTER_COLORS;
  return palette[clusterIndex % palette.length];
}
```

### API Endpoint Design

```typescript
// apps/api/src/routes/clusters.ts
import { Hono } from "hono";
import type { ClustersService } from "../services/clusters.service";

type Variables = {
  clustersService: ClustersService;
};

export const clusters = new Hono<{ Variables: Variables }>()
  .get("/", async (c) => {
    const clustersService = c.get("clustersService");
    const data = await clustersService.getClusters();

    return c.json({
      clusters: data.clusters.map((c) => ({
        id: c.id,
        label: c.label,
        color: c.color,
        nodeCount: c.nodeIds.length,
      })),
      nodeMemberships: Object.fromEntries(data.memberships),
      noiseNodeIds: data.noiseNodeIds,
      version: data.computedAt.getTime(),
    });
  })
  .post("/rebuild", async (c) => {
    const clustersService = c.get("clustersService");
    await clustersService.computeClusters();
    return c.json({ message: "Clusters rebuilt" });
  });
```

### React Component Integration

```typescript
// apps/web/src/hooks/useClusters.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ClusterData {
  clusters: {
    id: number;
    label: string;
    color: string;
    nodeCount: number;
  }[];
  nodeMemberships: Record<string, number[]>;
  noiseNodeIds: string[];
  version: number;
}

export function useClusters() {
  return useQuery<ClusterData>({
    queryKey: ["clusters"],
    queryFn: async () => {
      const res = await fetch("/api/clusters");
      if (!res.ok) throw new Error("Failed to fetch clusters");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Modified paintNode in ForceGraph.tsx
const paintNode = (node, ctx, globalScale) => {
  // ... existing code ...

  // Check if semantic coloring is enabled
  const { semanticEnabled, nodeMemberships, clusterColors } = graphState;

  let nodeColor = COLORS[type].base;
  let glowColors: string[] = [];

  if (semanticEnabled && nodeMemberships[node.id]) {
    const memberships = nodeMemberships[node.id];

    // Blend colors based on membership weights
    if (memberships.length === 1) {
      nodeColor = clusterColors[memberships[0]];
      glowColors = [nodeColor];
    } else {
      // Soft clustering: blend multiple colors
      const weights = memberships.map((m) => m.weight);
      const colors = memberships.map((m) => clusterColors[m.clusterId]);
      nodeColor = blendColors(colors, weights);
      glowColors = colors;
    }
  }

  // Draw glow if semantic enabled
  if (semanticEnabled && glowColors.length > 0) {
    ctx.beginPath();
    const glowRadius = r + 10;
    ctx.arc(x, y, glowRadius, 0, 2 * Math.PI);

    const gradient = ctx.createRadialGradient(x, y, r, x, y, glowRadius);
    glowColors.forEach((color, i) => {
      const alpha = 0.5 / glowColors.length;
      gradient.addColorStop(0, chroma(color).alpha(alpha).css());
    });
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Draw node with computed color
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = nodeColor;
  ctx.fill();

  // ... rest of paint code ...
};
```

### Keyword Extraction for Cluster Labels

```typescript
// apps/api/src/services/clusters.service.ts

function extractKeywords(titles: string[], maxKeywords: number = 3): string[] {
  // Simple TF-IDF-like extraction
  const wordFreq = new Map<string, number>();
  const docFreq = new Map<string, number>();
  const stopwords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
  ]);

  // Tokenize titles
  const tokenizedDocs = titles.map((title) => {
    const words = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopwords.has(w));

    // Count document frequency
    const uniqueWords = new Set(words);
    uniqueWords.forEach((w) => {
      docFreq.set(w, (docFreq.get(w) || 0) + 1);
    });

    return words;
  });

  // Count term frequency
  tokenizedDocs.forEach((words) => {
    words.forEach((w) => {
      wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
    });
  });

  // Calculate TF-IDF scores
  const scores = Array.from(wordFreq.entries()).map(([word, tf]) => {
    const df = docFreq.get(word) || 1;
    const idf = Math.log(titles.length / df);
    return { word, score: tf * idf };
  });

  // Sort and return top keywords
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, maxKeywords).map((s) => s.word);
}

function generateClusterLabel(titles: string[]): string {
  const keywords = extractKeywords(titles, 2);
  if (keywords.length === 0) return "Miscellaneous";
  return keywords.map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(" ");
}
```

## State of the Art

| Old Approach                      | Current Approach                | When Changed                 | Impact                                                            |
| --------------------------------- | ------------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| K-means clustering                | DBSCAN density-based            | 2024                         | No need to specify cluster count, handles noise naturally         |
| Hard clustering only              | Soft clustering with membership | 2020s                        | Better visualization of boundary nodes, multiple topic membership |
| Random color assignment           | Perceptually uniform palettes   | 2018+                        | Better accessibility, colorblind-friendly                         |
| Euclidean distance on vectors     | Cosine similarity               | Standard practice since 2019 | Better for high-dimensional embeddings                            |
| Server-side rendering of clusters | Client-side with Canvas 2D      | Always                       | Better performance with react-force-graph                         |

**Deprecated/outdated:**

- Pure K-means for semantic clustering: Requires specifying k upfront, doesn't handle outliers
- RGB color mixing: Produces muddy browns; use LAB color space
- Fixed epsilon selection: Data-dependent epsilon is more robust

## Open Questions

1. **Epsilon parameter calibration**
   - What we know: Epsilon should be data-dependent, typically 0.15-0.30 for cosine distance (corresponding to 0.70-0.85 similarity)
   - What's unclear: Optimal elbow detection algorithm for k-distance graphs
   - Recommendation: Start with percentile-based approach (15th percentile of 4-NN distances), tune based on visual results

2. **Large graph handling (>1000 nodes)**
   - What we know: DBSCAN is O(n²) with naive neighbor search
   - What's unclear: When to implement optimizations like k-d trees or approximate nearest neighbors
   - Recommendation: Profile with actual user data; if >2s computation time, add spatial indexing or sampling

3. **Color palette for high contrast mode**
   - What we know: Pure colors (RGB primaries) work well for deuteranopia/protanopia
   - What's unclear: Whether to use patterns (stripes/dots) in addition to colors
   - Recommendation: Start with high-saturation pure colors, add pattern support if user feedback indicates need

## Sources

### Primary (HIGH confidence)

- [scikit-learn DBSCAN documentation](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.DBSCAN.html) - Algorithm parameters and behavior
- [HDBSCAN soft clustering documentation](https://hdbscan.readthedocs.io/en/latest/soft_clustering_explanation.html) - Soft clustering theory and membership scores
- [react-force-graph examples](https://github.com/vasturiano/react-force-graph) - Canvas rendering patterns, glow effects via radial gradients
- [Paul Tol's color schemes](https://personal.sron.nl/~pault/) - Accessible color palette research
- [Martin Krzywinski's colorblind-friendly palettes](https://mk.bcgsc.ca/colorblind/) - Color selection for accessibility

### Secondary (MEDIUM confidence)

- [DBSCAN parameter selection (Sefidian 2022)](https://www.sefidian.com/2022/12/18/how-to-determine-epsilon-and-minpts-parameters-of-dbscan-clustering/) - Epsilon selection via k-distance graphs
- [Fuzzy C-Means clustering guide (Analytics Vidhya 2024)](https://www.analyticsvidhya.com/blog/2024/05/understanding-fuzzy-c-means-clustering/) - Soft clustering background
- [Labeling text clusters with keywords (Sia AI 2023)](https://medium.com/sia-ai/labeling-text-clusters-with-keywords-b5b5b6c1a89e) - Keyword extraction techniques
- [Force-graph performance optimization (Medium 2023)](https://weber-stephen.medium.com/the-best-libraries-and-methods-to-render-large-force-directed-graphs-on-the-web-d122ece2f4dc) - Canvas optimization patterns

### Tertiary (LOW confidence)

- Stack Overflow discussions on DBSCAN epsilon selection - Community consensus, but varies by domain
- Individual npm package benchmarks (cos-similarity vs alternatives) - May not reflect actual workload

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Existing codebase uses Hono, React, react-force-graph; npm packages are well-established
- Architecture: HIGH - Pre-computation + caching is standard pattern, matches existing embeddings service
- Pitfalls: MEDIUM - Most pitfalls documented from community experience, but specific performance thresholds need empirical testing
- DBSCAN parameters: MEDIUM - Epsilon selection is data-dependent, will need tuning with actual embeddings

**Research date:** 2026-02-08
**Valid until:** 30 days for stable libraries, 90 days for algorithm recommendations (research evolves)
