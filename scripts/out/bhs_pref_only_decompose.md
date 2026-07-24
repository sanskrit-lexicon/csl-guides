# Pref-only decomposition — BHS

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Policy (H1569)

- Body `.txt` wins for siglum *naming*; this table feeds gated apply + change log.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Hold without body attestation: `rare` · `true_unused` · `ambiguous`.

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 53 |
| Classified sample (top by key length) | 53 |
| High-count control | 20 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 0 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 0 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 0 | Pref key OCR error vs print/body form |
| `spacing` | 14 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 39 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 0 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `true_unused` | low | `E. Lamotte, Mél. chin. et boud.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Winternitz, H(ist). I(nd). Lit.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `Turner (R.L.), Nep. Dict.` | `Turner, Nep. Dict.` | 8 | alt='Turner, Nep. Dict.' body_n=8 |
| `true_unused` | low | `Neisser, Z. Wbch. d. RV.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Kh.p., Khud.p. (comm.)` | `—` | 0 | no_alt_hit |
| `spacing` | med | `Meyer, Kauṭ. (Arth.)` | `Meyer, Kauṭ.` | 4 | alt='Meyer, Kauṭ.' body_n=4 |
| `true_unused` | low | `Wack(ernagel), AIGr.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `B (as in Wh. Roots)` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `S (as in Wh. Roots)` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `U (as in Wh. Roots)` | `—` | 0 | no_alt_hit |
| `spacing` | med | `B. in Tr. (Warren)` | `B. in Tr.` | 1 | alt='B. in Tr.' body_n=1 |
| `true_unused` | low | `JR (Vikramacarita)` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Miln.(p.), Milp.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Przyluski, Aśoka` | `—` | 0 | no_alt_hit |
| `spacing` | med | `Uhlenbeck (C.C.)` | `Uhlenbeck` | 3 | alt='Uhlenbeck' body_n=3 |
| `true_unused` | low | `postp., postpos.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `MIndic or MInd.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `(Jä.,) Jäschke` | `Jäschke` | 14 | alt='Jäschke' body_n=14 |
| `spacing` | high | `Kauṭ. (Arth.)` | `Kauṭ.` | 26 | alt='Kauṭ.' body_n=26 |
| `true_unused` | low | `San., Sanatk.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Vism., Vis.M.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `inst., instr.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `(Hoernle) MR` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `v.l., vv.ll.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Bcṭ, Bca.ṭ.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Dpv., Dpvs.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `Geiger (W.)` | `Geiger` | 37 | alt='Geiger' body_n=37 |
| `true_unused` | low | `lect. diff.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `It., Itiv.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `Rājat(ar).` | `Rājat.` | 15 | alt='Rājat.' body_n=15 |
| `true_unused` | low | `ch., chap.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Bv, Bu.v.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Ep. Zeyl.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `Tatp(ur).` | `Tatp.` | 8 | alt='Tatp.' body_n=8 |
| `true_unused` | low | `NAWGött.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Ved. St.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `der(iv).` | `der.` | 5 | alt='der.' body_n=5 |
| `spacing` | med | `Pug(g).` | `Pug.` | 1 | alt='Pug.' body_n=1 |
| `spacing` | high | `s.v(v).` | `s.v.` | 1936 | alt='s.v.' body_n=1936 |
| `spacing` | high | `var(r).` | `var.` | 149 | alt='var.' body_n=149 |
| `true_unused` | low | `vs, vss` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Mṛcch.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Sūyag.` | `—` | 0 | no_alt_hit |
| `spacing` | high | `ms(s).` | `ms.` | 807 | alt='ms.' body_n=807 |
| `true_unused` | low | `uncpd.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `ABORI` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `AbhK.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Nidd¹` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Sdhp.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `impf.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `ASGW` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `ApŚ!` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `ZII` | `—` | 0 | no_alt_hit |

## High-count control (should stay hits)

| key_norm | body_count | flag |
|----------|-----------:|------|
| `E` | 268209 | short_key |
| `AB` | 104165 | short_key |
| `AN` | 102651 | short_key |
| `Av` | 18636 | short_key |
| `RO` | 12410 | short_key |
| `Mv` | 11904 | short_key |
| `MS` | 9141 | short_key |
| `n.` | 8969 | short_key |
| `Ud` | 8459 | short_key |
| `f.` | 7891 | short_key |
| `Ś.` | 7490 | short_key |
| `M.` | 7101 | short_key |
| `m.` | 7101 | short_key |
| `SP` | 6932 | short_key |
| `Skt.` | 5999 | — |
| `cf.` | 4465 | — |
| `LV` | 4415 | short_key |
| `Mvy` | 4122 | — |
| `B.` | 3974 | short_key |
| `Prāt` | 3928 | — |

## Fold / parser follow-ups (document only)

Candidates for a future **documented** fold-table extension (not applied here):

1. German **j → y** (Jogas/Yogas, Dhjâna/Dhyâna, Nâṭja/Nâṭya) when body attests the y-form.
2. Dual-key legends (`X oder Y`) — count each side separately before `pref_only`.
3. Strip parenthetical author notes from the search form (`Hindu Th. (Wilson,)` → `Hindu Th.`).
4. OCR specials still after diacritic fold: `ḱ`→`k`/`c`, leading `ʼ`/`\`, `Ǵ`→`J`/`Y`.
5. `Kâtj.` ↔ `Kâty.` (t/j vs ty) seen in both PWG and PW.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict BHS --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --dict BHS
```

TSV: [`bhs_pref_only_decompose.tsv`](./bhs_pref_only_decompose.tsv)

---

_H1560 · Grok 4.5 (`grok-4.5`) · mechanical re-run + hand/probe classification._
