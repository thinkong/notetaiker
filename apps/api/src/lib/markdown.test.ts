import { describe, it, expect } from "vitest";
import {
  NoteFrontmatterSchema,
  mergeTags,
  extractHashtags,
  extractFirstHeader,
} from "./markdown";

describe("NoteFrontmatterSchema", () => {
  it("should parse valid frontmatter with tags", () => {
    const data = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Test Note",
      createdAt: "2026-01-29T00:00:00Z",
      updatedAt: "2026-01-29T00:00:00Z",
      tags: ["Tag1", "Tag2"],
      ai_tags: ["Ai1"],
      ignored_tags: ["Ignored1"],
      ai: true,
    };
    const parsed = NoteFrontmatterSchema.parse(data);
    expect(parsed.tags).toEqual(["Tag1", "Tag2"]);
    expect(parsed.ai_tags).toEqual(["Ai1"]);
    expect(parsed.ignored_tags).toEqual(["Ignored1"]);
    expect(parsed.ai).toBe(true);
  });

  it("should parse valid frontmatter without tags", () => {
    const data = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      createdAt: "2026-01-29T00:00:00Z",
      updatedAt: "2026-01-29T00:00:00Z",
    };
    const parsed = NoteFrontmatterSchema.parse(data);
    expect(parsed.tags).toBeUndefined();
  });
});

describe("mergeTags", () => {
  it("should merge unique tags and convert to Title Case", () => {
    const existing = ["Old Tag", "another tag"];
    const newTags = ["new tag", "OLD TAG", "Third Tag"];
    const result = mergeTags(existing, newTags);
    expect(result).toEqual(["Old Tag", "Another Tag", "New Tag", "Third Tag"]);
  });

  it("should handle string input for existing tags", () => {
    const existing = "tag1, tag2";
    const newTags = ["tag3"];
    const result = mergeTags(existing, newTags);
    expect(result).toEqual(["Tag1", "Tag2", "Tag3"]);
  });

  it("should handle undefined existing tags", () => {
    const newTags = ["tag1"];
    const result = mergeTags(undefined, newTags);
    expect(result).toEqual(["Tag1"]);
  });

  it("should handle complex Title Case", () => {
    const existing = undefined;
    const newTags = ["ai-assisted", "react hooks"];
    const result = mergeTags(existing, newTags);
    // Note: my current toTitleCase is simple, it might not handle hyphens perfectly but let's check current implementation
    // str.split(' ').map(...)
    expect(result).toEqual(["Ai-assisted", "React Hooks"]);
  });
});

describe("extractHashtags", () => {
  it("should extract hashtags and normalize to title case", () => {
    const content =
      "This is a note with #react and #TYPESCRIPT and #node_js tags.";
    const tags = extractHashtags(content);
    expect(tags).toEqual(["React", "Typescript", "Node_js"]);
  });

  it("should deduplicate hashtags", () => {
    const content = "#react #REACT #react";
    const tags = extractHashtags(content);
    expect(tags).toEqual(["React"]);
  });

  it("should return empty array if no hashtags found", () => {
    const content = "This is a note with no hashtags.";
    const tags = extractHashtags(content);
    expect(tags).toEqual([]);
  });
});

describe("extractFirstHeader", () => {
  it("should extract first header when present", () => {
    const content = "# My Title\n\nSome content";
    expect(extractFirstHeader(content)).toBe("My Title");
  });

  it("should handle multiple # symbols (h2, h3)", () => {
    const content = "## Second Level\n\nContent";
    expect(extractFirstHeader(content)).toBe("Second Level");
  });

  it("should return null when no header present", () => {
    const content = "Just some text without a header";
    expect(extractFirstHeader(content)).toBeNull();
  });

  it("should handle empty content", () => {
    const content = "";
    expect(extractFirstHeader(content)).toBeNull();
  });

  it("should handle header with extra whitespace", () => {
    const content = "#    Spaced Title   \n\nContent";
    expect(extractFirstHeader(content)).toBe("Spaced Title");
  });

  it("should ignore content before first header", () => {
    const content = "Some text\n# Actual Title\n## Subtitle";
    expect(extractFirstHeader(content)).toBe("Actual Title");
  });
});
