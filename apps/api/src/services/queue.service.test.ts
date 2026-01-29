import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { QueueService } from "./queue.service";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../..");
const testDbDir = path.join(workspaceRoot, ".notetaiker-test");

describe("QueueService", () => {
  let queueService: QueueService;

  beforeEach(() => {
    // Ensure clean state for each test
    if (fs.existsSync(testDbDir)) {
      fs.rmSync(testDbDir, { recursive: true, force: true });
    }
    queueService = new QueueService(testDbDir);
  });

  afterEach(() => {
    if (fs.existsSync(testDbDir)) {
      fs.rmSync(testDbDir, { recursive: true, force: true });
    }
  });

  it("should enqueue a job", () => {
    const noteId = "test-note-1";
    const jobId = queueService.enqueue(noteId);

    expect(jobId).toBeDefined();
    const job = queueService.getJob(jobId);
    expect(job).toBeDefined();
    expect(job?.noteId).toBe(noteId);
    expect(job?.status).toBe("queued");
    expect(job?.attempts).toBe(0);
  });

  it("should get next job and transition it to processing", () => {
    const noteId = "test-note-1";
    const jobId = queueService.enqueue(noteId);

    const job = queueService.getNextJob();
    expect(job).toBeDefined();
    expect(job?.id).toBe(jobId);
    expect(job?.status).toBe("processing");
    expect(job?.attempts).toBe(1);

    // Verify it's no longer in the queue
    const nextJob = queueService.getNextJob();
    expect(nextJob).toBeNull();
  });

  it("should update job status", () => {
    const noteId = "test-note-1";
    const jobId = queueService.enqueue(noteId);

    queueService.updateJobStatus(jobId, "completed");

    const job = queueService.getJob(jobId);
    expect(job?.status).toBe("completed");
  });

  it("should update job status with error", () => {
    const noteId = "test-note-1";
    const jobId = queueService.enqueue(noteId);

    queueService.updateJobStatus(jobId, "failed", "Something went wrong");

    const job = queueService.getJob(jobId);
    expect(job?.status).toBe("failed");
    expect(job?.lastError).toBe("Something went wrong");
  });

  it("should reset processing jobs", () => {
    queueService.enqueue("note-1");
    queueService.enqueue("note-2");

    // Pick up both jobs
    queueService.getNextJob();
    queueService.getNextJob();

    const resetCount = queueService.resetProcessingJobs();
    expect(resetCount).toBe(2);

    const nextJob = queueService.getNextJob();
    expect(nextJob).toBeDefined();
    expect(nextJob?.status).toBe("processing");
  });
});
