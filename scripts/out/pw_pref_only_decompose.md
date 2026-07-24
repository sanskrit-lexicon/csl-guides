# Pref-only decomposition — PW

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Policy (H1569)

- Body `.txt` wins for siglum *naming*; this table feeds gated apply + change log.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Hold without body attestation: `rare` · `true_unused` · `ambiguous`.

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 64 |
| Classified sample (top by key length) | 64 |
| High-count control | 20 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 33 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 1 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 12 | Pref key OCR error vs print/body form |
| `spacing` | 0 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 16 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 2 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `ocr_key` | med | `Pañḱat. ohne nähere Angabe` | `—` | 0 | ocr_special_char_no_body_alt |
| `true_unused` | low | `Suparṇ. und Suparṇâdhj.` | `—` | 0 | no_alt_hit |
| `ambiguous` | low | `Nîlak. mit einer Zahl` | `—` | 0 | markup_or_conditional_legend |
| `ortho` | low | `Âçv. Gṛhj. Pariç.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ambiguous` | low | `Anukram. zu RV.` | `—` | 0 | markup_or_conditional_legend |
| `ortho` | low | `Bhavishjott. P.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `true_unused` | low | `Mayr, Ind. Erb.` | `—` | 0 | long_bib_or_external_title |
| `ocr_key` | med | `Weber, Kṛshṇaǵ.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | low | `Bhar. Nâṭjaç.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ocr_key` | med | `Prâjaçḱittat.` | `—` | 0 | ocr_special_char_no_body_alt |
| `rare` | high | `AV. Prâjaçḱ.` | `—` | 0 | expansion_rare_signal |
| `true_unused` | low | `Mâṇḍ. Çikshâ` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Subhâshitar.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Varâh. Lagu.` | `—` | 0 | no_alt_hit |
| `ocr_key` | med | `Vikramâñḱaḱ.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | low | `Çâṅkh. Gṛhj.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ocr_key` | med | `Bhoǵa-Ḱar.` | `—` | 0 | ocr_special_char_no_body_alt |
| `true_unused` | low | `Kaush. Up.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Kaush. Âr.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Kshurikop.` | `—` | 0 | no_alt_hit |
| `ocr_key` | med | `Mahâvîraḱ.` | `—` | 0 | ocr_special_char_no_body_alt |
| `true_unused` | low | `Shaḍv. Br.` | `—` | 0 | no_alt_hit |
| `ortho` | low | `Âçv. Gṛhj.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ocr_key` | med | `Bhoǵa-Pr.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | low | `Kâtj. Çr.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `ortho` | med | `Med. avj.` | `Med. avy.` | 2 | alt='Med. avy.' body_n=2 |
| `ortho` | med | `Prajogar.` | `Prayogar.` | 2 | alt='Prayogar.' body_n=2 |
| `ortho` | high | `Sâṁkhjak.` | `Sâṁkhyak.` | 33 | alt='Sâṁkhyak.' body_n=33 |
| `ortho` | med | `Vaidjabh.` | `Vaidyabh.` | 1 | alt='Vaidyabh.' body_n=1 |
| `true_unused` | low | `Ârsh. Br.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Bhâshâp.` | `—` | 0 | no_alt_hit |
| `ortho` | med | `Gâbâlop.` | `Jâbâlop.` | 3 | alt='Jâbâlop.' body_n=3 |
| `ocr_key` | med | `Harshaḱ.` | `—` | 0 | ocr_special_char_no_body_alt |
| `true_unused` | low | `Kshitîç.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Kuvalaj.` | `Kuvalay.` | 12 | alt='Kuvalay.' body_n=12 |
| `ortho` | high | `Kâvjapr.` | `Kâvyapr.` | 136 | alt='Kâvyapr.' body_n=136 |
| `ortho` | high | `Praçnop.` | `Praśnop.` | 9 | alt='Praśnop.' body_n=9 |
| `true_unused` | low | `Pushpas.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Vaṁçabr.` | `Vaṁśabr.` | 20 | alt='Vaṁśabr.' body_n=20 |
| `true_unused` | low | `Vishṇus.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Âçv. Çr.` | `Âśv. Śr.` | 182 | alt='Âśv. Śr.' body_n=182 |
| `ortho` | high | `Çat. Br.` | `Śat. Br.` | 1470 | alt='Śat. Br.' body_n=1470 |
| `ortho` | high | `Çira-Up.` | `Śira-Up.` | 8 | alt='Śira-Up.' body_n=8 |
| `ocr_key` | med | `Ḱhandom.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | high | `Divjâv.` | `Divyâv.` | 10 | alt='Divyâv.' body_n=10 |
| `true_unused` | low | `Kṛshis.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Sûrjad.` | `Sûryad.` | 8 | alt='Sûryad.' body_n=8 |
| `ortho` | high | `Sûrjas.` | `Sûryas.` | 57 | alt='Sûryas.' body_n=57 |
| `ocr_key` | med | `Uǵǵval.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | high | `Vâju-P.` | `Vâyu-P.` | 12 | alt='Vâyu-P.' body_n=12 |
| `ortho` | high | `Ârjabh.` | `Âryabh.` | 132 | alt='Âryabh.' body_n=132 |
| `ortho` | high | `Çulbas.` | `Śulbas.` | 200 | alt='Śulbas.' body_n=200 |
| `ocr_key` | med | `Ḱaurap.` | `—` | 0 | ocr_special_char_no_body_alt |
| `ortho` | high | `Bîǵag.` | `Bîjag.` | 53 | alt='Bîjag.' body_n=53 |
| `ortho` | high | `Jogas.` | `Yogas.` | 76 | alt='Yogas.' body_n=76 |
| `ocr_key` | med | `Mṛḱḱh.` | `—` | 0 | ocr_special_char_no_body_alt |
| `true_unused` | low | `Naish.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Hâsj.` | `Hâsy.` | 83 | alt='Hâsy.' body_n=83 |
| `ortho` | high | `Kauç.` | `Kauś.` | 460 | alt='Kauś.' body_n=460 |
| `ortho` | high | `Lâṭj.` | `Lâṭy.` | 429 | alt='Lâṭy.' body_n=429 |
| `ortho` | high | `Prij.` | `Priy.` | 49 | alt='Priy.' body_n=49 |
| `ortho` | high | `Suçr.` | `Suśr.` | 666 | alt='Suśr.' body_n=666 |
| `ortho` | high | `Çaṃk.` | `Śaṃk.` | 537 | alt='Śaṃk.' body_n=537 |
| `ortho` | high | `Ǵaim.` | `Jaim.` | 336 | alt='Jaim.' body_n=336 |

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
| `Âpast. Śr.` | 1718 | — |
| `Bhâvapr.` | 1697 | — |
| `Kâd.` | 1658 | — |
| `VP.` | 1546 | — |

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
