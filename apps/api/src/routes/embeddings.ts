import { Hono } from "hono";
import type { EmbeddingsService } from "../services/embeddings.service";

type Variables = {
  embeddingsService: EmbeddingsService;
};

export const embeddings = new Hono<{ Variables: Variables }>();

embeddings.get("/status", async (c) => {
  const embeddingsService = c.get("embeddingsService");
  const status = await embeddingsService.getStatus();
  return c.json(status);
});

embeddings.post("/rebuild", async (c) => {
  const embeddingsService = c.get("embeddingsService");
  const result = await embeddingsService.rebuildIndex();
  return c.json({ message: "Rebuild started", ...result });
});
