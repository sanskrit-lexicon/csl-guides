# H1559 — Bounded OCR + EN quality probes for PWG / PW front matter

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1559](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1559-Sonnet_csl-guides_pref-ocr-en-sample-error-rates_24.07.26.md)  
**Model:** Grok 4.5 (`grok-4.5`) — dual-pass script + vision locus checks + DE↔EN sense check  
**Tracking:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · [PWG#210](https://github.com/sanskrit-lexicon/PWG/issues/210)  
**Goal:** measured sample error rates for scholarly-fidelity claims — **not** full re-OCR.

**Artefacts in this directory**

| File | Role |
|---|---|
| [H1559_pref_ocr_en_sample_registry.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/H1559_pref_ocr_en_sample_registry.json) | Pre-registered sample (locked before measurement) |
| [H1559_pref_ocr_dualpass_metrics.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/H1559_pref_ocr_dualpass_metrics.json) / [.tsv](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/H1559_pref_ocr_dualpass_metrics.tsv) | Engine A vs B dual-pass numbers |
| [../pref_ocr_en_quality_probe.py](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_ocr_en_quality_probe.py) | Reproducible dual-pass runner |

Gold DE / EN: [PWG/prefaces](https://github.com/sanskrit-lexicon/PWG/tree/main/prefaces), [PWK/prefaces](https://github.com/sanskrit-lexicon/PWK/tree/main/prefaces) (PW = short Petersburg dictionary).  
Scans: each repo’s `prefaces/scans/`. Operator manual: [Preface OCR pipeline](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/preface-ocr-pipeline.mdx).

---

## 1. Pre-registered sample (selection rule)

**Rule (fixed before any measurement):** stratify by page type — **title · Vorwort · abbreviations · addenda** (addenda only where present = PWG). Prefer the first page of each type plus one mid/late-volume exemplar for multi-page series. Deliberate layout/volume coverage; **not** a random sample and **not** a full re-OCR.

| Dict | Stratum | Label | Gold A | Scan PNG | Layout |
|---|---|---|---|---|---|
| PWG | title | pwg-title-v1 | `pwgpref01.md` | `pwg1-0000--01.png` | single |
| PWG | title | pwg-title-v2 | `pwgpref12.md` | `pwg2-0000--01.png` | single |
| PWG | title | pwg-title-v7 | `pwgpref26.md` | `pwg7-0000--01.png` | single |
| PWG | vorwort | pwg-vorwort-v1-p1 | `pwgpref02.md` | `pwg1-0000--02.png` | prose_2col |
| PWG | vorwort | pwg-vorwort-v2 | `pwgpref15.md` | `pwg2-0000--04.png` | prose_2col |
| PWG | vorwort | pwg-vorwort-v7-final | `pwgpref27.md` | `pwg7-0000--02.png` | prose_2col |
| PWG | abbreviations | pwg-abbr-v1-p1 | `pwgpref07.md` | `pwg1-0000--06.png` | list_2col |
| PWG | abbreviations | pwg-abbr-v1-p4 | `pwgpref10.md` | `pwg1-0000--10.png` | list_2col |
| PWG | abbreviations | pwg-abbr-v2-add | `pwgpref16.md` | `pwg2-0000--05.png` | list_2col |
| PWG | addenda | pwg-addenda-v1 | `pwgpref13.md` | `pwg2-0000--02.png` | list_2col |
| PWG | addenda | pwg-addenda-v2 | `pwgpref14.md` | `pwg2-0000--03.png` | list_2col |
| PW | title | pw-title-v1 | `pwpref01.md` | `pw1-000-1.png` | single |
| PW | vorwort | pw-vorwort | `pwpref02.md` | `pw1-000-2.png` | prose_2col |
| PW | abbreviations | pw-abbr-p1 | `pwpref03.md` | `pw1-000-3.png` | list_2col |
| PW | abbreviations | pw-abbr-p3 | `pwpref05.md` | `pw1-000-5.png` | list_2col |

**n = 15 full pages** (11 PWG + 4 PW). Within pages, locus checks target high-stakes fields (imprint lines, dates, names, abbr keys, corrigendum formulas) — **42 loci** total (§3).

**Scan-map caveat:** PWG filename order ≠ toctree order (`pwgpref06` ↔ `pwg1-0000--07`, `pwgpref07` ↔ `pwg1-0000--06`). Sample rows use each file’s YAML `source_scan` (one draft mapping error on abbr-p4 was caught and corrected before reporting).

---

## 2. Methods (two complementary probes)

### 2.1 Dual-pass A vs B (automated — **not** scan-truth CER)

| Item | Value |
|---|---|
| Engine A | Canonical `prefNN.md` (vision band OCR, production gold) |
| Engine B | Tesseract 5.5.0 `deu+eng+san`, `--psm 6`, crop bands (single: 3 vertical; 2-col: L then R × 3 bands) |
| Tokens | Unicode word pieces after lowercasing; drop `**bold**` and `[page N]` |
| Jaccard | \|A∩B\| / \|A∪B\| |
| Recall@A | \|A∩B\| / \|A\| (how much of A’s vocabulary B recovers) |

**Honest limit:** dual-pass measures **Engine B vs gold A**, not gold vs the printed book. Low Jaccard on abbreviation pages is expected B failure (diacritics, Indic romanization) — consistent with the prior [PWG A vs B bake-off](https://github.com/sanskrit-lexicon/PD/blob/main/COMPARISON_PWG_OCR_A_VS_B.md) (mean Jaccard ~0.51 on 3 pages). **Do not treat dual-pass mismatch as an A error rate.**

### 2.2 Scan-locus probe (gold A vs printed page)

Human/vision re-read of the scan PNG at pre-selected fields; classify each locus:

| Band | Meaning |
|---|---|
| **OK** | Gold matches the print (allowing intentional BR romanization `ç`/`Ç` for the edition’s diacritic set, and deliberate omission of Cologne digitizer stamps) |
| **MISMATCH** | Gold disagrees with a clear print reading |
| **BORDERLINE** | Ambiguous glyph / possible print defect / needs second human eyes |

### 2.3 EN sense probe (DE ↔ EN)

Paragraph-level check (not full retranslation). Labels: **OK** · **MAJOR_OMISSION** · **WRONG_SENSE**. Keys, titles, Sanskrit, numbers must stay verbatim in EN.

---

## 3. OCR results

### 3.1 Dual-pass metrics (A vs B)

| Label | Dict | Stratum | A chars* | B chars* | A tok | B tok | Jaccard | Recall@A |
|---|---|---|---:|---:|---:|---:|---:|---:|
| pwg-title-v1 | PWG | title | 160 | 143 | 21 | 20 | 0.464 | 0.619 |
| pwg-title-v2 | PWG | title | 155 | 156 | 21 | 21 | 0.400 | 0.571 |
| pwg-title-v7 | PWG | title | 206 | 202 | 28 | 29 | 0.500 | 0.679 |
| pwg-vorwort-v1-p1 | PWG | vorwort | 3438 | 3787 | 331 | 419 | 0.693 | 0.927 |
| pwg-vorwort-v2 | PWG | vorwort | 1042 | 1254 | 140 | 190 | 0.642 | 0.921 |
| pwg-vorwort-v7-final | PWG | vorwort | ~3.4k† | — | 343 | 413 | 0.699 | 0.907 |
| pwg-abbr-v1-p1 | PWG | abbreviations | — | — | 377 | 466 | 0.400 | 0.639 |
| pwg-abbr-v1-p4 | PWG | abbreviations | — | — | 519 | 629 | 0.338 | 0.559 |
| pwg-abbr-v2-add | PWG | abbreviations | — | — | 279 | 344 | 0.309 | 0.527 |
| pwg-addenda-v1 | PWG | addenda | — | — | 355 | 408 | 0.355 | 0.563 |
| pwg-addenda-v2 | PWG | addenda | — | — | 269 | 407 | 0.357 | 0.662 |
| pw-title-v1 | PW | title | — | — | 48 | 70 | 0.494 | 0.812 |
| pw-vorwort | PW | vorwort | — | — | 354 | 445 | 0.601 | 0.847 |
| pw-abbr-p1 | PW | abbreviations | — | — | 474 | 679 | 0.246 | 0.481 |
| pw-abbr-p3 | PW | abbreviations | — | — | 423 | 572 | 0.208 | 0.404 |

\* Space-stripped normalized character counts where recorded. † Full row in JSON.

**Means by stratum (Jaccard / Recall@A)**

| Stratum | n pages | Mean Jaccard | Mean Recall@A |
|---|---:|---:|---:|
| title | 4 | 0.465 | 0.670 |
| vorwort | 4 | 0.659 | 0.901 |
| abbreviations | 5 | 0.300 | 0.522 |
| addenda | 2 | 0.356 | 0.613 |
| **all sample** | **15** | **0.447** | **0.675** |

**Reading:** Vorwort prose is where B recovers most of A (~90% token recall). Title and especially abbreviations / addenda collapse on diacritics and Devanāgarī — **B remains audit-only**, never auto-promoted (pipeline rule Phase 3.5).

### 3.2 Scan-locus table (gold A vs print) — n = 42

| # | Dict | Page | Locus | Gold reading | Verdict | Notes |
|---:|---|---|---|---|---|---|
| 1 | PWG | pref01 | Main title | `SANSKRIT-WÖRTERBUCH` | OK | |
| 2 | PWG | pref01 | Editors | `Otto Böhtlingk und Rudolph Roth` | OK | |
| 3 | PWG | pref01 | Academy line | `KAISERLICHEN AKADEMIE DER WISSENSCHAFTEN` | OK | |
| 4 | PWG | pref01 | Part / content | `ERSTER THEIL` / `DIE VOCALE` | OK | |
| 5 | PWG | pref01 | Place / year | `St. Petersburg` / `1855` | OK | |
| 6 | PWG | pref26 | Part line | `SIEBENTER THEIL` | OK | |
| 7 | PWG | pref26 | Devanāgarī range | `श — ह` + Verbesserungen clause | OK | |
| 8 | PWG | pref26 | Year | `1875` | OK | |
| 9 | PW | pref01 | Title + shorter version | `SANSKRIT-WÖRTERBUCH` / `IN KÜRZERER FASSUNG` | OK | |
| 10 | PW | pref01 | Author | `OTTO BÖHTLINGK` | OK | |
| 11 | PW | pref01 | Imprint address | `(Wass.-Ostr. 9. L. No. 12.)` | OK | |
| 12 | PW | pref01 | Year | `1879` | OK | |
| 13 | PW | pref01 | Price line | `3 Rbl. 50 Cop. Silb. = 11 Mark 70 Pf.` | OK | |
| 14 | PW | pref01 | Distributors | Eggers & Comp. / Leopold Voss | OK | |
| 15 | PWG | pref02 | Heading | `VORWORT` | OK | |
| 16 | PWG | pref02 | Wilson date 1 | `1819` | OK | |
| 17 | PWG | pref02 | Wilson date 2 | `13 Jahre später (1832)` | OK | |
| 18 | PWG | pref02 | Opening clause | *dreissig und etlichen Jahren* … Calcutta | OK | |
| 19 | PWG | pref02 | Closing mark | trailing `*` | OK | |
| 20 | PWG | pref15 | Date line | `14/26 October 1858` | OK | dual Julian/Gregorian style as printed |
| 21 | PWG | pref15 | Places | St. Petersburg / Tübingen | OK | |
| 22 | PWG | pref15 | Kern locus | `Dr. Kern in Groenlo` | OK | |
| 23 | PWG | pref15 | Close letter | `ट` | OK | |
| 24 | PWG | pref27 | Span claim | *beinahe fünfundzwanzig Jahre* | OK | |
| 25 | PWG | pref27 | Closing date | `Jena und Tübingen, den 4. August 1875` | OK | |
| 26 | PWG | pref27 | Signatures | O. Böhtlingk / R. Roth | OK | |
| 27 | PWG | pref07 | List heading | `Erklärung der Abkürzungen` | OK | |
| 28 | PWG | pref07 | Asterisk note | Sternchen for occasional works | OK | |
| 29 | PWG | pref07 | Key `Âçv. Çr.` | Âçvalâjana / 12 Adhjâja / Handschrift | OK | BR `ç` convention |
| 30 | PWG | pref07 | Key `Ait. Br.` | 8 Pańḱikâ / 40 Adhjâja | OK | |
| 31 | PWG | pref07 | Key `AK.` | Colebrooke + Loiseleur Deslongchamps | OK | |
| 32 | PWG | pref07 | Key `AV.` | Roth & Whitney, Berlin 1855 | OK | |
| 33 | PWG | pref07 | Key `As. Res.` | Asiatick Researches expansion | OK | |
| 34 | PWG | pref13 | Heading | `Nachträgliche Verbesserungen zum 1. Theile` | OK | |
| 35 | PWG | pref13 | S. 8 अकरुणा | `lies: करुणा st. करुणा` | **BORDERLINE** | Tautological *st.* pair; likely missing अ- on one side — needs human re-check of Devanāgarī on scan before any gold edit |
| 36 | PWG | pref13 | S. 9 rephin | `wenn der rephin vor r ausfällt` | OK | technical term as printed |
| 37 | PWG | pref13 | S. 58 | `*lagopodiodes*` | OK | |
| 38 | PWG | pref13 | S. 228 | `ÇAT. BR.` masc. | OK | |
| 39 | PW | pref03 | Opening prose | *Dass die Nachträge so stark geworden sind…* | OK | |
| 40 | PW | pref03 | Chrestomathie rule | two numbers → 2nd ed. Chrestomathie | OK | |
| 41 | PW | pref03 | Key `Ait. Br.` | Ausg. von Haug | OK | |
| 42 | PW | pref03 | Key `AK.` | Amarakoça / Loiseleur Deslongchamps | OK | |

**Scan-locus summary**

| Verdict | Count | Rate (n=42) |
|---|---:|---:|
| OK | 41 | **97.6%** |
| BORDERLINE | 1 | 2.4% |
| MISMATCH (clear gold error) | **0** | **0%** |

**Uncertainty markers already in gold (full corpus, not only sample):** PWG 27 pages → 14× `[?]`, 0× `[illegible]`; PW 5 pages → 1× `[?]`, 0× `[illegible]`. Markers flag agent uncertainty at production time; they are **not** counted as mismatches above.

**Honest ceiling:** 42 loci on 15 pages is a **bounded probe**, not a character error rate over all ~100k DE characters. High-stakes imprint fields and Vorwort dates/names are clean in this sample. Abbreviation *keys* match structure; Devanāgarī in addenda needs denser sampling if a full corrigendum audit is wanted.

---

## 4. EN sense-check results — n = 12 segments

| # | Dict | Source | Segment | Verdict | Notes |
|---:|---|---|---|---|---|
| 1 | PWG | pref01 → .en | Title block (all imprint lines) | OK | Names/year/place preserved; title glossed as “Sanskrit Dictionary (Sanskrit-Wörterbuch)” |
| 2 | PWG | pref02 → .en | ¶1 Wilson / thirty-odd years | OK | Full sense; Calcutta + Wilson kept |
| 3 | PWG | pref02 → .en | ¶2 Nestor / preparatory stage | OK | “Nestor of Indianists”; no sense drift |
| 4 | PWG | pref02 → .en | ¶3 two elements of the dictionary | OK | Indian collections vs own collections |
| 5 | PWG | pref02 → .en | ¶4–5 Brâhmaṇa / glossators / rubble | OK | Metaphor retained |
| 6 | PWG | pref15 → .en | Vol. 2 short Vorwort + date | OK | Kern/Groenlo; gutturals→cerebrals; 14/26 Oct 1858 |
| 7 | PWG | pref27 → .en | Final Vorwort + Müller footnote | OK | ~25 years; Weber/Kern/Stenzler/Whitney/Schiefner; *gîtin, çirahkampin* verbatim in footnote |
| 8 | PWG | pref07 → .en | Abbr scaffolding sample (10 keys) | OK | Handschrift→Manuscript, Hdschr.→Ms.; **keys/titles verbatim** |
| 9 | PWG | pref13 → .en | Addenda formulas (10 lines) | OK | lies→read, st.→instead of, streiche→delete; carries the BORDERLINE tautology from DE (not an EN-only fault) |
| 10 | PW | pref01 → .en | Title + price + distributors | OK | “IN SHORTER VERSION”; price digits unchanged |
| 11 | PW | pref02 → .en | ¶1–2 purpose + collaborators | OK | Full scholar list present; no major omission |
| 12 | PW | pref03 → .en | Opening two prose paragraphs + 5 keys | OK | Nachträge explanation; keys verbatim |

**EN summary**

| Verdict | Count | Rate (n=12) |
|---|---:|---:|
| OK | **12** | **100%** |
| MAJOR_OMISSION | 0 | 0% |
| WRONG_SENSE | 0 | 0% |

**Caveat:** EN check is paragraph-level sense, not a full bilingual alignment or style critique. Abbreviation pages only sample scaffolding translation + key fidelity.

---

## 5. Findings (what a human should take away)

1. **Scholarly imprint fields (title pages, closing dates, signatures) are clean** in the sample — 0 clear MISMATCH on 42 loci.
2. **Vorwort prose DE↔EN is serviceable for research use** in the sample segments (no major omission / wrong sense).
3. **One BORDERLINE gold locus** on PWG addenda (`pwgpref13.md` S. 8 अकरुणा: `करुणा st. करुणा`) — do **not** auto-overwrite; re-vision the Devanāgarī band and human-gate any fix (handoff out-of-scope for auto-overwrite).
4. **Dual-pass confirms Engine B is not a substitute for A**, especially on abbreviations (mean Jaccard ~0.30) — same conclusion as the PD bake-off, now on a wider stratified sample (15 pages vs 3).
5. **PWG scan filename ↔ page swaps are real** (`pref06`/`pref07` vs `--06`/`--07`); any future batch script must trust YAML `source_scan`, not lexical sort of PNGs.

---

## 6. Reproduce

```text
# from csl-guides (PWG + PWK clones as siblings under GitHub/)
python scripts/pref_ocr_en_quality_probe.py
# optional: python scripts/pref_ocr_en_quality_probe.py --skip-tesseract  # registry only
```

Requires local `tesseract` + `pytesseract` + `Pillow` and the dict-repo `prefaces/scans/` trees.

---

## 7. Out of scope (this handoff)

- Full re-OCR of all pages  
- Auto-overwrite of gold DE from probes  
- Russian (RU) quality probe  
- Character-level CER over the entire corpus  

---

_Dr. Mārcis Gasūns_
