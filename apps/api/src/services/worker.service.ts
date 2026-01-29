import PQueue from "p-queue";
import pRetry from "p-retry";
import { QueueService } from "./queue.service";
import type { EventsService } from "./events.service";
import type { AIService } from "./ai.service";
import type { StorageService } from "./storage.service";
import { mergeTags } from "../lib/markdown";

export class WorkerService {
  private queue: PQueue;
  private queueService: QueueService;
  private eventsService: EventsService;
  private aiService: AIService;
  private storageService: StorageService;
  private isRunning: boolean = false;

  constructor(
    queueService: QueueService,
    eventsService: EventsService,
    aiService: AIService,
    storageService: StorageService,
  ) {
    this.queueService = queueService;
    this.eventsService = eventsService;
    this.aiService = aiService;
    this.storageService = storageService;
    // Concurrency limited to 2 as per requirements
    this.queue = new PQueue({ concurrency: 2 });

    // Listen for new jobs
    this.queueService.on("job:enqueued", () => {
      this.processNext();
    });
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("WorkerService started");

    // Process any jobs already in the queue on startup
    this.processNext();
  }

  private async processNext() {
    // Only fetch if we have capacity
    if (this.queue.pending >= 2) return;

    const job = this.queueService.getNextJob();
    if (!job) return;

    console.log(`Worker: Picked up job ${job.id} for note ${job.noteId}`);

    // Add to p-queue
    this.queue.add(() => this.executeJob(job.id, job.noteId));

    // Try to pick up another one if we have capacity
    this.processNext();
  }

  private async executeJob(jobId: string, noteId: string) {
    try {
      await pRetry(
        async () => {
          console.log(`Worker: Processing job ${jobId} (note: ${noteId})...`);

          const note = await this.storageService.getNote(noteId);
          if (!note) {
            console.warn(
              `Worker: Note ${noteId} not found, skipping job ${jobId}`,
            );
            return;
          }

          if (note.metadata.ai === false) {
            console.log(
              `Worker: AI processing disabled for note ${noteId}, skipping`,
            );
            return;
          }

          const generatedTags = await this.aiService.generateTags(note.content);
          const updatedTags = mergeTags(note.metadata.tags, generatedTags);

          // Only save if tags actually changed
          const existingTags = note.metadata.tags || [];
          const tagsChanged =
            updatedTags.length !== existingTags.length ||
            !updatedTags.every((t) => existingTags.includes(t));

          if (tagsChanged) {
            const updatedMetadata = {
              ...note.metadata,
              tags: updatedTags,
            };

            await this.storageService.saveNote(note.content, updatedMetadata);
            console.log(
              `Worker: Updated tags for note ${noteId}: ${updatedTags.join(", ")}`,
            );
          } else {
            console.log(`Worker: No new tags for note ${noteId}`);
          }

          console.log(`Worker: Completed job ${jobId}`);
        },
        {
          retries: 3,
          onFailedAttempt: (error) => {
            console.warn(
              `Worker: Job ${jobId} failed attempt ${error.attemptNumber}. ${error.retriesLeft} retries left.`,
            );
          },
        },
      );

      this.queueService.updateJobStatus(jobId, "completed");
      this.eventsService.broadcast("note_updated", { noteId });
    } catch (error) {
      console.error(`Worker: Job ${jobId} failed after retries:`, error);
      this.queueService.updateJobStatus(
        jobId,
        "failed",
        (error as Error).message,
      );
    } finally {
      // Check if there are more jobs to process
      this.processNext();
    }
  }

  stop() {
    this.isRunning = false;
    this.queue.clear();
    console.log("WorkerService stopped");
  }
}
