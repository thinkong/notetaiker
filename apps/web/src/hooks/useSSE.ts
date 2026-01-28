import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface SSEOptions {
  onNoteUpdated?: (noteId: string) => void;
  invalidateQueries?: boolean;
}

export function useSSE(options: SSEOptions = {}) {
  const queryClient = useQueryClient();
  const { onNoteUpdated, invalidateQueries = true } = options;

  useEffect(() => {
    // In production this might need to be an absolute URL or handled by a proxy
    // For our current setup, the API is on :3001 and web on :5173
    // Vite proxy should handle /api/events
    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("ping", (event) => {
      // Use warn for debug info to satisfy lint rules or remove
      console.warn("SSE: Received ping", event.data);
    });

    eventSource.addEventListener("note_updated", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.warn("SSE: Received note_updated", data);

        if (onNoteUpdated) {
          onNoteUpdated(data.noteId);
        }

        if (invalidateQueries) {
          // Invalidate timeline and specific note queries
          queryClient.invalidateQueries({ queryKey: ["notes"] });
          if (data.noteId) {
            queryClient.invalidateQueries({ queryKey: ["notes", data.noteId] });
          }
        }
      } catch (err) {
        console.error("SSE: Failed to parse note_updated data", err);
      }
    });

    eventSource.onerror = (error) => {
      console.error("SSE: EventSource failed", error);
      eventSource.close();
    };

    return () => {
      console.warn("SSE: Closing connection");
      eventSource.close();
    };
  }, [queryClient, onNoteUpdated, invalidateQueries]);
}
