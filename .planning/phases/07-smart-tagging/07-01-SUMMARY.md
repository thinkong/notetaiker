---
phase: 07-smart-tagging
plan: 01
subsystem: AI Service
tags: [vercel-ai-sdk, openai, anthropic, google-gemini, structured-data]
requires: [06-ai-processor]
provides: [AIService]
affects: [07-02-tag-worker]
tech-stack:
  added: [ai, @ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google]
  patterns: [Provider Switching, Structured Output]
key-files:
  created: [apps/api/src/services/ai.service.ts, apps/api/src/services/ai.service.test.ts]
  modified: [apps/api/package.json, pnpm-lock.yaml]
decisions:
  - "[07-01]: Multi-provider Support—Implemented dynamic switching between OpenAI, Anthropic, and Gemini based on key availability."
  - "[07-01]: Structured Output—Used Vercel AI SDK's generateObject to ensure consistent 3-5 tag output in Title Case."
metrics:
  duration: 112s
  completed: 2026-01-29
---

# Phase 07 Plan 01: Core AI Service Implementation Summary

## Objective
Implement the core AI service responsible for generating structured tags from note content using the Vercel AI SDK.

## One-liner
**Multi-provider AI service for structured tag generation using Vercel AI SDK.**

## Key Changes
- Installed Vercel AI SDK and providers (OpenAI, Anthropic, Google).
- Implemented `AIService` with dynamic provider selection based on `SecretsService`.
- Configured `generateObject` with Zod schema to enforce 3-5 Title Case tags.
- Added comprehensive unit tests for provider selection logic and tag generation.

## Deviations from Plan
None - plan executed exactly as written.

## Decisions Made
- **Multi-provider Support**: The service automatically falls back from OpenAI -> Anthropic -> Gemini depending on which API keys are configured in the user's secrets.
- **Strict Schema**: Used `z.array(z.string()).min(3).max(5)` to ensure the AI always returns a manageable number of tags.

## Next Phase Readiness
`AIService` is ready to be integrated into the background worker for automatic note processing.
