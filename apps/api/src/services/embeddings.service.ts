import type { Database } from "better-sqlite3";
import type { StorageService, NoteMetadata } from "./storage.service";
import type { QueueService } from "./queue.service";

export interface SimilarNote extends NoteMetadata {
  noteId: string;
  distance: number;
  excerpt: string;
}

export class EmbeddingsService {
  private db: Database;
  private storage?: StorageService;
  private queue?: QueueService;

  constructor(
    db: Database,
    storage?: StorageService,
    queue?: QueueService,
  ) {
    this.db = db;
    this.storage = storage;
    this.queue = queue;
  }

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
   * Get the vector embedding for a note
   */
  getVector(noteId: string): number[] | undefined {
    const result = this.db
      .prepare("SELECT vector FROM vec_notes WHERE note_id = ?")
      .get(noteId) as { vector: Uint8Array | Buffer } | undefined;

    if (!result) return undefined;

    // better-sqlite3 returns Blobs as Buffers/Uint8Arrays
    // We need to interpret it as Float32Array
    const float32Array = new Float32Array(
      result.vector.buffer,
      result.vector.byteOffset,
      result.vector.byteLength / 4,
    );
    return Array.from(float32Array);
  }

  /**
   * Find semantically related notes for a given note
   */
  async findRelated(
    noteId: string,
    limit: number = 5,
  ): Promise<SimilarNote[]> {
    const vector = this.getVector(noteId);
    if (!vector) return [];

    const similar = this.findSimilar(vector, limit, noteId);
    if (!this.storage) return [];

    const results = await Promise.all(
      similar.map(async (item) => {
        const note = await this.storage!.getNote(item.noteId);
        if (!note) return null;

        // Create a brief excerpt (first 150 chars)
        const excerpt =
          note.content.slice(0, 150).trim() +
          (note.content.length > 150 ? "..." : "");

        return {
          ...note.metadata,
          noteId: item.noteId,
          distance: item.distance,
          excerpt,
        };
      }),
    );

    return results.filter((n): n is SimilarNote => n !== null);
  }

  /**
   * Find similar notes using KNN search
   */
  findSimilar(
    vector: number[],
    limit: number = 10,
    excludeNoteId?: string,
  ): { noteId: string; distance: number }[] {
    const float32Vector = new Float32Array(vector);

    // sqlite-vec KNN search syntax
    // We need to request more items if we're going to filter one out
    const k = excludeNoteId ? limit + 1 : limit;

    let sql = `
      SELECT
        note_id,
        distance
      FROM vec_notes
      WHERE vector MATCH ?
        AND k = ?
    `;

    const params: any[] = [float32Vector, k];

    if (excludeNoteId) {
      sql += " AND note_id != ?";
      params.push(excludeNoteId);
    }

    sql += `
      ORDER BY distance
    `;

    // LIMIT clause removed as it conflicts with k constraint in some sqlite-vec versions
    // or causes "A LIMIT or 'k = ?' constraint is required" error despite k being present.
    // relying on k is sufficient for the search bound.

    const stmt = this.db.prepare(sql);
    const results = stmt.all(...params) as {
      note_id: string;
      distance: number;
    }[];

    return results
      .map((r) => ({
        noteId: r.note_id,
        distance: r.distance,
      }))
      .slice(0, limit);
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
