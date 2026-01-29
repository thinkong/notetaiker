# Phase 05: AI Configuration - Research

**Researched:** 2026-01-28
**Domain:** Secure credential management and AI provider validation
**Confidence:** HIGH

## Summary

This phase focuses on the secure storage and validation of AI service credentials (OpenAI, Anthropic, Google Gemini). The research confirms that the standard approach for local-first desktop-like web apps is to store secrets in a project-local JSON file with restricted filesystem permissions (0600).

Validation of these keys should be performed server-side (in the `apps/api` Hono server) to avoid CORS complications and to prevent exposing keys in the browser's network tab during the "Test" phase. Each provider has a lightweight "List Models" endpoint that serves as a reliable connectivity and authentication check.

**Primary recommendation:** Use `write-file-atomic` to persist `.notetaiker/secrets.json` with `mode: 0o600` and implement a centralized `AIProviderService` in the backend to handle multi-provider validation.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library             | Version | Purpose             | Why Standard                                              |
| ------------------- | ------- | ------------------- | --------------------------------------------------------- |
| `write-file-atomic` | ^6.0.0  | Secure file writing | Prevents corruption and allows setting file modes (0600). |
| `zod`               | ^3.24.1 | Schema validation   | Type-safe validation of config files and API requests.    |
| `react-hook-form`   | ^7.x    | Form management     | Industry standard for performant, type-safe React forms.  |

### Supporting

| Library        | Version | Purpose | When to Use                                           |
| -------------- | ------- | ------- | ----------------------------------------------------- |
| `lucide-react` | ^0.x    | Icons   | For show/hide password toggles and status indicators. |

### Alternatives Considered

| Instead of          | Could Use             | Tradeoff                                                                 |
| ------------------- | --------------------- | ------------------------------------------------------------------------ |
| `write-file-atomic` | `fs.writeFileSync`    | Risk of file corruption if process crashes during write; no atomic swap. |
| `react-hook-form`   | Controlled components | More boilerplate and potential re-render issues for complex forms.       |

**Installation:**

```bash
# apps/api
pnpm add write-file-atomic
pnpm add -D @types/write-file-atomic

# apps/web
pnpm add react-hook-form lucide-react
```

## Architecture Patterns

### Recommended Project Structure

```
apps/api/src/
├── services/
│   └── secrets.service.ts    # File I/O, 0600 permissions, .gitignore management
├── routes/
│   └── settings.ts           # GET/POST for configuration and validation
packages/env/
└── src/index.ts              # Define Zod schemas for secrets structure
```

### Pattern 1: Secure File Persistence

**What:** Ensure the secrets file is created with restricted permissions and excluded from git.
**When to use:** On every save operation.
**Example:**

```typescript
import writeFileAtomic from "write-file-atomic";
import fs from "node:fs";
import path from "node:path";

async function saveSecrets(workspaceRoot: string, data: any) {
  const configDir = path.join(workspaceRoot, ".notetaiker");
  const secretsPath = path.join(configDir, "secrets.json");
  const gitignorePath = path.join(workspaceRoot, ".gitignore");

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Save with 0600 permissions (owner read/write only)
  await writeFileAtomic(secretsPath, JSON.stringify(data, null, 2), {
    mode: 0o600,
  });

  // Ensure .notetaiker is in .gitignore
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf8");
    if (!content.includes(".notetaiker")) {
      fs.appendFileSync(gitignorePath, "\n# AI Secrets\n.notetaiker\n");
    }
  }
}
```

### Anti-Patterns to Avoid

- **Exposing Keys in Frontend Logs:** Never `console.log` the raw API key.
- **Client-Side Validation:** Don't call OpenAI/Anthropic directly from the browser for validation; it bypasses the security layer of the local API and can lead to CORS issues.

## Don't Hand-Roll

| Problem       | Don't Build       | Use Instead         | Why                                                                 |
| ------------- | ----------------- | ------------------- | ------------------------------------------------------------------- |
| Atomic Writes | Manual temp files | `write-file-atomic` | Handles the complexity of cross-platform atomic renaming.           |
| Form State    | Manual `useState` | `react-hook-form`   | Handles validation, dirty states, and sub-tree renders efficiently. |

## Common Pitfalls

### Pitfall 1: Race Conditions on Write

**What goes wrong:** Two rapid saves or a crash during write results in a half-written or empty JSON file.
**Why it happens:** Standard `fs.writeFile` is not atomic.
**How to avoid:** Use `write-file-atomic`.

### Pitfall 2: .gitignore Omission

**What goes wrong:** User saves a key, then runs `git add .`, accidentally pushing their API key to a public repo.
**Why it happens:** The application created a new file that isn't yet ignored.
**How to avoid:** The application MUST check and update `.gitignore` automatically when the `.notetaiker` directory is first created.

## Code Examples

### AI Provider Validation Endpoints

#### OpenAI

```typescript
// GET https://api.openai.com/v1/models
const response = await fetch("https://api.openai.com/v1/models", {
  headers: { Authorization: `Bearer ${apiKey}` },
});
const isValid = response.ok;
```

#### Anthropic

```typescript
// GET https://api.anthropic.com/v1/models
const response = await fetch("https://api.anthropic.com/v1/models", {
  headers: {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  },
});
const isValid = response.ok;
```

#### Google Gemini

```typescript
// GET https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
);
const isValid = response.ok;
```

## State of the Art

| Old Approach          | Current Approach     | When Changed | Impact                                                               |
| --------------------- | -------------------- | ------------ | -------------------------------------------------------------------- |
| Hardcoded model lists | Dynamic `listModels` | 2024+        | UI always shows current available models without app updates.        |
| Modal Settings        | Full Page Settings   | 2025         | Improved focus for complex configurations; standard for "pro" tools. |

## Open Questions

1. **How to handle multi-workspace secrets?**
   - What we know: Current decisions say "Project-local storage".
   - What's unclear: If a user has multiple NoteTaiker projects, do they have to re-enter keys for each?
   - Recommendation: Stick to project-local as per decisions, but keep the architecture flexible for a future "Global Fallback".

## Sources

### Primary (HIGH confidence)

- [write-file-atomic](https://www.npmjs.com/package/write-file-atomic) - Atomic write documentation.
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/models/list) - Models list endpoint.
- [Anthropic API Reference](https://docs.anthropic.com/en/api/models-list) - Models list endpoint.
- [Google Gemini API Reference](https://ai.google.dev/api/rest/v1beta/models/list) - Models list endpoint.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Libraries are mature and already partially in use.
- Architecture: HIGH - Standard local-first patterns.
- Pitfalls: HIGH - Common security issues for local dev tools are well-documented.

**Research date:** 2026-01-28
**Valid until:** 2026-02-28
