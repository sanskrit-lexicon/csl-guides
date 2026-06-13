---
id: repositories
title: Repository Map
sidebar_label: Repositories
---

# Repository Map

All repositories live in the
[`sanskrit-lexicon`](https://github.com/sanskrit-lexicon) GitHub organization.

## Per-dictionary repositories

Each dictionary has its own repo, **named by its code**. Examples (see the full
**[catalog](../dictionaries/catalog)**):

| Code | Dictionary | Repo |
|---|---|---|
| `MWS` | Monier-Williams | [MWS](https://github.com/sanskrit-lexicon/MWS) |
| `AP90` | Apte (1890) | [AP90](https://github.com/sanskrit-lexicon/AP90) |
| `PWG` | Böhtlingk-Roth (large) | [PWG](https://github.com/sanskrit-lexicon/PWG) |
| `PWK` | Böhtlingk (shorter) | [PWK](https://github.com/sanskrit-lexicon/PWK) |
| `GRA` | Grassmann (Rig-Veda) | [GRA](https://github.com/sanskrit-lexicon/GRA) |

## Infrastructure repositories

| Repo | Role |
|---|---|
| [`csl-orig`](https://github.com/sanskrit-lexicon/csl-orig) | **Canonical source**: `v02/{dict}/{dict}.txt` for every dictionary |
| [`csl-pywork`](https://github.com/sanskrit-lexicon/csl-pywork) | **Build tooling**: `generate_dict.sh`, `make_xml.py`, validators |
| [`csl-corrections`](https://github.com/sanskrit-lexicon/csl-corrections) | **Audit trail**: change files grouped in `batch_YYYYMMDD/` |
| [`csl-websanlexicon`](https://github.com/sanskrit-lexicon/csl-websanlexicon) | Web/display assets consumed by generation |
| [`csl-apidev`](https://github.com/sanskrit-lexicon/csl-apidev) | **Web backend** — the RESTful + Salt API (PHP) |
| [`csl-app`](https://github.com/sanskrit-lexicon/csl-app) | **Cross-platform app** (Android/iOS/macOS/Linux/Windows; Dart/Flutter) |
| [`csl-standards`](https://github.com/sanskrit-lexicon/csl-standards) | Shared standards (incl. the normative Salt API contract) |
| [`csl-inflect`](https://github.com/sanskrit-lexicon/csl-inflect) | Inflected-forms generation (e.g. MW inflected forms) |
| [`cologne-stardict`](https://github.com/sanskrit-lexicon/cologne-stardict) | StarDict / offline packaging |
| [`csl-doc`](https://github.com/sanskrit-lexicon/csl-doc) | Sphinx per-dictionary front-matter / prefaces documentation |

Other infrastructure repos (`csl-atlas`, `csl-observatory`, `csl-sqlite`, `csl-json`, …)
support tooling, observability, and alternate data formats.

## Conventions shared across repos

- **Session state**: each repo keeps a tracked `.ai_state.md` journal.
- **Correction pattern**: most repos apply corrections via `updateByLine.py` change
  files (see **[Change Files](../contributing/change-files)**).
- **Input files** for the large German dictionaries live in sibling `*xml` repos
  (e.g. `../pwgxml/pwg.xml`, `../mwsxml/mws.xml`).
