import { Command } from "cmdk";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Edit, Calendar, Tag as TagIcon } from "lucide-react";
import { api } from "../../lib/api";
import { Markdown } from "../common/Markdown";
import { Tag } from "../common/Tag";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { format } from "date-fns";
import { useState, useMemo } from "react";

interface NotePreviewOverlayProps {
  noteId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (noteId: string) => void;
}

export function NotePreviewOverlay({
  noteId,
  open,
  onClose,
  onEdit,
}: NotePreviewOverlayProps) {
  const queryClient = useQueryClient();
  const [tagToDelete, setTagToDelete] = useState<{
    label: string;
    variant: "manual" | "ai";
  } | null>(null);

  // Fetch note data
  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      if (!noteId) return null;
      const res = await api.notes[":id"].$get({ param: { id: noteId } });
      if (!res.ok) throw new Error("Failed to fetch note");
      return res.json();
    },
    enabled: open && !!noteId,
  });

  const updateMetadataMutation = useMutation({
    mutationFn: async (metadata: Record<string, unknown>) => {
      if (!noteId) return;
      const res = await api.notes[":id"].$patch({
        param: { id: noteId },
        json: { metadata },
      });
      if (!res.ok) throw new Error("Failed to update note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
      setTagToDelete(null);
    },
  });

  const { manualTags, aiTags } = useMemo(() => {
    if (!note) return { manualTags: [], aiTags: [] };
    const manual = (note.metadata.tags || []) as string[];
    const ai = (note.metadata.ai_tags || []) as string[];

    // Filter out manual tags from AI tags to avoid duplicates
    const filteredAi = ai.filter((t) => !manual.includes(t));

    return { manualTags: manual, aiTags: filteredAi };
  }, [note]);

  const MAX_VISIBLE_TAGS = 8;
  const allTags = useMemo(() => {
    const combined = [
      ...manualTags.map((t) => ({ label: t, variant: "manual" as const })),
      ...aiTags.map((t) => ({ label: t, variant: "ai" as const })),
    ];
    return combined;
  }, [manualTags, aiTags]);

  const visibleTags = allTags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTagsCount = allTags.length - MAX_VISIBLE_TAGS;

  const handleDeleteTag = () => {
    if (!tagToDelete || !note) return;

    const metadata = { ...note.metadata };
    if (tagToDelete.variant === "manual") {
      metadata.tags = (metadata.tags || []).filter(
        (t: string) => t !== tagToDelete.label,
      );
    } else {
      metadata.ai_tags = (metadata.ai_tags || []).filter(
        (t: string) => t !== tagToDelete.label,
      );
    }

    updateMetadataMutation.mutate(metadata);
  };

  // Extract title from content (first # line)
  const title =
    note?.content
      .split("\n")
      .find((line) => line.startsWith("#"))
      ?.replace(/^#+\s*/, "") || "Untitled Note";

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onClose}
      label="Note Preview"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* Backdrop - click outside to close */}
      <div
        className="fixed inset-0 bg-nord-polar0/40 dark:bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content overlay */}
      <div className="relative w-full max-w-3xl bg-nord-snow2 dark:bg-nord-polar1 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 max-h-[85vh]">
        {/* Header with close button */}
        <div className="flex items-center justify-between border-b border-nord-snow0 dark:border-nord-polar2 px-6 py-4">
          <h2 className="text-xl font-semibold text-nord-polar0 dark:text-nord-snow2 truncate">
            {isLoading ? "Loading..." : title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-nord-snow0 dark:hover:bg-nord-polar2 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5 text-nord-polar3 dark:text-nord-snow0" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="py-12 text-center text-nord-polar3 dark:text-nord-snow0 animate-pulse">
              Loading note...
            </div>
          )}

          {error && (
            <div className="py-12 text-center text-nord-aurora0 dark:text-nord-aurora1">
              Failed to load note. Please try again.
            </div>
          )}

          {note && !isLoading && !error && (
            <div className="space-y-4">
              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-nord-polar3 dark:text-nord-snow0 pb-4 border-b border-nord-snow0 dark:border-nord-polar2">
                {note.metadata.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(note.metadata.createdAt), "MMM d, yyyy")}
                  </span>
                )}
                {(manualTags.length > 0 || aiTags.length > 0) && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <TagIcon className="w-4 h-4 mr-1 shrink-0" />
                    {visibleTags.map((tag) => (
                      <Tag
                        key={`${tag.variant}-${tag.label}`}
                        label={tag.label}
                        variant={tag.variant}
                        onDismiss={() =>
                          setTagToDelete({
                            label: tag.label,
                            variant: tag.variant,
                          })
                        }
                      />
                    ))}
                    {remainingTagsCount > 0 && (
                      <span className="text-xs text-nord-polar3 dark:text-nord-snow0 font-medium">
                        +{remainingTagsCount} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Markdown content */}
              <Markdown content={note.content} />
            </div>
          )}
        </div>

        {/* Footer with Edit button */}
        {note && !isLoading && !error && (
          <div className="border-t border-nord-snow0 dark:border-nord-polar2 px-6 py-4 bg-nord-snow1/50 dark:bg-nord-polar0/50">
            <button
              onClick={() => {
                if (onEdit && noteId) {
                  onEdit(noteId);
                } else {
                  onClose();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-nord-frost3 text-white rounded-lg hover:bg-nord-frost2 transition-colors font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!tagToDelete}
        onSave={handleDeleteTag}
        onDiscard={() => setTagToDelete(null)}
        onCancel={() => setTagToDelete(null)}
        title="Remove Tag"
        description={`Are you sure you want to remove the tag "${tagToDelete?.label}"?`}
        saveLabel="Remove"
      />
    </Command.Dialog>
  );
}
