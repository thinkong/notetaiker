# Phase 01: Foundation - Research

**Researched:** 2026-01-26
**Domain:** Monorepo Infrastructure & Tooling
**Confidence:** HIGH

## Summary

This research focuses on establishing a high-performance, type-safe development environment for NoteTaiker using a Turborepo-managed monorepo. The architecture leverages pnpm for workspace management, Vite for fast builds, and Hono for a lightweight backend. A critical finding is that `eslint-config-airbnb-typescript` is archived as of 2025; therefore, implementing "Airbnb style" in 2026 requires using ESLint's Flat Config with `@eslint/compat` or a modern community alternative.

**Primary recommendation:** Use Turborepo with pnpm workspaces, sharing Tailwind CSS v4 and ESLint Flat Configs via a centralized `packages/` directory to ensure consistency across `apps/web` and `apps/api`.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library          | Version | Purpose               | Why Standard                                                        |
| ---------------- | ------- | --------------------- | ------------------------------------------------------------------- |
| **Turborepo**    | 2.x     | Monorepo Orchestrator | Industry standard for zero-config caching and task orchestration.   |
| **pnpm**         | 9.x+    | Package Manager       | Fast, disk-efficient, and has first-class workspace support.        |
| **Vite**         | 6.x     | Build Tool / HMR      | Provides the fastest development experience and native ESM support. |
| **Hono**         | 4.x     | Backend Framework     | Extremely fast, lightweight, and provides type-safe RPC for React.  |
| **Tailwind CSS** | 4.x     | Styling               | v4 uses a CSS-first engine and Vite plugin for maximum performance. |
| **shadcn/ui**    | Latest  | UI Components         | Clean, accessible, and easily shareable in monorepos.               |

### Supporting

| Library        | Version | Purpose               | When to Use                                        |
| -------------- | ------- | --------------------- | -------------------------------------------------- |
| **Changesets** | 2.x     | Versioning/Changelogs | To manage package versions and automated releases. |
| **Husky**      | 9.x     | Git Hooks             | To enforce linting and commit message standards.   |
| **Commitlint** | 19.x    | Commit Linting        | Enforces Conventional Commits (feat, fix, etc.).   |
| **TypeScript** | 5.7+    | Language              | Use `strict: true` for Hono RPC type safety.       |

### Alternatives Considered

| Instead of   | Could Use     | Tradeoff                                                                                      |
| ------------ | ------------- | --------------------------------------------------------------------------------------------- |
| Turborepo    | Nx            | Nx is more powerful but has a steeper learning curve; Turbo is "faster" for simple monorepos. |
| Airbnb Style | Standard / XO | Airbnb is stricter but requires more boilerplate in Flat Config.                              |
| Hono         | Express       | Express is legacy; Hono is built for modern runtimes (Edge/Bun/Node).                         |

**Installation:**

```bash
# Initialize Monorepo
npx create-turbo@latest

# Add dependencies in apps/web
pnpm add -F web tailwindcss @tailwindcss/vite lucide-react

# Add dependencies in apps/api
pnpm add -F api hono
```

## Architecture Patterns

### Recommended Project Structure

```
.
├── apps/
│   ├── web/                # React + Vite + Tailwind v4
│   └── api/                # Hono API
├── packages/
│   ├── ui/                 # Shared shadcn/ui components
│   ├── tsconfig/           # Shared TS configurations
│   ├── eslint-config/      # Shared ESLint Flat Configs
│   └── tailwind-config/    # Shared Tailwind presets (if needed for v4)
├── .changeset/             # Changeset configuration
├── turbo.json              # Pipeline definitions
└── pnpm-workspace.yaml     # Workspace configuration
```

### Pattern 1: Hono RPC Type Safety

**What:** Exporting the API type from the server and consuming it in the frontend for 100% type safety without manual interface definitions.
**When to use:** Always, as it prevents API/Frontend drift.
**Example:**

```typescript
// apps/api/src/index.ts
const app = new Hono().get("/hello", (c) => c.json({ message: "Hello" }));
export type AppType = typeof app;

// apps/web/src/lib/api.ts
import { hc } from "hono/client";
import type { AppType } from "api"; // Linked via workspace
export const client = hc<AppType>("http://localhost:3000");
```

### Anti-Patterns to Avoid

- **Implicit Dependencies:** Don't rely on `node_modules` hoisting; always declare dependencies in the package that uses them.
- **Monolithic Configs:** Avoid one giant `tsconfig.json`. Use the `extends` pattern to keep package-specific configs clean.

## Don't Hand-Roll

| Problem       | Don't Build          | Use Instead | Why                                                               |
| ------------- | -------------------- | ----------- | ----------------------------------------------------------------- |
| Versioning    | Custom scripts       | Changesets  | Handles monorepo graph dependencies and changelogs automatically. |
| UI Components | Custom Button/Input  | shadcn/ui   | Accessible, themed, and follows best practices out of the box.    |
| Git Hooks     | `.git/hooks` scripts | Husky       | Portable across development environments.                         |

## Common Pitfalls

### Pitfall 1: Archived Linting Configs

**What goes wrong:** Attempting to use `eslint-config-airbnb-typescript` results in dependency errors or failure to load in ESLint 9+ (Flat Config).
**Why it happens:** The package is archived and doesn't natively support the new configuration format.
**How to avoid:** Use `@eslint/compat` to wrap the legacy config or use a modern community fork that supports Flat Config.
**Warning signs:** `Error: ESLint configuration is invalid` or missing TS-specific rules.

### Pitfall 2: Tailwind v4 Monorepo Paths

**What goes wrong:** Tailwind fails to find classes in the `packages/ui` directory.
**Why it happens:** The default content scanning might not reach outside the `apps/web` directory.
**How to avoid:** In Tailwind v4, use the `@tailwindcss/vite` plugin and ensure the workspace paths are correctly configured in the CSS entry point using `@source`.

## Code Examples

### ESLint Flat Config (airbnb-style)

```javascript
// packages/eslint-config/base.js
import { fixupConfigRules } from "@eslint/compat";
import airbnbBase from "eslint-config-airbnb-base";

export default [
  ...fixupConfigRules(airbnbBase),
  {
    rules: {
      "import/prefer-default-export": "off",
    },
  },
];
```

## State of the Art

| Old Approach         | Current Approach   | When Changed | Impact                                         |
| -------------------- | ------------------ | ------------ | ---------------------------------------------- |
| `.eslintrc.js`       | `eslint.config.js` | ESLint v9    | Native ESM, faster performance, clearer logic. |
| `tailwind.config.js` | CSS-first config   | Tailwind v4  | Faster builds, less JS boilerplate.            |
| `npm`/`yarn`         | `pnpm`             | 2023-2024    | Significant disk savings and faster installs.  |

## Open Questions

1. **Exact Airbnb Flat Config replacement**
   - What we know: `iamturns` is archived.
   - What's unclear: Which community fork is the "blessed" one for 2026.
   - Recommendation: Start with `eslint-config-airbnb-base` wrapped in `@eslint/compat` and layer in `typescript-eslint` rules manually for maximum control.

## Sources

### Primary (HIGH confidence)

- [Turborepo Documentation](https://turborepo.dev/repo/docs/guides/shared-configurations) - Shared configs.
- [Hono RPC Guide](https://hono.dev/docs/guides/rpc) - Type-safe API.
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs/v4-beta) - Vite integration.
- [ESLint Configuration](https://eslint.org/docs/latest/use/configure/configuration-files) - Flat Config.

### Secondary (MEDIUM confidence)

- [Changesets Intro](https://github.com/changesets/changesets/blob/main/docs/intro.md) - Versioning.
- [shadcn/ui Monorepo](https://ui.shadcn.com/docs/monorepo) - Workspace structure.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Industry standard tools.
- Architecture: HIGH - Turborepo patterns are stable.
- Pitfalls: MEDIUM - Linting landscape is shifting.

**Research date:** 2026-01-26
**Valid until:** 2026-02-26
