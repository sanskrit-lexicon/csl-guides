#!/usr/bin/env node
// Builds the DCS corpus-frequency feed for the guides from the canonical kosha
// frequency layer (H282 / csl-guides Stream 5 — non-Cologne data layers).
//
// Source (sibling repo, NOT fetched live): kosha/data/frequency/lemma_frequency.tsv
// — 83,277 SLP1-keyed lemmas joined from VisualDCS's M9 archive.sqlite
// (period_freq + core_vocab), itself derived from Oliver Hellwig's Digital
// Corpus of Sanskrit (DCS, CC BY). Per the org reuse rule the TSV is consumed
// as-is; nothing is re-derived from CoNLL-U here.
//
// Output: src/data/corpus-frequency.json — the top-N lemmas by corpus rank with
// their all-corpus count, grammar tag, per-period counts, and Leonchenko
// coverage weight, plus whole-corpus summary stats. SLP1-keyed so Streams 2/3
// (visualizations, data-layer sections) can join it against dictionary
// headwords without transcoding.
//
// Usage: node scripts/build-corpus-frequency.mjs   (npm run build:corpus-frequency)
//        node scripts/build-corpus-frequency.mjs --check [--tsv <path>]
// Requires the sibling checkout ../kosha for BUILD; --check needs it too.
//
// EDGE CONTRACT (SHARED_CODE §24, Interlink Graph v2 W4 reference impl):
// the committed JSON pins sourceSha256 of the exact upstream TSV bytes it was
// built from. `--check` re-hashes the sibling TSV and exits 1 on drift
// ("upstream moved — rebuild and re-commit"); it never writes in check mode.

import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_SOURCE = join(ROOT, '..', 'kosha', 'data', 'frequency', 'lemma_frequency.tsv');
const OUT = join(ROOT, 'src', 'data', 'corpus-frequency.json');
const TOP_N = 2000;

const checkOnly = process.argv.includes('--check');
const tsvArgIdx = process.argv.indexOf('--tsv');
const SOURCE = tsvArgIdx !== -1 ? process.argv[tsvArgIdx + 1] : DEFAULT_SOURCE;

let raw;
try {
  raw = await readFile(SOURCE);
} catch {
  console.error(
    `Cannot read ${SOURCE}.\n` +
      'This script needs the sibling kosha checkout ' +
      '(https://github.com/gasyoun/kosha, data/frequency/lemma_frequency.tsv). ' +
      'The committed src/data/corpus-frequency.json remains valid without it.',
  );
  process.exit(1);
}
const sourceSha256 = createHash('sha256').update(raw).digest('hex');
const tsv = raw.toString('utf8');

if (checkOnly) {
  let feed;
  try {
    feed = JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    console.error(`EDGE CONTRACT RED: cannot parse pinned feed ${OUT}`);
    process.exit(1);
  }
  const pinned = feed.sourceSha256;
  if (!pinned) {
    console.error('EDGE CONTRACT RED: committed feed has no sourceSha256 pin — rebuild to add it.');
    process.exit(1);
  }
  if (pinned !== sourceSha256) {
    console.error(
      `EDGE CONTRACT RED: upstream lemma_frequency.tsv moved.\n` +
        `  pinned   ${pinned}\n  current  ${sourceSha256}\n` +
        `Rebuild (npm run build:corpus-frequency) and re-commit the vendored feed.`,
    );
    process.exit(1);
  }
  console.log(`EDGE CONTRACT GREEN: vendored corpus-frequency matches upstream (${sourceSha256.slice(0, 12)}…).`);
  process.exit(0);
}

const lines = tsv
  .split('\n')
  .map((l) => l.replace(/\r$/, ''))
  .filter((l) => l.trim() !== '');
const header = lines[0].split('\t');
const col = Object.fromEntries(header.map((h, i) => [h, i]));
for (const need of ['lemma_slp1', 'count_all', 'grammar_all', 'rank_all', 'periods', 'coverage_pct']) {
  if (!(need in col)) throw new Error(`lemma_frequency.tsv missing column ${need}`);
}

// periods cell: "9 Vedic=8283|1 -800=2897|..." → {"9 Vedic": 8283, ...}
function parsePeriods(cell) {
  if (!cell) return null;
  const out = {};
  for (const part of cell.split('|')) {
    const eq = part.lastIndexOf('=');
    if (eq === -1) continue;
    out[part.slice(0, eq)] = Number(part.slice(eq + 1));
  }
  return Object.keys(out).length ? out : null;
}

let rowsTotal = 0;
let rowsWithCount = 0;
let totalTokens = 0;
const top = [];
for (const line of lines.slice(1)) {
  const f = line.split('\t');
  const slp1 = f[col.lemma_slp1];
  if (!slp1) continue;
  rowsTotal += 1;
  const count = f[col.count_all] ? Number(f[col.count_all]) : null;
  const rank = f[col.rank_all] ? Number(f[col.rank_all]) : null;
  if (count !== null) {
    rowsWithCount += 1;
    totalTokens += count;
  }
  if (rank !== null && rank <= TOP_N) {
    top.push({
      slp1,
      rank,
      count,
      grammar: f[col.grammar_all] || null,
      coveragePct: f[col.coverage_pct] ? Number(f[col.coverage_pct]) : null,
      periods: parsePeriods(f[col.periods]),
    });
  }
}
top.sort((a, b) => a.rank - b.rank);

const feed = {
  generatedAt: new Date().toISOString().slice(0, 10),
  generator: 'scripts/build-corpus-frequency.mjs (csl-guides, H282 Stream 5)',
  source:
    'https://github.com/gasyoun/kosha/blob/main/data/frequency/lemma_frequency.tsv (SLP1-keyed join of VisualDCS M9 archive.sqlite period_freq + core_vocab)',
  sourceSha256,
  edgeContract: 'SHARED_CODE §24 (Interlink Graph v2 W4) — verify: node scripts/build-corpus-frequency.mjs --check',
  upstream:
    'Digital Corpus of Sanskrit (Oliver Hellwig), CC BY — via VisualDCS DCS-data-2026; consume this feed, do not re-parse CoNLL-U',
  license: 'CC BY (DCS upstream); derived aggregation',
  keying: 'SLP1 lemma (sanskrit-util normalised)',
  periodOrder: [
    '9 Vedic',
    '1 -800',
    '2 -300',
    '3200',
    '4700',
    '5 1200',
    '6 1700',
    '7 1900',
    '11 Epic',
    '12 Classic',
  ],
  stats: {
    lemmasInSource: rowsTotal,
    lemmasWithCount: rowsWithCount,
    tokensCounted: totalTokens,
    topN: TOP_N,
  },
  lemmas: top,
};

await writeFile(OUT, JSON.stringify(feed, null, 1) + '\n', 'utf8');
console.log(
  `Wrote ${OUT}: top ${top.length} of ${rowsTotal} lemmas, ${totalTokens} tokens counted.`,
);
