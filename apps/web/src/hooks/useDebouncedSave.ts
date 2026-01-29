import { useState, useCallback, useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import { api } from "../lib/api";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useDebouncedSave(delay = 1000) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const noteIdRef = useRef<string | null>(null);
  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null);

  // Initialize/update debounced function
  useEffect(() => {
    debouncedSaveRef.current = debounce(async (content: string) => {
      if (!content.trim()) {
        setStatus("idle");
        return;
      }

      setStatus("saving");
      try {
        const res = await api.notes.$post({
          json: {
            content,
            id: noteIdRef.current || undefined,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data && "metadata" in data && data.metadata.id) {
            noteIdRef.current = data.metadata.id;
          }
          setStatus("saved");
        } else {
          console.error("Save failed with status:", res.status);
          setStatus("error");
        }
      } catch (error) {
        console.error("Failed to save note:", error);
        setStatus("error");
      }
    }, delay);

    return () => {
      debouncedSaveRef.current?.cancel();
    };
  }, [delay]);

  const saveImmediately = useCallback(async (content: string) => {
    if (!content.trim()) return;

    debouncedSaveRef.current?.cancel();
    setStatus("saving");

    try {
      const res = await api.notes.$post({
        json: {
          content,
          id: noteIdRef.current || undefined,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && "metadata" in data && data.metadata.id) {
          noteIdRef.current = data.metadata.id;
        }
        setStatus("saved");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      setStatus("error");
    }
  }, []);

  const handleContentChange = useCallback((content: string) => {
    if (content.trim()) {
      setStatus("saving");
    }
    debouncedSaveRef.current?.(content);
  }, []);

  return {
    status,
    save: handleContentChange,
    forceSave: saveImmediately,
  };
}
