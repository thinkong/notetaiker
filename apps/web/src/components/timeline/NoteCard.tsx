import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { ParsedNote } from "@notetaiker/api";

interface NoteCardProps {
  note: ParsedNote;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  return (
    <div className="bg-nord-snow0 dark:bg-nord-polar1 rounded-lg border border-nord-snow2 dark:border-nord-polar3 p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-nord-frost3 dark:text-nord-frost2 truncate flex-1">
          {title}
        </h3>
        <time
          className="text-xs text-nord-polar3 dark:text-nord-snow1 ml-4 whitespace-nowrap"
          title={createdAt.toLocaleString()}
        >
          {formatDistanceToNow(createdAt, { addSuffix: true })}
        </time>
      </div>

      <div
        className={`text-nord-polar1 dark:text-nord-snow2 text-sm leading-relaxed overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-full" : "max-h-24 line-clamp-3"
        }`}
      >
        <div className="whitespace-pre-wrap">{bodyContent}</div>
      </div>

      {bodyContent.split("\n").length > 3 || bodyContent.length > 200 ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-xs font-medium text-nord-frost3 hover:text-nord-frost2 transition-colors duration-200 focus:outline-none"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      ) : null}

      {metadata.tags &&
        Array.isArray(metadata.tags) &&
        metadata.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {metadata.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-nord-snow2 dark:bg-nord-polar3 text-nord-polar3 dark:text-nord-frost2 text-[10px] font-medium rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
    </div>
  );
};
