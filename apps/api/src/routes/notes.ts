import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { StorageService } from '../services/storage.service';
import { env } from '@notetaiker/env';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../..");
const notesDir = path.isAbsolute(env.NOTES_DIR)
  ? env.NOTES_DIR
  : path.resolve(workspaceRoot, env.NOTES_DIR);

const storageService = new StorageService(notesDir);

export const notes = new Hono();

notes.get('/', async (c) => {
  const allNotes = await storageService.listNotes();
  return c.json(allNotes);
});

notes.post(
  '/',
  zValidator(
    'json',
    z.object({
      content: z.string(),
      id: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    })
  ),
  async (c) => {
    const { content, id, metadata } = c.req.valid('json');
    const fullMetadata = { ...metadata, id };
    const fileName = await storageService.saveNote(content, fullMetadata);
    const savedNote = await storageService.getNote(fileName);
    return c.json(savedNote, 201);
  }
);

notes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const note = await storageService.getNote(id);
  if (!note) {
    return c.json({ error: 'Note not found' }, 404);
  }
  return c.json(note);
});
