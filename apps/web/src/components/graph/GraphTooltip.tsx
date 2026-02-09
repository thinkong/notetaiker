import React from "react";
import { type GraphNode } from "../../hooks/useGraphData";

interface GraphTooltipProps {
  node: GraphNode;
  x: number;
  y: number;
}

export function GraphTooltip({ node, x, y }: GraphTooltipProps) {
  // Extract a brief excerpt from content, handling potential markdown
  const excerpt = React.useMemo(() => {
    if (!node.content) return "";
    // Simple strip of markdown chars for cleaner preview
    return node.content
      .replace(/[#*`_]/g, "")
      .slice(0, 150)
      .trim();
  }, [node.content]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -120%)", // Position above the node
        pointerEvents: "none", // Allow clicks to pass through to the graph
        zIndex: 50,
      }}
      className="max-w-xs w-64 backdrop-blur-md bg-white/90 dark:bg-nord-polar1/90
                 border border-nord-snow3 dark:border-nord-polar3
                 shadow-xl rounded-lg p-3 text-sm transition-opacity duration-200"
    >
      <h3 className="font-bold text-nord-polar0 dark:text-nord-snow2 mb-1 truncate">
        {node.name}
      </h3>
      {excerpt && (
        <p className="text-nord-polar3 dark:text-nord-snow1 line-clamp-3 leading-relaxed opacity-90">
          {excerpt}
        </p>
      )}
    </div>
  );
}
