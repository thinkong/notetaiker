import { Hono } from "hono";
import type { ClustersService } from "../services/clusters.service";

type Variables = {
  clustersService: ClustersService;
};

/**
 * Cluster API routes
 * GET / - Returns cluster data with memberships
 * POST /rebuild - Triggers re-computation of clusters
 */
export const clusters = new Hono<{ Variables: Variables }>()
  .get("/", async (c) => {
    const service = c.get("clustersService");
    const data = await service.getClusters();

    // Transform Map to plain object for JSON serialization
    return c.json({
      clusters: data.clusters.map((c) => ({
        id: c.id,
        label: c.label,
        nodeCount: c.nodeIds.length,
      })),
      nodeMemberships: Object.fromEntries(data.memberships),
      noiseNodeIds: data.noiseNodeIds,
      version: data.version,
      computedAt: data.computedAt.toISOString(),
    });
  })
  .post("/rebuild", async (c) => {
    const service = c.get("clustersService");
    await service.computeClusters();
    return c.json({ message: "Clusters rebuilt successfully" });
  });
