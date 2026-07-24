# IMPLEMENTATION — preface enrichment P0 (ordered steps)

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Index:** [PLAN_csl-guides_preface_enrichment_P0_2026-07.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/plans/PLAN_csl-guides_preface_enrichment_P0_2026-07.md)

## Step order (wave-1)

### Step A — Legend emit + schema (UC-3)

1. Define `scripts/legend.schema.json` (fields from ARCHITECTURE).
2. Add `--emit-legend` to `pref_abbr_crosscheck.py` (or thin `pref_legend_emit.py` calling shared parse/count).
3. Emit `scripts/out/pwg_legend.json` + `pw_legend.json` (+ optional combined).
4. Add `pref_legend_parity.py --check` comparing emit to schema + key counts.
5. Wire `npm run` or document Python check in CI if cheap (prefer script in existing test path).

**Files:** `scripts/pref_abbr_crosscheck.py` or new emit script; `scripts/out/*_legend.json`; `scripts/legend.schema.json`; tests.

### Step B — Fold table (UC-8)

1. Author `scripts/pref_fold_table.json` from PWG/PW align change-log examples (old, new, dict, body_n, source log URL).
2. Load table in `pref_key_body_align.py` candidate generation (additive, not silent magic).
3. Document in `pref-body-naming-authority.md`.

**Files:** `scripts/pref_fold_table.json`; align tool; naming-authority doc.

### Step C — Site feed + Abbreviations rewrite (UC-1)

1. Add npm/python step: copy or merge pilot legends → `src/data/pref-legends.json`.
2. Rewrite `src/components/Abbreviations` to:
   - Prefer `pref-legends.json` for PWG/PW
   - Fall back to existing `abbreviations.json` for other codes
   - Show expansion + optional body_count
   - Surface `review_required` subtly if present
3. Update abbreviations-and-citations.mdx one paragraph on data source.
4. `npm run build` green.

**Files:** `src/data/pref-legends.json`; `src/components/Abbreviations/*`; docs mdx; package.json script if needed.

### Step D — Residual appendix (UC-13)

1. Author `docs/about/preface-body-residual-appendix.mdx` (or `.md` if site allows) with:
   - Policy one-pager
   - Before/after pref_only table (PWG/PW census)
   - Residual class distribution
   - Link to tools/out
2. Sidebar under About.
3. CHANGELOG entry.

### Step E — FAIR cross-links (UC-11)

1. From ocr-prefaces / pref METHODS pointers: ensure pilot PWG/PW METHODS link naming authority + legend emit path.
2. No Zenodo cut in wave-1 unless already trivial.

### Step F — PWG/PWK thin support (sibling repos)

Separate handoffs: spot-check N legend keys against pref source; METHODS one-paragraph pointer to csl-guides legend store.

## Dependency graph

A → C (feed needs emit)  
B independent of C (can parallel A)  
D independent (can parallel after A for numbers)  
E after A  
F after A (uses emit)

---

_Dr. Mārcis Gasūns_
