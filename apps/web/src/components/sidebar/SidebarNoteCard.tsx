import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import type { ParsedNote } from "../../types";
import { Markdown } from "../common/Markdown";

interface SidebarNoteCardProps {
  note: ParsedNote;
  onClick?: (noteId: string) => void;
}

export const SidebarNoteCard: React.FC<SidebarNoteCardProps> = ({
  note,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { content, metadata } = note;
  const createdAt = metadata.createdAt
    ? new Date(metadata.createdAt)
    : new Date();

  // Simple title extraction: first line if it starts with #, or just truncate content
  const lines = content.trim().split("\n");
  const firstLine = lines[0] || "";
  const hasTitle = firstLine.startsWith("#");
  const title = hasTitle
    ? firstLine.replace(/^#+\s*/, "")
    : content.trim().slice(0, 40) + (content.length > 40 ? "..." : "");
  const bodyContent = hasTitle
    ? lines.slice(1).join("\n").trim()
    : content.trim();

  return (
    <div
      id={`note-${metadata.id}`}
      className="bg-nord-snow1/50 dark:bg-nord-polar2/50 rounded-lg border border-transparent hover:border-nord-frost3/30 transition-all duration-200 overflow-hidden group cursor-pointer"
      onClick={() => {
        if (onClick && metadata.id) {
          onClick(metadata.id);
        }
      }}
    >
      <div className="w-full p-3 text-left flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-nord-polar1 dark:text-nord-snow2 truncate">
            {title || "Untitled Note"}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-nord-polar3 dark:text-nord-snow1 opacity-60" />
            <time
              className="text-xs text-nord-polar3 dark:text-nord-snow1 opacity-75"
              title={createdAt.toLocaleString()}
            >
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </time>
          </div>
          {metadata.tags && metadata.tags.length > 0 && (
            <div className="flex wrap gap-1 mt-2">
              {metadata.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-nord-frost3/10 text-nord-frost3 dark:text-nord-frost1 text-[10px] font-medium rounded"
                >
                  #{tag}
                </span>
              ))}
              {metadata.tags.length > 3 && (
                <span className="text-[10px] text-nord-polar3 dark:text-nord-snow1 opacity-60">
                  +{metadata.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering card onClick
            setIsExpanded(!isExpanded);
          }}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-nord-snow0 dark:hover:bg-nord-polar1 rounded"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-nord-polar3 dark:text-nord-snow1" />
          ) : (
            <ChevronDown className="w-4 h-4 text-nord-polar3 dark:text-nord-snow1" />
          )}
        </button>
      </div>

      {/* Expanded content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-3 pb-3 pt-1 border-t border-nord-snow1 dark:border-nord-polar3">
          <div className="text-xs max-h-60 overflow-y-auto custom-scrollbar">
            <Markdown content={bodyContent || "*No additional content*"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNoteCard;
