import type Database from "better-sqlite3";
import type { StorageService } from "./storage.service";
import type { QueueService } from "./queue.service";

export interface SimilarNote {
  noteId: string;
  distance: number;
}

export class EmbeddingsService {
  constructor(
    private db: Database.Database,
    private storage?: StorageService,
    private queue?: QueueService,
  ) {}

  /**
   * Rebuild the entire embedding index
   */
  async rebuildIndex() {
    if (!this.storage || !this.queue) {
      throw new Error("Storage and Queue services are required for rebuild");
    }

    // Run truncate in transaction
    const transaction = this.db.transaction(() => {
      this.db.prepare("DELETE FROM embeddings_meta").run();
      this.db.prepare("DELETE FROM vec_notes").run();
    });
    transaction();

    // Iterate all notes and enqueue embedding jobs
    const notes = await this.storage.listNotes(10000, 0);
    for (const note of notes) {
      if (note.metadata.id && note.metadata.ai !== false) {
        this.queue.enqueue(note.metadata.id, "embeddings");
      }
    }

    return { enqueued: notes.length };
  }

  /**
   * Get status of the embedding index
   */
  async getStatus() {
    if (!this.storage) {
      throw new Error("Storage service is required for status");
    }

    const indexedCount = (
      this.db.prepare("SELECT COUNT(*) as count FROM embeddings_meta").get() as {
        count: number;
      }
    ).count;

    const notes = await this.storage.listNotes(10000, 0);
    const totalNotes = notes.filter((n) => n.metadata.ai !== false).length;

    return {
      indexedNotes: indexedCount,
      totalNotes,
    };
  }

  /**
   * Store or update an embedding for a note
   */
  storeEmbedding(
    noteId: string,
    vector: number[],
    contentHash: string,
    model: string = "nomic-embed-text"
  ) {
    const float32Vector = new Float32Array(vector);

    // Update metadata
    const upsertMeta = this.db.prepare(`
      INSERT INTO embeddings_meta (note_id, content_hash, model, createdAt)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(note_id) DO UPDATE SET
        content_hash = excluded.content_hash,
        model = excluded.model,
        createdAt = CURRENT_TIMESTAMP
    `);

    // Update vector table
    const deleteVector = this.db.prepare(`DELETE FROM vec_notes WHERE note_id = ?`);
    const insertVector = this.db.prepare(`
      INSERT INTO vec_notes (note_id, vector)
      VALUES (?, ?)
    `);

    // Run in transaction
    const transaction = this.db.transaction(() => {
      upsertMeta.run(noteId, contentHash, model);
      deleteVector.run(noteId);
      insertVector.run(noteId, float32Vector);
    });

    transaction();
  }

  /**
   * Get embedding metadata for a note
   */
  getEmbeddingMeta(noteId: string) {
    return this.db
      .prepare("SELECT * FROM embeddings_meta WHERE note_id = ?")
      .get(noteId) as { note_id: string; content_hash: string; model: string; createdAt: string } | undefined;
  }

  /**
   * Find similar notes using KNN search
   */
  findSimilar(vector: number[], limit: number = 10): SimilarNote[] {
    const float32Vector = new Float32Array(vector);

    // sqlite-vec KNN search syntax
    const stmt = this.db.prepare(`
      SELECT
        note_id,
        distance
      FROM vec_notes
      WHERE vector MATCH ?
      ORDER BY distance
      LIMIT ?
    `);

    const results = stmt.all(float32Vector, limit) as {
      note_id: string;
      distance: number;
    }[];

    return results.map((r) => ({
      noteId: r.note_id,
      distance: r.distance,
    }));
  }

  /**
   * Delete embedding for a note
   */
  deleteEmbedding(noteId: string) {
    const deleteMeta = this.db.prepare("DELETE FROM embeddings_meta WHERE note_id = ?");
    const deleteVec = this.db.prepare("DELETE FROM vec_notes WHERE note_id = ?");

    const transaction = this.db.transaction(() => {
      deleteMeta.run(noteId);
      deleteVec.run(noteId);
    });

    transaction();
  }
}
