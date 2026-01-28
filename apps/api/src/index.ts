import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "@notetaiker/env";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { notes } from "./routes/notes";
import { settings } from "./routes/settings";
import { QueueService } from "./services/queue.service";
import { WorkerService } from "./services/worker.service";
export type { ParsedNote, NoteFrontmatter } from "./lib/markdown";

type Bindings = {};
type Variables = {
  queueService: QueueService;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Initialize notes directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// apps/api/src/index.ts -> go up 3 levels to reach workspace root
const workspaceRoot = path.resolve(__dirname, "../../..");

// Initialize Queue Service and recover stuck jobs
const queueService = new QueueService(workspaceRoot);
const recoveredCount = queueService.resetProcessingJobs();
if (recoveredCount > 0) {
  console.log(`Recovered ${recoveredCount} stuck jobs from previous session`);
}

// Initialize and start Worker Service
const workerService = new WorkerService(queueService);
workerService.start();

// Inject queueService into context for routes
app.use("*", async (c, next) => {
  c.set("queueService", queueService);
  await next();
});

const notesDir = path.isAbsolute(env.NOTES_DIR)
  ? env.NOTES_DIR
  : path.resolve(workspaceRoot, env.NOTES_DIR);

console.log("Initializing notes directory at:", notesDir);

try {
  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
    console.log("Created notes directory");
  }
} catch (error) {
  console.error("Failed to create notes directory:", error);
  process.exit(1);
}

// Validate environment variables on startup
console.log("Starting server with environment:", env.NODE_ENV);

const routes = app
  .get("/health", (c) => {
    return c.json({ status: "ok" });
  })
  .route("/notes", notes)
  .route("/settings", settings);

const port = Number(process.env.PORT) || 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export type AppType = typeof routes;
export default app;
