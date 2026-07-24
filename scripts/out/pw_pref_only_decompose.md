# Pref-only decomposition — PW

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Non-goals

- **No bulk overwrite** of pref Markdown from body matches.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Optional fold-table extensions must be documented with examples (not silent magic).

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 89 |
| Classified sample (top by key length) | 50 |
| High-count control | 20 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 31 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 1 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 7 | Pref key OCR error vs print/body form |
| `spacing` | 0 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 9 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 2 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `ocr_key` | med | `Pañḱat. ohne nähere Angabe` | `—` | 0 | ocr_special_char_no_body_alt |
| `true_unused` | low | `Suparṇ. und Suparṇâdhj.` | `—` | 0 | no_alt_hit |
| `ambiguous` | low | `Nîlak. mit einer Zahl` | `—` | 0 | markup_or_conditional_legend |
| `ortho` | med | `Devatâdhj. Brâhm.` | `Devatâdhy. Brâhm.` | 1 | alt='Devatâdhy. Brâhm.' body_n=1 |
| `ortho` | low | `Âçv. Gṛhj. Pariç.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ortho` | high | `Gaṇit. Pratjabd.` | `Gaṇit. Pratyabd.` | 7 | alt='Gaṇit. Pratyabd.' body_n=7 |
| `ambiguous` | low | `Anukram. zu RV.` | `—` | 0 | markup_or_conditional_legend |
| `ortho` | low | `Bhavishjott. P.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `true_unused` | low | `Mayr, Ind. Erb.` | `—` | 0 | long_bib_or_external_title |
| `ocr_key` | med | `Weber, Kṛshṇaǵ.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | low | `Bhar. Nâṭjaç.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ortho` | med | `Kâtj. Snânas.` | `Kâty. Snânas.` | 1 | alt='Kâty. Snânas.' body_n=1 |
| `ocr_key` | med | `Prâjaçḱittat.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | high | `Varâh. Jogaj.` | `Varâh. Yogay.` | 249 | alt='Varâh. Yogay.' body_n=249 |
| `ortho` | high | `Çârñg. Paddh.` | `Śârñg. Paddh.` | 15 | alt='Śârñg. Paddh.' body_n=15 |
| `rare` | high | `AV. Prâjaçḱ.` | `—` | 0 | expansion_rare_signal |
| `ortho` | high | `Dhjânab. Up.` | `Dhyânab. Up.` | 10 | alt='Dhyânab. Up.' body_n=10 |
| `true_unused` | low | `Mâṇḍ. Çikshâ` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Subhâshitar.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Varâh. Lagu.` | `—` | 0 | no_alt_hit |
| `ocr_key` | med | `Vikramâñḱaḱ.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | high | `Weber, Ǵjot.` | `Weber, Jyot.` | 10 | alt='Weber, Jyot.' body_n=10 |
| `ortho` | high | `Çvetâçv. Up.` | `Śvetâśv. Up.` | 32 | alt='Śvetâśv. Up.' body_n=32 |
| `ortho` | high | `Çârñg. Saṃh.` | `Śârñg. Saṃh.` | 41 | alt='Śârñg. Saṃh.' body_n=41 |
| `ortho` | low | `Çâṅkh. Gṛhj.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ortho` | high | `Siddh. Çir.` | `Siddh. Śir.` | 5 | alt='Siddh. Śir.' body_n=5 |
| `ortho` | med | `Ǵaim. Bhâr.` | `Jaim. Bhâr.` | 1 | alt='Jaim. Bhâr.' body_n=1 |
| `ortho` | high | `AV. Pariç.` | `AV. Pariś.` | 54 | alt='AV. Pariś.' body_n=54 |
| `ocr_key` | med | `Bhoǵa-Ḱar.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | med | `Jogat. Up.` | `Yogat. Up.` | 4 | alt='Yogat. Up.' body_n=4 |
| `true_unused` | low | `Kaush. Up.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Kaush. Âr.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Kshurikop.` | `—` | 0 | no_alt_hit |
| `ocr_key` | med | `Mahâvîraḱ.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | high | `Mân. Gṛhj.` | `Mân. Gṛhy.` | 252 | alt='Mân. Gṛhy.' body_n=252 |
| `ortho` | high | `Pâr. Gṛhj.` | `Pâr. Gṛhy.` | 198 | alt='Pâr. Gṛhy.' body_n=198 |
| `ortho` | high | `Saṁnj. Up.` | `Saṁny. Up.` | 9 | alt='Saṁny. Up.' body_n=9 |
| `true_unused` | low | `Shaḍv. Br.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Tâṇḍja-Br.` | `Tâṇḍya-Br.` | 520 | alt='Tâṇḍya-Br.' body_n=520 |
| `ortho` | high | `Âpast. Çr.` | `Âpast. Śr.` | 1718 | alt='Âpast. Śr.' body_n=1718 |
| `ortho` | low | `Âçv. Gṛhj.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ortho` | high | `Çâṅkh. Br.` | `Śâṅkh. Br.` | 107 | alt='Śâṅkh. Br.' body_n=107 |
| `ortho` | high | `Çâṅkh. Çr.` | `Śâṅkh. Śr.` | 224 | alt='Śâṅkh. Śr.' body_n=224 |
| `ortho` | high | `Ḱhând. Up.` | `Chând. Up.` | 103 | alt='Chând. Up.' body_n=103 |
| `ortho` | high | `AV. Ǵjot.` | `AV. Jyot.` | 9 | alt='AV. Jyot.' body_n=9 |
| `ocr_key` | med | `Bhoǵa-Pr.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | high | `Hem. Jog.` | `Hem. Yog.` | 25 | alt='Hem. Yog.' body_n=25 |
| `ortho` | med | `Kâtj. Dh.` | `Kâty. Dh.` | 1 | alt='Kâty. Dh.' body_n=1 |
| `ortho` | low | `Kâtj. Çr.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ortho` | high | `Maitrjup.` | `Maitryup.` | 55 | alt='Maitryup.' body_n=55 |

## High-count control (should stay hits)

| key_norm | body_count | flag |
|----------|-----------:|------|
| `M.` | 68781 | short_key |
| `R.` | 56864 | short_key |
| `P.` | 13706 | short_key |
| `H.` | 13185 | short_key |
| `Chr.` | 7328 | — |
| `MBh.` | 4710 | — |
| `Spr.` | 3272 | — |
| `Çâṇḍ.` | 3259 | — |
| `Çâk.` | 3190 | — |
| `Âpast.` | 3078 | — |
| `AV.` | 2084 | — |
| `Hemâdri` | 1986 | — |
| `Ind. St.` | 1942 | — |
| `ṚV.` | 1909 | — |
| `Med.` | 1870 | — |
| `Gal.` | 1737 | — |
| `Bhâvapr.` | 1697 | — |
| `Kâd.` | 1658 | — |
| `VP.` | 1546 | — |
| `Maitr. S.` | 1507 | — |

## Fold / parser follow-ups (document only)

Candidates for a future **documented** fold-table extension (not applied here):

1. German **j → y** (Jogas/Yogas, Dhjâna/Dhyâna, Nâṭja/Nâṭya) when body attests the y-form.
2. Dual-key legends (`X oder Y`) — count each side separately before `pref_only`.
3. Strip parenthetical author notes from the search form (`Hindu Th. (Wilson,)` → `Hindu Th.`).
4. OCR specials still after diacritic fold: `ḱ`→`k`/`c`, leading `ʼ`/`\`, `Ǵ`→`J`/`Y`.
5. `Kâtj.` ↔ `Kâty.` (t/j vs ty) seen in both PWG and PW.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict PW --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --dict PW
```

TSV: [`pw_pref_only_decompose.tsv`](./pw_pref_only_decompose.tsv)

---

_H1560 · Grok 4.5 (`grok-4.5`) · mechanical re-run + hand/probe classification._
