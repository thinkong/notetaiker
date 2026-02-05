import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useTimeline } from "../../hooks/useTimeline";
import { SidebarNoteCard } from "./SidebarNoteCard";
import { FileText } from "lucide-react";

interface SidebarTimelineProps {
  onNoteClick?: (noteId: string) => void;
  activeNoteId?: string | null;
}

export const SidebarTimeline: React.FC<SidebarTimelineProps> = ({
  onNoteClick,
  activeNoteId,
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useTimeline();

  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === "pending") {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-nord-snow1 dark:bg-nord-polar2 rounded-lg h-16"
          />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-4 text-center">
        <p className="text-nord-aurora0 text-sm font-medium">
          Error loading notes
        </p>
        <p className="text-nord-polar3 dark:text-nord-snow1 text-xs mt-1">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <button
          onClick={() => fetchNextPage()}
          className="mt-3 px-3 py-1.5 bg-nord-frost3 text-white rounded-md hover:bg-nord-frost2 transition-colors text-xs font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  const allNotes = data?.pages.flat() ?? [];

  if (allNotes.length === 0) {
    return (
      <div className="p-8 text-center">
        <FileText className="w-12 h-12 text-nord-polar3 dark:text-nord-snow1 mx-auto mb-3 opacity-50" />
        <h3 className="text-nord-polar2 dark:text-nord-snow1 font-medium text-sm">
          No notes yet
        </h3>
        <p className="text-nord-polar3 dark:text-nord-snow1 text-xs mt-1 opacity-75">
          Start typing to capture your first thought.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {allNotes.map((note, idx) => (
        <SidebarNoteCard
          key={note.metadata.id || idx}
          note={note}
          active={note.metadata.id === activeNoteId}
          onClick={onNoteClick}
        />
      ))}

      {/* Sentinel element for infinite scroll */}
      <div ref={ref} className="h-8 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-nord-frost3 animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-nord-frost3 animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-nord-frost3 animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarTimeline;
