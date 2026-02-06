import matter from "gray-matter";
import { z } from "zod";

export const NoteFrontmatterSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
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

  const result = NoteFrontmatterSchema.safeParse(data);
  const metadata = result.success ? result.data : {};

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

export function extractFirstHeader(content: string): string | null {
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Match any header level (e.g. #, ##, ###) followed by space
    if (/^#+\s/.test(trimmed)) {
      // Remove all leading # symbols and trim whitespace
      const headerText = trimmed.replace(/^#+\s*/, "").trim();
      return headerText || null;
    }
  }
  return null;
}
