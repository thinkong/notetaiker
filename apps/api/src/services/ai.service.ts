import { generateText, Output } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOllama } from "ai-sdk-ollama";
import { z } from "zod";
import type { SecretsService } from "./secrets.service";
import { isDocker } from "@notetaiker/env";

export class AIService {
  static readonly DEFAULT_BASE_URLS = {
    openai: "https://api.openai.com/v1",
    anthropic: "https://api.anthropic.com/v1",
    gemini: "https://generativelanguage.googleapis.com/v1beta",
    ollama: isDocker ? "http://ollama:11434" : "http://localhost:11434",
  } as const;

  static readonly DEFAULT_MODELS = {
    openai: "gpt-4o-mini",
    anthropic: "claude-3-5-sonnet-20240620",
    gemini: "gemini-1.5-flash",
    ollama: "gemma3:4b",
  } as const;

  private secretsService: SecretsService;

  constructor(secretsService: SecretsService) {
    this.secretsService = secretsService;
  }

  private async getModel() {
    const secrets = await this.secretsService.getSecrets();
    const provider = secrets.selectedProvider;

    if (
      (provider === "openai" || !provider) &&
      secrets.openai?.apiKey
    ) {
      const openai = createOpenAI({
        apiKey: secrets.openai.apiKey,
        baseURL: secrets.openai.baseUrl || AIService.DEFAULT_BASE_URLS.openai,
      });
      return openai(secrets.openai.model || AIService.DEFAULT_MODELS.openai);
    }

    if (
      (provider === "anthropic" || !provider) &&
      secrets.anthropic?.apiKey
    ) {
      const anthropic = createAnthropic({
        apiKey: secrets.anthropic.apiKey,
        baseURL:
          secrets.anthropic.baseUrl || AIService.DEFAULT_BASE_URLS.anthropic,
      });
      return anthropic(
        secrets.anthropic.model || AIService.DEFAULT_MODELS.anthropic,
      );
    }

    if (
      (provider === "gemini" || !provider) &&
      secrets.gemini?.apiKey
    ) {
      const google = createGoogleGenerativeAI({
        apiKey: secrets.gemini.apiKey,
        baseURL: secrets.gemini.baseUrl || AIService.DEFAULT_BASE_URLS.gemini,
      });
      return google(secrets.gemini.model || AIService.DEFAULT_MODELS.gemini);
    }

    if (provider === "ollama" || !provider) {
      try {
        const ollama = createOllama({
          baseURL: AIService.DEFAULT_BASE_URLS.ollama,
        });
        return ollama(AIService.DEFAULT_MODELS.ollama);
      } catch (error) {
        console.warn("❌ Ollama not available:", error);
      }
    }

    throw new Error(
      "No AI provider configured. Please add an API key in settings or ensure the selected provider is configured.",
    );
  }

  async generateTags(content: string): Promise<string[]> {
    const model = await this.getModel();

    const { output } = await generateText({
      model,
      output: Output.object({
        schema: z.object({
          tags: z
            .array(z.string())
            .min(3)
            .max(5)
            .describe("3-5 relevant, Title Case tags"),
        }),
      }),
      prompt: `Generate 3-5 relevant, Title Case tags for this note content.

Content:
${content}`,
    });

    return output.tags;
  }
}
