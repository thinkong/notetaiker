/**
 * Prebuild script for the Electrobun desktop app.
 *
 * Stages native node_modules (sqlite-vec) that are marked as `external`
 * in the electrobun bundle so they can be found at runtime.
 *
 * llama-server is no longer bundled — it is downloaded at runtime on first
 * launch and stored in the user's app-data directory.
 *
 * Run manually: bun run scripts/download-llama-server.ts
 * Or automatically via Electrobun preBuild hook.
 */
import fs from "node:fs";
import path from "node:path";

function copyDirSync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getDesktopRoot(): string {
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const normalized =
    process.platform === "win32"
      ? scriptDir.replace(/^\//, "").replace(/\//g, "\\")
      : scriptDir;
  return path.resolve(normalized, "..");
}

// ---------------------------------------------------------------------------
// Stage native modules that are external in the electrobun bundle
// ---------------------------------------------------------------------------

function getPlatformPackageName(): string {
  const p = process.platform;
  const a = process.arch;
  const os = p === "win32" ? "windows" : p === "darwin" ? "darwin" : "linux";
  const arch = a === "arm64" ? "arm64" : "x64";
  return `sqlite-vec-${os}-${arch}`;
}

function stageNativeModules(desktopRoot: string) {
  const vendorDir = path.join(desktopRoot, "vendor", "node_modules");
  const apiRoot = path.resolve(desktopRoot, "..", "api");

  const sqliteVecLink = path.join(apiRoot, "node_modules", "sqlite-vec");
  if (!fs.existsSync(sqliteVecLink)) {
    throw new Error(
      `sqlite-vec not found at ${sqliteVecLink}. Run bun install first.`,
    );
  }
  const sqliteVecReal = fs.realpathSync(sqliteVecLink);
  const storeNodeModules = path.dirname(sqliteVecReal);

  const platformPkg = getPlatformPackageName();
  const platformPkgReal = path.join(storeNodeModules, platformPkg);
  if (!fs.existsSync(platformPkgReal)) {
    throw new Error(
      `Platform package ${platformPkg} not found at ${platformPkgReal}. Run bun install first.`,
    );
  }

  const destSqliteVec = path.join(vendorDir, "sqlite-vec");
  const destPlatform = path.join(vendorDir, platformPkg);

  fs.rmSync(vendorDir, { recursive: true, force: true });

  console.log(`Staging sqlite-vec → ${destSqliteVec}`);
  copyDirSync(sqliteVecReal, destSqliteVec);

  console.log(`Staging ${platformPkg} → ${destPlatform}`);
  copyDirSync(platformPkgReal, destPlatform);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const desktopRoot = getDesktopRoot();
  stageNativeModules(desktopRoot);
}

main();
