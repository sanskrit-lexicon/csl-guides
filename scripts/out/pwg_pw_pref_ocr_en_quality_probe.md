# PWG / PW front-matter — bounded OCR + EN quality probe

_Created: 27-07-2026 · Last updated: 27-07-2026_

**Handoff:** [H1559](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1559-Sonnet_csl-guides_pref-ocr-en-sample-error-rates_24.07.26.md)
**Tracking issues:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · [PWG#210](https://github.com/sanskrit-lexicon/PWG/issues/210)
**Model:** Sonnet 5 (`claude-sonnet-5`)
**Non-goal:** full dictionary re-review or re-OCR. This is a bounded sample with the method stated below, not a claim of exhaustive verification.

Editions in [`prefaces/`](https://github.com/sanskrit-lexicon/PWG/tree/main/prefaces) claim scholarly fidelity ([METHODS.md](https://github.com/sanskrit-lexicon/PWG/blob/main/prefaces/METHODS.md)) without a **measured** sample error rate. This probe compares the gold DE transcription against the native-resolution scan PNGs for a pre-registered sample of full pages, and separately sense-checks the EN translation against the DE gold.

---

## 1. Pre-registered sample

**Stratify:** title · Vorwort/Foreword · abbreviations · addenda (PWG only — PWK/PW has no addenda pages).
**Selection rule:** full-page comparison (the handoff's alternative to ~20–50 band loci), spanning multiple volumes where the dictionary has them, weighted toward abbreviation-list pages since those are the densest and most error-prone (diacritics, proper names, bibliographic numerals).

| Dict | Pages sampled | n | Coverage |
|---|---|---:|---|
| **PWG** | `pwgpref01, 02, 03, 07, 09, 13, 16, 20, 21` | 9 / 27 | 2 title (vol 1, 4) · 3 foreword (vol 1 ×2, vol 4) · 3 abbreviations (vol 1 ×2, vol 2) · 1 addenda (vol 2) |
| **PWK (PW)** | `pwpref01, 02, 03, 04, 05` | 5 / 5 | 1 title · 1 foreword · 3 abbreviations (full coverage — PWK has no addenda) |
| **Total** | | **14 / 32** (44%) | |

EN probe: 8 segments sense-checked (DE↔EN), drawn from the same sample — title, both forewords (PWG vol 1 + vol 4), PWK foreword, and the abbreviation-list intros/entries for both dicts (§3).

---

## 2. OCR probe (gold DE vs. scan)

**Method:** each sampled page's gold `prefNN.md` was read in full against its native-resolution `source_scan` PNG (`scans/`). Content words, proper names, numerals, and bibliographic references were compared; systematic diacritic modernization of legend **keys** (documented policy — keys are aligned to the human-edited dictionary body per [pref-body-naming-authority](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md), not to the literal print glyph) was **not** counted as an error. Devanagari akshara-level diffing on the PWG addenda page was not attempted at full rigor given script scale at this resolution — the source already self-flags uncertain reads with `[?]`, which is the documented policy for that case.

| Page | Type | Result | Note |
|---|---|---|---|
| pwgpref01 (title, vol 1) | title | **exact match** | |
| pwgpref02 (Foreword 1) | Vorwort | **exact match** | full paragraph-by-paragraph re-read |
| pwgpref03 (Foreword 2) | Vorwort | **exact match** | full paragraph-by-paragraph re-read, incl. column-break reconstruction |
| pwgpref07 (Abbreviations 1) | abbreviations | **1 omission** | `A Dict. Beng. and S.` entry drops the scan's `(Haughton,)` attribution |
| pwgpref09 (Abbreviations 3) | abbreviations | **1 major omission** | page opens with a fabricated note `[Paris 1829.] (Fortsetzung des vorhergehenden Eintrags)` — the scan actually has **3 full entries** (`Itih.`, `Jâgn.`, `Jâgnad. (Lois.)`) at this position that are entirely missing from the transcription |
| pwgpref13 (Addenda to vol. 1) | addenda | structurally verified | all ~90 page/line numerals and Latin words checked and match; Devanagari akshara content not independently re-verified (see method note) |
| pwgpref16 (Abbreviations 2-1) | abbreviations | **exact match** | both columns, 53 entries, full re-read |
| pwgpref20 (title, vol 4) | title | **exact match** | |
| pwgpref21 (Foreword 4-1) | Vorwort | **exact match** | full re-read incl. fractions (⅗, ⅖, 12½, 8½) and inline Devanagari (क) |
| pwpref01 (title, vol 1) | title | **exact match** | |
| pwpref02 (Foreword 1) | Vorwort | **exact match** | full re-read incl. 10-name list and Devanagari (व, ब, श, ष, स) |
| pwpref03 (Abbreviations 1) | abbreviations | **1 omission** | page's last entry (`Golâdhj. = Bhâskara's Golâdhjâja (Kern).`) is on the scan but missing from the gold file, which ends mid-list at `Gobh.` |
| pwpref04 (Abbreviations 2) | abbreviations | **exact match** | boundary-checked against pwpref03's drop (confirms `Gold.` correctly opens this page — no duplication, no further gap) and against its own last entry (`N. K.`) |
| pwpref05 (Abbreviations 3) | abbreviations | **exact match** | boundary-checked against pwpref04 (`Nṛs. Up.` correctly opens); full closing signature (`Jena, den 1sten Mai 1879. O. Böhtlingk.`) matches |

### Summary

- **11 / 14 pages (79%): exact match.**
- **3 / 14 pages (21%): a confirmed content omission** — all three are **omissions**, never fabricated or wrong content (aside from the one fabricated bracket note that itself papers over an omission).
- **All 3 defects are on abbreviation-list pages; 0 defects on the 7 title/Vorwort prose pages sampled** (which include long, dense 19th-c. German prose — full exact matches, including exact reproduction of column breaks, fractions, and single-character Devanagari inserts).
- **All 3 defects sit at a page boundary** (the first or last entry transcribed for that page). This is the actionable pattern: the vision-OCR pass appears to occasionally lose the first or last legend entry when a page is cropped into transcription bands, and in one case (pwgpref09) papered over the gap with an invented continuation note rather than surfacing it as `[illegible]`/missing.
- Where pages were re-checked at a boundary that had **no** defect (pwpref04↔03, pwpref05↔04), the adjacent page correctly picked up at the next alphabetical entry with no duplication — so the failure mode is localized entry loss, not a systemic mis-splitting of pages.

---

## 3. EN probe (DE↔EN sense check)

**Method:** DE↔EN paragraph/entry-level sense check (major omission / wrong sense / OK) on a sample drawn from the OCR-probed pages. Not a full re-translation review.

| Segment | Dict | Result |
|---|---|---|
| Title page | PWG | OK — exact, faithful |
| Foreword, vol. 1 (full page, 6 paragraphs) | PWG | OK — faithful, scholarly register preserved |
| Foreword, vol. 4 (full page, 5 paragraphs incl. fractions) | PWG | OK — faithful; ⅗/⅖/12½/8½ and inline Devanagari क correctly carried through |
| Abbreviations intro + sample entries | PWG | OK — faithful (`gedruckte Werke … mit einem Sternchen bezeichnet` → `Printed works … marked with an asterisk`) |
| Abbreviations page 3 opening | PWG | OK, but **inherits** the DE omission — the fabricated continuation note is translated faithfully rather than independently caught; the gap originates in the DE authoring step, not in translation |
| `A Dict. Beng. and S.` entry | PWG | OK, inherits the DE `(Haughton,)` drop (same — gap is upstream) |
| Foreword, vol. 1 (full page, 3 paragraphs, 10-name list) | PWK | OK — all 10 collaborator names transliterated correctly |
| Abbreviations page 3 (signature + sample entries) | PWK | OK — `Jena, den 1sten Mai 1879.` → `Jena, 1 May 1879.` faithful |

**Result: 8/8 EN segments faithful — no wrong-sense or independent translation-step omission found.** The only EN-side gaps found are inherited from the DE gold (as expected — EN is translated from the committed DE `.md`, not re-derived from the scan), not new defects introduced by the translation pass itself.

---

## 4. What this does and doesn't establish

- This is **not** a claim that PWG/PWK front matter is 21% wrong — the sample is small (14/32 pages) and every defect found is a **bounded, specific, nameable omission** (never a misreading of content that IS present), consistent with Engine A (vision OCR) occasionally losing page-boundary material rather than systematically fabricating or mistranslating text.
- The three confirmed gaps are fixable in isolation (re-run vision OCR on the three named loci) but **fixing them is out of scope for this handoff** (H1559 scope is measurement, not correction — auto-overwriting gold DE from a probe without a human gate is explicitly excluded).
- Recommended follow-up (not executed here): a targeted re-OCR pass on the first/last legend entry of every abbreviation-list page across PWG/PWK, since that is now an evidenced risk locus rather than a hypothetical one.

---

## Provenance

| Field | Value |
|---|---|
| Method | Full-page visual re-read of gold `.md` against native-resolution `source_scan` PNG, entry-by-entry for abbreviation lists, paragraph-by-paragraph for prose; no automated diffing |
| Executor | Sonnet 5 (`claude-sonnet-5`), Claude Code |
| Date | 27-07-2026 |
| Sample scope | 14 of 32 total PWG+PWK front-matter pages (see §1); not a full census |
| Reused prior art | [ANDHRABHARATI_REVIEW_PACKET_H1561.md](https://github.com/sanskrit-lexicon/PWG/blob/main/prefaces/ANDHRABHARATI_REVIEW_PACKET_H1561.md) covers a **different** check (legend-key fidelity vs. a human reviewer's materials, body-count cross-check) — no overlap with the OCR-vs-scan / EN-sense-check measured here |

---

_Dr. Mārcis Gasūns_
