import { hc } from "hono/client";
import type { AppType } from "@notetaiker/api";

export const api = hc<AppType>("http://localhost:3001");
