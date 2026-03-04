import type { ElectrobunConfig } from "electrobun";

function sqliteVecPlatformPkg(): string {
  const p = process.platform;
  const a = process.arch;
  const os = p === "win32" ? "windows" : p === "darwin" ? "darwin" : "linux";
  const arch = a === "arm64" ? "arm64" : "x64";
  return `sqlite-vec-${os}-${arch}`;
}

export default {
  app: {
    name: "notetAIker",
    identifier: "app.notetaiker",
    version: "0.3.0",
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
  build: {
    bun: {
      entrypoint: "src/main/index.ts",
      external: ["bun:sqlite", "sqlite-vec"],
    },
    views: {},
    copy: {
      "vendor/node_modules/sqlite-vec": "bun/node_modules/sqlite-vec",
      [`vendor/node_modules/${sqliteVecPlatformPkg()}`]: `bun/node_modules/${sqliteVecPlatformPkg()}`,
      dist: "web-dist",
    },
    useAsar: false,
    asarUnpack: ["*.node", "*.dll", "*.dylib", "*.so"],
    mac: {
      defaultRenderer: "native",
      icons: "assets/mac.icns",
    },
    linux: {
      bundleCEF: true,
      defaultRenderer: "cef",
      icon: "assets/linux.png",
    },
    win: {
      defaultRenderer: "native",
      icon: "assets/win32.ico",
    },
  },
  scripts: {},
  release: {
    baseUrl: "https://github.com/thinkong/notetaiker/releases/latest/download",
  },
} satisfies ElectrobunConfig;
