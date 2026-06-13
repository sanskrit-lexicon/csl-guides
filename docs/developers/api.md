---
id: api
title: API
sidebar_label: API
---

# API

:::caution Draft
This page is a stub. The API surface needs to be documented from
[`csl-apidev`](https://github.com/sanskrit-lexicon/csl-apidev) and the live endpoints.
:::

CDSL exposes lookups programmatically. To complete this page, document:

- **Base URL** and available **endpoints** (lookup by headword, full-text search,
  list/browse).
- **Parameters**: dictionary code(s), input transliteration scheme, output scheme,
  match mode.
- **Response format**: JSON/XML shape, fields, error handling.
- **Rate limits / usage policy**, if any.
- **Examples**: a `curl` call and the parsed response for a common headword.

`TODO(verify)`: extract the actual route definitions and response schema from
`csl-apidev` and confirm against the deployed API.

Until then, the most reliable programmatic path is to consume the **downloadable XML**
directly — see **[Downloads & Data](../users/downloads-and-data)** and
**[Data Formats](data-formats)**.
