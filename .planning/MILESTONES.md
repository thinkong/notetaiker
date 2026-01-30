# Project Milestones: NoteTaiker

## v1.0 MVP (Shipped: 2026-01-29)

**Delivered:** Zero-friction capture system with local server, atomic storage, and background AI tagging.

**Phases completed:** 1-8 (26 plans total)

**Key accomplishments:**

- Zero-friction Markdown capture with "Cmd+Enter" immediate save.
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

## v1.1 Fixes & Polish (Shipped: 2026-01-30)

**Delivered:** Robust AI configuration and UI refinements for a distraction-free experience.

**Phases completed:** 9-10 (3 plans total)

**Key accomplishments:**

- **AI Resilience**: Automatic fallback to standard provider Base URLs (OpenAI/Anthropic) when left blank.
- **Clean Display**: YAML frontmatter parsing to hide technical metadata from the note stream body.
- **Universal Shortcuts**: Added `Ctrl+Enter` support for Windows/Linux users and visual save feedback.

---

## v1.2 Graph View (Shipped: 2026-01-30)

**Delivered:** Interactive visual exploration of the note network.

**Phases completed:** 11 (3 plans total)

**Key accomplishments:**

- **Force-Directed Graph**: High-performance Canvas rendering of notes and tags.
- **Intelligent Clustering**: "Tag Hub" model that visualizes shared topics as central nodes.
- **Seamless Navigation**: Side panel for viewing note content without losing graph context.
- **Visual Depth**: Hover effects, zooming, and relative node dimming for focus.

---

**What's next:** v2 Core Enhancements (Desktop App / Mobile)
