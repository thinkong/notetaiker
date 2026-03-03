/**
 * Clustering utilities for semantic graph intelligence
 * Implements DBSCAN algorithm with cosine similarity for note clustering
 */

/**
 * Calculate cosine similarity between two vectors
 * Returns similarity score between 0 and 1 (1 = identical)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Calculate cosine distance between two vectors
 * Returns distance where 0 = identical, 1 = completely different
 */
export function cosineDistance(a: number[], b: number[]): number {
  return 1 - cosineSimilarity(a, b);
}

/**
 * Find all points within epsilon distance of the given point
 * (Region query for DBSCAN)
 */
function regionQuery(
  embeddings: Array<{ id: string; vector: number[]; title: string }>,
  pointIdx: number,
  epsilon: number,
): number[] {
  const neighbors: number[] = [];
  const point = embeddings[pointIdx];

  for (let i = 0; i < embeddings.length; i++) {
    if (i === pointIdx) continue;

    const distance = cosineDistance(point.vector, embeddings[i].vector);
    if (distance <= epsilon) {
      neighbors.push(i);
    }
  }

  return neighbors;
}

/**
 * Expand a cluster starting from a seed point
 */
function expandCluster(
  embeddings: Array<{ id: string; vector: number[]; title: string }>,
  labels: number[],
  pointIdx: number,
  neighbors: number[],
  clusterId: number,
  epsilon: number,
  minPoints: number,
): void {
  labels[pointIdx] = clusterId;

  // Process all neighbors
  let i = 0;
  while (i < neighbors.length) {
    const neighborIdx = neighbors[i];

    if (labels[neighborIdx] === -2) {
      // Unvisited - mark as visited and find its neighbors
      labels[neighborIdx] = clusterId;
      const neighborNeighbors = regionQuery(embeddings, neighborIdx, epsilon);

      if (neighborNeighbors.length >= minPoints) {
        // This is a core point, add its neighbors to process
        neighbors.push(...neighborNeighbors);
      }
    }

    if (labels[neighborIdx] === -1) {
      // Was marked as noise, now belongs to this cluster
      labels[neighborIdx] = clusterId;
    }

    i++;
  }
}

/**
 * DBSCAN clustering algorithm using cosine similarity
 *
 * @param embeddings - Array of embeddings with id, vector, and title
 * @param epsilon - Maximum distance for neighborhood (cosine distance)
 * @param minPoints - Minimum points to form a cluster
 * @returns Object with labels array (-1 = noise) and clusters map
 */
export function dbscan(
  embeddings: Array<{ id: string; vector: number[]; title: string }>,
  epsilon: number,
  minPoints: number,
): {
  labels: number[];
  clusters: Map<number, number[]>;
} {
  const n = embeddings.length;

  // Initialize all points as unvisited (-2)
  const labels: number[] = new Array(n).fill(-2);
  let clusterId = 0;

  for (let i = 0; i < n; i++) {
    if (labels[i] !== -2) continue; // Already processed

    // Find neighbors of this point
    const neighbors = regionQuery(embeddings, i, epsilon);

    if (neighbors.length < minPoints) {
      // Not enough neighbors - mark as noise
      labels[i] = -1;
    } else {
      // Start a new cluster
      expandCluster(
        embeddings,
        labels,
        i,
        neighbors,
        clusterId,
        epsilon,
        minPoints,
      );
      clusterId++;
    }
  }

  // Build clusters map
  const clusters = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const label = labels[i];
    if (label >= 0) {
      if (!clusters.has(label)) {
        clusters.set(label, []);
      }
      clusters.get(label)!.push(i);
    }
  }

  return { labels, clusters };
}

/**
 * Estimate optimal epsilon using k-distance graph method
 * Uses the 15th percentile of k-th nearest neighbor distances
 *
 * @param embeddings - Array of embeddings
 * @param k - Number of nearest neighbors to consider (default: 4)
 * @returns Estimated epsilon value, clamped to [0.3, 0.7]
 */
export function estimateEpsilon(
  embeddings: Array<{ id: string; vector: number[]; title: string }>,
  k: number = 4,
): number {
  if (embeddings.length < k + 1) {
    return 0.5; // Default for small datasets
  }

  const kDistances: number[] = [];

  // Calculate k-distance for each point
  for (let i = 0; i < embeddings.length; i++) {
    const distances: number[] = [];

    for (let j = 0; j < embeddings.length; j++) {
      if (i !== j) {
        distances.push(
          cosineDistance(embeddings[i].vector, embeddings[j].vector),
        );
      }
    }

    // Sort distances and get k-th nearest
    distances.sort((a, b) => a - b);
    kDistances.push(distances[k - 1]);
  }

  // Sort k-distances and find elbow (15th percentile)
  kDistances.sort((a, b) => a - b);
  const percentileIndex = Math.floor(kDistances.length * 0.15);
  let epsilon = kDistances[percentileIndex];

  // Clamp to reasonable range
  epsilon = Math.max(0.3, Math.min(0.7, epsilon));

  return epsilon;
}

// Common English stopwords
const STOPWORDS = new Set([
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
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "need",
  "dare",
  "ought",
  "used",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "them",
  "their",
  "what",
  "which",
  "who",
  "whom",
  "whose",
  "where",
  "when",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
]);

/**
 * Extract significant keywords from titles
 * Uses TF (term frequency) to find most important terms
 *
 * @param titles - Array of note titles
 * @param maxKeywords - Maximum keywords to extract
 * @returns Array of extracted keywords
 */
export function extractKeywords(
  titles: string[],
  maxKeywords: number = 3,
): string[] {
  if (titles.length === 0) return [];

  const termFreq = new Map<string, number>();
  const termDocs = new Map<string, number>();

  for (const title of titles) {
    const seenInDoc = new Set<string>();

    // Tokenize: lowercase, split by non-word chars
    const tokens = title
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOPWORDS.has(t));

    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);

      if (!seenInDoc.has(token)) {
        termDocs.set(token, (termDocs.get(token) || 0) + 1);
        seenInDoc.add(token);
      }
    }
  }

  // Calculate TF-IDF-like score (TF * log(N/DF))
  const numDocs = titles.length;
  const scoredTerms: Array<{ term: string; score: number }> = [];

  termFreq.forEach((freq, term) => {
    const docFreq = termDocs.get(term) || 1;
    const tfidf = freq * Math.log(numDocs / docFreq);
    scoredTerms.push({ term, score: tfidf });
  });

  // Sort by score descending
  scoredTerms.sort((a, b) => b.score - a.score);

  // Return top keywords, capitalizing first letter
  return scoredTerms
    .slice(0, maxKeywords)
    .map(({ term }) => term.charAt(0).toUpperCase() + term.slice(1));
}

/**
 * Generate a human-readable label for a cluster from its note titles
 *
 * @param titles - Array of note titles in the cluster
 * @param clusterId - Numeric cluster ID (for fallback)
 * @returns Generated label string
 */
export function generateClusterLabel(
  titles: string[],
  clusterId: number,
): string {
  const keywords = extractKeywords(titles, 3);

  if (keywords.length === 0) {
    return `Cluster ${clusterId}`;
  }

  if (keywords.length === 1) {
    return keywords[0];
  }

  if (keywords.length === 2) {
    return `${keywords[0]} & ${keywords[1]}`;
  }

  return `${keywords[0]} ${keywords[1]}`;
}
