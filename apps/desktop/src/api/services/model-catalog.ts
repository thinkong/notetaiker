import type { ModelDefinition, ModelSlot, SlotConfig } from "../types/models";

export const MODEL_CATALOG: ModelDefinition[] = [
  {
    id: "gemma3:4b",
    name: "Gemma 3 4B",
    slot: "text",
    backend: "ollama",
    ollamaModel: "gemma3:4b",
    sizeBytes: 3_300_000_000,
    contextSize: 8192,
  },
  {
    id: "qwen2.5:1.5b",
    name: "Qwen 2.5 1.5B (lightweight)",
    slot: "text",
    backend: "ollama",
    ollamaModel: "qwen2.5:1.5b",
    sizeBytes: 1_050_000_000,
    contextSize: 4096,
  },
  {
    id: "nomic-embed-text",
    name: "Nomic Embed Text",
    slot: "embedding",
    backend: "ollama",
    ollamaModel: "nomic-embed-text",
    sizeBytes: 274_000_000,
    contextSize: 8192,
    dimensions: 768,
  },
  {
    id: "mxbai-embed-large",
    name: "MxBAI Embed Large",
    slot: "embedding",
    backend: "ollama",
    ollamaModel: "mxbai-embed-large",
    sizeBytes: 670_000_000,
    contextSize: 512,
    dimensions: 1024,
  },
];

export const DEFAULT_SLOT_CONFIG: Record<string, SlotConfig> = {
  text: { activeModelId: "gemma3:4b" },
  embedding: { activeModelId: "nomic-embed-text" },
};

export function getCatalogForSlot(slot: ModelSlot): ModelDefinition[] {
  return MODEL_CATALOG.filter((m) => m.slot === slot);
}

export function findModelById(id: string): ModelDefinition | undefined {
  return MODEL_CATALOG.find((m) => m.id === id);
}
