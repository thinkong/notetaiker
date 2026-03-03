import { createContext } from "react";

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
  highContrast: boolean;
  semanticEnabled: boolean;
  semanticFilterNodeId: string | null;
}

export interface GraphStateContextType {
  graphState: GraphState;
  setGraphState: (state: GraphState) => void;
  updateGraphState: (updates: Partial<GraphState>) => void;
  setFilterTags: (tags: string[]) => void;
  setFilterLogic: (logic: "AND" | "OR") => void;
  setLocalNodeId: (nodeId: string | null) => void;
  toggleHighContrast: () => void;
  setSemanticEnabled: (enabled: boolean) => void;
  setSemanticFilterNodeId: (nodeId: string | null) => void;
  clearSemanticFilter: () => void;
}

export const HIGH_CONTRAST_KEY = "notetaiker:graph:high-contrast";

export const defaultState: GraphState = {
  zoom: undefined,
  center: undefined,
  selectedNodeId: null,
  filterTags: [],
  filterLogic: "OR",
  localNodeId: null,
  highContrast: false,
  semanticEnabled: false,
  semanticFilterNodeId: null,
};

export const GraphStateContext = createContext<
  GraphStateContextType | undefined
>(undefined);
