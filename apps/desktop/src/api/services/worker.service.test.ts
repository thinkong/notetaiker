import { describe, it, expect, beforeEach, vi } from "vitest";
import { WorkerService } from "./worker.service";

describe("WorkerService", () => {
  let workerService: WorkerService;
  let mockQueueService: any;
  let mockEventsService: any;
  let mockAiService: any;
  let mockStorageService: any;
  let mockEmbeddingsService: any;

  beforeEach(() => {
    mockQueueService = {
      on: vi.fn(),
      getNextJob: vi.fn(),
      updateJobStatus: vi.fn(),
    };
    mockEventsService = {
      broadcast: vi.fn(),
    };
    mockAiService = {
      generateTags: vi.fn(),
      generateTitle: vi.fn(),
      generateEmbedding: vi.fn(),
    };
    mockStorageService = {
      getNote: vi.fn(),
      saveNote: vi.fn(),
    };
    mockEmbeddingsService = {
      getEmbeddingMeta: vi.fn(),
      storeEmbedding: vi.fn(),
    };

    workerService = new WorkerService(
      mockQueueService as any,
      mockEventsService as any,
      mockAiService as any,
      mockStorageService as any,
      mockEmbeddingsService as any,
    );
  });

  it("should process AI tags and store them in ai_tags, respecting manual and ignored tags", async () => {
    const noteId = "note-1";
    const note = {
      content: "Note content",
      metadata: {
        id: noteId,
        tags: ["Manual Tag"],
        ignored_tags: ["Ignored Tag"],
      },
    };

    mockStorageService.getNote.mockResolvedValue(note);
    mockAiService.generateTags.mockResolvedValue([
      "Manual Tag",
      "Ignored Tag",
      "New AI Tag",
    ]);

    const job = { id: "job-1", noteId, type: "analysis" } as any;
    mockQueueService.getNextJob.mockReturnValue(job);

    // Trigger processing
    await (workerService as any).executeJob(job);

    expect(mockAiService.generateTags).toHaveBeenCalledWith("Note content");

    // Should only save "New Ai Tag" in ai_tags
    expect(mockStorageService.saveNote).toHaveBeenCalledWith(
      "Note content",
      expect.objectContaining({
        ai_tags: ["New Ai Tag"],
        tags: ["Manual Tag"], // Should be unchanged
      }),
      { skipQueue: true },
    );

    expect(mockQueueService.updateJobStatus).toHaveBeenCalledWith(
      "job-1",
      "completed",
    );
  });

  it("should normalize tags to Title Case when filtering", async () => {
    const noteId = "note-1";
    const note = {
      content: "Note content",
      metadata: {
        id: noteId,
        tags: ["Manual Tag"],
        ignored_tags: ["Ignored Tag"],
      },
    };

    mockStorageService.getNote.mockResolvedValue(note);
    mockAiService.generateTags.mockResolvedValue([
      "manual tag",
      "ignored tag",
      "new ai tag",
    ]);

    const job = { id: "job-1", noteId, type: "analysis" } as any;
    await (workerService as any).executeJob(job);

    expect(mockStorageService.saveNote).toHaveBeenCalledWith(
      "Note content",
      expect.objectContaining({
        ai_tags: ["New Ai Tag"],
      }),
      { skipQueue: true },
    );
  });

  it("should not save if ai_tags and title haven't changed", async () => {
    const noteId = "note-1";
    const note = {
      content: "Note content",
      metadata: {
        id: noteId,
        title: "Existing Title",
        ai_tags: ["Existing Ai Tag"],
      },
    };

    mockStorageService.getNote.mockResolvedValue(note);
    mockAiService.generateTags.mockResolvedValue(["existing ai tag"]);

    const job = { id: "job-1", noteId, type: "analysis" } as any;
    await (workerService as any).executeJob(job);

    expect(mockStorageService.saveNote).not.toHaveBeenCalled();
  });

  it("should generate a title from header if missing in metadata", async () => {
    const noteId = "note-1";
    const note = {
      content: "# My Header Title\nNote content",
      metadata: {
        id: noteId,
        ai_tags: ["Existing Tag"],
      },
    };

    mockStorageService.getNote.mockResolvedValue(note);
    mockAiService.generateTags.mockResolvedValue(["existing tag"]);

    const job = { id: "job-1", noteId, type: "analysis" } as any;
    await (workerService as any).executeJob(job);

    expect(mockStorageService.saveNote).toHaveBeenCalledWith(
      note.content,
      expect.objectContaining({
        title: "My Header Title",
      }),
      { skipQueue: true },
    );
  });

  it("should generate a title using AI if no header is present and missing in metadata", async () => {
    const noteId = "note-1";
    const note = {
      content: "Note content without header",
      metadata: {
        id: noteId,
        ai_tags: ["Existing Tag"],
      },
    };

    mockStorageService.getNote.mockResolvedValue(note);
    mockAiService.generateTags.mockResolvedValue(["existing tag"]);
    mockAiService.generateTitle.mockResolvedValue("AI Generated Title");

    const job = { id: "job-1", noteId, type: "analysis" } as any;
    await (workerService as any).executeJob(job);

    expect(mockAiService.generateTitle).toHaveBeenCalledWith(note.content);
    expect(mockStorageService.saveNote).toHaveBeenCalledWith(
      note.content,
      expect.objectContaining({
        title: "AI Generated Title",
      }),
      { skipQueue: true },
    );
  });

  it("should preserve existing title in metadata", async () => {
    const noteId = "note-1";
    const note = {
      content: "# Header\nNote content",
      metadata: {
        id: noteId,
        title: "Original Title",
        ai_tags: ["Existing Tag"],
      },
    };

    mockStorageService.getNote.mockResolvedValue(note);
    mockAiService.generateTags.mockResolvedValue(["existing tag"]);

    const job = { id: "job-1", noteId, type: "analysis" } as any;
    await (workerService as any).executeJob(job);

    // Should not call saveNote if only title would have changed but it's already there
    expect(mockStorageService.saveNote).not.toHaveBeenCalled();
  });

  it("should generate and store embeddings when they are out of date", async () => {
    const noteId = "note-1";
    const content = "Embedding content";
    const note = {
      content,
      metadata: { id: noteId },
    };

    mockStorageService.getNote.mockResolvedValue(note);
    mockEmbeddingsService.getEmbeddingMeta.mockReturnValue({
      content_hash: "old-hash",
    });
    const mockVector = [0.1, 0.2];
    mockAiService.generateEmbedding.mockResolvedValue(mockVector);

    const job = { id: "job-2", noteId, type: "embeddings" } as any;
    await (workerService as any).executeJob(job);

    expect(mockAiService.generateEmbedding).toHaveBeenCalledWith(content);
    expect(mockEmbeddingsService.storeEmbedding).toHaveBeenCalledWith(
      noteId,
      mockVector,
      expect.any(String),
    );
  });

  it("should skip embedding generation if hash matches", async () => {
    const noteId = "note-1";
    const content = "Same content";
    const note = {
      content,
      metadata: { id: noteId },
    };

    const crypto = await import("node:crypto");
    const hash = crypto.createHash("sha256").update(content).digest("hex");

    mockStorageService.getNote.mockResolvedValue(note);
    mockEmbeddingsService.getEmbeddingMeta.mockReturnValue({
      content_hash: hash,
    });

    const job = { id: "job-2", noteId, type: "embeddings" } as any;
    await (workerService as any).executeJob(job);

    expect(mockAiService.generateEmbedding).not.toHaveBeenCalled();
    expect(mockEmbeddingsService.storeEmbedding).not.toHaveBeenCalled();
  });
});
