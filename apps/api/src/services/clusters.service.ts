import type { EmbeddingsService } from "./embeddings.service";
import {
  dbscan,
  estimateEpsilon,
  generateClusterLabel,
  cosineSimilarity,
} from "./clusters.utils";
import type { Cluster, NodeMembership, ClusterData } from "../types/clusters";

/**
 * Service for computing and caching semantic clusters from note embeddings
 * Uses DBSCAN algorithm with soft clustering for boundary nodes
 */
export class ClustersService {
  private embeddingsService: EmbeddingsService;
  private cache: ClusterData | null = null;
  private cacheVersion: number = 0;

  constructor(embeddingsService: EmbeddingsService) {
    this.embeddingsService = embeddingsService;
  }

  /**
   * Invalidate the cluster cache
   * Called when embeddings change
   */
  invalidateCache(): void {
    this.cache = null;
    console.log("ClustersService: Cache invalidated");
  }

  /**
   * Get clusters - returns cached data or computes new clusters
   */
  async getClusters(): Promise<ClusterData> {
    if (this.cache) {
      return this.cache;
    }
    return this.computeClusters();
  }

  /**
   * Force re-computation of clusters
   */
  async computeClusters(): Promise<ClusterData> {
    console.log("ClustersService: Computing clusters...");

    // Fetch all embeddings
    const embeddings = await this.embeddingsService.getAllEmbeddings();

    if (embeddings.length === 0) {
      const emptyData: ClusterData = {
        clusters: [],
        memberships: new Map(),
        noiseNodeIds: [],
        computedAt: new Date(),
        version: ++this.cacheVersion,
      };
      this.cache = emptyData;
      return emptyData;
    }

    // Estimate epsilon using k-distance graph (k=4)
    const epsilon = estimateEpsilon(embeddings, 4);
    console.log(`ClustersService: Estimated epsilon = ${epsilon.toFixed(3)}`);

    // Run DBSCAN with minPoints=4
    const minPoints = 4;
    const { labels, clusters } = dbscan(embeddings, epsilon, minPoints);

    // Calculate centroids for each cluster
    const clusterCentroids = new Map<number, number[]>();
    clusters.forEach((indices, clusterId) => {
      const centroid = this.calculateCentroid(
        indices.map((i) => embeddings[i].vector),
      );
      clusterCentroids.set(clusterId, centroid);
    });

    // Build cluster data with labels
    const clusterData: Cluster[] = [];
    clusters.forEach((indices, clusterId) => {
      const nodeIds = indices.map((i) => embeddings[i].id);
      const titles = indices.map((i) => embeddings[i].title);
      const centroid = clusterCentroids.get(clusterId)!;

      clusterData.push({
        id: clusterId,
        label: generateClusterLabel(titles, clusterId),
        color: "", // Placeholder - colors assigned client-side
        nodeIds,
        centroid,
      });
    });

    // Handle >8 clusters: merge smallest into "Other" category
    const finalClusters = this.mergeSmallClusters(clusterData, 8);

    // Recalculate centroids if merging occurred
    const finalCentroids = new Map<number, number[]>();
    for (const cluster of finalClusters) {
      if (cluster.id !== -1) {
        // Not the "Other" cluster
        const vectors = cluster.nodeIds.map((id) => {
          const emb = embeddings.find((e) => e.id === id);
          return emb!.vector;
        });
        finalCentroids.set(cluster.id, this.calculateCentroid(vectors));
      } else {
        // "Other" cluster - use average of merged centroids
        const otherVectors = cluster.nodeIds.map((id) => {
          const emb = embeddings.find((e) => e.id === id);
          return emb!.vector;
        });
        if (otherVectors.length > 0) {
          finalCentroids.set(-1, this.calculateCentroid(otherVectors));
        }
      }
    }

    // Calculate soft memberships for all nodes
    const memberships = this.calculateSoftMemberships(
      embeddings,
      finalClusters,
      finalCentroids,
      epsilon,
    );

    // Identify noise nodes
    const noiseNodeIds: string[] = [];
    for (let i = 0; i < labels.length; i++) {
      if (labels[i] === -1) {
        noiseNodeIds.push(embeddings[i].id);
      }
    }

    // Update centroids in final clusters
    for (const cluster of finalClusters) {
      const centroid = finalCentroids.get(cluster.id);
      if (centroid) {
        cluster.centroid = centroid;
      }
    }

    const result: ClusterData = {
      clusters: finalClusters,
      memberships,
      noiseNodeIds,
      computedAt: new Date(),
      version: ++this.cacheVersion,
    };

    this.cache = result;

    console.log(
      `ClustersService: Computed ${finalClusters.length} clusters, ${noiseNodeIds.length} noise nodes`,
    );

    return result;
  }

  /**
   * Calculate centroid (average) of a set of vectors
   */
  private calculateCentroid(vectors: number[][]): number[] {
    if (vectors.length === 0) {
      return [];
    }

    const dimension = vectors[0].length;
    const centroid = new Array(dimension).fill(0);

    for (const vector of vectors) {
      for (let i = 0; i < dimension; i++) {
        centroid[i] += vector[i];
      }
    }

    for (let i = 0; i < dimension; i++) {
      centroid[i] /= vectors.length;
    }

    return centroid;
  }

  /**
   * Merge smallest clusters into "Other" category if there are more than maxClusters
   */
  private mergeSmallClusters(
    clusters: Cluster[],
    maxClusters: number,
  ): Cluster[] {
    if (clusters.length <= maxClusters) {
      return clusters;
    }

    // Sort clusters by size (smallest first)
    const sortedClusters = [...clusters].sort(
      (a, b) => a.nodeIds.length - b.nodeIds.length,
    );

    // Keep the largest maxClusters-1 clusters
    const keepCount = maxClusters - 1;
    const clustersToKeep = sortedClusters.slice(-keepCount);
    const clustersToMerge = sortedClusters.slice(
      0,
      sortedClusters.length - keepCount,
    );

    // Create "Other" cluster with merged nodes
    const otherNodeIds: string[] = [];
    for (const cluster of clustersToMerge) {
      otherNodeIds.push(...cluster.nodeIds);
    }

    const otherCluster: Cluster = {
      id: -1,
      label: "Other",
      color: "",
      nodeIds: otherNodeIds,
      centroid: [],
    };

    return [...clustersToKeep, otherCluster];
  }

  /**
   * Calculate soft memberships for all nodes to all clusters
   * Uses cosine similarity to cluster centroids
   * Keeps top 3 memberships per node
   */
  private calculateSoftMemberships(
    embeddings: Array<{ id: string; vector: number[]; title: string }>,
    clusters: Cluster[],
    centroids: Map<number, number[]>,
    epsilon: number,
  ): Map<string, NodeMembership[]> {
    const memberships = new Map<string, NodeMembership[]>();

    for (const embedding of embeddings) {
      const nodeMemberships: NodeMembership[] = [];

      for (const cluster of clusters) {
        const centroid = centroids.get(cluster.id);
        if (!centroid || centroid.length === 0) continue;

        // Calculate cosine similarity to centroid
        const similarity = cosineSimilarity(embedding.vector, centroid);

        // Normalize to 0-1 range based on epsilon
        // similarity = 1 -> distance = 0 -> weight = 1
        // similarity = 1 - epsilon -> distance = epsilon -> weight = 0
        let weight = (similarity - (1 - epsilon)) / epsilon;
        weight = Math.max(0, Math.min(1, weight));

        if (weight > 0.1) {
          // Only include meaningful memberships
          nodeMemberships.push({
            clusterId: cluster.id,
            weight,
          });
        }
      }

      // Sort by weight descending and keep top 3
      nodeMemberships.sort((a, b) => b.weight - a.weight);
      memberships.set(embedding.id, nodeMemberships.slice(0, 3));
    }

    return memberships;
  }
}
