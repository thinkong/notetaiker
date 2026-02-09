import { useState, useMemo } from "react";
import { Command } from "cmdk";
import { useQuery } from "@tanstack/react-query";
import { Search, Tag, Settings2, X, Focus, Filter, Brain } from "lucide-react";
import { api } from "../../lib/api";
import { useGraphState } from "../../contexts/GraphStateContext";

export function GraphToolbar() {
  const {
    graphState,
    setFilterTags,
    setFilterLogic,
    setLocalNodeId,
    setSemanticEnabled,
    // setSemanticFilterNodeId, // Will be used when implementing note context filter
    clearSemanticFilter,
  } = useGraphState();
  const { semanticEnabled, semanticFilterNodeId } = graphState;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Get clusters
  // const { data: clusters } = useClusters(); // Will be used when implementing cluster-aware features

  // Fetch notes to extract unique tags
  const { data: notes } = useQuery({
    queryKey: ["notes", "all-tags"],
    queryFn: async () => {
      const res = await api.notes.$get({
        query: {
          limit: "1000", // Get a lot to ensure we have most tags
          offset: "0",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
  });

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes?.forEach((note) => {
      note.metadata.tags?.forEach((tag: string) => tagsSet.add(tag));
      note.metadata.ai_tags?.forEach((tag: string) => tagsSet.add(tag));
    });
    // Remove tags already in filter
    graphState.filterTags.forEach((tag) => tagsSet.delete(tag));
    return Array.from(tagsSet).sort();
  }, [notes, graphState.filterTags]);

  const toggleLogic = () => {
    setFilterLogic(graphState.filterLogic === "AND" ? "OR" : "AND");
  };

  const handleSelectTag = (tag: string) => {
    setFilterTags([...graphState.filterTags, tag]);
    setOpen(false);
    setSearch("");
  };

  const clearLocalView = () => {
    setLocalNodeId(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-nord-snow1/50 dark:bg-nord-polar0/50 backdrop-blur-md border-b border-nord-snow0 dark:border-nord-polar2">
      <div className="flex items-center gap-1 bg-nord-snow2 dark:bg-nord-polar1 rounded-lg border border-nord-snow0 dark:border-nord-polar2 px-2 py-1">
        <Filter className="w-4 h-4 text-nord-polar3 dark:text-nord-snow0" />
        <span className="text-xs font-medium text-nord-polar0 dark:text-nord-snow2">
          Filters
        </span>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-nord-snow2 dark:bg-nord-polar1 hover:bg-nord-snow0 dark:hover:bg-nord-polar2 border border-nord-snow0 dark:border-nord-polar2 text-sm text-nord-polar0 dark:text-nord-snow2 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Add Tag Filter...</span>
      </button>

      <div className="h-6 w-px bg-nord-snow0 dark:border-nord-polar2 mx-1" />

      <button
        onClick={toggleLogic}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
          graphState.filterLogic === "AND"
            ? "bg-nord-frost3 text-white border-nord-frost3"
            : "bg-nord-snow2 dark:bg-nord-polar1 text-nord-polar0 dark:text-nord-snow2 border-nord-snow0 dark:border-nord-polar2"
        }`}
        title={
          graphState.filterLogic === "AND"
            ? "Match ALL selected tags"
            : "Match ANY selected tag"
        }
      >
        <Settings2 className="w-4 h-4" />
        <span>Match: {graphState.filterLogic}</span>
      </button>

      <div className="h-6 w-px bg-nord-snow0 dark:border-nord-polar2 mx-1" />

      <button
        onClick={() => setSemanticEnabled(!semanticEnabled)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
          semanticEnabled
            ? "bg-nord-aurora2 text-white border-nord-aurora2"
            : "bg-nord-snow2 dark:bg-nord-polar1 text-nord-polar0 dark:text-nord-snow2 border-nord-snow0 dark:border-nord-polar2"
        }`}
        title={
          semanticEnabled
            ? "Semantic coloring enabled"
            : "Enable semantic coloring"
        }
      >
        <Brain className="w-4 h-4" />
        <span>Semantic</span>
      </button>

      {graphState.localNodeId && (
        <>
          <div className="h-6 w-px bg-nord-snow0 dark:border-nord-polar2 mx-1" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-nord-frost2/20 text-nord-frost2 border border-nord-frost2/30 text-sm">
            <Focus className="w-4 h-4" />
            <span>Local View Active</span>
            <button
              onClick={clearLocalView}
              className="ml-1 p-0.5 rounded-md hover:bg-nord-frost2/30 transition-colors"
              title="Exit Local View"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}

      {/* Semantic Filter Section */}
      {semanticFilterNodeId && (
        <>
          <div className="h-6 w-px bg-nord-snow0 dark:border-nord-polar2 mx-1" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-nord-aurora3/20 text-nord-aurora3 border border-nord-aurora3/30 text-sm">
            <Brain className="w-4 h-4" />
            <span>Similar Notes</span>
            <button
              onClick={clearSemanticFilter}
              className="ml-1 p-0.5 rounded-md hover:bg-nord-aurora3/30 transition-colors"
              title="Clear Similarity Filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}

      {/* Tag Search Palette (uses Command.Dialog for portal + focus management) */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Search Tags"
        className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh] px-4"
      >
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
        />

        <div className="relative w-full max-w-md bg-nord-snow2 dark:bg-nord-polar1 rounded-xl shadow-2xl border border-nord-snow0 dark:border-nord-polar2 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
          <div className="flex items-center border-b border-nord-snow0 dark:border-nord-polar2 px-4 py-3">
            <Tag className="w-5 h-5 text-nord-polar3 dark:text-nord-snow0 mr-3 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search tags..."
              value={search}
              onValueChange={setSearch}
              className="w-full bg-transparent border-none outline-none text-nord-polar0 dark:text-nord-snow2 placeholder:text-nord-polar3 dark:placeholder:text-nord-polar3 py-1 text-base"
            />
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md hover:bg-nord-snow0 dark:hover:bg-nord-polar2 text-nord-polar3 dark:text-nord-snow0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Command.List className="max-h-[40vh] overflow-y-auto p-2 scrollbar-hide">
            <Command.Empty className="py-8 text-center text-nord-polar3 dark:text-nord-snow0">
              No tags found.
            </Command.Empty>

            {allTags.map((tag) => (
              <Command.Item
                key={tag}
                onSelect={() => handleSelectTag(tag)}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg cursor-default select-none text-nord-polar0 dark:text-nord-snow2 aria-selected:bg-nord-frost3 aria-selected:text-white transition-colors"
              >
                <Tag className="w-4 h-4 opacity-50 group-aria-selected:opacity-100" />
                <span className="flex-1 font-medium">{tag}</span>
              </Command.Item>
            ))}
          </Command.List>

          <div className="flex items-center justify-between border-t border-nord-snow0 dark:border-nord-polar2 px-4 py-2 text-[10px] uppercase tracking-widest text-nord-polar3 dark:text-nord-snow0 bg-nord-snow1/50 dark:bg-nord-polar0/50">
            <span>Navigate with ↑↓, Select with ↵</span>
            <span>ESC to close</span>
          </div>
        </div>
      </Command.Dialog>
    </div>
  );
}
