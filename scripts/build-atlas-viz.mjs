#!/usr/bin/env node
// Vendors the csl-atlas artifacts consumed by the H279 Stream-2 visualizations
// (docs/dictionaries/landscape.mdx + docs/dictionaries/citation-sources.mdx).
//
// Sources (sibling repo, NOT fetched live — org reuse rule: consume, don't
// recompute; see https://github.com/sanskrit-lexicon/csl-atlas):
//   csl-atlas/data/citations/ls_citation_edges.tsv   dict · canonical_text · count
//   csl-atlas/data/citations/ls_citation_nodes.tsv   canonical_text · total_cites · n_dicts · variant_forms
//   csl-atlas/data/sanhw1_cladogram.newick           UPGMA tree over Jaccard headword-overlap distances
//
// Outputs (committed, so the site build never needs the sibling checkout):
//   src/data/citation-sources.json  top-cited canonical texts per dictionary + corpus-wide overview
//   src/data/cladogram.json         the Newick string + provenance
//
// Usage: node scripts/build-atlas-viz.mjs          (npm run build:atlas-viz)
//        node scripts/build-atlas-viz.mjs --check  (reproject and compare; never writes)
//
// EDGE CONTRACT: the committed feeds pin the SHA-256 of every csl-atlas artifact
// they were built from. `--check` rebuilds the projection in memory and exits 1
// when it differs from the committed JSON — the `generatedAt` stamp is the only
// field ignored. Upstream drift or a hand edit can therefore no longer land
// silently (bug hunt 19.10.2026, F3). Needs the sibling checkout, so it belongs
// to the local/nightly lane, not GitHub CI.

import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ATLAS = process.env.ATLAS_ROOT || join(ROOT, '..', 'csl-atlas');
const TOP_PER_DICT = 12;
const TOP_OVERALL = 15;
const checkOnly = process.argv.includes('--check');
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

async function readAtlas(rel) {
  const p = join(ATLAS, rel);
  try {
    return await readFile(p);
  } catch {
    console.error(
      `Cannot read ${p}.\n` +
        'This script needs the sibling csl-atlas checkout ' +
        '(https://github.com/sanskrit-lexicon/csl-atlas). ' +
        'The committed src/data/{citation-sources,cladogram}.json remain valid without it' +
        (checkOnly ? ', but --check cannot prove reproducibility without the sibling.' : '.'),
    );
    process.exit(1);
  }
}

function tsvRows(text) {
  return text
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(1)
    .map((line) => line.split('\t'));
}

// --- citation graph ---
const edgesRaw = await readAtlas('data/citations/ls_citation_edges.tsv');
const nodesRaw = await readAtlas('data/citations/ls_citation_nodes.tsv');
const newickRaw = await readAtlas('data/sanhw1_cladogram.newick');

const edges = tsvRows(edgesRaw.toString('utf8')).map(
  ([dict, text, count]) => ({dict, text, count: Number(count)}),
);
const nodes = tsvRows(nodesRaw.toString('utf8')).map(
  ([text, totalCites, nDicts]) => ({text, totalCites: Number(totalCites), nDicts: Number(nDicts)}),
);

const perDict = {};
const dictTotals = {};
for (const e of edges) {
  (perDict[e.dict] ??= []).push({text: e.text, count: e.count});
  dictTotals[e.dict] = (dictTotals[e.dict] ?? 0) + e.count;
}
for (const d of Object.keys(perDict)) {
  perDict[d].sort((a, b) => b.count - a.count);
  perDict[d] = perDict[d].slice(0, TOP_PER_DICT);
}
const dictTextCounts = Object.fromEntries(
  Object.entries(
    edges.reduce((acc, e) => ((acc[e.dict] = (acc[e.dict] ?? 0) + 1), acc), {}),
  ),
);

const overall = nodes
  .sort((a, b) => b.totalCites - a.totalCites)
  .slice(0, TOP_OVERALL);

// Spread histogram: how many canonical texts are cited by exactly n dictionaries —
// the long-tail shape the citation-graph explainer page renders.
const spreadByNDicts = [];
for (const n of nodes) {
  spreadByNDicts[n.nDicts] = (spreadByNDicts[n.nDicts] ?? 0) + 1;
}
const spread = spreadByNDicts
  .map((texts, nDicts) => ({nDicts, texts}))
  .filter((r) => r.nDicts > 0 && r.texts > 0);

const citationSources = {
  generatedAt: new Date().toISOString().slice(0, 10),
  generatedBy: 'scripts/build-atlas-viz.mjs',
  source: {
    edges: 'https://github.com/sanskrit-lexicon/csl-atlas/blob/main/data/citations/ls_citation_edges.tsv',
    nodes: 'https://github.com/sanskrit-lexicon/csl-atlas/blob/main/data/citations/ls_citation_nodes.tsv',
    method: 'https://github.com/sanskrit-lexicon/csl-atlas/blob/main/data/citations/README.md',
    sha256: {edges: sha256(edgesRaw), nodes: sha256(nodesRaw)},
  },
  license: 'CC-BY-SA-4.0',
  stats: {
    edgeCount: edges.length,
    nodeCount: nodes.length,
    dictCount: Object.keys(perDict).length,
    totalResolvedCites: edges.reduce((s, e) => s + e.count, 0),
  },
  overall,
  spread,
  dictTotals,
  dictTextCounts,
  perDict,
};

// --- cladogram ---
const newick = newickRaw.toString('utf8').trim();
const leafCount = (newick.match(/[A-Z][A-Z0-9]*(?=:)/g) || []).length;
const cladogram = {
  generatedAt: new Date().toISOString().slice(0, 10),
  generatedBy: 'scripts/build-atlas-viz.mjs',
  source: {
    newick: 'https://github.com/sanskrit-lexicon/csl-atlas/blob/main/data/sanhw1_cladogram.newick',
    builder: 'https://github.com/sanskrit-lexicon/csl-atlas/blob/main/scripts/lex_l2_cladogram.py',
    method: 'UPGMA over pairwise Jaccard distances between per-dictionary headword sets (sanhw1 snapshot)',
    sha256: sha256(newickRaw),
  },
  license: 'CC-BY-SA-4.0',
  newick,
};

// --- check mode --------------------------------------------------------------
// Compare the rebuilt projection with the committed feed. `generatedAt` is the
// only field that is expected to differ (it is a build date, not a measurement).
const IGNORED_FIELDS = new Set(['generatedAt']);

function stripGeneratedAt(value) {
  if (Array.isArray(value)) return value.map(stripGeneratedAt);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !IGNORED_FIELDS.has(key))
        .map(([key, child]) => [key, stripGeneratedAt(child)]),
    );
  }
  return value;
}

function describeValue(value) {
  if (value === undefined) return '(absent)';
  const text = JSON.stringify(value);
  return text.length > 100 ? `${text.slice(0, 97)}…` : text;
}

function collectDiffs(committed, rebuilt, path = '', out = []) {
  if (out.length >= 25 || committed === rebuilt) return out;
  const bothObjects = committed !== null && rebuilt !== null && typeof committed === 'object' && typeof rebuilt === 'object';
  if (!bothObjects || Array.isArray(committed) !== Array.isArray(rebuilt)) {
    out.push({path, committed, rebuilt});
    return out;
  }
  if (Array.isArray(committed)) {
    if (committed.length !== rebuilt.length) {
      out.push({path: `${path}.length`, committed: committed.length, rebuilt: rebuilt.length});
    }
    for (let i = 0; i < Math.min(committed.length, rebuilt.length); i += 1) {
      collectDiffs(committed[i], rebuilt[i], `${path}[${i}]`, out);
    }
    return out;
  }
  for (const key of new Set([...Object.keys(committed), ...Object.keys(rebuilt)])) {
    collectDiffs(committed[key], rebuilt[key], path ? `${path}.${key}` : key, out);
  }
  return out;
}

async function checkFeed(relativePath, rebuilt) {
  const outPath = join(ROOT, relativePath);
  let committed;
  try {
    committed = JSON.parse(await readFile(outPath, 'utf8'));
  } catch {
    console.error(`EDGE CONTRACT RED: cannot read or parse committed ${relativePath}`);
    return false;
  }
  const diffs = collectDiffs(stripGeneratedAt(committed), stripGeneratedAt(rebuilt));
  if (diffs.length === 0) return true;
  console.error(`EDGE CONTRACT RED: ${relativePath} does not reproduce from csl-atlas.`);
  if (diffs.some((diff) => diff.path.startsWith('source.sha256') && typeof diff.committed === 'string' && typeof diff.rebuilt === 'string')) {
    console.error('  The upstream artifact bytes moved — review the csl-atlas change before re-vendoring.');
  }
  for (const diff of diffs) {
    console.error(
      `  ${diff.path}: committed ${describeValue(diff.committed)} → rebuilt ${describeValue(diff.rebuilt)}`,
    );
  }
  return false;
}

if (checkOnly) {
  const citationOk = await checkFeed('src/data/citation-sources.json', citationSources);
  const cladogramOk = await checkFeed('src/data/cladogram.json', cladogram);
  if (!citationOk || !cladogramOk) {
    console.error('Rebuild (npm run build:atlas-viz) and re-commit the feeds after a deliberate review.');
    process.exit(1);
  }
  console.log('EDGE CONTRACT GREEN: citation-sources.json + cladogram.json reproduce from csl-atlas.');
  process.exit(0);
}

await writeFile(join(ROOT, 'src', 'data', 'citation-sources.json'), JSON.stringify(citationSources, null, 1) + '\n', 'utf8');
await writeFile(join(ROOT, 'src', 'data', 'cladogram.json'), JSON.stringify(cladogram, null, 1) + '\n', 'utf8');
console.log(
  `citation-sources.json: ${edges.length} edges, ${nodes.length} texts, ${Object.keys(perDict).length} dicts, ` +
    `${citationSources.stats.totalResolvedCites} resolved cites\n` +
    `cladogram.json: ${newick.length} chars of Newick (~${leafCount} leaves)`,
);
