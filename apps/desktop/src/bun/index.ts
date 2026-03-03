import { BrowserWindow } from "electrobun/bun";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

const APP_RESOURCES = path.resolve(import.meta.dir, "..");

function getAppDataDir(): string {
  const platform = os.platform();
  const home = os.homedir();
  switch (platform) {
    case "darwin":
      return path.join(home, "Library", "Application Support", "notetaiker");
    case "win32":
      return path.join(
        process.env.APPDATA || path.join(home, "AppData", "Roaming"),
        "notetaiker",
      );
    default:
      return path.join(home, ".local", "share", "notetaiker");
  }
}

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------

const PORT = 3001;
const dataDir = getAppDataDir();
fs.mkdirSync(dataDir, { recursive: true });

const configDir = path.join(dataDir, ".notetaiker");
fs.mkdirSync(configDir, { recursive: true });

process.env.WORKSPACE_ROOT = dataDir;
process.env.OLLAMA_DIR = path.join(dataDir, "ollama");
process.env.WEB_DIST_PATH = path.join(APP_RESOURCES, "web-dist");
process.env.NODE_ENV = "production";

const { startServer } = await import("../../../api/src/index");
startServer(PORT);

const win = new BrowserWindow({
  title: "notetAIker",
  url: `http://localhost:${PORT}`,
  frame: { x: 0, y: 0, width: 1280, height: 860 },
});
