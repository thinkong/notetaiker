import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import type { SecretsService } from "./secrets.service";

export class AIService {
  private secretsService: SecretsService;

  constructor(secretsService: SecretsService) {
    this.secretsService = secretsService;
  }

  private async getModel() {
    const secrets = await this.secretsService.getSecrets();

    if (secrets.openai?.apiKey) {
      const openai = createOpenAI({
        apiKey: secrets.openai.apiKey,
        baseURL: secrets.openai.baseUrl,
      });
      return openai("gpt-4o-mini");
    }

    if (secrets.anthropic?.apiKey) {
      const anthropic = createAnthropic({
        apiKey: secrets.anthropic.apiKey,
        baseURL: secrets.anthropic.baseUrl,
      });
      return anthropic("claude-3-5-sonnet-20240620");
    }

    if (secrets.gemini?.apiKey) {
      const google = createGoogleGenerativeAI({
        apiKey: secrets.gemini.apiKey,
        baseURL: secrets.gemini.baseUrl,
      });
      return google("gemini-1.5-flash");
    }

    throw new Error(
      "No AI provider configured. Please add an API key in settings.",
    );
  }

  async generateTags(content: string): Promise<string[]> {
    const model = await this.getModel();

    const { object } = await generateObject({
      model,
      schema: z.object({
        tags: z
          .array(z.string())
          .min(3)
          .max(5)
          .describe("3-5 relevant, Title Case tags"),
      }),
      prompt: `Generate 3-5 relevant, Title Case tags for this note content.

Content:
${content}`,
    });

    return object.tags;
  }
}
