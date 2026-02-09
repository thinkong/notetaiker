import type { GraphNode } from "../hooks/useGraphData";

/**
 * Determines whether a graph node passes a tag-based filter.
 *
 * - For "note" nodes, checks if the node's manual + AI tags satisfy the filter.
 * - For "tag" nodes, checks if the tag hub's name matches any of the filter tags.
 *
 * @param node - The graph node to test
 * @param filterTags - Active tag filter strings
 * @param filterLogic - "AND" requires all tags, "OR" requires any tag
 * @returns true if the node should be visible
 */
export function passesTagFilter(
  node: GraphNode,
  filterTags: string[],
  filterLogic: "AND" | "OR",
): boolean {
  if (filterTags.length === 0) return true;

  const searchTags = filterTags.map((t) => t.toLowerCase());

  if (node.type === "tag") {
    // Tag hub nodes: visible if their name matches one of the active filter tags.
    // node.name is stored as "#tagName", so strip the leading "#" for comparison.
    const tagName = node.name.replace(/^#/, "").toLowerCase();
    return searchTags.includes(tagName);
  }

  // Note nodes: check manual + AI tags
  const nodeTags = [...(node.tags || []), ...(node.ai_tags || [])].map((t) =>
    t.toLowerCase(),
  );

  if (filterLogic === "AND") {
    return searchTags.every((t) => nodeTags.includes(t));
  } else {
    return searchTags.some((t) => nodeTags.includes(t));
  }
}
