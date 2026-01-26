import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "@notetaiker/env";

const app = new Hono();

// Validate environment variables on startup
console.log("Starting server with environment:", env.NODE_ENV);

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

const port = 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export type AppType = typeof app;
export default app;
