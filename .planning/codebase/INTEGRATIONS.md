# External Integrations

**Analysis Date:** 2026-01-30

## APIs & External Services

**AI Providers:**

- Anthropic - Used for AI-enhanced note analysis and tagging
  - SDK/Client: `@ai-sdk/anthropic`
  - Auth: `apiKey` in `secrets.json`
- OpenAI - Used as alternative AI provider
  - SDK/Client: `@ai-sdk/openai`
  - Auth: `apiKey` in `secrets.json`
- Google Gemini - Used as alternative AI provider
  - SDK/Client: `@ai-sdk/google`
  - Auth: `apiKey` in `secrets.json`

## Data Storage

**Databases:**

- SQLite (via `better-sqlite3`)
  - Connection: Local file (location typically within `.notetaiker` or data dir)
  - Purpose: Indexing notes and managing background job queues

**File Storage:**

- Local filesystem only
  - Notes are stored as atomic Markdown files in the directory specified by `NOTES_DIR` (default: `./data/notes`)

**Caching:**

- None detected (uses TanStack Query for in-memory frontend caching)

## Authentication & Identity

**Auth Provider:**

- Custom / Local-only
  - Implementation: No user authentication system; the app runs locally and manages its own secrets in a local JSON file.

## Monitoring & Observability

**Error Tracking:**

- None detected

**Logs:**

- Console logging in both API and Web components

## CI/CD & Deployment

**Hosting:**

- Intended for local execution

**CI Pipeline:**

- None detected (no `.github/workflows` or similar)

## Environment Configuration

**Required env vars:**

- `NODE_ENV`: development, production, or test
- `NOTES_DIR`: Path to the directory where notes are stored

**Secrets location:**

- `.notetaiker/secrets.json` - Stores AI provider API keys and models

## Webhooks & Callbacks

**Incoming:**

- None detected

**Outgoing:**

- None detected

---

_Integration audit: 2026-01-30_
