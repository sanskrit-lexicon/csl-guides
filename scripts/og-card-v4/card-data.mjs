// H7931 — the OG-card v4 data model, derived from committed feeds only.
//
// Every number a v4 card can print is resolved here, once, from:
//   - src/data/dictionaries.json  (catalog feed: title, year, pages, groups,
//     digitisation flags, per-dictionary actions)
//   - src/data/atlas-extract.json (csl-atlas OBS extract: per-dictionary entry
//     and citation counts, 44 rows)
//
// Nothing is typed: the renderer receives this object and prints its fields.
// A field whose source is missing degrades to `null` (the renderer then omits
// the stat) instead of being guessed — that is the H7931 stop-budget rule.
//
// The join is code.toLowerCase(): the catalog carries upper-case codes (MW),
// the atlas extract lower-case ones (mw). Two catalog rows have no atlas row
// (PD, NYBJ) and one atlas row (pwkvn) is not catalogued, so every aggregate
// carries its own denominator instead of a bare count.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(here, '..', '..');

const int = (v) => {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function loadCardData({ code = 'MW', root = REPO_ROOT } = {}) {
  const feedPath = path.join(root, 'src', 'data', 'dictionaries.json');
  const atlasPath = path.join(root, 'src', 'data', 'atlas-extract.json');
  const feed = JSON.parse(fs.readFileSync(feedPath, 'utf8'));
  const atlas = JSON.parse(fs.readFileSync(atlasPath, 'utf8'));

  const groups = Array.isArray(feed.groups) ? feed.groups : [];
  const items = groups.flatMap((g) =>
    (g.items || []).map((it) => ({ ...it, group: g.name || null }))
  );

  const years = items.map((it) => int(it.year)).filter((y) => y != null);
  const pages = items.map((it) => int(it.pages)).filter((p) => p != null);
  const atlasRows = atlas.dicts || {};
  const atlasCodes = Object.keys(atlasRows);
  const entriesTotal = atlasCodes.reduce((s, c) => s + (int(atlasRows[c].entries) || 0), 0);

  const row = items.find((it) => String(it.code).toUpperCase() === String(code).toUpperCase());
  if (!row) throw new Error(`card-data: dictionary code ${code} is not in src/data/dictionaries.json`);
  const atlasRow = atlasRows[String(code).toLowerCase()] || null;

  const pageTitle = row.title || row.code;
  const group = row.group;
  const groupIndex = groups.findIndex((g) => g.name === group);
  const groupCount = groups.length;
  const groupItems = groupIndex >= 0 ? groups[groupIndex].items.length : null;

  const data = {
    generatedFrom: {
      feed: 'src/data/dictionaries.json',
      feedGeneratedAt: feed.generatedAt || null,
      feedTotalRows: int(feed.totalRows),
      atlas: 'src/data/atlas-extract.json',
      atlasGeneratedAt: atlas.generatedAt || null,
      atlasLicense: atlas.license || null,
    },
    site: {
      dictionaries: int(feed.totalRows),
      yearsPresent: years.length,
      yearMin: years.length ? Math.min(...years) : null,
      yearMax: years.length ? Math.max(...years) : null,
      pagesPresent: pages.length,
      pagesTotal: pages.length ? pages.reduce((a, b) => a + b, 0) : null,
      groups: groupCount,
      fullyDigitized: int(feed.fullyDigitized),
      documentedInCslDoc: int(feed.documentedInCslDoc),
      withCslOrigSource: int(feed.withCslOrigSource),
      atlasDictionaries: atlasCodes.length,
      atlasEntriesTotal: entriesTotal || null,
    },
    // The per-dictionary card row. `null` fields are omitted by the renderer.
    dictionary: {
      code: row.code,
      title: pageTitle,
      year: int(row.year),
      pages: int(row.pages),
      entries: atlasRow ? int(atlasRow.entries) : null,
      distinctLemmas: atlasRow ? int(atlasRow.distinctLemmas) : null,
      group,
      groupCount,
      groupItems,
      fullyDigitized: row.actions ? row.actions.basic !== false : null,
      documentedInCslDoc: Boolean(row.cslDocUrl),
      withCslOrigSource: Boolean(row.cslOrigUrl),
      sampleOnly: Boolean(row.sampleOnly),
    },
  };

  data.dictionary.shareOfAtlasEntriesPct =
    data.dictionary.entries && data.site.atlasEntriesTotal
      ? Math.round((data.dictionary.entries / data.site.atlasEntriesTotal) * 1000) / 10
      : null;

  return data;
}

// Compact helpers used by the renderer and by the evidence docs, so the docs
// and the PNGs cannot disagree about a formatted value.
export const fmt = (n) => (n == null ? null : new Intl.NumberFormat('en-US').format(n));

export function dataRows(d) {
  const dict = d.dictionary;
  const site = d.site;
  return {
    A: [dict.year, fmt(dict.pages) && `${fmt(dict.pages)} pages`, fmt(dict.entries) && `${fmt(dict.entries)} entries`]
      .filter(Boolean)
      .join(' · '),
    B: {
      hero: fmt(dict.entries),
      denominator: `of ${fmt(site.atlasEntriesTotal)} entries across ${site.atlasDictionaries} dictionaries`,
      sharePct: dict.shareOfAtlasEntriesPct,
    },
    C: {
      year: dict.year,
      span: `${site.yearMin}–${site.yearMax}`,
      secondary: [fmt(dict.pages) && `${fmt(dict.pages)} pages`, fmt(dict.entries) && `${fmt(dict.entries)} entries`]
        .filter(Boolean)
        .join(' · '),
    },
    D: {
      group: dict.group,
      badges: [
        site.fullyDigitized != null && site.dictionaries != null
          ? `${site.fullyDigitized}/${site.dictionaries} fully digitised`
          : null,
        site.documentedInCslDoc != null && site.dictionaries != null
          ? `${site.documentedInCslDoc}/${site.dictionaries} documented in csl-doc`
          : null,
        site.withCslOrigSource != null && site.dictionaries != null
          ? `${site.withCslOrigSource}/${site.dictionaries} with csl-orig source`
          : null,
      ].filter(Boolean),
    },
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const d = loadCardData();
  console.log(JSON.stringify({ data: d, rows: dataRows(d) }, null, 2));
}
