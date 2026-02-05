import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { StorageService } from "./storage.service";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import matter from "gray-matter";

import { IndexerService } from "./indexer.service";

describe("StorageService", () => {
  let tempDir: string;
  let storageService: StorageService;
  let indexerService: IndexerService;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "notetaiker-test-"));
    // Create a mock IndexerService or minimal one that works with tempDir
    // For unit tests of StorageService, we can just use a real one pointed at tempDir
    // as it just updates the SQLite DB
    indexerService = new IndexerService(tempDir, tempDir);
    storageService = new StorageService(tempDir, indexerService);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    vi.useRealTimers();
  });

  describe("saveNote", () => {
    it("should save a note with a generated filename and frontmatter", async () => {
      const content = "Hello world";
      const metadata = { title: "Test Note" };

      const fileName = await storageService.saveNote(content, metadata);

      expect(fileName).toMatch(/^\d{8}-\d{9}-[a-z0-9]{4}\.md$/);

      const filePath = path.join(tempDir, fileName);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const parsed = matter(fileContent);

      expect(parsed.content.trim()).toBe(content);
      expect(parsed.data.title).toBe("Test Note");
      expect(parsed.data.id).toBeDefined();
      expect(parsed.data.createdAt).toBeDefined();
      expect(parsed.data.updatedAt).toBeDefined();
    });

    it("should handle filename collisions by appending a suffix", async () => {
      vi.useFakeTimers();
      const now = new Date("2024-01-01T12:00:00.000Z");
      vi.setSystemTime(now);

      const content1 = "Note 1";
      const content2 = "Note 2";

      const fileName1 = await storageService.saveNote(content1, {});
      const fileName2 = await storageService.saveNote(content2, {});

      expect(fileName1).toMatch(/^20240101-120000000-[a-z0-9]{4}\.md$/);
      expect(fileName2).toMatch(/^20240101-120000000-[a-z0-9]{4}\.md$/);
      expect(fileName1).not.toBe(fileName2);

      const file1Content = await fs.readFile(
        path.join(tempDir, fileName1),
        "utf-8",
      );
      const file2Content = await fs.readFile(
        path.join(tempDir, fileName2),
        "utf-8",
      );

      expect(matter(file1Content).content.trim()).toBe(content1);
      expect(matter(file2Content).content.trim()).toBe(content2);
    });

    it("should update an existing note and preserve metadata", async () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const content = "Original content";
      const metadata = { id: uuid, title: "Original Title", custom: "value" };
      await storageService.saveNote(content, metadata);

      // Wait a bit to ensure updatedAt would change
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedContent = "Updated content";
      const updatedMetadata = { id: uuid, title: "Updated Title" };
      await storageService.saveNote(updatedContent, updatedMetadata);

      const note = await storageService.getNote(uuid);
      expect(note).not.toBeNull();
      expect(note?.content.trim()).toBe(updatedContent);
      expect(note?.metadata.title).toBe("Updated Title");
      expect(note?.metadata.custom).toBe("value"); // Should be preserved
      expect(
        new Date(note?.metadata.updatedAt as string).getTime(),
      ).toBeGreaterThan(new Date(note?.metadata.createdAt as string).getTime());
    });
  });

  describe("getNote", () => {
    it("should retrieve a note by filename", async () => {
      const content = "Test content";
      const metadata = { title: "Find me" };
      const fileName = await storageService.saveNote(content, metadata);

      const note = await storageService.getNote(fileName);

      expect(note).not.toBeNull();
      expect(note?.content.trim()).toBe(content);
      expect(note?.metadata.title).toBe("Find me");
    });

    it("should retrieve a note by UUID", async () => {
      const content = "Test content";
      const metadata = { title: "UUID search" };
      await storageService.saveNote(content, metadata);

      // We need to read the file to get the generated UUID
      const files = (await fs.readdir(tempDir)).filter((f) =>
        f.endsWith(".md"),
      );
      const fileContent = await fs.readFile(
        path.join(tempDir, files[0]),
        "utf-8",
      );
      const { data } = matter(fileContent);
      const uuid = data.id;

      const note = await storageService.getNote(uuid);

      expect(note).not.toBeNull();
      expect(note?.content.trim()).toBe(content);
      expect(note?.metadata.id).toBe(uuid);
    });

    it("should return null if note not found", async () => {
      const note = await storageService.getNote("non-existent.md");
      expect(note).toBeNull();
    });
  });

  describe("listNotes", () => {
    it("should list all notes in the directory sorted by date descending", async () => {
      vi.useFakeTimers();

      vi.setSystemTime(new Date("2024-01-01T10:00:00Z"));
      await storageService.saveNote("Note 1", { title: "Older" });

      vi.setSystemTime(new Date("2024-01-01T11:00:00Z"));
      await storageService.saveNote("Note 2", { title: "Newer" });

      const notes = await storageService.listNotes();

      expect(notes).toHaveLength(2);
      expect(notes[0].metadata.title).toBe("Newer");
      expect(notes[1].metadata.title).toBe("Older");
    });

    it("should support pagination with limit and offset", async () => {
      vi.useFakeTimers();

      // Create 5 notes
      for (let i = 1; i <= 5; i++) {
        vi.setSystemTime(new Date(`2024-01-01T10:00:0${i}Z`));
        await storageService.saveNote(`Note ${i}`, {
          title: `Note ${i}`,
          index: i,
        });
      }

      // First page (limit 2, offset 0) -> Note 5, Note 4
      const page1 = await storageService.listNotes(2, 0);
      expect(page1).toHaveLength(2);
      expect(page1[0].metadata.index).toBe(5);
      expect(page1[1].metadata.index).toBe(4);

      // Middle page (limit 2, offset 2) -> Note 3, Note 2
      const page2 = await storageService.listNotes(2, 2);
      expect(page2).toHaveLength(2);
      expect(page2[0].metadata.index).toBe(3);
      expect(page2[1].metadata.index).toBe(2);

      // Last page (limit 2, offset 4) -> Note 1
      const page3 = await storageService.listNotes(2, 4);
      expect(page3).toHaveLength(1);
      expect(page3[0].metadata.index).toBe(1);

      // Out of bounds (offset 10) -> Empty
      const emptyPage = await storageService.listNotes(2, 10);
      expect(emptyPage).toHaveLength(0);
    });
  });
});
