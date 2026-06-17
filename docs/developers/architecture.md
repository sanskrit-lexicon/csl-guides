---
id: architecture
title: Architecture
description: "A high-level view of CDSL as a GitHub-driven source-to-display pipeline, from csl-orig text to the searchable web displays."
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

## The four web displays

Every dictionary is published in four display variants, generated from
[`csl-websanlexicon`](https://github.com/sanskrit-lexicon/csl-websanlexicon) and served from
parallel directories under `…/{CODE}Scan/{year}/web/`:

| Variant | Path | What it is |
|---|---|---|
| **Basic** (B) | `webtc/` | Single-entry lookup — headword in, rendered entry out |
| **List** (L) | `webtc1/` | The hierarchical headword index beside the entry pane |
| **Advanced** (A) | `webtc2/` | Multi-field query — search headwords *or* inside entry text |
| **Mobile** (M) | `mobile1/` | A responsive layout for small screens |

All four query a per-dictionary **SQLite** database (built by the generator) and share the
transcoder for input/output transliteration. See [Search & Display](../users/search-and-display)
for the user-facing tour and [API](api) for the endpoints these displays call.

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
