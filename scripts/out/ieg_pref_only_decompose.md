# Pref-only decomposition — IEG

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Policy (H1569)

- Body `.txt` wins for siglum *naming*; this table feeds gated apply + change log.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Hold without body attestation: `rare` · `true_unused` · `ambiguous`.

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 6 |
| Classified sample (top by key length) | 6 |
| High-count control | 20 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 0 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 2 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 0 | Pref key OCR error vs print/body form |
| `spacing` | 0 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 4 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 0 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `true_unused` | low | `Appendix I— Privileges attached to Free Holdings` | `—` | 0 | long_bib_or_external_title |
| `true_unused` | low | `Appendix II— Tax Names in Dravidian Languages` | `—` | 0 | long_bib_or_external_title |
| `true_unused` | low | `Dravidian palatal alveolar &nbsp; n` | `—` | 0 | long_bib_or_external_title |
| `true_unused` | low | `Dravidian palatal alveolar &nbsp; r` | `—` | 0 | long_bib_or_external_title |
| `rare` | high | `Ag. Syst. or Ag. Syst. Anc. Ind.` | `—` | 0 | expansion_rare_signal |
| `rare` | high | `Suc. Sāt. or Suc. Sāt. L. Dec.` | `—` | 0 | expansion_rare_signal |

## High-count control (should stay hits)

| key_norm | body_count | flag |
|----------|-----------:|------|
| `HA` | 11942 | short_key |
| `EI` | 3752 | short_key |
| `LL` | 3112 | short_key |
| `IE` | 2618 | short_key |
| `IA` | 1800 | short_key |
| `BL` | 1557 | short_key |
| `SITI` | 1112 | — |
| `CII` | 1054 | — |
| `LP` | 694 | short_key |
| `SII` | 414 | — |
| `HD` | 327 | short_key |
| `ASLV` | 200 | — |
| `HRS` | 173 | — |
| `CITD` | 156 | — |
| `JAS` | 135 | — |
| `ML` | 92 | short_key |
| `Chamba` | 89 | — |
| `JNSI` | 61 | — |
| `PJS` | 34 | — |
| `Ant. Ch. St.` | 23 | — |

## Fold / parser follow-ups (document only)

Candidates for a future **documented** fold-table extension (not applied here):

1. German **j → y** (Jogas/Yogas, Dhjâna/Dhyâna, Nâṭja/Nâṭya) when body attests the y-form.
2. Dual-key legends (`X oder Y`) — count each side separately before `pref_only`.
3. Strip parenthetical author notes from the search form (`Hindu Th. (Wilson,)` → `Hindu Th.`).
4. OCR specials still after diacritic fold: `ḱ`→`k`/`c`, leading `ʼ`/`\`, `Ǵ`→`J`/`Y`.
5. `Kâtj.` ↔ `Kâty.` (t/j vs ty) seen in both PWG and PW.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict IEG --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --dict IEG
```

TSV: [`ieg_pref_only_decompose.tsv`](./ieg_pref_only_decompose.tsv)

---

_H1560 · Grok 4.5 (`grok-4.5`) · mechanical re-run + hand/probe classification._
