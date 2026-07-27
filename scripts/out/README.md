# Pref abbr × body cross-check outputs

_Created: 23-07-2026 · Last updated: 27-07-2026_

Outputs from [`pref_abbr_crosscheck.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_abbr_crosscheck.py), the H1560 residual classifier [`pref_only_decompose.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_only_decompose.py), the H1591 legend store emit [`pref_legend_emit.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_legend_emit.py), and the H1592 UC-8 fold registry (parent: [`../pref_fold_table.json`](../pref_fold_table.json)).

**FAIR entry points (UC-11 / H1595):** public edition index [OCR'd prefaces](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/ocr-prefaces) · pilot METHODS [PWG](https://github.com/sanskrit-lexicon/PWG/blob/main/prefaces/METHODS.md) / [PW](https://github.com/sanskrit-lexicon/PWK/blob/main/prefaces/METHODS.md) · naming policy [pref-body-naming-authority](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md) · residual appendix [UC-13](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/about/pref-body-residual-methods.md).

| Artifact | Role |
|----------|------|
| [ALL_pref_abbr_crosscheck.md](./ALL_pref_abbr_crosscheck.md) | **Rollup** across waves A–C (H1543) |
| [ALL_pref_abbr_crosscheck.summary.json](./ALL_pref_abbr_crosscheck.summary.json) | Machine-readable batch summary |
| `{code}_pref_abbr_crosscheck.{md,tsv,summary.json}` | Per-dictionary census |
| [PWG_PW_pref_only_decompose.md](./PWG_PW_pref_only_decompose.md) | **H1560 rollup** — typed residual for PWG+PW |
| `{pwg,pw}_pref_only_decompose.{md,tsv}` | Top-50 classified `pref_only` samples |
| [`pwg_legend.json`](./pwg_legend.json) · [`pw_legend.json`](./pw_legend.json) | **H1591 UC-3** structured legend store (pilot) |
| Site feed | [`../../src/data/pref-legends.json`](../../src/data/pref-legends.json) via `npm run build:pref-legends` (**H1593 UC-1** Abbreviations UI) |
| Schema | [`../legend.schema.json`](../legend.schema.json) · parity: `python scripts/pref_legend_parity.py --check` |
| `{pwg,pw}_pref_key_body_align_changes.{md,tsv}` | Align change logs (source for fold-table examples) |
| Fold table | [`../pref_fold_table.json`](../pref_fold_table.json) — **UC-8 / H1592** documented ortho/OCR folds |
| [pwg_pw_pref_ocr_en_quality_probe.md](./pwg_pw_pref_ocr_en_quality_probe.md) | **H1559** — bounded OCR-vs-scan + EN sense-check probe (14/32 pages; 3 confirmed omissions, all on abbreviation-list page boundaries) |

**Handoffs:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) (pilot) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md) (scale) · [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) (PWG/PW `pref_only` taxonomy) · [H1591](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1591-Sonnet_csl-guides_pref-legend-store-emit_24.07.26.md) (legend emit) · [H1592](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1592-Sonnet_csl-guides_pref-fold-table-registry_24.07.26.md) (fold table) · [H1593](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1593-Sonnet_csl-guides_pref-abbreviations-ui-rewrite_24.07.26.md) (Abbreviations UI) · [H1594](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1594-Sonnet_csl-guides_pref-residual-methods-appendix_24.07.26.md) (residual appendix) · [H1595](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1595-Sonnet_csl-guides_pref-fair-index-crosslinks_24.07.26.md) (FAIR index cross-links) · [H1559](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1559-Sonnet_csl-guides_pref-ocr-en-sample-error-rates_24.07.26.md) (OCR/EN quality probe) · **Issues:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · [PWG#210](https://github.com/sanskrit-lexicon/PWG/issues/210)

**Policy (H1569):** body `.txt` wins for siglum *naming*; pref keys align toward body via gated apply + change log. Expansions stay scan-faithful. Residual is typed, not “unused abbreviations.” See [pref-body-naming-authority.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md).

```text
python scripts/pref_abbr_crosscheck.py --self-check
python scripts/pref_abbr_crosscheck.py --list-catalog
python scripts/pref_abbr_crosscheck.py --all --out-dir scripts/out --json-summary
python scripts/pref_abbr_crosscheck.py --wave A --out-dir scripts/out
python scripts/pref_only_decompose.py --all
python scripts/pref_key_body_align.py --self-check
python scripts/pref_key_body_align.py --dict PWG --apply
python scripts/pref_key_body_align.py --dict PW --apply
python scripts/pref_legend_emit.py --dict PWG --dict PW
python scripts/pref_legend_parity.py --check
# or: npm run check:pref-legend
npm run build:pref-legends   # → src/data/pref-legends.json (H1593 Abbreviations UI)
python scripts/build_pref_fold_table.py
```

_Dr. Mārcis Gasūns_
