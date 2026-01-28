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
} from "lucide-react";
import { UseFormRegister, UseFormGetValues } from "react-hook-form";
import { Secrets } from "@notetaiker/env";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface ProviderSectionProps {
  title: string;
  provider: keyof Secrets;
  description: string;
  register: UseFormRegister<Secrets>;
  getValues: UseFormGetValues<Secrets>;
}

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
      if (!values.apiKey)
        throw new Error("API Key is required to test connection");

      const res = await api.settings.validate.$post({
        json: {
          provider,
          apiKey: values.apiKey,
          baseUrl: values.baseUrl,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error("error" in data ? data.error : "Validation failed");
      }
      return data;
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

        <div>
          <label className="block text-sm font-medium text-nord-polar3 dark:text-nord-snow1 mb-1.5 flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Base URL (Optional)
          </label>
          <input
            type="text"
            {...register(`${provider}.baseUrl`)}
            placeholder="https://api.example.com/v1"
            className="w-full bg-nord-snow2 dark:bg-nord-polar0 border border-nord-snow0 dark:border-nord-polar2 rounded-md px-3 py-2 focus:ring-2 focus:ring-nord-frost3 focus:border-transparent outline-none transition-all text-nord-polar0 dark:text-nord-snow2"
          />
        </div>

        {validateMutation.isSuccess && (
          <div className="flex items-center text-nord-aurora4 text-sm animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Connection successful! Available models:{" "}
            {validateMutation.data.models.length}
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
