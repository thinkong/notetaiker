import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import { SidebarNoteCard } from "./SidebarNoteCard";
import type { Note } from "../../types";

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

export const RelatedNotesPanel: React.FC<RelatedNotesPanelProps> = ({
  noteId,
  onNoteClick,
}) => {
  const {
    data: relatedNotes,
    isLoading,
    isError,
  } = useQuery<SimilarNote[]>({
    queryKey: ["notes", noteId, "related"],
    queryFn: async () => {
      const res = await api.notes[":id"].related.$get({
        param: { id: noteId },
        query: { limit: "5" },
      });
      if (!res.ok) throw new Error("Failed to fetch related notes");
      return res.json() as Promise<SimilarNote[]>;
    },
    enabled: !!noteId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-nord-polar3 dark:text-nord-snow1 opacity-50">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-sm">Finding related notes...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-nord-aurora0">Error loading related notes</p>
      </div>
    );
  }

  if (!relatedNotes || relatedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-nord-polar3 dark:text-nord-snow1 opacity-50">
        <Sparkles className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm font-medium">No related notes found</p>
        <p className="text-xs mt-1">
          Notes are indexed automatically. Try adding more content!
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

        const similarity = Math.max(
          0,
          Math.min(100, Math.round((1 - (related.distance || 0) / 1.5) * 100)),
        );

        return (
          <div key={note.metadata.id} className="relative group">
            <SidebarNoteCard
              note={note}
              onClick={() => note.metadata.id && onNoteClick(note.metadata.id)}
            />
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-nord-frost3/10 text-nord-frost3 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {similarity}% match
            </div>
          </div>
        );
      })}
    </div>
  );
};
