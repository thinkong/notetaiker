import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Tag } from "../common/Tag";

interface TagManagerProps {
  tags: string[];
  aiTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onDismissAiTag: (tag: string) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({
  tags,
  aiTags,
  onAddTag,
  onRemoveTag,
  onDismissAiTag,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTag(inputValue.trim().toLowerCase());
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 mb-2">
      {/* Manual Tags */}
      {tags.map((tag) => (
        <Tag
          key={`manual-${tag}`}
          label={tag}
          variant="manual"
          onDismiss={() => onRemoveTag(tag)}
        />
      ))}

      {/* AI Tags */}
      {aiTags.map((tag) => (
        <Tag
          key={`ai-${tag}`}
          label={tag}
          variant="ai"
          onDismiss={() => onDismissAiTag(tag)}
        />
      ))}

      {/* Add Tag Input */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add tag..."
          className="pl-2 pr-8 py-1 text-xs bg-nord-snow1 dark:bg-nord-polar2 border border-nord-snow0 dark:border-nord-polar1 rounded-full focus:outline-none focus:ring-1 focus:ring-nord-frost3 w-24 transition-all focus:w-32"
        />
        <button
          type="submit"
          className="absolute right-2 text-nord-polar3 dark:text-nord-snow1 hover:text-nord-frost3 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
