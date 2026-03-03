import { spawn, execSync, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const GITHUB_RELEASES_URL =
  "https://api.github.com/repos/ollama/ollama/releases/latest";

const OLLAMA_PORT = 11434;

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface GitHubRelease {
  tag_name: string;
  assets: ReleaseAsset[];
}

export interface OllamaBootstrapResult {
  baseUrl: string;
  managed: boolean;
  version?: string;
}

/**
 * Ensures Ollama is available, downloading the portable version if needed.
 *
 * Resolution order:
 *   1. System Ollama already running (e.g. user-installed)
 *   2. Previously downloaded portable binary in `ollamaDir`
 *   3. Download latest portable binary from GitHub releases
 */
export class OllamaBootstrap {
  private ollamaDir: string;
  private host: string;
  private process: ChildProcess | null = null;

  constructor(ollamaDir: string, host: string = "127.0.0.1") {
    this.ollamaDir = ollamaDir;
    this.host = host;
  }

  get baseUrl(): string {
    return `http://${this.host}:${OLLAMA_PORT}`;
  }

  async ensure(): Promise<OllamaBootstrapResult> {
    if (await this.isRunning()) {
      console.log("[ollama-bootstrap] Ollama is already running");
      return { baseUrl: this.baseUrl, managed: false };
    }

    const binaryPath = this.getBinaryPath();
    if (fs.existsSync(binaryPath)) {
      console.log(`[ollama-bootstrap] Found portable Ollama at ${binaryPath}`);
      const version = this.readVersionFile();
      await this.startServer(binaryPath);
      return { baseUrl: this.baseUrl, managed: true, version };
    }

    console.log("[ollama-bootstrap] No Ollama found, downloading latest...");
    const version = await this.downloadLatest();
    await this.startServer(this.getBinaryPath());
    return { baseUrl: this.baseUrl, managed: true, version };
  }

  async shutdown(): Promise<void> {
    if (this.process) {
      console.log("[ollama-bootstrap] Stopping managed Ollama server...");
      this.process.kill("SIGTERM");
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          this.process?.kill("SIGKILL");
          resolve();
        }, 5000);
        this.process!.on("exit", () => {
          clearTimeout(timeout);
          resolve();
        });
      });
      this.process = null;
    }
  }

  private async isRunning(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private getBinaryPath(): string {
    const name = os.platform() === "win32" ? "ollama.exe" : "ollama";
    return path.join(this.ollamaDir, name);
  }

  private readVersionFile(): string | undefined {
    try {
      const versionPath = path.join(this.ollamaDir, ".ollama-version");
      if (fs.existsSync(versionPath)) {
        return fs.readFileSync(versionPath, "utf-8").trim();
      }
    } catch {
      // ignore
    }
    return undefined;
  }

  private writeVersionFile(version: string): void {
    const versionPath = path.join(this.ollamaDir, ".ollama-version");
    fs.writeFileSync(versionPath, version, "utf-8");
  }

  private async startServer(binaryPath: string): Promise<void> {
    console.log(`[ollama-bootstrap] Starting Ollama server...`);

    const env: Record<string, string> = {
      ...(process.env as Record<string, string>),
      OLLAMA_HOST: `${this.host}:${OLLAMA_PORT}`,
      OLLAMA_MODELS: path.join(this.ollamaDir, "models"),
    };

    this.process = spawn(binaryPath, ["serve"], {
      stdio: ["ignore", "pipe", "pipe"],
      env,
    });

    this.process.stdout?.on("data", (data: Buffer) => {
      const msg = data.toString().trim();
      if (msg) console.log(`[ollama] ${msg}`);
    });

    this.process.stderr?.on("data", (data: Buffer) => {
      const msg = data.toString().trim();
      if (msg) console.log(`[ollama] ${msg}`);
    });

    this.process.on("exit", (code) => {
      console.log(`[ollama-bootstrap] Ollama server exited with code ${code}`);
      this.process = null;
    });

    await this.waitForReady();
    console.log("[ollama-bootstrap] Ollama server is ready");
  }

  private async waitForReady(timeoutMs: number = 30_000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (await this.isRunning()) return;
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(`Ollama server did not become ready within ${timeoutMs}ms`);
  }

  private getAssetName(): string {
    const platform = os.platform();
    const arch = os.arch();

    if (platform === "win32") {
      return arch === "arm64"
        ? "ollama-windows-arm64.zip"
        : "ollama-windows-amd64.zip";
    }
    if (platform === "darwin") {
      return "ollama-darwin.tgz";
    }
    // Linux
    return arch === "arm64"
      ? "ollama-linux-arm64.tar.zst"
      : "ollama-linux-amd64.tar.zst";
  }

  private async downloadLatest(): Promise<string> {
    fs.mkdirSync(this.ollamaDir, { recursive: true });

    console.log(
      "[ollama-bootstrap] Fetching latest release info from GitHub...",
    );
    const releaseRes = await fetch(GITHUB_RELEASES_URL, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!releaseRes.ok) {
      throw new Error(
        `Failed to fetch Ollama releases: HTTP ${releaseRes.status}`,
      );
    }

    const release = (await releaseRes.json()) as GitHubRelease;
    const version = release.tag_name;
    const assetName = this.getAssetName();

    const asset = release.assets.find((a) => a.name === assetName);
    if (!asset) {
      throw new Error(
        `Asset "${assetName}" not found in release ${version}. ` +
          `Available: ${release.assets.map((a) => a.name).join(", ")}`,
      );
    }

    console.log(
      `[ollama-bootstrap] Downloading ${assetName} (${version}, ` +
        `${(asset.size / 1_000_000).toFixed(0)} MB)...`,
    );

    const tempDir = path.join(this.ollamaDir, ".tmp-download");
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.mkdirSync(tempDir, { recursive: true });

    const archivePath = path.join(tempDir, assetName);

    const response = await fetch(asset.browser_download_url, {
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`Download failed: HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const fileStream = fs.createWriteStream(archivePath);
    let downloaded = 0;
    let lastLog = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fileStream.write(Buffer.from(value));
      downloaded += value.byteLength;

      const now = Date.now();
      if (now - lastLog > 2000) {
        const pct = Math.round((downloaded / asset.size) * 100);
        console.log(`[ollama-bootstrap] Downloaded ${pct}%`);
        lastLog = now;
      }
    }

    fileStream.end();
    await new Promise<void>((resolve, reject) => {
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
    });

    console.log("[ollama-bootstrap] Download complete, extracting...");
    await this.extractArchive(archivePath, tempDir);

    fs.unlinkSync(archivePath);

    this.promoteExtractedContents(tempDir, this.ollamaDir);

    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      console.warn("[ollama-bootstrap] Could not clean up temp dir");
    }

    const binaryPath = this.getBinaryPath();
    if (!fs.existsSync(binaryPath)) {
      throw new Error(
        `Ollama binary not found at ${binaryPath} after extraction`,
      );
    }

    if (os.platform() !== "win32") {
      fs.chmodSync(binaryPath, 0o755);
    }

    this.writeVersionFile(version);
    console.log(
      `[ollama-bootstrap] Ollama ${version} installed to ${this.ollamaDir}`,
    );

    return version;
  }

  private async extractArchive(
    archivePath: string,
    destDir: string,
  ): Promise<void> {
    const platform = os.platform();

    if (archivePath.endsWith(".zip")) {
      if (platform === "win32") {
        execSync(
          `powershell -Command "Expand-Archive -Path '${archivePath}' -DestinationPath '${destDir}' -Force"`,
        );
      } else {
        execSync(`unzip -o "${archivePath}" -d "${destDir}"`);
      }
    } else if (
      archivePath.endsWith(".tgz") ||
      archivePath.endsWith(".tar.gz")
    ) {
      execSync(`tar -xzf "${archivePath}" -C "${destDir}"`);
    } else if (archivePath.endsWith(".tar.zst")) {
      execSync(
        `tar --use-compress-program=unzstd -xf "${archivePath}" -C "${destDir}"`,
      );
    } else {
      throw new Error(`Unsupported archive format: ${archivePath}`);
    }
  }

  /**
   * Archives often contain a single top-level directory (e.g. `ollama-windows-amd64/`).
   * This finds that wrapper and moves its contents into dest, preserving subdirectories.
   */
  private promoteExtractedContents(extractDir: string, dest: string): void {
    const entries = fs.readdirSync(extractDir, { withFileTypes: true });

    // If there's a single top-level directory, promote its contents
    const dirs = entries.filter((e) => e.isDirectory());
    const files = entries.filter((e) => e.isFile());

    let sourceDir = extractDir;
    if (dirs.length === 1 && files.length === 0) {
      sourceDir = path.join(extractDir, dirs[0].name);
    }

    this.moveTree(sourceDir, dest);
  }

  /** Recursively moves all entries from src into dest, preserving directory structure. */
  private moveTree(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        this.moveTree(srcPath, destPath);
      } else if (srcPath !== destPath) {
        fs.copyFileSync(srcPath, destPath);
        fs.unlinkSync(srcPath);
      }
    }
  }
}
