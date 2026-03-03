import { generateText, Output, embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOllama } from "ai-sdk-ollama";
import { z } from "zod";
import type { SecretsService } from "./secrets.service";
import type { ModelRegistry } from "./model-registry.service";
import type { ModelBackend } from "../types/models";
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
  private modelRegistry: ModelRegistry | null;
  private ollamaBaseUrl: string;

  constructor(
    secretsService: SecretsService,
    modelRegistry?: ModelRegistry,
    ollamaBaseUrl?: string,
  ) {
    this.secretsService = secretsService;
    this.modelRegistry = modelRegistry ?? null;
    this.ollamaBaseUrl = ollamaBaseUrl ?? AIService.DEFAULT_BASE_URLS.ollama;
  }

  private async getModel() {
    if (this.modelRegistry) {
      const active = this.modelRegistry.getActiveModel("text");
      if (active && active.backend === "ollama") {
        const ollama = createOllama({ baseURL: this.ollamaBaseUrl });
        return ollama(active.ollamaModel);
      }
      if (active) {
        return this.getExternalModel(active.backend);
      }
    }

    return this.getExternalModel();
  }

  private async getExternalModel(backend?: ModelBackend) {
    const secrets = await this.secretsService.getSecrets();
    const provider = backend ?? secrets.selectedProvider;

    if ((provider === "openai" || !provider) && secrets.openai?.apiKey) {
      const openai = createOpenAI({
        apiKey: secrets.openai.apiKey,
        baseURL: secrets.openai.baseUrl || AIService.DEFAULT_BASE_URLS.openai,
      });
      return openai(secrets.openai.model || AIService.DEFAULT_MODELS.openai);
    }

    if ((provider === "anthropic" || !provider) && secrets.anthropic?.apiKey) {
      const anthropic = createAnthropic({
        apiKey: secrets.anthropic.apiKey,
        baseURL:
          secrets.anthropic.baseUrl || AIService.DEFAULT_BASE_URLS.anthropic,
      });
      return anthropic(
        secrets.anthropic.model || AIService.DEFAULT_MODELS.anthropic,
      );
    }

    if ((provider === "gemini" || !provider) && secrets.gemini?.apiKey) {
      const google = createGoogleGenerativeAI({
        apiKey: secrets.gemini.apiKey,
        baseURL: secrets.gemini.baseUrl || AIService.DEFAULT_BASE_URLS.gemini,
      });
      return google(secrets.gemini.model || AIService.DEFAULT_MODELS.gemini);
    }

    if (provider === "ollama" || !provider) {
      try {
        const ollama = createOllama({
          baseURL: this.ollamaBaseUrl,
        });
        return ollama(AIService.DEFAULT_MODELS.ollama);
      } catch (error) {
        console.warn("Ollama not available:", error);
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

  async generateTitle(content: string): Promise<string> {
    const model = await this.getModel();

    const { output } = await generateText({
      model,
      output: Output.object({
        schema: z.object({
          title: z.string().max(60).describe("Concise, descriptive title"),
        }),
      }),
      prompt: `Generate a concise, descriptive title (max 60 chars) for this note content:

${content}`,
    });

    return output.title;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (this.modelRegistry) {
      const active = this.modelRegistry.getActiveModel("embedding");
      if (active && active.backend === "ollama") {
        const ollama = createOllama({ baseURL: this.ollamaBaseUrl });
        const { embedding } = await embed({
          model: ollama.embedding(active.ollamaModel),
          value: text,
        });
        return embedding;
      }
    }

    return this.getExternalEmbedding(text);
  }

  private async getExternalEmbedding(text: string): Promise<number[]> {
    const secrets = await this.secretsService.getSecrets();
    const provider = secrets.selectedProvider;

    let embeddingModel;

    if (provider === "ollama" || !provider) {
      const ollamaProvider = createOllama({
        baseURL: this.ollamaBaseUrl,
      });
      embeddingModel = ollamaProvider.embedding("nomic-embed-text");
    } else {
      embeddingModel = await this.getExternalModel();
    }

    const { embedding } = await embed({
      model: embeddingModel as any,
      value: text,
    });

    return embedding;
  }
}
