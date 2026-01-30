import React from "react";
import { X } from "lucide-react";

interface TagProps {
  label: string;
  variant: "manual" | "ai";
  onDismiss?: () => void;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  label,
  variant,
  onDismiss,
  className = "",
}) => {
  const isAI = variant === "ai";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
        isAI
          ? "bg-nord-aurora4/10 text-nord-aurora4 border border-nord-aurora4/20"
          : "bg-nord-frost3/10 text-nord-frost3 border border-nord-frost3/20"
      } ${className}`}
    >
      {isAI && <span className="w-1 h-1 rounded-full bg-nord-aurora4" />}
      {label}
      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          title="Dismiss tag"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
