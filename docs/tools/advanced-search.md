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

`TODO(verify)`: enumerate the exact operators (wildcard characters, boolean/regex
support), searchable fields, and result limits. Provide 2–3 worked example queries.

## Example research patterns (to be confirmed)

- Find entries citing a given source: search the `<ls>` field for the source's
  abbreviation.
- Find compounds containing a stem: body search with a wildcard.

See **[Search & Display](../users/search-and-display)** for how results are rendered and
how `<ls>` cross-links work.
