import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, BrainCircuit } from "lucide-react";
import { api } from "../../lib/api";
import { SidebarNoteCard } from "./SidebarNoteCard";
import type { Note } from "../../types";
import { useDebounce } from "../../hooks/useDebounce";

interface RelatedNotesPanelProps {
  noteId: string;
  onNoteClick: (id: string) => void;
}

interface SimilarNote {
  noteId: string;
  distance: number;
  excerpt: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  ai_tags?: string[];
}

const getSimilarityLabel = (distance: number) => {
  if (distance < 0.25) {
    return { label: "High", color: "text-green-500 bg-green-500/10" };
  }
  if (distance < 0.45) {
    return { label: "Medium", color: "text-blue-500 bg-blue-500/10" };
  }
  return {
    label: "Low",
    color:
      "text-nord-polar3 dark:text-nord-snow1 bg-nord-polar3/10 dark:bg-nord-snow1/10",
  };
};

export const RelatedNotesPanel: React.FC<RelatedNotesPanelProps> = ({
  noteId,
  onNoteClick,
}) => {
  // Debounce the noteId to prevent API thrashing while navigating quickly
  const debouncedNoteId = useDebounce(noteId, 400);

  const {
    data: relatedNotes,
    isLoading,
    isError,
  } = useQuery<SimilarNote[]>({
    queryKey: ["notes", debouncedNoteId, "related"],
    queryFn: async () => {
      const res = await api.notes[":id"].related.$get({
        param: { id: debouncedNoteId },
        query: { limit: "5" },
      });
      if (!res.ok) throw new Error("Failed to fetch related notes");
      return res.json() as Promise<SimilarNote[]>;
    },
    enabled: !!debouncedNoteId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Show a transitional loading state if the noteId has changed but we haven't fetched yet (debounce period)
  // or if we are actively fetching data
  const isTransitioning = noteId !== debouncedNoteId;

  if (isTransitioning || (isLoading && !relatedNotes)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-nord-polar3 dark:text-nord-snow1 opacity-50 animate-pulse">
        <BrainCircuit className="w-8 h-8 mb-2" />
        <p className="text-sm">Analyzing connections...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-nord-aurora0">Unable to load connections</p>
      </div>
    );
  }

  if (!relatedNotes || relatedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-nord-polar3 dark:text-nord-snow1 opacity-50">
        <Sparkles className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm font-medium">No related notes found</p>
        <p className="text-xs mt-1 max-w-[200px]">
          As you write more notes, the AI will find connections automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {relatedNotes.map((related) => {
        // Map SimilarNote (from API) to Note (for SidebarNoteCard)
        const note: Note = {
          content: related.excerpt || "",
          metadata: {
            ...related,
            id: related.noteId,
          },
        };

        const { label, color } = getSimilarityLabel(related.distance);

        return (
          <div key={note.metadata.id} className="relative group">
            <SidebarNoteCard
              note={note}
              onClick={() => note.metadata.id && onNoteClick(note.metadata.id)}
            />
            {/* Similarity Badge */}
            <div
              className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider opacity-90 transition-opacity ${color}`}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
