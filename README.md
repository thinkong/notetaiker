# notetAIker

notetAIker is a local-first, AI-enhanced note-taking system designed for zero-friction capture. It allows you to input anything into a stream of atomic Markdown files, while a background AI agent automatically organizes content by generating relevant tags.

## Features

- **Zero-Friction Capture**: Open the app and start typing immediately (<100ms startup).
- **Local-First**: All data is stored as plain Markdown files on your disk. You own your data.
- **AI-Powered Organization**: Background agents analyze your notes and generate tags automatically.
- **Atomic Notes**: Each note is a separate file, making it easy to manage and sync.
- **Power User Friendly**: Keyboard shortcuts (`Cmd+K` for search, `Cmd+Enter` to save) and a command palette.
- **Multi-Model Support**: Configure OpenAI, Anthropic, or Gemini API keys for AI processing.

## Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: v9 or higher (Recommended package manager)
- **Git**

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

   The default configuration will store notes in `./data/notes` relative to the project root. You can modify `NOTES_DIR` in `.env` if you want to store them elsewhere.

4. **Start Development Server**

   This command starts both the API server (port 3001) and the Web client (port 5173):

   ```bash
   pnpm dev
   ```

   - **Web Interface**: [http://localhost:5173](http://localhost:5173)
   - **API Server**: [http://localhost:3001](http://localhost:3001)

## Architecture

notetAIker is a monorepo built with:

- **Frontend**: React 19, Tailwind CSS v4, Vite, TanStack Query, CodeMirror 6.
- **Backend**: Hono (Node.js), SQLite (for indexing/queues), Server-Sent Events (SSE).
- **Shared**: Zod schemas, TypeScript types.

## Usage

### Capture

1. Open the app.
2. Type your note.
3. Press `Cmd+Enter` (or `Ctrl+Enter`) to save immediately.

### AI Configuration

1. Go to Settings (via the command palette `Cmd+K` or navigation).
2. Enter your API key for your preferred provider (OpenAI, Anthropic, or Google Gemini).
3. The system will verify the key and enable background processing.

### Search

- Press `Cmd+K` to open the Command Palette.
- Search by text content or tags.
- Use arrow keys to navigate and `Enter` to jump to a note.

## Development Commands

- `pnpm build`: Build all packages and apps.
- `pnpm lint`: Run ESLint across the monorepo.
- `pnpm format`: Format code using Prettier.
- `pnpm test`: Run tests (currently setup in API).

## Docker Deployment

NoteTAIker can be deployed as a self-contained Docker image.

### Quick Start with Docker Compose

```bash
docker compose up -d
```

Access the app at [http://localhost:3001](http://localhost:3001)

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

- `/app/data`: Notes are stored here as Markdown files
- `/app/.notetaiker`: Configuration and SQLite databases (secrets, queues)

## License

Private
