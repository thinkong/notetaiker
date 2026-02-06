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

    const handleClick = useCallback(
      (node: GraphNode) => {
        if (clickTimeoutRef.current) {
          // Double click detected
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
          onNodeDoubleClick?.(node);
        } else {
          // Single click logic (delayed)
          clickTimeoutRef.current = setTimeout(() => {
            onNodeClick?.(node);
            clickTimeoutRef.current = null;
          }, 300);
        }
      },
      [onNodeClick, onNodeDoubleClick],
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
        const isDimmed =
          highlightNodes.size > 0 && !isHighlighted && !isFlashed;

        const r = NODE_R[type as NodeType] || 4;
        const nodeColors = COLORS[type as NodeType];
        const color = isFlashed
          ? "#ffffff" // White flash
          : isHovered
            ? nodeColors.hover
            : isDimmed
              ? COLORS.dimmed
              : nodeColors.base;

        // Draw glow effect for highlighted/hovered/flashed nodes
        if ((isHighlighted || isHovered || isFlashed) && !isDimmed) {
          ctx.beginPath();
          const glowRadius = isFlashed ? r + 12 : r + 6;
          ctx.arc(x, y, glowRadius, 0, 2 * Math.PI, false);
          const gradient = ctx.createRadialGradient(x, y, r, x, y, glowRadius);
          gradient.addColorStop(
            0,
            isFlashed ? "rgba(255, 255, 255, 0.8)" : nodeColors.glow,
          );
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
      },
      [hoverNode, highlightNodes, flashNodeId],
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
          onNodeClick={(node) => handleClick(node as GraphNode)}
          onNodeHover={(node) => handleNodeHover(node as GraphNode | null)}
          onRenderFramePost={onRenderFramePost}
          linkColor={useCallback(
            (link: InternalLink) => {
              const source =
                typeof link.source === "object" ? link.source.id : link.source;
              const target =
                typeof link.target === "object" ? link.target.id : link.target;
              const linkId = `${source}-${target}`;
              if (highlightLinks.has(linkId)) return COLORS.linkHighlight;
              return highlightNodes.size > 0 ? COLORS.dimmedLink : COLORS.link;
            },
            [highlightLinks, highlightNodes.size],
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
