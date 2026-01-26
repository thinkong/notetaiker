# Requirements: NoteTaiker

**Defined:** 2026-01-26
**Core Value:** Zero-friction capture with intelligent, automated organization.

## v1 Requirements

### Core Capture
- [ ] **CAPT-01**: User can open app and type within 100ms (Instant Capture)
- [ ] **CAPT-02**: User can edit notes in standard Markdown
- [ ] **CAPT-03**: Notes are saved automatically as timestamped atomic files (e.g., `YYYYMMDD-HHMMSS.md`)
- [ ] **CAPT-04**: User can view recent notes in a reverse-chronological stream (Timeline)

### AI & Organization
- [ ] **AI-01**: New notes are automatically processed by AI in the background
- [ ] **AI-02**: AI generates tags based on note content
- [ ] **AI-03**: Tags are saved to the file's YAML frontmatter
- [ ] **AI-04**: User can configure Cloud API keys (OpenAI/Anthropic) for AI processing

### Content
- [ ] **CONT-01**: User can capture plain text notes

## v2 Requirements (Deferred)

### Advanced Content
- **CONT-02**: Code blocks with syntax highlighting
- **CONT-03**: Image drag-and-drop support
- **CONT-04**: Link previews (unfurling)

### Local Intelligence
- **AI-05**: Local LLM support (Ollama integration)

### Discovery
- **DISC-01**: Semantic search (LanceDB)
- **DISC-02**: Smart Views (AI-grouped virtual folders)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Desktop App | Focus on Web/PWA first for fastest validation |
| CLI Tool | Deferred until backend logic is stable |
| WYSIWYG Editor | Pure Markdown editor provides better speed and portability |
| Manual Folders | Anti-pattern; strict flat atomic file structure |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAPT-01 | | Pending |
| CAPT-02 | | Pending |
| CAPT-03 | | Pending |
| CAPT-04 | | Pending |
| AI-01 | | Pending |
| AI-02 | | Pending |
| AI-03 | | Pending |
| AI-04 | | Pending |
| CONT-01 | | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 0
- Unmapped: 9 ⚠️

---
*Requirements defined: 2026-01-26*
