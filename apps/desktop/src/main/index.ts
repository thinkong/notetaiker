import { BrowserWindow } from "electrobun/bun";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { dlopen, FFIType, ptr, suffix } from "bun:ffi";

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

const RESOURCES_DIR = path.resolve(APP_RESOURCES, "..");

function getIconPath(): string | null {
  const platform = os.platform();
  const candidates: Record<string, string> = {
    win32: "app.ico",
    linux: "appIcon.png",
    darwin: "AppIcon.icns",
  };
  const filename = candidates[platform];
  if (!filename) return null;
  const iconPath = path.join(RESOURCES_DIR, filename);
  return fs.existsSync(iconPath) ? iconPath : null;
}

function setWindowIcon(win: BrowserWindow, iconPath: string) {
  try {
    const lib = dlopen(path.join(process.cwd(), `libNativeWrapper.${suffix}`), {
      setWindowIcon: {
        args: [FFIType.ptr, FFIType.ptr],
        returns: FFIType.void,
      },
    });
    const buf = Buffer.from(iconPath + "\0", "utf8");
    lib.symbols.setWindowIcon(win.ptr, ptr(buf));
  } catch (e) {
    console.warn("Failed to set window icon:", e);
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

const { startServer } = await import("../api/index");
startServer(PORT);

const win = new BrowserWindow({
  title: "notetAIker",
  url: `http://localhost:${PORT}`,
  frame: { x: 0, y: 0, width: 1280, height: 860 },
});

const iconPath = getIconPath();
if (iconPath) {
  setWindowIcon(win, iconPath);
}
