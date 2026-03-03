import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export type NodeType = "note" | "tag";

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  content?: string;
  tags?: string[];
  ai_tags?: string[];
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function useGraphData() {
  return useQuery({
    queryKey: ["notes", "graph"],
    queryFn: async (): Promise<GraphData> => {
      // Use a large limit to fetch all notes for the global graph
      const res = await api.notes.$get({
        query: {
          limit: "1000",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch notes for graph");
      }

      const notes = await res.json();
      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      const tagSet = new Set<string>();

      notes.forEach((note) => {
        const noteId = note.metadata.id;
        if (!noteId) return;

        // 1. Add Note Node
        nodes.push({
          id: noteId,
          type: "note",
          name:
            note.metadata.title ||
            note.content
              .split("\n")[0]
              .replace(/^#+\s*/, "")
              .substring(0, 40) ||
            "Untitled",
          content: note.content,
          tags: note.metadata.tags || [],
          ai_tags: note.metadata.ai_tags || [],
        });

        // 2. Process Tags
        const allTags = [
          ...(note.metadata.tags || []),
          ...(note.metadata.ai_tags || []),
        ];
        allTags.forEach((tag: string) => {
          const tagId = `tag-${tag}`;

          // Add Tag Node if it doesn't exist yet
          if (!tagSet.has(tag)) {
            tagSet.add(tag);
            nodes.push({
              id: tagId,
              type: "tag",
              name: `#${tag}`,
            });
          }

          // 3. Add Link from Note to Tag
          links.push({
            source: noteId,
            target: tagId,
          });
        });
      });

      return { nodes, links };
    },
  });
}
