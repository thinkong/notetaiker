import { useState, useCallback, useMemo, useEffect } from "react";
import debounce from "lodash.debounce";
import { api } from "../lib/api";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useDebouncedSave(delay = 1000) {
  const [status, setStatus] = useState<SaveStatus>("idle");

  const save = useCallback(async (content: string) => {
    if (!content.trim()) {
      setStatus("idle");
      return;
    }

    setStatus("saving");
    try {
      const res = await api.notes.$post({
        json: { content },
      });

      if (res.ok) {
        setStatus("saved");
      } else {
        console.error("Save failed with status:", res.status);
        setStatus("error");
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      setStatus("error");
    }
  }, []);

  const debouncedSave = useMemo(() => debounce(save, delay), [save, delay]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const handleContentChange = useCallback(
    (content: string) => {
      // Don't mark as saving if content is empty (to avoid flicker on initial load if we had one)
      // But for now, we follow the "typing triggers saving" logic
      if (content.trim()) {
        setStatus("saving");
      }
      debouncedSave(content);
    },
    [debouncedSave],
  );

  return {
    status,
    save: handleContentChange,
  };
}
