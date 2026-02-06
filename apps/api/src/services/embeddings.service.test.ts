import { describe, it, expect, beforeEach, vi } from "vitest";
import { EmbeddingsService } from "./embeddings.service";

describe("EmbeddingsService", () => {
  let db: any;
  let mockStorage: any;
  let mockQueue: any;
  let service: EmbeddingsService;

  beforeEach(() => {
    db = {
      prepare: vi.fn().mockReturnValue({
        run: vi.fn(),
        get: vi.fn(),
        all: vi.fn().mockReturnValue([]),
      }),
      transaction: vi.fn((cb) => cb),
    };

    mockStorage = {
      listNotes: vi.fn().mockResolvedValue([]),
    };

    mockQueue = {
      enqueue: vi.fn(),
    };

    service = new EmbeddingsService(db as any, mockStorage as any, mockQueue as any);
  });

  describe("rebuildIndex", () => {
    it("should truncate tables and enqueue jobs for notes", async () => {
      const notes = [
        { metadata: { id: "1" } },
        { metadata: { id: "2", ai: false } },
        { metadata: { id: "3" } },
      ];
      mockStorage.listNotes.mockResolvedValue(notes);

      const result = await service.rebuildIndex();

      expect(db.prepare).toHaveBeenCalledWith("DELETE FROM embeddings_meta");
      expect(db.prepare).toHaveBeenCalledWith("DELETE FROM vec_notes");
      expect(mockQueue.enqueue).toHaveBeenCalledTimes(2);
      expect(mockQueue.enqueue).toHaveBeenCalledWith("1", "embeddings");
      expect(mockQueue.enqueue).toHaveBeenCalledWith("3", "embeddings");
      expect(result.enqueued).toBe(3);
    });
  });

  describe("getStatus", () => {
    it("should return indexed vs total count", async () => {
      db.prepare.mockReturnValueOnce({
        get: () => ({ count: 5 }),
      });

      const notes = [
        { metadata: { id: "1" } },
        { metadata: { id: "2", ai: false } },
        { metadata: { id: "3" } },
      ];
      mockStorage.listNotes.mockResolvedValue(notes);

      const result = await service.getStatus();

      expect(result.indexedNotes).toBe(5);
      expect(result.totalNotes).toBe(2); // Only notes with ai !== false
    });
  });

  describe("findSimilar", () => {
    it("should include k parameter in SQL query", () => {
      const vector = [0.1, 0.2, 0.3];
      const limit = 5;

      service.findSimilar(vector, limit);

      const prepareCall = db.prepare.mock.calls[0][0];
      const stmt = db.prepare.mock.results[0].value;
      const runCall = stmt.all.mock.calls[0];


      expect(prepareCall).toContain("WHERE vector MATCH ?");
      expect(prepareCall).toContain("AND k = ?");
      // LIMIT removed from SQL
      expect(runCall.length).toBe(2); // vector, k
      expect(runCall[1]).toBe(limit); // k param
    });

    it("should adjust k when excluding note", () => {
      const vector = [0.1, 0.2, 0.3];
      const limit = 5;
      const excludeId = "exclude-me";

      service.findSimilar(vector, limit, excludeId);

      const runCall = db.prepare().all.mock.calls[0];
      // params: [vector, k, excludeId]
      // k should be limit + 1
      expect(runCall[1]).toBe(limit + 1);
      expect(runCall.length).toBe(3); // vector, k, excludeId
    });
  });
});
