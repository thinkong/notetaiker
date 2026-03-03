import { useState } from "react";
import {
  Eye,
  EyeOff,
  Globe,
  Key,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Cpu,
} from "lucide-react";
import type { UseFormRegister, UseFormGetValues } from "react-hook-form";
import type { Secrets } from "@notetaiker/env";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";

// Only providers that have apiKey/baseUrl/model config (not selectedProvider)
type ProviderWithConfig = "openai" | "anthropic" | "gemini";

interface ProviderSectionProps {
  title: string;
  provider: ProviderWithConfig;
  description: string;
  register: UseFormRegister<Secrets>;
  getValues: UseFormGetValues<Secrets>;
}

const DEFAULT_PLACEHOLDERS = {
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta",
};

export const ProviderSection = ({
  title,
  provider,
  description,
  register,
  getValues,
}: ProviderSectionProps) => {
  const [showKey, setShowKey] = useState(false);

  const validateMutation = useMutation({
    mutationFn: async () => {
      const values = getValues(provider);
      // Ensure values is defined before accessing properties
      if (!values || !values.apiKey)
        throw new Error("API Key is required to test connection");

      const res = await api.settings.validate.$post({
        json: {
          provider: provider as "openai" | "anthropic" | "gemini",
          apiKey: values.apiKey,
          baseUrl: values.baseUrl,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error("error" in data ? data.error : "Validation failed");
      }
      return data as { success: true; models: string[] };
    },
  });

  return (
    <div className="bg-white dark:bg-nord-polar1 p-6 rounded-lg border border-nord-snow0 dark:border-nord-polar2 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-nord-polar0 dark:text-nord-snow2">
            {title}
          </h3>
          <p className="text-sm text-nord-polar3 dark:text-nord-snow1 mt-1">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => validateMutation.mutate()}
          disabled={validateMutation.isPending}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-nord-frost3 hover:text-nord-frost2 border border-nord-frost3 hover:border-nord-frost2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validateMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          Test Connection
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-nord-polar3 dark:text-nord-snow1 mb-1.5 flex items-center">
            <Key className="w-4 h-4 mr-2" />
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              {...register(`${provider}.apiKey`)}
              placeholder={`Enter your ${title} API key`}
              className="w-full bg-nord-snow2 dark:bg-nord-polar0 border border-nord-snow0 dark:border-nord-polar2 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-nord-frost3 focus:border-transparent outline-none transition-all text-nord-polar0 dark:text-nord-snow2"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-nord-polar3 dark:text-nord-snow1 hover:text-nord-frost3 transition-colors"
            >
              {showKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-nord-polar3 dark:text-nord-snow1 mb-1.5 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Base URL (Optional)
            </label>
            <input
              type="text"
              {...register(`${provider}.baseUrl`)}
              placeholder={
                DEFAULT_PLACEHOLDERS[
                  provider as keyof typeof DEFAULT_PLACEHOLDERS
                ]
              }
              className="w-full bg-nord-snow2 dark:bg-nord-polar0 border border-nord-snow0 dark:border-nord-polar2 rounded-md px-3 py-2 focus:ring-2 focus:ring-nord-frost3 focus:border-transparent outline-none transition-all text-nord-polar0 dark:text-nord-snow2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-nord-polar3 dark:text-nord-snow1 mb-1.5 flex items-center">
              <Cpu className="w-4 h-4 mr-2" />
              Model (Optional)
            </label>
            <input
              type="text"
              list={`${provider}-models`}
              {...register(`${provider}.model`)}
              placeholder="Select or type model name"
              className="w-full bg-nord-snow2 dark:bg-nord-polar0 border border-nord-snow0 dark:border-nord-polar2 rounded-md px-3 py-2 focus:ring-2 focus:ring-nord-frost3 focus:border-transparent outline-none transition-all text-nord-polar0 dark:text-nord-snow2"
            />
            <datalist id={`${provider}-models`}>
              {validateMutation.isSuccess &&
                validateMutation.data.success &&
                validateMutation.data.models.map((model) => (
                  <option key={model} value={model} />
                ))}
            </datalist>
          </div>
        </div>

        {validateMutation.isSuccess && validateMutation.data.success && (
          <div className="flex items-center text-nord-aurora4 text-sm animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Connection successful! Found {
              validateMutation.data.models.length
            }{" "}
            models.
          </div>
        )}

        {validateMutation.isError && (
          <div className="flex items-start text-nord-aurora0 text-sm animate-in fade-in slide-in-from-top-1">
            <XCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{validateMutation.error.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
