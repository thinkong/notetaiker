# Testing Patterns

**Analysis Date:** 2026-01-30

## Test Framework

**Runner:**
- Vitest ^4.0.18
- Config: `apps/api/vitest.config.ts` (not explicitly seen but referenced in `package.json`)

**Assertion Library:**
- Vitest (`expect`)

**Run Commands:**
```bash
pnpm test              # Run all tests (usually maps to vitest)
pnpm --filter @notetaiker/api test <file> # Run specific test file
```

## Test File Organization

**Location:**
- Co-located with implementation (e.g., `apps/api/src/services/ai.service.test.ts` next to `ai.service.ts`).

**Naming:**
- `[name].test.ts` (e.g., `storage.service.test.ts`)

**Structure:**
```
src/
  services/
    storage.service.ts
    storage.service.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("ServiceName", () => {
  beforeEach(() => {
    // Setup
  });

  it("should do something", async () => {
    // Test logic
  });
});
```

**Patterns:**
- `describe` blocks for grouping by method or functionality.
- `beforeEach` for resetting mocks and initializing services.

## Mocking

**Framework:** Vitest (`vi`)

**Patterns:**
```typescript
// Mocking external SDKs
vi.mock("ai", () => ({
  generateObject: vi.fn(),
}));

// Mocking local services
const secretsServiceMock = {
  getSecrets: vi.fn(),
};
```

**What to Mock:**
- External AI SDKs (`ai`, `@ai-sdk/openai`, etc.)
- Services passed as dependencies to other services.

**What NOT to Mock:**
- Data-only utilities (e.g., `markdown.ts`)
- Zod schemas

## Fixtures and Factories

**Test Data:**
- Manual creation of test directories and files (e.g., `const testDbDir = path.join(workspaceRoot, ".notetaiker-test")` in `queue.service.test.ts`).

**Location:**
- Temporary test directories are often created within the workspace root (e.g., `.notetaiker-test`).

## Coverage

**Requirements:** None enforced in `package.json`.

**View Coverage:**
```bash
# Not explicitly configured in package.json but supported by vitest
pnpm vitest run --coverage
```

## Test Types

**Unit Tests:**
- Focus on individual services (`ai.service.test.ts`, `indexer.service.test.ts`).
- Heavy use of mocking for dependencies.

**Integration Tests:**
- `queue.service.test.ts` interacts with the filesystem and SQLite.
- `notes.test.ts` (API routes) likely tests the integration between Hono and services.

**E2E Tests:**
- Not detected.

## Common Patterns

**Async Testing:**
- Use `async/await` in test functions.
- `expect(promise).rejects.toThrow(...)` for error cases.

**Error Testing:**
```typescript
it("should throw error if no provider is configured", async () => {
  secretsServiceMock.getSecrets.mockResolvedValue({});
  await expect(aiService.generateTags("content")).rejects.toThrow("No AI provider configured");
});
```

---

*Testing analysis: 2026-01-30*
