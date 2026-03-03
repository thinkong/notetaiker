import { Hono } from "hono";
import { z } from "zod";
import type { ModelRegistry } from "../services/model-registry.service";
import type { OllamaManager } from "../services/ollama-manager.service";
import type { ModelSlot, SlotInfo } from "../types/models";

type Variables = {
  modelRegistry: ModelRegistry;
  ollamaManager: OllamaManager;
};

const KNOWN_SLOTS: ModelSlot[] = ["text", "embedding", "image"];

export const models = new Hono<{ Variables: Variables }>()
  .get("/slots", async (c) => {
    const registry = c.get("modelRegistry");
    const ollamaManager = c.get("ollamaManager");
    const ollamaAvailable = await ollamaManager.isAvailable();

    const slots: SlotInfo[] = await Promise.all(
      KNOWN_SLOTS.map(async (slot) => {
        const active = registry.getActiveModel(slot);
        let isRunning = false;
        if (ollamaAvailable && active) {
          isRunning = await ollamaManager.isModelAvailable(active.ollamaModel);
        }
        return {
          slot,
          activeModel: active,
          isRunning,
          availableModels: registry.getCatalog(slot),
        };
      }),
    );

    return c.json(slots);
  })
  .get("/catalog", (c) => {
    const registry = c.get("modelRegistry");
    const slotFilter = c.req.query("slot") as ModelSlot | undefined;
    return c.json(registry.getCatalog(slotFilter));
  })
  .get("/status", async (c) => {
    const ollamaManager = c.get("ollamaManager");
    return c.json(await ollamaManager.getAllStatuses());
  })
  .get("/ollama-status", async (c) => {
    const ollamaManager = c.get("ollamaManager");
    const available = await ollamaManager.isAvailable();
    return c.json({ available });
  })
  .post("/download", async (c) => {
    const body = await c.req.json();
    const parsed = z
      .object({ modelId: z.string().min(1) })
      .safeParse(body);
    console.log(`downloading model ${body.modelId} ${JSON.stringify(body)}`);
    if (!parsed.success) {
      return c.json({ error: "Invalid request: modelId required" }, 400);
    }

    const ollamaManager = c.get("ollamaManager");
    const { modelId } = parsed.data;

    try {
      // Fire-and-forget: start the pull in the background so we don't block
      // the HTTP response for the entire download. Frontend polls /status.
      ollamaManager.pullModel(modelId).catch((err) => {
        console.error(`[models] Pull failed for ${modelId}:`, err);
      });
      return c.json({ status: "pulling", modelId });
    } catch (err) {
      console.error(`[models] Pull request failed for ${modelId}:`, err);
      return c.json(
        { error: (err as Error).message, modelId },
        500,
      );
    }
  })
  .post("/activate", async (c) => {
    const body = await c.req.json();
    const parsed = z
      .object({ slot: z.string(), modelId: z.string() })
      .safeParse(body);
    if (!parsed.success) {
      return c.json(
        { error: "Invalid request: slot and modelId required" },
        400,
      );
    }

    const { slot, modelId } = parsed.data;
    const registry = c.get("modelRegistry");

    try {
      registry.setActiveModel(slot as ModelSlot, modelId);
      return c.json({ status: "activated", slot, modelId });
    } catch (err) {
      return c.json({ error: (err as Error).message }, 500);
    }
  })
  .post("/cancel-download", async (c) => {
    const body = await c.req.json();
    const parsed = z.object({ modelId: z.string() }).safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid request: modelId required" }, 400);
    }

    const ollamaManager = c.get("ollamaManager");
    ollamaManager.cancelPull(parsed.data.modelId);
    return c.json({ status: "cancelled", modelId: parsed.data.modelId });
  })
  .delete("/:modelId", async (c) => {
    const modelId = c.req.param("modelId");
    const ollamaManager = c.get("ollamaManager");

    try {
      await ollamaManager.deleteModel(modelId);
      return c.json({ status: "deleted", modelId });
    } catch (err) {
      return c.json({ error: (err as Error).message }, 500);
    }
  });
