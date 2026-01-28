import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { Secrets } from "@notetaiker/env";
import { ProviderSection } from "./ProviderSection";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<Secrets>();

  const onSubmit = (data: Secrets) => {
    // In next plan we will implement the actual save logic with useMutation
    void data;
  };

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
          />
          <ProviderSection
            title="Anthropic"
            provider="anthropic"
            description="Use Claude 3, Claude 2.1, etc."
            register={register}
          />
          <ProviderSection
            title="Gemini"
            provider="gemini"
            description="Use Google's Gemini Pro or Ultra models."
            register={register}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-nord-snow0 dark:border-nord-polar1">
          <button
            type="submit"
            className="flex items-center px-6 py-2 bg-nord-frost3 hover:bg-nord-frost2 text-white font-medium rounded-md shadow-sm transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
