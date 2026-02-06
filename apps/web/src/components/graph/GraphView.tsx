import { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGraphData } from "../../hooks/useGraphData";
import { ForceGraph, type ForceGraphHandle } from "./ForceGraph";
import { NoteSidePanel } from "./NoteSidePanel";
import { useGraphState } from "../../contexts/GraphStateContext";

export function GraphView() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGraphData();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { graphState, updateGraphState } = useGraphState();
  const graphRef = useRef<ForceGraphHandle>(null);

  // Save state on unmount
  useEffect(() => {
    const graph = graphRef.current;
    return () => {
      if (graph) {
        const state = graph.getGraphState();
        if (state) {
          updateGraphState({ zoom: state.zoom, center: state.center });
        }
      }
    };
  }, [updateGraphState]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !data) return null;
    return data.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, data]);

  return (
    <div className="flex flex-col h-screen bg-nord-snow2 dark:bg-nord-polar0 overflow-hidden">
      <header className="p-4 flex items-center gap-4 border-b border-nord-snow0 dark:border-nord-polar1 z-10 bg-nord-snow2/80 dark:bg-nord-polar0/80 backdrop-blur-sm">
        <button
          onClick={() => navigate("/")}
          className="p-2 text-nord-polar3 dark:text-nord-snow1 hover:text-nord-frost3 transition-all rounded-full hover:bg-nord-snow1 dark:hover:bg-nord-polar2 active:scale-95"
          aria-label="Back to Capture"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-nord-polar0 dark:text-nord-snow2">
          Graph View
        </h1>
      </header>
      <main className="flex-1 relative flex">
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-nord-frost2" />
              <p className="text-nord-polar3 dark:text-nord-snow1">
                Loading knowledge graph...
              </p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-nord-aurora0">Error loading graph data.</p>
            </div>
          ) : data ? (
            <ForceGraph
              ref={graphRef}
              data={data}
              onNodeClick={(node) => {
                setSelectedNodeId(node.id);
              }}
              initialZoom={graphState.zoom}
              initialCenter={graphState.center}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-nord-polar3 dark:text-nord-snow1">
                No data available.
              </p>
            </div>
          )}
        </div>

        {selectedNode && (
          <NoteSidePanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </main>
    </div>
  );
}
