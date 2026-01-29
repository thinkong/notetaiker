import React, { useEffect } from "react";
import { Command } from "cmdk";
import { useQuery } from "@tanstack/react-query";
import { Search, FileText, Calendar, Tag } from "lucide-react";
import { api } from "../../lib/api";
import { format } from "date-fns";

interface SearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectNote: (noteId: string) => void;
}

export function SearchPalette({
  open,
  onOpenChange,
  onSelectNote,
}: SearchPaletteProps) {
  // Fetch notes for searching
  // We fetch a larger batch for searching in the palette
  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes", "search-list"],
    queryFn: async () => {
      const res = await api.notes.$get({
        query: {
          limit: "100",
          offset: "0",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
    enabled: open,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search Notes"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
    >
      <div
        className="fixed inset-0 bg-nord-polar0/40 dark:bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-nord-snow2 dark:bg-nord-polar1 rounded-xl shadow-2xl border border-nord-snow0 dark:border-nord-polar2 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center border-b border-nord-snow0 dark:border-nord-polar2 px-4 py-3">
          <Search className="w-5 h-5 text-nord-polar3 dark:text-nord-snow0 mr-3 shrink-0" />
          <Command.Input
            autoFocus
            placeholder="Search notes, tags, or content..."
            className="w-full bg-transparent border-none outline-none text-nord-polar0 dark:text-nord-snow2 placeholder:text-nord-polar3 dark:placeholder:text-nord-polar3 py-1 text-lg"
          />
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
          <Command.Empty className="py-12 text-center text-nord-polar3 dark:text-nord-snow0">
            No notes found matching your search.
          </Command.Empty>

          {isLoading ? (
            <div className="py-12 text-center text-nord-polar3 dark:text-nord-snow0 animate-pulse">
              Loading notes...
            </div>
          ) : (
            notes?.map((note) => (
              <Command.Item
                key={note.metadata.id}
                onSelect={() => {
                  if (note.metadata.id) {
                    onSelectNote(note.metadata.id);
                    onOpenChange(false);
                  }
                }}
                className="group flex items-center gap-3 px-3 py-3 rounded-lg cursor-default select-none text-nord-polar0 dark:text-nord-snow2 aria-selected:bg-nord-frost3 aria-selected:text-white transition-colors"
              >
                <div className="p-2 rounded-md bg-nord-snow0 dark:bg-nord-polar2 group-aria-selected:bg-nord-frost2 group-aria-selected:text-white">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {note.content.split("\n")[0].replace(/^#+\s*/, "") ||
                      "Untitled Note"}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-nord-polar3 dark:text-nord-snow0 group-aria-selected:text-nord-snow2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {note.metadata.createdAt &&
                        format(
                          new Date(note.metadata.createdAt),
                          "MMM d, yyyy",
                        )}
                    </span>
                    {note.metadata.tags && note.metadata.tags.length > 0 && (
                      <span className="flex items-center gap-1 truncate">
                        <Tag className="w-3 h-3" />
                        {note.metadata.tags.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </Command.Item>
            ))
          )}
        </Command.List>

        <div className="flex items-center justify-between border-t border-nord-snow0 dark:border-nord-polar2 px-4 py-2 text-[10px] uppercase tracking-widest text-nord-polar3 dark:text-nord-snow0 bg-nord-snow1/50 dark:bg-nord-polar0/50">
          <div className="flex gap-4">
            <span>
              <kbd className="font-sans">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="font-sans">↵</kbd> Select
            </span>
          </div>
          <div>
            <span>
              <kbd className="font-sans">ESC</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
}
