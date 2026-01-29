import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NOTES_DIR: z.string().default("./data/notes"),
});

export const SecretsSchema = z.object({
  openai: z
    .object({
      apiKey: z.string().optional(),
      baseUrl: z.string().optional(),
    })
    .optional(),
  anthropic: z
    .object({
      apiKey: z.string().optional(),
      baseUrl: z.string().optional(),
    })
    .optional(),
  gemini: z
    .object({
      apiKey: z.string().optional(),
      baseUrl: z.string().optional(),
    })
    .optional(),
});

export type Secrets = z.infer<typeof SecretsSchema>;

const processEnv =
  typeof (globalThis as any).process !== "undefined"
    ? (globalThis as any).process.env
    : {};
const _env = envSchema.safeParse(processEnv);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
