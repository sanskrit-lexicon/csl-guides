---
id: report-a-typo
title: Report a Typo
description: "How to report one dictionary typo or scan problem without a local CDSL setup."
sidebar_label: Report a Typo
---

# Report a Typo

You do not need a local checkout, Python, or commit access to improve CDSL. A useful
typo report gives maintainers enough evidence to find the exact entry, compare it with
the printed scan, and decide which correction workflow applies.

## What to collect

Start from the live site and write down:

| Field | What to record | Example |
|---|---|---|
| Dictionary | The dictionary code or title | `AP`, `MW`, `GRA` |
| Headword | The word shown in the entry | `arthaḥ` |
| Location | Page/column, line number, or entry permalink if visible | printed page, scan page, or `L` number |
| Observed text | The text as CDSL currently displays it | `kodhasyaiva` |
| Expected text | The correction you propose | `krodhasyaiva` |
| Evidence | Why the correction is likely right | scan, parallel dictionary, grammar, citation |
| Transliteration | The script/scheme you used | Roman Unicode, Devanagari, SLP1 |

If the display has several modes, the **Basic** view is usually the easiest place to copy
the headword and entry text. The **S** or scan link is the evidence trail back to the
printed book; see [Scans & Print](../users/scans-and-print).

## Classify the problem

You do not need to choose the final label, but naming the likely class helps maintainers:

| Looks like... | Usually means... | Example signal |
|---|---|---|
| Digital typo | The scan is correct, but the digital text has a typo | missing letter, wrong diacritic, broken word |
| Print correction | The printed book itself seems wrong | you can justify the correction from other reliable sources |
| Markup problem | The text is right, but display/linking is wrong | bad italics, broken citation link, visible tag |
| Scan problem | The digital text may be fine, but the scan is unusable | missing, blurry, skewed, wrong page |
| Scholarly question | The evidence is not decisive | conflicting sources or interpretation needed |

Digital typos and markup problems can usually be corrected directly in the source text
with an audit trail. Confirmed deviations from the printed book also need a
`printchange.txt` record so future readers know the digital text intentionally differs
from the scan.

## Where to report it

For a dictionary-specific issue, open an issue in that dictionary's GitHub repository.
The repository is usually named by the dictionary code or its project code; the
[catalog](../dictionaries/catalog) links each dictionary to its repository.

Include this checklist in the issue:

```md
Dictionary:
Headword:
Observed text:
Expected text:
Where I saw it:
Scan / print evidence:
Other evidence:
Input/output transliteration:
Problem type if known:
```

If you have many corrections, group them by dictionary and source. Maintainers can then
process them as a batch instead of as unrelated one-off reports.

## What maintainers do next

Maintainers classify the issue using the [Issue Taxonomy](issue-taxonomy), verify the
evidence, and then choose one of two paths:

- A single fix follows [Process One Correction](process-one-correction).
- A backlog or named contributor set follows [Process a Scott Batch](process-scott-batch).

Both paths end in the same canonical reference workflow: source correction, XML
validation, audit-trail change file, and paired commits to `csl-orig` and
`csl-corrections`.
