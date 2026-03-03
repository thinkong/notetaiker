import type { ModelDownloadState, ModelStatus } from "../types/models";
import type { EventsService } from "./events.service";
import { MODEL_CATALOG, findModelById } from "./model-catalog";

interface OllamaModelInfo {
  name: string;
  size: number;
  digest: string;
}

interface PullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

export class OllamaManager {
  private baseUrl: string;
  private eventsService: EventsService;
  private activePulls: Map<string, AbortController> = new Map();
  private pullStates: Map<string, ModelStatus> = new Map();

  constructor(baseUrl: string, eventsService: EventsService) {
    this.baseUrl = baseUrl;
    this.eventsService = eventsService;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async listLocalModels(): Promise<string[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      if (!res.ok) return [];
      const data = (await res.json()) as { models: OllamaModelInfo[] };
      return data.models.map((m) => m.name);
    } catch {
      return [];
    }
  }

  async isModelAvailable(ollamaModel: string): Promise<boolean> {
    const models = await this.listLocalModels();
    return models.some(
      (m) => m === ollamaModel || m === `${ollamaModel}:latest`,
    );
  }

  async getStatus(modelId: string): Promise<ModelStatus> {
    const existing = this.pullStates.get(modelId);
    if (existing && existing.state === "pulling") return existing;

    const model = findModelById(modelId);
    if (!model) {
      return { modelId, state: "error", error: "Unknown model" };
    }

    const available = await this.isModelAvailable(model.ollamaModel);
    if (available) {
      return { modelId, state: "ready", progress: 100 };
    }
    return { modelId, state: "not_downloaded", progress: 0 };
  }

  async getAllStatuses(): Promise<ModelStatus[]> {
    return Promise.all(MODEL_CATALOG.map((m) => this.getStatus(m.id)));
  }

  async pullModel(modelId: string): Promise<void> {
    if (this.activePulls.has(modelId)) {
      throw new Error(`Model "${modelId}" is already being pulled`);
    }

    const model = findModelById(modelId);
    if (!model) {
      throw new Error(`Model "${modelId}" not found in catalog`);
    }

    const abortController = new AbortController();
    this.activePulls.set(modelId, abortController);

    const updateState = (
      state: ModelDownloadState,
      progress: number,
      error?: string,
    ) => {
      const status: ModelStatus = { modelId, state, progress, error };
      this.pullStates.set(modelId, status);
      this.eventsService.broadcast("model_download_progress", status);
    };

    try {
      updateState("pulling", 0);

      const res = await fetch(`${this.baseUrl}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: model.ollamaModel, stream: true }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        throw new Error(`Ollama pull failed: HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body from Ollama");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const progress: PullProgress = JSON.parse(line);
            if (progress.total && progress.completed) {
              const pct = Math.round(
                (progress.completed / progress.total) * 100,
              );
              updateState("pulling", pct);
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }

      updateState("ready", 100);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        updateState("not_downloaded", 0);
      } else {
        updateState("error", 0, (err as Error).message);
      }
      throw err;
    } finally {
      this.activePulls.delete(modelId);
    }
  }

  cancelPull(modelId: string): void {
    const controller = this.activePulls.get(modelId);
    if (controller) {
      controller.abort();
    }
  }

  async deleteModel(modelId: string): Promise<void> {
    const model = findModelById(modelId);
    if (!model) return;

    try {
      const res = await fetch(`${this.baseUrl}/api/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: model.ollamaModel }),
      });
      if (!res.ok) {
        throw new Error(`Failed to delete model: HTTP ${res.status}`);
      }
    } catch (err) {
      console.error(`Failed to delete Ollama model ${model.ollamaModel}:`, err);
      throw err;
    }

    this.pullStates.delete(modelId);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
