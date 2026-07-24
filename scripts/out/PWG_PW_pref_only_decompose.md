# Pref-only decomposition rollup — PWG + PW

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)

## Finding

H1543 left high `pref_only` on PWG (133) and PW (89) **even with case + diacritic fold**.
The residual is **typed**, not a pile of unused abbreviations:

- Large share is **ortho** (German *j* = *y*, `Kâtj.`/`Kâty.`, `Gṛhja`/`Gṛhya`, dual `X oder Y` keys).
- **rare** tracks handschrift / occasional works in the expansion.
- **ocr_key** residual specials (`ḱ`, `Ǵ`, leading quotes) after the current fold table.
- **true_unused** is mostly long bibliographic titles and external works, not core legend sigla.

## Policy update (H1569)

- Body `.txt` wins for siglum *naming*; apply gated key repairs with change log (see [pref-body-naming-authority.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md)).
- This decomposition remains the typed residual used as the apply input.

## Per-dict sample distribution

| Dict | pref_only total | sample | ortho | rare | ocr_key | spacing | true_unused | ambiguous |
|------|----------------:|-------:|------:|-----:|--------:|--------:|------------:|----------:|
| **PWG** | 133 | 50 | 13 | 5 | 2 | 19 | 11 | 0 |
| **PW** | 89 | 50 | 31 | 1 | 7 | 0 | 9 | 2 |

## Artifacts

- [`pwg_pref_only_decompose.md`](./pwg_pref_only_decompose.md) / [`.tsv`](./pwg_pref_only_decompose.tsv)
- [`pw_pref_only_decompose.md`](./pw_pref_only_decompose.md) / [`.tsv`](./pw_pref_only_decompose.tsv)
- Frozen census: [`pwg_pref_abbr_crosscheck.tsv`](./pwg_pref_abbr_crosscheck.tsv), [`pw_pref_abbr_crosscheck.tsv`](./pw_pref_abbr_crosscheck.tsv)
- Tool: [`pref_only_decompose.py`](../pref_only_decompose.py) (classifier) · [`pref_abbr_crosscheck.py`](../pref_abbr_crosscheck.py) (census)

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict PWG --out-dir scripts/out --json-summary
python scripts/pref_abbr_crosscheck.py --dict PW --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --all
```

---

_H1560 · Grok 4.5 (`grok-4.5`)._

_Dr. Mārcis Gasūns_
