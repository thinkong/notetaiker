import { useState, useCallback } from "react";

export function useUnsavedChanges() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const markDirty = useCallback(() => setHasUnsavedChanges(true), []);
  const markClean = useCallback(() => setHasUnsavedChanges(false), []);

  const requestAction = useCallback(
    (action: () => void) => {
      if (hasUnsavedChanges) {
        // Store action, show confirm dialog
        setPendingAction(() => action);
        return false; // Dialog will be shown
      } else {
        // No unsaved changes, execute immediately
        action();
        return true;
      }
    },
    [hasUnsavedChanges]
  );

  const confirmDiscard = useCallback(() => {
    pendingAction?.();
    setPendingAction(null);
    setHasUnsavedChanges(false);
  }, [pendingAction]);

  const cancelAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  return {
    hasUnsavedChanges,
    markDirty,
    markClean,
    requestAction,
    confirmDiscard,
    cancelAction,
    showDialog: pendingAction !== null,
  };
}
