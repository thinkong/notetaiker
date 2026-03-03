import { useContext } from "react";
import { GraphStateContext } from "./graphStateDefs";

export function useGraphState() {
  const context = useContext(GraphStateContext);
  if (context === undefined) {
    throw new Error("useGraphState must be used within a GraphStateProvider");
  }
  return context;
}
