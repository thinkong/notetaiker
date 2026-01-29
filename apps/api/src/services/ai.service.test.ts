import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIService } from "./ai.service";
// import type { SecretsService } from './secrets.service';

// Mock the AI SDK
vi.mock("ai", () => ({
  generateObject: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => vi.fn()),
}));

vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: vi.fn(() => vi.fn()),
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn()),
}));

describe("AIService", () => {
  let secretsServiceMock: any;
  let aiService: AIService;

  beforeEach(() => {
    vi.clearAllMocks();
    secretsServiceMock = {
      getSecrets: vi.fn(),
    };
    aiService = new AIService(secretsServiceMock as any);
  });

  describe("provider selection", () => {
    it("should select OpenAI if apiKey is present", async () => {
      secretsServiceMock.getSecrets.mockResolvedValue({
        openai: { apiKey: "sk-test" },
      });

      const { generateObject } = await import("ai");
      (generateObject as any).mockResolvedValue({
        object: { tags: ["A", "B", "C"] },
      });

      await aiService.generateTags("test content");

      const { createOpenAI } = await import("@ai-sdk/openai");
      expect(createOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({ apiKey: "sk-test" }),
      );
    });

    it("should select Anthropic if OpenAI is missing and Anthropic is present", async () => {
      secretsServiceMock.getSecrets.mockResolvedValue({
        openai: {},
        anthropic: { apiKey: "ant-test" },
      });

      const { generateObject } = await import("ai");
      (generateObject as any).mockResolvedValue({
        object: { tags: ["A", "B", "C"] },
      });

      await aiService.generateTags("test content");

      const { createAnthropic } = await import("@ai-sdk/anthropic");
      expect(createAnthropic).toHaveBeenCalledWith(
        expect.objectContaining({ apiKey: "ant-test" }),
      );
    });

    it("should select Gemini if others are missing and Gemini is present", async () => {
      secretsServiceMock.getSecrets.mockResolvedValue({
        openai: {},
        anthropic: {},
        gemini: { apiKey: "gem-test" },
      });

      const { generateObject } = await import("ai");
      (generateObject as any).mockResolvedValue({
        object: { tags: ["A", "B", "C"] },
      });

      await aiService.generateTags("test content");

      const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
      expect(createGoogleGenerativeAI).toHaveBeenCalledWith(
        expect.objectContaining({ apiKey: "gem-test" }),
      );
    });

    it("should throw error if no provider is configured", async () => {
      secretsServiceMock.getSecrets.mockResolvedValue({});

      await expect(aiService.generateTags("test content")).rejects.toThrow(
        "No AI provider configured",
      );
    });
  });

  describe("generateTags", () => {
    it("should return tags from generateObject", async () => {
      secretsServiceMock.getSecrets.mockResolvedValue({
        openai: { apiKey: "sk-test" },
      });

      const expectedTags = ["Note Taking", "AI", "productivity"];
      const { generateObject } = await import("ai");
      (generateObject as any).mockResolvedValue({
        object: { tags: expectedTags },
      });

      const tags = await aiService.generateTags("test content");

      expect(tags).toEqual(expectedTags);
      expect(generateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining("test content"),
        }),
      );
    });
  });
});
