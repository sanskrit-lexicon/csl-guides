# Pref-only decomposition — MW72

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Policy (H1569)

- Body `.txt` wins for siglum *naming*; this table feeds gated apply + change log.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Hold without body attestation: `rare` · `true_unused` · `ambiguous`.

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 153 |
| Classified sample (top by key length) | 153 |
| High-count control | 16 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 1 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 0 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 0 | Pref key OCR error vs print/body form |
| `spacing` | 106 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 46 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 0 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `true_unused` | low | `- Kirāt. or Kirātārj.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- inst. or inst. c.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Cond. or Condit.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Armen. or Armn.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Vārt. or Vārtt.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- abl. or abl. c.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- acc. or acc. c.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- dat. or dat. c.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- gen. or gen. c.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- loc. or loc. c.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- voc. or voc. c.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Boh. or Bohem.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Inf. or Infin.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- compar. degree` | `—` | 0 | no_alt_hit |
| `ortho` | low | `- Vājasaneyi-s.` | `—` | 0 | j_series_no_confirmed_body_alt |
| `true_unused` | low | `- comp., compd.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Bhāgavata-P.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Cambro-Brit.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Nom. or nom.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Osc. or Osk.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- ed. or edit.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Vishṇu-Pur.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- m. or masc.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- n. or neut.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `- Angl. Sax.` | `Angl. Sax.` | 310 | alt='Angl. Sax.' body_n=310 |
| `true_unused` | low | `- Atharva-v.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Ep. or ep.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- col. cols.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- f. or fem.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- ¯ (macron)` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Bhaṭṭi-k.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Kumāra-s.` | `—` | 0 | no_alt_hit |
| `spacing` | med | `- MS., MSS.` | `MS., MSS.` | 1 | alt='MS., MSS.' body_n=1 |
| `spacing` | med | `- rt., rts.` | `rt., rts.` | 1 | alt='rt., rts.' body_n=1 |
| `true_unused` | low | `- Mahā-bh.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Raghu-v.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Sabda-k.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `- Intens.` | `Intens.` | 545 | alt='Intens.' body_n=545 |
| `spacing` | high | `- Prākṛit` | `Prākṛit` | 9 | alt='Prākṛit' body_n=9 |
| `true_unused` | low | `- Sāma-v.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `- accord.` | `accord.` | 7 | alt='accord.' body_n=7 |
| `spacing` | high | `- astrol.` | `astrol.` | 7 | alt='astrol.' body_n=7 |
| `spacing` | high | `- astron.` | `astron.` | 26 | alt='astron.' body_n=26 |
| `spacing` | high | `- compar.` | `compar.` | 70 | alt='compar.' body_n=70 |
| `spacing` | high | `- defect.` | `defect.` | 9 | alt='defect.' body_n=9 |
| `spacing` | med | `- explet.` | `explet.` | 1 | alt='explet.' body_n=1 |
| `spacing` | med | `- impers.` | `impers.` | 2 | alt='impers.' body_n=2 |
| `spacing` | high | `- mathem.` | `mathem.` | 5 | alt='mathem.' body_n=5 |
| `spacing` | high | `- nom. c.` | `nom. c.` | 9 | alt='nom. c.' body_n=9 |
| `spacing` | high | `- patron.` | `patron.` | 6 | alt='patron.' body_n=6 |
| `spacing` | high | `- pronom.` | `pronom.` | 40 | alt='pronom.' body_n=40 |
| `spacing` | high | `- superl.` | `superl.` | 82 | alt='superl.' body_n=82 |
| `true_unused` | low | `- Adi-p.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `- Armen.` | `Armen.` | 8 | alt='Armen.' body_n=8 |
| `spacing` | med | `- Buddh.` | `Buddh.` | 2 | alt='Buddh.' body_n=2 |
| `spacing` | high | `- Class.` | `Class.` | 43 | alt='Class.' body_n=43 |
| `spacing` | high | `- Desid.` | `Desid.` | 719 | alt='Desid.' body_n=719 |
| `spacing` | med | `- Ionic.` | `Ionic.` | 1 | alt='Ionic.' body_n=1 |
| `spacing` | high | `- Naigh.` | `Naigh.` | 267 | alt='Naigh.' body_n=267 |
| `spacing` | high | `- Pruss.` | `Pruss.` | 20 | alt='Pruss.' body_n=20 |
| `true_unused` | low | `- Rig-v.` | `—` | 0 | no_alt_hit |
| `spacing` | med | `- Sabin.` | `Sabin.` | 4 | alt='Sabin.' body_n=4 |
| `spacing` | med | `- Sansk.` | `Sansk.` | 1 | alt='Sansk.' body_n=1 |
| `spacing` | high | `- Schol.` | `Schol.` | 29 | alt='Schol.' body_n=29 |
| `true_unused` | low | `- Theat.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- Unādis` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `- arith.` | `—` | 0 | no_alt_hit |
| `spacing` | med | `- dimin.` | `dimin.` | 3 | alt='dimin.' body_n=3 |
| `spacing` | med | `- epith.` | `epith.` | 4 | alt='epith.' body_n=4 |
| `spacing` | high | `- medic.` | `medic.` | 13 | alt='medic.' body_n=13 |
| `spacing` | high | `- subst.` | `subst.` | 7 | alt='subst.' body_n=7 |
| `spacing` | med | `- Arab.` | `Arab.` | 3 | alt='Arab.' body_n=3 |
| `spacing` | high | `- B. R.` | `B. R.` | 21 | alt='B. R.' body_n=21 |
| `true_unused` | low | `- Bibl.` | `—` | 0 | no_alt_hit |
| `spacing` | med | `- Bret.` | `Bret.` | 2 | alt='Bret.' body_n=2 |
| `spacing` | high | `- Caus.` | `Caus.` | 1956 | alt='Caus.' body_n=1956 |
| `spacing` | med | `- Gael.` | `Gael.` | 2 | alt='Gael.' body_n=2 |
| `spacing` | high | `- Germ.` | `Germ.` | 649 | alt='Germ.' body_n=649 |
| `spacing` | high | `- Goth.` | `Goth.` | 441 | alt='Goth.' body_n=441 |
| `spacing` | high | `- Gram.` | `Gram.` | 182 | alt='Gram.' body_n=182 |
| `spacing` | high | `- Hind.` | `Hind.` | 19 | alt='Hind.' body_n=19 |
| `true_unused` | low | `- Hund.` | `—` | 0 | no_alt_hit |
| `spacing` | med | `- Icel.` | `Icel.` | 2 | alt='Icel.' body_n=2 |
| `spacing` | high | `- Impf.` | `Impf.` | 75 | alt='Impf.' body_n=75 |
| `spacing` | high | `- Impv.` | `Impv.` | 94 | alt='Impv.' body_n=94 |
| `spacing` | high | `- Lett.` | `Lett.` | 13 | alt='Lett.' body_n=13 |
| `spacing` | high | `- Lith.` | `Lith.` | 383 | alt='Lith.' body_n=383 |
| `spacing` | med | `- Megh.` | `Megh.` | 2 | alt='Megh.' body_n=2 |
| `spacing` | high | `- Pass.` | `Pass.` | 573 | alt='Pass.' body_n=573 |
| `spacing` | high | `- Perf.` | `Perf.` | 106 | alt='Perf.' body_n=106 |
| `spacing` | high | `- Pers.` | `Pers.` | 54 | alt='Pers.' body_n=54 |
| `spacing` | high | `- Prep.` | `Prep.` | 31 | alt='Prep.' body_n=31 |
| `spacing` | high | `- Pres.` | `Pres.` | 98 | alt='Pres.' body_n=98 |
| `spacing` | med | `- Refl.` | `Refl.` | 1 | alt='Refl.' body_n=1 |
| `spacing` | high | `- Russ.` | `Russ.` | 83 | alt='Russ.' body_n=83 |
| `spacing` | high | `- Scot.` | `Scot.` | 12 | alt='Scot.' body_n=12 |
| `spacing` | high | `- Slav.` | `Slav.` | 226 | alt='Slav.' body_n=226 |
| `true_unused` | low | `- Unhx.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `- anom.` | `anom.` | 29 | alt='anom.' body_n=29 |
| `spacing` | high | `- chap.` | `chap.` | 5 | alt='chap.' body_n=5 |
| `spacing` | med | `- comm.` | `comm.` | 2 | alt='comm.' body_n=2 |
| `spacing` | med | `- cons.` | `cons.` | 2 | alt='cons.' body_n=2 |
| `spacing` | high | `- etym.` | `etym.` | 19 | alt='etym.' body_n=19 |
| `spacing` | high | `- gend.` | `gend.` | 5 | alt='gend.' body_n=5 |
| `spacing` | high | `- geom.` | `geom.` | 7 | alt='geom.' body_n=7 |
| `spacing` | high | `- gram.` | `gram.` | 182 | alt='gram.' body_n=182 |
| `spacing` | high | `- long.` | `long.` | 32 | alt='long.' body_n=32 |
| `spacing` | high | `- pers.` | `pers.` | 54 | alt='pers.' body_n=54 |
| `spacing` | high | `- phil.` | `phil.` | 125 | alt='phil.' body_n=125 |
| `spacing` | high | `- poet.` | `poet.` | 164 | alt='poet.' body_n=164 |
| `spacing` | high | `- s. v.` | `s. v.` | 174 | alt='s. v.' body_n=174 |
| `spacing` | high | `- scil.` | `scil.` | 365 | alt='scil.' body_n=365 |
| `spacing` | high | `- sing.` | `sing.` | 727 | alt='sing.' body_n=727 |
| `spacing` | high | `- Aor.` | `Aor.` | 469 | alt='Aor.' body_n=469 |
| `spacing` | high | `- Dor.` | `Dor.` | 52 | alt='Dor.' body_n=52 |
| `spacing` | high | `- Eng.` | `Eng.` | 109 | alt='Eng.' body_n=109 |
| `spacing` | high | `- Fut.` | `Fut.` | 70 | alt='Fut.' body_n=70 |
| `spacing` | high | `- Lat.` | `Lat.` | 834 | alt='Lat.' body_n=834 |
| `spacing` | high | `- Mod.` | `Mod.` | 151 | alt='Mod.' body_n=151 |
| `spacing` | med | `- Nir.` | `Nir.` | 4 | alt='Nir.' body_n=4 |
| `spacing` | high | `- Par.` | `Par.` | 74 | alt='Par.' body_n=74 |
| `spacing` | high | `- Pol.` | `Pol.` | 6 | alt='Pol.' body_n=6 |
| `spacing` | high | `- Pāṇ.` | `Pāṇ.` | 723 | alt='Pāṇ.' body_n=723 |
| `spacing` | high | `- Sax.` | `Sax.` | 369 | alt='Sax.' body_n=369 |
| `spacing` | high | `- Say.` | `Say.` | 2373 | alt='Say.' body_n=2373 |
| `spacing` | high | `- Ved.` | `Ved.` | 11989 | alt='Ved.' body_n=11989 |
| `spacing` | high | `- adj.` | `adj.` | 207 | alt='adj.' body_n=207 |
| `spacing` | med | `- alg.` | `alg.` | 3 | alt='alg.' body_n=3 |
| `true_unused` | low | `- e.g.` | `—` | 0 | no_alt_hit |
| `spacing` | med | `- esp.` | `esp.` | 1 | alt='esp.' body_n=1 |
| `spacing` | med | `- i.e.` | `i.e.` | 1 | alt='i.e.' body_n=1 |
| `spacing` | high | `- ind.` | `ind.` | 4502 | alt='ind.' body_n=4502 |
| `spacing` | med | `- neg.` | `neg.` | 2 | alt='neg.' body_n=2 |
| `spacing` | high | `- obs.` | `obs.` | 8 | alt='obs.' body_n=8 |
| `true_unused` | low | `- q.v.` | `—` | 0 | no_alt_hit |
| `spacing` | med | `- usu.` | `usu.` | 3 | alt='usu.' body_n=3 |
| `spacing` | high | `- Æol.` | `Æol.` | 12 | alt='Æol.' body_n=12 |
| `spacing` | high | `- &c.` | `&c.` | 6977 | alt='&c.' body_n=6977 |
| `spacing` | high | `- Br.` | `Br.` | 32 | alt='Br.' body_n=32 |
| `spacing` | high | `- Gr.` | `Gr.` | 889 | alt='Gr.' body_n=889 |
| `spacing` | high | `- Pp.` | `Pp.` | 17 | alt='Pp.' body_n=17 |
| `spacing` | high | `- Pr.` | `Pr.` | 5 | alt='Pr.' body_n=5 |
| `spacing` | high | `- cf.` | `cf.` | 9307 | alt='cf.' body_n=9307 |
| `spacing` | high | `- cl.` | `cl.` | 6861 | alt='cl.' body_n=6861 |
| `spacing` | high | `- du.` | `du.` | 549 | alt='du.' body_n=549 |
| `spacing` | high | `- fr.` | `fr.` | 7660 | alt='fr.' body_n=7660 |
| `spacing` | high | `- pl.` | `pl.` | 2227 | alt='pl.' body_n=2227 |
| `true_unused` | low | `singo` | `—` | 0 | no_alt_hit |
| `spacing` | med | `- A.` | `-A.` | 1 | alt='-A.' body_n=1 |
| `spacing` | med | `- N.` | `-N.` | 2 | alt='-N.' body_n=2 |
| `spacing` | high | `- P.` | `-P.` | 118 | alt='-P.' body_n=118 |
| `true_unused` | low | `- c.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `- p.` | `-p.` | 118 | alt='-p.' body_n=118 |

## High-count control (should stay hits)

| key_norm | body_count | flag |
|----------|-----------:|------|
| `-` | 250737 | short_key |
| `the` | 90940 | — |
| `water` | 2123 | — |
| `drum` | 455 | — |
| `ivy` | 323 | — |
| `true` | 256 | — |
| `rude` | 167 | — |
| `Haus` | 134 | — |
| `adhere` | 82 | — |
| `marine` | 53 | — |
| `police` | 28 | — |
| `none` | 7 | — |
| `merrily` | 3 | low_count |
| `dolce` | 1 | low_count |
| `nuthook` | 1 | low_count |
| `revelry` | 1 | low_count |

## Fold / parser follow-ups (document only)

Candidates for a future **documented** fold-table extension (not applied here):

1. German **j → y** (Jogas/Yogas, Dhjâna/Dhyâna, Nâṭja/Nâṭya) when body attests the y-form.
2. Dual-key legends (`X oder Y`) — count each side separately before `pref_only`.
3. Strip parenthetical author notes from the search form (`Hindu Th. (Wilson,)` → `Hindu Th.`).
4. OCR specials still after diacritic fold: `ḱ`→`k`/`c`, leading `ʼ`/`\`, `Ǵ`→`J`/`Y`.
5. `Kâtj.` ↔ `Kâty.` (t/j vs ty) seen in both PWG and PW.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict MW72 --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --dict MW72
```

TSV: [`mw72_pref_only_decompose.tsv`](./mw72_pref_only_decompose.tsv)

---

_H1560 · Grok 4.5 (`grok-4.5`) · mechanical re-run + hand/probe classification._
