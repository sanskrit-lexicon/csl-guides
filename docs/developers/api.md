---
id: api
title: API
sidebar_label: API
---

# API

CDSL exposes its dictionaries through a RESTful API developed in
[`csl-apidev`](https://github.com/sanskrit-lexicon/csl-apidev). The API was envisioned by
Malcolm Hyman and Peter Scharf in the mid-2000s and implemented by Jim Funderburk
(from ~2015) in PHP. Current status: **well-tested beta**.

:::caution Development API
Endpoints and URLs below are from the development repo and may change. Treat this as a
working reference and verify against the live server before depending on it.
:::

## Two API surfaces

CDSL offers both a **native** RESTful API and a **Salt API** that is wire-compatible with
the Cologne [C-SALT](https://api.c-salt.uni-koeln.de) APIs (so a client written for
C-SALT works against CDSL unchanged). Both wrap the same underlying `getword` data.

## Native endpoints

Base URL:

```
https://www.sanskrit-lexicon.uni-koeln.de/scans/awork/apidev/{action}.php
```

Parameters may be passed in the URL (GET) or via POST. `{action}` is one of:

| Action | Purpose |
|---|---|
| `listview` | Generate a display like Simple-Search |
| `listhier` | Generate the list pane of the listview display |
| `getword` | Generate the entry-display pane for a headword |
| `getsuggest` | Return a short list of words with a given prefix (autocomplete) |
| `servepdf` | Return a link to the scanned page image for a given dictionary page |
| `getword_xml` | Return matching `<dict>.xml` records for a headword |
| `salt_entries` | C-SALT-compatible entry search (see below) |
| `salt_ids` | C-SALT-compatible batch fetch by id |
| `salt_graphql` | C-SALT-compatible GraphQL (`entries`, `ids`) |

The complete list of RESTful parameters used across endpoints is documented in
[`doc/restfulparm.md`](https://github.com/sanskrit-lexicon/csl-apidev/blob/master/doc/restfulparm.md).

## Salt API — search entries

C-SALT-compatible search over one dictionary, mirroring the
`/dicts/{id}/restful/entries` contract.

**Example:**

```
https://www.sanskrit-lexicon.uni-koeln.de/scans/awork/apidev/salt_entries.php?dict=mw&field=headword_slp1&query=agni&query_type=term&size=10
```

**Parameters:**

| Param | Example | Notes |
|---|---|---|
| `dict` | `mw` | Cologne dict code, lower-cased (pilot: `mw` only) |
| `field` | `headword_slp1` | one of `id`, `headword_slp1`, `sense`, `re_headwords_slp1`, `created`, `xml` |
| `query` | `agni` | search string, in the `input` transliteration |
| `query_type` | `term` | one of `term`, `fuzzy`, `match`, `match_phrase`, `prefix`, `wildcard`, `regexp` |
| `size` | `10` | max records (optional) |
| `input` | `slp1` | input transliteration scheme (CSL extension) |
| `output` | `deva` | output transliteration scheme (CSL extension) |
| `accent` | `no` | accent handling (CSL extension) |

`input`, `output`, and `accent` are CSL extensions with no C-SALT equivalent; they must
not change the meaning of `field`/`query`/`query_type`. See
[`doc/salt_entries.md`](https://github.com/sanskrit-lexicon/csl-apidev/blob/master/doc/salt_entries.md),
[`salt_ids.md`](https://github.com/sanskrit-lexicon/csl-apidev/blob/master/doc/salt_ids.md),
and [`salt_graphql.md`](https://github.com/sanskrit-lexicon/csl-apidev/blob/master/doc/salt_graphql.md).
The normative contract (OpenAPI + GraphQL schema + CSL↔C-SALT field mapping) lives in
[`csl-standards`](https://github.com/sanskrit-lexicon/csl-standards).

## Clean-URL permalinks (roadmap)

A permalink layer (see
[COLOGNE#249](https://github.com/sanskrit-lexicon/COLOGNE/issues/249) and
[`doc/cleanurl.md`](https://github.com/sanskrit-lexicon/csl-apidev/blob/master/doc/cleanurl.md))
links directly to an entry:

```
/{DICT}/{ref}      ref = headword (in any input transliteration) or lnum
/{DICT}/{KEY}/{HOM}    homonym form
/MW/144239.1          decimal lnum
```

A single rewrite **content-negotiates** on `Accept`: API clients
(`application/json`) get the Salt JSON envelope; browsers (`text/html`) get the full
listview display. Examples: `/MW/bAQa`, `/MW/144239`.

## Lower-effort alternative

If you only need the data in bulk, the **downloadable XML (SLP1)** per dictionary is the
most stable path — see [Downloads & Data](../users/downloads-and-data) and
[Data Formats](data-formats).
