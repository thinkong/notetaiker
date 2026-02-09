import { Palette, ChevronLeft } from "lucide-react";
import { useClusters, useClusterColors } from "../../hooks/useClusters";
import { useGraphState } from "../../contexts/GraphStateContext";

interface ClusterLegendProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ClusterLegend({ isOpen, onToggle }: ClusterLegendProps) {
  const { data, isLoading, error } = useClusters();
  const { graphState, toggleHighContrast } = useGraphState();
  const { highContrast } = graphState;
  const { colorMap } = useClusterColors(highContrast);

  // Collapsed state - just show toggle button
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute left-4 top-20 z-10 p-2 rounded-lg bg-nord-snow2 dark:bg-nord-polar1 border border-nord-snow0 dark:border-nord-polar2 shadow-md hover:bg-nord-snow0 dark:hover:bg-nord-polar2 transition-colors"
        title="Show Cluster Legend"
      >
        <Palette className="w-5 h-5 text-nord-polar0 dark:text-nord-snow2" />
      </button>
    );
  }

  // Expanded state - show cluster list
  return (
    <div className="absolute left-4 top-20 z-10 w-64 max-h-[60vh] overflow-y-auto rounded-lg bg-nord-snow2 dark:bg-nord-polar1 border border-nord-snow0 dark:border-nord-polar2 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-nord-snow0 dark:border-nord-polar2">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-nord-polar0 dark:text-nord-snow2" />
          <span className="font-medium text-sm text-nord-polar0 dark:text-nord-snow2">
            Topic Clusters
          </span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-nord-snow0 dark:hover:bg-nord-polar2 transition-colors"
          title="Hide Legend"
        >
          <ChevronLeft className="w-4 h-4 text-nord-polar3 dark:text-nord-snow0" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {isLoading ? (
          <div className="text-sm text-nord-polar3 dark:text-nord-snow0">
            Loading clusters...
          </div>
        ) : error ? (
          <div className="text-sm text-nord-aurora3">
            Failed to load clusters
          </div>
        ) : !data || data.clusters.length === 0 ? (
          <div className="text-sm text-nord-polar3 dark:text-nord-snow0">
            No clusters found. Add more notes to see topic groupings.
          </div>
        ) : (
          <>
            {/* Cluster list */}
            <div className="space-y-2">
              {data.clusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-nord-snow1 dark:bg-nord-polar0/50"
                >
                  {/* Color indicator */}
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white dark:border-nord-polar2 shadow-sm"
                    style={{ backgroundColor: colorMap[cluster.id] }}
                  />

                  {/* Label and count */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-nord-polar0 dark:text-nord-snow2 truncate">
                      {cluster.label}
                    </div>
                    <div className="text-xs text-nord-polar3 dark:text-nord-snow0">
                      {cluster.nodeCount} notes
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Noise count */}
            {data.noiseNodeIds.length > 0 && (
              <div className="pt-2 border-t border-nord-snow0 dark:border-nord-polar2">
                <div className="text-xs text-nord-polar3 dark:text-nord-snow0">
                  {data.noiseNodeIds.length} unclustered notes
                </div>
              </div>
            )}

            {/* Accessibility toggle */}
            <button
              onClick={toggleHighContrast}
              className="flex items-center justify-center gap-2 w-full p-2 rounded-lg text-sm text-nord-polar0 dark:text-nord-snow2 hover:bg-nord-snow0 dark:hover:bg-nord-polar2 transition-colors"
            >
              {highContrast ? (
                <>
                  <Palette className="w-4 h-4" />
                  Standard Colors
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4" />
                  High Contrast
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
