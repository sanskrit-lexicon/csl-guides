# PLAN — csl-guides preface enrichment P0 (2026-07)

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Source proposal:** [preface-front-matter-enrichment-use-cases.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/preface-front-matter-enrichment-use-cases.md)  
**Batch:** [ASK_BATCH_STAGING_PREFACE_ENRICHMENT_2026-07.md](https://github.com/gasyoun/Uprava/blob/main/ASK_BATCH_STAGING_PREFACE_ENRICHMENT_2026-07.md)  
**Status:** execution-ready · wave-1 · **nothing runs until a handoff is launched**

## Goal

Ship P0 use cases **UC-1, UC-3, UC-8, UC-11, UC-13** so prefaces become a machine-readable legend store that feeds the site Abbreviations UI, a documented fold registry, residual analytics for a methods appendix, and FAIR-facing docs — without inventing body forms or touching csl-orig.

## Decisions taken

| ID | Topic | Ruling |
|----|--------|--------|
| R1 | Repo batch | Full 7-repo set; **wave-1 mass in csl-guides** |
| R2 | UC scope wave-1 | **P0 only** (UC-1,3,8,11,13) |
| R3 | Legend store home | **`scripts/out/` TSV+JSON** + **derive** site feed under `src/data/` at build |
| R4 | Pilot dicts | **PWG + PW only** |
| R5 | UC-1 depth | **Full Abbreviations component rewrite** to consume legend store |
| R6 | UC-8 folds | **`scripts/pref_fold_table.json`** loaded by crosscheck/align |
| R7 | UC-13 residual | **Data-paper style appendix** under `docs/about/` (site-visible) |
| R8 | Ambiguity | **Provisional `work_id` + `review_required` flag** (do not invent expansions) |
| R9 | Acceptance | **pytest + npm build + legend parity `--check`** |
| R10 | Fence | **No csl-orig, no money/access, no unrelated quiz banks** |
| R11 | PWG/PWK wave-1 | **Thin support only** (METHODS note + sample spot-check) |

## Autonomy contract

| Situation | Agent behavior |
|-----------|----------------|
| Ambiguous work class / dual expansion | Assign provisional `work_id`, set `review_required=true`, continue |
| No body form for a key | Leave expansion from pref; do not invent; class stays residual |
| Unplanned ambiguity outside plan | Log to change log / quarantine TSV; do not expand scope |
| Commit authority | Handoff-scoped: commit → PR → merge when green (csl-guides) |
| Must not touch | csl-orig; payment/access code; quiz JSON banks not named in handoff |

## Layer docs

| Layer | Path |
|-------|------|
| Roadmap | [ROADMAP_csl-guides_preface_enrichment_2026-07.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/plans/ROADMAP_csl-guides_preface_enrichment_2026-07.md) |
| Architecture | [ARCHITECTURE_csl-guides_preface_legend_store.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/plans/ARCHITECTURE_csl-guides_preface_legend_store.md) |
| Implementation | [IMPLEMENTATION_csl-guides_preface_enrichment_P0.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/plans/IMPLEMENTATION_csl-guides_preface_enrichment_P0.md) |
| Verification | [VERIFICATION_csl-guides_preface_enrichment_P0.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/plans/VERIFICATION_csl-guides_preface_enrichment_P0.md) |

## Wave-1 deliverables (handoff-shaped)

1. Legend store emit + schema + parity gate (UC-3)
2. `pref_fold_table.json` + tool wire-up (UC-8)
3. Abbreviations component rewrite (UC-1)
4. Residual methods appendix page (UC-13)
5. FAIR docs polish for pilot (UC-11 — METHODS cross-links / index only in csl-guides)

## Non-goals (wave-1)

- UC-2 work-identity graph, UC-4 reading packs, UC-5–7, UC-9–10, UC-12, UC-14
- Bulk pref key rewrites beyond existing align tools
- Cologne PHP frontend
- Non-PWG/PW legend JSON completeness

---

_Dr. Mārcis Gasūns_
