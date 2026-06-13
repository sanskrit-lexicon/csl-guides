---
id: architecture
title: Architecture
sidebar_label: Architecture
---

# Architecture

CDSL is, at heart, a **source-to-display pipeline** driven from GitHub. This page gives
the mental model; the following pages drill into each part.

## The big picture

```
 print scans ──┐
               │   (verification, link targets)
 source text ──┴─► change files ─► csl-orig (canonical source)
                                        │
                                        ▼
                              generation pipeline (csl-pywork)
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
                 XML (SLP1)       search indices       web displays
                    │                                   (B / L / A / M)
                    ▼
            downloads, StarDict, API
```

## Key principles

1. **Canonical source lives in `csl-orig`.** Each dictionary is a plain-text file under
   `csl-orig/v02/{dict}/{dict}.txt`.
2. **No hand-edits without an audit trail.** Edits go through change files; the audit
   copy is stored in `csl-corrections`. See **[Corrections Workflow](../contributing/corrections-workflow)**.
3. **Generation is reproducible.** `csl-pywork` regenerates XML, indices, and displays
   from source. See **[Generation Pipeline](generation-pipeline)**.
4. **XML validity is gating.** Nothing is committed to `csl-orig` until it parses.

## Repositories at a glance

| Repo | Role |
|---|---|
| Per-dictionary (`MWS`, `AP90`, `PWG`, …) | Source + dictionary-specific assets |
| [`csl-orig`](https://github.com/sanskrit-lexicon/csl-orig) | Canonical source text for all dictionaries |
| [`csl-pywork`](https://github.com/sanskrit-lexicon/csl-pywork) | Generation/build tooling (`generate_dict.sh`, `make_xml.py`) |
| [`csl-corrections`](https://github.com/sanskrit-lexicon/csl-corrections) | Audit-trail change files |
| [`csl-websanlexicon`](https://github.com/sanskrit-lexicon/csl-websanlexicon) | Web/display assets used by generation |
| [`csl-apidev`](https://github.com/sanskrit-lexicon/csl-apidev) | API development |
| [`csl-standards`](https://github.com/sanskrit-lexicon/csl-standards) | Shared conventions/standards |

Full map: **[Repositories](repositories)**.
