import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import type { Secrets } from "@notetaiker/env";
import { ProviderSection } from "./ProviderSection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useEffect, useState } from "react";

const DiagnosticsSection = () => {
  const queryClient = useQueryClient();
  const { data: failedJobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["failed-jobs"],
    queryFn: async () => {
      const res = await api.settings["failed-jobs"].$get();
      if (!res.ok) throw new Error("Failed to fetch failed jobs");
      return res.json();
    },
  });

  const retryMutation = useMutation({
    mutationFn: async () => {
      const res = await api.settings["retry-jobs"].$post();
      if (!res.ok) throw new Error("Failed to retry jobs");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["failed-jobs"] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-nord-snow0 dark:bg-nord-polar0 rounded-md">
        <div>
          <p className="font-medium text-nord-polar0 dark:text-nord-snow2">
            AI Auto-Tagging Status
          </p>
          <p className="text-sm text-nord-polar3 dark:text-nord-snow1">
            {isLoadingJobs
              ? "Checking..."
              : failedJobs?.count && failedJobs.count > 0
                ? `${failedJobs.count} note(s) failed to process.`
                : "All systems operational."}
          </p>
        </div>
        {failedJobs?.count && failedJobs.count > 0 ? (
          <button
            type="button"
            onClick={() => retryMutation.mutate()}
            disabled={retryMutation.isPending}
            className="flex items-center px-4 py-2 bg-nord-aurora0 hover:bg-nord-aurora0/90 text-white text-sm font-medium rounded-md shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${retryMutation.isPending ? "animate-spin" : ""}`}
            />
            Retry Failed
          </button>
        ) : (
          <div className="flex items-center text-nord-aurora4 text-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Healthy
          </div>
        )}
      </div>
    </div>
  );
};

export const SettingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const { register, handleSubmit, reset, getValues, control } =
    useForm<Secrets>();
  const selectedProvider = useWatch({ control, name: "selectedProvider" });

  const { data: secrets, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.settings.$get();
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  useEffect(() => {
    if (secrets) {
      reset({
        ...secrets,
        selectedProvider: secrets.selectedProvider || "ollama",
      });
    }
  }, [secrets, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: Secrets) => {
      const res = await api.settings.$post({ json: data });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    },
    onError: () => {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    },
  });

  const onSubmit = (data: Secrets) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-nord-polar3 dark:text-nord-snow1">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-nord-frost3" />
        <p>Loading your settings...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-nord-polar3 dark:text-nord-snow1 hover:text-nord-frost3 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Capture
          </button>
          <h1 className="text-3xl font-bold text-nord-frost3 tracking-tight">
            Settings
          </h1>
          <p className="text-nord-polar3 dark:text-nord-snow1 mt-2">
            Configure your AI providers and preferences. If none is set, it will
            try to use local Ollama gemma3:4b.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white dark:bg-nord-polar1 p-6 rounded-lg border border-nord-snow0 dark:border-nord-polar2 shadow-sm">
          <h3 className="text-lg font-semibold text-nord-polar0 dark:text-nord-snow2 mb-1">
            Active Provider
          </h3>
          <p className="text-sm text-nord-polar3 dark:text-nord-snow1 mb-4">
            Select which AI provider to use for all requests.
          </p>

          <select
            {...register("selectedProvider")}
            className="w-full bg-nord-snow2 dark:bg-nord-polar0 border border-nord-snow0 dark:border-nord-polar2 rounded-md px-3 py-2 focus:ring-2 focus:ring-nord-frost3 focus:border-transparent outline-none transition-all text-nord-polar0 dark:text-nord-snow2"
          >
            <option value="ollama">Local Ollama (Default)</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Google Gemini</option>
          </select>
          <p className="text-xs text-nord-polar3 dark:text-nord-snow1 mt-2">
            * Selected provider must have a valid configuration below.
          </p>
        </div>

        <div className="grid gap-6">
          {selectedProvider === "openai" && (
            <ProviderSection
              title="OpenAI"
              provider="openai"
              description="Use GPT-4, GPT-3.5, or compatible models."
              register={register}
              getValues={getValues}
            />
          )}

          {selectedProvider === "anthropic" && (
            <ProviderSection
              title="Anthropic"
              provider="anthropic"
              description="Use Claude 3, Claude 2.1, etc."
              register={register}
              getValues={getValues}
            />
          )}

          {selectedProvider === "gemini" && (
            <ProviderSection
              title="Gemini"
              provider="gemini"
              description="Use Google's Gemini Pro or Ultra models."
              register={register}
              getValues={getValues}
            />
          )}

          {selectedProvider === "ollama" && (
            <div className="bg-white dark:bg-nord-polar1 p-6 rounded-lg border border-nord-snow0 dark:border-nord-polar2 shadow-sm">
              <h3 className="text-lg font-semibold text-nord-polar0 dark:text-nord-snow2">
                Local Ollama
              </h3>
              <p className="text-sm text-nord-polar3 dark:text-nord-snow1 mt-2">
                NoteTAIker will attempt to connect to your local Ollama instance
                at <code>http://localhost:11434</code>.
              </p>
              <p className="text-sm text-nord-polar3 dark:text-nord-snow1 mt-2">
                Ensure you have pulled the required model:
                <code className="block mt-2 bg-nord-snow1 dark:bg-nord-polar0 p-2 rounded text-xs font-mono">
                  ollama pull gemma3:4b
                </code>
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-nord-polar1 p-6 rounded-lg border border-nord-snow0 dark:border-nord-polar2 shadow-sm">
          <h3 className="text-lg font-semibold text-nord-polar0 dark:text-nord-snow2 mb-4">
            App Health
          </h3>
          <DiagnosticsSection />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-nord-snow0 dark:border-nord-polar1">
          <div className="flex items-center">
            {saveStatus === "success" && (
              <span className="flex items-center text-nord-aurora4 text-sm animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Settings saved successfully
              </span>
            )}
            {saveStatus === "error" && (
              <span className="flex items-center text-nord-aurora0 text-sm animate-in fade-in slide-in-from-left-2">
                <AlertCircle className="w-4 h-4 mr-2" />
                Failed to save settings
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex items-center px-6 py-2 bg-nord-frost3 hover:bg-nord-frost2 disabled:bg-nord-polar3 text-white font-medium rounded-md shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};
