import { connect } from "node:net";

const DEFAULT_API_URL = "http://127.0.0.1:3001";
const TIMEOUT_MS = 3000;

interface NoteResponse {
  id: string;
  title?: string;
  tags?: string[];
  createdAt?: string;
}

function printHelp(): void {
  console.log(`
  notetaiker cli - quickly capture notes from the terminal

  Usage:
    note <your note content here>
    echo "note content" | note
    note --help

  Options:
    --api <url>    API server URL (default: ${DEFAULT_API_URL})
                   Can also be set via NOTETAIKER_API_URL env var
    -h, --help     Show this help message

  Examples:
    note Today I learned about TypeScript generics
    note "Meeting with team: discussed Q3 roadmap"
    note --api http://192.168.1.10:3001 Quick thought about the project
    echo "Long note content" | note
`);
}

function parseArgs(argv: string[]): { apiUrl: string; content: string[] } {
  const args = argv.slice(2); // skip node + script
  let apiUrl = process.env["NOTETAIKER_API_URL"] ?? DEFAULT_API_URL;
  const content: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--api" && i + 1 < args.length) {
      apiUrl = args[++i]!;
    } else if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else {
      content.push(arg!);
    }
  }

  return { apiUrl, content };
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }

    let data = "";
    let received = false;
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk: string) => {
      received = true;
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data.trim());
    });

    // If no data arrives within 100ms, assume nothing is piped
    setTimeout(() => {
      if (!received) {
        resolve("");
      }
    }, 100);
  });
}

function checkServer(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host, port, timeout: TIMEOUT_MS });
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function sendNote(apiUrl: string, content: string): Promise<void> {
  const parsed = new URL(apiUrl);
  const host = parsed.hostname;
  const port = parseInt(parsed.port || "3001", 10);

  const reachable = await checkServer(host, port);
  if (!reachable) {
    console.error(`Error: Could not connect to the API at ${apiUrl}`);
    console.error("Make sure the NoteTAIker server is running (pnpm dev)");
    process.exit(1);
  }

  const url = `${apiUrl}/notes`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch {
    console.error(`Error: Request to ${apiUrl} failed`);
    process.exit(1);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error: API returned ${response.status}`);
    console.error(errorText);
    process.exit(1);
  }

  const note = (await response.json()) as NoteResponse;

  console.log(`Note saved! (${note.id})`);
  if (note.title) {
    console.log(`  Title: ${note.title}`);
  }
  if (note.tags && note.tags.length > 0) {
    console.log(`  Tags:  ${note.tags.join(", ")}`);
  }
}

async function main(): Promise<void> {
  const { apiUrl, content } = parseArgs(process.argv);
  const stdinContent = await readStdin();

  const parts: string[] = [];
  if (content.length > 0) {
    parts.push(content.join(" "));
  }
  if (stdinContent) {
    parts.push(stdinContent);
  }

  const fullContent = parts.join("\n\n");

  if (!fullContent) {
    console.error("Error: No note content provided.");
    console.error('Usage: note "Your note content here"');
    console.error("Run note --help for more options.");
    process.exit(1);
  }

  await sendNote(apiUrl, fullContent);
}

main();
