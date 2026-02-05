import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { IndexerService } from "./indexer.service";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import matter from "gray-matter";

describe("IndexerService", () => {
  let workspaceRoot: string;
  let notesDir: string;
  let indexerService: IndexerService;

  beforeEach(async () => {
    // Setup temp directories
    const tmpBase = os.tmpdir();
    workspaceRoot = await fs.mkdtemp(path.join(tmpBase, "notetaiker-test-ws-"));
    notesDir = await fs.mkdtemp(path.join(tmpBase, "notetaiker-test-notes-"));

    indexerService = new IndexerService(workspaceRoot, notesDir);
  });

  afterEach(async () => {
    // Cleanup
    if (indexerService) {
      indexerService.close();
    }
    await fs.rm(workspaceRoot, { recursive: true, force: true });
    await fs.rm(notesDir, { recursive: true, force: true });
  });

  it("should not include frontmatter in indexed content during syncAll", async () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const body = "This is the body content.";
    const frontmatter = {
      id,
      title: "Test Note",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const fileContent = matter.stringify(body, frontmatter);
    const fileName = "test-note.md";

    await fs.writeFile(path.join(notesDir, fileName), fileContent);

    // Run syncAll
    await indexerService.syncAll();

    // Verify index
    const entry = indexerService.getById(id);
    expect(entry).toBeDefined();

    // The content in the index should be just the body
    expect(entry?.content.trim()).toBe(body);

    // It should explicitly NOT contain the frontmatter delimiters
    expect(entry?.content).not.toContain("title: Test Note");
  });

  it("should sync pure markdown files without frontmatter by generating an ID", async () => {
    const body = "# Pure Markdown\nThis note has no frontmatter.";
    const fileName = "pure-note.md";

    await fs.writeFile(path.join(notesDir, fileName), body);

    // Run syncAll
    await indexerService.syncAll();

    // Verify index contains the note
    const entries = indexerService.query({ limit: 10 });
    const entry = entries.find((e) => e.filename === fileName);

    expect(entry).toBeDefined();
    expect(entry?.content.trim()).toBe(body);
    expect(entry?.id).toBeDefined();
    // Verify valid timestamps from file stats
    expect(new Date(entry!.createdAt).getTime()).not.toBeNaN();
  });
});
