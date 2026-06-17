---
id: repositories
title: Repository Map
description: "Map of the sanskrit-lexicon GitHub organization — which repository holds the source, generation code, displays, and corrections."
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
| [`csl-sqlite`](https://github.com/sanskrit-lexicon/csl-sqlite) | The per-dictionary SQLite search databases (published via GitHub Releases) |
| [`csl-json`](https://github.com/sanskrit-lexicon/csl-json) | JSON form of the dictionary data (`{words, text}`) |
| [`cologne-stardict`](https://github.com/sanskrit-lexicon/cologne-stardict) | StarDict / offline packaging (via Babylon export) |
| [`csl-doc`](https://github.com/sanskrit-lexicon/csl-doc) | Sphinx per-dictionary front-matter / prefaces documentation |

Other infrastructure repos (`csl-atlas`, `csl-observatory`, …) support tooling and
observability. See [Data Formats](../developers/data-formats) for how the SQLite, JSON, and
StarDict artifacts are produced.

:::note Dictionary code vs. repository name
A dictionary's **code** (used in URLs, `csl-orig`, and the API) is not always its **repo
name**. The clearest case: the *shorter* Petersburg dictionary has code **`PW`**
(`csl-orig/v02/pw/`) but lives in the repo
[`PWK`](https://github.com/sanskrit-lexicon/PWK). The
[catalog](../dictionaries/catalog) lists each dictionary's actual repo.
:::

## Conventions shared across repos

- **Session state**: each repo keeps a tracked `.ai_state.md` journal.
- **Correction pattern**: most repos apply corrections via `updateByLine.py` change
  files (see **[Change Files](../contributing/change-files)**).
- **Input files** for the large German dictionaries live in sibling `*xml` repos
  (e.g. `../pwgxml/pwg.xml`, `../mwsxml/mws.xml`).
