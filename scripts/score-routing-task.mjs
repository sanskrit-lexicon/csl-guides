// Official scorer for the which-dictionary-routing shared task (H281).
// See docs/about/shared-tasks.md for the task definition and leaderboard.
//
// Usage: node scripts/score-routing-task.mjs <predictions.json>
//
// predictions.json maps scenario id -> predicted dictionary code, e.g.
//   { "G-01": "MW", "G-02": "BHS", ..., "P-06": "PW" }
// Every id in the benchmark must be present; codes must come from the
// benchmark's answerSpace. A missing or out-of-space prediction scores 0
// on that item (reported, not silently dropped).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const bench = JSON.parse(
  fs.readFileSync(path.join(root, 'src/data/routing-benchmark.json'), 'utf8')
);

const predFile = process.argv[2];
if (!predFile) {
  console.error('Usage: node scripts/score-routing-task.mjs <predictions.json>');
  process.exit(1);
}
const preds = JSON.parse(fs.readFileSync(predFile, 'utf8'));
const space = new Set(bench.answerSpace);

// Wilson 95% interval, same formula as build-hypothesis-metrics.mjs.
const wilson = (k, n, z = 1.96) => {
  const p = k / n;
  const denom = 1 + z * z / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, center - half), Math.min(1, center + half)];
};

const pct = (x) => (100 * x).toFixed(1) + '%';
for (const [split, items] of Object.entries(bench.splits)) {
  let strict = 0, lenient = 0;
  const problems = [];
  for (const it of items) {
    const p = preds[it.id];
    if (p === undefined) { problems.push(`${it.id}: missing`); continue; }
    if (!space.has(p)) { problems.push(`${it.id}: "${p}" not in answerSpace`); continue; }
    if (p === it.gold) strict++;
    if (it.accepted.includes(p)) lenient++;
  }
  const n = items.length;
  const [lo, hi] = wilson(strict, n);
  console.log(
    `${split}: strict ${strict}/${n} = ${pct(strict / n)} (95% Wilson [${pct(lo)}, ${pct(hi)}]) · lenient ${lenient}/${n} = ${pct(lenient / n)}`
  );
  for (const p of problems) console.log(`  ⚠ ${p}`);
}
