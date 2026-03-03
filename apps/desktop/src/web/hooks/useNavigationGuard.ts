import { useEffect, useCallback, useState } from "react";
import { useBlocker } from "react-router-dom";

interface UseNavigationGuardProps {
  isDirty: boolean;
  onSave?: () => Promise<void> | void;
}

export function useNavigationGuard({
  isDirty,
  onSave,
}: UseNavigationGuardProps) {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // 1. Browser-level protection (refresh/tab close)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = ""; // Standard way to trigger browser confirm
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 2. In-app navigation protection (Route changes)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  const proceed = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [blocker, pendingAction]);

  const reset = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
    setPendingAction(null);
  }, [blocker]);

  const saveAndProceed = useCallback(async () => {
    if (onSave) {
      await onSave();
    }
    proceed();
  }, [onSave, proceed]);

  // 3. Auto-proceed watchdog
  // If the content becomes clean while a navigation is blocked, proceed automatically
  useEffect(() => {
    if (!isDirty && (blocker.state === "blocked" || pendingAction !== null)) {
      // Defer proceed to avoid synchronous state update in effect
      const t = setTimeout(proceed, 0);
      return () => clearTimeout(t);
    }
  }, [isDirty, blocker.state, pendingAction, proceed]);

  // 4. Manual action protection (Internal state changes like "New Note")
  const requestAction = useCallback(
    (action: () => void) => {
      if (isDirty) {
        setPendingAction(() => action);
        return false;
      } else {
        action();
        return true;
      }
    },
    [isDirty],
  );

  return {
    isBlocked: blocker.state === "blocked" || pendingAction !== null,
    proceed,
    reset,
    saveAndProceed,
    requestAction,
  };
}
