# Pref abbr × body cross-check outputs

_Created: 23-07-2026 · Last updated: 23-07-2026_

Pilot outputs from [`pref_abbr_crosscheck.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_abbr_crosscheck.py) ([H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md), [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)).

| Dict | Report | TSV | Summary |
|------|--------|-----|---------|
| PWG | [pwg_pref_abbr_crosscheck.md](./pwg_pref_abbr_crosscheck.md) | [pwg_pref_abbr_crosscheck.tsv](./pwg_pref_abbr_crosscheck.tsv) | [summary JSON](./pwg_pref_abbr_crosscheck.summary.json) |
| AP90 | [ap90_pref_abbr_crosscheck.md](./ap90_pref_abbr_crosscheck.md) | [ap90_pref_abbr_crosscheck.tsv](./ap90_pref_abbr_crosscheck.tsv) | [summary JSON](./ap90_pref_abbr_crosscheck.summary.json) |

**Non-goals:** no bulk pref overwrite from body matches; scan remains truth for expansions.

```text
python scripts/pref_abbr_crosscheck.py --dict PWG --out-dir scripts/out
python scripts/pref_abbr_crosscheck.py --dict AP90 --out-dir scripts/out
python scripts/pref_abbr_crosscheck.py --self-check
```

_Dr. Mārcis Gasūns_
