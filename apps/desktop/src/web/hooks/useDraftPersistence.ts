import { useState, useEffect } from "react";

const DRAFT_KEY = "notetaiker:draft";
const AUTOSAVE_DELAY = 2000;

export function useDraftPersistence() {
  const [draft, setDraft] = useState<string>(() => {
    // Silent restore on mount
    try {
      return localStorage.getItem(DRAFT_KEY) || "";
    } catch {
      return ""; // Graceful fallback
    }
  });

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (draft.trim()) {
          localStorage.setItem(DRAFT_KEY, draft);
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "QuotaExceededError") {
          console.warn("localStorage quota exceeded, draft not saved");
        }
      }
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [draft]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Silent failure OK
    }
    setDraft("");
  };

  return { draft, setDraft, clearDraft, hasDraft: draft.trim().length > 0 };
}
