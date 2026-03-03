import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useTimeline } from "../../hooks/useTimeline";
import { NoteCard } from "./NoteCard";
import { SkeletonCard } from "./SkeletonCard";

export const Timeline: React.FC = () => {
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
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-8 text-center bg-nord-aurora0/10 rounded-lg border border-nord-aurora0/20">
        <p className="text-nord-aurora0 font-medium">Error loading notes</p>
        <p className="text-nord-polar3 dark:text-nord-snow1 text-sm mt-1">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <button
          onClick={() => fetchNextPage()}
          className="mt-4 px-4 py-2 bg-nord-frost3 text-white rounded hover:bg-nord-frost2 transition-colors text-sm font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  const allNotes = data?.pages.flat() ?? [];

  if (allNotes.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-nord-snow2 dark:border-nord-polar3 rounded-xl">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-nord-polar1 dark:text-nord-snow2 font-semibold">
          No notes yet
        </h3>
        <p className="text-nord-polar3 dark:text-nord-snow1 text-sm mt-1">
          Start typing above to capture your first thought.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-xl font-bold text-nord-polar1 dark:text-nord-snow2 mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-nord-frost3"></span>
        Recent History
      </h2>

      <div className="space-y-6">
        {allNotes.map((note) => (
          <NoteCard key={note.metadata.id} note={note} />
        ))}
      </div>

      {/* Sentinel element for infinite scroll */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-nord-frost3 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-nord-frost3 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-nord-frost3 animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
      </div>
    </div>
  );
};
