---
id: publications
title: Publications & Bibliography
description: "How to cite CDSL, plus a bibliography of publications about the Cologne Digital Sanskrit Dictionaries."
sidebar_label: Publications
---

# Publications & Bibliography

_Created: 14-06-2026 · Last updated: 07-07-2026_

## How to cite CDSL

See **[Abbreviations & Citations](../dictionaries/abbreviations-and-citations)** for the
project's official in-text and bibliographic citation form, plus the recommended wording
for acknowledging CDSL data reuse in a website or application.

## About the project and its methods

- **Kapp, Dieter B., & Thomas Malten.** *Report on the Cologne Sanskrit Dictionary
  Project.* Describes how the printed Monier-Williams dictionary was encoded without
  altering its complex structure or losing information.
  [PDF](https://www.sanskrit-lexicon.uni-koeln.de/CDSL.pdf) ·
  [Semantic Scholar](https://www.semanticscholar.org/paper/Report-on-the-Cologne-Sanskrit-Dictionary-Project-Kapp-Malten/d7ba52d56e90bd4ef5460f016a546e771074ff4f)
- **Funderburk, Jim, & Thomas Malten.** "Marking Monier" (May 2008), *Second International
  Sanskrit Computational Linguistics Symposium*. Walks through the four phases of digitizing
  and marking up the Monier-Williams dictionary.
  [HTML](https://www.sanskrit-lexicon.uni-koeln.de/talkMay2008/markingMonier.html)

## Ongoing record

- **[csl-newsletter](https://github.com/sanskrit-lexicon/csl-newsletter)** — a *daywise log*
  of project activity (September 2021 onward), kept "so that an academic paper may be
  published later, if desired or required." See also the [History](history) timeline.

## Related resources

- **[Cologne Sanskrit Lexicon](https://dch.phil-fak.uni-koeln.de/en/ressources/managed-resources)**
  — listed among the managed resources of Cologne's Data Center for the Humanities (DCH).
- **[The Sanskrit Library — Cologne](https://sanskritlibrary.org/cologne.html)** — Peter
  Scharf's integration and presentation of the Cologne dictionaries.

:::note
This is a starting bibliography of the project's own and closely related publications — not
an exhaustive list of the scholarship that *uses* CDSL data. Suggest additions via the
[GitHub repo](https://github.com/sanskrit-lexicon/csl-guides).
:::

## Publishing about CDSL — ACL venues and standards

The computational-Sanskrit world publishes inside the
[ACL Anthology](https://aclanthology.org/) — a paper archive, not a data repository:
work "gets into the Anthology" by appearing at an indexed venue. The venues below were
liveness-verified 07-07-2026 (survey:
[ACL_DH_COMPATIBILITY_ANALYSIS.md](https://github.com/gasyoun/SanskritLexicography/blob/master/ReverseDictionary/ACL_DH_COMPATIBILITY_ANALYSIS.md);
re-verify any deadline before acting on it later):

| Venue | Anthology-indexed | Cadence / next edition | Fit for CDSL work |
|---|---|---|---|
| [World Sanskrit Conference — §23 Computational Sanskrit & DH](https://aclanthology.org/2025.wsc-csdh.0/) | ✅ since 2025 | [20th WSC, Dec 2027, IIT Bombay](https://www.hss.iitb.ac.in/wsc2027/) | Best fit — the exact audience |
| [ISCLS](https://aclanthology.org/2026.iscls-1.0/) | ✅ | biennial, ~2028 | Strong — Sanskrit lexical resources are core scope |
| [LaTeCH-CLfL](https://aclanthology.org/venues/latechclfl/) (SIGHUM) | ✅ | annual — 2027 CFP expected ~Nov–Dec 2026 | Nearest actionable deadline; historical-language resources are core scope |
| [NLP4DH](https://aclanthology.org/venues/nlp4dh/) | ✅ | annual | Good; slightly more tool/method-oriented |
| [WILDRE](https://aclanthology.org/venues/wildre/) (at LREC) | ✅ | biennial with LREC, ~2028 | Strong — Indic-resource-specific |
| [LREC](https://aclanthology.org/venues/lrec/) | ✅ | biennial, 2028 | Flagship language-resource venue |

For a pure *data paper* (no research claims), the non-ACL
[Journal of Open Humanities Data](https://openhumanitiesdata.metajnl.com/) is the standard
DH outlet — but it presupposes an openly deposited, DOI-bearing dataset.

**What an ACL-family submission must have** (per the
[ACL style files](https://github.com/acl-org/acl-style-files) and the
[ARR CFP](https://aclrollingreview.org/cfp), in force 2026):

1. **Structure:** abstract → related work → data → method → evaluation → error analysis.
2. **A mandatory "Limitations" section** — unnumbered, before references, outside the page
   limit; missing it is desk rejection.
3. **The [Responsible NLP checklist](https://aclrollingreview.org/responsibleNLPresearch/)**,
   whose §B requires citation, license, provenance, and use-restriction disclosure for
   **every artifact used or released** — this site's [data cards](/developers/data-cards)
   page exists so that section can be filled honestly for anything built on these feeds.
4. **Evaluation to community standard:** named metrics (P/R/F1, accuracy, MAP, Cohen's κ
   for agreement), an explicit baseline, and uncertainty on small-n results — see the
   metric convention below.
5. Long papers 8 pages content / short 4; anonymized review.

## Presenting results — the metric convention on this site

Any measured result surfaced on this site (a hypothesis test, a coverage figure, a
benchmark score) is presented the way an ACL reviewer expects, so a page section can move
into a paper without re-derivation:

- **metric + n + baseline + uncertainty + artifact**, in that spirit: name the metric,
  give the sample size, compare against an explicit chance/majority baseline, put a 95%
  Wilson interval on small-n proportions and a significance level on correlations, and
  link the committed artifact + script that reproduce the number.
- Worked examples: the [Guides Hypotheses](/about/guides-hypotheses) page (GH-1's
  accuracy with Wilson CI and two baselines; GH-2's ρ with n and p) and the
  [shared-task leaderboard](/about/shared-tasks) (scorer prints the interval).
- Agreement between annotation passes is reported as **Cohen's κ**, not raw percent —
  and where only a single pass exists yet (the routing gold panel), that absence is
  stated rather than papered over.

:::note
Venue *choice* for any concrete CDSL paper is a human decision (tracked in the project's
own planning, not on this page); this section documents the landscape and the bar.
:::

_Dr. Mārcis Gasūns_
