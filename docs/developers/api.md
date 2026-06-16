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
Endpoints and URLs below are from the development repo. The **native** actions
(`listview`, `listhier`, `getword`, `getsuggest`, `servepdf`) are **live**; `getword_xml`
is **alpha**; the **Salt API** actions (`salt_entries`, `salt_ids`, `salt_graphql`) and the
**clean-URL permalinks** are **roadmap** (not yet deployed — they currently return `404`).
The status column below says which is which. Treat this as a working reference and verify
against the live server before depending on it.
:::

## What is live, what is roadmap

| Action | Surface | Response | Status |
|---|---|---|---|
| `listview` | native | HTML (two-pane display) | ✅ live |
| `listhier` | native | HTML (list pane) | ✅ live |
| `getword` | native | HTML (entry pane) | ✅ live |
| `getsuggest` | native | JSON array (autocomplete) | ✅ live |
| `servepdf` | native | HTML page viewer / scan link | ✅ live |
| `getword_xml` | native | JSON `{…, xml: […]}` | 🟡 alpha (unused by displays) |
| `salt_entries` | Salt | JSON (C-SALT envelope) | 🟡 roadmap |
| `salt_ids` | Salt | JSON (C-SALT envelope) | 🟡 roadmap |
| `salt_graphql` | Salt | JSON (GraphQL envelope) | 🟡 roadmap |
| `/{DICT}/{ref}` | clean-URL | HTML or JSON (content-negotiated) | 🟡 roadmap |

## Two API surfaces

CDSL offers both a **native** RESTful API and a **Salt API** that is wire-compatible with
the Cologne [C-SALT](https://api.c-salt.uni-koeln.de) APIs (so a client written for
C-SALT works against CDSL unchanged). Both wrap the same underlying `getword` data.

## Native endpoints

Base URL (the path `/scans/csl-apidev` is a soft-link to `/scans/awork/apidev/`):

```
https://www.sanskrit-lexicon.uni-koeln.de/scans/awork/apidev/{action}.php
```

Parameters may be passed in the URL (GET) or via POST. `{action}` is one of:

| Action | Purpose |
|---|---|
| `listview` | The full two-pane display (list pane + entry pane), like Simple-Search |
| `listhier` | Just the **list pane** (the hierarchical headword index) |
| `getword` | Just the **entry pane** — the rendered entry for a headword |
| `getsuggest` | A short list of headwords with a given prefix (autocomplete) |
| `servepdf` | The scanned page image for a dictionary page (by page number or headword) |
| `getword_xml` | The matching `<dict>.xml` records for a headword (alpha) |

### Request parameters

These are the parameters used across the native endpoints (the complete list is in
[`doc/restfulparm.md`](https://github.com/sanskrit-lexicon/csl-apidev/blob/master/doc/restfulparm.md)):

| Param | Meaning | Values | Default |
|---|---|---|---|
| `dict` | Cologne dictionary code (lower-cased internally) | `mw`, `ap90`, `pwg`, `gra`, … | `mw` |
| `key` | Headword to look up | a word in the `input` scheme | — (required) |
| `term` | Autocomplete prefix (`getsuggest` only) | a prefix in the `input` scheme | — |
| `input` | Input transliteration of `key`/`term` | `slp1`, `deva`, `hk`, `itrans`, `roman` | `hk` (`getsuggest`: `slp1`) |
| `output` | Display transliteration of the result | `slp1`, `deva`, `hk`, `itrans`, `roman` | `deva` |
| `accent` | Show Vedic accents (Devanāgarī output) | `yes`, `no` | `no` |
| `lnum` | Record id (line number); used by `listhier` | integer or decimal, e.g. `144239` or `144239.1` | — |
| `direction` | List-pane positioning (`listhier`) | `UP`, `DOWN`, `CENTER` | `CENTER` |
| `page` | Scanned page number (`servepdf`) | integer | — |
| `callback` | JSONP wrapper (see below) | a JS function name | — |

`lnum` takes precedence over `key` when both are present. SLP1 is the lingua-franca
scheme; `wx` (Hyderabad) also exists in the transcoder but is not exposed in the UI menus.
See [Encoding & Transliteration](../users/encoding-transliteration) for the scheme table.

### Worked examples

**Autocomplete** — `getsuggest` returns a JSON array of up to 10 headwords:

```
GET …/getsuggest.php?dict=mw&input=slp1&term=sev
→  ["seva","sevaka","sevadhi", …]
```

**Entry pane** — `getword` returns an HTML fragment (the rendered entry):

```
GET …/getword.php?dict=mw&key=agni&input=slp1&output=iast
```

**Full display** — `listview` returns a complete two-pane HTML page you can open or iframe:

```
GET …/listview.php?dict=mw&key=agni&input=slp1&output=deva&accent=no
```

**Records as XML** — `getword_xml` (alpha) returns JSON whose `xml` field is an array of the
matching records (one per homonym), for clients that render their own display:

```
GET …/getword_xml.php?dict=mw&key=agni&input=slp1&output=slp1&accent=no
→  { "dict":"mw", "key":"agni", …, "xml": ["<H1>…</H1>", …] }
```

**Scanned page** — `servepdf` resolves a headword (or page number) to the scanned print page:

```
GET …/servepdf.php?dict=mw&input=slp1&key=agni
GET …/servepdf.php?dict=mw&page=5
```

### CORS and JSONP

The native endpoints send `Access-Control-Allow-Origin: *`, so they can be called from
the browser cross-origin. For environments that prefer JSONP, `getsuggest` and `getword`
accept a `callback` parameter and wrap the JSON in that function call:

```
GET …/getsuggest.php?dict=mw&term=sev&callback=cb   →   cb(["seva","sevaka", …])
```

### Errors, auth, and rate limits

- An unknown `dict` code yields HTTP **404** with a body like
  `ERROR: Unknown dictionary code: …`.
- There is **no authentication, no API key, and no rate limiting** — all endpoints are
  open. (Appropriate for the scholarly audience; revisit if you drive heavy traffic.)

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
| `size` | `10` | max records (optional; default `25`) |
| `input` | `slp1` | input transliteration scheme (CSL extension) |
| `output` | `deva` | output transliteration scheme (CSL extension) |
| `accent` | `no` | accent handling (CSL extension) |

`input`, `output`, and `accent` are CSL extensions with no C-SALT equivalent; they must
not change the meaning of `field`/`query`/`query_type`. The response is a Salt envelope —
`{ "data": { "entries": [ … ] } }` — where each entry carries the C-SALT fields
(`id`, `headword_slp1`, `sense`, `re_headwords_slp1`, `created`, `xml`) plus a `csl` block
with CDSL specifics (`lnum`, `page`, `column`, `scanUrl`, `headwordDeva`, …). `salt_ids`
batch-fetches the same entry shape by `ids=lemma-…` (repeatable), and `salt_graphql` exposes
`entries`/`ids` over GraphQL with camelCase field names. Full specs:
[`doc/salt_entries.md`](https://github.com/sanskrit-lexicon/csl-apidev/blob/master/doc/salt_entries.md),
[`salt_ids.md`](https://github.com/sanskrit-lexicon/csl-apidev/blob/master/doc/salt_ids.md),
and [`salt_graphql.md`](https://github.com/sanskrit-lexicon/csl-apidev/blob/master/doc/salt_graphql.md).
The normative contract (OpenAPI + GraphQL schema + CSL↔C-SALT field mapping) lives in
[`csl-standards`](https://github.com/sanskrit-lexicon/csl-standards).

:::note Body search is staged
`match`/`match_phrase` over `field=sense` or `field=xml` are not yet available (no full-text
body index until a later phase) and currently return HTTP 400. Headword search
(`term`/`prefix`/`wildcard`/`regexp` over `headword_slp1`) is the working surface. Track
progress in [csl-apidev#46](https://github.com/sanskrit-lexicon/csl-apidev/pull/46).
:::

## Clean-URL permalinks (roadmap)

A permalink layer (see
[COLOGNE#249](https://github.com/sanskrit-lexicon/COLOGNE/issues/249) and
[`doc/cleanurl.md`](https://github.com/sanskrit-lexicon/csl-apidev/blob/master/doc/cleanurl.md))
links directly to an entry:

```
/{DICT}/{ref}        ref = headword (in any input transliteration) or lnum
/{DICT}/{KEY}/{HOM}  homonym form (1-based)
/MW/144239.1         decimal lnum
```

A single rewrite **content-negotiates** on `Accept`: API clients
(`application/json`) get the Salt JSON envelope; browsers (`text/html`) get the full
listview display. Examples: `/MW/bAQa`, `/MW/bAQa/2`, `/MW/144239`. Display options
(`input`/`output`/`accent`) come from the user's cookie, not the URL, so permalinks stay
short and stable.

:::tip Which permalink form to advertise
`lnum` is line-derived and can shift when a dictionary is regenerated, so prefer the
**headword form** (`/MW/bAQa`) as the canonical "copy link"; treat the `lnum` form as a
convenience alias.
:::

## Lower-effort alternative

If you only need the data in bulk, the **downloadable XML (SLP1)** per dictionary is the
most stable path — see [Downloads & Data](../users/downloads-and-data) and
[Data Formats](data-formats).
