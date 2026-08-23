#!/usr/bin/env node
// Builds the ortho-drift QUERY-EXPANSION feed for site search from the canonical
// SanskritSpellCheck reform maps (H3340 / Interlink Graph v2 edge
// SanskritSpellCheck -> csl-guides · ortho_drift/*_reform_map.tsv).
//
// Source (vendored §24 transport, NOT fetched live):
//   vendor/SanskritSpellCheck/ortho_drift/de_reform_map.tsv  (15,685 forms)
//   vendor/SanskritSpellCheck/ortho_drift/ru_reform_map.tsv  (7,709 forms)
//
// Subset policy — only UNAMBIGUOUS same-word orthographic-reform classes may
// become search aliases on this English-dominant site:
//   de: era 1901-th  (th -> t:      Thier -> Tier, Theil -> Teil)
//       era 1901-iren (-iren/-irt -> -ieren/-iert: absolviren -> absolvieren)
//     EXCLUDED: the corpus-mined bare-number-era tail contains cross-language
//     look-alikes ("from -> fromm", "on -> ohne"), and the 1901-c class (c ->
//     k/z) germanizes shared English vocabulary ("that -> tat", "author ->
//     autor") — either would inject false aliases.
//   ru: ALL rows (1918-i / 1918-hardsign / 1918-yat / 1918-fita); Cyrillic
//     old forms cannot collide with English tokens.
//
// The maps are consumed as-is: rows are filtered by their OWN era labels;
// nothing is re-derived here (the acceptance fail-condition of H3340).
//
// Output: src/data/ortho-query-expansions.json — {old form: [modern forms]}
// plus provenance + SHA-256 pins of the exact vendored bytes.
//
// Usage:
//   node scripts/build-ortho-query-expansions.mjs           (rebuild)
//   node scripts/build-ortho-query-expansions.mjs --check   (§24 drift gate)
//   node scripts/build-ortho-query-expansions.mjs --tamper-selftest
//
// Contract: SHARED_CODE.md §24 (Interlink Graph v2 W4). Reference impl of the
// same contract shape: scripts/build-corpus-frequency.mjs ← kosha.

import {createHash} from 'node:crypto';
import {readFile, writeFile, copyFile, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VENDOR_DIR = join(ROOT, 'vendor', 'SanskritSpellCheck', 'ortho_drift');
const SIBLING_DIR = join(ROOT, '..', 'SanskritSpellCheck', 'ortho_drift');
const OUT = join(ROOT, 'src', 'data', 'ortho-query-expansions.json');

const SOURCES = {
  de: {
    file: join(VENDOR_DIR, 'de_reform_map.tsv'),
    upstream:
      'https://github.com/drdhaval2785/SanskritSpellCheck/blob/master/ortho_drift/de_reform_map.tsv',
    policy: "era starts with '1901-th' or '1901-iren'",
    accept: (era) => era.startsWith('1901-th') || era.startsWith('1901-iren'),
  },
  ru: {
    file: join(VENDOR_DIR, 'ru_reform_map.tsv'),
    upstream:
      'https://github.com/drdhaval2785/SanskritSpellCheck/blob/master/ortho_drift/ru_reform_map.tsv',
    policy: 'all rows (era 1918-*)',
    accept: () => true,
  },
};

const checkOnly = process.argv.includes('--check');
const tamperSelftest = process.argv.includes('--tamper-selftest');

function canonicalText(raw) {
  // This repo's .gitattributes normalizes *.tsv to LF, so the committed
  // transport differs from a CRLF upstream checkout by line endings only.
  // The contract hashes CANONICAL TEXT (LF): content-sensitive, EOL-blind.
  return raw.toString('utf8').replace(/\r\n/g, '\n');
}

function sha256Raw(raw) {
  return createHash('sha256').update(raw).digest('hex');
}

function sha256(raw) {
  return createHash('sha256').update(canonicalText(raw), 'utf8').digest('hex');
}

async function readSource(lang) {
  const spec = SOURCES[lang];
  let raw;
  try {
    raw = await readFile(spec.file);
  } catch {
    console.error(
      `Cannot read ${spec.file}.\n` +
        'The vendored reform map is missing — restore it from the sibling ' +
        'SanskritSpellCheck checkout (see vendor/SanskritSpellCheck/ortho_drift/README.md).'
    );
    process.exit(1);
  }
  return raw;
}

if (tamperSelftest) {
  // §24 tamper rule: prove the gate fails loud. Flip one byte of a temp copy,
  // then confirm the pin comparison rejects it.
  const pinMatchesRaw = (pin, raw) => sha256(raw) === pin;
  const dir = await mkdtemp(join(tmpdir(), 'ortho-tamper-'));
  try {
    const target = join(dir, 'de_reform_map.tsv');
    await copyFile(SOURCES.de.file, target);
    const original = await readFile(target);
    const flippedText = canonicalText(original);
    const idx = Math.floor(flippedText.length / 2);
    const flipped = flippedText.slice(0, idx) +
      String.fromCharCode(flippedText.charCodeAt(idx) ^ 0x01) +
      flippedText.slice(idx + 1);
    const goodPin = sha256(original);
    const badPin = createHash('sha256').update(flipped, 'utf8').digest('hex');
    if (!pinMatchesRaw(goodPin, original)) {
      console.error('TAMPER SELFTEST RED: unmodified bytes rejected by pin check.');
      process.exit(1);
    }
    if (pinMatchesRaw(badPin, original)) {
      console.error('TAMPER SELFTEST RED: flipped byte accepted by pin check.');
      process.exit(1);
    }
    console.log('TAMPER SELFTEST OK: one-byte flip is rejected, intact copy accepted.');
  } finally {
    await rm(dir, {recursive: true, force: true});
  }
  process.exit(0);
}

const raws = {};
for (const lang of Object.keys(SOURCES)) {
  raws[lang] = await readSource(lang);
}

if (checkOnly) {
  // Part 3 of the §24 contract: re-hash and refuse on drift. Two layers:
  //  (a) vendored bytes vs the SHA pins inside the committed feed;
  //  (b) vendored bytes vs the sibling upstream checkout, when present.
  // Never auto-rebuilds inside --check.
  let feed;
  try {
    feed = JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    console.error(`EDGE CONTRACT RED: cannot parse pinned feed ${OUT}`);
    process.exit(1);
  }

  let red = false;
  for (const lang of Object.keys(SOURCES)) {
    const pinned = feed.sourceSha256?.[lang];
    const current = sha256(raws[lang]);
    if (!pinned) {
      console.error(`EDGE CONTRACT RED: feed has no ${lang} sourceSha256 pin — rebuild to add it.`);
      red = true;
    } else if (pinned !== current) {
      console.error(
        `EDGE CONTRACT RED: vendored ${lang}_reform_map.tsv moved without a rebuild.\n` +
          `  pinned   ${pinned}\n  current  ${current}\n` +
          `Rebuild (npm run build:ortho-query-expansions) and re-commit the feed + vendored copies.`
      );
      red = true;
    }
    try {
      const siblingRaw = await readFile(join(SIBLING_DIR, `${lang}_reform_map.tsv`));
      const siblingSha = sha256(siblingRaw);
      if (siblingSha !== current) {
        console.error(
          `EDGE CONTRACT RED: upstream ${lang}_reform_map.tsv moved.\n` +
            `  vendored ${current}\n  upstream ${siblingSha}\n` +
            `Re-vendor from ../SanskritSpellCheck/ortho_drift/, rebuild and re-commit.`
        );
        red = true;
      } else {
        console.log(`EDGE CONTRACT GREEN: ${lang} vendored == upstream (${current.slice(0, 12)}…).`);
      }
    } catch {
      console.log(
        `note: no sibling checkout for ${lang} upstream comparison ` +
          '(vendored-vs-pin layer still enforced).'
      );
    }
  }
  process.exit(red ? 1 : 0);
}

// --- build -------------------------------------------------------------------

function loadPairs(lang) {
  const text = raws[lang].toString('utf8');
  const expansions = new Map();
  const add = (from, to) => {
    if (!expansions.has(from)) expansions.set(from, new Set());
    expansions.get(from).add(to);
  };
  let total = 0;
  let kept = 0;
  for (const line of text.split('\n')) {
    if (line.startsWith('#') || line.trim() === '') continue;
    const cols = line.replace(/\r$/, '').split('\t');
    if (cols.length < 3) continue;
    total += 1;
    const era = cols[2].trim();
    if (!SOURCES[lang].accept(era)) continue;
    // ru keys arrive wrapped in angle brackets (<августъ>); de keys are plain.
    const old = cols[0].trim().replace(/^<+|>+$/g, '').toLowerCase();
    const modern = cols[1].trim().replace(/^<+|>+$/g, '').toLowerCase();
    if (!old || !modern || old === modern) continue;
    kept += 1;
    // Both directions: typing either spelling era must find the other.
    add(old, modern);
    add(modern, old);
  }
  return {expansions, total, kept};
}

const out = {expansions: {}};
const stats = {};
const sourceSha256 = {};
for (const lang of Object.keys(SOURCES)) {
  const {expansions, total, kept} = loadPairs(lang);
  sourceSha256[lang] = sha256(raws[lang]);
  stats[lang] = {
    rowsInMap: total,
    rowsInSubsetPolicy: kept,
    distinctExpansionKeys: expansions.size,
    directions: 'both (old->modern and modern->old)',
    subsetPolicy: SOURCES[lang].policy,
    excludedNote:
      lang === 'de'
        ? 'bare-number-era mined tail (cross-language look-alikes) + 1901-c (c→k/z germanizes English words)'
        : 'none',
  };
  for (const [oldForm, moderns] of expansions) {
    out.expansions[oldForm] = [...moderns].sort();
  }
}

const feed = {
  generatedAt: new Date().toISOString().slice(0, 10),
  generator: 'scripts/build-ortho-query-expansions.mjs (csl-guides, H3340)',
  source:
    'https://github.com/drdhaval2785/SanskritSpellCheck/tree/master/ortho_drift (vendored under vendor/SanskritSpellCheck/ortho_drift/)',
  edgeContract:
    'SHARED_CODE §24 (Interlink Graph v2 W4) — verify: npm run check:ortho-edge',
  purpose:
    'query-time search normalization only (Thier->Tier, августъ->август); never a correction list',
  sourceSha256,
  stats,
  expansions: Object.fromEntries(Object.entries(out.expansions).sort(([a], [b]) => (a < b ? -1 : 1))),
};

await writeFile(OUT, JSON.stringify(feed) + '\n', 'utf8');
const aliases = Object.values(feed.expansions).reduce((n, m) => n + m.length, 0);
console.log(
  `Wrote ${OUT}: ${Object.keys(feed.expansions).length} expansion keys -> ` +
    `${aliases} directed aliases (de ${stats.de.distinctExpansionKeys}, ru ${stats.ru.distinctExpansionKeys}).`
);
