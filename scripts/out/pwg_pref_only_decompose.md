# Pref-only decomposition — PWG

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Policy (H1569)

- Body `.txt` wins for siglum *naming*; this table feeds gated apply + change log.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Hold without body attestation: `rare` · `true_unused` · `ambiguous`.

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 112 |
| Classified sample (top by key length) | 112 |
| High-count control | 20 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 48 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 14 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 16 | Pref key OCR error vs print/body form |
| `spacing` | 8 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 23 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 3 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `true_unused` | low | `Zur Geschichte u. s. w. (Lassen,)` | `—` | 0 | long_bib_or_external_title |
| `rare` | high | `Jâǵnikad. Paddh. zu Kâtj. Çr.` | `—` | 0 | expansion_rare_signal |
| `true_unused` | low | `Gild. Scriptorum Arabum etc.` | `—` | 0 | long_bib_or_external_title |
| `true_unused` | low | `Mém. sur l'Inde (Reinaud,)` | `—` | 0 | long_bib_or_external_title |
| `spacing` | med | `Pravar. oder Pravarâdhj.` | `Pravar.` | 1 | alt='Pravar.' body_n=1 |
| `true_unused` | low | `Verh. d. k. s. G. d. Ww.` | `—` | 0 | long_bib_or_external_title |
| `true_unused` | low | `Burn. Lot. de la b. l.` | `—` | 0 | long_bib_or_external_title |
| `spacing` | high | `RV. Prât. oder Prâtiç.` | `RV. Prât.` | 1788 | alt='RV. Prât.' body_n=1788 |
| `spacing` | high | `Prab. oder Prabodh.` | `Prab.` | 2836 | alt='Prab.' body_n=2836 |
| `true_unused` | low | `Tib. Lebensb. Çâkj.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `Prât. oder Prâtiç.` | `Prât.` | 4358 | alt='Prât.' body_n=4358 |
| `rare` | high | `VAGRĀSANASĀDHANAM.` | `—` | 0 | expansion_rare_signal |
| `spacing` | high | `Vikr. oder Vikram.` | `Vikr.` | 1665 | alt='Vikr.' body_n=1665 |
| `true_unused` | low | `Çâńk. oder Çâńkar.` | `—` | 0 | dual_oder_key; no_alt_hit |
| `ortho` | low | `Dâj. oder Dâjabh.` | `—` | 0 | dual_oder_key; j_series_no_confirmed_body_alt |
| `spacing` | high | `Nîl. oder Nîlak.` | `Nîlak.` | 1275 | alt='Nîlak.' body_n=1275 |
| `spacing` | high | `Sch. oder Schol.` | `Sch.` | 7123 | alt='Sch.' body_n=7123 |
| `spacing` | high | `Vop. oder Vopad.` | `Vop.` | 5956 | alt='Vop.' body_n=5956 |
| `true_unused` | low | `Çuk. oder Çukas.` | `—` | 0 | dual_oder_key; no_alt_hit |
| `true_unused` | low | `Mâṇḍ. Up. Kâr.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Roxb. Fl. ind.` | `—` | 0 | long_bib_or_external_title |
| `rare` | high | `Nârâjanaḱakr.` | `—` | 0 | expansion_rare_signal |
| `rare` | high | `Prâjaçkittav.` | `—` | 0 | expansion_rare_signal |
| `rare` | high | `RĀSHTRAPĀLAP.` | `—` | 0 | expansion_rare_signal |
| `true_unused` | low | `Up. und Upak.` | `—` | 0 | no_alt_hit |
| `ocr_key` | high | `\Lalit. Calc.` | `Lalit. Calc.` | 39 | alt='Lalit. Calc.' body_n=39 |
| `ortho` | low | `Çâńkh. Gṛhj.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ocr_key` | med | `ʼUtt. Râmaḱ.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | low | `ʼVjavahârat.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `true_unused` | low | `Mâdhj. Rec.` | `—` | 0 | no_alt_hit |
| `ortho` | low | `Pat. Jogâç.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `true_unused` | low | `Paṅkav. Br.` | `—` | 0 | no_alt_hit |
| `ortho` | med | `Çrâddhaviv.` | `Śrâddhaviv.` | 1 | alt='Śrâddhaviv.' body_n=1 |
| `ortho` | high | `AV. Pariç.` | `AV. Pariś.` | 146 | alt='AV. Pariś.' body_n=146 |
| `ortho` | high | `Avad. Çat.` | `Avad. Śat.` | 5 | alt='Avad. Śat.' body_n=5 |
| `rare` | high | `Durgârkât.` | `—` | 0 | expansion_rare_signal |
| `true_unused` | low | `Kaush. Br.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Kaush. Up.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Khând. Up.` | `Chând. Up.` | 2049 | alt='Chând. Up.' body_n=2049 |
| `rare` | high | `Koshṭhîpr.` | `—` | 0 | expansion_rare_signal |
| `true_unused` | low | `Kshur. Up.` | `—` | 0 | no_alt_hit |
| `ocr_key` | med | `Mańǵuçrîn.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | high | `Pâr. Gṛhj.` | `Pâr. Gṛhy.` | 838 | alt='Pâr. Gṛhy.' body_n=838 |
| `true_unused` | low | `Shaḍv. Br.` | `—` | 0 | no_alt_hit |
| `ocr_key` | med | `Teǵov. Up.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | high | `Tithjâdit.` | `Tithyâdit.` | 122 | alt='Tithyâdit.' body_n=122 |
| `ocr_key` | high | `\Brahma-S.` | `Brahma-S.` | 5 | alt='Brahma-S.' body_n=5 |
| `ortho` | low | `\Kâvja-Pr.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `rare` | high | `Âçv. Gṛhj.` | `—` | 0 | expansion_rare_signal |
| `ortho` | high | `Çatar. Up.` | `Śatar. Up.` | 7 | alt='Śatar. Up.' body_n=7 |
| `true_unused` | low | `Çaun. Kât.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Çâńkh. Br.` | `Śâńkh. Br.` | 882 | alt='Śâńkh. Br.' body_n=882 |
| `ortho` | high | `Çâńkh. Çr.` | `Śâńkh. Śr.` | 2728 | alt='Śâńkh. Śr.' body_n=2728 |
| `rare` | high | `Ǵjotishat.` | `—` | 0 | expansion_rare_signal |
| `ambiguous` | low | `ʼRâga-Tar.` | `—` | 0 | markup_or_conditional_legend |
| `ocr_key` | high | `ʼVedântas.` | `Vedântas.` | 671 | alt='Vedântas.' body_n=671 |
| `ortho` | high | `Divja-Av.` | `Divya-Av.` | 6 | alt='Divya-Av.' body_n=6 |
| `ortho` | low | `Javaneçv.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ortho` | med | `KRIJĀSAM.` | `KRIYĀSAM.` | 1 | alt='KRIYĀSAM.' body_n=1 |
| `rare` | high | `Kâtj. Çr.` | `—` | 0 | expansion_rare_signal |
| `rare` | high | `Kâturbhú.` | `—` | 0 | expansion_rare_signal |
| `ortho` | high | `Matsja-P.` | `Matsya-P.` | 150 | alt='Matsya-P.' body_n=150 |
| `rare` | high | `Saṅgîtad.` | `—` | 0 | expansion_rare_signal |
| `ortho` | high | `Sâṃkhjak.` | `Sâṃkhyak.` | 876 | alt='Sâṃkhyak.' body_n=876 |
| `ambiguous` | low | `\Bhâshâp.` | `—` | 0 | markup_or_conditional_legend |
| `ortho` | high | `Çrâddhat.` | `Śrâddhat.` | 11 | alt='Śrâddhat.' body_n=11 |
| `ortho` | high | `Çṛńgârat.` | `Śṛńgârat.` | 117 | alt='Śṛńgârat.' body_n=117 |
| `ortho` | low | `ʼNjâja-S.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ocr_key` | med | `ʼVivâdaḱ.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | high | `Gâb. Up.` | `Jâb. Up.` | 8 | alt='Jâb. Up.' body_n=8 |
| `ortho` | high | `Kuvalaj.` | `Kuvalay.` | 220 | alt='Kuvalay.' body_n=220 |
| `ortho` | med | `KĀPIÇĀV.` | `KĀPIŚĀV.` | 1 | alt='KĀPIŚĀV.' body_n=1 |
| `ortho` | high | `Matsjop.` | `Matsyop.` | 73 | alt='Matsyop.' body_n=73 |
| `ortho` | high | `Praçnop.` | `Praśnop.` | 260 | alt='Praśnop.' body_n=260 |
| `true_unused` | low | `Pushpas.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `PĀÇAKAK.` | `—` | 0 | no_alt_hit |
| `ocr_key` | high | `\Mudrâr.` | `Mudrâr.` | 93 | alt='Mudrâr.' body_n=93 |
| `ortho` | high | `Âçv. Çr.` | `Âśv. Śr.` | 2295 | alt='Âśv. Śr.' body_n=2295 |
| `ortho` | high | `Çabdârn.` | `Śabdârn.` | 14 | alt='Śabdârn.' body_n=14 |
| `ortho` | high | `Çat. Br.` | `Śat. Br.` | 20941 | alt='Śat. Br.' body_n=20941 |
| `ortho` | high | `Çâk. Ch.` | `Śâk. Ch.` | 285 | alt='Śâk. Ch.' body_n=285 |
| `ocr_key` | high | `ʼRatnâv.` | `Ratnâv.` | 95 | alt='Ratnâv.' body_n=95 |
| `ortho` | high | `DAÇABH.` | `DAŚABH.` | 12 | alt='DAŚABH.' body_n=12 |
| `ortho` | high | `Jaǵ. V.` | `Yaj. V.` | 5 | alt='Yaj. V.' body_n=5 |
| `rare` | high | `Kâvjâk.` | `—` | 0 | expansion_rare_signal |
| `ocr_key` | med | `Laghuǵ.` | `—` | 0 | ocr_special_char_no_body_alt |
| `rare` | high | `Purush.` | `—` | 0 | expansion_rare_signal |
| `ortho` | high | `Sûrjas.` | `Sûryas.` | 1867 | alt='Sûryas.' body_n=1867 |
| `ortho` | high | `Vâju-P.` | `Vâyu-P.` | 237 | alt='Vâyu-P.' body_n=237 |
| `ocr_key` | high | `\Bhaṭṭ.` | `Bhaṭṭ.` | 2786 | alt='Bhaṭṭ.' body_n=2786 |
| `ocr_key` | high | `\Mahâv.` | `Mahâv.` | 13 | alt='Mahâv.' body_n=13 |
| `ocr_key` | high | `\Mâlat.` | `Mâlat.` | 40 | alt='Mâlat.' body_n=40 |
| `ocr_key` | high | `\Mâlav.` | `Mâlav.` | 1201 | alt='Mâlav.' body_n=1201 |
| `ambiguous` | low | `\Naish.` | `—` | 0 | markup_or_conditional_legend |
| `ortho` | high | `Çântiç.` | `Śântiś.` | 269 | alt='Śântiś.' body_n=269 |
| `true_unused` | low | `Çîdhar.` | `—` | 0 | no_alt_hit |
| `ocr_key` | med | `ʼVîram.` | `Vîram.` | 4 | alt='Vîram.' body_n=4 |
| `ortho` | high | `Drâhj.` | `Drâhy.` | 11 | alt='Drâhy.' body_n=11 |
| `ortho` | high | `Horâç.` | `Horâś.` | 21 | alt='Horâś.' body_n=21 |
| `ortho` | high | `Jogas.` | `Yogas.` | 752 | alt='Yogas.' body_n=752 |
| `true_unused` | low | `Mṛkkh.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Vaidj.` | `Vaidy.` | 44 | alt='Vaidy.' body_n=44 |
| `ortho` | high | `Vjutp.` | `Vyutp.` | 1741 | alt='Vyutp.' body_n=1741 |
| `ocr_key` | high | `\Kull.` | `Kull.` | 1420 | alt='Kull.' body_n=1420 |
| `ortho` | high | `Çârńg.` | `Śârńg.` | 666 | alt='Śârńg.' body_n=666 |
| `ortho` | high | `Kaij.` | `Kaiy.` | 54 | alt='Kaiy.' body_n=54 |
| `ortho` | high | `Kâtj.` | `Kâty.` | 8789 | alt='Kâty.' body_n=8789 |
| `ortho` | high | `Lâṭj.` | `Lâṭy.` | 2608 | alt='Lâṭy.' body_n=2608 |
| `ortho` | high | `Suçr.` | `Suśr.` | 20306 | alt='Suśr.' body_n=20306 |
| `ortho` | high | `Viçv.` | `Viśv.` | 403 | alt='Viśv.' body_n=403 |
| `true_unused` | low | `Çvut.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Ǵjot.` | `Jyot.` | 542 | alt='Jyot.' body_n=542 |

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
