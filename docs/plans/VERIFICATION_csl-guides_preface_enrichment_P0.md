# VERIFICATION — preface enrichment P0

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Index:** [PLAN_csl-guides_preface_enrichment_P0_2026-07.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/plans/PLAN_csl-guides_preface_enrichment_P0_2026-07.md)

## Acceptance criteria

| Deliverable | Proof |
|-------------|--------|
| Legend emit | `pwg_legend.json` + `pw_legend.json` exist; schema-valid; key count ≥ crosscheck non-short keys (or documented subset) |
| Parity gate | `python scripts/pref_legend_parity.py --check` exit 0 |
| Fold table | `pref_fold_table.json` non-empty; at least 10 PWG/PW examples with body_n |
| Abbreviations UI | `npm run build` green; component imports `pref-legends.json`; PWG or PW section shows expansion from feed |
| Residual appendix | Page linked in sidebar; contains dated table with PWG/PW pref_only before/after |
| Fence | Diff does not touch csl-orig, quiz banks, payment code |

## Commands

```text
python scripts/pref_abbr_crosscheck.py --dict PWG --out-dir scripts/out --json-summary
python scripts/pref_abbr_crosscheck.py --dict PW --out-dir scripts/out --json-summary
python scripts/pref_legend_emit.py --dict PWG --dict PW   # or --emit-legend flag
python scripts/pref_legend_parity.py --check
npm run build
```

## Risks

| Risk | Mitigation |
|------|------------|
| Abbreviations.json vs pref legend conflict | Pref-legends win for PWG/PW only; fallback elsewhere |
| Large JSON bloat | Pilot two dicts only |
| Provisional work_id noise | review_required filter in UI |
| CI time | Parity script stdlib-only, seconds |

---

_Dr. Mārcis Gasūns_
