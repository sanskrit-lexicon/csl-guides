# Pref-only decomposition — BEN

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)

## Policy (H1569)

- Body `.txt` wins for siglum *naming*; this table feeds gated apply + change log.
- Classification is a **typed residual**, not a claim that keys are unused works.
- Hold without body attestation: `rare` · `true_unused` · `ambiguous`.

## Sample frame

| Metric | n |
|--------|--:|
| Total `pref_only` (frozen crosscheck) | 17 |
| Classified sample (top by key length) | 17 |
| High-count control | 20 |

## Class distribution (sample)

| Class | n | Meaning |
|-------|--:|---------|
| `ortho` | 7 | Pref orthography ≠ body (fold incomplete) |
| `rare` | 0 | Starred / MS / occasional work; body count 0 plausible |
| `ocr_key` | 0 | Pref key OCR error vs print/body form |
| `spacing` | 0 | Multi-token key spacing/punctuation/dual-key mismatch |
| `true_unused` | 10 | Legend key not used in digitized body (or only outside sample) |
| `ambiguous` | 0 | Needs human / scan check |

## Classified sample

| class | conf | key_norm | alt_form | alt_n | notes |
|-------|------|----------|----------|------:|-------|
| `true_unused` | low | `Ṛit. Ṛitusam̄hâra, ed.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Govardh. Āryas.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Bhavishyap.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Çṛiṅgârat.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Mṛichchh.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Bhâshâp.` | `—` | 0 | no_alt_hit |
| `true_unused` | low | `Somadev.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Çântiç.` | `Śântiś.` | 16 | alt='Śântiś.' body_n=16 |
| `true_unused` | low | `Chaur.` | `—` | 0 | no_alt_hit |
| `ortho` | high | `Daçak.` | `Daśak.` | 1098 | alt='Daśak.' body_n=1098 |
| `true_unused` | low | `Naish.` | `—` | 0 | no_alt_hit |
| `ortho` | med | `Çukas.` | `Śukas.` | 4 | alt='Śukas.' body_n=4 |
| `ortho` | med | `Çârṅg.` | `Śârṅg.` | 1 | alt='Śârṅg.' body_n=1 |
| `ortho` | high | `Suçr.` | `Suśr.` | 776 | alt='Suśr.' body_n=776 |
| `true_unused` | low | `Swed.` | `—` | 0 | no_alt_hit |
| `ortho` | med | `Çvet.` | `Śvet.` | 1 | alt='Śvet.' body_n=1 |
| `ortho` | high | `ÇKD.` | `ŚKD.` | 27 | alt='ŚKD.' body_n=27 |

## High-count control (should stay hits)

| key_norm | body_count | flag |
|----------|-----------:|------|
| `d.` | 8052 | short_key |
| `MBh.` | 7385 | — |
| `Man.` | 6266 | — |
| `Râm.` | 5175 | — |
| `Comp.` | 3479 | — |
| `Chr.` | 3024 | — |
| `Bhag.` | 2315 | — |
| `Bhâg.` | 2315 | — |
| `Hit.` | 1831 | — |
| `Par.` | 1814 | — |
| `Caus.` | 1384 | — |
| `Râjat.` | 1326 | — |
| `Vikr.` | 1162 | — |
| `Lat.` | 1061 | — |
| `Ragh.` | 937 | — |
| `Râgh.` | 937 | — |
| `Bhartṛ.` | 792 | — |
| `Rigv.` | 770 | — |
| `Lass.` | 765 | — |
| `Utt.` | 726 | — |

## Fold / parser follow-ups (document only)

Candidates for a future **documented** fold-table extension (not applied here):

1. German **j → y** (Jogas/Yogas, Dhjâna/Dhyâna, Nâṭja/Nâṭya) when body attests the y-form.
2. Dual-key legends (`X oder Y`) — count each side separately before `pref_only`.
3. Strip parenthetical author notes from the search form (`Hindu Th. (Wilson,)` → `Hindu Th.`).
4. OCR specials still after diacritic fold: `ḱ`→`k`/`c`, leading `ʼ`/`\`, `Ǵ`→`J`/`Y`.
5. `Kâtj.` ↔ `Kâty.` (t/j vs ty) seen in both PWG and PW.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict BEN --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --dict BEN
```

TSV: [`ben_pref_only_decompose.tsv`](./ben_pref_only_decompose.tsv)

---

_H1560 · Grok 4.5 (`grok-4.5`) · mechanical re-run + hand/probe classification._
