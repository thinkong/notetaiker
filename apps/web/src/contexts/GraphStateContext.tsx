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
}

const PINNED_NODES_KEY = "notetaiker:graph:pinned-nodes";

const defaultState: GraphState = {
  zoom: undefined,
  center: undefined,
  selectedNodeId: null,
  filterTags: [],
  filterLogic: "OR",
  localNodeId: null,
  pinnedNodes: {},
};

const GraphStateContext = createContext<GraphStateContextType | undefined>(
  undefined,
);

export function GraphStateProvider({ children }: { children: ReactNode }) {
  const [graphState, setGraphState] = useState<GraphState>(() => {
    // Load pinned nodes from localStorage on mount
    try {
      const stored = localStorage.getItem(PINNED_NODES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "object" && parsed !== null) {
          return { ...defaultState, pinnedNodes: parsed };
        }
      }
    } catch (error) {
      console.warn("Failed to parse pinned nodes from localStorage:", error);
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
