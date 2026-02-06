import { createContext, useContext, useState, type ReactNode } from "react";

export interface GraphCenter {
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
}

interface GraphStateContextType {
  graphState: GraphState;
  setGraphState: (state: GraphState) => void;
  updateGraphState: (updates: Partial<GraphState>) => void;
  setFilterTags: (tags: string[]) => void;
  setFilterLogic: (logic: "AND" | "OR") => void;
  setLocalNodeId: (nodeId: string | null) => void;
}

const defaultState: GraphState = {
  zoom: undefined,
  center: undefined,
  selectedNodeId: null,
  filterTags: [],
  filterLogic: "OR",
  localNodeId: null,
};

const GraphStateContext = createContext<GraphStateContextType | undefined>(
  undefined,
);

export function GraphStateProvider({ children }: { children: ReactNode }) {
  const [graphState, setGraphState] = useState<GraphState>(defaultState);

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

  return (
    <GraphStateContext.Provider
      value={{
        graphState,
        setGraphState,
        updateGraphState,
        setFilterTags,
        setFilterLogic,
        setLocalNodeId,
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
