import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import { EventEmitter } from "node:events";

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface Job {
  id: string;
  noteId: string;
  status: JobStatus;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export class QueueService extends EventEmitter {
  private db: Database.Database;

  constructor(workspaceRoot: string) {
    super();
    const configDir = path.join(workspaceRoot, ".notetaiker");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const dbPath = path.join(configDir, "queue.db");
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        noteId TEXT NOT NULL,
        status TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        lastError TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on status and createdAt for efficient job polling
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON jobs(status, createdAt)
    `);
  }

  enqueue(noteId: string): string {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO jobs (id, noteId, status, attempts, createdAt, updatedAt)
      VALUES (?, ?, 'queued', 0, ?, ?)
    `);

    stmt.run(id, noteId, now, now);
    this.emit("job:enqueued", id);
    return id;
  }

  getNextJob(): Job | null {
    // In better-sqlite3, we can use a transaction to ensure atomicity
    const getJob = this.db.transaction(() => {
      const job = this.db
        .prepare(
          `
        SELECT * FROM jobs
        WHERE status = 'queued'
        ORDER BY createdAt ASC
        LIMIT 1
      `,
        )
        .get() as Job | undefined;

      if (!job) return null;

      const now = new Date().toISOString();
      this.db
        .prepare(
          `
        UPDATE jobs
        SET status = 'processing',
            attempts = attempts + 1,
            updatedAt = ?
        WHERE id = ?
      `,
        )
        .run(now, job.id);

      // Create a new object with the updated fields correctly typed
      const updatedJob: Job = {
        ...job,
        status: "processing",
        attempts: job.attempts + 1,
        updatedAt: now,
      };

      return updatedJob;
    });

    return getJob();
  }

  updateJobStatus(id: string, status: JobStatus, error?: string): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE jobs
      SET status = ?,
          lastError = ?,
          updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(status, error || null, now, id);
  }

  resetProcessingJobs(): number {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE jobs
      SET status = 'queued',
          updatedAt = ?
      WHERE status = 'processing'
    `);

    const result = stmt.run(now);
    return result.changes;
  }

  // Helper for testing/debugging
  getJob(id: string): Job | undefined {
    return this.db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as
      | Job
      | undefined;
  }

  getFailedJobCount(): number {
    const stmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM jobs WHERE status = 'failed'",
    );
    const result = stmt.get() as { count: number };
    return result.count;
  }

  retryFailedJobs(): number {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
        UPDATE jobs
        SET status = 'queued',
            attempts = 0,
            updatedAt = ?
        WHERE status = 'failed'
      `);

    const result = stmt.run(now);
    this.emit("job:enqueued", "retry-batch"); // Trigger worker to pick up
    return result.changes;
  }
}
