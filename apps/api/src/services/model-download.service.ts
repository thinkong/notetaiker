import fs from "node:fs";
import path from "node:path";
import type { ModelDownloadState } from "../types/models";
import { findModelById, MODEL_CATALOG } from "./model-catalog";
import type { EventsService } from "./events.service";

interface DownloadProgress {
  modelId: string;
  state: ModelDownloadState;
  progress: number;
  error?: string;
}

export class ModelDownloadService {
  private modelsDir: string;
  private eventsService: EventsService;
  private activeDownloads: Map<string, AbortController> = new Map();
  private downloadStates: Map<string, DownloadProgress> = new Map();

  constructor(modelsDir: string, eventsService: EventsService) {
    this.modelsDir = modelsDir;
    fs.mkdirSync(modelsDir, { recursive: true });
    this.eventsService = eventsService;
  }

  getStatus(modelId: string): DownloadProgress {
    const existing = this.downloadStates.get(modelId);
    if (existing) return existing;

    const model = findModelById(modelId);
    if (!model) {
      return { modelId, state: "error", progress: 0, error: "Unknown model" };
    }

    const filePath = path.join(this.modelsDir, model.filename);
    if (fs.existsSync(filePath)) {
      return { modelId, state: "ready", progress: 100 };
    }
    return { modelId, state: "not_downloaded", progress: 0 };
  }

  getAllStatuses(): DownloadProgress[] {
    return MODEL_CATALOG.map((m) => this.getStatus(m.id));
  }

  async downloadModel(modelId: string): Promise<void> {
    if (this.activeDownloads.has(modelId)) {
      throw new Error(`Model "${modelId}" is already downloading`);
    }

    const model = findModelById(modelId);
    if (!model) {
      throw new Error(`Model "${modelId}" not found in catalog`);
    }

    const destPath = path.join(this.modelsDir, model.filename);
    const tempPath = `${destPath}.download`;

    const abortController = new AbortController();
    this.activeDownloads.set(modelId, abortController);

    const updateState = (
      state: ModelDownloadState,
      progress: number,
      error?: string,
    ) => {
      const status: DownloadProgress = { modelId, state, progress, error };
      this.downloadStates.set(modelId, status);
      this.eventsService.broadcast("model_download_progress", status);
    };

    try {
      updateState("downloading", 0);

      let startByte = 0;
      if (fs.existsSync(tempPath)) {
        const stats = fs.statSync(tempPath);
        startByte = stats.size;
      }

      const headers: Record<string, string> = {};
      if (startByte > 0) {
        headers["Range"] = `bytes=${startByte}-`;
      }

      const response = await fetch(model.downloadUrl, {
        signal: abortController.signal,
        headers,
        redirect: "follow",
      });

      if (!response.ok && response.status !== 206) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const totalSize =
        response.status === 206
          ? startByte + Number(response.headers.get("content-length") ?? 0)
          : Number(response.headers.get("content-length") ?? model.sizeBytes);

      const fileStream = fs.createWriteStream(tempPath, {
        flags: startByte > 0 ? "a" : "w",
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let downloaded = startByte;
      let lastProgressUpdate = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        fileStream.write(Buffer.from(value));
        downloaded += value.byteLength;

        const now = Date.now();
        if (now - lastProgressUpdate > 500) {
          const progress = Math.round((downloaded / totalSize) * 100);
          updateState("downloading", progress);
          lastProgressUpdate = now;
        }
      }

      fileStream.end();
      await new Promise<void>((resolve, reject) => {
        fileStream.on("finish", resolve);
        fileStream.on("error", reject);
      });

      fs.renameSync(tempPath, destPath);
      updateState("ready", 100);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        updateState("not_downloaded", 0);
      } else {
        updateState("error", 0, (err as Error).message);
      }
      throw err;
    } finally {
      this.activeDownloads.delete(modelId);
    }
  }

  cancelDownload(modelId: string): void {
    const controller = this.activeDownloads.get(modelId);
    if (controller) {
      controller.abort();
    }
  }

  deleteModel(modelId: string): void {
    const model = findModelById(modelId);
    if (!model) return;

    const filePath = path.join(this.modelsDir, model.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const tempPath = `${filePath}.download`;
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    this.downloadStates.delete(modelId);
  }
}
