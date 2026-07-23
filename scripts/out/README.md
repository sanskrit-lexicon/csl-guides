# Pref abbr × body cross-check outputs

_Created: 23-07-2026 · Last updated: 23-07-2026_

Outputs from [`pref_abbr_crosscheck.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_abbr_crosscheck.py).

| Artifact | Role |
|----------|------|
| [ALL_pref_abbr_crosscheck.md](./ALL_pref_abbr_crosscheck.md) | **Rollup** across waves A–C (H1543) |
| [ALL_pref_abbr_crosscheck.summary.json](./ALL_pref_abbr_crosscheck.summary.json) | Machine-readable batch summary |
| `{code}_pref_abbr_crosscheck.{md,tsv,summary.json}` | Per-dictionary pilot |

**Handoffs:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) (PWG/AP90 pilot) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md) (scale) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)

**Non-goals:** no bulk pref overwrite from body matches; scan remains truth for expansions.

```text
python scripts/pref_abbr_crosscheck.py --self-check
python scripts/pref_abbr_crosscheck.py --list-catalog
python scripts/pref_abbr_crosscheck.py --all --out-dir scripts/out --json-summary
python scripts/pref_abbr_crosscheck.py --wave A --out-dir scripts/out
```

_Dr. Mārcis Gasūns_
