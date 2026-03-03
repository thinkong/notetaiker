import { X, Tag } from "lucide-react";
import { useGraphState } from "../../contexts/useGraphState";

export function GraphFilterChips() {
  const { graphState, setFilterTags } = useGraphState();

  const removeTag = (tagToRemove: string) => {
    setFilterTags(graphState.filterTags.filter((tag) => tag !== tagToRemove));
  };

  if (graphState.filterTags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {graphState.filterTags.map((tag) => (
        <div
          key={tag}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-nord-frost2 text-white text-xs font-medium shadow-sm animate-in fade-in slide-in-from-left-2 duration-200"
        >
          <Tag className="w-3 h-3" />
          <span>{tag}</span>
          <button
            onClick={() => removeTag(tag)}
            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            title={`Remove ${tag} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {graphState.filterTags.length > 1 && (
        <button
          onClick={() => setFilterTags([])}
          className="text-xs text-nord-polar3 dark:text-nord-snow0 hover:text-nord-aurora0 dark:hover:text-nord-aurora0 transition-colors px-2 py-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
