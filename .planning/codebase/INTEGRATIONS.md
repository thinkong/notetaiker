# External Integrations

**Analysis Date:** 2026-02-04

## APIs & External Services

**AI Providers:**

- OpenAI - Used for note analysis and tag generation.
  - SDK: `@ai-sdk/openai`
  - Auth: API Key stored in `.notetaiker/secrets.json`
- Anthropic - Used for note analysis and tag generation.
  - SDK: `@ai-sdk/anthropic`
  - Auth: API Key stored in `.notetaiker/secrets.json`
- Google Gemini - Used for note analysis and tag generation.
  - SDK: `@ai-sdk/google`
  - Auth: API Key stored in `.notetaiker/secrets.json`
- Ollama (Local) - Default local AI provider for privacy-focused analysis.
  - SDK: `ai-sdk-ollama`, `ollama-ai-provider`
  - Connection: `http://localhost:11434` (or `http://ollama:11434` in Docker)

## Data Storage

**Databases:**

- SQLite (Local)
  - Purpose: Indexing note metadata, content for search, and job queue management.
  - Client: `better-sqlite3`
  - Location: Managed via `IndexerService`

**File Storage:**

- Local Filesystem
  - Purpose: Primary storage for notes as atomic Markdown files.
  - Implementation: `StorageService` using `node:fs/promises` and `write-file-atomic`.
  - Path: Configurable via `NOTES_DIR` (default: `./data/notes`).

**Caching:**

- None detected (relies on SQLite indexing for performance).

## Authentication & Identity

**Auth Provider:**

- Custom / Local
  - Implementation: Local-first application. Secrets (API keys) are stored locally in `.notetaiker/secrets.json` and managed by `SecretsService`.

## Monitoring & Observability

**Error Tracking:**

- None detected.

**Logs:**

- Console logging with standard `console.error`/`console.warn`.

## CI/CD & Deployment

**Hosting:**

- Self-hosted via Docker.

**CI Pipeline:**

- None detected in repository root.

## Environment Configuration

**Required env vars:**

- `NOTES_DIR`: Directory where markdown notes are stored.
- `PORT`: Port for the API server (default 3001).

**Secrets location:**

- `.notetaiker/secrets.json` (Automatically added to `.gitignore` by `SecretsService`).

## Webhooks & Callbacks

**Incoming:**

- None detected.

**Outgoing:**

- None detected.

---

_Integration audit: 2026-02-04_
