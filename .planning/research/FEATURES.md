# Feature Research

**Domain:** Local-first AI Note-taking App
**Researched:** 2026-01-26
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in a modern local-first note-taking app.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Instant-Stream Capture** | Sub-100ms startup to typing. | LOW | Central to the "NoteTaiker" zero-friction value prop. |
| **Pure Markdown Editor** | Industry standard for portability. | MEDIUM | Must support GFM and YAML frontmatter natively. |
| **Local Filesystem Sync** | User ownership of files on disk. | HIGH | Needs to monitor the folder for external changes (e.g. Git/Dropbox). |
| **Atomic Note Stream** | Non-hierarchical, chronological view. | LOW | Moves away from the "folder first" cognitive load. |
| **Offline Performance** | App must be fully functional offline. | LOW | Core local-first principle. |

### Differentiators (Competitive Advantage)

Features that define the NoteTaiker experience and leverage the 2026 stack.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Background AI Tagging** | AI writes the organization tags so the user doesn't have to. | HIGH | Uses local Transformers.js + WebGPU for zero latency. |
| **Emergent YAML Schemas** | AI detects content types (Code, Task, Idea) and adjusts YAML. | MEDIUM | Standardizes metadata for downstream tooling. |
| **Semantic Search** | Search by "vibe" or meaning, not just keywords. | MEDIUM | Powered by LanceDB vector embeddings. |
| **Multimodal Capture** | Drag/Drop images/links; AI generates alt-text and tags. | HIGH | Leveraging Vision-capable SLMs (Small Language Models). |
| **AI-Organized "Smart Views"** | Virtual folders that group notes by AI-generated topics. | MEDIUM | Replaces manual folder management. |

### Anti-Features (Commonly Requested, Often Problematic)

Features to explicitly avoid to maintain the "Zero-Friction" promise.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Manual Folder Tree** | "Where should I put this?" | Creates decision fatigue during capture. | Use AI-generated tags and Filtered Views. |
| **WYSIWYG Blocks** | "Make it look like Notion." | Bloats the Markdown format and slows down the editor. | Fast Live Preview with standard GFM. |
| **Cloud-only LLM** | "Better intelligence." | Adds latency, cost, and privacy concerns. | Use high-quality local SLMs. |

## Feature Dependencies

```
[Pure Markdown Editor]
    └──requires──> [Local Filesystem Sync]

[Background AI Tagging]
    └──requires──> [Local SLM Inference]
    └──enhances──> [Semantic Search]
    └──powers──> [AI-Organized Smart Views]

[Semantic Search]
    └──requires──> [Local Vector Index (LanceDB)]
```

### Dependency Notes

- **AI Tagging powers Smart Views:** Without accurate, automated tagging, the virtual folders will be empty or messy.
- **Semantic Search requires Vector Index:** Direct embedding of every search query is too slow without a pre-computed index.

## MVP Definition (NoteTaiker v1)

### Launch With (v1)
- **Zero-Friction Editor:** Focus on speed and stream view.
- **Tauri FS Bridge:** Robust local folder monitoring.
- **Local Tagging Agent:** Basic tag extraction using a quantized SLM.
- **YAML Frontmatter Sync:** AI writes tags directly to the `.md` file.

### Add After Validation (v1.x)
- **Semantic Search:** LanceDB integration for context-aware retrieval.
- **Image AI:** Alt-text and tag generation for multimedia.
- **Schema Templates:** User-defined YAML structures for specific note types.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| **Instant Stream Editor** | HIGH | MEDIUM | P1 |
| **Background AI Tagging** | HIGH | HIGH | P1 |
| **Filesystem Sync** | HIGH | MEDIUM | P1 |
| **Semantic Search** | MEDIUM | MEDIUM | P2 |
| **Smart Views** | MEDIUM | LOW | P2 |

## Sources

- [Ink & Switch: Local-first Software](https://www.inkandswitch.com/local-first/)
- [Obsidian Roadmap 2026](https://obsidian.md/roadmap)
- [Hugging Face: Transformers.js v3 Docs](https://huggingface.co/docs/transformers.js)

---
*Feature research for: NoteTaiker*
*Researched: 2026-01-26*
