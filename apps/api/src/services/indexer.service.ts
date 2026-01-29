import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import { parseMarkdown } from '../lib/markdown';

export interface IndexEntry {
  id: string;
  filename: string;
  tags: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  tags?: string[];
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

export class IndexerService {
  private db: Database.Database;
  private notesDir: string;

  constructor(workspaceRoot: string, notesDir: string) {
    this.notesDir = notesDir;
    const configDir = path.join(workspaceRoot, '.notetaiker');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const dbPath = path.join(configDir, 'index.db');
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes_index (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        tags TEXT,
        createdAt DATETIME,
        updatedAt DATETIME
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_notes_created ON notes_index(createdAt)
    `);
  }

  syncNote(filename: string, content: string, metadata: any) {
    const tags = JSON.stringify(metadata.tags || []);
    const createdAt = metadata.createdAt || new Date().toISOString();
    const updatedAt = metadata.updatedAt || new Date().toISOString();
    const id = metadata.id;

    if (!id) return;

    const stmt = this.db.prepare(`
      INSERT INTO notes_index (id, filename, tags, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        filename = excluded.filename,
        tags = excluded.tags,
        createdAt = excluded.createdAt,
        updatedAt = excluded.updatedAt
    `);

    stmt.run(id, filename, tags, createdAt, updatedAt);
  }

  deleteNote(id: string) {
    this.db.prepare('DELETE FROM notes_index WHERE id = ?').run(id);
  }

  getById(id: string): IndexEntry | undefined {
    return this.db.prepare('SELECT * FROM notes_index WHERE id = ?').get(id) as IndexEntry | undefined;
  }

  async syncAll() {
    const files = await fs.promises.readdir(this.notesDir);
    const validFiles = files.filter(f => f.endsWith('.md'));

    // Get current IDs in DB to handle deletions
    const existingIds = (this.db.prepare('SELECT id FROM notes_index').all() as { id: string }[]).map(r => r.id);
    const seenIds = new Set<string>();

    for (const filename of validFiles) {
      try {
        const filePath = path.join(this.notesDir, filename);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const { metadata } = parseMarkdown(content);

        if (metadata.id) {
          this.syncNote(filename, content, metadata);
          seenIds.add(metadata.id);
        }
      } catch (err) {
        console.error(`Failed to sync note ${filename}:`, err instanceof Error ? err.message : String(err));
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
    const { limit, offset, tags, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    let query = 'SELECT * FROM notes_index';
    const params: any[] = [];

    if (tags && tags.length > 0) {
      // Simple tag filtering: check if any of the tags exist in the JSON string
      // This is a bit naive but works for a starter SQLite implementation
      const tagConditions = tags.map(t => {
        params.push(`%${t}%`);
        return 'tags LIKE ?';
      });
      query += ` WHERE ${tagConditions.join(' OR ')}`;
    }

    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    if (limit !== undefined) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    if (offset !== undefined) {
      query += ' OFFSET ?';
      params.push(offset);
    }

    return this.db.prepare(query).all(...params) as IndexEntry[];
  }
}
