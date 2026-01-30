import matter from "gray-matter";
import { z } from "zod";

export const NoteFrontmatterSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    tags: z.array(z.string()).optional(),
    ai_tags: z.array(z.string()).optional(),
    ignored_tags: z.array(z.string()).optional(),
    ai: z.boolean().optional(),
  })
  .catchall(z.any());

export type NoteFrontmatter = z.infer<typeof NoteFrontmatterSchema>;

export interface ParsedNote {
  content: string;
  metadata: NoteFrontmatter;
}

export function parseMarkdown(fileContent: string): ParsedNote {
  const { content, data } = matter(fileContent);

  const metadata = NoteFrontmatterSchema.parse(data);

  return {
    content,
    metadata,
  };
}

export function toTitleCase(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function extractHashtags(content: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.matchAll(hashtagRegex);
  const tags = Array.from(matches).map((match) => toTitleCase(match[1]));
  return Array.from(new Set(tags));
}

export function mergeTags(
  existing: string[] | string | undefined,
  newTags: string[],
): string[] {
  const existingArray = Array.isArray(existing)
    ? existing
    : typeof existing === "string"
      ? existing.split(",").map((t) => t.trim())
      : [];

  const combined = [...existingArray, ...newTags].map((t) => toTitleCase(t));
  return Array.from(new Set(combined));
}
