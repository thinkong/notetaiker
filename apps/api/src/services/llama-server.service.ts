import { spawn, type ChildProcess } from "node:child_process";
import type { ModelSlot, ModelDefinition, SlotConfig } from "../types/models";

interface SlotProcess {
  process: ChildProcess;
  model: ModelDefinition;
  port: number;
  ready: boolean;
}

export class LlamaServerManager {
  private slots: Map<ModelSlot, SlotProcess> = new Map();
  private binaryPath: string;
  private modelsDir: string;

  constructor(binaryPath: string, modelsDir: string) {
    this.binaryPath = binaryPath;
    this.modelsDir = modelsDir;
  }

  async startSlot(
    slot: ModelSlot,
    model: ModelDefinition,
    slotConfig: SlotConfig,
  ): Promise<void> {
    if (this.slots.has(slot)) {
      await this.stopSlot(slot);
    }

    const modelPath = `${this.modelsDir}/${model.filename}`;
    const args = [
      "--model",
      modelPath,
      "--port",
      String(slotConfig.port),
      "--ctx-size",
      String(model.contextSize),
      "--host",
      "127.0.0.1",
      ...(model.llamaServerFlags ?? []),
    ];

    const child = spawn(this.binaryPath, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    const slotProc: SlotProcess = {
      process: child,
      model,
      port: slotConfig.port,
      ready: false,
    };

    child.stdout?.on("data", (data: Buffer) => {
      const msg = data.toString();
      if (
        msg.includes("server is listening") ||
        msg.includes("HTTP server listening")
      ) {
        slotProc.ready = true;
      }
    });

    child.stderr?.on("data", (data: Buffer) => {
      const msg = data.toString().trim();
      if (msg) {
        console.error(`[llama-server:${slot}] ${msg}`);
      }
    });

    child.on("exit", (code) => {
      console.log(`[llama-server:${slot}] exited with code ${code}`);
      this.slots.delete(slot);
    });

    this.slots.set(slot, slotProc);
  }

  async stopSlot(slot: ModelSlot): Promise<void> {
    const slotProc = this.slots.get(slot);
    if (!slotProc) return;

    slotProc.process.kill("SIGTERM");
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        slotProc.process.kill("SIGKILL");
        resolve();
      }, 5000);
      slotProc.process.on("exit", () => {
        clearTimeout(timeout);
        resolve();
      });
    });
    this.slots.delete(slot);
  }

  async restartSlot(
    slot: ModelSlot,
    model: ModelDefinition,
    slotConfig: SlotConfig,
  ): Promise<void> {
    await this.stopSlot(slot);
    await this.startSlot(slot, model, slotConfig);
    await this.waitForSlot(slot);
  }

  async stopAll(): Promise<void> {
    const stops = Array.from(this.slots.keys()).map((slot) =>
      this.stopSlot(slot),
    );
    await Promise.all(stops);
  }

  isSlotReady(slot: ModelSlot): boolean {
    return this.slots.get(slot)?.ready ?? false;
  }

  isSlotRunning(slot: ModelSlot): boolean {
    return this.slots.has(slot);
  }

  getSlotPort(slot: ModelSlot): number | null {
    return this.slots.get(slot)?.port ?? null;
  }

  async waitForSlot(
    slot: ModelSlot,
    timeoutMs: number = 60_000,
  ): Promise<void> {
    const slotProc = this.slots.get(slot);
    if (!slotProc) throw new Error(`Slot "${slot}" is not running`);
    if (slotProc.ready) return;

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (slotProc.ready) return;
      try {
        const res = await fetch(`http://127.0.0.1:${slotProc.port}/health`);
        if (res.ok) {
          slotProc.ready = true;
          return;
        }
      } catch {
        // not ready yet
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(
      `Slot "${slot}" did not become ready within ${timeoutMs}ms`,
    );
  }
}
