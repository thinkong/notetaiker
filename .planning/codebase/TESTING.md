# Testing Patterns

**Analysis Date:** 2026-02-03

## Test Framework

**Runner:**
- Vitest (v4.0.18)
- Config: Managed via `package.json` and default Vitest behavior.

**Assertion Library:**
- Vitest (`expect`)

**Run Commands:**
```bash
pnpm test                                 # Run all tests in apps/api
pnpm --filter @notetaiker/api test <file> # Run specific test file
```

## Test File Organization

**Location:**
- Co-located with implementation files in `apps/api/src/`.

**Naming:**
- `*.test.ts` (e.g., `apps/api/src/services/ai.service.test.ts`)

**Structure:**
```
apps/api/src/
├── services/
│   ├── ai.service.ts
│   └── ai.service.test.ts
├── routes/
│   ├── notes.ts
│   └── notes.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("ServiceName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // setup mocks/services
  });

  describe("methodName", () => {
    it("should behave correctly", async () => {
      // test logic
    });
  });
});
```

**Patterns:**
- `beforeEach`: Used to reset mocks and re-instantiate services for isolation.
- `describe` blocks: Nested to group tests by method or scenario.
- `it`: Clear descriptions of expected behavior.

## Mocking

**Framework:** Vitest (`vi`)

**Patterns:**
```typescript
// Mocking external modules
vi.mock("ai", () => ({
  generateObject: vi.fn(),
}));

// Mocking class dependencies
const secretsServiceMock = {
  getSecrets: vi.fn(),
};
const aiService = new AIService(secretsServiceMock as any);
```

**What to Mock:**
- External APIs (AI SDK, File System).
- Services passed as dependencies to other services.
- Cross-service dependencies.

**What NOT to Mock:**
- Pure utility functions (e.g., `markdown.ts`).
- Data models/Zod schemas.

## Fixtures and Factories

**Test Data:**
- Often defined inline within tests or at the top of the test file.
- Manual creation of test directories/files for integration-level checks (e.g., `.notetaiker-test`).

**Location:**
- Mostly inline; temporary test directories are created in the workspace root.

## Coverage

**Requirements:** None explicitly enforced in configuration.

**View Coverage:**
```bash
pnpm vitest run --coverage
```

## Test Types

**Unit Tests:**
- Heavily used in `apps/api` for services (`ai.service.test.ts`, `indexer.service.test.ts`).
- Focus on mocking external dependencies and verifying logic.

**Integration Tests:**
- Route tests (`notes.test.ts`) and some services (`queue.service.test.ts`) interact with the filesystem or SQLite.

**E2E Tests:**
- Not currently detected in the codebase.

## Common Patterns

**Async Testing:**
- Standard `async/await` in test functions.
- `await expect(...).rejects.toThrow()` for error cases.

**Error Testing:**
- Verifying that services handle missing configuration or API failures gracefully.

---

*Testing analysis: 2026-02-03*
