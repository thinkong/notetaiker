import { describe, it, expect, beforeEach, vi } from "vitest";
import { WorkerService } from "./worker.service";

describe("WorkerService", () => {
  let workerService: WorkerService;
  let mockQueueService: any;
  let mockEventsService: any;
  let mockAiService: any;
  let mockStorageService: any;

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
    };
    mockStorageService = {
      getNote: vi.fn(),
      saveNote: vi.fn(),
    };

    workerService = new WorkerService(
      mockQueueService as any,
      mockEventsService as any,
      mockAiService as any,
      mockStorageService as any,
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

    // Force execution of the private executeJob method via any casting or just trigger processNext
    // For simplicity in this test, we'll test the logic by calling the private method if possible
    // or just mock getNextJob and trigger the event.

    mockQueueService.getNextJob.mockReturnValue({ id: "job-1", noteId });

    // Trigger processing
    await (workerService as any).executeJob("job-1", noteId);

    expect(mockAiService.generateTags).toHaveBeenCalledWith("Note content");

    // Should only save "New Ai Tag" in ai_tags
    expect(mockStorageService.saveNote).toHaveBeenCalledWith(
      "Note content",
      expect.objectContaining({
        ai_tags: ["New Ai Tag"],
        tags: ["Manual Tag"], // Should be unchanged
      }),
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

    await (workerService as any).executeJob("job-1", noteId);

    expect(mockStorageService.saveNote).toHaveBeenCalledWith(
      "Note content",
      expect.objectContaining({
        ai_tags: ["New Ai Tag"],
      }),
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

    await (workerService as any).executeJob("job-1", noteId);

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

    await (workerService as any).executeJob("job-1", noteId);

    expect(mockStorageService.saveNote).toHaveBeenCalledWith(
      note.content,
      expect.objectContaining({
        title: "My Header Title",
      }),
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

    await (workerService as any).executeJob("job-1", noteId);

    expect(mockAiService.generateTitle).toHaveBeenCalledWith(note.content);
    expect(mockStorageService.saveNote).toHaveBeenCalledWith(
      note.content,
      expect.objectContaining({
        title: "AI Generated Title",
      }),
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

    await (workerService as any).executeJob("job-1", noteId);

    // Should not call saveNote if only title would have changed but it's already there
    expect(mockStorageService.saveNote).not.toHaveBeenCalled();
  });
});
