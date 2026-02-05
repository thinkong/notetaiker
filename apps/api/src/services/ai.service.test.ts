import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIService } from "./ai.service";
// import type { SecretsService } from './secrets.service';

// Mock the AI SDK
vi.mock("ai", () => ({
  generateObject: vi.fn(),
  generateText: vi.fn(),
  Output: {
    object: vi.fn((config) => config),
  },
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

vi.mock("ai-sdk-ollama", () => ({
  createOllama: vi.fn(() => {
    throw new Error("Ollama not available");
  }),
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

      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValue({
        output: { tags: ["A", "B", "C"] },
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

      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValue({
        output: { tags: ["A", "B", "C"] },
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

      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValue({
        output: { tags: ["A", "B", "C"] },
      });

      await aiService.generateTags("test content");

      const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
      expect(createGoogleGenerativeAI).toHaveBeenCalledWith(
        expect.objectContaining({ apiKey: "gem-test" }),
      );
    });

    it("should throw error if no provider is configured", async () => {
      secretsServiceMock.getSecrets.mockResolvedValue({});

      const { generateText } = await import("ai");
      (generateText as any).mockReset();

      await expect(aiService.generateTags("test content")).rejects.toThrow(
        "No AI provider configured",
      );
    });
  });

  describe("generateTags", () => {
    it("should return tags from generateText", async () => {
      secretsServiceMock.getSecrets.mockResolvedValue({
        openai: { apiKey: "sk-test" },
      });

      const expectedTags = ["Note Taking", "AI", "productivity"];
      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValue({
        output: { tags: expectedTags },
      });

      const tags = await aiService.generateTags("test content");

      expect(tags).toEqual(expectedTags);
      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining("test content"),
        }),
      );
    });
  });

  describe("generateTitle", () => {
    it("should return title from generateText", async () => {
      secretsServiceMock.getSecrets.mockResolvedValue({
        openai: { apiKey: "sk-test" },
      });

      const expectedTitle = "My Test Note";
      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValue({
        output: { title: expectedTitle },
      });

      const title = await aiService.generateTitle("test content");

      expect(title).toEqual(expectedTitle);
    });

    it("should respect max length constraint", async () => {
      secretsServiceMock.getSecrets.mockResolvedValue({
        openai: { apiKey: "sk-test" },
      });

      // Mock a title that's exactly 60 chars
      const maxLengthTitle = "A".repeat(60);
      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValue({
        output: { title: maxLengthTitle },
      });

      const title = await aiService.generateTitle("test content");

      expect(title).toEqual(maxLengthTitle);
      expect(title.length).toBeLessThanOrEqual(60);
    });
  });
});
