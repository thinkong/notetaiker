import matter from "gray-matter";
import { z } from "zod";

export const NoteFrontmatterSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    tags: z.array(z.string()).optional(),
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

export function mergeTags(
  existing: string[] | string | undefined,
  newTags: string[],
): string[] {
  const existingArray = Array.isArray(existing)
    ? existing
    : typeof existing === "string"
      ? existing.split(",").map((t) => t.trim())
      : [];

  const toTitleCase = (str: string) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const combined = [...existingArray, ...newTags].map((t) => toTitleCase(t));
  return Array.from(new Set(combined));
}
