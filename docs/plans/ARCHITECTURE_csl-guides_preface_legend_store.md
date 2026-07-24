# ARCHITECTURE — preface legend store (csl-guides)

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Index:** [PLAN_csl-guides_preface_enrichment_P0_2026-07.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/plans/PLAN_csl-guides_preface_enrichment_P0_2026-07.md)

## Components

```
prefaces/ (dict repos)  →  parse (reuse pref_abbr_crosscheck parsers)
csl-orig body .txt      →  body_count / residual class
        ↓
scripts/out/{code}_legend.jsonl|tsv   (canonical pipeline output)
scripts/pref_fold_table.json          (documented orthography alts)
        ↓ emit/copy at build or npm script
src/data/pref-legends.json            (site feed, PWG+PW wave-1)
        ↓
src/components/Abbreviations/*        (rewrite consumers)
docs/about/*-residual-appendix.mdx    (UC-13)
```

## Data model (legend row)

| Field | Type | Notes |
|-------|------|--------|
| `dict` | string | PWG, PW, … |
| `key` | string | body-aligned key_norm where applicable |
| `expansion` | string | from pref (scan-faithful) |
| `class` | enum | `work` \| `grammar` \| `meta` \| `unknown` |
| `body_count` | int | from crosscheck |
| `residual_class` | string\|null | ortho/rare/… if pref_only else null |
| `work_id` | string\|null | provisional ok; `review_required` if provisional |
| `review_required` | bool | R8 |
| `sources` | string | pref file:line |
| `fold_applied` | string\|null | ref into pref_fold_table |

## Build vs reuse

| Piece | Verdict |
|-------|---------|
| Pref parse | **Reuse** `pref_abbr_crosscheck.py` parsers |
| Body counts | **Reuse** crosscheck TSV |
| Residual typing | **Reuse** decompose outputs |
| Legend emit | **Build** thin `--emit-legend` on existing tools |
| Fold table | **Build** `pref_fold_table.json` from H1580 change-log examples |
| Abbreviations UI | **Rewrite** consumer path; keep layout tokens where possible |
| Site data | **Derive** from scripts/out (R3) |

## Interfaces

- CLI: `python scripts/pref_abbr_crosscheck.py --dict PWG --emit-legend scripts/out`
- CLI: `python scripts/pref_legend_parity.py --check` (or flag on emit)
- JSON schema: document in ARCHITECTURE or `scripts/legend.schema.json`
- Component prop: load `pref-legends.json` filtered by dict code

## Fence

No writes under csl-orig; no quiz banks; no payment paths.

---

_Dr. Mārcis Gasūns_
