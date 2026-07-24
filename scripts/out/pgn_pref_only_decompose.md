# Pref-only decomposition — PGN

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Policy (H1569)

- Body `.txt` wins for siglum *naming*; this table feeds gated apply + change log.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Hold without body attestation: `rare` · `true_unused` · `ambiguous`.

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 2 |
| Classified sample (top by key length) | 2 |
| High-count control | 20 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 1 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 0 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 0 | Pref key OCR error vs print/body form |
| `spacing` | 0 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 1 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 0 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `ortho` | low | `Names of Brahmanas ; Jainas and Bauddhas` | `—` | 0 | j_series_no_confirmed_body_alt |
| `true_unused` | low | `Item` | `—` | 0 | no_alt_hit |

## High-count control (should stay hits)

| key_norm | body_count | flag |
|----------|-----------:|------|
| `A` | 72232 | short_key |
| `The` | 9951 | — |
| `Tribes` | 90 | — |
| `Explanation` | 16 | — |
| `Plates` | 16 | — |
| `Conclusion` | 11 | — |
| `Index` | 11 | — |
| `Preface` | 10 | — |
| `Prologue` | 7 | — |
| `Section` | 7 | — |
| `Foreword` | 6 | — |
| `Names of Women` | 4 | — |
| `Bibliography` | 3 | low_count |
| `Epic and Puranic Names` | 3 | low_count |
| `The Rivers of Junāgaṛh` | 3 | low_count |
| `Code of Inscriptions` | 2 | low_count |
| `Coded Abbreviations` | 2 | low_count |
| `List of Plates` | 2 | low_count |
| `Names of Local Officers` | 2 | low_count |
| `Place-Names and their Suffixes` | 2 | low_count |

## Fold / parser follow-ups (document only)

Candidates for a future **documented** fold-table extension (not applied here):

1. German **j → y** (Jogas/Yogas, Dhjâna/Dhyâna, Nâṭja/Nâṭya) when body attests the y-form.
2. Dual-key legends (`X oder Y`) — count each side separately before `pref_only`.
3. Strip parenthetical author notes from the search form (`Hindu Th. (Wilson,)` → `Hindu Th.`).
4. OCR specials still after diacritic fold: `ḱ`→`k`/`c`, leading `ʼ`/`\`, `Ǵ`→`J`/`Y`.
5. `Kâtj.` ↔ `Kâty.` (t/j vs ty) seen in both PWG and PW.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict PGN --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --dict PGN
```

TSV: [`pgn_pref_only_decompose.tsv`](./pgn_pref_only_decompose.tsv)

---

_H1560 · Grok 4.5 (`grok-4.5`) · mechanical re-run + hand/probe classification._
