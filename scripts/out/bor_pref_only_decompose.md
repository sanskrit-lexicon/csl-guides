# Pref-only decomposition — BOR

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Policy (H1569)

- Body `.txt` wins for siglum *naming*; this table feeds gated apply + change log.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Hold without body attestation: `rare` · `true_unused` · `ambiguous`.

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 74 |
| Classified sample (top by key length) | 74 |
| High-count control | 20 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 0 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 0 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 13 | Pref key OCR error vs print/body form |
| `spacing` | 0 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 57 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 4 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `true_unused` | low | `sen. [gen. sen.]` | `—` | 0 | no_alt_hit |
| `ambiguous` | low | `\An.<br>Ana.` | `—` | 0 | markup_or_conditional_legend |
| `true_unused` | low | `ib., ibidem.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `id., idem,` | `—` | 0 | no_alt_hit |
| `ambiguous` | low | `\Ma.n.` | `—` | 0 | markup_or_conditional_legend |
| `true_unused` | low | `Bh.p.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Va.p.` | `—` | 0 | no_alt_hit |
| `ocr_key` | med | `\B.r.` | `B.r.` | 1 | alt='B.r.' body_n=1 |
| `ocr_key` | med | `\Cha.` | `Cha.` | 1 | alt='Cha.' body_n=1 |
| `ocr_key` | high | `\Mal.` | `Mal.` | 72 | alt='Mal.' body_n=72 |
| `ocr_key` | high | `\Pri.` | `Pri.` | 7 | alt='Pri.' body_n=7 |
| `ocr_key` | med | `\Vid.` | `Vid.` | 3 | alt='Vid.' body_n=3 |
| `true_unused` | low | `c.10.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `c.of.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†B.p.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†Kav.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†Sah.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†V.m.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `A.b.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `A.p.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `B.a.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `B.v.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `C.r.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `D.b.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `D.c.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `D.m.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `G.p.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `H.r.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `K.p.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `L.j.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `L.p.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `M.m.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `N.p.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `P.d.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `P.p.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `R.t.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `S.b.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `S.g.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `V.c.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `V.d.` | `—` | 0 | no_alt_hit |
| `ocr_key` | high | `\Ma.` | `Ma.` | 125 | alt='Ma.' body_n=125 |
| `ocr_key` | high | `\Mr.` | `Mr.` | 296 | alt='Mr.' body_n=296 |
| `ocr_key` | high | `\Mu.` | `Mu.` | 267 | alt='Mu.' body_n=267 |
| `ocr_key` | high | `\Na.` | `Na.` | 197 | alt='Na.' body_n=197 |
| `ocr_key` | high | `\Pr.` | `Pr.` | 1552 | alt='Pr.' body_n=1552 |
| `ocr_key` | high | `\Ra.` | `Ra.` | 217 | alt='Ra.' body_n=217 |
| `ocr_key` | high | `\Sa.` | `Sa.` | 469 | alt='Sa.' body_n=469 |
| `ocr_key` | high | `\Vi.` | `Vi.` | 881 | alt='Vi.' body_n=881 |
| `true_unused` | low | `c.2.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `c.3.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `c.4.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `c.5.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `c.6.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `c.7.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `c.8.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `c.9.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `i.q.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†Gi.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†Ka.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†Ki.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†Ku.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†Me.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†Ri.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†Si.` | `—` | 0 | no_alt_hit |
| `ambiguous` | low | `\U.` | `—` | 0 | markup_or_conditional_legend |
| `ambiguous` | low | `\V.` | `—` | 0 | markup_or_conditional_legend |
| `true_unused` | low | `§H.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `§S.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†B.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†M.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†N.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `†R.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `‡D.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `‡P.` | `—` | 0 | no_alt_hit |

## High-count control (should stay hits)

| key_norm | body_count | flag |
|----------|-----------:|------|
| `=` | 75533 | short_key |
| `C.` | 10772 | short_key |
| `f.` | 7824 | short_key |
| `T.` | 4205 | short_key |
| `A.` | 3849 | short_key |
| `con.` | 2914 | — |
| `comp.` | 2365 | — |
| `L.` | 1925 | short_key |
| `J.` | 1837 | short_key |
| `etc.` | 1608 | — |
| `expr.` | 1549 | — |
| `adj.` | 1547 | — |
| `G.` | 1516 | short_key |
| `Y.` | 1443 | short_key |
| `K.` | 1437 | short_key |
| `Ram.` | 773 | — |
| `app.` | 697 | — |
| `Mah.` | 696 | — |
| `fig.` | 658 | — |
| `Sra.` | 579 | — |

## Fold / parser follow-ups (document only)

Candidates for a future **documented** fold-table extension (not applied here):

1. German **j → y** (Jogas/Yogas, Dhjâna/Dhyâna, Nâṭja/Nâṭya) when body attests the y-form.
2. Dual-key legends (`X oder Y`) — count each side separately before `pref_only`.
3. Strip parenthetical author notes from the search form (`Hindu Th. (Wilson,)` → `Hindu Th.`).
4. OCR specials still after diacritic fold: `ḱ`→`k`/`c`, leading `ʼ`/`\`, `Ǵ`→`J`/`Y`.
5. `Kâtj.` ↔ `Kâty.` (t/j vs ty) seen in both PWG and PW.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict BOR --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --dict BOR
```

TSV: [`bor_pref_only_decompose.tsv`](./bor_pref_only_decompose.tsv)

---

_H1560 · Grok 4.5 (`grok-4.5`) · mechanical re-run + hand/probe classification._
