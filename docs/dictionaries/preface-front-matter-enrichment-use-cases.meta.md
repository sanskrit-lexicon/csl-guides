# Metadoc — preface-front-matter-enrichment-use-cases.md

_Created: 24-07-2026 · Last updated: 04-08-2026_

| Field | Value |
|-------|-------|
| Subject | [preface-front-matter-enrichment-use-cases.md](./preface-front-matter-enrichment-use-cases.md) |
| Purpose | Proposal: what OCR front matter teaches and which use cases it enriches |
| Audience | Maintainers, DH pipeline owners, paper authors |
| Provenance | Session proposal after H1560–H1580 · Grok 4.5 (`grok-4.5`) |
| Status | Living proposal (not a locked roadmap) |

## Ranked improvement backlog

1. ~~Promote UC-3 structured legend store to a committed generator with schema.~~ **Done (H1591).**
2. ~~Wire UC-1 tooltips from legend store into a site component.~~ **Done (H1593) for PWG/PW.**
3. ~~UC-11 FAIR path map on ocr-prefaces + reciprocal links.~~ **Done (H1595).**
4. UC-2 pilot: PWG↔PW(↔AP90) work-identity table from pref expansions + body counts — **MW struck by H1854 M1** (no committed MW legend artifact; re-add after an MW legend emit).
5. Resolve open questions (rare/MS UI; Zenodo DOI at next dict release).

## H1854 hostile-read verdict (04-08-2026)

Adversarial pass over every claim and P1 row of the subject
([H1854](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1854-Fable_csl-guides_preface-enrichment-proposal-hostile-read_29.07.26.md),
Fable 5 `claude-fable-5`). Default posture REFUTED: a row survives only if a committed
artifact it would consume exists on disk. **Verdict: the proposal is sound; 3 Major and
4 Minor findings; both remaining P1 rows survive narrowed, one P1 row was already shipped.**

### Major findings

| # | Lands on | Finding |
|---|---|---|
| M1 | [use-cases §UC-2, line 92](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/preface-front-matter-enrichment-use-cases.md) + backlog item 4 below | UC-2's named input "per-dict legend tables (PWG, PW, **MW**, AP90)" has **no committed MW artifact**: `scripts/out/` contains no `mw_*` file at all (no legend, no crosscheck, no decompose). MW prefaces are OCR'd ([MWS/prefaces/](https://github.com/sanskrit-lexicon/MWS/tree/main/prefaces)) but the legend was never parsed. **MW struck from the UC-2 pilot** until an MW legend emit exists; the pilot that can run today is PWG↔PW (from [`scripts/out/pwg_legend.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/pwg_legend.json) + [`pw_legend.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/pw_legend.json)) extended by AP90 via [`ap90_pref_abbr_crosscheck.tsv`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/ap90_pref_abbr_crosscheck.tsv). |
| M2 | use-cases § Priority map, line 208 | The P1 row still lists **UC-4**, which shipped 28-07-2026 (H1760 status line at UC-4 itself, line 112). Stale: the real P1 build decision is **UC-2 + UC-6 only**. Fixed in the subject in this same pass. |
| M3 | use-cases §UC-6, lines 122–128 | UC-6's headline output "legend coverage of corpus citations" **already exists**: GH-4 is Tested — 95.3 % of corpus `<ls>` citations fall in legend-documented dictionaries (1,187,169 / 1,245,644; [guides-hypotheses.md line 40](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/about/guides-hypotheses.md)). The row survives only for what is genuinely missing: the **per-dictionary missing-legend vs unused-legend split**, which no committed artifact yet computes. |

### Minor findings

| # | Lands on | Finding |
|---|---|---|
| m1 | use-cases §UC-3, line 102 | "JSON/TSV per dict" overstates the legend store: `*_legend.json` exists for **2** dicts (PWG, PW — [`src/data/pref-legends.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/pref-legends.json) self-declares `pilot`), while crosscheck/decompose TSVs cover ~20. Accurate as "crosscheck per dict, legend store pilot-only". |
| m2 | this metadoc, header + revision history | Metadoc had drifted: `Last updated 24-07` against a subject updated 28-07; revision history was missing the H1592 (UC-8 fold table) and H1760 (UC-4 reading packs) ship rows. Header bumped this pass. |
| m3 | use-cases §UC-9, line 150 | "printed addenda/corrigenda … in front matter" — no committed addenda-page artifact was located in any `prefaces/` tree this pass. P2 row keeps its hedge, but its input is **unverified**, not confirmed. |
| m4 | use-cases § Related, line 6 | Issue [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) could not be verified this session (`gh` unavailable offline). Noted, not adjudicated. |

### P1 adjudication (acceptance: named committed artifact or struck)

| P1 row | Verdict | Committed artifact(s) it consumes |
|---|---|---|
| UC-2 | **SURVIVES, narrowed** (MW struck — M1) | `scripts/out/pwg_legend.json` · `scripts/out/pw_legend.json` · `scripts/out/ap90_pref_abbr_crosscheck.tsv` |
| UC-4 | **Already shipped** (H1760) — removed from P1 | [reading-pwg](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/users/reading-pwg.mdx) · [reading-pw](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/users/reading-pw.mdx) (+ net-new [reading-monier-williams](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/users/reading-monier-williams.mdx), not yet named by the proposal) |
| UC-6 | **SURVIVES, narrowed** (per-dict split only — M3) | [`scripts/out/ALL_pref_abbr_crosscheck.summary.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/ALL_pref_abbr_crosscheck.summary.json) · GH-4 in [guides-hypotheses.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/about/guides-hypotheses.md) |

### Claims confirmed against disk (spot record)

Six residual classes exactly as named (`ortho`, `rare`, `ocr_key`, `spacing`, `true_unused`,
`ambiguous` — [`pref_only_decompose.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_only_decompose.py));
UC-8 fold table 26 examples + `--self-check` real
([`pref_fold_table.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_fold_table.json),
[`pref_key_body_align.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_key_body_align.py) lines 20/331);
UC-11 chain complete ([PWG METHODS](https://github.com/sanskrit-lexicon/PWG/blob/main/prefaces/METHODS.md) ·
[PW METHODS](https://github.com/sanskrit-lexicon/PWK/blob/main/prefaces/METHODS.md) ·
[`pref_legend_emit.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_legend_emit.py) ·
[ocr-prefaces](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/ocr-prefaces.mdx) ·
[naming authority](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md));
UC-13 homes exist ([residual methods appendix](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/about/pref-body-residual-methods.md) ·
[`ALL_pref_only_decompose.md`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/ALL_pref_only_decompose.md));
UC-14 tri-lingual inputs exist for PWG (27 pp DE/EN/RU), PW, MW (`*pref_all.{en,ru}.md`);
all named site consumers exist (abbreviations-comparison, citation-graph, corpus-attestation,
entry-anatomy). Grammar-metalanguage claim (§5) backed by committed mw72/md/shs/cae
crosscheck outputs.

## Limitations

- Use cases are framed, not implemented (except P0 partials already in tools/site).
- Residual counts age; re-run census tools for paper-grade numbers.
- Rights for some front-matter repos may differ; UC-12 still needs publish-safety.

## Related docs

- [pref-body-naming-authority.md](./pref-body-naming-authority.md)
- [ocr-prefaces.mdx](./ocr-prefaces.mdx)
- [abbreviations-and-citations.mdx](./abbreviations-and-citations.mdx)

## Revision history

| Date | Change |
|------|--------|
| 24-07-2026 | Initial proposal + 14 use cases + priority map |
| 24-07-2026 | UC-11 concrete path map (H1595 FAIR cross-links) |
| 04-08-2026 | H1854 hostile-read verdict: 3 Major / 4 Minor; UC-2 + UC-6 survive narrowed, UC-4 confirmed shipped; priority map fixed in subject. Fable 5 (`claude-fable-5`) |

---

_Dr. Mārcis Gasūns_
