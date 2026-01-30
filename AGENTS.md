# Agent Coding Conventions

This document outlines the coding conventions and standards that the AI agent should follow when working on the **NoteTAIker** project.

## 1. Commit Messages

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This is enforced by `commitlint` and `husky`.

**Format:** `<type>(scope): <description>`

**Common Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

**Example:**
`feat(web): add login page components`
`fix(api): handle undefined user id in note creation`

## 2. Code Linting & Quality

The project uses ESLint with a shared base configuration in `packages/eslint-config/base.js`.

- **Unused Variables**: Should be avoided. ESLint will warn about `no-unused-vars`.
- **Console Logs**: Use `console.warn` or `console.error` for errors. General `console.log` is discouraged in the frontend but allowed in the API for startup/server logs.
- **Rules Enforcement**: Pre-commit hooks run `turbo lint`, which will fail the commit if there are linting errors.

## 3. Formatting

Prettier is used for all TypeScript (`.ts`, `.tsx`) and Markdown (`.md`) files.

- **Enforcement**: ESLint treats Prettier violations as errors.
- **How to format**: Run `pnpm format` to format all supported files in the workspace.

## 4. Development Workflow

- **Package Manager**: Use `pnpm`. Avoid `npm` or `yarn`.
- **Task Runner**: Use `turbo` for building, linting, and running the dev server.
  - `pnpm dev`: Starts all applications in development mode.
  - `pnpm build`: Builds all applications.
  - `pnpm lint`: Runs linting across the entire workspace.
- **Monorepo Structure**:
  - `apps/`: Contains the main applications (web, api).
  - `packages/`: Contains shared packages (eslint-config, etc.).

## 5. Architectural Preferences (Heuristics)

- **Frameworks**:
  - **Frontend**: React (v19) with Vite, Tailwind CSS (v4), and React Router (v7).
  - **Backend**: Hono (running on Node.js) with Zod for validation.
- **State Management**: TanStack Query (React Query) for server state.
- **Form Handling**: React Hook Form.
- **AI Integration**: Vercel AI SDK (`ai`, `@ai-sdk/google`, etc.).
- **Database**: SQLite via `better-sqlite3`.
- **Styling**: Tailwind CSS (v4) with utility-first approach.
- **Icons**: Lucide React.
- **Component Library**: Primitive components from `cmdk` for command palettes, and custom Tailwind-based components.
- **TypeScript**: Strictly used for both frontend and backend. Ensure types are shared via workspace packages where appropriate.
- **Monorepo Structure**:
  - `apps/web`: React frontend.
  - `apps/api`: Hono backend.
  - `packages/`: Shared configurations and utilities.

## 6. Development Heuristics

- **Code Style**:
  - Use functional components and hooks for React.
  - Use Zod schemas for all data validation (API requests/responses).
  - Prefer `lucide-react` for icons.
  - Ensure all API endpoints are typed and consistent.
- **Testing**: Use `vitest` for backend testing.
- **Formatting**: Always format files before finishing a task (`pnpm format`).
- **Commits**: Always use conventional commits. If multiple changes are made, consider splitting them into logical commits or using a detailed description.

---

_Note: This file serves as a reference for the AI agent to ensure consistency with the existing codebase and automation._
