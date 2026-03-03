import { useState, useCallback, useEffect, type ReactNode } from "react";
import {
  type GraphState,
  GraphStateContext,
  PINNED_NODES_KEY,
  HIGH_CONTRAST_KEY,
  defaultState,
} from "./graphStateDefs";

export function GraphStateProvider({ children }: { children: ReactNode }) {
  const [graphState, setGraphState] = useState<GraphState>(() => {
    try {
      const pinnedStored = localStorage.getItem(PINNED_NODES_KEY);
      const highContrastStored = localStorage.getItem(HIGH_CONTRAST_KEY);
      const initialState: Partial<GraphState> = {};

      if (pinnedStored) {
        const parsed = JSON.parse(pinnedStored);
        if (typeof parsed === "object" && parsed !== null) {
          initialState.pinnedNodes = parsed;
        }
      }

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

  const pinNode = useCallback((id: string, x: number, y: number) => {
    setGraphState((prev) => ({
      ...prev,
      pinnedNodes: { ...prev.pinnedNodes, [id]: { x, y } },
    }));
  }, []);

  const unpinNode = useCallback((id: string) => {
    setGraphState((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = prev.pinnedNodes;
      return { ...prev, pinnedNodes: rest };
    });
  }, []);

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
        PINNED_NODES_KEY,
        JSON.stringify(graphState.pinnedNodes),
      );
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.warn("localStorage quota exceeded, pinned nodes not saved");
      } else {
        console.warn("Failed to save pinned nodes to localStorage:", error);
      }
    }
  }, [graphState.pinnedNodes]);

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
        pinNode,
        unpinNode,
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
