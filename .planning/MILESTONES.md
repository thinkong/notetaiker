# Project Milestones: NoteTaiker

## v1.3.1 Patch Fixes (Shipped: 2026-01-31)

**Delivered:** Patch release focused on resolving known regressions and hardening the build system.

**Phases completed:** 14 (2 plans total)

**Key accomplishments:**

- **Tag UI Unification**: Consistent display for manual and AI tags with removal workflow.
- **Build System Hardening**: Enabled `verbatimModuleSyntax` across the monorepo for robust imports.
- **Type Safety**: Enforced `import type` usage via ESLint to prevent side-effect imports.
- **Regression Fixes**: Resolved UI inconsistencies in note preview overlay.

**Stats:**

- 71 files modified
- ~5250 LOC TypeScript
- 1 phase, 2 plans
- 1 day from start to ship

**Git range:** `docs(14)` → `docs(phase-14)`

**What's next:** Plan v1.4 (Scope TBD)

---

## v1.3 UX Polish & Flow (Shipped: 2026-01-31)

**Delivered:** Improved user experience with seamless navigation, draft persistence, and manual control over AI tagging.

**Phases completed:** 12-13 (7 plans total)

**Key accomplishments:**

- **Guard-First Navigation**: Centralized protection against data loss when navigating away from unsaved changes.
- **Draft Persistence**: Automatic local backup ensures work is never lost on refresh or accidental closure.
- **Manual Tag Control**: Full support for hashtags (#tag) in the editor with visual distinction from AI tags.
- **Seamless Flow**: "Save & Reset" workflow allows continuous capture without breaking focus.

**Stats:**

- 7 plans completed
- 100% requirements coverage (6/6)
- 0 regressions in cross-phase integration

**Git range:** `feat(12-01)` → `feat(13-03)`

**What's next:** Plan v1.4 (Scope TBD)

---

## v1.2 Graph View (Shipped: 2026-01-30)

**Delivered:** Interactive visual exploration of the note network with force-directed graph.

**Phases completed:** 11 (3 plans total)

**Key accomplishments:**

- **Force-Directed Graph**: High-performance Canvas rendering of notes and tags.
- **Intelligent Clustering**: "Tag Hub" model that visualizes shared topics as central nodes.
- **Seamless Navigation**: Side panel for viewing note content without losing graph context.
- **Visual Depth**: Hover effects, zooming, and relative node dimming for focus.

**Stats:**

- ~4250 LOC total
- 3 plans completed
- 100% test coverage for new components

**Git range:** `feat(11-01)` → `feat(11-03)`

**What's next:** Next Milestone Planning (v1.3)

---

## v1.1 Fixes & Polish (Shipped: 2026-01-30)

**Delivered:** Robust AI configuration and UI refinements for a distraction-free experience.

**Phases completed:** 9-10 (3 plans total)

**Key accomplishments:**

- **AI Resilience**: Automatic fallback to standard provider Base URLs (OpenAI/Anthropic) when left blank.
- **Clean Display**: YAML frontmatter parsing to hide technical metadata from the note stream body.
- **Universal Shortcuts**: Added `Ctrl+Enter` support for Windows/Linux users and visual save feedback.

---

## v1.0 MVP (Shipped: 2026-01-29)

**Delivered:** Zero-friction capture system with local server, atomic storage, and background AI tagging.

**Phases completed:** 1-8 (26 plans total)

**Key accomplishments:**

- **Zero-friction Markdown capture with "Cmd+Enter" immediate save.
- Real-time AI processing pipeline using Server-Sent Events (SSE).
- Automated tagging and YAML frontmatter injection.
- Keyboard-driven navigation with "Cmd+K" command palette.
- Atomic file storage engine with sub-5ms listing performance.

**Stats:**

- 149 files created/modified
- ~3034 lines of TypeScript
- 8 phases, 26 plans
- 4 days from start to ship

**Git range:** `feat(01-01)` → `feat(08-02)`

---
