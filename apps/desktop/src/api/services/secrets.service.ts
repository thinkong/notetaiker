import fs from "node:fs/promises";
import path from "node:path";
import writeFileAtomic from "write-file-atomic";
import { SecretsSchema, type Secrets } from "@notetaiker/env";

export class SecretsService {
  private secretsPath: string;
  private gitignorePath: string;
  private configDir: string;

  constructor(workspaceRoot: string) {
    this.configDir = path.join(workspaceRoot, ".notetaiker");
    this.secretsPath = path.join(this.configDir, "secrets.json");
    this.gitignorePath = path.join(workspaceRoot, ".gitignore");
  }

  async getSecrets(): Promise<Secrets> {
    try {
      const content = await fs.readFile(this.secretsPath, "utf-8");
      const data = JSON.parse(content);
      const result = SecretsSchema.safeParse(data);
      if (result.success) {
        return result.data;
      }
      return {};
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        return {};
      }
      throw error;
    }
  }

  async saveSecrets(secrets: Secrets): Promise<void> {
    await fs.mkdir(this.configDir, { recursive: true });

    // Ensure .notetaiker is in .gitignore
    await this.ensureGitignore();

    const data = JSON.stringify(secrets, null, 2);
    await writeFileAtomic(this.secretsPath, data, { mode: 0o600 });
  }

  private async ensureGitignore(): Promise<void> {
    try {
      let content = "";
      try {
        content = await fs.readFile(this.gitignorePath, "utf-8");
      } catch (error) {
        if ((error as any).code !== "ENOENT") throw error;
      }

      if (!content.split("\n").some((line) => line.trim() === ".notetaiker")) {
        const separator = content.endsWith("\n") || content === "" ? "" : "\n";
        await fs.appendFile(this.gitignorePath, `${separator}.notetaiker\n`);
      }
    } catch (error) {
      console.error("Failed to update .gitignore:", error);
    }
  }
}
