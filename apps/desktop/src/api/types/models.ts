export type ModelSlot = "text" | "embedding" | "image";

export type ModelBackend = "ollama" | "openai" | "anthropic" | "gemini";

export interface ModelDefinition {
  id: string;
  name: string;
  slot: ModelSlot;
  backend: ModelBackend;
  ollamaModel: string;
  sizeBytes: number;
  contextSize: number;
  dimensions?: number;
  filename?: string;
  downloadUrl?: string;
  llamaServerFlags?: string[];
}

export interface SlotConfig {
  activeModelId: string;
  port?: number;
}

export interface ModelsConfig {
  slots: Partial<Record<ModelSlot, SlotConfig>>;
}

export type ModelDownloadState =
  | "ready"
  | "pulling"
  | "downloading"
  | "not_downloaded"
  | "error";

export interface ModelStatus {
  modelId: string;
  state: ModelDownloadState;
  progress?: number;
  error?: string;
}

export interface SlotInfo {
  slot: ModelSlot;
  activeModel: ModelDefinition | null;
  isRunning: boolean;
  availableModels: ModelDefinition[];
}
