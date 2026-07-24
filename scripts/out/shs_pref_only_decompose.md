# Pref-only decomposition — SHS

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Policy (H1569)

- Body `.txt` wins for siglum *naming*; this table feeds gated apply + change log.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Hold without body attestation: `rare` · `true_unused` · `ambiguous`.

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 14 |
| Classified sample (top by key length) | 14 |
| High-count control | 20 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 0 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 0 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 0 | Pref key OCR error vs print/body form |
| `spacing` | 0 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 14 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 0 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `true_unused` | low | `f. or fem.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `क्र्यादि०` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `सङ्केतः` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `द्विक०` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `आत्म०` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `गौरा०` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `चुरा०` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `पृषो०` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `[?]` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `अक०` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `उभ०` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `पर०` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `षद०` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `सक०` | `—` | 0 | no_alt_hit |

## High-count control (should stay hits)

| key_norm | body_count | flag |
|----------|-----------:|------|
| `N.` | 34273 | short_key |
| `M.` | 22128 | short_key |
| `aff.` | 15416 | — |
| `R.` | 10725 | short_key |
| `cl.` | 2259 | — |
| `Ind.` | 1586 | — |
| `Neg.` | 1538 | — |
| `V.` | 1051 | short_key |
| `Irr.` | 475 | — |
| `adj.` | 386 | — |
| `i. e.` | 303 | — |
| `deriv.` | 283 | — |
| `compar.` | 163 | — |
| `adv.` | 156 | — |
| `Plu.` | 145 | — |
| `Poss.` | 133 | — |
| `Priv.` | 112 | — |
| `desid.` | 110 | — |
| `c. f.` | 95 | — |
| `Op.` | 86 | — |

## Fold / parser follow-ups (document only)

Candidates for a future **documented** fold-table extension (not applied here):

1. German **j → y** (Jogas/Yogas, Dhjâna/Dhyâna, Nâṭja/Nâṭya) when body attests the y-form.
2. Dual-key legends (`X oder Y`) — count each side separately before `pref_only`.
3. Strip parenthetical author notes from the search form (`Hindu Th. (Wilson,)` → `Hindu Th.`).
4. OCR specials still after diacritic fold: `ḱ`→`k`/`c`, leading `ʼ`/`\`, `Ǵ`→`J`/`Y`.
5. `Kâtj.` ↔ `Kâty.` (t/j vs ty) seen in both PWG and PW.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict SHS --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --dict SHS
```

TSV: [`shs_pref_only_decompose.tsv`](./shs_pref_only_decompose.tsv)

---

_H1560 · Grok 4.5 (`grok-4.5`) · mechanical re-run + hand/probe classification._
