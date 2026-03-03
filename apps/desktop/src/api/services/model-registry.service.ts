import fs from "node:fs";
import path from "node:path";
import type { ModelSlot, ModelDefinition, ModelsConfig } from "../types/models";
import {
  DEFAULT_SLOT_CONFIG,
  findModelById,
  getCatalogForSlot,
  MODEL_CATALOG,
} from "./model-catalog";

export class ModelRegistry {
  private configPath: string;
  private config: ModelsConfig;

  constructor(configPath: string) {
    this.configPath = configPath;
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    this.config = this.loadConfig();
  }

  private loadConfig(): ModelsConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, "utf-8");
        const loaded = JSON.parse(raw) as ModelsConfig;
        return this.migrateConfig(loaded);
      }
    } catch {
      console.warn("Failed to read models.json, using defaults");
    }
    const defaults: ModelsConfig = { slots: { ...DEFAULT_SLOT_CONFIG } };
    this.saveConfig(defaults);
    return defaults;
  }

  /** Reset slots whose activeModelId no longer exists in the catalog. */
  private migrateConfig(config: ModelsConfig): ModelsConfig {
    let changed = false;
    for (const [slot, slotCfg] of Object.entries(config.slots)) {
      if (!slotCfg) continue;
      const model = findModelById(slotCfg.activeModelId);
      if (!model) {
        const defaultCfg = DEFAULT_SLOT_CONFIG[slot];
        if (defaultCfg) {
          console.warn(
            `Model "${slotCfg.activeModelId}" not found in catalog, resetting ${slot} slot to "${defaultCfg.activeModelId}"`,
          );
          config.slots[slot as ModelSlot] = { ...defaultCfg };
        } else {
          delete config.slots[slot as ModelSlot];
        }
        changed = true;
      }
    }
    if (changed) {
      this.saveConfig(config);
    }
    return config;
  }

  private saveConfig(config: ModelsConfig): void {
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    this.config = config;
  }

  getActiveModel(slot: ModelSlot): ModelDefinition | null {
    const slotCfg = this.config.slots[slot];
    if (!slotCfg) return null;
    return findModelById(slotCfg.activeModelId) ?? null;
  }

  setActiveModel(slot: ModelSlot, modelId: string): void {
    const model = findModelById(modelId);
    if (!model || model.slot !== slot) {
      throw new Error(
        `Model "${modelId}" not found or does not belong to slot "${slot}"`,
      );
    }
    this.config.slots[slot] = { activeModelId: modelId };
    this.saveConfig(this.config);
  }

  getCatalog(slot?: ModelSlot): ModelDefinition[] {
    if (slot) return getCatalogForSlot(slot);
    return MODEL_CATALOG;
  }
}
