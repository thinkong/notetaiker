import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGraphData } from "../../hooks/useGraphData";
import { ForceGraph } from "./ForceGraph";

export function GraphView() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGraphData();

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
      <main className="flex-1 relative">
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
            data={data}
            onNodeClick={(node) => {
              if (node.type === "note") {
                navigate(`/?id=${node.id}`);
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-nord-polar3 dark:text-nord-snow1">
              No data available.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
