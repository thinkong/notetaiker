# Pitfalls Research

**Domain:** Local-first AI Note Taking App
**Researched:** 2026-01-26
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Frontmatter Race Conditions

**What goes wrong:**
The user is typing in a note while the background AI agent attempts to update the YAML frontmatter with new tags. If using standard file-system writes, the AI might overwrite the user's latest text, or the user's save might wipe out the AI-generated tags.

**Why it happens:**
Developers treat Markdown files as simple strings to be read/written. In a local-first system, concurrent edits (User vs. AI) are inevitable.

**How to avoid:**
Implement a state-based synchronization or a CRDT for the note structure. Alternatively, use a "sidecar" file or a local SQLite database to stage AI metadata before merging it into the Markdown file during an idle period with a proper diffing library.

**Warning signs:**
Users reporting "lost text" or tags disappearing shortly after they appear. Git history showing frequent "reverts" of either content or metadata.

**Phase to address:**
Phase 1 (Sync & Storage Architecture)

---

### Pitfall 2: AI Write-Loops (The "Hallucination Loop")

**What goes wrong:**
The background AI agent updates a file's frontmatter, which triggers a "file changed" event from the OS. The AI agent (watching the filesystem) sees the change and starts processing the file again, creating an infinite loop of AI processing and disk writes.

**Why it happens:**
The file watcher does not distinguish between user-initiated changes and agent-initiated changes.

**How to avoid:**
Implement an exclusion mechanism in the file watcher (e.g., ignore changes with a specific metadata flag or "debouncing" based on the agent's own write operations). Use a "dirty bit" or checksum that only triggers the agent if the _content_ (not metadata) has changed.

**Warning signs:**
High CPU usage even when the user is idle. The "Last Modified" time of files updating constantly in a loop.

**Phase to address:**
Phase 2 (AI Agent Implementation)

---

### Pitfall 3: Automated Tag Bloat (Ontology Collapse)

**What goes wrong:**
The AI generates slightly different tags for the same concept (e.g., "#artificial-intelligence", "#AI", "#MachineLearning"). Over time, the tag cloud becomes useless, and the "zero-friction" organization turns into a "high-friction" cleanup task for the user.

**Why it happens:**
The LLM is prompted per-note without context of the existing global tag set (ontology).

**How to avoid:**
Feed the AI a "known tags" list in the system prompt and instruct it to reuse existing tags unless a new category is strictly necessary. Implement a "tag merging" feature for the user.

**Warning signs:**
The number of unique tags growing linearly with the number of notes. Search results becoming cluttered with near-identical categories.

**Phase to address:**
Phase 2 (AI Agent Implementation)

---

### Pitfall 4: Privacy/Local-First Value Conflict

**What goes wrong:**
The app is marketed as "local-first," but every note is sent to a cloud LLM provider (OpenAI/Anthropic) for tagging. Privacy-conscious users discover their sensitive notes are leaving their machine, leading to trust loss and churn.

**Why it happens:**
Integrating cloud APIs is faster and easier than shipping local models (WebLLM/Ollama).

**How to avoid:**
Clearly flag cloud-dependent features. Provide an "Opt-in" for cloud AI or support local LLM providers (e.g., Ollama or local Transformers.js) from day one.

**Warning signs:**
Negative feedback in "Privacy Policy" reviews or users asking "Where does my data go?" in initial onboarding.

**Phase to address:**
Phase 1 (Foundation/Setup)

---

### Pitfall 5: Hardware/Model Mismatch (The "Stutter" Trap)

**What goes wrong:**
The local LLM (Transformers.js/WebGPU) works beautifully on a developer's M3 Mac but renders the app unusable on a user's older laptop or mobile device due to memory exhaustion or thermal throttling.

**Why it happens:**
Testing on high-end hardware without establishing minimum requirements or fallback "lite" models.

**How to avoid:**
Implement a hardware capability check on startup. Fall back to smaller, quantized models (e.g., 4-bit) or local CPU-only inference for low-end devices. Provide a "Battery Saver" mode that disables background AI.

**Warning signs:**
Reports of the app "freezing" the whole computer or draining battery at an alarming rate.

**Phase to address:**
Phase 2 (AI Agent Implementation)

---

## Technical Debt Patterns

| Shortcut              | Immediate Benefit           | Long-term Cost                              | When Acceptable                              |
| --------------------- | --------------------------- | ------------------------------------------- | -------------------------------------------- |
| Simple File Writes    | Fast MVP development        | Data loss during concurrent AI/User edits   | Never - Sync must be robust from start       |
| Cloud-Only AI         | No local model infra needed | High latency, high cost, privacy concerns   | Only for the first 1-2 weeks of prototyping  |
| Full-text scan search | Easy to implement           | Search becomes unusable as note count grows | Only for < 500 notes                         |
| No Link Tracking      | Faster note creation        | Renaming a file breaks all "atomic" links   | Never - links are the "graph" of note taking |

## Integration Gotchas

| Integration | Common Mistake                                              | Correct Approach                                                                  |
| ----------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| LLM API     | Sending full note history for every small edit              | Only trigger AI tagging on "note closed" or "idle" events with a debounced timer. |
| File System | Blocking the main thread with I/O                           | Use a worker thread for file system operations and AI processing.                 |
| YAML Parser | Stripping user comments or custom formatting in frontmatter | Use a round-trip aware YAML parser that preserves comments and formatting.        |

## Performance Traps

| Trap                    | Symptoms                     | Prevention                                                                   | When It Breaks |
| ----------------------- | ---------------------------- | ---------------------------------------------------------------------------- | -------------- |
| UI-Thread AI Parsing    | Frame drops during typing    | Move Markdown parsing and AI logic to a Web Worker.                          | > 1,000 words  |
| Unindexed Tag Search    | Filtering tags takes > 100ms | Maintain a normalized `tags` table in a local database.                      | > 5,000 notes  |
| Excessive File Watching | High CPU usage on startup    | Only watch the active "notes" directory; ignore `.git`, `node_modules`, etc. | > 50,000 files |

## Security Mistakes

| Mistake                    | Risk                                                                  | Prevention                                                                                            |
| -------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| API Key Exposure           | Stealing the user's LLM credits                                       | Store keys in the OS keychain (Node-keytar) or secure environment variables, never plain text config. |
| Prompt Injection via Notes | Note content could "trick" the AI into deleting files or leaking data | Sanitize input and use strict JSON schema for AI outputs.                                             |
| Unencrypted Local Cache    | Sensitive AI-extracted metadata is visible in the local DB            | Use an encrypted database (SQLCipher) for the metadata cache.                                         |

## UX Pitfalls

| Pitfall                  | User Impact                                        | Better Approach                                                                  |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| "Magic" Tagging Ghosting | Tags appear and disappear without user knowing why | Provide an "Activity Feed" or subtle UI indicator when the AI is working.        |
| Over-notification        | Constant "AI updated tags" popups are distracting  | Silent updates by default; only notify if the AI needs clarification.            |
| Brittle Renaming         | Renaming a file breaks links in other notes        | Automatic backlink updates or use UUIDs for internal links instead of filenames. |

## "Looks Done But Isn't" Checklist

- [ ] **Sync:** Often missing conflict resolution — verify edit collisions between User and AI.
- [ ] **Tagging:** Often missing deduplication — verify AI doesn't create `#AI` and `#ai` as separate tags.
- [ ] **Search:** Often missing index persistence — verify search works instantly after a restart without a full rescan.
- [ ] **Links:** Often missing rename handling — verify links update when an atomic note's title changes.

## Recovery Strategies

| Pitfall             | Recovery Cost | Recovery Steps                                                               |
| ------------------- | ------------- | ---------------------------------------------------------------------------- |
| Data Loss (Sync)    | HIGH          | Restore from hidden `.backup` folder or Git history (if enabled).            |
| Tag Bloat           | MEDIUM        | Run a "Tag Consolidation" script to merge similar tags using an LLM.         |
| Corrupt Frontmatter | LOW           | Re-parse Markdown and use a regex fallback to extract content from the mess. |

## Pitfall-to-Phase Mapping

| Pitfall                     | Prevention Phase | Verification                                                        |
| --------------------------- | ---------------- | ------------------------------------------------------------------- |
| Frontmatter Race Conditions | Phase 1 (Sync)   | Stress test with concurrent automated writes and manual typing.     |
| AI Write-Loops              | Phase 2 (AI)     | Log watcher events to ensure AI writes don't re-trigger processing. |
| Privacy Value Conflict      | Phase 1 (Setup)  | Integration test with a local LLM mock to ensure no network calls.  |
| Scale Performance           | Phase 3 (Search) | Load test with 10,000 markdown files and measure search latency.    |

## Sources

- [Local-first web development (Ink & Switch)](https://www.inkandswitch.com/local-first/)
- [Obsidian Community Forum: Frontmatter Sync Issues](https://forum.obsidian.md/)
- [Logseq GitHub Issues: Performance with many small files](https://github.com/logseq/logseq)
- [Transformers.js WebGPU Performance Benchmarks 2026](https://github.com/xenova/transformers.js)

---

_Pitfalls research for: Local-first AI Note Taking App_
_Researched: 2026-01-26_
