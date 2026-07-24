# Pref-only decomposition — MD

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Policy (H1569)

- Body `.txt` wins for siglum *naming*; this table feeds gated apply + change log.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Hold without body attestation: `rare` · `true_unused` · `ambiguous`.

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 20 |
| Classified sample (top by key length) | 20 |
| High-count control | 20 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 0 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 0 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 0 | Pref key OCR error vs print/body form |
| `spacing` | 0 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 20 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 0 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `true_unused` | low | `incor., incorr.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `indc., indec.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `col., coll.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `enc., encl.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `pos., poss.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `or., orig.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `ph., phil.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `&c., etc.` | `—` | 0 | long_bib_or_external_title |
| `true_unused` | low | `bg., beg.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `nr., num.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `pn., prn.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `rel., rl.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `rep., rp.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `s., sg.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `indf.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `e.g.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `i.e.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `q.v.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `s.v.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `v.r.` | `—` | 0 | no_alt_hit |

## High-count control (should stay hits)

| key_norm | body_count | flag |
|----------|-----------:|------|
| `N.` | 18509 | short_key |
| `m.` | 17022 | short_key |
| `P.` | 9595 | short_key |
| `f.` | 8349 | short_key |
| `C.` | 6915 | short_key |
| `d.` | 6906 | short_key |
| `pp.` | 4990 | — |
| `V.` | 4836 | short_key |
| `v.` | 4836 | short_key |
| `S.` | 4713 | short_key |
| `g.` | 3575 | short_key |
| `E.` | 3272 | short_key |
| `T.` | 3084 | short_key |
| `t.` | 3084 | short_key |
| `R.` | 3042 | short_key |
| `ac.` | 2299 | — |
| `lc.` | 2165 | — |
| `id.` | 2077 | — |
| `ad.` | 2045 | — |
| `in.` | 1958 | — |

## Fold / parser follow-ups (document only)

Candidates for a future **documented** fold-table extension (not applied here):

1. German **j → y** (Jogas/Yogas, Dhjâna/Dhyâna, Nâṭja/Nâṭya) when body attests the y-form.
2. Dual-key legends (`X oder Y`) — count each side separately before `pref_only`.
3. Strip parenthetical author notes from the search form (`Hindu Th. (Wilson,)` → `Hindu Th.`).
4. OCR specials still after diacritic fold: `ḱ`→`k`/`c`, leading `ʼ`/`\`, `Ǵ`→`J`/`Y`.
5. `Kâtj.` ↔ `Kâty.` (t/j vs ty) seen in both PWG and PW.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict MD --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --dict MD
```

TSV: [`md_pref_only_decompose.tsv`](./md_pref_only_decompose.tsv)

---

_H1560 · Grok 4.5 (`grok-4.5`) · mechanical re-run + hand/probe classification._
