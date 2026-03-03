import { useState, useCallback, useEffect, type ReactNode } from "react";
import {
  type GraphState,
  GraphStateContext,
  HIGH_CONTRAST_KEY,
  defaultState,
} from "./graphStateDefs";

export function GraphStateProvider({ children }: { children: ReactNode }) {
  const [graphState, setGraphState] = useState<GraphState>(() => {
    try {
      const highContrastStored = localStorage.getItem(HIGH_CONTRAST_KEY);
      const initialState: Partial<GraphState> = {};

      if (highContrastStored) {
        const parsed = JSON.parse(highContrastStored);
        if (typeof parsed === "boolean") {
          initialState.highContrast = parsed;
        }
      }

      return { ...defaultState, ...initialState };
    } catch (error) {
      console.warn("Failed to parse localStorage state:", error);
    }
    return defaultState;
  });

  const updateGraphState = useCallback((updates: Partial<GraphState>) => {
    setGraphState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setFilterTags = useCallback(
    (tags: string[]) => {
      updateGraphState({ filterTags: tags });
    },
    [updateGraphState],
  );

  const setFilterLogic = useCallback(
    (logic: "AND" | "OR") => {
      updateGraphState({ filterLogic: logic });
    },
    [updateGraphState],
  );

  const setLocalNodeId = useCallback(
    (nodeId: string | null) => {
      updateGraphState({ localNodeId: nodeId });
    },
    [updateGraphState],
  );

  const toggleHighContrast = useCallback(() => {
    setGraphState((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const setSemanticEnabled = useCallback(
    (enabled: boolean) => {
      updateGraphState({
        semanticEnabled: enabled,
        ...(enabled ? {} : { semanticFilterNodeId: null }),
      });
    },
    [updateGraphState],
  );

  const setSemanticFilterNodeId = useCallback(
    (nodeId: string | null) => {
      updateGraphState({
        semanticFilterNodeId: nodeId,
        ...(nodeId ? { semanticEnabled: true } : {}),
      });
    },
    [updateGraphState],
  );

  const clearSemanticFilter = useCallback(() => {
    updateGraphState({ semanticFilterNodeId: null });
  }, [updateGraphState]);

  useEffect(() => {
    try {
      localStorage.setItem(
        HIGH_CONTRAST_KEY,
        JSON.stringify(graphState.highContrast),
      );
    } catch (error) {
      console.warn(
        "Failed to save high contrast setting to localStorage:",
        error,
      );
    }
  }, [graphState.highContrast]);

  return (
    <GraphStateContext.Provider
      value={{
        graphState,
        setGraphState,
        updateGraphState,
        setFilterTags,
        setFilterLogic,
        setLocalNodeId,
        toggleHighContrast,
        setSemanticEnabled,
        setSemanticFilterNodeId,
        clearSemanticFilter,
      }}
    >
      {children}
    </GraphStateContext.Provider>
  );
}
