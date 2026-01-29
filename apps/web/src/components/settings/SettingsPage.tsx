import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import type { Secrets } from "@notetaiker/env";
import { ProviderSection } from "./ProviderSection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useEffect, useState } from "react";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const { register, handleSubmit, reset, getValues } = useForm<Secrets>();

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
      reset(secrets);
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
            Configure your AI providers and preferences.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6">
          <ProviderSection
            title="OpenAI"
            provider="openai"
            description="Use GPT-4, GPT-3.5, or compatible models."
            register={register}
            getValues={getValues}
          />
          <ProviderSection
            title="Anthropic"
            provider="anthropic"
            description="Use Claude 3, Claude 2.1, etc."
            register={register}
            getValues={getValues}
          />
          <ProviderSection
            title="Gemini"
            provider="gemini"
            description="Use Google's Gemini Pro or Ultra models."
            register={register}
            getValues={getValues}
          />
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
