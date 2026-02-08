/**
 * Type definitions for semantic clustering
 */

export interface Cluster {
  id: number;
  label: string;
  color: string; // Placeholder - colors assigned client-side
  nodeIds: string[];
  centroid: number[];
}

export interface NodeMembership {
  clusterId: number;
  weight: number; // 0-1 membership score
}

export interface ClusterData {
  clusters: Cluster[];
  memberships: Map<string, NodeMembership[]>; // nodeId -> memberships (sorted by weight desc)
  noiseNodeIds: string[];
  computedAt: Date;
  version: number;
}

export interface ClusterSummary {
  id: number;
  label: string;
  nodeCount: number;
}

export interface ClusterApiResponse {
  clusters: ClusterSummary[];
  nodeMemberships: Record<string, NodeMembership[]>;
  noiseNodeIds: string[];
  version: number;
  computedAt: string;
}
