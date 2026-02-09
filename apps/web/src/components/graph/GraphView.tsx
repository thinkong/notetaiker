import { useMemo, useRef, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGraphData, type GraphNode } from "../../hooks/useGraphData";
import { ForceGraph, type ForceGraphHandle } from "./ForceGraph";
import { NoteSidePanel } from "./NoteSidePanel";
import { useGraphState } from "../../contexts/GraphStateContext";
import { GraphToolbar } from "./GraphToolbar";
import { GraphFilterChips } from "./GraphFilterChips";
import { ClusterLegend } from "./ClusterLegend";

export function GraphView() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGraphData();
  const { graphState, updateGraphState, setFilterTags, setLocalNodeId } =
    useGraphState();
  const { selectedNodeId } = graphState;

  const setSelectedNodeId = (id: string | null) => {
    updateGraphState({ selectedNodeId: id });
  };
  const graphRef = useRef<ForceGraphHandle>(null);
  const [legendOpen, setLegendOpen] = useState(false);

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

  const isFiltered =
    graphState.filterTags.length > 0 || !!graphState.localNodeId;

  // Calculate visible nodes to check for empty state
  const visibleNodesCount = useMemo(() => {
    if (!data) return 0;
    if (!isFiltered) return data.nodes.length;

    // This logic should match ForceGraph.tsx visibility logic
    const visible = new Set<string>();

    const passesFilter = (node: GraphNode) => {
      if (graphState.filterTags.length === 0) return true;
      const nodeTags = [...(node.tags || []), ...(node.ai_tags || [])].map(
        (t) => t.toLowerCase(),
      );
      const searchTags = graphState.filterTags.map((t) => t.toLowerCase());

      if (graphState.filterLogic === "AND") {
        return searchTags.every((t) => nodeTags.includes(t));
      } else {
        return searchTags.some((t) => nodeTags.includes(t));
      }
    };

    if (graphState.localNodeId) {
      // In local view, at least the center node is visible.
      return 1;
    } else {
      data.nodes.forEach((node) => {
        if (passesFilter(node)) {
          visible.add(node.id);
        }
      });
    }
    return visible.size;
  }, [
    data,
    graphState.filterTags,
    graphState.filterLogic,
    graphState.localNodeId,
    isFiltered,
  ]);

  // Handle external selection filter clearing
  useEffect(() => {
    if (selectedNodeId && data && isFiltered) {
      const node = data.nodes.find((n) => n.id === selectedNodeId);
      if (!node) return;

      const passesFilter = () => {
        if (graphState.filterTags.length === 0) return true;
        const nodeTags = [...(node.tags || []), ...(node.ai_tags || [])].map(
          (t) => t.toLowerCase(),
        );
        const searchTags = graphState.filterTags.map((t) => t.toLowerCase());

        if (graphState.filterLogic === "AND") {
          return searchTags.every((t) => nodeTags.includes(t));
        } else {
          return searchTags.some((t) => nodeTags.includes(t));
        }
      };

      let isVisible = passesFilter();
      if (isVisible && graphState.localNodeId) {
        // In local view, must be center or neighbor. Since we don't have neighborsMap
        // easily accessible here without duplication, and the requirement is to reveal
        // "ghosted" nodes, we'll clear if it's not the focused node to be safe.
        if (graphState.localNodeId !== node.id) {
          isVisible = false;
        }
      }

      if (!isVisible) {
        setFilterTags([]);
        setLocalNodeId(null);
      }
    }
  }, [
    selectedNodeId,
    data,
    isFiltered,
    graphState.filterTags,
    graphState.filterLogic,
    graphState.localNodeId,
    setFilterTags,
    setLocalNodeId,
  ]);

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

      <GraphToolbar />

      <main className="flex-1 relative flex">
        <div
          className={`flex-1 relative transition-colors duration-500 ${
            isFiltered ? "bg-nord-frost3/5 dark:bg-nord-frost3/10" : ""
          }`}
        >
          {/* Cluster Legend */}
          <ClusterLegend
            isOpen={legendOpen}
            onToggle={() => setLegendOpen(!legendOpen)}
          />

          <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
            <div className="pointer-events-auto max-w-2xl">
              <GraphFilterChips />
            </div>
          </div>

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
            <>
              <ForceGraph
                ref={graphRef}
                data={data}
                onNodeClick={(node) => {
                  setSelectedNodeId(node.id);
                }}
                onNodeDoubleClick={(node) => {
                  // Flash the node for visual feedback
                  graphRef.current?.flashNode(node.id);

                  // Navigate to the note editor with the selected note
                  // Small delay to allow the flash animation to be perceived
                  setTimeout(() => {
                    navigate("/", { state: { noteId: node.id } });
                  }, 150);
                }}
                initialZoom={graphState.zoom}
                initialCenter={graphState.center}
              />

              {isFiltered && visibleNodesCount === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/80 dark:bg-nord-polar1/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-nord-snow0 dark:border-nord-polar2 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300 pointer-events-auto">
                    <div className="p-3 rounded-full bg-nord-snow1 dark:bg-nord-polar0 text-nord-polar3 dark:text-nord-snow0">
                      <Info className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-nord-polar0 dark:text-nord-snow2">
                        No matching notes
                      </h3>
                      <p className="text-sm text-nord-polar3 dark:text-nord-snow1 max-w-[250px]">
                        No notes match your current active filters. Try removing
                        some tags.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFilterTags([]);
                        setLocalNodeId(null);
                      }}
                      className="px-4 py-2 bg-nord-frost3 text-white rounded-lg hover:bg-nord-frost2 transition-colors text-sm font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              )}
            </>
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
