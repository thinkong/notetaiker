# Technology Stack: Local LLM Integration

**Project:** NoteTaiker (v1.5 AI Enhancements)
**Researched:** 2026-02-04
**Confidence:** HIGH

## Recommended Stack

These additions integrate with the existing Hono/React 19 stack, leveraging the high-version Vercel AI SDK already present in the codebase.

### Core AI Infrastructure

| Technology         | Version | Purpose              | Why Recommended                                                                                                 |
| ------------------ | ------- | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| **@ai-sdk/ollama** | Latest  | Ollama Provider      | Official Vercel AI SDK provider. Compatible with the `ai` (^6.0.59) package already in `apps/api`.              |
| **Ollama**         | >=0.5.0 | Local LLM Runtime    | The industry standard for local LLM management. Provides a simple API and high-performance inference.           |
| **Llamafile**      | Latest  | Portable LLM Runtime | Best for "zero-install" portability. Exposes an OpenAI-compatible API that works with existing AI SDK patterns. |

### Supporting Libraries

| Library      | Version | Purpose             | When to Use                                                                                |
| ------------ | ------- | ------------------- | ------------------------------------------------------------------------------------------ |
| **tiktoken** | ^1.0.0  | Token Counting      | Crucial for pre-flight context window checks to prevent local model crashes on long notes. |
| **p-retry**  | ^7.1.1  | Robustness          | (Existing) Used to handle transient Ollama connection failures during model loading.       |
| **p-queue**  | ^9.1.0  | Concurrency Control | (Existing) Crucial for serializing local inference to prevent CPU/GPU saturation.          |
| **zod**      | ^3.24.1 | Structured Output   | (Existing) Ensures summarization results follow a consistent JSON schema for frontmatter.  |

### Development Tools

| Tool           | Purpose          | Notes                                                                     |
| -------------- | ---------------- | ------------------------------------------------------------------------- |
| **Ollama CLI** | Model Management | For pulling models (`ollama pull llama3.2:3b`) and benchmarking hardware. |

## Installation

```bash
# In apps/api
pnpm add @ai-sdk/ollama tiktoken
```

## Alternatives Considered

| Recommended        | Alternative   | When to Use Alternative                                                                     |
| ------------------ | ------------- | ------------------------------------------------------------------------------------------- |
| **@ai-sdk/ollama** | **ollama-js** | If direct, low-level control over Ollama system features (like model management) is needed. |
| **Ollama**         | **WebLLM**    | If the app must run entirely in the browser without a local Node.js backend.                |

## Sources

- [Vercel AI SDK: Ollama Provider](https://sdk.vercel.ai/providers/ai-sdk-providers/ollama)
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [NoteTaiker apps/api/package.json](/home/ubuntu/projects/notetaiker/apps/api/package.json)
