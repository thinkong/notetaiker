import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { SecretsService } from "../services/secrets.service";
import { SecretsSchema } from "@notetaiker/env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { AIService } from "../services/ai.service";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// apps/api/src/routes/settings.ts -> go up 4 levels to reach workspace root: src, api, apps, root
const workspaceRoot = path.resolve(__dirname, "../../../..");

const secretsService = new SecretsService(workspaceRoot);

const ValidateSchema = z.object({
  provider: z.enum(["openai", "anthropic", "gemini"]),
  apiKey: z.string(),
  baseUrl: z.string().optional(),
});

export const settings = new Hono()
  .get("/", async (c) => {
    const secrets = await secretsService.getSecrets();
    return c.json(secrets);
  })
  .post("/", zValidator("json", SecretsSchema), async (c) => {
    const data = c.req.valid("json");
    await secretsService.saveSecrets(data);
    const updatedSecrets = await secretsService.getSecrets();
    return c.json(updatedSecrets);
  })
  .post("/validate", zValidator("json", ValidateSchema), async (c) => {
    const { provider, apiKey, baseUrl } = c.req.valid("json");

    try {
      let response: Response;
      if (provider === "openai") {
        const url = `${baseUrl || AIService.DEFAULT_BASE_URLS.openai}/models`;
        response = await fetch(url, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
      } else if (provider === "anthropic") {
        const url = `${baseUrl || AIService.DEFAULT_BASE_URLS.anthropic}/models`;
        response = await fetch(url, {
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
        });
      } else {
        // gemini
        const url = `${baseUrl || AIService.DEFAULT_BASE_URLS.gemini}/models?key=${apiKey}`;
        response = await fetch(url);
      }

      if (response.ok) {
        const data = await response.json();
        // Extract models if available
        let models: string[] = [];
        if (provider === "openai") {
          models = data.data?.map((m: any) => m.id) || [];
        } else if (provider === "anthropic") {
          models = data.data?.map((m: any) => m.id) || [];
        } else if (provider === "gemini") {
          models = data.models?.map((m: any) => m.name.split("/").pop()) || [];
        }

        return c.json({
          success: true,
          models: models.sort(),
        });
      } else {
        const errorText = await response.text();
        let errorMessage = "Validation failed";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage =
            errorJson.error?.message || errorJson.message || errorText;
        } catch {
          errorMessage = errorText || response.statusText;
        }
        return c.json({ success: false, error: errorMessage }, 400);
      }
    } catch (error) {
      return c.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Network error or invalid URL",
        },
        500,
      );
    }
  });
