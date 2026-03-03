import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getClusterColor } from "../constants/clusterColors";

/**
 * Cluster information returned from the API
 */
export interface ClusterInfo {
  id: number;
  label: string;
  nodeCount: number;
}

/**
 * Membership of a node to a cluster with weight
 */
export interface NodeMembership {
  clusterId: number;
  weight: number;
}

/**
 * Complete cluster data from the API
 */
export interface ClusterData {
  clusters: ClusterInfo[];
  nodeMemberships: Record<string, NodeMembership[]>;
  noiseNodeIds: string[];
  version: number;
  computedAt: string;
}

/**
 * Hook to fetch and cache cluster data from the API
 * Uses React Query for caching with 5-minute stale time
 */
export function useClusters() {
  return useQuery<ClusterData>({
    queryKey: ["clusters"],
    queryFn: async () => {
      const res = await fetch("/api/clusters");
      if (!res.ok) throw new Error("Failed to fetch clusters");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - clusters don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });
}

/**
 * Hook to get cluster colors based on cluster data
 * Provides color mapping utilities for rendering
 */
export function useClusterColors(highContrast = false) {
  const { data } = useClusters();

  const colorMap = useMemo(() => {
    if (!data) return {};
    const map: Record<number, string> = {};
    data.clusters.forEach((cluster, index) => {
      map[cluster.id] = getClusterColor(index, highContrast);
    });
    return map;
  }, [data, highContrast]);

  return { colorMap };
}
