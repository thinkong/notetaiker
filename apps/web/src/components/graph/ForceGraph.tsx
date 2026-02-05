import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import {
  type GraphData,
  type GraphNode,
  type NodeType,
} from "../../hooks/useGraphData";

interface ForceGraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
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

export function ForceGraph({ data, onNodeClick }: ForceGraphProps) {
  const fgRef = useRef<
    ForceGraphMethods<InternalNode, InternalLink> | undefined
  >(undefined);
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>());

  // Physics setup and auto-zoom
  useEffect(() => {
    if (!fgRef.current) return;

    // Increase charge strength for better separation
    fgRef.current.d3Force("charge")?.strength(-150);
    // Increase link distance
    fgRef.current.d3Force("link")?.distance(50);

    // Auto-zoom to fit all nodes on initial load
    // Small delay ensures graph is rendered before zoom
    setTimeout(() => {
      fgRef.current?.zoomToFit(400, 80);
    }, 200);
  }, []);

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

  const handleNodeHover = useCallback(
    (node: GraphNode | null) => {
      if (!node) {
        setHoverNode(null);
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
        return;
      }

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
    },
    [neighborsMap],
  );

  const paintNode = useCallback(
    (
      node: InternalNode,
      ctx: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      const { x, y, type, name } = node;
      if (x === undefined || y === undefined) return;

      const isHovered = hoverNode === node;
      const isHighlighted = highlightNodes.has(node.id);
      const isDimmed = highlightNodes.size > 0 && !isHighlighted;

      const r = NODE_R[type as NodeType] || 4;
      const nodeColors = COLORS[type as NodeType];
      const color = isHovered
        ? nodeColors.hover
        : isDimmed
          ? COLORS.dimmed
          : nodeColors.base;

      // Draw glow effect for highlighted/hovered nodes
      if ((isHighlighted || isHovered) && !isDimmed) {
        ctx.beginPath();
        ctx.arc(x, y, r + 3, 0, 2 * Math.PI, false);
        const gradient = ctx.createRadialGradient(x, y, r, x, y, r + 6);
        gradient.addColorStop(0, nodeColors.glow);
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
        : isHighlighted
          ? "#ffffff"
          : nodeColors.border;
      ctx.lineWidth = isHighlighted ? 3 : 2;
      ctx.stroke();

      // Adaptive Labeling
      const showLabel = globalScale > LABEL_THRESHOLD || isHovered;
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
    [hoverNode, highlightNodes],
  );

  return (
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
      onNodeClick={onNodeClick}
      onNodeHover={(node) => handleNodeHover(node as GraphNode | null)}
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
  );
}
