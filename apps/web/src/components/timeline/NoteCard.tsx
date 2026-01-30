import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Info } from "lucide-react";
import type { Note as ParsedNote } from "../../types";
import { Markdown } from "../common/Markdown";

interface NoteCardProps {
  note: ParsedNote;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const { content, metadata } = note;
  const createdAt = metadata.createdAt
    ? new Date(metadata.createdAt)
    : new Date();

  // Simple title extraction: first line if it starts with #, or just truncate content
  const lines = content.trim().split("\n");
  const firstLine = lines[0] || "";
  const hasTitle = firstLine.startsWith("#");
  const title = hasTitle ? firstLine.replace(/^#+\s*/, "") : "Untitled Note";
  const bodyContent = hasTitle
    ? lines.slice(1).join("\n").trim()
    : content.trim();

  // Filter out content from metadata for display
  const displayMetadata = Object.fromEntries(
    Object.entries(metadata).filter(([key]) => key !== "content"),
  );

  return (
    <div
      id={`note-${metadata.id}`}
      className="bg-nord-snow0 dark:bg-nord-polar1 rounded-lg border border-nord-snow2 dark:border-nord-polar3 p-5 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-nord-frost3 dark:text-nord-frost2 truncate flex-1">
          {title}
        </h3>
        <div className="flex items-center gap-2 ml-4">
          <time
            className="text-xs text-nord-polar3 dark:text-nord-snow1 whitespace-nowrap"
            title={createdAt.toLocaleString()}
          >
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </time>
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`p-1 rounded-full transition-colors ${
              showMetadata
                ? "text-nord-frost3 bg-nord-snow1 dark:bg-nord-polar2"
                : "text-nord-polar3 dark:text-nord-snow1 hover:text-nord-frost3"
            }`}
            title="Toggle Metadata"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showMetadata && (
        <div className="mb-4 p-3 bg-nord-snow1 dark:bg-nord-polar2 rounded text-xs font-mono text-nord-polar3 dark:text-nord-snow1 overflow-x-auto border border-nord-snow2 dark:border-nord-polar3">
          <pre>{JSON.stringify(displayMetadata, null, 2)}</pre>
        </div>
      )}

      <div
        className={`text-sm overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-full" : "max-h-24 line-clamp-3"
        }`}
      >
        <Markdown content={bodyContent} />
      </div>

      {bodyContent.split("\n").length > 3 || bodyContent.length > 200 ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-xs font-medium text-nord-frost3 hover:text-nord-frost2 transition-colors duration-200 focus:outline-none"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      ) : null}

      {metadata.tags && metadata.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {metadata.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-nord-snow2 dark:bg-nord-polar3 text-nord-polar3 dark:text-nord-frost2 text-xs font-medium rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
