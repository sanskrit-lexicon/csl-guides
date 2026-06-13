---
id: scans-and-print
title: Scans & Print
sidebar_label: Scans & Print
---

# Scans & Print

Every digital entry is backed by the **original printed page**. The **S** link on each
front-page dictionary row opens that dictionary's scanned edition.

## Why scans matter

- **Verification** — the digital text is a transcription; the scan is the authority.
  When the digital text and the scan disagree, the scan wins (and the digital text is
  corrected — see **[Contributing](../contributing/overview)**).
- **Link targets** — citations inside entries (`<ls>` tags) can be linked to the exact
  scanned page they reference. This "Dictionary to Book" linking is a major editorial
  workstream; see **[Issue Taxonomy](../contributing/issue-taxonomy)**.

## Scan quality

Some pages are blurry, skewed, or missing. Replacing them is tracked as a
`scan-quality` task in the issue taxonomy. If you spot a bad scan, that is exactly the
kind of issue worth reporting — see **[Contributing → Overview](../contributing/overview)**.

## Print deviations

Where the digital edition intentionally diverges from the scanned print (e.g. an obvious
typesetter's error in the original), the deviation is recorded in a `printchange.txt`
file rather than silently changed. This keeps the digital text faithful to the print
while documenting every editorial decision.

`TODO(verify)`: link the live scan viewer URL pattern and confirm the per-dictionary
availability of scans.
