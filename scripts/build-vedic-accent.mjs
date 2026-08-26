#!/usr/bin/env node
// Builds the Vedic-accent feed for the guides from the LANDED VedaWeb bulk export
// (H096, 08-07-2026) in the sibling VisualDCS checkout. This script NEVER hits
// vedaweb.uni-koeln.de: since 2026-07-27 the host answers HTTP 418 behind an
// Anubis/WAF challenge (FINDINGS §229), and the org rule is one bulk export per
// source, consumed from disk by every downstream reader (MEGABOOK).
//
// Source (sibling repo, NOT fetched live):
//   ../VisualDCS/non-derived/vedaweb/casaretto_accented_wordsplit.json.gz
//   Casaretto et al. (2025), udatta-marked position-aligned word-split of the
//   Rigveda (10,552 stanzas), CC BY 4.0 (rights confirmed H359).
//
// Join: lemma keys are normalised from the Casaretto `lemma_vedaweb` values
// (strip root sign / variant alternates / hyphens / Vedic accent marks, then
// vendored sanskrit-util to_slp1) and matched against the SLP1-keyed top-2,000
// DCS lemmas already committed in src/data/corpus-frequency.json. The join is a
// LOWER BOUND on RV attestation: multi-part lemmas, variants and stems whose
// classical citation form differs do not all match — stated on the page.
//
// Output: src/data/vedic-accent.json — corpus-level stats plus, for each
// DCS-top-2000 lemma attested in the RV slice, its RV token count and up to
// three distinct udatta-marked attested forms (Vedic-accented IAST).
//
// Usage: node scripts/build-vedic-accent.mjs          (npm run build:vedic-accent)
//        node scripts/build-vedic-accent.mjs --check [--gz <path>]
// Requires the sibling VisualDCS checkout for BUILD and for --check.
//
// EDGE CONTRACT (SHARED_CODE §24, same pattern as build-corpus-frequency.mjs):
// the committed JSON pins sourceSha256 of the exact upstream .gz bytes it was
// built from. `--check` re-hashes the sibling file and exits 1 on drift
// ("upstream moved — rebuild and re-commit"); it never writes in check mode.

import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {gunzipSync} from 'node:zlib';
import {to_slp1} from '../src/vendor/sanskrit-util.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_SOURCE = join(ROOT, '..', 'VisualDCS', 'non-derived', 'vedaweb', 'casaretto_accented_wordsplit.json.gz');
const FREQ_FEED = join(ROOT, 'src', 'data', 'corpus-frequency.json');
const OUT = join(ROOT, 'src', 'data', 'vedic-accent.json');

const checkOnly = process.argv.includes('--check');
const gzArgIdx = process.argv.indexOf('--gz');
const SOURCE = gzArgIdx !== -1 ? process.argv[gzArgIdx + 1] : DEFAULT_SOURCE;

const raw = await readFile(SOURCE);
const sourceSha256 = createHash('sha256').update(raw).digest('hex');

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
      `EDGE CONTRACT RED: upstream casaretto_accented_wordsplit.json.gz moved.\n` +
        `  pinned   ${pinned}\n  current  ${sourceSha256}\n` +
        `Rebuild (npm run build:vedic-accent) and re-commit the vendored feed.`,
    );
    process.exit(1);
  }
  console.log(`EDGE CONTRACT GREEN: vendored vedic-accent matches upstream (${sourceSha256.slice(0, 12)}…).`);
  process.exit(0);
}

const freq = JSON.parse(await readFile(FREQ_FEED, 'utf8'));
const freqBySlp1 = new Map(freq.lemmas.map((l) => [l.slp1, l]));

// ---- lemma normalisation ----------------------------------------------------
// Accent marks stripped: acute/grave (udatta / anudatta / svarita notation) — both
// precomposed acute vowels and their combining forms — plus combining macron-below
// (an alternative anudatta encoding). Dot-below / ring-below letters (rutva,
// retroflexes, vlva) are PART of the base letter and MUST survive: to_slp1 maps them.
const ACUTE_VOWELS = /[áéíóúýÁÉÍÓÚÝ]/g;
const ACUTE_MAP = {á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ý: 'y', Á: 'a', É: 'e', Í: 'i', Ó: 'o', Ú: 'u', Ý: 'y'};
const ACCENT_MARKS = /[\u0300\u0301\u0331]/g; // combining grave, acute, macron-below
const SLP1_OK = /^[aAiIuUfFxXeEoOMHkKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh]+$/;

// One lemma_vedaweb value can carry several citation variants ("sá- ~ tá-"); each
// variant is normalised separately so the join sees every named stem.
function normalizeOne(variant) {
  let s = String(variant || '').replace(/\u221a/g, ''); // root sign √
  s = s.replace(/[-–—_=.,()]/g, ' ');
  // Vedic syllabic liquids written with ring-below -> their vowel letters (SLP1 f / x)
  s = s.replace(/r[\u0325]/g, '\u1E5B').replace(/l[\u0325]/g, '\u1E37');
  s = s.replace(ACUTE_VOWELS, (c) => ACUTE_MAP[c]);
  s = s.replace(ACCENT_MARKS, '');
  s = s.trim().replace(/^-+|-+$/g, '');
  if (!s || /\s|[A-Z]/.test(s)) return null;
  const slp = to_slp1(s);
  return SLP1_OK.test(slp) ? slp : null;
}

function normalizeLemmaKeys(lemmaVedaweb) {
  const out = new Set();
  for (const part of String(lemmaVedaweb || '').split('~')) {
    const k = normalizeOne(part);
    if (k) out.add(k);
  }
  return [...out];
}

function annotationOf(token, key) {
  const a = token.annotations.find((x) => x.key === key);
  return a ? a.value[0] : undefined;
}

// ---- walk the export --------------------------------------------------------
console.error('Parsing upstream export…');
const data = JSON.parse(gunzipSync(raw).toString('utf8'));
const contents = data.contents || [];
let rvTokens = 0;
const agg = new Map(); // slp1 -> {tokens, forms:Set}

for (const stanza of contents) {
  const tokens = stanza.tokens || [];
  for (const tok of tokens) {
    const form = annotationOf(tok, 'form');
    const lw = annotationOf(tok, 'lemma_vedaweb');
    if (!form || !lw) continue;
    rvTokens += 1;
    const keys = normalizeLemmaKeys(lw);
    for (const key of keys) {
      let rec = agg.get(key);
      if (!rec) {
        rec = {tokens: 0, forms: new Set()};
        agg.set(key, rec);
      }
      rec.tokens += 1;
      if (rec.forms.size < 12) rec.forms.add(form);
    }
  }
}

// ---- join against the DCS top-2000 ------------------------------------------
const lemmas = [];
let joinedDcsTokens = 0;
for (const [slp1, rec] of agg) {
  const f = freqBySlp1.get(slp1);
  if (!f) continue;
  joinedDcsTokens += f.count || 0;
  lemmas.push({
    slp1,
    rank: f.rank,
    dcsCount: f.count,
    rvTokens: rec.tokens,
    forms: [...rec.forms].sort((a, b) => a.length - b.length).slice(0, 3),
  });
}
lemmas.sort((a, b) => a.rank - b.rank);

const feed = {
  generatedAt: new Date().toISOString().slice(0, 10),
  generator: 'scripts/build-vedic-accent.mjs (csl-guides)',
  source:
    'https://github.com/gasyoun/VisualDCS/blob/main/non-derived/vedaweb/casaretto_accented_wordsplit.json.gz ' +
    '(VedaWeb 2.0 bulk export H096, landed 08-07-2026)',
  sourceSha256,
  edgeContract: 'SHARED_CODE §24 (Interlink Graph v2 W4) — verify: node scripts/build-vedic-accent.mjs --check',
  upstream:
    'Casaretto, Coenen, Fischer, Halfmann, Korobzow, Kölligan & Reinöhl (2025), the morphologically glossed ' +
    'Rigveda (Zurich annotation corpus revised and extended), hosted on VedaWeb, Universität zu Köln',
  license: 'CC BY 4.0 (rights confirmed per H359); derived aggregation — attribute "VedaWeb 2.0, Universität zu Köln"',
  keying:
    'lemma_vedaweb normalised (no root sign / variant alternates / hyphens / accent marks) -> sanskrit-util to_slp1, ' +
    'joined against src/data/corpus-frequency.json SLP1 keys (top 2,000 DCS lemmas). Lower bound: unmatched stems exist.',
  joinTarget: 'https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/corpus-frequency.json',
  stats: {
    rvStanzas: contents.length,
    rvTokens,
    dcsTopN: freq.stats.topN,
    joinedLemmas: lemmas.length,
    joinedDcsTokenShare: +(joinedDcsTokens / freq.stats.tokensCounted).toFixed(4),
    joinedDcsTokens,
    dcsTokensTotal: freq.stats.tokensCounted,
  },
  lemmas,
};

await writeFile(OUT, JSON.stringify(feed, null, 1) + '\n', 'utf8');
console.log(
  `Wrote ${OUT}: ${lemmas.length}/${freq.stats.topN} top-DCS lemmas attested among ` +
    `${rvTokens} RV tokens (${contents.length} stanzas); ` +
    `${((joinedDcsTokens / freq.stats.tokensCounted) * 100).toFixed(1)}% of DCS tokens.`,
);
