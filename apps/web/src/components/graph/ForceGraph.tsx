import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import { GraphTooltip } from "./GraphTooltip";
import {
  type GraphData,
  type GraphNode,
  type NodeType,
} from "../../hooks/useGraphData";
import { useGraphState } from "../../contexts/GraphStateContext";
import { useClusters, useClusterColors } from "../../hooks/useClusters";
import { blendClusterColors, createGlowGradient } from "../../lib/colorUtils";

export interface ForceGraphHandle {
  getGraphState: () =>
    | { zoom: number; center: { x: number; y: number } }
    | undefined;
  flashNode: (nodeId: string) => void;
}

interface ForceGraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  onNodeDoubleClick?: (node: GraphNode) => void;
  initialZoom?: number;
  initialCenter?: { x: number; y: number };
}

interface InternalNode extends GraphNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface InternalLink {
  source: string | InternalNode;
  target: string | InternalNode;
}

// Accessibility-friendly color palette
// Blue vs Orange provides excellent contrast for most color vision types
const COLORS = {
  note: {
    base: "#2196F3", // bright blue (high visibility)
    hover: "#1976D2", // darker blue on hover
    text: "#ffffff", // white text for contrast
    glow: "rgba(33, 150, 243, 0.5)", // blue glow
    border: "#0D47A1", // dark blue border
  },
  tag: {
    base: "#FF9800", // warm orange (distinct from blue)
    hover: "#F57C00", // darker orange on hover
    text: "#000000", // black text for contrast
    glow: "rgba(255, 152, 0, 0.5)", // orange glow
    border: "#E65100", // dark orange border
  },
  link: "#78909C", // blue-gray for visibility
  linkHighlight: "#2196F3", // match note color
  dimmed: "#546E7A", // muted blue-gray
  dimmedLink: "rgba(84, 110, 122, 0.2)",
};

const NODE_R = {
  note: 6,
  tag: 8,
};

const LABEL_THRESHOLD = 3; // Zoom level to start showing labels

export const ForceGraph = forwardRef<ForceGraphHandle, ForceGraphProps>(
  (
    { data, onNodeClick, onNodeDoubleClick, initialZoom, initialCenter },
    ref,
  ) => {
    const { graphState, setLocalNodeId } = useGraphState();
    const {
      filterTags,
      filterLogic,
      localNodeId,
      semanticEnabled,
      semanticFilterNodeId,
      highContrast,
    } = graphState;

    // Get cluster data
    const { data: clusterData } = useClusters();
    const { colorMap } = useClusterColors(highContrast);

    const fgRef = useRef<
      ForceGraphMethods<InternalNode, InternalLink> | undefined
    >(undefined);
    const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
    const [highlightLinks, setHighlightLinks] = useState(new Set<string>());
    const [flashNodeId, setFlashNodeId] = useState<string | null>(null);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup click timeout on unmount
    useEffect(() => {
      return () => {
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
      };
    }, []);

    useImperativeHandle(ref, () => ({
      getGraphState: () => {
        if (!fgRef.current) return undefined;
        return {
          zoom: fgRef.current.zoom(),
          center: fgRef.current.centerAt(),
        };
      },
      flashNode: (nodeId: string) => {
        setFlashNodeId(nodeId);
        // Reset after animation
        setTimeout(() => setFlashNodeId(null), 300);
      },
    }));

    // Physics setup and auto-zoom
    useEffect(() => {
      if (!fgRef.current) return;

      // Increase charge strength for better separation
      fgRef.current.d3Force("charge")?.strength(-150);
      // Increase link distance
      fgRef.current.d3Force("link")?.distance(50);

      // Initial positioning
      setTimeout(() => {
        if (!fgRef.current) return;

        if (initialZoom !== undefined && initialCenter) {
          // Restore saved state
          fgRef.current.centerAt(initialCenter.x, initialCenter.y, 0);
          fgRef.current.zoom(initialZoom, 0);
        } else {
          // Auto-zoom to fit all nodes on initial load
          fgRef.current.zoomToFit(400, 80);
        }
      }, 200);
    }, [initialZoom, initialCenter]);

    // Pre-calculate favorites for O(1) lookup
    const neighborsMap = useMemo(() => {
      const map = new Map<string, { neighbor: string; linkId: string }[]>();

      data.links.forEach((link) => {
        const source =
          typeof link.source === "object"
            ? (link.source as GraphNode).id
            : link.source;
        const target =
          typeof link.target === "object"
            ? (link.target as GraphNode).id
            : link.target;
        const linkId = `${source}-${target}`;

        if (!map.has(source)) map.set(source, []);
        if (!map.has(target)) map.set(target, []);

        map.get(source)?.push({ neighbor: target, linkId });
        map.get(target)?.push({ neighbor: source, linkId });
      });

      return map;
    }, [data.links]);

    // Calculate visibility for filtering and local view
    const visibleNodes = useMemo(() => {
      const visible = new Set<string>();

      // 1. Initial Filtering by Tags
      const passesFilter = (node: GraphNode) => {
        if (filterTags.length === 0) return true;
        const nodeTags = [...(node.tags || []), ...(node.ai_tags || [])].map(
          (t) => t.toLowerCase(),
        );
        const searchTags = filterTags.map((t) => t.toLowerCase());

        if (filterLogic === "AND") {
          return searchTags.every((t) => nodeTags.includes(t));
        } else {
          return searchTags.some((t) => nodeTags.includes(t));
        }
      };

      // 2. Local View Filter (1-hop)
      if (localNodeId) {
        visible.add(localNodeId);
        const neighbors = neighborsMap.get(localNodeId);
        if (neighbors) {
          neighbors.forEach(({ neighbor }) => {
            const node = data.nodes.find((n) => n.id === neighbor);
            if (node && passesFilter(node)) {
              visible.add(neighbor);
            }
          });
        }
        // If the center node itself doesn't pass the tag filter,
        // we might still want to see it in local view, but usually we filter the whole graph.
        // For now, let's say local view takes precedence on the center, but neighbors must match.
      } else {
        // Just global filter
        data.nodes.forEach((node) => {
          if (passesFilter(node)) {
            visible.add(node.id);
          }
        });
      }

      // 3. Semantic Filter (show only nodes similar to active note)
      if (semanticFilterNodeId && clusterData) {
        const similarNodes = new Set<string>();
        similarNodes.add(semanticFilterNodeId);

        // Add nodes that share clusters with the semantic filter node
        const memberships = clusterData.nodeMemberships[semanticFilterNodeId];
        if (memberships) {
          // Find all nodes in the same clusters (above threshold)
          Object.entries(clusterData.nodeMemberships).forEach(
            ([nodeId, nodeMemberships]) => {
              const hasSharedCluster = nodeMemberships.some((nm) =>
                memberships.some(
                  (m) => m.clusterId === nm.clusterId && nm.weight > 0.3,
                ),
              );
              if (hasSharedCluster) {
                similarNodes.add(nodeId);
              }
            },
          );
        }

        // Intersect with existing visible set
        visible.forEach((nodeId) => {
          if (!similarNodes.has(nodeId)) {
            visible.delete(nodeId);
          }
        });
      }

      return visible;
    }, [
      data.nodes,
      filterTags,
      filterLogic,
      localNodeId,
      neighborsMap,
      semanticFilterNodeId,
      clusterData,
    ]);

    const handleClick = useCallback(
      (node: GraphNode, event: MouseEvent) => {
        if (clickTimeoutRef.current) {
          // Double click detected
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;

          if (event.altKey) {
            // Local view toggle
            if (localNodeId === node.id) {
              setLocalNodeId(null);
            } else {
              setLocalNodeId(node.id);
              if (fgRef.current) {
                fgRef.current.centerAt(node.x, node.y, 1000);
                fgRef.current.zoom(2.5, 1000);
              }
            }
          } else {
            onNodeDoubleClick?.(node);
          }
        } else {
          // Single click logic (delayed)
          clickTimeoutRef.current = setTimeout(() => {
            // "Walk the graph" if in local view and clicking a visible neighbor
            if (
              localNodeId &&
              node.id !== localNodeId &&
              visibleNodes.has(node.id)
            ) {
              setLocalNodeId(node.id);
              if (fgRef.current) {
                fgRef.current.centerAt(node.x, node.y, 1000);
              }
            } else {
              onNodeClick?.(node);
            }
            clickTimeoutRef.current = null;
          }, 300);
        }
      },
      [
        onNodeClick,
        onNodeDoubleClick,
        localNodeId,
        visibleNodes,
        setLocalNodeId,
      ],
    );

    const handleNodeHover = useCallback(
      (node: GraphNode | null) => {
        // Clear any pending hover action
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }

        if (!node) {
          setHoverNode(null);
          setTooltipPos(null);
          setHighlightNodes(new Set());
          setHighlightLinks(new Set());
          return;
        }

        // Delay showing tooltip/highlighting to avoid flickering
        hoverTimeoutRef.current = setTimeout(() => {
          const neighbors = new Set<string>();
          const links = new Set<string>();

          neighbors.add(node.id); // Add self

          const nodeNeighbors = neighborsMap.get(node.id);
          if (nodeNeighbors) {
            nodeNeighbors.forEach(({ neighbor, linkId }) => {
              neighbors.add(neighbor);
              links.add(linkId);
            });
          }

          setHoverNode(node);
          setHighlightNodes(neighbors);
          setHighlightLinks(links);

          // Initial position calculation
          if (fgRef.current) {
            const coords = fgRef.current.graph2ScreenCoords(
              node.x ?? 0,
              node.y ?? 0,
            );
            setTooltipPos(coords);
          }
        }, 200);
      },
      [neighborsMap],
    );

    const onRenderFramePost = useCallback(() => {
      if (hoverNode && fgRef.current) {
        const coords = fgRef.current.graph2ScreenCoords(
          hoverNode.x ?? 0,
          hoverNode.y ?? 0,
        );
        setTooltipPos(coords);
      }
    }, [hoverNode]);

    const paintNode = useCallback(
      (
        node: InternalNode,
        ctx: CanvasRenderingContext2D,
        globalScale: number,
      ) => {
        const { x, y, type, name } = node;
        if (x === undefined || y === undefined) return;

        const isHovered = hoverNode === node;
        const isFlashed = flashNodeId === node.id;
        const isHighlighted = highlightNodes.has(node.id);
        const isVisible = visibleNodes.size === 0 || visibleNodes.has(node.id);
        const isGhosted = !isVisible;
        const isDimmed =
          (highlightNodes.size > 0 && !isHighlighted && !isFlashed) ||
          isGhosted;

        const r = NODE_R[type as NodeType] || 4;
        const nodeColors = COLORS[type as NodeType];
        const isTag = type === "tag";

        // Determine node color (with semantic clustering support)
        let nodeColor = nodeColors.base;
        let glowColors: string[] = [];
        let glowWeights: number[] = [];

        if (semanticEnabled && clusterData && !isTag) {
          // Get node memberships
          const memberships = clusterData.nodeMemberships[node.id];
          if (memberships && memberships.length > 0) {
            // Get colors and weights for blending
            const memberColors = memberships.map(
              (m) => colorMap[m.clusterId] || "#94a3b8",
            );
            const memberWeights = memberships.map((m) => m.weight);

            if (memberships.length === 1) {
              // Single cluster - use that color
              nodeColor = memberColors[0];
              glowColors = memberColors;
              glowWeights = memberWeights;
            } else {
              // Multiple clusters - blend colors
              nodeColor = blendClusterColors(memberColors, memberWeights);
              glowColors = memberColors;
              glowWeights = memberWeights;
            }
          } else {
            // Noise node - use gray
            nodeColor = "#94a3b8";
          }
        }

        const color = isFlashed
          ? "#ffffff" // White flash takes precedence
          : isHovered
            ? nodeColors.hover
            : isDimmed
              ? COLORS.dimmed
              : nodeColor;

        ctx.save();
        if (isGhosted) {
          ctx.globalAlpha = 0.15;
        }

        // Draw glow effect for highlighted/hovered/flashed nodes OR semantic cluster
        const shouldDrawGlow =
          (isHighlighted || isHovered || isFlashed) && !isDimmed;

        if (semanticEnabled && glowColors.length > 0 && !isGhosted) {
          // Draw semantic cluster glow
          ctx.beginPath();
          const glowRadius = r + 8;
          ctx.arc(x, y, glowRadius, 0, 2 * Math.PI, false);

          const gradient = createGlowGradient(
            ctx,
            x,
            y,
            r,
            glowColors,
            glowWeights,
          );
          ctx.fillStyle = gradient;
          ctx.fill();
        } else if (shouldDrawGlow) {
          // Draw standard highlight glow
          ctx.beginPath();
          const glowRadius = isFlashed ? r + 12 : r + 6;
          ctx.arc(x, y, glowRadius, 0, 2 * Math.PI, false);
          const gradient = ctx.createRadialGradient(x, y, r, x, y, glowRadius);
          const glowColor = isFlashed
            ? "rgba(255, 255, 255, 0.8)"
            : nodeColors.glow;
          gradient.addColorStop(0, glowColor);
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Draw node circle
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();

        // Draw border for all nodes (thicker for highlighted, using type-specific colors)
        ctx.strokeStyle = isDimmed
          ? "rgba(84, 110, 122, 0.5)"
          : isHighlighted || isFlashed
            ? "#ffffff"
            : nodeColors.border;
        ctx.lineWidth = isHighlighted || isFlashed ? 3 : 2;
        ctx.stroke();

        // Adaptive Labeling
        const showLabel =
          globalScale > LABEL_THRESHOLD || isHovered || isFlashed;
        if (showLabel) {
          const label = name;
          const fontSize = 12 / globalScale;
          ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Add a small background for better readability
          const textWidth = ctx.measureText(label).width;
          const padding = fontSize * 0.3;
          const bckgDimensions = [textWidth + padding * 2, fontSize + padding];

          // Darker background for better contrast
          ctx.fillStyle = isDimmed
            ? "rgba(200, 200, 200, 0.6)"
            : "rgba(30, 35, 45, 0.85)";
          ctx.beginPath();
          ctx.roundRect(
            x - bckgDimensions[0] / 2,
            y + r + 3,
            bckgDimensions[0],
            bckgDimensions[1],
            3,
          );
          ctx.fill();

          // Light text on dark background for contrast
          ctx.fillStyle = isDimmed ? "rgba(80, 90, 100, 0.8)" : "#eceff4";
          ctx.fillText(label, x, y + r + 3 + bckgDimensions[1] / 2);
        }
        ctx.restore();
      },
      [
        hoverNode,
        highlightNodes,
        flashNodeId,
        visibleNodes,
        semanticEnabled,
        clusterData,
        colorMap,
      ],
    );

    return (
      <div className="relative w-full h-full">
        <ForceGraph2D
          ref={fgRef}
          graphData={data}
          nodeCanvasObject={(node, ctx, globalScale) =>
            paintNode(node as InternalNode, ctx, globalScale)
          }
          nodePointerAreaPaint={(nodeObject, color, ctx) => {
            const node = nodeObject as InternalNode;
            const r = NODE_R[node.type as NodeType] || 4;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x ?? 0, node.y ?? 0, r + 2, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          onNodeClick={(node, event) =>
            handleClick(node as GraphNode, event as MouseEvent)
          }
          onNodeHover={(node) => handleNodeHover(node as GraphNode | null)}
          onRenderFramePost={onRenderFramePost}
          linkColor={useCallback(
            (link: InternalLink) => {
              const source =
                typeof link.source === "object" ? link.source.id : link.source;
              const target =
                typeof link.target === "object" ? link.target.id : link.target;
              const linkId = `${source}-${target}`;

              const sourceVisible =
                visibleNodes.size === 0 || visibleNodes.has(source);
              const targetVisible =
                visibleNodes.size === 0 || visibleNodes.has(target);
              const isGhosted = !sourceVisible || !targetVisible;

              // Use same 15% opacity for ghosted links as nodes
              if (isGhosted) return "rgba(84, 110, 122, 0.15)";

              if (highlightLinks.has(linkId)) return COLORS.linkHighlight;
              return highlightNodes.size > 0 ? COLORS.dimmedLink : COLORS.link;
            },
            [highlightLinks, highlightNodes.size, visibleNodes],
          )}
          linkWidth={useCallback(
            (link: InternalLink) => {
              const source =
                typeof link.source === "object" ? link.source.id : link.source;
              const target =
                typeof link.target === "object" ? link.target.id : link.target;
              const linkId = `${source}-${target}`;
              return highlightLinks.has(linkId) ? 2 : 1;
            },
            [highlightLinks],
          )}
        />
        {hoverNode && tooltipPos && (
          <GraphTooltip node={hoverNode} x={tooltipPos.x} y={tooltipPos.y} />
        )}
      </div>
    );
  },
);
