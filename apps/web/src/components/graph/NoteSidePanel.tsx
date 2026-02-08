import { X, Tag as TagIcon, Calendar, Brain } from "lucide-react";
import { type GraphNode } from "../../hooks/useGraphData";
import { Markdown } from "../common/Markdown";
import { Tag } from "../common/Tag";
import { useGraphState } from "../../contexts/GraphStateContext";

interface NoteSidePanelProps {
  node: GraphNode;
  onClose: () => void;
}

export function NoteSidePanel({ node, onClose }: NoteSidePanelProps) {
  const { graphState, setSemanticFilterNodeId } = useGraphState();
  const { semanticEnabled } = graphState;
  const manualTags = node.tags || [];
  const aiTags = node.ai_tags || [];

  const handleFilterBySimilar = () => {
    setSemanticFilterNodeId(node.id);
  };

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-nord-snow2 dark:bg-nord-polar0 border-l border-nord-snow0 dark:border-nord-polar1 shadow-xl flex flex-col z-20 animate-in slide-in-from-right duration-300">
      <header className="p-4 flex items-center justify-between border-b border-nord-snow0 dark:border-nord-polar1 bg-nord-snow2/80 dark:bg-nord-polar0/80 backdrop-blur-sm">
        <h2 className="text-lg font-bold text-nord-polar0 dark:text-nord-snow2 truncate pr-4">
          {node.name}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 text-nord-polar3 dark:text-nord-snow1 hover:text-nord-aurora0 transition-colors rounded-lg hover:bg-nord-snow1 dark:hover:bg-nord-polar2"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {node.type === "note" ? (
          <div className="space-y-6">
            {(manualTags.length > 0 || aiTags.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {manualTags.map((tag) => (
                  <Tag key={`manual-${tag}`} label={tag} variant="manual" />
                ))}
                {aiTags.map((tag) => (
                  <Tag key={`ai-${tag}`} label={tag} variant="ai" />
                ))}
              </div>
            )}
            <Markdown content={node.content || ""} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-nord-polar3 dark:text-nord-snow1 space-y-4">
            <TagIcon className="w-12 h-12 opacity-20" />
            <p className="text-center px-8">
              This is a tag hub for{" "}
              <span className="font-semibold text-nord-frost2">
                {node.name}
              </span>
              . Explore the graph to see all notes associated with this tag.
            </p>
          </div>
        )}
      </div>

      <footer className="p-4 border-t border-nord-snow0 dark:border-nord-polar1 bg-nord-snow1/30 dark:bg-nord-polar1/30 space-y-3">
        {node.type === "note" && semanticEnabled && (
          <button
            onClick={handleFilterBySimilar}
            className="flex items-center gap-2 w-full p-2 rounded-lg text-sm text-nord-polar0 dark:text-nord-snow2 bg-nord-aurora3/20 border border-nord-aurora3/30 hover:bg-nord-aurora3/30 transition-colors"
          >
            <Brain className="w-4 h-4" />
            <span>Show Similar Notes</span>
          </button>
        )}
        <div className="flex items-center gap-2 text-xs text-nord-polar3 dark:text-nord-snow1">
          {node.type === "note" ? (
            <>
              <Calendar className="w-3.5 h-3.5" />
              <span>Note ID: {node.id.substring(0, 8)}...</span>
            </>
          ) : (
            <>
              <TagIcon className="w-3.5 h-3.5" />
              <span>Global Tag Hub</span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
