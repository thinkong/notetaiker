import { useState } from "react";
import {
  Download,
  Check,
  Loader2,
  Trash2,
  RefreshCw,
  ImageIcon,
  Type,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiBaseUrl } from "../../lib/api";

interface ModelDefinition {
  id: string;
  name: string;
  slot: string;
  backend: string;
  ollamaModel: string;
  sizeBytes: number;
  contextSize: number;
  dimensions?: number;
}

interface SlotInfo {
  slot: string;
  activeModel: ModelDefinition | null;
  isRunning: boolean;
  availableModels: ModelDefinition[];
}

interface ModelStatus {
  modelId: string;
  state: "ready" | "pulling" | "not_downloaded" | "error";
  progress?: number;
  error?: string;
}

const SLOT_META: Record<
  string,
  {
    label: string;
    description: string;
    icon: typeof Type;
    comingSoon?: boolean;
  }
> = {
  text: {
    label: "Text Generation",
    description: "Used for AI-generated tags and titles",
    icon: Type,
  },
  embedding: {
    label: "Embeddings",
    description: "Used for semantic search and related notes",
    icon: Sparkles,
  },
  image: {
    label: "Image Generation",
    description: "Generate images from text descriptions",
    icon: ImageIcon,
    comingSoon: true,
  },
};

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

function SlotCard({
  info,
  statuses,
  onPull,
  onActivate,
  onDelete,
  isPulling,
  isActivating,
}: {
  info: SlotInfo;
  statuses: ModelStatus[];
  onPull: (modelId: string) => void;
  onActivate: (slot: string, modelId: string) => void;
  onDelete: (modelId: string) => void;
  isPulling: boolean;
  isActivating: boolean;
}) {
  const fallbackId = info.activeModel?.id ?? info.availableModels[0]?.id ?? "";
  const [rawSelectedModelId, setSelectedModelId] = useState("");
  const selectedModelId = rawSelectedModelId || fallbackId;

  const meta = SLOT_META[info.slot];
  if (!meta) return null;

  const Icon = meta.icon;

  if (meta.comingSoon) {
    return (
      <div className="p-4 bg-nord-snow0 dark:bg-nord-polar0 rounded-md opacity-60">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-nord-polar3/10 rounded-lg">
            <Icon className="w-5 h-5 text-nord-polar3 dark:text-nord-snow1" />
          </div>
          <div>
            <p className="font-medium text-nord-polar0 dark:text-nord-snow2">
              {meta.label}
            </p>
            <p className="text-xs text-nord-polar3 dark:text-nord-snow1">
              Coming soon
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selectedStatus = statuses.find((s) => s.modelId === selectedModelId);
  const isSelectedReady = selectedStatus?.state === "ready";
  const isSelectedActive = selectedModelId === info.activeModel?.id;

  return (
    <div className="p-4 bg-nord-snow0 dark:bg-nord-polar0 rounded-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-nord-frost3/10 rounded-lg">
            <Icon className="w-5 h-5 text-nord-frost3" />
          </div>
          <div>
            <p className="font-medium text-nord-polar0 dark:text-nord-snow2">
              {meta.label}
            </p>
            <p className="text-xs text-nord-polar3 dark:text-nord-snow1">
              {meta.description}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {info.isRunning ? (
            <span className="flex items-center text-xs text-nord-aurora4">
              <span className="w-2 h-2 bg-nord-aurora4 rounded-full mr-1.5 animate-pulse" />
              Available
            </span>
          ) : info.activeModel ? (
            <span className="text-xs text-nord-aurora2">Not pulled</span>
          ) : (
            <span className="text-xs text-nord-polar3 dark:text-nord-snow1">
              Not set up
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <select
          value={selectedModelId}
          onChange={(e) => setSelectedModelId(e.target.value)}
          className="flex-1 bg-white dark:bg-nord-polar1 border border-nord-snow0 dark:border-nord-polar2 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-nord-frost3 focus:border-transparent outline-none transition-all text-nord-polar0 dark:text-nord-snow2"
        >
          {info.availableModels.map((m) => {
            const st = statuses.find((s) => s.modelId === m.id);
            return (
              <option key={m.id} value={m.id}>
                {m.name} ({formatSize(m.sizeBytes)})
                {st?.state === "ready" ? " - Pulled" : ""}
              </option>
            );
          })}
        </select>

        {!isSelectedReady && (
          <button
            type="button"
            onClick={() => onPull(selectedModelId)}
            disabled={isPulling}
            className="flex items-center px-3 py-1.5 bg-nord-frost3 hover:bg-nord-frost2 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {isPulling ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 mr-1.5" />
            )}
            {isPulling ? `${selectedStatus?.progress ?? 0}%` : "Pull"}
          </button>
        )}

        {isSelectedReady && !isSelectedActive && (
          <button
            type="button"
            onClick={() => onActivate(info.slot, selectedModelId)}
            disabled={isActivating}
            className="flex items-center px-3 py-1.5 bg-nord-aurora4 hover:bg-nord-aurora4/90 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {isActivating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            )}
            Activate
          </button>
        )}

        {isSelectedReady && isSelectedActive && (
          <span className="flex items-center px-3 py-1.5 text-nord-aurora4 text-xs font-medium">
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Active
          </span>
        )}

        {isSelectedReady && (
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  `Remove the Ollama model "${info.availableModels.find((m) => m.id === selectedModelId)?.name}"?`,
                )
              ) {
                onDelete(selectedModelId);
              }
            }}
            className="p-1.5 text-nord-polar3 dark:text-nord-snow1 hover:text-nord-aurora0 transition-colors"
            title="Remove model from Ollama"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {info.activeModel && (
        <p className="text-xs text-nord-polar3 dark:text-nord-snow1">
          Active: <span className="font-medium">{info.activeModel.name}</span>
          {" | "}Model: <code>{info.activeModel.ollamaModel}</code>
          {info.activeModel.dimensions &&
            ` | ${info.activeModel.dimensions}d vectors`}
        </p>
      )}
    </div>
  );
}

export const ModelsSection = () => {
  const queryClient = useQueryClient();

  const { data: ollamaStatus } = useQuery<{ available: boolean }>({
    queryKey: ["ollama-status"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/models/ollama-status`);
      if (!res.ok) throw new Error("Failed to check Ollama status");
      return res.json();
    },
    refetchInterval: 10_000,
  });

  const { data: slots } = useQuery<SlotInfo[]>({
    queryKey: ["models", "slots"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/models/slots`);
      if (!res.ok) throw new Error("Failed to fetch model slots");
      return res.json();
    },
    refetchInterval: 10_000,
  });

  const { data: statuses } = useQuery<ModelStatus[]>({
    queryKey: ["models", "status"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/models/status`);
      if (!res.ok) throw new Error("Failed to fetch model status");
      return res.json();
    },
    refetchInterval: 3_000,
  });

  const pullMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const res = await fetch(`${apiBaseUrl}/api/models/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId }),
      });
      if (!res.ok) throw new Error("Pull failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async ({
      slot,
      modelId,
    }: {
      slot: string;
      modelId: string;
    }) => {
      const res = await fetch(`${apiBaseUrl}/api/models/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, modelId }),
      });
      if (!res.ok) throw new Error("Activation failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const res = await fetch(`${apiBaseUrl}/api/models/${modelId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });

  const allSlots: string[] = ["text", "embedding", "image"];
  const displaySlots = allSlots.map(
    (slotName) =>
      slots?.find((s) => s.slot === slotName) ?? {
        slot: slotName,
        activeModel: null,
        isRunning: false,
        availableModels: [],
      },
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-nord-snow0 dark:bg-nord-polar0 rounded-md">
        <div className="flex items-center space-x-2">
          {ollamaStatus?.available ? (
            <>
              <Wifi className="w-4 h-4 text-nord-aurora4" />
              <span className="text-sm text-nord-aurora4 font-medium">
                Ollama connected
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-nord-aurora0" />
              <span className="text-sm text-nord-aurora0 font-medium">
                Ollama not running
              </span>
            </>
          )}
        </div>
        {!ollamaStatus?.available && (
          <a
            href="https://ollama.com/download"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-nord-frost3 hover:underline"
          >
            Install Ollama
          </a>
        )}
      </div>

      {displaySlots.map((info) => (
        <SlotCard
          key={info.slot}
          info={info}
          statuses={statuses ?? []}
          onPull={(id) => pullMutation.mutate(id)}
          onActivate={(slot, id) =>
            activateMutation.mutate({ slot, modelId: id })
          }
          onDelete={(id) => deleteMutation.mutate(id)}
          isPulling={pullMutation.isPending}
          isActivating={activateMutation.isPending}
        />
      ))}
    </div>
  );
};
