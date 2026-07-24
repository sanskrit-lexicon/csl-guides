# Pref-only decomposition — PWG

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Non-goals

- **No bulk overwrite** of pref Markdown from body matches.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Optional fold-table extensions must be documented with examples (not silent magic).

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 133 |
| Classified sample (top by key length) | 50 |
| High-count control | 20 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 13 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 5 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 2 | Pref key OCR error vs print/body form |
| `spacing` | 19 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 11 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 0 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `spacing` | high | `SADDH. P. (mit nachfolgender einfacher Zahl)` | `SADDH. P.` | 171 | alt='SADDH. P.' body_n=171 |
| `true_unused` | low | `Zur Geschichte u. s. w. (Lassen,)` | `—` | 0 | long_bib_or_external_title |
| `spacing` | med | `A Dict. Beng. and S. (Haughton,)` | `A Dict. Beng. and S.` | 3 | alt='A Dict. Beng. and S.' body_n=3 |
| `rare` | high | `Jâǵnikad. Paddh. zu Kâtj. Çr.` | `—` | 0 | expansion_rare_signal |
| `true_unused` | low | `Gild. Scriptorum Arabum etc.` | `—` | 0 | long_bib_or_external_title |
| `true_unused` | low | `Mém. sur l'Inde (Reinaud,)` | `—` | 0 | long_bib_or_external_title |
| `spacing` | high | `Zur L. u. G. d. W. (Roth,)` | `Zur L. u. G. d. W.` | 26 | alt='Zur L. u. G. d. W.' body_n=26 |
| `spacing` | med | `Pravar. oder Pravarâdhj.` | `Pravar.` | 1 | alt='Pravar.' body_n=1 |
| `true_unused` | low | `Verh. d. k. s. G. d. Ww.` | `—` | 0 | long_bib_or_external_title |
| `true_unused` | low | `Burn. Lot. de la b. l.` | `—` | 0 | long_bib_or_external_title |
| `spacing` | high | `RV. Prât. oder Prâtiç.` | `RV. Prât.` | 1788 | alt='RV. Prât.' body_n=1788 |
| `spacing` | high | `Lebensb. (Schiefner,)` | `Lebensb.` | 340 | alt='Lebensb.' body_n=340 |
| `spacing` | med | `Institutt. (Lassen,)` | `Institutt.` | 1 | alt='Institutt.' body_n=1 |
| `spacing` | high | `Mat. ind. (Ainslie,)` | `Mat. ind.` | 21 | alt='Mat. ind.' body_n=21 |
| `spacing` | high | `Hindu Th. (Wilson,)` | `Hindu Th.` | 16 | alt='Hindu Th.' body_n=16 |
| `spacing` | high | `Prab. oder Prabodh.` | `Prab.` | 2836 | alt='Prab.' body_n=2836 |
| `true_unused` | low | `Tib. Lebensb. Çâkj.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `Prât. oder Prâtiç.` | `Prât.` | 4358 | alt='Prât.' body_n=4358 |
| `rare` | high | `VAGRĀSANASĀDHANAM.` | `—` | 0 | expansion_rare_signal |
| `spacing` | high | `Vikr. oder Vikram.` | `Vikr.` | 1665 | alt='Vikr.' body_n=1665 |
| `true_unused` | low | `Çâńk. oder Çâńkar.` | `—` | 0 | dual_oder_key; no_alt_hit |
| `ortho` | low | `Dâj. oder Dâjabh.` | `—` | 0 | dual_oder_key; j_series_no_confirmed_body_alt |
| `spacing` | high | `Maç. oder Maç. S.` | `Maç.` | 289 | alt='Maç.' body_n=289 |
| `spacing` | med | `Gîr. oder Gîtag.` | `Gîtag.` | 4 | alt='Gîtag.' body_n=4 |
| `spacing` | high | `Nîl. oder Nîlak.` | `Nîlak.` | 1275 | alt='Nîlak.' body_n=1275 |
| `spacing` | high | `Sch. oder Schol.` | `Sch.` | 7123 | alt='Sch.' body_n=7123 |
| `spacing` | high | `Vop. oder Vopad.` | `Vop.` | 5956 | alt='Vop.' body_n=5956 |
| `true_unused` | low | `Çuk. oder Çukas.` | `—` | 0 | dual_oder_key; no_alt_hit |
| `spacing` | med | `Pent. (Lassen,)` | `Pent.` | 4 | alt='Pent.' body_n=4 |
| `true_unused` | low | `Mâṇḍ. Up. Kâr.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Parâçarapaddh.` | `Parâśarapaddh.` | 10 | alt='Parâśarapaddh.' body_n=10 |
| `ortho` | med | `Pathjâpathjav.` | `Pathyâpathyav.` | 1 | alt='Pathyâpathyav.' body_n=1 |
| `true_unused` | low | `Roxb. Fl. ind.` | `—` | 0 | long_bib_or_external_title |
| `ortho` | high | `Varâh. L. Ǵât.` | `Varâh. L. Jât.` | 18 | alt='Varâh. L. Jât.' body_n=18 |
| `spacing` | high | `Lit. (Weber,)` | `Lit.` | 1491 | alt='Lit.' body_n=1491 |
| `rare` | high | `Nârâjanaḱakr.` | `—` | 0 | expansion_rare_signal |
| `rare` | high | `Prâjaçkittav.` | `—` | 0 | expansion_rare_signal |
| `rare` | high | `RĀSHTRAPĀLAP.` | `—` | 0 | expansion_rare_signal |
| `ortho` | high | `Siddhântaçir.` | `Siddhântaśir.` | 73 | alt='Siddhântaśir.' body_n=73 |
| `true_unused` | low | `Up. und Upak.` | `—` | 0 | no_alt_hit |
| `ocr_key` | high | `\Lalit. Calc.` | `Lalit. Calc.` | 39 | alt='Lalit. Calc.' body_n=39 |
| `ortho` | high | `Çârńg. Paddh.` | `Śârńg. Paddh.` | 36 | alt='Śârńg. Paddh.' body_n=36 |
| `ortho` | med | `Dhjânav. Up.` | `Dhyânav. Up.` | 2 | alt='Dhyânav. Up.' body_n=2 |
| `ortho` | med | `Juktikalpat.` | `Yuktikalpat.` | 4 | alt='Yuktikalpat.' body_n=4 |
| `ortho` | high | `Kâtj. Paddh.` | `Kâty. Paddh.` | 10 | alt='Kâty. Paddh.' body_n=10 |
| `ortho` | high | `Çvetâçv. Up.` | `Śvetâśv. Up.` | 605 | alt='Śvetâśv. Up.' body_n=605 |
| `ortho` | low | `Çâńkh. Gṛhj.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ocr_key` | med | `ʼUtt. Râmaḱ.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | low | `ʼVjavahârat.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ortho` | high | `Gṛhjasâṃgr.` | `Gṛhyasâṃgr.` | 158 | alt='Gṛhyasâṃgr.' body_n=158 |

## High-count control (should stay hits)

| key_norm | body_count | flag |
|----------|-----------:|------|
| `R.` | 234443 | short_key |
| `H.` | 197887 | short_key |
| `P.` | 95965 | short_key |
| `N.` | 90941 | short_key |
| `M.` | 83397 | short_key |
| `MBh.` | 67272 | — |
| `RV.` | 58146 | — |
| `Bhag.` | 33406 | — |
| `Bhâg. P.` | 30744 | — |
| `AK.` | 28273 | — |
| `Kathâs.` | 25078 | — |
| `AV.` | 21528 | — |
| `an.` | 20269 | — |
| `St.` | 19558 | — |
| `Hariv.` | 15689 | — |
| `Varâh. Bṛh.` | 15212 | — |
| `Med.` | 15136 | — |
| `Varâh. Bṛh. S.` | 14323 | — |
| `H. an.` | 9986 | — |
| `Ragh.` | 9870 | — |

## Fold / parser follow-ups (document only)

Candidates for a future **documented** fold-table extension (not applied here):

1. German **j → y** (Jogas/Yogas, Dhjâna/Dhyâna, Nâṭja/Nâṭya) when body attests the y-form.
2. Dual-key legends (`X oder Y`) — count each side separately before `pref_only`.
3. Strip parenthetical author notes from the search form (`Hindu Th. (Wilson,)` → `Hindu Th.`).
4. OCR specials still after diacritic fold: `ḱ`→`k`/`c`, leading `ʼ`/`\`, `Ǵ`→`J`/`Y`.
5. `Kâtj.` ↔ `Kâty.` (t/j vs ty) seen in both PWG and PW.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict PWG --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --dict PWG
```

TSV: [`pwg_pref_only_decompose.tsv`](./pwg_pref_only_decompose.tsv)

---

_H1560 · Grok 4.5 (`grok-4.5`) · mechanical re-run + hand/probe classification._
