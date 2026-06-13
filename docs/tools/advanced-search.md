---
id: advanced-search
title: Advanced Search
sidebar_label: Advanced Search
---

# Advanced Search

The **Advanced** display (the **A** link per dictionary) searches *within* entry bodies,
not just headwords. It is the tool for research questions like "which entries cite this
text?" or "find every entry containing this phrase."

## Capabilities

- Full-text search across the entry body.
- Pattern / wildcard matching.
- Filtering by markup or field (e.g. literary-source citations).

The API (which the Advanced display sits on top of) exposes these **match modes**:
`term`, `fuzzy`, `match`, `match_phrase`, `prefix`, `wildcard`, `regexp`; and these
**fields**: `headword_slp1`, `re_headwords_slp1`, `sense`, `xml`, `id`. See the
[API](../developers/api) page for the exact parameters.

The live Advanced URL per dictionary is `/scans/{CODE}Scan/2020/web/webtc2/index.php`.

## Example research patterns

- Find compounds containing a stem → `field=headword_slp1`, `query_type=wildcard`.
- Find entries by a phrase in the gloss → `field=sense`, `query_type=match_phrase`.
- Pattern-match across the marked-up body → `field=xml`, `query_type=regexp`.

See **[Search & Display](../users/search-and-display)** for how results are rendered and
how `<ls>` cross-links work.
