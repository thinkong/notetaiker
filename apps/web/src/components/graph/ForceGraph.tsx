import { useCallback, useEffect, useRef, useState } from "react";
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

const COLORS = {
  note: {
    base: "#88c0d0", // nord8 (frost)
    hover: "#81a1c1", // nord9 (frost)
    text: "#2e3440", // nord0 (polar)
  },
  tag: {
    base: "#b48ead", // nord15 (aurora)
    hover: "#a3be8c", // nord14 (aurora) - using green for hover variety or just lighter purple
    text: "#2e3440",
  },
  link: "#d8dee9", // nord4 (snow)
  linkHighlight: "#81a1c1", // nord9
  dimmed: "#4c566a", // nord3 (polar)
};

const NODE_R = {
  note: 4,
  tag: 6,
};

const LABEL_THRESHOLD = 3; // Zoom level to start showing labels

export function ForceGraph({ data, onNodeClick }: ForceGraphProps) {
  const fgRef = useRef<ForceGraphMethods | null>(null);
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>());

  // Physics setup
  useEffect(() => {
    if (!fgRef.current) return;

    // Increase charge strength for better separation
    fgRef.current.d3Force("charge")?.strength(-150);
    // Increase link distance
    fgRef.current.d3Force("link")?.distance(50);
  }, []);

  const handleNodeHover = useCallback(
    (node: GraphNode | null) => {
      const neighbors = new Set<string>();
      const links = new Set<string>();

      if (node) {
        neighbors.add(node.id);
        data.links.forEach((link) => {
          // react-force-graph replaces string IDs with object references
          const source =
            typeof link.source === "object"
              ? (link.source as GraphNode).id
              : link.source;
          const target =
            typeof link.target === "object"
              ? (link.target as GraphNode).id
              : link.target;

          if (source === node.id || target === node.id) {
            neighbors.add(source);
            neighbors.add(target);
            links.add(`${source}-${target}`);
          }
        });
      }

      setHoverNode(node);
      setHighlightNodes(neighbors);
      setHighlightLinks(links);
    },
    [data],
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
      const color = isHovered
        ? COLORS[type as NodeType].hover
        : isDimmed
          ? COLORS.dimmed
          : COLORS[type as NodeType].base;

      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();

      // Draw border for tags or highlighted nodes
      if (type === "tag" || isHighlighted) {
        ctx.strokeStyle = isHighlighted ? "#eceff4" : "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Adaptive Labeling
      const showLabel = globalScale > LABEL_THRESHOLD || isHovered;
      if (showLabel) {
        const label = name;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isDimmed
          ? "rgba(76, 86, 106, 0.5)"
          : COLORS[type as NodeType].text;

        // Add a small background for better readability
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(
          (n) => n + fontSize * 0.2,
        );

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(
          x - bckgDimensions[0] / 2,
          y + r + 2,
          bckgDimensions[0],
          bckgDimensions[1],
        );

        ctx.fillStyle = isDimmed
          ? "rgba(76, 86, 106, 0.8)"
          : COLORS[type as NodeType].text;
        ctx.fillText(label, x, y + r + 2 + bckgDimensions[1] / 2);
      }
    },
    [hoverNode, highlightNodes],
  );

  return (
    <ForceGraph2D
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={fgRef as any}
      graphData={data}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nodeCanvasObject={paintNode as any}
      nodePointerAreaPaint={(nodeObject, color, ctx) => {
        const node = nodeObject as InternalNode;
        const r = NODE_R[node.type as NodeType] || 4;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, r + 2, 0, 2 * Math.PI, false);
        ctx.fill();
      }}
      onNodeClick={onNodeClick}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onNodeHover={handleNodeHover as any}
      linkColor={(linkObject) => {
        const link = linkObject as unknown as InternalLink;
        const source =
          typeof link.source === "object" ? link.source.id : link.source;
        const target =
          typeof link.target === "object" ? link.target.id : link.target;
        const linkId = `${source}-${target}`;
        if (highlightLinks.has(linkId)) return COLORS.linkHighlight;
        return highlightNodes.size > 0 ? "rgba(76, 86, 106, 0.1)" : COLORS.link;
      }}
      linkWidth={(linkObject) => {
        const link = linkObject as unknown as InternalLink;
        const source =
          typeof link.source === "object" ? link.source.id : link.source;
        const target =
          typeof link.target === "object" ? link.target.id : link.target;
        const linkId = `${source}-${target}`;
        return highlightLinks.has(linkId) ? 2 : 1;
      }}
    />
  );
}
