import PQueue from "p-queue";
import pRetry from "p-retry";
import type { QueueService } from "./queue.service";
import type { EventsService } from "./events.service";
import type { AIService } from "./ai.service";
import type { StorageService } from "./storage.service";
import { toTitleCase, extractFirstHeader } from "../lib/markdown";

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

          const manualTags = note.metadata.tags || [];
          const ignoredTags = note.metadata.ignored_tags || [];

          // Filter out tags that are already in manual tags or ignored tags
          const filteredGenerated = generatedTags.filter((t) => {
            const titleCased = toTitleCase(t);
            return (
              !manualTags.includes(titleCased) &&
              !ignoredTags.includes(titleCased)
            );
          });

          // Replace old AI tags with fresh list (not merge) to avoid accumulation
          const updatedAiTags = filteredGenerated.map(toTitleCase);

          // Only save if ai_tags actually changed
          const existingAiTags = note.metadata.ai_tags || [];
          const aiTagsChanged =
            updatedAiTags.length !== existingAiTags.length ||
            !updatedAiTags.every((t) => existingAiTags.includes(t));

          // Title generation logic
          let updatedTitle = note.metadata.title;
          let titleChanged = false;

          if (!updatedTitle) {
            const header = extractFirstHeader(note.content);
            if (header) {
              updatedTitle = header;
              titleChanged = true;
              console.log(
                `Worker: Extracted title from header for note ${noteId}: ${updatedTitle}`,
              );
            } else {
              updatedTitle = await this.aiService.generateTitle(note.content);
              titleChanged = true;
              console.log(
                `Worker: Generated AI title for note ${noteId}: ${updatedTitle}`,
              );
            }
          }

          if (aiTagsChanged || titleChanged) {
            const updatedMetadata = {
              ...note.metadata,
              ai_tags: updatedAiTags,
              title: updatedTitle,
            };

            await this.storageService.saveNote(note.content, updatedMetadata);

            if (aiTagsChanged) {
              console.log(
                `Worker: Updated ai_tags for note ${noteId}: ${updatedAiTags.join(", ")}`,
              );
            }
            if (titleChanged) {
              console.log(
                `Worker: Updated title for note ${noteId}: ${updatedTitle}`,
              );
            }
          } else {
            console.log(`Worker: No updates needed for note ${noteId}`);
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
