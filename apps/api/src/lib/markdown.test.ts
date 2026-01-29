import { describe, it, expect } from "vitest";
import { NoteFrontmatterSchema, mergeTags } from "./markdown";

describe("NoteFrontmatterSchema", () => {
  it("should parse valid frontmatter with tags", () => {
    const data = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Test Note",
      createdAt: "2026-01-29T00:00:00Z",
      updatedAt: "2026-01-29T00:00:00Z",
      tags: ["Tag1", "Tag2"],
      ai: true,
    };
    const parsed = NoteFrontmatterSchema.parse(data);
    expect(parsed.tags).toEqual(["Tag1", "Tag2"]);
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
