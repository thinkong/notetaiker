import PQueue from 'p-queue';
import pRetry from 'p-retry';
import { QueueService } from './queue.service';
import type { EventsService } from './events.service';

export class WorkerService {
  private queue: PQueue;
  private queueService: QueueService;
  private eventsService: EventsService;
  private isRunning: boolean = false;

  constructor(queueService: QueueService, eventsService: EventsService) {
    this.queueService = queueService;
    this.eventsService = eventsService;
    // Concurrency limited to 2 as per requirements
    this.queue = new PQueue({ concurrency: 2 });

    // Listen for new jobs
    this.queueService.on('job:enqueued', () => {
      this.processNext();
    });
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('WorkerService started');

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

          // STUB: Simulate AI processing
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Randomly fail to test retry logic (10% chance)
          if (Math.random() < 0.1) {
            throw new Error('Simulated transient AI failure');
          }

          console.log(`Worker: Completed job ${jobId}`);
        },
        {
          retries: 3,
          onFailedAttempt: (error) => {
            console.warn(
              `Worker: Job ${jobId} failed attempt ${error.attemptNumber}. ${error.retriesLeft} retries left.`
            );
          },
        }
      );

      this.queueService.updateJobStatus(jobId, 'completed');
      this.eventsService.broadcast('note_updated', { noteId });
    } catch (error) {
      console.error(`Worker: Job ${jobId} failed after retries:`, error);
      this.queueService.updateJobStatus(jobId, 'failed', (error as Error).message);
    } finally {
      // Check if there are more jobs to process
      this.processNext();
    }
  }

  stop() {
    this.isRunning = false;
    this.queue.clear();
    console.log('WorkerService stopped');
  }
}
