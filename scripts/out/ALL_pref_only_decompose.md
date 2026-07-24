# Pref-only decomposition rollup — all dicts

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1571](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1571-Sonnet_csl-guides_pref-body-align-all-dicts_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Policy:** [pref-body-naming-authority.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md)

Body `.txt` wins for siglum *naming*. Typed residual for gated apply.

| Dict | pref_only total | sample | ortho | rare | ocr_key | spacing | true_unused | ambiguous |
|------|----------------:|-------:|------:|-----:|--------:|--------:|------------:|----------:|
| **AP90** | 7 | 7 | 0 | 0 | 0 | 0 | 7 | 0 |
| **BEN** | 17 | 17 | 7 | 0 | 0 | 0 | 10 | 0 |
| **BHS** | 53 | 53 | 0 | 0 | 0 | 14 | 39 | 0 |
| **BOR** | 74 | 74 | 0 | 0 | 13 | 0 | 57 | 4 |
| **CAE** | 1 | 1 | 0 | 0 | 0 | 0 | 1 | 0 |
| **GRA** | 6 | 6 | 0 | 0 | 0 | 0 | 6 | 0 |
| **IEG** | 6 | 6 | 0 | 2 | 0 | 0 | 4 | 0 |
| **INM** | 5 | 5 | 0 | 0 | 0 | 0 | 5 | 0 |
| **MD** | 20 | 20 | 0 | 0 | 0 | 0 | 20 | 0 |
| **MW72** | 153 | 153 | 1 | 0 | 0 | 106 | 46 | 0 |
| **PGN** | 2 | 2 | 1 | 0 | 0 | 0 | 1 | 0 |
| **PW** | 64 | 64 | 33 | 1 | 12 | 0 | 16 | 2 |
| **PWG** | 112 | 112 | 48 | 14 | 16 | 8 | 23 | 3 |
| **SCH** | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| **SHS** | 14 | 14 | 0 | 0 | 0 | 0 | 14 | 0 |
| **SNP** | 4 | 4 | 0 | 1 | 0 | 0 | 3 | 0 |

```text
python scripts/pref_only_decompose.py --all --sample-n 0
python scripts/pref_key_body_align.py --all --apply
```

---

_H1571 · Grok 4.5 (`grok-4.5`)._

_Dr. Mārcis Gasūns_
