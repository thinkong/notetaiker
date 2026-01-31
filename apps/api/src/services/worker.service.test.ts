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
      })
    );

    expect(mockQueueService.updateJobStatus).toHaveBeenCalledWith("job-1", "completed");
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
      })
    );
  });

  it("should not save if ai_tags haven't changed", async () => {
    const noteId = "note-1";
    const note = {
      content: "Note content",
      metadata: {
        id: noteId,
        ai_tags: ["Existing Ai Tag"],
      },
    };

    mockStorageService.getNote.mockResolvedValue(note);
    mockAiService.generateTags.mockResolvedValue(["existing ai tag"]);

    await (workerService as any).executeJob("job-1", noteId);

    expect(mockStorageService.saveNote).not.toHaveBeenCalled();
  });
});
