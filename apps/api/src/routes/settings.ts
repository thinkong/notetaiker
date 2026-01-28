import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { SecretsService } from '../services/secrets.service';
import { SecretsSchema } from '@notetaiker/env';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// apps/api/src/routes/settings.ts -> go up 4 levels to reach workspace root: src, api, apps, root
const workspaceRoot = path.resolve(__dirname, "../../../..");

const secretsService = new SecretsService(workspaceRoot);

export const settings = new Hono()
  .get('/', async (c) => {
    const secrets = await secretsService.getSecrets();
    return c.json(secrets);
  })
  .post(
    '/',
    zValidator('json', SecretsSchema),
    async (c) => {
      const data = c.req.valid('json');
      await secretsService.saveSecrets(data);
      const updatedSecrets = await secretsService.getSecrets();
      return c.json(updatedSecrets);
    }
  );
