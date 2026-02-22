import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import * as sqliteVec from "sqlite-vec";
import { parseMarkdown } from "../lib/markdown";
import { v5 as uuidv5 } from "uuid";

export interface IndexEntry {
  id: string;
  filename: string;
  content: string;
  metadata: string; // JSON string of full metadata
  createdAt: string;
  updatedAt: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  tags?: string[];
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "ASC" | "DESC";
}

export class IndexerService {
  private db: Database.Database;
  private notesDir: string;
  private syncNoteStmt!: Database.Statement;
  private deleteNoteStmt!: Database.Statement;
  private getByIdStmt!: Database.Statement;

  constructor(workspaceRoot: string, notesDir: string) {
    this.notesDir = notesDir;
    const configDir = path.join(workspaceRoot, ".notetaiker");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const dbPath = path.join(configDir, "index.db");
    this.db = new Database(dbPath);
    sqliteVec.load(this.db);
    this.init();
    this.prepareStatements();
  }

  private prepareStatements() {
    this.syncNoteStmt = this.db.prepare(`
      INSERT INTO notes_index (id, filename, content, metadata, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        filename = excluded.filename,
        content = excluded.content,
        metadata = excluded.metadata,
        createdAt = excluded.createdAt,
        updatedAt = excluded.updatedAt
    `);

    this.deleteNoteStmt = this.db.prepare("DELETE FROM notes_index WHERE id = ?");
    this.getByIdStmt = this.db.prepare("SELECT * FROM notes_index WHERE id = ?");
  }

  getDb(): Database.Database {
    return this.db;
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes_index (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        content TEXT,
        metadata TEXT,
        createdAt DATETIME,
        updatedAt DATETIME
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_notes_created ON notes_index(createdAt)
    `);

    // Initialize embeddings tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS embeddings_meta (
        note_id TEXT PRIMARY KEY,
        content_hash TEXT NOT NULL,
        model TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(note_id) REFERENCES notes_index(id) ON DELETE CASCADE
      )
    `);

    // Virtual table for vector search
    // Using vec0 from sqlite-vec
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS vec_notes USING vec0(
        note_id TEXT PRIMARY KEY,
        vector FLOAT[768]
      )
    `);
  }

  syncNote(filename: string, content: string, metadata: any) {
    const fullMetadata = JSON.stringify(metadata);
    const createdAt = metadata.createdAt || new Date().toISOString();
    const updatedAt = metadata.updatedAt || new Date().toISOString();
    const id = metadata.id;

    if (!id) return;

    this.syncNoteStmt.run(
      id,
      filename,
      content,
      fullMetadata,
      createdAt,
      updatedAt,
    );
  }

  deleteNote(id: string) {
    this.deleteNoteStmt.run(id);
  }

  getById(id: string): IndexEntry | undefined {
    return this.getByIdStmt.get(id) as IndexEntry | undefined;
  }

  async syncAll() {
    const files = await fs.promises.readdir(this.notesDir);
    const validFiles = files.filter((f) => f.endsWith(".md"));

    // Get current IDs in DB to handle deletions
    const existingIds = (
      this.db.prepare("SELECT id FROM notes_index").all() as { id: string }[]
    ).map((r) => r.id);
    const seenIds = new Set<string>();

    // UUID namespace for file-based IDs (generated randomly once)
    const FILE_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // standard DNS namespace, just as a base

    for (const filename of validFiles) {
      try {
        const filePath = path.join(this.notesDir, filename);
        const stats = await fs.promises.stat(filePath);
        const content = await fs.promises.readFile(filePath, "utf-8");
        const { content: parsedContent, metadata } = parseMarkdown(content);

        // If no ID in frontmatter, generate specific UUID based on filename
        const id = metadata.id || uuidv5(filename, FILE_NAMESPACE);

        // Fill in missing timestamps from file stats
        const createdAt = metadata.createdAt || stats.birthtime.toISOString();
        const updatedAt = metadata.updatedAt || stats.mtime.toISOString();

        this.syncNote(filename, parsedContent, {
          ...metadata,
          id,
          createdAt,
          updatedAt,
        });
        seenIds.add(id);
      } catch (err) {
        console.error(
          `Failed to sync note ${filename}:`,
          err instanceof Error ? err.message : String(err),
        );
      }
    }

    // Delete notes that are no longer on disk
    for (const id of existingIds) {
      if (!seenIds.has(id)) {
        this.deleteNote(id);
      }
    }
  }

  query(options: QueryOptions = {}): IndexEntry[] {
    const {
      limit,
      offset,
      tags,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = options;

    let query = "SELECT * FROM notes_index";
    const params: any[] = [];

    if (tags && tags.length > 0) {
      // Simple tag filtering: check if any of the tags exist in the JSON string
      // This is a bit naive but works for a starter SQLite implementation
      const tagConditions = tags.map((t) => {
        params.push(`%${t}%`);
        return "metadata LIKE ?";
      });
      query += ` WHERE ${tagConditions.join(" OR ")}`;
    }

    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    if (limit !== undefined) {
      query += " LIMIT ?";
      params.push(limit);
    }

    if (offset !== undefined) {
      query += " OFFSET ?";
      params.push(offset);
    }

    return this.db.prepare(query).all(...params) as IndexEntry[];
  }

  close() {
    this.db.close();
  }
}
