import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "@notetaiker/env";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { notes } from "./routes/notes";
import { settings } from "./routes/settings";
import { events } from "./routes/events";
import { QueueService } from "./services/queue.service";
import { WorkerService } from "./services/worker.service";
import { EventsService } from "./services/events.service";
import { AIService } from "./services/ai.service";
import { StorageService } from "./services/storage.service";
import { SecretsService } from "./services/secrets.service";
import { IndexerService } from "./services/indexer.service";
export type { ParsedNote, NoteFrontmatter } from "./lib/markdown";

type Bindings = {};
type Variables = {
  queueService: QueueService;
  eventsService: EventsService;
  aiService: AIService;
  storageService: StorageService;
  indexerService: IndexerService;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Initialize notes directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// apps/api/src/index.ts -> go up 3 levels to reach workspace root
const workspaceRoot = path.resolve(__dirname, "../../..");

const notesDir = path.isAbsolute(env.NOTES_DIR)
  ? env.NOTES_DIR
  : path.resolve(workspaceRoot, env.NOTES_DIR);

try {
  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
    console.log("Created notes directory");
  }
} catch (error) {
  console.error("Failed to create notes directory:", error);
  process.exit(1);
}

// Initialize Core Services
const queueService = new QueueService(workspaceRoot);
const eventsService = new EventsService();
const secretsService = new SecretsService(workspaceRoot);
const aiService = new AIService(secretsService);
const indexerService = new IndexerService(workspaceRoot, notesDir);
const storageService = new StorageService(notesDir, indexerService);

// Initial sync of notes
console.log("Syncing notes index...");
await indexerService.syncAll();

// Recover stuck jobs
const recoveredCount = queueService.resetProcessingJobs();
if (recoveredCount > 0) {
  console.log(`Recovered ${recoveredCount} stuck jobs from previous session`);
}

// Initialize and start Worker Service
const workerService = new WorkerService(
  queueService,
  eventsService,
  aiService,
  storageService,
);
workerService.start();

// Inject services into context for routes
app
  .use("*", async (c, next) => {
    c.set("queueService", queueService);
    c.set("eventsService", eventsService);
    c.set("aiService", aiService);
    c.set("storageService", storageService);
    c.set("indexerService", indexerService);
    await next();
  })
  .use("*", cors());

console.log("Initializing notes directory at:", notesDir);

// Validate environment variables on startup
console.log("Starting server with environment:", env.NODE_ENV);

const routes = app
  .get("/health", (c) => {
    return c.json({ status: "ok" });
  })
  .route("/notes", notes)
  .route("/settings", settings)
  .route("/api/events", events);

// In production, serve the static web frontend
if (env.NODE_ENV === "production") {
  const webDistPath = path.resolve(__dirname, "../../web/dist");

  // Check if the web dist directory exists
  if (fs.existsSync(webDistPath)) {
    console.log("Serving static files from:", webDistPath);

    // Serve static assets
    app.use(
      "/*",
      serveStatic({
        root: webDistPath,
        rewriteRequestPath: (reqPath) => reqPath,
      }),
    );

    // SPA fallback - serve index.html for non-API routes
    app.get("*", async (c) => {
      const indexPath = path.join(webDistPath, "index.html");
      const html = fs.readFileSync(indexPath, "utf-8");
      return c.html(html);
    });
  } else {
    console.warn("Web dist directory not found at:", webDistPath);
  }
}

const port = Number(process.env.PORT) || 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export type AppType = typeof routes;
export default app;
