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
// Usage: node scripts/build-atlas-viz.mjs   (npm run build:atlas-viz)

import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ATLAS = join(ROOT, '..', 'csl-atlas');
const TOP_PER_DICT = 12;
const TOP_OVERALL = 15;

async function readAtlas(rel) {
  const p = join(ATLAS, rel);
  try {
    return await readFile(p, 'utf8');
  } catch {
    console.error(
      `Cannot read ${p}.\n` +
        'This script needs the sibling csl-atlas checkout ' +
        '(https://github.com/sanskrit-lexicon/csl-atlas). ' +
        'The committed src/data/{citation-sources,cladogram}.json remain valid without it.',
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
const edges = tsvRows(await readAtlas('data/citations/ls_citation_edges.tsv')).map(
  ([dict, text, count]) => ({dict, text, count: Number(count)}),
);
const nodes = tsvRows(await readAtlas('data/citations/ls_citation_nodes.tsv')).map(
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
const newick = (await readAtlas('data/sanhw1_cladogram.newick')).trim();
const leafCount = (newick.match(/[A-Z][A-Z0-9]*(?=:)/g) || []).length;
const cladogram = {
  generatedAt: new Date().toISOString().slice(0, 10),
  generatedBy: 'scripts/build-atlas-viz.mjs',
  source: {
    newick: 'https://github.com/sanskrit-lexicon/csl-atlas/blob/main/data/sanhw1_cladogram.newick',
    builder: 'https://github.com/sanskrit-lexicon/csl-atlas/blob/main/scripts/lex_l2_cladogram.py',
    method: 'UPGMA over pairwise Jaccard distances between per-dictionary headword sets (sanhw1 snapshot)',
  },
  license: 'CC-BY-SA-4.0',
  newick,
};

await writeFile(join(ROOT, 'src', 'data', 'citation-sources.json'), JSON.stringify(citationSources, null, 1) + '\n', 'utf8');
await writeFile(join(ROOT, 'src', 'data', 'cladogram.json'), JSON.stringify(cladogram, null, 1) + '\n', 'utf8');
console.log(
  `citation-sources.json: ${edges.length} edges, ${nodes.length} texts, ${Object.keys(perDict).length} dicts, ` +
    `${citationSources.stats.totalResolvedCites} resolved cites\n` +
    `cladogram.json: ${newick.length} chars of Newick (~${leafCount} leaves)`,
);
