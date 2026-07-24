# Pref-only decomposition — AP90

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Policy (H1569)

- Body `.txt` wins for siglum *naming*; this table feeds gated apply + change log.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Hold without body attestation: `rare` · `true_unused` · `ambiguous`.

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 7 |
| Classified sample (top by key length) | 7 |
| High-count control | 20 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 0 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 0 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 0 | Pref key OCR error vs print/body form |
| `spacing` | 0 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 7 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 0 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `true_unused` | low | `Etym., Ety.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Yv., Yaj.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Chand M.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Chaṇḍ K.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Ait Br.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Vṛind.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Isop.` | `—` | 0 | no_alt_hit |

## High-count control (should stay hits)

| key_norm | body_count | flag |
|----------|-----------:|------|
| `A.` | 21032 | short_key |
| `a.` | 21032 | short_key |
| `e.` | 18923 | short_key |
| `S.` | 17611 | short_key |
| `s.` | 17611 | short_key |
| `N.` | 17460 | short_key |
| `n.` | 17460 | short_key |
| `R.` | 16621 | short_key |
| `D.` | 14200 | short_key |
| `P.` | 12689 | short_key |
| `p.` | 12689 | short_key |
| `T.` | 12473 | short_key |
| `G.` | 8694 | short_key |
| `U.` | 7619 | short_key |
| `Y.` | 7274 | short_key |
| `i.` | 7031 | short_key |
| `L.` | 6687 | short_key |
| `K.` | 6627 | short_key |
| `f.` | 6203 | short_key |
| `M.` | 5967 | short_key |

## Fold / parser follow-ups (document only)

Candidates for a future **documented** fold-table extension (not applied here):

1. German **j → y** (Jogas/Yogas, Dhjâna/Dhyâna, Nâṭja/Nâṭya) when body attests the y-form.
2. Dual-key legends (`X oder Y`) — count each side separately before `pref_only`.
3. Strip parenthetical author notes from the search form (`Hindu Th. (Wilson,)` → `Hindu Th.`).
4. OCR specials still after diacritic fold: `ḱ`→`k`/`c`, leading `ʼ`/`\`, `Ǵ`→`J`/`Y`.
5. `Kâtj.` ↔ `Kâty.` (t/j vs ty) seen in both PWG and PW.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict AP90 --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --dict AP90
```

TSV: [`ap90_pref_only_decompose.tsv`](./ap90_pref_only_decompose.tsv)

---

_H1560 · Grok 4.5 (`grok-4.5`) · mechanical re-run + hand/probe classification._
