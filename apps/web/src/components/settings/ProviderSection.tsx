import { useState } from "react";
import { Eye, EyeOff, Globe, Key } from "lucide-react";
import { UseFormRegister } from "react-hook-form";
import { Secrets } from "@notetaiker/env";

interface ProviderSectionProps {
  title: string;
  provider: keyof Secrets;
  description: string;
  register: UseFormRegister<Secrets>;
}

export const ProviderSection = ({
  title,
  provider,
  description,
  register,
}: ProviderSectionProps) => {
  const [showKey, setShowKey] = useState(false);

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
      </div>
    </div>
  );
};
