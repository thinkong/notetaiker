# External Integrations

**Analysis Date:** 2026-02-03

## APIs & External Services

**AI Providers:**
- Anthropic - Used for AI-enhanced note analysis and tagging.
  - SDK/Client: `@ai-sdk/anthropic`
  - Auth: `apiKey` in `.notetaiker/secrets.json`
- OpenAI - Used as alternative AI provider.
  - SDK/Client: `@ai-sdk/openai`
  - Auth: `apiKey` in `.notetaiker/secrets.json`
- Google Gemini - Used as alternative AI provider.
  - SDK/Client: `@ai-sdk/google`
  - Auth: `apiKey` in `.notetaiker/secrets.json`

## Data Storage

**Databases:**
- SQLite (via `better-sqlite3`)
  - Connection: `.notetaiker/index.db`
  - Purpose: Indexing note content and metadata; managing background job state.

**File Storage:**
- Local filesystem
  - Notes are stored as atomic Markdown files in the directory specified by `NOTES_DIR` (default: `./data/notes`).

**Caching:**
- None detected beyond TanStack Query's in-memory cache in the frontend.

## Authentication & Identity

**Auth Provider:**
- Custom / Local-only
  - Implementation: No user authentication system; secrets are managed locally in a `.notetaiker/secrets.json` file.

## Monitoring & Observability

**Error Tracking:**
- None detected.

**Logs:**
- Console logging in both API and Web components.

## CI/CD & Deployment

**Hosting:**
- Intended for local execution.

**CI Pipeline:**
- None detected (no `.github/workflows` found).

## Environment Configuration

**Required env vars:**
- `NODE_ENV`: development, production, or test.
- `NOTES_DIR`: Path to the directory where notes are stored.

**Secrets location:**
- `.notetaiker/secrets.json` - Stores AI provider API keys and configuration. Managed by `SecretsService`.

## Webhooks & Callbacks

**Incoming:**
- None detected.

**Outgoing:**
- None detected.

---

*Integration audit: 2026-02-03*
