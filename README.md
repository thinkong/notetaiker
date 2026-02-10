# notetAIker

notetAIker is a local-first, AI-enhanced note-taking system designed for zero-friction capture. Input anything into a stream of atomic Markdown files while background AI agents automatically organize your content by generating tags, computing semantic embeddings, and surfacing relationships between your notes.

## Features

- **Zero-Friction Capture**: Open the app and start typing immediately. Press `Cmd+Enter` (or `Ctrl+Enter`) to save.
- **Local-First**: All data is stored as plain Markdown files on your disk. You own your data.
- **AI-Powered Organization**: Background agents analyze your notes and generate tags automatically. Dismiss or keep AI suggestions.
- **Semantic Search & Related Notes**: Vector embeddings power similarity-based discovery so you can find notes related to what you're reading.
- **Graph Visualization**: Explore your notes as an interactive force-directed graph with tag-based links, semantic clustering (DBSCAN), filtering, and local-view navigation.
- **Multi-Model Support**: Configure OpenAI, Anthropic, Google Gemini, or local Ollama models for AI processing.
- **Atomic Notes**: Each note is a separate Markdown file with YAML frontmatter for metadata.
- **Power User Friendly**: Keyboard shortcuts, a command palette (`Cmd+K`), and a Markdown editor built on CodeMirror 6.
- **Real-Time Feedback**: Server-Sent Events keep the UI in sync with background processing status.

## Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: v9 or higher
- **Git**
- **Docker**

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd notetaiker
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Environment**

   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   The default configuration stores notes in `./data/notes` relative to the project root. Modify `NOTES_DIR` in `.env` to change the storage location.

4. **Start Development Server**

   This command starts both the API server (port 3001) and the Web client (port 5173):

   ```bash
   pnpm dev
   ```

   - **Web Interface**: [http://localhost:5173](http://localhost:5173)
   - **API Server**: [http://localhost:3001](http://localhost:3001)

## Architecture

notetAIker is a pnpm monorepo managed by Turbo.

### Monorepo Structure

```
notetaiker/
├── apps/
│   ├── api/          # Hono backend (Node.js)
│   └── web/          # React frontend (Vite)
├── packages/
│   ├── env/          # Shared environment config (Zod-validated)
│   ├── eslint-config/# Shared ESLint configuration
│   └── tsconfig/     # Shared TypeScript configuration
├── data/notes/       # Note storage (Markdown files)
└── .notetaiker/      # SQLite databases and secrets
```

### Frontend (`apps/web`)

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **State**: TanStack Query v5
- **Editor**: CodeMirror 6 with markdown extensions, hashtag autocomplete, and link handling
- **Graph**: `react-force-graph-2d` with D3-force physics
- **Routing**: React Router v7
- **Search**: Command palette powered by `cmdk`
- **Icons**: Lucide React
- **Forms**: React Hook Form

### Backend (`apps/api`)

- **Server**: Hono v4 (Node.js)
- **Database**: SQLite via `better-sqlite3` (for indexing and job queues, **not** note storage)
- **Vector Search**: `sqlite-vec` for embedding storage and similarity queries
- **AI Integration**: Vercel AI SDK with providers for OpenAI, Anthropic, Google Gemini, and Ollama
- **Async Processing**: `p-queue` and `p-retry` for background jobs with concurrency control
- **Validation**: Zod schemas for all request/response data

### Data Model

- **Notes**: Atomic Markdown files with YAML frontmatter (`id`, `title`, `tags`, `ai_tags`, `ignored_tags`, `createdAt`, `updatedAt`).
- **Index**: SQLite database for fast full-text search and metadata queries.
- **Embeddings**: 768-dimension vectors stored in `sqlite-vec` virtual tables for semantic similarity.
- **Jobs**: SQLite-backed queue with `analysis` (AI tagging) and `embeddings` job types.

## Usage

### Capture

1. Open the app — the editor is immediately focused.
2. Type your note in Markdown.
3. Press `Cmd+Enter` (or `Ctrl+Enter`) to save.
4. Use `#hashtags` inline to add manual tags.

### Search & Navigation

- Press `Cmd+K` to open the Command Palette.
- Search by text content or tags.
- Use arrow keys to navigate results and `Enter` to open a note.
- Browse the **Timeline** sidebar for chronological history with infinite scroll.
- View **Related Notes** in the sidebar for semantically similar content.

### Graph View

- Switch to the Graph View to see all notes and tags as an interactive force-directed graph.
- **Filter** by tags using the toolbar (AND/OR modes).
- **Local View**: Focus on a single note's neighborhood.
- **Semantic Clustering**: Toggle cluster coloring to see groups of related notes detected by DBSCAN.
- **Double-click** a node to navigate to that note.
- **Pin nodes** to keep them in place; graph state persists across sessions.

### AI Configuration

1. Go to **Settings** (via the command palette or navigation).
2. Enter your API key for your preferred provider (OpenAI, Anthropic, Google Gemini, or use Ollama for local models).
3. The system validates the key and enables background processing.
4. Monitor and retry failed jobs from the Settings page.

### Embeddings

1. Navigate to **Settings > Smart Connections**.
2. View indexing status (indexed notes vs total).
3. Trigger a full **Rebuild** if needed.

## API Endpoints

| Method  | Path                    | Description                     |
| ------- | ----------------------- | ------------------------------- |
| `GET`   | `/notes`                | List notes (paginated)          |
| `POST`  | `/notes`                | Create a new note               |
| `GET`   | `/notes/:id`            | Get a note by ID                |
| `PATCH` | `/notes/:id`            | Update note metadata            |
| `GET`   | `/notes/:id/related`    | Get semantically related notes  |
| `GET`   | `/settings`             | Get current settings            |
| `POST`  | `/settings`             | Save settings                   |
| `POST`  | `/settings/validate`    | Validate an API key             |
| `GET`   | `/settings/failed-jobs` | Get failed job count            |
| `POST`  | `/settings/retry-jobs`  | Retry failed jobs               |
| `GET`   | `/embeddings/status`    | Get embedding index status      |
| `POST`  | `/embeddings/rebuild`   | Rebuild embedding index         |
| `GET`   | `/api/clusters`         | Get semantic clusters           |
| `POST`  | `/api/clusters/rebuild` | Rebuild clusters                |
| `GET`   | `/api/events`           | SSE stream for real-time events |
| `GET`   | `/health`               | Health check                    |

## Development Commands

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `pnpm dev`          | Start API and Web in development mode |
| `pnpm build`        | Build all packages and apps           |
| `pnpm lint`         | Run ESLint across the monorepo        |
| `pnpm lint:fix`     | Run ESLint with auto-fix              |
| `pnpm format`       | Format code with Prettier             |
| `pnpm test`         | Run tests (Vitest, API package)       |
| `pnpm ollama:start` | Start the Ollama container            |
| `pnpm ollama:stop`  | Stop the Ollama container             |
| `pnpm docker:start` | Build and start all Docker services   |
| `pnpm docker:stop`  | Stop all Docker services              |

## Docker Deployment

NoteTAIker can be deployed as a self-contained Docker image.

### Quick Start with Docker Compose

```bash
docker compose up -d
```

Access the app at [http://localhost:3001](http://localhost:3001).

The compose file includes two services:

1. **notetaiker** — the main application serving both the API and the built frontend.
2. **ollama** — an optional local AI provider with GPU support (NVIDIA). Automatically pulls `gemma3:4b` and `embeddinggemma` models on first start.

### Manual Docker Build

```bash
# Build the image
docker build -t notetaiker:latest .

# Run the container
docker run -d \
  --name notetaiker \
  -p 3001:3001 \
  -v notetaiker-data:/app/data \
  -v notetaiker-config:/app/.notetaiker \
  notetaiker:latest
```

### Docker Volumes

| Volume             | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `/app/data`        | Notes stored as Markdown files                         |
| `/app/.notetaiker` | Configuration, SQLite databases, and encrypted secrets |

### Environment Variables

| Variable     | Default        | Description                                            |
| ------------ | -------------- | ------------------------------------------------------ |
| `NODE_ENV`   | `development`  | Environment mode (`development`, `test`, `production`) |
| `NOTES_DIR`  | `./data/notes` | Path to the notes directory                            |
| `PORT`       | `3001`         | Server port                                            |
| `DOCKER_ENV` | —              | Set to `true` when running in Docker                   |

## Tech Stack

| Layer        | Technologies                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| Frontend     | React 19, Vite, Tailwind CSS v4, TanStack Query, CodeMirror 6, React Router v7, react-force-graph-2d |
| Backend      | Hono, better-sqlite3, sqlite-vec, Vercel AI SDK, p-queue                                             |
| AI Providers | OpenAI, Anthropic, Google Gemini, Ollama                                                             |
| Dev Tools    | TypeScript, ESLint, Prettier, Vitest, Turbo, Husky, Commitlint                                       |
| Deployment   | Docker, Docker Compose                                                                               |

## License

Private
