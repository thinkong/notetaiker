import matter from 'gray-matter';
import { z } from 'zod';

export const NoteFrontmatterSchema = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).catchall(z.any());

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
