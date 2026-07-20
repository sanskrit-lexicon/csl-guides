#!/usr/bin/env node
// Fails if a quiz item bank is gameable by answer position (H1387), or if an
// answer is missing from its own options. Follows the verify-atlas-viz.mjs
// pattern: read-only, prints findings, non-zero exit on failure.
//
// Usage: node scripts/verify-quiz-answer-positions.mjs  (npm run verify:quiz-positions)
//
// The defect this guards: every bank was authored with the answer written
// first, so "always pick A" scored 100% on six public quizzes — including the
// beginner level-quiz lead magnet, where it made the score meaningless as a
// difficulty signal. Position-only checks; nothing here judges content.

import {readFile} from 'node:fs/promises';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join, basename} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

// A bank needs enough items before a fixed position is evidence rather than
// coincidence: with 3 four-option items, all-same-index is p≈1/16 by chance.
const MIN_ITEMS_FOR_SPREAD = 3;
// Repo-wide, no single index should hold most answers. 0.6 leaves room for the
// genuine skew of two-option (true/false) items without letting a bank slide
// back to a fixed slot.
const MAX_SHARE = 0.6;

const failures = [];
const warnings = [];
const globalCounts = new Map();
let globalTotal = 0;

const files = readdirSync(DATA_DIR)
  .filter((f) => /quiz.*\.json$/i.test(f))
  .sort();

for (const file of files) {
  const data = JSON.parse(await readFile(join(DATA_DIR, file), 'utf8'));
  const stem = basename(file, '.json');
  const positions = [];

  for (const q of data.questions || data.items || []) {
    if (!q || typeof q !== 'object') continue;
    const blocks = [];
    if (Array.isArray(q.options)) blocks.push(['-', q.options, q.answer]);
    for (const l of ['en', 'ru']) {
      if (q[l] && Array.isArray(q[l].options)) blocks.push([l, q[l].options, q[l].answer]);
    }
    for (const [loc, options, answer] of blocks) {
      if (options.length < 2) continue;
      const at = options.indexOf(answer);
      if (at === -1) {
        failures.push(
          `${file}: item "${q.id}"${loc === '-' ? '' : ` (${loc})`} — answer is not among its own options; ` +
            'the item can never be answered correctly.',
        );
        continue;
      }
      positions.push(at);
      globalCounts.set(at, (globalCounts.get(at) || 0) + 1);
      globalTotal++;
    }
  }

  if (positions.length >= MIN_ITEMS_FOR_SPREAD) {
    const distinct = new Set(positions);
    if (distinct.size === 1) {
      failures.push(
        `${stem}: all ${positions.length} multiple-choice answers sit at index ${[...distinct][0]} — ` +
          'the quiz is solvable without reading it. Run npm run normalize:quiz-positions.',
      );
    }
  } else if (positions.length > 0) {
    const distinct = new Set(positions);
    if (distinct.size === 1) {
      warnings.push(
        `${stem}: only ${positions.length} multiple-choice item(s), all at index ${[...distinct][0]} — ` +
          'too few to fail on, but worth spreading if the bank grows.',
      );
    }
  }
}

if (globalTotal > 0) {
  for (const [idx, n] of [...globalCounts].sort((a, b) => b[1] - a[1])) {
    const share = n / globalTotal;
    if (share > MAX_SHARE) {
      failures.push(
        `repo-wide: index ${idx} holds ${n} of ${globalTotal} answers (${(share * 100).toFixed(1)}%, ` +
          `limit ${(MAX_SHARE * 100).toFixed(0)}%) — guessing that position beats reading the questions.`,
      );
    }
  }
}

const spread = [...globalCounts]
  .sort((a, b) => a[0] - b[0])
  .map(([i, n]) => `${i}:${n}`)
  .join('  ');
console.log(`${globalTotal} multiple-choice answers across ${files.length} banks — position spread  ${spread}`);

for (const w of warnings) console.log(`WARN  ${w}`);

if (failures.length) {
  for (const f of failures) console.error(`FAIL  ${f}`);
  process.exit(1);
}
console.log('quiz answer positions OK');
