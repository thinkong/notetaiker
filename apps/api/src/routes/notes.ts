import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { StorageService } from "../services/storage.service";
import type { EmbeddingsService } from "../services/embeddings.service";
import { env } from "@notetaiker/env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { QueueService } from "../services/queue.service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// apps/api/src/routes/notes.ts -> go up 4 levels to reach workspace root
const workspaceRoot = path.resolve(__dirname, "../../../..");
const notesDir = path.isAbsolute(env.NOTES_DIR)
  ? env.NOTES_DIR
  : path.resolve(workspaceRoot, env.NOTES_DIR);

// Ensure notes directory exists (minimal check as index.ts handles main setup)
try {
  // Just reference notesDir to suppress unused variable warning
  void notesDir;
} catch {}

type Bindings = {};
type Variables = {
  queueService: QueueService;
  storageService: StorageService;
  embeddingsService: EmbeddingsService;
};

export const notes = new Hono<{ Bindings: Bindings; Variables: Variables }>()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        limit: z
          .string()
          .optional()
          .transform((v) => (v ? parseInt(v, 10) : 50)),
        offset: z
          .string()
          .optional()
          .transform((v) => (v ? parseInt(v, 10) : 0)),
      }),
    ),
    async (c) => {
      const { limit, offset } = c.req.valid("query");
      const storageService = c.get("storageService");
      const allNotes = await storageService.listNotes(limit, offset);
      return c.json(allNotes);
    },
  )
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        content: z.string(),
        id: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      }),
    ),
    async (c) => {
      const { content, id, metadata } = c.req.valid("json");
      const storageService = c.get("storageService");

      const fileName = await storageService.saveNote(content, {
        ...metadata,
        id,
      });
      const savedNote = await storageService.getNote(fileName);

      return c.json(savedNote, 201);
    },
  )
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const storageService = c.get("storageService");
    const note = await storageService.getNote(id);
    if (!note) {
      return c.json({ error: "Note not found" }, 404);
    }
    return c.json(note);
  })
  .patch(
    "/:id",
    zValidator(
      "json",
      z.object({
        metadata: z.record(z.any()),
      }),
    ),
    async (c) => {
      const id = c.req.param("id");
      const { metadata } = c.req.valid("json");
      const storageService = c.get("storageService");

      const existingNote = await storageService.getNote(id);
      if (!existingNote) {
        return c.json({ error: "Note not found" }, 404);
      }

      const fileName = await storageService.saveNote(existingNote.content, {
        ...metadata,
        id,
      });

      const savedNote = await storageService.getNote(fileName);

      return c.json(savedNote);
    },
  )
  .get(
    "/:id/related",
    zValidator(
      "query",
      z.object({
        limit: z
          .string()
          .optional()
          .transform((v) => (v ? parseInt(v, 10) : 5)),
      }),
    ),
    async (c) => {
      const id = c.req.param("id");
      const { limit } = c.req.valid("query");
      const embeddingsService = c.get("embeddingsService");

      const relatedNotes = await embeddingsService.findRelated(id, limit);

      return c.json(relatedNotes);
    },
  );
