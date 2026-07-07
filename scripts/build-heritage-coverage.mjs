#!/usr/bin/env node
// Builds the Heritage/INRIA coverage feed for the guides from the canonical
// MW↔Heritage entry-level crosswalk (H282 / csl-guides Stream 5 — non-Cologne
// data layers).
//
// Source (sibling repo, NOT fetched live):
// SanskritLexicography/HeadwordLists/mw_heritage_crosswalk.tsv — 185,803 MW
// entries (SLP1 key1) with a covered_flag and, where covered, the anchor into
// Gérard Huet's Sanskrit Heritage hypertext dictionary (DICO/). The crosswalk
// was built 03-07-2026 (H099) from the darkone23/Heritage_Resources GitHub
// mirror (LGPLLR); sanskrit.inria.fr itself is bot-walled (FINDINGS §41/§47),
// so nothing is fetched live here.
//
// Output: src/data/heritage-coverage.json — aggregate coverage statistics only
// (overall + per SLP1 initial + a small high-frequency sample with anchors);
// the full 185k-row crosswalk stays in SanskritLexicography. Aggregates are
// derived from our own crosswalk, so the pending LGPLLR redistribution
// @DECIDE on the mirror's raw data is not triggered by this feed.
//
// Usage: node scripts/build-heritage-coverage.mjs   (npm run build:heritage-coverage)
// Requires the sibling checkout ../SanskritLexicography (the committed JSON
// output means the site build itself never needs it).

import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE = join(
  ROOT,
  '..',
  'SanskritLexicography',
  'HeadwordLists',
  'mw_heritage_crosswalk.tsv',
);
const FREQ = join(ROOT, 'src', 'data', 'corpus-frequency.json');
const OUT = join(ROOT, 'src', 'data', 'heritage-coverage.json');
const SAMPLE_N = 200;

let tsv;
try {
  tsv = await readFile(SOURCE, 'utf8');
} catch {
  console.error(
    `Cannot read ${SOURCE}.\n` +
      'This script needs the sibling SanskritLexicography checkout ' +
      '(https://github.com/gasyoun/SanskritLexicography, HeadwordLists/mw_heritage_crosswalk.tsv). ' +
      'The committed src/data/heritage-coverage.json remains valid without it.',
  );
  process.exit(1);
}

const lines = tsv
  .split('\n')
  .map((l) => l.replace(/\r$/, ''))
  .filter((l) => l.trim() !== '');
const header = lines[0].split('\t');
const col = Object.fromEntries(header.map((h, i) => [h, i]));
for (const need of ['mw_key1', 'covered_flag', 'heritage_entry_anchor']) {
  if (!(need in col)) throw new Error(`mw_heritage_crosswalk.tsv missing column ${need}`);
}

let total = 0;
let covered = 0;
const byInitial = {};
const anchors = new Map(); // slp1 → anchor, for the frequency-joined sample
for (const line of lines.slice(1)) {
  const f = line.split('\t');
  const key = f[col.mw_key1];
  if (!key) continue;
  total += 1;
  const isCovered = f[col.covered_flag] === '1';
  if (isCovered) covered += 1;
  const initial = key[0];
  byInitial[initial] ??= {total: 0, covered: 0};
  byInitial[initial].total += 1;
  if (isCovered) byInitial[initial].covered += 1;
  if (isCovered && f[col.heritage_entry_anchor] && !anchors.has(key)) {
    anchors.set(key, f[col.heritage_entry_anchor]);
  }
}
for (const s of Object.values(byInitial)) {
  s.pct = Math.round((1000 * s.covered) / s.total) / 10;
}

// Sample: the highest-frequency DCS lemmas that are Heritage-covered MW keys,
// joined via the sibling corpus-frequency feed (SLP1 keys on both sides).
let sample = [];
try {
  const freq = JSON.parse(await readFile(FREQ, 'utf8'));
  sample = freq.lemmas
    .filter((l) => anchors.has(l.slp1))
    .slice(0, SAMPLE_N)
    .map((l) => ({slp1: l.slp1, dcsRank: l.rank, anchor: anchors.get(l.slp1)}));
} catch {
  console.warn('corpus-frequency.json not found — writing feed without the joined sample.');
}

const feed = {
  generatedAt: new Date().toISOString().slice(0, 10),
  generator: 'scripts/build-heritage-coverage.mjs (csl-guides, H282 Stream 5)',
  source:
    'https://github.com/gasyoun/SanskritLexicography/blob/master/HeadwordLists/mw_heritage_crosswalk.tsv (H099 MW↔Heritage entry-level crosswalk, 03-07-2026)',
  upstream:
    'Sanskrit Heritage Platform (Gérard Huet, INRIA) via the darkone23/Heritage_Resources GitHub mirror (03-2025, LGPLLR); live site is bot-walled — never fetched here',
  license:
    'Aggregate statistics over our own derived crosswalk; LGPLLR redistribution of the mirror raw data itself is a pending @DECIDE and NOT exercised by this feed',
  keying: 'SLP1 MW key1 (initial = first SLP1 character)',
  anchorBase:
    'anchors resolve inside Heritage_Resources DICO/, e.g. https://github.com/darkone23/Heritage_Resources/blob/master/DICO/1.html',
  totals: {
    mwEntries: total,
    heritageCovered: covered,
    pct: Math.round((1000 * covered) / total) / 10,
  },
  byInitial,
  sample,
};

await writeFile(OUT, JSON.stringify(feed, null, 1) + '\n', 'utf8');
console.log(
  `Wrote ${OUT}: ${covered}/${total} covered (${feed.totals.pct}%), ${
    Object.keys(byInitial).length
  } initials, sample ${sample.length}.`,
);
