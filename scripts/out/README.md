# Pref abbr × body cross-check outputs

_Created: 23-07-2026 · Last updated: 24-07-2026_

Outputs from [`pref_abbr_crosscheck.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_abbr_crosscheck.py) and the H1560 residual classifier [`pref_only_decompose.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_only_decompose.py).

| Artifact | Role |
|----------|------|
| [ALL_pref_abbr_crosscheck.md](./ALL_pref_abbr_crosscheck.md) | **Rollup** across waves A–C (H1543) |
| [ALL_pref_abbr_crosscheck.summary.json](./ALL_pref_abbr_crosscheck.summary.json) | Machine-readable batch summary |
| `{code}_pref_abbr_crosscheck.{md,tsv,summary.json}` | Per-dictionary census |
| [PWG_PW_pref_only_decompose.md](./PWG_PW_pref_only_decompose.md) | **H1560 rollup** — typed residual for PWG+PW |
| `{pwg,pw}_pref_only_decompose.{md,tsv}` | Top-50 classified `pref_only` samples |

**Handoffs:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) (pilot) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md) (scale) · [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) (PWG/PW `pref_only` taxonomy) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)

**Policy (H1569):** body `.txt` wins for siglum *naming*; pref keys align toward body via gated apply + change log. Expansions stay scan-faithful. Residual is typed, not “unused abbreviations.” See [pref-body-naming-authority.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md).

```text
python scripts/pref_abbr_crosscheck.py --self-check
python scripts/pref_abbr_crosscheck.py --list-catalog
python scripts/pref_abbr_crosscheck.py --all --out-dir scripts/out --json-summary
python scripts/pref_abbr_crosscheck.py --wave A --out-dir scripts/out
python scripts/pref_only_decompose.py --all
python scripts/pref_key_body_align.py --dict PWG --apply
python scripts/pref_key_body_align.py --dict PW --apply
```

_Dr. Mārcis Gasūns_
