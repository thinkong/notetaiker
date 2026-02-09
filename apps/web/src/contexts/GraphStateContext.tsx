import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export interface GraphCenter {
  x: number;
  y: number;
}

export interface PinnedNodePosition {
  x: number;
  y: number;
}

export interface GraphState {
  zoom: number | undefined;
  center: GraphCenter | undefined;
  selectedNodeId: string | null;
  filterTags: string[];
  filterLogic: "AND" | "OR";
  localNodeId: string | null;
  pinnedNodes: Record<string, PinnedNodePosition>;
  highContrast: boolean;
  semanticEnabled: boolean;
  semanticFilterNodeId: string | null;
}

interface GraphStateContextType {
  graphState: GraphState;
  setGraphState: (state: GraphState) => void;
  updateGraphState: (updates: Partial<GraphState>) => void;
  setFilterTags: (tags: string[]) => void;
  setFilterLogic: (logic: "AND" | "OR") => void;
  setLocalNodeId: (nodeId: string | null) => void;
  pinNode: (id: string, x: number, y: number) => void;
  unpinNode: (id: string) => void;
  toggleHighContrast: () => void;
  setSemanticEnabled: (enabled: boolean) => void;
  setSemanticFilterNodeId: (nodeId: string | null) => void;
  clearSemanticFilter: () => void;
}

const PINNED_NODES_KEY = "notetaiker:graph:pinned-nodes";

const HIGH_CONTRAST_KEY = "notetaiker:graph:high-contrast";

const defaultState: GraphState = {
  zoom: undefined,
  center: undefined,
  selectedNodeId: null,
  filterTags: [],
  filterLogic: "OR",
  localNodeId: null,
  pinnedNodes: {},
  highContrast: false,
  semanticEnabled: false,
  semanticFilterNodeId: null,
};

const GraphStateContext = createContext<GraphStateContextType | undefined>(
  undefined,
);

export function GraphStateProvider({ children }: { children: ReactNode }) {
  const [graphState, setGraphState] = useState<GraphState>(() => {
    // Load pinned nodes and high contrast from localStorage on mount
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

  const updateGraphState = (updates: Partial<GraphState>) => {
    setGraphState((prev) => ({ ...prev, ...updates }));
  };

  const setFilterTags = (tags: string[]) => {
    updateGraphState({ filterTags: tags });
  };

  const setFilterLogic = (logic: "AND" | "OR") => {
    updateGraphState({ filterLogic: logic });
  };

  const setLocalNodeId = (nodeId: string | null) => {
    updateGraphState({ localNodeId: nodeId });
  };

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

  const setSemanticEnabled = useCallback((enabled: boolean) => {
    updateGraphState({ semanticEnabled: enabled });
    // If disabling, also clear semantic filter
    if (!enabled) {
      updateGraphState({ semanticFilterNodeId: null });
    }
  }, []);

  const setSemanticFilterNodeId = useCallback((nodeId: string | null) => {
    updateGraphState({ semanticFilterNodeId: nodeId });
    // Enable semantic mode when setting a filter
    if (nodeId) {
      updateGraphState({ semanticEnabled: true });
    }
  }, []);

  const clearSemanticFilter = useCallback(() => {
    updateGraphState({ semanticFilterNodeId: null });
  }, []);

  // Persist pinned nodes to localStorage
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

  // Persist high contrast setting to localStorage
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

export function useGraphState() {
  const context = useContext(GraphStateContext);
  if (context === undefined) {
    throw new Error("useGraphState must be used within a GraphStateProvider");
  }
  return context;
}
