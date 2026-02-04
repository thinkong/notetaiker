# Testing Patterns

**Analysis Date:** 2026-02-04

## Test Framework

**Runner:**
- **Vitest**: Used for unit and integration testing in the backend.
- Config: Configured within `apps/api/package.json` via the `test` script.

**Assertion Library:**
- `expect` from Vitest (Jest-compatible).

**Run Commands:**
```bash
pnpm test              # Run all tests (monorepo level)
pnpm --filter @notetaiker/api test # Run API tests
```

## Test File Organization

**Location:**
- **Co-located**: Test files live alongside the source code in the same directory (e.g., `src/services/ai.service.test.ts`).

**Naming:**
- Pattern: `[filename].test.ts`

**Structure:**
```
apps/api/src/
├── lib/
│   ├── markdown.ts
│   └── markdown.test.ts
├── routes/
│   ├── notes.ts
│   └── notes.test.ts
└── services/
    ├── ai.service.ts
    └── ai.service.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("ServiceName", () => {
  beforeEach(() => {
    // Setup
  });

  describe("methodName", () => {
    it("should perform expected action", async () => {
      // Test
    });
  });
});
```

**Patterns:**
- **Setup**: `beforeEach` used for cleaning mocks and initializing services.
- **Teardown**: `afterEach` used for cleaning up temporary files and resetting timers.
- **Assertion**: Fluent `expect` API (e.g., `toBe`, `toEqual`, `toMatch`, `toThrow`).

## Mocking

**Framework:** Vitest Built-in (`vi`)

**Patterns:**
```typescript
// Mocking external modules
vi.mock("ai", () => ({
  generateText: vi.fn(),
  Output: { object: vi.fn() }
}));

// Mocking dependencies
const secretsServiceMock = {
  getSecrets: vi.fn(),
};
const aiService = new AIService(secretsServiceMock as any);
```

**What to Mock:**
- External APIs and SDKs (Vercel AI SDK, OpenAI, Anthropic).
- Services that involve complex logic or external state when unit testing a specific layer.

**What NOT to Mock:**
- Utility functions (e.g., `markdown.ts` utilities).
- Internal services when performing integration-style tests (e.g., `StorageService` often uses a real `IndexerService` with a temporary filesystem).

## Fixtures and Factories

**Test Data:**
- Simple objects or strings defined within the test file.
- UUIDs and ISO strings used for metadata simulation.

**Location:**
- Usually inline within `describe` or `it` blocks.

## Coverage

**Requirements:** None enforced in CI yet.

**View Coverage:**
```bash
# Not currently configured with a dedicated script, but supported by Vitest
pnpm --filter @notetaiker/api exec vitest run --coverage
```

## Test Types

**Unit Tests:**
- Pure logic tests for utilities (e.g., hashtag extraction).
- Service methods with mocked dependencies.

**Integration Tests:**
- `StorageService` tests that interact with the filesystem and `IndexerService` (SQLite).
- These tests use `fs.mkdtemp` to create isolated environments.

**E2E Tests:**
- Not currently implemented.

## Common Patterns

**Async Testing:**
- Extensive use of `async/await` in test cases.
- Mocking resolved/rejected promises with `mockResolvedValue` or `mockRejectedValue`.

**Error Testing:**
- Using `expect(...).rejects.toThrow()` for expected exceptions.

**Filesystem Testing:**
- Using `node:os.tmpdir()` and `fs.mkdtemp()` to create isolated test environments for IO-heavy services.

---

*Testing analysis: 2026-02-04*
