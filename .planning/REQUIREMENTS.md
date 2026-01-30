# Requirements: NoteTaiker

**Defined:** 2026-01-29
**Core value:** Zero-friction capture with intelligent, automated organization.

## v1.1 Requirements

Requirements for "Fixes & Polish" milestone.

### AI Configuration

- [x] **AI-FIX-01**: System uses default provider Base URL when user leaves it empty
      (e.g., OpenAI defaults to `https://api.openai.com/v1`, Anthropic to `https://api.anthropic.com/v1`)

### UI & UX

- [x] **UI-FIX-01**: Note view parses frontmatter and excludes it from body rendering
      (Raw YAML should not be visible in the note display)
- [x] **UI-FIX-02**: User can save note using `Ctrl+Enter` shortcut
      (In addition to existing `Cmd+Enter`)

## v1.2 Requirements

Visual exploration and graph features.

### Graph View

- [x] **GRAPH-01**: User can view notes in a force-directed graph
- [x] **GRAPH-02**: Links between notes are visualized as edges

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Desktop App

- [ ] **DSK-01**: App runs as native Tauri application
- [ ] **DSK-02**: App supports system tray quick capture

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Hosted Service | Local-first focus for v1; sync via file system only. |
| WYSIWYG Editor | Markdown source-of-truth is core value; no hidden formatting. |
| Mobile App | Web/PWA first; native mobile is a separate future milestone. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AI-FIX-01 | Phase 9 | Complete |
| UI-FIX-01 | Phase 10 | Complete |
| UI-FIX-02 | Phase 10 | Complete |
| GRAPH-01 | Phase 11 | Complete |
| GRAPH-02 | Phase 11 | Complete |

**Coverage:**
- v1.1 requirements: 3 total
- v1.2 requirements: 2 total
- Mapped to phases: 5
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-30 after Phase 11 completion*
