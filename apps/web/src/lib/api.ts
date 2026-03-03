import { hc } from "hono/client";
import type { AppType } from "@notetaiker/api";

// In production, the API is served from the same origin
// In development, we proxy to localhost:3001
export const apiBaseUrl = import.meta.env.PROD
  ? window.location.origin
  : "http://localhost:3001";

export const api = hc<AppType>(apiBaseUrl);
