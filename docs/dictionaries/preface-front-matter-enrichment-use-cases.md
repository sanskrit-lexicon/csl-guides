# Prefaces as enrichment: proposal and use cases

_Created: 24-07-2026 · Last updated: 04-08-2026 (H1854 hostile read: P1 adjudicated, MW struck from UC-2 pilot)_

**Status:** proposal (research + product framing) · **Audience:** CDSL / csl-guides maintainers, DH pipeline owners, paper authors  
**Related:** [OCR'd prefaces](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/ocr-prefaces) · [Preface OCR pipeline](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/preface-ocr-pipeline) · [Pref keys ↔ body naming authority](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md) · [Abbreviations & citations](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/abbreviations-and-citations) · Issue [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)

## One-line thesis

**Prefaces teach the editor’s map of the Sanskrit library and metalanguage.** Joined to body frequency and cross-dictionary tools, they enrich citation resolution, dictionary literacy, lexicographic history, and any controlled vocabulary of works—not more headword text.

---

## What front matter is (and is not)

| Layer | Role |
|-------|------|
| **Body** (`csl-orig` `.txt`) | Where the lexicon is *used*: headwords, citations, practice. Human-edited over decades. |
| **Pref / front matter** (OCR Markdown) | Where the editor *declares* sources, method, and conventions: title pages, *Vorwort*, abbreviation legends, addenda. |
| **Print scan** | Audit trail for OCR fidelity. |

Front matter is **not** a second copy of the dictionary. Full-diff of Vorwort against body is out of scope. Expansions (full titles) stay scan-faithful; used **siglum naming** aligns toward body when body attests a form ([naming authority](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md)).

---

## What prefaces can teach

### 1. The intended library (vs the used library)

The abbreviation legend is a **declared bibliography**. Body counts show what was *actually* cited; the pref shows what the editor *planned* to have available.

| Signal | Teaching |
|--------|----------|
| Pref key + expansion | Canonical expansion of a siglum as printed |
| Pref-only / rare / MS | Works known but little used (handschrift, “nach Anführungen…”) |
| High body count | Working core of the dictionary’s evidence base |

The **gap** (pref vs body) is research data: programmatic vs realized corpus. Typed residual classes (`ortho`, `rare`, `ocr_key`, `spacing`, `true_unused`, `ambiguous`) already capture that typology under [pref_only_decompose](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_only_decompose.py).

### 2. Sigla as a controlled vocabulary

Pref legends are the natural source for:

- Resolving `<ls>` citations (what `MBh.`, `Çat. Br.`, `Kâtj. Çr.` *mean*)
- Cross-dictionary **same work, different abbreviation** maps
- Separating **work** sigla from **grammar** metalanguage (often mixed in one list)

### 3. Editorial method and period style

Vorworte encode dictionary identity (thesaurus vs practical glossary vs Buddhist hybrid), dependence on earlier lexica (PWG ↔ PW ↔ MW), house romanization, and explicit limits (“handschriftlich”, “gelegentlich”, named informants). That is **lexicographic history**, not only lookup UX.

### 4. Scholarly network and transmission

Pref pages name editors, collaborators, editions, places (Calc., Bibl. ind., St. Petersburg), and correspondence (“nach Mittheilungen von Schiefner / Weber”). Useful for prosopography and edition genealogy.

### 5. Grammar metalanguage as a second legend

MW72, MD, SHS, CAE residual keys are often grammar/meta (`abl.`, `s.v.`, class labels), not text sigla. That teaches how the dictionary teaches morphology in the entry—and why automated body-naming align correctly **stops** for those keys.

### 6. Multilingual access

DE source + EN/RU translations make 19th‑c. German Vorworte usable for students and non-German DH pipelines, while keeping Sanskrit forms, titles, and keys verbatim across languages.

---

## Non-goals (do not force)

- Second full lexicon or full-diff Vorwort against body.
- Bulk expansion rewrite from body (titles stay scan-faithful).
- Claim that every legend key must appear in body (rare/MS is intentional).
- Inventing body forms for residual keys with zero body attestation.

Pref teaches **intention, convention, and library**; body teaches **practice and frequency**. Enrichment is the **join**, not collapsing one channel into the other.

---

## Use cases

Each use case names: **actor**, **pref input**, **join** (if any), **output**, **home / consumer**.

### UC-1 — Expand `<ls>` for humans and machines

- **Actor:** site user, API consumer, link-target builder.
- **Pref input:** key → expansion from OCR legend.
- **Join:** body `<ls>` tokens + frequency; scan page maps where available.
- **Output:** tooltip / panel “MBh. = Mahābhārata …”; ranked “works this dictionary cites most.”
- **Home:** csl-guides abbreviations UX; Cologne display; [citation graph](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/citation-graph).

### UC-2 — Cross-dictionary work identity

- **Actor:** DH analyst, paper author, abbreviations-comparison maintainer.
- **Pref input:** per-dict legend tables (PWG, PW, MW, AP90, …).
- **Join:** same underlying work under different sigla and orthographies.
- **Output:** crosswalk `work_id → {PWG: …, PW: …, MW: …}`; comparison tables.
- **Home:** [abbreviations comparison](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/abbreviations-comparison); kosha / SHARED_CODE-style crosswalks.
- **Status (H1854 hostile read):** survives narrowed — committed inputs exist for PWG/PW ([`pwg_legend.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/pwg_legend.json), [`pw_legend.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/pw_legend.json)) and AP90 ([`ap90_pref_abbr_crosscheck.tsv`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/ap90_pref_abbr_crosscheck.tsv)); **MW struck** — `scripts/out/` has no `mw_*` artifact (legend never parsed), re-add after an MW legend emit.

### UC-3 — Structured legend store (machine-readable)

- **Actor:** pipeline engineer.
- **Pref input:** parsed pref Markdown keys + expansions + sources.
- **Join:** `pref_abbr_crosscheck` body counts; residual class from decompose.
- **Output:** JSON/TSV per dict: `key | expansion | class (work|grammar|meta) | body_count | residual_class | notes`.
- **Home:** `scripts/out/`; future feed for site components (not hand-maintained HTML).

### UC-4 — Dictionary literacy / “how to read this book”

- **Actor:** student, teacher, first-time CDSL user.
- **Pref input:** short Vorwort excerpts + top-N work abbreviations + grammar legend.
- **Join:** example body entries using those sigla.
- **Output:** per-dictionary “reading pack” page or quiz bank seed.
- **Home:** csl-guides user docs; Systema / course companions; [entry anatomy](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/entry-anatomy).
- **Status (H1760):** shipped — reading packs [How to read Böhtlingk–Roth (PWG)](https://sanskrit-lexicon.github.io/csl-guides/users/reading-pwg) and [How to read the PW](https://sanskrit-lexicon.github.io/csl-guides/users/reading-pw), frequency-ranked from `pref-legends.json`.

### UC-5 — Pedagogy: grammar metalanguage glossary

- **Actor:** SanGram / Systema curriculum author.
- **Pref input:** grammar abbreviation lists (MW72, MD, CAE, SHS).
- **Join:** rule modules, treebank tags, quiz item banks.
- **Output:** aligned metalanguage glossary (print abbr → modern pedagogical term).
- **Home:** SanskritGrammar / SanGram modules; quiz generators in csl-guides.

### UC-6 — Citation-graph and corpus attestation enrichment

- **Actor:** data paper / atlas / observatory.
- **Pref input:** declared works list.
- **Join:** body `<ls>` census; optional external corpus attestation.
- **Output:** “legend coverage of corpus citations”; missing-legend vs unused-legend rates (cf. guides hypotheses GH-4).
- **Home:** csl-atlas / csl-observatory; [corpus attestation](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/corpus-attestation); data paper methods.
- **Status (H1854 hostile read):** survives narrowed — the corpus-wide "legend coverage" number already shipped as GH-4 (Tested, 95.3 %, [guides-hypotheses](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/about/guides-hypotheses.md)); what remains is only the **per-dictionary missing-legend vs unused-legend split**, consuming [`ALL_pref_abbr_crosscheck.summary.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/ALL_pref_abbr_crosscheck.summary.json).

### UC-7 — Scan deep-links and edition genealogy

- **Actor:** link-target / Cologne frontend maintainer.
- **Pref input:** edition titles, place/year, series (Bibl. ind., etc.) in expansions.
- **Join:** scan registries, Gild. Bibl. numbers, known PDF loci.
- **Output:** candidate link targets for `<ls>` click-through; edition disambiguation notes.
- **Home:** cologne-link-target skill path; per-dict issue trackers.

### UC-8 — Orthography and OCR QA fold table

- **Actor:** transcoder / pref-align maintainer.
- **Pref input:** residual `ortho` / `ocr_key` pairs with body-attested alts (change logs).
- **Join:** fold tables in `pref_abbr_crosscheck` / `pref_key_body_align`.
- **Output:** documented fold examples (j/y, Gṛhj/Gṛhy, Kâtj/Kâty, ḱ/c) without silent invent-a-fold.
- **Home:** [naming authority](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md); registry [`scripts/pref_fold_table.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_fold_table.json) (H1592); sanskrit-util notes where relevant.
- **Status (H1592):** shipped — 26 PWG/PW examples + pattern rules; `pref_key_body_align.py --self-check`.

### UC-9 — Correction and addenda harvest

- **Actor:** correction-queue / csl-orig batch maintainer.
- **Pref input:** printed addenda/corrigenda and “statt … lies …” notes in front matter.
- **Join:** existing change-file pipeline; body locus search.
- **Output:** candidate corrections with pref page provenance (not silent body invent).
- **Home:** `/cologne-correction-queue` path; monthly batch-PR.

### UC-10 — History of Indology / scholars graph

- **Actor:** IndologyScholars / prosopography.
- **Pref input:** named persons, institutions, places, dependency claims in Vorworte.
- **Join:** person registers, affiliation timelines, other dictionaries’ front matter.
- **Output:** edges “Roth informed X”, “edition used by Y”; talk/paper figures.
- **Home:** IndologyScholars datasets; optional ARTICLES methods section.

### UC-11 — FAIR / citable front-matter editions

- **Actor:** library, citing scholar, Zenodo deposit.
- **Pref input:** full pref trees + METHODS + CITATION.cff.
- **Join:** DOI / release packaging when rights allow; body-naming policy + machine legend for resolution provenance.
- **Output:** citable DE/EN/RU front-matter editions per dictionary.
- **Home:** per-dict `prefaces/METHODS.md`; [ocr-prefaces index](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/ocr-prefaces) (**FAIR path map** on that page).
- **Cross-linked surfaces (H1595):**
  - Index: [ocr-prefaces](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/ocr-prefaces)
  - METHODS pilot: [PWG](https://github.com/sanskrit-lexicon/PWG/blob/main/prefaces/METHODS.md) · [PW](https://github.com/sanskrit-lexicon/PWK/blob/main/prefaces/METHODS.md)
  - Naming: [pref-body-naming-authority](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md)
  - Legend emit: [`pref_legend_emit.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_legend_emit.py) · [`scripts/out/*_legend.json`](https://github.com/sanskrit-lexicon/csl-guides/tree/main/scripts/out) · [`src/data/pref-legends.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/pref-legends.json)
  - Residual appendix: [UC-13 methods](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/about/pref-body-residual-methods.md)

### UC-12 — Publish-safety split surface

- **Actor:** release / Pages operator.
- **Pref input:** PD imprint front matter (typically).
- **Join:** rights registry for body vs front matter.
- **Output:** public pref pages even when bulk body redistribution is constrained.
- **Home:** publish-safety-check; GitHub Pages per-dict landings.

### UC-13 — Residual analytics for papers and FINDINGS

- **Actor:** paper author, findings maintainer.
- **Pref input:** typed residual tables (`ALL_pref_only_decompose`, align change logs).
- **Join:** hit rates by wave; before/after align census.
- **Output:** appendix tables (“pref_only is typed, not unused”); honest limitations.
- **Home:** [Pref residual methods appendix](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/about/pref-body-residual-methods.md) (site); data paper; Uprava FINDINGS; csl-guides CHANGELOG.

### UC-14 — RU/EN student-facing copy from Vorwort

- **Actor:** ru-copy / course author.
- **Pref input:** translated pref_all.en / .ru (not DE OCR alone).
- **Join:** register-sensitive rewrite for learners.
- **Output:** short “about this dictionary” blurbs for samskrte / Systema without re-OCRing.
- **Home:** Systema content wave; csl-guides intro pages.

---

## Priority map (suggested)

| Priority | Use cases | Why |
|----------|-----------|-----|
| **P0 — already partially built** | UC-1, UC-3, UC-8, UC-11, UC-13 | Tools + OCR editions + naming policy + residual typing exist |
| **Shipped** | UC-4 | Reading packs live since 28-07-2026 (H1760) — see UC-4 status line |
| **P1 — high leverage, clear consumers** | UC-2 (PWG↔PW↔AP90; **MW struck** pending an MW legend emit — H1854 M1), UC-6 (per-dict missing/unused-legend split only; corpus-wide bound already answered by GH-4 — H1854 M3) | Product + paper + comparison surfaces |
| **P2 — domain depth** | UC-5, UC-7, UC-9, UC-10 | Needs more human judgment / external registries |
| **P3 — opportunistic** | UC-12, UC-14 | Rights and copy when a release or course needs them |

---

## Existing assets (do not rebuild)

| Asset | Role |
|-------|------|
| Per-dict `prefaces/` + `*_all.*` | OCR + EN/RU editions |
| [`pref_abbr_crosscheck.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_abbr_crosscheck.py) | Pref keys × body census |
| [`pref_only_decompose.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_only_decompose.py) | Typed residual |
| [`pref_key_body_align.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_key_body_align.py) | Body-attested key rewrites + change logs |
| [`scripts/out/`](https://github.com/sanskrit-lexicon/csl-guides/tree/main/scripts/out) | Frozen TSV/MD outputs |
| Site: ocr-prefaces, abbreviations-*, citation-graph | User-facing consumers |

---

## Open questions (for a human)

1. Should the structured legend store (UC-3) live only in csl-guides `scripts/out/`, or also ship as site data JSON?
2. Is UC-2 (cross-dict work identity) a paper primary result, a product feature, or both?
3. How far should rare/MS pref keys surface in UI (full legend vs “core works only”)?

---

## Provenance

| Field | Value |
|-------|-------|
| Origin | Session discussion after H1560/H1569/H1571/H1580 pref × body work |
| Model | Grok 4.5 (`grok-4.5`) |
| Policy baseline | Body wins for used siglum *naming*; pref expansions scan-faithful |

---

_Dr. Mārcis Gasūns_
