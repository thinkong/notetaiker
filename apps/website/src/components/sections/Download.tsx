import { useEffect, useMemo, useState } from "react";
import {
  Download as DownloadIcon,
  ChevronDown,
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type OS = "win" | "macos" | "linux";
type Arch = "x64" | "arm64";
type Channel = "stable" | "canary" | "dev";

interface Asset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface ReleaseInfo {
  tag_name: string;
  published_at: string;
  assets: Asset[];
}

interface ParsedAsset {
  channel: Channel;
  os: OS;
  arch: Arch;
  url: string;
  size: number;
  version: string;
}

const OS_LABELS: Record<OS, string> = {
  win: "Windows",
  macos: "macOS",
  linux: "Linux",
};

const ARCH_LABELS: Record<Arch, string> = {
  x64: "x64 (Intel/AMD)",
  arm64: "ARM64",
};

const EXTENSION_MAP: Record<OS, string> = {
  win: ".zip",
  macos: ".dmg",
  linux: ".tar.gz",
};

const UNSUPPORTED_COMBOS: { os: OS; arch: Arch }[] = [
  { os: "win", arch: "arm64" },
  { os: "macos", arch: "x64" },
];

function detectOS(): OS {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  if (platform.includes("Win") || ua.includes("Windows")) return "win";
  if (platform.includes("Mac") || ua.includes("Macintosh")) return "macos";
  return "linux";
}

function detectArch(): Arch {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  if (
    ua.includes("ARM") ||
    ua.includes("aarch64") ||
    platform.includes("aarch64")
  )
    return "arm64";
  if (platform.includes("Mac")) return "arm64";
  return "x64";
}

function isUnsupported(os: OS, arch: Arch): boolean {
  return UNSUPPORTED_COMBOS.some((c) => c.os === os && c.arch === arch);
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function parseAssets(releases: ReleaseInfo[]): ParsedAsset[] {
  const parsed: ParsedAsset[] = [];
  const seen = new Set<string>();

  for (const release of releases) {
    for (const asset of release.assets) {
      const match = asset.name.match(
        /^(stable|canary|dev)-(win|macos|linux)-(x64|arm64)-notetAIker.*\.(zip|dmg|tar\.gz)$/,
      );
      if (!match) continue;

      const [, channel, os, arch] = match as [string, Channel, OS, Arch];
      const key = `${channel}-${os}-${arch}`;
      if (seen.has(key)) continue;
      seen.add(key);

      parsed.push({
        channel,
        os,
        arch,
        url: asset.browser_download_url,
        size: asset.size,
        version: release.tag_name,
      });
    }
  }

  return parsed;
}

function ChannelDropdown({
  channel,
  onChange,
}: {
  channel: Channel;
  onChange: (c: Channel) => void;
}) {
  const [open, setOpen] = useState(false);
  const channels: Channel[] = ["stable", "canary", "dev"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md border bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
      >
        <span className="capitalize">{channel}</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-1 w-32 overflow-hidden rounded-md border bg-background shadow-lg">
            {channels.map((c) => (
              <button
                key={c}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                  c === channel && "bg-primary/10 font-medium text-primary",
                )}
              >
                <span className="capitalize">{c}</span>
                {c === "stable" && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    (recommended)
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AllDownloads({
  assets,
  channel,
}: {
  assets: ParsedAsset[];
  channel: Channel;
}) {
  const channelAssets = assets.filter((a) => a.channel === channel);

  if (channelAssets.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No {channel} builds available yet.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {channelAssets.map((asset) => (
        <a
          key={`${asset.os}-${asset.arch}`}
          href={asset.url}
          className="flex items-center gap-3 rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/50"
        >
          <DownloadIcon className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">
              {OS_LABELS[asset.os]}{" "}
              <span className="text-muted-foreground">
                {ARCH_LABELS[asset.arch]}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {EXTENSION_MAP[asset.os]} &middot; {formatBytes(asset.size)}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

function SystemRequirements() {
  const requirements = [
    {
      icon: Cpu,
      label: "Processor",
      value: "Multi-core CPU (Intel/AMD x64 or ARM64)",
    },
    { icon: MemoryStick, label: "Memory", value: "4 GB RAM minimum" },
    {
      icon: Monitor,
      label: "OS",
      value: "Windows (x64), macOS (Apple Silicon), Linux (x64/ARM64)",
    },
    { icon: HardDrive, label: "Disk", value: "500 MB for app + models" },
  ];

  return (
    <div className="mx-auto mt-16 max-w-3xl">
      <h3 className="mb-6 text-center text-lg font-semibold">
        System Requirements
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {requirements.map((req) => (
          <div
            key={req.label}
            className="flex items-start gap-3 rounded-lg border bg-background p-4 shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <req.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">{req.label}</div>
              <div className="text-sm text-muted-foreground">{req.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Download() {
  const [assets, setAssets] = useState<ParsedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<Channel>("stable");
  const [showAll, setShowAll] = useState(false);

  const detectedOS = useMemo(() => detectOS(), []);
  const detectedArch = useMemo(() => detectArch(), []);

  useEffect(() => {
    fetch("https://api.github.com/repos/thinkong/notetaiker/releases")
      .then((res) => res.json())
      .then((releases: ReleaseInfo[]) => {
        setAssets(parseAssets(releases));
      })
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, []);

  const primaryAsset = useMemo(() => {
    if (isUnsupported(detectedOS, detectedArch)) return null;
    return assets.find(
      (a) =>
        a.channel === channel && a.os === detectedOS && a.arch === detectedArch,
    );
  }, [assets, channel, detectedOS, detectedArch]);

  const unsupported = isUnsupported(detectedOS, detectedArch);

  return (
    <section id="download" className="border-t py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Download <span className="text-primary">notetAIker</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Free, open-source, and runs entirely on your machine. Download the
            desktop app and start taking smarter notes in seconds.
          </p>
        </div>

        <div className="mx-auto max-w-xl">
          <div className="rounded-xl border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Detected:{" "}
                <span className="font-medium text-foreground">
                  {OS_LABELS[detectedOS]} {ARCH_LABELS[detectedArch]}
                </span>
              </div>
              <ChannelDropdown channel={channel} onChange={setChannel} />
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : unsupported ? (
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {OS_LABELS[detectedOS]} on {ARCH_LABELS[detectedArch]} is
                    not currently supported.
                  </p>
                  <button
                    onClick={() => setShowAll(true)}
                    className="mt-2 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    View all available downloads
                  </button>
                </div>
              ) : primaryAsset ? (
                <div className="flex flex-col items-center gap-4">
                  <Button size="lg" className="w-full text-base" asChild>
                    <a href={primaryAsset.url}>
                      <DownloadIcon className="mr-2 h-5 w-5" />
                      Download for {OS_LABELS[detectedOS]}
                    </a>
                  </Button>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="secondary">{primaryAsset.version}</Badge>
                    <span>
                      {EXTENSION_MAP[detectedOS]} &middot;{" "}
                      {formatBytes(primaryAsset.size)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No {channel} build available for your platform yet.
                  </p>
                  <a
                    href="https://github.com/thinkong/notetaiker/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    View all releases on GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {!loading && !showAll && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  Other platforms &amp; architectures
                </button>
              </div>
            )}
          </div>
        </div>

        {showAll && (
          <div className="mx-auto mt-8 max-w-3xl">
            <h3 className="mb-4 text-center text-lg font-semibold">
              All Downloads
              <span className="ml-2 text-sm font-normal capitalize text-muted-foreground">
                ({channel})
              </span>
            </h3>
            <AllDownloads assets={assets} channel={channel} />
          </div>
        )}

        <SystemRequirements />
      </div>
    </section>
  );
}
